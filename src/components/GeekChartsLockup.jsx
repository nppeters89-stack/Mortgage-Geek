import { P, HOME } from "../theme";

// Geek Charts lockup (brand guidelines v1.0), reproduced from the master artwork
// as inline SVG so the loaded Archivo (wordmark) and DM Sans (descriptor) fonts
// render. Transparent ground so it blends onto the page. The mark is the
// simplified glyph (volatile ascending trendline resolving into the Arrow Red
// peak square); the wordmark is "Geek" + "Charts" in Arrow Red; the descriptor
// is "LONG-TERM DATA". Colors map to exact theme tokens (P.navy #24272A tile,
// P.cream #F6F5F3 line, P.gold #CF3338 Arrow Red, P.white / P.text wordmark).
// `compact` drops the descriptor for small placements (eyebrows); `variant`
// switches the wordmark color for dark vs light grounds.
export function GeekChartsLockup({ variant = "dark", compact = false, height = 96, style }) {
  const geekFill = variant === "light" ? P.text : P.white;
  const descFill = variant === "light" ? HOME.textMuted : P.warmGrayLight;
  // Compact drops the descriptor, so center the wordmark on the icon's center
  // (icon spans y96-224, center 160). We center via an explicit alphabetic
  // baseline (y186 = 160 + half the ~52px cap height) rather than
  // dominant-baseline:central, which WebKit/mobile does not inherit onto the
  // "Charts" <tspan> (it left Charts on a higher baseline than Geek). The
  // viewBox frames the icon tightly.
  const viewBox = compact ? "52 92 668 136" : "0 0 720 320";
  const ratio = compact ? 668 / 136 : 720 / 320;
  return (
    <svg
      viewBox={viewBox}
      height={height}
      width={height * ratio}
      role="img"
      aria-label="Geek Charts, long-term data"
      style={{ display: "block", ...style }}
    >
      <g transform="translate(60 96)">
        <rect width="128" height="128" rx="28" fill={P.navy} />
        <polyline
          points="24.9,92.4 40.3,75.8 49.2,90.1 61.6,66.4 73.5,83 85.3,55.7 94.8,72.3 104.3,40.3"
          fill="none"
          stroke={P.cream}
          strokeWidth="8.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect x="97.2" y="35.5" width="14.2" height="14.2" fill={P.gold} />
      </g>
      <text x="228" y={compact ? 186 : 150} fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="72" letterSpacing="-0.7" fill={geekFill}>
        Geek <tspan fill={P.gold}>Charts</tspan>
      </text>
      {!compact && (
        <text x="230" y="196" fontFamily="'DM Sans', sans-serif" fontWeight="600" fontSize="22" letterSpacing="5" fill={descFill}>
          LONG-TERM DATA
        </text>
      )}
    </svg>
  );
}
