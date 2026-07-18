import { useState, useEffect } from "react";
import { P, F, PROGRAM_COLORS, globalCSS } from "../theme";
import { ContactCard } from "../components/homepage/ContactCard";
import { fmt } from "../utils/format";
import { MortgageCalcIcon, CompareIcon } from "../components/icons";
import { ToolLockup } from "../components/ToolLockup";
import { MobileToolbar } from "../components/MobileToolbar";

export function ComparePage() {
  const STORAGE_KEY = "mg_compare_scenarios";
  // Hydration-clean restore: default empty (matches prerender), saved scenarios
  // restored in a post-mount effect (one-frame restore; no server layout effect).
  const [scenarios, setScenarios] = useState([]);
  useEffect(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setScenarios(JSON.parse(saved)); } catch {}
  }, []);

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
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
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
      <div className="no-print pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--light" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ContactCard iconOnly ariaLabel="Contact Nick" />
            <a href="/learn" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500, marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6 }}><span aria-hidden="true">←</span><img src="/assets/learning-hub-mark-sm.svg" alt="" width={20} height={16} style={{ display: "block" }} />Learning Hub</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Print-only branded header */}
        <div className="print-only" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${P.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 2 }}><img src="/assets/mg-mark-sm.svg" alt="" width={17} height={21} style={{ verticalAlign: "-3px", marginRight: 6 }} />The Mortgage Geek · Loan Comparison</div>
              <div style={{ fontSize: 11, color: P.warmGray }}>Nick Peters · NMLS #1119524 · (615) 656-0737 · mortgagegeek.ai</div>
            </div>
            <div style={{ fontSize: 10, color: P.warmGrayLight, textAlign: "right" }}>Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>

        <div className="no-print" style={{ maxWidth: 720, margin: "0 auto 36px" }}>
          <ToolLockup Icon={CompareIcon} title="Loan" accent="Comparison" descriptor="Side by Side" variant="light" style={{ marginBottom: 20 }} />
          <h1 style={{ fontFamily: F.display, fontSize: 42, color: P.navy, fontWeight: 400, lineHeight: 1.1, margin: "0 0 14px" }}>
            Three scenarios, one <em style={{ fontStyle: "italic", color: P.gold }}>straight answer</em>.
          </h1>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.65, margin: 0 }}>Save up to 3 scenarios from the calculator and compare them side by side. Your scenarios are saved on this device.</p>
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
            <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(207,51,56,0.3)" }}><MortgageCalcIcon size={18} variant="cream" /> Open the Calculator →</a>
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
          Scenarios are saved locally on this device only. Clearing your browser data will remove them. NMLS #1119524.
        </p>

        {/* Print-only footer */}
        <div className="print-only" style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${P.creamDark}`, textAlign: "center", fontSize: 9, color: P.warmGrayLight, lineHeight: 1.6 }}>
          Educational only · Not a loan estimate or commitment to lend · Rates and terms subject to change · NMLS #1119524 · Equal Housing Lender · mortgagegeek.ai
        </div>
      </div>
      <MobileToolbar />
    </main>
  );
}
