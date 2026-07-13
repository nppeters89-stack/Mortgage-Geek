import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { GOLD_HOUSING_RATIO, LONG_RUN_AVG } from "../data/geekCharts";

// Gold-to-Housing Ratio line chart on a dark charcoal canvas. Colors come from
// CHART_COLORS / P tokens (via withAlpha for translucency); no hardcoded hex.
// No animation. Three story points are marked with ReferenceDots. An sr-only
// data table mirrors the series so the visual is indexable without JS.
export function GoldHousingRatioChart() {
  const { years, ratio, home, gold } = GOLD_HOUSING_RATIO;

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], home: home[i], gold: gold[i] })),
    [years, ratio, home, gold]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const rowStyle = { fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 };
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 170 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: CHART_COLORS.gold, marginBottom: 6 }}>{Math.round(d.ratio)} oz to buy a home</p>
        <p style={rowStyle}>Avg home price: {fmt(d.home)}</p>
        <p style={{ ...rowStyle, marginBottom: 0 }}>Gold per ounce: {fmt(d.gold)}</p>
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
      label={{ value: label, position, fill: color, fontSize: 11, fontFamily: F.body, fontWeight: 600 }}
    />
  );

  return (
    <div className="ghr-chart">
      <style>{`
        .ghr-chart { width: 100%; }
        .ghr-plot { width: 100%; height: 380px; }
        @media (max-width: 640px) { .ghr-plot { height: 320px; } }
        .ghr-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="ghr-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 24, right: 20, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1970, 2026]}
              ticks={[1970, 1980, 1990, 2000, 2010, 2020, 2026]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[0, 800]}
              ticks={[0, 100, 200, 300, 400, 500, 600, 700, 800]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v} oz`}
              width={54}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            <ReferenceLine
              y={LONG_RUN_AVG}
              stroke={CHART_COLORS.axis}
              strokeDasharray="5 5"
              label={{ value: `avg ${LONG_RUN_AVG} oz`, position: "insideTopLeft", fill: tickColor, fontSize: 10, fontFamily: F.body }}
            />
            <Line
              type="monotone"
              dataKey="ratio"
              stroke={CHART_COLORS.gold}
              strokeWidth={2.75}
              dot={false}
              isAnimationActive={false}
            />
            {dot(2001, 778.7, CHART_COLORS.accent, "2001", "top")}
            {dot(1980, 124.2, CHART_COLORS.line, "1980", "bottom")}
            {dot(2026, 124.2, CHART_COLORS.gold, "2026", "bottom")}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="ghr-sr-only">
        <table>
          <caption>Gold to housing ratio by year: ounces of gold to buy the average American home, with the underlying average home price and gold price per ounce.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Ounces of gold to buy a home</th>
              <th scope="col">Average home price</th>
              <th scope="col">Gold price per ounce</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{Math.round(d.ratio)} oz</td>
                <td>{fmt(d.home)}</td>
                <td>{fmt(d.gold)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
