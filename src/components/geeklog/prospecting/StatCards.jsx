import { T } from "../gl2Tokens";

// The cockpit diagnostic cards, shared by the Follow Up and SOI cockpits so the
// two strips can never drift apart. A Stat carries a colored accent edge, an
// optional background wash (for the one card that should shout), and an `extra`
// slot that renders a Ring beside the number or a bar beneath it.
export function Stat({ label, children, extra = null, color = "inherit", accent = null, wash = null }) {
  const ring = extra && extra.type === Ring;
  return (
    <div style={{ position: "relative", overflow: "hidden", background: wash || T.surface, border: `1px solid ${T.line}`, borderLeft: `3px solid ${accent || T.line}`, borderRadius: 12, padding: "10px 14px", minWidth: 118 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", color, lineHeight: 1.15 }}>{children}</div>
          <div style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3, whiteSpace: "nowrap" }}>{label}</div>
          {!ring && extra}
        </div>
        {ring && extra}
      </div>
    </div>
  );
}

// A small progress donut. strokeDasharray against the circumference does the
// percentage; the track sits underneath in the card base color.
export function Ring({ pct, color, size = 34 }) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, pct)) / 100 * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ flex: "none", transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.bg0} strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`} style={{ transition: "stroke-dasharray .5s ease" }} />
    </svg>
  );
}
