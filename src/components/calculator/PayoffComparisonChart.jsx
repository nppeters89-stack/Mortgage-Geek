import { useMemo, useId } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { P, F } from "../../theme";
import { fmt, withAlpha } from "../../utils/format";
import { formatPayoff } from "../../utils/math";

// Balance-over-time comparison for the Pay It Off Faster feature: the baseline
// schedule (dashed gray, full term) against the with-extra schedule (program
// color, terminates at payoff). No animation so per-keystroke edits do not
// replay. Colors come from theme tokens, prog.color, or withAlpha only.
export function PayoffComparisonChart({ originalResult, improvedResult, prog, term }) {
  const gradId = useId();

  const chartData = useMemo(() => {
    const origMap = new Map(originalResult.data.map((d) => [d.year, d.balance]));
    const impMap = new Map(improvedResult.data.map((d) => [d.year, d.balance]));
    // Year 0 is the starting balance (the full loan) for both series.
    const rows = [{ year: 0, original: prog.loan, extra: prog.loan }];
    for (let y = 1; y <= term; y++) {
      rows.push({
        year: y,
        original: origMap.has(y) ? origMap.get(y) : null,
        // extra goes null once the improved schedule pays off, so the line ends.
        extra: impMap.has(y) ? impMap.get(y) : null,
      });
    }
    return rows;
  }, [originalResult, improvedResult, term, prog.loan]);

  const legendItem = { display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 500, color: P.warmGray };

  // "Paid off" reference-line label: render just inside the top of the plot (so
  // the chart's top margin cannot clip it) and clamp the horizontal text anchor
  // so it stays in view when payoff lands near the left or right edge.
  const payoffYear = improvedResult.payoffMonth / 12;
  const frac = term > 0 ? payoffYear / term : 0;
  // Sit the label beside the line (to the right by default so it is isolated from
  // the dashes), flipping to the left only when payoff is near the right edge.
  const labelOnLeft = frac > 0.82;
  const labelAnchor = labelOnLeft ? "end" : "start";
  const labelDx = labelOnLeft ? -6 : 6;
  const renderPaidOff = ({ viewBox }) =>
    viewBox ? (
      <text x={viewBox.x + labelDx} y={viewBox.y + 12} textAnchor={labelAnchor} fontFamily={F.body} fontSize={10} fontWeight={600} fill={prog.color}>
        Paid off
      </text>
    ) : null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const orig = payload.find((p) => p.dataKey === "original")?.value;
    const ext = payload.find((p) => p.dataKey === "extra")?.value;
    const extPaidOff = ext === null || ext === undefined;
    const tipRow = { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(P.white, 0.75), marginBottom: 4 };
    const tipDot = { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 };
    return (
      <div style={{ background: P.navyDark, borderRadius: 8, padding: "12px 16px", boxShadow: `0 4px 20px ${withAlpha(P.text, 0.2)}`, minWidth: 180 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: P.white, marginBottom: 8 }}>Year {label}</p>
        <p style={tipRow}>
          <span style={{ ...tipDot, background: P.warmGray }} />
          Original: {fmt(orig || 0)}
        </p>
        <p style={tipRow}>
          <span style={{ ...tipDot, background: prog.color }} />
          With extra: {extPaidOff ? "Paid off" : fmt(ext)}
        </p>
        {!extPaidOff && (
          <p style={{ fontSize: 11, color: withAlpha(P.white, 0.4), marginTop: 6, paddingTop: 6, borderTop: `1px solid ${withAlpha(P.white, 0.1)}` }}>
            Difference: {fmt((orig || 0) - ext)}
          </p>
        )}
      </div>
    );
  };

  const srOnly = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 };

  return (
    <div>
      <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={legendItem}>
          <svg width="24" height="10" aria-hidden="true" style={{ flexShrink: 0 }}>
            <line x1="1" y1="5" x2="23" y2="5" stroke={P.warmGray} strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
          </svg>
          Without extra payments
        </span>
        <span style={legendItem}>
          <svg width="24" height="10" aria-hidden="true" style={{ flexShrink: 0 }}>
            <line x1="1" y1="5" x2="23" y2="5" stroke={prog.color} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          With extra payments
        </span>
      </div>

      <div aria-hidden="true" style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={withAlpha(prog.color, 0.3)} />
                <stop offset="100%" stopColor={withAlpha(prog.color, 0.02)} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={withAlpha(P.text, 0.04)} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[0, term]}
              allowDecimals={false}
              tick={{ fill: P.warmGrayLight, fontSize: 11 }}
              axisLine={{ stroke: withAlpha(P.text, 0.08) }}
              tickLine={false}
              tickFormatter={(v) => `${v}y`}
            />
            <YAxis
              tick={{ fill: P.warmGrayLight, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={payoffYear}
              stroke={prog.color}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={renderPaidOff}
            />
            <Area
              type="monotone"
              dataKey="original"
              stroke={P.warmGray}
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="none"
              isAnimationActive={false}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="extra"
              stroke={prog.color}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p style={srOnly}>
        Without extra payments the loan pays off in {formatPayoff(originalResult.payoffMonth)} with {fmt(originalResult.totalInterest)} total interest; with extra payments it pays off in {formatPayoff(improvedResult.payoffMonth)} with {fmt(improvedResult.totalInterest)} total interest.
      </p>
    </div>
  );
}
