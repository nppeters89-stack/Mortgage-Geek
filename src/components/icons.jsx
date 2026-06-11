import { P } from "../theme";

// All four custom icons share a prop contract: { size = 24, variant = "navy", style = {} }
// "navy" variant is for light backgrounds (cream/white cards). "cream" variant is for dark
// backgrounds (navy sidebar, mobile toolbar). Each icon keeps its gold accents constant
// across variants — the navy/cream flip is the structural color, gold is the signature accent.

export function MortgageCalcIcon({ size = 24, variant = "navy", style = {} }) {
  // Body and buttons flip based on background context. Screen always stays gold.
  const bodyColor = variant === "cream" ? P.cream : P.navy;
  const buttonColor = variant === "cream" ? P.navy : P.cream;
  return (
    <svg
      width={size}
      height={size * (88 / 72)}
      viewBox="0 0 72 88"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Body */}
      <rect x="0" y="0" width="72" height="88" rx="10" fill={bodyColor} />
      {/* Gold screen (always gold, both variants) */}
      <rect x="8" y="8" width="56" height="22" rx="3" fill={P.gold} />
      {/* Dark readout dashes on gold screen (always navy-dark) */}
      <rect x="52" y="22" width="8" height="2" fill={P.navyDark} />
      <rect x="42" y="22" width="6" height="2" fill={P.navyDark} />
      <rect x="34" y="22" width="4" height="2" fill={P.navyDark} />
      {/* Button grid: 3 rows of 4 */}
      <rect x="8" y="38" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="24" y="38" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="40" y="38" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="56" y="38" width="8" height="10" rx="2" fill={buttonColor} />
      <rect x="8" y="52" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="24" y="52" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="40" y="52" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="56" y="52" width="8" height="10" rx="2" fill={buttonColor} />
      <rect x="8" y="66" width="12" height="14" rx="2" fill={buttonColor} />
      <rect x="24" y="66" width="12" height="14" rx="2" fill={buttonColor} />
      <rect x="40" y="66" width="12" height="14" rx="2" fill={buttonColor} />
      <rect x="56" y="66" width="8" height="14" rx="2" fill={buttonColor} />
    </svg>
  );
}

export function CompareIcon({ size = 24, variant = "navy", style = {} }) {
  const ringColor = variant === "cream" ? P.cream : P.navy;
  // Slightly thicker stroke at very small sizes to maintain visibility after browser downscaling
  const strokeWidth = size <= 22 ? 5 : 3.5;
  const dotRadius = size <= 22 ? 5.5 : 4.5;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Top circle */}
      <circle cx="36" cy="26" r="22" fill="none" stroke={ringColor} strokeWidth={strokeWidth} />
      {/* Bottom-left circle */}
      <circle cx="24" cy="46" r="22" fill="none" stroke={ringColor} strokeWidth={strokeWidth} />
      {/* Bottom-right circle */}
      <circle cx="48" cy="46" r="22" fill="none" stroke={ringColor} strokeWidth={strokeWidth} />
      {/* Gold dot at centroid */}
      <circle cx="36" cy="39" r={dotRadius} fill={P.gold} />
    </svg>
  );
}

export function PreQualIcon({ size = 24, variant = "navy", style = {} }) {
  // Body color flips by variant — gauge arc, symbols, and tick mark inherit
  const arcColor = variant === "cream" ? P.cream : P.navy;
  // Gold elements (needle, hub) stay gold in both variants — they're the signature accent
  const showSymbols = size >= 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Gauge arc */}
      <path
        d="M 8 50 A 28 28 0 0 1 64 50"
        stroke={arcColor}
        strokeWidth={size <= 22 ? 6 : size <= 32 ? 5 : 4}
        fill="none"
        strokeLinecap="round"
      />
      {/* ¢ on the lower-left (only at 40px+) */}
      {showSymbols && (
        <text
          x="16"
          y="48"
          textAnchor="middle"
          fontFamily="'DM Sans', sans-serif"
          fontSize="13"
          fontWeight="700"
          fill={arcColor}
        >
          ¢
        </text>
      )}
      {/* Top tick mark (only at 40px+) */}
      {showSymbols && (
        <line
          x1="36" y1="22" x2="36" y2="17"
          stroke={arcColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {/* $ on the lower-right (only at 40px+) */}
      {showSymbols && (
        <text
          x="56"
          y="48"
          textAnchor="middle"
          fontFamily="'DM Sans', sans-serif"
          fontSize="14"
          fontWeight="700"
          fill={arcColor}
        >
          $
        </text>
      )}
      {/* Gold needle pointing toward $ */}
      <line
        x1="36" y1="50" x2="52" y2="30"
        stroke={P.gold}
        strokeWidth={size <= 22 ? 6 : size <= 32 ? 5 : 3.5}
        strokeLinecap="round"
      />
      {/* Gold hub */}
      <circle cx="36" cy="50" r={size <= 22 ? 6 : size <= 32 ? 5 : 4} fill={P.gold} />
    </svg>
  );
}

export function CashToCloseIcon({ size = 24, variant = "navy", dollarColor: dollarOverride, style = {} }) {
  const outlineColor = variant === "cream" ? P.cream : P.navy;
  const dollarColor = dollarOverride || P.gold;
  const strokeWidth = size <= 22 ? 5 : size <= 30 ? 3.5 : 4.5;
  const fontSize = size <= 22 ? 36 : size <= 30 ? 34 : 32;
  const baseline = size <= 22 ? 50 : size <= 30 ? 49 : 48;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <path
        d="M 36 12 L 62 32 L 62 58 L 10 58 L 10 32 Z"
        fill="none"
        stroke={outlineColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text
        x="36"
        y={baseline}
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        fill={dollarColor}
      >
        $
      </text>
    </svg>
  );
}

// Seller Credit Optimizer icon ("the Deploy"): a gold coin (with $) at
// the top, splitting into four cream branches that fan downward. The
// four branches represent the four deployments (price cut, closing
// costs, points, 2-1). Matches the CashToCloseIcon's $-glyph rendering
// technique (text element, hardcoded DM Sans family) so the two gold
// coins look identical across browsers. Color contract matches the
// other tool icons: variant="navy" is for light backgrounds (default);
// variant="cream" is for dark backgrounds (sidebar, mobile toolbar,
// ToolsCTA card top).
export function SellerCreditIcon({ size = 24, variant = "navy", style = {} }) {
  const branchColor = variant === "cream" ? P.cream : P.navy;
  // The coin stays goldLight in both variants (signature accent).
  const coinColor = P.goldLight;
  // $ glyph stays navyDark on the gold coin in both variants. NavyDark
  // on goldLight gives ~7:1 contrast; the alternative cream-on-gold
  // tested at ~2:1 and failed at 14px. This also matches the CashToClose
  // coin so the two gold coins read identically across the site.
  const dollarColor = P.navyDark;
  const branchStrokeWidth = size <= 20 ? 4 : 3;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Coin */}
      <circle cx="24" cy="12" r="8.5" fill={coinColor} />
      {/* $ glyph: same text technique as CashToCloseIcon */}
      <text
        x="24"
        y="16.4"
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize="12"
        fontWeight="700"
        fill={dollarColor}
      >
        $
      </text>
      {/* Four branches fanning down from the coin */}
      <path d="M24 22.5 C24 30 12 30 10 39" fill="none" stroke={branchColor} strokeWidth={branchStrokeWidth} strokeLinecap="round" />
      <path d="M24 22.5 C24 31 19.5 33 18.5 40" fill="none" stroke={branchColor} strokeWidth={branchStrokeWidth} strokeLinecap="round" />
      <path d="M24 22.5 C24 31 28.5 33 29.5 40" fill="none" stroke={branchColor} strokeWidth={branchStrokeWidth} strokeLinecap="round" />
      <path d="M24 22.5 C24 30 36 30 38 39" fill="none" stroke={branchColor} strokeWidth={branchStrokeWidth} strokeLinecap="round" />
    </svg>
  );
}
