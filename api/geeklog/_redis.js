// Shared module for /api/geeklog/* endpoints. The leading underscore
// keeps Vercel from routing this file as a serverless function.
//
// Responsibilities:
//   - configured @upstash/redis client (REST over the GEEKLOG_KV_*
//     env vars provisioned by the Upstash integration)
//   - constant-time auth helper (X-Geeklog-Key header vs GEEKLOG_KEY)
//   - small JSON response helper
//   - input validators reused across endpoints

import { Redis } from "@upstash/redis";
import { timingSafeEqual } from "crypto";

export const redis = new Redis({
  url: process.env.GEEKLOG_KV_REST_API_URL,
  token: process.env.GEEKLOG_KV_REST_API_TOKEN,
});

// Constant-time comparison of the X-Geeklog-Key header against the
// GEEKLOG_KEY env var. Returns false if the env var is missing so the
// endpoint fails closed if Vercel hasn't been configured yet.
export function requireKey(req) {
  const expected = process.env.GEEKLOG_KEY;
  const provided = req.headers?.["x-geeklog-key"];
  if (!expected || typeof provided !== "string") return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  // timingSafeEqual throws on length mismatch; length is not secret here.
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function jsonResponse(res, status, body) {
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(JSON.stringify(body));
}

// "2026-05-21" → true. Also requires the date to round-trip (so
// "2026-02-30" rejects). Anything else → false.
export function isValidISODate(str) {
  if (typeof str !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

// "2026" → true; anything outside 2020-2099 or non-4-digit → false.
export function isValidYear(str) {
  if (typeof str !== "string" || !/^\d{4}$/.test(str)) return false;
  const n = parseInt(str, 10);
  return n >= 2020 && n <= 2099;
}

// The @upstash/redis SDK auto-deserializes values it recognizes as
// JSON, but returns raw strings for opaque payloads. Tolerate both so
// callers always get back the parsed object/array (or null if missing).
export function parseStored(raw) {
  if (raw == null) return null;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
