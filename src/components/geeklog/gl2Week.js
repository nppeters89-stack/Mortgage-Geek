// Client-side America/Chicago week helpers for Geek Log 2.0. Mirrors the server
// rules in api/geeklog/_activity.js so the UI's editable window matches the
// API's write window exactly. Pure; Intl only; DST-safe (calendar-date math).

const CHICAGO = { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" };
const chicagoFmt = new Intl.DateTimeFormat("en-US", CHICAGO);

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function utcDateKey(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function dateOnlyMs(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// The America/Chicago calendar date (YYYY-MM-DD) for an instant (default now).
export function centralDateKey(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const parts = chicagoFmt.formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t).value;
  return `${g("year")}-${g("month")}-${g("day")}`;
}

// 0 = Sunday .. 6 = Saturday, for a date key.
export function dayOfWeek(dateKey) {
  return new Date(dateOnlyMs(dateKey)).getUTCDay();
}

// The Sunday (YYYY-MM-DD) starting the Central week containing dateKey.
export function weekStartFor(dateKey) {
  const ms = dateOnlyMs(dateKey);
  return utcDateKey(ms - dayOfWeek(dateKey) * 86400000);
}

// The seven day keys (Sun..Sat) of the week starting at weekStartKey.
export function weekDayKeys(weekStartKey) {
  const base = dateOnlyMs(weekStartKey);
  return Array.from({ length: 7 }, (_, i) => utcDateKey(base + i * 86400000));
}

export function addDays(dateKey, n) {
  return utcDateKey(dateOnlyMs(dateKey) + n * 86400000);
}

// Writable only inside the current Central week, from its Sunday through today.
export function isWritableDate(dateKey, todayKey) {
  return dateKey >= weekStartFor(todayKey) && dateKey <= todayKey;
}

export function weekdayName(dateKey) {
  return WEEKDAYS[dayOfWeek(dateKey)];
}

// "Jul 22"
export function monthDay(dateKey) {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// "Jul 19 to Jul 25" for the week starting at weekStartKey.
export function rangeLabel(weekStartKey) {
  return `${monthDay(weekStartKey)} to ${monthDay(addDays(weekStartKey, 6))}`;
}
