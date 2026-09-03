import { LEAD_PIPELINE, trackOf } from "./pipelines";
import { lastTouchTs, lastReplyTs, REPLY_STAGE, REPLY_DUE_DAYS } from "./prospectsModel";

// Lead pipeline derivations. Everything here is read-time: the append-only
// history plus the status hash produce a lead's place and clock, the same
// philosophy as the agent ratchet. Nothing in this module writes.

const DAY_MS = 24 * 60 * 60 * 1000;
export const ATTEMPTING = 1;
export const CONVERSATION = 2;
export const APP_COMPLETE = 5;

// An attempt is an outbound touch logged at the attempting stage.
export const attemptsOf = (touches) => (touches || []).filter((t) => t && t.stage === ATTEMPTING).length;

// A conversation exists once any touch lands at conversation or beyond, or an
// attempting touch was marked We talked.
export const hasConversation = (touches) => (touches || []).some((t) => t && ((Number.isInteger(t.stage) && t.stage >= CONVERSATION) || (t.talked === true && t.stage !== REPLY_STAGE)));

// The linear-board stage: highest positive touch stage, New when untouched.
export function leadStageOf(touches) {
  let s = 0;
  for (const t of touches || []) if (t && Number.isInteger(t.stage) && t.stage > s && t.stage <= APP_COMPLETE) s = t.stage;
  return s;
}

// Where a lead lives and what clock it runs. Returns:
//   { place: { type: "stage", index } | { type: "track", track }, derived,
//     dueDays, sinceTs, dueTs, due, source, expiryTs }
// Order of authority: an explicit status track wins; a nurture track with a
// year of silence derives to dead; five attempts with no conversation derive
// to nurture without writing anything; otherwise the board stage applies.
// A reply newer than the last outbound touch shortens any active clock to
// REPLY_DUE_DAYS, same as the agent pipeline.
export function leadInfo(touches, statusEntry, now = Date.now()) {
  const touchTs = lastTouchTs(touches) || 0;
  const replyTs = lastReplyTs(touches) || 0;

  const withClock = (place, dueDays, extra = {}) => {
    if (replyTs && replyTs > touchTs) {
      const dueTs = replyTs + REPLY_DUE_DAYS * DAY_MS;
      return { place, dueDays: REPLY_DUE_DAYS, sinceTs: replyTs, dueTs, due: now >= dueTs, source: "reply", ...extra };
    }
    if (dueDays == null) return { place, dueDays: null, sinceTs: touchTs || null, dueTs: null, due: false, source: "none", ...extra };
    const dueTs = touchTs ? touchTs + dueDays * DAY_MS : now;
    return { place, dueDays, sinceTs: touchTs || null, dueTs, due: !touchTs || now >= dueTs, source: "stage", ...extra };
  };

  if (statusEntry && statusEntry.track) {
    let track = statusEntry.track;
    let derived = false;
    if (track === "nurture") {
      const lastInbound = replyTs || 0;
      const anchor = Math.max(statusEntry.ts || 0, lastInbound);
      if (anchor && now - anchor > LEAD_PIPELINE.nurtureDeadMonths * 30.44 * DAY_MS) { track = "dead"; derived = true; }
    }
    const cfg = trackOf(track);
    return withClock({ type: "track", track }, cfg ? cfg.dueDays : null, { derived, expiryTs: statusEntry.expiryTs || null });
  }

  const stage = leadStageOf(touches);
  const attempts = attemptsOf(touches);

  // Five attempts with no conversation: the lead derives to nurture.
  if (stage <= ATTEMPTING && attempts >= LEAD_PIPELINE.attemptCap && !hasConversation(touches)) {
    return withClock({ type: "track", track: "nurture" }, trackOf("nurture").dueDays, { derived: true });
  }

  if (stage === ATTEMPTING || (stage === 0 && attempts > 0)) {
    const offs = LEAD_PIPELINE.attemptOffsets;
    return withClock({ type: "stage", index: ATTEMPTING }, offs[Math.min(attempts, offs.length - 1)], { derived: false, attempts });
  }

  return withClock({ type: "stage", index: stage }, LEAD_PIPELINE.dueDays[stage], { derived: false, attempts });
}

export function leadPlaceLabel(info) {
  if (info.place.type === "track") {
    const t = trackOf(info.place.track);
    return t ? t.label : info.place.track;
  }
  return LEAD_PIPELINE.stages[info.place.index]?.label || "New";
}

// Days remaining on a pre-approval, negative once past. Null without one.
export function expiryDaysLeft(info, now = Date.now()) {
  if (!info.expiryTs) return null;
  return Math.ceil((info.expiryTs - now) / DAY_MS);
}
