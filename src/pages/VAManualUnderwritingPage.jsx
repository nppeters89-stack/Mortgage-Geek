import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { VAResidualIncomeGrid } from "../components/VAResidualIncomeGrid";
import { VADTIThresholdGrid } from "../components/VADTIThresholdGrid";
import { VACompFactorsGrid } from "../components/VACompFactorsGrid";

const TITLE = "VA Manual Underwriting: Residual Income, Compensating Factors, and How to Get Approved | Mortgage Geek";
const DESCRIPTION = "VA manual underwriting explained: residual income tables, compensating factors, DTI thresholds, and how to actually get approved. From a real LO with 12+ years.";
const PATH = "/deep-dives/va-manual-underwriting";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-25";
const MODIFIED = "2026-04-25";

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

const SEASONING_ROWS = [
  { event: "Chapter 7 BK", period: "2 years from discharge" },
  { event: "Chapter 13 BK (active)", period: "12+ months of on-time trustee payments + court approval" },
  { event: "Chapter 13 BK (discharged)", period: "No waiting period if discharged satisfactorily" },
  { event: "Foreclosure", period: "2 years from completion (entitlement may be reduced if VA loan)" },
  { event: "Deed-in-lieu / short sale", period: "2 years from completion" },
  { event: "Extenuating circumstances exception", period: "Possible 1-year reduction (Chapter 7 only) for serious illness, involuntary job loss, death of wage earner" },
];

function SeasoningTable() {
  const captionId = "va-seasoning-caption";
  return (
    <div className="va-season-container" role="region" aria-label="VA bankruptcy and foreclosure seasoning">
      <style>{`
        .va-season-container {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 14px;
          overflow: hidden;
          margin: 22px 0 28px;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .va-season-wrap { padding: 22px 18px; }
        .va-season-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
        }
        .va-season-table caption {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          padding-bottom: 12px;
        }
        .va-season-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 12px 14px;
          text-align: left;
          border: none;
        }
        .va-season-table thead th:first-child { border-top-left-radius: 6px; }
        .va-season-table thead th:last-child { border-top-right-radius: 6px; }
        .va-season-table tbody td {
          padding: 14px;
          color: ${P.text};
          border-bottom: 1px solid ${P.creamDark};
          line-height: 1.55;
          vertical-align: top;
        }
        .va-season-table tbody tr:nth-child(odd) td { background: ${P.cream}; }
        .va-season-table tbody tr:nth-child(even) td { background: ${P.white}; }
        .va-season-table tbody tr:last-child td { border-bottom: none; }
        .va-season-event {
          font-weight: 600;
          color: ${P.goldMuted};
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        .va-season-mobile-stack { display: none; }

        @media (max-width: 600px) {
          .va-season-wrap { padding: 22px 14px; }
          .va-season-table { display: none; }
          .va-season-mobile-stack { display: block; }
          .va-season-card {
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.gold};
            border-radius: 8px;
            background: ${P.white};
            padding: 14px 16px;
            margin-bottom: 10px;
          }
          .va-season-card-event {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            color: ${P.goldMuted};
            margin-bottom: 6px;
            font-family: ${F.body};
          }
          .va-season-card-period {
            display: block;
            font-family: ${F.body};
            font-size: 14px;
            color: ${P.text};
            line-height: 1.6;
          }
          .va-season-event { white-space: normal; }
        }
      `}</style>
      <div className="va-season-wrap">
        <table className="va-season-table" aria-labelledby={captionId}>
          <caption id={captionId}>VA bankruptcy and foreclosure seasoning</caption>
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">VA waiting period</th>
            </tr>
          </thead>
          <tbody>
            {SEASONING_ROWS.map((row) => (
              <tr key={row.event}>
                <td className="va-season-event">{row.event}</td>
                <td>{row.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="va-season-mobile-stack">
          {SEASONING_ROWS.map((row) => (
            <div key={row.event} className="va-season-card">
              <span className="va-season-card-event">{row.event}</span>
              <span className="va-season-card-period">{row.period}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VAManualUnderwritingPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "VA Manual Underwriting: Residual Income, Compensating Factors, and How to Get Approved",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/mg-mark-sm.svg" alt="" aria-hidden="true" width={21} height={26} style={{ display: "block" }} />
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
            VA Manual Underwriting: What It Actually Means and <em style={{ fontStyle: "italic", color: P.gold }}>How to Get Approved</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            If your VA loan got a "Refer/Eligible" from automated underwriting, your file is headed for manual underwriting. That sounds scary. It isn't.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            In 12+ years as a loan originator, I've closed plenty of manually underwritten VA loans. The VA program is genuinely the most forgiving of any major loan program for veterans with credit setbacks, high DTI, or unusual income situations. The handbook is written to encourage lenders to make these loans. But you have to know what the underwriter is actually looking at, and that's where most online content falls short.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page walks through what actually happens on a VA manual underwrite, using the current VA Lender's Handbook (Pamphlet 26-7, Chapter 4) as the source. If you're a veteran trying to make sense of a refer/eligible, a realtor working with a VA buyer, or another LO trying to keep up with the rules, this is for you.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator, not an underwriter. I don't make approval decisions. But I've spent 12+ years working VA files and know how to get them to close. This page explains VA's rules as written in the Lender's Handbook. Your specific loan is evaluated by your lender's underwriter against those rules plus their own overlays. More on overlays below.
            </p>
          </div>
        </div>

        <H2>First things first: what is VA manual underwriting?</H2>
        <Para>
          When you apply for a VA loan, your lender runs your file through an Automated Underwriting System (AUS). For VA loans, that's typically Fannie Mae's <strong style={{ color: P.navy, fontWeight: 600 }}>Desktop Underwriter (DU)</strong> or Freddie Mac's <strong style={{ color: P.navy, fontWeight: 600 }}>Loan Product Advisor (LPA, sometimes called LP)</strong>. The AUS evaluates your credit, income, assets, and the property, then returns one of three decisions:
        </Para>
        <Bullets items={[
          "**Approve/Eligible** (DU) or **Accept/Eligible** (LPA): The AUS can approve your file with reduced documentation. This is what most veterans get.",
          "**Refer/Eligible:** The AUS can't approve the file automatically. The loan is *eligible* for VA financing, but a human underwriter has to evaluate it manually against VA's written guidelines.",
          "**Refer with Caution** or **Ineligible:** Something fundamental disqualifies the file (recent foreclosure within 2 years, unresolved CAIVRS hits, etc.).",
        ]} />
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>A "manual underwrite" is when a human underwriter makes the decision from scratch</strong>, against the explicit rules in VA Pamphlet 26-7, Chapter 4, rather than deferring to the AUS.
        </Para>
        <Para>
          That's the whole concept. No computer approval. A person reviewing your file line by line, looking at the same guidelines anyone can read in the VA handbook.
        </Para>
        <Para>
          Here's something specific to VA that's worth noting up front: <strong style={{ color: P.navy, fontWeight: 600 }}>VA loans are more forgiving than <a href="/deep-dives/fha-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>FHA</a>, conventional, or <a href="/deep-dives/usda-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>USDA</a> when it comes to credit setbacks.</strong> The handbook explicitly tells underwriters to use "good judgment and flexibility" and reminds them that lenders are "encouraged to make VA loans to all qualified veterans who apply." That tone matters. Underwriters are trained to find ways to approve veterans, not deny them. But the file still has to clear the rules.
        </Para>

        <H2>Two paths to a manual: which one are you on?</H2>
        <Para>
          There are two ways your VA file ends up being manually underwritten.
        </Para>

        <H3>Path 1: the AUS returned "Refer/Eligible" from the start</H3>
        <Para>
          The AUS couldn't get comfortable with something in your profile. Common triggers:
        </Para>
        <Bullets items={[
          "DTI over 41% with marginal residual income",
          "Lower credit scores (typically below 620, though VA itself sets no minimum)",
          "Recent derogatory credit the AUS won't accept",
          "Limited credit history or \"thin file\" (few open tradelines)",
          "Self-employment income with year-over-year decline",
          "Income or employment patterns the AUS can't validate automatically",
        ]} />
        <Para>
          In this case, the AUS isn't saying "no." It's saying "we can't automatically say yes, a human needs to look at this." Your LO should be treating it as a manual from day one.
        </Para>
        <Para>
          For self-employed borrowers specifically, the year-over-year income decline trigger is one of the most common reasons VA files end up here. See our <a href="/deep-dives/self-employed-documentation" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>self-employed documentation deep dive</a> for how qualifying income gets calculated and what to bring to the file.
        </Para>

        <H3>Path 2: the AUS returned "Accept/Eligible" but a downgrade is required</H3>
        <Para>
          Less common on VA than on FHA, but it happens. The most common required downgrades:
        </Para>
        <Bullets items={[
          "**Recent mortgage lates.** More than one 30-day late in the most recent 12 months on purchases or rate-and-term refinances. Cash-out refinances allow zero 30-day mortgage lates in the last 12 months.",
          "**Disputed derogatory accounts** appearing on the credit report require the file to be downgraded for review.",
          "**Bankruptcy or foreclosure** within the seasoning window (more on this below).",
          "**Undisclosed debt** discovered during processing.",
          "**Bank statement red flags** the AUS couldn't see (excessive NSFs, BNPL activity, payday loans).",
        ]} />

        <GeekTip title="VA is more lenient on credit than you might think">
          <TipBody text="Unlike FHA, VA has no minimum credit score requirement at the agency level. Lender overlays typically set the floor at 580 to 620, but VA itself doesn't disqualify veterans for low scores. The handbook explicitly says &quot;absence of a credit history is not generally considered an adverse factor&quot; and even allows non-traditional credit (utilities, rent, insurance) to substitute when a borrower has no traditional tradelines. Most other loan programs don't allow that." />
        </GeekTip>

        <H2>The VA underwriter's framework: what they're actually evaluating</H2>
        <Para>
          On a VA manual file, the underwriter is evaluating six categories. Each one has its own rules in VA Pamphlet 26-7, Chapter 4, and they're all evaluated together as "layered risk."
        </Para>
        <Bullets items={[
          "**Acceptable credit.** Your payment history, with extra weight on the most recent 12 months.",
          "**Effective income.** Stability, documentation, and 2-year employment history (with exceptions).",
          "**Residual income.** The most important VA-specific number. More on this in its own section below.",
          "**Debt-to-income ratio.** Generally targeted at 41% or below, but can go higher with strong residual income.",
          "**Compensating factors.** Strengths that offset higher DTI.",
          "**Lender overlays.** Rules your specific lender adds on top of VA's baseline.",
        ]} />
        <Para>
          That last one matters. <strong style={{ color: P.navy, fontWeight: 600 }}>VA's guidelines are the floor, not the ceiling.</strong> Every lender adds overlays, meaning stricter rules than VA requires. One lender might cap DTI at 50% even though VA allows higher with strong residual income; another might require a 620 minimum credit score even though VA sets no minimum.
        </Para>
        <Para>
          This is why a veteran can be denied at one lender and approved at another with the exact same file. <strong style={{ color: P.navy, fontWeight: 600 }}>Many lenders simply don't manually underwrite VA loans at all.</strong> When choosing a lender, ask up front whether they handle manual VA files. If they hesitate, find someone who does it routinely.
        </Para>

        <H2>Acceptable credit: what VA actually requires</H2>
        <Para>
          VA's credit standards are different from FHA's in important ways. There's no rigid count of acceptable 30-day lates, no specific dollar threshold for collections, no minimum credit score. Instead, the handbook asks the underwriter to evaluate the borrower's overall payment pattern, with emphasis on the most recent 12 months.
        </Para>
        <Para>
          That doesn't mean it's a free-for-all. The handbook is specific about what matters.
        </Para>

        <H3>Recent payment history (last 12 months)</H3>
        <Para>
          The handbook requires "a 12-month history of satisfactory payment." Late payments within the past year require a written explanation and supporting documentation if needed. The underwriter looks at:
        </Para>
        <Bullets items={[
          "**Pattern, not isolated incidents.** A single 30-day late from 8 months ago isn't fatal. A pattern of late payments across multiple accounts is.",
          "**Recovery after derogatory events.** If you had a bankruptcy or foreclosure 3 years ago, the underwriter wants to see clean credit since then.",
          "**Mortgage and rent history specifically.** This carries more weight than other accounts.",
        ]} />

        <H3>Mortgage payment history</H3>
        <Para>
          For a VA manual, the underwriter wants to see:
        </Para>
        <Bullets items={[
          "**Zero 30-day mortgage lates in the last 12 months for cash-out refinances.** This is strict.",
          "**No more than one 30-day mortgage late in the last 12 months for purchases and rate-and-term refinances.**",
          "**A clear pattern of on-time payments going back at least 24 months** when possible.",
        ]} />

        <H3>Verification of rent (VOR)</H3>
        <Para>
          Like FHA, VA requires a verification of rent on manual files. This means either:
        </Para>
        <Bullets items={[
          "**12 months of canceled checks** showing rent paid to your landlord, OR",
          "**12 months of online bank statements** showing the payments going out",
        ]} />
        <Para>
          A letter from a private landlord on its own usually isn't enough. What works is a standard Verification of Rent (VOR) form filled out and signed by the landlord, paired with the canceled checks or bank statements showing the actual payments. If you don't have a landlord because you're living rent-free with family or a friend, you'll need a signed rent-free letter from whoever you're living with explaining the arrangement.
        </Para>

        <H3>Collections and charge-offs</H3>
        <Para>
          VA's rules here are notably more borrower-friendly than FHA's:
        </Para>
        <Bullets items={[
          "**VA does not require collections to be paid off.** The underwriter wants an explanation, but no payoff requirement.",
          "**VA does not require charge-offs to be paid off.** Same standard.",
          "**Judgments, federal debts, and tax liens MUST be paid in full or have a documented written repayment agreement.** This is a hard requirement.",
        ]} />

        <GeekTip title="Don't pay off old collections without talking to your LO first">
          <TipBody text="Some borrowers think paying off old collection accounts will help. On a VA loan, it usually doesn't move the needle and can actually hurt. Paying an old collection can re-age it on your credit report, dropping your score temporarily. If the file is approvable with the collection unpaid, leave it alone until after closing." />
        </GeekTip>

        <H3>Disputed accounts</H3>
        <Para>
          If your credit report shows disputed derogatory accounts, the file generally must be manually underwritten and the disputes typically need to be resolved before closing. There's no specific dollar threshold like FHA's $1,000 rule. VA's underwriter has discretion to evaluate each dispute on its merits.
        </Para>

        <H3>Bankruptcy and foreclosure seasoning</H3>
        <Para>
          For a side-by-side comparison of how VA, FHA, conventional, and USDA handle bankruptcy, foreclosure, deed-in-lieu, and short sale wait periods, see our <a href="/deep-dives/derogatory-credit" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>derogatory credit wait periods guide</a>. The VA-specific table:
        </Para>

        <SeasoningTable />

        <Para>
          The Chapter 13 path is unique to VA and FHA. Most loan programs won't touch a borrower in active bankruptcy. VA explicitly allows it with court approval and a documented 12-month payment history to the trustee.
        </Para>

        <H2>Residual income: the VA-specific test that decides most files</H2>
        <Para>
          This is the most important section of this page. <strong style={{ color: P.navy, fontWeight: 600 }}>Residual income is the single most important number in a VA loan file.</strong> No other loan program has anything like it, and most online content treats it as a footnote when it should be the headline.
        </Para>

        <H3>What residual income actually is</H3>
        <Para>
          Residual income is the cash you have left over each month after paying:
        </Para>
        <Bullets items={[
          "Federal, state, and Social Security taxes",
          "Your proposed full mortgage payment (PITI)",
          "All recurring debts (credit cards, auto loans, student loans, child support, etc.)",
          "A maintenance and utility estimate of $0.14 per square foot of the home",
        ]} />
        <Para>
          What's left is your residual income. The VA compares it to a regional minimum based on your family size and the loan amount.
        </Para>

        <H3>The residual income tables</H3>
        <Para>
          VA publishes minimum residual income requirements by region and family size. The numbers vary based on whether your loan amount is under $80,000 or $80,000 and above. Most modern VA loans are above $80,000, so those are the tables that matter.
        </Para>

        <VAResidualIncomeGrid />

        <H3>How family size is counted</H3>
        <Para>
          This is where files get tripped up. Count <strong style={{ color: P.navy, fontWeight: 600 }}>all members of the household</strong>, not just dependents:
        </Para>
        <Bullets items={[
          "The veteran (and spouse if joining the loan)",
          "A non-purchasing spouse who isn't on the loan",
          "All children, including those from prior relationships",
          "Any other individuals dependent on the veteran for support",
        ]} />
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Exception:</strong> A household member can be excluded from family size if they have verified income sufficient to cover their own living expenses (an adult child with a stable job, a non-purchasing spouse with their own income, etc.).
        </Para>

        <H3>The 5% military adjustment</H3>
        <Para>
          If the veteran or spouse is on active duty or retired military AND there's a clear indication they'll continue to use military-base facilities (commissary, exchange, base clinics), the residual income requirement is <strong style={{ color: P.navy, fontWeight: 600 }}>reduced by 5%</strong>. Some VA Regional Loan Centers set a higher percentage for their jurisdiction, but 5% is the floor.
        </Para>
        <Para>
          This adjustment is built into the AUS but often missed on manual files when the LO doesn't flag it.
        </Para>

        <H3>The 20% rule for higher DTI</H3>
        <Para>
          If your DTI is over 41%, <strong style={{ color: P.navy, fontWeight: 600 }}>VA requires residual income to exceed the regional minimum by at least 20%.</strong> This is the most common comp-factor scenario on a VA manual. If you can show 120% of the regional residual minimum, you've cleared the bar.
        </Para>
        <Para>
          Example: A family of four in the South needs $1,003 in residual income at standard DTI. If the file is at 47% DTI, residual income must be at least $1,204 ($1,003 × 1.20).
        </Para>

        <GeekTip title="Run residual income before you make an offer">
          <TipBody text="The borrowers who run into trouble are the ones who never calculated residual income before going under contract. The number depends on the property (utilities calc uses square footage, taxes vary by county, HOA dues count). Run it on every property before submitting an offer. A file that &quot;looks fine&quot; on DTI can fail residual income late in the process when the appraisal updates the utilities calculation or HOA dues come in higher than estimated." />
        </GeekTip>

        <H2>DTI and compensating factors: the framework</H2>
        <Para>
          VA's official guidance on <a href="/calculator" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>DTI</a> is simpler than FHA's. The handbook uses 41% as a soft benchmark, not a hard cap. Above 41%, the underwriter must document either strong residual income (120% of guideline) or sufficient compensating factors to justify the higher ratio.
        </Para>
        <Para>
          There's no official VA-published grid mapping DTI bands to specific comp factor counts. Many lenders have developed internal matrices that do exactly that. These are lender overlays, not VA guidelines. The grid below is consistent with how most experienced VA lenders structure manual files in 2026.
        </Para>

        <H3>General DTI thresholds and comp factor requirements</H3>

        <VADTIThresholdGrid />

        <Para>
          These ranges are guidelines, not absolute rules. A borrower at 47% DTI with a 720 credit score, $30,000 in reserves, and 200% of the regional residual income may be approvable with fewer comp factors than the table suggests. A borrower at 43% DTI with a 580 credit score and weak residuals may need more.
        </Para>

        <H3>VA-recognized compensating factors</H3>
        <Para>
          VA Pamphlet 26-7, Chapter 4, Topic 10d lists compensating factors explicitly. They cannot be used to compensate for unsatisfactory credit. This is the rule that catches some borrowers off guard. Comp factors offset higher DTI or marginal residual income; they don't fix bad credit.
        </Para>
        <Para>
          The factors VA explicitly recognizes (click any factor for the full definition and documentation requirements):
        </Para>

        <VACompFactorsGrid />

        <GeekTip title="Compensating factors cannot fix bad credit">
          <TipBody text="This is in the handbook in plain language: comp factors &quot;cannot be used to compensate for unsatisfactory credit.&quot; If a borrower has recent late payments, a 2-month-old collection, or an unresolved judgment, no amount of reserves or residual income will fix the file. The credit has to clear the bar first. Then comp factors let you stretch DTI or borderline residual income." />
        </GeekTip>

        <H2>Why VA manual underwrites fail: patterns I've seen over 12+ years</H2>
        <Para>
          In my experience, VA manual files fail for the same reason FHA manuals fail: lack of due diligence up front.
        </Para>
        <Para>
          VA underwriting is genuinely more flexible than any other loan program. The rules are written to encourage approval. But that flexibility creates a different failure mode than FHA. Instead of files getting kicked out by hard rules, VA files die quietly when a comp factor turns out to be undocumented, residual income falls short by $50, or a lender overlay disqualifies the file at submission.
        </Para>
        <Para>
          The files that fail almost always fail for the same reasons:
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>1. The wrong lender.</strong></Para>
        <Para>
          A lot of lenders simply don't manually underwrite VA files. They'll take the file, run the AUS, and if it comes back Refer/Eligible, they'll deny it instead of working it manually. If your lender hesitates when you ask "do you do VA manuals?", find another lender.
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>2. The residual income calculation was rough.</strong></Para>
        <Para>
          An LO who eyeballs residual income without running the actual numbers, including the property-specific square footage utility calc, all debts, taxes, and family size, will tell the borrower "you're fine" when the file is actually $80 short. By the time underwriting catches it, the borrower has paid for an appraisal and is under contract.
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>3. Comp factors weren't documented up front.</strong></Para>
        <Para>
          It's not enough that a borrower has 4 months of reserves. Those reserves have to be in the borrower's own accounts, sourced if recently deposited, and verified before submission. Same for "long-term employment." The underwriter wants employer verification, not a verbal statement.
        </Para>
        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>4. Lender overlays caught the file late.</strong></Para>
        <Para>
          This is the worst kind of failure. The file passes VA's baseline, but the lender's overlay caps DTI at 50% or requires a 620 credit score. The fix is knowing the overlay before submission, not finding out at conditions.
        </Para>
        <Para>
          In my experience, at least 80% of the VA manual underwrites I work end up approved. The other 20% almost always fail because of one of the four issues above. Not because the borrower didn't qualify under VA's actual rules, but because the file wasn't structured correctly. Those failures are preventable with up-front diligence. They get dealt with on day one, or they kill the file late.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>I got a Refer/Eligible. Is my VA loan dead?</H3>
        <Para>
          No. Refer/Eligible means a human needs to look at your file. It doesn't mean denied. In my experience, at least 80% of VA Refer/Eligible files end up approved after a manual review, assuming the file is genuinely clean and the lender does manual underwriting routinely.
        </Para>

        <H3>My DTI is over 50%. Can I still get a VA loan?</H3>
        <Para>
          Possibly, but it depends entirely on the lender's overlays and your residual income. VA itself doesn't have a hard DTI cap. Files at 55% or 60% are approvable with strong residual income and multiple comp factors. But many lenders cap their overlays at 50% DTI on manuals. If your file is in that range, you may need a broker who works with multiple wholesale investors. For comparison, FHA allows up to 50%/57% with comp factors, and <a href="/deep-dives/usda-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>USDA</a> caps Total Debt at 44% with no waiver above that on purchase transactions.
        </Para>

        <H3>Does VA require a minimum credit score?</H3>
        <Para>
          No. VA itself sets no minimum credit score. Lender overlays typically require 580 to 620, but the agency doesn't disqualify veterans for low scores. The underwriter is required to look at the credit pattern, not just the score.
        </Para>

        <H3>I'm in an active Chapter 13 bankruptcy. Can I get a VA loan?</H3>
        <Para>
          Yes, if: (1) you've made at least 12 months of on-time trustee payments, (2) the bankruptcy court approves the new mortgage in writing, and (3) you meet the rest of the manual underwriting standards. The trustee payment becomes a recurring debt in your DTI calculation, which usually pushes DTI above 41%, which means residual income and comp factors become especially important.
        </Para>

        <H3>I had a foreclosure 18 months ago. Am I dead?</H3>
        <Para>
          For most lenders, yes. The standard VA waiting period is 2 years from foreclosure completion. Some lenders may allow a 1-year reduction with documented extenuating circumstances (serious illness, involuntary job loss, death of wage earner). Divorce, job relocation, and inability to sell don't qualify as extenuating circumstances under VA rules. If your foreclosure was on a VA loan, your entitlement may be reduced by VA's loss claim, which can affect whether you can buy with $0 down again.
        </Para>

        <H3>My credit score is 580. Will I qualify?</H3>
        <Para>
          Maybe. VA itself sets no minimum credit score, but most lenders set overlays at 580 to 620. If your file passes the manual underwriting standards (clean recent credit, sufficient residual income, documented comp factors), some lenders will approve at 580. Others won't. This is one of those cases where the right lender matters more than the score.
        </Para>

        <H3>Will my interest rate be higher on a manual underwrite?</H3>
        <Para>
          VA itself doesn't require a rate difference for manual underwrites. Your rate depends on your credit score, loan amount, market conditions at lock, and any lender overlays. Some lenders add a small rate adjustment for manual files; many don't.
        </Para>

        <H3>I have a 720 credit score and 50% DTI. Why am I getting a Refer/Eligible?</H3>
        <Para>
          The AUS evaluates the whole file, not just credit score. A high score with high DTI can still trip residual income shortages, employment stability questions, or asset documentation issues. The Refer/Eligible isn't a credit problem. It's the AUS asking for a human to verify that the file holds together at higher DTI. With strong residuals and one or two comp factors, this is often a clean approval on manual.
        </Para>

        <H3>Can I use gift funds on a VA manual underwrite?</H3>
        <Para>
          Yes, but with limits. Gift funds can be used for closing costs and to pay down the loan amount. They cannot be counted as reserves on a manual file. Reserves used as a comp factor must come from the borrower's own funds. Some lenders also restrict gift funds when they're being used to bring DTI under a specific threshold; check overlay rules. For the full breakdown of who can give, what the gift letter has to say, and how the money has to move, see the <a href="/deep-dives/gift-funds" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Gift Funds Deep Dive</a>. If you're sizing up your scenario before talking to a lender, our <a href="/prequal" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>pre-qualification tool</a> gives you a working estimate in under a minute.
        </Para>

        <H2>A final note: what this page is and isn't</H2>
        <Para>
          This page is a summary of what VA Pamphlet 26-7 says about manual underwriting, organized in a way I wish had existed when I was starting out. It is not:
        </Para>
        <Bullets items={[
          "**Legal or financial advice.** Your specific situation requires a specific evaluation.",
          "**A substitute for your LO or underwriter.** Lender overlays vary widely on VA manuals. This page covers VA's baseline only.",
          "**A guarantee of approval.** Even a perfectly structured VA manual file can be denied for reasons not covered here.",
        ]} />
        <Para>
          If you're working through a VA manual right now, yours or a client's, the most useful next step is to have someone who actually does these review your specific file. Not every LO does. The ones who do can read this page, look at your file, and tell you whether you have a path in 15 minutes.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Working through a VA manual?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Real-world VA scenarios are my favorite kind of conversation.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: VA Pamphlet 26-7, Lender's Handbook, Chapter 4 (Credit Underwriting), current as of 2026; VA Pamphlet 26-7, Chapter 4, Topic 10d (Compensating Factors); VA Circular 26-25-7 (Energy Efficient Mortgages); 38 CFR 36.4340 (Underwriting Standards, Residual Income Tables); author's 12+ years of field experience as a VA loan originator.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
