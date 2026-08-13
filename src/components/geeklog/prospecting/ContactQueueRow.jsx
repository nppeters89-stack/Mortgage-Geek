import { T, FF } from "../gl2Tokens";
import { lastTouchLabel } from "./prospectsModel";

// The muted pill treatment already used for the touch-count badge. Exported so
// the detail header labels a manual contact the same way the queue row does.
export const mutedBadge = {
  flex: "none", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
  color: T.dim, background: "rgba(255,254,251,0.08)", fontFamily: FF.body,
  letterSpacing: "0.02em", textTransform: "lowercase",
};

// One row in a neglect-sorted contact queue: name, brokerage subline, touch count
// badge, and the relative last-touch label that goes amber past STALE_DAYS.
// Extracted from the Follow Ups queue so the SOI queue reads identically; the
// only difference between the two is the optional `meta` line (SOI shows the
// promotion date there) and what the caller passes for `highlight`.
export function ContactQueueRow({ prospect: p, touches = [], highlight = false, meta = "", badge = "", onOpen }) {
  const count = touches.length;
  const { label, stale } = lastTouchLabel(touches);

  return (
    <div role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen && onOpen(); } }}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 10px", borderBottom: `1px solid ${highlight ? T.greenWashLine : T.line}`, cursor: "pointer", borderRadius: 8, background: highlight ? T.greenWash : "transparent" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, minWidth: 0 }}>
          <span style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 20, lineHeight: 1.15, color: T.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
          {badge && <span style={mutedBadge}>{badge}</span>}
        </div>
        <div style={{ fontSize: 12.5, color: T.dim, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
        {meta && <div style={{ fontSize: 11, color: T.faint, marginTop: 3, letterSpacing: "0.03em" }}>{meta}</div>}
      </div>
      {count > 0 && (
        <span style={{ flex: "none", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 6, color: T.dim, background: "rgba(255,254,251,0.08)" }}>{count} touch{count === 1 ? "" : "es"}</span>
      )}
      <div style={{ flex: "none", textAlign: "right" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: stale ? T.amber : T.dim, fontVariantNumeric: "tabular-nums" }}>{label}</div>
        <div style={{ fontSize: 10, color: T.faint, letterSpacing: "0.06em", textTransform: "uppercase" }}>last touch</div>
      </div>
    </div>
  );
}
