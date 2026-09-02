import { useState, useEffect } from "react";
import { T, FF } from "../gl2Tokens";
import { useIsMobile } from "../../../utils/hooks";
import { readTextIntent, clearTextIntent } from "./textIntent";
import { getCachedProspects, persistFollowUps, persistPin } from "./prospectStore";
import { idFromPhone, stageOf, qualifiesForFollowUp, WHALE_COLUMNS, DEFAULT_STAGES } from "./prospectsModel";

// The Sent it chip. The app cannot know whether a text actually went out, so
// the Text button only writes a pending intent; when the app regains focus
// this chip offers the one-tap log. Dismissed means nothing happened. Log it
// appends one outbound touch with type "text" at the card's stage plus one,
// capped below SOI (whales cap at their last value add). A contact not yet in
// the pipeline is pinned in first and the touch lands at Intro Follow Up.
export function TextIntentChip({ apiKey, onEdit, onLogged }) {
  const [intent, setIntent] = useState(() => readTextIntent());
  const isMobile = useIsMobile();
  useEffect(() => {
    const check = () => setIntent(readTextIntent());
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", check);
    };
  }, []);
  if (!intent) return null;
  const cache = getCachedProspects();
  const id = String(intent.contactId);
  const prospect = (cache?.prospects || []).find((x) => idFromPhone(x.phone) === id);
  if (!prospect) return null;
  const first = String(prospect.name || "").trim().split(/\s+/)[0] || "them";

  const membership = () => {
    const member = qualifiesForFollowUp(cache.logs?.[id]) || (cache.pinned || []).includes(id) || !!cache.soi?.[id];
    return { member };
  };
  const dismiss = () => { clearTextIntent(); setIntent(null); };
  const logIt = () => {
    const fu = cache.followUps?.[id] || [];
    const stagesArr = Array.isArray(cache.stages) && cache.stages.length ? cache.stages : DEFAULT_STAGES;
    const goalIndex = stagesArr.length - 1;
    let stage;
    if (!membership().member) {
      persistPin(apiKey, id, "add");
      stage = 1;
    } else {
      const isWhale = (cache.whale || []).includes(id);
      const cur = stageOf(fu, { isSoi: !!cache.soi?.[id], goalIndex, override: cache.stagemap?.[id] });
      stage = Math.max(1, Math.min(cur + 1, isWhale ? WHALE_COLUMNS.length - 1 : goalIndex - 1));
    }
    persistFollowUps(apiKey, id, [...fu, { ts: Date.now(), note: "", stage, type: "text" }]);
    dismiss();
    onLogged?.();
  };
  const edit = () => {
    if (!membership().member) persistPin(apiKey, id, "add");
    dismiss();
    onEdit?.(id);
  };

  const btn = (bg, color, border) => ({ border: border || "none", background: bg, color, borderRadius: 999, padding: "8px 14px", fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, cursor: "pointer" });
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: isMobile ? "calc(96px + env(safe-area-inset-bottom, 0px))" : 24, display: "flex", justifyContent: "center", zIndex: 45, pointerEvents: "none", padding: "0 16px" }}>
      <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 8, background: T.bg1, border: `1px solid ${T.greenWashLine}`, borderRadius: 999, padding: "8px 8px 8px 16px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", fontFamily: FF.body }}>
      <span style={{ fontSize: 13, color: T.cream, fontWeight: 600, whiteSpace: "nowrap" }}>Texted {first}?</span>
        <button type="button" onClick={logIt} style={btn(T.green, T.cream)}>Log it</button>
        <button type="button" onClick={edit} style={btn("none", T.dim, `1px solid ${T.line}`)}>Edit</button>
        <button type="button" onClick={dismiss} aria-label="Dismiss" style={{ ...btn("none", T.dimmer), padding: "8px 10px" }}>✕</button>
      </div>
    </div>
  );
}
