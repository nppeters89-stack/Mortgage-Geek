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

const SOI_KEY = "prospects:soi";
const PINNED_SET = "prospects:pinned";
const MANUAL_KEY = "prospects:manual";
const RAC_SET = "prospects:rac";
const COLD_KEY = "prospects:cold";
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
async function handleSoi(res, { id, action }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  if (action === "add") {
    const ts = Date.now();
    await redis.hset(SOI_KEY, { [id]: String(ts) });
    return jsonResponse(res, 200, { id, action, ts });
  }
  await redis.hdel(SOI_KEY, id);
  return jsonResponse(res, 200, { id, action });
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

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const body = req.body;
    if (!body || typeof body !== "object") return jsonResponse(res, 400, { error: "body must be a JSON object" });

    switch (body.kind) {
      case "soi": return await handleSoi(res, body);
      case "pin": return await handleSetFlag(res, body, PINNED_SET);
      case "rac": return await handleSetFlag(res, body, RAC_SET);
      case "cold": return await handleCold(res, body);
      case "dead": return await handleDead(res, body);
      case "manual": return await handleManual(res, body.contact);
      default: return jsonResponse(res, 400, { error: "kind must be soi, pin, rac, cold, dead or manual" });
    }
  } catch (err) {
    console.error("[prospects/membership] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
