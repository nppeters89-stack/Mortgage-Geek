import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { PAYMENT_BURDEN, BURDEN_AVG } from "../data/geekCharts";

// The Mortgage Payment Burden: P&I on the median new home (20% down, that year's
// average 30-yr rate) as a percent of median family income, 1971 to 2026, on a
// dark charcoal canvas. Single cream line against the 56-year average. Colors
// from CHART_COLORS / P via withAlpha; no hardcoded hex. No animation. sr-only
// table mirrors the series for crawlers.
export function PaymentBurdenChart() {
  const { years, ratio, pmt, price, rate } = PAYMENT_BURDEN;

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], pmt: pmt[i], price: price[i], rate: rate[i] })),
    [years, ratio, pmt, price, rate]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 220 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>payment burden: {d.ratio.toFixed(1)}%</p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), lineHeight: 1.5, margin: 0 }}>
          {fmt(d.pmt)}/mo P&amp;I on a {fmt(d.price)} home at {d.rate.toFixed(2)}%
        </p>
      </div>
    );
  };

  const dot = (x, y, color, label, position) => (
    <ReferenceDot
      x={x}
      y={y}
      r={5}
      fill={color}
      stroke={P.navyDark}
      strokeWidth={2}
      isFront
      label={label ? { value: label, position, fill: color, fontSize: 12, fontFamily: F.body, fontWeight: 700 } : undefined}
    />
  );

  return (
    <div className="pbn-chart">
      <style>{`
        .pbn-chart { width: 100%; }
        .pbn-plot { width: 100%; height: 400px; }
        @media (max-width: 640px) { .pbn-plot { height: 340px; } }
        .pbn-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="pbn-plot" aria-hidden="true">
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
              domain={[0, 45]}
              ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            <ReferenceLine
              y={BURDEN_AVG}
              stroke={CHART_COLORS.axis}
              strokeDasharray="5 5"
              label={{ value: `avg ${BURDEN_AVG}%`, position: "insideTopLeft", fill: tickColor, fontSize: 10, fontFamily: F.body }}
            />
            <Line type="monotone" dataKey="ratio" stroke={CHART_COLORS.line} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            {dot(1981, 41.3, CHART_COLORS.accent, "41.3% 1981", "top")}
            {dot(2020, 16.0, CHART_COLORS.line, null)}
            {dot(2023, 26.5, CHART_COLORS.gold, null)}
            {dot(2026, 23.0, CHART_COLORS.line, "23.0% today", "left")}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="pbn-sr-only">
        <table>
          <caption>Mortgage payment burden by year: principal and interest on the median new home (20 percent down, that year's average 30-year rate) as a percent of median family income, with the monthly payment, home price, and rate.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Payment burden</th>
              <th scope="col">Monthly P&amp;I</th>
              <th scope="col">Median home price</th>
              <th scope="col">30-year rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.ratio.toFixed(1)}%</td>
                <td>{fmt(d.pmt)}</td>
                <td>{fmt(d.price)}</td>
                <td>{d.rate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
