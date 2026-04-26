import { useState, useEffect } from "react";
import { P, F } from "../../theme";
import { MORTGAGE_STRUCTURE } from "../../data/content";
import { SectionHeader } from "./SectionHeader";
import { AmortizationChart } from "./AmortizationChart";

export function MortgageStructure({ navTarget }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (navTarget?.section === "structure" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const isAmort = MORTGAGE_STRUCTURE[active].title === "Amortization";
  return (
    <section id="structure" style={{ padding: "64px 40px" }}>
      <SectionHeader eyebrow="Under the Hood" title="Mortgage Structure" subtitle="The mechanics of how your mortgage actually works." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {MORTGAGE_STRUCTURE.map((s, i) => (
          <button key={s.title} onClick={() => setActive(i)} className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}>{s.title}</button>
        ))}
      </div>
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16, marginBottom: isAmort ? 28 : 0 }}>
        {MORTGAGE_STRUCTURE[active].content.map((c, i) => (
          <div key={i} className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>{c.heading}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{c.text}</p>
            {c.link && (
              <p style={{ fontSize: 12, marginTop: 10 }}>
                <a href={c.link.href} style={{ color: P.gold, fontWeight: 600, textDecoration: "underline" }}>{c.link.label} →</a>
              </p>
            )}
          </div>
        ))}
      </div>
      {isAmort && <AmortizationChart />}
    </section>
  );
}
