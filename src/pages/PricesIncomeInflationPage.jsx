import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { PricesIncomeInflationChart } from "../components/PricesIncomeInflationChart";
import { withAlpha } from "../utils/format";
import { GeekChartsLockup } from "../components/GeekChartsLockup";

// Dark-mode Geek Charts page. Metadata + Article schema live in the route adapter
// (routes/prices-income-inflation.jsx). The global SiteFooter (layout route)
// renders the NMLS / Equal Housing compliance line, so this page carries only
// data-source attribution and the provided educational note, not new regulatory
// disclosure. Mirrors the other Geek Charts pages' structure and tokens.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;

const STATS = [
  { label: "Average home price, 1970 to 2025", value: "19.5x", sub: "$26,650 to $519,700", color: CHART_COLORS.mortgage },
  { label: "Median family income, 1970 to 2024", value: "10.7x", sub: "$9,867 to $105,800", color: CHART_COLORS.income },
  { label: "Inflation (CPI), 1970 to 2025", value: "8.3x", sub: "index 38.8 to 322.2", color: CREAM },
  { label: "The gap", value: "1.8x", sub: "homes rose about 1.8x faster than incomes", color: CHART_COLORS.accent },
];

const MEANS = [
  {
    title: "Why the goalposts keep moving",
    body: "If home prices grow faster than your income, the down payment target is not standing still while you save toward it. A buyer saving 10% of income toward a 5% down payment is chasing a number that has historically outrun the savings rate. That is not a reason to panic. It is the reason strategy beats patience: low down payment programs, down payment assistance, and gift funds exist precisely because of this chart.",
  },
  {
    title: "The honest version of the squeeze",
    body: "This chart is real, and it is also smaller than social media says. Homes beat incomes by roughly 1.8x over 55 years, not 10x. Incomes genuinely outran inflation. The right conclusion is not that homeownership is impossible. It is that it takes more structure than it took in 1970, which is a solvable problem, not a verdict.",
  },
  {
    title: "For referral partners",
    body: "This is the chart behind the phrase “my clients feel priced out.” The feeling is grounded in 55 years of arithmetic, and the answer lives on the financing side: program selection, assistance layering, and payment structuring. Send the feeling, and the numbers conversation is handled from there.",
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

export function PricesIncomeInflationPage() {
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
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>Home Prices, Inflation, and Family Income</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 660, margin: 0 }}>
            Three lines set to 100 in 1970 and left to run for 55 years. The vertical gaps are the whole story: what homes did, what paychecks did, and what the dollar itself did.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <PricesIncomeInflationChart />
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
          All three lines are nominal, so this is a true apples-to-apples race. There are two gaps to read. Home prices (red) pulling above income (blue) is the affordability squeeze: homes rose about 1.8 times faster than family incomes over the full stretch. Income sitting above inflation (cream) means paychecks did beat the cost of living, just nowhere near as fast as housing. The income series runs through 2024, the latest the Census has published.
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

        <div style={{ background: withAlpha(CHART_COLORS.income, 0.08), border: `1px solid ${withAlpha(CHART_COLORS.income, 0.3)}`, borderRadius: 12, padding: "18px 22px", marginTop: 32 }}>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: CREAM }}>A note on the data.</strong> All three series are nominal, which is what makes the comparison fair. Home prices are the average new home sold (Census ASPUS), used because it is the longest consistent dollar series; the median home shows the same shape at a slightly smaller multiple. Income is median family income, which reflects households adding second earners over these decades; individual wages grew slower. One line on this chart describes no individual market or file. Education only.
          </p>
        </div>

        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, marginTop: 40 }}>
          Related chart: <a href="/geek-charts/mortgage-payment-burden" style={{ color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 }}>The Mortgage Payment Burden</a>.
        </p>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 24, fontStyle: "italic" }}>
          Sources: Home prices are the Census and HUD average sales price of houses sold (ASPUS), annual averages of quarterly data, 1970 to 2025. Inflation is BLS CPI-U, all items, U.S. city average, annual averages (FRED: CPIAUCSL). Income is Census median family income in current dollars (FRED: MEFAINUSA646N), through 2024. All series are indexed to 1970 = 100; linear scale from zero.
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
