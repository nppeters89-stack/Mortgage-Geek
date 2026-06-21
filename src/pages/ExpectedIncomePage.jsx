import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { ExpectedIncomeMatrix } from "../components/ExpectedIncomeMatrix";

const TITLE = "Expected Income for Mortgages: Using a New Job Offer to Qualify | Mortgage Geek";
const DESCRIPTION = "Expected income mortgage rules explained: how to qualify with a new job offer letter, 60-day vs 90-day windows, reserve requirements, by loan program. Real LO insights.";
const PATH = "/deep-dives/expected-income";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-28";
const MODIFIED = "2026-04-28";

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
  const periodIdx = text.indexOf(".");
  const before = periodIdx > -1 ? text.slice(0, periodIdx + 1) : text;
  const after = periodIdx > -1 ? text.slice(periodIdx + 1) : "";
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

const navyLink = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function ExpectedIncomePage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Expected Income for Mortgages: Using a New Job Offer to Qualify",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><img src="/mg-mark-sm.svg" alt="" aria-hidden="true" width={21} height={26} style={{ display: "block", flexShrink: 0, marginRight: 7 }} />
            <span style={{ fontFamily: F.display, fontSize: 18, color: P.text }}>Mortgage <span style={{ color: P.gold }}>Geek</span></span>
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
            Expected Income for Mortgages: <em style={{ fontStyle: "italic", color: P.gold }}>Using a New Job Offer to Qualify</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            You got the job. The offer letter is signed. You're moving for the new role and you need a mortgage on the new house, but you haven't actually started the job yet, so you don't have paystubs from it. Can you qualify on the new salary anyway?
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            The short answer: usually yes, with the right documentation and the right loan program. Every major loan program (<a href="/deep-dives/fha-manual-underwriting" style={navyLink}>FHA</a>, <a href="/deep-dives/va-manual-underwriting" style={navyLink}>VA</a>, <a href="/deep-dives/usda-manual-underwriting" style={navyLink}>USDA</a>, Fannie Mae, Freddie Mac) has specific rules for what's called "expected income" or "future income" qualification. The rules are similar in concept but vary in the details: how soon the job has to start, what documentation you need, whether you need cash reserves, and what restrictions apply.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page maps it all out with one infographic that handles the cross-program comparison and supporting prose for the nuance.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator. The rules below come from agency guidelines (Fannie Mae Selling Guide, Freddie Mac Single-Family Seller/Servicer Guide, HUD 4000.1, VA Pamphlet 26-7, USDA HB-1-3555) and 12+ years of writing expected-income files for moving professionals, new graduates, military relocations, and folks taking new positions in new cities. Your specific file is evaluated by your lender's underwriter against agency guidelines plus their own overlays. As always, lenders vary.
            </p>
          </div>
        </div>

        <H2>First, what is "expected income"?</H2>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Expected income</strong> is mortgage industry shorthand for qualifying a borrower based on a job they're either about to start or have just started, before the lender can see a full payment history from that job. It's also called "future income" or "anticipated income" depending on the agency.
        </Para>
        <Para>
          Three borrower situations trigger expected income rules:
        </Para>
        <Bullets items={[
          "**Job started recently, no paystub yet.** The borrower started a new job before mortgage closing but hasn't received a full first paystub.",
          "**Job starts shortly after closing.** The borrower has signed an offer letter for a job that starts within ~60 days of closing.",
          "**Job starts well after closing.** The borrower has signed an offer letter but the job doesn't start until 60-90+ days after closing. Typical for new doctors, teachers starting in fall, military relocations.",
        ]} />
        <Para>
          Each situation has its own documentation playbook, and that playbook varies by loan program. The infographic below shows how each program handles each scenario.
        </Para>

        <H2>The big chart. Expected income by scenario and loan program.</H2>

        <ExpectedIncomeMatrix />

        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Family-owned business exclusion applies across all programs.</strong> Borrowers employed by a family member or interested party in the transaction cannot use expected income.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Reserves requirements vary.</strong> Conventional loans (FNMA Option 2 and FHLMC Option 1) require documented reserves to cover PITI plus monthly liabilities for the gap between closing and the first paystub. Government loans (FHA, VA, USDA) generally require reserves only when there's a meaningful gap between closing and start date, with FHA explicitly requiring "sufficient income or cash reserves to support the mortgage payments and any other obligations during the interim."
        </Para>

        <H2>The 60-day rule. Government loans.</H2>
        <Para>
          The simplest case across the board is government loans (FHA, VA, USDA) when the job starts within 60 days of closing. This is the standard expected income scenario and the rules are friendly to it.
        </Para>

        <H3>What you need</H3>
        <Para>
          For an FHA, VA, or USDA loan with a job starting within 60 days of closing, the lender needs:
        </Para>
        <Bullets items={[
          "**Fully executed offer letter or employment contract.** Signed by both employer and borrower.",
          "**All contingencies of employment satisfied.** Background check passed, drug test cleared, professional licensing verified, etc. The offer cannot still be conditional on something.",
          "**Confirmation that the first paystub will be received within 60 days of closing.** This is the hard ceiling on the standard scenario.",
          "**Verified income amount.** Either base salary or hourly rate with confirmed hours.",
          "**Verified location of employment.** Important for occupancy verification (the new job needs to make sense given where the borrower is buying).",
        ]} />

        <H3>What about cash reserves?</H3>
        <Para>
          For government loans, cash reserves aren't always required when the start date is within 60 days, but it depends on the gap between closing and the start date. The longer the gap, the more likely the lender wants documented reserves to cover the mortgage payment in the meantime.
        </Para>
        <Para>
          FHA's specific rule: the lender must verify that the borrower will have <strong style={{ color: P.navy, fontWeight: 600 }}>sufficient income or cash reserves to support the mortgage payments and any other obligations during the interim</strong> between loan closing and the start of employment.
        </Para>
        <Para>
          In practice, if you're closing on a Friday and your job starts Monday, no special reserves are needed. If you're closing on August 15 and your teaching job doesn't start until October 1, expect to document 1-2 months of PITI in reserves.
        </Para>

        <H3>Family-owned business exclusion</H3>
        <Para>
          Every program excludes expected income when the borrower is employed by a family member or interested party in the transaction. If the new job is at your dad's company, you cannot use expected income to qualify. The lender will require actual paystubs once you've been employed long enough to generate them.
        </Para>

        <H2>The 90-day rule. Conventional loans.</H2>
        <Para>
          Conventional loans (Fannie Mae and Freddie Mac) extend the window to 90 days after closing, but with stricter conditions and reserve requirements.
        </Para>

        <H3>Fannie Mae's two options (B3-3.3-03)</H3>
        <Para>
          Fannie Mae offers two paths for qualifying on future employment income:
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>FNMA Option 1: Paystub obtained before loan delivery</strong></Para>
        <Para>
          The borrower starts the new job after closing but before loan delivery, and a paystub is obtained validating the income. Eligible only on:
        </Para>
        <Bullets items={[
          "Purchase transactions",
          "Principal residence",
          "One-unit property",
          "Borrower not employed by family member or interested party",
          "Using fixed base income only (no commission, bonus, or overtime as primary)",
        ]} />
        <Para>
          The job must start no later than 90 days after closing. Reserves required per agency requirements. This option requires post-closing paystub follow-up by the lender.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>FNMA Option 2: No paystub before delivery, offer letter only</strong></Para>
        <Para>
          The lender uses the offer letter alone to qualify, without obtaining a paystub before delivery. Eligible on the same purchase/principal/one-unit/non-family criteria as Option 1. Additional requirements:
        </Para>
        <Bullets items={[
          "Fully executed offer letter confirming start date, income, and location",
          "All contingencies of employment satisfied",
          "Start date no earlier than 30 days prior to note date, no more than 90 days after the note date",
          "Documented reserves per agency requirements",
        ]} />
        <Para>
          This option is the cleaner path because there's no post-closing follow-up required, but the offer letter and contingency documentation has to be airtight.
        </Para>

        <H3>Freddie Mac's two options (Section 5303.2)</H3>
        <Para>
          Freddie Mac mirrors Fannie's structure but with subtle differences:
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>FHLMC Option 1: Paystub will not be obtained before delivery</strong></Para>
        <Para>
          Similar to FNMA Option 2. Eligible only on:
        </Para>
        <Bullets items={[
          "Purchase transactions",
          "One-unit property",
          "Primary employment",
          "**Salary income only** (not eligible with fluctuating or hourly income)",
          "Employer not a family member or interested party",
          "ARM loans eligible",
          "Not eligible on cash-out refinance",
        ]} />
        <Para>
          Start date must be no more than 90 days after the note date. Reserves required.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>FHLMC Option 2: Paystub will be obtained before delivery</strong></Para>
        <Para>
          Similar to FNMA Option 1, but with broader eligibility. Eligible on:
        </Para>
        <Bullets items={[
          "Primary, second home, and investment transactions",
          "1-4 unit property",
          "Primary employment, salary income only",
          "Employer not a family member or interested party",
          "\"No cash-out\" refinance OR cash-out refinance both eligible",
          "**ARM loans NOT eligible** under this option",
        ]} />
        <Para>
          The key difference: FHLMC Option 2 allows investment properties and cash-out refinances, but excludes ARM loans. FHLMC Option 1 allows ARMs but only on purchase, primary residence, one-unit.
        </Para>

        <GeekTip title="The salary-only restriction on Freddie matters">
          <TipBody text="Both Freddie Mac options require salary income only. Not fluctuating, not hourly. If your new job pays hourly, or if a meaningful portion of your new compensation is commission, bonus, or overtime, Freddie's expected income paths don't work. Fannie Mae's options are similarly restricted to 'fixed base income only,' meaning the same practical restriction. If you're starting a job with a heavy variable-comp component, expect to wait for actual paystubs (and likely a bonus history) before the lender can use that variable income." />
        </GeekTip>

        <H2>The "common professions" exception</H2>
        <Para>
          When a job starts more than 60 days (government) or 90 days (conventional) after closing, the standard expected income paths don't work. But there's an exception specifically for "common professions" with predictable training and start cycles.
        </Para>

        <H3>Who qualifies</H3>
        <Para>
          The common professions exception typically applies to:
        </Para>
        <Bullets items={[
          "**Doctors completing residency or fellowship.** Physicians often have known start dates 4-6 months out.",
          "**Teachers and professors.** School-year start dates are predictable, often 60-120 days out.",
          "**Other licensed professionals** with documented training-to-employment timelines (some legal, healthcare, and academic positions).",
        ]} />

        <H3>How it works</H3>
        <Para>
          For these cases, lenders can review the file on a case-by-case basis with senior underwriting management approval. The borrower still needs:
        </Para>
        <Bullets items={[
          "Fully executed offer letter or contract with start date, income, and location",
          "All contingencies of employment satisfied",
          "Documentation that supports the timeline (residency completion date, school year start date, etc.)",
          "Likely additional reserves to cover the longer gap",
        ]} />
        <Para>
          For FHA loans, post-closing paystub follow-up is required. The lender's branch must follow up with the borrower to obtain the income documentation no later than the expected start date.
        </Para>

        <H3>Why this exception exists</H3>
        <Para>
          The common professions exception exists because these career timelines are well-understood and the income outcomes are highly predictable. A first-year resident's starting salary is published. A teacher's contract is binding. A new professor's salary is set by the institution. The lender can rely on these income figures with high confidence even though the borrower hasn't started yet.
        </Para>

        <GeekTip title="The 'common profession' framing is more flexible than it sounds">
          <TipBody text="The phrase 'doctors, teachers, professors' appears in the guidelines but it's not exhaustive. Other professions with similarly predictable start timelines (judicial clerks, military officer commissioning, certain academic and research positions) can sometimes qualify under similar logic, depending on the lender. If you're in a profession with a structured training-to-employment pipeline and a known start date, ask your LO about the common professions exception specifically. Don't assume it doesn't apply just because your title isn't 'doctor' or 'teacher.'" />
        </GeekTip>

        <H2>Reserves. The ones you need and why.</H2>
        <Para>
          Across all programs, when a borrower uses expected income, the lender wants to see that the borrower can cover the mortgage during the gap between closing and the first paystub. This is where cash reserves come in.
        </Para>

        <H3>What "reserves" means</H3>
        <Para>
          In mortgage terminology, <strong style={{ color: P.navy, fontWeight: 600 }}>reserves</strong> are documented liquid assets that remain available to the borrower after closing, typically expressed in months of mortgage payment (PITI). Acceptable sources include:
        </Para>
        <Bullets items={[
          "Checking and savings accounts (verified)",
          "Money market accounts",
          "Stocks, bonds, and mutual funds (typically discounted to 70-80% of value)",
          "Retirement accounts (typically discounted to 60% of vested balance to account for taxes and penalties on early withdrawal, though this varies by program and circumstance)",
        ]} />
        <Para>
          Sources NOT eligible as reserves:
        </Para>
        <Bullets items={[
          "Cash on hand (USDA explicitly excludes)",
          "Borrowed funds",
          "Gift funds (in most cases)",
          "Business funds (with limited exceptions)",
        ]} />

        <H3>How much you need</H3>
        <Para>
          The exact reserve amount depends on the loan program and the gap between closing and start date. Rough guidance:
        </Para>
        <Bullets items={[
          "**Short gap (under 30 days), government loan:** Often no specific reserves required beyond the standard cash-to-close.",
          "**Medium gap (30-60 days), government loan:** Typically 1-2 months PITI in documented reserves.",
          "**Conventional with offer letter only (FNMA Option 2 or FHLMC Option 1):** Reserves required per agency, usually covering PITI plus monthly liabilities for the months between note date and start date, plus one additional month buffer.",
          "**Common professions exception (60-90+ day gap):** Often 3-6 months PITI in reserves, depending on the gap length.",
        ]} />
        <Para>
          Your LO will calculate the specific reserve requirement for your file based on your loan program, the gap between closing and start date, and your other monthly debts. To run scenarios at different price points and see how the payment moves, the <a href="/calculator" style={navyLink}>calculator</a> will get you close.
        </Para>

        <H2>Why expected income files fail. Common patterns.</H2>
        <Para>
          Expected income files fail more often than standard W-2 files because there are more conditions to clear. The most common failure modes:
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>1. Contingencies not cleared.</strong></Para>
        <Para>
          The offer letter still has language like "subject to background check" or "conditional on completion of training." Lenders cannot use the income until all contingencies are documented as satisfied. Solution: get a written confirmation from the employer (on letterhead or via verifiable email) that all contingencies are cleared before final loan approval.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>2. Missing or incorrectly worded offer letter.</strong></Para>
        <Para>
          The offer letter doesn't include start date, doesn't specify income type and amount, doesn't specify location, or isn't fully executed (signed by both parties). Solution: review the offer letter early in the process and request corrections from the employer if anything is missing.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>3. Family-owned business issue not disclosed.</strong></Para>
        <Para>
          Borrower's new job is at a family member's company. Borrower doesn't realize this is an issue until late in the process. Solution: disclose any family or business relationship with the new employer at application.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>4. Income type doesn't match the loan program's restrictions.</strong></Para>
        <Para>
          Borrower's new compensation includes substantial commission or bonus. The lender tries to use Freddie or Fannie's expected income option, which both require salary-only. File pivots late to a slower path or moves to a different lender. Solution: front-load the income breakdown discussion at <a href="/prequal" style={navyLink}>pre-qualification</a>.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>5. Start date too far out for chosen loan program.</strong></Para>
        <Para>
          Borrower needs FHA for credit reasons but the new job doesn't start for 75 days. FHA's 60-day window doesn't fit. Solution: either delay closing to fit the 60-day window, find a different loan program (conventional may have a 90-day window), or qualify for the common professions exception.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>6. Insufficient reserves.</strong></Para>
        <Para>
          Borrower has minimal cash beyond the down payment and closing costs. Lender's reserves requirement for the gap period kills the file. Solution: identify reserve requirements at pre-approval and ensure the borrower has documented liquid assets sufficient to meet them.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>7. Post-closing paystub never delivered.</strong></Para>
        <Para>
          On the FHA and conventional Option 1 cases that require post-closing follow-up, the borrower goes silent, the paystub never arrives, and the lender can't deliver the loan to the secondary market. This creates serious downstream problems. Solution: borrower commits up front to providing the paystub when it's received and the lender sets up reminders.
        </Para>

        <Para>
          In my experience, well-prepared expected income files close at high rates. The failures are almost always about preparation gaps that could have been caught at pre-approval, not about the borrower not actually qualifying.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>I just signed an offer letter for a new job in another state. Can I get a mortgage on a house there before I start?</H3>
        <Para>
          Yes, in most cases. This is exactly what expected income rules are designed for. The specific path depends on when you start the new job relative to closing and which loan program you're using. If you're starting within 60 days of closing, government loans (FHA, VA, USDA) work cleanly. If you're starting up to 90 days after closing, conventional loans (Fannie or Freddie) may work with the right offer letter and reserves.
        </Para>

        <H3>Can I use my new salary if my offer letter is contingent on background check?</H3>
        <Para>
          Not until the contingency is cleared. The lender needs documentation that all contingencies (background check, drug test, licensing verification, training completion, etc.) are satisfied before they can use the new income. If you're still in the contingency window, ask your new employer for a written confirmation once each contingency clears.
        </Para>

        <H3>My new job pays mostly commission. Can I use expected income?</H3>
        <Para>
          Probably not under conventional loan programs (Fannie or Freddie), which require fixed base salary income only for expected income paths. Government loans (FHA, VA, USDA) have more flexibility, but commission income typically requires a 2-year history before it can be used at all, even with paystubs. Talk to your LO about whether your base salary alone qualifies you for the loan amount you need, putting the commission aside.
        </Para>

        <H3>I'm a doctor finishing residency. My new attending position starts in 4 months. Can I buy a house now?</H3>
        <Para>
          Yes, this is the classic "common professions" exception. Lenders can review your file on a case-by-case basis with senior underwriting management approval, using your fully executed contract, documentation of your residency completion date, and confirmation that all employment contingencies are cleared. Expect to need 3-6 months of reserves.
        </Para>

        <H3>How much in reserves will I need for an expected income loan?</H3>
        <Para>
          Depends on the gap between closing and start date and the loan program. Rough range: 1-2 months PITI for short gaps on government loans, 2-4 months PITI for FNMA/FHLMC offer-letter-only paths, 3-6 months PITI for common professions exceptions with longer gaps. Your LO can calculate the specific requirement for your file.
        </Para>

        <H3>My offer letter says "salary subject to annual review." Is that a contingency?</H3>
        <Para>
          Probably not, in most cases. Routine language about future performance reviews or raises doesn't make the current offer contingent. The contingencies that matter are pre-employment (background, drug test, licensing) or pre-start-date conditions. If you're unsure, ask your LO to review the specific offer letter language.
        </Para>

        <H3>Can I close on a house, then start the new job, without ever providing a paystub?</H3>
        <Para>
          Sometimes, on FNMA Option 2 and FHLMC Option 1 specifically, where the offer letter alone (with reserves) is the basis for qualification and no post-closing paystub follow-up is required. This is the cleanest path because there's no compliance loop after closing. But it requires the offer letter to meet very specific criteria and the borrower to have sufficient reserves. Most other paths require a paystub eventually.
        </Para>

        <H3>What if my job offer falls through after closing?</H3>
        <Para>
          This is the risk that the entire expected income framework is built around. If the job falls through, the borrower still owns the home and still owes the mortgage payment. The lender's protection is the documented reserves, the borrower's other income sources, and (worst case) loss mitigation processes. From a borrower perspective, expected income mortgages are most prudent when the new job is genuinely solid, not speculative.
        </Para>

        <H3>I'm self-employed with new clients lined up. Does expected income apply?</H3>
        <Para>
          No. Expected income rules are specifically for W-2 employment. Self-employed borrowers have a different framework with much stricter documentation requirements. See our <a href="/deep-dives/self-employed-documentation" style={navyLink}>self-employed documentation deep dive</a> for the self-employed playbook.
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page summarizes expected income mortgage rules across the five major agency loan programs as they exist in 2026, organized by borrower scenario rather than by loan program. It is not:
        </Para>
        <Bullets items={[
          "**Legal advice.** Specific situations require specific evaluations by a licensed loan officer.",
          "**A substitute for the agency guidelines themselves.** We've cited the relevant sections so you can drill in if needed.",
          "**A guarantee that any specific lender will approve.** Lender overlays vary, especially on the longer-window scenarios and the common professions exception.",
        ]} />
        <Para>
          If you're navigating an expected income scenario and want to talk through your specific situation, I'm reachable. Bring your offer letter, your start date, and an honest picture of your reserves. We'll figure out what works.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Working through an expected income scenario?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={navyLink}>(615) 656-0737</a> or email <a href="mailto:Nick.Peters@rate.com" aria-label="Email Nick Peters" style={navyLink}>Nick.Peters@rate.com</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your offer letter, your start date, and an honest picture of your reserves. We'll figure out what works.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B3-3.3-03 (Employment Offers or Contracts), updated March 4, 2026; Fannie Mae Selling Guide B3-3.1-04 (Verbal Verification of Employment); Freddie Mac Single-Family Seller/Servicer Guide Section 5303.2; FHA Single Family Housing Policy Handbook 4000.1, Sections II.A.4 and II.A.5 (Effective Income); VA Lender's Handbook (Pamphlet 26-7), Chapter 4 (Credit Underwriting); USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook (HB-1-3555), Chapter 9; author's 12+ years of field experience originating expected income loans for relocating professionals.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
