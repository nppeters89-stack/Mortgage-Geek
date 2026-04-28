import { P, F } from "../../theme";
import { SectionHeader } from "./SectionHeader";
import { MortgageCalcIcon, CompareIcon, PreQualIcon, CashToCloseIcon } from "../icons";

export function ToolsCTA() {
  const tools = [
    {
      icon: "__CALC_ICON__", title: "Mortgage Calculator", href: "/calculator",
      desc: "Same house, four programs. Compare Conventional, FHA, VA, and USDA payment breakdowns with live rates.",
    },
    {
      icon: "__PREQUAL_ICON__", title: "Pre-Qual Simulator", href: "/prequal",
      desc: "Enter your income and debts — see what you can afford under each loan program with real DTI limits.",
    },
    {
      icon: "__COMPARE_ICON__", title: "Loan Comparison", href: "/compare",
      desc: "Save up to 3 scenarios from the calculator and stack them side by side to find your best option.",
    },
    {
      icon: "__CASH_ICON__", title: "Cash to Close", href: "/cash-to-close",
      desc: "Estimate how much money you'll need at the closing table — down payment, closing costs, prepaids, and reserves.",
    },
  ];
  return (
    <section id="tools-cta" className="section-bleed" style={{ padding: "64px 40px", background: P.creamDark }}>
      <div style={{ maxWidth: 720 }}>
        <SectionHeader eyebrow="Your Toolkit" title="Run the Numbers" subtitle="Free tools built by a loan originator — not a marketing team. No login, no data collected, no strings attached." />
        <div className="tools-grid-cta" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {tools.map((t, i) => (
            <a key={i} href={t.href} className="content-card" style={{
              display: "flex", flexDirection: "column", padding: 0, textDecoration: "none",
              overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "28px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8, height: 44 }}>
                  {t.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={44} variant="cream" /> : t.icon === "__COMPARE_ICON__" ? <CompareIcon size={48} variant="cream" /> : t.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={48} variant="cream" /> : t.icon === "__CASH_ICON__" ? <CashToCloseIcon size={48} variant="cream" /> : t.icon}
                </span>
                <span style={{ fontFamily: F.display, fontSize: 20, color: "#fff", display: "block" }}>{t.title}</span>
              </div>
              <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray, flex: 1 }}>{t.desc}</p>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 13, fontWeight: 600, color: P.gold }}>
                  Open {t.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={14} /> : t.icon === "__COMPARE_ICON__" ? <CompareIcon size={14} variant="navy" /> : t.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={14} variant="navy" /> : t.icon === "__CASH_ICON__" ? <CashToCloseIcon size={14} variant="navy" /> : t.icon} →
                </span>
              </div>
            </a>
          ))}
        </div>
        <style>{`
          @media (max-width: 600px) { .tools-grid-cta, .nextsteps-tools { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </section>
  );
}
