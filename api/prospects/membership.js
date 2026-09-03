// PUT /api/prospects/membership — one endpoint for every write that decides
// which list a contact belongs to.
//
// Body { kind, ... }:
//   { kind: "soi",    id, action: "add" | "remove" }  HSET/HDEL prospects:soi
//   { kind: "pin",    id, action: "add" | "remove" }  SADD/SREM prospects:pinned
//   { kind: "rac",    id, action: "add" | "remove" }  SADD/SREM prospects:rac
//   { kind: "cold",   id, action: "add" | "remove" }  HSET/HDEL prospects:cold
//   { kind: "dead",   id, action: "add" | "remove" }  HSET/HDEL prospects:dead (+cold)
//   { kind: "manual", contact }                       HSET prospects:manual + pin
//
// cold and dead are the Follow Up cockpit's state hashes (id -> ms timestamp).
// They live here, not in two new endpoint files, because Vercel's Hobby plan caps
// a deployment at 12 Serverless Functions and this endpoint exists precisely to
// keep every "which list is this contact in" write on one route. Dead supersedes
// cold: adding dead clears cold, and removing dead drops the contact back into
// cold (Fresh Cold), never straight into the hot pipeline.
//
// These began as three routes (soi.js, pin.js, manual.js) and were folded into
// one because Vercel's Hobby plan caps a deployment at 12 Serverless Functions
// and api/ had reached 13. They are one concern anyway: how a contact enters or
// leaves a list. Nothing about the storage changed, only the routing.
//
// Manual contacts are DELIBERATELY never written to prospects:list:v1, which is
// replaced wholesale on every re-seed from Excel and would destroy them.

import { redis, requireKey, jsonResponse, parseStored } from "../geeklog/_redis.js";
import { LENDER_SITUATION_IDS, NEED_IDS, LEAD_OBJECTION_IDS, LEAD_TIMELINE_IDS, LEAD_TRACK_IDS, SOI_CATEGORY_IDS } from "./_chips.js";
import { issueSession, verifySession, safeEqual, readCookie, sessionCookie, clearSessionCookie } from "../geeklog/_auth.js";

const SOI_KEY = "prospects:soi";
const PINNED_SET = "prospects:pinned";
const MANUAL_KEY = "prospects:manual";
const RAC_SET = "prospects:rac";
const WHALE_SET = "prospects:whale";
const FIRE_SET = "prospects:fire";
const ADDED_KEY = "prospects:addedat";
const PROFILE_KEY = "prospects:profile";
// Leads namespace: a second pipeline for consumer leads referred by partner
// accounts. Data minimization is a hard rule enforced here: a lead is name,
// mobile, email, account, source note, timeline chip and a short next-step
// note. Nothing else is stored, whatever the client sends.
const LEADS_IDS = "leads:ids";
const leadKey = (id) => `leads:contact:${id}`;
const leadFuKey = (id) => `leads:fu:${id}`;
const LEADS_FU_IDS = "leads:fu:ids";
const LEADS_STATUS = "leads:status";
const COLD_KEY = "prospects:cold";
const STAGEMAP_KEY = "prospects:fu:stagemap";
const MOTIVATION_KEY = "prospects:motivation";
const DEAD_KEY = "prospects:dead";

const ACTIONS = new Set(["add", "remove"]);
const digits = (v) => String(v || "").replace(/\D/g, "");
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const validId = (id) => typeof id === "string" && /^\d{7,}$/.test(id);

function validateContact(contact) {
  if (!contact || typeof contact !== "object") return "contact must be an object";
  if (!str(contact.name, 200)) return "name is required";
  if (digits(contact.phone).length < 7) return "phone must have at least 7 digits";
  for (const field of ["email", "brokerage", "notes"]) {
    if (contact[field] != null && typeof contact[field] !== "string") return `${field} must be a string`;
  }
  return null;
}

// Sphere of influence: a stored membership flag plus the promotion date.
async function handleSoi(res, { id, action, category }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  if (action === "add") {
    // New members carry a category from every entry point; legacy members
    // keep their bare-timestamp records until categorized.
    if (!SOI_CATEGORY_IDS.has(category)) return jsonResponse(res, 400, { error: "category required" });
    const ts = Date.now();
    await redis.hset(SOI_KEY, { [id]: JSON.stringify({ ts, category }) });
    return jsonResponse(res, 200, { id, action, ts, category });
  }
  await redis.hdel(SOI_KEY, id);
  return jsonResponse(res, 200, { id, action });
}

// Categorize (or re-categorize) an existing member and optionally set the
// weekly reportDay. Preserves the original membership timestamp.
async function handleSoiCategory(res, { id, category, reportDay }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  const raw = await redis.hget(SOI_KEY, id);
  if (raw == null) return jsonResponse(res, 400, { error: "not an SOI member" });
  if (!SOI_CATEGORY_IDS.has(category)) return jsonResponse(res, 400, { error: "unknown category" });
  const prev = parseStored(raw);
  const entry = { ts: prev && typeof prev === "object" ? Number(prev.ts) || Date.now() : Number(prev) || Date.now(), category };
  if (prev && typeof prev === "object" && Number.isInteger(prev.reportDay)) entry.reportDay = prev.reportDay;
  if (reportDay != null) {
    if (!(Number.isInteger(reportDay) && reportDay >= 0 && reportDay <= 6)) return jsonResponse(res, 400, { error: "reportDay must be 0-6" });
    entry.reportDay = reportDay;
  }
  await redis.hset(SOI_KEY, { [id]: JSON.stringify(entry) });
  return jsonResponse(res, 200, { id, ...entry });
}

// A plain membership SET keyed by contact id. Two of these: prospects:pinned
// (manual Follow Ups membership) and prospects:rac (copied into the CRM). Both
// are pure flags, so a SET is the whole storage requirement.
async function handleSetFlag(res, { id, action }, setKey) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  if (action === "add") await redis.sadd(setKey, id);
  else await redis.srem(setKey, id);
  return jsonResponse(res, 200, { id, action });
}

// Cold: a stored membership hash of id -> the ms timestamp it went quiet. The
// cold column position is derived from check-in touches, never stored here.
async function handleCold(res, { id, action }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  if (action === "add") {
    const ts = Date.now();
    await redis.hset(COLD_KEY, { [id]: String(ts) });
    return jsonResponse(res, 200, { id, action, ts });
  }
  await redis.hdel(COLD_KEY, id);
  return jsonResponse(res, 200, { id, action });
}

// Dead: the same shape, plus the supersede rule. Adding dead clears any cold
// membership in the same handler (dead wins). Removing dead (a restore) writes
// the contact into cold with a fresh timestamp, so a restored contact lands in
// Fresh Cold rather than reappearing in the hot pipeline.
async function handleDead(res, { id, action }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  const ts = Date.now();
  if (action === "add") {
    await redis.hset(DEAD_KEY, { [id]: String(ts) });
    await redis.hdel(COLD_KEY, id);
    return jsonResponse(res, 200, { id, action, ts });
  }
  await redis.hdel(DEAD_KEY, id);
  await redis.hset(COLD_KEY, { [id]: String(ts) });
  return jsonResponse(res, 200, { id, action, ts });
}

// A contact that never came from Excel. Pinned in the same handler: a manual add
// is a Follow Ups candidate by definition, so the client cannot half-complete it.
// Join date for the Follow Ups queue: id -> ms, first write wins (the guard
// makes a re-send or a backfill unable to overwrite the original date).
async function handleAdded(res, { id, ts }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  const t = Number.isFinite(ts) ? ts : Date.now();
  const existing = await redis.hget(ADDED_KEY, id);
  if (existing == null) await redis.hset(ADDED_KEY, { [id]: String(t) });
  return jsonResponse(res, 200, { id, ts: existing != null ? Number(existing) : t });
}

// ---- Auth kinds: the only kinds reachable without a session. ----

const FAIL_TTL_SEC = 15 * 60;
const FAIL_LIMIT = 10;
const failKey = (ip) => `auth:fail:${ip}`;
const clientIp = (req) => String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

async function handleAuthLogin(req, res, { passphrase }) {
  const ip = clientIp(req);
  // Rate limit before comparing anything: 10 failures per ip per 15 minutes.
  const fails = Number(await redis.get(failKey(ip))) || 0;
  if (fails >= FAIL_LIMIT) { res.status(429).end(); return; }
  const expected = process.env.GEEKLOG_KEY;
  if (!expected || !safeEqual(passphrase, expected)) {
    const n = await redis.incr(failKey(ip));
    if (n === 1) await redis.expire(failKey(ip), FAIL_TTL_SEC);
    res.status(401).end();
    return;
  }
  const token = issueSession();
  if (!token) { res.status(401).end(); return; }
  await redis.del(failKey(ip));
  res.setHeader("Set-Cookie", sessionCookie(token));
  res.status(204).end();
}

function handleAuthLogout(res) {
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.status(204).end();
}

function handleAuthCheck(req, res) {
  const sess = verifySession(readCookie(req));
  res.status(sess ? 204 : 401).end();
}

// Contact profile: Nick's current understanding, overwritten as it improves.
// { lenderSituation?, needs?, hook? }; unknown chip ids are rejected. A save
// that empties every field deletes the hash entry.
async function handleProfile(res, { id, profile }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!profile || typeof profile !== "object") return jsonResponse(res, 400, { error: "profile must be an object" });
  const clean = {};
  if (profile.lenderSituation != null && profile.lenderSituation !== "") {
    if (!LENDER_SITUATION_IDS.has(profile.lenderSituation)) return jsonResponse(res, 400, { error: "unknown lenderSituation id" });
    clean.lenderSituation = profile.lenderSituation;
  }
  if (profile.needs != null) {
    if (!Array.isArray(profile.needs) || profile.needs.length > 10 || profile.needs.some((n) => !NEED_IDS.has(n))) {
      return jsonResponse(res, 400, { error: "unknown need id" });
    }
    if (profile.needs.length) clean.needs = profile.needs;
  }
  if (profile.hook != null && profile.hook !== "") {
    if (typeof profile.hook !== "string" || profile.hook.length > 300) return jsonResponse(res, 400, { error: "hook must be a short string" });
    clean.hook = profile.hook.trim();
  }
  if (Object.keys(clean).length) await redis.hset(PROFILE_KEY, { [id]: JSON.stringify(clean) });
  else await redis.hdel(PROFILE_KEY, id);
  return jsonResponse(res, 200, { id, profile: clean });
}

// ---- Lead kinds ----

// Create or update a lead contact. Field whitelist IS the data rule: no
// income, no credit, no loan numbers, no documents, ever.
async function handleLeadSave(res, { contact }) {
  if (!contact || typeof contact !== "object") return jsonResponse(res, 400, { error: "contact must be an object" });
  const id = String(contact.phone || "").replace(/\D/g, "");
  if (!/^\d{7,}$/.test(id)) return jsonResponse(res, 400, { error: "phone must have at least 7 digits" });
  if (typeof contact.name !== "string" || !contact.name.trim()) return jsonResponse(res, 400, { error: "name required" });
  // Referral source must be an SOI member; the membership hash is the single
  // source of truth for who can refer.
  if (typeof contact.referredBy !== "string" || !/^\d{7,}$/.test(contact.referredBy) || (await redis.hget(SOI_KEY, contact.referredBy)) == null) {
    return jsonResponse(res, 400, { error: "referredBy must be an SOI member id" });
  }
  for (const [k, max] of [["name", 120], ["email", 200], ["sourceNote", 300], ["note", 500]]) {
    if (contact[k] != null && (typeof contact[k] !== "string" || contact[k].length > max)) return jsonResponse(res, 400, { error: `${k} must be a short string` });
  }
  if (contact.timeline != null && contact.timeline !== "" && !LEAD_TIMELINE_IDS.has(contact.timeline)) return jsonResponse(res, 400, { error: "unknown timeline id" });
  const clean = {
    kind: "lead",
    name: contact.name.trim(),
    phone: String(contact.phone),
    email: typeof contact.email === "string" ? contact.email.trim() : "",
    referredBy: contact.referredBy,
    sourceNote: typeof contact.sourceNote === "string" ? contact.sourceNote.trim() : "",
    note: typeof contact.note === "string" ? contact.note.trim() : "",
    timeline: LEAD_TIMELINE_IDS.has(contact.timeline) ? contact.timeline : "",
    createdAt: Number.isFinite(contact.createdAt) ? contact.createdAt : Date.now(),
  };
  await redis.set(leadKey(id), JSON.stringify(clean));
  await redis.sadd(LEADS_IDS, id);
  return jsonResponse(res, 200, { id, contact: clean });
}

// Append one touch to a lead's history. Same record shape as the agent
// pipeline: ts, note, stage (0..5 or -4 reply), type, talked, objections
// validated against the lead objection set.
async function handleLeadTouch(res, { id, touch }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!touch || typeof touch !== "object" || !Number.isFinite(touch.ts)) return jsonResponse(res, 400, { error: "touch.ts must be a number" });
  if (touch.note != null && (typeof touch.note !== "string" || touch.note.length > 2000)) return jsonResponse(res, 400, { error: "touch.note must be a string" });
  if (touch.stage != null && !(Number.isInteger(touch.stage) && touch.stage >= -4 && touch.stage <= 5)) return jsonResponse(res, 400, { error: "touch.stage out of range" });
  if (touch.type != null && (typeof touch.type !== "string" || touch.type.length > 20)) return jsonResponse(res, 400, { error: "touch.type must be a short string" });
  if (touch.talked != null && typeof touch.talked !== "boolean") return jsonResponse(res, 400, { error: "touch.talked must be a boolean" });
  if (touch.objections != null && (!Array.isArray(touch.objections) || touch.objections.length > 10 || touch.objections.some((x) => !LEAD_OBJECTION_IDS.has(x)))) {
    return jsonResponse(res, 400, { error: "touch.objections must be known lead objection ids" });
  }
  const clean = { ts: touch.ts, note: typeof touch.note === "string" ? touch.note : "" };
  if (Number.isInteger(touch.stage)) clean.stage = touch.stage;
  if (typeof touch.type === "string" && touch.type) clean.type = touch.type;
  if (touch.talked === true) clean.talked = true;
  if (Array.isArray(touch.objections) && touch.objections.length) clean.objections = touch.objections;
  const existing = parseStored(await redis.get(leadFuKey(id))) || [];
  const next = [...existing, clean].slice(-500);
  await redis.set(leadFuKey(id), JSON.stringify(next));
  await redis.sadd(LEADS_FU_IDS, id);
  return jsonResponse(res, 200, { id, touches: next });
}

// Post-application status track: the single source of truth after
// app_complete. An empty track clears the entry (back to the board).
async function handleLeadStatus(res, { id, track, expiryTs }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (track === "" || track == null) {
    await redis.hdel(LEADS_STATUS, id);
    return jsonResponse(res, 200, { id, track: "" });
  }
  if (!LEAD_TRACK_IDS.has(track)) return jsonResponse(res, 400, { error: "unknown status track" });
  const entry = { track, ts: Date.now() };
  if (expiryTs != null) {
    if (!Number.isFinite(expiryTs)) return jsonResponse(res, 400, { error: "expiryTs must be a number" });
    entry.expiryTs = expiryTs;
  }
  await redis.hset(LEADS_STATUS, { [id]: JSON.stringify(entry) });
  return jsonResponse(res, 200, { id, ...entry });
}


async function handleLeadDelete(res, { id }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  await redis.del(leadKey(id));
  await redis.del(leadFuKey(id));
  await redis.hdel(LEADS_STATUS, id);
  await redis.srem(LEADS_IDS, id);
  await redis.srem(LEADS_FU_IDS, id);
  return jsonResponse(res, 200, { id, deleted: true });
}


async function handleManual(res, contact) {
  const err = validateContact(contact);
  if (err) return jsonResponse(res, 400, { error: err });

  const id = digits(contact.phone);

  // The client checks for duplicates against the merged collection before it gets
  // here; this is the backstop that makes a duplicate structurally impossible.
  const existing = parseStored(await redis.hget(MANUAL_KEY, id));
  if (existing) return jsonResponse(res, 409, { error: "A manual contact with this phone number already exists" });

  const record = {
    name: str(contact.name, 200),
    phone: str(contact.phone, 40) || id,
    email: str(contact.email, 200),
    brokerage: str(contact.brokerage, 200),
    notes: str(contact.notes, 4000),
    buysides: 0,
    addedTs: Date.now(),
  };

  await redis.hset(MANUAL_KEY, { [id]: JSON.stringify(record) });
  await redis.sadd(PINNED_SET, id);
  return jsonResponse(res, 200, { id, contact: record });
}

// A hand placement from the cockpit drag board: HSET id -> { s, ts }. Unlike a
// touch, a placement carries no note, never counts toward touch history or
// staleness, and can move a contact DOWN as well as up; stageOf treats it as the
// new ratchet base. "remove" clears the placement and the touch ratchet resumes.
async function handleStageMove(res, { id, action, stage }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  if (action === "add") {
    if (!Number.isInteger(stage) || stage < 0 || stage > 30) {
      return jsonResponse(res, 400, { error: "stage must be an integer stage index" });
    }
    const ts = Date.now();
    await redis.hset(STAGEMAP_KEY, { [id]: JSON.stringify({ s: stage, ts }) });
    return jsonResponse(res, 200, { id, action, stage, ts });
  }

  await redis.hdel(STAGEMAP_KEY, id);
  return jsonResponse(res, 200, { id, action });
}

// Per-contact motivation note: why this prospect would switch. One HASH of id to
// plain text, separate from the seed list (which a re-seed replaces wholesale)
// and from touch history (it is a standing fact, not an event). "add" with text
// upserts; "add" with empty text or "remove" clears.
async function handleMotivation(res, { id, action, text }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  const value = typeof text === "string" ? text.trim().slice(0, 2000) : "";
  if (action === "remove" || !value) {
    await redis.hdel(MOTIVATION_KEY, id);
    return jsonResponse(res, 200, { id, action: "remove" });
  }
  await redis.hset(MOTIVATION_KEY, { [id]: value });
  return jsonResponse(res, 200, { id, action, text: value });
}

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const body = req.body;
    if (!body || typeof body !== "object") return jsonResponse(res, 400, { error: "body must be a JSON object" });

    // The three auth kinds are reachable without a session; everything else
    // sits behind the gate.
    if (body.kind === "auth.login") return await handleAuthLogin(req, res, body);
    if (body.kind === "auth.logout") return handleAuthLogout(res);
    if (body.kind === "auth.check") return handleAuthCheck(req, res);

    if (!requireKey(req, res)) return jsonResponse(res, 401, { error: "Unauthorized" });

    switch (body.kind) {
      case "soi": return await handleSoi(res, body);
      case "soi.category": return await handleSoiCategory(res, body);
      case "pin": return await handleSetFlag(res, body, PINNED_SET);
      case "rac": return await handleSetFlag(res, body, RAC_SET);
      case "whale": return await handleSetFlag(res, body, WHALE_SET);
      case "fire": return await handleSetFlag(res, body, FIRE_SET);
      case "stage": return await handleStageMove(res, body);
      case "motivation": return await handleMotivation(res, body);
      case "cold": return await handleCold(res, body);
      case "dead": return await handleDead(res, body);
      case "added": return await handleAdded(res, body);
      case "profile": return await handleProfile(res, body);
      case "lead.save": return await handleLeadSave(res, body);
      case "lead.touch": return await handleLeadTouch(res, body);
      case "lead.status": return await handleLeadStatus(res, body);
      case "lead.delete": return await handleLeadDelete(res, body);
      case "manual": return await handleManual(res, body.contact);
      default: return jsonResponse(res, 400, { error: "kind must be soi, pin, rac, cold, dead or manual" });
    }
  } catch (err) {
    console.error("[prospects/membership] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
