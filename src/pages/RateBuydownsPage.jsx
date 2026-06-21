import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { SellerCreditDeploymentGrid } from "../components/SellerCreditDeploymentGrid";

const TITLE = "Rate Buydowns: 2-1, Points, or Price Cut? The Same $10,000 Four Ways | Mortgage Geek";
const DESCRIPTION = "A 12-year LO runs the same $10,000 seller credit four ways: price cut, closing costs, discount points, and a 2-1 buydown. Exact math, honest tradeoffs.";
const PATH = "/deep-dives/rate-buydowns";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-06-10";
const MODIFIED = "2026-06-10";

function Para({ children, noMargin }) {
  return (
    <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75, marginBottom: noMargin ? 0 : 14 }}>
      {children}
    </p>
  );
}

function H2({ children }) {
  return (
    <h2 style={{ fontFamily: F.display, fontSize: 28, color: P.navy, fontWeight: 400, lineHeight: 1.2, marginTop: 48, marginBottom: 18 }}>
      {children}
    </h2>
  );
}

function GeekTip({ title, children }) {
  const [open, setOpen] = useState(false);
  const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const panelId = `geektip-panel-${slug}`;
  return (
    <div style={{ background: P.navy, borderRadius: 8, margin: "24px 0", borderLeft: `3px solid ${P.gold}` }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          minHeight: 44,
          padding: "14px 22px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: F.body,
        }}
      >
        <span style={{ fontSize: 16 }}>🤓</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight, flex: 1 }}>Geek Tip: {title}</span>
        <span aria-hidden="true" style={{ fontSize: 20, color: P.goldLight, lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div id={panelId} style={{ padding: "0 22px 18px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TipBody({ children }) {
  return (
    <p style={{ fontSize: 14, color: P.cream, lineHeight: 1.7, marginBottom: 10 }}>
      {children}
    </p>
  );
}

export function RateBuydownsPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Rate Buydowns: The Same $10,000, Four Different Ways",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/mg-mark-sm.svg" alt="" aria-hidden="true" width={21} height={26} style={{ display: "block" }} />
            <span style={{ fontFamily: F.display, fontSize: 18, color: P.text }}>Mortgage <span style={{ color: P.gold }}>Geek</span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" headerTone="light" />
            <a href="/deep-dives" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
          </div>
        </div>
      </div>

      <article className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 860, margin: "0 auto" }}>

        <header style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.gold }}>🐳 Deep Dive</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight }}>·</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified June 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
            Rate Buydowns: <em style={{ fontStyle: "italic", color: P.gold }}>The Same $10,000, Four Different Ways</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            You negotiated $10,000 out of the seller. Congratulations; that was the easy part. Now comes the decision almost nobody makes deliberately: what should that money actually DO? Cut the price? Cover your closing costs? Buy down your rate permanently? Fund one of those 2-1 buydowns every builder advertises?
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            Same ten thousand dollars. Four completely different outcomes for your monthly payment, your cash at closing, and your five-year cost of owning the home. This page runs the exact math on all four, side by side, on the same loan, so you can see what each choice is really worth.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a loan originator with 12+ years of experience. Every number on this page is computed exactly on one consistent example loan, and every number is illustrative: rates move daily, and buydown pricing is a live market. Use this page to understand the structures and compare the shapes. Use your lender, after your rate is locked, for your real numbers.
            </p>
          </div>
        </div>

        <H2>The decision nobody makes deliberately</H2>
        <Para>
          Here's the pattern I see constantly. A buyer and their agent fight hard for a seller credit, and then the credit gets deployed by default: whatever the listing agent suggested, whatever the builder was already advertising, or simply "toward closing costs" because that's the path of least paperwork. The negotiation gets all the attention. The deployment, which often matters more, gets none.
        </Para>
        <Para>
          The reason deployment matters: a dollar of seller money is not worth the same amount in every slot. Spent one way, $10,000 returns about $3,800 of payment relief over five years. Spent another way, it returns nearly $9,500 and keeps paying past year five. Spent a third way, it delivers almost $500 a month of relief right now, when you need it most, and nothing after year two. None of these is wrong. They're different tools, and the right one depends on your cash position, your timeline, and what the next three years of your income look like.
        </Para>

        <GeekTip title="Sellers negotiate on NET, not structure">
          <TipBody>
            A $10,000 price cut and a $10,000 credit cost the seller exactly the same amount. They do not care which one you take; they care about their net at closing. Which means the structure is YOURS to choose, and choosing well is free money. I've watched buyers accept a $10,000 price reduction (worth about $63 a month on this page's example loan) when the same seller would have happily written a $10,000 credit toward a buydown worth $157 a month. Same cost to the seller. More than double the monthly value to the buyer. When your agent writes the offer, write the deployment into it, not just the number.
          </TipBody>
        </GeekTip>

        <H2>The example loan (read this before the numbers)</H2>
        <Para>Every figure below uses one frozen scenario so the four options compare honestly:</Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>$400,000 purchase price. 5% down. $380,000 loan. 30-year fixed. 7.00% note rate. $10,000 of seller money on the table.</strong>
        </Para>
        <Para>
          At 7.00%, the principal-and-interest payment on this loan is $2,528 a month. That's the baseline every option gets measured against. The 7.00% is an illustrative round number, not a quote, not an offer, and not a prediction; your rate will be whatever the market and your file say on the day you lock. The relationships between the four options hold at any rate in the neighborhood, which is what matters here.
        </Para>

        <H2>Option one: take it off the price</H2>
        <Para>
          The default move, and the weakest one for your monthly payment. A $10,000 price reduction takes the price to $390,000; with the same 5% down structure, your loan drops to $370,500 and your payment drops to $2,465 a month. You save $63 a month, plus $500 less down payment at closing.
        </Para>
        <Para>
          Why so little? Because a price cut spreads the $10,000 across 360 payments with interest math working against the drama. The value isn't gone; it's parked. You owe $9,500 less, you have a slightly bigger equity cushion, and over the full 30 years the cut returns its value. But as monthly relief, it's the smallest lever on this page by a wide margin.
        </Para>
        <Para>
          When the price cut genuinely wins: when the appraisal is the risk. The concession caps you read about on <a href="/deep-dives/seller-concessions" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>the seller concessions page</a> run on the lesser of price or appraised value, and an aggressive price with a big credit stacked on top is exactly the shape that makes appraisals nervous. Cutting the price lowers the bar the appraisal has to clear. If you're in a soft market or the comps are thin, the boring option is sometimes the safe one. The other honest case for it: you've already covered your costs, you don't need payment relief, and you simply want to owe less.
        </Para>

        <H2>Option two: cover your closing costs</H2>
        <Para>
          The cash-flow move. On a $400,000 purchase, <a href="/cash-to-close" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>closing costs and prepaids typically run somewhere in the 2% to 4% range</a>. A $10,000 credit aimed here doesn't change your payment at all; it changes the check you write at closing, dollar for dollar. Payment stays $2,528. Cash to close drops $10,000.
        </Para>
        <Para>
          For a lot of buyers, this isn't one option among four; it's the mandatory first stop. If covering costs is the difference between draining your savings and keeping a real emergency fund after you get the keys, take the cash relief and don't look back. A lower payment is worthless if you're house-poor on day one. This is also the order of operations I walk through on the seller concessions page: cover what you actually owe first, then deploy whatever's left.
        </Para>
        <Para>
          Two rules keep this option honest. The credit can't exceed your actual closing costs and prepaids; negotiate $10,000 against $8,000 of real costs and the extra $2,000 doesn't become cash back, it evaporates or has to be restructured. And the credit counts toward your program's concession cap, which on this example loan (5% down, conventional) is 3% of the price: $12,000. The $10,000 fits. Barely. That's not an accident in this example; it's a reminder to check the cap before you write the offer.
        </Para>

        <H2>Option three: buy the rate down permanently (discount points)</H2>
        <Para>
          The long-game move. Discount points are prepaid interest: each point costs 1% of the loan amount and permanently lowers your rate. How much rate a point buys changes with the market, sometimes daily. A useful conservative planning number is about 0.25% of rate per point, with diminishing returns as you stack them; some days pricing is better than that, some days worse. This is the number you must confirm with your lender after your rate is locked, because buydown pricing is a live market and any figure printed on a page (including this one) is a planning assumption, not a quote.
        </Para>
        <Para>
          On the example loan: $10,000 buys 2.63 points ($10,000 against a $380,000 loan). At the conservative 0.25%-per-point assumption, that's roughly 0.66% of rate, taking 7.00% down to about 6.375% after rounding to the eighth lenders actually price in. New payment: $2,371 a month. You save $157 a month, every month, for the life of the loan. Five-year value: about $9,447. Ten-year value: nearly $19,000. If you keep the loan long enough, this option laps every other one on this page.
        </Para>
        <Para>
          The catch is the word "if." Permanent buydown value accrues slowly and only while you keep the loan. Refinance or sell in year two and most of the value never arrives. The classic mistake of 2021 was buyers paying points and refinancing eight months later; the classic mistake of the high-rate era is the reverse, buyers skipping points while planning to stay put for a decade. Match the tool to your actual timeline, not to the market mood.
        </Para>

        <GeekTip title="Permanent points are a DTI lever, not just a payment lever">
          <TipBody>
            Here's the underwriting wrinkle almost nobody markets: on a permanent buydown, the bought-down rate IS your note rate, so you QUALIFY at the lower rate. On a temporary buydown, you qualify at the full note rate no matter how low year one's payment is. That means seller-paid points can do something a 2-1 cannot: shrink your debt-to-income ratio and turn a marginal approval into a clean one. I've structured deals where the seller credit went to points not for the payment savings but because the file needed the lower qualifying payment to work at all. If your pre-approval is tight, this is the option your loan officer should be modeling first.
          </TipBody>
        </GeekTip>

        <H2>Option four: the 2-1 temporary buydown</H2>
        <Para>
          The front-loaded move, and the one every builder billboard is selling. A 2-1 buydown doesn't change your note rate at all. Your rate is still 7.00% and your loan documents say so. What the seller's money actually buys is a subsidy account: funds sit in a protected escrow at the lender, and each month for two years, that account pays the difference between your reduced payment and the real one.
        </Para>
        <Para>
          The schedule on the example loan: Year one, you pay as if the rate were 5.00%: $2,040 a month, saving $488 a month. Year two, as if 6.00%: $2,278, saving $250 a month. Year three through thirty: the full $2,528. The step-up is capped at 1% of rate per year by guideline, which is why the shapes are 2-1 and 3-2-1 and not anything steeper.
        </Para>
        <Para>
          What it costs: exactly the sum of the subsidies. Twelve payments of $488 plus twelve of $250 comes to $8,857. Notice that's less than the $10,000 on the table, which means this option has a bonus move: fund the full 2-1 AND put the leftover $1,143 toward closing costs. On this loan, $10,000 covers both.
        </Para>
        <Para>
          Three mechanics worth knowing before you sign one. First, you qualify at the full note rate; the lender underwrites you as if the $2,528 payment starts on day one, which is the guideline protecting you from a payment you can't actually afford (more on that in a moment). Second, if you refinance, sell, or pay off the loan during the buydown period, the remaining escrow funds don't vanish; they're credited, typically against your payoff. Third, <a href="/deep-dives/arms-demystified" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>a 2-1 is not an ARM</a>: an ARM's rate genuinely changes with the market, while a 2-1's rate never changes at all; only the subsidy does. People conflate these constantly and they are nothing alike in risk.
        </Para>
        <Para>
          When the 2-1 genuinely fits: real, dated income growth. A resident finishing training, a spouse returning to work next year, a contractual step raise. You're using the seller's money to bridge to an income that is actually coming. It can also fit when the cash-flow squeeze of a move (furniture, repairs, the overlap month of rent and mortgage) is concentrated in year one and you want the relief concentrated there too.
        </Para>

        <GeekTip title="Don't buy a payment a refinance is supposed to rescue">
          <TipBody>
            The 2-1 sales pitch usually comes with a whispered second half: "and you'll just refinance before year three." Maybe. Nobody knows where rates will be in two years, and a plan that requires them to fall is not a plan; it's a position. Here's how I pressure-test it with clients: cover the $2,528, the real payment, with today's income, comfortably. If you can, the 2-1 is a gift that makes two years cheaper. If you can't, the buydown isn't making the home affordable; it's postponing the math, and the step-up will arrive whether rates cooperated or not. The one honest consolation: if you DO refinance mid-buydown, the unused escrow comes back as a credit. The leftover funds aren't lost. The risk isn't the buydown money; it's the payment you committed to after it runs out.
          </TipBody>
        </GeekTip>

        <H2>The comparison grid</H2>
        <SellerCreditDeploymentGrid />

        <H2>The five-year scoreboard</H2>
        <Para>Same $10,000, measured by what it hands back in the first five years on the example loan:</Para>
        <Para><strong style={{ color: P.navy, fontWeight: 600 }}>Price cut:</strong> $3,792 of payment relief ($63 × 60 months), plus a $9,500 smaller balance working quietly in the background.</Para>
        <Para><strong style={{ color: P.navy, fontWeight: 600 }}>Closing costs:</strong> $0 of monthly relief, but $10,000 of cash that never left your savings on day one.</Para>
        <Para><strong style={{ color: P.navy, fontWeight: 600 }}>Permanent points:</strong> $9,447 of payment relief, still going at month 61 and every month after.</Para>
        <Para><strong style={{ color: P.navy, fontWeight: 600 }}>2-1 buydown:</strong> $8,857 of relief, all of it delivered in the first 24 months, plus the $1,143 leftover toward costs.</Para>
        <Para>
          Read the scoreboard honestly and three things jump out. Every option except the price cut returns roughly the full $10,000 of value within five years; they differ in WHEN and in WHAT FORM. The price cut returns the least relief because most of its value is stored as balance reduction, not delivered as cash flow. And the 2-1 versus points question is really a question about time: the 2-1 wins years one and two decisively, points win year four onward, and year three is roughly the crossover on this loan. Your timeline picks your winner.
        </Para>

        <H2>Which one should you actually pick</H2>
        <Para>There's no universal answer, but there is a clean decision path, and it's the one I walk with clients:</Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Start with cash.</strong> If covering closing costs is the difference between a funded emergency account and an empty one, costs come first. Always. Whatever remains after real costs are covered is the money the rest of this decision is about.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Then check the qualifying math.</strong> If your approval is tight, permanent points are the only option here that lowers your qualifying payment. That can decide the whole question before preference enters into it.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Then match the tool to your timeline.</strong> Staying seven-plus years with comfortable qualifying: permanent points compound the longest. Real, dated income growth arriving within two years: the 2-1 puts the relief exactly where the squeeze is. Soft market, nervous comps, appraisal risk: the price cut earns its keep by protecting the deal itself.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Then check the cap.</strong> Every deployment except the price cut counts toward your program's concession limit, and that includes seller-funded buydowns, both kinds. On a 5% down conventional loan the cap is 3%; FHA allows 6%; VA splits costs and concessions into different buckets; the full breakdown is on the seller concessions page. The price cut is the release valve: it consumes no cap at all, which is why big incentives sometimes split (cap-limited credit plus price reduction for the remainder).
        </Para>
        <Para>
          And one instruction that outranks all of it: get your lender's actual buydown pricing after your rate is locked, before you finalize the deployment. The 0.25%-per-point figure on this page is a deliberately conservative planning assumption. Real pricing moves every day, and the difference between a planning number and a locked number is the difference between this page and your deal.
        </Para>

        <H2>What I see in real files</H2>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The default deployment.</strong> The most common pattern isn't a wrong choice; it's no choice. The credit lands "toward closing costs" by inertia, even when costs were already covered and the remainder evaporates against the actual-cost ceiling. Ten minutes of deployment math before the offer would have moved real money.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The builder special, unexamined.</strong> Builders advertise the 2-1 because the year-one payment makes the marketing. Sometimes it's genuinely the right structure. But on the same incentive dollars, I've shown buyers a permanent buydown that beat the 2-1 by year three and never expired. The advertised structure is the builder's choice. It doesn't have to be yours.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The refinance assumption doing load-bearing work.</strong> Files where the buyer is comfortable at the year-one payment, strained at the real one, and the plan is "rates will be lower by then." Qualifying at the note rate exists precisely because of these files. When the guideline feels like an obstacle, it's usually being a guardrail.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The points-as-rescue surprise.</strong> The happiest version of this page in practice: a tight-DTI file where shifting the seller credit from costs to permanent points dropped the qualifying payment enough to approve cleanly. The buyer thought they were buying a payment. They were actually buying the approval.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The cap collision.</strong> A 6% credit negotiated on a 5% down conventional contract, discovered against the 3% cap in underwriting. The fix was a restructure: part credit, part price reduction. It closed, but the renegotiation cost goodwill that better sequencing would have kept.
        </Para>

        <H2>Where this gets you</H2>
        <Para>
          Seller money is only as good as its deployment. The same $10,000 can be $63 a month, $157 a month, $488 a month for a year, or $10,000 of day-one cash, and the seller is indifferent between every version. The choice is entirely yours, it's worth real money, and it takes one conversation with your lender to make deliberately instead of by default.
        </Para>
        <Para>
          If you want to run your own numbers, the deployment calculator on this site models all four options on your actual loan size and credit. And if you've got a live deal and an incentive on the table, bring me the scenario; pressure-testing a deployment takes me about ten minutes and it's the highest-leverage ten minutes in most purchase files. Contact info below.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Want to pressure-test a deployment on a live deal?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:nick@mortgagegeek.ai" aria-label="Email Nick Peters at nick@mortgagegeek.ai" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>nick@mortgagegeek.ai</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your contract (or your offer draft), your target loan program, the incentive on the table, and an honest read on your timeline. Ten minutes is usually enough.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B2-1.4-04 (Temporary Interest Rate Buydowns) referencing B3-6-04 (Qualifying Payment Requirements); Fannie Mae Selling Guide B3-4.1-02 (Interested Party Contributions), May 2025 update SEL-2025-03; Freddie Mac Single-Family Seller/Servicer Guide Sections 4204.4 (Temporary Subsidy Buydown Plans) and 5501.5 (Financing and Sales Concessions); HUD Handbook 4000.1, Section II.A.4.d.iii and II.A.5.b (Interested Party Contributions and Inducements to Purchase); VA Lender's Handbook (Pamphlet 26-7), Chapter 8 (Borrower Fees and Charges) and Chapter 4 (Credit Underwriting); author's 12+ years of field experience pricing, structuring, and underwriting buydowns and seller credits. All dollar figures on this page are computed exactly on one frozen example loan and labeled illustrative; buydown pricing is a live market and your actual numbers require a locked rate and a current lender quote.
        </p>

      </article>

      <MobileToolbar />
    </main>
  );
}
