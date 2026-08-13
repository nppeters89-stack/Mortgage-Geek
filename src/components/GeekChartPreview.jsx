import { CHART_COLORS } from "../theme";
import { GOLD_HOUSING_RATIO, RATES_HISTORY, PAYMENT_BURDEN, PRICES_INCOME_INFLATION, RENT_LINE, HOMES_IN_SP500, FTHB_AGE, PRICE_TO_INCOME, STUDENT_LOANS_G19 } from "../data/geekCharts";

// Static sneak-peek sparkline for a Geek Charts hub card. Draws each chart's
// line(s) straight from the data, so it always shows the fully rendered shape,
// no animation, idle state, controls, axes, or legend. Colors come from
// CHART_COLORS; each chart keeps its real Y domain so the shape matches the full
// chart. Draw order runs bottom to top (the emphasis line is last). Decorative,
// so the SVG is aria-hidden (the card's title and tagline carry the meaning).
const C = CHART_COLORS;

const PREVIEWS = {
  "gold-to-housing-ratio": { data: GOLD_HOUSING_RATIO, yMax: 800, lines: [{ key: "ratio", color: C.gold, w: 2.5 }] },
  "treasury-yield-mortgage-rates": { data: RATES_HISTORY, yMax: 18, lines: [{ key: "trend", color: C.trend, w: 4 }, { key: "treasury", color: C.line, w: 1.75 }, { key: "mortgage", color: C.mortgage, w: 1.75 }] },
  "mortgage-payment-burden": { data: PAYMENT_BURDEN, yMax: 45, lines: [{ key: "ratio", color: C.line, w: 2.5 }] },
  "home-prices-income-inflation": { data: PRICES_INCOME_INFLATION, yMax: 2000, lines: [{ key: "cpiIdx", color: C.line, w: 1.75 }, { key: "incomeIdx", color: C.income, w: 1.75 }, { key: "homeIdx", color: C.mortgage, w: 1.75 }] },
  "rent-vs-home-prices": { data: RENT_LINE, yMax: 2000, lines: [{ key: "homeIdx", color: C.line, w: 1.5 }, { key: "rentIdx", color: C.mortgage, w: 3 }] },
  "homes-priced-in-sp500": { data: HOMES_IN_SP500, yMax: 800, lines: [{ key: "ratio", color: C.sp500, w: 2.5 }] },
  // Survey series sits at 28 to 40, far above zero, so this preview floors at
  // 18 (yMin) to match the chart's y-axis and show the real breakout shape
  // instead of a flat line pinned to the top. Adapter object gives it the
  // {years, key} shape the renderer expects without aliasing the data export.
  "first-time-homebuyer-age": { data: { years: FTHB_AGE.surveyYears, age: FTHB_AGE.surveyAges }, yMin: 18, yMax: 44, lines: [{ key: "age", color: C.line, w: 2.5 }] },
  // Ratio sits 2.45 to 4.67, floored at 2 (matching the chart) so the
  // sparkline shows the real shape instead of a flat line near the top.
  "price-to-income-ratio": { data: PRICE_TO_INCOME, yMin: 2, yMax: 5, lines: [{ key: "ratio", color: C.line, w: 2.5 }] },
  // The student loan mountain is the icon here, so a zero floor is correct: the
  // series climbs from $481B to $1,777B. The renderer wants a {years, key} shape;
  // an adapter object supplies the quarters as the x length without aliasing the
  // export. Red emphasis, matching the full chart's line convention.
  "the-other-down-payment": { data: { years: STUDENT_LOANS_G19.quarters, billions: STUDENT_LOANS_G19.billions }, yMin: 0, yMax: 2000, lines: [{ key: "billions", color: C.accent, w: 2.5 }] },
};

// Near-square viewBox (4:3) so the preview fills a square-ish card slot without
// horizontal-stretch distortion.
const VW = 320, VH = 240, PAD = 12;

// Break a values array into polyline segments at nulls (so gaps do not interpolate).
// yMin defaults to 0 so the existing zero-floored previews are unchanged; a
// chart whose series sits well above zero passes its real floor so the shape
// matches the full chart rather than hugging the top of the box.
function segments(years, values, yMax, yMin = 0) {
  const n = years.length;
  const xOf = (i) => PAD + (i / (n - 1)) * (VW - 2 * PAD);
  const yOf = (v) => PAD + (1 - (v - yMin) / (yMax - yMin)) * (VH - 2 * PAD);
  const segs = [];
  let cur = [];
  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (v === null || v === undefined) {
      if (cur.length) { segs.push(cur); cur = []; }
      continue;
    }
    cur.push(`${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`);
  }
  if (cur.length) segs.push(cur);
  return segs;
}

export function GeekChartPreview({ slug }) {
  const cfg = PREVIEWS[slug];
  if (!cfg) return null;
  const { data, yMax, yMin, lines } = cfg;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      {lines.flatMap((ln) =>
        segments(data.years, data[ln.key], yMax, yMin).map((seg, si) => (
          <polyline
            key={`${ln.key}-${si}`}
            points={seg.join(" ")}
            fill="none"
            stroke={ln.color}
            strokeWidth={ln.w}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))
      )}
    </svg>
  );
}
