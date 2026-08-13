// PUT /api/prospects/pin — manually place a contact in Follow Ups, or take them
// back out.
//
// Body { id, action } where id = phone digits and action is "add" or "remove".
// prospects:pinned is a plain SET of ids. It applies to seeded and manual
// contacts alike: pinning is how a contact with no qualifying call score (an old
// straggler, someone met in the wild) gets into the queue.
//
// Follow Ups membership is therefore (score >= 9 OR pinned) AND not in SOI. The
// score half stays derived; this is only the manual half.

import { redis, requireKey, jsonResponse } from "../geeklog/_redis.js";

const PINNED_SET = "prospects:pinned";
const ACTIONS = new Set(["add", "remove"]);

function validate(body) {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  if (typeof body.id !== "string" || !/^\d{7,}$/.test(body.id)) return "id must be phone digits";
  if (!ACTIONS.has(body.action)) return "action must be add or remove";
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

    const { id, action } = req.body;
    if (action === "add") await redis.sadd(PINNED_SET, id);
    else await redis.srem(PINNED_SET, id);

    return jsonResponse(res, 200, { id, action });
  } catch (err) {
    console.error("[prospects/pin] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
