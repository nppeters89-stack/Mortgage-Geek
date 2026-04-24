import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { articleSchema } from "../utils/schema";
import { DTICompFactorsGrid } from "../components/DTICompFactorsGrid";

const TITLE = "FHA Manual Underwriting: HUD 4000.1 Rules, Compensating Factors, and How to Get Approved | The Mortgage Geek";
const DESCRIPTION = "FHA manual underwriting explained: HUD 4000.1 credit rules, DTI and compensating factors grid, and how to actually get approved. From a real LO with 12+ years.";
const PATH = "/deep-dives/fha-manual-underwriting";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-24";

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
  return (
    <h2 style={{ fontFamily: F.display, fontSize: 28, color: P.navy, fontWeight: 400, lineHeight: 1.2, marginTop: 48, marginBottom: 18 }}>
      {children}
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
  return (
    <div style={{ background: P.navy, borderRadius: 8, padding: "18px 22px", margin: "24px 0", position: "relative", overflow: "hidden", borderLeft: `3px solid ${P.gold}` }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: "100%", background: "radial-gradient(circle at top right, rgba(212, 168, 67, 0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 16 }}>🤓</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>Geek Tip — {title}</span>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
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

export function FHAManualUnderwritingPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "FHA Manual Underwriting: HUD 4000.1 Rules, Compensating Factors, and How to Get Approved",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/deep-dives" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
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
            FHA Manual Underwriting: What It Actually Means and <em style={{ fontStyle: "italic", color: P.gold }}>How to Get Approved</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            If your lender told you your FHA loan needs to go through "manual underwriting," you probably have questions. What does that mean? Is your loan in trouble? Can it still close?
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            Short answer: manual underwriting isn't a death sentence. In 12+ years as a loan originator, I've gotten hundreds of manually underwritten FHA files to the closing table. But it does mean your loan is held to a different, stricter set of standards than a typical "approve/eligible" from the automated system. Most of what gets written about manual underwriting online is either wrong, outdated, or buried behind paywalls.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page walks through what actually happens on a manual, using the current HUD 4000.1 Single Family Housing Policy Handbook as the source. If you're a borrower, realtor, or another LO trying to make sense of a refer/eligible, this is for you.
          </p>
        </header>

        <div style={{ background: "rgba(184, 134, 11, 0.06)", border: `1px solid rgba(184, 134, 11, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator, not an underwriter. I don't make approval decisions. But I've spent 12+ years working these files and know how to get them to close. This page explains HUD's rules as written in handbook 4000.1. Your specific loan is evaluated by your lender's underwriter against those rules plus their own overlays. More on overlays below.
            </p>
          </div>
        </div>

        <H2>First things first. What is manual underwriting?</H2>
        <Para>
          When you apply for an FHA loan, your lender runs your file through an Automated Underwriting System (AUS). For FHA loans, that's almost always FHA's TOTAL Mortgage Scorecard, accessed through either Fannie Mae's <strong style={{ color: P.navy, fontWeight: 600 }}>Desktop Underwriter (DU)</strong> or Freddie Mac's <strong style={{ color: P.navy, fontWeight: 600 }}>Loan Product Advisor (LPA, sometimes called LP)</strong>. The AUS looks at your credit, income, assets, and the property. It returns one of three decisions:
        </Para>
        <Bullets items={[
          "**Approve/Eligible** (DU) or **Accept/Eligible** (LPA): The AUS can approve your file with reduced documentation, following its findings. This is what most borrowers get.",
          "**Refer/Eligible:** The AUS can't approve the file automatically. The loan is *eligible* for FHA financing, but a human underwriter has to evaluate it manually against HUD's written guidelines.",
          "**Refer with Caution** or **Ineligible:** Something fundamental disqualifies the file (e.g., too recent a bankruptcy, missing eligibility criteria).",
        ]} />
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>A "manual underwrite" is what happens when a human underwriter makes the decision from scratch</strong>, against the explicit rules in HUD 4000.1, rather than deferring to the AUS.
        </Para>
        <Para>
          That's it. That's the whole concept. No computer approval. A person reviewing your file line by line, looking at the same guidelines anyone can read in the HUD handbook.
        </Para>

        <H2>Two paths to a manual. Which one are you on?</H2>
        <Para>
          There are two ways your file ends up being manually underwritten. Knowing which path you're on matters, because it tells you what's going on and what your LO should be doing.
        </Para>

        <H3>Path 1. The AUS returned "Refer/Eligible" from the start</H3>
        <Para>
          This happens when the AUS can't get comfortable with something in your profile, usually a combination of factors rather than one specific issue. Common triggers:
        </Para>
        <Bullets items={[
          "Lower credit scores combined with higher DTI",
          "Limited credit history or thin file",
          "Recent derogatory credit that the AUS won't accept",
          "Income or employment patterns the AUS can't validate automatically",
        ]} />
        <Para>
          In this case, the AUS isn't saying "no." It's saying "we can't automatically say yes. A human needs to look at this." Your LO should be treating it as a manual from day one.
        </Para>

        <H3>Path 2. The AUS returned "Accept/Eligible" but a downgrade is required</H3>
        <Para>
          This is the one that trips people up. Your file can come back with a clean AUS approval, but the lender is <em>required</em> to downgrade it to manual if certain conditions exist. HUD 4000.1 lists specific downgrade triggers. The lender doesn't have discretion here.
        </Para>
        <Para>
          The most common required downgrades:
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>Mortgage payment history (last 12 months):</strong></Para>
        <Bullets items={[
          "Three or more 30-day late payments",
          "One 60-day late plus one 30-day late (in any combination)",
          "One 90-day late",
          "Less than three consecutive on-time payments since completing a mortgage forbearance plan",
        ]} />
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>Other required downgrades:</strong></Para>
        <Bullets items={[
          "Any mortgage delinquency in the 12 months before case number assignment",
          "More than two 30-day lates within 24 months (if mortgage isn't on credit report)",
          "Disputed derogatory credit accounts of $1,000 or more collectively",
          "Bankruptcy discharge within 2 years of case number assignment",
          "Foreclosure, deed-in-lieu, or short sale within 3 years of case number assignment",
          "Self-employed borrower with income decline of 20% or more",
          "Undisclosed mortgage debt discovered during the process",
          "Anything in the file that the AUS can't evaluate that affects insurability (e.g., excessive NSFs or buy-now-pay-later activity visible only on bank statements)",
        ]} />
        <Para>
          For the wait-period math on bankruptcy, foreclosure, deed-in-lieu, and short sale, see our <a href="/deep-dives/derogatory-credit" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>derogatory credit wait periods guide</a>.
        </Para>

        <GeekTip title='"Hiding in plain sight"'>
          <TipBody text="The downgrade trigger that catches the most files late in the process is #8 above: stuff the AUS couldn't see. The most common version: bank statements that show a dozen overdraft fees, heavy BNPL activity, or payday loans. The AUS approved the file because it can't see bank statements, but when the underwriter reviews them, the file gets kicked to manual. If you have any of these patterns, talk to your LO early." />
        </GeekTip>

        <GeekTip title="When a downgrade is really a dead deal">
          <TipBody text="Some of these downgrade triggers essentially mean your file is finished, not just headed to a human reviewer. Here's why: HUD's manual underwriting credit standard requires **zero 30-day lates on housing in the last 12 months**. So if your file gets downgraded specifically because of recent mortgage lates (3x30, 1x60+1x30, or 1x90), the manual standards can't approve it either, unless you have documented **extenuating circumstances**." />
          <TipBody text="HUD defines extenuating circumstances narrowly: serious illness, involuntary job loss, or death of a wage earner. **Divorce, job relocation, and the inability to sell a current home don't qualify.** Even when they do apply, the approval path requires substantial documentation, second-level underwriter review, and a lender whose overlays don't prohibit approving mortgage lates at all (many do)." />
          <TipBody text="In 12+ years, I have never personally seen a file approved this way. The theoretical path exists; the practical path almost never does. If your file is getting downgraded for mortgage lates within the last 12 months, assume you're not closing on FHA and plan accordingly. Either wait out the 12 months or look at alternative loan programs." />
        </GeekTip>

        <H2>The six things an underwriter evaluates on a manual</H2>
        <Para>
          On a manual file, the underwriter is evaluating six categories. Each one has its own set of rules in HUD 4000.1, and they're all evaluated together as "layered risk."
        </Para>
        <Bullets items={[
          "**Acceptable credit.** Your payment history on housing, installment, and revolving debt.",
          "**Income and employment.** Stability, documentation, and calculation.",
          "**Assets.** Including the 1-month reserves requirement (more on this below).",
          "**Ratios.** Your housing and total debt-to-income percentages.",
          "**Compensating factors.** Strengths that offset higher DTI.",
          "**Lender overlays.** Rules your specific lender adds on top of HUD's baseline.",
        ]} />
        <Para>
          That last one matters more than most borrowers realize. <strong style={{ color: P.navy, fontWeight: 600 }}>HUD's guidelines are the floor, not the ceiling.</strong> Every lender adds their own overlays, meaning stricter rules than HUD requires. One lender might require 3 months of reserves for every manual; another requires only 1. One might cap <a href="/calculator" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>DTI</a> at 43 even though HUD allows up to 50 with compensating factors; another follows HUD exactly.
        </Para>
        <Para>
          This is why borrowers sometimes get denied at one lender and approved at another with the exact same file. It's not that HUD's rules changed. It's that the lenders have different overlays.
        </Para>

        <H2>Acceptable credit. The part that disqualifies most people</H2>
        <Para>
          This is the section that doesn't get enough attention in most articles about FHA manual underwriting, and it's the one that kills the most files.
        </Para>
        <Para>
          HUD 4000.1 specifies that on a manual, the underwriter must evaluate your payment history <strong style={{ color: P.navy, fontWeight: 600 }}>in this specific order</strong>:
        </Para>
        <Bullets items={[
          "Housing expenses (including utilities)",
          "Installment debts",
          "Revolving accounts",
        ]} />
        <Para>
          Each tier has its own rules, and the standards get looser as you go down the list. Housing is scrutinized the hardest, revolving accounts the least. Here's what the handbook actually requires.
        </Para>

        <H3>Housing payments. The strictest standard</H3>
        <Para>
          HUD evaluates your housing history first and holds it to the tightest standard:
        </Para>
        <Bullets items={[
          "**Zero 30-day late payments in the most recent 12 months** leading up to the loan application",
          "**No more than two 30-day lates in the most recent 24 months**",
          "**Verification of Rent (VOR) is required on every manual underwrite**, whether you currently own or rent",
        ]} />
        <Para>The VOR requirement is important and often missed. It means your lender needs either:</Para>
        <Bullets items={[
          "**12 months of canceled checks** showing rent paid to your landlord, OR",
          "**12 months of online bank statements** showing the payments going out",
        ]} />
        <Para>
          A letter from your landlord alone isn't enough. If you're living rent-free (with family, for example), you'll need a letter from whoever you're living with explaining the arrangement.
        </Para>

        <GeekTip title="The VOR gap">
          <TipBody text="If you're paying rent in cash to a private landlord or family member, you don't have a documentable payment history for FHA's purposes. Start paying by check or bank transfer at least 12 months before you plan to buy, or find another way to establish the history. This single issue stalls more manual files than almost anything else." />
        </GeekTip>

        <H3>Installment loans. Almost as strict as housing</H3>
        <Para>
          Installment debts are loans with a fixed monthly payment: auto loans, student loans, personal loans, furniture financing. <strong style={{ color: P.navy, fontWeight: 600 }}>Timeshares are treated as installment loans</strong>, not mortgages, even though they involve real estate.
        </Para>
        <Para>The standard is the same as housing:</Para>
        <Bullets items={[
          "Zero 30-day lates in the most recent 12 months",
          "No more than two 30-day lates in the most recent 24 months",
        ]} />
        <Para>
          This is where a lot of borrowers get tripped up. A single missed car payment in the last 12 months, even if it was caught up quickly, makes the file harder to approve on a manual. Two 30-day lates on an installment loan within the last 24 months is the absolute ceiling.
        </Para>

        <H3>Revolving accounts. Actually more lenient than you'd expect</H3>
        <Para>
          Here's where the rules surprise people. HUD 4000.1 is significantly more forgiving on revolving debt (credit cards, store cards, lines of credit) than most people assume.
        </Para>
        <Para>
          The standard for revolving is that the borrower can't have "major derogatory credit" in the last 12 months. HUD defines "major derogatory" on revolving accounts as:
        </Para>
        <Bullets items={[
          "Any payment made **more than 90 days** after the due date, OR",
          "**Three or more payments more than 60 days** after the due date",
        ]} />
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>30-day lates on revolving accounts are not considered major derogatory by HUD.</strong> That means a history of occasional 30-day credit card lates, by itself, doesn't disqualify a manual underwrite. It's not ideal, but it's not a killer.
        </Para>
        <Para>
          This is a legitimate good-news story for a lot of borrowers, and it's something most online content gets wrong or glosses over.
        </Para>

        <H3>Collections. The $2,000 line</H3>
        <Para>
          Unpaid collections are evaluated separately from payment history, and the rules depend on the cumulative balance and the type of collection.
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>Non-medical collections:</strong></Para>
        <Para>
          If the cumulative balance of all non-medical collections is <strong style={{ color: P.navy, fontWeight: 600 }}>$2,000 or more</strong>, the underwriter has three options:
        </Para>
        <Bullets items={[
          "**Pay off the collections** at or before closing",
          "**Document a payment plan** with the creditor and include that payment in DTI",
          "**Include 5% of the outstanding balance as a monthly payment in DTI** (even if no payment is actually being made)",
        ]} />
        <Para>
          If the cumulative balance is under $2,000, no action is required on a manual under HUD's rules (though lender overlays may differ).
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>Medical collections:</strong></Para>
        <Para>
          Medical collections are treated entirely differently. <strong style={{ color: P.navy, fontWeight: 600 }}>The 5% rule does not apply to medical collections, regardless of balance.</strong> No monthly payment is added to DTI. Medical collections also don't have to be paid off.
        </Para>
        <Para>
          This is one of the more borrower-friendly aspects of FHA underwriting, and it surprises a lot of people who expect all collections to be treated the same.
        </Para>

        <H3>Charge-offs. Not required to be paid off</H3>
        <Para>
          A charge-off is when a creditor has written off a debt as uncollectable (usually after 120 to 180 days of non-payment). A lot of borrowers assume they have to pay off charge-offs to get approved. <strong style={{ color: P.navy, fontWeight: 600 }}>Under HUD 4000.1, that's not true.</strong>
        </Para>
        <Bullets items={[
          "Charge-offs are not required to be paid off",
          "The monthly payment is not included in DTI",
          "The underwriter will require a written explanation from the borrower, usually addressing what happened and why",
        ]} />
        <Para>
          Lender overlays may still require payoff of specific charge-offs (especially recent ones), but HUD's baseline rules don't.
        </Para>

        <H3>Disputed derogatory accounts. The $1,000 trap</H3>
        <Para>
          This one comes from the disputed-accounts rule that triggers a mandatory downgrade, and it catches borrowers off guard.
        </Para>
        <Para>
          If the credit report shows that the borrower has <strong style={{ color: P.navy, fontWeight: 600 }}>$1,000 or more collectively</strong> in disputed derogatory accounts (disputed charge-offs, disputed collections, or disputed accounts with late payments in the last 24 months), the file must be manually underwritten, and the disputes typically need to be resolved before closing.
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>Exclusions</strong> (these don't count toward the $1,000):</Para>
        <Bullets items={[
          "Non-derogatory accounts in dispute",
          "Medical accounts in dispute",
          "Disputed accounts where the disputed items are the result of identity theft or unauthorized use (with documentation)",
        ]} />

        <GeekTip title="Don't dispute right before applying">
          <TipBody text="A common piece of bad advice floating around online is &quot;dispute your negative accounts before you apply for a mortgage.&quot; If you follow that advice and push your disputed balance above $1,000, you just forced yourself into a manual underwrite. Talk to an LO before disputing anything within 6 months of a loan application." />
        </GeekTip>

        <H2>The DTI and compensating factors grid</H2>
        <Para>
          This is the piece of FHA manual underwriting that most borrowers have never seen, and it's the single most important chart in HUD 4000.1 for anyone trying to figure out whether they can get approved on a manual.
        </Para>
        <Para>
          The grid shows the maximum debt-to-income ratios HUD allows on a manual underwrite, based on the borrower's credit score and what compensating factors are documented. Higher DTI requires more (and more specific) compensating factors.
        </Para>
        <Para>
          Click any row to expand the requirements.
        </Para>

        <DTICompFactorsGrid />

        <H3>How to read this grid</H3>
        <Para>
          The grid shows the maximum ratios HUD allows at each credit tier. Your ratios are:
        </Para>
        <Bullets items={[
          "**Housing ratio (front-end):** Proposed PITI (principal, interest, taxes, insurance) divided by gross monthly income",
          "**Total DTI (back-end):** All monthly debts (including the proposed PITI) divided by gross monthly income",
        ]} />
        <Para>
          If your ratios fall below the "no compensating factors required" tier, you don't need to document comp factors on a manual. If they push higher, you need enough documented comp factors to support the next tier up. Not sure what your ratios actually are? The <a href="/calculator" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>payment calculator</a> and <a href="/prequal" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>pre-qualification tool</a> give you a working estimate in under a minute.
        </Para>

        <H3>The compensating factors, defined</H3>
        <Para>
          HUD defines five compensating factors in 4000.1. These have specific documentation requirements. You can't just say you have them. Here's what each one actually requires.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>1. Verified Cash Reserves</strong></Para>
        <Bullets items={[
          "3+ months of reserves for 1-2 unit properties, 6+ months for 3-4 unit properties",
          "Reserves are calculated as total PITI",
          "Must come from the borrower's own funds. **Gift funds cannot be used as reserves on a manual.**",
          "Retirement accounts count at 60% of vested balance (subtract any outstanding loans)",
        ]} />

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>2. Minimal Increase in Housing Payment</strong></Para>
        <Bullets items={[
          "Requires a documented 12-month housing history",
          "No more than one 30-day late in that 12 months",
          "The new PITI cannot exceed the current housing payment by more than **the lesser of $100 or 5%**",
          "Cannot be used if the borrower has no current housing payment (living rent-free)",
        ]} />

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>3. No Discretionary Debt</strong></Para>
        <Bullets items={[
          "Credit report shows established tradelines open for at least 6 months",
          "All revolving accounts are paid in full each month for at least the past 6 months",
          "Once approved housing payment starts, the only installment-style debt the borrower will have is the mortgage",
        ]} />

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>4. Significant Additional Income Not Reflected in Effective Income</strong></Para>
        <Bullets items={[
          "Overtime, bonus, part-time, or seasonal income",
          "Must have been received for at least 12 months",
          "Must be documented as likely to continue",
          "Must be enough to reduce DTI to 37/47 if included",
          "**Restriction:** This factor can only be used in combination with another comp factor when ratios exceed 37/47 but are less than 40/50",
        ]} />

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>5. Residual Income</strong></Para>
        <Bullets items={[
          "Must meet the VA's residual income requirements for the household size and region",
          "Calculation includes childcare, maintenance, and utilities (just like VA's own calculation)",
          "This is the most borrower-friendly comp factor for low-income borrowers who might not have large reserves",
        ]} />

        <GeekTip title="Don't skip the reserves rule">
          <TipBody text="Every manual requires a minimum of 1 month of reserves from the borrower's own funds (no gifts). That's a baseline requirement, not a compensating factor. To use reserves AS a compensating factor, you need 3+ months (1-2 unit) or 6+ months (3-4 unit). The reserves question is the single most common late-stage disqualifier I see on manual files." />
        </GeekTip>

        <H2>The 1-month reserves rule. The trap that catches files late</H2>
        <Para>
          I'm calling this out as its own section because it's the rule I see files die on more than any other, and it's the rule most other articles bury or skip entirely.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>On every FHA manual underwrite, the borrower must have at least one month of PITI in verified reserves, from their own funds.</strong>
        </Para>
        <Para>Three things make this rule trip people up:</Para>
        <Bullets items={[
          "**It applies to every manual**, whether compensating factors are being used or not.",
          "**Gift funds don't count toward reserves.** You can use gifts for down payment and closing costs on an FHA loan, but reserves have to be the borrower's own money.",
          "**It's checked at the end of the process**, when most people assume the hard underwriting work is already done.",
        ]} />
        <Para>
          A few years back, I worked with a borrower going through a divorce who was, in her words, basically penniless. She had a decent income and she'd found a house she loved, but the reserves requirement on the manual nearly killed her file late in the process.
        </Para>
        <Para>
          What saved it was talking about it up front. Once we knew what the reserves gap was going to look like, she had time to garner her resources, and the seller was willing to work with her and give her some extra time to get there. None of that happens if the reserves issue shows up the day before closing.
        </Para>
        <Para>
          That's my whole philosophy on manual underwrites in one story. The rules are the rules. Borrowers don't need to be perfect. They need to be honest about their situation early enough that their LO can build a real plan around it. It's all about communication.
        </Para>

        <H2>Why manual underwrites fail. Patterns I've seen over 12+ years</H2>
        <Para>
          In my experience, the answer is almost always the same: lack of due diligence up front.
        </Para>
        <Para>
          There are a lot of rules for an MLO to comb through on an FHA manual, and most MLOs don't put the work in. They rely on the AUS decision, run the file through the usual process, and then get surprised when something trips the downgrade rules or the underwriter asks for documentation no one gathered.
        </Para>
        <Para>
          The files that fail almost always fail for the same reason: somebody didn't ask the right question at the right time. Was there a late payment 11 months ago the borrower forgot about? Does the borrower have 12 months of canceled checks for rent, or has she been paying her landlord in cash? Are the reserves actually the borrower's own funds, or were they a gift deposited last week? Every one of these is a question that can be answered on day one, if someone bothers to ask.
        </Para>
        <Para>
          Lender overlays compound the problem. Some lenders have overlays that make manual files very difficult: stricter credit standards, higher reserve requirements, tighter DTI caps. If your file is tight against HUD's baseline but your lender has overlays, you might not have a path at all. Knowing this upfront, and knowing which lenders have reasonable overlays, is half the battle.
        </Para>
        <Para>
          Once you actually know the rules and know what to look for, a manual underwrite is a checklist. Not easy, but not mysterious either. It's a matter of running the checklist, communicating what's needed from the customer, and gathering the documentation before the underwriter has to ask for it.
        </Para>
        <Para>
          In my experience, at least 75% of the manual underwrites I work end up approved. The other 25% almost always fail because of something that could have been caught in the first conversation: an undisclosed late payment, a bankruptcy that's 20 months old instead of 25, reserves that aren't truly the borrower's own money. Those things don't get better during the process. They get dealt with up front, or they kill the file late.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>I got a Refer/Eligible. Is my loan dead?</H3>
        <Para>
          No. Refer/Eligible means a human needs to look at your file. It doesn't mean the file has been denied. In my experience, at least 75% of Refer/Eligible files end up getting approved after a manual review, assuming the file is genuinely clean against HUD's guidelines and the lender has reasonable overlays.
        </Para>

        <H3>Can I just switch lenders to avoid a manual?</H3>
        <Para>
          Sometimes. The reason your file was downgraded matters. If it was downgraded because of something specific to HUD's rules (bankruptcy within 2 years, mortgage lates, etc.), switching lenders won't fix it. Every FHA-approved lender follows the same HUD handbook. But if it was downgraded because of a specific lender overlay (like a 620 minimum credit score when HUD allows 580), a different lender with no overlays or looser overlays may approve it.
        </Para>

        <H3>Does a manual underwrite take longer?</H3>
        <Para>
          Typically yes, though not dramatically. A clean AUS approval can close in 21-30 days; a manual typically adds a week or two. The main reason is the additional documentation required, especially the VOR, the reserves verification, and any explanations for compensating factors.
        </Para>

        <H3>Will my interest rate be higher on a manual underwrite?</H3>
        <Para>
          HUD doesn't require a rate difference for manual underwrites. Your rate is based on your credit score, loan-to-value, loan amount, and the market at the time of lock. Some lenders add a small rate adjustment for manuals as part of their overlays, but many don't.
        </Para>

        <H3>I have a single 30-day late on my car loan from 8 months ago. Am I dead?</H3>
        <Para>
          On a manual, this is a real issue under HUD's installment loan standard (zero 30-day lates in the last 12 months). On an AUS approval, it's not necessarily a problem. The AUS may still approve the file with compensating factors. Talk to an LO before assuming the worst, and before letting another late happen.
        </Para>

        <H3>I'm in an active Chapter 13. Can I get an FHA loan?</H3>
        <Para>
          Yes, with a manual underwrite, if: (1) you've made at least 12 months of on-time payments to the trustee, (2) the trustee approves the new mortgage, (3) the court approves the new debt, and (4) you meet the rest of the manual underwriting standards. Discharged Chapter 13 has its own rules depending on when it was discharged — our <a href="/deep-dives/derogatory-credit" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>derogatory credit wait periods guide</a> breaks this down in more detail.
        </Para>

        <H3>My AUS findings changed between pre-approval and underwriting. Why?</H3>
        <Para>
          This happens more often than people realize. AUS findings update with each run. New credit pulls, updated income documentation, property-specific details, or even HUD rule changes can change the decision. An Accept/Eligible at <a href="/prequal" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>pre-approval</a> isn't guaranteed to stay Accept/Eligible at underwriting. The reverse is also true. A file that was Refer/Eligible can sometimes become Accept/Eligible once the full documentation is in.
        </Para>

        <H3>Can compensating factors make up for bad credit?</H3>
        <Para>
          No. Compensating factors offset higher DTI ratios. They don't offset a history of late payments. HUD is explicit about this in the handbook: you need to clear the acceptable credit bar first, THEN comp factors let you qualify with higher DTI. A borrower with major derogatory credit in the last 12 months can't use "strong reserves" as a way around that.
        </Para>

        <H2>A final note. What this page is and isn't</H2>
        <Para>
          This page is a summary of what HUD 4000.1 says about manual underwriting, organized in a way that I wish had existed when I was starting out. It is not:
        </Para>
        <Bullets items={[
          "**Legal or financial advice.** Your specific situation requires a specific evaluation.",
          "**A substitute for your LO or underwriter.** Lender overlays vary; this page covers HUD's baseline only.",
          "**A guarantee of approval.** Even a perfectly structured manual file can be denied for reasons I haven't covered here.",
        ]} />
        <Para>
          If you're working through a manual underwrite right now, yours or a client's, the most useful next step is to have someone who understands these guidelines review your specific file against them. Whether that's me, your current LO, or another originator who specializes in manual underwrites, the rules are the rules. They just need to be applied correctly.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Working through a manual underwrite?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:nick@mortgagegeek.ai" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>nick@mortgagegeek.ai</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Real-world scenario questions are my favorite kind of conversation.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: HUD 4000.1 Single Family Housing Policy Handbook, Section II.A.5 (Manual Underwriting of the Borrower), updated 04/10/2025; HUD 4000.1 Section II.A.5.a (Credit Requirements, Manual); author's 12+ years of field experience as an FHA loan originator.
        </p>

      </article>

      <MobileToolbar />
    </main>
  );
}
