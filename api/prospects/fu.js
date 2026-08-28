// PUT /api/prospects/fu — upsert one contact's follow-up touch history.
//
// Body { id, touches } where id = phone digits (same id as call logs) and
// touches is the full updated array [{ ts, note, stage? }, ...]. `stage` is the
// Follow Up cockpit's pipeline stage: a positive index into the stages array, -1
// for a cold check-in, -2 for a dead marker. It is optional and additive: a touch
// stored before the cockpit simply has no stage field and is read back as stage 1
// (Intro Follow Up) client-side, so this never rewrites history. SETs prospects:fu:{id}
// and SADDs the id to prospects:fu:ids so /api/prospects can MGET every history
// without a SCAN. Single user, last write wins; small payload so it works with
// keepalive:true. Follow Ups membership is derived (call log score >= 9), never
// stored here.

import { redis, requireKey, jsonResponse } from "../geeklog/_redis.js";

const FU_SET = "prospects:fu:ids";
const fuKey = (id) => `prospects:fu:${id}`;

function validate(body) {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  if (typeof body.id !== "string" || !/^\d{7,}$/.test(body.id)) return "id must be phone digits";
  if (!Array.isArray(body.touches)) return "touches must be an array";
  if (body.touches.length > 500) return "too many touches";
  for (const t of body.touches) {
    if (!t || typeof t !== "object") return "each touch must be an object";
    if (!Number.isFinite(t.ts)) return "touch.ts must be a number";
    if (t.note != null && typeof t.note !== "string") return "touch.note must be a string";
    if (t.note && t.note.length > 2000) return "touch note too long";
    if (t.stage != null && !(Number.isInteger(t.stage) && t.stage >= -3 && t.stage <= 20)) return "touch.stage must be an integer"; // -3 = referral event
    if (t.talked != null && typeof t.talked !== "boolean") return "touch.talked must be a boolean";
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
    const err = validate(req.body);
    if (err) return jsonResponse(res, 400, { error: err });

    const { id, touches } = req.body;
    // Preserve stage only when present, so a legacy touch (no stage) stays exactly
    // as it was and is interpreted as stage 1 at read time.
    const clean = touches.map((t) => {
      const o = { ts: t.ts, note: typeof t.note === "string" ? t.note : "" };
      if (Number.isInteger(t.stage)) o.stage = t.stage;
      if (t.talked === true) o.talked = true; // a live conversation happened on this touch
      return o;
    });

    await redis.set(fuKey(id), JSON.stringify(clean));
    await redis.sadd(FU_SET, id);

    return jsonResponse(res, 200, { id, touches: clean });
  } catch (err) {
    console.error("[prospects/fu] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
