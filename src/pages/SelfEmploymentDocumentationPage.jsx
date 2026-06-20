import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { SelfEmploymentDocumentationGrid } from "../components/SelfEmploymentDocumentationGrid";
import { PLRequirementsGrid } from "../components/PLRequirementsGrid";

const TITLE = "Self-Employed Mortgage Documentation: What Lenders Actually Want to See | The Mortgage Geek";
const DESCRIPTION = "Self-employed mortgage requirements explained: 2-year rule, tax returns, P&L statements, qualifying income calculations. From a real LO with 12+ years.";
const PATH = "/deep-dives/self-employed-documentation";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-26";
const MODIFIED = "2026-04-26";

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
  const colonIdx = text.indexOf(":");
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

function NumberedList({ items }) {
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: "4px 0 14px 0", counterReset: "ord" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7, padding: "4px 0 4px 30px", position: "relative", counterIncrement: "ord" }}>
          <span style={{ position: "absolute", left: 0, top: 4, color: P.gold, fontWeight: 700, width: 24, textAlign: "right" }}>{i + 1}.</span>
          {renderInline(item)}
        </li>
      ))}
    </ol>
  );
}

function MiniTable({ headers, rows }) {
  return (
    <div style={{ margin: "18px 0 22px", border: `1px solid ${P.creamDark}`, borderRadius: 8, overflow: "hidden", background: P.white }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body, fontSize: 14 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" style={{
                background: P.navy, color: P.cream, padding: "10px 14px",
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                textAlign: i === headers.length - 1 ? "right" : "left",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? P.white : P.cream }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "10px 14px", lineHeight: 1.5,
                  textAlign: ci === row.length - 1 ? "right" : "left",
                  borderTop: ri === 0 ? "none" : `1px solid ${P.creamDark}`,
                  fontWeight: ri === rows.length - 1 ? 700 : 400,
                  color: ri === rows.length - 1 ? P.navy : P.text,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function SelfEmploymentDocumentationPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Self-Employed Mortgage Documentation: What Lenders Actually Want to See",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/mg-mark-cream-sm.svg" alt="" aria-hidden="true" width={16} height={20} style={{ display: "block" }} /></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" />
            <a href="/deep-dives" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
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
            Self-Employed Mortgage Documentation: <em style={{ fontStyle: "italic", color: P.gold }}>What Lenders Actually Want to See</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            If you own 25% or more of a business and you want a mortgage, you're a "self-employed borrower" in the eyes of every major loan program. That triggers a different documentation playbook than W-2 employees: more tax returns, more business filings, sometimes a profit-and-loss statement, and an income calculation that often surprises borrowers who've never been through it.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            This page walks through what lenders need from self-employed borrowers, why they need it, and how qualifying income gets calculated. If you're a self-employed borrower preparing to buy or refinance, a CPA fielding mortgage questions from clients, or an LO trying to get cleaner files from your self-employed pipeline, this is for you.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            Using funds from your business for a down payment, closing costs, or reserves is a separate topic with its own documentation rules. For that side of the conversation, see the <a href="/deep-dives/business-assets" style={LINK_STYLE}>Business Assets Deep Dive</a>.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator with 12+ years of experience writing mortgages for self-employed borrowers. The rules below come from agency guidelines (Fannie Mae, Freddie Mac, FHA, VA, USDA) and my field experience. Your specific tax situation requires a CPA. Your specific loan situation requires a conversation with an LO who actually does self-employed files. This page is the framework. The math on your file is the conversation.
            </p>
          </div>
        </div>

        <H2>First, what counts as "self-employed"?</H2>
        <Para>
          Mortgage rules use a specific definition. <strong style={{ color: P.navy, fontWeight: 600 }}>You're self-employed for mortgage purposes if you own 25% or more of a business, regardless of business structure.</strong> This applies even if:
        </Para>
        <Bullets items={[
          "You also have W-2 income from another employer",
          "The business is a side hustle, not your main income",
          "Your spouse is the primary owner and you own a smaller share",
          "The business is brand-new or established",
          "The business operates at a loss",
        ]} />
        <Para>
          If you own 25%+ of any business entity that files a tax return, you're self-employed for documentation purposes. Below 25% ownership, the lender treats your involvement as an investment (Schedule E income) rather than self-employment, and the documentation requirements are lighter.
        </Para>

        <GeekTip title="Independent contractors (1099 workers) are self-employed">
          <TipBody text="If you receive 1099 income, you're operating as a sole proprietor for tax and mortgage purposes, even if you don't think of yourself as 'having a business.' Your 1099 income reports on Schedule C of your individual tax returns and triggers all the self-employment documentation rules below. Plan accordingly." />
        </GeekTip>

        <H2>The four business structures and what they generate</H2>
        <Para>
          Every self-employed file involves one of four business structures. Each generates different tax filings, which means different documentation requirements. Here's the simplified version.
        </Para>

        <H3>Sole Proprietorship</H3>
        <Para>
          The simplest structure. The business has no separate tax existence; it's just you operating under a business name (or your own name) with a separate Schedule C on your personal tax returns.
        </Para>
        <Bullets items={[
          "**Tax filing:** Schedule C of your personal Form 1040",
          "**Documents you'll need:** Personal tax returns only (no separate business return exists)",
          "**Most common for:** Independent contractors, freelancers, solo consultants, gig workers",
        ]} />

        <H3>S-Corporation</H3>
        <Para>
          A corporation that elects to pass income through to its owners' personal returns rather than paying corporate-level taxes.
        </Para>
        <Bullets items={[
          "**Tax filing:** Form 1120-S for the business + K-1 to each owner",
          "**K-1 income reports on:** Schedule E, Part II of personal tax returns",
          "**Documents you'll need:** Personal tax returns, business tax returns (1120-S), and K-1",
          "**Most common for:** Established small businesses with one or a few owners, real estate professionals, consultants who've grown beyond sole prop",
        ]} />

        <H3>Partnership</H3>
        <Para>
          A business jointly owned by two or more people without corporate election.
        </Para>
        <Bullets items={[
          "**Tax filing:** Form 1065 for the business + K-1 to each partner",
          "**K-1 income reports on:** Schedule E, Part II of personal tax returns",
          "**Documents you'll need:** Personal tax returns, business tax returns (1065), and K-1",
          "**Most common for:** Multi-owner small businesses, professional service firms, family businesses",
        ]} />

        <H3>C-Corporation</H3>
        <Para>
          A traditional corporation that pays its own corporate-level taxes. Income does not pass through to owners' personal returns unless it's distributed as W-2 wages or dividends.
        </Para>
        <Bullets items={[
          "**Tax filing:** Form 1120 for the business (no K-1)",
          "**Owner income reports on:** W-2 (if owner is also an employee) or 1099-DIV (if dividends paid)",
          "**Documents you'll need:** Personal tax returns, business tax returns (1120), and ownership percentage documentation (Schedule G if owned 20%+ by a single entity)",
          "**Most common for:** Larger businesses, businesses planning eventual sale or IPO",
        ]} />

        <H2>Which two tax years are required?</H2>
        <Para>
          Self-employed mortgage qualification standardly requires the <strong style={{ color: P.navy, fontWeight: 600 }}>two most recent tax years</strong> of returns, both individual and business (where applicable). Here's how the calendar works in practice.
        </Para>

        <H3>Before tax day</H3>
        <Para>
          If you're applying for a mortgage <strong style={{ color: P.navy, fontWeight: 600 }}>before April 15</strong> in the current year (and you haven't yet filed for the prior year), the lender will typically use the two years that were most recently completed. For example, applying in March 2026 means using 2024 and 2023 returns.
        </Para>

        <H3>After tax day</H3>
        <Para>
          Once <strong style={{ color: P.navy, fontWeight: 600 }}>April 15</strong> passes, lenders generally require returns through the most recent tax year. For example, applying in May 2026 means using 2025 and 2024 returns. If you haven't filed your most recent year by then, you have a problem unless you've filed a tax extension.
        </Para>

        <H3>If you've filed a tax extension</H3>
        <Para>
          If you've filed an extension on your most recent year (Form 4868 for individual returns, Form 7004 for business returns), the lender can typically use the <strong style={{ color: P.navy, fontWeight: 600 }}>prior two years</strong> instead and accept your extension paperwork as evidence that the most recent year is legitimately deferred. So if you're on extension for 2025, applying in May 2026, the lender uses 2024 and 2023 returns plus your filed extension forms.
        </Para>
        <Para>
          The extension paperwork is non-negotiable: a verbal "I'm on extension" doesn't work. The lender wants the actual stamped or e-filed extension confirmation. Without it, the file stalls until you produce the most recent year's return.
        </Para>

        <GeekTip title="Don't apply for a mortgage in early-to-mid April if you haven't filed">
          <TipBody text="The single worst time to apply for a self-employed mortgage is the first half of April when you haven't yet filed your most recent return and don't have extension paperwork ready. Either file your return before applying, file an extension and bring the documentation, or wait until you've sorted one of the two. Applying in this window with no plan creates avoidable delays." />
        </GeekTip>

        <GeekTip title="If you owe the IRS, tell your LO on day one">
          <TipBody text="The lender will see what you owed on each tax return and verify those taxes were actually paid. If you have an unpaid balance or you're on an IRS installment agreement, your LO needs to know up front. Two reasons. First, the monthly payment from your installment agreement gets added to your DTI, which can change what you qualify for. Second, you'll need to provide the IRS approval letter showing the payment amount and terms, and getting that letter from the IRS often takes 2-4 weeks if you don't already have it. Disclose early so the file gets structured correctly and the documents get requested before they become a closing-week emergency." />
        </GeekTip>

        <H2>The big chart. Documentation by business structure.</H2>
        <Para>
          Five document types, four business structures, one grid. The "Sometimes" entries depend on the loan type and the timing of your application relative to your last tax filing. The next chart breaks down exactly when interim P&amp;Ls are required by loan program.
        </Para>

        <SelfEmploymentDocumentationGrid />

        <H2>The other big chart. P&L requirements by loan program.</H2>
        <Para>
          A profit-and-loss statement (P&amp;L) is a year-to-date snapshot of business income and expenses for the current year, before tax filing. Lenders sometimes require one to confirm the business is still performing in line with the most recent tax return. Each loan type has different rules.
        </Para>

        <PLRequirementsGrid />

        <GeekTip title="An 'audited' P&L means CPA-prepared with formal opinion">
          <TipBody text="An audited P&L is not just a P&L your accountant prepared. It requires a Certified Public Accountant to review the financial statements and issue a formal audit opinion under AICPA standards. Most small businesses have CPA-prepared (compiled or reviewed) P&Ls, not audited ones. If a borrower says 'my P&L is audited,' verify what they actually mean before relying on the higher qualifying income." />
        </GeekTip>

        <H3>When the timing rule matters</H3>
        <Para>
          The P&amp;L requirements key off how long it's been since your last business tax filing. If you file your returns by mid-March each year and apply for a mortgage in April, your most recent return is fresh and most lenders won't ask for an interim P&amp;L. If you apply in November of the same year, your last return is now 9-10 months old and most lenders will want to see how the business has performed since then.
        </Para>
        <Para>
          This is one reason it can be smart to time your mortgage application close to your most recent tax filing if your business income is variable. A fresh return reduces the documentation burden.
        </Para>

        <H2>The 2-year rule. And the 1-year option that's a game changer.</H2>
        <Para>
          The standard rule across all loan types: <strong style={{ color: P.navy, fontWeight: 600 }}>two years of tax returns are required for self-employed borrowers.</strong> Both individual and business returns. Both years analyzed for income trends. This is the rule most borrowers know.
        </Para>
        <Para>
          What most borrowers don't know is that <strong style={{ color: P.navy, fontWeight: 600 }}>AUS (Automated Underwriting System) approval can sometimes reduce that to one year of returns.</strong> For self-employed borrowers with established businesses, this is a genuine game changer.
        </Para>

        <H3>When the 1-year option applies</H3>
        <Para>
          Both Fannie Mae and Freddie Mac allow qualification on <strong style={{ color: P.navy, fontWeight: 600 }}>one year of personal AND business tax returns</strong> if:
        </Para>
        <NumberedList items={[
          "The business has been **established and operating for at least 5 consecutive years**, AND",
          "The applicant has **owned the business for at least 5 consecutive years**, AND",
          "The file receives an **AUS approval** (DU Approve/Eligible or LPA Accept/Eligible) reflecting the 1-year option",
        ]} />
        <Para>
          Both ownership conditions must be met. A new business owned for 5+ years doesn't qualify (the business itself must be established 5+ years). A long-established business that the applicant just bought a year ago doesn't qualify (the applicant must have owned it 5+ years).
        </Para>
        <Para>
          Even when 2 years of returns are available, the lender can elect to analyze just the most recent year if both conditions are met and AUS approves the reduced documentation.
        </Para>

        <GeekTip title="The 1-year option can save weeks of document chasing">
          <TipBody text="If you've owned an established business for 5+ years, ask your LO specifically about the 1-year tax return option before submitting two years of complete returns and supporting documents. AUS approval for the 1-year option means you provide one year of personal returns, one year of business returns, and the corresponding K-1s. That's roughly half the documentation burden of a standard self-employed file. A lot of LOs default to 'two years of everything' without checking whether AUS would approve less. Make sure yours does check." />
        </GeekTip>

        <H3>Business returns can be waived (Conventional, FHA, VA)</H3>
        <Para>
          Beyond the 1-year option, there's a separate acceleration: <strong style={{ color: P.navy, fontWeight: 600 }}>business tax returns can be waived entirely</strong> in specific cases on Conventional, <a href="/deep-dives/fha-manual-underwriting" style={LINK_STYLE}>FHA</a>, and <a href="/deep-dives/va-manual-underwriting" style={LINK_STYLE}>VA</a> loans.
        </Para>
        <Para>For Fannie Mae:</Para>
        <NumberedList items={[
          "Two years of personal tax returns show **earnings increase** for the business in question, AND",
          "Business assets are **not used** to qualify (no down payment from business accounts), AND",
          "The business has been owned and established by the applicant for **at least 5 consecutive years**",
        ]} />
        <Para>For FHA:</Para>
        <NumberedList items={[
          "The file is underwritten by AUS (not manually), AND",
          "Two years of personal tax returns show **earnings increase** for the business, AND",
          "Business assets are **not used** to qualify, AND",
          "The transaction is **not a cash-out refinance**",
        ]} />
        <Para>For VA:</Para>
        <NumberedList items={[
          "The file is underwritten by AUS, AND",
          "Two years of personal tax returns show earnings increase for the business, AND",
          "Business assets are not used to qualify",
        ]} />
        <Para>
          When the business returns waiver applies, the lender qualifies you on the income shown on your personal tax returns alone (Schedule C, Schedule E from K-1s, etc.). This is meaningfully easier to document, especially for S-Corp and Partnership owners who otherwise have to track down two years of business returns plus K-1s.
        </Para>

        <GeekTip title="Stack the 1-year option with the business returns waiver">
          <TipBody text="The two accelerations stack. If you have a 5+ year established business with increasing income and you're not using business funds to qualify, you may be able to provide just one year of personal tax returns plus matching K-1s, with no business returns required. That's the lightest documentation path available for a self-employed borrower on agency loans. Most LOs don't even know to look for it." />
        </GeekTip>

        <H2>How qualifying income actually gets calculated</H2>
        <Para>
          This is the section most borrowers wish someone had explained before they applied. <strong style={{ color: P.navy, fontWeight: 600 }}>Your qualifying income is not your gross revenue. It's also not the net profit on your tax return. It's a calculated number that often surprises people.</strong>
        </Para>

        <H3>The basic concept</H3>
        <Para>
          For mortgage qualifying purposes, lenders take your business income and back out adjustments to arrive at a "stable, recurring" number that represents what you can reasonably expect to earn going forward. The starting point is your tax return, but several adjustments apply.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>For a Sole Proprietor (Schedule C):</strong>
        </Para>
        <Para>Starting point: Net profit (line 31 of Schedule C)</Para>
        <Para>Adjustments typically applied:</Para>
        <Bullets items={[
          "**Add back:** Depreciation (a non-cash expense that reduced your taxable income but didn't actually leave your bank account)",
          "**Add back:** Business use of home expenses (also a non-cash deduction in many cases)",
          "**Add back:** Depletion (similar non-cash expense)",
          "**Subtract:** Meals and entertainment in some cases (FHA specifically does NOT require this deduction; conventional does)",
          "**Subtract:** Any one-time, non-recurring income (lawsuit settlements, sale of business assets, etc.)",
        ]} />
        <Para>
          The result is your "qualifying income" from that business, typically expressed as a monthly figure (annual / 12).
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>For S-Corp and Partnership owners:</strong>
        </Para>
        <Para>
          The calculation is more involved because the income passes through K-1s. The lender analyzes both the K-1 distributions AND the business return (1120-S or 1065) to determine sustainable income.
        </Para>
        <Para>Key adjustments include:</Para>
        <Bullets items={[
          "Add back: Depreciation, depletion, amortization shown on the business return",
          "Add back: Mortgage/notes/bonds payable in less than one year (in some cases)",
          "Subtract: Any non-recurring income shown on the business return",
          "Apply: The borrower's ownership percentage to the adjusted business income (along with K-1 distributions)",
        ]} />
        <Para>
          The actual line-by-line analysis follows worksheets published by Fannie Mae, Freddie Mac, FHA, VA, and USDA, each of which is slightly different. A loan officer who specializes in self-employed files runs this calculation as part of <a href="/prequal" style={LINK_STYLE}>pre-approval</a>. A loan officer who doesn't will often just "use the K-1" and produce an inaccurate number.
        </Para>

        <H3>A worked example</H3>
        <Para>
          Imagine you're a sole proprietor consultant. Your Schedule C shows:
        </Para>

        <MiniTable
          headers={["Line Item", "Amount"]}
          rows={[
            ["Gross receipts", "$200,000"],
            ["Total expenses", "$150,000"],
            ["Net profit (line 31)", "$50,000"],
          ]}
        />

        <Para>
          Your bank account suggests you "made" something close to $200k in revenue. Your tax return says you earned $50k. <strong style={{ color: P.navy, fontWeight: 600 }}>Your qualifying income is somewhere in between, depending on adjustments.</strong> If $15k of those expenses are depreciation, your qualifying income for mortgage purposes is roughly $65k annual / $5,417 monthly. That's the number the underwriter uses to calculate your <a href="/calculator" style={LINK_STYLE}>DTI</a>.
        </Para>
        <Para>
          This is why a borrower who "made $200k last year" might qualify for far less house than they expected. The qualifying income calculation looks past gross revenue to a stable, sustainable, post-adjustment number. That number is almost always smaller than what the borrower thinks they "earned."
        </Para>

        <GeekTip title="Run the math BEFORE you go house shopping">
          <TipBody text="If you're self-employed and don't know your qualifying income before you start looking at houses, you're setting yourself up for disappointment. Have your LO run the calculation as part of pre-approval, using your most recent two years of complete tax returns. The number that comes out is your real budget. House shop against that number, not against your bank deposits." />
        </GeekTip>

        <H2>The declining income problem</H2>
        <Para>
          Self-employed income gets evaluated for trend, not just level. If your business income is increasing year over year, the lender uses the <strong style={{ color: P.navy, fontWeight: 600 }}>average</strong> of the two years (or the most recent year alone in some cases). If your business income is decreasing year over year, you have a problem.
        </Para>

        <H3>How declining income is treated</H3>
        <Para>
          If your most recent year is lower than the prior year, the lender generally uses the <strong style={{ color: P.navy, fontWeight: 600 }}>lower of the two years</strong> for qualifying. If the decline is significant, it can disqualify the file entirely.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>FHA's specific rule:</strong> A business with a 20% or greater decline in earnings between the two most recent years requires the file to be <strong style={{ color: P.navy, fontWeight: 600 }}>downgraded to a manual underwrite</strong>. (Exception: if the self-employment income isn't listed on the URLA and is considered a secondary source of income, the downgrade isn't required, but losses must still be deducted from repayment income.)
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Conventional rule:</strong> No specific percentage trigger, but underwriters scrutinize declining income heavily. Files with significant declines may be denied even on AUS-approved cases.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>VA rule:</strong> Similar to conventional. Declining income requires underwriter judgment.
        </Para>

        <H3>How to navigate declining income</H3>
        <Para>
          If your business is genuinely declining, there's no documentation trick that fixes it. The underwriter is right to be skeptical of using a declining number as "stable, recurring" income.
        </Para>
        <Para>
          If your business is declining due to one-time circumstances (a major client loss now replaced, a temporary supply disruption, a one-year investment in growth), document that clearly. A letter of explanation, supported by current-year P&amp;L showing recovery, sometimes lets the underwriter use a more representative number.
        </Para>
        <Para>
          If you have a good reason to expect future income to be higher than recent history (signed long-term contracts, completed business expansion, etc.), prepare a written explanation backed by documentation. This won't always work but it's worth attempting.
        </Para>

        <GeekTip title="COVID-era declines need extra explanation">
          <TipBody text="Many self-employed borrowers had declining income in 2020 or 2021 due to COVID disruptions. By 2026, those declines are well in the rearview mirror, but underwriters still occasionally see them in 2-year tax return analysis if a borrower files late. If your 2020 or 2021 looks weak, attach a brief letter of explanation referencing the pandemic disruption and showing that subsequent years have recovered to or beyond pre-pandemic levels." />
        </GeekTip>

        <H2>How losses interact with primary income</H2>
        <Para>
          This is the rule that catches a lot of borrowers off guard. <strong style={{ color: P.navy, fontWeight: 600 }}>What happens if your business operates at a loss?</strong>
        </Para>

        <H3>Conventional loans (Fannie Mae and Freddie Mac)</H3>
        <Para>
          If you have a primary source of income other than self-employment (a W-2 job, for example), and the self-employment is a <strong style={{ color: P.navy, fontWeight: 600 }}>secondary</strong> source, <strong style={{ color: P.navy, fontWeight: 600 }}>losses from the self-employment do not have to be deducted from your repayment income.</strong>
        </Para>
        <Para>
          This is meaningful. If you have a $120k W-2 salary and a side business that lost $20k last year, conventional loans let you qualify on the $120k W-2 alone, ignoring the side-business loss.
        </Para>
        <Para>
          The exception: if self-employment is your <strong style={{ color: P.navy, fontWeight: 600 }}>primary</strong> income source, losses must be considered. The above rule only applies when self-employment is a side gig.
        </Para>

        <H3>Government loans (FHA, VA, USDA)</H3>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Losses from self-employment must be considered on all government loan types.</strong> No exception for primary versus secondary income.
        </Para>
        <Para>
          If you have a $120k W-2 salary and a side business that lost $20k, an FHA loan will subtract that $20k loss from your qualifying income, dropping you from $120k to $100k. Same on VA and USDA.
        </Para>
        <Para>
          This matters for borrowers who have side businesses that show losses (often deliberately, for tax purposes). Those tax-strategy losses don't hurt you on conventional loans where the primary-income rule applies. They DO hurt you on government loans.
        </Para>

        <H3>When does this matter in practice?</H3>
        <Para>This rule mostly affects:</Para>
        <Bullets items={[
          "W-2 employees with rental properties showing tax losses (rental losses are reported on Schedule E and treated as self-employment for this rule)",
          "W-2 employees with side consulting or freelance work that shows losses",
          "Spouses where one has W-2 income and the other has a small business with paper losses",
        ]} />
        <Para>
          If you fit any of these profiles and you're choosing between conventional and FHA, the conventional treatment of secondary self-employment losses can be meaningfully better.
        </Para>

        <H2>Why self-employed files fail. The patterns I see.</H2>
        <Para>
          In 12+ years writing self-employed mortgages, the failure modes are remarkably consistent. Here's what kills SE files most often.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>1. The qualifying income surprise.</strong> A borrower thinks they make $200k. Their qualifying income is $80k. They've already gone under contract on a $700k house. Now they can't qualify. This is preventable with up-front math, but only if the LO actually runs the calculation before pre-approval. Many don't.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>2. Missing or incomplete tax returns.</strong> Self-employed borrowers more often have missing schedules, wrong years, returns prepared by different CPAs with different formats, or paper returns that need re-keying. The cleanup eats time and creates conditions late in the file. Solution: gather complete tax returns (all schedules, K-1s, and supporting forms) before applying.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>3. Underdocumented business returns.</strong> Borrowers sometimes don't have business returns ready, either because they file extensions and haven't completed them, or because their CPA hasn't given them final copies. If the file requires business returns and they're not ready, the loan stops until they are.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>4. Declining income that wasn't disclosed up front.</strong> A borrower presents the most recent year as their "good year" without mentioning that it followed a worse year. The lender pulls the prior year's transcripts via IRS 4506-T and sees the decline. Now the underwriter feels misled, scrutinizes everything, and the file becomes a slog.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>5. Mixing personal and business funds.</strong> A borrower's bank statements show frequent transfers between personal and business accounts, large unexplained deposits, or commingled funds. Underwriters dig into this carefully on self-employed files. Solution: keep personal and business banking truly separate, document any transfers cleanly, and prepare to explain unusual deposits.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>6. The "I'll just use my partner's W-2" gambit.</strong> A self-employed borrower with messy returns sometimes wants to remove themselves from the loan and use only their W-2-employed spouse's income. This works ONLY if the W-2 income alone qualifies for the entire loan amount. If you need to combine incomes, both borrowers' incomes get scrutinized.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>7. Unpaid taxes or undisclosed IRS payment plans.</strong> This is one of the most preventable file-killers and it catches borrowers off guard every year. The lender will see what you owed in taxes on each return. They'll then verify those taxes were actually paid. If you owed and didn't pay, that's a problem. If you're on an IRS installment agreement (a payment plan), the monthly payment must be <strong style={{ color: P.navy, fontWeight: 600 }}>added to your DTI</strong>, and you'll need to provide the IRS approval letter showing the payment amount and terms. Getting that letter from the IRS can take weeks if you don't already have it on hand, so disclose any payment plan up front. A borrower who hides a payment plan and gets caught on tax transcripts ends up with a delayed file AND an underwriter who scrutinizes everything else.
        </Para>
        <Para>
          In my experience, well-prepared self-employed borrowers close at roughly the same rate as W-2 borrowers. The mythology that "self-employed people can't get mortgages" is mostly about borrowers who showed up unprepared, not about borrowers who don't qualify.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>Do I have to provide my business tax returns?</H3>
        <Para>
          In most cases, yes. Business returns are standard documentation for S-Corp, Partnership, and C-Corp owners. Sole proprietors don't have business returns (income is on Schedule C of personal returns). Business returns can be waived in specific cases on Conventional, FHA, and VA loans if you've owned an established business for 5+ years, your income is increasing, and business funds aren't being used to qualify.
        </Para>

        <H3>Can I qualify with just one year of tax returns?</H3>
        <Para>
          Possibly. Both Fannie Mae and Freddie Mac allow one-year tax return analysis if your business has been established for at least 5 consecutive years AND owned by you for at least 5 consecutive years. FHA, VA, and USDA generally require two years.
        </Para>

        <H3>What if I just started my business?</H3>
        <Para>
          If your business is less than 2 years old, you generally cannot qualify on self-employment income for any agency loan program. Some lenders will count business income after 12 months of operation if there's strong supporting documentation (prior similar work in the same field, signed contracts, etc.), but this is the exception, not the rule. If your business is brand-new, plan to use other income (W-2 from another job, spouse's income, etc.) until you have 2 years of self-employment history.
        </Para>

        <H3>Will my lender pull my tax transcripts directly from the IRS?</H3>
        <Para>
          Yes. Lenders use IRS Form 4506-T (or 4506-C, the newer version) to authorize pulling your tax transcripts directly from the IRS. This is standard on every loan, but it matters more on self-employed files because lenders verify that the returns you provided match what was actually filed. If the transcripts come back different from what you submitted, expect questions.
        </Para>

        <H3>I owe the IRS money and I'm on a payment plan. Can I still get a mortgage?</H3>
        <Para>
          Yes, in most cases, but the payment plan affects your qualifying. The monthly payment from your IRS installment agreement is treated as a recurring debt and gets added to your DTI calculation, just like a car loan or credit card minimum. You'll need to provide the IRS approval letter that shows the agreed monthly payment and remaining balance. If you don't have that letter handy, request it from the IRS as soon as possible (it can take 2-4 weeks to obtain). Tax liens that have been filed against you create more serious issues and may need to be paid off or formally subordinated before closing.
        </Para>

        <H3>My business is an LLC. What does that mean for documentation?</H3>
        <Para>
          LLC is a legal structure, not a tax structure. An LLC can be taxed as a sole proprietorship (single-member LLCs by default), an S-Corporation (with election), a partnership (multi-member LLCs by default), or a C-Corporation (with election). Documentation requirements depend on which tax structure your LLC uses, not on the LLC label itself. Check your business tax returns to see which form your LLC files.
        </Para>

        <H3>I had a great year last year and a mediocre year the year before. What gets used?</H3>
        <Para>
          Generally the average of the two years, unless the most recent year was significantly higher and represents a sustainable trend. For increasing income, lenders sometimes use just the most recent year. The average is more common when there's modest growth. If the most recent year was an anomaly (one-time contract, unusual project), expect the lender to question whether the income is sustainable.
        </Para>

        <H3>Can I deduct everything possible on my tax return AND qualify for the mortgage I want?</H3>
        <Para>
          This is the eternal self-employed dilemma. Aggressive tax deductions reduce your taxable income, which reduces your qualifying income. Conservative tax deductions leave more income on the return, which helps qualifying but means a larger tax bill. There's no free lunch. Work with both your CPA and your LO well in advance of any planned mortgage application to find the right balance. If you've already filed aggressively for the past two years and now want a mortgage, your options are limited until your future returns reflect higher qualifying income.
        </Para>

        <H3>Are bank statement loans a good alternative for self-employed borrowers?</H3>
        <Para>
          Bank statement loans are non-QM products that qualify borrowers using deposits to bank accounts rather than tax returns. They exist specifically for self-employed borrowers whose tax returns understate their actual income. The trade-off: higher rates, larger down payments, fewer loan options, and not eligible for sale to Fannie Mae or Freddie Mac. They're a legitimate option for the right borrower but they're not "as good as" agency loans. If you can qualify for an agency loan, you almost always should.
        </Para>

        <H3>My business pays a vehicle loan that's in my personal name. Does it count against my DTI?</H3>
        <Para>
          Possibly not. Fannie Mae specifically allows the payment to be excluded from your DTI if you can show 12 months of canceled company checks proving the business has been making the payments AND the cash flow analysis on the business reflects the payment as a business expense. The same general logic applies on the other agencies, with their respective documentation rules. For the full agency-by-agency breakdown, see the <a href="/deep-dives/debts-paid-by-others" style={LINK_STYLE}>Debts Paid by Others Deep Dive</a>.
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page summarizes self-employed mortgage documentation requirements as they exist in 2026, organized to help borrowers prepare for an application. It is not:
        </Para>
        <Bullets items={[
          "**Tax advice.** How you structure your business and file your returns is a CPA conversation. We're describing how mortgage lenders interpret what you file, not how you should file.",
          "**A substitute for a real income calculation.** The math on your specific file requires reviewing your actual returns. The frameworks here describe how lenders think; the numbers on your file come from the analysis itself.",
          "**Legal advice.** Agency rules change. Investor overlays vary. Verify current rules with a licensed loan officer before making decisions.",
        ]} />
        <Para>
          If you're a self-employed borrower preparing for a mortgage and want to talk through your specific situation, I'm reachable at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={LINK_STYLE}>(615) 656-0737</a> or <a href="mailto:nick@mortgagegeek.ai" aria-label="Email Nick Peters at nick@mortgagegeek.ai" style={LINK_STYLE}>nick@mortgagegeek.ai</a>. Bring your last two years of complete tax returns (all schedules), an idea of your timeline, and an honest answer to "do you understand what your qualifying income is going to look like?" We'll work it out from there.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Self-employed and ready to talk numbers?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:nick@mortgagegeek.ai" aria-label="Email Nick Peters at nick@mortgagegeek.ai" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>nick@mortgagegeek.ai</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your last two years of complete tax returns and we'll run the qualifying income math before you go house shopping.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B3-3.2 (Self-Employment Income); Fannie Mae Selling Guide B3-3.4 (Profit and Loss Analysis); Freddie Mac Single-Family Seller/Servicer Guide 5304.1 (Self-Employed Income); FHA Single Family Housing Policy Handbook 4000.1, Section II.A.4 (Effective Income); VA Lender's Handbook (Pamphlet 26-7), Chapter 4 (Credit Underwriting); USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook 3555-1, Chapter 9; IRS Schedule C, Form 1120-S, Form 1065, Form 1120, K-1 instructions; author's 12+ years of field experience originating loans for self-employed borrowers.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
