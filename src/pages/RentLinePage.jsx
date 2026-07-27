import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { RentLineChart } from "../components/RentLineChart";
import { RentShareChart } from "../components/RentShareChart";
import { withAlpha } from "../utils/format";
import { GeekChartsLockup } from "../components/GeekChartsLockup";

// Dark-mode Geek Charts page. Metadata + Article schema live in the route adapter
// (routes/rent-line.jsx). The global SiteFooter (layout route) renders the NMLS /
// Equal Housing compliance line; the honest-reading note below is the page's
// data/education disclosure and is kept verbatim. Mirrors the other Geek Charts
// pages' structure and tokens.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;
const LINK = { color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 };

const STATS = [
  { label: "Years rent declined", value: "0", sub: "out of 56 (1970 to 2026)", color: CHART_COLORS.mortgage },
  { label: "Years home prices declined", value: "8", sub: "'91, '92, '08, '09, '11, '19, '23, '26", color: CREAM },
  { label: "Rent's worst year", value: "+0.2%", sub: "2010, still positive in mid-crash", color: CHART_COLORS.gold },
  { label: "The climb since 1970", value: "9.5x", sub: "rent; homes rose 19.3x in dollars", color: CHART_COLORS.mortgage },
];

const MEANS = [
  {
    title: "If you rent, you own this line",
    body: "Every renter is fully exposed to the red line, and the red line only moves one direction. There is no crash to wait for, no dip to time, no version of history where the rent bill got smaller. Renting is not the safe option. It is a permanent long position in the one housing cost that has never fallen. The question is not whether you pay a housing payment for life. It is whether that payment is frozen or floating.",
  },
  {
    title: "The fixed-rate mortgage is the exit",
    body: "A 30-year fixed payment does something no lease renewal ever has. The principal and interest freeze on day one and stay frozen for three decades, while the red line keeps climbing past it. Taxes and insurance still move, but the core payment does not. That is the quiet superpower of owning: not appreciation, not tax breaks, just stepping off a line that only goes up. And one day the payment ends. Rent never does.",
  },
  {
    title: "For referral partners",
    body: "Send this to the client who says renting is safer while they wait. Waiting has a price, and this chart is the price tag. Rent compounds against them every year they stand still, and it has compounded through every recession, crash, and pandemic since 1970. The financing conversation is about capping their largest monthly cost, and the numbers side of that conversation is handled from here.",
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

export function RentLinePage() {
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
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>The Rent Line</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 660, margin: 0 }}>
            American rent versus American home prices, both set to 100 in 1970. One of these lines has dipped eight times in 56 years. The other has never gone down. Not once.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <RentLineChart />
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "20px 0 0", maxWidth: 720 }}>
          The red line is the point of this chart. In 56 years of data it has declined exactly zero times. Its worst year was 2010, the bottom of the deepest housing crash in modern history, when home prices had fallen for years running. Rent still rose 0.2%. Home prices dipped in 1991, 1992, 2008, 2009, 2011, 2019, 2023, and early 2026. Rent went up through every single one. Hover any year: the home column shows negative numbers here and there; the rent column never does.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 32 }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <h2 style={{ fontFamily: F.display, fontSize: 28, color: CREAM, fontWeight: 400, lineHeight: 1.2, margin: "56px 0 18px" }}>If rent never falls, why hasn't it eaten the whole paycheck?</h2>

        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 720 }}>
          Fair question, and the honest answer deserves its own chart. The line above shows rent's level: 56 years, zero down years, about 4.1 percent growth per year. But incomes grew too, at nearly the same pace. So rent as a share of the median family's income has not exploded. It has ground upward slowly: about 14 percent of income in 1981, about 17.7 percent today.
        </p>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px", marginTop: 8 }}>
          <RentShareChart />
        </div>

        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "24px 0 16px", maxWidth: 720 }}>
          Two things about that line are worth staring at.
        </p>
        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 720 }}>
          First, <strong style={{ color: CREAM }}>17.7 percent is the record</strong>. The highest rent share in the entire 45-year series is not some year in the past. It is right now, in 2026. Rent never spikes the way home prices do, so it never makes headlines. It just takes a slightly bigger bite, decade after decade, and the biggest bite yet is the one being taken today.
        </p>
        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 720 }}>
          Second, look at the dashed line, which is the monthly cost of buying the median new home against the same income. Buying is the rollercoaster: 41 percent of income in 1981, under 16 percent in 2020, 23 percent now. Renting is the conveyor belt: no relief, no crisis, no exit. For a stretch in the late 2010s the two lines nearly touched, when buying the median new home briefly cost about the same share of income as the median rent. That window is what everyone's expectations are still anchored to.
        </p>
        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 720 }}>
          So the reconciliation is this. Rent did not outrun the median paycheck; it matched it stride for stride, forever, and is currently at its highest share ever. The thing that outran the paycheck is the price of the house itself, and that story has <a href="/geek-charts/price-to-income-ratio" style={LINK}>its own chart</a>. Rent is not how the market prices you out. Rent is how the market keeps you exactly where you are while the <a href="/geek-charts/price-to-income-ratio" style={LINK}>entry price</a> moves.
        </p>
        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 720 }}>
          One honest caveat on the math: this line divides median rent by median FAMILY income, the same denominator as the <a href="/geek-charts/mortgage-payment-burden" style={LINK}>buy burden chart</a>, so the two lines are directly comparable. Renter households earn less than the overall median family, so this line understates what renters themselves feel. The Census puts the typical renter household's own rent share at about 31 percent of its income.
        </p>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CHART_COLORS.gold}`, borderRadius: 12, padding: "20px 22px", maxWidth: 720 }}>
          <div style={{ fontFamily: F.display, fontSize: 18, color: CREAM, marginBottom: 10, lineHeight: 1.25 }}>The record share is now</div>
          <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65, margin: 0 }}>
            Rent took about 14 percent of the median family's income in 1981. Today it takes 17.7 percent, the highest in the 45-year series. Rent never crashes and never makes headlines. It just compounds.
          </p>
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
            <strong style={{ color: CREAM }}>How to read this honestly.</strong> Home prices grew faster than rent over this stretch (19.3x versus 9.5x), so this chart is not claiming renting costs more than owning in every market or every year. It is making a narrower, harder point: rent has no down years. A homeowner's price risk shows up eight times on this chart; a renter's cost has never once moved in their favor. National averages, not any one market. Education, not advice for any individual situation.
          </p>
        </div>

        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, marginTop: 32 }}>
          Related chart: <a href="/geek-charts/mortgage-payment-burden" style={LINK}>The Mortgage Payment Burden</a>.
        </p>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 24, fontStyle: "italic" }}>
          Sources: Rent is BLS CPI for All Urban Consumers, Rent of Primary Residence, U.S. city average, not seasonally adjusted (FRED: CUUR0000SEHA), annual averages of monthly data; the October 2025 reading was not published due to the federal appropriations lapse, so 2025 averages eleven months, and 2026 averages January through May. Home prices are the Census and HUD average sales price of houses sold (ASPUS), annual averages of quarterly data; 2026 uses the Q1 2026 reading ($514,600). Both series are indexed to 1970 = 100; linear scale from zero. Rent share of income benchmarks median gross rent to Census figures ($243 in 1980, $447 in 1990, $602 in 2000, and $1,406 in the 2023 ACS), with CPI rent of primary residence interpolating between benchmarks, divided by median family income. Median family income is used for direct comparability with the buy burden line; renter household incomes are lower.
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
