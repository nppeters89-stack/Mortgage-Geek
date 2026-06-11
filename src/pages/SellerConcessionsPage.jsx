import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { SellerConcessionsGrid } from "../components/SellerConcessionsGrid";

const TITLE = "Seller Concessions: How Much the Seller Can Pay, by Loan Program | The Mortgage Geek";
const DESCRIPTION = "Conventional, FHA, VA, and USDA seller concession limits explained by a 12-year LO. What counts, what doesn't, agent commissions after NAR, and where deals break.";
const PATH = "/deep-dives/seller-concessions";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-06-10";
const MODIFIED = "2026-06-10";

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: P.navy, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

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

function TipBody({ text }) {
  return (
    <p style={{ fontSize: 14, color: P.cream, lineHeight: 1.7, marginBottom: 10 }}>
      {renderInline(text).map((piece, j) =>
        typeof piece === "string" ? piece :
        piece.type === "strong" ? <strong key={j} style={{ color: P.goldLight, fontWeight: 600 }}>{piece.props.children}</strong> :
        piece
      )}
    </p>
  );
}

export function SellerConcessionsPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Seller Concessions: How Much the Seller Can Actually Pay, by Loan Program",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" />
            <a href="/deep-dives" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
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
            Seller Concessions: <em style={{ fontStyle: "italic", color: P.gold }}>How Much the Seller Can Actually Pay, by Loan Program</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            It comes up in almost every purchase negotiation: "Can we ask the seller to cover some of the closing costs?" The answer is yes. How much, and what the money is allowed to pay for, depends entirely on the loan program, the down payment, and a set of rules that most buyers (and honestly, plenty of agents) have never read. Get the number wrong and the deal hits a wall in underwriting, usually two weeks before closing, usually at the worst possible moment.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page covers the actual limits for Conventional, FHA, VA, and USDA loans, what counts toward each cap and what doesn't, how agent commissions are treated after the NAR settlement, and the mistakes I see derail real contracts.
          </p>
        </header>

        <div style={{ background: "rgba(184, 134, 11, 0.06)", border: `1px solid rgba(184, 134, 11, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a loan originator with 12+ years of experience. Concession limits are one of the few mortgage topics where the rules are precise, public, and still constantly misquoted in real negotiations. Everything below is sourced from the current agency guidelines, with citations, so you and your agent can verify every number.
            </p>
          </div>
        </div>

        <H2>What seller concessions actually are</H2>
        <Para>
          The industry term is "interested party contributions," or IPCs. An interested party is anyone with a financial stake in the home selling, and selling at the highest possible price: the seller, the builder, either real estate agent, or anyone affiliated with them. When any of these parties puts money toward costs the buyer would normally pay, that money is an IPC, and the loan program caps it.
        </Para>
        <Para>
          The caps exist for one reason: to keep contributions from quietly inflating the price. If a seller "gives" the buyer $20,000 at closing and the price was raised $20,000 to fund it, the home is overvalued, the loan is overleveraged, and the appraisal is the only thing standing in the way. The caps put a ceiling on how much of that pressure a transaction can absorb.
        </Para>
        <Para>Two distinctions matter before the numbers mean anything.</Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Financing concessions vs. sales concessions.</strong> Financing concessions are contributions toward real transaction costs: closing costs, prepaid taxes and insurance, discount points, the upfront mortgage insurance or funding fee, interest rate buydown funds. These are the "good" kind and they're what the percentage caps regulate. Sales concessions are everything else of value: furniture, a car, a decorator allowance, moving costs, cash, or any financing concession that exceeds the program limit. Sales concessions don't get capped; they get subtracted. The lender deducts their value from the sales price and re-runs the entire loan (LTV, eligibility, pricing) on the reduced number.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The actual-cost ceiling.</strong> On every program, financing concessions can't exceed the buyer's actual closing costs and prepaids. A seller credit larger than what the buyer actually owes at the table doesn't become cash back. The excess is either negotiated away, re-purposed (points, buydown), or lost. This single rule causes more last-minute contract amendments than any other item on this page, and it gets its own section below.
        </Para>
        <Para>
          A few things are NOT considered IPCs at all, and don't count against any cap: typical fees the seller pays by local custom (the "common and customary" costs in your market, like an owner's title policy in many states), a pro-rated property tax credit where taxes are paid in arrears, a lender credit generated by premium pricing, and <a href="/deep-dives/gift-funds" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>gift funds or a gift of equity</a> from a seller who is also an eligible family donor, provided that person isn't a builder or otherwise affiliated with an interested party.
        </Para>

        <H2>Conventional loans: the down payment tier system</H2>
        <Para>
          Conventional loans (Fannie Mae and Freddie Mac) are the only program where the concession cap moves with your down payment. The logic: the more equity you start with, the more contribution the loan can safely absorb.
        </Para>
        <Para>For primary residences and second homes, the caps are:</Para>
        <Para>Less than 10% down (LTV above 90%): 3% maximum.</Para>
        <Para>10% to less than 25% down (LTV 75.01% to 90%): 6% maximum.</Para>
        <Para>25% or more down (LTV 75% or below): 9% maximum.</Para>
        <Para>For investment properties, the cap is 2% regardless of down payment.</Para>
        <Para>
          Two technical details that change real outcomes. First, the percentage is calculated on the LOWER of the sales price or the appraised value, not the loan amount. If you're paying $350,000 and the home appraises at $340,000, your cap math runs on $340,000. Second, the LTV that picks your tier is also computed on that lower number, so a low appraisal can move you into a worse tier at the same time it shrinks the base.
        </Para>
        <Para>
          A worked example. You're buying a $400,000 primary residence with 5% down. LTV is 95%, so the cap is 3%: $12,000. Same house with 10% down: LTV is exactly 90%, which lands in the 6% tier, so the cap doubles to $24,000. Same house with 25% down: LTV is exactly 75%, which qualifies for the 9% tier, $36,000.
        </Para>
        <Para>
          What the money can pay for is broad: closing costs, prepaid taxes and insurance, discount points, mortgage insurance premiums, temporary or permanent buydown funds, and (a recent addition to the Fannie guide) homeowners association assessments covering up to 12 months after settlement. What it can never do is fund your down payment, your reserves, or your minimum borrower contribution. The agencies are absolute on that.
        </Para>
        <Para>
          What happens above the cap: the excess is reclassified as a sales concession and deducted from the sales price, and the maximum LTV is recalculated on the reduced price. In practice that means a deal written at 95% LTV with an oversized credit can come out of underwriting needing more cash down, which is the exact opposite of what the concession was for.
        </Para>
        <Para>
          One currency note worth knowing if you're verifying against the source: Fannie Mae updated this entire topic in May 2025 (announcement SEL-2025-03, effective for loans with note dates on or after September 3, 2025). The update tightened the definitions, spelled out the exclusions listed above, and clarified that a realtor rebate NOT credited toward the transaction is a sales concession no matter when it's paid. If you find an article quoting the pre-2025 rules, the percentages are the same but the definitions around the edges have moved.
        </Para>

        <GeekTip title="Putting more down can RAISE your concession cap">
          <TipBody text={'This is the most counterintuitive rule on this page. Buyers assume concession room shrinks as the loan gets more conservative. Conventional works the other way: go from 5% down to 10% down and your seller concession ceiling jumps from 3% to 6%. On a $400,000 house, that\'s $12,000 of extra negotiating room. I\'ve restructured offers where moving $20,000 from "extra cash at closing" into the down payment unlocked enough concession capacity to fund a two-year temporary buydown, and the buyer\'s effective first-year payment dropped by hundreds a month. The tiers are a lever. Most people don\'t know the lever exists.'} />
        </GeekTip>

        <H2>FHA: a flat 6 percent</H2>
        <Para>
          FHA keeps it simple. Interested parties can contribute up to 6% of the lesser of the sales price or the appraised value, at any down payment level. The 6% can cover closing costs, prepaid expenses, discount points, the upfront mortgage insurance premium, and interest rate buydown funds.
        </Para>
        <Para>
          The same actual-cost ceiling applies: the credit can't exceed what the buyer genuinely owes in costs and prepaids, and it can't touch the 3.5% minimum required investment. FHA's required down payment must come from the borrower's own funds or an acceptable gift, never from an interested party.
        </Para>
        <Para>
          What happens above 6%: FHA treats the excess as an inducement to purchase and reduces the sales price dollar-for-dollar before calculating the maximum mortgage. A $350,000 contract with $25,000 in concessions ($4,000 over the $21,000 cap) gets underwritten as if the price were $346,000, which shrinks the maximum loan and forces a restructure.
        </Para>
        <Para>
          The practical effect of the flat 6%: on low-down-payment deals, FHA is the most concession-friendly program on this page. A conventional buyer with 3.5% down is capped at 3%; the FHA buyer at the same down payment has double the room. For buyers who are tight on cash to close, <a href="/compare" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>that difference alone sometimes decides the program</a>.
        </Para>

        <H2>VA: two buckets, and the most misunderstood rule in the business</H2>
        <Para>
          If you remember one thing from this page, make it this section. The VA "4% rule" is the most misquoted concession rule in the industry, and the misquote kills deals that would have worked.
        </Para>
        <Para>Here's the actual structure. VA splits seller contributions into two separate buckets with two separate rules:</Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Bucket one: normal closing costs. No VA cap.</strong> The seller can pay all of the buyer's reasonable and customary loan costs: title work, origination, appraisal, recording, lender fees, and discount points that are normal for the current market. VA places no percentage limit on this bucket. None.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Bucket two: concessions. Capped at 4%.</strong> A concession, in VA's definition, is anything of value the seller provides that a seller wouldn't customarily pay. That includes: the seller paying the buyer's VA funding fee (a fee the buyer finances into the loan in the normal case, where it never touches this math), prepaying the buyer's property taxes and insurance escrows, paying off the buyer's debts (a car loan, credit cards) to help them qualify, funding a temporary buydown escrow, gifts like appliances, and discount points beyond what's normal for the market. The total of bucket two cannot exceed 4% of the home's reasonable value, which means the value on the VA appraisal's Notice of Value, not the loan amount and not necessarily the contract price.
        </Para>
        <Para>
          So the real ceiling on a VA deal isn't 4%. It's all customary closing costs, uncapped, PLUS up to 4% in true concessions on top. On a $400,000 home that appraises at value, that's potentially $8,000 to $12,000 in ordinary closing costs plus another $16,000 of concession capacity.
        </Para>
        <Para>
          The funding fee is the cleanest illustration of how the buckets work, because who pays it decides everything. When the buyer pays the fee, which is the normal case (almost everyone finances it into the loan), it never touches concession math at all. But if the seller agrees to pay the buyer's funding fee, that payment is the textbook bucket-two concession. A first-use VA buyer with no down payment owes a 2.15% fee ($8,600 on a $400,000 loan); a seller paying it uses $8,600 of the $16,000 bucket, leaving $7,400 for prepaids or a buydown, while separately covering every normal closing cost with no cap at all.
        </Para>
        <Para>
          Two cautions keep this honest. The 4% math runs against the Notice of Value, so if the appraisal comes in low, the concession room shrinks after the contract is already signed; smart agents leave a buffer rather than writing to the ceiling. And anything over 4% in bucket two isn't a price-reduction situation like FHA; VA simply calls it excessive and unacceptable, which means the contract has to be amended before the loan can close.
        </Para>

        <GeekTip title="The VA 4% myth costs veterans real money">
          <TipBody text={'At least a few times a year I see a listing agent reject or talk down a VA offer because "VA caps seller help at 4%," when the buyer was only asking for ordinary closing costs, which VA doesn\'t cap at all. The myth runs in both directions: buyer\'s agents under-ask because they think 4% is the total ceiling, and listing agents overestimate the cost of accepting a VA offer. If you\'re an agent reading this, the two-bucket structure is worth memorizing, because it makes VA offers more competitive than most of the agents across the table believe they are. And if you\'re a veteran whose offer is getting pushback over concessions, have your lender put the actual rule in writing for the listing side. It changes conversations.'} />
        </GeekTip>

        <H2>USDA: 6 percent</H2>
        <Para>
          USDA Guaranteed loans allow seller concessions up to 6% of the sales price, covering the buyer's reasonable closing costs and prepaid items. The structure works like FHA's: a single flat percentage, available at every down payment level (which on USDA is typically zero), with the credit limited to actual costs.
        </Para>
        <Para>
          Combined with no down payment requirement, the 6% cap means a well-negotiated USDA deal can genuinely close with almost nothing out of pocket, which is exactly the program's purpose. The constraint that binds first is usually not the 6% cap but the actual-cost ceiling: on a modest-priced rural property, 6% often exceeds the real closing costs and prepaids, so the practical limit is whatever the buyer actually owes.
        </Para>
        <Para>
          One currency note: USDA clarified in 2025 that seller funds used to pay the buyer's real estate agent compensation do not count toward the 6% cap, matching the position the other agencies took after the NAR settlement. More on that next.
        </Para>

        <H2>The comparison grid</H2>
        <SellerConcessionsGrid />

        <H2>Agent commissions after the NAR settlement</H2>
        <Para>
          The 2024 NAR settlement changed who can pay the buyer's agent, and the first question every agent asked was whether a seller paying the buyer's agent compensation would now count against these concession caps. If it did, a customary 2.5% to 3% commission would have consumed most or all of the concession room on every low-down-payment deal in America.
        </Para>
        <Para>
          It doesn't. All four channels confirmed it. Fannie Mae and Freddie Mac issued guidance in April 2024 clarifying that seller payment of buyer agent commissions does not count toward IPC limits, as long as the amounts are customary for the market. FHA confirmed the same treatment under its existing policy. USDA's 2025 clarification matched. And VA, whose rules had historically barred veterans from paying buyer-broker charges at all, issued a 2024 circular permitting veteran-paid buyer-broker compensation so VA buyers wouldn't be locked out of the post-settlement market; seller-paid buyer agent compensation, where customary, likewise sits outside the 4% concession bucket.
        </Para>
        <Para>
          The qualifier doing the work in every one of those sentences is "customary." A market-normal commission paid by the seller is a seller cost, not a buyer inducement. What changes the analysis is anything beyond customary: a commission rebate from an agent that is NOT credited toward the buyer's transaction costs is treated by Fannie Mae as a sales concession under the 2025 update, and inflated compensation arrangements that function as disguised credits will get reclassified in underwriting. The clean structure is boring on purpose: customary commission in the commission section of the contract, concessions in the concession section, and no creativity bridging the two.
        </Para>

        <H2>How to actually use concessions (strategy)</H2>
        <Para>
          Knowing the caps is half the value. The other half is deploying the money well. The priority order I walk buyers through:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>First: cover what you actually owe.</strong> Closing costs and prepaids are the baseline. On most purchases that's 2% to 4% of the price, and clearing it is the difference between needing $25,000 at the table and needing $12,000.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Second: if there's room left, buy the payment down.</strong> Once real costs are covered, remaining concession capacity can fund discount points or a temporary buydown, both of which count as financing concessions inside the caps (and on VA, a buydown escrow lives in the 4% bucket). A seller-funded 2-1 buydown on a $380,000 loan costs the seller roughly $8,000 to $9,000 and cuts the buyer's first-year payment by several hundred dollars a month. Whether buydown dollars beat an equivalent price cut is a real math question with a real answer, and it's the subject of <a href="/deep-dives/rate-buydowns" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>its own Deep Dive</a>. The short version: on payment relief per seller dollar, concessions usually beat price reductions by a wide margin, because a $10,000 price cut changes a 30-year payment by about $50 a month while $10,000 of well-placed concessions can change year-one cash flow by hundreds.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Third: structure before you sign, not after.</strong> The caps are checked against the contract in underwriting. Writing "$15,000 seller credit" into a 95% conventional offer (cap: 3%, likely under $15,000) means a contract amendment later, with a seller who now knows you needed the deal restructured. Two minutes with your lender before the offer goes out prevents all of it.
        </Para>

        <GeekTip title="Never ask for more concession than your actual costs">
          <p style={{ fontSize: 14, color: P.cream, lineHeight: 1.7, marginBottom: 10 }}>
            Concession money you don't use does not become cash back, a price discount, or a gift card. On every program, the credit is capped at your actual closing costs and prepaids; on conventional, anything beyond actual costs is reclassified as a sales concession and cuts the price for LTV purposes, and on the others it has to be amended out or repurposed. I've watched buyers negotiate hard for a $15,000 credit on a file with $9,000 of actual costs, and then feel like they lost $6,000 at the closing table. They didn't lose it; it never existed. The fix is sequencing: <a href="/cash-to-close" style={{ color: P.goldLight, fontWeight: 600, textDecoration: "underline" }}>get your lender's cash-to-close estimate</a> FIRST, then ask for that number, and if you have negotiating leverage beyond it, take the rest as price reduction or as points and buydown funds, where the money actually lands in your pocket over time.
          </p>
        </GeekTip>

        <H2>What I see in real files</H2>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The 3% surprise on conventional.</strong> The single most common concession error: a 5% down conventional offer written with a 6% seller credit, because someone remembered "6%" from an FHA deal. The cap at that LTV is 3%. The fix is an amendment, a restructure to FHA, or a bigger down payment to reach the 6% tier. All three are avoidable with one pre-offer phone call.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The VA under-ask.</strong> Buyer's agents who believe the 4% myth routinely ask VA sellers for less help than the program allows, leaving uncapped closing-cost coverage on the table. Veterans with full entitlement and no down payment are exactly the buyers who benefit most from the two-bucket structure, and they're the ones most often shortchanged by it being misunderstood.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The low appraisal squeeze.</strong> Concession math runs on the lesser of price or value (and on VA, on the Notice of Value). When the appraisal comes in under contract, the concession ceiling drops at the same moment the deal is already stressed. Contracts written at the exact cap have no shock absorber. Leave a buffer.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The evaporating credit.</strong> A credit negotiated above actual costs, discovered at the Closing Disclosure stage, with the buyer asking where their money went. In practice this is usually rescuable: converting the excess into discount points or a temporary buydown absorbs the extra credit and turns it into payment relief instead, and most CDs that surface this issue can still be corrected before closing. The genuinely painful version is when the timeline is too tight to restructure or the program doesn't allow the rescue. Either way the lesson is sequencing: structure the credit against your actual costs from the start so the rescue isn't needed.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The investment property 2%.</strong> Investors moving from primary purchases to rentals assume the rules came with them. They didn't; the conventional cap drops to 2% on investment properties at every LTV, and FHA, VA, and USDA don't do non-occupant investment purchases at all. On a $300,000 rental, 2% is $6,000, which often won't even cover the prepaids on an escrowed loan.
        </Para>

        <H2>Where this gets you</H2>
        <Para>
          Seller concessions are one of the few places in a purchase where knowing the actual rule, in a market full of people quoting it wrong, converts directly into money. The caps are public, precise, and verifiable: tiered 3/6/9 on conventional (2% for investment), a flat 6% on FHA and USDA, and VA's two buckets, with customary agent commissions sitting outside all of them since 2024.
        </Para>
        <Para>
          If you're a buyer, the move is simple: get your real cash-to-close number before your offer goes out, ask for that, and put any leverage beyond it where it compounds. If you're an agent, the conventional tiers and the VA two-bucket rule are worth keeping on a card in your desk, because they come up every week and the agent who knows them wins negotiations against the agent who doesn't.
        </Para>
        <Para>
          And if you've got a live contract and a concession question that doesn't fit neatly into any box on this page, that's what I'm here for. The contact info is below.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Want to walk through your specific concession scenario?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:nick@mortgagegeek.ai" aria-label="Email Nick Peters at nick@mortgagegeek.ai" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>nick@mortgagegeek.ai</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your contract (or your offer draft), your target loan program, and an honest estimate of cash to close. We'll work through the rest.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B3-4.1-02 (Interested Party Contributions), updated May 7, 2025 via announcement SEL-2025-03, effective for loans with note dates on or after September 3, 2025; Freddie Mac Single-Family Seller/Servicer Guide Section 5501.5 (Financing and Sales Concessions); HUD Handbook 4000.1, Section II.A.4.d.iii (Inducements to Purchase) and II.A.5.b (FHA-Insured Mortgages with Seller Contributions); VA Lender's Handbook (Pamphlet 26-7), Chapter 8 (Borrower Fees and Charges and the VA Funding Fee); USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook (HB-1-3555), Chapter 6 (Loan Purposes) and Chapter 8 (Applicant Characteristics); GSE NAR-settlement guidance issued April 2024; FHA confirmation of buyer-broker compensation treatment; USDA 2025 clarification on seller-paid buyer agent compensation; VA Circular 26-24-09 (2024) on veteran-paid buyer-broker charges; author's 12+ years of field experience originating mortgages across all four channels.
        </p>

      </article>

      <MobileToolbar />
    </main>
  );
}
