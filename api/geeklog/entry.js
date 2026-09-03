// /api/geeklog/entry — CRUD over EntryRecord objects keyed by ISO date
// inside per-year Redis hashes: geeklog:entries:YYYY.

import { authorize, redis, requireKey, jsonResponse, isValidISODate, isValidYear, parseStored } from "./_redis.js";

const hashKey = (year) => `geeklog:entries:${year}`;

function validateEntryBody(body) {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  if (!isValidISODate(body.date)) return "date must be a valid ISO date (YYYY-MM-DD)";
  for (const f of ["applications", "prospecting", "appointments", "contentShipped"]) {
    const v = body[f];
    if (!Number.isInteger(v) || v < 0) return `${f} must be a non-negative integer`;
  }
  if (typeof body.headline !== "string") return "headline must be a string";
  if (body.headline.length > 80) return "headline must be 80 characters or fewer";
  return null;
}

export default async function handler(req, res) {
  const auth = authorize(req, res, { exportRead: true });
  if (!auth.ok) return jsonResponse(res, auth.status, { error: auth.status === 403 ? "Forbidden" : "Unauthorized" });

  try {
    if (req.method === "GET") {
      const { date, year } = req.query || {};
      if (date) {
        if (!isValidISODate(date)) return jsonResponse(res, 400, { error: "Invalid date" });
        const y = date.slice(0, 4);
        const raw = await redis.hget(hashKey(y), date);
        return jsonResponse(res, 200, parseStored(raw));
      }
      if (year) {
        if (!isValidYear(year)) return jsonResponse(res, 400, { error: "Invalid year" });
        const all = (await redis.hgetall(hashKey(year))) || {};
        const out = {};
        for (const [k, v] of Object.entries(all)) out[k] = parseStored(v);
        return jsonResponse(res, 200, out);
      }
      return jsonResponse(res, 400, { error: "Must provide ?date= or ?year=" });
    }

    if (req.method === "POST") {
      const body = req.body;
      const err = validateEntryBody(body);
      if (err) return jsonResponse(res, 400, { error: err });
      const year = body.date.slice(0, 4);
      const existing = parseStored(await redis.hget(hashKey(year), body.date));
      const now = Date.now();
      const record = {
        date: body.date,
        applications: body.applications,
        prospecting: body.prospecting,
        appointments: body.appointments,
        contentShipped: body.contentShipped,
        headline: body.headline,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await redis.hset(hashKey(year), { [body.date]: JSON.stringify(record) });
      return jsonResponse(res, existing ? 200 : 201, record);
    }

    if (req.method === "DELETE") {
      const { date } = req.query || {};
      if (!isValidISODate(date)) return jsonResponse(res, 400, { error: "Invalid date" });
      const year = date.slice(0, 4);
      await redis.hdel(hashKey(year), date);
      res.status(204).end();
      return;
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  } catch (err) {
    console.error("[geeklog/entry] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
