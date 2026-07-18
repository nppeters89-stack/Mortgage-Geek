import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { HomesInSp500Chart } from "../components/HomesInSp500Chart";
import { BuyVsInvestChart } from "../components/BuyVsInvestChart";
import { withAlpha } from "../utils/format";
import { GeekChartsLockup } from "../components/GeekChartsLockup";
import { useHasHover } from "../utils/hooks";

// Dark-mode Geek Charts page, the first with two charts. Metadata + Article
// schema live in the route adapter's meta export (routes/homes-in-sp500.jsx),
// not here. The global SiteFooter (layout route) renders the NMLS / Equal
// Housing compliance line; the honest-reading note below is this page's
// data/education disclosure and is the compliance load-bearing wall on the most
// investment-adjacent page in the series, kept verbatim. The page is a
// three-beat argument: the ratio, the leverage explainer, then the projection.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;
const LINK = { color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 };

const STATS = [
  { label: "All-time high", value: "700", sub: "1982, the death-of-equities era", color: CHART_COLORS.accent },
  { label: "All-time low", value: "68", sub: "today, $514.6K home / S&P 7,570", color: CHART_COLORS.sp500 },
  { label: "The unlevered scoreboard", value: "91x vs 19x", sub: "since 1970, price only", color: CREAM },
  { label: "Growth rates", value: "8.4% vs 5.4%", sub: "annual, price only", color: CREAM },
];

// Featured leverage panel cells. Distinct from the takeaway cards below.
const LEVERAGE = [
  {
    label: "The setup",
    value: "$500K home, 5% down",
    color: CREAM,
    body: "$25,000 of your cash controls the full $500,000 asset. That is 20-to-1 leverage.",
  },
  {
    label: "One average year",
    value: "+$27,000",
    color: CHART_COLORS.mortgage,
    body: "At housing's 5.4% historical average appreciation, the full $500K grows, not your $25K. Roughly a 108% gain on your cash, before costs.",
  },
  {
    label: "Same cash, unlevered",
    value: "+$2,500",
    color: CHART_COLORS.sp500,
    body: "$25,000 in the index at a 10% total-return year. Strong, real, and one tenth the equity move, because there is no leverage.",
  },
  {
    label: "The unfair advantage",
    value: "No margin call",
    color: CREAM,
    body: "Borrowing 20-to-1 against stocks triggers forced liquidation on any dip. A 30-year fixed cannot be called for a price decline. Make the payment and nobody can make you sell.",
  },
];

const MEANS = [
  {
    title: "Leverage cuts both ways",
    body: "The same 20-to-1 math works in reverse: a 5% price decline wipes out a 5% down payment on paper, and 2008 to 2011 is sitting right there on this chart. The protection is not that losses cannot happen. It is that you cannot be forced to realize them. The discipline that makes the leverage safe is a payment you can comfortably hold through a bad market, which is a structuring question, not a timing question.",
  },
  {
    title: "It is not stocks or houses",
    body: "The house does a job the index fund cannot: it replaces rent, the one cost that has never gone down. The index does a job the house cannot: liquidity and diversification. Most people should aim to own both. The mistake this chart argues against is treating the down payment and the brokerage account as rivals for the same dollar without noticing the leverage asymmetry between them.",
  },
  {
    title: "For referral partners",
    body: "Financial advisors, this is the chart for the client who says the market beats real estate so they will keep renting and investing. They are right on the first half and wrong on the conclusion, and the 20-to-1 panel above is why. Clients also do not need to liquidate the portfolio to buy: down payment sourcing from securities, reserve requirements, and gift funds are financing questions, and those are handled from here.",
  },
];

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: F.display, fontSize: 30, color, lineHeight: 1.05 }}>{value}</div>
      <div style={{ fontSize: 12, color: BODY, marginTop: 6, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

export function HomesInSp500Page() {
  const hasHover = useHasHover();
  return (
    <main style={{ fontFamily: F.body, color: CREAM, background: P.navyDark, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>
      <style>{`
        /* Phones: trim the Part 2 panel's side padding so the projection chart
           inside it has room to breathe. Paired with the negative margin on
           .bvi-plot, the chart spans nearly the full panel width. */
        @media (max-width: 700px) {
          .sp500-part2 { padding-left: 14px !important; padding-right: 14px !important; }
          .sp500-steps li { margin-bottom: 10px; }
        }
      `}</style>

      <div className="pwa-safe-top" style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-white-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: BORDER, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--dark" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-cream-truered-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <a href="/geek-charts" style={{ fontSize: 13, color: MUTED, textDecoration: "none", fontWeight: 500 }}>← All Geek Charts</a>
        </div>
      </div>

      <article className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <header style={{ marginBottom: 28 }}>
          <GeekChartsLockup variant="dark" compact height={30} style={{ marginBottom: 14 }} />
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>Homes Priced in the S&P 500</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
            How many units of the S&P 500 index it takes to buy the average American home. The line has fallen for four decades because stocks outran houses. The interesting part is why regular people built wealth in houses anyway.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <HomesInSp500Chart />
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
          In 1982, with inflation raging and magazine covers declaring the death of equities, the average home cost 700 units of the index, the all-time high. Today it costs 68, the all-time low, less than half the prior record set at the dot-com peak. Read it honestly: houses did not get cheap in dollars; stocks got expensive, relentlessly, for four decades. Unlevered and before dividends, the index turned 1 dollar into 91 since 1970; the average house turned 1 dollar into about 19.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 32 }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <h2 style={{ fontFamily: F.display, fontSize: 28, color: CREAM, fontWeight: 400, lineHeight: 1.2, margin: "48px 0 18px" }}>What this means for you</h2>

        {/* Featured leverage panel: distinct treatment (blue-tinted surface, boxed
            four-cell grid), not a standard takeaway card. */}
        <div style={{ background: withAlpha(CHART_COLORS.sp500, 0.06), border: `1px solid ${withAlpha(CHART_COLORS.sp500, 0.32)}`, borderRadius: 16, padding: "26px 24px" }}>
          <h3 style={{ fontFamily: F.display, fontSize: 22, color: CREAM, fontWeight: 400, lineHeight: 1.25, margin: "0 0 20px" }}>The part the chart cannot show: nobody buys a house unlevered.</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
            {LEVERAGE.map((c) => (
              <div key={c.label} style={{ background: P.navyDark, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontFamily: F.display, fontSize: 24, color: c.color, lineHeight: 1.1, marginBottom: 10 }}>{c.value}</div>
                <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "22px 0 0" }}>
            Stocks won the unlevered race, and it was not close. But no ordinary person can hold 20-to-1 leverage on the S&P 500 through a bad month, let alone thirty years. The 30-year fixed-rate mortgage is the only instrument that lets a regular household apply that kind of leverage to an appreciating asset with a locked cost, no forced sales, and a place to live inside the position. That, not superior price growth, is why housing built the American middle class.
          </p>
        </div>

        {/* Part 2 panel: the projection. Carries an Arrow Red top rule and a
            red heading so the interactive half of the article reads as its own
            act rather than another paragraph. The rule is the true Arrow Red
            (P.gold); the heading uses the lighter tint (P.goldLight), which
            clears AA on this panel where the full-strength red would not. */}
        <div className="sp500-part2" style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderTop: `4px solid ${P.gold}`, borderRadius: 16, padding: "26px 24px", marginTop: 32 }}>
          <h3 style={{ fontFamily: F.display, fontSize: 25, color: P.goldLight, fontWeight: 400, lineHeight: 1.25, margin: "0 0 12px" }}>Part 2: the same $25,000, two different futures.</h3>
          <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "0 0 18px", maxWidth: 720 }}>
            Take the down payment from the panel above and run both paths forward for 30 years using each asset's own historical average: the house at 5.4% appreciation, the index at a 10% total return. Same starting cash, and this version charges the buyer the full carrying cost: taxes, insurance, and mortgage insurance until it drops at 20% equity via the automatic 78% rule.
          </p>
          {/* Step 1 is called out in red because the controls are locked until
              the four lines are drawn. Without this, the rate slider and the
              strategy pills read as broken rather than as not-yet-unlocked. */}
          <ol className="sp500-steps" style={{ margin: "0 0 24px", padding: 0, listStyle: "none", maxWidth: 720 }}>
            <li style={{ fontSize: 14, color: BODY, lineHeight: 1.7, marginBottom: 8 }}>
              <strong style={{ color: P.goldLight, fontWeight: 700 }}>Step 1: draw the chart.</strong>{" "}
              {hasHover ? "Click" : "Tap"} the draw button four times to lay down the lines one at a time: the index path, home equity, net profit, then the faster payoff. The controls below stay locked until all four are drawn.
            </li>
            <li style={{ fontSize: 14, color: BODY, lineHeight: 1.7, marginBottom: 8 }}>
              <strong style={{ color: CREAM, fontWeight: 700 }}>Step 2: set the rate.</strong>{" "}
              It defaults to today's conventional rate. Move it and every figure recomputes.
            </li>
            <li style={{ fontSize: 14, color: BODY, lineHeight: 1.7, marginBottom: 8 }}>
              <strong style={{ color: CREAM, fontWeight: 700 }}>Step 3: pick an early payoff strategy.</strong>{" "}
              Monthly, annual, or bi-weekly, and enter your own extra amount. Watch the interest shrink and the profit line move.
            </li>
            <li style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: CREAM, fontWeight: 700 }}>Step 4: flip on reinvest.</strong>{" "}
              That keeps the freed payment flowing into the index after the loan is gone.
            </li>
          </ol>
          <BuyVsInvestChart />
          <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
            The red line is gross equity: roughly $2.42 million by year 30, against $436,000 in the index, from identical starting dollars. The gold line is the strictest test: net profit after charging the buyer for everything. Principal and interest total about $1,073,000 over 30 years at the default rate, including about $598,000 of interest; property taxes and insurance add about $165,000 more; mortgage insurance runs about $146 a month until the loan amortizes down to 78% of the original price ($390,000), which takes 11 years 3 months on the standard schedule and totals about $19,600. Extra payments attack that directly: $500 a month cuts the MI period nearly in half. Charge all of it, and the buyer is underwater on paper for a decade (bottoming near minus $35,000 around year six), breaks even in year eleven, and still finishes at about $1.14 million, roughly 2.8 times the index path's $411,000 gain. The costs are real, and the leverage pays for all of them. Hover any year to watch the calculation strip below rebuild the number in front of you.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 32 }}>
          {MEANS.map((m, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CHART_COLORS.gold}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontFamily: F.display, fontSize: 18, color: CREAM, marginBottom: 10, lineHeight: 1.25 }}>{m.title}</div>
              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65, margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>

        <div style={{ background: withAlpha(CHART_COLORS.accent, 0.08), border: `1px solid ${withAlpha(CHART_COLORS.accent, 0.3)}`, borderRadius: 12, padding: "18px 22px", marginTop: 32 }}>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: CREAM }}>How to read this honestly.</strong> The S&P line in the ratio chart is price only; with dividends reinvested, stocks won by even more. Homes also carry taxes, insurance, and maintenance that an index fund does not, and homeowners collect an offsetting benefit by not paying rent. The Part 2 projection charges the buyer taxes, insurance, and mortgage insurance on top of every loan payment, which is why the net profit line spends its first decade underwater; what it still leaves out is maintenance on one side and rent on the other. The investor pays rent the whole time, and rent has never gone down. Steady average growth every year is a simplification no real 30 years will match; both assets have losing years, and leverage magnifies the house's losing years exactly as it magnifies the winners. Every figure is a national average and a historical one; past performance does not predict future results. Education, not investment advice.
          </p>
        </div>

        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, marginTop: 32 }}>
          Related chart: <a href="/geek-charts/rent-vs-home-prices" style={LINK}>The Rent Line</a>.
        </p>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 24, fontStyle: "italic" }}>
          Sources: Home prices are the Census and HUD average sales price of houses sold (ASPUS), annual averages, with 2026 using the Q1 2026 reading ($514,600). S&P 500 is annual averages of monthly average closing prices, Standard and Poor's via Robert Shiller's dataset (multpl.com); the 2026 point is the spot level as of July 13, 2026 (7,570), price only, excludes dividends. Ratio equals home price divided by index level. Part 2: rate defaults from the site's live conventional rate (Mortgage News Daily via the calculator's source), rounded to 0.125 and bumped 0.125, 6.43% fallback, adjustable, payment recomputed at the selected rate. Taxes $3,756 per year (0.75%, the Tennessee state average) and insurance $1,752 per year (0.35%), held flat; MI at 0.37% of the original loan until the balance amortizes to 78% of the original purchase price ($390,000), the automatic termination standard, 11 years 3 months on the base schedule and sooner with extra payments; borrower-requested removal based on current value can end MI earlier in practice and the model uses the automatic rule as the conservative case. Net profit equals equity plus any side fund minus the down payment and every dollar of principal, interest, taxes, insurance, and mortgage insurance paid; maintenance excluded, no rent charged to the index path. Interest saved compares against a no-extra loan at the same selected rate. Reinvest directs the freed payment into the index at the same 10% return after payoff, within the 30-year window, while taxes and insurance continue.
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
