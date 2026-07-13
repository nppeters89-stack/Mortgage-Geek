import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { GoldHousingRatioChart } from "../components/GoldHousingRatioChart";
import { withAlpha } from "../utils/format";

// Dark-mode Geek Charts page. Metadata + Article schema live in the route
// adapter's meta export (routes/gold-housing-ratio.jsx), not here. The global
// SiteFooter (layout route) renders the NMLS / Equal Housing compliance line, so
// this page carries only data-source attribution, not regulatory disclosure.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;

const STATS = [
  { label: "All-time high", value: "779 oz", sub: "2001", color: CHART_COLORS.accent },
  { label: "All-time low", value: "124 oz", sub: "1980 and today", color: CREAM },
  { label: "Today", value: "124 oz", sub: "$514.6K home, $4,144 gold (Jul 9 2026)", color: CHART_COLORS.gold },
  { label: "Vs. long-run average", value: "67% below", sub: "the 374 oz average since 1970", color: CREAM },
];

const MEANS = [
  {
    title: "If you own gold and want a home",
    body: "Gold has never bought more house than it does right now. The buyers sitting at this same ratio in 1980 watched it climb from 124 to 779 ounces by 2001, so a strong entry point is not a guarantee of anything. If you decide to sell metal and buy, the proceeds are documentable mortgage funds. Building that paper trail cleanly is my job, not yours.",
  },
  {
    title: "If you are waiting for dollar prices to fall",
    body: "The lows on this chart came from gold spiking, not from housing crashing. In actual dollars, the average home climbed through every gold cycle shown here. Waiting for a dollar-price drop that history does not show is a hard plan to win. Affordability is something we improve through rate, program, and strategy.",
  },
  {
    title: "For referral partners",
    body: "Plenty of advisors and agents have clients sitting on 2024 to 2026 gold gains. Repositioning metal into property is a financing event, and large-deposit sourcing on a gold sale is a documentation puzzle I solve routinely. Send them over and I will handle the paper.",
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

export function GoldHousingRatioPage() {
  return (
    <main style={{ fontFamily: F.body, color: CREAM, background: P.navyDark, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>

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
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: CHART_COLORS.gold, display: "block", marginBottom: 12 }}>📊 Geek Charts</span>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>The Gold-to-Housing Ratio</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
            How many ounces of gold it takes to buy the average American home, from 1970 to today.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <GoldHousingRatioChart />
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
          Today the ratio sits at about 124 ounces, a dead tie with January 1980 for the fewest ever recorded. Both lows were driven by gold spiking, not by housing crashing. The all-time high was 779 ounces in 2001. Gold was pegged by the government near $35 an ounce until August 1971, so the earliest years on the chart reflect a fixed price, not a free market.
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
            <strong style={{ color: CREAM }}>A note on reading this.</strong> This is education, not investment advice. The ratio has only visited this level once before, in 1980, which makes it a story worth knowing, not a statistical pattern you can lean on. Nobody knows where gold or home prices go next.
          </p>
        </div>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Home prices are the Census and HUD average sales price of houses sold (ASPUS), annual averages, with Q1 2026 as the latest reading. Gold is the London PM fix annual average, compiled by NMA from World Gold Council, Kitco, and LBMA data, with the 2025 LBMA average at $3,431.54 and Jul 9 2026 spot near $4,144. The ratio is average home price divided by gold price per ounce. Gold was pegged near $35 an ounce until August 1971.
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
