// PUT /api/prospects/membership — one endpoint for every write that decides
// which list a contact belongs to.
//
// Body { kind, ... }:
//   { kind: "soi",    id, action: "add" | "remove" }  HSET/HDEL prospects:soi
//   { kind: "pin",    id, action: "add" | "remove" }  SADD/SREM prospects:pinned
//   { kind: "manual", contact }                       HSET prospects:manual + pin
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

// Manual Follow Ups membership, for contacts with no qualifying call score.
async function handlePin(res, { id, action }) {
  if (!validId(id)) return jsonResponse(res, 400, { error: "id must be phone digits" });
  if (!ACTIONS.has(action)) return jsonResponse(res, 400, { error: "action must be add or remove" });

  if (action === "add") await redis.sadd(PINNED_SET, id);
  else await redis.srem(PINNED_SET, id);
  return jsonResponse(res, 200, { id, action });
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
      case "pin": return await handlePin(res, body);
      case "manual": return await handleManual(res, body.contact);
      default: return jsonResponse(res, 400, { error: "kind must be soi, pin or manual" });
    }
  } catch (err) {
    console.error("[prospects/membership] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
