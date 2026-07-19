import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { PaymentBurdenChart } from "../components/PaymentBurdenChart";
import { withAlpha } from "../utils/format";
import { GeekChartsLockup } from "../components/GeekChartsLockup";

// Dark-mode Geek Charts page. Metadata + Article schema live in the route adapter
// (routes/payment-burden.jsx). The global SiteFooter (layout route) renders the
// NMLS / Equal Housing compliance line; the methodology note below is the page's
// data/education disclosure and is kept verbatim. Mirrors the other Geek Charts
// pages' structure and tokens.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;
const LINK = { color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 };

const STATS = [
  { label: "All-time peak", value: "41.3%", sub: "1981 ($770/mo at 16.64%)", color: CHART_COLORS.accent },
  { label: "All-time low", value: "16.0%", sub: "2020 ($1,122/mo at 3.11%)", color: CREAM },
  { label: "The recent squeeze", value: "26.5%", sub: "2023, improving every year since", color: CHART_COLORS.gold },
  { label: "Today (2026)", value: "23.0%", sub: "just below the 23.7% average", color: CREAM },
];

const MEANS = [
  {
    title: "If it feels harder than your parents had it",
    body: "Depends which parents. The 2010s buyer had the easiest payment math in the series and anchored everyone's expectations. The 1981 buyer put 41% of the median income toward the same house, more than double today's burden, and that cohort kept the house and refinanced down the mountain as rates fell for decades. Today's 23% is roughly the average American homebuying experience since 1971.",
  },
  {
    title: "If you are waiting for affordability to come back",
    body: "It already started, and nobody sent a press release. The burden peaked at 26.5% in 2023 and has fallen three straight years through the quiet route: flat prices, easing rates, growing incomes. That is how affordability has always repaired itself on this chart, gradually, not through a crash. Waiting for a dramatic moment usually means competing with everyone else who waited.",
  },
  {
    title: "For referral partners",
    body: "This is the chart for the frozen client who says they will buy when things get better. Things have been getting better for three years, measurably. The conversation shifts from timing to structure: what payment fits their income today, which program gets them there, and how the payment changes if rates keep easing. That last part is a strategy discussion handled carefully, not a promise.",
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

export function PaymentBurdenPage() {
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
        <header style={{ marginBottom: 28 }}>
          <GeekChartsLockup variant="dark" compact height={30} style={{ marginBottom: 14 }} />
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>The Mortgage Payment Burden</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 660, margin: 0 }}>
            The mortgage payment on the median new home, at that year's average 30-year rate, as a share of the median family's income. One line that combines prices, rates, and paychecks into the only number a buyer actually lives with.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <PaymentBurdenChart />
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
          After the 2022 rate shock pushed the burden to 26.5% in 2023, it has improved three years running, and today's 23.0% sits slightly below the 56-year average of 23.7%. Prices flattened, rates eased, incomes kept growing. The real outliers on this chart are 1981, when the same payment consumed 41% of the median family's income, and the 2009 to 2021 stretch, when cheap money made housing artificially light.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 32 }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <h2 style={{ fontFamily: F.display, fontSize: 28, color: CREAM, fontWeight: 400, lineHeight: 1.2, margin: "48px 0 18px" }}>What this means for you</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {MEANS.map((m, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CHART_COLORS.gold}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontFamily: F.display, fontSize: 18, color: CREAM, marginBottom: 10, lineHeight: 1.25 }}>{m.title}</div>
              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65, margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>

        <div style={{ background: withAlpha(CHART_COLORS.accent, 0.08), border: `1px solid ${withAlpha(CHART_COLORS.accent, 0.3)}`, borderRadius: 12, padding: "18px 22px", marginTop: 32 }}>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: CREAM }}>Methodology.</strong> Principal and interest on the median new home (Census MSPUS) with 20% down, at Freddie Mac's average 30-year rate for that year, divided by median family income. Excludes taxes, insurance, and mortgage insurance, and buyers putting less down carry a higher share. Income data runs through 2024, so 2025 and 2026 hold the latest reading, which if anything overstates today's burden. This measures the median new home against the median family; individual markets and files differ. Education, not a prequalification.
          </p>
        </div>

        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, marginTop: 32 }}>
          Related charts: <a href="/geek-charts/treasury-yield-mortgage-rates" style={LINK}>The 10-Year Treasury and the 30-Year Mortgage</a>, <a href="/geek-charts/home-prices-income-inflation" style={LINK}>Home Prices, Inflation, and Family Income</a>, and <a href="/geek-charts/rent-vs-home-prices" style={LINK}>The Rent Line</a>.
        </p>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 24, fontStyle: "italic" }}>
          Sources: Home prices are the Census and HUD median sales price of houses sold (MSPUS), annual averages; 2026 uses the Q1 2026 reading ($403,200). Rates are the Freddie Mac Primary Mortgage Market Survey 30-year fixed average, annual averages; 2026 is the July 9, 2026 reading (6.43%). Income is Census median family income (FRED: MEFAINUSA646N) through 2024, with 2025 and 2026 holding the 2024 value ($105,800) as the latest available. Payment is P&I on an 80% loan-to-value 30-year fixed; linear scale from zero.
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
