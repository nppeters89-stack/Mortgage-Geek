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
const WHALE_SET = "prospects:whale";
const FIRE_SET = "prospects:fire";
const ADDED_KEY = "prospects:addedat";
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
const DEFAULT_CONFIG = { weekTarget: 15, touchOverdueDays: 21, refQuietDays: 90 };

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  try {
    // Every Upstash REST call is a full HTTP round trip, so serializing these
    // reads was most of this endpoint's latency. Wave 1 fires every independent
    // read at once; wave 2 holds the two MGETs that need their SMEMBERS first.
    const [
      listRaw, loggedIdsRaw, fuIdsRaw, soiRaw, pinnedRaw, racRaw, whaleRaw, fireRaw,
      manualHash, storedStagesRaw, storedConfigRaw, coldRaw, deadRaw, stagemapHash, motivationHash, addedatHash,
    ] = await Promise.all([
      redis.get(LIST_KEY),
      redis.smembers(LOGGED_SET),
      redis.smembers(FU_SET),
      redis.hgetall(SOI_KEY),
      redis.smembers(PINNED_SET),
      redis.smembers(RAC_SET),
      redis.smembers(WHALE_SET),
      redis.smembers(FIRE_SET),
      redis.hgetall(MANUAL_KEY),
      redis.get(STAGES_KEY),
      redis.get(CONFIG_KEY),
      redis.hgetall(COLD_KEY),
      redis.hgetall(DEAD_KEY),
      redis.hgetall(STAGEMAP_KEY),
      redis.hgetall(MOTIVATION_KEY),
      redis.hgetall(ADDED_KEY),
    ]);

    const list = parseStored(listRaw) || { version: 1, generated: null, source: null, prospects: [] };

    const ids = toIds(loggedIdsRaw);
    const fuIds = toIds(fuIdsRaw);
    const [logValues, fuValues] = await Promise.all([
      ids.length ? redis.mget(...ids.map(logKey)) : [],
      fuIds.length ? redis.mget(...fuIds.map(fuKey)) : [],
    ]);

    const logs = {};
    ids.forEach((id, i) => {
      const v = parseStored(logValues[i]);
      if (v) logs[id] = v;
    });

    // Follow-up touch histories, keyed by the same phone-digits id. Membership is
    // derived (score >= 9) client-side, so this only carries histories that exist.
    const followUps = {};
    fuIds.forEach((id, i) => {
      const v = parseStored(fuValues[i]);
      if (Array.isArray(v)) followUps[id] = v;
    });

    // SOI membership: id -> promotion timestamp. Stored, not derived, because
    // promoting is a manual decision. Values come back as strings; the client
    // coerces.
    const soi = soiRaw || {};

    // These are compared with Set.has() client-side rather than used as object
    // keys, so the string coercion above is what makes them work at all.
    const pinned = toIds(pinnedRaw);
    const rac = toIds(racRaw);
    const whale = toIds(whaleRaw);
    const fire = toIds(fireRaw);

    // Manual contacts are stored as JSON strings in one hash. A record that fails
    // to parse is skipped rather than breaking the whole payload.
    const manualRaw = manualHash || {};
    const manual = {};
    for (const [id, value] of Object.entries(manualRaw)) {
      const v = parseStored(value);
      if (v && typeof v === "object") manual[id] = v;
    }

    // Follow Up cockpit state. stages/config fall back to defaults when unset;
    // cold/dead are id -> timestamp hashes, empty when nobody has been moved yet.
    const storedStages = parseStored(storedStagesRaw);
    const stages = Array.isArray(storedStages) && storedStages.length ? storedStages : DEFAULT_STAGES;
    const storedConfig = parseStored(storedConfigRaw);
    const config = storedConfig && typeof storedConfig === "object" ? { ...DEFAULT_CONFIG, ...storedConfig } : DEFAULT_CONFIG;
    const cold = coldRaw || {};
    const dead = deadRaw || {};

    // Hand placements from the cockpit drag board: id -> { s, ts }. Entries that
    // fail to parse are skipped rather than breaking the payload.
    const stagemapRaw = stagemapHash || {};
    const stagemap = {};
    for (const [id, value] of Object.entries(stagemapRaw)) {
      const v = parseStored(value);
      if (v && Number.isInteger(v.s) && Number.isFinite(v.ts)) stagemap[id] = v;
    }

    // Motivation notes: id -> plain text. Values coerced to strings (Upstash
    // auto-parses anything JSON-shaped, including bare numbers).
    const motivationRaw = motivationHash || {};
    const motivation = {};
    for (const [id, value] of Object.entries(motivationRaw)) {
      if (value != null) motivation[id] = String(value);
    }

    return jsonResponse(res, 200, { list, logs, followUps, soi, pinned, manual, rac, stages, config, cold, dead, stagemap, motivation, whale, fire, addedat: addedatHash || {} });
  } catch (err) {
    console.error("[prospects] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
