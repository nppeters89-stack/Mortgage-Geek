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

// The per-day activity counters, in canonical order, grouped by pillar:
// Conversations, Appointments, Content, then Events. Counters are only ever
// appended, never reordered or removed, so older stored docs that predate a
// counter simply lack it and normalizeDoc backfills it to 0 (currentSoi,
// networking, and sponsored were all added this way).
export const COUNTERS = ["pastClient", "lead", "inProcess", "prospecting", "currentSoi", "preApproval", "realtor", "reel", "static", "networking", "sponsored"];

export const DEFAULT_WEEKLY_TARGET = 50;
export const MAX_WEEKLY_TARGET = 500;

// Reward layer: tracking began this Sunday, and a "streak" day needs at least
// this many conversations. Both are shared so client and server agree.
export const TRACKING_EPOCH = "2026-07-19";
export const STREAK_FLOOR = 3;

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

// dateKey shifted by n calendar days (date-only UTC math; DST-irrelevant).
export function addDays(dateKey, n) {
  return utcDateKey(dateOnlyMs(dateKey) + n * 86400000);
}

// Every Sunday week-start key from fromWeek through toWeek, inclusive.
export function weekStartsBetween(fromWeek, toWeek) {
  const out = [];
  for (let w = fromWeek; w <= toWeek; w = addDays(w, 7)) out.push(w);
  return out;
}

// The write window: a date is writable only if it falls in the current week,
// from that week's Sunday through today inclusive (prior weeks and future
// days are read-only). Lexicographic compare is valid for YYYY-MM-DD.
export function isWritableDate(dateKey, todayKey) {
  const start = weekStartFor(todayKey);
  return dateKey >= start && dateKey <= todayKey;
}

// The correction window: the deliberately narrow escape hatch for backdated
// edits from the Settings correction form. A date is correctable if it falls in
// the current calendar year, from the tracking epoch through today. Future dates
// are never writable. The ordinary upsert path stays locked to the current week
// (isWritableDate); only the explicit ?correction=1 path uses this wider window,
// so history cannot be rewritten arbitrarily and normal logging is unaffected.
export function isCorrectableDate(dateKey, todayKey) {
  return dateKey >= TRACKING_EPOCH
    && dateKey.slice(0, 4) === todayKey.slice(0, 4)
    && dateKey <= todayKey;
}

// A fresh counter document, all zeros.
export function emptyDoc() {
  const doc = {};
  for (const k of COUNTERS) doc[k] = 0;
  return doc;
}

// Coerce a stored (possibly null / partial) value into a full counter
// document, filling missing or invalid counters with 0.
export function normalizeDoc(raw) {
  const doc = emptyDoc();
  if (raw && typeof raw === "object") {
    for (const k of COUNTERS) if (Number.isInteger(raw[k]) && raw[k] >= 0) doc[k] = raw[k];
  }
  return doc;
}

// Validate a POST-day body's counters: every counter that IS present must be a
// non-negative integer, and no fields beyond `date` + the counters are allowed.
// A missing counter is not an error: it defaults to 0 in the handler, so an
// older client that predates a newly added counter can still write. Returns an
// error string, or null when valid. (Date format / write-window are checked by
// the endpoint.)
export function validateDayBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "body must be a JSON object";
  const allowed = new Set(["date", ...COUNTERS]);
  for (const k of Object.keys(body)) if (!allowed.has(k)) return `unexpected field: ${k}`;
  for (const k of COUNTERS) {
    if (body[k] === undefined) continue; // missing counter defaults to 0 (forward-compatible with older clients)
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

// Pillar sums over a (normalized) counter document.
export const sumConversations = (doc) => doc.pastClient + (doc.lead || 0) + doc.inProcess + doc.prospecting + doc.currentSoi;
export const sumAppointments = (doc) => doc.preApproval + doc.realtor;
export const sumContent = (doc) => doc.reel + doc.static;
export const sumEvents = (doc) => doc.networking + doc.sponsored;
