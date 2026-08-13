// PUT /api/prospects/soi — promote a contact into the sphere of influence, or
// take them back out.
//
// Body { id, action } where id = phone digits (the same id as call logs and
// follow-up histories) and action is "add" or "remove". SOI is a single HASH,
// prospects:soi, mapping id to the promotion timestamp (ms epoch as a string):
// one HGETALL hydrates the whole thing in /api/prospects.
//
// Unlike Follow Ups, SOI membership is a manual decision, so it is stored rather
// than derived. Nothing else moves: touch histories stay at prospects:fu:{id} and
// are shared by both views, so removing from SOI loses no history.

import { redis, requireKey, jsonResponse } from "../geeklog/_redis.js";

const SOI_KEY = "prospects:soi";
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

    if (action === "add") {
      const ts = Date.now();
      await redis.hset(SOI_KEY, { [id]: String(ts) });
      return jsonResponse(res, 200, { id, action, ts });
    }

    await redis.hdel(SOI_KEY, id);
    return jsonResponse(res, 200, { id, action });
  } catch (err) {
    console.error("[prospects/soi] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
