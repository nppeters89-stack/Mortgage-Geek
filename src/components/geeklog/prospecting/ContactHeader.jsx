import { T, FF } from "../gl2Tokens";
import { dialHref } from "./prospectsModel";
import { mutedBadge } from "./ContactQueueRow";

// Shared contact header for the Prospecting card and the Follow Ups detail: serif
// name, brokerage + line type, buysides, email, a full-width tel: Call button, and
// the collapsible intel block. Presentation only (no log/touch controls), so both
// detail views render an identical header. Colors/fonts from the Geek Log tokens.
//
// callAction is an optional slot rendered directly under the Call button, for a
// secondary action that belongs to the phone/contact block rather than the view
// below it. Follow Ups passes Add to Contacts; Prospecting passes nothing and
// renders exactly as before.
//
// onPhone swaps the tel: anchor for a button running the given handler, and
// onEmail makes the email line clickable the same way. The desktop cockpit
// passes copy-to-clipboard actions for both (no phone to dial from a desk, and
// both values are headed into the CRM); everywhere else the phone dials and the
// email stays plain text.
// isWhale/onToggleWhale render the minimal whale toggle beside the name: gray
// until flagged, aqua-lit once a whale. Follow Ups passes it (mobile detail and
// cockpit modal alike); surfaces that omit it render no button.
export function ContactHeader({ prospect: p, callAction = null, onPhone = null, onEmail = null, isWhale = false, onToggleWhale = null }) {
  const notes = p.notes || "";
  const sub = [p.brokerage, p.lineType ? `${p.lineType} line` : ""].filter(Boolean).join(" · ");

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        <span style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 34, lineHeight: 1.1, color: T.cream }}>{p.name}</span>
        {onToggleWhale && (
          <button type="button" title={isWhale ? "Remove from whale pipeline" : "Move to whale pipeline"} onClick={onToggleWhale}
            style={{ flex: "none", background: isWhale ? T.whaleWash : "none", border: `1px solid ${isWhale ? T.whaleWashLine : T.line}`, borderRadius: 8, padding: "2px 8px", fontSize: 15, cursor: "pointer", lineHeight: 1.5, filter: isWhale ? "none" : "grayscale(1) opacity(0.55)" }}>
            {"🐳"}
          </button>
        )}
        {p.manual && <span style={mutedBadge}>manual</span>}
      </div>
      {sub && <div style={{ color: T.dim, fontSize: 14, marginTop: 6, fontFamily: FF.body }}>{sub}</div>}

      <div style={{ display: "flex", gap: 22, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{p.buysides}</div>
          <div style={{ fontSize: 10.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Buysides 12m</div>
        </div>
        {p.email && (
          <div style={{ minWidth: 0 }}>
            {onEmail ? (
              <button type="button" onClick={onEmail} title="Copy email"
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: "4px 0 0", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 500, color: T.cream, wordBreak: "break-all", fontFamily: FF.body }}>
                {p.email}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.dim} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                  <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" />
                </svg>
              </button>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 500, paddingTop: 4, color: T.cream, wordBreak: "break-all", fontFamily: FF.body }}>{p.email}</div>
            )}
            <div style={{ fontSize: 10.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Email</div>
          </div>
        )}
      </div>

      {onPhone ? (
        <button type="button" onClick={onPhone}
          style={{ boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", marginTop: 20, padding: 18, background: T.redLift, color: T.cream, border: "none", borderRadius: 14, fontFamily: FF.body, fontSize: 19, fontWeight: 700, cursor: "pointer" }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
            <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" />
          </svg>
          {p.phone}
        </button>
      ) : (
        <a href={dialHref(p.phone)}
          style={{ boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", marginTop: 20, padding: 18, background: T.redLift, color: T.cream, border: "none", borderRadius: 14, fontFamily: FF.body, fontSize: 19, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.9.7a2 2 0 0 1 1.7 2z" />
          </svg>
          Call {p.phone}
        </a>
      )}

      {callAction}

      {notes.length > 0 && (
        <details open={notes.length < 200} style={{ marginTop: 18, border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden" }}>
          <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", cursor: "pointer", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, background: T.surface }}>
            Intel<span style={{ color: T.faint }}>▸</span>
          </summary>
          <div style={{ padding: "14px 15px", fontSize: 14, lineHeight: 1.55, color: T.cream, background: T.bg0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: FF.body }}>{notes}</div>
        </details>
      )}
    </>
  );
}
