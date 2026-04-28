import { useState, useEffect } from "react";
import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { MORTGAGE_TYPES } from "../../data/content";
import { SectionHeader } from "./SectionHeader";
import { SectionShell } from "./SectionShell";

export function MortgageTypes({ navTarget }) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  useEffect(() => { if (navTarget?.section === "types" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const t = MORTGAGE_TYPES[active];

  return (
    <section id="types" className="section-bleed" style={{ padding: "64px 0", background: P.creamDark }}>
      <SectionHeader eyebrow="Know Your Options" title="Selecting a Mortgage" subtitle="Each loan type exists for a reason. The right one depends on your credit, savings, military status, and where you're buying." />
      {isMobile ? (
        <>
          {/* Two-row grouped tab layout: Standard programs (5) + Specialized programs (2) */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: P.gold, marginBottom: 8 }}>
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
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: P.gold, marginBottom: 8 }}>
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
          <ProgramDetailCard t={t} />
        </>
      ) : (
        <SectionShell
          rail={
            <RailPrograms
              standard={MORTGAGE_TYPES.slice(0, 5)}
              specialized={MORTGAGE_TYPES.slice(5)}
              active={active}
              setActive={setActive}
            />
          }
        >
          <ProgramDetailCard t={t} />
        </SectionShell>
      )}
    </section>
  );
}

function ProgramDetailCard({ t }) {
  return (
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
        {t.keyFacts.map((f, i) => {
          const isObj = typeof f === "object" && f !== null;
          const text = isObj ? f.text : f;
          const link = isObj ? f.link : null;
          return (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.6, color: P.warmGray, marginBottom: 8 }}>
              <span style={{ color: P.gold, fontWeight: 700, flexShrink: 0 }}>→</span>
              <span>
                {text}
                {link && (
                  <>
                    {" "}
                    <a href={link.href} style={{ color: P.gold, fontWeight: 600, textDecoration: "underline" }}>{link.label} →</a>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RailPrograms({ standard, specialized, active, setActive }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RailGroup label="Standard" items={standard} startIndex={0} active={active} setActive={setActive} />
      <RailGroup label="Specialized" items={specialized} startIndex={5} active={active} setActive={setActive} />
    </nav>
  );
}

function RailGroup({ label, items, startIndex, active, setActive }) {
  return (
    <div>
      <div
        style={{
          fontFamily: F.body,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: P.gold,
          padding: "4px 14px",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {items.map((p, idx) => {
        const i = startIndex + idx;
        const isActive = i === active;
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => setActive(i)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              fontFamily: F.body,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? P.text : P.warmGray,
              background: isActive ? P.white : "transparent",
              border: "none",
              borderLeft: `3px solid ${isActive ? P.gold : "transparent"}`,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
