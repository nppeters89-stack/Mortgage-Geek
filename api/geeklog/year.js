// /api/geeklog/year — aggregate stats for a given year + goal scalar
// read/write. Goal lives at geeklog:goal:YYYY (Redis string), separate
// from the entries / closings hashes that the other endpoints manage.

import { redis, requireKey, jsonResponse, isValidYear, parseStored } from "./_redis.js";

const goalKey = (year) => `geeklog:goal:${year}`;
const entriesKey = (year) => `geeklog:entries:${year}`;
const closingsKey = (year) => `geeklog:closings:${year}`;

// Day-of-year for "today" in America/Chicago. Avoids naive UTC math by
// extracting Y/M/D in Chicago via Intl, then doing the diff in UTC ms.
function chicagoDayOfYear() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const y = parseInt(parts.find((p) => p.type === "year").value, 10);
  const m = parseInt(parts.find((p) => p.type === "month").value, 10);
  const d = parseInt(parts.find((p) => p.type === "day").value, 10);
  const jan1 = Date.UTC(y, 0, 1);
  const today = Date.UTC(y, m - 1, d);
  return Math.round((today - jan1) / 86400000) + 1;
}

export default async function handler(req, res) {
  if (!requireKey(req)) return jsonResponse(res, 401, { error: "Unauthorized" });

  try {
    const { year } = req.query || {};
    if (!isValidYear(year)) return jsonResponse(res, 400, { error: "Invalid or missing year" });
    const yearNum = parseInt(year, 10);

    if (req.method === "GET") {
      const [goalRaw, entriesCount, closingsAll] = await Promise.all([
        redis.get(goalKey(year)),
        redis.hlen(entriesKey(year)),
        redis.hgetall(closingsKey(year)),
      ]);
      const goal = parseStored(goalRaw) ?? { target: 100, year: yearNum };
      let closingsCount = 0;
      for (const v of Object.values(closingsAll || {})) {
        const arr = parseStored(v);
        if (Array.isArray(arr)) closingsCount += arr.length;
      }
      return jsonResponse(res, 200, {
        year: yearNum,
        goal,
        closingsCount,
        entriesCount: entriesCount || 0,
        daysIntoYear: chicagoDayOfYear(),
      });
    }

    if (req.method === "POST") {
      const body = req.body;
      if (!body || !Number.isInteger(body.target) || body.target < 0) {
        return jsonResponse(res, 400, { error: "target must be a non-negative integer" });
      }
      const goal = { target: body.target, year: yearNum };
      await redis.set(goalKey(year), JSON.stringify(goal));
      return jsonResponse(res, 200, goal);
    }

    res.setHeader("Allow", "GET, POST");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  } catch (err) {
    console.error("[geeklog/year] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
