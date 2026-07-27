import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { withAlpha } from "../utils/format";
import { RENT_SHARE, PAYMENT_BURDEN } from "../data/geekCharts";

// Rent as a share of income against the cost of buying, 1981 to 2026, on the
// dark charcoal canvas. The red line (rent share) is the subject: median gross
// rent over median family income, and it is currently at its highest share of
// the whole series. The cream dashed line is context: the same-year buy burden
// from PAYMENT_BURDEN, on the same income denominator, so the two are directly
// comparable. Colors from CHART_COLORS via withAlpha; no hardcoded hex. No text
// sits on either line; the series are told apart by color and dash in the
// legend. sr-only table mirrors the series for crawlers.

const RENT = CHART_COLORS.mortgage;      // red: rent share, the subject
const BUY = CHART_COLORS.line;           // cream: buy burden, context (dashed)
const BUY_OPACITY = 0.5;
const BUY_DASH = "6 4";

export function RentShareChart() {
  const { years, share, rentMo } = RENT_SHARE;

  // Slice the buy burden to the rent-share window. 1981 is the first shared
  // year; PAYMENT_BURDEN starts in 1971, so drop the first ten entries. Both
  // arrays then run 1981 to 2026 and align by index.
  const buy = useMemo(() => {
    const start = PAYMENT_BURDEN.years.indexOf(years[0]);
    return PAYMENT_BURDEN.ratio.slice(start);
  }, [years]);

  const data = useMemo(
    () => years.map((year, i) => ({ year, share: share[i], rentMo: rentMo[i], buy: buy[i] })),
    [years, share, rentMo, buy]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 220 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.85), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: RENT, flexShrink: 0 }} />
          rent: {d.share.toFixed(1)}% (~${d.rentMo}/mo)
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.6), margin: 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: BUY, flexShrink: 0 }} />
          buy the median new home: {d.buy.toFixed(1)}%
        </p>
      </div>
    );
  };

  return (
    <div className="rs-chart">
      <style>{`
        .rs-chart { width: 100%; }
        .rs-legend { display: flex; flex-wrap: wrap; gap: 16px 20px; margin-bottom: 16px; }
        .rs-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
        .rs-swatch-solid { display: inline-block; width: 20px; height: 4px; border-radius: 999px; flex-shrink: 0; }
        .rs-swatch-dashed { display: inline-block; width: 20px; height: 0; flex-shrink: 0; }
        .rs-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .rs-plot { height: 340px; } }
        .rs-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="rs-legend">
        <span className="rs-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.75) }}>
          <span className="rs-swatch-solid" style={{ background: RENT }} />Rent, share of income
        </span>
        <span className="rs-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.6) }}>
          <span className="rs-swatch-dashed" style={{ borderTop: `3px dashed ${BUY}`, opacity: BUY_OPACITY + 0.25 }} />Buy the median new home
        </span>
      </div>

      <div className="rs-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1981, 2026]}
              ticks={[1981, 1990, 2000, 2010, 2020, 2026]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[0, 45]}
              ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            {/* Buy burden first so it sits behind the subject line. */}
            <Line type="monotone" dataKey="buy" stroke={BUY} strokeWidth={2} strokeOpacity={BUY_OPACITY} strokeDasharray={BUY_DASH} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="share" stroke={RENT} strokeWidth={3.25} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="rs-sr-only">
        <table>
          <caption>Rent as a share of median family income by year, 1981 to 2026, with the estimated median gross rent per month, alongside the cost of buying the median new home as a share of the same income.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Rent share of income</th>
              <th scope="col">Estimated median rent</th>
              <th scope="col">Buy burden</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.share.toFixed(1)}%</td>
                <td>${d.rentMo}/mo</td>
                <td>{d.buy.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
