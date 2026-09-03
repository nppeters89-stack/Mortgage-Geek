// /api/geeklog/closing — append-only log of closings per ISO date inside
// per-year Redis hashes: geeklog:closings:YYYY. Each field's value is a
// JSON array of ClosingRecord objects so the same date can hold multiple
// closings.

import { authorize, redis, requireKey, jsonResponse, isValidISODate, isValidYear, parseStored } from "./_redis.js";

const hashKey = (year) => `geeklog:closings:${year}`;

function validateClosingBody(body) {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  if (!isValidISODate(body.date)) return "date must be a valid ISO date (YYYY-MM-DD)";
  for (const [f, max] of [["borrower", 60], ["loanType", 30], ["note", 200]]) {
    if (typeof body[f] !== "string") return `${f} must be a string`;
    if (body[f].length > max) return `${f} must be ${max} characters or fewer`;
  }
  return null;
}

export default async function handler(req, res) {
  const auth = authorize(req, res, { exportRead: true });
  if (!auth.ok) return jsonResponse(res, auth.status, { error: auth.status === 403 ? "Forbidden" : "Unauthorized" });

  try {
    if (req.method === "GET") {
      const { year } = req.query || {};
      if (!isValidYear(year)) return jsonResponse(res, 400, { error: "Invalid or missing year" });
      const all = (await redis.hgetall(hashKey(year))) || {};
      const out = {};
      for (const [k, v] of Object.entries(all)) out[k] = parseStored(v);
      return jsonResponse(res, 200, out);
    }

    if (req.method === "POST") {
      const body = req.body;
      const err = validateClosingBody(body);
      if (err) return jsonResponse(res, 400, { error: err });
      const year = body.date.slice(0, 4);
      const existing = parseStored(await redis.hget(hashKey(year), body.date)) || [];
      const next = [
        ...existing,
        { date: body.date, borrower: body.borrower, loanType: body.loanType, note: body.note },
      ];
      await redis.hset(hashKey(year), { [body.date]: JSON.stringify(next) });
      return jsonResponse(res, 201, next);
    }

    if (req.method === "DELETE") {
      const body = req.body;
      if (!body || !isValidISODate(body.date)) return jsonResponse(res, 400, { error: "Invalid date" });
      if (!Number.isInteger(body.index) || body.index < 0) {
        return jsonResponse(res, 400, { error: "index must be a non-negative integer" });
      }
      const year = body.date.slice(0, 4);
      const existing = parseStored(await redis.hget(hashKey(year), body.date)) || [];
      if (body.index >= existing.length) {
        return jsonResponse(res, 400, { error: "index out of range" });
      }
      const next = existing.slice(0, body.index).concat(existing.slice(body.index + 1));
      if (next.length === 0) {
        await redis.hdel(hashKey(year), body.date);
      } else {
        await redis.hset(hashKey(year), { [body.date]: JSON.stringify(next) });
      }
      return jsonResponse(res, 200, next);
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  } catch (err) {
    console.error("[geeklog/closing] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
