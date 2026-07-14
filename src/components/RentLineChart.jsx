import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { withAlpha } from "../utils/format";
import { RENT_LINE } from "../data/geekCharts";

// The Rent Line: CPI rent of primary residence vs average home price, both
// indexed to 1970 = 100, on a dark charcoal canvas. Rent (red) is drawn heavier
// and on top; it is the point of the chart (it has no down years). Colors from
// CHART_COLORS / P via withAlpha; no hardcoded hex. No animation. Tooltip colors
// each year-over-year change by sign (negative gold, positive red) so a scrubbing
// viewer sees negatives only ever in the home row. sr-only table mirrors the
// series for crawlers.
export function RentLineChart() {
  const { years, rentIdx, homeIdx, rentYoY, homeYoY } = RENT_LINE;

  const data = useMemo(
    () => years.map((year, i) => ({ year, rentIdx: rentIdx[i], homeIdx: homeIdx[i], rentYoY: rentYoY[i], homeYoY: homeYoY[i] })),
    [years, rentIdx, homeIdx, rentYoY, homeYoY]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const isNull = (v) => v === null || v === undefined;

  const SERIES = [
    { key: "rentIdx", label: "Rent (CPI rent of primary residence)", color: CHART_COLORS.mortgage },
    { key: "homeIdx", label: "Average home price", color: CHART_COLORS.line },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const row = (label, idx, yoy, color) => (
      <p key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
        {label}: {Math.round(idx)}
        {!isNull(yoy) && (
          <span style={{ color: yoy < 0 ? CHART_COLORS.gold : CHART_COLORS.mortgage, fontWeight: 600 }}>
            ({yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}% YoY)
          </span>
        )}
      </p>
    );
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 210 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}{d.year === 2026 ? " (partial year)" : ""}</p>
        {row("rent", d.rentIdx, d.rentYoY, CHART_COLORS.mortgage)}
        {row("home", d.homeIdx, d.homeYoY, CHART_COLORS.line)}
      </div>
    );
  };

  const endLabel = (x, y, color, label) => (
    <ReferenceDot x={x} y={y} r={5} fill={color} stroke={P.navyDark} strokeWidth={2} isFront
      label={{ value: label, position: "left", fill: color, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
  );

  return (
    <div className="rl-chart">
      <style>{`
        .rl-chart { width: 100%; }
        .rl-legend { display: flex; flex-wrap: wrap; gap: 16px 20px; margin-bottom: 16px; }
        .rl-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
        .rl-swatch { display: inline-block; width: 18px; height: 3px; border-radius: 999px; flex-shrink: 0; }
        .rl-plot { width: 100%; height: 400px; }
        @media (max-width: 640px) { .rl-plot { height: 340px; } }
        .rl-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="rl-legend">
        {SERIES.map((s) => (
          <span key={s.key} className="rl-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.75) }}>
            <span className="rl-swatch" style={{ background: s.color, height: s.key === "rentIdx" ? 4 : 3 }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="rl-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 4 }}>
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
              domain={[0, 2000]}
              ticks={[0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toLocaleString()}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            <Line type="monotone" dataKey="homeIdx" stroke={CHART_COLORS.line} strokeWidth={2.5} strokeOpacity={0.85} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="rentIdx" stroke={CHART_COLORS.mortgage} strokeWidth={3.25} dot={false} isAnimationActive={false} />
            <ReferenceDot x={2010} y={536.3} r={5} fill={CHART_COLORS.gold} stroke={P.navyDark} strokeWidth={2} isFront />
            {endLabel(2026, 954.0, CHART_COLORS.mortgage, "rent: 0 down years")}
            {endLabel(2026, 1931.0, CHART_COLORS.line, "homes: 8 down years")}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="rl-sr-only">
        <table>
          <caption>Rent (CPI rent of primary residence) and average home price by year, each indexed to 1970 = 100, with each series' year-over-year percent change. Rent has no down years; home prices declined in eight years.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Rent index</th>
              <th scope="col">Home index</th>
              <th scope="col">Rent YoY</th>
              <th scope="col">Home YoY</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.rentIdx}</td>
                <td>{d.homeIdx}</td>
                <td>{isNull(d.rentYoY) ? "n/a" : `${d.rentYoY.toFixed(1)}%`}</td>
                <td>{isNull(d.homeYoY) ? "n/a" : `${d.homeYoY.toFixed(1)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
