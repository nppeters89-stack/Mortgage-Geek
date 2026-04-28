import { useState, useEffect } from "react";
import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { MORTGAGE_STRUCTURE } from "../../data/content";
import { SectionHeader } from "./SectionHeader";
import { SectionShell } from "./SectionShell";
import { AmortizationChart } from "./AmortizationChart";

export function MortgageStructure({ navTarget }) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  useEffect(() => { if (navTarget?.section === "structure" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const isAmort = MORTGAGE_STRUCTURE[active].title === "Amortization";

  const content = (
    <>
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16, marginBottom: isAmort ? 28 : 0 }}>
        {MORTGAGE_STRUCTURE[active].content.map((c, i) => (
          <div key={i} className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>{c.heading}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{c.text}</p>
            {c.bullets && (
              <div style={{ marginTop: 10 }}>
                {c.bullets.map((b, bi) => (
                  <div key={bi} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.6, color: P.warmGray, marginBottom: 6 }}>
                    <span style={{ color: P.gold, fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
            {c.note && (
              <p style={{ fontSize: 13, lineHeight: 1.65, color: P.text, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${P.creamDark}`, fontStyle: "italic" }}>{c.note}</p>
            )}
            {c.link && (
              <p style={{ fontSize: 12, marginTop: 10 }}>
                <a href={c.link.href} style={{ color: P.gold, fontWeight: 600, textDecoration: "underline" }}>{c.link.label} →</a>
              </p>
            )}
          </div>
        ))}
      </div>
      {isAmort && <AmortizationChart />}
    </>
  );

  return (
    <section id="structure" style={{ padding: "64px 0" }}>
      <SectionHeader eyebrow="Under the Hood" title="Mortgage Structure" subtitle="The mechanics of how your mortgage actually works." />
      {isMobile ? (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {MORTGAGE_STRUCTURE.map((s, i) => (
              <button key={s.title} onClick={() => setActive(i)} className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}>{s.title}</button>
            ))}
          </div>
          {content}
        </>
      ) : (
        <SectionShell rail={<RailTabs tabs={MORTGAGE_STRUCTURE} active={active} setActive={setActive} />}>
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
              background: isActive ? P.creamDark : "transparent",
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
