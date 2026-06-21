import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { USDARatioThresholdGrid } from "../components/USDARatioThresholdGrid";
import { USDACompFactorsGrid } from "../components/USDACompFactorsGrid";

const TITLE = "USDA Manual Underwriting: Refer with Caution, Ratio Waivers, and How to Get Approved | Mortgage Geek";
const DESCRIPTION = "USDA manual underwriting explained: GUS Refer, ratio waivers, compensating factors, credit rules. Plain English from a real LO with 12+ years of USDA experience.";
const PATH = "/deep-dives/usda-manual-underwriting";
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

const SEASONING_ROWS = [
  { event: "Chapter 7 BK (discharged)", period: "3 years from discharge (some flexibility for files discharged 12-36 months ago with credit exception)" },
  { event: "Chapter 13 BK (active)", period: "12+ months of on-time trustee payments + court approval" },
  { event: "Chapter 13 BK (discharged within 12 months)", period: "Credit exception required" },
  { event: "Chapter 13 BK (discharged 12+ months ago)", period: "No credit exception required" },
  { event: "Foreclosure", period: "3 years from completion" },
  { event: "Deed-in-lieu / short sale", period: "3 years from completion" },
  { event: "Federal judgments", period: "Must be paid in full or have a written repayment agreement with 3+ timely payments before closing" },
  { event: "Federal tax liens", period: "Must be paid in full, or in a documented payment plan, or formally subordinated" },
];

function SeasoningTable() {
  const captionId = "usda-seasoning-caption";
  return (
    <div className="usda-season-container" role="region" aria-label="USDA bankruptcy and foreclosure seasoning">
      <style>{`
        .usda-season-container {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 14px;
          overflow: hidden;
          margin: 22px 0 28px;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .usda-season-wrap { padding: 22px 18px; }
        .usda-season-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
        }
        .usda-season-table caption {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          padding-bottom: 12px;
        }
        .usda-season-table thead th {
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
        .usda-season-table thead th:first-child { border-top-left-radius: 6px; }
        .usda-season-table thead th:last-child { border-top-right-radius: 6px; }
        .usda-season-table tbody td {
          padding: 14px;
          color: ${P.text};
          border-bottom: 1px solid ${P.creamDark};
          line-height: 1.55;
          vertical-align: top;
        }
        .usda-season-table tbody tr:nth-child(odd) td { background: ${P.cream}; }
        .usda-season-table tbody tr:nth-child(even) td { background: ${P.white}; }
        .usda-season-table tbody tr:last-child td { border-bottom: none; }
        .usda-season-event {
          font-weight: 600;
          color: ${P.goldMuted};
          letter-spacing: 0.4px;
        }

        .usda-season-mobile-stack { display: none; }

        @media (max-width: 600px) {
          .usda-season-wrap { padding: 22px 14px; }
          .usda-season-table { display: none; }
          .usda-season-mobile-stack { display: block; }
          .usda-season-card {
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.gold};
            border-radius: 8px;
            background: ${P.white};
            padding: 14px 16px;
            margin-bottom: 10px;
          }
          .usda-season-card-event {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            color: ${P.goldMuted};
            margin-bottom: 6px;
            font-family: ${F.body};
          }
          .usda-season-card-period {
            display: block;
            font-family: ${F.body};
            font-size: 14px;
            color: ${P.text};
            line-height: 1.6;
          }
        }
      `}</style>
      <div className="usda-season-wrap">
        <table className="usda-season-table" aria-labelledby={captionId}>
          <caption id={captionId}>USDA bankruptcy, foreclosure, and federal debt seasoning</caption>
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">USDA waiting period</th>
            </tr>
          </thead>
          <tbody>
            {SEASONING_ROWS.map((row) => (
              <tr key={row.event}>
                <td className="usda-season-event">{row.event}</td>
                <td>{row.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="usda-season-mobile-stack">
          {SEASONING_ROWS.map((row) => (
            <div key={row.event} className="usda-season-card">
              <span className="usda-season-card-event">{row.event}</span>
              <span className="usda-season-card-period">{row.period}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STANDARD_RATIO_ROWS = [
  { ratio: "PITI (Housing)", standard: "29%", waiver: "34% (purchase only; refinances follow different rules)" },
  { ratio: "Total Debt", standard: "41%", waiver: "44%" },
];

function StandardRatioTable() {
  const captionId = "usda-stdratio-caption";
  return (
    <div className="usda-stdratio-container" role="region" aria-label="USDA standard ratio thresholds">
      <style>{`
        .usda-stdratio-container {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 14px;
          overflow: hidden;
          margin: 22px 0;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .usda-stdratio-wrap { padding: 22px 18px; }
        .usda-stdratio-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
        }
        .usda-stdratio-table caption {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          padding-bottom: 12px;
        }
        .usda-stdratio-table thead th {
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
        .usda-stdratio-table thead th:first-child { border-top-left-radius: 6px; }
        .usda-stdratio-table thead th:last-child { border-top-right-radius: 6px; }
        .usda-stdratio-table tbody td {
          padding: 14px;
          color: ${P.text};
          border-bottom: 1px solid ${P.creamDark};
          line-height: 1.55;
          vertical-align: top;
        }
        .usda-stdratio-table tbody tr:nth-child(odd) td { background: ${P.cream}; }
        .usda-stdratio-table tbody tr:nth-child(even) td { background: ${P.white}; }
        .usda-stdratio-table tbody tr:last-child td { border-bottom: none; }
        .usda-stdratio-name {
          font-weight: 600;
          color: ${P.goldMuted};
          letter-spacing: 0.3px;
        }
        .usda-stdratio-num {
          font-weight: 700;
          color: ${P.navy};
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 600px) {
          .usda-stdratio-wrap { padding: 22px 14px; }
        }
      `}</style>
      <div className="usda-stdratio-wrap">
        <table className="usda-stdratio-table" aria-labelledby={captionId}>
          <caption id={captionId}>USDA standard ratio thresholds and waiver ceilings</caption>
          <thead>
            <tr>
              <th scope="col">Ratio</th>
              <th scope="col">Standard maximum</th>
              <th scope="col">Maximum with waiver</th>
            </tr>
          </thead>
          <tbody>
            {STANDARD_RATIO_ROWS.map((row) => (
              <tr key={row.ratio}>
                <td className="usda-stdratio-name">{row.ratio}</td>
                <td className="usda-stdratio-num">{row.standard}</td>
                <td className="usda-stdratio-num">{row.waiver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function USDAManualUnderwritingPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "USDA Manual Underwriting: Refer with Caution, Ratio Waivers, and How to Get Approved",
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
            USDA Manual Underwriting: What It Means and <em style={{ fontStyle: "italic", color: P.gold }}>How to Get Approved</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            If your USDA loan came back with a "Refer" or "Refer with Caution" finding from GUS, your file is headed for manual underwriting. That's not a denial. It's a signal that the automated system can't approve the file on its own and a human underwriter needs to evaluate it against the written guidelines.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            USDA loans are an under-used program. They offer 100% financing (no down payment), competitive rates, and lower mortgage insurance costs than <a href="/deep-dives/fha-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>FHA</a>. The catch is that they only work in eligible rural areas and within household income limits. Once you clear those two gates, USDA can be the best loan program available for moderate-income buyers in qualifying areas.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page covers how USDA manual underwriting actually works: what the GUS system returns, what triggers a manual review, what ratios USDA uses, what compensating factors qualify for waivers, and what the credit and seasoning rules look like. If you're a borrower with a Refer finding, a realtor working with a USDA buyer, or another LO trying to navigate USDA's specific rules, this is for you.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator. I've written my share of USDA loans and the rules below come from USDA Handbook 1-3555 (the SFHGLP Handbook), specifically Chapter 10 (Credit Analysis) and Chapter 11 (Ratio Analysis). Your specific file is evaluated by your lender's underwriter against those rules plus their own overlays. More on overlays below.
            </p>
          </div>
        </div>

        <H2>Two gates first. Income limits and property location.</H2>
        <Para>
          Before USDA underwriting matters at all, the file has to clear two USDA-specific eligibility tests that don't apply to FHA, <a href="/deep-dives/va-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>VA</a>, or conventional loans.
        </Para>

        <H3>The household income limit</H3>
        <Para>
          USDA Guaranteed loans are designed for <strong style={{ color: P.navy, fontWeight: 600 }}>low- and moderate-income households</strong>. The Agency caps household income at <strong style={{ color: P.navy, fontWeight: 600 }}>115% of the area median income</strong> (AMI) for the county where the property is located, adjusted for household size. This isn't borrower income. It's total household income, including non-borrowing adults, certain dependents, and various income sources that don't count for repayment.
        </Para>
        <Para>
          Income limits vary by location and household size, typically ranging from about $112,450 for 1-4 member households to $148,450 for 5-8 member households in many areas. Higher-cost counties have higher limits. The official income limits are published on the USDA Rural Development eligibility website.
        </Para>
        <Para>
          If household income exceeds the limit, USDA isn't an option. Period. There's no waiver process for income. The file moves to FHA, VA, or conventional.
        </Para>

        <H3>The property location requirement</H3>
        <Para>
          The property must be in a <strong style={{ color: P.navy, fontWeight: 600 }}>USDA-eligible rural area</strong>. "Rural" is defined more generously than most people expect. Many small towns, suburbs of mid-sized cities, and even some areas on the outer edges of major metros qualify. Eligibility is checked through the USDA Rural Development property eligibility map, which is publicly available.
        </Para>
        <Para>
          If the property doesn't qualify, USDA isn't an option for that property. The borrower can use USDA on a different property in an eligible area, or use FHA/VA/conventional on the current property.
        </Para>

        <GeekTip title="Run both eligibility checks before doing anything else">
          <TipBody text="If you're considering USDA, check both the income limits for your household size in your county AND the property eligibility for the specific address before going any further. About 25% of USDA prospects I see don't actually qualify on one of these two gates. Better to find out in 15 minutes than after a pre-approval and a contract." />
        </GeekTip>

        <H2>First things first. What is USDA manual underwriting?</H2>
        <Para>
          When you apply for a USDA loan, your lender runs your file through the <strong style={{ color: P.navy, fontWeight: 600 }}>Guaranteed Underwriting System (GUS)</strong>. This is USDA's own automated underwriting system, similar in concept to Fannie Mae's Desktop Underwriter (DU) or Freddie Mac's Loan Product Advisor (LPA), but USDA-specific. GUS returns one of four findings:
        </Para>
        <Bullets items={[
          "**Accept (or Accept Full Documentation):** The system can approve the file with reduced documentation. This is what most clean USDA files get.",
          "**Refer:** The system can't approve automatically. The loan is *eligible* for USDA financing, but a human underwriter has to evaluate it manually.",
          "**Refer with Caution:** Similar to Refer but with elevated risk indicators. Manual underwriting is required, with extra scrutiny.",
          "**Ineligible:** Something fundamental disqualifies the file (income exceeds the limit, property isn't eligible, CAIVRS hit, etc.).",
        ]} />
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>A "manual underwrite" on a USDA loan is when a human underwriter makes the decision against the explicit rules in HB-1-3555</strong>, rather than deferring to GUS. The underwriter still uses GUS to enter the data, but the approval decision rests on their analysis, not on GUS's automated finding.
        </Para>

        <H2>Two paths to a manual. Which one are you on?</H2>
        <Para>
          There are two main ways your USDA file ends up being manually underwritten.
        </Para>

        <H3>Path 1. GUS returned "Refer" or "Refer with Caution"</H3>
        <Para>
          GUS couldn't get comfortable with something in your profile. Common triggers:
        </Para>
        <Bullets items={[
          "**Credit score below 640.** GUS rarely returns Accept for files with a representative credit score below 640. Below 640 essentially guarantees a manual.",
          "**DTI above 41%.** Above the 41% Total Debt threshold, GUS often refers the file even with otherwise strong credit.",
          "**PITI above 29%.** USDA uses 29% as the standard PITI threshold. Above that, the file commonly refers.",
          "**Recent derogatory credit.** Late payments, recent collections, or unresolved disputes.",
          "**Limited credit history or thin file.** Few open tradelines or short tradeline history.",
          "**Self-employment income with year-over-year decline.**",
          "**Income or employment patterns GUS can't validate automatically.**",
        ]} />
        <Para>
          In this case, GUS isn't saying "no." It's saying "we can't automatically say yes, a human needs to look at this."
        </Para>
        <Para>
          For self-employed borrowers specifically, the year-over-year income decline trigger is one of the most common reasons USDA files end up here. See our <a href="/deep-dives/self-employed-documentation" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>self-employed documentation deep dive</a> for how qualifying income gets calculated and what to bring to the file.
        </Para>

        <H3>Path 2. GUS returned "Accept" but a downgrade is required</H3>
        <Para>
          Less common but it happens. The most frequent reason for downgrade:
        </Para>
        <Bullets items={[
          "**The lender becomes aware of derogatory or contradictory information** that wasn't reflected in the data submitted to GUS. Examples: an undisclosed debt, an undisclosed late payment, evidence of a Federal judgment, or any other adverse information that would have changed the GUS finding if it had been entered.",
        ]} />
        <Para>
          When a downgrade is required, the file goes to manual underwriting regardless of what GUS originally returned.
        </Para>

        <GeekTip title="GUS is a tool, not the decision">
          <TipBody text="GUS does not approve loans. It's an analytical tool that helps the lender make a decision. Even on a clean GUS Accept, the lender's underwriter is still responsible for the final decision and remains liable for it. On a manual file, that responsibility just becomes more visible. Don't treat a GUS Accept as permission to skip underwriting due diligence; don't treat a Refer as a death sentence." />
        </GeekTip>

        <H2>The USDA underwriter's framework</H2>
        <Para>
          On a USDA manual file, the underwriter is evaluating five categories. Each one has its own rules in HB-1-3555.
        </Para>
        <Bullets items={[
          "**The two eligibility gates.** Income limit and property location.",
          "**Acceptable credit.** Payment history, with extra weight on the most recent 12 months. Significant derogatory credit triggers extra requirements.",
          "**Effective income.** Stability, documentation, 2-year employment history (with exceptions).",
          "**Debt ratios.** PITI at 29% standard / 34% maximum with waiver. Total Debt at 41% standard / 44% maximum with waiver.",
          "**Compensating factors.** Required for ratio waivers above 29/41.",
        ]} />
        <Para>
          Plus the wild card: <strong style={{ color: P.navy, fontWeight: 600 }}>lender overlays.</strong> Many lenders impose stricter rules than USDA's baseline (e.g. 660 minimum credit score, 41% DTI cap regardless of waiver eligibility). One lender denying a USDA file doesn't mean every lender will.
        </Para>

        <GeekTip title="USDA lenders aren't created equal">
          <TipBody text="Like FHA and VA manuals, USDA manuals require a lender who actually knows the program. A surprising number of large-volume lenders treat USDA as an afterthought. They'll take the file, run GUS, and if it comes back Refer, they'll either deny or take three months to work it. If your lender hesitates when you ask &quot;do you do USDA manuals?&quot;, find one that does them routinely. They exist, and the difference shows up at conditions." />
        </GeekTip>

        <H2>Acceptable credit. What USDA actually requires.</H2>
        <Para>
          USDA's credit standards mostly mirror what you'd expect from a government loan, but with some specific quirks worth understanding.
        </Para>

        <H3>Credit scores and the 640 line</H3>
        <Para>
          USDA does not technically require a minimum credit score at the agency level. However, in practice:
        </Para>
        <Bullets items={[
          "**Score of 640+:** GUS may render an Accept with no special treatment. This is the score that essentially every USDA borrower targets.",
          "**Score of 580-639:** GUS will refer the file. Manual underwriting required, with what HB-1-3555 calls \"a cautious level of underwriting.\" Approvable but tight.",
          "**Score below 580:** Most lender overlays disallow at this level. Even if a lender will consider, the file is heavily scrutinized.",
          "**No credit score (non-traditional credit):** USDA allows non-traditional credit (rent, utilities, insurance) to substitute for traditional tradelines. This is unusual and powerful for borrowers with no credit history at all.",
        ]} />
        <Para>
          The 640 score is the most important threshold. Below it, manual underwriting is essentially guaranteed and approval becomes meaningfully harder.
        </Para>

        <H3>Recent payment history (last 12 months)</H3>
        <Para>
          The handbook requires the underwriter to scrutinize the last 12 months for any pattern of late payments. Specifically:
        </Para>
        <Bullets items={[
          "**Mortgage or rent payments:** One 30-day late within the previous 12 months is \"significant derogatory credit\" and triggers extra requirements. This is stricter than FHA's allowance for one mortgage late.",
          "**Other accounts:** Patterns of late payments across multiple accounts are problematic. Isolated incidents with explanations may be acceptable.",
        ]} />

        <H3>Verification of rent (VOR)</H3>
        <Para>
          USDA requires verification of rent for ratio waiver requests on manual files (more on waivers below). Acceptable documentation:
        </Para>
        <Bullets items={[
          "**Verification of Rent form** completed by the landlord, showing actual payment due and last 12 months of payment history with no more than one 30-day late.",
          "**12 months of canceled checks** or **12 months of bank statements** showing rent payments to the landlord.",
          "For rent paid to a family member or interested party, only canceled checks, money orders, or electronic payment confirmations work. A landlord letter alone is not enough.",
        ]} />

        <H3>Collections and charge-offs</H3>
        <Para>
          USDA's specific rules on collections:
        </Para>
        <Bullets items={[
          "**Collections are not required to be paid off** as a condition of the guarantee.",
          "However, if the **cumulative balance of all non-medical collection accounts equals or exceeds $2,000**, the lender must take action: either pay the balance in full at or before closing, OR include 5% of the cumulative balance as a monthly payment in the DTI calculation, OR document a documented payment arrangement.",
          "**Medical collections** are excluded from the cumulative balance calculation.",
          "**Charge-offs** are similarly not required to be paid, but they're factored into the credit analysis.",
        ]} />

        <H3>Disputed accounts</H3>
        <Bullets items={[
          "**Non-derogatory disputed accounts:** Generally don't require special treatment.",
          "**Derogatory disputed accounts:** The dispute often must be resolved or the underwriter must analyze the impact on the file's creditworthiness. The specifics depend on whether the file is GUS Accept, Refer, or manually underwritten.",
        ]} />

        <H3>Bankruptcy and foreclosure seasoning</H3>
        <Para>
          For a side-by-side comparison of how USDA, FHA, VA, and conventional handle bankruptcy, foreclosure, deed-in-lieu, and short sale wait periods, see our <a href="/deep-dives/derogatory-credit" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>derogatory credit wait periods guide</a>. The USDA-specific table:
        </Para>

        <SeasoningTable />

        <Para>
          USDA's Chapter 13 path is similar to FHA's and VA's. Most loan programs won't touch a borrower in active Chapter 13. USDA will, with court approval.
        </Para>

        <H3>CAIVRS</H3>
        <Para>
          USDA loans require a clear CAIVRS (Credit Alert Verification Reporting System) check. CAIVRS is a federal database of delinquent or defaulted federal debt. A CAIVRS hit, often from a defaulted student loan or prior foreclosure on a federal-backed mortgage, must be resolved before closing. This is the same requirement as FHA and VA loans.
        </Para>

        <GeekTip title="Don't pay off old collections without consulting your LO">
          <TipBody text="Same advice as on FHA and VA: paying an old collection can re-age it on your credit report and temporarily drop your score. If the cumulative collection balance is under $2,000 (or you're below the threshold after excluding medical), USDA doesn't require payoff. Talk to your LO before paying anything off in the months leading up to your application." />
        </GeekTip>

        <H2>The ratios. PITI 29/34 and Total Debt 41/44.</H2>
        <Para>
          USDA's ratio framework is more rigid than FHA's tiered grid or VA's 41% soft cap. The structure matters.
        </Para>

        <H3>Standard ratio thresholds</H3>

        <StandardRatioTable />

        <Para>
          For a GUS Accept file, no waiver is needed. The PITI sits at or below 29% and the Total Debt at or below 41%, and the file moves through.
        </Para>
        <Para>
          For a Refer, Refer with Caution, or manually underwritten file, ratios above 29% PITI or 41% Total Debt require a documented <strong style={{ color: P.navy, fontWeight: 600 }}>debt ratio waiver</strong> with one or more compensating factors. This is the USDA-specific equivalent of FHA's compensating factor grid and VA's residual income test.
        </Para>

        <USDARatioThresholdGrid />

        <H3>The PITI ratio specifically</H3>
        <Para>
          The PITI ratio is the proposed monthly housing expense (Principal, Interest, Taxes, Insurance, plus HOA fees if applicable) divided by the borrower's qualifying repayment income. Standard maximum is 29%. The waiver ceiling is 34%, and <strong style={{ color: P.navy, fontWeight: 600 }}>there is no waiver above 34%</strong> on purchase transactions.
        </Para>
        <Para>
          Per USDA Procedure Notice 621 (effective August 5, 2024), the PITI waiver ceiling was raised from 32% to 34%. A lot of older USDA content online still references 32%; the current ceiling is 34%.
        </Para>

        <H3>The Total Debt ratio specifically</H3>
        <Para>
          The Total Debt ratio is the proposed PITI plus all monthly recurring debts (credit cards, auto loans, student loans, child support, etc.) divided by qualifying repayment income. Standard maximum is 41%. Waiver ceiling is 44%. To run scenarios at different price points and see how your <a href="/calculator" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>DTI</a> moves, the calculator will get you close.
        </Para>

        <H3>When ratios exceed the waiver ceiling</H3>
        <Para>
          If the file's PITI exceeds 34% or Total Debt exceeds 44%, USDA does not allow a waiver on purchase transactions. The file is ineligible at those ratios. The borrower's options are:
        </Para>
        <Bullets items={[
          "Reduce the loan amount (smaller house or larger down payment beyond the 0% required)",
          "Pay down monthly debts to reduce the Total Debt ratio",
          "Increase qualifying income",
          "Switch to a different loan program (FHA allows up to 50%/57% with comp factors; VA has no hard cap)",
        ]} />

        <H2>Debt ratio waivers and compensating factors</H2>
        <Para>
          For a manual file with ratios above 29/41, the lender requests Agency concurrence with a <strong style={{ color: P.navy, fontWeight: 600 }}>debt ratio waiver</strong>, supported by one or more compensating factors. The Agency's issuance of the Conditional Commitment for Loan Note Guarantee represents approval of the waiver.
        </Para>

        <H3>Waiver eligibility conditions</H3>
        <Para>
          Per HB-1-3555, Chapter 11.3, debt ratio waivers may be granted on purchase transactions if all the following conditions are met:
        </Para>
        <Bullets items={[
          "**Either:** PITI ratio is greater than 29% but ≤ 34%, accompanied by Total Debt ratio ≤ 44%, OR Total Debt ratio is greater than 41% but ≤ 44%, accompanied by PITI ≤ 34%",
          "**The credit score of all applicants is 680 or greater**",
          "**At least one acceptable compensating factor is identified and documented**",
        ]} />
        <Para>
          The 680 credit score requirement is the gate that catches a lot of files. A borrower with a 660 score and ratios at 32% PITI / 43% Total Debt looks like they should qualify with a waiver, but they don't, because 680 is the floor for the waiver itself.
        </Para>

        <H3>USDA-recognized compensating factors</H3>
        <Para>
          USDA Chapter 11.3 lists specific compensating factors. Each one requires documentation. Click any factor for the full definition and documentation requirements.
        </Para>

        <USDACompFactorsGrid />

        <GeekTip title="Compensating factors don't fix bad credit">
          <TipBody text="The USDA handbook is explicit that compensating factors strengthen a ratio waiver, not a credit history. If a file has multiple layers of risk (marginal credit history, recent derogatory events, declining income), comp factors won't bridge those gaps. The credit has to clear the bar first. Then comp factors let you stretch ratios." />
        </GeekTip>

        <H2>Why USDA manual underwrites fail. The patterns I see.</H2>
        <Para>
          USDA manual files fail for a mix of program-specific and general reasons. The patterns I see most often:
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>1. The wrong lender.</strong></Para>
        <Para>
          A surprising number of large lenders don't actively support USDA. They'll take the file, run GUS, and if it comes back Refer, they'll deny without working it manually. If your lender hesitates when you ask whether they handle USDA manuals, find a lender that does these routinely.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>2. Surprise on the income limit.</strong></Para>
        <Para>
          A file gets pre-approved on USDA, then household income comes in over the limit when all sources are properly counted. This usually happens when an LO doesn't count overtime, bonus income, or non-borrower household income correctly during pre-approval. The fix is running the exact USDA income limit calculation up front, including all required income sources. Our <a href="/prequal" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>pre-qualification tool</a> is one way to sanity-check the numbers before you go further.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>3. The 680 credit score gate on waivers.</strong></Para>
        <Para>
          A borrower has clean files and reasonable ratios at 31% PITI / 43% Total Debt, but their credit score is 660. They look like they should qualify with a waiver. They don't, because 680 is the floor for the waiver itself. The fix is to either pay down debts to bring ratios under 29/41 (avoiding the waiver entirely), bump credit score to 680, or move to a different loan program.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>4. CAIVRS hits not caught early.</strong></Para>
        <Para>
          A defaulted student loan or prior FHA foreclosure shows up on CAIVRS late in the process. By then the borrower has paid for an appraisal and is under contract. The fix is pulling CAIVRS at pre-approval, which most LOs do but not all.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>5. Property eligibility surprises.</strong></Para>
        <Para>
          The borrower finds a house they love, then it turns out the property isn't in a USDA-eligible area. Less common in established rural counties, more common near the edges of growing metros where the eligible area is shrinking. Always verify the specific address before making an offer.
        </Para>

        <Para noMargin><strong style={{ color: P.navy, fontWeight: 600 }}>6. Misunderstanding the manufactured housing rules.</strong></Para>
        <Para>
          USDA allows manufactured homes but with restrictions (must be new, not pre-owned, must meet specific HUD code requirements, etc.). Borrowers who fall in love with an older manufactured home find out late that it doesn't qualify.
        </Para>

        <Para>
          In my experience, well-prepared USDA manual files close at roughly the same rate as USDA Accept files. The mythology that "USDA is a slow program" is mostly about lenders who don't do USDA volume, not about borrowers who don't qualify.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>I got a Refer. Is my USDA loan dead?</H3>
        <Para>
          No. Refer means a human needs to look at your file. It doesn't mean denied. In my experience, USDA Refer files close at high rates assuming the file is genuinely clean (clean credit, ratios reasonable, eligibility gates cleared) and the lender does USDA manual underwriting routinely.
        </Para>

        <H3>My credit score is 620. Can I still get a USDA loan?</H3>
        <Para>
          Possibly. USDA itself doesn't set a minimum credit score, but most lenders set overlays at 640+. Some lenders work with scores down to 580 or 600 with the right file structure. If your score is below 640, expect manual underwriting and expect not every lender to approve. Find a lender that works with manual USDA files specifically.
        </Para>

        <H3>My DTI is at 45%. Can I get a waiver?</H3>
        <Para>
          No. USDA's hard ceiling for the Total Debt ratio is 44% on manual purchase transactions, and that's only with a 680+ credit score plus a documented compensating factor. At 45%, USDA isn't an option without paying down debts or increasing income. FHA might allow up to 50% or 57% with comp factors, depending on score. VA has no hard cap. If you're stuck above 44%, talk to your LO about switching programs.
        </Para>

        <H3>I'm in an active Chapter 13. Can I still get a USDA loan?</H3>
        <Para>
          Yes, with court approval and 12+ months of on-time trustee payments. Same path as FHA and VA. Your monthly trustee payment becomes part of your DTI calculation, which usually pushes the file above 41% Total Debt and into ratio waiver territory. Comp factors and a 680+ credit score become important.
        </Para>

        <H3>My income just went up. Am I still under the USDA limit?</H3>
        <Para>
          Income limits are based on prior 12 months of household income, not just borrower repayment income. They include overtime, bonus, and (in many cases) income of non-borrowing adults in the household. If your income is close to the limit, your LO needs to run the exact income limit calculation with all required sources before pre-approval. Files have died on this when surprise income pushed the household over the limit.
        </Para>

        <H3>Will I have to pay PMI on a USDA loan?</H3>
        <Para>
          USDA loans charge an upfront guarantee fee (currently 1% of the loan amount, financed into the loan) and an annual fee (currently 0.35% of the loan balance, paid monthly). These are USDA's equivalent of mortgage insurance. <strong style={{ color: P.navy, fontWeight: 600 }}>They are typically lower than FHA's MIP</strong>, especially over the life of the loan, because USDA's annual fee adjusts with the declining loan balance and there's no permanent MIP requirement.
        </Para>

        <H3>Can I refinance from FHA to USDA later?</H3>
        <Para>
          USDA's refinance program (Streamlined Assist or Standard Streamlined refinance) is for existing USDA borrowers. To go from FHA to USDA you'd need a fresh USDA purchase or a non-streamlined refinance, and you'd need to meet USDA's eligibility gates (income and property) at that time. Most borrowers stay with FHA or refinance to conventional rather than switching to USDA.
        </Para>

        <H3>Can my non-occupant co-borrower help me qualify for USDA?</H3>
        <Para>
          USDA does not allow non-occupant co-borrowers. All borrowers on a USDA loan must occupy the property as their primary residence. This is different from FHA, which allows non-occupant co-borrowers under certain conditions.
        </Para>

        <H3>Does USDA allow gift funds?</H3>
        <Para>
          Yes. Gift funds can be used for closing costs and prepaid items. Since USDA is a 0% down program, gift funds for down payment aren't typically needed. Gift funds for reserves used as a comp factor are not eligible (reserves must be from the borrower's own funds). For the full breakdown of who can give, what the gift letter has to say, and how the money has to move from donor to closing, see the <a href="/deep-dives/gift-funds" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Gift Funds Deep Dive</a>.
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page is a summary of what HB-1-3555 says about USDA manual underwriting, organized in the same structure as the FHA and VA Manual Underwriting Deep Dives. It is not:
        </Para>
        <Bullets items={[
          "**Legal or financial advice.** Your specific situation requires a specific evaluation.",
          "**A substitute for your LO or underwriter.** Lender overlays vary on USDA. This page covers USDA's baseline.",
          "**A guarantee of approval.** Even a perfectly structured USDA manual file can be denied for reasons not covered here.",
        ]} />
        <Para>
          If you're working through a USDA scenario and want to talk through whether your file has a path, I'm reachable. Bring your numbers, your address, and a clear picture of what GUS returned. We'll work through it.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Working through a USDA scenario?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:nick@mortgagegeek.ai" aria-label="Email Nick Peters" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>nick@mortgagegeek.ai</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            USDA is one of the most under-used loan programs in the country. If you qualify, it's often the best deal you'll find.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: USDA Single Family Housing Guaranteed Loan Program Handbook (HB-1-3555), Chapter 10 (Credit Analysis) and Chapter 11 (Ratio Analysis), current as of 2026; USDA HB-1-3555, Attachment 10-A (Credit Matrix); USDA Procedure Notice 621 (August 5, 2024) revising PITI ratio waiver ceiling to 34%; 7 CFR Part 3555 (Single Family Housing Guaranteed Loan Program regulations); author's 12+ years of field experience originating USDA Guaranteed loans.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
