// Shared module for /api/geeklog/* endpoints. The leading underscore
// keeps Vercel from routing this file as a serverless function.
//
// Responsibilities:
//   - configured @upstash/redis client (REST over the GEEKLOG_KV_*
//     env vars provisioned by the Upstash integration)
//   - constant-time auth helper (gl_session cookie header vs GEEKLOG_KEY)
//   - small JSON response helper
//   - input validators reused across endpoints

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.GEEKLOG_KV_REST_API_URL,
  token: process.env.GEEKLOG_KV_REST_API_TOKEN,
});

import { verifySession, issueSession, readCookie, sessionCookie, bearerStatus, RENEW_UNDER_MS } from "./_auth.js";

// Session gate, replacing the retired gl_session cookie check. The name is kept
// so every handler's import keeps working. Sliding expiry: when a valid
// session has under 15 days remaining, the response re-issues a fresh 30 day
// cookie.
export function requireKey(req, res) {
  const sess = verifySession(readCookie(req));
  if (!sess) return false;
  if (res && sess.exp - Date.now() < RENEW_UNDER_MS) {
    const fresh = issueSession();
    if (fresh) res.setHeader("Set-Cookie", sessionCookie(fresh));
  }
  return true;
}

// Session, or a machine bearer token where the endpoint allows it: the device
// token for the widget read, the export token for the nightly backup reads.
// A valid token on a disallowed endpoint or method is 403; anything else 401.
export function authorize(req, res, { deviceRead = false, exportRead = false } = {}) {
  if (requireKey(req, res)) return { ok: true };
  const b = bearerStatus(req);
  if (b === "device" && deviceRead && req.method === "GET") return { ok: true };
  if (b === "export" && exportRead && req.method === "GET") return { ok: true };
  if (b === "device" || b === "export") return { ok: false, status: 403 };
  return { ok: false, status: 401 };
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
