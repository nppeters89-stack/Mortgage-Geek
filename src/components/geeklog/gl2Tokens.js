// Geek Log 2.0 scoped design tokens (from the CD handoff). Kept HERE in the
// Geek Log component folder, deliberately NOT in theme.js: the green scale is
// Geek Log's own "money-making activity happened" signal and must not leak into
// the site palette or touch P.success. Dark charcoal cockpit.
export const T = {
  bg0: "#24272A", // Ravenswood Gray
  bg1: "#131416", // deepened base
  surface: "#1C1F22",
  surfaceHi: "#23272B",
  line: "rgba(255,254,251,0.10)",
  lineSoft: "rgba(255,254,251,0.06)",
  cream: "#FFFEFB",
  dim: "rgba(255,254,251,0.56)",
  dimmer: "rgba(255,254,251,0.32)",
  faint: "rgba(255,254,251,0.18)",
  red: "#CF3338", // Arrow Red
  redLift: "#E2575B", // Lifted Red
  greenDeep: "#14563A",
  green: "#2FBF71", // status green, Geek Log's semantic success
  greenBright: "#63E6A0",
  greenWash: "rgba(47,191,113,0.10)", // green at 10%: card-level "this one is hot" fill
  greenWashLine: "rgba(47,191,113,0.28)", // its separator, so the wash reads as one block
  gold: "#B8860B", // closings only, internal
  goldMuted: "#8B6914",
  amber: "#C9A23A", // callback status + callback accents (prospecting)
  whale: "#4FB3D9", // aqua: the whale pipeline (top producers nurtured separately)
  whaleWash: "rgba(79,179,217,0.10)",
  whaleWashLine: "rgba(79,179,217,0.4)",
  cold: "#5B7C99", // steel blue: the Follow Up cockpit's cold pipeline (went quiet)
  coldWash: "rgba(91,124,153,0.10)", // cold at 10%: cold section fill
  coldWashLine: "rgba(91,124,153,0.35)", // cold separator / card border
  redWashLine: "rgba(226,87,91,0.4)", // lifted-red hairline: SOI badge + goal-column border
  redWash: "rgba(226,87,91,0.07)", // lifted-red at 7%: dead-box drop highlight
  colWash: "rgba(255,254,251,0.02)", // near-invisible cream: board column base fill
  orange: "#FF7A00", // neon orange: the motivation field, deliberately loud so it never gets skipped
  orangeWash: "rgba(255,122,0,0.08)", // orange at 8%: motivation box fill
  orangeWashLine: "rgba(255,122,0,0.55)", // its border, bright enough to read as a highlight
};

// Phone-width column, centered on desktop. Lives here rather than in Gl2App so
// that an overlay rendered from inside a tab (which must use position:fixed,
// because it sits within the scroll container) can match the column width without
// importing Gl2App and creating an import cycle.
export const APP_MAX = 880;

// Stage-notch gradient for the follow-up pipeline: kindles from dark red
// through neon orange into neon yellow on the goal notch. Indexed by notch
// position via stageRampColor so any stage count maps onto the ramp (identity
// at the default seven).
export const STAGE_RAMP = ["#8A1B1F", "#B02318", "#D63A0F", "#F25400", "#FF7A00", "#FFAE00", "#FFE600"];
export const stageRampColor = (i, n = STAGE_RAMP.length) => {
  if (n <= 1) return STAGE_RAMP[STAGE_RAMP.length - 1];
  const t = Math.max(0, Math.min(1, i / (n - 1)));
  return STAGE_RAMP[Math.round(t * (STAGE_RAMP.length - 1))];
};

// Whale-notch gradient: light neon blue kindling into a rich violet on the
// seventh value add. Same mapper shape as the stage ramp.
export const WHALE_RAMP = ["#5BE7FF", "#57C8FF", "#5FA8FF", "#7287FF", "#8A66F5", "#9C4DE0", "#8B2FC9"];
export const whaleRampColor = (i, n = WHALE_RAMP.length) => {
  if (n <= 1) return WHALE_RAMP[WHALE_RAMP.length - 1];
  const t = Math.max(0, Math.min(1, i / (n - 1)));
  return WHALE_RAMP[Math.round(t * (WHALE_RAMP.length - 1))];
};

// Last-touch urgency ramp for the Follow Ups surfaces. Under 7 days the label
// stays the surface's own gray (the caller passes it); from 7 days it kindles
// neon yellow, through neon orange at 10, to neon red at 14 and beyond. Never
// touched at all is the far end of overdue, so null reads neon red too.
const STALE_ANCHORS = [
  [7, [0xff, 0xe6, 0x00]],  // neon yellow
  [10, [0xff, 0x7a, 0x00]], // neon orange
  [14, [0xff, 0x31, 0x31]], // neon red
];
export function staleColor(days, freshColor) {
  if (days == null) return "#FF3131";
  if (days < STALE_ANCHORS[0][0]) return freshColor;
  const last = STALE_ANCHORS[STALE_ANCHORS.length - 1];
  if (days >= last[0]) return "#FF3131";
  for (let i = 0; i < STALE_ANCHORS.length - 1; i++) {
    const [d0, c0] = STALE_ANCHORS[i];
    const [d1, c1] = STALE_ANCHORS[i + 1];
    if (days <= d1) {
      const t = (days - d0) / (d1 - d0);
      const mix = c0.map((v, k) => Math.round(v + (c1[k] - v) * t));
      return `#${mix.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    }
  }
  return "#FF3131";
}

// Interaction-score heat scale for prospecting call scoring: 1-10, red→green,
// the same red-to-green convention as an interaction heatmap. Index 0 = score 1.
export const SCORE_HEAT = [
  "#B23438", "#C0443C", "#C9583E", "#CC7040", "#C98A3E",
  "#C0A03C", "#9FA83E", "#77A44A", "#4EA057", "#2E9D6B",
];

// Locked wordmark glyphs match the site: MORTGAGE = DM Sans 700, GEEK = Archivo 800.
export const FF = {
  body: "'Figtree', system-ui, sans-serif",
  mark1: "'DM Sans', sans-serif",
  mark2: "'Archivo', sans-serif",
  serif: "'Instrument Serif', Georgia, serif", // display serif: numbers, names, headers
  sans: "'DM Sans', -apple-system, system-ui, sans-serif", // prospecting UI sans
};

// Green wash for a tap target, scaled by count against a soft ceiling.
export function greenFor(count, ceiling) {
  if (!count) return 0;
  return Math.min(1, count / ceiling);
}
