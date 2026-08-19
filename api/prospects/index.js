// /api/prospects — read the prospecting call queue plus every call log.
//
// Reuses the Geek Log auth + Upstash client (../geeklog/_redis.js): same
// X-Geeklog-Key header, same GEEKLOG_KV_* connection. Contact data lives ONLY in
// Redis and is returned only to an authorized client; it is never bundled or
// prerendered.
//
// Returns { list, logs, followUps, soi, pinned, manual }:
//   list      - the seed blob { version, generated, source, prospects: [...] }
//   logs      - { [id]: { outcome, score, note, callback, dateCalled, ts } }, keyed
//               by phone digits, overlaid on the list client-side.
//   followUps - { [id]: [{ ts, note }, ...] } touch histories.
//   soi       - { [id]: ts } sphere-of-influence membership and promotion date.
//   pinned    - [id, ...] contacts manually placed in Follow Ups.
//   rac       - [id, ...] contacts already copied into the RAC CRM.
//   manual    - { [id]: contact } contacts created in the app rather than seeded
//               from Excel. Merged into the list client-side; kept out of
//               prospects:list:v1 so a re-seed cannot destroy them.

import { redis, requireKey, jsonResponse, parseStored } from "../geeklog/_redis.js";

// Contact ids are phone digits, which the @upstash/redis SDK happily parses as
// JSON numbers on the way out of a SET. Everything downstream compares them as
// strings (Set.has("6155550142") is false against the number 6155550142), so
// every id read back from Redis is coerced here, at the boundary.
const toIds = (members) => (members || []).map(String);

const LIST_KEY = "prospects:list:v1";
const LOGGED_SET = "prospects:logged";
const logKey = (id) => `prospects:log:${id}`;
const FU_SET = "prospects:fu:ids";
const fuKey = (id) => `prospects:fu:${id}`;
const SOI_KEY = "prospects:soi";
const PINNED_SET = "prospects:pinned";
const MANUAL_KEY = "prospects:manual";
const RAC_SET = "prospects:rac";
const STAGES_KEY = "prospects:fu:stages";
const CONFIG_KEY = "prospects:fu:config";
const COLD_KEY = "prospects:cold";
const DEAD_KEY = "prospects:dead";
const STAGEMAP_KEY = "prospects:fu:stagemap";
const MOTIVATION_KEY = "prospects:motivation";

// The cockpit falls back to these when the key is absent, so no seeding write is
// required for the labels or the week target to work on a fresh install. A stored
// value (set later, without a deploy) overrides them.
const DEFAULT_STAGES = ["New", "Intro Follow Up", "Value Add & Social", "Value Add", "Check In / Meeting Ask", "Coffee / Face to Face", "SOI"];
const DEFAULT_CONFIG = { weekTarget: 15 };

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const list = parseStored(await redis.get(LIST_KEY)) || { version: 1, generated: null, source: null, prospects: [] };

    const ids = toIds(await redis.smembers(LOGGED_SET));
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
    const fuIds = toIds(await redis.smembers(FU_SET));
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

    // These two are compared with Set.has() client-side rather than used as
    // object keys, so the string coercion above is what makes them work at all.
    const pinned = toIds(await redis.smembers(PINNED_SET));
    const rac = toIds(await redis.smembers(RAC_SET));

    // Manual contacts are stored as JSON strings in one hash. A record that fails
    // to parse is skipped rather than breaking the whole payload.
    const manualRaw = (await redis.hgetall(MANUAL_KEY)) || {};
    const manual = {};
    for (const [id, value] of Object.entries(manualRaw)) {
      const v = parseStored(value);
      if (v && typeof v === "object") manual[id] = v;
    }

    // Follow Up cockpit state. stages/config fall back to defaults when unset;
    // cold/dead are id -> timestamp hashes, empty when nobody has been moved yet.
    const storedStages = parseStored(await redis.get(STAGES_KEY));
    const stages = Array.isArray(storedStages) && storedStages.length ? storedStages : DEFAULT_STAGES;
    const storedConfig = parseStored(await redis.get(CONFIG_KEY));
    const config = storedConfig && typeof storedConfig === "object" ? { ...DEFAULT_CONFIG, ...storedConfig } : DEFAULT_CONFIG;
    const cold = (await redis.hgetall(COLD_KEY)) || {};
    const dead = (await redis.hgetall(DEAD_KEY)) || {};

    // Hand placements from the cockpit drag board: id -> { s, ts }. Entries that
    // fail to parse are skipped rather than breaking the payload.
    const stagemapRaw = (await redis.hgetall(STAGEMAP_KEY)) || {};
    const stagemap = {};
    for (const [id, value] of Object.entries(stagemapRaw)) {
      const v = parseStored(value);
      if (v && Number.isInteger(v.s) && Number.isFinite(v.ts)) stagemap[id] = v;
    }

    // Motivation notes: id -> plain text. Values coerced to strings (Upstash
    // auto-parses anything JSON-shaped, including bare numbers).
    const motivationRaw = (await redis.hgetall(MOTIVATION_KEY)) || {};
    const motivation = {};
    for (const [id, value] of Object.entries(motivationRaw)) {
      if (value != null) motivation[id] = String(value);
    }

    return jsonResponse(res, 200, { list, logs, followUps, soi, pinned, manual, rac, stages, config, cold, dead, stagemap, motivation });
  } catch (err) {
    console.error("[prospects] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
