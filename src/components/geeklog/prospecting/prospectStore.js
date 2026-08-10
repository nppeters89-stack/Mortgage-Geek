// Shared prospecting data store for the Prospecting and Follow Ups tabs. One GET
// hydrates { prospects, logs, followUps } for the whole feature; a session cache
// (localStorage-backed) carries a save across a tab switch, and every load
// reconciles unsynced writes against the server. Only one tab is mounted at a
// time, so a module cache is enough to keep them consistent without a store lib.
//
// Contact data never leaves Redis + these session caches; nothing is bundled or
// prerendered.

import { fetchProspects, saveProspectLog, saveProspectLogKeepalive, saveFollowUps, saveFollowUpsKeepalive } from "../../../utils/geeklogApi";
import { sortedQueue } from "./prospectsModel";

const LS_KEY = "gl2:prospects:v1";
const LOG_DIRTY = "gl2:prospects:dirty";
const FU_DIRTY = "gl2:prospects:fu:dirty";

let cache = null; // { prospects, logs, followUps }

function loadLS() { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveLS(obj) { try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch { /* best-effort */ } }
function getDirty(k) { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } }
function writeDirty(k, set) { try { localStorage.setItem(k, JSON.stringify([...set])); } catch { /* best-effort */ } }

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
  const prospects = sortedQueue(data.list?.prospects || []);
  const logs = reconcile(data.logs || {}, LOG_DIRTY, local?.logs, (id, v) => saveProspectLog(apiKey, id, v));
  const followUps = reconcile(data.followUps || {}, FU_DIRTY, local?.followUps, (id, v) => saveFollowUps(apiKey, id, v));
  cache = { prospects, logs, followUps };
  saveLS(cache);
  return cache;
}

// Optimistic write of a call log: update the cache, keepalive PUT (survives the
// phone locking), awaited confirm, and a dirty flag reconciled on next load.
export function persistLog(apiKey, id, log) {
  const c = getCachedProspects() || { prospects: [], logs: {}, followUps: {} };
  cache = { ...c, logs: { ...c.logs, [id]: log } };
  saveLS(cache);
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
