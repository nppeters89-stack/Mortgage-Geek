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
// Manual contacts are merged into the shared collection so Follow Ups, SOI and
// the detail views treat them like any other contact, but they did not come from
// the Excel master list and are not cold-call material, so they stay out of this
// queue. (Their buysides is 0, which would otherwise sort them to the very top.)
export function filterQueue(prospects, { filter, query, logs }) {
  const q = (query || "").trim().toLowerCase();
  return prospects.filter((p) => {
    if (p.manual) return false;
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

// Sort by neglect: never-touched first, then ascending by most-recent touch
// (longest since last touch at the top = the next right call). Stable within ties
// (keeps the incoming buyside order). Shared by the Follow Ups and SOI queues so
// both read the same way.
function byNeglect(prospects, followUps) {
  return prospects
    .map((p, i) => ({ p, i, last: lastTouchTs(followUps[idFromPhone(p.phone)]) }))
    .sort((a, b) => {
      if (a.last === 0 && b.last === 0) return a.i - b.i;
      if (a.last === 0) return -1;
      if (b.last === 0) return 1;
      return (a.last - b.last) || (a.i - b.i);
    })
    .map((x) => x.p);
}

// ----- Pipeline stages, cold, and dead (the Follow Up cockpit) -----
//
// The whole cockpit derives a contact's state from touch data plus the cold/dead
// hashes; nothing about position is stored. This is the single implementation of
// those derivations, imported by the mobile list and (Phase 2) the desktop board.

// The seven pipeline stages, index 0 (New) through 6 (SOI, the goal). The app
// falls back to these labels when prospects:fu:stages is absent, so labels can
// change server-side without a deploy without breaking the indices.
export const DEFAULT_STAGES = ["New", "Intro Follow Up", "Value Add & Social", "Value Add", "Check In / Meeting Ask", "Coffee / Face to Face", "SOI"];
export const DEFAULT_CONFIG = { weekTarget: 15 };

// The five cold columns, keyed by check-in count (min(count, 4)).
export const COLD_COLUMNS = ["Fresh Cold", "1 Check-in", "2 Check-ins", "3 Check-ins", "4-5 Check-ins"];
export const COLD_CHECKIN_CAP = 5;

// Sentinel stages that a touch can carry: a cold check-in and a dead marker. Any
// stage > 0 is a pipeline stage (index into the stages array).
export const STAGE_COLD = -1;
export const STAGE_DEAD = -2;

// The goal (last) stage index for a stages array. Always the SOI column.
export const goalIndexOf = (stages = DEFAULT_STAGES) => stages.length - 1;

// LEGACY RULE: a touch stored before the cockpit has no stage field. It is
// treated as stage 1 (Intro Follow Up) everywhere a stage is computed, so nobody
// already touched is stranded in New. Stored data is never migrated; this is the
// read-time interpretation.
const touchStage = (t) => (t && t.stage != null ? t.stage : 1);

// A contact's pipeline stage: the highest positive stage among its touches, or 0
// (New) if none. EXCEPTION: an id in the SOI hash is at the goal stage regardless
// of touches, because the soi hash is the single source of truth for SOI.
export function stageOf(touches, { isSoi = false, goalIndex = goalIndexOf() } = {}) {
  if (isSoi) return goalIndex;
  const positives = (touches || []).map(touchStage).filter((s) => s > 0);
  return positives.length ? Math.max(...positives) : 0;
}

// Cold check-ins logged (stage -1 touches). The cold column index caps at 4.
export const coldCount = (touches) => (touches || []).filter((t) => t && t.stage === STAGE_COLD).length;
export const coldColIndex = (touches) => Math.min(coldCount(touches), COLD_COLUMNS.length - 1);

// State predicates over the cold/dead hashes (id -> ts). Dead supersedes cold.
export const isDead = (id, dead = {}) => !!dead[id];
export const isCold = (id, cold = {}, dead = {}) => !!cold[id] && !dead[id];

// The stage tag shown on a history row: a red pipeline label, a blue cold
// check-in, or a gray dead marker. Returns { label, tone } where tone is one of
// "stage" | "cold" | "dead".
export function stageTag(touch, stages = DEFAULT_STAGES) {
  const s = touch && touch.stage != null ? touch.stage : 1;
  if (s === STAGE_COLD) return { label: "Cold check-in", tone: "cold" };
  if (s === STAGE_DEAD) return { label: "Marked dead", tone: "dead" };
  return { label: stages[s] || stages[1], tone: "stage" };
}

// Follow Ups membership, the single formula: earned by a 9+ call score OR placed
// by hand, and not already promoted to SOI. A promoted contact graduates into the
// SOI view; the call log and the pin are both untouched, so removing them from
// SOI drops them straight back in here. The cockpit adds two more exclusions:
// a contact moved to cold lives in the cold pipeline, and a dead contact is gone.
//
// `pinned` is a Set of ids (or anything with .has). `cold`/`dead` are the hashes.
const EMPTY_SET = new Set();
const EMPTY_OBJ = {};

export function followUpQueue(prospects, logs, followUps, soi = {}, pinned = EMPTY_SET, cold = EMPTY_OBJ, dead = EMPTY_OBJ) {
  const members = prospects.filter((p) => {
    const id = idFromPhone(p.phone);
    return (qualifiesForFollowUp(logs[id]) || pinned.has(id)) && !soi[id] && !cold[id] && !dead[id];
  });
  return byNeglect(members, followUps);
}

// The cold pipeline: contacts moved to cold and not dead, neglect-sorted so the
// longest-quiet sit at the top (the next ones to revive or let go).
export function coldQueue(prospects, followUps, cold = EMPTY_OBJ, dead = EMPTY_OBJ) {
  const members = prospects.filter((p) => {
    const id = idFromPhone(p.phone);
    return !!cold[id] && !dead[id];
  });
  return byNeglect(members, followUps);
}

// A contact is in Follow Ups by hand, not by score. Only these get the manual
// "Remove from Follow Ups" action: a derived member's place comes from the call
// score, so there would be nothing for the action to undo.
export const isPinnedMember = (id, pinned, soi = {}) => !!(pinned?.has(id) && !soi[id]);

// SOI membership: stored, not derived. Every id in the hash that still exists in
// the prospect list, sorted by the same neglect rule as Follow Ups.
export function soiQueue(prospects, soi, followUps) {
  return byNeglect(prospects.filter((p) => !!soi[idFromPhone(p.phone)]), followUps);
}

// Promotion date for the SOI row, e.g. "Aug 2026". Values arrive from Redis as
// strings, so coerce before formatting.
export function formatSoiSince(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "";
  try {
    return new Date(n).toLocaleDateString(undefined, { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

// ----- Manual contacts -----

// Merge the manual hash into the seeded list. Manual records carry the same field
// names as seeded ones plus a `manual` flag, so every downstream component works
// on them unchanged. A seeded contact wins any id collision: Excel is the source
// of truth for anyone who appears in it.
export function mergeManualContacts(seeded, manual) {
  const seen = new Set(seeded.map((p) => idFromPhone(p.phone)));
  const extra = Object.entries(manual || {})
    .filter(([id, c]) => c && !seen.has(id))
    .map(([, c]) => ({ ...c, buysides: c.buysides || 0, manual: true }));
  return extra.length ? [...seeded, ...extra] : seeded;
}

// Add-sheet search across every contact, seeded and manual: name, brokerage, and
// phone digits. Deliberately wider than the Prospecting search (which does not
// match on phone), because this is how Nick finds someone he only has a number
// for. Empty query returns nothing: the sheet is a lookup, not a browser.
export function searchContacts(prospects, query) {
  const raw = (query || "").trim();
  if (!raw) return [];
  const q = raw.toLowerCase();
  const qDigits = raw.replace(/\D/g, "");
  return prospects.filter((p) => {
    if (p.name?.toLowerCase().includes(q)) return true;
    if (p.brokerage?.toLowerCase().includes(q)) return true;
    return !!qDigits && idFromPhone(p.phone).includes(qDigits);
  });
}

// One TSV row shaped for the master list columns, for pasting a manual contact
// into Excel: Name, Email, Phone, Cold Call Notes. Tabs and newlines inside a
// value would break the row, so they collapse to spaces.
const cell = (v) => String(v ?? "").replace(/[\t\r\n]+/g, " ").trim();

export function manualContactTsvRow(contact) {
  if (!contact) return "";
  return [cell(contact.name), cell(contact.email), cell(contact.phone), cell(contact.notes)].join("\t");
}

// Readable touch date for the history rows, e.g. "Aug 10, 2026".
export function formatTouchDate(ts) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}
