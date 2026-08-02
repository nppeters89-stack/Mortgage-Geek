// /api/geeklog/activity — the weekly activity tracker.
//   GET  ?date=YYYY-MM-DD (optional; default today Central) -> one week:
//        { weekStart, days: [{ date, ...seven counters }] x7, weeklyTarget }.
//   POST { date, ...seven counters } -> upsert one day (last-write-wins),
//        accepted only for dates inside the current Central week.
// One Redis STRING key per day: geeklog:activity:YYYY-MM-DD. Reuses the shared
// auth + client from _redis.js. Does not read or write any closings key.

import { redis, requireKey, jsonResponse, isValidISODate, isValidYear, parseStored } from "./_redis.js";
import {
  COUNTERS,
  DEFAULT_WEEKLY_TARGET,
  SETTINGS_KEY,
  TRACKING_EPOCH,
  STREAK_FLOOR,
  activityKey,
  centralDateKey,
  weekStartFor,
  weekDayKeys,
  weekStartsBetween,
  addDays,
  isWritableDate,
  isCorrectableDate,
  emptyDoc,
  normalizeDoc,
  sumConversations,
  validateDayBody,
} from "./_activity.js";

const ACTIVITY_PREFIX = "geeklog:activity:";

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const { date, year, scope } = req.query || {};

      // Stats mode: the reward-layer read. Enumerates every day from the
      // tracking epoch through today Central (bounded and cheap at one user),
      // and returns best day, streak, and last week. Reads only activity keys.
      if (scope === "stats") {
        const todayKey = centralDateKey();
        const dayKeys = [];
        for (let d = TRACKING_EPOCH; d <= todayKey; d = addDays(d, 1)) dayKeys.push(d);
        const raw = dayKeys.length ? await redis.mget(...dayKeys.map(activityKey)) : [];
        const conv = {};
        dayKeys.forEach((dk, i) => { conv[dk] = sumConversations(normalizeDoc(parseStored(raw[i]))); });

        // Best single day ever, excluding today.
        let bestDay = { date: null, count: 0 };
        for (const dk of dayKeys) {
          if (dk !== todayKey && conv[dk] > bestDay.count) bestDay = { date: dk, count: conv[dk] };
        }

        // Streak: consecutive days >= STREAK_FLOOR ending yesterday; today adds
        // one only once it reaches the floor (a low today never breaks it).
        let streakBase = 0;
        for (let d = addDays(todayKey, -1); d >= TRACKING_EPOCH && (conv[d] || 0) >= STREAK_FLOOR; d = addDays(d, -1)) streakBase++;
        const currentStreak = streakBase + ((conv[todayKey] || 0) >= STREAK_FLOOR ? 1 : 0);

        // Prior week's seven day documents (for pace + the Sunday recap).
        const lastWeekStart = addDays(weekStartFor(todayKey), -7);
        const lwKeys = weekDayKeys(lastWeekStart);
        const lwRaw = await redis.mget(...lwKeys.map(activityKey));
        const lastWeek = { weekStart: lastWeekStart, days: lwKeys.map((dk, i) => ({ date: dk, ...normalizeDoc(parseStored(lwRaw[i])) })) };

        return jsonResponse(res, 200, { todayKey, bestDay, currentStreak, streakBase, lastWeek });
      }

      // Year (YTD) mode: weekly counter totals for every Central week from the
      // first week with data through the current week (zero-filled gaps). Drives
      // the YTD chart. Reads only activity keys; closings are untouched.
      if (year !== undefined) {
        if (!isValidYear(year)) return jsonResponse(res, 400, { error: "Invalid year" });
        const keys = await redis.keys(`${ACTIVITY_PREFIX}${year}-*`);
        const buckets = {};
        let firstWeek = null;
        if (keys.length) {
          const docs = await redis.mget(...keys);
          keys.forEach((k, i) => {
            const dateKey = k.slice(ACTIVITY_PREFIX.length);
            const doc = normalizeDoc(parseStored(docs[i]));
            const ws = weekStartFor(dateKey);
            if (!buckets[ws]) buckets[ws] = emptyDoc();
            for (const c of COUNTERS) buckets[ws][c] += doc[c];
            if (firstWeek === null || ws < firstWeek) firstWeek = ws;
          });
        }
        const currentWeek = weekStartFor(centralDateKey());
        let weeks = [];
        if (firstWeek !== null) {
          const start = firstWeek < currentWeek ? firstWeek : currentWeek;
          weeks = weekStartsBetween(start, currentWeek).map((ws) => ({ weekStart: ws, ...(buckets[ws] || emptyDoc()) }));
        }
        return jsonResponse(res, 200, { year: Number(year), weeks });
      }

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
      // Backdated corrections (?correction=1) use the wider, still-bounded
      // correction window; every other write stays locked to the current week.
      const isCorrection = req.query?.correction === "1" || req.query?.correction === "true";
      const allowed = isCorrection ? isCorrectableDate(body.date, today) : isWritableDate(body.date, today);
      if (!allowed) {
        return jsonResponse(res, 400, {
          error: isCorrection
            ? `Corrections are only accepted for dates from ${TRACKING_EPOCH} through today ${today}, within ${today.slice(0, 4)}. Future dates are not allowed.`
            : `Writes are only accepted for the current week: Sunday ${weekStartFor(today)} through today ${today}, inclusive. Prior weeks are read-only.`,
        });
      }
      const err = validateDayBody(body);
      if (err) return jsonResponse(res, 400, { error: err });

      const doc = {};
      for (const k of COUNTERS) doc[k] = Number.isInteger(body[k]) && body[k] >= 0 ? body[k] : 0;
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
