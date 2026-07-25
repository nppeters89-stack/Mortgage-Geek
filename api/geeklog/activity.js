// /api/geeklog/activity — the weekly activity tracker.
//   GET  ?date=YYYY-MM-DD (optional; default today Central) -> one week:
//        { weekStart, days: [{ date, ...seven counters }] x7, weeklyTarget }.
//   POST { date, ...seven counters } -> upsert one day (last-write-wins),
//        accepted only for dates inside the current Central week.
// One Redis STRING key per day: geeklog:activity:YYYY-MM-DD. Reuses the shared
// auth + client from _redis.js. Does not read or write any closings key.

import { redis, requireKey, jsonResponse, isValidISODate, parseStored } from "./_redis.js";
import {
  COUNTERS,
  DEFAULT_WEEKLY_TARGET,
  SETTINGS_KEY,
  activityKey,
  centralDateKey,
  weekStartFor,
  weekDayKeys,
  isWritableDate,
  normalizeDoc,
  validateDayBody,
} from "./_activity.js";

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const { date } = req.query || {};
      if (date && !isValidISODate(date)) return jsonResponse(res, 400, { error: "Invalid date" });
      const anchor = date || centralDateKey();
      const weekStart = weekStartFor(anchor);
      const dayKeys = weekDayKeys(weekStart);

      // Seven day strings + settings in a single round trip.
      const raw = await redis.mget(...dayKeys.map(activityKey), SETTINGS_KEY);
      const settings = parseStored(raw[7]);
      const weeklyTarget = Number.isInteger(settings?.weeklyTarget) ? settings.weeklyTarget : DEFAULT_WEEKLY_TARGET;
      const days = dayKeys.map((dk, i) => ({ date: dk, ...normalizeDoc(parseStored(raw[i])) }));

      return jsonResponse(res, 200, { weekStart, days, weeklyTarget });
    }

    if (req.method === "POST") {
      const body = req.body;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return jsonResponse(res, 400, { error: "body must be a JSON object" });
      }
      if (!isValidISODate(body.date)) {
        return jsonResponse(res, 400, { error: "date must be a valid ISO date (YYYY-MM-DD)" });
      }
      const today = centralDateKey();
      if (!isWritableDate(body.date, today)) {
        return jsonResponse(res, 400, {
          error: `Writes are only accepted for the current week: Sunday ${weekStartFor(today)} through today ${today}, inclusive. Prior weeks are read-only.`,
        });
      }
      const err = validateDayBody(body);
      if (err) return jsonResponse(res, 400, { error: err });

      const doc = {};
      for (const k of COUNTERS) doc[k] = body[k];
      await redis.set(activityKey(body.date), JSON.stringify(doc));
      return jsonResponse(res, 200, { date: body.date, ...doc });
    }

    res.setHeader("Allow", "GET, POST");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  } catch (err) {
    console.error("[geeklog/activity] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
