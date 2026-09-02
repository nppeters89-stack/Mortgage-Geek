// PUT /api/prospects/log — upsert one contact's call log.
//
// Body { id, log } where id = phone digits and log = { outcome, score, note,
// callback, dateCalled, ts }. SETs prospects:log:{id} and SADDs the id to
// prospects:logged so /api/prospects can MGET every log without a SCAN. Last
// write wins. Payload is tiny so it works with keepalive:true on the client
// (the write survives the phone locking right after Save).

import { OBJECTION_IDS } from "./_chips.js";
import { redis, requireKey, jsonResponse, isValidISODate } from "../geeklog/_redis.js";

const LOGGED_SET = "prospects:logged";
const logKey = (id) => `prospects:log:${id}`;

const OUTCOMES = new Set(["Talked", "Voicemail", "No answer", "Callback", "Bad number", "Do not call", ""]);

function validate(body) {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  if (typeof body.id !== "string" || !/^\d{7,}$/.test(body.id)) return "id must be phone digits";
  const log = body.log;
  if (!log || typeof log !== "object") return "log must be an object";
  if (typeof log.outcome !== "string" || !OUTCOMES.has(log.outcome)) return "invalid outcome";
  if (log.score != null && !(Number.isInteger(log.score) && log.score >= 1 && log.score <= 10)) return "score must be 1-10 or null";
  if (log.note != null && typeof log.note !== "string") return "note must be a string";
  if (log.note && log.note.length > 2000) return "note too long";
  if (log.callback && !isValidISODate(log.callback)) return "callback must be an ISO date";
  if (log.dateCalled && !isValidISODate(log.dateCalled)) return "dateCalled must be an ISO date";
  if (log.ts != null && !Number.isFinite(log.ts)) return "ts must be a number";
  if (log.objections != null && (!Array.isArray(log.objections) || log.objections.length > 10 || log.objections.some((x) => !OBJECTION_IDS.has(x)))) return "objections must be known objection ids";
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

    const { id, log } = req.body;
    const record = {
      outcome: log.outcome || "",
      score: log.score ?? null,
      note: typeof log.note === "string" ? log.note : "",
      callback: log.callback || "",
      dateCalled: log.dateCalled || "",
      // A log without a ts stays without one (stored null): it represents a
      // conversation whose date is unknown - a hand-added contact scored after
      // the fact - and must not read as activity on the day it was typed in.
      ts: Number.isFinite(log.ts) ? log.ts : null,
    };
    if (Array.isArray(log.objections) && log.objections.length) record.objections = log.objections.filter((x) => OBJECTION_IDS.has(x));

    await redis.set(logKey(id), JSON.stringify(record));
    await redis.sadd(LOGGED_SET, id);

    return jsonResponse(res, 200, { id, log: record });
  } catch (err) {
    console.error("[prospects/log] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
