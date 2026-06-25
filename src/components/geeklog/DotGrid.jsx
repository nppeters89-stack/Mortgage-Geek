// Parameterized 100-dot progress grid. Built to be reused without
// modification inside the G5 snapshot card — the defaults (26px dots,
// 14px gap, gold fill + goldMuted inset, warmGrayLight 40% inset rings)
// match the snapshot card spec exactly, so the dashboard preview here
// is rendered with the same configuration as the export card. Call
// sites that need a smaller version pass explicit dotSize/gap props.
//
// 10·26 + 9·14 = 386px wide at default settings.

import { P } from "../../theme";

// Empty-dot inset ring: pre-refresh warm grey rgb(111, 104, 96) (old
// P.warmGrayLight "#6F6860") at 40% alpha. Kept inline rather than added to
// the palette. NOTE: after the Phase 2 swap P.warmGrayLight is now "#9A9DA2";
// this inline value deliberately still holds the old grey and will be
// reconciled in the hardcoded-hex phase.
const DEFAULT_UNFILLED_RING = "rgba(111, 104, 96, 0.4)";

export function DotGrid({
  filled,
  total = 100,
  dotSize = 26,
  gap = 14,
  filledColor = P.gold,
  filledRingColor = P.goldMuted,
  unfilledRingColor = DEFAULT_UNFILLED_RING,
  columns = 10,
}) {
  const safeFilled = Math.max(0, Math.min(total, Math.floor(filled || 0)));
  const width = columns * dotSize + (columns - 1) * gap;

  const dots = [];
  for (let i = 0; i < total; i++) {
    const isFilled = i < safeFilled;
    dots.push(
      <div
        key={i}
        aria-hidden="true"
        style={{
          width: dotSize,
          height: dotSize,
          // box-sizing: border-box keeps the dot's outer size at dotSize
          // regardless of border width, so the grid math stays exact.
          boxSizing: "border-box",
          borderRadius: "50%",
          background: isFilled ? filledColor : "transparent",
          // Borders render reliably in html-to-image's foreignObject
          // pipeline on mobile WebKit; the previous box-shadow inset
          // ring rendered as a dash-like artifact in the exported PNG
          // on iOS Safari. Visual parity preserved at this scale.
          border: isFilled
            ? `1px solid ${filledRingColor}`
            : `1.5px solid ${unfilledRingColor}`,
        }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Progress: ${safeFilled} of ${total} customers home`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${dotSize}px)`,
        gap,
        width,
        margin: "0 auto",
      }}
    >
      {dots}
    </div>
  );
}
