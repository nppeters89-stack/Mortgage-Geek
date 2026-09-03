import { leadInfo, leadPlaceLabel, hasConversation } from "./leadsModel";
import { lastTouchTs, REPLY_STAGE } from "./prospectsModel";

// Weekly account report assembly. Data minimization enforced HERE, not by
// styling: the payload carries only the account header, funnel counts, and
// per-lead name, place, last touch date and next step date. Notes, source
// notes, phone numbers, emails and chip data never enter the object, so no
// renderer can leak them.

const DAY_MS = 24 * 60 * 60 * 1000;

const mondayStart = (now) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
};

const fmtDate = (ts) => (ts ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

const firstOutboundTs = (touches) => {
  let t = 0;
  for (const x of touches || []) if (x && x.stage !== REPLY_STAGE && (!t || x.ts < t)) t = x.ts;
  return t;
};
const firstAtOrAboveTs = (touches, stage) => {
  let t = 0;
  for (const x of touches || []) if (x && Number.isInteger(x.stage) && x.stage >= stage && (!t || x.ts < t)) t = x.ts;
  return t;
};

export function assembleReferrerReport({ member, contacts, fu, status }, now = Date.now()) {
  const weekStart = mondayStart(now);
  const leads = Object.entries(contacts || {})
    .map(([id, c]) => ({ id, ...c }))
    .filter((l) => l.referredBy === member.id);

  const step = (label, reachedTs) => {
    const times = leads.map(reachedTs).filter(Boolean);
    return { label, total: times.length, week: times.filter((t) => t >= weekStart).length };
  };
  const trackStep = (label, tracks) => {
    const entries = leads
      .map((l) => status?.[l.id])
      .filter((s) => s && tracks.includes(s.track));
    return { label, total: entries.length, week: entries.filter((s) => (s.ts || 0) >= weekStart).length };
  };

  const funnel = [
    step("Received", (l) => l.createdAt || 0),
    step("Contacted", (l) => firstOutboundTs(fu?.[l.id])),
    step("Conversation", (l) => (hasConversation(fu?.[l.id]) ? firstAtOrAboveTs(fu?.[l.id], 2) || firstOutboundTs(fu?.[l.id]) : 0)),
    step("Application", (l) => firstAtOrAboveTs(fu?.[l.id], 4)),
    trackStep("Pre-Approved", ["preapproved"]),
    trackStep("Under Contract", ["under_contract"]),
    trackStep("Closed", ["closed"]),
  ];

  const rows = leads
    .map((l) => {
      const info = leadInfo(fu?.[l.id], status?.[l.id], now);
      return { l, info };
    })
    .filter(({ info }) => !(info.place.type === "track" && (info.place.track === "closed" || info.place.track === "dead")))
    .sort((a, b) => (a.info.dueTs || Infinity) - (b.info.dueTs || Infinity))
    .map(({ l, info }) => ({
      name: l.name,
      place: leadPlaceLabel(info),
      lastTouch: fmtDate(lastTouchTs(fu?.[l.id]) || null),
      nextStep: info.dueTs ? fmtDate(info.dueTs) : "",
    }));

  return {
    memberName: member.name,
    memberBrokerage: member.brokerage || "",
    dateLabel: new Date(now).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    weekLabel: `week of ${new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    funnel,
    rows,
  };
}
