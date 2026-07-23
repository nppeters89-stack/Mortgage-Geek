import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { PRICE_TO_INCOME, PTI_AVG } from "../data/geekCharts";

// The Price-to-Income Ratio: median new home sales price over median family
// income, 1971 to 2026, on a dark charcoal canvas. Single cream line against
// the 56-year average (dashed reference line at 3.52), mirroring the payment
// burden chart's treatment. Colors from CHART_COLORS / P via withAlpha; no
// hardcoded hex. The y-axis floors at 2 (the series sits 2.45 to 4.67, so a
// zero floor would flatten the shape) and ceilings at 5.5 for headroom, so the
// 2022 peak label sits well clear above the line per the text-overlay rule.
// sr-only table mirrors the series for crawlers.
export function PriceToIncomeChart() {
  const { years, ratio, price, income } = PRICE_TO_INCOME;

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], price: price[i], income: income[i] })),
    [years, ratio, price, income]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const ratioAt = (yr) => ratio[years.indexOf(yr)];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 220 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>price to income: {d.ratio.toFixed(2)}x</p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), lineHeight: 1.5, margin: 0 }}>
          {fmt(d.price)} median new home / {fmt(d.income)} median family income
        </p>
      </div>
    );
  };

  return (
    <div className="pti-chart">
      <style>{`
        .pti-chart { width: 100%; }
        .pti-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .pti-plot { height: 340px; } }
        .pti-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="pti-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 24, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1971, 2026]}
              ticks={[1980, 1990, 2000, 2010, 2020, 2026]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[2, 5.5]}
              ticks={[2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}x`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            {/* 56-year average (the essay and methodology state the span). The
                terse "avg 3.52x" matches the payment burden chart's label and
                stays short enough that the 1980s rise in the data line never
                reaches it at narrow mobile widths. */}
            <ReferenceLine
              y={PTI_AVG}
              stroke={CHART_COLORS.axis}
              strokeDasharray="5 5"
              label={{ value: `avg ${PTI_AVG}x`, position: "insideTopLeft", fill: tickColor, fontSize: 10, fontFamily: F.body }}
            />
            <Line type="monotone" dataKey="ratio" stroke={CHART_COLORS.line} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            {/* 2022 peak: the hardest door ever. Red dot with a custom label
                lifted 16px above the dot center (Recharts' "top" pins a fixed
                small offset that stays cramped no matter the ceiling), centered
                so it clears the line on both sides. */}
            <ReferenceDot x={2022} y={ratioAt(2022)} r={5} fill={CHART_COLORS.accent} stroke={P.navyDark} strokeWidth={2} isFront
              label={({ viewBox }) => (
                <text x={viewBox.x} y={viewBox.y - 16} textAnchor="middle" fill={CHART_COLORS.accent} fontSize={12} fontFamily={F.body} fontWeight={700}>4.67x 2022</text>
              )} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="pti-sr-only">
        <table>
          <caption>Price-to-income ratio by year: median new home sales price divided by median family income, 1971 to 2026, with the underlying home price and family income.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Price to income</th>
              <th scope="col">Median new home price</th>
              <th scope="col">Median family income</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.ratio.toFixed(2)}x</td>
                <td>{fmt(d.price)}</td>
                <td>{fmt(d.income)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
