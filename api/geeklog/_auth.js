// Session and token helpers for the Geek Log auth gate. Helper module (leading
// underscore), not a serverless function; the function count does not change.
//
// Session token: base64url(payload).base64url(hmac-sha256(payload)) signed
// with GEEKLOG_SESSION_SECRET. Payload is { iat, exp } only; there is one
// user. Cookie path is /api as an approved deviation: the Geek Log API spans
// /api/geeklog and /api/prospects, the cookie is HttpOnly, and the public
// rates endpoint never reads cookies. Page loads never carry it.

import crypto from "node:crypto";

export const COOKIE_NAME = "gl_session";
export const COOKIE_PATH = "/api";
export const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
export const RENEW_UNDER_MS = 15 * 24 * 60 * 60 * 1000;

const b64u = (buf) => Buffer.from(buf).toString("base64url");
const sign = (payload, secret) => crypto.createHmac("sha256", secret).update(payload).digest();

export function issueSession() {
  const secret = process.env.GEEKLOG_SESSION_SECRET;
  if (!secret) return null;
  const iat = Date.now();
  const payload = b64u(JSON.stringify({ iat, exp: iat + SESSION_MS }));
  return `${payload}.${b64u(sign(payload, secret))}`;
}

export function verifySession(token) {
  const secret = process.env.GEEKLOG_SESSION_SECRET;
  if (!secret || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  let given;
  try { given = Buffer.from(token.slice(dot + 1), "base64url"); } catch { return null; }
  const expected = sign(payload, secret);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  let data;
  try { data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { return null; }
  if (!data || !Number.isFinite(data.exp) || Date.now() >= data.exp) return null;
  return data;
}

// Constant-time string compare: sha256 both sides first so lengths always
// match and timingSafeEqual never throws.
export function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a || ""), "utf8").digest();
  const hb = crypto.createHash("sha256").update(String(b || ""), "utf8").digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function readCookie(req, name = COOKIE_NAME) {
  const raw = req.headers?.cookie || "";
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

export function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=${COOKIE_PATH}; Max-Age=${Math.floor(SESSION_MS / 1000)}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=${COOKIE_PATH}; Max-Age=0`;
}

// Bearer classification for the two machine tokens: the Scriptable device
// token and the nightly export token. "bad" means a Bearer header was sent
// but matches neither; callers turn a valid token on a disallowed endpoint
// into 403 and a bad token into 401.
export function bearerStatus(req) {
  const h = req.headers?.authorization || "";
  if (!h.startsWith("Bearer ")) return "none";
  const t = h.slice(7);
  if (process.env.GEEKLOG_DEVICE_TOKEN && safeEqual(t, process.env.GEEKLOG_DEVICE_TOKEN)) return "device";
  if (process.env.GEEKLOG_EXPORT_TOKEN && safeEqual(t, process.env.GEEKLOG_EXPORT_TOKEN)) return "export";
  return "bad";
}
