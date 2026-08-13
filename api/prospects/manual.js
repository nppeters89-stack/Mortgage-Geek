// PUT /api/prospects/manual — create a contact that did not come from the Excel
// master list.
//
// Body { contact } with { name, phone, email, brokerage, notes }. The server
// normalizes the phone to digits for the id, stores the record in the
// prospects:manual HASH, and pins it in the same handler: a manually added
// contact is a Follow Ups candidate by definition, so the two writes belong
// together rather than as two round trips the client could half-complete.
//
// These records are DELIBERATELY not written to prospects:list:v1. That key is
// replaced wholesale on every re-seed from Excel, so anything living there would
// be destroyed. Manual contacts live in their own hash and are merged into the
// contact collection client-side, which is also why the field names match the
// seeded shape exactly: every downstream component then works unchanged.

import { redis, requireKey, jsonResponse, parseStored } from "../geeklog/_redis.js";

const MANUAL_KEY = "prospects:manual";
const PINNED_SET = "prospects:pinned";

const digits = (v) => String(v || "").replace(/\D/g, "");
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function validate(contact) {
  if (!contact || typeof contact !== "object") return "contact must be an object";
  if (!str(contact.name, 200)) return "name is required";
  if (digits(contact.phone).length < 7) return "phone must have at least 7 digits";
  for (const field of ["email", "brokerage", "notes"]) {
    if (contact[field] != null && typeof contact[field] !== "string") return `${field} must be a string`;
  }
  return null;
}

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const err = validate(req.body?.contact);
    if (err) return jsonResponse(res, 400, { error: err });

    const input = req.body.contact;
    const id = digits(input.phone);

    // The client checks for duplicates against the merged collection before it
    // gets here; this is the backstop that makes a duplicate structurally
    // impossible even if two devices race.
    const existing = parseStored(await redis.hget(MANUAL_KEY, id));
    if (existing) return jsonResponse(res, 409, { error: "A manual contact with this phone number already exists" });

    const contact = {
      name: str(input.name, 200),
      phone: str(input.phone, 40) || id,
      email: str(input.email, 200),
      brokerage: str(input.brokerage, 200),
      notes: str(input.notes, 4000),
      buysides: 0,
      addedTs: Date.now(),
    };

    await redis.hset(MANUAL_KEY, { [id]: JSON.stringify(contact) });
    await redis.sadd(PINNED_SET, id);

    return jsonResponse(res, 200, { id, contact });
  } catch (err) {
    console.error("[prospects/manual] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
