// Shared prospecting data store for the Prospecting, Follow Ups and SOI tabs. One
// GET hydrates { prospects, logs, followUps, soi } for the whole feature; a cache
// (localStorage-backed) carries a save across a tab switch, and every load
// reconciles unsynced writes against the server. Only one tab is mounted at a
// time, so a module cache is enough to keep them consistent without a store lib.
//
// Contact data never leaves Redis + these session caches; nothing is bundled or
// prerendered.

import { fetchProspects, saveProspectLog, saveProspectLogKeepalive, saveFollowUps, saveFollowUpsKeepalive, saveSoi, saveSoiKeepalive, savePin, savePinKeepalive, saveManualContact, saveRac, saveRacKeepalive, saveCold, saveColdKeepalive, saveDead, saveDeadKeepalive, saveStageMove, saveStageMoveKeepalive, saveMotivation, saveMotivationKeepalive, saveWhale, saveWhaleKeepalive, saveFire, saveFireKeepalive, saveAddedAt, saveProfile, saveProfileKeepalive } from "../../../utils/geeklogApi";
import { sortedQueue, mergeManualContacts, qualifiesForFollowUp, DEFAULT_STAGES, DEFAULT_CONFIG } from "./prospectsModel";

const LS_KEY = "gl2:prospects:v1";
const LOG_DIRTY = "gl2:prospects:dirty";
const FU_DIRTY = "gl2:prospects:fu:dirty";

let cache = null; // { prospects, logs, followUps, soi }

// Normalizes ids on the way in, so a blob written by a build that stored numeric
// pinned/rac ids cannot resurrect the Set.has() mismatch.
function loadLS() {
  try {
    const r = localStorage.getItem(LS_KEY);
    if (!r) return null;
    const c = JSON.parse(r);
    return c && typeof c === "object" ? { ...c, pinned: toIds(c.pinned), rac: toIds(c.rac), whale: toIds(c.whale), fire: toIds(c.fire) } : null;
  } catch { return null; }
}
function saveLS(obj) { try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch { /* best-effort */ } }
function getDirty(k) { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } }
function writeDirty(k, set) { try { localStorage.setItem(k, JSON.stringify([...set])); } catch { /* best-effort */ } }

// Contact ids must be strings everywhere: pinned and rac are membership-tested
// with Set.has(), and Redis can hand back phone digits as numbers.
const toIds = (members) => (Array.isArray(members) ? members.map(String) : []);

export function getCachedProspects() {
  if (!cache) cache = loadLS();
  return cache;
}

// Server map is the source of truth, but re-push any dirty (unsynced) local
// value that never landed and keep the local version until the server confirms.
function reconcile(serverMap, dirtyKey, localMap, push) {
  const merged = { ...serverMap };
  const dirty = getDirty(dirtyKey);
  for (const id of Array.from(dirty)) {
    const local = localMap?.[id];
    if (local != null) {
      merged[id] = local;
      push(id, local).then(() => { const d = getDirty(dirtyKey); d.delete(id); writeDirty(dirtyKey, d); }).catch(() => {});
    } else {
      dirty.delete(id);
    }
  }
  writeDirty(dirtyKey, dirty);
  return merged;
}

export async function loadProspects(apiKey) {
  const local = getCachedProspects();
  const data = await fetchProspects(apiKey);
  const manual = data.manual || {};
  // Manual contacts are merged in here, once, so that every consumer downstream
  // (queues, detail views, Add to Contacts, SOI, touch histories) resolves them
  // through the same path as a seeded contact with no special-casing.
  const prospects = sortedQueue(mergeManualContacts(data.list?.prospects || [], manual));
  const logs = reconcile(data.logs || {}, LOG_DIRTY, local?.logs, (id, v) => saveProspectLog(apiKey, id, v));
  const followUps = reconcile(data.followUps || {}, FU_DIRTY, local?.followUps, (id, v) => saveFollowUps(apiKey, id, v));
  // SOI and pins are taken straight from the server with no dirty reconcile: the
  // reconcile shape carries a value per id and cannot express a removal, and both
  // are deliberate taps the user can simply repeat. Server is authoritative.
  // pinned and rac are compared with Set.has(), so they must be strings. The API
  // coerces them; this repeats it because a localStorage cache written by an
  // older build can still hold numbers.
  // Cockpit state: stages/config fall back to the defaults the server also uses,
  // so a fresh install renders correctly before the keys are ever written. cold
  // and dead are id -> ts hashes taken straight from the server (like soi, they
  // are deliberate taps the user repeats, so no dirty reconcile).
  const stages = Array.isArray(data.stages) && data.stages.length ? data.stages : DEFAULT_STAGES;
  const config = data.config && typeof data.config === "object" ? { ...DEFAULT_CONFIG, ...data.config } : DEFAULT_CONFIG;
  cache = {
    prospects, logs, followUps, soi: data.soi || {}, pinned: toIds(data.pinned), manual, rac: toIds(data.rac),
    stages, config, cold: data.cold || {}, dead: data.dead || {}, stagemap: data.stagemap || {}, motivation: data.motivation || {}, whale: toIds(data.whale), fire: toIds(data.fire), addedat: data.addedat || {}, profile: data.profile || {},
  };
  saveLS(cache);
  return cache;
}

// Contact profile map and its optimistic write: same shape as motivation.
export function getCachedProfile() {
  return getCachedProspects()?.profile || {};
}
export function setCachedProfile(map) {
  const c = getCachedProspects();
  if (!c) return;
  cache = { ...c, profile: map };
  saveLS(cache);
}
export function persistProfile(apiKey, id, profileObj) {
  const prev = getCachedProfile();
  const next = { ...prev };
  if (profileObj && Object.keys(profileObj).length) next[id] = profileObj; else delete next[id];
  setCachedProfile(next);
  saveProfileKeepalive(apiKey, id, profileObj || {});
  return saveProfile(apiKey, id, profileObj || {});
}

// Queue join date: written once, the first time a contact qualifies for Follow
// Ups (score >= 9) or is pinned in by hand. Server side is first-write-wins, so
// a repeat is harmless. Read by the cockpit's Added today / this week stats.
export function persistAddedAt(apiKey, id) {
  const c = getCachedProspects();
  if (!c || (c.addedat && c.addedat[id] != null)) return;
  const ts = Date.now();
  cache = { ...c, addedat: { ...(c.addedat || {}), [id]: String(ts) } };
  saveLS(cache);
  saveAddedAt(apiKey, id, ts).catch(() => {});
}

// Optimistic write of a call log: update the cache, keepalive PUT (survives the
// phone locking), awaited confirm, and a dirty flag reconciled on next load.
export function persistLog(apiKey, id, log) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {} };
  cache = { ...c, logs: { ...c.logs, [id]: log } };
  saveLS(cache);
  if (qualifiesForFollowUp(log)) persistAddedAt(apiKey, id);
  const d = getDirty(LOG_DIRTY); d.add(id); writeDirty(LOG_DIRTY, d);
  saveProspectLogKeepalive(apiKey, id, log);
  saveProspectLog(apiKey, id, log).then(() => { const dd = getDirty(LOG_DIRTY); dd.delete(id); writeDirty(LOG_DIRTY, dd); }).catch(() => {});
  return cache;
}

// Optimistic write of a follow-up touch history (the full array), same durability
// path as the call log.
export function persistFollowUps(apiKey, id, touches) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {} };
  cache = { ...c, followUps: { ...c.followUps, [id]: touches } };
  saveLS(cache);
  const d = getDirty(FU_DIRTY); d.add(id); writeDirty(FU_DIRTY, d);
  saveFollowUpsKeepalive(apiKey, id, touches);
  saveFollowUps(apiKey, id, touches).then(() => { const dd = getDirty(FU_DIRTY); dd.delete(id); writeDirty(FU_DIRTY, dd); }).catch(() => {});
  return cache;
}

// Read the SOI map out of the session cache (server hydrates it on load).
export function getCachedSoi() {
  return getCachedProspects()?.soi || {};
}

// Write a whole SOI map back to the cache. Used to apply an optimistic promotion
// and, if the write fails, to put the previous map back.
export function setCachedSoi(soi) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {} };
  cache = { ...c, soi };
  saveLS(cache);
  return cache;
}

// Promote a contact into the SOI ("add") or take them out ("remove"). Applies the
// change to the cache immediately, fires the keepalive so it survives the phone
// locking on the way back to the queue, and returns the awaited write so the
// caller can revert its own state on failure. A revert can briefly disagree with
// the server if the keepalive landed and the awaited call did not; the next load
// reads server truth and settles it.
export function persistSoi(apiKey, id, action) {
  const soi = { ...getCachedSoi() };
  if (action === "add") soi[id] = String(Date.now());
  else delete soi[id];
  setCachedSoi(soi);

  saveSoiKeepalive(apiKey, id, action);
  return saveSoi(apiKey, id, action);
}

// ----- Manual Follow Ups membership -----

export function getCachedPinned() {
  return getCachedProspects()?.pinned || [];
}

// Write a whole pinned list back to the cache: applies an optimistic pin, or puts
// the previous list back when the write fails.
export function setCachedPinned(pinned) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {} };
  cache = { ...c, pinned };
  saveLS(cache);
  return cache;
}

// Pin a contact into Follow Ups ("add") or take them out ("remove"). Same shape
// as persistSoi: optimistic cache write, keepalive for durability, and the
// awaited call returned so the caller can revert.
export function persistPin(apiKey, id, action) {
  const current = getCachedPinned();
  const next = action === "add"
    ? (current.includes(id) ? current : [...current, id])
    : current.filter((x) => x !== id);
  setCachedPinned(next);
  if (action === "add") persistAddedAt(apiKey, id);

  savePinKeepalive(apiKey, id, action);
  return savePin(apiKey, id, action);
}

// ----- RAC (the CRM) -----

export function getCachedRac() {
  return getCachedProspects()?.rac || [];
}

export function setCachedRac(rac) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [] };
  cache = { ...c, rac };
  saveLS(cache);
  return cache;
}

// Mark a contact as copied into RAC, or clear the mark. Same shape as persistPin:
// optimistic cache write, keepalive for durability, awaited call returned so the
// caller can revert.
export function persistRac(apiKey, id, action) {
  const current = getCachedRac();
  const next = action === "add"
    ? (current.includes(id) ? current : [...current, id])
    : current.filter((x) => x !== id);
  setCachedRac(next);

  saveRacKeepalive(apiKey, id, action);
  return saveRac(apiKey, id, action);
}

// ----- Cold pipeline and dead box (the Follow Up cockpit) -----

export function getCachedCold() {
  return getCachedProspects()?.cold || {};
}
export function getCachedDead() {
  return getCachedProspects()?.dead || {};
}

// Write whole cold/dead maps back to the cache. Used to apply an optimistic move
// and, if the write fails, to put the previous maps back.
export function setCachedColdDead(cold, dead) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [], cold: {}, dead: {} };
  cache = { ...c, cold, dead };
  saveLS(cache);
  return cache;
}

// Move a contact to cold ("add") or out of it ("remove"). Optimistic cache write,
// keepalive for durability, awaited call returned so the caller can revert. The
// cold column is derived from check-in touches, so nothing about position is
// written here.
export function persistCold(apiKey, id, action) {
  const cold = { ...getCachedCold() };
  if (action === "add") cold[id] = String(Date.now());
  else delete cold[id];
  setCachedColdDead(cold, getCachedDead());

  saveColdKeepalive(apiKey, id, action);
  return saveCold(apiKey, id, action);
}

// ----- Stage placements (cockpit drag board) -----

export function getCachedStagemap() {
  return getCachedProspects()?.stagemap || {};
}

export function setCachedStagemap(stagemap) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [] };
  cache = { ...c, stagemap };
  saveLS(cache);
  return cache;
}

// Record a hand placement: the card moves to `stage` with no touch logged.
// Same shape as persistCold: optimistic cache write, keepalive for durability,
// awaited call returned so the caller can revert.
export function persistStageMove(apiKey, id, stage) {
  const stagemap = { ...getCachedStagemap(), [id]: { s: stage, ts: Date.now() } };
  setCachedStagemap(stagemap);

  saveStageMoveKeepalive(apiKey, id, "add", stage);
  return saveStageMove(apiKey, id, "add", stage);
}

// ----- Whale flag -----

export function getCachedWhale() {
  return getCachedProspects()?.whale || [];
}

export function setCachedWhale(whale) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [] };
  cache = { ...c, whale };
  saveLS(cache);
  return cache;
}

export function persistWhale(apiKey, id, action) {
  const current = getCachedWhale();
  const next = action === "add"
    ? (current.includes(id) ? current : [...current, id])
    : current.filter((x) => x !== id);
  setCachedWhale(next);

  saveWhaleKeepalive(apiKey, id, action);
  return saveWhale(apiKey, id, action);
}

// ----- Fire flag (hot leads) -----

export function getCachedFire() {
  return getCachedProspects()?.fire || [];
}

export function setCachedFire(fire) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [] };
  cache = { ...c, fire };
  saveLS(cache);
  return cache;
}

export function persistFire(apiKey, id, action) {
  const current = getCachedFire();
  const next = action === "add"
    ? (current.includes(id) ? current : [...current, id])
    : current.filter((x) => x !== id);
  setCachedFire(next);

  saveFireKeepalive(apiKey, id, action);
  return saveFire(apiKey, id, action);
}

// ----- Motivation notes -----

export function getCachedMotivation() {
  return getCachedProspects()?.motivation || {};
}

export function setCachedMotivation(motivation) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [] };
  cache = { ...c, motivation };
  saveLS(cache);
  return cache;
}

// Save (or clear, with empty text) a contact's motivation note. Optimistic cache
// write, keepalive for durability, awaited call returned for revert.
export function persistMotivation(apiKey, id, text) {
  const motivation = { ...getCachedMotivation() };
  const value = (text || "").trim();
  if (value) motivation[id] = value; else delete motivation[id];
  setCachedMotivation(motivation);

  saveMotivationKeepalive(apiKey, id, value);
  return saveMotivation(apiKey, id, value);
}

// Mark a contact dead ("add") or restore them ("remove"). Mirrors the server's
// supersede rule in the cache so the optimistic view matches what will be stored:
// dead-add clears cold; dead-remove drops them into cold (Fresh Cold).
export function persistDead(apiKey, id, action) {
  const cold = { ...getCachedCold() };
  const dead = { ...getCachedDead() };
  if (action === "add") {
    dead[id] = String(Date.now());
    delete cold[id];
  } else {
    delete dead[id];
    cold[id] = String(Date.now());
  }
  setCachedColdDead(cold, dead);

  saveDeadKeepalive(apiKey, id, action);
  return saveDead(apiKey, id, action);
}

// Create a manual contact. Not optimistic: the server owns the id normalization
// and the duplicate check, so the cache is only updated once it confirms. The
// server pins it in the same handler, so the pin is applied here too. Resolves
// with the stored contact.
export async function persistManualContact(apiKey, input) {
  const { id, contact } = await saveManualContact(apiKey, input);
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [] };
  const manual = { ...(c.manual || {}), [id]: contact };
  const pinned = c.pinned?.includes(id) ? c.pinned : [...(c.pinned || []), id];
  cache = {
    ...c,
    manual,
    pinned,
    prospects: sortedQueue(mergeManualContacts(c.prospects || [], manual)),
  };
  saveLS(cache);
  return { id, contact, cache };
}
