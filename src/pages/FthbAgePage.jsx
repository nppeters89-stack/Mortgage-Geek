import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { FthbAgeChart } from "../components/FthbAgeChart";
import { withAlpha } from "../utils/format";
import { GeekChartsLockup } from "../components/GeekChartsLockup";

// Dark-mode Geek Charts page 7: the median age of the first-time homebuyer.
// Metadata + Article schema live in the route adapter's meta export
// (routes/fthb-age.jsx), not here. The global SiteFooter (layout route) renders
// the NMLS / Equal Housing compliance line; the honest-reading note below is
// this page's education disclosure and is the compliance load-bearing wall on a
// page about a generational trend, kept verbatim. The axis-floor disclosure in
// the sources footer is what makes the 18 y-axis floor defensible.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;
const LINK = { color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 };

const STATS = [
  { label: "Where it started", value: "29", sub: "1981; record low 28 in 1991", color: CREAM },
  { label: "Where it is now", value: "40", sub: "2025, all-time high, up 11 years", color: CHART_COLORS.accent },
  { label: "First-time buyer share", value: "21%", sub: "record low, vs a roughly 40% norm before 2008", color: CHART_COLORS.gold },
  { label: "Meanwhile, repeat buyers", value: "36 to 62", sub: "median age, 1981 to 2025", color: CHART_COLORS.income },
];

const MEANS = [
  {
    title: "If you feel behind, read this first",
    body: "You are not failing at something your parents found easy. The game changed. Prices outran incomes for fifty years, rent compounded underneath everyone trying to save, and the down payment target moved while people chased it. The median first-time buyer is now 40. Feeling behind at 32 means you are ahead of the median. The useful response is not shame. It is strategy, because strategy is exactly what the successful 21% are using.",
  },
  {
    title: "The 20% down myth is part of the problem",
    body: "A lot of people are waiting on a number they never actually needed. Per NAR, the typical first-time buyer has put down 6 to 9 percent, not 20, every year since 2018. FHA starts at 3.5 percent, VA at zero, and down payment assistance and gift funds stack on top. Every year spent saving toward the wrong target is a year this chart climbs and a year of rent that never comes back. The entry ticket is smaller than the myth says. Knowing the real number is the whole job.",
  },
  {
    title: "For referral partners",
    body: "The first-time buyer pipeline did not dry up because the desire disappeared. It dried up because the entry problem got harder, and 21% share is what that looks like. The agents winning this segment are the ones partnered with someone who solves entry problems for a living: program selection, assistance layering, gift documentation, co-borrower structuring. Send the renter who thinks they are five years away. Half the time the real answer is measured in months.",
  },
  {
    title: "Wait, wasn't 1981 worse?",
    body: "Sharp catch. The mortgage payment in 1981 ate 41% of the median income, the worst ever, and buyers were still 29. Here is the reconciliation: 1981 was a payment crisis with a cheap door. The median home cost 3.1 times income and 20% down was about 62% of a year's pay, so people bought young, suffered the rate, and refinanced down for decades. A rate problem is temporary. Today is the reverse: a normal payment behind a hard door. Homes run 3.9 times income, 20% down is 78% of a year's pay, and rent compounds while you save. The bottleneck moved from the monthly payment to the entry, and entry is a financing problem with financing solutions.",
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

export function FthbAgePage() {
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
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>The Age of the First-Time Homebuyer</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 660, margin: 0 }}>
            The median age of Americans buying their first home, every year the National Association of Realtors has measured it. For forty years the answer was somewhere around 30. Then the last five years happened.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <FthbAgeChart />
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
          From 1981 through 2020, this number lived in a tight band: never lower than 28 (the 1991 record low), never higher than 33. An entire generation of parents bought their first home before their 33rd birthday, and their kids grew up assuming the same. Then the line broke out: 33 in 2021, 36 in 2022, 38 in 2024, and 40 in 2025, a record high and eleven years older than the 1981 buyer. The context makes it heavier: first-time buyers were roughly 40% of the market for decades and are now 21%, the lowest share ever recorded. Fewer people are getting in, and the ones who do are getting in a decade later.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 32 }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <h2 style={{ fontFamily: F.display, fontSize: 28, color: CREAM, fontWeight: 400, lineHeight: 1.2, margin: "48px 0 18px" }}>What this means for you</h2>
        {/* Four cards, not the usual three, so a 320px min forces a balanced 2x2
            on desktop instead of a 3 + 1 row that strands the fourth card
            stretched across a full-width gap. Collapses to one column on mobile. */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {MEANS.map((m, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CHART_COLORS.gold}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontFamily: F.display, fontSize: 18, color: CREAM, marginBottom: 10, lineHeight: 1.25 }}>{m.title}</div>
              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65, margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>

        <div style={{ background: withAlpha(CHART_COLORS.accent, 0.08), border: `1px solid ${withAlpha(CHART_COLORS.accent, 0.3)}`, borderRadius: 12, padding: "18px 22px", marginTop: 32 }}>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: CREAM }}>How to read this honestly.</strong> These are medians from NAR's annual survey of people who actually bought, so the line describes successful buyers, not everyone trying. NAR did not run the survey every year in the 1980s and 1990s, so the line connects the years that exist, and survey medians wobble (the dip from 36 to 35 in 2023 is noise, not a trend reversal). A median is not a deadline or a destiny: people buy well before 40 and well after it every single day. Education, not advice for any individual situation.
          </p>
        </div>

        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, marginTop: 32 }}>
          Related charts: <a href="/geek-charts/mortgage-payment-burden" style={LINK}>The Mortgage Payment Burden</a>, and <a href="/geek-charts/rent-vs-home-prices" style={LINK}>The Rent Line</a>.
        </p>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 24, fontStyle: "italic" }}>
          Sources: National Association of Realtors, Profile of Home Buyers and Sellers, annual editions 1981 through 2025 (each survey covers transactions from July of the prior year through June of the report year; results represent owner-occupant purchases). Median age of first-time buyers by survey year; the survey was not conducted in every year of the 1980s and 1990s, and the line connects available years. Supporting figures from the NAR 2025 Profile: first-time buyer share 21% (record low; roughly 40% was the norm before 2008); repeat buyer median age 62 (36 in 1981); typical first-time buyer down payment 6 to 9 percent since 2018. Linear scale; the age axis begins at 18, the youngest age at which someone can legally buy a home, so the plotted range covers the range a buyer can actually occupy. Same compliance line as the other Geek Charts pages (NMLS #1119524, Rate corporate NMLS #2611, Equal Housing Opportunity).
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
