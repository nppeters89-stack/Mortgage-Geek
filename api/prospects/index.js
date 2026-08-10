// /api/prospects — read the prospecting call queue plus every call log.
//
// Reuses the Geek Log auth + Upstash client (../geeklog/_redis.js): same
// X-Geeklog-Key header, same GEEKLOG_KV_* connection. Contact data lives ONLY in
// Redis and is returned only to an authorized client; it is never bundled or
// prerendered.
//
// Returns { list, logs }:
//   list  - the seed blob { version, generated, source, prospects: [...] }
//   logs  - { [id]: { outcome, score, note, callback, dateCalled, ts } }, keyed
//           by phone digits, overlaid on the list client-side.

import { redis, requireKey, jsonResponse, parseStored } from "../geeklog/_redis.js";

const LIST_KEY = "prospects:list:v1";
const LOGGED_SET = "prospects:logged";
const logKey = (id) => `prospects:log:${id}`;

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const list = parseStored(await redis.get(LIST_KEY)) || { version: 1, generated: null, source: null, prospects: [] };

    const ids = (await redis.smembers(LOGGED_SET)) || [];
    const logs = {};
    if (ids.length) {
      const values = await redis.mget(...ids.map(logKey));
      ids.forEach((id, i) => {
        const v = parseStored(values[i]);
        if (v) logs[id] = v;
      });
    }

    return jsonResponse(res, 200, { list, logs });
  } catch (err) {
    console.error("[prospects] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
