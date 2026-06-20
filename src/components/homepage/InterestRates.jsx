import { useState, useEffect } from "react";
import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { fmt } from "../../utils/format";
import { calculateAPR } from "../../utils/math";
import { SectionHeader } from "./SectionHeader";
import { SectionShell } from "./SectionShell";
import { CashToCloseIcon } from "../icons";

export function InterestRates({ navTarget }) {
  const [activeTab, setActiveTab] = useState(0);
  const [liveRates, setLiveRates] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (navTarget?.section === "rates" && typeof navTarget.step === "number") {
      setActiveTab(navTarget.step);
      if (navTarget.step === 2 && !liveRates && !rateLoading) fetchRates();
    }
  }, [navTarget]);

  const tabs = ["What Drives Rates", "Rate Options & Points", "Live Rates", "APR"];

  const fetchRates = async () => {
    setRateLoading(true);
    setRateError(null);
    try {
      const res = await fetch('/api/rates');
      const data = await res.json();
      if (data.success) {
        setLiveRates(data);
      } else {
        setRateError(data.error || 'Unable to fetch rates.');
      }
    } catch (err) {
      setRateError('Unable to connect. Please try again.');
    }
    setRateLoading(false);
  };

  const handleTabClick = (i) => {
    setActiveTab(i);
    if (i === 2 && !liveRates && !rateLoading) fetchRates();
  };

  // Sample rate sheet for a $300k conventional loan, 30yr fixed, 740+ credit, 80% LTV
  const rateSheet = [
    { rate: "5.750%", points: 2.125, cost: 6375, payment: 1751, savings: "Lowest payment — but heavy upfront cost" },
    { rate: "5.875%", points: 1.750, cost: 5250, payment: 1773, savings: "Strong rate with moderate buy-down" },
    { rate: "6.000%", points: 1.250, cost: 3750, payment: 1799, savings: "Good balance of rate and upfront cost" },
    { rate: "6.125%", points: 0.875, cost: 2625, payment: 1824, savings: "Slight buy-down, minimal out-of-pocket" },
    { rate: "6.250%", points: 0.375, cost: 1125, payment: 1847, savings: "Near-par rate — very little upfront" },
    { rate: "6.375%", points: 0.000, cost: 0, payment: 1871, savings: "Par rate — no points, no credits" },
    { rate: "6.500%", points: -0.250, cost: -750, payment: 1896, savings: "Lender credit of $750 toward closing costs" },
    { rate: "6.750%", points: -0.750, cost: -2250, payment: 1948, savings: "Lender credit of $2,250 — higher rate, lower cash to close" },
  ];

  const tabContent = (
    <>
      {activeTab === 0 && (
        <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>It's Not Just "The Rate"</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>
              There is no single mortgage rate. On any given day, lenders offer a menu of rates — each paired with a different combination of discount points or lender credits. A lower rate costs more upfront (points), while a higher rate can actually put money back in your pocket (credits toward closing costs). Your job isn't to find "the lowest rate" — it's to find the right trade-off between your upfront costs and your monthly payment.
            </p>
          </div>
          <div className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>What Determines Your Rate</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>
              Your individual rate is determined by a combination of market conditions and your personal risk profile. Here are the primary factors, roughly in order of impact:
            </p>
            {[
              { factor: "The Bond Market (MBS)", desc: "Mortgage rates track mortgage-backed securities, not the Fed Funds rate. When MBS yields rise, rates rise." },
              { factor: "Credit Score", desc: "The biggest borrower-controlled factor. 740+ gets the best pricing; every 20 points below adds cost. A 740 vs 660 can differ by 0.5–1.0% in rate." },
              { factor: "Loan-to-Value (LTV)", desc: "How much you're borrowing relative to the home's value. 80% LTV (20% down) gets the best pricing. Higher LTV means higher rate or PMI." },
              { factor: "Loan Type & Term", desc: "FHA rates often beat conventional (government backing reduces risk). 15-year beats 30-year. ARMs start lower than fixed." },
              { factor: "Property Type & Use", desc: "Primary single-family gets the best rate. Condos, multi-units, second homes, and investment properties all carry pricing adjustments (LLPAs)." },
              { factor: "Debt-to-Income Ratio", desc: "Higher DTI can trigger pricing adjustments, especially above 40–45%." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <span style={{ color: P.gold, fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>→</span>
                <div>
                  <span style={{ fontWeight: 600, color: P.text, fontSize: 13 }}>{item.factor}:</span>{" "}
                  <span style={{ fontSize: 13, color: P.warmGray, lineHeight: 1.6 }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
              <strong>The Fed doesn't set mortgage rates.</strong> The Federal Reserve sets the federal funds rate (currently 3.50–3.75%), which directly affects short-term rates like credit cards and HELOCs. Mortgage rates are long-term rates driven by the bond market. The Fed influences them indirectly — but they don't move in lockstep.
            </p>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div style={{ maxWidth: 800 }}>
          <div className="content-card" style={{ padding: "24px 28px", marginBottom: 16 }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 4 }}>Reading a Rate Sheet</h4>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray, marginBottom: 4 }}>
              Below is a simplified example of how rate options work on a <strong>$300,000 conventional 30-year fixed loan</strong> (740+ credit, 80% LTV). Every rate below is available on the same day — you choose where on the spectrum to land.
            </p>
            <p style={{ fontSize: 12, color: P.warmGrayLight, fontStyle: "italic" }}>
              Illustrative example only — actual pricing varies by lender, day, and borrower profile.
            </p>
          </div>
          {/* Rate grid */}
          <div className="content-card" style={{ overflow: "hidden", padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr", padding: "12px 20px", background: P.navy, gap: 8 }}>
              {["Rate", "Points", "Cost / Credit", "Payment", "What It Means"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 }}>{h}</span>
              ))}
            </div>
            {rateSheet.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr", padding: "12px 20px", gap: 8,
                borderBottom: `1px solid ${P.cream}`, alignItems: "center",
                background: row.points === 0 ? `${P.gold}08` : "transparent",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: P.navy, fontFamily: F.display }}>{row.rate}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: row.points < 0 ? P.success : row.points === 0 ? P.warmGray : P.caution }}>
                  {row.points > 0 ? `${row.points} pts` : row.points === 0 ? "Par" : `(${Math.abs(row.points)}) credit`}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: row.cost < 0 ? P.success : row.cost === 0 ? P.warmGray : P.text }}>
                  {row.cost < 0 ? `-${fmt(Math.abs(row.cost))}` : row.cost === 0 ? "$0" : fmt(row.cost)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{fmt(row.payment)}</span>
                <span style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.4 }}>{row.savings}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
              <strong>The par rate</strong> (highlighted above) is the rate where you pay zero points and receive zero credits — it's the "break-even" price. Rates above par give you credits (the lender pays you). Rates below par cost you points (you pay the lender). There's no universally "best" option — it depends on how long you plan to keep the loan and how much cash you have for closing.
            </p>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div style={{ maxWidth: 720 }}>
          <div className="content-card" style={{ padding: "28px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 4 }}>Current Market Rates</h4>
                <p style={{ fontSize: 12, color: P.warmGrayLight }}>
                  {liveRates ? liveRates.date : "National averages updated every business day"}
                </p>
              </div>
              {liveRates && (
                <button onClick={fetchRates} disabled={rateLoading} style={{
                  padding: "6px 14px", borderRadius: 6, border: `1px solid ${P.creamDark}`,
                  background: P.cream, fontFamily: F.body, fontSize: 11, fontWeight: 600,
                  color: P.warmGray, cursor: rateLoading ? "wait" : "pointer",
                }}>
                  {rateLoading ? "Updating..." : "↻ Refresh"}
                </button>
              )}
            </div>

            {rateLoading && !liveRates && (
              <div style={{ textAlign: "center", padding: "48px 0", color: P.warmGrayLight }}>
                <div style={{ fontSize: 24, marginBottom: 8, display: "inline-block", animation: "ratespin 1s linear infinite" }}>⟳</div>
                <p style={{ fontSize: 13 }}>Fetching today's rates...</p>
                <style>{`@keyframes ratespin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {rateError && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 13, color: P.warmGray, marginBottom: 12 }}>{rateError}</p>
                <button onClick={fetchRates} style={{
                  padding: "8px 20px", borderRadius: 8, border: `1px solid ${P.navy}`,
                  background: "transparent", fontFamily: F.body, fontSize: 13,
                  fontWeight: 600, color: P.navy, cursor: "pointer",
                }}>
                  Try Again
                </button>
              </div>
            )}

            {liveRates && liveRates.rates && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {liveRates.rates.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center",
                    padding: "16px 20px", borderRadius: 10, gap: 14,
                    background: i === 0 ? P.navy : P.cream,
                    border: i === 0 ? "none" : `1px solid ${P.creamDark}`,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: i === 0 ? "#fff" : P.navy }}>{r.label}</span>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: F.display, fontSize: 28, color: i === 0 ? "#fff" : P.navy }}>{r.rate}%</span>
                      {r.change && (
                        <span style={{
                          fontSize: 12, fontWeight: 600,
                          color: i === 0
                            ? (parseFloat(r.change) <= 0 ? P.successLight : P.dangerLight)
                            : (parseFloat(r.change) <= 0 ? P.success : P.danger),
                        }}>
                          {parseFloat(r.change) > 0 ? "+" : ""}{r.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {liveRates && (
              <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 14 }}>
                Source: <a href="https://www.mortgagenewsdaily.com/mortgage-rates" target="_blank" rel="noopener noreferrer" style={{ color: P.textLight, textDecoration: "underline" }}>{liveRates.source}</a>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
              <strong>These are national averages</strong> — your actual rate will differ based on your credit, down payment, loan type, and lender. Use these as a benchmark, not a guarantee. The best way to know your real rate? Get pre-approved.
            </p>
          </div>
        </div>
      )}

      {activeTab === 3 && (() => {
        // APR comparison example: Two FHA lenders, same note rate, different fee structures
        const exLoan = 300000;
        const exUpfront = exLoan * 0.0175; // UFMIP
        const exTotalLoan = exLoan + exUpfront;
        const exRate = 6.5;
        const exTerm = 30;
        const exMipRate = 0.0055;
        const exMonthlyMI = (exLoan * exMipRate) / 12;
        const exMiMonths = exTerm * 12; // life of loan, <10% down

        // Lender A: no points, lower fees
        const aOrigin = 0;
        const aUnderwriting = 1200;
        const aProcessing = 500;
        const aCredit = 75;
        const aAppraisal = 550;
        const aFlood = 15;
        const aTaxSvc = 80;
        const aPoints = 0;
        const aPointsCost = 0;
        const aTotal = aOrigin + aUnderwriting + aProcessing + aCredit + aAppraisal + aFlood + aTaxSvc + aPointsCost;
        const aCharges = aTotal + exUpfront;
        const aAPR = calculateAPR(exTotalLoan, aCharges, exRate, exTerm, exMonthlyMI, exMiMonths);

        // Lender B: 1 full discount point, higher fees
        const bOrigin = 500;
        const bUnderwriting = 1500;
        const bProcessing = 750;
        const bCredit = 300;
        const bAppraisal = 550;
        const bFlood = 15;
        const bTaxSvc = 80;
        const bPoints = 1;
        const bPointsCost = exLoan * (bPoints / 100);
        const bTotal = bOrigin + bUnderwriting + bProcessing + bCredit + bAppraisal + bFlood + bTaxSvc + bPointsCost;
        const bCharges = bTotal + exUpfront;
        const bAPR = calculateAPR(exTotalLoan, bCharges, exRate, exTerm, exMonthlyMI, exMiMonths);

        const FeeRow = ({ label, a, b }) => (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "5px 0", borderBottom: `1px solid ${P.cream}`, fontSize: 12 }}>
            <span style={{ color: P.warmGray }}>{label}</span>
            <span style={{ textAlign: "right", fontWeight: 600, color: P.text }}>{fmt(a)}</span>
            <span style={{ textAlign: "right", fontWeight: 600, color: P.text }}>{fmt(b)}</span>
          </div>
        );

        return (
          <div style={{ maxWidth: 720 }}>
            <div className="content-card" style={{ padding: 28, marginBottom: 20 }}>
              <h4 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 12 }}>What is APR?</h4>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>
                The <strong style={{ color: P.text }}>Annual Percentage Rate (APR)</strong> is a standardized measure of your total borrowing cost, mandated by the federal Truth in Lending Act (Reg Z). It takes your note rate and factors in lender fees, discount points, upfront mortgage insurance, and monthly mortgage insurance premiums for the period they're required — expressing it all as a single annual percentage.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>
                <strong style={{ color: P.text }}>Why it matters:</strong> Two lenders can quote you the exact same interest rate, but one could cost you thousands more in fees. The note rate only tells you the interest charged on the loan balance. APR reveals the <em>true cost of credit</em> — making it the best apples-to-apples comparison tool when shopping lenders.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray }}>
                <strong style={{ color: P.text }}>What's included in APR:</strong> Lender origination fees, underwriting, processing, discount points, upfront MIP (FHA) or VA funding fee, monthly mortgage insurance, and prepaid interest. <strong style={{ color: P.text }}>What's excluded:</strong> Title fees, recording fees, transfer taxes, homeowner's insurance, and escrow deposits — because these costs don't go to the lender.
              </p>
            </div>

            {/* Side-by-side lender comparison */}
            <div className="content-card" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.caution, display: "block", marginBottom: 8 }}>Real-World Example</span>
                <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 6 }}>Same Rate. Different Cost.</h4>
                <p style={{ fontSize: 13, color: P.warmGray }}>FHA loan · $300,000 · 3.5% down · {exRate.toFixed(3)}% note rate · 30-year fixed</p>
              </div>

              {/* Lender headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div />
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P.success, display: "block" }}>Lender A</span>
                  <span style={{ fontSize: 10, color: P.warmGrayLight }}>No points, lower fees</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P.caution, display: "block" }}>Lender B</span>
                  <span style={{ fontSize: 10, color: P.warmGrayLight }}>1 point + higher fees</span>
                </div>
              </div>

              {/* Fee breakdown */}
              <FeeRow label="Origination Fee" a={aOrigin} b={bOrigin} />
              <FeeRow label="Underwriting" a={aUnderwriting} b={bUnderwriting} />
              <FeeRow label="Processing" a={aProcessing} b={bProcessing} />
              <FeeRow label="Credit Report" a={aCredit} b={bCredit} />
              <FeeRow label="Appraisal" a={aAppraisal} b={bAppraisal} />
              <FeeRow label="Flood Cert + Tax Svc" a={aFlood + aTaxSvc} b={bFlood + bTaxSvc} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "5px 0", borderBottom: `1px solid ${P.cream}`, fontSize: 12 }}>
                <span style={{ color: P.warmGray }}>Discount Points</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: P.success }}>{aPoints} pts ({fmt(aPointsCost)})</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: P.caution }}>{bPoints} pt ({fmt(bPointsCost)})</span>
              </div>
              <FeeRow label="UFMIP (1.75%)" a={exUpfront} b={exUpfront} />

              {/* Totals */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "8px 0", marginTop: 4, borderTop: `2px solid ${P.navy}`, fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: P.navy }}>Total Finance Charges</span>
                <span style={{ textAlign: "right", color: P.success }}>{fmt(aCharges)}</span>
                <span style={{ textAlign: "right", color: P.caution }}>{fmt(bCharges)}</span>
              </div>

              {/* APR result cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                <div style={{ background: `${P.sage}12`, border: `2px solid ${P.sage}`, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: P.success, display: "block", marginBottom: 4 }}>Lender A · APR</span>
                  <span style={{ fontFamily: F.display, fontSize: 32, color: P.sage, display: "block" }}>{aAPR.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGray, display: "block", marginTop: 4 }}>Note rate {exRate.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGrayLight, display: "block", marginTop: 2 }}>Fees: {fmt(aTotal)}</span>
                </div>
                <div style={{ background: `${P.caution}12`, border: `2px solid ${P.caution}`, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: P.caution, display: "block", marginBottom: 4 }}>Lender B · APR</span>
                  <span style={{ fontFamily: F.display, fontSize: 32, color: P.caution, display: "block" }}>{bAPR.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGray, display: "block", marginTop: 4 }}>Note rate {exRate.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGrayLight, display: "block", marginTop: 2 }}>Fees: {fmt(bTotal)}</span>
                </div>
              </div>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: P.text, fontWeight: 600, marginBottom: 4 }}>Same rate. Lender B costs {fmt(bCharges - aCharges)} more.</p>
                <p style={{ fontSize: 12, color: P.warmGray }}>APR reveals the difference: {bAPR.toFixed(3)}% vs {aAPR.toFixed(3)}%</p>
              </div>
            </div>

            {/* Geek tip */}
            <div className="content-card" style={{ padding: "18px 20px", display: "flex", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
              <div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: P.warmGray, marginBottom: 10 }}>
                  <strong style={{ color: P.text }}>Geek Tip:</strong> Always compare APR — not just the rate — when shopping lenders. A lower rate with high points or fees can cost more over the life of the loan than a slightly higher rate with lower fees. The Loan Estimate (page 3) is required to show APR, so request one from every lender you're considering.
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: P.warmGray }}>
                  <strong style={{ color: P.text }}>One caveat:</strong> APR assumes you keep the loan for the full term. If you plan to sell or refinance within 5–7 years, a higher-fee/lower-rate option may actually cost more because you don't hold the loan long enough to recoup the upfront cost. In that case, compare total cost over your expected holding period, not just APR.
                </p>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a href="/cash-to-close" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                <CashToCloseIcon size={18} variant="navy" />
                See Your Estimated APR in Cash to Close →
              </a>
            </div>
          </div>
        );
      })()}
    </>
  );

  return (
    <section id="rates" className="section-bleed" style={{ padding: "64px 0", background: P.creamDark }}>
      <SectionHeader
        eyebrow="The Number Everyone Asks About"
        title="Interest Rates"
        subtitle="Your interest rate isn't one number — it's a spectrum of options. Understanding what drives it and how to read a rate sheet puts you in control."
      />
      {isMobile ? (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => handleTabClick(i)} className={`tab-btn ${activeTab === i ? "tab-btn-active" : ""}`}>{t}</button>
            ))}
          </div>
          {tabContent}
        </>
      ) : (
        <SectionShell rail={<RailTabs tabs={tabs} active={activeTab} onSelect={handleTabClick} />}>
          {tabContent}
        </SectionShell>
      )}
    </section>
  );
}

function RailTabs({ tabs, active, onSelect }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {tabs.map((t, i) => {
        const isActive = i === active;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(i)}
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
            {t}
          </button>
        );
      })}
    </nav>
  );
}
