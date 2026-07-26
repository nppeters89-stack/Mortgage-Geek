// Geek Log 2.0 shared activity model: the seven counters, their pillar
// grouping, ceilings (for the green wash), and pure sums. Matches the Phase 1
// API document (api/geeklog/_activity.js) exactly.

export const CONV_SUBS = [
  { key: "pastClient", label: "Past Client", ceiling: 8 },
  { key: "inProcess", label: "In Process", ceiling: 8 },
  { key: "prospecting", label: "Prospecting", ceiling: 10 },
];
export const APPT_SUBS = [
  { key: "preApproval", label: "Pre Approval", ceiling: 4 },
  { key: "realtor", label: "Realtor", ceiling: 4 },
];
export const CONTENT_SUBS = [
  { key: "reel", label: "Reel", ceiling: 2 },
  { key: "static", label: "Static Post", ceiling: 2 },
];

export const ALL_KEYS = [...CONV_SUBS, ...APPT_SUBS, ...CONTENT_SUBS].map((s) => s.key);

// A streak day needs at least this many conversations. Mirrors STREAK_FLOOR in
// api/geeklog/_activity.js so client and server agree.
export const STREAK_FLOOR = 3;

export const CONV_DEF = "A conversation is a two way exchange with a human about mortgage business.";

export function sumKeys(obj, subs) {
  return subs.reduce((n, s) => n + (obj[s.key] || 0), 0);
}

// A fresh seven-counter day, all zeros.
export function emptyDay() {
  const d = {};
  for (const k of ALL_KEYS) d[k] = 0;
  return d;
}

// Coerce any (partial / null) stored day into a full seven-counter object.
export function normalizeDay(raw) {
  const d = emptyDay();
  if (raw && typeof raw === "object") {
    for (const k of ALL_KEYS) if (Number.isInteger(raw[k]) && raw[k] >= 0) d[k] = raw[k];
  }
  return d;
}

// Conversations for one day (drives the DayStrip and the weekly progress bar).
export function convOf(day) {
  return sumKeys(day, CONV_SUBS);
}
