import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ContactCard } from "../components/homepage/ContactCard";
import { RentVsBuyChart } from "../components/RentVsBuyChart";
import { withAlpha } from "../utils/format";

// Dark-mode top-level tool page. Metadata + WebApplication schema live in the
// route adapter's meta export (routes/rent-vs-buy.jsx), not here. The global
// SiteFooter (layout route) renders the NMLS / Equal Housing compliance line;
// the honest-reading note below is this page's education disclosure and is the
// compliance load-bearing wall, kept verbatim. Every number in the prose that
// describes the default scenario is read off the verified simulation, not
// written by hand.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;
const LINK = { color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 };

const STATS = [
  { label: "Rent's losing streak", value: "0 down years", sub: "in 56 years of national rent data, 1970 to 2026", color: CHART_COLORS.accent },
  { label: "Rent's worst year ever", value: "+0.24%", sub: "2010, the bottom of the housing crash. It still went up.", color: CREAM },
  { label: "The two growth rates", value: "4.1% vs 5.4%", sub: "rent vs. home prices, annual average, 1970 to 2026", color: CREAM },
  { label: "What 4.1% compounds to", value: "3.2x", sub: "your rent, 30 years from now, at the average", color: CHART_COLORS.sp500 },
];

const MEANS = [
  {
    title: "The flow flips, and only one way",
    body: "Owning costs more than renting on day one, and the gap is real money. But the mortgage payment is fixed while rent compounds, and national rent has never had a down year in 56 years. At the defaults, rent catches the full cost of owning in year 10, mortgage insurance drops off in year 12, and eventually the loan retires entirely. Renting starts cheaper. Owning ends cheaper. The whole question is what happens in between, and that is what the chart shows.",
  },
  {
    title: "Your horizon is the answer",
    body: "Transaction costs are why short stays favor renting: closing costs going in and selling costs coming out are a fixed toll that a few years of appreciation may not cover. Slide the horizon to five years and watch the verdict tighten or flip. If you are confident you will stay put for five or more years, the math usually starts working for you. If you might move in two, it usually does not, and this tool will say so.",
  },
  {
    title: "When renting wins, believe it",
    body: "Drop the rent low enough, push the rate high enough, or shorten the stay, and the blue line finishes on top. That is not a bug. A cheap-enough rental with the savings genuinely invested every month is a legitimate wealth strategy. The honest catch is the word genuinely: the model assumes the renter invests every surplus dollar with perfect discipline for decades, and rent keeps compounding underneath the whole plan.",
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

export function RentVsBuyPage() {
  return (
    <main style={{ fontFamily: F.body, color: CREAM, background: P.navyDark, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-white-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: BORDER, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--dark" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-cream-truered-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ContactCard iconOnly ariaLabel="Contact Nick" />
            <a href="/learn" style={{ fontSize: 13, color: MUTED, textDecoration: "none", fontWeight: 500, marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6 }}><span aria-hidden="true">←</span><img src="/assets/learning-hub-mark-cream-sm.svg" alt="" width={20} height={16} style={{ display: "block" }} />Learning Hub</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ marginBottom: 28 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: CHART_COLORS.accent, margin: "0 0 16px" }}>
            <span aria-hidden="true" style={{ width: 32, height: 2, background: CHART_COLORS.accent, flexShrink: 0 }} />
            Geek Tools
          </p>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>Rent vs. Buy, honestly</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
            Most rent vs. buy calculators are sales tools in disguise. This one charges both sides for everything. The buyer pays the down payment, closing costs, the full mortgage payment, taxes, insurance, and mortgage insurance, and is scored as if selling, with selling costs off the top. The renter invests the same starting cash the buyer put in, and every month one side spends less than the other, that side banks the difference into the market. Then we compare what each would actually walk away with.
          </p>
        </header>
      </div>

      {/* The tool renders full-bleed: on desktop it becomes the cockpit
          (sticky inputs rail + results canvas) and needs the wider frame. */}
      <RentVsBuyChart />

      <article style={{ padding: "0 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 32 }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <h2 style={{ fontFamily: F.display, fontSize: 28, color: CREAM, fontWeight: 400, lineHeight: 1.2, margin: "48px 0 8px" }}>What this means for you</h2>
        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: "0 0 18px", maxWidth: 680 }}>
          A calculator is only honest if it can tell you not to buy. This one can, and sometimes does.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {MEANS.map((m) => (
            <div key={m.title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CHART_COLORS.gold}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontFamily: F.display, fontSize: 18, color: CREAM, marginBottom: 10, lineHeight: 1.25 }}>{m.title}</div>
              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65, margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>

        <div style={{ background: withAlpha(CHART_COLORS.accent, 0.08), border: `1px solid ${withAlpha(CHART_COLORS.accent, 0.3)}`, borderRadius: 12, padding: "18px 22px", marginTop: 32 }}>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: CREAM }}>Read it honestly.</strong> This model leans against the buyer in some places and for the buyer in others, and both lists matter. Against the buyer: they are charged closing costs going in, full selling costs every single year as if liquidating, and every dollar of payment, taxes, insurance, and mortgage insurance. For the buyer: maintenance, repairs, and HOA dues are not charged, and they are real. For the renter: the model assumes every surplus dollar is invested immediately with perfect discipline, compounds untaxed, and rent rises smoothly at the average rather than in the lumps real leases deliver. Steady average growth every year, on homes, rent, and investments alike, is a simplification no real decade will match. Every figure is a national average and a historical one; past performance does not predict future results. Education, not investment advice.
          </p>
        </div>

        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, marginTop: 32 }}>
          Related chart: <a href="/geek-charts/rent-vs-home-prices" style={LINK}>The Rent Line</a>. Related tool: <a href="/geek-charts/homes-priced-in-sp500" style={LINK}>Homes Priced in the S&P 500</a>.
        </p>

        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 24, fontStyle: "italic" }}>
          Sources and model: rent growth default of 4.1% per year is the compound annual growth of the CPI Rent of Primary Residence index, 1970 to 2026 (FRED: CUUR0000SEHA), a series with zero annual declines in 56 years; its worst year was +0.24% in 2010. Home value compounds at 5.4% annually, the compound annual growth of the Average Sales Price of Houses Sold (FRED: ASPUS), 1970 to 2026. The 10% investment return default is the long-run S&P 500 total-return average; both the renter's portfolio and the buyer's side fund compound at the selected rate, applied monthly. The mortgage payment comes from the standard amortization formula at the selected rate over 30 years; the rate defaults to the site's live 30-year average when available (Mortgage News Daily via the calculator's source, rounded to 0.125 and bumped 0.125 as the conservative case), with 6.43% as the fallback. Carrying costs charged to the buyer: property taxes defaulting to 0.75% of price per year (the Tennessee state average) and homeowner's insurance defaulting to 0.35%, both held flat for the full period; mortgage insurance at 0.37% of the original loan per year when the down payment is under 20%, charged until the balance amortizes to 78% of the original purchase price, the automatic termination standard. Borrower-requested earlier removal exists in practice; the model uses the automatic rule as the conservative case. The renter's portfolio begins with the buyer's down payment plus closing costs (defaulting to 3% of price) invested on day one. Each month the model compares the full cost of owning against that month's rent, and whichever side pays less invests the difference at the selected return; rent steps up once per year at the selected growth rate. Buyer wealth in any year equals the home's value net of selling costs (defaulting to 6%), minus the loan balance, plus the buyer's side fund; renter wealth equals the portfolio. The breakeven year is the first year buyer wealth reaches renter wealth; the verdict is read at the selected horizon, and the two can differ when the lines cross more than once. Maintenance, repairs, HOA dues, tax effects, and rent deposits are excluded on both sides. Both growth rates are long-run historical averages applied smoothly and are not predictions.
        </p>
      </article>

      <MobileToolbar />
    </main>
  );
}
