// Shared, dependency-free helpers for the Geek Log activity endpoints
// (/api/geeklog/activity and /api/geeklog/settings). The leading underscore
// keeps Vercel from routing this file as a serverless function, matching
// _redis.js.
//
// All date logic operates on America/Chicago CALENDAR-DATE STRINGS. The only
// timezone conversion (an instant -> Chicago Y/M/D) goes through
// Intl.DateTimeFormat; week math is then pure calendar arithmetic on UTC
// date-only anchors, so nothing does wall-clock math across a DST transition
// and every result is deterministic. No npm dependencies.

// The seven per-day activity counters, in canonical order.
export const COUNTERS = ["pastClient", "inProcess", "prospecting", "preApproval", "realtor", "reel", "static"];

export const DEFAULT_WEEKLY_TARGET = 50;
export const MAX_WEEKLY_TARGET = 500;

// Redis keys. Distinct namespaces from closings/entries/goal (all per-year):
// activity is per-day, settings is a singleton. Cannot collide.
export const activityKey = (dateKey) => `geeklog:activity:${dateKey}`;
export const SETTINGS_KEY = "geeklog:settings";

const CHICAGO_PARTS = { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" };
const chicagoFmt = new Intl.DateTimeFormat("en-US", CHICAGO_PARTS);

// YYYY-MM-DD for a calendar date at midnight-UTC ms (pure, no timezone).
function utcDateKey(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// Midnight-UTC ms for a YYYY-MM-DD date key (a date-only anchor).
function dateOnlyMs(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// The America/Chicago calendar date (YYYY-MM-DD) for an instant. Accepts a
// Date, an epoch ms number, or an ISO string; defaults to now.
export function centralDateKey(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const parts = chicagoFmt.formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// The Sunday (YYYY-MM-DD) that starts the Central week containing dateKey.
// A Sunday is its own week start. Date-only UTC math -> DST-irrelevant.
export function weekStartFor(dateKey) {
  const ms = dateOnlyMs(dateKey);
  const dow = new Date(ms).getUTCDay(); // 0=Sun .. 6=Sat
  return utcDateKey(ms - dow * 86400000);
}

// The seven day keys (Sun..Sat) of the week starting at weekStartKey.
export function weekDayKeys(weekStartKey) {
  const base = dateOnlyMs(weekStartKey);
  return Array.from({ length: 7 }, (_, i) => utcDateKey(base + i * 86400000));
}

// The write window: a date is writable only if it falls in the current week,
// from that week's Sunday through today inclusive (prior weeks and future
// days are read-only). Lexicographic compare is valid for YYYY-MM-DD.
export function isWritableDate(dateKey, todayKey) {
  const start = weekStartFor(todayKey);
  return dateKey >= start && dateKey <= todayKey;
}

// A fresh seven-counter document, all zeros.
export function emptyDoc() {
  const doc = {};
  for (const k of COUNTERS) doc[k] = 0;
  return doc;
}

// Coerce a stored (possibly null / partial) value into a full seven-counter
// document, filling missing or invalid counters with 0.
export function normalizeDoc(raw) {
  const doc = emptyDoc();
  if (raw && typeof raw === "object") {
    for (const k of COUNTERS) if (Number.isInteger(raw[k]) && raw[k] >= 0) doc[k] = raw[k];
  }
  return doc;
}

// Validate a POST-day body's counters: all seven present, each a non-negative
// integer, and no fields beyond `date` + the seven counters. Returns an error
// string, or null when valid. (Date format / write-window are checked by the
// endpoint.)
export function validateDayBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "body must be a JSON object";
  const allowed = new Set(["date", ...COUNTERS]);
  for (const k of Object.keys(body)) if (!allowed.has(k)) return `unexpected field: ${k}`;
  for (const k of COUNTERS) {
    const v = body[k];
    if (!Number.isInteger(v) || v < 0) return `${k} must be a non-negative integer`;
  }
  return null;
}

// Validate a weeklyTarget: positive integer, capped at MAX_WEEKLY_TARGET.
export function validateWeeklyTarget(v) {
  if (!Number.isInteger(v) || v <= 0) return "weeklyTarget must be a positive integer";
  if (v > MAX_WEEKLY_TARGET) return `weeklyTarget must be ${MAX_WEEKLY_TARGET} or fewer`;
  return null;
}

// Pillar sums over a (normalized) seven-counter document.
export const sumConversations = (doc) => doc.pastClient + doc.inProcess + doc.prospecting;
export const sumAppointments = (doc) => doc.preApproval + doc.realtor;
export const sumContent = (doc) => doc.reel + doc.static;
