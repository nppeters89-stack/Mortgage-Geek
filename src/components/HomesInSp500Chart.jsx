import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { HOMES_IN_SP500, SP_RATIO_AVG } from "../data/geekCharts";

// Homes Priced in the S&P 500, part 1: how many units of the index it takes to
// buy the average home (home price / index level), on a dark charcoal canvas.
// One descending line (equity-market blue). The ratio has fallen for four
// decades because stocks outran houses. Colors from CHART_COLORS / P via
// withAlpha; no hardcoded hex. No animation. Reference dots mark the 1982 peak,
// the 2000 dot-com low, and today; per the text-overlay rule their labels sit in
// open space (1982 above its dot in the top headroom, today below its dot where
// the line dives into the bottom-right corner), never on the line, and with no
// background boxes. sr-only table mirrors the series for crawlers.

// Index level formatted with two decimals and thousands separators (7,570.03).
const spFmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function HomesInSp500Chart() {
  const { years, ratio, home, sp } = HOMES_IN_SP500;

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], home: home[i], sp: sp[i] })),
    [years, ratio, home, sp]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const yAt = (yr) => ratio[years.indexOf(yr)];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 210 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}{d.year === 2026 ? " (as of Jul 13)" : ""}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: CHART_COLORS.sp500, flexShrink: 0 }} />
          home in S&amp;P units: {Math.round(d.ratio)}
        </p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: 0 }}>
          {fmt(d.home)} home / S&amp;P {spFmt(d.sp)}
        </p>
      </div>
    );
  };

  return (
    <div className="hsp-chart">
      <style>{`
        .hsp-chart { width: 100%; }
        .hsp-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .hsp-plot { height: 340px; } }
        .hsp-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="hsp-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 24, right: 24, left: 8, bottom: 4 }}>
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
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            <ReferenceLine
              y={SP_RATIO_AVG}
              stroke={CHART_COLORS.axis}
              strokeDasharray="6 5"
              label={{ value: `avg ${SP_RATIO_AVG}`, position: "insideTopRight", fill: withAlpha(CHART_COLORS.line, 0.5), fontSize: 11, fontFamily: F.body }}
            />
            <Line type="monotone" dataKey="ratio" stroke={CHART_COLORS.sp500} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            {/* 1982 peak: accent dot, label ABOVE in the top headroom (line is at ~700, ceiling 800). */}
            <ReferenceDot x={1982} y={yAt(1982)} r={5} fill={CHART_COLORS.accent} stroke={P.navyDark} strokeWidth={2} isFront
              label={{ value: "700 · 1982", position: "top", fill: CHART_COLORS.accent, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
            {/* 2000 dot-com low: unlabeled cream dot. */}
            <ReferenceDot x={2000} y={yAt(2000)} r={4.5} fill={CHART_COLORS.line} stroke={P.navyDark} strokeWidth={2} isFront />
            {/* Today: sp500-color dot, label BELOW because the line descends into this corner. */}
            <ReferenceDot x={2026} y={yAt(2026)} r={5} fill={CHART_COLORS.sp500} stroke={P.navyDark} strokeWidth={2} isFront
              label={{ value: "68 today", position: "bottom", fill: CHART_COLORS.sp500, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="hsp-sr-only">
        <table>
          <caption>Units of the S&amp;P 500 index needed to buy the average American home, by year, with the underlying average home price and S&amp;P 500 index level.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Home in S&amp;P 500 units</th>
              <th scope="col">Average home price</th>
              <th scope="col">S&amp;P 500 level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{Math.round(d.ratio)}</td>
                <td>{fmt(d.home)}</td>
                <td>{spFmt(d.sp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
