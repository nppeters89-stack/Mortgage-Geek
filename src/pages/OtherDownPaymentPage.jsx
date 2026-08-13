import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { GeekChartsLockup } from "../components/GeekChartsLockup";
import { withAlpha } from "../utils/format";
import { CostsHero, DsrChart, StudentLoanMountain, FlowBars, StockBars, AgeCompanion } from "../components/OtherDownPaymentCharts";

// Dark-mode Geek Charts page 9, "The Other Down Payment": the part-2 companion to
// the Price-to-Income page. An essay with seven visuals (a two-panel cost/age
// hero, the aggregate debt service ratio, the student loan mountain plus Treasury
// cohort stat cards, the 2025 reporting-switch timeline plus flow bars plus score
// stat cards, the delinquency stock bars plus an age companion, and a desk-math
// bar graphic). STATIC ONLY in this phase. The Recharts visuals live in
// OtherDownPaymentCharts; the stat cards, timeline, and desk-math graphic are
// styled markup defined here (mirroring how PriceToIncomePage defines its
// StatCard locally). Metadata + Article schema live in the route adapter
// (routes/other-down-payment.jsx). The global SiteFooter (layout route) renders
// the NMLS / Equal Housing compliance line, so this page keeps only its own
// education disclosure (not credit counseling, the score-floor qualifier, the
// sources list), rendered verbatim. Copy is rendered verbatim from Nick's
// canonical file. Colors from CHART_COLORS / P via withAlpha; no hardcoded hex.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SRC = withAlpha(CHART_COLORS.line, 0.5);
const SURFACE = P.navy;
const RED = CHART_COLORS.accent;
const LINK = { color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 };

// Beat marker above each chart section (the "Chart N of 5" kicker).
function Beat({ children }) {
  return <div style={{ color: RED, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginTop: 54, fontWeight: 600 }}>{children}</div>;
}

// Section heading. `tight` trims the top margin when the heading follows a Beat.
function Section({ children, tight }) {
  return <h2 style={{ fontFamily: F.display, fontSize: 26, color: CREAM, fontWeight: 400, lineHeight: 1.25, margin: tight ? "6px 0 14px" : "40px 0 16px" }}>{children}</h2>;
}

function Para({ children }) {
  return <p style={{ fontSize: 15, color: BODY, lineHeight: 1.75, margin: "0 0 18px", maxWidth: 720 }}>{children}</p>;
}

// A chart/stat card in its own surface panel, with an optional muted title above
// and an optional source note below (both rendered verbatim from the copy).
function Panel({ title, src, children }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 14, padding: "20px 20px 14px", margin: "16px 0 8px" }}>
      {title && <h3 style={{ fontSize: 13, color: MUTED, fontWeight: 500, margin: "0 0 12px", lineHeight: 1.4 }}>{title}</h3>}
      {children}
      {src && <p style={{ fontSize: 12, color: SRC, margin: "10px 2px 0", lineHeight: 1.5 }}>{src}</p>}
    </div>
  );
}

// The Treasury / score-damage stat cards. `red` tints the big number the lifted
// red; otherwise it is cream.
function BigNums({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ background: P.navyDark, borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: F.display, fontSize: 38, fontWeight: 600, color: it.red ? RED : CREAM, lineHeight: 1.05 }}>{it.v}</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.4 }}>{it.l}</div>
        </div>
      ))}
    </div>
  );
}

// The reporting-switch timeline: a vertical dot-and-stem list, the final "hot"
// step tinted red.
function Timeline({ steps }) {
  return (
    <div style={{ margin: "4px 0 6px" }}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.hot ? RED : withAlpha(CHART_COLORS.line, 0.5), marginTop: 5, flexShrink: 0 }} />
              {!last && <div style={{ width: 2, background: withAlpha(CHART_COLORS.line, 0.15), flex: 1, margin: "2px 0" }} />}
            </div>
            <div style={{ paddingBottom: last ? 0 : 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: s.hot ? RED : CREAM }}>{s.when}</div>
              <div style={{ fontSize: 14, color: s.hot ? CREAM : MUTED, marginTop: 2, lineHeight: 1.55 }}>{s.what}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The desk-math graphic: monthly payment beside a red bar whose width encodes the
// lost loan capacity, the dollar figure right-aligned inside the bar (the
// canonical layout from the attached file).
function DeskMath({ rows }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "6px 2px 10px" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 96, minWidth: 84, fontSize: 15, color: CREAM, flexShrink: 0, textAlign: "right" }}>{r.pay}</div>
          <div style={{ flex: 1, background: P.navyDark, borderRadius: 8, height: 40 }}>
            <div style={{ background: RED, height: "100%", borderRadius: 8, width: r.w, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10, fontWeight: 700, fontSize: 15, color: P.navyDark }}>{r.lost}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OtherDownPaymentPage() {
  return (
    <main style={{ fontFamily: F.body, color: CREAM, background: P.navyDark, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-white-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: BORDER, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--dark" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-cream-truered-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" />
            <a href="/geek-charts" style={{ fontSize: 13, color: MUTED, textDecoration: "none", fontWeight: 500 }}>← All Geek Charts</a>
          </div>
        </div>
      </div>

      <article className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <GeekChartsLockup variant="dark" compact height={30} style={{ marginBottom: 14 }} />
          <div style={{ color: RED, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, fontWeight: 600 }}>Geek Charts · Part 2</div>
          <h1 style={{ fontFamily: F.display, fontSize: 42, color: CREAM, fontWeight: 400, lineHeight: 1.1, margin: "0 0 10px" }}>
            The Costs Turned Around.<br /><span style={{ color: RED }}>The Age Didn't.</span>
          </h1>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.55, maxWidth: 660, margin: 0 }}>
            The force outside the housing market, and what today's first-time buyer carries before the house price even enters the math.
          </p>
        </header>

        <CostsHero />

        <Section>Where part 1 left off</Section>
        <Para>
          In <a href="/geek-charts/price-to-income-ratio" style={LINK}>The Price-to-Income Ratio</a>, the data told a strange story. For forty years, the typical American first-time homebuyer was between 28 and 33 years old. Then the range broke: 36 by 2022, a record 40 by 2025. The usual explanation, that houses are simply unaffordable, only half survives contact with the numbers. The <a href="/geek-charts/mortgage-payment-burden" style={LINK}>monthly payment</a> on the median new home sits almost exactly at its 56-year average. The entry price, the <a href="/geek-charts/price-to-income-ratio" style={LINK}>price-to-income ratio</a>, did spike to its all-time record in 2022, and the first leg of the age breakout (33 to 36) happened in exactly that window. That was the door. The charts above are the zoom-in: both cost lines peaked and turned around. The age line never got the memo.
        </Para>
        <Para>
          But then the door started easing. The ratio has come down every single year since the 2022 peak. And the age kept climbing anyway: 38 in 2024, 40 in 2025. Three years of an easing door with buyers getting older, not younger. Something outside the housing market, outside mortgage rates, is standing in front of the door.
        </Para>
        <Para>
          <strong style={{ color: CREAM }}>The objective of this page:</strong> follow the data to that force. The short version is that it is debt, but not the way the internet says it. The long version is five charts.
        </Para>

        <Beat>Chart 1 of 5: concede first</Beat>
        <Section tight>The chart skeptics will send us, and why we agree with it</Section>
        <Para>
          Start with the strongest argument against the debt story. Household debt service, all Americans, all debt: peak in 2007, record low in 2021, sitting below its own two-decade average today. America as a whole does not have a debt payment problem, and we are not going to pretend it does.
        </Para>
        <Para>
          But look at who is inside that average. It is dominated by homeowners, tens of millions of them locked into pandemic-era mortgage rates they will never see again. The same lock-in that starves housing inventory also makes the national debt picture look calm. The average is being held down by the people who already got in. This series is about the people trying to get in.
        </Para>
        <Panel
          title="Household debt service payments, percent of disposable income, quarterly, Q1 2005 to Q1 2026"
          src="Source: Board of Governors, Household Debt Service Ratios via FRED (TDSP), credit-bureau methodology, series begins 2005."
        >
          <DsrChart />
        </Panel>

        <Beat>Chart 2 of 5: the mountain</Beat>
        <Section tight>A debt category the 1981 buyer never had</Section>
        <Para>
          In 2006, the Fed's consumer credit data put total student loans at $481 billion. By the end of 2024 it was $1.78 trillion, 3.7x in under two decades, climbing roughly $80 billion a year through 2019 before the payment pause flattened the top. When the 29-year-old first-time buyer of 1981 walked into a lender's office, this mountain did not exist.
        </Para>
        <Panel
          title="Total student loans outstanding, quarterly, Q1 2006 to Q4 2024"
          src="Source: Board of Governors, G.19 Consumer Credit via FRED (SLOAS), quarterly, end of period. The Fed discontinued this breakout after Q4 2024; the NY Fed's credit-panel measure stands at $1.66 trillion as of Q1 2026. Student loans passed total credit card debt in 2010 per NY Fed."
        >
          <StudentLoanMountain />
        </Panel>
        <Para>
          And it did not land evenly. The Treasury Department ran the cohort numbers, families headed by 25 to 39 year olds, the exact first-time buyer demographic, using the Fed's Survey of Consumer Finances:
        </Para>
        <Panel
          title="Ages 25 to 39, inflation-adjusted, 1989 to 2022"
          src="Source: U.S. Treasury, &ldquo;How does the Well-Being of Young Adults Compare to Their Parents'?&rdquo; (Dec 2024), based on the Fed's Survey of Consumer Finances. Treasury's cited research links student debt to delayed household formation and lower homeownership rates."
        >
          <BigNums items={[
            { v: "2x", l: "real non-housing debt per young adult, nearly doubled" },
            { v: "9x", l: "growth in student loan debt, now over half their non-housing debt", red: true },
            { v: "15% → 40%", l: "share of young adults holding student debt, 1989 vs 2022" },
            { v: "42%", l: "of 25-39 student debt holders do not have a bachelor's degree", red: true },
          ]} />
        </Panel>

        <Beat>Chart 3 of 5: the switch</Beat>
        <Section tight>2025: the year the lates came back</Section>
        <Para>
          Here is the part of this story that almost nobody outside the mortgage industry understands, and it is the part loan officers watched happen at the desk, application by application, in the spring of 2025.
        </Para>
        <Para>
          For nearly five years, missed student loan payments effectively could not hurt a credit score. Payments and interest were paused in March 2020. When payments resumed in October 2023, the Department of Education added a one-year on-ramp: borrowers who fell behind would not be reported to the credit bureaus. That protection ended in the fall of 2024. Then the switch flipped. Thirty, sixty, and ninety day lates that had been accumulating invisibly began landing on credit reports all at once.
        </Para>
        <Panel title="The timeline">
          <Timeline steps={[
            { when: "March 2020", what: "Federal student loan payments and interest paused. Delinquencies effectively vanish from credit reports." },
            { when: "October 2023", what: "Payments resume, but a 12-month on-ramp keeps missed payments off credit reports." },
            { when: "Fall 2024", what: "The on-ramp ends. Delinquency reporting to credit bureaus resumes." },
            { when: "Q1 2025", what: "The accumulated lates hit credit reports. Scores collapse for millions of borrowers, many of them in the first-time buyer age range.", hot: true },
          ]} />
        </Panel>
        <Para>
          The credit data shows the switch flipping with almost no transition. The share of student loan balances newly rolling into serious delinquency went from under one percent to eight percent to nearly thirteen percent in two quarters:
        </Para>
        <Panel
          title="New flow into serious delinquency, student loans, percent of balances (90+ days)"
          src="Source: NY Fed Quarterly Report on Household Debt and Credit, flow into 90+ day delinquency by loan type."
        >
          <FlowBars />
        </Panel>
        <Para>And what that did to scores, in a single quarter:</Para>
        <Panel
          title="Credit score damage, Q1 2025 alone"
          src="Source: NY Fed Liberty Street Economics analysis of Q1 2025 Consumer Credit Panel data."
        >
          <BigNums items={[
            { v: "2.2M", l: "newly delinquent student loan borrowers whose scores dropped 100+ points", red: true },
            { v: "1M+", l: "borrowers whose scores dropped 150+ points", red: true },
          ]} />
        </Panel>
        <Para>
          Why this destroys mortgage applications specifically: home loans have credit score floors. Conventional financing typically requires a 620; FHA's best terms typically require a 580. A renter who was quietly at 660 and saving for a down payment, and who fell behind on a resumed student loan payment, could wake up in the spring of 2025 at 510 and find every program door closed at once. Not because their income changed. Not because the house got more expensive. Because a reporting rule changed.
        </Para>

        <Beat>Chart 4 of 5: the result</Beat>
        <Section tight>Back to the old normal, at the worst possible time</Section>
        <Para>
          Within five quarters, the share of all student loan balances 90 or more days delinquent went from under one percent back above ten, which is roughly where it sat throughout the 2010s. The delinquency rate is not unprecedented. What is unprecedented is the cohort it landed on: buyers already facing a door near 3.8 times income, already the oldest first-time buyers ever recorded.
        </Para>
        <Panel
          title="Student loans: percent of balances 90+ days delinquent"
          src="Source: NY Fed Consumer Credit Panel / Quarterly Report on Household Debt and Credit. Pause-era rate reported below 1%."
        >
          <StockBars />
        </Panel>
        <Panel
          title="Meanwhile: median first-time buyer age, same window"
          src="Source: NAR Profile of Home Buyers and Sellers."
        >
          <AgeCompanion />
        </Panel>

        <Beat>Chart 5 of 5: the desk math</Beat>
        <Section tight>What it costs at the mortgage desk</Section>
        <Para>
          Even for the borrower who never missed a payment, the debt still shows up, because monthly student loan payments count in the debt-to-income ratio that determines how much home a lender can approve. The payments convert directly into house you cannot buy. At today's rates, every dollar of monthly debt payment is roughly 158 dollars of loan you no longer qualify for.
        </Para>
        <Panel
          title="Monthly student loan payment vs. lost loan capacity at 6.5%, 30-year"
          src="Standard amortization math at a 6.5% 30-year rate. Illustrative of DTI mechanics, not a loan offer; individual qualification varies by program and full application."
        >
          <DeskMath rows={[
            { pay: "$200/mo", w: "34%", lost: "-$32,000" },
            { pay: "$400/mo", w: "66%", lost: "-$63,000" },
            { pay: "$600/mo", w: "100%", lost: "-$95,000" },
          ]} />
        </Panel>

        <Section>The reconciliation</Section>
        <Para>
          So here is the full two-force story, honestly told. The first leg of the age breakout, 33 to 36 in 2021 and 2022, was the door: the entry price of a home hitting its all-time record against income. The second leg, the climb to 38 and then a record 40 even as the door eased, coincides with the other down payment coming due: a debt category that grew from half a trillion to nearly two trillion dollars, concentrated on the first-time buyer cohort, whose consequences were switched back on all at once in 2025, first through credit scores and always through debt-to-income.
        </Para>
        <Para>
          National debt statistics look calm because they average the locked-in with the locked-out. The first-time buyer is the locked-out, carrying the one debt their parents' generation never had, into the hardest entry market their parents' generation never faced.
        </Para>
        <Para>
          And the reason this page exists: unlike the price of houses, this force is addressable at the individual level. Payment plans that lower the DTI hit, rehabilitation paths for damaged credit, timing strategies for when to apply. That is a strategy conversation, and it is exactly the hour of work that turns a frozen application into a plan.
        </Para>

        <div style={{ background: withAlpha(CHART_COLORS.accent, 0.08), border: `1px solid ${withAlpha(CHART_COLORS.accent, 0.3)}`, borderRadius: 12, padding: "18px 22px", marginTop: 40 }}>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, margin: 0 }}>
            Educational market commentary, not a loan offer or commitment to lend, and not credit counseling. Sources: Federal Reserve Board (FRED TDSP, SLOAS), Federal Reserve Bank of New York Consumer Credit Panel and Liberty Street Economics, U.S. Department of the Treasury / Survey of Consumer Finances, NAR Profile of Home Buyers and Sellers. All figures verified against the cited primary sources. Program credit score minimums are typical guidelines and vary by lender and full application.
          </p>
        </div>
      </article>

      <MobileToolbar />
    </main>
  );
}
