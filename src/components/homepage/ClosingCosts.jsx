import { useState, useEffect, useId } from "react";
import { P, F } from "../../theme";
import { fmt } from "../../utils/format";
import { CLOSING_COSTS, TRID_BUCKETS } from "../../data/content";
import { SectionHeader } from "./SectionHeader";
import { CashToCloseIcon } from "../icons";

export function ClosingCosts({ navTarget }) {
  const [showDetail, setShowDetail] = useState(false);
  const [openCat, setOpenCat] = useState(0);
  const [openItem, setOpenItem] = useState(null);
  const [openTrid, setOpenTrid] = useState(null);
  const [costPrice, setCostPrice] = useState(350000);
  const priceInputId = useId();
  useEffect(() => {
    if (navTarget?.section === "costs") {
      if (navTarget.step === "top") {
        setTimeout(() => { const el = document.getElementById("costs"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
      } else if (navTarget.step === "trid") {
        setShowDetail(true); setOpenTrid(0);
        setTimeout(() => { const el = document.getElementById("costs-trid"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
      } else if (typeof navTarget.step === "number") {
        setShowDetail(true); setOpenCat(navTarget.step); setOpenItem(null);
        setTimeout(() => { const el = document.getElementById(`costs-cat-${navTarget.step}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
      }
    }
  }, [navTarget]);

  const lowEst = Math.round(costPrice * 0.02);
  const highEst = Math.round(costPrice * 0.05);

  return (
    <section id="costs" style={{ padding: "64px 40px" }}>
      <SectionHeader eyebrow="Follow the Money" title="All About Closing Costs" subtitle="Every home purchase comes with costs beyond the down payment. Here's the quick version — and a deep dive if you want it." />
      <div style={{ maxWidth: 720 }}>

        {/* Quick Summary */}
        <div className="content-card" style={{ padding: "28px", marginBottom: 24 }}>
          <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 16 }}>Quick Estimate</h4>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray, marginBottom: 20 }}>
            Closing costs typically run <strong>2–5% of the purchase price</strong>. This covers lender fees, title insurance, government recording, prepaid taxes & insurance, and more. The exact amount depends on your loan type, location, and what you negotiate with the seller.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: "1 1 200px" }}>
              <label htmlFor={priceInputId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Purchase Price</label>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "9px 12px" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray, marginRight: 4 }}>$</span>
                <input id={priceInputId} type="text" inputMode="decimal" value={costPrice.toLocaleString("en-US")}
                  onChange={(e) => { const v = parseFloat(e.target.value.replace(/,/g, "")); if (!isNaN(v)) setCostPrice(v); }}
                  style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", width: "100%" }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: P.creamDark, borderRadius: 10, padding: "16px", textAlign: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Low End (2%)</span>
              <span style={{ fontFamily: F.display, fontSize: 26, color: P.navy }}>{fmt(lowEst)}</span>
            </div>
            <div style={{ background: P.creamDark, borderRadius: 10, padding: "16px", textAlign: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>High End (5%)</span>
              <span style={{ fontFamily: F.display, fontSize: 26, color: P.navy }}>{fmt(highEst)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "14px 16px", background: P.cream, borderRadius: 8 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray }}>
              <strong>Geek Tip:</strong> You can often negotiate seller concessions (seller pays part of your closing costs) — especially in a buyer's market. FHA allows up to 6%, VA up to 4%, and Conventional up to 3–9% depending on down payment.
            </p>
          </div>
        </div>

        {/* Toggle for full detail */}
        <button onClick={() => setShowDetail(!showDetail)} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: `1px solid ${P.navy}`,
          background: showDetail ? P.navy : "transparent", color: showDetail ? "#fff" : P.navy,
          fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer",
          marginBottom: 24, transition: "all 0.2s",
        }}>
          {showDetail ? "Hide Detailed Breakdown ↑" : `View All 26 Closing Costs in Detail ↓`}
        </button>

        {/* Full detailed breakdown */}
        {showDetail && (
          <>
            {CLOSING_COSTS.map((cat, ci) => (
              <div key={ci} id={`costs-cat-${ci}`} className="content-card" style={{ marginBottom: 10 }}>
                <button onClick={() => { setOpenCat(openCat === ci ? -1 : ci); setOpenItem(null); }} className={`costs-cat-head ${openCat === ci ? "costs-cat-head-active" : ""}`}>
                  <span>{cat.category}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, opacity: 0.4, fontWeight: 500 }}>{cat.items.length}</span>
                    <span style={{ fontSize: 18, fontWeight: 300 }}>{openCat === ci ? "−" : "+"}</span>
                  </span>
                </button>
                {openCat === ci && cat.items.map((item, ii) => (
                  <div key={ii} style={{ borderTop: `1px solid ${P.cream}` }}>
                    <button onClick={() => setOpenItem(openItem === `${ci}-${ii}` ? null : `${ci}-${ii}`)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", border: "none", background: "transparent", fontFamily: F.body, fontSize: 13, fontWeight: 500, color: P.text, cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: 16, color: P.warmGrayLight }}>{openItem === `${ci}-${ii}` ? "−" : "+"}</span>
                    </button>
                    {openItem === `${ci}-${ii}` && <p style={{ padding: "0 20px 14px 36px", fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>{item.desc}</p>}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* TRID section also inside detail view */}
        {showDetail && (
          <div id="costs-trid" style={{ marginTop: 48 }}>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 10 }}>Your Protection</span>
              <h3 style={{ fontFamily: F.display, fontSize: "clamp(22px, 3vw, 30px)", color: P.navy, marginBottom: 10, lineHeight: 1.15 }}>TRID Fee Tolerance Matrix</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: P.warmGray }}>
                The TILA-RESPA Integrated Disclosure (TRID) rule — also known as "Know Before You Owe" — is your consumer protection against surprise fee increases at closing. It categorizes every closing cost into one of three tolerance "buckets" that determine how much (if at all) a fee can increase between your Loan Estimate and your Closing Disclosure. If a lender exceeds the allowed tolerance, they must reimburse you — this is called a "fee cure."
              </p>
            </div>

            {TRID_BUCKETS.map((bucket, i) => (
          <div key={i} className="content-card" style={{ marginBottom: 12 }}>
            <button
              onClick={() => setOpenTrid(openTrid === i ? null : i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
                border: "none", background: openTrid === i ? P.navy : "#fff", fontFamily: F.body,
                cursor: "pointer", transition: "all 0.15s", borderRadius: openTrid === i ? "12px 12px 0 0" : 12,
                textAlign: "left",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: openTrid === i ? "rgba(255,255,255,0.12)" : `${bucket.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: F.display, fontSize: 16, fontWeight: 700,
                  color: openTrid === i ? "#fff" : bucket.color,
                }}>{bucket.limit}</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  display: "block", fontSize: 15, fontWeight: 600,
                  color: openTrid === i ? "#fff" : P.navy, marginBottom: 2,
                }}>{bucket.category}</span>
                <span style={{
                  display: "block", fontSize: 12,
                  color: openTrid === i ? "rgba(255,255,255,0.5)" : P.warmGrayLight,
                }}>{bucket.limitNote}</span>
              </div>
              <span style={{
                fontSize: 18, fontWeight: 300,
                color: openTrid === i ? "rgba(255,255,255,0.5)" : P.warmGrayLight,
              }}>{openTrid === i ? "−" : "+"}</span>
            </button>
            {openTrid === i && (
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>{bucket.detail}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: P.cream, borderRadius: 8, padding: "12px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Common Fees in This Bucket</span>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text }}>{bucket.examples}</p>
                  </div>
                  <div style={{ background: P.cream, borderRadius: 8, padding: "12px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>When a Cure Is Triggered</span>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text }}>{bucket.cure}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

            <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 18px", background: P.white, borderRadius: 8, border: `1px solid rgba(0,0,0,0.04)`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
                <strong>Why this matters to you:</strong> Compare your final Closing Disclosure line-by-line against your original Loan Estimate. If fees in the zero-tolerance bucket increased at all, or if 10%-bucket fees collectively jumped more than 10%, your lender owes you money. You have 3 business days to review your Closing Disclosure before closing — use them.
              </p>
            </div>

            {/* Cash to Close Simulator CTA — appears at the end of the deep-dive for engaged readers */}
            <div style={{ marginTop: 40, padding: "28px 24px", borderRadius: 14, background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldLight, display: "block", marginBottom: 10, opacity: 0.85 }}>Put It All Together</span>
              <h3 style={{ fontFamily: F.display, fontSize: "clamp(22px, 3vw, 28px)", color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>See your exact <span style={{ color: P.goldLight }}>cash to close</span> estimate.</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", maxWidth: 460, margin: "0 auto 20px" }}>
                You know what every cost is — now see how they add up for your scenario. State-specific transfer taxes, metro-level property tax rates, and month-accurate reserve schedules across all 50 states.
              </p>
              <a href="/cash-to-close" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(184,134,11,0.3)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <CashToCloseIcon size={18} variant="cream" dollarColor="#fff" />
                  Open the Cash to Close Simulator →
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
