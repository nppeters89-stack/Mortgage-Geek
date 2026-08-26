import { useMemo } from "react";
import { T, FF } from "./gl2Tokens";
import { TabGlyph } from "./Gl2Primitives";
import { getCachedProspects } from "./prospecting/prospectStore";
import { idFromPhone, followUpQueue, isDueForTouch } from "./prospecting/prospectsModel";

// Desktop top-bar navigation (design option 3c, translated into the Geek Log's
// own system: Figtree and gl2Tokens in place of the sketch's Poppins and raw
// hex; no search field or avatar - neither concept exists in this app). Renders
// only at >= 900px; the mobile bottom TabBar is conditionally unmounted there,
// so exactly one nav landmark exists at any width.
//
// The Follow Ups badge derives from the shared prospect-store cache: the same
// followUpQueue membership the tab itself shows, minus whales (they have their
// own tray and are not "to work" in the main queue sense). Cache-derived means
// it can lag until the prospecting data loads once per session; it settles on
// the next render after any tab hydrates the store.
const TABS = [
  { id: "today", label: "Today" },
  { id: "prospecting", label: "Prospects" },
  { id: "week", label: "Week" },
  { id: "ytd", label: "YTD" },
  { id: "followups", label: "Follow Ups" },
];

function followUpsDue() {
  const c = getCachedProspects();
  if (!c) return 0;
  const pinned = new Set(c.pinned || []);
  const whale = new Set(c.whale || []);
  return followUpQueue(c.prospects || [], c.logs || {}, c.followUps || {}, c.soi || {}, pinned, c.cold || {}, c.dead || {})
    .filter((p) => {
      const id = idFromPhone(p.phone);
      return !whale.has(id) && isDueForTouch(c.followUps?.[id]);
    }).length;
}

export function Gl2TopNav({ active, onChange }) {
  // Re-derives when the active tab changes - every tab switch re-renders the
  // nav, so the badge tracks queue mutations closely enough without a store
  // subscription.
  const badge = useMemo(() => followUpsDue(), [active]);

  return (
    <nav aria-label="Main" style={{ flex: "0 0 auto", height: 66, background: T.bg1, borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "stretch", justifyContent: "center", padding: "0 28px", gap: 0 }}>
      <style>{`
        .gl2-topnav-tab:focus-visible { outline: 2px solid ${T.greenBright}; outline-offset: 2px; border-radius: 6px; }
        .gl2-topnav-tab:hover .gl2-topnav-ink { color: ${T.cream}; }
        .gl2-topnav-tab:hover { box-shadow: inset 0 -2px 0 ${T.lineSoft}; }
        .gl2-topnav-tab[aria-current="page"]:hover { box-shadow: inset 0 -2px 0 ${T.greenBright}; }
      `}</style>

      {/* Tabs: labels always visible, icon left, 2px underline slot reserved on
          every tab so nothing shifts on state change. */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 4 }}>
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button key={t.id} type="button" className="gl2-topnav-tab"
              onClick={() => onChange && onChange(t.id)}
              aria-current={on ? "page" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 9, padding: "0 16px",
                background: "none", border: "none", cursor: "pointer",
                boxShadow: on ? `inset 0 -2px 0 ${T.greenBright}` : "inset 0 -2px 0 transparent",
                transition: "box-shadow 180ms ease-out, color 180ms ease-out",
                WebkitTapHighlightColor: "transparent",
              }}>
              <span aria-hidden="true" className="gl2-topnav-ink" style={{ color: on ? T.greenBright : T.dim, display: "flex", transition: "color 140ms ease-out" }}>
                <TabGlyph id={t.id} size={19} />
              </span>
              <span className="gl2-topnav-ink" style={{ fontFamily: FF.body, fontWeight: on ? 600 : 500, fontSize: 14, color: on ? T.cream : T.dim, transition: "color 140ms ease-out", whiteSpace: "nowrap" }}>
                {t.label}
              </span>
              {t.id === "followups" && badge > 0 && (
                <span style={{ minWidth: 17, borderRadius: 9, background: T.greenBright, color: T.bg1, fontFamily: FF.body, fontWeight: 600, fontSize: 10, lineHeight: "17px", padding: "0 5px", textAlign: "center" }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </nav>
  );
}
