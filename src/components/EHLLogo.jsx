// Equal Housing Lender mark, rendered as an inline SVG. Icon-only;
// the parent component is expected to provide a visible "Equal Housing
// Lender" text label beside it where context requires one.
//
// The mark is the standard FDIC/HUD silhouette: a square frame, a
// gabled-roof house centered inside it, and three horizontal bars
// across the lower portion representing the floors of the house.
// Color is single-tone so it can be tinted via the `color` prop and
// match whichever palette token the consumer wants (defaults to navy).

import { P } from "../theme";

export function EHLLogo({ size = 24, color = P.navy }) {
  return (
    <svg
      role="img"
      aria-label="Equal Housing Lender"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {/* Outer square frame */}
      <rect x="1" y="1" width="30" height="30" rx="2" fill="none" stroke={color} strokeWidth="2" />
      {/* House silhouette: gabled roof + body */}
      <path
        d="M16 6 L26 14 L26 25 L6 25 L6 14 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Three horizontal bars representing floors */}
      <rect x="9" y="16" width="14" height="1.5" fill={color} />
      <rect x="9" y="19.25" width="14" height="1.5" fill={color} />
      <rect x="9" y="22.5" width="14" height="1.5" fill={color} />
    </svg>
  );
}
