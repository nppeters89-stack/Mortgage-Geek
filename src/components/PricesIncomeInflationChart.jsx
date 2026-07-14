import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { PRICES_INCOME_INFLATION } from "../data/geekCharts";

// Home prices, family income, and inflation, all indexed to 1970 = 100, on a dark
// charcoal canvas. Indexed-only view (no native-units toggle); the tooltip carries
// the raw dollar and CPI values. The income series ends at 2024 (connectNulls
// false so the line stops there, no interpolation to 2025). Colors from
// CHART_COLORS / P via withAlpha; no hardcoded hex. No animation. sr-only table
// mirrors the series for crawlers.
export function PricesIncomeInflationChart() {
  const { years, homeIdx, cpiIdx, incomeIdx, home, cpi, income } = PRICES_INCOME_INFLATION;

  const data = useMemo(
    () => years.map((year, i) => ({ year, homeIdx: homeIdx[i], incomeIdx: incomeIdx[i], cpiIdx: cpiIdx[i], home: home[i], income: income[i], cpi: cpi[i] })),
    [years, homeIdx, cpiIdx, incomeIdx, home, cpi, income]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const isNull = (v) => v === null || v === undefined;

  const SERIES = [
    { key: "homeIdx", label: "Average home price", color: CHART_COLORS.mortgage },
    { key: "incomeIdx", label: "Median family income (through 2024)", color: CHART_COLORS.income },
    { key: "cpiIdx", label: "Inflation (CPI)", color: CHART_COLORS.line },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const idxRow = (label, value, color) =>
      isNull(value) ? null : (
        <p key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
          {label}: {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </p>
      );
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 210 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        {idxRow("Home", d.homeIdx, CHART_COLORS.mortgage)}
        {idxRow("Income", d.incomeIdx, CHART_COLORS.income)}
        {idxRow("CPI", d.cpiIdx, CHART_COLORS.line)}
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${withAlpha(CHART_COLORS.line, 0.12)}`, fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), lineHeight: 1.6 }}>
          <div>Home: {fmt(d.home)}</div>
          {!isNull(d.income) && <div>Income: {fmt(d.income)}</div>}
          <div>CPI index {d.cpi.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
        </div>
      </div>
    );
  };

  const endDot = (x, y, color, label) => (
    <ReferenceDot
      x={x}
      y={y}
      r={5}
      fill={color}
      stroke={P.navyDark}
      strokeWidth={2}
      isFront
      label={{ value: label, position: "left", fill: color, fontSize: 12, fontFamily: F.body, fontWeight: 700 }}
    />
  );

  return (
    <div className="pii-chart">
      <style>{`
        .pii-chart { width: 100%; }
        .pii-legend { display: flex; flex-wrap: wrap; gap: 16px 20px; margin-bottom: 16px; }
        .pii-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
        .pii-swatch { display: inline-block; width: 18px; height: 3px; border-radius: 999px; flex-shrink: 0; }
        .pii-plot { width: 100%; height: 400px; }
        @media (max-width: 640px) { .pii-plot { height: 340px; } }
        .pii-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="pii-legend">
        {SERIES.map((s) => (
          <span key={s.key} className="pii-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.75) }}>
            <span className="pii-swatch" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="pii-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1970, 2025]}
              ticks={[1970, 1980, 1990, 2000, 2010, 2020, 2025]}
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
            <Line type="monotone" dataKey="cpiIdx" stroke={CHART_COLORS.line} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="incomeIdx" stroke={CHART_COLORS.income} strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="homeIdx" stroke={CHART_COLORS.mortgage} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            {endDot(2025, 1950.1, CHART_COLORS.mortgage, "19.5x")}
            {endDot(2024, 1072.3, CHART_COLORS.income, "10.7x")}
            {endDot(2025, 830.4, CHART_COLORS.line, "8.3x")}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="pii-sr-only">
        <table>
          <caption>Home price, median family income, and inflation (CPI) by year, each indexed to 1970 = 100, with the underlying average home price and median family income in dollars. Income runs through 2024.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Home index</th>
              <th scope="col">Income index</th>
              <th scope="col">CPI index</th>
              <th scope="col">Average home price</th>
              <th scope="col">Median family income</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.homeIdx}</td>
                <td>{isNull(d.incomeIdx) ? "n/a" : d.incomeIdx}</td>
                <td>{d.cpiIdx}</td>
                <td>{fmt(d.home)}</td>
                <td>{isNull(d.income) ? "n/a" : fmt(d.income)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
