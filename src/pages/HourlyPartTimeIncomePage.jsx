import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { HourlyIncomeGrid } from "../components/HourlyIncomeGrid";
import { PartTimeSeasonalGrid } from "../components/PartTimeSeasonalGrid";

const TITLE = "Hourly, Part-Time & Seasonal Income for Mortgage Qualifying: Real LO Guide | Mortgage Geek";
const DESCRIPTION = "Mortgage qualifying with hourly, part-time, or seasonal income. Calculation rules by loan program (FNMA, FHLMC, FHA, VA, USDA), with worked examples and real LO insight.";
const PATH = "/deep-dives/hourly-and-part-time-income";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-30";
const MODIFIED = "2026-04-30";

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

function Formula({ children }) {
  return (
    <blockquote style={{ borderLeft: `3px solid ${P.gold}`, background: P.creamDark, padding: "14px 18px", margin: "14px 0", fontSize: 15, color: P.navy, fontWeight: 600, lineHeight: 1.6, fontFamily: F.body, borderRadius: 4 }}>
      {children}
    </blockquote>
  );
}

const LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

const SR_ONLY = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

function FallbackTable({ caption, headers, rows }) {
  return (
    <div style={SR_ONLY} aria-hidden="false">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i} scope="col">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                j === 0
                  ? <th key={j} scope="row">{cell}</th>
                  : <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HourlyPartTimeIncomePage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Hourly, Part-Time & Seasonal Income for Mortgage Qualifying",
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
            Hourly, Part-Time & Seasonal Income <em style={{ fontStyle: "italic", color: P.gold }}>for Mortgage Qualifying</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            Not every paycheck looks like a clean salary number. If you're paid hourly, work part-time, hold a second job, or earn most of your income during a specific season, your mortgage qualifying calculation looks different from a straight-salary borrower's. The rules vary by loan program, the math depends on how stable your hours and income have been, and the wrong calculation methodology can swing your qualifying income by hundreds of dollars per month.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page covers what each major loan program (Fannie Mae, Freddie Mac, FHA, VA, USDA) actually requires for hourly, part-time, secondary, and seasonal income, with worked examples showing how the math works in practice.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator. The rules below come from current agency guidelines (Fannie Mae Selling Guide updated March 2026, Freddie Mac Single-Family Seller/Servicer Guide, HUD Handbook 4000.1, VA Lender's Handbook Pamphlet 26-7, USDA HB-1-3555) and 12+ years of writing files for hourly and part-time borrowers. Lenders vary on this topic, especially around the consistency analysis. Your specific file is evaluated by your lender's underwriter against agency guidelines plus their own overlays.
            </p>
          </div>
        </div>

        <H2>First, the framework all five programs share</H2>
        <Para>Before getting into program-specific rules, three concepts apply across the board:</Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>1. Stability and continuance.</strong> Every program wants to see income that's stable (not declining), reliable (consistently received), and likely to continue. If your hours have been dropping or your second job is about to end, that affects what counts.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>2. History matters.</strong> The general standard is <strong style={{ color: P.navy, fontWeight: 600 }}>two years of history</strong> for any non-salary income. Shorter histories (12-24 months) can sometimes work with documented "positive factors," but the default is two years.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>3. The consistency test.</strong> For hourly and variable income, lenders compare your year-to-date (YTD) earnings against your prior-year W-2. If they're roughly consistent, the calculation is simpler. If YTD is dramatically higher or lower than prior year, the underwriter has to figure out why and pick a methodology that doesn't overstate qualifying income.
        </Para>
        <Para>
          These three principles drive everything below. The differences between programs are mostly about how strict each one is on history requirements and what documentation is required to use a shorter history.
        </Para>

        <H2>Hourly income</H2>
        <Para>
          Hourly income breaks into two scenarios that the agencies treat very differently: <strong style={{ color: P.navy, fontWeight: 600 }}>hours that don't vary</strong> (you work the same schedule every week) and <strong style={{ color: P.navy, fontWeight: 600 }}>hours that vary</strong> (your schedule changes week to week).
        </Para>

        <H3>Hours don't vary (consistent weekly schedule)</H3>
        <Para>
          If your hours are stable (typical example: 40 hours per week, every week), every program treats this similarly to salaried income. The calculation is straightforward:
        </Para>
        <Formula>
          Current hourly rate × hours per week × 52 weeks ÷ 12 = monthly qualifying income
        </Formula>
        <Para>Worked example: Sarah earns $22/hour and works exactly 40 hours per week.</Para>
        <Bullets items={[
          "$22 × 40 = $880/week",
          "$880 × 52 = $45,760/year",
          "$45,760 ÷ 12 = **$3,813/month qualifying income**",
        ]} />
        <Para>
          This is the cleanest case and rarely causes underwriting issues. The pay stub shows consistent hours, the YTD earnings match the calculated annual income, and there's no methodology debate.
        </Para>

        <H3>Hours vary (the harder case)</H3>
        <Para>
          When hours fluctuate week to week, the math gets more involved. This is where the program differences matter most:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}><a href="/deep-dives/fha-manual-underwriting" style={LINK_STYLE}>FHA</a> (4000.1 II.A.4.c.iii):</strong> Average the income over the previous two years. If the lender can document an increase in pay rate, the lender may use the most recent 12-month average of hours at the current pay rate.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Fannie Mae (B3-3.3-01, "Variable Base Income"):</strong> "Variable base income refers to a fixed hourly rate with fluctuating hours, or an hourly rate that varies." Two-year history is the standard. Lenders apply the consistency test by comparing YTD earnings against prior year. If income is consistent, the YTD average can be used. If not, the calculation typically defaults to the lower of YTD average or prior-year average unless documented exceptions apply (pay raise, medical leave, other documented leave).
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Freddie Mac (5303.2-5303.5):</strong> Same general framework as Fannie. Two-year history standard. Same consistency test. Same pay raise / leave exceptions for using a shorter average.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}><a href="/deep-dives/va-manual-underwriting" style={LINK_STYLE}>VA</a>:</strong> The Lender's Handbook is largely silent on hourly-specific calculations. In practice, lenders apply Fannie Mae or FHA standards to VA files. Your loan officer's investor relationships dictate which framework they use.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}><a href="/deep-dives/usda-manual-underwriting" style={LINK_STYLE}>USDA</a> (HB-1-3555 Att. 9-A):</strong> Treats hourly income under "base wages." One-year minimum history. The "1 year minimum" is more lenient than the two-year standard at other programs but still requires documented stability.
        </Para>

        <H3>The "increased pay rate" exception (FHA's specific path)</H3>
        <Para>
          This one matters because it's the most generous exception in the rule book. FHA explicitly allows the underwriter to use <strong style={{ color: P.navy, fontWeight: 600 }}>the most recent 12 months at the current pay rate</strong> if the lender can document an increase in pay rate during the two-year history period.
        </Para>
        <Para>
          Worked example: Marcus has worked at the same warehouse for three years, with hours that vary 32-42 per week. He got a raise from $18/hour to $21/hour exactly 14 months ago. Without the FHA exception, his two-year average would average together the lower-rate and higher-rate periods and produce a smaller qualifying number. With the FHA exception, the lender uses the most recent 12 months × $21/hour at his average hours (call it 36/week):
        </Para>
        <Bullets items={[
          "$21 × 36 = $756/week",
          "$756 × 52 = $39,312/year",
          "$39,312 ÷ 12 = **$3,276/month qualifying income**",
        ]} />
        <Para>
          vs. the two-year average that would have averaged in those 10 months at $18/hour:
        </Para>
        <Bullets items={[
          "Roughly $720 weekly average × 52 ÷ 12 = **about $3,120/month**",
        ]} />
        <Para>
          Difference: <strong style={{ color: P.navy, fontWeight: 600 }}>~$156/month</strong>. On a 43% DTI, that's about $362 of additional house payment supportable. Not life-changing, but at the margin, this exception can move someone from "doesn't qualify" to "qualifies." Bring the documented pay rate increase to your LO at <a href="/prequal" style={LINK_STYLE}>pre-approval</a>; don't let it get missed.
        </Para>

        <H3>When YTD differs from prior year (the consistency test)</H3>
        <Para>This is the gotcha that catches more files than any other rule on this page.</Para>
        <Para>
          The methodology: lender compares YTD earnings (annualized to 12 months) against prior-year W-2 earnings.
        </Para>
        <Bullets items={[
          "**Consistent (within ~10% of each other):** Use YTD average. Income is stable.",
          "**YTD significantly higher than prior year:** Lender uses lower of YTD or prior year UNLESS documented (pay raise, additional hours, return from medical leave).",
          "**YTD significantly lower than prior year:** Lender uses YTD (the lower number) because trending-down income can't be averaged with the higher prior year.",
        ]} />
        <Para>
          The trending-down case is the most common reason hourly borrowers get less qualifying income than they expect. If your hours dropped this year, even temporarily, expect your qualifying income to drop with them.
        </Para>

        <GeekTip title="Document your pay raise BEFORE pre-approval">
          <TipBody text="If you got a pay rate increase in the last 12 months, get a letter from your employer (on company letterhead) stating the date and amount of the raise BEFORE your loan application. This single document is the difference between an underwriter using your two-year average (which dilutes your higher rate) versus your most recent 12 months at the new rate. I've seen this missed at intake more times than I can count, and it's almost always recoverable, but easier to provide upfront than to scramble for at conditions." />
        </GeekTip>

        <H2>The hourly income comparison grid</H2>
        <HourlyIncomeGrid />
        <FallbackTable
          caption="Hourly Income Calculation by Loan Program"
          headers={["Scenario", "Conv (FNMA)", "Conv (FHLMC)", "FHA", "VA", "USDA"]}
          rows={[
            ["Hours don't vary", "Current rate × hours × 52 ÷ 12", "Current rate × hours × 52 ÷ 12", "Current rate × hours × 52 ÷ 12", "Defers to investor (typically Fannie/FHA)", "Treated as base wages"],
            ["Hours vary, YTD consistent", "YTD average", "YTD average", "2-year average", "Defers to investor", "YTD if 1+ year history"],
            ["Hours vary, YTD differs", "Lower of YTD or prior year (exceptions for documented pay raise, medical leave)", "Lower of YTD or prior year (exceptions for documented pay raise, medical leave)", "2-year average", "Defers to investor", "Lower of YTD or available history"],
            ["Pay rate increase documented", "Use new rate × hours", "Use new rate × hours", "12-mo avg × current rate (specific FHA exception)", "Defers to investor", "Documented pay rate increase honored"],
            ["Minimum history", "2 years", "2 years", "2 years (12 mo with positive factors)", "Defers to investor", "1 year"],
          ]}
        />

        <H2>Part-time and secondary income</H2>
        <Para>
          Part-time and secondary income (sometimes called "second job income") refer to wages earned from employment beyond your primary job. The rules across programs are remarkably consistent, with one shared theme: <strong style={{ color: P.navy, fontWeight: 600 }}>two years of uninterrupted history is the gold standard, and the 12-24 month exception requires "positive factors" that you have to actually document.</strong>
        </Para>

        <H3>The 2-year history standard</H3>
        <Para>Every program uses two years of part-time or secondary employment as the default qualifying threshold:</Para>
        <Bullets items={[
          "**Fannie Mae (B3-3.4-01, multiple jobs / secondary employment):** Minimum 2-year uninterrupted history. 12-24 months may be considered if positive factors offset the shorter history.",
          "**Freddie Mac (5303.2(a)(ii)):** Minimum 2-year history considered stable. 12-24 months may be considered with documented positive factors. (Their specific example: borrower had a full-time job in same line of work but must now work multiple part-time jobs; consistency must be demonstrated.)",
          "**FHA (4000.1 II.A.4.c.iv & vi):** Uninterrupted 2-year history. Reasonable that current position is likely to continue. Income averaged over 2-year period, OR if borrower can document an increase in pay rate, the lender may use the most recent 12-month average of hours at the current pay rate.",
          "**VA (Pamphlet 26-7, Chap. 4, Sec. 2-h):** Verified stable & reliable for 2 years. Must demonstrate: income is consistent, reasonable likelihood it will continue, and compatibility of likelihood with hours of duty and other work conditions of primary job.",
          "**USDA (HB-1-3555 Att. 9-A):** 2-year history. Income will be presumed to continue unless there is documented evidence the income will cease.",
        ]} />

        <H3>The 12-24 month exception (and what "positive factors" actually means)</H3>
        <Para>
          If you have less than two years but more than one year of part-time or secondary employment, the door isn't closed. But "positive factors" is the underwriter's judgment call, and you need to document them.
        </Para>
        <Para>What counts as a positive factor:</Para>
        <Bullets items={[
          "**Income trending up over the documentation period.** Your hours or pay rate has increased, and your earnings have grown each year.",
          "**Same line of work.** You changed employers but stayed in the same field. This shows the income source is reliable to your career trajectory, not just to one job.",
          "**Consistent receipt across employers.** Even if you've had multiple part-time jobs, you've been consistently earning part-time income throughout.",
          "**Documented likelihood of continuance.** Your employer has confirmed in writing that your part-time role is ongoing and not seasonal or contractual.",
        ]} />
        <Para>What doesn't count as a positive factor:</Para>
        <Bullets items={[
          "\"I plan to keep working part-time.\" (Not enough; underwriter wants to see history, not intention.)",
          "\"My boss says he likes me.\" (Not enough; underwriter wants written confirmation of continuance.)",
          "Recent income spikes that look like one-time bonuses or overtime.",
        ]} />

        <H3>The line-of-work continuity argument</H3>
        <Para>
          Freddie Mac's selling guide is specific about this and it generalizes to other programs in practice: <strong style={{ color: P.navy, fontWeight: 600 }}>changing employers within the same line of work doesn't reset your history.</strong> If you've worked retail for 30 months, even across three different employers, that's 30 months of retail income history. The continuity is in the income source (retail wages), not in any single employer.
        </Para>
        <Para>
          This matters for hourly workers specifically because retail, food service, warehousing, healthcare support, and similar industries have high employer turnover. If you've been continuously earning hourly wages in the same general line of work for 24+ months, you generally meet the history requirement even if you've changed employers.
        </Para>
        <Para>
          The argument fails when there's a meaningful gap (60+ days unemployed) or when the line of work meaningfully changed (you went from retail to construction). Otherwise, line-of-work continuity is a real underwriting concept and should be argued in the file when applicable.
        </Para>

        <H3>When part-time income gets excluded</H3>
        <Para>A few cases where part-time income won't count even if you've earned it:</Para>
        <Bullets items={[
          "**Less than 12 months of history:** The agency floor. No exception path.",
          "**Trending down:** If your part-time hours have been decreasing, the underwriter typically can't use the income.",
          "**Job confirmed ending:** If the part-time job is ending or has ended, the income doesn't count toward qualifying even if you have 2+ years of history. The continuance test fails.",
          "**Position incompatible with primary job:** If your secondary income comes from hours that overlap with your primary job's schedule (rare but it happens), the underwriter may question whether you can sustain it.",
        ]} />

        <GeekTip title="The 12-24 month exception is harder than it sounds">
          <TipBody text="The agency guidelines technically allow part-time income with less than two years of history if you have 'positive factors.' In practice, underwriters are conservative on this exception because the loan-level risk of using unstable income is on them. Going in with 13 months of part-time income and hoping the underwriter agrees you have positive factors is a coin flip. If you have less than two years and the income is meaningful to qualifying, talk to your LO upfront about whether the file works without it. Sometimes the cleaner answer is to wait a few months until you cross the two-year threshold rather than fight for the exception." />
        </GeekTip>

        <H2>Seasonal income</H2>
        <Para>
          Seasonal income is the one true outlier on this page. Teachers who work summer school, ski instructors, harvest workers, lifeguards, holiday retail seasonal workers, and tax preparers all earn meaningful income during specific seasons. The agency rules treat this differently from year-round part-time work.
        </Para>

        <H3>The shared standard</H3>
        <Para>
          All five programs apply roughly the same baseline: <strong style={{ color: P.navy, fontWeight: 600 }}>two years of seasonal employment in the same line of work, with reasonable expectation of rehire next season.</strong>
        </Para>
        <Bullets items={[
          "**Fannie Mae (B3-3.3-08, \"Seasonal Income\"):** Same job for the past 2 years required. Confirm with employer that there is a reasonable expectation the borrower will be rehired next season. Seasonal unemployment income can be counted when it's documented, clearly associated with seasonal layoff, expected to recur, and reported on federal tax returns.",
          "**Freddie Mac (5303.2(a)(ii)):** Same job for past 2 years. Confirm reasonable expectation of rehire. Specific example given: teacher who works part-time in school system for summer school, demonstrated for at least one year and expected next year.",
          "**FHA (4000.1 II.A.4.c.iv & vi):** Defines seasonal as \"not year-round\" regardless of number of hours worked per week. Verify borrower has worked the same line of work for 2 years. Average seasonal income over the previous 2 full years. Verify that borrower is likely to be rehired for next season. Unemployment income from off-season may be considered if 2 full years have been received.",
          "**VA (Pamphlet 26-7, Chap. 4, Sec. 2-h):** Guidelines are largely silent on seasonal jobs specifically. Check with your lender, as they may apply Fannie or FHA frameworks.",
          "**USDA (HB-1-3555 Att. 9-A):** 2-year history. Income will be presumed to continue unless there is documented evidence the income will cease.",
        ]} />

        <H3>The "reasonable expectation of rehire" requirement</H3>
        <Para>
          This is the make-or-break documentation step for seasonal income. The lender needs more than your statement that you'll be rehired; they need confirmation from the employer.
        </Para>
        <Para>What this typically looks like in practice:</Para>
        <Bullets items={[
          "**A letter from the employer on letterhead** stating that the borrower has been employed seasonally for the past X seasons and is expected to be rehired for the upcoming season.",
          "**For school-system seasonal workers (very common scenario):** A letter from the school district HR office confirming the borrower's seasonal role and expected continuation.",
          "**For agricultural or harvest workers:** A letter from the farm or agricultural employer confirming returning-worker status.",
        ]} />
        <Para>
          If the employer won't provide this letter, the seasonal income is at serious risk of not counting. This is one of the rare cases where pre-approval should include reaching out to the employer at the application stage rather than waiting until conditions.
        </Para>

        <H3>Off-season unemployment income (the counterintuitive rule)</H3>
        <Para>
          Here's a rule that surprises a lot of borrowers: <strong style={{ color: P.navy, fontWeight: 600 }}>unemployment income received during the off-season can count toward qualifying income</strong> if specific conditions are met.
        </Para>
        <Para>The conditions:</Para>
        <Bullets items={[
          "The unemployment income is documented (typically through unemployment benefits statements).",
          "It's clearly associated with the seasonal layoff (not unemployment from a separate job loss).",
          "It's expected to recur (you've received it during off-seasons in the past).",
          "It's reported on your federal tax returns.",
        ]} />
        <Para>
          This applies most cleanly under FHA and Fannie Mae rules, with documented two-year receipt. The logic is that for true seasonal workers, off-season unemployment is a predictable, recurring income source that's part of the annual income pattern.
        </Para>

        <GeekTip title="Teachers, the seasonal income rules favor you">
          <TipBody text="If you're a teacher who picks up summer school, summer camp work, or other school-system seasonal employment, the agency rules are surprisingly accommodating. Freddie Mac specifically calls out the teacher example in their guide. The combination of (a) school-system employer who can easily document rehire expectations, (b) calendar predictability, and (c) line-of-work continuity within the school district means teacher-seasonal income is generally one of the cleanest seasonal income files an LO sees. If you're a teacher considering qualifying with summer school income, gather your past two years of summer income documentation and a letter from your school district HR; you're probably in better shape than you think." />
        </GeekTip>

        <H2>The part-time and seasonal comparison grid</H2>
        <PartTimeSeasonalGrid />
        <FallbackTable
          caption="Part-Time, Secondary, and Seasonal Income by Loan Program"
          headers={["Scenario", "Conv (FNMA)", "Conv (FHLMC)", "FHA", "VA", "USDA"]}
          rows={[
            ["Part-time / secondary, 2+ years", "Standard qualifying", "Standard qualifying", "Standard qualifying", "Standard qualifying", "Standard qualifying"],
            ["Part-time / secondary, 12-24 months", "Allowed with positive factors", "Allowed with positive factors", "Allowed with positive factors documented", "Allowed with documented stability", "Generally requires 2 years"],
            ["Part-time / secondary, less than 12 months", "Generally excluded", "Generally excluded", "Generally excluded", "Generally excluded", "Excluded"],
            ["Seasonal, 2+ years same line", "2-year average + rehire confirmation", "2-year average + rehire confirmation", "2-year average + rehire confirmation", "Defers to lender", "2-year average + presumed continuance"],
            ["Off-season unemployment", "Usable with 2-yr history + tax docs", "Usable with 2-yr history + tax docs", "Usable with 2-yr history", "Defers to lender", "Usable per general framework"],
          ]}
        />

        <H2>Why these files fail (the patterns I see)</H2>
        <Para>
          After 12 years of writing files for hourly, part-time, and seasonal borrowers, the failure modes are predictable:
        </Para>
        <Bullets items={[
          "**1. Trending-down hours not caught at pre-approval.** Borrower thinks they earn $X per month based on a recent good month. Underwriter looks at the YTD trend, sees hours dropping, and uses a lower number. The pre-approval was issued at a higher income figure than the actual qualifying income. Solution: pull two years of W-2s and recent paystubs at intake, run the consistency test before issuing pre-approval.",
          "**2. Pay rate increase not documented.** Borrower mentions casually that they got a raise. The LO doesn't capture it formally. Underwriter uses the two-year average (with the lower rate baked in) instead of the more favorable 12-month-at-current-rate calculation. Solution: ask about pay rate changes at application, get the documentation upfront.",
          "**3. Seasonal employer won't provide rehire letter.** Borrower assumed their seasonal employer would write the letter when asked. Employer drags feet, gets it wrong, or refuses to commit to \"expected rehire\" wording. File stalls at conditions. Solution: get the letter at application, not at conditions.",
          "**4. Part-time job treated as primary by mistake.** Borrower has a primary salaried job and a part-time secondary job. Pre-approval treats the part-time income as primary because the recent paystubs are heavier. Underwriter recharacterizes at conditions, qualifying income drops. Solution: clarify primary vs. secondary at application; identify which W-2 is which.",
          "**5. Less-than-12-month history situations.** Borrower started a part-time job 8 months ago. LO pre-approves using the income. Underwriter excludes it entirely. Solution: don't include income with less than 12 months of history in qualifying; if needed, wait for the borrower to cross the threshold before applying.",
          "**6. Positive factors argued but not documented.** Borrower has 14 months of part-time income and the LO argues \"positive factors\" without documenting them. Underwriter declines the exception. Income is excluded. Solution: build the positive factors case in writing (letter from employer, trend documentation, line-of-work explanation) and submit it with the file rather than asserting it verbally.",
        ]} />
        <Para>
          In my experience, well-prepared files with these income types close at high rates. The failures are almost always about preparation gaps that could have been caught at <a href="/prequal" style={LINK_STYLE}>pre-approval</a>.
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page summarizes the qualifying rules for hourly, part-time, secondary, and seasonal income across the major agency loan programs as they exist in 2026. It is not:
        </Para>
        <Bullets items={[
          "**A guarantee that any specific scenario will qualify.** Lender overlays vary, and individual underwriters apply judgment.",
          "**A substitute for your LO.** Specific files require specific evaluation.",
          "**A complete reference for every income variation.** Overtime, bonus, tip income, commission income, and self-employment income are covered separately.",
        ]} />
        <Para>
          If your file involves business or 1099 income alongside hourly W-2 work, the <a href="/deep-dives/self-employed-documentation" style={LINK_STYLE}>Self-Employment Documentation Deep Dive</a> covers that side of the analysis. And if you're starting a new job, the <a href="/deep-dives/expected-income" style={LINK_STYLE}>Expected Income Deep Dive</a> walks through how lenders evaluate income that hasn't started yet.
        </Para>
        <Para>
          If you're trying to qualify with hourly, part-time, or seasonal income and want to walk through whether your specific situation works, I'm reachable at the contact info below. Bring two years of W-2s, recent paystubs, and an honest summary of how stable your hours and income have been. We'll work through the rest.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Want to walk through your specific hourly, part-time, or seasonal scenario?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:Nick.Peters@rate.com" aria-label="Email Nick Peters at Nick.Peters@rate.com" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Nick.Peters@rate.com</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring two years of W-2s, recent paystubs, and an honest summary of how stable your hours and income have been. We'll work through the rest.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B3-3.3-01 (Base Income, including variable base for hourly), B3-3.3-08 (Seasonal Income), B3-3.4-01 (General Requirements for Other Sources of Income), restructured March 4, 2026; Freddie Mac Single-Family Seller/Servicer Guide Sections 5303.2-5303.5, 5901.1-5901.3; HUD Handbook 4000.1, Section II.A.4.c.iii (hourly), II.A.4.c.iv & vi (part-time, secondary, seasonal), II.A.5.b.iv & vi; VA Lender's Handbook (Pamphlet 26-7), Chapter 4, Section 2-h; USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook (HB-1-3555), Attachment 9-A; author's 12+ years of field experience originating mortgages with hourly, part-time, and seasonal borrowers.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
