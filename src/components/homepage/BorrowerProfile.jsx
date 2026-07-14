import { useState, useEffect } from "react";
import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { BORROWER_PROFILE } from "../../data/content";
import { SectionHeader } from "./SectionHeader";
import { SectionShell } from "./SectionShell";
export function BorrowerProfile({ navTarget }) {
  const [active, setActive] = useState(0);
  const [expandedTips, setExpandedTips] = useState({});
  const isMobile = useIsMobile();
  useEffect(() => { if (navTarget?.section === "profile" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  useEffect(() => { setExpandedTips({}); }, [active]);

  const content = (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
      {BORROWER_PROFILE[active].sections.map((s, i) => {
        if (s.tip) {
          const isExpanded = !!expandedTips[i];
          return (
            <div key={i} style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
              <button
                onClick={() => setExpandedTips((prev) => ({ ...prev, [i]: !prev[i] }))}
                style={{ background: "none", border: "none", padding: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: F.body, textAlign: "left" }}
              >
                <span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{s.heading}</span>
                </span>
                <span style={{ fontSize: 11, color: P.gold, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", marginLeft: 12 }}>▼</span>
              </button>
              {isExpanded && (
                <p style={{ fontSize: 13, lineHeight: 1.65, color: P.text, fontWeight: 500, marginTop: 12 }}>{s.content}</p>
              )}
            </div>
          );
        }
        return (
          <div key={i} className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>{s.heading}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{s.content}</p>
            {s.link && (
              <p style={{ fontSize: 12, marginTop: 10 }}>
                <a href={s.link.href} style={{ color: P.gold, fontWeight: 600, textDecoration: "underline" }}>{s.link.label} →</a>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <section id="profile" className="section-bleed" style={{ padding: "64px 0", background: P.creamDark }}>
      <SectionHeader eyebrow="What Lenders Evaluate" title="Your Borrower Profile" subtitle="Every lending decision comes down to five pillars." />
      {isMobile ? (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {BORROWER_PROFILE.map((b, i) => (
              <button key={b.title} onClick={() => setActive(i)} className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}>{b.title}</button>
            ))}
          </div>
          {content}
        </>
      ) : (
        <SectionShell rail={<RailTabs tabs={BORROWER_PROFILE} active={active} setActive={setActive} />}>
          {content}
        </SectionShell>
      )}
    </section>
  );
}

function RailTabs({ tabs, active, setActive }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {tabs.map((t, i) => {
        const isActive = i === active;
        return (
          <button
            key={t.title}
            type="button"
            onClick={() => setActive(i)}
            style={{
              textAlign: "left",
              fontFamily: F.body,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? P.text : P.warmGray,
              background: isActive ? P.white : "transparent",
              border: "none",
              borderLeft: `3px solid ${isActive ? P.gold : "transparent"}`,
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {t.title}
          </button>
        );
      })}
    </nav>
  );
}
