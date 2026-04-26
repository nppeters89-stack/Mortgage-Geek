import React from "react";
import { P, F } from "../theme";

// Hardcoded SVG-only colors (no theme equivalent):
//   #E89B3F = warning orange used for the lifetime cap dashed line/label
//   #9B9488 = floor gray used for the dashed floor line/label
const WARNING_ORANGE = "#E89B3F";
const FLOOR_GRAY = "#9B9488";

const printColorCSS = `
  .arm-rate-anatomy svg,
  .arm-rate-anatomy svg * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

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

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox="0 0 1100 480"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Diagram showing how an adjustable-rate mortgage interest rate changes over a 30-year loan term, including the initial fixed period at 3.5%, index movement, margin offset, lifetime cap of 5%, and rate ceiling of 8.5%."
          style={{ width: "100%", height: "auto", display: "block", minWidth: 720 }}
        >
          {/* Background chart area */}
          <rect x="100" y="50" width="800" height="340" fill={P.creamDark} opacity="0.35" rx="6" />

          {/* LIFETIME CAP "FORBIDDEN ZONE" */}
          <rect x="100" y="50" width="800" height="40" fill={P.navy} opacity="0.92" />
          <text
            x="500"
            y="76"
            fontFamily="DM Sans, sans-serif"
            fontSize="14"
            fontWeight="700"
            fill={P.white}
            textAnchor="middle"
            letterSpacing="0.5"
          >
            RATE CEILING = 8.5%
          </text>

          {/* LIFETIME CAP LINE */}
          <line x1="100" y1="90" x2="900" y2="90" stroke={WARNING_ORANGE} strokeWidth="2.5" strokeDasharray="6 4" />
          <text x="912" y="94" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill={WARNING_ORANGE}>
            Lifetime Cap
          </text>
          <text x="912" y="112" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700" fill={P.goldMuted}>
            (+5.0% max)
          </text>

          {/* Y-axis */}
          <line x1="100" y1="50" x2="100" y2="390" stroke={P.navy} strokeWidth="2" />
          <text
            x="50"
            y="220"
            fontFamily="DM Sans, sans-serif"
            fontSize="14"
            fontWeight="700"
            fill={P.navy}
            textAnchor="middle"
            transform="rotate(-90, 50, 220)"
          >
            Interest Rate
          </text>

          {/* X-axis */}
          <line x1="100" y1="390" x2="900" y2="390" stroke={P.navy} strokeWidth="2" />
          <line x1="100" y1="390" x2="100" y2="396" stroke={P.navy} strokeWidth="2" />
          <text x="100" y="416" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">0</text>
          <line x1="233" y1="390" x2="233" y2="396" stroke={P.navy} strokeWidth="2" />
          <text x="233" y="416" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">5 yrs</text>
          <line x1="367" y1="390" x2="367" y2="396" stroke={P.navy} strokeWidth="2" />
          <text x="367" y="416" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">10 yrs</text>
          <line x1="500" y1="390" x2="500" y2="396" stroke={P.navy} strokeWidth="2" />
          <text x="500" y="416" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">15 yrs</text>
          <line x1="633" y1="390" x2="633" y2="396" stroke={P.navy} strokeWidth="2" />
          <text x="633" y="416" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">20 yrs</text>
          <line x1="767" y1="390" x2="767" y2="396" stroke={P.navy} strokeWidth="2" />
          <text x="767" y="416" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">25 yrs</text>
          <line x1="900" y1="390" x2="900" y2="396" stroke={P.navy} strokeWidth="2" />
          <text x="900" y="416" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">30 yrs</text>
          <text x="500" y="442" fontFamily="DM Sans, sans-serif" fontSize="14" fontWeight="700" fill={P.navy} textAnchor="middle">Loan Term</text>

          {/* INDEX CURVE (SOFR/CMT) — same shape as margin curve, offset down 55px.
              DO NOT EDIT path coordinates: synchronized with margin curve and stair-step. */}
          <path
            d="M 100,290 L 110,285 L 120,281 L 130,277 L 140,273 L 150,270 L 160,269 L 170,268 L 180,268 L 190,270 L 200,259 L 210,261 L 220,263 L 230,264 L 240,265 L 250,266 L 260,267 L 270,268 L 280,269 L 290,271 L 300,273 L 310,276 L 320,279 L 330,284 L 340,289 L 350,295 L 360,302 L 370,309 L 380,316 L 390,322 L 400,327 L 410,331 L 420,334 L 430,335 L 440,334 L 450,332 L 460,329 L 470,324 L 480,319 L 490,313 L 500,307 L 510,301 L 520,295 L 530,290 L 540,286 L 550,283 L 560,280 L 570,278 L 580,276 L 590,274 L 600,273 L 610,271 L 620,269 L 630,266 L 640,263 L 650,261 L 660,258 L 670,255 L 680,253 L 690,252 L 700,252 L 710,254 L 720,257 L 730,261 L 740,266 L 750,273 L 760,280 L 770,288 L 780,296 L 790,303 L 800,310 L 810,316 L 820,321 L 830,324 L 840,326 L 850,327 L 860,327 L 870,325 L 880,323 L 890,320 L 900,318"
            fill="none"
            stroke={P.warmGray}
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.55"
          />
          <text x="912" y="299" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill={P.warmGray}>
            SOFR/CMT
          </text>
          <text x="912" y="316" fontFamily="DM Sans, sans-serif" fontSize="10" fontStyle="italic" fill={P.warmGray}>
            (Index)
          </text>

          {/* MARGIN REFERENCE CURVE — synchronized with index, offset upward 55px.
              DO NOT EDIT path coordinates: drives the stair-step alignment. */}
          <path
            d="M 100,235 L 110,230 L 120,226 L 130,222 L 140,218 L 150,215 L 160,214 L 170,213 L 180,213 L 190,215 L 200,204 L 210,206 L 220,208 L 230,209 L 240,210 L 250,211 L 260,212 L 270,213 L 280,214 L 290,216 L 300,218 L 310,221 L 320,224 L 330,229 L 340,234 L 350,240 L 360,247 L 370,254 L 380,261 L 390,267 L 400,272 L 410,276 L 420,279 L 430,280 L 440,279 L 450,277 L 460,274 L 470,269 L 480,264 L 490,258 L 500,252 L 510,246 L 520,240 L 530,235 L 540,231 L 550,228 L 560,225 L 570,223 L 580,221 L 590,219 L 600,218 L 610,216 L 620,214 L 630,211 L 640,208 L 650,206 L 660,203 L 670,200 L 680,198 L 690,197 L 700,197 L 710,199 L 720,202 L 730,206 L 740,211 L 750,218 L 760,225 L 770,233 L 780,241 L 790,248 L 800,255 L 810,261 L 820,266 L 830,269 L 840,271 L 850,272 L 860,272 L 870,270 L 880,268 L 890,265 L 900,263"
            fill="none"
            stroke={P.goldLight}
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.65"
          />

          <text x="116" y="210" fontFamily="DM Sans, sans-serif" fontSize="13" fontStyle="italic" fontWeight="600" fill={P.goldMuted}>
            +Margin
          </text>

          {/* ARM INITIAL FIXED PERIOD (years 0-5) — navy solid line */}
          <line x1="100" y1="325" x2="233" y2="325" stroke={P.navy} strokeWidth="4" />
          <text x="166" y="317" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="600" fill={P.navy} textAnchor="middle">
            ARM Initial Fixed
          </text>
          <text x="166" y="345" fontFamily="DM Sans, sans-serif" fontSize="14" fontWeight="700" fill={P.navy} textAnchor="middle">
            3.5%
          </text>

          {/* Subtle vertical guide at year 5 */}
          <line x1="233" y1="325" x2="233" y2="211" stroke={P.navy} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" />

          {/* FULLY INDEXED ARM stair-step — sage; tracks margin curve.
              DO NOT EDIT path coordinates: synchronized with margin curve sampling. */}
          <path
            d="M 233,211 L 263,211 L 263,214 L 293,214 L 293,220 L 323,220 L 323,233 L 353,233 L 353,253 L 383,253 L 383,271 L 413,271 L 413,280 L 443,280 L 443,275 L 473,275 L 473,259 L 503,259 L 503,241 L 533,241 L 533,229 L 563,229 L 563,221 L 593,221 L 593,216 L 623,216 L 623,209 L 653,209 L 653,201 L 683,201 L 683,197 L 713,197 L 713,205 L 743,205 L 743,224 L 773,224 L 773,247 L 803,247 L 803,265 L 833,265 L 833,272 L 863,272 L 863,268 L 893,268 L 893,264 L 900,264"
            fill="none"
            stroke={P.sage}
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          <text x="912" y="221" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill={P.sageDark}>
            Fully Indexed
          </text>
          <text x="912" y="238" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill={P.sageDark}>
            ARM Rate
          </text>

          {/* FLOOR */}
          <line x1="100" y1="355" x2="900" y2="355" stroke={FLOOR_GRAY} strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
          <text x="912" y="359" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill={FLOOR_GRAY}>
            Floor
          </text>
        </svg>
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
