import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { RatesHistoryChart } from "../components/RatesHistoryChart";
import { withAlpha } from "../utils/format";
import { GeekChartsLockup } from "../components/GeekChartsLockup";

// Dark-mode Geek Charts page. Metadata + Article schema live in the route
// adapter (routes/rates-history.jsx). The global SiteFooter (layout route)
// renders the NMLS / Equal Housing compliance line, so this page carries only
// data-source attribution and the provided educational caveat, not new
// regulatory disclosure. Mirrors GoldHousingRatioPage's structure and tokens.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;

const STATS = [
  { label: "The 1981 peak", value: "16.64%", sub: "mortgage; 13.91% Treasury (weekly high 18.63% in Oct 1981)", color: CHART_COLORS.accent },
  { label: "Record lows", value: "2.96%", sub: "mortgage (2021); 0.89% Treasury (2020)", color: CREAM },
  { label: "Today (Jul 9, 2026)", value: "6.43%", sub: "mortgage; 4.55% Treasury", color: CHART_COLORS.mortgage },
  { label: "The spread", value: "1.88 pts", sub: "today, against a historical norm near 1.7 points", color: CHART_COLORS.trend },
];

const MEANS = [
  {
    title: "Today's rate is not the anomaly, the 3% era was",
    body: "The full-history average for the 30-year fixed is near 7.7%. A 6 handle sits below that average. Buyers waiting for a return to 2021 are waiting on the most unusual moment in the series, not on a normal one.",
  },
  {
    title: "Watch the spread, not just the Fed",
    body: "Mortgages price off the 10-year Treasury plus a spread, not off the Fed funds rate. The spread widened to roughly 2.9 points in 2023 and has been grinding back toward its 1.7 point norm. That means mortgage rates can improve even in a week when the 10-year does not move, which is why rate watching and rate locking are two different disciplines.",
  },
  {
    title: "For referral partners",
    body: "This is the chart to send a buyer who is frozen on rate. It reframes 6% from historically terrible to historically ordinary, and it shifts the conversation from timing the market to structuring the loan. Refinancing later is a strategy, not a promise, and I will not pretend otherwise on a call.",
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

export function RatesHistoryPage() {
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
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>The 10-Year Treasury and the 30-Year Mortgage</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
            Seventy years of the benchmark rate that sets mortgage pricing, and the mortgage rate that rides on top of it.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <RatesHistoryChart />
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
          The thick trend line turns the noise into one arc: a three-decade climb to a 10.69% peak in 1988, a long glide down to 2.04% in 2021, and five straight years of rising trend since, the first sustained upturn since the 1980s. The mortgage line shadows the Treasury line the whole way, shifted up by the spread. Freddie Mac's survey begins in April 1971, so the mortgage line starts there. The trend line begins in 1962 because it needs ten years of data. The 2026 point is the July 9, 2026 reading, with the 10-year at 4.55% and the 30-year fixed at 6.43%.
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
            <strong style={{ color: CREAM }}>A note on reading this.</strong> The rates shown are historical averages, not offers, and nobody can predict where rates go next. A trailing 10-year average will keep drifting up for a few years purely because the 2020 lows are rolling out of the window, which is not itself a forecast. This is educational content only, not a commitment to lend and not a rate quote.
          </p>
        </div>

        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, marginTop: 40 }}>
          Related chart: <a href="/geek-charts/mortgage-payment-burden" style={{ color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 }}>The Mortgage Payment Burden</a>.
        </p>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 24, fontStyle: "italic" }}>
          Sources: Treasury is the Federal Reserve H.15 market yield on U.S. Treasury securities at 10-year constant maturity (FRED: GS10), annual averages of monthly data; 1953 covers April to December, the series start. Mortgage is the Freddie Mac Primary Mortgage Market Survey 30-year fixed rate average (FRED: MORTGAGE30US), annual averages of weekly data, series begins April 1971. The 2026 points are spot readings as of July 9, 2026. The trend line is a trailing 10-year simple moving average of the Treasury series, first plotted in 1962. Linear scale from zero.
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
