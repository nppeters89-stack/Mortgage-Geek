import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { DeepDiveFooter } from "../components/DeepDiveFooter";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { BusinessAssetDocsGrid } from "../components/BusinessAssetDocsGrid";

const TITLE = "Business Assets for Down Payment: How to Use Money From Your Company to Buy a Home | The Mortgage Geek";
const DESCRIPTION = "Using business funds for a down payment? Lenders need to see that the withdrawal won't hurt the business. Cash flow analysis, CPA letters, agency-specific rules.";
const PATH = "/deep-dives/business-assets";
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

const LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function BusinessAssetsPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Business Assets for Down Payment: How to Use Money From Your Company to Buy a Home",
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
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
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
            Business Assets for Down Payment: <em style={{ fontStyle: "italic", color: P.gold }}>How to Use Money From Your Company to Buy a Home</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            You own the business. The money in the business account is yours. But when you go to use it for a down payment on a house, the lender starts asking questions about your business, not just your bank account. Why?
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            Because mortgage rules treat business funds differently than personal funds. A business needs working capital to keep operating. If you pull a large chunk of cash out of your business to buy a house, and the business is also the source of the income you used to qualify for the loan, the lender has to verify that the withdrawal won't damage the very source of your income. That's the entire framework in one sentence.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            This page walks through how the cash flow analysis works, what documentation lenders need, when a CPA letter helps, and how the rules vary by loan program. If you're a self-employed borrower planning to use business funds for a down payment or reserves, this is for you.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page is the natural companion to our <a href="/deep-dives/self-employed-documentation" style={LINK_STYLE}>Self-Employment Documentation Deep Dive</a>, which covers how your business income is calculated. Together they answer the two questions self-employed borrowers face: what income can I use, and what money can I use?
          </p>
        </header>

        <div style={{ background: "rgba(184, 134, 11, 0.06)", border: `1px solid rgba(184, 134, 11, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator with 12+ years of experience writing mortgages for self-employed borrowers. The rules below come from agency guidelines (Fannie Mae Selling Guide B3-3.5-01 and B3-4.2-02, Freddie Mac Single-Family Seller/Servicer Guide, HUD 4000.1, VA Pamphlet 26-7, USDA HB-1-3555) and field experience. Your specific file is evaluated by your lender's underwriter against agency guidelines plus their own overlays. Lenders vary on this topic more than most.
            </p>
          </div>
        </div>

        <H2>First, what counts as a "business asset"?</H2>
        <Para>
          A <strong style={{ color: P.navy, fontWeight: 600 }}>business asset</strong> is any account or holding owned by a business entity rather than the borrower personally. The most common forms:
        </Para>
        <Bullets items={[
          "**Business checking and savings accounts.** Money held in the business's name, even if you have full signing authority.",
          "**Business money market accounts.** Same logic.",
          "**Business investment accounts.** Brokerage or other investment accounts titled in the business's name.",
          "**Funds in commingled accounts.** If you operate as a sole proprietor and don't strictly separate personal and business funds, the lender may still treat funds you identify as business-related under business asset rules.",
        ]} />
        <Para>Sources that are NOT business assets (and are treated as personal assets instead):</Para>
        <Bullets items={[
          "Your personal checking and savings, even if much of the money came from your business as wages or distributions",
          "Retirement accounts (IRAs, 401(k)s) titled to you personally, even if funded by business contributions",
          "Personal investment accounts",
        ]} />
        <Para>
          The distinction matters because business assets trigger an additional layer of scrutiny that personal assets don't.
        </Para>

        <H2>The big rule. The "won't hurt the business" test.</H2>
        <Para>
          The core rule across every major loan program is the same:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>If you're using income from your business to qualify for the mortgage AND you want to use funds from that same business for the down payment, closing costs, or reserves, the lender must verify that the withdrawal won't damage the business.</strong>
        </Para>
        <Para>
          The logic: the business is the source of the income you used to qualify for the loan. If pulling funds out hurts the business, your future income is at risk, and so is the lender's loan. The lender's protection is to confirm in advance that the withdrawal is sustainable.
        </Para>
        <Para>
          If you're NOT using business income to qualify (you have W-2 income from another employer, your spouse is the primary borrower, etc.), this analysis isn't required. You can pull funds from a business account without the impact test, although the funds still need to be sourced and documented like any other asset.
        </Para>

        <GeekTip title="This is exactly why some self-employed borrowers structure files differently">
          <TipBody text="If you have a W-2 spouse who can qualify for the loan alone, putting only the W-2 borrower on the loan can sidestep the entire business asset analysis. The business funds still need to be documented as a sourced asset, but the cash flow analysis isn't required because business income isn't being used to qualify. This isn't right for every situation (it changes how reserves and ratios are calculated), but it's worth asking your LO whether structuring the loan with only one borrower changes the documentation burden." />
        </GeekTip>

        <H2>How lenders actually run the test</H2>
        <Para>
          The cash flow analysis the lender performs to verify "won't hurt the business" is more art than formula. Underwriters look at three signals.
        </Para>

        <H3>Bank statement review</H3>
        <Para>
          The starting point is two to three months of recent business bank statements. The underwriter reads them looking for patterns:
        </Para>
        <Bullets items={[
          "**Incoming deposits.** Are they consistent with the gross receipts you reported on your tax returns? Erratic deposit patterns get scrutinized.",
          "**Outgoing expenses.** Rent, payroll, vendor payments, recurring expenses. Are operating costs being met?",
          "**Account balance trends.** Is the account growing, stable, or declining? A declining trend creates concern about removing additional funds.",
          "**The math.** Can the business absorb the requested withdrawal and still maintain operations? An underwriter looks at the typical month-end balance, the average monthly outflow, and asks whether the proposed withdrawal would leave the business with insufficient working capital.",
        ]} />
        <Para>
          The underwriter's conclusion goes in the loan file as written notes documenting why the withdrawal is or isn't sustainable.
        </Para>

        <H3>The agency-specific variations</H3>
        <Para>
          Each agency has slightly different documentation requirements:
        </Para>

        <BusinessAssetDocsGrid />

        <Para>
          The Freddie Mac variation is the most distinct: their standard path is either two months of statements plus a signed YTD P&amp;L, or three months of statements with no P&amp;L required. Fannie's path is two months of statements with a balance sheet as a fallback. For broader documentation context on each loan program, see the deep dives on <a href="/deep-dives/fha-manual-underwriting" style={LINK_STYLE}>FHA</a>, <a href="/deep-dives/va-manual-underwriting" style={LINK_STYLE}>VA</a>, and <a href="/deep-dives/usda-manual-underwriting" style={LINK_STYLE}>USDA</a> manual underwriting.
        </Para>

        <H3>The CPA letter alternative</H3>
        <Para>
          When two months of bank statements aren't enough to determine the impact (because the file is at an unusual point in the business's seasonal cycle, because the borrower's accounts are commingled, or because the bank statements show patterns that need professional interpretation), a <strong style={{ color: P.navy, fontWeight: 600 }}>letter from the borrower's CPA</strong> assessing the impact of the withdrawal is an acceptable alternative across all loan programs.
        </Para>
        <Para>The CPA letter must:</Para>
        <Bullets items={[
          "Come from the same CPA who prepared the borrower's tax returns (or document that the borrower has changed accountants)",
          "Specifically address the impact the withdrawal will have on the business",
          "Be on CPA letterhead and signed",
          "Be dated reasonably close to the application",
        ]} />
        <Para>What the CPA letter should NOT say:</Para>
        <Bullets items={[
          "Generic \"the business is healthy\" language without specifically addressing the proposed withdrawal",
          "Speculation about future business performance",
          "Statements outside the CPA's professional knowledge of the business",
        ]} />

        <GeekTip title="The CPA letter saves files">
          <TipBody text="When bank statements look complicated or seasonal, a clean CPA letter often clears the file faster than three rounds of underwriter follow-up questions. If your accountant is responsive and knows your business well, ask them up front for a brief letter assessing the impact of the planned withdrawal. The cost is usually $50-300 depending on the CPA. The time it saves on the file is often worth it." />
        </GeekTip>

        <H2>The large deposits rule</H2>
        <Para>
          Beyond the cash flow analysis, lenders also scrutinize <strong style={{ color: P.navy, fontWeight: 600 }}>large deposits</strong> in the business bank statements. The rule across all loan programs:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Cumulative monthly deposits should not exceed the gross monthly receipts generated by the business.</strong>
        </Para>
        <Para>
          If your tax returns show $240,000 in annual gross receipts ($20,000/month), the underwriter expects to see roughly $20,000/month in deposits. If a single bank statement shows $35,000 in deposits in one month, the deposit pattern is "inconsistent with reported business receipts" and triggers additional documentation.
        </Para>

        <H3>When the rule kicks in</H3>
        <Para>The large deposits rule kicks in when:</Para>
        <Bullets items={[
          "A single deposit exceeds typical monthly cash flow",
          "Cumulative monthly deposits across one statement exceed expected monthly receipts",
          "Deposit patterns are inconsistent across the bank statements provided",
        ]} />

        <H3>What additional documentation looks like</H3>
        <Para>When a deposit looks atypical, the lender may request:</Para>
        <Bullets items={[
          "**Source documentation.** Invoices, contracts, or settlement statements showing where the deposit came from",
          "**Letter of explanation from the borrower** describing the deposit and confirming it's business-related",
          "**Supplemental bank records** if needed to establish context",
        ]} />
        <Para>
          The underwriter is looking for evidence that the deposit isn't undisclosed personal funds being parked in the business account, an undisclosed loan to the business, or other concerning patterns.
        </Para>

        <H3>When the rule doesn't matter</H3>
        <Para>
          If the cumulative monthly deposits in your business bank statements are roughly consistent with the gross receipts on your tax returns, the large deposits rule generates no extra work. Most files clear this without any specific documentation.
        </Para>

        <H2>How much can you actually use?</H2>
        <Para>
          There's no specific dollar cap on business assets used for a mortgage. The cap is functional: how much can come out of the business without harming it?
        </Para>
        <Para>
          In practice, lenders typically get comfortable with withdrawals up to roughly the amount of cash the business demonstrably maintains as a working balance. If the account holds an average of $80,000 throughout the bank statements provided and operating expenses run $20,000/month, a $30,000 withdrawal probably reads as safe (leaves $50,000, more than two months of operating cushion). A $70,000 withdrawal probably reads as concerning (leaves only half a month of cushion).
        </Para>
        <Para>
          The rule of thumb most experienced underwriters use: <strong style={{ color: P.navy, fontWeight: 600 }}>the business should retain at least 1-2 months of operating expenses as working capital after the withdrawal.</strong> If the math works at that threshold, the withdrawal usually clears.
        </Para>

        <H3>When the math doesn't work</H3>
        <Para>If the requested withdrawal would leave the business with insufficient working capital, options:</Para>
        <Bullets items={[
          "**Reduce the withdrawal amount.** Use part business funds, part personal funds (if available).",
          "**Time the closing differently.** Wait for the business to accumulate more cash before pulling for the down payment.",
          "**Document additional reserves available to the business.** A line of credit, a recently completed receivable that will deposit before closing, etc.",
          "**Get a CPA letter explicitly addressing why the withdrawal is sustainable** even though the immediate balance impact looks aggressive.",
        ]} />

        <H2>Why business asset files fail. The patterns I see.</H2>
        <Para>
          Like every other component of self-employed mortgage files, business assets have predictable failure modes:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>1. Surprise on the cash flow analysis.</strong> Borrower assumes business funds are "their money" and the lender will treat them like personal funds. Lender comes back with a list of conditions. Borrower is frustrated and the file is delayed. Solution: discuss business asset use at <a href="/prequal" style={LINK_STYLE}>pre-approval</a>, not at conditions.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>2. Bank statements that contradict the tax returns.</strong> The tax returns show $200k gross receipts, but the bank statements show monthly deposits averaging $35k (implying $420k annual). Either the tax returns understate revenue or the bank statements include non-business funds. Either way, the file gets scrutinized hard. Solution: keep personal and business banking truly separate, and make sure your business deposits roughly match the receipts you report on your tax returns.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>3. Recent large withdrawals from the business account.</strong> Business statements show a $40,000 withdrawal six weeks before application that hasn't been accounted for. Underwriter wants to know what it was for. Was it the borrower already moving funds in anticipation of the loan? Was it an undisclosed business expense? Solution: be ready to explain any large outflow in the months before application.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>4. The CPA isn't responsive.</strong> Bank statements aren't quite enough, the underwriter requests a CPA letter, and the borrower's CPA is on vacation, between clients, or just unresponsive. Days turn into weeks. Solution: give your CPA a heads-up at the start of the loan process that a letter may be needed.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>5. Commingled accounts.</strong> Borrower operates as a sole proprietor with one bank account that mixes personal and business deposits. Underwriter can't cleanly separate business income from personal income, and can't run a clean cash flow analysis. Solution: separate accounts going forward. For the current file, expect more documentation and a slower process.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>6. The "I'll just move it to my personal account first" gambit.</strong> Some borrowers think they can avoid the business asset rules by moving money from the business account to their personal account a few days before applying for the loan. This doesn't work. The lender will request the source of funds in the personal account, see the recent transfer from the business, and trigger the same business asset analysis. <strong style={{ color: P.navy, fontWeight: 600 }}>Sourcing rules look back 60 days minimum on most loan types</strong>, often longer. Solution: don't try to disguise the source. Just document it cleanly under the business asset rules.
        </Para>
        <Para>
          In my experience, well-prepared borrowers using business funds for a down payment close at high rates. The failures are almost always about preparation gaps that could have been caught at pre-approval.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>I have $50,000 in my business account. Can I use it for my down payment?</H3>
        <Para>
          Probably yes, with documentation. The lender will look at two to three months of business bank statements (Fannie's standard is two; Freddie's standard is three or "two plus a YTD P&amp;L"). They'll verify that pulling $50,000 out won't leave the business unable to operate. If your business shows consistent cash flow and the withdrawal still leaves a reasonable working balance, the file clears. If the math is tighter, the lender may request additional documentation or a CPA letter.
        </Para>

        <H3>Do I need to use business income to qualify if I'm using business assets?</H3>
        <Para>
          No. The cash flow analysis only triggers when you're using both business income AND business assets. If you have separate qualifying income (W-2 from another job, spouse's income, etc.) and just want to pull funds from a business account, the cash flow analysis isn't required. Standard asset sourcing applies.
        </Para>

        <H3>My CPA charges $300 for a letter. Is it worth it?</H3>
        <Para>
          Almost always yes. If your file is complicated enough that the lender is asking for more than two months of bank statements, a CPA letter often unlocks the file in days where bank statement back-and-forth would take weeks. $300 is cheap compared to a delayed closing, especially if you're rate-locked or contingent on a closing date.
        </Para>

        <H3>What if my business is structured as an S-Corp or LLC and I'm "paying myself" the funds first?</H3>
        <Para>
          The business asset rules apply if the funds are coming from a business account, regardless of how you're characterizing the transfer to yourself. A "shareholder distribution" from your S-Corp to your personal account that happens days before closing still triggers the cash flow analysis. The structure doesn't avoid the rules; the timing doesn't either. Plan for the documentation and proceed normally.
        </Para>

        <H3>How long does it take to season business funds in a personal account?</H3>
        <Para>
          Sourcing rules typically look back 60 days. If business funds were transferred to your personal account more than 60 days before application, the lender may treat them as personal assets without triggering the cash flow analysis. This isn't a guaranteed escape valve. Some lenders look back further on self-employed files, especially when the deposits look unusually large. But it's a real consideration. If you know you'll need business funds for a down payment in the next year, transferring them to a personal account well in advance can simplify the documentation burden later.
        </Para>

        <H3>What if my business operates at a loss but has cash in the bank?</H3>
        <Para>
          This is a tougher case. A business with an operating loss has reduced ability to absorb withdrawals because the cash on hand is not being replenished. The lender will look more closely at whether the withdrawal harms the business given that it's already declining. A CPA letter explaining the cash position and the nature of the loss (one-time event, growth investment that's complete, etc.) can help. Without that context, business assets from a loss-making business face higher scrutiny.
        </Para>

        <H3>Can I use business assets for reserves, not just down payment?</H3>
        <Para>
          Yes. The same rules apply. Lenders count business assets toward reserve requirements when they pass the same cash flow analysis. Note that some loan programs (<a href="/deep-dives/usda-manual-underwriting" style={LINK_STYLE}>USDA</a> specifically) exclude business funds from being counted as compensating factor reserves on manual underwriting files. The rules vary by program and use case.
        </Para>

        <H3>My spouse and I have separate businesses. Do both need to be analyzed?</H3>
        <Para>
          Only the businesses you're pulling funds from. If you're using your S-Corp's bank account for the down payment but not your spouse's separate LLC, only your S-Corp triggers the analysis. Income qualifying is separate: each business that contributes qualifying income needs its own income analysis, regardless of whether assets are involved.
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page summarizes business asset mortgage rules across the major agency loan programs as they exist in 2026. It is not:
        </Para>
        <Bullets items={[
          "**CPA or accounting advice.** The cash flow questions are mortgage qualifying questions, not tax or accounting questions. Your CPA is the right professional for tax-strategy decisions.",
          "**A guarantee of approval.** Even a clean cash flow analysis can't fix a file with other problems.",
          "**A substitute for your LO.** Specific files require specific evaluation.",
        ]} />
        <Para>
          If you're navigating a self-employed mortgage with business funds in play and want to talk through your specific situation, I'm reachable at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={LINK_STYLE}>(615) 656-0737</a> or <a href="mailto:npeters@annie-mac.com" aria-label="Email Nick Peters at npeters@annie-mac.com" style={LINK_STYLE}>npeters@annie-mac.com</a>. Bring your last two months of business bank statements, your most recent business tax return, and an honest answer to "is the business healthy enough that pulling these funds won't matter?" We'll work through the rest.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Using business funds for a down payment?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:npeters@annie-mac.com" aria-label="Email Nick Peters at npeters@annie-mac.com" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>npeters@annie-mac.com</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your last two months of business bank statements and we'll talk through the cash flow analysis before you go under contract.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B3-3.5-01 (Underwriting Factors and Documentation for a Self-Employed Borrower); Fannie Mae Selling Guide B3-4.2-02 (Depository Accounts); Freddie Mac Single-Family Seller/Servicer Guide, Asset documentation sections; FHA Single Family Housing Policy Handbook 4000.1, Sections II.A.4 and II.A.5 (Asset Verification); VA Lender's Handbook (Pamphlet 26-7), Chapter 4; USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook (HB-1-3555), Chapter 9; author's 12+ years of field experience originating self-employed mortgage files using business assets.
        </p>

        <DeepDiveFooter />

      </article>

      <MobileToolbar />
    </main>
  );
}
