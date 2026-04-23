import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { P, F } from "../../theme";
import { fmt } from "../../utils/format";
import { generateAmortData } from "../../utils/math";

export function AmortizationChart({ principal = 300000, rate = 7, years = 30 }) {
  const { data } = useMemo(() => generateAmortData(principal, rate, years), [principal, rate, years]);
  const crossover = data.findIndex((d) => d.principal > d.interest);

  const CustomTooltip = ({ active: a, payload, label }) => {
    if (!a || !payload?.length) return null;
    return (
      <div style={{ background: P.navyDark, borderRadius: 8, padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", minWidth: 180 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Year {label}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: P.navy, flexShrink: 0 }} />
          Principal: {fmt(payload.find((p) => p.dataKey === "principal")?.value || 0)}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: P.gold, flexShrink: 0 }} />
          Interest: {fmt(payload.find((p) => p.dataKey === "interest")?.value || 0)}
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          Balance: {fmt(payload.find((p) => p.dataKey === "balance")?.value || 0)}
        </p>
      </div>
    );
  };

  return (
    <div className="content-card" style={{ maxWidth: 720, padding: "28px 24px" }}>
      <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 4 }}>How Your Payment Shifts Over Time</h4>
      <p style={{ fontSize: 12, color: P.warmGrayLight, lineHeight: 1.5, marginBottom: 16 }}>
        {fmt(principal)} loan at {Number(rate).toFixed(3)}% over {years} years — watch how interest dominates early, then principal takes over
      </p>
      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: P.warmGray }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: P.navy }} /> Principal Paid
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: P.warmGray }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: P.gold }} /> Interest Paid
        </span>
      </div>
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPrin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.navy} stopOpacity={0.6} />
                <stop offset="100%" stopColor={P.navy} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradInt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.gold} stopOpacity={0.6} />
                <stop offset="100%" stopColor={P.gold} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: P.warmGrayLight, fontSize: 11 }} axisLine={{ stroke: "rgba(0,0,0,0.08)" }} tickLine={false} />
            <YAxis tick={{ fill: P.warmGrayLight, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="interest" stackId="1" stroke={P.gold} fill="url(#gradInt)" strokeWidth={2} />
            <Area type="monotone" dataKey="principal" stackId="1" stroke={P.navy} fill="url(#gradPrin)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20, padding: "16px 18px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
          <strong>The crossover:</strong> On this loan, it takes about {crossover > 0 ? crossover + 1 : Math.round(years * 0.6)} years before you're paying more toward principal than interest each month. Every extra dollar you pay toward principal early on saves you multiples in interest over the life of the loan.
        </p>
      </div>
    </div>
  );
}
