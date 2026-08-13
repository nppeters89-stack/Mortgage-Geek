// Pure helpers for the Prospecting tab: id derivation, queue sort/filter, the
// outcome vocabulary, and the Excel TSV builders. No React, no I/O.

import { T, SCORE_HEAT } from "../gl2Tokens";

// Contact id = phone digits only (matches the Redis prospects:log:{id} key and
// the server's validation).
export const idFromPhone = (phone) => String(phone || "").replace(/\D/g, "");

// tel: href keeps a leading + for international, digits otherwise.
export const dialHref = (phone) => `tel:${String(phone || "").replace(/[^0-9+]/g, "")}`;

// The six call outcomes, in the order the preview lays them out. `short` is the
// queue status pill label; `tone` picks the pill palette.
export const OUTCOMES = [
  { value: "Talked", short: "Talked", tone: "talked" },
  { value: "Voicemail", short: "VM", tone: "na" },
  { value: "No answer", short: "No ans", tone: "na" },
  { value: "Callback", short: "Callback", tone: "cb" },
  { value: "Bad number", short: "Bad #", tone: "na" },
  { value: "Do not call", short: "DNC", tone: "na" },
];

const OUTCOME_BY_VALUE = Object.fromEntries(OUTCOMES.map((o) => [o.value, o]));
export const outcomeMeta = (value) => OUTCOME_BY_VALUE[value] || null;

// Status pill palette by tone (Talked = emerald, Callback = amber, else muted).
export const PILL_TONES = {
  talked: { color: T.green, bg: "rgba(47,191,113,0.12)" },
  cb: { color: T.amber, bg: "rgba(201,162,58,0.12)" },
  na: { color: T.dim, bg: "rgba(255,254,251,0.08)" },
};

// 1-10 interaction score → heat color (red low, green high).
export const heatColor = (score) => SCORE_HEAT[Math.min(10, Math.max(1, score)) - 1];

// Intel dot shows when the enrichment note is substantial.
export const INTEL_MIN = 60;
export const hasIntelDot = (p) => typeof p.notes === "string" && p.notes.length >= INTEL_MIN;

export function isToday(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

// Queue sorted ascending by buysides (work the bottom of the list up; whales
// last). Stable: equal-buyside contacts keep the seed order.
export function sortedQueue(prospects) {
  return prospects
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (a.p.buysides - b.p.buysides) || (a.i - b.i))
    .map((x) => x.p);
}

// Apply the active chip filter and the search query. `logs` is keyed by id.
export function filterQueue(prospects, { filter, query, logs }) {
  const q = (query || "").trim().toLowerCase();
  return prospects.filter((p) => {
    const log = logs[idFromPhone(p.phone)];
    if (filter === "vip" && !hasIntelDot(p)) return false;
    if (filter === "cb" && !(log && log.outcome === "Callback")) return false;
    if (filter === "today" && !(log && log.outcome && isToday(log.ts))) return false;
    if (q && !(p.name.toLowerCase().includes(q) || (p.brokerage || "").toLowerCase().includes(q))) return false;
    return true;
  });
}

// One freeform Excel "Results" cell: outcome, note, and callback concatenated.
function resultsCell(log) {
  const parts = [];
  if (log.outcome) parts.push(log.outcome + ".");
  if (log.note) parts.push(log.note);
  if (log.callback) parts.push(`Call back ${log.callback}.`);
  return parts.join(" ").trim();
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// A single TSV row: Name, Phone, Date Called, Results, Interaction Score.
export function logTsvRow(prospect, log) {
  const date = log.dateCalled || (log.ts ? new Date(log.ts).toISOString().slice(0, 10) : todayISO());
  return [prospect.name, prospect.phone, date, resultsCell(log), log.score || ""].join("\t");
}

// Header row plus one row per logged contact (Copy log). Returns "" if none.
export function logTsvAll(prospects, logs) {
  const rows = ["Name\tPhone\tDate Called\tResults\tInteraction Score"];
  for (const p of prospects) {
    const log = logs[idFromPhone(p.phone)];
    if (log && log.outcome) rows.push(logTsvRow(p, log));
  }
  return rows.length > 1 ? rows.join("\n") : "";
}

// ----- Follow Ups (derived membership: a call scored 9 or 10) -----

const DAY_MS = 86400000;
export const FOLLOWUP_MIN_SCORE = 9;
export const STALE_DAYS = 14;

export const qualifiesForFollowUp = (log) => !!(log && log.score >= FOLLOWUP_MIN_SCORE);

// A perfect call. Both 9s and 10s qualify for follow up, but a 10 is the strongest
// buying signal in the log, so the queue features it instead of letting it sit in
// an undifferentiated list.
export const TOP_SCORE = 10;
export const isTopScore = (log) => !!(log && log.score === TOP_SCORE);

// Newest touch timestamp for a contact (0 if none).
export function lastTouchTs(touches) {
  if (!Array.isArray(touches) || !touches.length) return 0;
  return touches.reduce((m, t) => Math.max(m, t.ts || 0), 0);
}

// { label, stale } for the queue's last-touch line. Stale (amber) at zero touches
// or more than STALE_DAYS since the last touch.
export function lastTouchLabel(touches) {
  const ts = lastTouchTs(touches);
  if (!ts) return { label: "No touches yet", stale: true };
  const days = Math.floor((Date.now() - ts) / DAY_MS);
  return { label: days <= 0 ? "Today" : `${days}d ago`, stale: days > STALE_DAYS };
}

// Qualifying contacts sorted by neglect: never-touched first, then ascending by
// most-recent touch (longest since last touch at the top = the next right call).
// Stable within ties (keeps the incoming buyside order).
export function followUpQueue(prospects, logs, followUps) {
  return prospects
    .filter((p) => qualifiesForFollowUp(logs[idFromPhone(p.phone)]))
    .map((p, i) => ({ p, i, last: lastTouchTs(followUps[idFromPhone(p.phone)]) }))
    .sort((a, b) => {
      if (a.last === 0 && b.last === 0) return a.i - b.i;
      if (a.last === 0) return -1;
      if (b.last === 0) return 1;
      return (a.last - b.last) || (a.i - b.i);
    })
    .map((x) => x.p);
}

// Readable touch date for the history rows, e.g. "Aug 10, 2026".
export function formatTouchDate(ts) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}
