// /api/prospects — read the prospecting call queue plus every call log.
//
// Reuses the Geek Log auth + Upstash client (../geeklog/_redis.js): same
// X-Geeklog-Key header, same GEEKLOG_KV_* connection. Contact data lives ONLY in
// Redis and is returned only to an authorized client; it is never bundled or
// prerendered.
//
// Returns { list, logs, followUps, soi }:
//   list      - the seed blob { version, generated, source, prospects: [...] }
//   logs      - { [id]: { outcome, score, note, callback, dateCalled, ts } }, keyed
//               by phone digits, overlaid on the list client-side.
//   followUps - { [id]: [{ ts, note }, ...] } touch histories.
//   soi       - { [id]: ts } sphere-of-influence membership and promotion date.

import { redis, requireKey, jsonResponse, parseStored } from "../geeklog/_redis.js";

const LIST_KEY = "prospects:list:v1";
const LOGGED_SET = "prospects:logged";
const logKey = (id) => `prospects:log:${id}`;
const FU_SET = "prospects:fu:ids";
const fuKey = (id) => `prospects:fu:${id}`;
const SOI_KEY = "prospects:soi";

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

    // Follow-up touch histories, keyed by the same phone-digits id. Membership is
    // derived (score >= 9) client-side, so this only carries histories that exist.
    const fuIds = (await redis.smembers(FU_SET)) || [];
    const followUps = {};
    if (fuIds.length) {
      const vals = await redis.mget(...fuIds.map(fuKey));
      fuIds.forEach((id, i) => {
        const v = parseStored(vals[i]);
        if (Array.isArray(v)) followUps[id] = v;
      });
    }

    // SOI membership: one HGETALL of id -> promotion timestamp. Stored, not
    // derived, because promoting is a manual decision. Values come back as
    // strings; the client coerces.
    const soi = (await redis.hgetall(SOI_KEY)) || {};

    return jsonResponse(res, 200, { list, logs, followUps, soi });
  } catch (err) {
    console.error("[prospects] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
