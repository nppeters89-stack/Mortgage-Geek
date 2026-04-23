import { useState, useEffect, useLayoutEffect, useMemo, useRef, Fragment } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  ALL_STATES_LIST,
  CASH_STATE_DEFAULT_TAX_RATES,
  CASH_STATE_METROS,
  DEFAULT_LIMITS,
  SHARED_STATE_TAX_RATES,
} from "./data/taxRates.js";
import {
  ACTIVE_LOAN_STEPS,
  BORROWER_PROFILE,
  CLOSING_COSTS,
  MORTGAGE_STRUCTURE,
  MORTGAGE_TYPES,
  PRE_CONTRACT_STEPS,
  TRID_BUCKETS,
} from "./data/content.js";
import { NAV_TOOLS, NAV_TOPICS } from "./data/nav.js";
import { P, PROGRAM_COLORS, F, globalCSS } from "./theme";
import { fmt } from "./utils/format";
import { generateAmortData, formatPayoff, calculateAPR } from "./utils/math";
import { useIsMobile, useIsStandalone } from "./utils/hooks";

import { HEADSHOT } from "./data/headshot.js";
import { MortgageCalcIcon, CompareIcon, PreQualIcon, CashToCloseIcon } from "./components/icons";
import { Sidebar } from "./components/Sidebar";
import { MobileToolbar } from "./components/MobileToolbar";
import { CalcInput } from "./components/CalcInput";
import { RateInput } from "./components/RateInput";
import { WelcomeToast } from "./components/WelcomeToast";
import { Hero } from "./components/homepage/Hero";
import { SectionHeader } from "./components/homepage/SectionHeader";
import { JourneyOverview } from "./components/homepage/JourneyOverview";
import { PreContract } from "./components/homepage/PreContract";
import { ThirtyDayGraphic } from "./components/homepage/ThirtyDayGraphic";
import { ActiveLoanProcess } from "./components/homepage/ActiveLoanProcess";
import { MortgageTypes } from "./components/homepage/MortgageTypes";
import { ClosingCosts } from "./components/homepage/ClosingCosts";
import { GiftFundsGrid } from "./components/homepage/GiftFundsGrid";
import { BorrowerProfile } from "./components/homepage/BorrowerProfile";
import { AmortizationChart } from "./components/homepage/AmortizationChart";
import { MortgageStructure } from "./components/homepage/MortgageStructure";
import { InterestRates } from "./components/homepage/InterestRates";
import { PreApprovalChecklist } from "./components/homepage/PreApprovalChecklist";
import { NextSteps } from "./components/homepage/NextSteps";
import { ToolsCTA } from "./components/homepage/ToolsCTA";
import { JargonDecoder } from "./components/homepage/JargonDecoder";

// ─── Components ──────────────────────────────────────────────────────────────















function AboutPage() {
  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}</style>

      {/* Header */}
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 800, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>🤓</span>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 800, margin: "0 auto" }}>
        {/* Headshot + intro */}
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center", marginBottom: 48 }}>
          <div style={{ width: 140, height: 140, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `4px solid ${P.gold}`, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
            <img src={HEADSHOT} alt="Nick Peters" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>The Person Behind the Site</span>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(28px, 4vw, 38px)", color: P.navy, marginBottom: 6 }}>Nick Peters</h1>
            <p style={{ fontSize: 14, color: P.warmGray }}>Mortgage Loan Originator · NMLS# 1119524</p>
            <p style={{ fontSize: 13, color: P.warmGrayLight, marginTop: 2 }}>Nashville, TN · Licensed since 2014</p>
          </div>
        </div>

        {/* Bio */}
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            For twelve years, I worked the sales desk in new construction model homes. I was the person families approached after falling in love with a house — the one responsible for turning that excitement into numbers that actually worked. Some conversations ended in approvals. Others required me to gently explain why the answer was "not yet," and what steps we could take to change that.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            Builder lending taught me the real edges of the mortgage world in a way retail banking never could. Over the years, I've assisted countless homebuyers of all types and navigated virtually every loan scenario imaginable. I learned how to structure deals that were favorable and perfectly tailored to each customer's specific needs and situation.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            The Mortgage Geek exists because most mortgage websites are either generic rate-bait or thinly disguised lead forms. Neither respects the borrower. This site is the opposite bet: give you the real information, the real tools, and a real human to text when you're ready. No drip campaigns. No "apply now" before you know what you're applying for. Just a plain-English answer to whatever you need.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray }}>
            If you're anywhere in the mortgage process — whether you're just curious about what you can afford or you've already accepted an offer and your current lender has gone silent — feel free to text me. I'm happy to help, no matter what stage you're at.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 48 }}>
          {[
            { num: "12+", label: "Years in the industry" },
            { num: "Hundreds", label: "Families helped" },
          ].map((s, i) => (
            <div key={i} className="content-card" style={{ padding: "24px 16px", textAlign: "center" }}>
              <span style={{ fontFamily: F.display, fontSize: 30, color: P.navy, display: "block", marginBottom: 4 }}>{s.num}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: P.warmGrayLight, letterSpacing: 0.3, textTransform: "uppercase" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Programs */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 12 }}>Loan Programs Mastered</span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Conventional", "FHA", "VA", "USDA", "Jumbo", "DSCR"].map((p, i) => (
              <span key={i} style={{ padding: "8px 18px", borderRadius: 50, background: P.white, fontSize: 13, fontWeight: 600, color: P.navy, border: `1px solid ${P.creamDark}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>{p}</span>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div style={{
          background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 100%)`,
          borderRadius: 16, padding: "36px 32px", marginBottom: 48,
        }}>
          <h3 style={{ fontFamily: F.display, fontSize: 24, color: "#fff", marginBottom: 8 }}>Let's connect.</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Whether you're ready to get pre-approved or just have a question — reach out anytime.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="tel:+16156560737" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: P.gold, color: "#fff",
              fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              (615) 656-0737
            </a>
            <a href="sms:+16156560737&body=Hi%20Nick%2C%20I%20found%20your%20site%20and%20wanted%20to%20connect." style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Text me
            </a>
            <a href="https://www.linkedin.com/in/nickpeters2/" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: F.body, fontSize: 14, fontWeight: 500, textDecoration: "none",
            }}>
              LinkedIn →
            </a>
          </div>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          <span>NMLS# 1119524 ·</span>
          <svg width="11" height="12" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
            <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
            <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
            <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
          </svg>
          <span>Equal Housing Lender</span>
        </p>
      </div>
      <MobileToolbar />
    </div>
  );
}

function ComparePage() {
  const STORAGE_KEY = "mg_compare_scenarios";
  const [scenarios, setScenarios] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });

  const [selectedId, setSelectedId] = useState(null);

  const removeScenario = (id) => {
    const next = scenarios.filter(s => s.id !== id);
    setScenarios(next);
    if (selectedId === id) setSelectedId(null);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const resetAll = () => {
    if (!window.confirm("Clear all saved scenarios? This cannot be undone.")) return;
    setScenarios([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Find the cheapest total payment for "best" badge
  const lowestTotal = scenarios.length > 0 ? Math.min(...scenarios.map(s => s.total)) : 0;

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .compare-grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; align-items: flex-start; padding-top: 14px; }
        .compare-card { width: 320px; flex-shrink: 0; }
        @media (max-width: 720px) { .compare-card { width: 100%; max-width: 360px; } }

        .print-only { display: none; }

        @media print {
          @page { size: portrait; margin: 0.25in; }
          body { background: #fff !important; }
          body > div, body > div > div { min-height: auto !important; background: #fff !important; }
          body > div > div > div { padding: 10px 12px 4px !important; }
          .print-only { margin-top: 6px !important; padding-top: 4px !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }

          /* Force all colors and backgrounds to render in PDF */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .compare-grid {
            display: flex !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: flex-start !important;
            gap: 5px !important;
            padding-top: 8px !important;
            page-break-inside: avoid;
          }
          .compare-card {
            width: 32% !important;
            max-width: none !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .compare-card .card-header { padding: 8px 10px !important; }
          .compare-card .card-total { font-size: 15px !important; }
          .compare-card div, .compare-card span, .compare-card strong, .compare-card p { font-size: 6.5px !important; line-height: 1.25 !important; }
          .compare-card .card-total { font-size: 15px !important; }
          .compare-card ul { margin: 2px 0 0 !important; padding-left: 9px !important; }
          .compare-card li { margin-bottom: 0 !important; font-size: 6px !important; line-height: 1.2 !important; }
          .content-card { box-shadow: none !important; border: 1px solid #999 !important; }

          /* Darken labels and values in card body for high contrast on white */
          .compare-card .pdf-label { color: #4a4a4a !important; font-size: 6.5px !important; }
          .compare-card .pdf-value { color: #000 !important; font-size: 6.5px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20loan%20comparison%20tool%20and%20had%20a%20question." style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Print-only branded header */}
        <div className="print-only" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${P.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 2 }}>🤓 The Mortgage Geek · Loan Comparison</div>
              <div style={{ fontSize: 11, color: P.warmGray }}>Nick Peters · NMLS# 1119524 · (615) 656-0737 · mortgagegeek.ai</div>
            </div>
            <div style={{ fontSize: 10, color: P.warmGrayLight, textAlign: "right" }}>Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>

        <div className="no-print" style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>Side by Side</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            Loan Comparison
            <CompareIcon size={32} variant="navy" />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>Save up to 3 scenarios from the calculator and compare them side by side. Your scenarios are saved on this device.</p>
        </div>

        {scenarios.length === 0 ? (
          <div className="content-card" style={{ padding: "48px 32px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <CompareIcon size={56} variant="navy" />
            </div>
            <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 8 }}>No scenarios saved yet</h3>
            <p style={{ fontSize: 14, color: P.warmGray, marginBottom: 24, lineHeight: 1.6 }}>
              Head to the calculator, build a scenario, select a loan program, and tap "Save to Comparison." Come back here to see them stacked side by side.
            </p>
            <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(184,134,11,0.3)" }}><MortgageCalcIcon size={18} variant="cream" /> Open the Calculator →</a>
          </div>
        ) : (
          <>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 13, color: P.warmGray }}>{scenarios.length} of 3 scenarios saved</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, border: "none", background: P.navy, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>📄 Save as PDF</button>
                <button onClick={resetAll} style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${P.creamDark}`, background: "transparent", fontSize: 11, fontWeight: 600, color: P.warmGrayLight, cursor: "pointer", fontFamily: F.body }}>Clear All</button>
              </div>
            </div>

            <div className="compare-grid">
              {scenarios.map((s) => {
                const isBest = s.total === lowestTotal && scenarios.length > 1;
                const isSelected = selectedId === s.id;
                const cardColor = PROGRAM_COLORS[s.program] || s.color || P.navy;
                return (
                  <div key={s.id} className="content-card compare-card" onClick={() => setSelectedId(isSelected ? null : s.id)} style={{ overflow: "visible", position: "relative", border: isSelected ? `2px solid ${cardColor}` : isBest ? `2px solid ${P.gold}` : "2px solid transparent", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: isSelected ? `0 0 0 3px ${cardColor}30` : undefined }}>
                    {isBest && <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "4px 12px", borderRadius: 50, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>★ Lowest Payment</span>}
                    <div className="card-header" style={{ background: cardColor, padding: "20px", textAlign: "center", borderRadius: "10px 10px 0 0" }}>
                      <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.program} · {s.term}yr</span>
                      <span className="card-total" style={{ fontFamily: F.display, fontSize: 28, color: "#fff" }}>{fmt(s.total)}/mo</span>
                      <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{fmt(s.homePrice)} · {s.downPct}% down · {Number(s.rate).toFixed(3)}%</span>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      {[
                        { label: "Home Price", val: fmt(s.homePrice) },
                        { label: "Down Payment", val: `${fmt(s.downAmt)} (${s.downPct}%)` },
                        { label: "Base Loan Amount", val: fmt(s.baseLoan || (s.homePrice - s.downAmt)) },
                        ...(s.upfront > 0 ? [{ label: s.upfrontLabel || "Upfront Fee", val: `+ ${fmt(s.upfront)}`, sub: true }] : []),
                        ...(s.upfront > 0 ? [{ label: "Total Loan (financed)", val: fmt(s.totalLoan || s.loan), bold: true, color: cardColor }] : []),
                        { label: "Principal & Interest", val: `${fmt(s.pi)}/mo` },
                        ...(s.mi > 0 ? [{ label: "Mortgage Insurance", val: `${fmt(s.mi)}/mo` }] : []),
                        { label: "Property Tax", val: `${fmt(s.tax)}/mo` },
                        { label: "Insurance", val: `${fmt(s.insurance)}/mo` },
                        ...(s.hoa > 0 ? [{ label: "HOA Dues", val: `${fmt(s.hoa)}/mo` }] : []),
                        { label: "Total Payment", val: `${fmt(s.total)}/mo`, bold: true, color: cardColor },
                      ].map((row, ri, arr) => (
                        <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: row.sub ? 11 : 12, borderBottom: ri < arr.length - 1 ? `1px solid ${P.cream}` : "none" }}>
                          <span className="pdf-label" style={{ color: P.warmGrayLight, fontStyle: row.sub ? "italic" : "normal" }}>{row.label}</span>
                          <span className="pdf-value" style={{ fontWeight: row.bold ? 700 : 600, color: row.color || (row.bold ? cardColor : P.text) }}>{row.val}</span>
                        </div>
                      ))}
                      {/* APR */}
                      {s.apr > 0 && (
                        <div style={{ marginTop: 10, padding: "8px 10px", background: P.cream, borderRadius: 6, textAlign: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR</span>
                          <span style={{ fontFamily: F.display, fontSize: 18, color: cardColor, display: "block" }}>{s.apr.toFixed(3)}%</span>
                          <span style={{ fontSize: 9, color: P.warmGrayLight, display: "block", marginTop: 2 }}>Note rate {Number(s.rate).toFixed(3)}%</span>
                          <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                        </div>
                      )}
                      {/* Geek Tips */}
                      <div style={{ marginTop: 14, padding: "10px 12px", background: P.cream, borderRadius: 8, fontSize: 11, lineHeight: 1.6, color: P.warmGray }}>
                        <span style={{ fontSize: 13 }}>🤓</span> <strong style={{ color: P.text }}>Geek Tips:</strong>
                        {s.program === "Conventional" && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                            <li>PMI drops off automatically at 80% LTV — no refinance needed.</li>
                            <li>Conventional loans can sometimes be <strong>recast</strong>: make a large lump-sum payment toward principal, and the lender recalculates your monthly payment at the same rate and term — lowering it without refinancing.</li>
                            <li>Best rates go to 740+ credit scores; pricing adjustments increase below 700.</li>
                          </ul>
                        )}
                        {s.program === "FHA" && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                            {s.downPct >= 10 ? (
                              <li>With 10%+ down, your monthly mortgage insurance (MIP) <strong>drops off after 11 years</strong> — unlike FHA loans with less than 10% down, which carry MIP for the life of the loan.</li>
                            ) : (
                              <li>With less than 10% down, MIP stays for the <strong>life of the loan</strong>. Refinancing to conventional once you hit 80% LTV is the typical exit strategy.</li>
                            )}
                            <li>FHA loans are <strong>assumable</strong> — a future buyer can take over your loan at your locked-in rate, which can be a major selling advantage if rates rise.</li>
                            <li>More lenient credit and DTI requirements than conventional.</li>
                          </ul>
                        )}
                        {s.program === "VA" && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                            <li>No monthly mortgage insurance — ever. The VA funding fee is a one-time cost.</li>
                            <li>VA loans are <strong>assumable</strong> — a future buyer (even a non-veteran) can assume your rate and terms, which is a powerful advantage in a rising-rate market.</li>
                            <li>No down payment required and typically the lowest rates available.</li>
                          </ul>
                        )}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeScenario(s.id); }} className="no-print" style={{ width: "100%", marginTop: 14, padding: "8px 0", borderRadius: 6, border: `1px solid ${P.creamDark}`, background: "transparent", fontSize: 11, fontWeight: 600, color: P.warmGrayLight, cursor: "pointer", fontFamily: F.body }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedId && (() => {
              const s = scenarios.find(sc => sc.id === selectedId);
              if (!s) return null;
              const calcUrl = `/calculator?price=${s.homePrice}&down=${s.downPct}&term=${s.term}&rate=${s.rate}&program=${encodeURIComponent(s.program)}&tax=${s.tax}&insurance=${s.insurance}${s.hoa > 0 ? `&hoa=${s.hoa}` : ""}`;
              return (
                <div className="no-print" style={{ textAlign: "center", marginTop: 28 }}>
                  <p style={{ fontSize: 12, color: P.warmGray, marginBottom: 10 }}>Selected: <strong>{s.program} · {s.term}yr · {fmt(s.total)}/mo</strong></p>
                  <a href={calcUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: PROGRAM_COLORS[s.program] || P.navy, color: "#fff", fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: `0 4px 16px ${(PROGRAM_COLORS[s.program] || P.navy)}40` }}><MortgageCalcIcon size={18} variant="cream" /> Load in Calculator →</a>
                </div>
              );
            })()}

            {scenarios.length < 3 && (
              <div className="no-print" style={{ textAlign: "center", marginTop: 32 }}>
                <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>+ Add another scenario from the Calculator</a>
              </div>
            )}
          </>
        )}

        <p className="no-print" style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 40, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
          Scenarios are saved locally on this device only. Clearing your browser data will remove them. NMLS# 1119524.
        </p>

        {/* Print-only footer */}
        <div className="print-only" style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${P.creamDark}`, textAlign: "center", fontSize: 9, color: P.warmGrayLight, lineHeight: 1.6 }}>
          Educational only · Not a loan estimate or commitment to lend · Rates and terms subject to change · NMLS# 1119524 · Equal Housing Lender · mortgagegeek.ai
        </div>
      </div>
      <MobileToolbar />
    </div>
  );
}

function CashToClosePage() {
  // Tax reserves prepaid schedule by state — # of months collected based on closing month
  // From CL Guide National Taxes Matrix v32, defaulting to "all remaining" schedule
  // For 2/13 splits, use 13 (more conservative)

  const TAX_RESERVE_SCHEDULE = {
    TN: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    GA: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    MS: { 1:3, 2:4, 3:5, 4:6, 5:7, 6:8, 7:9, 8:10, 9:11, 10:12, 11:12, 12:2 },
    AR: { 1:12, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9, 11:10, 12:11 },
    KY: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    // ⚠ Auto-extracted, pending hand-verification
    AL: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    AZ: { 1:6, 2:2, 3:2, 4:5, 5:5, 6:5, 7:6, 8:7, 9:2, 10:3, 11:4, 12:5 },
    CA: { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:5, 11:5, 12:6 },
    CO: { 1:4, 2:5, 3:6, 4:2, 5:2, 6:3, 7:4, 8:5, 9:6, 10:2, 11:2, 12:3 },
    DE: { 1:7, 2:8, 3:9, 4:10, 5:11, 6:12, 7:13, 8:2, 9:3, 10:4, 11:5, 12:6 },
    FL: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:13, 11:3, 12:4 },
    HI: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:2, 8:3, 9:4, 10:5, 11:6, 12:1 },
    IA: { 1:7, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
    IL: { 1:7, 2:8, 3:9, 4:10, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
    IN: { 1:5, 2:6, 3:7, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:2, 11:3, 12:4 },
    KS: { 1:5, 2:6, 3:7, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:3, 12:4 },
    LA: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    MD: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:3 },
    MN: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:2, 10:3, 11:4, 12:5 },
    MO: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    NC: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    NE: { 1:3, 2:4, 3:5, 4:6, 5:7, 6:2, 7:3, 8:4, 9:5, 10:6, 11:7, 12:8 },
    NJ: { 1:2, 2:3, 3:4, 4:2, 5:3, 6:4, 7:2, 8:3, 9:4, 10:2, 11:3, 12:4 },
    NM: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9, 11:4, 12:5 },
    NV: { 1:2, 2:1, 3:2, 4:3, 5:4, 6:3, 7:3, 8:2, 9:2, 10:2, 11:2, 12:2 },
    OH: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:2, 7:3, 8:4, 9:5, 10:6, 11:7, 12:8 },
    OK: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:13, 12:13 },
    OR: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
    PA: { 1:11, 2:12, 3:13, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:9, 12:10 },
    SC: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    TX: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:13, 12:13 },
    UT: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
    VA: { 1:3, 2:4, 3:5, 4:6, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:2 },
    WA: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:2, 9:2, 10:3, 11:4, 12:5 },
    WI: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    WV: { 1:7, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
  };

  // Reasonable national fallback schedule for any state without verified data
  const FALLBACK_SCHEDULE = { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 };

  // States where the reserve schedule is an approximation (not from the CL Guide matrix).
  // These states are not covered by Davidson Homes Mortgage's title company reference,
  // so we apply the fallback pattern and disclose it to the user. If an authoritative
  // schedule becomes available, add the state to TAX_RESERVE_SCHEDULE and remove from here.
  const UNVERIFIED_RESERVES_STATES = new Set(["MA", "CT", "RI", "NH", "VT", "ME", "DC", "NY", "MI", "ND", "SD", "ID", "MT", "WY", "AK"]);

  // Metro-level reserve schedule overrides for sub-jurisdictions that run on different
  // tax collection calendars than the state default. When a metro is listed here, its
  // schedule is used instead of the state default. Verified from CL Guide Matrix v32.
  // Only populated for metros where data is confirmed. Southeast region verified.
  const METRO_RESERVE_OVERRIDES = {
    // TN: "Roane County and Kingsport, Jefferson, and Kingston Cities" use a different schedule (taxes due December)
    // The default "All remaining cities/counties" schedule applies everywhere else.
    // None of our current TN metros fall in the Roane/Kingsport subset, so no override needed yet.

    // GA: 4 distinct schedules across sub-jurisdictions
    GA: {
      // DeKalb and Newton Counties (taxes due Sep & Nov)
      "DeKalb County": { 1:11, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:6, 9:7, 10:8, 11:9, 12:10 },
      // Cobb, Fulton, Gwinnett, and Muscogee Counties (taxes due October)
      "Atlanta/Fulton":   { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      "Cobb County":      { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      "Gwinnett County":  { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      // Cherokee, Forsyth fall into "Barrow, Bryan, Cherokee, Clayton..." (taxes due Nov)
      "Cherokee County":  { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
      "Forsyth County":   { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
      // "All other counties" uses the "Coweta, Dougherty, Houston..." schedule (due Dec)
      "All other counties": { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    },

    // NC: 3 distinct schedules
    NC: {
      // Guilford County and Greensboro City (due August)
      "Guilford/Greensboro": { 1:8, 2:9, 3:10, 4:11, 5:12, 6:13, 7:2, 8:3, 9:4, 10:5, 11:6, 12:7 },
      // "All remaining counties/cities" default (due December) — what our current NC metros use
      // No override needed for Mecklenburg, Wake, Durham, Buncombe — they use the state default
    },

    // IL: Cook County has a different tax calendar (taxes due March/Sep) vs rest of state (June/Sep)
    IL: {
      "Cook/Chicago": { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:2, 10:3, 11:4, 12:5 },
      // DuPage, Lake, Will, Kane, McHenry use the "all remaining" state default
    },

    // OH: 6+ sub-jurisdictions based on county tax due dates. Biggest metros get overrides.
    OH: {
      // Cuyahoga County/Cleveland (taxes due Dec/June)
      "Cuyahoga/Cleveland": { 1:4, 2:5, 3:6, 4:7, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:2, 12:3 },
      // Franklin County/Columbus (taxes due Jan/June)
      "Franklin/Columbus": { 1:3, 2:4, 3:5, 4:6, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:2 },
      // Hamilton County/Cincinnati (taxes due March/Aug, in Butler/Mahoning group)
      "Hamilton/Cincinnati": { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:2, 8:2, 9:3, 10:4, 11:5, 12:6 },
      // Summit/Akron, Montgomery/Dayton, Lucas/Toledo are in the largest group (Feb/July) = state default
    },
  };

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const paramProgram = params.get("program");
  const paramRate = parseFloat(params.get("rate"));
  const [program, setProgram] = useState(["Conventional", "FHA", "VA"].includes(paramProgram) ? paramProgram : "Conventional");
  const [homePrice, setHomePrice] = useState(() => { const v = parseFloat(params.get("price")); return v > 0 ? v : 350000; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 5; });
  const [convRate, setConvRate] = useState(paramProgram === "Conventional" && paramRate > 0 ? paramRate : 6.75);
  const [fhaRate, setFhaRate] = useState(paramProgram === "FHA" && paramRate > 0 ? paramRate : 6.25);
  const [vaRate, setVaRate] = useState(paramProgram === "VA" && paramRate > 0 ? paramRate : 6.25);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [closeDate, setCloseDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const paramState = params.get("state");
  const paramMetro = params.get("metro");
  const [stateCode, setStateCode] = useState(paramState || "TN");
  const [taxMetro, setTaxMetro] = useState(paramMetro || "All other counties");
  const [totalCredits, setTotalCredits] = useState(0);
  const [waiveEscrows, setWaiveEscrows] = useState(false);
  const paramVaUsage = params.get("vaUsage");
  const [vaUsage, setVaUsage] = useState(["first", "subsequent", "exempt"].includes(paramVaUsage) ? paramVaUsage : "first");
  // Editable lender fees
  const [feeUnderwriting, setFeeUnderwriting] = useState(1500);
  const [feeProcessing, setFeeProcessing] = useState(750);
  const [feeAppraisal, setFeeAppraisal] = useState(() => program === "VA" ? 650 : program === "FHA" ? 550 : 600);
  const [feeCreditReport, setFeeCreditReport] = useState(300);
  const [feeFloodCert, setFeeFloodCert] = useState(15);
  const [feeTaxService, setFeeTaxService] = useState(80);
  // Discount points — synced dollar/pct fields
  const [discountPointsPct, setDiscountPointsPct] = useState(0);
  const [discountPointsDollar, setDiscountPointsDollar] = useState(0);
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  useEffect(() => { setFeeAppraisal(program === "VA" ? 650 : program === "FHA" ? 550 : 600); }, [program]);

  // Active rate switches with selected program
  const rate = program === "Conventional" ? convRate : program === "FHA" ? fhaRate : vaRate;
  const setRate = (v) => {
    if (program === "Conventional") setConvRate(v);
    else if (program === "FHA") setFhaRate(v);
    else setVaRate(v);
  };

  const roundRate = (r) => Math.round(r / 0.125) * 0.125;

  // Fetch live MND rates on mount. Sets rateLoading=true during fetch,
  // rateLoading=false + ratesLoaded=true + rateSource=date when complete.
  useEffect(() => {
    (async () => {
      setRateLoading(true);
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv30 = find("30-year fixed");
          const fha = find("fha");
          const va = find("va");
          if (conv30 && !(paramProgram === "Conventional" && paramRate > 0)) setConvRate(roundRate(parseFloat(conv30.rate)));
          if (fha && !(paramProgram === "FHA" && paramRate > 0)) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va && !(paramProgram === "VA" && paramRate > 0)) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today");
          setRatesLoaded(true);
        }
      } catch (e) { /* fail silently, use defaults */ }
      setRateLoading(false);
    })();
  }, []);

  // Eligibility check: minimum down payment per program
  const minDown = program === "Conventional" ? 3 : program === "FHA" ? 3.5 : 0;
  const isEligible = downPct >= minDown;

  // Auto-HOI from price × 0.35% (matches calculator)
  const insuranceAnnual = Math.round(homePrice * 0.0035);

  // Auto-update tax rate when state/metro changes
  const hasMetros = !!CASH_STATE_METROS[stateCode];
  const taxRate = hasMetros
    ? (CASH_STATE_METROS[stateCode]?.metros?.[taxMetro] ?? CASH_STATE_DEFAULT_TAX_RATES[stateCode] ?? 0.008)
    : (CASH_STATE_DEFAULT_TAX_RATES[stateCode] ?? 0.008);
  const taxAnnual = Math.round(homePrice * taxRate);

  // Reset metro to default when state changes
  useEffect(() => { setTaxMetro("All other counties"); }, [stateCode]);

  const downAmt = homePrice * (downPct / 100);
  const baseLoan = Math.max(homePrice - downAmt, 0);

  const handlePointsPctChange = (v) => { setDiscountPointsPct(v); setDiscountPointsDollar(Math.round(baseLoan * (v / 100))); };
  const handlePointsDollarChange = (v) => { setDiscountPointsDollar(v); setDiscountPointsPct(baseLoan > 0 ? Math.round((v / baseLoan) * 100000) / 1000 : 0); };

  // Upfront fees (financed)
  let upfrontFee = 0, upfrontLabel = "";
  if (program === "FHA") { upfrontFee = baseLoan * 0.0175; upfrontLabel = "UFMIP (1.75%)"; }
  if (program === "VA") {
    if (vaUsage === "exempt") { upfrontFee = 0; }
    else {
      const feeRate = vaUsage === "first" ? (downPct < 5 ? 2.15 : downPct < 10 ? 1.5 : 1.25) : (downPct < 5 ? 3.3 : downPct < 10 ? 1.5 : 1.25);
      upfrontFee = baseLoan * (feeRate / 100);
      upfrontLabel = `VA Funding Fee (${feeRate}%)`;
    }
  }
  const totalLoan = baseLoan + upfrontFee;

  // Lender fees (editable)
  const underwriting = feeUnderwriting, processing = feeProcessing;
  const appraisal = feeAppraisal;
  const creditReport = feeCreditReport, floodCert = feeFloodCert, taxService = feeTaxService;
  const lenderTotal = underwriting + processing + appraisal + creditReport + floodCert + taxService + discountPointsDollar;

  // Title & Escrow — rates approximated from First American filed schedules for our 5 states
  // Lender's title: tiered rate, declines as loan amount grows (industry standard)
  // Roughly: $5/$1k on first $100k, $4/$1k on next $400k, $3/$1k above $500k
  const calcLendersTitle = (loan) => {
    if (loan <= 0) return 0;
    let total = 0;
    const tier1 = Math.min(loan, 100000);
    total += tier1 * 0.005;
    if (loan > 100000) {
      const tier2 = Math.min(loan - 100000, 400000);
      total += tier2 * 0.004;
    }
    if (loan > 500000) {
      const tier3 = loan - 500000;
      total += tier3 * 0.003;
    }
    return Math.max(250, total);
  };
  // Owner's title: similar tiered structure, slightly higher (covers full equity not just loan)
  const calcOwnersTitle = (price) => {
    if (price <= 0) return 0;
    let total = 0;
    const tier1 = Math.min(price, 100000);
    total += tier1 * 0.0058;
    if (price > 100000) {
      const tier2 = Math.min(price - 100000, 400000);
      total += tier2 * 0.0048;
    }
    if (price > 500000) {
      const tier3 = price - 500000;
      total += tier3 * 0.0038;
    }
    return Math.max(300, total);
  };
  const lendersTitle = calcLendersTitle(baseLoan);
  const ownersTitle = calcOwnersTitle(homePrice);
  const settlementFee = 500;
  const titleSearch = 200;
  const recordingFee = 125;
  const wireNotary = 75;
  const titleTotal = lendersTitle + ownersTitle + settlementFee + titleSearch + recordingFee + wireNotary;

  // Transfer taxes by state — buyer's portion only
  // TN: $0.37/$100 of value, paid by buyer (Tennessee Realty Transfer Tax)
  // GA: $1.00/$1000, paid by SELLER (no buyer impact for purchase)
  // MS: No state transfer tax
  // AR: $3.30/$1000, typically split or paid by buyer
  // KY: $0.50/$500 ($1.00/$1000), paid by SELLER
  let transferTax = 0, transferTaxNote = "";
  if (stateCode === "TN") { transferTax = homePrice * 0.0037; transferTaxNote = "TN Realty Transfer Tax: $0.37 per $100 of value"; }
  else if (stateCode === "GA") { transferTax = homePrice * 0.001; transferTaxNote = "GA Real Estate Transfer Tax: $1.00 per $1,000 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract)"; }
  else if (stateCode === "MS") { transferTax = 0; transferTaxNote = "Mississippi has no state transfer tax"; }
  else if (stateCode === "AR") { transferTax = homePrice * 0.0033; transferTaxNote = "AR Real Estate Transfer Tax: $3.30 per $1,000 of value"; }
  else if (stateCode === "KY") { transferTax = homePrice * 0.001; transferTaxNote = "KY Real Estate Transfer Tax: $0.50 per $500 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract)"; }
  else if (stateCode === "AL") { transferTax = baseLoan * 0.0015; transferTaxNote = "AL Mortgage Recording Tax: $0.15 per $100 of loan amount (buyer pays). Deed transfer tax of $0.50 per $500 is customarily paid by seller."; }
  else if (stateCode === "FL") { transferTax = baseLoan * 0.002; transferTaxNote = "FL Intangible Tax on Mortgage: $2.00 per $1,000 of loan (buyer pays). Documentary stamps on deed ($0.70 per $100 of price) are customarily paid by seller — Miami-Dade rate differs."; }
  else if (stateCode === "NC") { transferTax = homePrice * 0.002; transferTaxNote = "NC Excise Tax: $1.00 per $500 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract). 7 NC counties add a local 1% land transfer tax."; }
  else if (stateCode === "SC") { transferTax = homePrice * 0.0037; transferTaxNote = "SC Deed Recording Fee: $1.85 per $500 of value ($1.30 state + $0.55 county). Customarily paid by seller, but shown here as buyer cost — confirm with your contract."; }
  else if (stateCode === "VA") { transferTax = (homePrice * 0.0025) + (baseLoan * 0.0025); transferTaxNote = "VA State Recordation Tax: $0.25 per $100 of price (buyer/grantee pays) + $0.25 per $100 of loan amount (buyer pays mortgage tax). Grantor tax of $0.50 per $500 is paid by seller."; }
  else if (stateCode === "WV") { transferTax = homePrice * 0.0022; transferTaxNote = "WV Excise Tax: $1.10 per $500 of value (customarily paid by seller per WV Code §11-22-2, but shown here as buyer cost — confirm with your contract)."; }
  else if (stateCode === "MD") { transferTax = homePrice * 0.0075; transferTaxNote = "MD Transfer + Recordation Taxes: ~1.5% total (state 0.5% + county 0.5-1.5% + recordation 0.5-1.4%). Customarily split 50/50 between buyer and seller — ~0.75% shown as buyer's share. Baltimore City highest (~3% total). First-time MD homebuyers: state portion paid by seller."; }
  else if (stateCode === "DE") { transferTax = homePrice * 0.02; transferTaxNote = "DE Realty Transfer Tax: 4% total (2% state + up to 2% county/city), customarily split 50/50 — 2% shown as buyer's share. First-time DE buyers may qualify for a credit reducing rate by 0.5% (up to $2,000 on first $400k)."; }
  else if (stateCode === "NJ") { transferTax = homePrice >= 1000000 ? homePrice * 0.01 : 0; transferTaxNote = homePrice >= 1000000 ? "NJ Mansion Tax: 1% on properties $1M+ (buyer pays). Realty Transfer Fee (~0.4-0.6%) is paid by seller." : "NJ Realty Transfer Fee is paid by seller on the full sale. Buyer only pays the 1% 'Mansion Tax' on properties $1M or more — this purchase is below that threshold."; }
  else if (stateCode === "PA") { transferTax = homePrice * 0.01; transferTaxNote = "PA Realty Transfer Tax: 2% total (1% state + 1% local), customarily split 50/50 — 1% shown as buyer's share. Pittsburgh (5% total) and Philadelphia (4.578% total, effective July 2025) are much higher. Philadelphia adds a $256.75 deed recording fee."; }
  else if (stateCode === "DC") { transferTax = homePrice * 0.0145; transferTaxNote = "DC Recordation Tax (buyer pays): 1.45% on prices $400k+, 1.10% below. Seller separately pays a 1.45% (or 1.10%) transfer tax. First-time DC buyers may qualify for a reduced 0.725% recordation tax (income limits apply, max price $777k as of 10/1/25)."; }
  else if (stateCode === "NY") { transferTax = baseLoan * 0.018; transferTaxNote = "NY Mortgage Recording Tax (buyer pays): ~1.8% on loan amount. NYC rate is ~1.925%. State transfer tax of 0.4% is paid by seller; NYC adds RPTT 1-2.625% also typically seller-paid. Mansion tax (buyer) 1-3.9% on homes $1M+."; }
  else if (stateCode === "MA") { transferTax = 0; transferTaxNote = "MA Excise Tax: $2.28 per $500 of value (~0.456%), paid entirely by seller. Buyer owes no state transfer tax in Massachusetts."; }
  else if (stateCode === "CT") { transferTax = 0; transferTaxNote = "CT Conveyance Tax: 0.75% (under $800k) / 1.25% ($800k–$2.5M) / 2.25% (over $2.5M) + 0.25–0.5% municipal. Paid entirely by seller. Buyer owes no state conveyance tax in Connecticut."; }
  else if (stateCode === "RI") { transferTax = 0; transferTaxNote = "RI Real Estate Conveyance Tax: $2.30 per $500 of value (~0.46%), $4.60/$500 over $800k. Paid entirely by seller. Buyer owes no state conveyance tax in Rhode Island."; }
  else if (stateCode === "NH") { transferTax = homePrice * 0.0075; transferTaxNote = "NH Real Estate Transfer Tax: $0.75 per $100 of value (0.75% on buyer). NH is unique — both buyer and seller each pay the full 0.75% separately, effectively a 1.5% total tax on the transaction."; }
  else if (stateCode === "VT") {
    // Primary residence assumed: 0.5% on first $100k + 1.45% above
    const first100k = Math.min(homePrice, 100000);
    const above100k = Math.max(homePrice - 100000, 0);
    transferTax = (first100k * 0.005) + (above100k * 0.0145);
    transferTaxNote = "VT Property Transfer Tax (buyer pays): 0.5% on first $100k + 1.45% on remainder (primary residence). Non-primary residences: flat 1.45%. VT also charges a 0.2% Clean Water Surcharge on most transfers.";
  }
  else if (stateCode === "ME") {
    // 0.44% split 50/50 = 0.22% buyer. Luxury tier over $1M effective 11/1/25
    const standard = Math.min(homePrice, 1000000) * 0.0022;
    const luxury = Math.max(homePrice - 1000000, 0) * 0.006; // $6/$500 over $1M, split 50/50 = 0.6%
    transferTax = standard + luxury;
    transferTaxNote = "ME Real Estate Transfer Tax: $2.20 per $500 of value (~0.44%), split 50/50 between buyer and seller — 0.22% shown as buyer's share. Effective Nov 1, 2025: $6.00/$500 (~1.2%) applies to the portion above $1M (0.6% buyer's share).";
  }
  else if (stateCode === "CO") { transferTax = homePrice * 0.0001; transferTaxNote = "CO Documentary Fee: $0.01 per $100 of value (0.01%). Colorado has no state transfer tax (blocked by TABOR in 1992). Some resort municipalities (Aspen, Vail, Breckenridge, Crested Butte, Telluride) charge additional local transfer taxes of up to 2% — confirm with your agent if purchasing in those areas."; }
  else if (stateCode === "UT") { transferTax = 0; transferTaxNote = "Utah has no state or local real estate transfer tax."; }
  else if (stateCode === "NM") { transferTax = 0; transferTaxNote = "New Mexico has no state real estate transfer tax."; }
  else if (stateCode === "AZ") { transferTax = 2; transferTaxNote = "AZ Transfer Fee: flat $2 per transaction (essentially zero). Arizona has no percentage-based state transfer tax."; }
  else if (stateCode === "NV") {
    // Clark County (Vegas) higher rate ~0.51%, other counties ~0.39%. Seller pays.
    const isClark = taxMetro === "Clark/Las Vegas";
    transferTax = isClark ? homePrice * 0.0051 : homePrice * 0.0039;
    transferTaxNote = `NV Real Property Transfer Tax: ~${isClark ? "0.51%" : "0.39%"} in ${isClark ? "Clark County (Vegas/Henderson)" : "counties outside Clark"}. Customarily paid by seller, but shown here as buyer cost — confirm with your contract.`;
  }
  else if (stateCode === "ID") { transferTax = 0; transferTaxNote = "Idaho has no state real estate transfer tax."; }
  else if (stateCode === "MT") { transferTax = 0; transferTaxNote = "Montana has no state real estate transfer tax."; }
  else if (stateCode === "WY") { transferTax = 0; transferTaxNote = "Wyoming has no state real estate transfer tax."; }
  else if (stateCode === "IL") {
    // Chicago: buyer pays the 1.05% CTA portion of the city tax. Elsewhere: seller pays everything.
    const isChicago = taxMetro === "Cook/Chicago";
    transferTax = isChicago ? homePrice * 0.0105 : 0;
    transferTaxNote = isChicago
      ? "Chicago Real Property Transfer Tax: buyer pays the $3.75 per $500 CTA portion (1.05% of price). Seller pays the $3.00 per $500 city portion + state $0.50/$500 + Cook County $0.25/$500. Total Chicago transfer tax is ~1.50%."
      : "IL Real Estate Transfer Tax: $0.50 per $500 state (~0.10%) + $0.25 per $500 county. Customarily paid entirely by seller outside of Chicago. Some municipalities add their own tax.";
  }
  else if (stateCode === "IN") { transferTax = 0; transferTaxNote = "Indiana has no state real estate transfer tax."; }
  else if (stateCode === "OH") { transferTax = 0; transferTaxNote = "OH Conveyance Fee: $1.00 per $1,000 state + up to $3.00 per $1,000 county (~0.10-0.40% total). Customarily paid entirely by seller."; }
  else if (stateCode === "MI") { transferTax = 0; transferTaxNote = "MI Real Estate Transfer Tax: $3.75 per $500 state + $0.55 per $500 county (~0.86% total). Customarily paid entirely by seller per MCL 207.523."; }
  else if (stateCode === "WI") { transferTax = 0; transferTaxNote = "WI Real Estate Transfer Fee: $0.30 per $100 of value (~0.30%). Paid entirely by seller per Wisconsin statute — buyer owes no transfer fee."; }
  else if (stateCode === "MN") { transferTax = baseLoan * 0.0023; transferTaxNote = "MN Mortgage Registry Tax (buyer pays): 0.23% of loan amount. Separately, sellers pay a Deed Tax of 0.33% on the sale price. Hennepin and Ramsey counties add a 0.01% Environmental Response Fund Tax."; }
  else if (stateCode === "TX") { transferTax = 0; transferTaxNote = "Texas has no state real estate transfer tax. Buyers owe only standard recording fees (typically $30-50)."; }
  else if (stateCode === "LA") {
    // New Orleans: $325 flat documentary tax
    const isNOLA = taxMetro === "Orleans/New Orleans";
    transferTax = isNOLA ? 325 : 0;
    transferTaxNote = isNOLA
      ? "New Orleans Documentary Transaction Tax: flat $325 fee on all Orleans Parish transfers. Louisiana has no state-level transfer tax."
      : "Louisiana has no state real estate transfer tax. New Orleans charges a $325 flat documentary tax; other parishes do not.";
  }
  else if (stateCode === "OK") { transferTax = 0; transferTaxNote = "OK Documentary Stamp Tax: $0.75 per $500 of value (~0.15%). Customarily paid entirely by seller."; }
  else if (stateCode === "KS") { transferTax = 0; transferTaxNote = "Kansas has no state real estate transfer tax. The KS Mortgage Registration Tax was phased out in 2019 and is no longer charged."; }
  else if (stateCode === "NE") { transferTax = 0; transferTaxNote = "NE Documentary Stamp Tax: $2.25 per $1,000 of value (~0.225%). Customarily paid entirely by seller."; }
  else if (stateCode === "IA") { transferTax = Math.max(0, (homePrice - 500) * 0.0016); transferTaxNote = "IA Real Estate Transfer Tax: $0.80 per $500 of value (~0.16%), with the first $500 exempt. Buyer customarily pays per Iowa convention, though this is negotiable in the purchase contract."; }
  else if (stateCode === "MO") { transferTax = 0; transferTaxNote = "Missouri has no state real estate transfer tax. Buyers owe only standard recording fees."; }
  else if (stateCode === "ND") { transferTax = 0; transferTaxNote = "North Dakota has no state real estate transfer tax."; }
  else if (stateCode === "SD") { transferTax = 0; transferTaxNote = "SD Real Estate Transfer Fee: $0.50 per $500 of value (~0.10%). Customarily paid entirely by seller."; }
  else if (stateCode === "HI") { transferTax = 0; transferTaxNote = "HI Conveyance Tax: tiered 0.10%-1.00% for owner-occupants and 0.15%-1.25% for non-owner-occupants. Customarily paid entirely by seller. Rates increase for higher-value properties — sub-$600k properties are taxed at the lowest 0.10% tier."; }
  else if (stateCode === "AK") { transferTax = 0; transferTaxNote = "Alaska has no state real estate transfer tax. Some municipalities may charge small recording fees but no transfer tax."; }
  else if (stateCode === "OR") { transferTax = 0; transferTaxNote = "Oregon has no statewide real estate transfer tax. Washington County (which includes Beaverton and parts of Portland metro) charges a local transfer tax of 0.1% — confirm with your closing agent if purchasing there."; }
  else if (stateCode === "WA") { transferTax = 0; transferTaxNote = "WA Real Estate Excise Tax (REET): graduated state rate 1.1% (up to $525k) / 1.28% ($525k-$1.525M) / 2.75% ($1.525M-$3.025M) / 3.0% (over $3.025M), plus local REET ~0.5%. Paid by seller per RCW 82.45, though buyer is technically liable if seller doesn't pay. Combined rate typically 1.6% to 3.5%+ on the sale price."; }
  else if (stateCode === "CA") {
    // CA: county base 0.11% (seller pays). City taxes vary wildly.
    // SoCal convention: seller pays everything → buyer $0
    // NorCal convention (Oakland, Berkeley, etc.): city tax split 50/50 → buyer pays half
    // San Francisco: seller pays entire amount (unique full-seller-pays SF convention)
    // LA City with Mansion Tax: ULA 4%/5.5% on high-value sales
    const m = taxMetro;
    if (m === "Oakland") {
      // Oakland Measure U tiered: 1.0% ≤$300k, 1.5% ≤$2M, 1.75% ≤$5M, 2.5% >$5M. Split 50/50.
      const rate = homePrice <= 300000 ? 0.01 : homePrice <= 2000000 ? 0.015 : homePrice <= 5000000 ? 0.0175 : 0.025;
      transferTax = homePrice * rate * 0.5; // buyer's half
      transferTaxNote = `Oakland Real Property Transfer Tax: tiered ${(rate*100).toFixed(2)}% for this price range. Per NorCal convention, city transfer tax is split 50/50 between buyer and seller — buyer's half shown. Seller also pays the 0.11% county base tax. First-time low/moderate-income buyers may get 0.5% discount.`;
    } else if (m === "Berkeley") {
      // Berkeley: 1.5% ≤$1.5M, 2.5% >$1.5M. Split 50/50.
      const rate = homePrice <= 1500000 ? 0.015 : 0.025;
      transferTax = homePrice * rate * 0.5;
      transferTaxNote = `Berkeley Real Property Transfer Tax: ${(rate*100).toFixed(1)}% (${homePrice <= 1500000 ? "sales ≤$1.5M" : "sales >$1.5M"}). Per NorCal convention, city tax is split 50/50 — buyer's half shown. Measure W will raise rates on $1.6M+ transfers effective January 2027.`;
    } else if (m === "LA City Mansion Tax ($5.3M+)") {
      // LA City ULA: 4% on $5.3M-$10.6M, 5.5% on $10.6M+. Base 0.45% applies to all.
      // Seller pays per SoCal convention, but at this price point borrowers often ask about it.
      const ulaRate = homePrice >= 10600000 ? 0.055 : homePrice >= 5300000 ? 0.04 : 0;
      const ulaTax = homePrice * ulaRate;
      transferTax = 0; // SoCal: seller pays
      transferTaxNote = homePrice >= 5300000
        ? `LA City Measure ULA "Mansion Tax" applies: ${(ulaRate*100).toFixed(1)}% on this sale (~${fmt(ulaTax)}) plus 0.45% base city tax plus 0.11% county tax. Per SoCal convention, all transfer taxes are paid by the seller — shown as $0 to buyer. Thresholds adjust annually; effective 7/1/26 thresholds become $5.4M/$10.9M.`
        : `LA City Mansion Tax threshold is $5,300,000. This sale is below the ULA threshold — only the 0.45% base city tax + 0.11% county tax apply (total ~0.56%). Per SoCal convention, all transfer taxes are paid by the seller — shown as $0 to buyer.`;
    } else if (m === "San Francisco City") {
      transferTax = 0;
      transferTaxNote = "San Francisco Real Property Transfer Tax: tiered 0.25%-6.00% (0.5% ≤$250k, 0.68% to $1M, 0.75% to $5M, 2.25% to $10M, 2.75% to $25M, 3.0% >$25M). Paid entirely by seller per SF convention. SF has no county-level transfer tax (the city rate includes it).";
    } else if (["Los Angeles City (≤$5.3M)", "Santa Monica", "Culver City", "Beverly Hills", "Pasadena (LA County)", "Long Beach", "LA County (other cities)", "San Diego County", "Orange County", "Riverside County", "San Bernardino County", "Ventura County", "Sacramento County", "Fresno County"].includes(m)) {
      transferTax = 0;
      transferTaxNote = "CA County Documentary Transfer Tax: $1.10 per $1,000 of value (0.11%). Per Southern California convention, transfer taxes are paid entirely by the seller — shown as $0 to buyer. Some cities (Santa Monica $3/$1k, Culver City tiered 0.45%-4%, Los Angeles 0.45% + ULA) add their own taxes, also seller-paid.";
    } else {
      // Northern CA default (non-SF, non-Oakland/Berkeley): county tax split 50/50
      transferTax = homePrice * 0.00055; // half of 0.11%
      transferTaxNote = "CA County Documentary Transfer Tax: $1.10 per $1,000 of value (0.11%). Per Northern California convention, the county tax is commonly split 50/50 between buyer and seller — buyer's half (0.055%) shown. Any city-specific transfer taxes follow local custom.";
    }
  }
  else { transferTax = 0; transferTaxNote = `⚠️ Transfer tax for ${stateCode} not yet verified — confirm with your closing attorney. This estimate currently excludes any state-level transfer tax.`; }

  // Mortgage recording tax (TN has one!)
  let mortgageTax = 0;
  if (stateCode === "TN") { mortgageTax = Math.max(0, (baseLoan - 2000) * 0.00115); } // $0.115/$100 over $2k

  // Prepaids
  const insurancePrepaid = insuranceAnnual; // 12 months upfront
  // Daily interest from close date to end of month
  const closeDateObj = new Date(closeDate + "T00:00:00");
  const daysInMonth = new Date(closeDateObj.getFullYear(), closeDateObj.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - closeDateObj.getDate() + 1;
  const dailyInterest = (totalLoan * (rate / 100)) / 365;
  const prepaidInterest = dailyInterest * daysRemaining;
  const prepaidsTotal = insurancePrepaid + prepaidInterest;

  // Reserves (escrow setup)
  // Tax reserves: based on state-specific schedule by closing month
  const closingMonth = closeDateObj.getMonth() + 1; // 1-12
  // Tax reserve lookup: metro override first, then state default, then fallback
  const metroOverride = METRO_RESERVE_OVERRIDES[stateCode]?.[taxMetro];
  const taxReserveMonths = metroOverride?.[closingMonth]
    ?? TAX_RESERVE_SCHEDULE[stateCode]?.[closingMonth]
    ?? FALLBACK_SCHEDULE[closingMonth];
  const usingMetroSchedule = !!metroOverride;
  const rawTaxReserves = (taxAnnual / 12) * taxReserveMonths;
  const rawInsuranceReserves = (insuranceAnnual / 12) * 3;
  // Escrow waiver eligibility: Conventional with 20%+ down
  const canWaiveEscrows = program === "Conventional" && downPct >= 20;
  const escrowsWaived = canWaiveEscrows && waiveEscrows;
  const taxReserves = escrowsWaived ? 0 : rawTaxReserves;
  const insuranceReserves = escrowsWaived ? 0 : rawInsuranceReserves;
  const reservesTotal = taxReserves + insuranceReserves;

  // Totals
  const closingCostsExFee = lenderTotal + titleTotal + transferTax + mortgageTax + prepaidsTotal + reservesTotal;
  const closingCostsIncFee = closingCostsExFee + upfrontFee;
  const cashToClose = downAmt + closingCostsExFee - totalCredits;

  // APR calculation per Reg Z §1026.22 (actuarial method) and §1026.4(b)(5).
  // Prepaid finance charges (paid at closing or financed):
  //   - Lender fees (origination, underwriting, processing, credit, flood, tax service, appraisal)
  //   - Upfront MI (UFMIP for FHA, VA Funding Fee — these ARE finance charges)
  //   - Prepaid interest from closing date to month end
  // NOT included: title fees (borrower can shop), recording, transfer taxes,
  //   homeowner's insurance, tax/insurance escrows. Per Reg Z Appendix J.
  const aprFinanceCharges = lenderTotal + upfrontFee + prepaidInterest;

  // Monthly MI is also a finance charge for the period it is required (Reg Z §1026.4(b)(5)).
  // FHA <10% down: MI for life of loan (all 360 months on a 30-year)
  // FHA 10%+ down: MI for 11 years (132 months)
  // Conv with PMI: MI until 78% LTV reached. Estimate ~120 months conservatively for APR purposes.
  //   (Actual cancellation depends on amortization and is borrower-requested at 80% LTV.)
  // VA: no monthly MI ever.
  let aprMonthlyMI = 0;
  let aprMiMonths = 0;
  if (program === "FHA") {
    // FHA monthly MIP rate: 0.55% if <5% down, 0.50% if 5%+ down (matches our standard)
    const fhaMipRate = downPct < 5 ? 0.0055 : 0.0050;
    aprMonthlyMI = (baseLoan * fhaMipRate) / 12;
    aprMiMonths = downPct < 10 ? term * 12 : 132; // life of loan vs 11 years
  } else if (program === "Conventional" && downPct < 20) {
    // Conv PMI: tiered by down payment (matches calculator logic)
    const convPmiRate = downPct < 5 ? 0.0052 : downPct < 10 ? 0.0037 : 0.0027;
    aprMonthlyMI = (baseLoan * convPmiRate) / 12;
    aprMiMonths = 120; // ~10 years to 78% LTV at typical amortization
  }
  // VA: aprMonthlyMI stays 0

  const estimatedAPR = calculateAPR(totalLoan, aprFinanceCharges, rate, term, aprMonthlyMI, aprMiMonths);

  const PROG_COLOR = { Conventional: PROGRAM_COLORS.Conventional, FHA: PROGRAM_COLORS.FHA, VA: PROGRAM_COLORS.VA }[program];
  // Section header color: gold for Conv/VA (adds contrast against navy/sage subtotal pills),
  // navy for FHA (gold subtotal pills already contrast against the page, so navy headers stay clean)
  const headerColor = program === "FHA" ? P.navy : P.gold;

  const Row = ({ label, val, sub, bold, color, italic, subtotal }) => (
    <div style={{
      display: "flex", justifyContent: "space-between",
      padding: subtotal ? "10px 14px" : "7px 0",
      fontSize: sub ? 12 : subtotal ? 14 : 13,
      borderBottom: subtotal ? "none" : `1px solid ${P.cream}`,
      background: subtotal ? PROG_COLOR : "transparent",
      borderRadius: subtotal ? 6 : 0,
      marginTop: subtotal ? 6 : 0,
      marginBottom: subtotal ? 4 : 0,
    }}>
      <span style={{ color: subtotal ? "rgba(255,255,255,0.85)" : P.warmGray, fontStyle: italic ? "italic" : "normal", paddingLeft: sub ? 12 : 0, fontWeight: subtotal ? 700 : 400, textTransform: subtotal ? "uppercase" : "none", letterSpacing: subtotal ? 0.5 : 0, fontSize: subtotal ? 11 : "inherit" }}>{label}</span>
      <span style={{ fontWeight: bold || subtotal ? 700 : 600, color: subtotal ? "#fff" : (color || P.text), fontSize: subtotal ? 16 : "inherit" }}>{val}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .ctc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 600px) { .ctc-grid { grid-template-columns: 1fr; } }
        .ctc-loc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: stretch; margin-bottom: 12px; }
        .ctc-loc-grid > .ctc-date-cell { display: flex; flex-direction: column; }
        .ctc-loc-grid > .ctc-date-cell input { flex: 1; }
        .ctc-loc-grid > .ctc-location-stack { display: flex; flex-direction: column; gap: 12px; }
        @media (max-width: 600px) { .ctc-loc-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20cash%20to%20close%20simulator%20and%20had%20a%20question." style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>The Bottom Line</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            Cash to Close Simulator
            <CashToCloseIcon size={38} variant="navy" />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 520, margin: "0 auto" }}>Estimate exactly how much money you'll need at the closing table — down payment, closing costs, prepaids, reserves, and credits.</p>
        </div>

        {/* Inputs */}
        <div className="content-card" style={{ padding: 24, marginBottom: 16 }}>
          {/* Program selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>Loan Program</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["Conventional", "FHA", "VA"].map(p => (
                <button key={p} onClick={() => setProgram(p)} style={{
                  flex: 1, padding: "11px 0", borderRadius: 8, border: "none",
                  background: program === p ? PROGRAM_COLORS[p] : P.creamDark,
                  color: program === p ? "#fff" : P.warmGray,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body, transition: "all 0.15s",
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Tier 2 — Term + Home Price */}
          <div className="ctc-grid">
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Loan Term</label>
              <select value={term} onChange={(e) => setTerm(parseInt(e.target.value))} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                <option value={30}>30 years</option>
                <option value={15}>15 years</option>
              </select>
            </div>
            <CalcInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} comma />
          </div>

          {/* Tier 3 — Down Payment + Live Rate */}
          <div className="ctc-grid">
            <CalcInput label="Down Payment %" value={downPct} onChange={setDownPct} suffix="%" step={0.5} min={0} max={100} />
            <div style={{
              border: `1.5px solid ${P.gold}`,
              borderRadius: 8,
              background: "linear-gradient(135deg, rgba(184, 134, 11, 0.04) 0%, rgba(212, 168, 67, 0.06) 100%)",
              padding: "8px 12px 10px",
              position: "relative",
            }}>
              {!rateLoading && ratesLoaded && (
                <span style={{
                  position: "absolute",
                  top: -7,
                  right: 10,
                  background: P.gold,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: "2px 7px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                  LIVE
                </span>
              )}
              <RateInput label={`${program} Rate`} rate={rate} setRate={setRate} color={PROG_COLOR} />
              {rateLoading && (
                <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 2, fontWeight: 500, fontStyle: "italic" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: P.warmGrayLight, marginRight: 6, verticalAlign: "middle", animation: "rate-pulse 1.2s ease-in-out infinite" }} />
                  Loading today's rates...
                </p>
              )}
              {!rateLoading && ratesLoaded && rateSource && (
                <p style={{ fontSize: 10, color: P.warmGray, marginTop: 2, fontWeight: 500, fontStyle: "italic" }}>
                  {rateSource}
                </p>
              )}
            </div>
          </div>

          {/* Tier 4 — Close Date (left) + State/County stack (right) */}
          <div className="ctc-loc-grid">
            <div className="ctc-date-cell">
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Estimated Close Date</label>
              <input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", minWidth: 0, WebkitAppearance: "none" }} />
            </div>
            <div className="ctc-location-stack">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>State</label>
                <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                  {ALL_STATES_LIST.map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              {hasMetros ? (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>County / Metro Area</label>
                  <select value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                    {Object.entries(CASH_STATE_METROS[stateCode]?.metros || {}).map(([name, r]) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Property Tax Rate</label>
                  <div style={{ width: "100%", border: `1px dashed ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.warmGray }}>
                    Statewide avg ({(taxRate * 100).toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>
          </div>
          <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 4, fontStyle: "italic" }}>
            Auto-calculated: HOI {fmt(insuranceAnnual)}/yr (0.35% of price) · Property tax {fmt(taxAnnual)}/yr ({(taxRate * 100).toFixed(2)}%)
          </p>

          {program === "VA" && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>VA Eligibility</label>
              <select value={vaUsage} onChange={(e) => setVaUsage(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                <option value="first">First-Time Use</option>
                <option value="subsequent">Subsequent Use</option>
                <option value="exempt">Exempt (Disability)</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        {!isEligible ? (
          <div className="content-card" style={{ padding: "40px 32px", textAlign: "center", marginBottom: 16, overflow: "hidden" }}>
            <div style={{ background: P.warmGrayLight, margin: "-40px -32px 24px", padding: "24px", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{program}</span>
              <span style={{ fontFamily: F.display, fontSize: 30, color: "#fff" }}>Ineligible</span>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: P.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
            </div>
            <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 8 }}>Minimum {minDown}% Down Required</h3>
            <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
              {program} loans require a minimum down payment of <strong>{minDown}%</strong> ({fmt(homePrice * (minDown / 100))} on a {fmt(homePrice)} home). Increase your down payment or pick a different loan program above to see your cash to close estimate.
            </p>
          </div>
        ) : (
        <div className="content-card" style={{ overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: PROG_COLOR, padding: "24px 20px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{program} · Estimated Cash to Close</span>
            <span style={{ fontFamily: F.display, fontSize: 44, color: "#fff" }}>{fmt(cashToClose)}</span>
            <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Closing on {new Date(closeDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>

          <div style={{ padding: "20px 24px" }}>
            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 4 }}>Loan Amount</h3>
            <Row label="Base Loan Amount" val={fmt(baseLoan)} />
            {upfrontFee > 0 && <Row label={`+ ${upfrontLabel}`} val={fmt(upfrontFee)} sub italic />}
            <Row label="Total Loan (financed)" val={fmt(totalLoan)} bold color={PROG_COLOR} />

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Lender Fees <span style={{ fontSize: 10, fontWeight: 400, color: P.warmGrayLight }}>(editable)</span></h3>
            <CalcInput label="Underwriting" value={feeUnderwriting} onChange={setFeeUnderwriting} prefix="$" step={50} comma />
            <CalcInput label="Processing" value={feeProcessing} onChange={setFeeProcessing} prefix="$" step={50} comma />
            <CalcInput label="Appraisal" value={feeAppraisal} onChange={setFeeAppraisal} prefix="$" step={25} comma />
            <CalcInput label="Credit Report" value={feeCreditReport} onChange={setFeeCreditReport} prefix="$" step={25} comma />
            <CalcInput label="Flood Certification" value={feeFloodCert} onChange={setFeeFloodCert} prefix="$" step={5} />
            <CalcInput label="Tax Service" value={feeTaxService} onChange={setFeeTaxService} prefix="$" step={10} />

            {/* Discount Points */}
            <div style={{ marginTop: 10, padding: "12px 14px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: P.text }}>Discount Points</span>
                <button onClick={() => setShowPointsInfo(!showPointsInfo)} style={{ background: "none", border: "none", fontSize: 11, color: P.sage, fontWeight: 600, cursor: "pointer", fontFamily: F.body, textDecoration: "underline" }}>{showPointsInfo ? "Hide info ↑" : "What are points? ↓"}</button>
              </div>
              {showPointsInfo && (
                <div style={{ marginBottom: 12, padding: "12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray, marginBottom: 8 }}>
                    <strong style={{ color: P.navy }}>Discount points</strong> are upfront fees paid to the lender at closing to "buy down" your interest rate. Each point costs <strong>1% of the loan amount</strong> (e.g., 1 point on a $300,000 loan = $3,000).
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray, marginBottom: 8 }}>
                    Points are a trade-off: <strong>more cash upfront = lower monthly payment</strong>. Whether points make sense depends on how long you keep the loan. The "break-even" point is typically 4–7 years — if you sell or refinance before then, you may not recoup the upfront cost.
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray }}>
                    Common increments: 0.125, 0.250, 0.375, 0.500, 0.750, 1.000. Your Loan Estimate will show exactly how many points (if any) your rate includes. Points are a <strong>Reg Z finance charge</strong> and are factored into your APR.
                  </p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <CalcInput label="Points (%)" value={discountPointsPct} onChange={handlePointsPctChange} suffix="%" step={0.125} min={0} max={5} />
                <CalcInput label="Points ($)" value={discountPointsDollar} onChange={handlePointsDollarChange} prefix="$" step={100} comma />
              </div>
              {discountPointsDollar > 0 && (
                <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 4, textAlign: "center" }}>{discountPointsPct.toFixed(3)}% of {fmt(baseLoan)} loan = {fmt(discountPointsDollar)}</p>
              )}
            </div>

            <div style={{ marginTop: 10 }}><Row label="Lender Fees + Points Subtotal" val={fmt(lenderTotal)} subtotal /></div>

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Title & Escrow</h3>
            <Row label="Lender's Title Insurance" val={fmt(lendersTitle)} />
            <Row label="Owner's Title Insurance" val={fmt(ownersTitle)} />
            <Row label="Settlement / Closing Fee" val={fmt(settlementFee)} />
            <Row label="Title Search & Exam" val={fmt(titleSearch)} />
            <Row label="Recording Fee" val={fmt(recordingFee)} />
            <Row label="Wire & Notary" val={fmt(wireNotary)} />
            <Row label="Title & Escrow Subtotal" val={fmt(titleTotal)} subtotal />

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Government & Recording</h3>
            <Row label="Transfer Tax" val={fmt(transferTax)} />
            {mortgageTax > 0 && <Row label="Mortgage Recording Tax (TN)" val={fmt(mortgageTax)} />}
            <Row label="Government & Recording Subtotal" val={fmt(transferTax + mortgageTax)} subtotal />
            <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6 }}>{transferTaxNote}</p>

            <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(184,134,11,0.06)", borderRadius: 10, border: `1px solid rgba(184,134,11,0.15)` }}>
              <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 0 }}>Prepaid Items</h3>
              <Row label="12 Months Homeowner's Insurance" val={fmt(insurancePrepaid)} />
              <Row label={`Daily Interest (${daysRemaining} days × ${fmt(dailyInterest)})`} val={fmt(prepaidInterest)} />
              <Row label="Prepaids Subtotal" val={fmt(prepaidsTotal)} subtotal />
            </div>

            <div style={{ marginTop: 14, padding: "16px 18px", background: "rgba(90,122,110,0.07)", borderRadius: 10, border: `1px solid rgba(90,122,110,0.18)` }}>
              <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 0 }}>Escrow Reserves</h3>

              {/* Escrow Waiver — Conv only. FHA/VA always require escrows. */}
              {program === "Conventional" ? (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}`, opacity: canWaiveEscrows ? 1 : 0.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Waive Escrows?</label>
                    <select
                      value={waiveEscrows ? "yes" : "no"}
                      onChange={(e) => setWaiveEscrows(e.target.value === "yes")}
                      disabled={!canWaiveEscrows}
                      style={{ border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.cream, padding: "6px 28px 6px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 700, color: P.text, outline: "none", cursor: canWaiveEscrows ? "pointer" : "not-allowed", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
                      <option value="no">No — Standard Escrow</option>
                      <option value="yes">Yes — Waive Escrows</option>
                    </select>
                  </div>
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>
                    {canWaiveEscrows
                      ? "20%+ down required · You'll pay taxes and insurance directly when due (not collected at closing or monthly)"
                      : "Escrow waiver requires 20% or more down payment"}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
                  <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                    <strong style={{ color: P.navy }}>🔒 Escrows required.</strong> {program} loans require an escrow account for property taxes and homeowner's insurance for the life of the loan — escrow waiver is not permitted.
                  </p>
                </div>
              )}

              {escrowsWaived ? (
                <>
                  <p style={{ fontSize: 12, color: P.sage, fontWeight: 600, textAlign: "center", padding: "12px 0" }}>✓ Escrows waived — no reserves collected at closing</p>
                  <Row label="Reserves Subtotal" val={fmt(0)} subtotal />
                </>
              ) : (
                <>
                  <Row label={`${taxReserveMonths} Months Property Tax`} val={fmt(taxReserves)} />
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: -2, marginBottom: 4, paddingLeft: 0 }}>{usingMetroSchedule ? `${taxMetro} schedule` : UNVERIFIED_RESERVES_STATES.has(stateCode) ? `Approximate schedule (${stateCode})` : `${stateCode} schedule`} · closing in {closeDateObj.toLocaleString("en-US", { month: "long" })}</p>
                  <Row label="3 Months Insurance" val={fmt(insuranceReserves)} />
                  <Row label="Reserves Subtotal" val={fmt(reservesTotal)} subtotal />
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6 }}>{UNVERIFIED_RESERVES_STATES.has(stateCode) ? `${stateCode} uses an approximate national reserve pattern — a precise impound matrix isn't yet available for this state. Reserve amounts may differ from your actual Loan Estimate. Confirm exact reserve requirements with your closing agent.` : `Tax reserve months follow the ${stateCode} prepaid schedule based on your closing month. This varies by state and protects the lender from a tax lien gap.`}</p>
                </>
              )}
            </div>

            <h3 style={{ fontFamily: F.display, fontSize: 18, color: headerColor, marginBottom: 12, marginTop: 24, textAlign: "center" }}>Total Closing Costs</h3>
            <div style={{ padding: "18px 20px", background: P.cream, borderRadius: 12, border: `2px solid ${PROG_COLOR}` }}>
              {/* Stack of subtotals */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Lender Fees</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(lenderTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Title & Escrow</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(titleTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Government & Recording</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(transferTax + mortgageTax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Prepaid Items</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(prepaidsTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `2px solid ${P.warmGrayLight}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Escrow Reserves</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(reservesTotal)}</span>
              </div>

              {/* Grand total (excl. financed fee) */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 6px", fontSize: 15 }}>
                <span style={{ color: P.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 12 }}>Total Closing Costs</span>
                <span style={{ fontWeight: 700, color: PROG_COLOR, fontSize: 18, fontFamily: F.display }}>{fmt(closingCostsExFee)}</span>
              </div>

              {/* Financed fee section — FHA/VA only */}
              {upfrontFee > 0 && (
                <>
                  <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px dashed ${P.creamDark}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                      <span style={{ color: P.warmGrayLight, fontStyle: "italic" }}>+ {upfrontLabel} (financed)</span>
                      <span style={{ fontWeight: 600, color: P.warmGrayLight, fontStyle: "italic" }}>{fmt(upfrontFee)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", fontSize: 14 }}>
                      <span style={{ color: P.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>With Financed Fee</span>
                      <span style={{ fontWeight: 700, color: PROG_COLOR, fontSize: 16, fontFamily: F.display }}>{fmt(closingCostsIncFee)}</span>
                    </div>
                    <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>The {upfrontLabel} is rolled into your loan — not paid in cash at closing.</p>
                  </div>
                </>
              )}
            </div>

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 24 }}>Cash to Close Calculation</h3>
            <Row label="Down Payment" val={fmt(downAmt)} />
            <Row label="+ Total Closing Costs" val={fmt(closingCostsExFee)} />
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <CalcInput label="− Total Credits" value={totalCredits} onChange={setTotalCredits} prefix="$" step={500} comma />
              <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 4, lineHeight: 1.5 }}>Combine earnest money already paid, seller concessions, lender credits, and any other credits into one total here.</p>
            </div>

            <div style={{ marginTop: 16, padding: "16px 18px", background: PROG_COLOR, borderRadius: 10, textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.8 }}>Total Cash Needed at Closing</span>
              <span style={{ fontFamily: F.display, fontSize: 36, color: "#fff" }}>{fmt(cashToClose)}</span>
            </div>

            {/* APR disclosure — Reg Z compliance for borrower comparison */}
            <div style={{ marginTop: 14, padding: "16px 18px", background: P.cream, borderRadius: 10, border: `1px solid ${P.creamDark}`, textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Estimated APR</span>
                <span style={{ fontFamily: F.display, fontSize: 30, color: PROG_COLOR, fontWeight: 600, display: "block" }}>{estimatedAPR.toFixed(3)}%</span>
                <span style={{ fontSize: 10, color: P.warmGrayLight, display: "block", marginTop: 4 }}>Note rate {Number(rate).toFixed(3)}% · {term}-year term</span>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: P.warmGray, marginTop: 8, paddingTop: 10, borderTop: `1px solid ${P.creamDark}`, textAlign: "left" }}>
                <strong style={{ color: P.navy }}>What is APR?</strong> The Annual Percentage Rate reflects your note rate plus lender fees, prepaid interest, upfront mortgage insurance, and monthly mortgage insurance premiums for the period required — expressed as an annual rate. APR is typically 0.10–0.75% higher than your note rate for Conventional loans and 0.40–1.00% higher for FHA/VA loans (due to upfront and monthly MI), and is the standard apples-to-apples comparison number across lenders. This estimate includes lender fees ({fmt(lenderTotal)}){upfrontFee > 0 ? `, upfront ${program === "FHA" ? "MIP" : "VA funding fee"} (${fmt(upfrontFee)})` : ""}, prepaid interest ({fmt(prepaidInterest)}){aprMonthlyMI > 0 ? `, and monthly MI of ${fmt(aprMonthlyMI)} for ${aprMiMonths} months` : ""}. Title fees, taxes, and insurance are excluded per Reg Z Appendix J. <strong>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</strong>
              </p>
            </div>
          </div>
        </div>
        )}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          {ratesLoaded ? `Rates auto-populated from Mortgage News Daily and rounded to the nearest 0.125%. ` : ""}APR estimate calculated per Reg Z Appendix J methodology — actual APR may vary based on final loan terms, points, and lender-specific fee structure. Estimates based on national averages and state-specific transfer tax conventions. Title fees vary by underwriter and county. Actual costs depend on lender, title company, and specific transaction. <strong>This is not a Loan Estimate or commitment to lend.</strong> NMLS# 1119524.
        </p>
      </div>
      <MobileToolbar />
    </div>
  );
}



function PreQualPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [grossIncome, setGrossIncome] = useState(() => { const v = parseFloat(params.get("income")); return v > 0 ? v : 6500; });
  const [monthlyDebts, setMonthlyDebts] = useState(() => { const v = parseFloat(params.get("debts")); return v >= 0 ? v : 450; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 5; });
  const [downDollarOverride, setDownDollarOverride] = useState(null);
  const [downMode, setDownMode] = useState("pct"); // "pct" or "dollar"
  const [selectedProgram, setSelectedProgram] = useState(null); // null = auto-pick best
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [showStudentCalc, setShowStudentCalc] = useState(false);
  const [studentBalance, setStudentBalance] = useState(0);
  const [convRate, setConvRate] = useState(6.75);
  const [convRate30Api, setConvRate30Api] = useState(6.75);
  const [convRate15Api, setConvRate15Api] = useState(6.0);
  const [fhaRate, setFhaRate] = useState(6.25);
  const [vaRate, setVaRate] = useState(6.25);
  const [vaUsage, setVaUsage] = useState("first");
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville/Davidson");
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const insRate = 0.35;


  const stateData = SHARED_STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const loanLimits = selectedMetro?.limits || stateData?.limits || DEFAULT_LIMITS;

  useEffect(() => {
    const newMetros = SHARED_STATE_TAX_RATES[taxState]?.metros;
    if (newMetros && newMetros.length > 0) setTaxMetro(newMetros[0].name);
    else setTaxMetro("");
  }, [taxState]);

  const roundRate = (r) => Math.round(r / 0.125) * 0.125;
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv30 = find("30-year fixed"); const conv15 = find("15-year fixed");
          const fha = find("fha"); const va = find("va");
          const r30 = conv30 ? roundRate(parseFloat(conv30.rate)) : 6.75;
          const r15 = conv15 ? roundRate(parseFloat(conv15.rate)) : 6.0;
          setConvRate30Api(r30);
          setConvRate15Api(r15);
          setConvRate(term === 15 ? r15 : r30);
          if (fha) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today"); setRatesLoaded(true);
        }
      } catch (e) { /* silent */ }
    })();
  }, []);

  // Switch conv rate when term changes
  useEffect(() => {
    if (ratesLoaded) setConvRate(term === 15 ? convRate15Api : convRate30Api);
  }, [term]);

  // VA funding fee
  const vaFeeRate = useMemo(() => {
    if (vaUsage === "exempt") return 0;
    if (downPct >= 10) return 1.25;
    if (downPct >= 5) return 1.50;
    return vaUsage === "first" ? 2.15 : 3.30;
  }, [vaUsage, downPct]);

  // Solve max price from max housing payment
  // Effective down payment: use dollar override to derive percentage if set
  const isDollarMode = downMode === "dollar" && downDollarOverride > 0;

  const effectiveDownPct = useMemo(() => {
    if (!isDollarMode) return downPct;
    const roughMaxPayment = Math.floor(grossIncome * 0.45 - monthlyDebts);
    const roughPrice = Math.max(roughMaxPayment * 150, downDollarOverride * 2);
    return Math.min(Math.max(Math.round((downDollarOverride / roughPrice) * 10000) / 100, 0), 99);
  }, [isDollarMode, downDollarOverride, downPct, grossIncome, monthlyDebts]);

  const solvePrice = (maxPayment, rate, miRateAnnual, upfrontFeePct) => {
    if (maxPayment <= 0) return 0;
    const mr = (rate / 100) / 12;
    const n = term * 12;
    let price = maxPayment * 170;
    for (let i = 0; i < 25; i++) {
      const baseLoan = isDollarMode ? Math.max(price - downDollarOverride, 0) : price * (1 - effectiveDownPct / 100);
      const totalLoan = baseLoan * (1 + upfrontFeePct / 100);
      const pi = totalLoan > 0 ? totalLoan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : 0;
      const mi = (baseLoan * (miRateAnnual / 100)) / 12;
      const tax = (price * (taxRate / 100)) / 12;
      const ins = (price * (insRate / 100)) / 12;
      const total = pi + mi + tax + ins;
      if (total < 1) break;
      price = Math.round(price * (maxPayment / total));
      if (Math.abs(total - maxPayment) < 5) break;
    }
    return Math.max(0, price);
  };

  // Program definitions — use effectiveDownPct for MI tiers and eligibility
  const dpForCalc = isDollarMode ? effectiveDownPct : downPct;
  const convMiRate = dpForCalc < 5 ? 0.52 : dpForCalc < 10 ? 0.37 : dpForCalc < 20 ? 0.27 : 0;
  const fhaMiRate = dpForCalc < 5 ? 0.55 : 0.50;

  const programs = [
    {
      name: "Conventional", color: PROGRAM_COLORS.Conventional, rate: convRate, setRate: setConvRate,
      frontMax: 0.4999, backMax: 0.4999, miRate: convMiRate, upfrontFee: 0,
      minDown: 3, eligible: dpForCalc >= 3, loanLimit: loanLimits.conv,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : "No PMI",
      notes: "Front-end and back-end both 49.99%. DTI thresholds assume 740+ FICO — lower scores may reduce max DTI. PMI removable at 80% LTV.",
    },
    {
      name: "FHA", color: PROGRAM_COLORS.FHA, rate: fhaRate, setRate: setFhaRate,
      frontMax: 0.4699, backMax: 0.5699, miRate: fhaMiRate, upfrontFee: 1.75,
      minDown: 3.5, eligible: dpForCalc >= 3.5, loanLimit: loanLimits.fha,
      miLabel: `MIP (${fhaMiRate}%)`,
      notes: "Front-end 46.99%, back-end 56.99%. DTI thresholds assume 680+ FICO. UFMIP (1.75%) financed. MIP for life if <10% down.",
    },
    {
      name: "VA", color: PROGRAM_COLORS.VA, rate: vaRate, setRate: setVaRate,
      frontMax: 0.50, backMax: 0.55, miRate: 0, upfrontFee: vaFeeRate,
      minDown: 0, eligible: true, loanLimit: loanLimits.va,
      miLabel: "No monthly MI",
      notes: `Front-end 50%, back-end 55%. DTI thresholds assume 680+ FICO. Funding fee ${vaFeeRate}% financed. No monthly MI. Can exceed 55% with strong residual income.`,
    },
  ];

  // Calculate for each program
  const results = programs.map(prog => {
    const useFixedDown = isDollarMode;

    // When using fixed dollar down, eligibility is determined by whether the dollar
    // amount can meet the minimum down requirement at ANY price (it always can, we just cap the price)
    const isEligible = useFixedDown ? true : prog.eligible;
    if (!isEligible) return { ...prog, maxPrice: 0, maxPayment: 0, comfPrice: 0, comfPayment: 0, frontMaxHousing: 0, backTotalMax: 0, backMaxHousing: 0, overLimit: false, actualDownAmt: 0, actualDownPctDisplay: 0 };

    // Front-end: max HOUSING payment (independent of debts)
    const frontMaxHousing = prog.frontMax ? Math.floor(grossIncome * prog.frontMax) : Infinity;

    // Back-end: max TOTAL of (housing + all debts)
    const backTotalMax = Math.floor(grossIncome * prog.backMax);
    const backMaxHousing = backTotalMax - monthlyDebts;

    const maxPayment = Math.max(0, Math.min(frontMaxHousing, backMaxHousing));
    const bindingConstraint = frontMaxHousing <= backMaxHousing ? "front-end" : "back-end";

    // Comfortable range (75% of limits)
    const comfFront = prog.frontMax ? Math.floor(grossIncome * prog.frontMax * 0.75) : Infinity;
    const comfBack = Math.floor(grossIncome * prog.backMax * 0.75) - monthlyDebts;
    const comfPayment = Math.max(0, Math.min(comfFront, comfBack));

    let maxPrice = solvePrice(maxPayment, prog.rate, prog.miRate, prog.upfrontFee);
    let comfPrice = solvePrice(comfPayment, prog.rate, prog.miRate, prog.upfrontFee);

    // When using fixed dollar down, cap price so down payment meets minimum %
    // e.g., $10,000 at 3% min → max price = $333,333
    let cappedByMinDown = false;
    if (useFixedDown && prog.minDown > 0) {
      const maxPriceFromMinDown = Math.floor(downDollarOverride / (prog.minDown / 100));
      if (maxPrice > maxPriceFromMinDown) {
        maxPrice = maxPriceFromMinDown;
        cappedByMinDown = true;
      }
      if (comfPrice > maxPriceFromMinDown) {
        comfPrice = maxPriceFromMinDown;
      }
    }

    // Calculate loan amounts
    let maxLoan = useFixedDown ? Math.max(maxPrice - downDollarOverride, 0) : maxPrice * (1 - dpForCalc / 100);
    let overLimit = false;
    if (maxLoan > prog.loanLimit) {
      maxLoan = prog.loanLimit;
      maxPrice = useFixedDown ? maxLoan + downDollarOverride : Math.floor(prog.loanLimit / (1 - dpForCalc / 100));
      overLimit = true;
    }

    const maxTotalLoan = maxLoan * (1 + prog.upfrontFee / 100);
    const comfLoan = useFixedDown ? Math.max(comfPrice - downDollarOverride, 0) : comfPrice * (1 - dpForCalc / 100);
    const actualDownAmt = useFixedDown ? downDollarOverride : maxPrice * (dpForCalc / 100);
    const actualDownPctDisplay = maxPrice > 0 ? ((actualDownAmt / maxPrice) * 100).toFixed(1) : 0;

    const currentBackDTI = grossIncome > 0 ? ((monthlyDebts + maxPayment) / grossIncome * 100) : 0;

    // APR calculation for the max scenario
    const aprLenderFees = 1500 + 750 + (prog.name === "VA" ? 650 : prog.name === "FHA" ? 550 : 600) + 300 + 15 + 80;
    const aprUpfront = maxLoan * (prog.upfrontFee / 100);
    const aprCharges = aprLenderFees + aprUpfront;
    let aprMI = 0, aprMiMonths = 0;
    if (prog.name === "FHA") {
      aprMI = (maxLoan * (prog.miRate / 100)) / 12;
      aprMiMonths = dpForCalc < 10 ? term * 12 : 132;
    } else if (prog.name === "Conventional" && dpForCalc < 20) {
      aprMI = (maxLoan * (prog.miRate / 100)) / 12;
      aprMiMonths = 120;
    }
    const apr = maxTotalLoan > 0 ? calculateAPR(maxTotalLoan, aprCharges, prog.rate, term, aprMI, aprMiMonths) : 0;

    return { ...prog, eligible: isEligible, maxPrice, maxPayment, comfPrice, comfPayment, maxLoan, maxTotalLoan, comfLoan, currentBackDTI, bindingConstraint, frontMaxHousing, backTotalMax, backMaxHousing, overLimit, actualDownAmt, actualDownPctDisplay, cappedByMinDown, apr };
  });

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .pq-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pq-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        @media (max-width: 700px) {
          .pq-input-cols { grid-template-columns: 1fr; }
          .pq-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20pre-qual%20simulator%20and%20had%20a%20question." style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>What Can You Afford?</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            Pre-Qual Simulator
            <PreQualIcon size={32} variant="navy" />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>Enter your income and debts. See what you qualify for under each loan program — with their real DTI limits and mortgage insurance rules.</p>
        </div>

        {/* Inputs */}
        <div className="content-card" style={{ padding: "28px", marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" }}>
          <div className="pq-input-cols">
            {/* Left column — Income, Debts & DTI */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CalcInput label="Gross Monthly Income" value={grossIncome} onChange={setGrossIncome} prefix="$" step={250} comma />
              <CalcInput label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" step={50} comma />
              <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.5, marginTop: -4 }}>Include: car, student loans, credit cards (min payments), personal loans, child support.</p>
              <button onClick={() => setShowStudentCalc(!showStudentCalc)} style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                fontSize: 11, fontWeight: 600, color: P.gold, cursor: "pointer", fontFamily: F.body, padding: "0",
              }}>
                <span style={{ fontSize: 12 }}>🎓</span>
                {showStudentCalc ? "Hide Student Loan Calculator" : "Student Loan Payment Calculator"}
                <span style={{ fontSize: 10, transition: "transform 0.2s", transform: showStudentCalc ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
              {showStudentCalc && (
                <div style={{ background: P.creamDark, borderRadius: 8, padding: "14px 16px" }}>
                  <p style={{ fontSize: 11, color: P.warmGray, marginBottom: 10, lineHeight: 1.5 }}>
                    For student loans currently at <strong>$0/mo</strong> due to deferment, forbearance, or income-driven repayment — lenders still count a payment.
                  </p>
                  <CalcInput label="Total Student Loan Balance" value={studentBalance} onChange={setStudentBalance} prefix="$" step={1000} comma />
                  {studentBalance > 0 && (
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: P.white, borderRadius: 8, padding: "10px 14px" }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Qualifying Payment (0.5%)</span>
                        <span style={{ fontFamily: F.display, fontSize: 22, color: P.navy }}>{fmt(Math.round(studentBalance * 0.005))}/mo</span>
                      </div>
                      <button onClick={() => setMonthlyDebts(prev => prev + Math.round(studentBalance * 0.005))} style={{
                        padding: "8px 14px", borderRadius: 6, border: "none",
                        background: P.navy, color: "#fff", fontSize: 11, fontWeight: 600,
                        cursor: "pointer", fontFamily: F.body, whiteSpace: "nowrap",
                      }}>
                        + Add to Debts
                      </button>
                    </div>
                  )}
                  <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>
                    0.5% is the standard qualifying calc for deferred student loans. Use your actual payment if on an active repayment plan.
                  </p>
                </div>
              )}
            </div>
            {/* Right column — Loan Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Loan Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(parseInt(e.target.value))}
                  style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  <option value={30}>30 years</option>
                  <option value={15}>15 years</option>
                </select>
              </div>
              <div style={{ border: `1px solid ${P.creamDark}`, borderRadius: 10, padding: "14px 14px 10px", background: P.white }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.navy, display: "block", marginBottom: 10 }}>Down Payment</label>
                <div style={{ opacity: downMode === "pct" ? 1 : 0.3, pointerEvents: downMode === "pct" ? "auto" : "none", transition: "opacity 0.2s" }}>
                  <CalcInput label="Percentage" value={downMode === "pct" ? downPct : ""} onChange={(v) => { setDownPct(v); }} suffix="%" step={1} min={0} max={100} />
                </div>
                <button onClick={() => {
                  if (downMode === "pct") { setDownMode("dollar"); setDownDollarOverride(null); }
                  else { setDownMode("pct"); setDownDollarOverride(null); }
                }} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
                  padding: "7px 0", margin: "8px 0", borderRadius: 6, border: "none",
                  background: P.gold, color: "#fff",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.body,
                }}>
                  Switch to {downMode === "pct" ? "Dollar Amount" : "Percentage"}
                </button>
                <div style={{ opacity: downMode === "dollar" ? 1 : 0.3, pointerEvents: downMode === "dollar" ? "auto" : "none", transition: "opacity 0.2s" }}>
                  <CalcInput label="Dollar Amount" value={downMode === "dollar" && downDollarOverride ? downDollarOverride : ""} onChange={(v) => { setDownDollarOverride(v > 0 ? v : null); }} prefix="$" step={1000} comma />
                </div>
              </div>
            </div>
          </div>

          {/* Property location row */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${P.creamDark}` }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>Property Location</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select value={taxState} onChange={(e) => setTaxState(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 32px 10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                {Object.entries(SHARED_STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                  <option key={code} value={code}>{s.name}</option>
                ))}
              </select>
              {metroList.length > 0 && (
                <select value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 32px 10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                  <option value="">State Avg ({stateData.rate}%)</option>
                  {metroList.map((m) => (
                    <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>
                  ))}
                </select>
              )}
            </div>
            <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 6 }}>Limits: FHA {fmt(loanLimits.fha)} · Conv {fmt(loanLimits.conv)} · VA {fmt(loanLimits.va)}</p>
          </div>
        </div>

        {/* Per-program rate inputs — NAVY TREATMENT for visual prominence */}
        <div style={{
          background: P.navy,
          borderRadius: 14,
          padding: "18px 28px 22px",
          marginBottom: 32,
          maxWidth: 800,
          margin: "0 auto 32px",
          boxShadow: "0 4px 20px rgba(15, 37, 48, 0.18)",
          borderTop: `3px solid ${P.gold}`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle gold radial glow in top-right corner for warmth */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 180,
            height: "100%",
            background: "radial-gradient(circle at top right, rgba(212, 168, 67, 0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8, position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>Interest Rates by Program</span>
            {ratesLoaded && (
              <span style={{ fontSize: 11, color: P.goldLight, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: 0.9 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: P.goldLight,
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(212, 168, 67, 0.6)",
                  animation: "rate-pulse 2s ease-in-out infinite",
                }} />
                Live rates loaded · {rateSource}
              </span>
            )}
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: P.cream, opacity: 0.65, marginBottom: 14, lineHeight: 1.5, position: "relative", zIndex: 1 }}>
            National averages via Mortgage News Daily, rounded to the nearest 0.125%. Your actual rate may differ — adjust below to match your quote.
          </p>

          {/* Rate pills — RateInput component unchanged, cream pills sit on navy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
            {[
              { label: "Conventional", rate: convRate, setRate: setConvRate, color: P.navy },
              { label: "FHA", rate: fhaRate, setRate: setFhaRate, color: "#8B6914" },
              { label: "VA", rate: vaRate, setRate: setVaRate, color: P.sage },
            ].map((p) => (
              <RateInput key={p.label} label={p.label} rate={p.rate} setRate={p.setRate} color={p.color} />
            ))}
          </div>

          {!ratesLoaded && (
            <p style={{ fontSize: 11, color: P.cream, opacity: 0.6, marginTop: 10, fontStyle: "italic", position: "relative", zIndex: 1 }}>Adjust rates manually or they'll auto-populate when live data loads.</p>
          )}
        </div>
      </div>

      {/* RESULTS ZONE — deeper cream background extends from divider down to end of page */}
      <div style={{ background: P.creamDark, paddingBottom: 64 }}>
        <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto" }}>
          {/* Section divider — Your Results (background pill now matches the new deeper bg) */}
          <div style={{ margin: "40px auto 24px", maxWidth: 800, position: "relative", textAlign: "center" }}>
            <div style={{ height: 1, background: `linear-gradient(to right, transparent, rgba(155, 148, 136, 0.3), transparent)`, position: "absolute", left: 0, right: 0, top: "50%" }} />
            <div style={{ position: "relative", display: "inline-block", background: P.creamDark, padding: "0 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold }}>↓ Your Results ↓</span>
              <p style={{ fontSize: 13, color: P.warmGray, marginTop: 6, maxWidth: 480 }}>Tap any card to send that scenario to the calculator</p>
            </div>
          </div>

        {/* Program result cards */}
        <div className="pq-cards-grid">
          {results.map((prog, i) => {
            if (!prog.eligible) {
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", opacity: 0.6 }}>
                  <div style={{ background: P.warmGrayLight, padding: "20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 24, color: "#fff" }}>Ineligible</span>
                  </div>
                  <div style={{ padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>⚠️</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 4 }}>Min {prog.minDown}% Down Required</p>
                    <p style={{ fontSize: 11, color: P.warmGray }}>Increase down payment to {prog.minDown}% to see {prog.name} results.</p>
                  </div>
                </div>
              );
            }

            const bestPrice = Math.max(...results.filter(r => r.eligible && r.maxPrice > 0).map(r => r.maxPrice));
            const isBest = prog.maxPrice === bestPrice && prog.maxPrice > 0;
            const isSelected = selectedProgram === prog.name;

            return (
              <div key={i} className="content-card" onClick={() => setSelectedProgram(isSelected ? null : prog.name)} style={{
                overflow: "hidden", position: "relative", cursor: "pointer",
                border: isSelected ? `3px solid ${P.gold}` : `3px solid transparent`,
                boxShadow: isSelected ? `0 0 0 4px rgba(184,134,11,0.15), 0 8px 30px rgba(0,0,0,0.12)` : undefined,
                transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
              }}>
                {isSelected && (
                  <span style={{ position: "absolute", top: 8, left: 8, zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "3px 10px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>✓ Selected</span>
                )}
                {/* Header */}
                <div style={{ background: prog.color, padding: "20px", textAlign: "center", position: "relative" }}>
                  {isBest && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: "#fff", color: prog.color, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "3px 8px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>★ Most Power</span>
                  )}
                  <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{prog.name} · Max Purchase</span>
                  <span style={{ fontFamily: F.display, fontSize: 34, color: "#fff" }}>{fmt(prog.maxPrice)}</span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {Number(prog.rate).toFixed(3)}% · {prog.overLimit ? "capped at loan limit" : prog.cappedByMinDown ? `capped at ${prog.minDown}% min down` : `${prog.bindingConstraint} DTI binding`}
                  </span>
                  {prog.overLimit && (
                    <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "3px 10px", borderRadius: 10 }}>
                      ⚠️ Loan limit: {fmt(prog.loanLimit)}
                    </span>
                  )}
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {/* DTI breakdown — two stacked bars */}
                  <div style={{ marginBottom: 14 }}>
                    {/* Front-End bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 4 }}>
                        <span>Front-End DTI {prog.bindingConstraint === "front-end" && prog.frontMax ? "← binding" : ""}</span>
                        <span style={{ fontWeight: 700, color: prog.frontMax && prog.bindingConstraint === "front-end" ? prog.color : P.warmGrayLight }}>
                          {prog.frontMax ? `${((prog.maxPayment / grossIncome) * 100).toFixed(1)}% / ${(prog.frontMax * 100).toFixed(1)}%` : "N/A (VA)"}
                        </span>
                      </div>
                      <div style={{ height: 6, background: P.creamDark, borderRadius: 3, overflow: "hidden" }}>
                        {prog.frontMax ? (
                          <div style={{ height: "100%", width: `${Math.min(((prog.maxPayment / grossIncome) / prog.frontMax) * 100, 100)}%`, background: prog.color, borderRadius: 3, transition: "width 0.3s" }} />
                        ) : (
                          <div style={{ height: "100%", width: "100%", background: `repeating-linear-gradient(45deg, ${P.creamDark}, ${P.creamDark} 4px, ${P.cream} 4px, ${P.cream} 8px)`, borderRadius: 3 }} />
                        )}
                      </div>
                    </div>
                    {/* Back-End bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 4 }}>
                        <span>Back-End DTI {prog.bindingConstraint === "back-end" ? "← binding" : ""}</span>
                        <span style={{ fontWeight: 700, color: prog.bindingConstraint === "back-end" ? prog.color : P.warmGrayLight }}>
                          {prog.currentBackDTI.toFixed(1)}% / {(prog.backMax * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: 6, background: P.creamDark, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((prog.currentBackDTI / (prog.backMax * 100)) * 100, 100)}%`, background: prog.color, borderRadius: 3, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  </div>

                  {/* Max breakdown */}
                  <div style={{ marginBottom: 12 }}>
                    {[
                      { label: "Max Housing Payment", val: fmt(prog.maxPayment), bold: true },
                      ...(monthlyDebts > 0 ? [{ label: "Housing + Debts", val: fmt(prog.maxPayment + monthlyDebts), sub: `of ${fmt(prog.backTotalMax)} back-end max` }] : []),
                      { label: "Loan Amount", val: fmt(prog.maxLoan), warn: prog.overLimit },
                      { label: "Loan Limit", val: fmt(prog.loanLimit), dim: !prog.overLimit },
                      ...(prog.upfrontFee > 0 ? [{ label: `Financed Fee (${prog.upfrontFee}%)`, val: fmt(prog.maxLoan * (prog.upfrontFee / 100)) }] : []),
                      { label: "Down Payment", val: fmt(prog.actualDownAmt), sub: `${prog.actualDownPctDisplay}%` },
                      { label: prog.miLabel, val: prog.miRate > 0 ? fmt((prog.maxLoan * prog.miRate / 100) / 12) + "/mo" : "—" },
                    ].map((r, ri) => (
                      <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11, color: r.dim ? P.creamDark : P.warmGray, borderBottom: `1px solid ${P.cream}`, opacity: r.dim ? 0.6 : 1 }}>
                        <span>{r.label}</span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: r.bold ? 700 : 600, color: r.warn ? "#C0392B" : r.bold ? prog.color : r.dim ? P.warmGrayLight : P.text }}>{r.val}</span>
                          {r.sub && <span style={{ display: "block", fontSize: 9, color: P.warmGrayLight }}>{r.sub}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comfortable range */}
                  <div style={{ background: P.creamDark, borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Comfortable Range</span>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Purchase Price</span>
                      <span style={{ fontWeight: 700, color: P.sage }}>{fmt(prog.comfPrice)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Housing Payment</span>
                      <span style={{ fontWeight: 600, color: P.text }}>{fmt(prog.comfPayment)}/mo</span>
                    </div>
                  </div>

                  {prog.name === "VA" && (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: 12, padding: "10px 12px", background: P.creamDark, borderRadius: 8 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>VA Eligibility</label>
                      <select value={vaUsage} onChange={(e) => setVaUsage(e.target.value)}
                        style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.white, padding: "7px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                        <option value="first">First-Time Use</option>
                        <option value="subsequent">Subsequent Use</option>
                        <option value="exempt">Exempt (Disability)</option>
                      </select>
                    </div>
                  )}

                  <p style={{ fontSize: 10, color: P.warmGrayLight, lineHeight: 1.5, fontStyle: "italic" }}>{prog.notes}</p>

                  {/* APR */}
                  {prog.apr > 0 && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR at Max Purchase</span>
                      <span style={{ fontFamily: F.display, fontSize: 22, color: prog.color }}>{prog.apr.toFixed(3)}%</span>
                      <p style={{ fontSize: 9, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4 }}>Note rate {Number(prog.rate).toFixed(3)}% · Includes lender fees{prog.upfrontFee > 0 ? `, ${prog.name === "FHA" ? "UFMIP" : "VA funding fee"}` : ""}{prog.miRate > 0 ? ", monthly MI" : ""}</p>
                      <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Geek tip */}
        <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
              <p style={{ marginBottom: 8 }}>
                <strong>Why the numbers differ:</strong> FHA uses two separate DTI caps — a 46.99% front-end (housing payment alone can't exceed this) and a 56.99% back-end (housing + all debts combined). With low debts, the front-end is your ceiling; as debts rise, the back-end takes over. Conventional uses a single 49.99% cap for both front-end and back-end — your housing payment and your total debts must each stay under this threshold. VA allows up to 50% back-end with no monthly MI — often the strongest option for eligible borrowers.
              </p>
              <p>
                <strong>This is a simulator, not a commitment.</strong> Actual pre-approval depends on credit score, reserves, employment history, and property type. Use these numbers to guide your house hunting — then call me for the real thing.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-link to calculator */}
        {(() => {
          const eligible = results.filter(r => r.eligible && r.maxPrice > 0);
          const selected = selectedProgram ? eligible.find(r => r.name === selectedProgram) : null;
          const target = selected || eligible.reduce((a, b) => (a && a.maxPrice > b.maxPrice ? a : b), null);
          const targetPrice = target ? target.maxPrice : 0;
          const targetName = target ? target.name : "";
          const calcUrl = `/calculator?price=${targetPrice > 0 ? targetPrice : 350000}&down=${downPct}&term=${term}`;
          return (
            <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <a href={calcUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                <MortgageCalcIcon size={16} variant="navy" /> {targetPrice > 0 ? `Run ${targetName} ${fmt(targetPrice)}` : "Open the Calculator"} →
              </a>
              {!selectedProgram && eligible.length > 1 && (
                <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 8, fontStyle: "italic" }}>Tap a card above to choose a different scenario</p>
              )}
            </div>
            </>
          );
        })()}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          This simulator is for educational purposes only. Contact me at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized pre-approval. NMLS# 1119524.
        </p>
        </div>
      </div>
      <MobileToolbar />
    </div>
  );
}


function CalculatorPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const paramRate = parseFloat(params.get("rate"));
  const paramProgram = params.get("program");
  const [homePrice, setHomePrice] = useState(() => { const v = parseFloat(params.get("price")); return v > 0 ? v : 350000; });
  const [convRate, setConvRate] = useState(paramProgram === "Conventional" && paramRate > 0 ? paramRate : 6.75);
  const [convRate30Api, setConvRate30Api] = useState(6.75);
  const [convRate15Api, setConvRate15Api] = useState(6.0);
  const [fhaRate, setFhaRate] = useState(paramProgram === "FHA" && paramRate > 0 ? paramRate : 6.25);
  const [vaRate, setVaRate] = useState(paramProgram === "VA" && paramRate > 0 ? paramRate : 6.25);
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 3.5; });
  const [downDollarOverride, setDownDollarOverride] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [saveToast, setSaveToast] = useState(null);
  const [extraConfig, setExtraConfig] = useState({});
  const getExtraConfig = (programName) => extraConfig[programName] || { enabled: false, strategy: "monthly", amount: 0 };
  const updateExtraConfig = (programName, updates) => {
    setExtraConfig((prev) => ({ ...prev, [programName]: { ...getExtraConfig(programName), ...updates } }));
  };
  useEffect(() => { setDownDollarOverride(null); }, [homePrice]); // reset override when price changes

  const handleDownPctChange = (v) => { setDownPct(v); setDownDollarOverride(null); };
  const handleDownDollarChange = (v) => {
    setDownDollarOverride(v);
    if (homePrice > 0) setDownPct(Math.round((v / homePrice) * 10000) / 100);
  };
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville");
  const [vaUsage, setVaUsage] = useState("first");
  const paramHoa = parseFloat(params.get("hoa"));
  const [showHoa, setShowHoa] = useState(paramHoa > 0);
  const [hoa, setHoa] = useState(paramHoa > 0 ? paramHoa : 0);


  const stateData = SHARED_STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const loanLimits = selectedMetro?.limits || stateData?.limits || DEFAULT_LIMITS;
  const [taxes, setTaxes] = useState(Math.round((350000 * (0.95 / 100)) / 12));
  useEffect(() => { setTaxes(Math.round((homePrice * (taxRate / 100)) / 12)); }, [taxState, taxMetro, homePrice]);
  // Reset metro when state changes
  useEffect(() => {
    const newMetros = SHARED_STATE_TAX_RATES[taxState]?.metros;
    if (newMetros && newMetros.length > 0) setTaxMetro(newMetros[0].name);
    else setTaxMetro("");
  }, [taxState]);

  const [insurance, setInsurance] = useState(Math.round((350000 * 0.0035) / 12));
  useEffect(() => { setInsurance(Math.round((homePrice * 0.0035) / 12)); }, [homePrice]);

  // Override taxes/insurance from URL params (e.g. loaded from comparison tool)
  useEffect(() => {
    const pTax = parseFloat(params.get("tax"));
    const pIns = parseFloat(params.get("insurance"));
    if (pTax > 0) setTimeout(() => setTaxes(pTax), 0);
    if (pIns > 0) setTimeout(() => setInsurance(pIns), 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);

  // Round to nearest 0.125%
  const roundRate = (r) => Math.round(r / 0.125) * 0.125;

  // Fetch live rates on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv30 = find("30-year fixed");
          const conv15 = find("15-year fixed");
          const fha = find("fha");
          const va = find("va");
          const r30 = conv30 ? roundRate(parseFloat(conv30.rate)) : 6.75;
          const r15 = conv15 ? roundRate(parseFloat(conv15.rate)) : 6.0;
          setConvRate30Api(r30);
          setConvRate15Api(r15);
          if (!(paramProgram === "Conventional" && paramRate > 0)) setConvRate(term === 15 ? r15 : r30);
          if (fha && !(paramProgram === "FHA" && paramRate > 0)) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va && !(paramProgram === "VA" && paramRate > 0)) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today");
          setRatesLoaded(true);
        }
      } catch (e) { /* fail silently, use defaults */ }
    })();
  }, []);

  // Switch conv rate when term changes
  useEffect(() => {
    if (ratesLoaded) {
      setConvRate(term === 15 ? convRate15Api : convRate30Api);
    }
  }, [term]);

  const downAmt = downDollarOverride !== null ? downDollarOverride : homePrice * (downPct / 100);
  const baseLoan = homePrice - downAmt;

  // Conventional
  const convLoan = baseLoan;
  const convMiRate = downPct < 5 ? 0.52 : downPct < 10 ? 0.37 : downPct < 20 ? 0.27 : 0;
  const convMI = (baseLoan * (convMiRate / 100)) / 12;
  const { monthly: convPI } = useMemo(() => generateAmortData(convLoan, convRate, term), [convLoan, convRate, term]);
  const convTotal = convPI + convMI + taxes + insurance + hoa;

  // FHA
  const fhaUpfront = baseLoan * 0.0175;
  const fhaLoan = baseLoan + fhaUpfront;
  const fhaMiRate = downPct < 5 ? 0.55 : 0.50;
  const fhaMI = (baseLoan * (fhaMiRate / 100)) / 12;
  const { monthly: fhaPI } = useMemo(() => generateAmortData(fhaLoan, fhaRate, term), [fhaLoan, fhaRate, term]);
  const fhaTotal = fhaPI + fhaMI + taxes + insurance + hoa;

  // VA - Funding fee varies by usage type and down payment
  const vaFeeRate = useMemo(() => {
    if (vaUsage === "exempt") return 0;
    if (downPct >= 10) return 1.25;
    if (downPct >= 5) return 1.50;
    // Less than 5% down
    return vaUsage === "first" ? 2.15 : 3.30;
  }, [vaUsage, downPct]);
  const vaFee = baseLoan * (vaFeeRate / 100);
  const vaLoan = baseLoan + vaFee;
  const { monthly: vaPI } = useMemo(() => generateAmortData(vaLoan, vaRate, term), [vaLoan, vaRate, term]);
  const vaTotal = vaPI + taxes + insurance + hoa;

  const vaUsageLabels = { first: "First-Time Use", subsequent: "Subsequent Use", exempt: "Exempt (Disability)" };

  // Lender fees for APR calculation (matches Cash to Close simulator)
  const calcLenderFees = 1500 + 750 + 600 + 300 + 15 + 80; // underwriting + processing + appraisal + credit + flood + tax service

  // APR per program — includes lender fees, upfront MI, and monthly MI per Reg Z §1026.4(b)(5)
  const convAprCharges = calcLenderFees;
  const convAprMI = downPct < 20 ? (baseLoan * (convMiRate / 100)) / 12 : 0;
  const convAprMiMonths = downPct < 20 ? 120 : 0;
  const convAPR = calculateAPR(convLoan, convAprCharges, convRate, term, convAprMI, convAprMiMonths);

  const fhaAprCharges = calcLenderFees + fhaUpfront;
  const fhaAprMI = (baseLoan * (fhaMiRate / 100)) / 12;
  const fhaAprMiMonths = downPct < 10 ? term * 12 : 132;
  const fhaAPR = calculateAPR(fhaLoan, fhaAprCharges, fhaRate, term, fhaAprMI, fhaAprMiMonths);

  const vaAprCharges = calcLenderFees + vaFee;
  const vaAPR = calculateAPR(vaLoan, vaAprCharges, vaRate, term, 0, 0);

  const programs = [
    {
      name: "Conventional", color: PROGRAM_COLORS.Conventional, loan: convLoan, pi: convPI, mi: convMI,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : null,
      upfront: 0, upfrontLabel: null, total: convTotal, rate: convRate, apr: convAPR,
      note: downPct >= 20 ? "No PMI required" : `PMI est. based on 740+ FICO, <43% DTI`,
      eligible: downPct >= 3, minDown: 3,
      loanLimit: loanLimits.conv, overLimit: baseLoan > loanLimits.conv,
    },
    {
      name: "FHA", color: PROGRAM_COLORS.FHA, loan: fhaLoan, pi: fhaPI, mi: fhaMI,
      miLabel: `MIP (${fhaMiRate}%)`,
      upfront: fhaUpfront, upfrontLabel: "UFMIP (1.75%)", total: fhaTotal, rate: fhaRate, apr: fhaAPR,
      note: downPct < 10 ? "MIP for life of loan" : "MIP removable after 11 years",
      eligible: downPct >= 3.5, minDown: 3.5,
      loanLimit: loanLimits.fha, overLimit: baseLoan > loanLimits.fha,
    },
    {
      name: "VA", color: PROGRAM_COLORS.VA, loan: vaLoan, pi: vaPI, mi: 0,
      miLabel: null,
      upfront: vaFee, upfrontLabel: vaFeeRate > 0 ? `Funding Fee (${vaFeeRate}%)` : null, total: vaTotal, rate: vaRate, apr: vaAPR,
      note: vaUsage === "exempt"
        ? "Funding fee waived — service-connected disability"
        : `No monthly MI — ${vaUsageLabels[vaUsage].toLowerCase()}, ${downPct >= 10 ? "10%+ down" : downPct >= 5 ? "5–9.99% down" : "<5% down"}`,
      isVA: true, eligible: true, minDown: 0,
      loanLimit: loanLimits.va, overLimit: baseLoan > loanLimits.va,
    },
  ];

  const overLimitPrograms = programs.filter(p => p.overLimit && p.eligible);
  const countyLabel = selectedMetro ? selectedMetro.name : (stateData ? `${stateData.name} default` : "county");

  const eligibleTotals = programs.filter(p => p.eligible).map(p => p.total);
  const lowestTotal = eligibleTotals.length > 0 ? Math.min(...eligibleTotals) : 0;

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .calc-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .calc-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .calc-dp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .calc-tax-group { background: rgba(184, 134, 11, 0.04); border: 1px solid rgba(184, 134, 11, 0.18); border-radius: 10px; padding: 12px 14px 10px; display: flex; flex-direction: column; gap: 8px; }
        .calc-tax-group-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #B8860B; }
        @media (max-width: 700px) {
          .calc-input-cols { grid-template-columns: 1fr; }
          .calc-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Calculator header */}
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: P.gold, color: "#fff",
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20mortgage%20calculator%20and%20had%20a%20question." style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>Side-by-Side Comparison</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            Mortgage Calculator
            <MortgageCalcIcon size={26} />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 540, margin: "0 auto" }}>One set of inputs, three loan programs. See how Conventional, FHA, and VA stack up for the same home.</p>
        </div>

        {/* Input card - 2 column layout */}
        <div className="content-card" style={{ padding: "28px", marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" }}>
          <div className="calc-input-cols">
            {/* LEFT COLUMN — Loan structure & amount */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Loan Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(parseInt(e.target.value))}
                  style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  <option value={30}>30 years</option>
                  <option value={15}>15 years</option>
                </select>
              </div>

              <CalcInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} comma />

              <div className="calc-dp-row">
                <CalcInput label="Down Payment %" value={downPct} onChange={handleDownPctChange} suffix="%" step={0.5} min={0} max={100} />
                <CalcInput label="Down Payment $" value={Math.round(downAmt)} onChange={handleDownDollarChange} prefix="$" step={1000} min={0} max={homePrice} comma />
              </div>

              <div style={{ padding: "10px 14px", background: P.creamDark, borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Base Loan Amount</span>
                <span style={{ fontFamily: F.display, fontSize: 20, color: P.navy }}>{fmt(baseLoan)}</span>
              </div>
            </div>

            {/* RIGHT COLUMN — Monthly escrow items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CalcInput label="Homeowners Ins. (est.)" value={insurance} onChange={setInsurance} prefix="$" step={25} />

              <div className="calc-tax-group">
                <div className="calc-tax-group-label">Property Tax</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Location</label>
                  <select
                    value={taxState}
                    onChange={(e) => setTaxState(e.target.value)}
                    style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  >
                    {Object.entries(SHARED_STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                      <option key={code} value={code}>{s.name}</option>
                    ))}
                  </select>
                  {metroList.length > 0 && (
                    <select
                      value={taxMetro}
                      onChange={(e) => setTaxMetro(e.target.value)}
                      style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px", fontSize: 13, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", marginTop: 4, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                    >
                      <option value="">State Avg ({stateData.rate}%)</option>
                      {metroList.map((m) => (
                        <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>
                      ))}
                    </select>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Monthly Amount</label>
                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray, marginRight: 4 }}>$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={taxes.toLocaleString("en-US")}
                      onChange={(e) => { const v = parseFloat(e.target.value.replace(/,/g, "")); if (!isNaN(v)) setTaxes(v); else if (e.target.value === "") setTaxes(0); }}
                      style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", minWidth: 0, width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {!showHoa ? (
                <button onClick={() => setShowHoa(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 12, color: P.sage, fontWeight: 600, cursor: "pointer" }}>+ Add HOA Dues <span style={{ fontSize: 10, fontWeight: 400, color: P.warmGrayLight }}>(optional)</span></button>
              ) : (
                <div>
                  <CalcInput label="Monthly HOA Dues (optional)" value={hoa} onChange={setHoa} prefix="$" step={25} />
                  <button onClick={() => { setShowHoa(false); setHoa(0); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 11, color: P.warmGrayLight, cursor: "pointer", marginTop: 2 }}>✕ Remove HOA</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Per-program rate inputs — NAVY TREATMENT for visual prominence */}
        <div style={{
          background: P.navy,
          borderRadius: 14,
          padding: "18px 28px 22px",
          marginBottom: 32,
          maxWidth: 800,
          margin: "0 auto 32px",
          boxShadow: "0 4px 20px rgba(15, 37, 48, 0.18)",
          borderTop: `3px solid ${P.gold}`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle gold radial glow in top-right corner for warmth */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 180,
            height: "100%",
            background: "radial-gradient(circle at top right, rgba(212, 168, 67, 0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8, position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>Interest Rates by Program</span>
            {ratesLoaded && (
              <span style={{ fontSize: 11, color: P.goldLight, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: 0.9 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: P.goldLight,
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(212, 168, 67, 0.6)",
                  animation: "rate-pulse 2s ease-in-out infinite",
                }} />
                Live rates loaded · {rateSource}
              </span>
            )}
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: P.cream, opacity: 0.65, marginBottom: 14, lineHeight: 1.5, position: "relative", zIndex: 1 }}>
            National averages via Mortgage News Daily, rounded to the nearest 0.125%. Your actual rate may differ — adjust below to match your quote.
          </p>

          {/* Rate pills — RateInput component unchanged, cream pills sit on navy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
            {[
              { label: "Conventional", rate: convRate, setRate: setConvRate, color: P.navy },
              { label: "FHA", rate: fhaRate, setRate: setFhaRate, color: "#8B6914" },
              { label: "VA", rate: vaRate, setRate: setVaRate, color: P.sage },
            ].map((p) => (
              <RateInput key={p.label} label={p.label} rate={p.rate} setRate={p.setRate} color={p.color} />
            ))}
          </div>

          {!ratesLoaded && (
            <p style={{ fontSize: 11, color: P.cream, opacity: 0.6, marginTop: 10, fontStyle: "italic", position: "relative", zIndex: 1 }}>Adjust rates manually or they'll auto-populate when live data loads.</p>
          )}
        </div>
      </div>

      {/* RESULTS ZONE — deeper cream background extends from divider down to end of page */}
      <div style={{ background: P.creamDark, paddingBottom: 64 }}>
        <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto" }}>
          {/* Section divider — Your Results (background pill now matches the new deeper bg) */}
          <div style={{ margin: "40px auto 24px", maxWidth: 800, position: "relative", textAlign: "center" }}>
            <div style={{ height: 1, background: `linear-gradient(to right, transparent, rgba(155, 148, 136, 0.3), transparent)`, position: "absolute", left: 0, right: 0, top: "50%" }} />
            <div style={{ position: "relative", display: "inline-block", background: P.creamDark, padding: "0 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold }}>↓ Your Results ↓</span>
              <p style={{ fontSize: 13, color: P.warmGray, marginTop: 6, maxWidth: 480 }}>Tap any card to select it, then save to the Loan Comparison Tool</p>
            </div>
          </div>

        {/* Side-by-side cards */}
        <div className="calc-cards-grid">
          {programs.map((prog, i) => {
            const isBest = prog.eligible && prog.total === lowestTotal;

            if (!prog.eligible) {
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", position: "relative", opacity: 0.6 }}>
                  <div style={{ background: P.warmGrayLight, padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 28, color: "#fff" }}>Ineligible</span>
                  </div>
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: P.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <span style={{ fontSize: 24 }}>⚠️</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: P.text, marginBottom: 6 }}>Minimum {prog.minDown}% Down Required</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray }}>
                      {prog.name} loans require a minimum down payment of {prog.minDown}% ({fmt(homePrice * (prog.minDown / 100))}).
                      Increase your down payment to see {prog.name} payment details.
                    </p>
                  </div>
                </div>
              );
            }

            if (prog.overLimit) {
              const neededDown = homePrice - prog.loanLimit;
              const neededPct = homePrice > 0 ? (neededDown / homePrice) * 100 : 0;
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", position: "relative", opacity: 0.65 }}>
                  <div style={{ background: P.warmGrayLight, padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 28, color: "#fff" }}>Over Loan Limit</span>
                  </div>
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(184, 134, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <span style={{ fontSize: 24 }}>⚠️</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: P.text, marginBottom: 6 }}>Exceeds {countyLabel} {prog.name} Limit</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray, marginBottom: 10 }}>
                      The {prog.name} loan limit for this area is <strong style={{ color: P.text }}>{fmt(prog.loanLimit)}</strong>. Your current loan amount of <strong style={{ color: P.text }}>{fmt(baseLoan)}</strong> exceeds it.
                    </p>
                    <div style={{ background: "rgba(184, 134, 11, 0.08)", border: "1px solid rgba(184, 134, 11, 0.25)", borderRadius: 8, padding: "10px 12px" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.gold, marginBottom: 4 }}>To Qualify</p>
                      <p style={{ fontSize: 13, color: P.text, lineHeight: 1.5 }}>
                        Increase down payment to at least <strong>{fmt(neededDown)}</strong> ({neededPct.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            const isSelected = selectedProgram === prog.name;
            return (
              <div key={i} className="content-card" onClick={() => setSelectedProgram(isSelected ? null : prog.name)} style={{
                overflow: "hidden", position: "relative", cursor: "pointer",
                border: isSelected ? `3px solid ${P.gold}` : `3px solid transparent`,
                boxShadow: isSelected ? `0 0 0 4px rgba(184,134,11,0.15), 0 8px 30px rgba(0,0,0,0.12)` : undefined,
                transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
              }}>
                {isSelected && (
                  <span style={{ position: "absolute", top: 10, left: 10, zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "4px 10px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>✓ Selected</span>
                )}
                {/* Header */}
                <div style={{ background: prog.color, padding: "24px 20px", textAlign: "center", position: "relative" }}>
                  {isBest && (
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      background: "#fff", color: prog.color,
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
                      padding: "4px 10px", borderRadius: 50,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>★ Lowest</span>
                  )}
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                  <span style={{ fontFamily: F.display, fontSize: 40, color: "#fff" }}>{fmt(prog.total)}</span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>/month · {Number(prog.rate).toFixed(3)}% rate</span>
                </div>

                <div style={{ padding: "20px" }}>
                  {/* Breakdown */}
                  <div style={{ marginBottom: 16 }}>
                    {[
                      { label: "Principal & Interest", val: prog.pi },
                      ...(prog.mi > 0 ? [{ label: prog.miLabel, val: prog.mi }] : []),
                      { label: "Taxes", val: taxes },
                      { label: "Insurance", val: insurance },
                      ...(hoa > 0 ? [{ label: "HOA Dues", val: hoa }] : []),
                    ].map((r, ri) => (
                      <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, color: P.warmGray, borderBottom: `1px solid ${P.cream}` }}>
                        <span>{r.label}</span>
                        <span style={{ fontWeight: 600, color: P.text }}>{fmt(r.val)}</span>
                      </div>
                    ))}
                  </div>

                  {/* VA Usage selector */}
                  {prog.isVA && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>VA Eligibility</label>
                      <select
                        value={vaUsage}
                        onChange={(e) => setVaUsage(e.target.value)}
                        style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.cream, padding: "8px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                      >
                        <option value="first">First-Time Use</option>
                        <option value="subsequent">Subsequent Use</option>
                        <option value="exempt">Exempt (Disability)</option>
                      </select>
                    </div>
                  )}

                  {/* Loan details */}
                  <div style={{ background: P.cream, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Base Loan Amount</span>
                      <span style={{ fontWeight: 600, color: P.text }}>{fmt(baseLoan)}</span>
                    </div>
                    {prog.upfront > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, fontStyle: "italic" }}>
                        <span style={{ color: P.warmGrayLight }}>+ {prog.upfrontLabel}</span>
                        <span style={{ fontWeight: 600, color: P.warmGrayLight }}>{fmt(prog.upfront)}</span>
                      </div>
                    )}
                    {prog.isVA && prog.upfront === 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, fontStyle: "italic" }}>
                        <span style={{ color: P.sage, fontWeight: 600 }}>Funding Fee Waived</span>
                        <span style={{ fontWeight: 600, color: P.sage }}>$0</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingTop: 6, borderTop: prog.upfront > 0 || prog.isVA ? `1px solid ${P.creamDark}` : "none" }}>
                      <span style={{ color: P.warmGray }}>Total Loan Amount</span>
                      <span style={{ fontWeight: 700, color: prog.color }}>{fmt(prog.loan)}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", fontStyle: "italic" }}>{prog.note}</p>

                  {/* Pay it off faster */}
                  {(() => {
                    const cfg = getExtraConfig(prog.name);
                    const biweeklyEquivalent = Math.round(prog.pi / 12);
                    return (
                      <div style={{ marginTop: 12 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { enabled: !cfg.enabled }); }}
                          style={{
                            width: "100%",
                            background: cfg.enabled ? prog.color : P.cream,
                            color: cfg.enabled ? "#fff" : P.text,
                            border: `1px solid ${cfg.enabled ? prog.color : P.creamDark}`,
                            borderRadius: 8,
                            padding: "10px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: F.body,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "background 0.15s, color 0.15s, border-color 0.15s",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>⚡</span>
                            <span>Pay it off faster</span>
                          </span>
                          <span style={{ fontSize: 14, opacity: 0.7 }}>{cfg.enabled ? "▾" : "▸"}</span>
                        </button>

                        {cfg.enabled && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginTop: 10, padding: "14px 14px 12px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}
                          >
                            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 8 }}>Strategy</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
                              {[
                                { key: "monthly", label: "Monthly" },
                                { key: "annual", label: "Annual" },
                                { key: "biweekly", label: "Bi-weekly" },
                              ].map((s) => {
                                const active = cfg.strategy === s.key;
                                return (
                                  <button
                                    key={s.key}
                                    onClick={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { strategy: s.key }); }}
                                    style={{
                                      background: active ? prog.color : "#fff",
                                      color: active ? "#fff" : P.text,
                                      border: `1px solid ${active ? prog.color : P.creamDark}`,
                                      borderRadius: 6,
                                      padding: "8px 4px",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      fontFamily: F.body,
                                      cursor: "pointer",
                                      transition: "background 0.15s, color 0.15s, border-color 0.15s",
                                    }}
                                  >
                                    {s.label}
                                  </button>
                                );
                              })}
                            </div>

                            {cfg.strategy === "biweekly" ? (
                              <div style={{ background: "#fff", borderRadius: 6, padding: "10px 12px", border: `1px solid ${P.creamDark}` }}>
                                <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                                  Paying half your P&I every two weeks results in 26 half-payments (13 full) per year — one extra monthly payment, split into <strong style={{ color: P.text }}>{fmt(biweeklyEquivalent)}/mo</strong> equivalent.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>
                                  Extra {cfg.strategy === "annual" ? "per year" : "per month"}
                                </label>
                                <div style={{ position: "relative" }}>
                                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: P.warmGrayLight, fontWeight: 600 }}>$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={cfg.amount || ""}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { amount: parseFloat(e.target.value) || 0 }); }}
                                    placeholder="0"
                                    style={{
                                      width: "100%",
                                      background: "#fff",
                                      border: `1px solid ${P.creamDark}`,
                                      borderRadius: 6,
                                      padding: "10px 12px 10px 24px",
                                      fontSize: 13,
                                      fontFamily: F.body,
                                      fontWeight: 600,
                                      color: P.text,
                                      outline: "none",
                                      boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Compute original vs improved scenarios */}
                            {(() => {
                              const isConv = prog.name === "Conventional";
                              const isFHA = prog.name === "FHA";

                              let miDropoffType = "none";
                              let miMonths = 0;
                              if (isConv && prog.mi > 0) {
                                miDropoffType = "ltv";
                                miMonths = term * 12;
                              } else if (isFHA) {
                                miDropoffType = "term";
                                miMonths = downPct < 10 ? term * 12 : 132;
                              }

                              const originalResult = generateAmortData(prog.loan, prog.rate, term, {
                                strategy: "none",
                                monthlyMI: prog.mi,
                                miMonths,
                                homeValue: homePrice,
                                miDropoffType,
                              });

                              const improvedResult = generateAmortData(prog.loan, prog.rate, term, {
                                strategy: cfg.strategy,
                                extraAmount: cfg.amount,
                                monthlyMI: prog.mi,
                                miMonths,
                                homeValue: homePrice,
                                miDropoffType,
                              });

                              const hasMeaningfulInput =
                                cfg.strategy === "biweekly" ||
                                (cfg.amount && cfg.amount > 0);

                              if (!hasMeaningfulInput) {
                                return (
                                  <div style={{ marginTop: 12, padding: "14px 16px", background: P.cream, borderRadius: 6, textAlign: "center" }}>
                                    <p style={{ fontSize: 12, color: P.warmGrayLight, fontStyle: "italic" }}>
                                      Enter an amount above to see your savings.
                                    </p>
                                  </div>
                                );
                              }

                              const interestSaved = originalResult.totalInterest - improvedResult.totalInterest;
                              const monthsSaved = originalResult.payoffMonth - improvedResult.payoffMonth;

                              const miSaved = originalResult.miPaidTotal - improvedResult.miPaidTotal;
                              const miMonthsSaved = (originalResult.miEndMonth || 0) - (improvedResult.miEndMonth || 0);
                              const showPmiNote = (isConv || isFHA) && miSaved > 100;

                              const headlineLabel =
                                cfg.strategy === "biweekly" ? "Bi-weekly payments" :
                                cfg.strategy === "annual" ? `$${cfg.amount.toLocaleString()}/year extra` :
                                `$${cfg.amount.toLocaleString()}/month extra`;

                              return (
                                <div style={{ marginTop: 12, background: "linear-gradient(135deg, " + P.creamDark + " 0%, " + P.cream + " 100%)", borderRadius: 8, padding: "14px 12px" }}>
                                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 2 }}>
                                      Your Impact
                                    </span>
                                    <div style={{ fontFamily: F.display, fontSize: 17, color: P.navy }}>
                                      {headlineLabel}
                                    </div>
                                  </div>

                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                                    <div style={{ background: "#fff", borderRadius: 6, padding: "10px 11px", borderTop: `2px solid ${P.warmGrayLight}` }}>
                                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 4 }}>
                                        Original
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Loan term</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {formatPayoff(originalResult.payoffMonth)}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Total interest</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {fmt(originalResult.totalInterest)}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ background: "#fff", borderRadius: 6, padding: "10px 11px", borderTop: `2px solid ${P.gold}` }}>
                                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.gold, marginBottom: 4 }}>
                                        With extra
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Payoff in</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {formatPayoff(improvedResult.payoffMonth)}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Total interest</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {fmt(improvedResult.totalInterest)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ background: P.navy, color: P.cream, borderRadius: 6, padding: "10px 14px", textAlign: "center" }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: P.goldLight, textTransform: "uppercase", marginBottom: 2 }}>
                                      You save
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: P.cream, fontVariantNumeric: "tabular-nums", lineHeight: 1.4 }}>
                                      <span style={{ display: "block" }}>
                                        <strong style={{ color: P.goldLight }}>{fmt(interestSaved)}</strong> in interest
                                      </span>
                                      <span style={{ display: "block", fontSize: 13, fontWeight: 500, opacity: 0.92, marginTop: 2 }}>
                                        Pay off <strong style={{ color: P.goldLight, fontWeight: 700 }}>{formatPayoff(monthsSaved)}</strong> sooner
                                      </span>
                                    </div>
                                  </div>

                                  {showPmiNote && (
                                    <div style={{ marginTop: 8, padding: "7px 11px", background: "rgba(184, 134, 11, 0.08)", borderRadius: 4, borderLeft: `2px solid ${P.gold}` }}>
                                      <p style={{ fontSize: 10.5, color: P.warmGray, lineHeight: 1.4 }}>
                                        <strong style={{ color: P.navy }}>{isFHA ? "Note:" : "Bonus:"}</strong>{" "}
                                        {isFHA
                                          ? `FHA MIP runs the life of the loan with <10% down, but ends ${formatPayoff(miMonthsSaved)} earlier with these payments.`
                                          : `PMI also drops off ${formatPayoff(miMonthsSaved)} earlier, saving an additional ${fmt(miSaved)}.`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* APR */}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR</span>
                    <span style={{ fontFamily: F.display, fontSize: 22, color: prog.color }}>{prog.apr.toFixed(3)}%</span>
                    <p style={{ fontSize: 9, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4 }}>Includes lender fees{prog.upfront > 0 ? `, ${prog.upfrontLabel}` : ""}{prog.mi > 0 ? ", monthly MI" : ""}. <a href={`/cash-to-close?price=${homePrice}&down=${downPct}&term=${term}&program=${encodeURIComponent(prog.name)}&rate=${prog.rate}&state=${taxState}&metro=${encodeURIComponent(taxMetro)}${prog.isVA ? `&vaUsage=${vaUsage}` : ""}${hoa > 0 ? `&hoa=${hoa}` : ""}`} style={{ color: P.warmGrayLight, textDecoration: "underline" }}>Full APR detail →</a></p>
                    <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary insight */}
        <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
              {eligibleTotals.length >= 2 && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Monthly difference:</strong> The spread between the lowest and highest eligible payment is{" "}
                  <strong style={{ color: P.navy }}>{fmt(Math.max(...eligibleTotals) - lowestTotal)}/month</strong>{" "}
                  ({fmt((Math.max(...eligibleTotals) - lowestTotal) * 12)}/year).
                  {convRate !== fhaRate || convRate !== vaRate ? (
                    <span> Rate spread: Conv {convRate}% vs FHA {fhaRate}% vs VA {vaRate}% — this difference alone accounts for a meaningful portion of the payment gap.</span>
                  ) : null}
                </p>
              )}
              {programs.some(p => !p.eligible) && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Note:</strong> {programs.filter(p => !p.eligible).map(p => p.name).join(" and ")} {programs.filter(p => !p.eligible).length === 1 ? "is" : "are"} ineligible at {downPct}% down. 
                  {downPct < 3 ? " Minimum down payments: Conventional (3%), FHA (3.5%). Only VA allows 0% down." :
                   downPct < 3.5 ? " FHA requires a minimum 3.5% down payment. Increase to 3.5% to compare all three programs." : ""}
                </p>
              )}
              <p>
                {downPct >= 20
                  ? "With 20%+ down, Conventional has no PMI — often the clear winner. But compare the total loan amounts: FHA and VA finance upfront fees, meaning you borrow more even with the same down payment."
                  : downPct >= 5
                    ? "At this down payment, pay attention to mortgage insurance. Conventional PMI is removable at 80% LTV, FHA MIP may stay for the life of the loan, and VA has no monthly MI at all (but the funding fee adds to your balance). Conv PMI estimates here assume 740+ FICO and DTI under 43% — lower scores or higher DTI will increase PMI."
                    : downPct >= 3.5
                      ? "At less than 5% down, all three programs carry some form of mortgage insurance or upfront fee. Conv PMI estimates assume 740+ FICO and DTI under 43% — lower scores will increase PMI significantly. VA is often the best deal if you're eligible — no monthly MI at all."
                      : "At this down payment level, VA is likely your only option if you're eligible. Consider increasing your down payment to unlock Conventional and FHA programs."}
              </p>
              {vaUsage !== "exempt" && (
                <p style={{ marginTop: 8 }}>
                  <strong>VA funding fee:</strong> Currently set to {vaUsageLabels[vaUsage].toLowerCase()} at {vaFeeRate}%
                  {downPct < 5 && vaUsage === "subsequent" ? " — this is the highest tier. First-time users with the same down payment pay 2.15% instead." : ""}
                  {downPct >= 5 ? ` — at ${downPct >= 10 ? "10%+" : "5–9.99%"} down, the fee is the same for first-time and subsequent use.` : ""}
                  {" "}Use the dropdown on the VA card to compare scenarios. Veterans with service-connected disabilities are exempt entirely.
                </p>
              )}
              {vaUsage === "exempt" && (
                <p style={{ marginTop: 8 }}>
                  <strong>VA funding fee waived.</strong> Veterans with service-connected disabilities are exempt from the funding fee, making VA even more competitive — no upfront fee and no monthly MI.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Save to Comparison */}
        {(() => {
          const selectedProg = selectedProgram ? programs.find(p => p.name === selectedProgram && p.eligible) : null;
          const saveScenario = () => {
            if (!selectedProg) return;
            const STORAGE_KEY = "mg_compare_scenarios";
            let saved = [];
            try { const raw = localStorage.getItem(STORAGE_KEY); saved = raw ? JSON.parse(raw) : []; } catch {}
            if (saved.length >= 3) {
              setSaveToast({ type: "error", msg: "Comparison is full (3 max). Remove one first." });
              setTimeout(() => setSaveToast(null), 4000);
              return;
            }
            const scenario = {
              id: Date.now(),
              program: selectedProg.name,
              color: selectedProg.color,
              homePrice, downPct, downAmt, term, rate: selectedProg.rate,
              baseLoan, totalLoan: selectedProg.loan,
              upfront: selectedProg.upfront || 0,
              upfrontLabel: selectedProg.upfrontLabel || null,
              loan: selectedProg.loan, pi: selectedProg.pi, mi: selectedProg.mi,
              tax: taxes, insurance, hoa: hoa > 0 ? hoa : 0, total: selectedProg.total, apr: selectedProg.apr,
            };
            saved.push(scenario);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
            setSaveToast({ type: "success", msg: `${selectedProg.name} saved! ${saved.length} of 3 in comparison.` });
            setTimeout(() => setSaveToast(null), 4000);
          };
          return (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <button onClick={saveScenario} disabled={!selectedProg} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 10, border: "none",
                background: selectedProg ? P.navy : P.creamDark,
                color: selectedProg ? "#fff" : P.warmGrayLight,
                fontFamily: F.body, fontSize: 14, fontWeight: 600,
                cursor: selectedProg ? "pointer" : "not-allowed",
                boxShadow: selectedProg ? "0 4px 16px rgba(27,58,75,0.25)" : "none",
                transition: "all 0.2s",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <CompareIcon size={18} variant="cream" />
                  {selectedProg ? `Save ${selectedProg.name} to Loan Comparison` : "Select a card above to save"}
                </span>
              </button>
              {saveToast && (
                <p style={{ fontSize: 12, marginTop: 10, fontWeight: 600, color: saveToast.type === "error" ? "#C0392B" : P.sage }}>{saveToast.msg}</p>
              )}
              <div style={{ marginTop: 10 }}>
                <a href="/compare" style={{ fontSize: 12, color: P.warmGrayLight, textDecoration: "underline", fontFamily: F.body }}>View saved scenarios →</a>
              </div>
            </div>
          );
        })()}

        {/* Cross-link to prequal */}

        {/* Disclaimer */}
        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          {ratesLoaded ? "Rates auto-populated from current national averages (Mortgage News Daily) and rounded to the nearest 0.125%. " : ""}
          This calculator is for educational purposes only. Actual rates, fees, and payment amounts vary by lender, credit profile, and loan scenario. Contact me at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized quote. NMLS# 1119524.
        </p>
        </div>
      </div>
      <MobileToolbar hrefOverrides={{ "/prequal": `/prequal?down=${downPct}&term=${term}` }} />
    </div>
  );
}

function InstallPage() {
  // Auto-detect OS from user agent. Default to iOS if unclear (iOS has the worst
  // discoverability for Add to Home Screen, so it's the more important case to surface).
  const [os, setOs] = useState(() => {
    if (typeof navigator === "undefined") return "ios";
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    return "ios";
  });

  // Detect if user is on iOS but NOT in Safari — critical edge case since
  // Chrome/Brave/Firefox on iOS CANNOT install PWAs (Apple restricts this to Safari).
  const isIosNotSafari = (() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const iOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Brave/i.test(ua);
    return iOS && !isSafari;
  })();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/install");
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Clipboard API unavailable (very rare on modern iOS) — fall back to manual prompt
      window.prompt("Copy this URL and paste it into Safari:", window.location.origin + "/install");
    }
  };

  const Step = ({ num, title, body }) => (
    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: P.gold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontSize: 16, fontWeight: 700 }}>{num}</div>
      <div style={{ flex: 1, paddingTop: 3 }}>
        <h4 style={{ fontFamily: F.display, fontSize: 17, color: P.navy, marginBottom: 4 }}>{title}</h4>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: P.warmGray }}>{body}</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>One-Tap Access</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 10 }}>Install The Mortgage Geek</h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>Add this site to your home screen and it works like a real app — launches full-screen with its own icon, opens faster, and works offline.</p>
        </div>

        {/* Why install micro-section */}
        <div className="content-card" style={{ padding: "20px 22px", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>🚀</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Faster</strong><br/>Launches instantly, no typing URLs.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>📱</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Full-screen</strong><br/>No browser bars — feels like an app.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>⚡</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Works offline</strong><br/>Reference content loads without signal.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>🔒</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Private</strong><br/>No App Store account, no tracking.</p></div>
          </div>
        </div>

        {/* OS tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, background: P.creamDark, padding: 4, borderRadius: 10 }}>
          <button onClick={() => setOs("ios")} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: os === "ios" ? P.navy : "transparent", color: os === "ios" ? "#fff" : P.warmGray, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🍎 iPhone / iPad</button>
          <button onClick={() => setOs("android")} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: os === "android" ? P.navy : "transparent", color: os === "android" ? "#fff" : P.warmGray, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🤖 Android</button>
        </div>

        {/* iOS instructions */}
        {os === "ios" && (
          <div className="content-card" style={{ padding: "28px 24px" }}>
            {isIosNotSafari && (
              <div style={{ background: `${P.gold}15`, border: `1px solid ${P.gold}`, borderRadius: 10, padding: "16px 18px", marginBottom: 24 }}>
                <strong style={{ color: P.navy, fontSize: 13, display: "block", marginBottom: 6 }}>⚠️ You're not in Safari</strong>
                <p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.6, marginBottom: 12 }}>Apple restricts app installation to Safari only on iPhone/iPad — Chrome, Brave, and Firefox can't install web apps on iOS. Copy the link below, then paste it into Safari's address bar.</p>
                <button onClick={copyCurrentUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, background: copiedUrl ? P.sage : P.navy, color: "#fff", border: "none", fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                  {copiedUrl ? (<><span>✓</span><span>Copied — now open Safari</span></>) : (<><span>📋</span><span>Copy install link</span></>)}
                </button>
              </div>
            )}
            <Step num="1" title="Open in Safari" body="Make sure you're in Safari — not Chrome, Brave, or another browser. Apple only allows Safari to install web apps on iPhone." />
            <Step num="2" title="Tap the Share button" body="It's the square icon with an up arrow, at the bottom of the screen on iPhone or top-right on iPad." />
            <Step num="3" title='Scroll and tap "Add to Home Screen"' body="You may need to scroll down the share sheet to find it. The icon looks like a plus sign inside a square." />
            <Step num='4' title='Confirm "Open as Web App" is ON' body={'This toggle (new in iOS 17+) is crucial — it\'s what makes the app launch full-screen instead of just opening Safari. Leave it enabled.'} />
            <Step num="5" title="Tap Add" body="The icon appears on your home screen. Tap it any time to launch The Mortgage Geek full-screen." />
          </div>
        )}

        {/* Android instructions */}
        {os === "android" && (
          <div className="content-card" style={{ padding: "28px 24px" }}>
            <Step num="1" title="Open in Chrome" body="Chrome on Android has the best PWA install support. Samsung Internet also works, but Firefox and Brave on Android have inconsistent behavior." />
            <Step num="2" title="Tap the three-dot menu" body="In the top-right corner of Chrome. The menu will slide down with a list of options." />
            <Step num="3" title='Tap "Install app" or "Add to Home screen"' body="The exact label depends on your Chrome version. If you see an install prompt banner at the bottom of the screen, you can just tap that instead." />
            <Step num="4" title="Confirm Install" body="A dialog asks you to confirm. Tap Install. The Mortgage Geek icon is added to your app drawer and home screen." />
            <Step num="5" title="Launch it like any app" body="Tap the icon to open full-screen with no Chrome UI. It behaves just like a native app." />
          </div>
        )}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Questions? Call Nick at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a>. No account needed — just tap the icon.
        </p>
      </div>
    </div>
  );
}

// ─── Deep Dives ─────────────────────────────────────────────────────────────

function DeepDivesHubPage() {
  const topics = [
    {
      slug: "derogatory-credit",
      emoji: "⏳",
      title: "Derogatory Credit Wait Periods",
      summary: "How long you have to wait before qualifying for a mortgage after bankruptcy, foreclosure, short sale, deed-in-lieu, or late mortgage payments — compared across all five major loan programs.",
      lastVerified: "April 2026",
    },
  ];

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🐳</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 10 }}>Deep Dives</span>
          <h1 style={{ fontFamily: F.display, fontSize: 42, color: P.navy, fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}>
            Where <em style={{ fontStyle: "italic", color: P.gold }}>real questions</em> get real answers.
          </h1>
          <p style={{ fontSize: 15, color: P.warmGray, maxWidth: 620, margin: "0 auto", lineHeight: 1.65 }}>
            Mortgage guidelines aren't one-size-fits-all. Different loan programs have different rules — sometimes dramatically different. These deep dives compare how the five major programs handle common borrower situations, with clear answers and the source handbook sections cited.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {topics.map((t) => (
            <a key={t.slug} href={`/deep-dives/${t.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: "24px 28px",
                border: `1px solid ${P.creamDark}`,
                borderLeft: `3px solid ${P.gold}`,
                transition: "transform 0.15s, box-shadow 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(15, 37, 48, 0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{t.emoji}</span>
                  <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, fontWeight: 400, lineHeight: 1.2 }}>{t.title}</h3>
                </div>
                <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 10 }}>{t.summary}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified · {t.lastVerified}</span>
                  <span style={{ fontSize: 13, color: P.gold, fontWeight: 600 }}>Read →</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, padding: "24px", background: P.creamDark, borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: P.warmGray, fontStyle: "italic" }}>More deep dives coming soon. Got a topic you want covered? <a href="tel:+16156560737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Call (615) 656-0737</a>.</p>
        </div>
      </div>

      <MobileToolbar />
    </div>
  );
}

function DerogatoryCreditPage() {
  const [openAccordion, setOpenAccordion] = useState("chapter7");

  const accordions = [
    {
      id: "chapter7",
      title: "Chapter 7 Bankruptcy",
      summary: "Complete liquidation bankruptcy. Wait periods range from 12 months (FHA/VA with extenuating circumstances) to 4 years (Conventional standard).",
      table: {
        headers: ["Program", "Standard Wait", "With Extenuating Circumstances", "Source"],
        rows: [
          ["Fannie Mae", "4 years from discharge/dismissal", "2 years", "Selling Guide B3-5.3-07"],
          ["Freddie Mac", "4 years from discharge/dismissal", "2 years", "Selling Guide 5202.5"],
          ["FHA", "2 years from discharge", "1 year (manual underwriting)", "HUD 4000.1 II.A.5.b.iv"],
          ["VA", "2 years from discharge", "1 year (manual underwriting)", "Lender's Handbook M26-7 Ch. 4"],
          ["USDA", "3 years from discharge", "1 year (credit exception, manual UW)", "HB-1-3555 Chapter 10"],
        ],
      },
      explainer: [
        "Chapter 7 is \"liquidation\" bankruptcy — non-exempt assets sold off, unsecured debts discharged, fresh start. Because it's the more severe of the two personal bankruptcy types, every agency imposes a wait period before the borrower can qualify for a new mortgage.",
        "The clock starts on the **discharge date** (the date the court officially wiped the debts), *not* the filing date. This matters — if someone filed in January 2024 but wasn't discharged until October 2024, the wait period starts from October.",
        "**Extenuating circumstances** can cut the wait period roughly in half, but the bar is high. The bankruptcy must have resulted from events genuinely beyond the borrower's control, documented with proof, and the borrower must have re-established a pattern of responsible credit use since. For FHA and VA specifically, these files require **manual underwriting** — meaning an actual human underwriter reviews and approves rather than the automated system.",
      ],
      tip: "About 18 months past a Chapter 7 discharge with clean credit since? Don't assume you're locked out. **FHA or VA with a documented extenuating circumstances letter can cut the wait in half** — from 2 years down to 1. The bar is higher than most people expect though. Qualifying situations include extended medical crisis with documented hospital records, involuntary job loss from a company closure or layoff (not a voluntary quit), or death of a primary wage-earning spouse. What doesn't count: divorce, moving for a new job, general overspending, or a failed business due to normal market conditions. If you're not sure whether your situation meets the standard, it's worth a conversation with a loan officer before ruling yourself out.",
    },
    {
      id: "chapter13",
      title: "Chapter 13 Bankruptcy",
      summary: "Repayment plan bankruptcy. Most lenient paths: FHA and VA can approve during the active plan with just 12 months of on-time payments + court permission.",
      table: {
        headers: ["Program", "Discharged", "Dismissed", "During Active Plan", "Source"],
        rows: [
          ["Fannie Mae", "2 years from discharge", "4 years from dismissal", "Not eligible during active plan", "Selling Guide B3-5.3-07"],
          ["Freddie Mac", "2 years from discharge", "4 years from dismissal", "Not eligible during active plan", "Selling Guide 5202.5"],
          ["FHA", "No wait (after discharge)", "Varies; manual UW", "12 months of on-time plan payments + court permission", "HUD 4000.1 II.A.5.b.iv"],
          ["VA", "No wait (after discharge)", "Varies; manual UW", "12 months of on-time plan payments + court permission", "Lender's Handbook M26-7 Ch. 4"],
          ["USDA", "12 months from discharge", "Credit exception required", "12 months into plan + court permission", "HB-1-3555 Chapter 10"],
        ],
      },
      explainer: [
        "Chapter 13 is the \"reorganization\" bankruptcy — no liquidation of assets, but a court-approved plan to repay some or all of the debt over 3-5 years. Because the borrower is actively demonstrating commitment to repaying obligations, every agency treats Chapter 13 more favorably than Chapter 7.",
        "**The big unlock is the \"during active plan\" path.** FHA, VA, and USDA all allow a borrower to qualify for a mortgage *while still in* their Chapter 13 repayment plan — provided they've made 12 months of on-time payments to the trustee and received written permission from the bankruptcy court to take on new debt. This is a huge lifeline for borrowers who'd otherwise face a 5+ year wait.",
        "Fannie and Freddie do *not* allow qualification during an active plan. The borrower must wait until the plan is fully discharged or dismissed.",
        "**The discharge vs dismissal distinction matters enormously.** A **discharge** means the borrower successfully completed the plan — debts are forgiven as agreed. A **dismissal** means the plan failed (missed payments, non-compliance, etc.). For Fannie/Freddie, discharge triggers a 2-year wait, but dismissal triggers a 4-year wait. That's a big difference borrowers often don't realize.",
      ],
      tip: "Currently in a Chapter 13 plan and wondering if homeownership is years away? It might not be. **12+ months of on-time trustee payments plus written court permission can unlock an FHA or VA mortgage while still inside the active plan** — no need to wait for the full discharge. The trustee permission letter is the part that takes the longest: courts move slowly, and getting the approval often takes 60-90 days from when the request is filed. If this path interests you, the conversation with the trustee should start early — well before you're under contract on a home.",
    },
    {
      id: "foreclosure",
      title: "Foreclosure",
      summary: "Lender-forced property transfer. VA is most lenient (2 years); Fannie/Freddie strictest (7 years standard).",
      table: {
        headers: ["Program", "Standard Wait", "With Extenuating Circumstances", "Source"],
        rows: [
          ["Fannie Mae", "7 years from completion", "3 years (90% LTV cap, purchase of primary residence only)", "Selling Guide B3-5.3-07"],
          ["Freddie Mac", "7 years from completion", "3 years (90% LTV cap, primary purchase or rate/term refi only)", "Selling Guide 5202.5"],
          ["FHA", "3 years from completion", "1 year (manual underwriting)", "HUD 4000.1 II.A.5.a.iii"],
          ["VA", "2 years from completion", "1 year (manual underwriting)", "Lender's Handbook M26-7 Ch. 4"],
          ["USDA", "3 years from completion", "1 year (credit exception, manual UW)", "HB-1-3555 Chapter 10"],
        ],
      },
      explainer: [
        "Foreclosure is the most severe of the derogatory credit events — the lender took legal action, seized the property, and sold it to recover the debt. Every agency imposes the longest wait period for foreclosure of any credit event, with Fannie and Freddie the harshest at 7 years standard.",
        "**The clock starts on the foreclosure completion date** — the date title transferred to the lender (or to the new owner at the foreclosure sale), *not* the date proceedings began.",
        "**The Fannie/Freddie 3-year exception path is real but narrow.** It requires documented extenuating circumstances, caps the loan-to-value at 90%, and is typically limited to primary residence purchases. For Freddie, rate-and-term refinances also qualify. Use of this exception is rare in practice because 90% LTV with documented extenuating circumstances is a high bar.",
        "**The critical overlap: foreclosure + bankruptcy on the same file.** This is where rules get complex. For Fannie, if a mortgage was discharged in the bankruptcy AND later foreclosed, you apply the **bankruptcy waiting period**, not the foreclosure waiting period — a major benefit that's often overlooked. For FHA and VA, if the foreclosure happened *within* the bankruptcy (BK included the mortgage), the bankruptcy clock generally controls. But this is a spot where handbook language is verbal guidance rather than written, so confirm with your underwriter.",
      ],
      tip: "This is the single most under-utilized path in the entire derogatory credit world, and it costs people years if they don't know it: **when a foreclosure was included in a bankruptcy, the bankruptcy wait period usually controls — not the foreclosure wait period.**\n\nExample: A Chapter 7 in 2019 that included a mortgage foreclosed in 2020. On paper, the foreclosure looks 5 years old and Fannie's 7-year rule seems to require 2 more years of waiting. But because the mortgage was *discharged in the bankruptcy*, the 4-year bankruptcy clock applies instead — meaning eligibility kicked in back in 2023.\n\nIf you have a past foreclosure, dig up the bankruptcy paperwork and check whether the mortgage debt was included. This is where situations that look hopeless turn into closed loans.",
    },
    {
      id: "shortsale",
      title: "Short Sale / Deed-in-Lieu",
      summary: "Borrower-negotiated alternatives to foreclosure. Wait periods shorter than foreclosure but longer than for routine credit events.",
      table: {
        headers: ["Program", "Short Sale Wait", "DIL Wait", "With Extenuating Circumstances", "Source"],
        rows: [
          ["Fannie Mae", "4 years", "4 years", "2 years", "Selling Guide B3-5.3-07"],
          ["Freddie Mac", "4 years", "4 years", "2 years (90% LTV cap within 7 years)", "Selling Guide 5202.5"],
          ["FHA", "3 years", "3 years", "1 year (manual UW)", "HUD 4000.1 II.A.5.a.iii"],
          ["VA", "No wait if no late payments prior to sale", "2 years", "1 year with documented circumstances", "Lender's Handbook M26-7 Ch. 4"],
          ["USDA", "3 years", "3 years", "1 year (credit exception, manual UW)", "HB-1-3555 Chapter 10"],
        ],
      },
      explainer: [
        "Short sale, pre-foreclosure sale, and deed-in-lieu of foreclosure are all borrower-initiated alternatives to full foreclosure. They're viewed more favorably than foreclosure across all agencies — the borrower worked *with* the lender rather than letting the property go to auction — so wait periods are shorter.",
        "**Short sale = selling the home for less than the mortgage balance**, with the lender's approval, and the deficiency typically forgiven. **Deed-in-lieu = voluntarily transferring title** to the lender to avoid the foreclosure process entirely.",
        "**VA's \"no wait if no late payments\" rule is unique and powerful.** If a veteran sold short but was current on their mortgage the entire time leading up to the sale, VA imposes no waiting period at all. This is rare — most short sales happen *because* the borrower was behind — but when it applies, it's a significant advantage.",
        "**Pre-2014 note:** Fannie used to distinguish between short sale and deed-in-lieu, with different wait periods. As of current guidance, both are treated identically at 4 years standard. If you're reading older materials, ignore the distinction.",
      ],
      tip: "The VA \"no late payments\" short sale exception is the one most worth knowing about — and it applies more often than people realize. **If a veteran sold their home short but kept mortgage payments current the entire time leading up to the sale, VA imposes no waiting period at all.**\n\nThe classic scenario: a PCS move forced a fast sale in a declining market, the home was worth less than the mortgage, but payments never fell behind. That veteran may be eligible for a VA loan today — no waiting required. The proof is in the servicing records: pull the payment history and make sure every payment was on time through the sale date.",
    },
    {
      id: "latepayments",
      title: "Late Mortgage Payments",
      summary: "Recent mortgage lates without a full credit event. Less severe than foreclosure but still creates underwriting friction.",
      table: {
        headers: ["Program", "Acceptable Recent Mortgage History", "Source"],
        rows: [
          ["Fannie Mae", "12 months from the last 60-, 90-, 120-, or 150-day delinquency", "Selling Guide B3-5.3-03"],
          ["Freddie Mac", "With credit scores: 12 months with no 60+ day lates AND no more than one 30-day late in the last 24 months. Without credit scores: 12 months with no late payments.", "Selling Guide 5202.5"],
          ["FHA", "Varies by loan type. Purchase/Rate-Term Refi (TOTAL Scorecard): 12 months with no more than three 30-day lates, no 60+ day lates, no 90+ day lates. Cash-Out Refi: 12 months with no late payments at all. Manual UW: 12 months with no lates.", "HUD 4000.1 II.A.4.b.K"],
          ["VA", "12 months with no more than one 30-day late", "Lender's Handbook M26-7 Ch. 4"],
          ["USDA", "12 months with no more than one 30-day late — unless documented extenuating circumstances have been resolved for at least 12 months OR the new loan reduces housing expense by 50%+", "HB-1-3555 Chapter 10"],
        ],
      },
      explainer: [
        "This category isn't about catastrophic events — it's about borrowers with an otherwise clean file who missed a mortgage payment or two in the last year. Every agency cares about this more than most borrowers realize, because mortgage payment history is treated as the single strongest predictor of future mortgage payment behavior.",
        "**The rules vary more than any other category on this page** — not just between agencies but also within agencies based on loan purpose. FHA has different thresholds for purchase, rate-and-term refi, and cash-out refi. Fannie's rule is tied to the severity of the late (60-day vs 90-day vs 120-day), not just the count.",
        "**The USDA \"housing expense reduction\" carve-out is specific and useful.** If the new USDA loan would reduce the borrower's housing expense by 50% or more, late mortgage payments in the past 12 months can be overlooked. This is almost exclusively a refinance-from-high-rate scenario but worth knowing.",
      ],
      tip: "The single most common pitfall: a 30-day late from 6-8 months ago that feels like it \"shouldn't count\" — maybe it was a bank error, an autopay glitch, or you caught up within a few days. **For credit reporting and underwriting purposes, it counts.**\n\nThe only way to remove it is to dispute the late directly with the mortgage servicer and get them to correct the reporting to the three credit bureaus. That process takes 30-60 days minimum, sometimes longer. If you spot a recent mortgage late on your credit report and you're thinking about buying a home in the next year, start the dispute process *now* — not after you're under contract. A pending dispute discovered mid-transaction is one of the most common reasons deals blow up at the underwriting stage.",
    },
  ];

  const renderBold = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: P.navy, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>
      <style>{`
        .dd-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 16px 0; }
        .dd-table { width: 100%; border-collapse: collapse; min-width: 600px; font-size: 13px; }
        .dd-table thead th { background: ${P.navy}; color: ${P.cream}; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 2px solid ${P.gold}; }
        .dd-table tbody td { padding: 10px 12px; border-bottom: 1px solid ${P.creamDark}; color: ${P.warmGray}; line-height: 1.55; vertical-align: top; }
        .dd-table tbody tr:nth-child(odd) { background: rgba(184, 134, 11, 0.02); }
        .dd-table tbody td:first-child { font-weight: 600; color: ${P.navy}; }
        @media (max-width: 700px) {
          .dd-table { font-size: 12px; min-width: 520px; }
          .dd-table thead th, .dd-table tbody td { padding: 8px 10px; }
        }
      `}</style>

      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/deep-dives" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 900, margin: "0 auto" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.gold }}>🐳 Deep Dive</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight }}>·</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified April 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.1, marginBottom: 16 }}>
            Derogatory Credit <em style={{ fontStyle: "italic", color: P.gold }}>Wait Periods</em>
          </h1>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7 }}>
            How long you have to wait before qualifying for a mortgage after bankruptcy, foreclosure, short sale, deed-in-lieu, or late mortgage payments — compared across all five major loan programs.
          </p>
        </div>

        <div style={{ background: "rgba(184, 134, 11, 0.06)", border: `1px solid rgba(184, 134, 11, 0.25)`, borderRadius: 8, padding: "12px 16px", marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.6, margin: 0 }}>
            This reference reflects published agency guidelines as of the verification date above. Individual lenders often apply stricter "overlays" on top of these baselines. Always verify against the current agency handbook and confirm with your loan officer before making decisions based on this information.
          </p>
        </div>

        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75, marginBottom: 16 }}>
            When a borrower has a significant derogatory credit event on their record, the question isn't usually <em>if</em> they can get a mortgage again — it's <em>when</em>. Every agency has a "wait period" after events like bankruptcy, foreclosure, or short sale. These periods exist so borrowers can rebuild credit and demonstrate financial stability before taking on new mortgage debt.
          </p>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75, marginBottom: 16 }}>
            The wait periods vary meaningfully across programs. <strong style={{ color: P.navy, fontWeight: 600 }}>Conventional loans (Fannie/Freddie) are the strictest</strong> — 4 years minimum for most events. <strong style={{ color: P.navy, fontWeight: 600 }}>FHA is the middle ground</strong> — usually 2-3 years. <strong style={{ color: P.navy, fontWeight: 600 }}>VA tends to be the most lenient</strong> for eligible veterans. <strong style={{ color: P.navy, fontWeight: 600 }}>USDA falls between FHA and Conventional.</strong>
          </p>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75 }}>
            Many events also have an "extenuating circumstances" path that can reduce the wait period — but that path is stricter than most borrowers realize. It requires documented, one-time events beyond the borrower's control: serious illness, death of a wage earner, or job loss from company downsizing. Divorce, voluntary job changes, or general financial mismanagement do <em>not</em> qualify.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {accordions.map((acc) => {
            const isOpen = openAccordion === acc.id;
            return (
              <div key={acc.id} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${P.creamDark}`, overflow: "hidden", borderLeft: isOpen ? `3px solid ${P.gold}` : `1px solid ${P.creamDark}`, transition: "border-left 0.15s" }}>
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : acc.id)}
                  style={{
                    width: "100%",
                    padding: "18px 22px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: F.body,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, fontWeight: 400, lineHeight: 1.2, marginBottom: 4 }}>{acc.title}</h3>
                    {!isOpen && (
                      <p style={{ fontSize: 13, color: P.warmGray, lineHeight: 1.5 }}>{acc.summary}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 20, color: P.gold, flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "4px 22px 24px", borderTop: `1px solid ${P.creamDark}` }}>
                    <div className="dd-table-wrap">
                      <table className="dd-table">
                        <thead>
                          <tr>
                            {acc.table.headers.map((h, i) => <th key={i}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {acc.table.rows.map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => <td key={j}>{cell}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      {acc.explainer.map((para, i) => (
                        <p key={i} style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.75, marginBottom: 12 }}>
                          {renderBold(para)}
                        </p>
                      ))}
                    </div>

                    <div style={{ marginTop: 20, background: P.navy, borderRadius: 8, padding: "18px 22px", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: "100%", background: "radial-gradient(circle at top right, rgba(212, 168, 67, 0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, position: "relative", zIndex: 1 }}>
                        <span style={{ fontSize: 16 }}>🤓</span>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>Geek Tip — When This Matters</span>
                      </div>
                      {acc.tip.split("\n\n").map((para, i) => (
                        <p key={i} style={{ fontSize: 13.5, color: P.cream, lineHeight: 1.7, marginBottom: i < acc.tip.split("\n\n").length - 1 ? 10 : 0, position: "relative", zIndex: 1 }}>
                          {renderBold(para).map((piece, j) =>
                            typeof piece === "string" ? piece :
                            piece.type === "strong" ? <strong key={j} style={{ color: P.goldLight, fontWeight: 600 }}>{piece.props.children}</strong> :
                            piece
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Questions about a specific scenario?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65 }}>
            Call me at <a href="tel:+16156560737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a>. Real-world guideline questions are my favorite kind of conversation.
          </p>
        </div>

      </div>

      <MobileToolbar />
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function MortgageLandingPage() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname?.replace(/^\//, "");
    if (path === "calculator") return "calculator";
    if (path === "prequal") return "prequal";
    if (path === "about") return "about";
    if (path === "compare") return "compare";
    if (path === "cash-to-close") return "cashtoclose";
    if (path === "install") return "install";
    if (path === "deep-dives") return "deepdives-hub";
    if (path === "deep-dives/derogatory-credit") return "deepdives-derogatory";
    return "main";
  });

  const renderPage = () => {
    if (currentPage === "calculator") return <CalculatorPage />;
    if (currentPage === "prequal") return <PreQualPage />;
    if (currentPage === "about") return <AboutPage />;
    if (currentPage === "compare") return <ComparePage />;
    if (currentPage === "cashtoclose") return <CashToClosePage />;
    if (currentPage === "install") return <InstallPage />;
    if (currentPage === "deepdives-hub") return <DeepDivesHubPage />;
    if (currentPage === "deepdives-derogatory") return <DerogatoryCreditPage />;
    return <MainSite />;
  };

  return (<>{renderPage()}<WelcomeToast /></>);
}

function MainSite() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();
  // Signals that a navigation just occurred, so the scroll-lock cleanup
  // should skip restoring the previous scroll position (the navigation
  // handler is scrolling to the target section). Prevents a race where
  // the scroll-restore overrides scrollIntoView on mobile nav clicks.
  const skipScrollRestore = useRef(false);
  const skipTransition = useRef(false);

  // Scroll-lock: when sidebar is open, add `sidebar-locked` class to <html>.
  // CSS then applies overflow:hidden + height:100% to html/body so neither
  // can scroll. preventDefault on document touchmove (outside the sidebar)
  // is kept as belt-and-suspenders for iOS Safari.
  useLayoutEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add("sidebar-locked");
      const onTouchMove = (e) => {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar && sidebar.contains(e.target)) return;
        e.preventDefault();
      };
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      return () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.documentElement.classList.remove("sidebar-locked");
        if (skipScrollRestore.current) {
          skipScrollRestore.current = false;
        }
      };
    }
  }, [mobileOpen]);

  // Swipe-to-open/close sidebar — X-style reveal (main content slides right)
  useEffect(() => {
    const SIDEBAR_W = 280;
    const EDGE_ZONE = window.innerWidth;
    const SNAP_THRESHOLD = 80;
    let startX = 0, startY = 0, currentX = 0;
    let tracking = false, dirLocked = false, isHorizontal = false;
    let mode = null; // "opening" or "closing"
    let scrollBlocker = null;

    const getMain = () => document.querySelector(".main-content");
    const getBar = () => document.querySelector(".mobile-bar");

    const addScrollBlocker = () => {
      if (scrollBlocker) return;
      scrollBlocker = (e) => { e.preventDefault(); };
      document.addEventListener("touchmove", scrollBlocker, { passive: false });
    };
    const removeScrollBlocker = () => {
      if (!scrollBlocker) return;
      document.removeEventListener("touchmove", scrollBlocker);
      scrollBlocker = null;
    };

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      dirLocked = false;
      isHorizontal = false;

      if (!mobileOpen && startX < EDGE_ZONE) {
        mode = "opening";
        tracking = true;
      } else if (mobileOpen) {
        mode = "closing";
        tracking = true;
      } else {
        tracking = false;
      }
    };

    const onTouchMove = (e) => {
      if (!tracking) return;
      const touch = e.touches[0];
      currentX = touch.clientX;
      const dx = currentX - startX;
      const dy = touch.clientY - startY;

      // Lock direction after 8px of movement
      if (!dirLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        dirLocked = true;
        isHorizontal = Math.abs(dx) > Math.abs(dy);
        if (!isHorizontal) { tracking = false; return; }
        const main = getMain();
        const bar = getBar();
        if (main) main.classList.add("sidebar-dragging");
        if (bar) bar.classList.add("sidebar-dragging");
        addScrollBlocker();
      }

      if (!dirLocked || !isHorizontal) return;

      const main = getMain();
      const bar = getBar();
      if (!main) return;

      if (mode === "opening") {
        const dragPx = Math.max(0, Math.min(dx, SIDEBAR_W));
        const pct = dragPx / SIDEBAR_W;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${dragPx}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${dragPx}px)`;
      } else if (mode === "closing") {
        const dragPx = Math.max(0, Math.min(-dx, SIDEBAR_W));
        const pct = 1 - (dragPx / SIDEBAR_W);
        const offset = SIDEBAR_W - dragPx;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${offset}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${offset}px)`;
      }
    };

    const onTouchEnd = () => {
      if (!tracking || !isHorizontal) { tracking = false; return; }
      const dx = currentX - startX;
      const main = getMain();
      const bar = getBar();

      // Re-enable CSS transitions for snap
      if (main) main.classList.remove("sidebar-dragging");
      if (bar) bar.classList.remove("sidebar-dragging");

      // Clear inline styles — let CSS classes handle the snap
      if (main) { main.style.transform = ""; main.style.borderRadius = ""; main.style.removeProperty("--sidebar-dim"); }
      if (bar) bar.style.transform = "";
      removeScrollBlocker();

      if (mode === "opening" && dx > SNAP_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(10);
        setMobileOpen(true);
      } else if (mode === "closing" && dx < -SNAP_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(10);
        setMobileOpen(false);
      }

      tracking = false;
      mode = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      removeScrollBlocker();
    };
  }, [mobileOpen]);

  // Overscroll bounce is prevented via CSS `overscroll-behavior: none` on
  // body and .main-content (see globalCSS). A prior JS implementation attached
  // a non-passive touchmove listener to document, which froze scrolling on
  // Android Chrome because it forces touchmove onto the JS main thread and
  // disables compositor scrolling. CSS handles the same job natively on
  // iOS Safari 16+ and all modern Android browsers.

  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // If sidebar is open on mobile, we need to close it FIRST so the body
      // becomes unfrozen before scrollIntoView runs. Set the skip flag so the
      // cleanup doesn't restore the old scroll position, then defer the scroll.
      if (mobileOpen) {
        // Disable transition so content snaps back instantly (no navy flash)
        const main = document.querySelector(".main-content");
        const bar = document.querySelector(".mobile-bar");
        if (main) main.style.transition = "none";
        if (bar) bar.style.transition = "none";
        setMobileOpen(false);
        // Wait one frame for DOM to update, then scroll and restore transitions
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "instant", block: "start" });
          window.history.replaceState(null, "", `#${id}`);
          requestAnimationFrame(() => {
            if (main) main.style.transition = "";
            if (bar) bar.style.transition = "";
          });
        });
      } else {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        window.history.replaceState(null, "", `#${id}`);
      }
    }
  };

  const handleSubNavigate = (sectionId, step) => {
    setNavTarget({ section: sectionId, step });
    handleNavigate(sectionId);
    setTimeout(() => setNavTarget(null), 500);
  };

  // Deep link: scroll to section on initial load from hash or path
  useEffect(() => {
    const scrollToTarget = () => {
      let target = window.location.hash?.replace("#", "");
      // Also support /calculator style paths
      if (!target) {
        const path = window.location.pathname?.replace("/", "");
        if (path) target = path;
      }
      if (target) {
        const el = document.getElementById(target);
        if (el) {
          setTimeout(() => el.scrollIntoView({ behavior: "instant", block: "start" }), 300);
        }
      }
    };
    scrollToTarget();
    window.addEventListener("hashchange", scrollToTarget);
    return () => window.removeEventListener("hashchange", scrollToTarget);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-root" style={{ fontFamily: F.body, color: P.text, display: "flex", minHeight: "100vh", minHeight: "100dvh" }}>
      <style>{globalCSS}</style>
      <Sidebar activeSection={activeSection === "process" ? "getting-started" : activeSection} onNavigate={handleNavigate} onSubNavigate={handleSubNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className={`main-content ${mobileOpen ? "main-content-open" : ""}`} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} onClick={(e) => { if (mobileOpen) { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(false); } }}>
        <Hero onNavigate={handleNavigate} />
        <JourneyOverview onNavigate={handleSubNavigate} />
        <PreContract navTarget={navTarget} />
        <ActiveLoanProcess navTarget={navTarget} />
        <MortgageTypes navTarget={navTarget} />
        <MortgageStructure navTarget={navTarget} />
        <BorrowerProfile navTarget={navTarget} />
        <InterestRates navTarget={navTarget} />
        <ClosingCosts navTarget={navTarget} />
        <NextSteps />
        <ToolsCTA />
        <PreApprovalChecklist />
        <JargonDecoder />
        <footer style={{ padding: "40px 40px 32px", borderTop: `1px solid ${P.creamDark}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap", maxWidth: 720 }}>
            {/* Disclaimer text */}
            <div style={{ flex: 1, minWidth: 250 }}>
              <p style={{ fontFamily: F.display, fontSize: 18, color: P.navy, marginBottom: 2 }}>The Mortgage Geek 🤓</p>
              <p style={{ fontFamily: F.display, fontSize: 12, color: P.gold, fontStyle: "italic", marginBottom: 12, letterSpacing: 0.3 }}>Mortgages Demystified.</p>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: P.warmGrayLight, marginBottom: 8 }}>
                This content is for educational purposes only and does not constitute financial advice. Loan programs, rates, terms, and guidelines are subject to change without notice. Always consult directly with a licensed mortgage professional for guidance specific to your situation.
              </p>
              <p style={{ fontSize: 11, color: P.warmGrayLight, opacity: 0.6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span>(615) 656-0737 · NMLS# 1119524 ·</span>
                <svg width="11" height="12" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
                  <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                  <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
                  <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
                </svg>
                <span>Equal Housing Lender</span>
              </p>
            </div>
          </div>
        </footer>
      </main>

      {!mobileOpen && <MobileToolbar />}
    </div>
  );
}

