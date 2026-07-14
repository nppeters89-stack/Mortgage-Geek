import { CHART_COLORS } from "../theme";
import { GOLD_HOUSING_RATIO, RATES_HISTORY, PAYMENT_BURDEN, PRICES_INCOME_INFLATION, RENT_LINE } from "../data/geekCharts";

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
};

const VW = 600, VH = 150, PAD = 10;

// Break a values array into polyline segments at nulls (so gaps do not interpolate).
function segments(years, values, yMax) {
  const n = years.length;
  const xOf = (i) => PAD + (i / (n - 1)) * (VW - 2 * PAD);
  const yOf = (v) => PAD + (1 - v / yMax) * (VH - 2 * PAD);
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
  const { data, yMax, lines } = cfg;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      {lines.flatMap((ln) =>
        segments(data.years, data[ln.key], yMax).map((seg, si) => (
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
