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
  gold: "#B8860B", // closings only, internal
  goldMuted: "#8B6914",
  amber: "#C9A23A", // callback status + callback accents (prospecting)
};

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
