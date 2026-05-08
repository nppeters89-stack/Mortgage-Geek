// Equal Housing Lender mark, rendered as an inline SVG. Icon-only;
// the parent component is expected to provide a visible "Equal Housing
// Lender" text label beside it where context requires one.
//
// Path mirrors the canonical EHL silhouette already used in the mobile
// sidebar (src/components/Sidebar.jsx): a steep-roof house outline
// with two horizontal stripes inside its lower half. No outer frame —
// the mark is the house itself, which matches the FDIC/HUD pictogram.
//
// `color` tints both the stroke (house outline) and the stripe fill
// so the mark stays single-tone against any background.

import { P } from "../theme";

export function EHLLogo({ size = 24, color = P.navy }) {
  // Aspect ratio matches the viewBox (40 wide × 42 tall) so the icon
  // doesn't squash when consumers pass a single `size` value.
  const height = size * (42 / 40);
  return (
    <svg
      role="img"
      aria-label="Equal Housing Lender"
      width={size}
      height={height}
      viewBox="0 0 40 42"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {/* House outline — apex centered at top, walls down to the base */}
      <path
        d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Two horizontal stripes inside the house, signature EHL detail */}
      <rect x="12" y="22" width="16" height="3" fill={color} />
      <rect x="12" y="28" width="16" height="3" fill={color} />
    </svg>
  );
}
