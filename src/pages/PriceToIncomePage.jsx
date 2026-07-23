import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { GeekChartsLockup } from "../components/GeekChartsLockup";
import { withAlpha } from "../utils/format";
import { PriceToIncomeChart } from "../components/PriceToIncomeChart";
import { PaymentBurdenChart } from "../components/PaymentBurdenChart";
import { FthbAgeChart } from "../components/FthbAgeChart";
import { PricesIncomeInflationChart } from "../components/PricesIncomeInflationChart";
import { RentLineChart } from "../components/RentLineChart";

// Dark-mode Geek Charts page 8: the price-to-income ratio, the long-form
// synthesis chart. The hero is PriceToIncomeChart; the essay body embeds four
// sibling charts (payment burden, first-time buyer age, prices/income/inflation,
// rent line) inline as evidence, each with a link to its full page. Metadata +
// Article schema live in the route adapter (routes/price-to-income.jsx). The
// global SiteFooter (layout route) renders the NMLS / Equal Housing compliance
// line; the methodology note below is this page's education disclosure, kept
// verbatim. Colors from CHART_COLORS / P via withAlpha; no hardcoded hex.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;
const LINK = { color: CHART_COLORS.gold, textDecoration: "underline", fontWeight: 600 };

const STATS = [
  { label: "The cheapest door", value: "2.45x", sub: "1971, the lowest in the series", color: CREAM },
  { label: "The worst payment year", value: "3.08x", sub: "1981's door was below the 3.52x average", color: CHART_COLORS.accent },
  { label: "The hardest door ever", value: "4.67x", sub: "2022, and buyer age jumped 33 to 36 in that exact window", color: CHART_COLORS.income },
  { label: "Today (2026)", value: "3.81x", sub: "easing three years, still above the 3.52x average", color: CREAM },
];

const MEANS = [
  {
    title: "If you are a frozen first-time buyer",
    body: "The single highest-value hour you can spend is finding out your real entry number. Not the internet's number. Yours: your programs, your minimum down payment, your DPA eligibility, your gift options, and the actual payment at today's rates. Most people who do this discover the door is closer than the myth told them. Some discover they need 18 more months, and now they have a target instead of a fog. Either answer beats freezing.",
  },
  {
    title: "If it feels like the numbers say you should have bought in 1981",
    body: "You are reading them right, and that is the point. Nobody in 1981 felt lucky either. They felt a 16.64 percent rate. The lesson is not that any particular year was good. It is that the two costs of buying, the payment and the door, almost never peak at the same time, and the one you can see on a monthly statement is not the one doing the damage today.",
  },
  {
    title: "For referral partners",
    body: "The clients who ghosted you did not lose interest in owning. Most of them are saving toward a 20 percent number nobody asked them for, while rent compounds underneath them. The most valuable thing you can hand them is not a listing. It is the entry math. Send them my way and I will run it with them, no pressure and no obligation, and you will get back a client who knows exactly what they are working toward.",
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

// Section heading for the essay body.
function Section({ children }) {
  return <h2 style={{ fontFamily: F.display, fontSize: 26, color: CREAM, fontWeight: 400, lineHeight: 1.25, margin: "44px 0 16px" }}>{children}</h2>;
}

// Body paragraph.
function Para({ children, style }) {
  return <p style={{ fontSize: 15, color: BODY, lineHeight: 1.75, margin: "0 0 18px", maxWidth: 720, ...style }}>{children}</p>;
}

// An embedded sibling chart in its own surface card, with a link to the full
// chart directly below it.
function EmbedCard({ children, href, label }) {
  return (
    <div style={{ margin: "24px 0 28px" }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 18px 12px" }}>
        {children}
      </div>
      <p style={{ fontSize: 13, margin: "10px 0 0" }}>
        <a href={href} style={LINK}>{label}</a>
      </p>
    </div>
  );
}

export function PriceToIncomePage() {
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
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: CREAM, fontWeight: 400, lineHeight: 1.12, margin: "0 0 12px" }}>The Payment Was Never the Problem</h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, maxWidth: 660, margin: 0 }}>
            The worst mortgage payment in history produced the youngest buyers ever. Today's ordinary payment is producing the oldest. One ratio explains it: what the median home costs, measured in years of the median family's income.
          </p>
        </header>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px 16px" }}>
          <PriceToIncomeChart />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 32 }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <Section>Two charts that cannot both be true</Section>
        <Para>In 1981, buying a home in America required the worst monthly payment in recorded history. The average 30-year mortgage rate was 16.64 percent. The payment on the median new home ate 41.3 percent of the median family's income, the highest reading in 56 years of data. It has never been close to that bad since.</Para>
        <Para>That same year, the typical first-time homebuyer was 29 years old.</Para>
        <Para>Today, the payment on the median home takes 23.0 percent of the median family income. The 56-year average is 23.7 percent. By the measure everyone argues about, the monthly cost of owning a home right now is almost exactly normal. It has improved three years in a row.</Para>
        <EmbedCard href="/geek-charts/mortgage-payment-burden" label="View the full Mortgage Payment Burden chart">
          <PaymentBurdenChart />
        </EmbedCard>
        <Para>And the typical first-time buyer is 40. The oldest ever recorded, in a survey that goes back to 1981.</Para>
        <EmbedCard href="/geek-charts/first-time-homebuyer-age" label="View the full First-Time Homebuyer Age chart">
          <FthbAgeChart />
        </EmbedCard>
        <Para>Sit with that for a second. The worst payment in history produced the youngest buyers. A completely ordinary payment is producing the oldest. If the monthly payment were the thing keeping people out of homeownership, those two facts would run the other way.</Para>
        <Para>The payment was never the problem. The door was. The chart at the top of this page is the door: what the median home costs, measured in years of the median family's income. Every other chart in this series is a clue. This one is the answer.</Para>

        <Section>1981: a payment crisis with a cheap door</Section>
        <Para>Here is what buying looked like at the worst moment in the payment data. The median new home cost $68,950. The median family earned $22,390. That is a price-to-income ratio of 3.1, and here is the detail almost nobody knows: it was below the 56-year average of 3.5. In the year the payment was the worst it has ever been, the door itself was cheaper than normal. A 20 percent down payment was $13,790, about 62 percent of a year's pay. Painful, but reachable: a few years of serious saving for a young couple.</Para>
        <Para>The brutal part was the rate. At 16.64 percent, the payment on that $55,160 loan was $770 a month, against a monthly income of about $1,866. That is the 41.3 percent burden towering over every other year on the payment chart above.</Para>
        <Para>So why were buyers young? Because a rate problem is a temporary problem. You cannot renegotiate what you paid for the house, but you can absolutely renegotiate what you pay for the money. Buyers in 1981 got in the door, suffered through a few ugly years, and then refinanced down the mountain as rates fell for the next four decades. By 1993 the average 30-year rate was 7.31 percent. The same $55,160 balance at that rate costs $379 a month. The 1981 buyer's payment problem got cut roughly in half by doing nothing but signing refinance paperwork, and rates kept falling after that. The full descent is on the <a href="/geek-charts/treasury-yield-mortgage-rates" style={LINK}>10-Year Treasury and 30-Year Mortgage chart</a>.</Para>
        <Para>That is the deal the 1981 cohort took: a horrible payment on a cheap house, with every year after closing likely to make the payment better.</Para>

        <Section>Today: a normal payment behind a hard door</Section>
        <Para>Now run the same numbers for today. The payment burden is 23.0 percent, a hair under the long-run average of 23.7. By monthly cost, and I will not pretend otherwise, this market is ordinary.</Para>
        <Para>But look at the chart at the top of this page. The median home now runs about 3.8 times the median family income, still well above the 3.5 long-run average even after three years of easing. At the 2022 peak it hit 4.67, the worst entry ratio in the entire series. A 20 percent down payment today is about 78 percent of a year's pay, up from 62 percent in 1981.</Para>
        <Para>Why did the door move? Since 1970, home prices are up 19.5x while incomes are up 10.7x. Homes rose roughly 1.8 times faster than the paychecks trying to buy them. The gap is the door.</Para>
        <EmbedCard href="/geek-charts/home-prices-income-inflation" label="View the full Home Prices, Inflation, and Family Income chart">
          <PricesIncomeInflationChart />
        </EmbedCard>
        <Para>And here is the detail that convinces me this is the right diagnosis. The first-time buyer age line did not drift upward slowly. It sat in a band between 28 and 33 for forty years, from 1981 through 2020. Then it jumped from 33 to 36 between 2021 and 2022, exactly the window when the price-to-income ratio spiked from 3.89 to its all-time worst 4.67. The payment squeeze of 2023 came and partly went. The age line kept climbing: 38 in 2024, 40 in 2025.</Para>
        <Para>A rate problem is temporary because you can refinance the rate. A price problem is permanent because you cannot refinance the principal. Whatever you pay for the house, you pay for the house. The 1981 buyer's problem melted every time rates fell. Today's buyer's problem is baked into the purchase price on day one.</Para>

        <Section>The door is also crowded</Section>
        <Para>The price of entry is only half of why the door is hard. The other half is who is standing in it.</Para>
        <Para>Millions of homeowners hold mortgages at rates they will never see again, so they do not sell, and inventory stays starved. The buyers who do compete for what is left are increasingly repeat buyers, and they are formidable: median age 62, 30 percent paying all cash, and a median down payment of 23 percent when they do finance. A first-time buyer with 6 percent down is routinely bidding against someone's home equity from the last three decades.</Para>
        <Para>The results show up in the share data. Before 2008, first-time buyers were roughly 40 percent of the market in a typical year. In 2025 they were 21 percent, a record low. And that collapse does something sneaky to the age statistic: when the door narrows, the people who still squeeze through skew toward those who had more time to save. The median age of 40 is partly a story about who got excluded, not just who got older.</Para>

        <Section>Waiting is not neutral</Section>
        <Para>Here is where I have to be direct, because this is the part that costs people real money.</Para>
        <Para>When the door looks hard, the natural response is to wait. Save longer, hope prices dip, hope rates dip, try again in a few years. That plan has a hidden assumption: that the cost of waiting is zero. It is not, for two reasons.</Para>
        <Para>First, rent. In 56 years of data, CPI rent of primary residence has never had a down year. Not one. The closest it came was 2010, in the wreckage of the housing crash, when rent still rose 0.24 percent. Over the long run rent grows about 4.1 percent a year. Home prices, for comparison, fell in 8 of those 56 years. The rent line is the cost of waiting, charged monthly, compounding against the same person trying to save a down payment out of what is left.</Para>
        <EmbedCard href="/geek-charts/rent-vs-home-prices" label="View the full Rent Line chart">
          <RentLineChart />
        </EmbedCard>
        <Para>Second, the down payment target itself is usually wrong. The 20 percent figure most renters are saving toward is a myth with a spreadsheet. Per NAR, the typical first-time buyer has put down between 6 and 9 percent every year since 2018. On a $400,000 home, the difference between the myth and the reality is the difference between saving $80,000 and saving $24,000 to $36,000. FHA allows 3.5 percent, which is $14,000. VA and USDA allow zero. People are delaying years of ownership, and paying rent that never goes down the whole time, to hit a number nobody actually requires.</Para>
        <Para>So the freeze feeds itself. The door looks like 78 percent of a year's income, so buyers wait. While they wait, rent compounds and prices, over the long run, grind higher. The door they eventually face is usually harder than the one they walked away from.</Para>

        <Section>Different problems have different solutions</Section>
        <Para>Here is the whole argument in three sentences. In 1981, the payment was the problem, and the payment problem solved itself through refinancing. Today, the entry is the problem, and entry is a financing problem, which means it has financing solutions. Conflating the two is why buyers freeze: they read "housing affordability crisis," picture a payment they could actually handle, assume a door price they cannot, and stop.</Para>
        <Para>What the entry toolbox actually contains:</Para>
        <Para><strong style={{ color: CREAM }}>The real down payment number.</strong> Start by replacing the 20 percent myth with your actual program minimum: 3 to 5 percent conventional for many first-time buyers, 3.5 percent FHA, zero for VA and USDA. Then decide, with real numbers, whether putting down more is worth it. Sometimes it is. It is never worth five extra years of rent.</Para>
        <Para><strong style={{ color: CREAM }}>Down payment assistance.</strong> Tennessee and many other states run DPA programs that can layer with FHA, VA, USDA, and conventional loans. These exist precisely because policymakers know the entry, not the payment, is the modern bottleneck.</Para>
        <Para><strong style={{ color: CREAM }}>Gift funds.</strong> Every major program allows down payment gifts from family, with rules about documentation. A gift that covers the gap between 3.5 percent and comfort is one of the most common ways first-time buyers actually get in.</Para>
        <Para><strong style={{ color: CREAM }}>Co-borrowers and house hacking.</strong> Adding a co-borrower's income, or buying a duplex and letting a tenant pay part of the mortgage, both attack the entry math directly.</Para>
        <Para><strong style={{ color: CREAM }}>And on the payment side, the old 1981 playbook still works.</strong> If you buy at today's ordinary rates and rates fall, you refinance. If they do not fall, you own a home at a historically normal payment burden. The <a href="/geek-charts/homes-priced-in-sp500" style={LINK}>Homes Priced in the S&amp;P 500 projection tool</a> shows what leveraged entry does to wealth over 30 years even under conservative assumptions.</Para>
        <Para>None of this makes buying easy, and I am not going to tell you the door is fine. The age chart is 56 years of evidence that it is not. What I am telling you is that the door has hinges. The buyers getting through it right now are not the ones who saved 20 percent. They are the ones who learned what the door actually requires.</Para>

        <h2 style={{ fontFamily: F.display, fontSize: 28, color: CREAM, fontWeight: 400, lineHeight: 1.2, margin: "48px 0 18px" }}>What this means for you</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {MEANS.map((m, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CHART_COLORS.gold}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontFamily: F.display, fontSize: 18, color: CREAM, marginBottom: 10, lineHeight: 1.25 }}>{m.title}</div>
              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65, margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, marginTop: 24 }}>
          Run your entry math with Nick directly: <a href="mailto:nick.peters@rate.com" style={LINK}>nick.peters@rate.com</a> or <a href="tel:+16156560737" style={LINK}>(615) 656-0737</a>.
        </p>

        <div style={{ background: withAlpha(CHART_COLORS.accent, 0.08), border: `1px solid ${withAlpha(CHART_COLORS.accent, 0.3)}`, borderRadius: 12, padding: "18px 22px", marginTop: 32 }}>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: CREAM }}>Methodology.</strong> Price-to-income ratio is the median new home sales price (Census/HUD) divided by median family income (Census). Income data runs through 2024; 2025 and 2026 hold the latest reading, the same convention as the Mortgage Payment Burden chart. Payment burden figures use principal and interest on the median new home with 20 percent down at that year's average Freddie Mac PMMS 30-year rate. Buyer ages and shares are from the NAR Profile of Home Buyers and Sellers. Rent is CPI rent of primary residence (BLS). Educational content, not a loan offer or commitment to lend.
          </p>
        </div>
      </article>

      <MobileToolbar />
    </main>
  );
}
