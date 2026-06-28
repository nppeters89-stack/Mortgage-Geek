import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { DebtsPaidByOthersGrid } from "../components/DebtsPaidByOthersGrid";

const TITLE = "Debts Paid by Others: How to Exclude Someone Else's Payments From Your Mortgage DTI | Mortgage Geek";
const DESCRIPTION = "Debts paid by others mortgage rules: when a parent or spouse pays your loan, when you can exclude it from DTI. Agency-by-agency rules. Real LO insights.";
const PATH = "/deep-dives/debts-paid-by-others";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-29";
const MODIFIED = "2026-04-29";

function renderInline(text) {
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
}

function Para({ children, noMargin }) {
  return (
    <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75, marginBottom: noMargin ? 0 : 14 }}>
      {children}
    </p>
  );
}

function H2({ children }) {
  const text = typeof children === "string" ? children : "";
  const colonIdx = text.indexOf(".");
  const before = colonIdx > -1 ? text.slice(0, colonIdx + 1) : text;
  const after = colonIdx > -1 ? text.slice(colonIdx + 1) : "";
  return (
    <h2 style={{ fontFamily: F.display, fontSize: 28, color: P.navy, fontWeight: 400, lineHeight: 1.2, marginTop: 48, marginBottom: 18 }}>
      {before}
      {after && <em style={{ fontStyle: "italic", color: P.gold, fontWeight: 400 }}>{after}</em>}
    </h2>
  );
}

function H3({ children }) {
  return (
    <h3 style={{ fontFamily: F.body, fontSize: 17, color: P.navy, fontWeight: 600, lineHeight: 1.3, marginTop: 28, marginBottom: 12 }}>
      {children}
    </h3>
  );
}

function GeekTip({ title, children }) {
  const [open, setOpen] = useState(false);
  const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const panelId = `geektip-panel-${slug}`;
  return (
    <div style={{ background: P.navy, borderRadius: 8, margin: "24px 0", borderLeft: `3px solid ${P.gold}` }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          minHeight: 44,
          padding: "14px 22px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: F.body,
        }}
      >
        <span style={{ fontSize: 16 }}>🤓</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight, flex: 1 }}>Geek Tip — {title}</span>
        <span aria-hidden="true" style={{ fontSize: 20, color: P.goldLight, lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div id={panelId} style={{ padding: "0 22px 18px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TipBody({ text }) {
  return (
    <p style={{ fontSize: 14, color: P.cream, lineHeight: 1.7, marginBottom: 10 }}>
      {renderInline(text).map((piece, j) =>
        typeof piece === "string" ? piece :
        piece.type === "strong" ? <strong key={j} style={{ color: P.goldLight, fontWeight: 600 }}>{piece.props.children}</strong> :
        piece
      )}
    </p>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 14px 0" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7, padding: "4px 0 4px 22px", position: "relative" }}>
          <span style={{ position: "absolute", left: 6, top: 4, color: P.gold, fontWeight: 700 }}>•</span>
          {renderInline(item)}
        </li>
      ))}
    </ul>
  );
}

const LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function DebtsPaidByOthersPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--light" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" headerTone="light" />
            <a href="/deep-dives" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
          </div>
        </div>
      </div>

      <article className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 860, margin: "0 auto" }}>

        <header style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.gold }}>🐳 Deep Dive</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight }}>·</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified April 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
            Debts Paid by Others: <em style={{ fontStyle: "italic", color: P.gold }}>How to Exclude Someone Else's Payments From Your Mortgage DTI</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            Your parents have been making your car payment for the last three years. Or your ex pays the credit card debt per the divorce decree. Or your spouse handles the student loan even though it's in your name. The debt shows up on your credit report. Does it count against you when you apply for a mortgage?
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            In many cases, no. Mortgage rules let you exclude a debt from your <a href="/calculator" style={LINK_STYLE}>debt-to-income ratio</a> if someone else has been making the payments, with the right documentation. But the rules vary by loan program, and one detail catches a lot of borrowers off guard: <strong style={{ color: P.navy, fontWeight: 600 }}>for <a href="/deep-dives/fha-manual-underwriting" style={LINK_STYLE}>FHA</a>, <a href="/deep-dives/usda-manual-underwriting" style={LINK_STYLE}>USDA</a>, and <a href="/deep-dives/va-manual-underwriting" style={LINK_STYLE}>VA</a> loans, the person paying the debt has to be obligated on it with you. For conventional loans (Fannie Mae and Freddie Mac), they do not.</strong>
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page covers what's required for each loan program, what documentation you'll need, and the limits to keep in mind.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator. The rules below come from agency guidelines (Fannie Mae Selling Guide B3-6-05, Freddie Mac Single-Family Seller/Servicer Guide 5401.2, HUD Handbook 4000.1, USDA HB-1-3555 Chapter 11, VA Pamphlet 26-7 Chapter 4) and field experience. Your specific file is evaluated by your lender's underwriter against agency guidelines plus their own overlays. Lenders vary on this topic.
            </p>
          </div>
        </div>

        <H2>First, what does "paid by others" actually mean?</H2>
        <Para>
          In mortgage underwriting, <strong style={{ color: P.navy, fontWeight: 600 }}>a debt paid by others is any non-mortgage liability on your credit report that someone else has been making the payments on for at least the last 12 months.</strong> Common scenarios:
        </Para>
        <Bullets items={[
          "**Parents paying a car loan or student loan** that's in your name",
          "**A spouse paying a credit card** that's in your name only",
          "**An ex-spouse paying a debt** assigned to them in a divorce decree (even though both names remain on the original loan)",
          "**A co-signer paying a loan** they co-signed with you (or vice versa, where you're on someone else's loan that they're paying)",
        ]} />
        <Para>
          If the documentation supports it, this debt can be excluded from your DTI calculation, which often makes a meaningful difference in qualifying for the loan amount you want.
        </Para>
        <Para>
          The opposite is also true: if a debt is in your name and you're paying it, even if someone else co-signed, the debt is yours for DTI purposes. The exclusion only flows toward the borrower, not away from them.
        </Para>

        <H2>The big chart. Debts paid by others by agency.</H2>
        <Para>
          Below is the at-a-glance comparison. <strong style={{ color: P.navy, fontWeight: 600 }}>Whether the third party paying the debt has to be obligated on it</strong> is the single fact that splits the agency programs into two camps. It's the first thing to look at on each row.
        </Para>

        <DebtsPaidByOthersGrid />

        <GeekTip title="The agency split is the most important fact on this page">
          <TipBody text="If the third party paying your debt is a parent who is NOT on the debt with you, only Fannie Mae and Freddie Mac (conventional loans) will let you exclude it. FHA, VA, and USDA require the third party to be obligated on the debt with you. This single rule decides which loan programs can use the exclusion in many real-world scenarios." />
        </GeekTip>

        <H2>The 12-month rule, and why it's not negotiable</H2>
        <Para>
          Across every loan program, the documentation requirement is essentially the same: <strong style={{ color: P.navy, fontWeight: 600 }}>12 months of evidence that the third party has been making the payments on time.</strong> Acceptable forms:
        </Para>
        <Bullets items={[
          "**Canceled checks** from the third party's account",
          "**Money order receipts** showing the third party as the purchaser",
          "**Bank statements from the third party** showing the recurring withdrawal for the debt payment",
        ]} />
        <Para>
          The 12-month period is the most recent 12 months prior to your loan application. Not 9 months. Not "for years and years before, but the last few were spotty." The lender wants 12 consecutive months of clean payment evidence in the immediate run-up to your application.
        </Para>

        <H3>Late payments break the exclusion</H3>
        <Para>
          Across all five agency loan programs, <strong style={{ color: P.navy, fontWeight: 600 }}>a single late payment in the last 12 months by the third party disqualifies the debt from being excluded.</strong> The reasoning: if the third party can't make the payment reliably, you might end up making it yourself, and the debt belongs in your DTI to reflect that risk.
        </Para>
        <Para>
          This is the most common reason borrowers think they can exclude a debt and find out late in the process they can't. If your dad has been paying your car loan but missed a month back in May, that single late payment kills the exclusion regardless of how clean the other 11 months look.
        </Para>

        <H3>Bank statements need to come from the right account</H3>
        <Para>
          The bank statements documenting the payments need to come from <strong style={{ color: P.navy, fontWeight: 600 }}>the third party's account</strong>, not yours. If the payments come out of your own checking account because the third party transfers money to you and you make the payment, the third party isn't really paying the debt for purposes of mortgage qualification. The lender treats that as if you're paying it yourself.
        </Para>
        <Para>
          This catches more files than people expect. The mechanics of how the money moves matter, not just the financial reality of who's actually footing the bill.
        </Para>

        <GeekTip title="If you're going to set up someone else paying, set it up correctly">
          <TipBody text="If you're planning to use this exclusion in the future, make sure the third party pays the debt directly from their own account to the creditor. Not by giving you cash or a transfer that you then use to make the payment. Direct payment to the creditor, traceable to the third party's account, is what the documentation needs to show. If you're already in a situation where you're a middleman, talk to your LO before applying so you can plan the documentation correctly." />
        </GeekTip>

        <H2>The interested party exception</H2>
        <Para>
          For Fannie Mae and Freddie Mac (the more permissive conventional loan programs), there's one important exception to the "anyone can pay it" rule:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The third party paying the debt cannot be an interested party to the transaction.</strong>
        </Para>
        <Para>
          An interested party is someone with a financial stake in your home purchase: the seller, the real estate agent, the builder if you're buying new construction, the mortgage broker, or anyone affiliated with these parties. If the debt is being paid by someone in this category, the exclusion isn't available even on conventional loans.
        </Para>
        <Para>
          The reasoning: interested parties have an incentive to help you qualify, and that creates the risk that the payment arrangement isn't genuine or sustainable. The rule prevents a seller from "paying" your car loan for 12 months just to help you qualify, then stopping after closing.
        </Para>
        <Para>
          In practice, this exception almost never matters because it's unusual for a seller, agent, or builder to be paying a borrower's debt in the first place. But it's worth knowing, especially in family-related transactions where the seller might also be a relative who's been paying your other debts.
        </Para>

        <H2>Mortgage debt is different</H2>
        <Para>
          The standard "debt paid by others" exclusion applies primarily to <strong style={{ color: P.navy, fontWeight: 600 }}>non-mortgage debts</strong>: installment loans, credit cards, student loans, auto loans, lease payments, and similar revolving or installment obligations.
        </Para>
        <Para>
          When the debt being paid by someone else is a <strong style={{ color: P.navy, fontWeight: 600 }}>mortgage</strong> (you're on a mortgage with someone else, and they've been making the payments), additional rules kick in:
        </Para>
        <Bullets items={[
          "**Fannie Mae:** The full monthly housing expense (PITIA) can be excluded if the other party is obligated on the mortgage debt, has been making payments for 12 months without delinquency, and the borrower is not using rental income from that property to qualify. The property must still be counted in financed properties calculations.",
          "**FHA, VA, USDA:** Similar 12-month payment history rule for mortgage debt, with the requirement that the other party be on the debt with you. FHA has specific rules for mortgage assumptions where the borrower's name remains on the debt but a deed has transferred the property.",
        ]} />
        <Para>
          Mortgage debts are scrutinized harder than non-mortgage debts because the dollar amounts are larger and the risk of the borrower having to step in is higher. Expect more documentation and more underwriter questions when the debt being excluded is a mortgage.
        </Para>

        <H2>The divorce decree special case</H2>
        <Para>
          Divorce creates a common scenario: a debt is in both spouses' names, the divorce decree assigns it to one spouse, but the credit report still shows both. Whether the non-paying spouse can exclude the debt for mortgage purposes depends on the loan program:
        </Para>
        <Bullets items={[
          "**FHA explicitly accepts a court-ordered divorce decree** as evidence that the other spouse is responsible for the payment. This is one of the cleaner paths to exclusion across the agency loan programs.",
          "**VA, USDA, FNMA, and FHLMC** generally accept the divorce decree as supporting evidence but still want the 12-month payment history from the responsible spouse to confirm the arrangement is actually being followed.",
        ]} />
        <Para>
          Worth knowing: even if the divorce decree assigns the debt to your ex, the original creditor still considers both of you liable. The decree is between you and your ex, not between you and the creditor. If your ex stops paying, the creditor will pursue both of you. The decree gives you legal recourse against your ex, but it doesn't get you off the hook with the lender. This is true regardless of mortgage qualification.
        </Para>

        <GeekTip title="Refinance the debt out of your name if possible">
          <TipBody text="If you went through a divorce and a debt is now your ex's responsibility per the decree, the cleanest long-term solution is to have your ex refinance the debt out of your name entirely. This eliminates the liability on your credit report and removes any future exclusion documentation requirement. Easier said than done in many cases, but worth pursuing if you're planning to buy another home in the next few years." />
        </GeekTip>

        <H2>When this matters most</H2>
        <Para>
          Excluding a debt paid by others matters most when the excluded payment moves your DTI ratio from "doesn't qualify" to "qualifies." A few specific scenarios where this comes up frequently:
        </Para>
        <Bullets items={[
          "**A young borrower whose parents pay their car loan or student loans.** Common, easy to document, and often the difference between qualifying and not on conventional loans. FHA limits the play because the parent typically isn't on the debt.",
          "**A divorced borrower with debts assigned to the ex.** The divorce decree is a meaningful legal document, but the 12-month payment history matters more than the decree itself in the lender's eyes.",
          "**A borrower whose business pays a vehicle loan in their personal name.** This sits at the intersection of business assets and debts paid by others. Fannie Mae specifically requires that the business provide 12 months of canceled company checks AND that the business's cash flow analysis reflect the payment as a business expense.",
          "**A spouse on a non-purchasing co-borrower's debts.** When one spouse is qualifying alone but the other has debts in their name, those debts may or may not need to be counted depending on state property laws. This is a separate framework that often confuses borrowers.",
        ]} />
        <Para>
          For more on the cash flow analysis that comes into play when business funds pay personal debts, see the <a href="/deep-dives/self-employed-documentation" style={LINK_STYLE}>Self-Employment Documentation Deep Dive</a>.
        </Para>
        <Para>
          The exclusion isn't always available. When it isn't, the right move is often to either pay down the debt before applying, or restructure who's on the loan. Don't assume you can exclude a debt just because someone else is paying it. Confirm with your LO during <a href="/prequal" style={LINK_STYLE}>pre-approval</a>, not at conditions.
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page summarizes "debts paid by others" mortgage rules across the major agency loan programs as they exist in 2026. It is not:
        </Para>
        <Bullets items={[
          "**Legal advice.** Divorce decrees, contingent liability agreements, and similar legal documents are best discussed with an attorney for the legal implications. We're describing how mortgage lenders interpret them, not how they should be drafted.",
          "**A substitute for your LO.** Specific files require specific evaluation, and lender overlays vary on this topic.",
          "**A guarantee that any specific debt can be excluded.** Even when the rules support exclusion, individual underwriters can require additional documentation.",
        ]} />
        <Para>
          If you're navigating a mortgage application with debts paid by others in play and want to talk through your specific situation, I'm reachable at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={LINK_STYLE}>(615) 656-0737</a> or <a href="mailto:Nick.Peters@rate.com" aria-label="Email Nick Peters at Nick.Peters@rate.com" style={LINK_STYLE}>Nick.Peters@rate.com</a>. Bring a copy of your credit report, an idea of who's paying what, and what documentation you can pull together. We'll work through the rest.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Trying to figure out if a debt can be excluded?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:Nick.Peters@rate.com" aria-label="Email Nick Peters at Nick.Peters@rate.com" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Nick.Peters@rate.com</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your credit report and an idea of who's been paying what. We'll work through the rest before you go under contract.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B3-6-05 (Monthly Debt Obligations); Freddie Mac Single-Family Seller/Servicer Guide Section 5401.2 (Monthly debt payment-to-income ratio); FHA Single Family Housing Policy Handbook 4000.1, Sections II.A.4.b.iv.(L) and II.A.5.a.iv.(N) (Contingent Liabilities); USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook (HB-1-3555), Chapter 11 (Ratio Analysis); VA Lender's Handbook (Pamphlet 26-7), Chapter 4, Topic 5 (Debts and Obligations); author's 12+ years of field experience originating mortgages with co-signed and third-party-paid debts.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
