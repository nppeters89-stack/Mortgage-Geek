import { T, FF } from "../gl2Tokens";

// The partner-facing weekly report, rendered off-screen at 1080 wide for the
// PNG export. Status only, never notes: the payload it renders is assembled
// by leadReport.js, which never includes them. Layout first, no text over
// elements.

export function LeadReportCard({ report }) {
  return (
    <div style={{ width: 1080, minHeight: 1350, boxSizing: "border-box", background: T.bg1, padding: "64px 72px", fontFamily: FF.body, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24 }}>
        <div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.5px", color: T.cream }}>{report.accountName}</div>
          <div style={{ fontSize: 19, color: T.dim, marginTop: 8 }}>Lead follow-up report · {report.dateLabel}</div>
        </div>
        <div style={{ fontSize: 17, color: T.dimmer, textAlign: "right" }}>
          Nick Peters · Rate
          <div style={{ fontSize: 14, color: T.faint, marginTop: 4 }}>NMLS #1119524</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
        {report.funnel.map((f) => (
          <div key={f.label} style={{ flex: 1, minWidth: 0, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: T.cream, fontVariantNumeric: "tabular-nums" }}>{f.total}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: f.week > 0 ? T.greenBright : T.dimmer, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {f.week > 0 ? `+${f.week} this week` : "this week 0"}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, marginTop: 10, lineHeight: 1.3 }}>{f.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 44, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.dim, marginBottom: 14 }}>
          Active leads · {report.rows.length}
        </div>
        <div style={{ display: "flex", padding: "10px 18px", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dimmer, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ flex: 2.2 }}>Name</span>
          <span style={{ flex: 1.8 }}>Status</span>
          <span style={{ flex: 1 }}>Last touch</span>
          <span style={{ flex: 1 }}>Next step</span>
        </div>
        {report.rows.map((r, i) => (
          <div key={`${r.name}-${i}`} style={{ display: "flex", alignItems: "center", padding: "14px 18px", fontSize: 17, color: T.cream, borderBottom: `1px solid ${T.lineSoft}` }}>
            <span style={{ flex: 2.2, fontWeight: 600 }}>{r.name}</span>
            <span style={{ flex: 1.8, color: T.dim }}>{r.place}</span>
            <span style={{ flex: 1, color: T.dim, fontVariantNumeric: "tabular-nums" }}>{r.lastTouch || "not yet"}</span>
            <span style={{ flex: 1, color: T.dim, fontVariantNumeric: "tabular-nums" }}>{r.nextStep || ""}</span>
          </div>
        ))}
        {report.rows.length === 0 && (
          <div style={{ padding: "28px 18px", fontSize: 16, color: T.faint }}>No active leads this week.</div>
        )}
      </div>

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${T.line}`, fontSize: 13.5, color: T.faint, lineHeight: 1.6 }}>
        Status summary only. Questions on any lead, call or text Nick directly.
      </div>
    </div>
  );
}
