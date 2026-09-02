import { T, FF, staleColor } from "../gl2Tokens";
import { ReplyBadge } from "./ReplyBadge";

// Slim mobile Follow Ups row (CD 5B). Name + one status glyph, brokerage, a
// bare age colored on the contact's own stage-aware clock, and a log button.
// The touch-count pill, score, LAST TOUCH caption and stage notches stay in
// the detail view one tap away; the group header above says what the age
// means. ContactQueueRow is untouched and still serves the SOI queue.
export function MobileQueueRow({ prospect: p, days, rampDays = null, dueDays, tier, fire = false, whale = false, checked = false, reply = null, onOpen, onReply = null }) {
  const overdue = tier === "overdue";
  return (
    <div role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen && onOpen(); } }}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: `1px solid ${T.lineSoft}`, cursor: "pointer", opacity: tier === "recent" ? 0.72 : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <span style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: T.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
          {fire ? <span aria-hidden="true" style={{ flex: "none", fontSize: 12 }}>{"🔥"}</span>
            : whale ? <span aria-hidden="true" style={{ flex: "none", fontSize: 12 }}>{"🐳"}</span>
              : checked ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="In RAC" style={{ flex: "none" }}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : null}
          {reply && <ReplyBadge count={reply.count} days={reply.days} owed={reply.owed} />}
        </div>
        <div style={{ fontSize: 11.5, color: T.dimmer, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
      </div>
      <span style={{ flex: "none", fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: staleColor(rampDays == null ? days : rampDays, T.dimmer, dueDays) }}>{days == null ? "never" : `${days}d`}</span>
      {onReply && (
        <button type="button" aria-label={`They replied: ${p.name}`}
          onClick={(e) => { e.stopPropagation(); onReply(); }}
          style={{ flex: "none", padding: 7, margin: -7, background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,254,251,0.04)", border: `1px solid ${T.line}`, color: T.dimmer }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </span>
        </button>
      )}
      {/* 30px visual button padded out to a 44px hit target. */}
      <button type="button" aria-label={`Log a touch for ${p.name}`}
        onClick={(e) => { e.stopPropagation(); onOpen && onOpen(); }}
        style={{ flex: "none", padding: 7, margin: -7, background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: overdue ? "rgba(47,191,113,0.12)" : "rgba(255,254,251,0.04)", border: `1px solid ${overdue ? "rgba(47,191,113,0.35)" : T.line}`, color: overdue ? T.greenBright : T.dimmer }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
