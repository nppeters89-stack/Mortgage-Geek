// Currency formatter — converts numeric values to "$1,234,567" style strings.
export const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Convert a hex color (#RRGGBB) to rgba(r,g,b,a). Lets callers tint brand
// colors without hardcoding rgb triplets. If the input is not a 6-digit hex
// (e.g. it's already rgba, a CSS keyword, or a 3-digit hex), the input is
// returned unchanged — caller is responsible for picking sensible inputs.
//
// Used by:
//  - components/calculator/DetailPanel.jsx (PMI note tint, etc.)
//  - components/cockpit/CockpitShell.jsx consumers (Pre-Qual DTI deep-dive bars)
//  - components/homepage/HeroJourneyTrack.jsx (cream tints over navy bg)
export function withAlpha(hex, alpha) {
  if (typeof hex !== "string" || hex.length !== 7 || hex[0] !== "#") return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
