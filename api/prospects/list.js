// PUT /api/prospects/list — replace the whole call queue (seed script only).
//
// Body is the full seed blob { version, generated, source, prospects: [...] }.
// Wholesale SET of prospects:list:v1. This NEVER touches prospects:log:* or
// prospects:logged, so re-seeding the master list preserves every call already
// logged (logs overlay the list client-side by id). Same GEEKLOG_KEY auth as
// the rest of Geek Log.

import { redis, requireKey, jsonResponse } from "../geeklog/_redis.js";

const LIST_KEY = "prospects:list:v1";

export default async function handler(req, res) {
  if (!requireKey(req, res)) return jsonResponse(res, 401, { error: "Unauthorized" });
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const blob = req.body;
    if (!blob || typeof blob !== "object" || !Array.isArray(blob.prospects)) {
      return jsonResponse(res, 400, { error: "body must be the seed blob with a prospects array" });
    }

    await redis.set(LIST_KEY, JSON.stringify(blob));
    return jsonResponse(res, 200, { ok: true, count: blob.prospects.length });
  } catch (err) {
    console.error("[prospects/list] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
