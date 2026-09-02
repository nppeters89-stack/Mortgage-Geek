// Pure helpers for the Prospecting tab: id derivation, queue sort/filter, the
// outcome vocabulary, and the Excel TSV builders. No React, no I/O.

import { T, SCORE_HEAT } from "../gl2Tokens";
import { centralDateKey } from "../gl2Week";

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

// "Today" is the Central business day, the same convention the Today tracker
// counts by (centralDateKey), NOT the device's local midnight. Device-local
// comparison made a late-evening Central call read as "today" the next morning
// on any device whose clock sat in a later timezone - a phantom 1 on the
// Calls today / Conversations boxes with nothing logged yet.
// Coverage targets for the cockpit's data-on-file gauges. A percentage without
// a target tick reads as trivia; these are the lines to beat.
export const COV_TARGET = 90; // 14-day touch coverage
export const RAC_TARGET = 100; // everyone live should be in RAC
export const MOT_TARGET = 80; // motivation on file
export const CONVO_TARGET = 100; // weekly conversations goal

// Shared weekly scoreboard math for the desktop HUD and the mobile header
// strip, so the phone and the desktop can never disagree on the week.
// week = rolling 7 days of non-referral touches (the shipped definition);
// added/convos use Monday 00:00 local. Join date is stored addedat with a
// fallback to the earliest touch or first-call log for members predating it.
export function weekScoreboard({ prospects, logs, followUps, soi = EMPTY_OBJ, pinned = EMPTY_SET, cold = EMPTY_OBJ, dead = EMPTY_OBJ, addedat = EMPTY_OBJ }) {
  const wkD = new Date(); wkD.setHours(0, 0, 0, 0);
  const dayStart = wkD.getTime();
  wkD.setDate(wkD.getDate() - ((wkD.getDay() + 6) % 7));
  const weekStart = wkD.getTime();
  const weekLabel = `week of ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][wkD.getDay()]} ${wkD.getDate()}`;
  let week = 0, talkedWeek = 0;
  const now = Date.now();
  (prospects || []).forEach((p) => {
    const id = idFromPhone(p.phone);
    if (dead[id]) return;
    (followUps[id] || []).forEach((t) => {
      if (t.stage !== STAGE_REFERRAL && t.stage !== REPLY_STAGE && now - t.ts < 7 * DAY_MS) week++;
      if (t.talked === true && t.stage !== REPLY_STAGE && t.ts >= weekStart) talkedWeek++;
    });
  });
  const scoredCallsWeek = Object.values(logs || {}).filter((l) => l && l.score >= 1 && l.ts && l.ts >= weekStart).length;
  const convosWeek = talkedWeek + scoredCallsWeek;
  const livePool = (prospects || []).filter((p) => { const id = idFromPhone(p.phone); return !cold[id] && !dead[id] && (qualifiesForFollowUp(logs[id]) || pinned.has(id) || soi[id]); });
  const joinTs = (id) => {
    const stored = Number(addedat?.[id]);
    if (Number.isFinite(stored) && stored > 0) return stored;
    const first = (followUps[id] || []).reduce((m, t) => (t.ts && (!m || t.ts < m) ? t.ts : m), 0);
    return first || logs?.[id]?.ts || 0;
  };
  const joins = livePool.map((p) => joinTs(idFromPhone(p.phone))).filter(Boolean);
  return {
    weekStart, dayStart, weekLabel, week, convosWeek,
    addedToday: joins.filter((t) => t >= dayStart).length,
    addedWeek: joins.filter((t) => t >= weekStart).length,
  };
}

export function isToday(ts) {
  if (!ts) return false;
  return centralDateKey(new Date(ts)) === centralDateKey();
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
// Manual contacts are excluded even once they have a log (a score given in
// Follow Ups creates one): they are not in the Excel master list this export
// pastes into, and they have their own "Copy contact for Excel" action.
export function logTsvAll(prospects, logs) {
  const rows = ["Name\tPhone\tDate Called\tResults\tInteraction Score"];
  for (const p of prospects) {
    if (p.manual) continue;
    const log = logs[idFromPhone(p.phone)];
    if (log && log.outcome) rows.push(logTsvRow(p, log));
  }
  return rows.length > 1 ? rows.join("\n") : "";
}

// ----- Follow Ups (derived membership: a call scored 9 or 10) -----

const DAY_MS = 86400000;
export const FOLLOWUP_MIN_SCORE = 9;
export const STALE_DAYS = 14;

// A follow-up is DUE once the last touch is 7+ days old (or never happened) -
// the same threshold where the urgency ramp starts kindling, so every due
// count agrees with the yellow-through-red labels.
export const DUE_DAYS = 7;
// Stage-aware cadence: one clock per standard stage, indexed to match
// DEFAULT_STAGES 0..5 (New, Intro Follow Up, Value Add & Social, Value Add,
// Check In, Motivation Identified / Maintenance). SOI (index 6) is not listed
// on purpose: the SOI cockpit owns its own clocks, so it falls through to the
// DUE_DAYS fallback for the badge counts. New cards are never-touched and read
// red by rule already; the 1-day value is for consistency and hand placements.
export const STAGE_DUE_DAYS = [1, 3, 7, 14, 21, 30];
// Whale cadence per value-add column (0..6). Early columns move fast while the
// relationship is forming, then settle into the 30-day nurture rhythm.
export const WHALE_DUE_DAYS = [3, 7, 14, 30, 30, 30, 30];
export const dueDaysFor = (stageIndex, isWhale = false) =>
  (isWhale ? WHALE_DUE_DAYS[stageIndex] ?? WHALE_DUE_DAYS[WHALE_DUE_DAYS.length - 1] : STAGE_DUE_DAYS[stageIndex] ?? DUE_DAYS);
export const isDueForTouch = (touches, dueDays = DUE_DAYS) => {
  const ts = lastTouchTs(touches);
  return !ts || Date.now() - ts >= dueDays * DAY_MS;
};

export const qualifiesForFollowUp = (log) => !!(log && log.score >= FOLLOWUP_MIN_SCORE);

// A perfect call. Both 9s and 10s qualify for follow up, but a 10 is the strongest
// buying signal in the log, so the queue features it instead of letting it sit in
// an undifferentiated list.
export const TOP_SCORE = 10;
export const isTopScore = (log) => !!(log && log.score === TOP_SCORE);

// Newest touch timestamp for a contact (0 if none).
export function lastTouchTs(touches) {
  if (!Array.isArray(touches) || !touches.length) return 0;
  // Inbound replies never reset the outbound clock.
  return touches.reduce((m, t) => Math.max(m, t && t.stage === REPLY_STAGE ? 0 : t.ts || 0), 0);
}

// { label, stale } for the queue's last-touch line. Stale (amber) at zero touches
// or more than STALE_DAYS since the last touch.
export function lastTouchLabel(touches) {
  const ts = lastTouchTs(touches);
  if (!ts) return { label: "No touches yet", stale: true, days: null };
  const days = Math.floor((Date.now() - ts) / DAY_MS);
  return { label: days <= 0 ? "Today" : `${days}d ago`, stale: days > STALE_DAYS, days };
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
export const DEFAULT_STAGES = ["New", "Intro Follow Up", "Value Add & Social", "Value Add", "Check In", "Motivation Identified / Maintenance", "SOI"];

// Display shortening for stage names too long for a tight column header. The
// full name still shows on wide (two-across) columns, in the composer dropdown,
// toasts and history tags.
export const shortStage = (label) => (label === "Motivation Identified / Maintenance" ? "Motivation / Maint." : label);
export const DEFAULT_CONFIG = { weekTarget: 15, touchOverdueDays: 21, refQuietDays: 90 };

// The whale pipeline's seven value-add columns. Whales ride the same stage
// machinery as the hot board (same stageOf ratchet, same stagemap drags); these
// are just the labels their seven columns wear.
export const WHALE_COLUMNS = ["Value Add 1", "Value Add 2", "Value Add 3", "Value Add 4", "Value Add 5", "Value Add 6", "Value Add 7"];

// The five cold columns, keyed by check-in count (min(count, 4)).
export const COLD_COLUMNS = ["Fresh Cold", "1 Check-in", "2 Check-ins", "3 Check-ins", "4-5 Check-ins"];
export const COLD_CHECKIN_CAP = 5;
// Cold color clock: cold ages are colored on a 30-day rhythm (yellow at 30,
// orange 33, red 37). Color only; cold never joins any due count.
export const COLD_DUE_DAYS = 30;

// Sentinel stages that a touch can carry: a cold check-in and a dead marker. Any
// stage > 0 is a pipeline stage (index into the stages array).
export const STAGE_COLD = -1;
export const STAGE_DEAD = -2;
// A referral event: the partner sent business. Lives in the same fu history as
// every other touch, so it survives promotion, demotion, and re-seeds alike.
export const STAGE_REFERRAL = -3;
// A reply is a fact: the agent texted back. Inbound, in the same append-only
// history, but not an outbound touch. It never resets the outbound clock,
// never advances the ratchet, and never counts toward touch or conversation
// stats; it marks the card and shortens its clock (see REPLY_DUE_DAYS).
export const REPLY_STAGE = -4;
export const repliesOf = (touches) => (touches || []).filter((t) => t && t.stage === REPLY_STAGE);
export const lastReplyTs = (touches) => repliesOf(touches).reduce((m, t) => Math.max(m, t.ts || 0), 0);
// A live conversation should speed up, not pause: a reply newer than the last
// outbound touch makes the card due in 2 days, and the ramp runs from there.
export const REPLY_DUE_DAYS = 2;
// The one due/urgency oracle for a card. source is "reply" when the reply
// clock governs, "stage" when the session 1 cadence applies unchanged.
export function dueInfoFor(touches, stageIndex, isWhale = false) {
  const touchTs = lastTouchTs(touches) || 0;
  const replyTs = lastReplyTs(touches) || 0;
  if (replyTs && replyTs > touchTs) {
    const dueTs = replyTs + REPLY_DUE_DAYS * DAY_MS;
    return { source: "reply", dueDays: REPLY_DUE_DAYS, sinceTs: replyTs, dueTs, due: Date.now() >= dueTs };
  }
  const dueDays = dueDaysFor(stageIndex, isWhale);
  return { source: "stage", dueDays, sinceTs: touchTs || null, dueTs: touchTs ? touchTs + dueDays * DAY_MS : null, due: !touchTs || Date.now() >= touchTs + dueDays * DAY_MS };
}

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
//
// `override` is a hand placement from the cockpit's drag board ({ s, ts } from
// the prospects:fu:stagemap hash): the card sits where it was dropped, in either
// direction, and the placement becomes the new ratchet base. Only touches logged
// AFTER the placement can push the stage up from there; older touches are
// superseded by the drop. No override reproduces the original ratchet exactly.
export function stageOf(touches, { isSoi = false, goalIndex = goalIndexOf(), override = null } = {}) {
  if (isSoi) return goalIndex;
  const o = override && Number.isInteger(override.s) && Number.isFinite(override.ts) ? override : null;
  const eligible = o ? (touches || []).filter((t) => (t?.ts || 0) > o.ts) : (touches || []);
  const positives = eligible.map(touchStage).filter((s) => s > 0);
  const base = o ? o.s : 0;
  return positives.length ? Math.max(base, ...positives) : base;
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
  if (s === STAGE_REFERRAL) return { label: "Referral", tone: "ref" };
  if (s === REPLY_STAGE) return { label: "They replied", tone: "reply" };
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

// ----- SOI cockpit clocks (two timers per partner: last touch, last referral) -----
//
// The quadrant view derives everything from the fu history plus two config
// knobs. touchesBy is what Nick DID (everything except referral events);
// referralsOf is what the partner sent back. Quadrant indices match the
// preview: 0 Producing & Connected, 1 Producing & Overdue, 2 Quiet & Connected,
// 3 Quiet & Drifting.

export const touchesBy = (touches) => (touches || []).filter((t) => t && t.stage !== STAGE_REFERRAL && t.stage !== REPLY_STAGE);
export const referralsOf = (touches) => (touches || []).filter((t) => t && t.stage === STAGE_REFERRAL);

// Null (not lastTouchTs's 0) when there is nothing: the timer chips render
// "Never" off null, and 0 would read as twenty thousand days since epoch.
export const lastTouchByTs = (touches) => lastTouchTs(touchesBy(touches)) || null;
export const lastReferralTs = (touches) => lastTouchTs(referralsOf(touches)) || null;

export function touchOverdue(touches, config = DEFAULT_CONFIG) {
  const ts = lastTouchByTs(touches);
  if (!ts) return true;
  return Date.now() - ts > (config.touchOverdueDays ?? DEFAULT_CONFIG.touchOverdueDays) * DAY_MS;
}

export function producing(touches, config = DEFAULT_CONFIG) {
  const ts = lastReferralTs(touches);
  if (!ts) return false;
  return Date.now() - ts <= (config.refQuietDays ?? DEFAULT_CONFIG.refQuietDays) * DAY_MS;
}

export function quadrantOf(touches, config = DEFAULT_CONFIG) {
  return producing(touches, config) ? (touchOverdue(touches, config) ? 1 : 0) : (touchOverdue(touches, config) ? 3 : 2);
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
// Stable partition: fire-flagged contacts float to the front, neglect order
// preserved inside each half. Used by every surface that renders the 🔥 flag so
// hot leads are the first thing seen, not just decorated.
export function fireFirst(list, fireSet) {
  if (!fireSet || !fireSet.size) return list;
  const flagged = [];
  const rest = [];
  list.forEach((p) => (fireSet.has(idFromPhone(p.phone)) ? flagged : rest).push(p));
  return flagged.length ? [...flagged, ...rest] : list;
}

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
