import { useState, useEffect } from "react";
import { P, F } from "../../theme";
import { MORTGAGE_TYPES } from "../../data/content";
import { SectionHeader } from "./SectionHeader";

export function MortgageTypes({ navTarget }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (navTarget?.section === "types" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const t = MORTGAGE_TYPES[active];
  return (
    <section id="types" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader eyebrow="Know Your Options" title="Selecting a Mortgage" subtitle="Each loan type exists for a reason. The right one depends on your credit, savings, military status, and where you're buying." />
      {/* Two-row grouped tab layout: Standard programs (5) + Specialized programs (2) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 8 }}>
            Standard Programs
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MORTGAGE_TYPES.slice(0, 5).map((m, i) => (
              <button
                key={m.name}
                onClick={() => setActive(i)}
                className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}
                style={{ flex: "1 1 0", minWidth: 100, padding: "9px 8px" }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 8 }}>
            Specialized Programs
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MORTGAGE_TYPES.slice(5).map((m, idx) => {
              const i = idx + 5;
              return (
                <button
                  key={m.name}
                  onClick={() => setActive(i)}
                  className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}
                  style={{ flex: "1 1 0", minWidth: 100, padding: "9px 8px" }}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="content-card" style={{ maxWidth: 720 }}>
        <div style={{ padding: "28px 32px 20px", borderBottom: `1px solid ${P.creamDark}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 26, color: P.navy, marginBottom: 4 }}>{t.name}</h3>
          <p style={{ fontSize: 14, color: P.warmGray, fontStyle: "italic" }}>{t.tagline}</p>
        </div>
        <div style={{ padding: "20px 32px", borderBottom: `1px solid ${P.creamDark}` }}>
          {[{ l: "Min. Down Payment", v: t.minDown }, { l: "Credit Requirement", v: t.credit }, { l: "Mortgage Insurance", v: t.pmi }, { l: "Best For", v: t.bestFor }].map((f) => (
            <div key={f.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${P.cream}`, gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: P.warmGrayLight, minWidth: 140 }}>{f.l}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: P.text, flex: 1, textAlign: "right" }}>{f.v}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "20px 32px 28px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.navy, marginBottom: 14 }}>Key Facts</h4>
          {t.keyFacts.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.6, color: P.warmGray, marginBottom: 8 }}>
              <span style={{ color: P.gold, fontWeight: 700, flexShrink: 0 }}>→</span><span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
