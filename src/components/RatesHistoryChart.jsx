import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { withAlpha } from "../utils/format";
import { RATES_HISTORY } from "../data/geekCharts";

// 10-Year Treasury and 30-Year Mortgage line chart on a dark charcoal canvas.
// Three series: the thick trend (moving average) sits beneath the two spot lines.
// connectNulls is false so the mortgage line breaks before 1971 and the trend
// before 1962 instead of interpolating. Colors from CHART_COLORS / P (withAlpha
// for translucency); no hardcoded hex. No animation. sr-only table mirrors the
// series for crawlers.
export function RatesHistoryChart() {
  const { years, treasury, mortgage, trend } = RATES_HISTORY;

  const data = useMemo(
    () => years.map((year, i) => ({ year, treasury: treasury[i], mortgage: mortgage[i], trend: trend[i] })),
    [years, treasury, mortgage, trend]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);

  const SERIES = [
    { key: "mortgage", label: "30-year mortgage (since 1971)", color: CHART_COLORS.mortgage, weight: 3 },
    { key: "treasury", label: "10-year Treasury", color: CHART_COLORS.line, weight: 3 },
    { key: "trend", label: "10-year trend", color: CHART_COLORS.trend, weight: 5 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const row = (label, value, color) => (
      value === null || value === undefined ? null : (
        <p key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
          {label}: {value.toFixed(2)}%
        </p>
      )
    );
    const spread = (d.mortgage !== null && d.mortgage !== undefined && d.treasury !== null && d.treasury !== undefined)
      ? (d.mortgage - d.treasury) : null;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 190 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        {row("30-yr mortgage", d.mortgage, CHART_COLORS.mortgage)}
        {row("10-yr Treasury", d.treasury, CHART_COLORS.line)}
        {row("10-yr trend", d.trend, CHART_COLORS.trend)}
        {spread !== null && (
          <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), marginTop: 6, paddingTop: 6, borderTop: `1px solid ${withAlpha(CHART_COLORS.line, 0.12)}`, marginBottom: 0 }}>
            Spread: {spread.toFixed(2)} pts
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="rhc-chart">
      <style>{`
        .rhc-chart { width: 100%; }
        .rhc-legend { display: flex; flex-wrap: wrap; gap: 16px 20px; margin-bottom: 16px; }
        .rhc-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
        .rhc-swatch { display: inline-block; width: 18px; border-radius: 999px; flex-shrink: 0; }
        .rhc-plot { width: 100%; height: 400px; }
        @media (max-width: 640px) { .rhc-plot { height: 340px; } }
        .rhc-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="rhc-legend">
        {SERIES.map((s) => (
          <span key={s.key} className="rhc-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.75) }}>
            <span className="rhc-swatch" style={{ height: s.weight, background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="rhc-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 20, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1953, 2026]}
              ticks={[1960, 1970, 1980, 1990, 2000, 2010, 2020, 2026]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[0, 18]}
              ticks={[0, 3, 6, 9, 12, 15, 18]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            {/* Trend drawn first so it sits beneath the two spot lines. */}
            <Line type="monotone" dataKey="trend" stroke={CHART_COLORS.trend} strokeWidth={5} strokeOpacity={0.85} dot={false} connectNulls={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="treasury" stroke={CHART_COLORS.line} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="mortgage" stroke={CHART_COLORS.mortgage} strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />
            <ReferenceDot x={1981} y={16.64} r={5} fill={CHART_COLORS.accent} stroke={P.navyDark} strokeWidth={2} isFront />
            <ReferenceDot x={2026} y={6.43} r={5} fill={CHART_COLORS.mortgage} stroke={P.navyDark} strokeWidth={2} isFront />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="rhc-sr-only">
        <table>
          <caption>10-year Treasury yield, 30-year fixed mortgage rate, and the 10-year trend (trailing moving average of the Treasury), by year. Mortgage data begins 1971; trend begins 1962.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">10-year Treasury</th>
              <th scope="col">30-year mortgage</th>
              <th scope="col">10-year trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.treasury === null || d.treasury === undefined ? "n/a" : `${d.treasury.toFixed(2)}%`}</td>
                <td>{d.mortgage === null || d.mortgage === undefined ? "n/a" : `${d.mortgage.toFixed(2)}%`}</td>
                <td>{d.trend === null || d.trend === undefined ? "n/a" : `${d.trend.toFixed(2)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
