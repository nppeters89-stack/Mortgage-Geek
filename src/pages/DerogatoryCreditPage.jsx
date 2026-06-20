import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { WaitPeriodRows, Ch13Card } from "../components/WaitPeriodRows";
import { EVENTS } from "../data/derogatoryCredit";
import { articleSchema } from "../utils/schema";

export function DerogatoryCreditPage() {
  const [openAccordion, setOpenAccordion] = useState(null);

  const accordions = [
    {
      id: "chapter7",
      title: "Chapter 7 Bankruptcy",
      summary: "Complete liquidation bankruptcy. Wait periods range from 12 months (FHA/VA with extenuating circumstances) to 4 years (Conventional standard).",
      explainer: [
        "Chapter 7 is \"liquidation\" bankruptcy: non-exempt assets sold off, unsecured debts discharged, fresh start. Because it's the more severe of the two personal bankruptcy types, every agency imposes a wait period before the borrower can qualify for a new mortgage.",
        "The clock starts on the **discharge date** (the date the court officially wiped the debts), *not* the filing date. This matters. If someone filed in January 2024 but wasn't discharged until October 2024, the wait period starts from October.",
        "**Extenuating circumstances** can cut the wait period roughly in half, but the bar is high. The bankruptcy must have resulted from events genuinely beyond the borrower's control, documented with proof, and the borrower must have re-established a pattern of responsible credit use since. For FHA and VA specifically, these files require [manual underwriting](/deep-dives/fha-manual-underwriting), meaning an actual human underwriter reviews and approves rather than the automated system.",
      ],
      tip: "About 18 months past a Chapter 7 discharge with clean credit since? Don't assume you're locked out. **FHA or VA with a documented extenuating circumstances letter can cut the wait in half**: from 2 years down to 1. The bar is higher than most people expect though. Qualifying situations include extended medical crisis with documented hospital records, involuntary job loss from a company closure or layoff (not a voluntary quit), or death of a primary wage-earning spouse. What doesn't count: divorce, moving for a new job, general overspending, or a failed business due to normal market conditions. If you're not sure whether your situation meets the standard, it's worth a conversation with a loan officer before ruling yourself out.",
    },
    {
      id: "chapter13",
      title: "Chapter 13 Bankruptcy",
      summary: "Repayment plan bankruptcy. Most lenient paths: FHA and VA can approve during the active plan with just 12 months of on-time payments + court permission.",
      explainer: [
        "Chapter 13 is the \"reorganization\" bankruptcy: no liquidation of assets, but a court-approved plan to repay some or all of the debt over 3-5 years. Because the borrower is actively demonstrating commitment to repaying obligations, every agency treats Chapter 13 more favorably than Chapter 7.",
        "**The big unlock is the \"during active plan\" path.** FHA, VA, and USDA all allow a borrower to qualify for a mortgage *while still in* their Chapter 13 repayment plan, provided they've made 12 months of on-time payments to the trustee and received written permission from the bankruptcy court to take on new debt. This is a huge lifeline for borrowers who'd otherwise face a 5+ year wait.",
        "Fannie and Freddie do *not* allow qualification during an active plan. The borrower must wait until the plan is fully discharged or dismissed.",
        "**The discharge vs dismissal distinction matters enormously.** A **discharge** means the borrower successfully completed the plan; debts are forgiven as agreed. A **dismissal** means the plan failed (missed payments, non-compliance, etc.). For Fannie/Freddie, discharge triggers a 2-year wait, but dismissal triggers a 4-year wait. That's a big difference borrowers often don't realize.",
      ],
      tip: "Currently in a Chapter 13 plan and wondering if homeownership is years away? It might not be. **12+ months of on-time trustee payments plus written court permission can unlock an FHA or VA mortgage while still inside the active plan**. No need to wait for the full discharge. The trustee permission letter is the part that takes the longest: courts move slowly, and getting the approval often takes 60-90 days from when the request is filed. If this path interests you, the conversation with the trustee should start early, well before you're under contract on a home.",
    },
    {
      id: "foreclosure",
      title: "Foreclosure",
      summary: "Lender-forced property transfer. VA is most lenient (2 years); Fannie/Freddie strictest (7 years standard).",
      explainer: [
        "Foreclosure is the most severe of the derogatory credit events: the lender took legal action, seized the property, and sold it to recover the debt. Every agency imposes the longest wait period for foreclosure of any credit event, with Fannie and Freddie the harshest at 7 years standard.",
        "**The clock starts on the foreclosure completion date**: the date title transferred to the lender (or to the new owner at the foreclosure sale), *not* the date proceedings began.",
        "**The Fannie/Freddie 3-year exception path is real but narrow.** It requires documented extenuating circumstances, caps the loan-to-value at 90%, and is typically limited to primary residence purchases. For Freddie, rate-and-term refinances also qualify. Use of this exception is rare in practice because 90% LTV with documented extenuating circumstances is a high bar.",
        "**The critical overlap: foreclosure + bankruptcy on the same file.** This is where rules get complex. For Fannie, if a mortgage was discharged in the bankruptcy AND later foreclosed, you apply the **bankruptcy waiting period**, not the foreclosure waiting period. That's a major benefit that's often overlooked. For FHA and VA, if the foreclosure happened *within* the bankruptcy (BK included the mortgage), the bankruptcy clock generally controls. But this is a spot where handbook language is verbal guidance rather than written, so confirm with your underwriter.",
      ],
      tip: "This is the single most under-utilized path in the entire derogatory credit world, and it costs people years if they don't know it: **when a foreclosure was included in a bankruptcy, the bankruptcy wait period usually controls, not the foreclosure wait period.**\n\nExample: A Chapter 7 in 2019 that included a mortgage foreclosed in 2020. On paper, the foreclosure looks 5 years old and Fannie's 7-year rule seems to require 2 more years of waiting. But because the mortgage was *discharged in the bankruptcy*, the 4-year bankruptcy clock applies instead, meaning eligibility kicked in back in 2023.\n\nIf you have a past foreclosure, dig up the bankruptcy paperwork and check whether the mortgage debt was included. This is where situations that look hopeless turn into closed loans.",
    },
    {
      id: "shortsale",
      title: "Short Sale / Deed-in-Lieu",
      summary: "Borrower-negotiated alternatives to foreclosure. Wait periods shorter than foreclosure but longer than for routine credit events.",
      explainer: [
        "Short sale, pre-foreclosure sale, and deed-in-lieu of foreclosure are all borrower-initiated alternatives to full foreclosure. They're viewed more favorably than foreclosure across all agencies because the borrower worked *with* the lender rather than letting the property go to auction, so wait periods are shorter.",
        "**Short sale = selling the home for less than the mortgage balance**, with the lender's approval, and the deficiency typically forgiven. **Deed-in-lieu = voluntarily transferring title** to the lender to avoid the foreclosure process entirely.",
        "**VA's \"no wait if no late payments\" rule is unique and powerful.** If a veteran sold short but was current on their mortgage the entire time leading up to the sale, VA imposes no waiting period at all. This is rare (most short sales happen *because* the borrower was behind), but when it applies, it's a significant advantage. For the full picture of how VA handles tougher files end-to-end, see our [VA manual underwriting deep dive](/deep-dives/va-manual-underwriting).",
        "**Pre-2014 note:** Fannie used to distinguish between short sale and deed-in-lieu, with different wait periods. As of current guidance, both are treated identically at 4 years standard. If you're reading older materials, ignore the distinction.",
      ],
      tip: "The VA \"no late payments\" short sale exception is the one most worth knowing about, and it applies more often than people realize. **If a veteran sold their home short but kept mortgage payments current the entire time leading up to the sale, VA imposes no waiting period at all.**\n\nThe classic scenario: a PCS move forced a fast sale in a declining market, the home was worth less than the mortgage, but payments never fell behind. That veteran may be eligible for a VA loan today. No waiting required. The proof is in the servicing records: pull the payment history and make sure every payment was on time through the sale date.",
    },
    {
      id: "latepayments",
      title: "Late Mortgage Payments",
      summary: "Recent mortgage lates without a full credit event. Less severe than foreclosure but still creates underwriting friction.",
      explainer: [
        "This category isn't about catastrophic events. It's about borrowers with an otherwise clean file who missed a mortgage payment or two in the last year. Every agency cares about this more than most borrowers realize, because mortgage payment history is treated as the single strongest predictor of future mortgage payment behavior.",
        "**The rules vary more than any other category on this page.** Not just between agencies but also within agencies based on loan purpose. FHA has different thresholds for purchase, rate-and-term refi, and cash-out refi. Fannie's rule is tied to the severity of the late (60-day vs 90-day vs 120-day), not just the count.",
        "**The USDA \"housing expense reduction\" carve-out is specific and useful.** If the new USDA loan would reduce the borrower's housing expense by 50% or more, late mortgage payments in the past 12 months can be overlooked. This is almost exclusively a refinance-from-high-rate scenario but worth knowing.",
      ],
      tip: "The single most common pitfall: a 30-day late from 6-8 months ago that feels like it \"shouldn't count.\" Maybe it was a bank error, an autopay glitch, or you caught up within a few days. **For credit reporting and underwriting purposes, it counts.**\n\nThe only way to remove it is to dispute the late directly with the mortgage servicer and get them to correct the reporting to the three credit bureaus. That process takes 30-60 days minimum, sometimes longer. If you spot a recent mortgage late on your credit report and you're thinking about buying a home in the next year, start the dispute process *now*, not after you're under contract. A pending dispute discovered mid-transaction is one of the most common reasons deals blow up at the underwriting stage.",
    },
  ];

  const renderBold = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: P.navy, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return <a key={i} href={linkMatch[2]} style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>{linkMatch[1]}</a>;
      }
      return part;
    });
  };

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title="FHA, VA, Conventional Bankruptcy Wait Periods: 2026 Complete Guide"
        description="Full comparison of mortgage wait periods after bankruptcy, foreclosure, short sale, and late payments. Conventional, FHA, VA, USDA, with handbook citations."
        path="/deep-dives/derogatory-credit"
        schema={articleSchema({
          title: "FHA, VA, Conventional Bankruptcy Wait Periods: 2026 Complete Guide",
          description: "Full comparison of mortgage wait periods after bankruptcy, foreclosure, short sale, and late payments across all five major loan programs.",
          url: "https://mortgagegeek.ai/deep-dives/derogatory-credit",
          datePublished: "2026-04-23",
          dateModified: "2026-04-23",
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" />
            <a href="/deep-dives" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
          </div>
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
            How long you have to wait before qualifying for a mortgage after bankruptcy, foreclosure, short sale, deed-in-lieu, or late mortgage payments, compared across all five major loan programs.
          </p>
        </div>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "12px 16px", marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.6, margin: 0 }}>
            This reference reflects published agency guidelines as of the verification date above. Individual lenders often apply stricter "overlays" on top of these baselines. Always verify against the current agency handbook and confirm with your loan officer before making decisions based on this information.
          </p>
        </div>

        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75, marginBottom: 16 }}>
            When a borrower has a significant derogatory credit event on their record, the question isn't usually <em>if</em> they can get a mortgage again. It's <em>when</em>. Every agency has a "wait period" after events like bankruptcy, foreclosure, or short sale. These periods exist so borrowers can rebuild credit and demonstrate financial stability before taking on new mortgage debt.
          </p>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75, marginBottom: 16 }}>
            The wait periods vary meaningfully across programs. <strong style={{ color: P.navy, fontWeight: 600 }}>Conventional loans (Fannie/Freddie) are the strictest</strong>: 4 years minimum for most events. <strong style={{ color: P.navy, fontWeight: 600 }}>FHA is the middle ground</strong>: usually 2-3 years. <strong style={{ color: P.navy, fontWeight: 600 }}>VA tends to be the most lenient</strong> for eligible veterans. <strong style={{ color: P.navy, fontWeight: 600 }}>USDA falls between FHA and Conventional.</strong>
          </p>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75 }}>
            Many events also have an "extenuating circumstances" path that can reduce the wait period, but that path is stricter than most borrowers realize. It requires documented, one-time events beyond the borrower's control: serious illness, death of a wage earner, or job loss from company downsizing. Divorce, voluntary job changes, or general financial mismanagement do <em>not</em> qualify.
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
                    <h2 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, fontWeight: 400, lineHeight: 1.2, marginBottom: 4 }}>{acc.title}</h2>
                    {!isOpen && (
                      <p style={{ fontSize: 13, color: P.warmGray, lineHeight: 1.5 }}>{acc.summary}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 20, color: P.gold, flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "4px 22px 24px", borderTop: `1px solid ${P.creamDark}` }}>
                    <div style={{ margin: "16px 0" }}>
                      {acc.id === "chapter13"
                        ? <Ch13Card />
                        : <WaitPeriodRows event={EVENTS[acc.id]} />}
                    </div>

                    <div style={{ marginTop: 20 }}>
                      {acc.explainer.map((para, i) => (
                        <p key={i} style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.75, marginBottom: 12 }}>
                          {renderBold(para)}
                        </p>
                      ))}
                    </div>

                    <div style={{ marginTop: 20, background: P.navy, borderRadius: 8, padding: "18px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>🤓</span>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>Geek Tip — When This Matters</span>
                      </div>
                      {acc.tip.split("\n\n").map((para, i) => (
                        <p key={i} style={{ fontSize: 13.5, color: P.cream, lineHeight: 1.7, marginBottom: i < acc.tip.split("\n\n").length - 1 ? 10 : 0 }}>
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
    </main>
  );
}
