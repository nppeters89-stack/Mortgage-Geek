import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { HOMES_IN_SP500 } from "../data/geekCharts";

// Homes Priced in the S&P 500, part 2: the same $25,000 run forward 30 years two
// ways. Home equity (heavier mortgage-red line, drawn on top) is $25K down on a
// $500K home appreciating at 5.4% with the loan amortizing to zero; the S&P path
// (equity-market blue) is $25K compounding at a 10% total return. The equity
// line is deliberately the heavier one. Colors from CHART_COLORS / P; no
// hardcoded hex; no animation. The 3.0M ceiling is deliberate headroom so the
// equity endpoint label sits in open space above the line; endpoint labels sit
// clear of the lines per the text-overlay rule ($2.42M above the equity endpoint
// in the headroom, $436K below the flat S&P endpoint), with no background boxes.
// sr-only table mirrors the series for crawlers.

// Y-axis tick: whole millions as $1M, half-millions as $0.5M.
const mFmt = (v) => (v === 0 ? "$0" : `$${(v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`);

export function BuyVsInvestChart() {
  const { projYears, equity, spPath, homeVal, loanBal } = HOMES_IN_SP500;

  const data = useMemo(
    () => projYears.map((year, i) => ({ year, equity: equity[i], spPath: spPath[i], homeVal: homeVal[i], loanBal: loanBal[i] })),
    [projYears, equity, spPath, homeVal, loanBal]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const last = projYears.length - 1;

  const SERIES = [
    { key: "equity", label: "Home equity ($500K home, 5% down)", color: CHART_COLORS.mortgage },
    { key: "spPath", label: "$25K in the S&P 500", color: CHART_COLORS.sp500 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 220 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>Year {d.year}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: CHART_COLORS.mortgage, flexShrink: 0 }} />
          home equity: {fmt(d.equity)}
        </p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: "0 0 6px" }}>
          home {fmt(d.homeVal)} / loan {fmt(d.loanBal)}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), margin: 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: CHART_COLORS.sp500, flexShrink: 0 }} />
          S&amp;P path: {fmt(d.spPath)}
        </p>
      </div>
    );
  };

  return (
    <div className="bvi-chart">
      <style>{`
        .bvi-chart { width: 100%; }
        .bvi-legend { display: flex; flex-wrap: wrap; gap: 16px 20px; margin-bottom: 16px; }
        .bvi-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
        .bvi-swatch { display: inline-block; width: 18px; height: 3px; border-radius: 999px; flex-shrink: 0; }
        .bvi-plot { width: 100%; height: 380px; min-height: 300px; }
        @media (max-width: 640px) { .bvi-plot { height: 320px; } }
        .bvi-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="bvi-legend">
        {SERIES.map((s) => (
          <span key={s.key} className="bvi-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.75) }}>
            <span className="bvi-swatch" style={{ background: s.color, height: s.key === "equity" ? 4 : 3 }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="bvi-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 24, right: 40, left: 14, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[0, 30]}
              ticks={[0, 5, 10, 15, 20, 25, 30]}
              allowDecimals={false}
              tickFormatter={(v) => (v === 0 ? "Year 0" : String(v))}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[0, 3000000]}
              ticks={[0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={mFmt}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            <Line type="monotone" dataKey="spPath" stroke={CHART_COLORS.sp500} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="equity" stroke={CHART_COLORS.mortgage} strokeWidth={3.25} dot={false} isAnimationActive={false} />
            {/* Year-30 endpoints. Labels clear of the lines: equity ABOVE in the 3.0M headroom, S&P BELOW where its line is nearly flat. */}
            <ReferenceDot x={30} y={equity[last]} r={5} fill={CHART_COLORS.mortgage} stroke={P.navyDark} strokeWidth={2} isFront
              label={{ value: "$2.42M", position: "top", fill: CHART_COLORS.mortgage, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
            <ReferenceDot x={30} y={spPath[last]} r={5} fill={CHART_COLORS.sp500} stroke={P.navyDark} strokeWidth={2} isFront
              label={{ value: "$436K", position: "bottom", fill: CHART_COLORS.sp500, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="bvi-sr-only">
        <table>
          <caption>Thirty-year projection of home equity versus a $25,000 S&amp;P 500 investment, from identical $25,000 starting dollars, by year, with the home value and loan balance behind the equity figure.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Home equity</th>
              <th scope="col">Home value</th>
              <th scope="col">Loan balance</th>
              <th scope="col">S&amp;P path</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{fmt(d.equity)}</td>
                <td>{fmt(d.homeVal)}</td>
                <td>{fmt(d.loanBal)}</td>
                <td>{fmt(d.spPath)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
