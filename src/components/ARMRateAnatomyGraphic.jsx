import { P, F } from "../theme";

// Line colors (Rate palette): the lifetime cap reuses the 4c caution amber
// (semantic ceiling); the floor uses a neutral dark grey.
const WARNING_ORANGE = P.caution;  // lifetime cap dashed line/label
const FLOOR_GRAY = P.navyLight;    // floor dashed line/label

const printColorCSS = `
  .arm-rate-anatomy svg,
  .arm-rate-anatomy svg * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

// ---------------------------------------------------------------------------
// External legend — replaces in-SVG labels that became unreadable on phones.
// Uses a CSS-grid auto-fit so it flows from 3 cols (desktop) to 2 (tablet)
// to 1 (phone) without media queries.
// ---------------------------------------------------------------------------
function LegendChip({ swatch, label, sub, color }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        background: P.cream,
        borderRadius: 8,
        border: `1px solid ${P.creamDark}`,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 4 }}>{swatch}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color, lineHeight: 1.3 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontFamily: F.body, fontSize: 11, color: P.warmGray, lineHeight: 1.4, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function SolidSwatch({ color, dashed, thick }) {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
      <line
        x1="0"
        y1="5"
        x2="22"
        y2="5"
        stroke={color}
        strokeWidth={thick ? "4" : "3"}
        strokeDasharray={dashed ? "4 3" : ""}
        strokeLinecap={thick ? "round" : "butt"}
      />
    </svg>
  );
}

function StepSwatch({ color }) {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
      <path d="M0,7 L6,7 L6,5 L12,5 L12,3 L18,3 L18,5 L22,5" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function ARMRateAnatomyGraphic() {
  return (
    <div className="arm-rate-anatomy" style={{ marginTop: 24, marginBottom: 24 }}>
      <style>{printColorCSS}</style>

      <h3
        style={{
          fontFamily: F.display,
          fontSize: 26,
          fontWeight: 400,
          color: P.navy,
          marginBottom: 4,
          lineHeight: 1.2,
        }}
      >
        How ARMs Work
      </h3>

      <div
        style={{
          fontFamily: F.body,
          fontSize: 13,
          fontStyle: "italic",
          color: P.warmGray,
          marginBottom: 28,
        }}
      >
        A 30-year mortgage, with the ARM rate adjusting after the initial fixed period
      </div>

      {/* Tighter viewBox (940 vs old 1100) — no minWidth, no horizontal scroll on phones.
          The right-side legend labels that used to live at x=912 are gone; the new
          external legend grid below carries that weight. */}
      <svg
        viewBox="0 0 940 460"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Diagram showing how an adjustable-rate mortgage interest rate changes over a 30-year loan term, including the initial fixed period at 3.5%, index movement, margin offset, lifetime cap of 5%, and rate ceiling of 8.5%."
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Background chart area */}
        <rect x="60" y="50" width="860" height="340" fill={P.creamDark} opacity="0.35" rx="6" />

        {/* LIFETIME CAP "FORBIDDEN ZONE" — navy band at top */}
        <rect x="60" y="50" width="860" height="40" fill={P.navy} opacity="0.92" />
        <text
          x="490"
          y="77"
          fontFamily="DM Sans, sans-serif"
          fontSize="15"
          fontWeight="700"
          fill={P.white}
          textAnchor="middle"
          letterSpacing="0.5"
        >
          RATE CEILING = 8.5%
        </text>

        {/* LIFETIME CAP LINE — thicker dashed for emphasis (4px stroke, longer dashes, rounded) */}
        <line
          x1="60"
          y1="90"
          x2="920"
          y2="90"
          stroke={WARNING_ORANGE}
          strokeWidth="4"
          strokeDasharray="9 5"
          strokeLinecap="round"
        />

        {/* Y-axis */}
        <line x1="60" y1="50" x2="60" y2="390" stroke={P.navy} strokeWidth="2" />
        <text
          x="22"
          y="220"
          fontFamily="DM Sans, sans-serif"
          fontSize="13"
          fontWeight="700"
          fill={P.navy}
          textAnchor="middle"
          transform="rotate(-90, 22, 220)"
        >
          Interest Rate
        </text>

        {/* X-axis — scaled to use the full chart width */}
        <line x1="60" y1="390" x2="920" y2="390" stroke={P.navy} strokeWidth="2" />
        {[
          [60, "0"],
          [203, "5 yrs"],
          [347, "10 yrs"],
          [490, "15 yrs"],
          [633, "20 yrs"],
          [777, "25 yrs"],
          [920, "30 yrs"],
        ].map(([x, l]) => (
          <g key={x}>
            <line x1={x} y1="390" x2={x} y2="396" stroke={P.navy} strokeWidth="2" />
            <text
              x={x}
              y="414"
              fontFamily="DM Sans, sans-serif"
              fontSize="13"
              fontWeight="600"
              fill={P.navy}
              textAnchor="middle"
            >
              {l}
            </text>
          </g>
        ))}
        <text
          x="490"
          y="438"
          fontFamily="DM Sans, sans-serif"
          fontSize="14"
          fontWeight="700"
          fill={P.navy}
          textAnchor="middle"
        >
          Loan Term
        </text>

        {/* All curves are rendered inside a transform group so we can keep the
            original (synchronized) path coordinates verbatim while remapping
            them onto the new wider chart area. Translate -47.5 + scale 1.075x
            shifts x=100..900 to x=60..920. DO NOT EDIT path coordinates. */}
        <g transform="translate(-47.5 0) scale(1.075 1)">
          {/* INDEX CURVE (SOFR/CMT) */}
          <path
            d="M 100,290 L 110,285 L 120,281 L 130,277 L 140,273 L 150,270 L 160,269 L 170,268 L 180,268 L 190,270 L 200,259 L 210,261 L 220,263 L 230,264 L 240,265 L 250,266 L 260,267 L 270,268 L 280,269 L 290,271 L 300,273 L 310,276 L 320,279 L 330,284 L 340,289 L 350,295 L 360,302 L 370,309 L 380,316 L 390,322 L 400,327 L 410,331 L 420,334 L 430,335 L 440,334 L 450,332 L 460,329 L 470,324 L 480,319 L 490,313 L 500,307 L 510,301 L 520,295 L 530,290 L 540,286 L 550,283 L 560,280 L 570,278 L 580,276 L 590,274 L 600,273 L 610,271 L 620,269 L 630,266 L 640,263 L 650,261 L 660,258 L 670,255 L 680,253 L 690,252 L 700,252 L 710,254 L 720,257 L 730,261 L 740,266 L 750,273 L 760,280 L 770,288 L 780,296 L 790,303 L 800,310 L 810,316 L 820,321 L 830,324 L 840,326 L 850,327 L 860,327 L 870,325 L 880,323 L 890,320 L 900,318"
            fill="none"
            stroke={P.warmGray}
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.55"
          />

          {/* MARGIN REFERENCE CURVE */}
          <path
            d="M 100,235 L 110,230 L 120,226 L 130,222 L 140,218 L 150,215 L 160,214 L 170,213 L 180,213 L 190,215 L 200,204 L 210,206 L 220,208 L 230,209 L 240,210 L 250,211 L 260,212 L 270,213 L 280,214 L 290,216 L 300,218 L 310,221 L 320,224 L 330,229 L 340,234 L 350,240 L 360,247 L 370,254 L 380,261 L 390,267 L 400,272 L 410,276 L 420,279 L 430,280 L 440,279 L 450,277 L 460,274 L 470,269 L 480,264 L 490,258 L 500,252 L 510,246 L 520,240 L 530,235 L 540,231 L 550,228 L 560,225 L 570,223 L 580,221 L 590,219 L 600,218 L 610,216 L 620,214 L 630,211 L 640,208 L 650,206 L 660,203 L 670,200 L 680,198 L 690,197 L 700,197 L 710,199 L 720,202 L 730,206 L 740,211 L 750,218 L 760,225 L 770,233 L 780,241 L 790,248 L 800,255 L 810,261 L 820,266 L 830,269 L 840,271 L 850,272 L 860,272 L 870,270 L 880,268 L 890,265 L 900,263"
            fill="none"
            stroke={P.warmGrayLight}
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.65"
          />

          {/* FULLY INDEXED ARM stair-step */}
          <path
            d="M 233,211 L 263,211 L 263,214 L 293,214 L 293,220 L 323,220 L 323,233 L 353,233 L 353,253 L 383,253 L 383,271 L 413,271 L 413,280 L 443,280 L 443,275 L 473,275 L 473,259 L 503,259 L 503,241 L 533,241 L 533,229 L 563,229 L 563,221 L 593,221 L 593,216 L 623,216 L 623,209 L 653,209 L 653,201 L 683,201 L 683,197 L 713,197 L 713,205 L 743,205 L 743,224 L 773,224 L 773,247 L 803,247 L 803,265 L 833,265 L 833,272 L 863,272 L 863,268 L 893,268 L 893,264 L 900,264"
            fill="none"
            stroke={P.gold}
            strokeWidth="3"
            strokeLinejoin="miter"
          />

          {/* ARM INITIAL FIXED PERIOD (years 0-5) — navy solid line */}
          <line x1="100" y1="325" x2="233" y2="325" stroke={P.navy} strokeWidth="4" />
          {/* Subtle vertical guide at year 5 */}
          <line
            x1="233"
            y1="325"
            x2="233"
            y2="211"
            stroke={P.navy}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.35"
          />

          {/* FLOOR */}
          <line
            x1="100"
            y1="355"
            x2="900"
            y2="355"
            stroke={FLOOR_GRAY}
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.5"
          />
        </g>

        {/* The single critical inline annotation — the 3.5% anchor on the navy bar */}
        <text
          x="135"
          y="345"
          fontFamily="DM Sans, sans-serif"
          fontSize="14"
          fontWeight="700"
          fill={P.navy}
        >
          3.5%
        </text>
      </svg>

      {/* External legend — auto-flows 1/2/3 columns by container width.
          Replaces every in-SVG legend label so nothing becomes unreadable
          when the chart shrinks below ~600px. */}
      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginTop: 16,
        }}
      >
        <LegendChip
          color={P.navy}
          label="ARM Initial Fixed (3.5%)"
          sub="First 5 years, locked rate"
          swatch={<SolidSwatch color={P.navy} />}
        />
        <LegendChip
          color={P.gold}
          label="Fully Indexed ARM Rate"
          sub="Adjusts each period: index + margin"
          swatch={<StepSwatch color={P.gold} />}
        />
        <LegendChip
          color={P.textLight}
          label="+ Margin"
          sub="Fixed lender markup"
          swatch={<SolidSwatch color={P.warmGrayLight} dashed />}
        />
        <LegendChip
          color={P.warmGray}
          label="SOFR / CMT Index"
          sub="Market reference rate"
          swatch={<SolidSwatch color={P.warmGray} dashed />}
        />
        <LegendChip
          color={WARNING_ORANGE}
          label="Lifetime Cap (+5.0%)"
          sub="Maximum rate increase"
          swatch={<SolidSwatch color={WARNING_ORANGE} dashed thick />}
        />
        <LegendChip
          color={FLOOR_GRAY}
          label="Floor"
          sub="Minimum rate"
          swatch={<SolidSwatch color={FLOOR_GRAY} dashed />}
        />
      </div>

      <p
        style={{
          fontFamily: F.body,
          fontSize: 13,
          color: P.warmGray,
          marginTop: 24,
          lineHeight: 1.7,
          borderTop: `1px solid ${P.creamDark}`,
          paddingTop: 20,
        }}
      >
        <strong style={{ color: P.navy, fontWeight: 700 }}>Reading the diagram:</strong>{" "}
        A borrower starts with the navy ARM Initial Fixed rate (3.5%) for the first 5 years.
        After that, the rate adjusts to the Fully Indexed ARM Rate (sage green) at each adjustment
        period, calculated as the SOFR/CMT index plus a fixed margin. Notice how the sage stair-step
        tracks the gold +Margin curve closely. Each step is a discrete version of the same underlying
        value. The dashed orange line marks the Lifetime Cap. The shaded navy region above is the
        rate ceiling: the rate can never exceed 8.5%, no matter what happens to market rates.
      </p>
    </div>
  );
}
