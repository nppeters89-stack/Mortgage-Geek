import { useState, useEffect, Fragment } from "react";
import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { ACTIVE_LOAN_STEPS } from "../../data/content";
import { SectionHeader } from "./SectionHeader";
import { ThirtyDayGraphic } from "./ThirtyDayGraphic";

export function ActiveLoanProcess({ navTarget }) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  useEffect(() => { if (navTarget?.section === "process" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const step = ACTIVE_LOAN_STEPS[active];

  const renderDetail = (s) => (
    <div className="process-detail">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontFamily: F.display, fontSize: 48, color: P.creamDark, lineHeight: 1 }}>{s.num}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: P.sageDark, background: `${P.sage}15`, padding: "3px 10px", borderRadius: 20 }}>{s.phase}</span>
          <span style={{ fontSize: 10, color: P.warmGrayLight, fontWeight: 500, padding: "0 10px" }}>Days {s.days}</span>
        </div>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 24, color: P.navy, marginBottom: 12 }}>{s.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 24 }}>{s.detail}</p>
      <div style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text, fontWeight: 500 }}>{s.tip}</p>
      </div>
    </div>
  );

  return (
    <section id="process" className="section-bleed" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader
        eyebrow="Steps 4–6 · The Clock Is Ticking"
        title="The 30-Day Loan Process"
        subtitle="Once you're under contract, the countdown begins. Most closings happen in 30–45 days — streamlined files can close faster, while complex files (self-employed income, appraisal issues, title problems) may take longer."
      />
      {!isMobile && <ThirtyDayGraphic activeStep={active} />}
      <div className="process-grid">
        <div className="process-steps">
          {ACTIVE_LOAN_STEPS.map((s, i) => (
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
        </div>
        {!isMobile && renderDetail(step)}
      </div>
      {isMobile && <div style={{ marginTop: 20 }}><ThirtyDayGraphic activeStep={active} /></div>}
    </section>
  );
}
