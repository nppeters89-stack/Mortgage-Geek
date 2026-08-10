import { T, FF } from "../gl2Tokens";
import { dialHref } from "./prospectsModel";

// Shared contact header for the Prospecting card and the Follow Ups detail: serif
// name, brokerage + line type, buysides, email, a full-width tel: Call button, and
// the collapsible intel block. Presentation only (no log/touch controls), so both
// detail views render an identical header. Colors/fonts from the Geek Log tokens.
export function ContactHeader({ prospect: p }) {
  const notes = p.notes || "";
  const sub = [p.brokerage, p.lineType ? `${p.lineType} line` : ""].filter(Boolean).join(" · ");

  return (
    <>
      <div style={{ fontFamily: FF.serif, fontSize: 34, lineHeight: 1.1, color: T.cream }}>{p.name}</div>
      {sub && <div style={{ color: T.dim, fontSize: 14, marginTop: 6, fontFamily: FF.sans }}>{sub}</div>}

      <div style={{ display: "flex", gap: 22, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{p.buysides}</div>
          <div style={{ fontSize: 10.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Buysides 12m</div>
        </div>
        {p.email && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, paddingTop: 4, color: T.cream, wordBreak: "break-all", fontFamily: FF.sans }}>{p.email}</div>
            <div style={{ fontSize: 10.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Email</div>
          </div>
        )}
      </div>

      <a href={dialHref(p.phone)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", marginTop: 20, padding: 18, background: T.redLift, color: T.cream, border: "none", borderRadius: 14, fontFamily: FF.sans, fontSize: 19, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.9.7a2 2 0 0 1 1.7 2z" />
        </svg>
        Call {p.phone}
      </a>

      {notes.length > 0 && (
        <details open={notes.length < 200} style={{ marginTop: 18, border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden" }}>
          <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", cursor: "pointer", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, background: T.surface }}>
            Intel<span style={{ color: T.faint }}>▸</span>
          </summary>
          <div style={{ padding: "14px 15px", fontSize: 14, lineHeight: 1.55, color: T.cream, background: T.bg0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: FF.sans }}>{notes}</div>
        </details>
      )}
    </>
  );
}
