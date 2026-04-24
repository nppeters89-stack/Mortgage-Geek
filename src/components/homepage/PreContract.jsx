import { useState, useEffect, Fragment } from "react";
import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { PRE_CONTRACT_STEPS } from "../../data/content";
import { SectionHeader } from "./SectionHeader";

export function PreContract({ navTarget }) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  useEffect(() => { if (navTarget?.section === "getting-started" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const step = PRE_CONTRACT_STEPS[active];

  const renderDetail = (s) => (
    <div className="process-detail">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontFamily: F.display, fontSize: 48, color: P.creamDark, lineHeight: 1 }}>{s.num}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: P.sageDark, background: `${P.sage}15`, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.3 }}>{s.timeframe}</span>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 24, color: P.navy, marginBottom: 12 }}>{s.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 24 }}>{s.detail}</p>
      <div style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text, fontWeight: 500 }}>{s.tip}</p>
      </div>
    </div>
  );

  const contractDivider = (
    <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, background: `${P.gold}15`, padding: "10px 20px", borderRadius: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldMuted }}>Contract Signed</span>
        <span style={{ fontSize: 10, color: P.warmGrayLight }}>The 30-day clock starts ↓</span>
      </div>
    </div>
  );

  return (
    <section id="getting-started" style={{ padding: "64px 40px" }}>
      <SectionHeader
        eyebrow="Steps 1–3 · Before the Clock Starts"
        title="Getting Started"
        subtitle="These steps happen at your own pace — before you're under contract. No deadlines, no pressure. Take the time to get it right."
      />
      <div className="process-grid">
        <div className="process-steps">
          {PRE_CONTRACT_STEPS.map((s, i) => (
            <Fragment key={i}>
              <button onClick={() => setActive(active === i && isMobile ? -1 : i)} className={`process-step ${active === i ? "process-step-active" : ""}`}>
                <span className={`process-num ${active === i ? "process-num-active" : ""}`}>{s.num}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.title}</span>
                  <span style={{ display: "block", fontSize: 12, color: P.warmGray, lineHeight: 1.4 }}>{s.short}</span>
                </div>
                {isMobile && <span style={{ fontSize: 18, fontWeight: 300, color: P.warmGrayLight, marginLeft: 8 }}>{active === i ? "−" : "+"}</span>}
              </button>
              {isMobile && active === i && renderDetail(s)}
            </Fragment>
          ))}
          {contractDivider}
        </div>
        {!isMobile && renderDetail(step)}
      </div>
    </section>
  );
}
