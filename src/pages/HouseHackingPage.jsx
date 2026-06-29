import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ShareButton } from "../components/ShareButton";
import { HouseHackingGrid } from "../components/HouseHackingGrid";

// Deep Dive: House Hacking. Copy is verbatim from the approved content draft;
// all figures are HUD/VA-confirmed (June 2026). Page metadata + Article schema
// live in the route adapter's meta export (src/routes/dd-house-hacking.jsx),
// not here, so they prerender into the static HTML.

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
    <h2 style={{ fontFamily: F.display, fontSize: 28, color: P.navy, fontWeight: 400, lineHeight: 1.25, marginTop: 48, marginBottom: 18 }}>
      {children}
    </h2>
  );
}

function H3({ children }) {
  return (
    <h3 style={{ fontFamily: F.body, fontSize: 18, color: P.navy, fontWeight: 600, lineHeight: 1.35, marginTop: 32, marginBottom: 12 }}>
      {children}
    </h3>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 16px 0" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7, padding: "4px 0 4px 22px", position: "relative" }}>
          <span style={{ position: "absolute", left: 6, top: 4, color: P.gold, fontWeight: 700 }}>•</span>
          {renderInline(item)}
        </li>
      ))}
    </ul>
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
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 44, padding: "14px 22px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: F.body }}
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
    <p style={{ fontSize: 14, color: P.cream, lineHeight: 1.7, marginBottom: 0 }}>{children}</p>
  );
}

const LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function HouseHackingPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--light" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" headerTone="light" />
            <a href="/deep-dives" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
          </div>
        </div>
      </div>

      <article className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 860, margin: "0 auto" }}>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.gold }}>🐳 Deep Dive</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight }}>·</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified June 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 0 }}>
            House Hacking: <em style={{ fontStyle: "italic", color: P.gold }}>Using Rental Income to Buy and Afford Your First Home</em>
          </h1>
        </header>

        <div style={{ background: P.navy, borderRadius: 8, borderLeft: `3px solid ${P.gold}`, padding: "20px 22px", margin: "0 0 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>🤓</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>A note from Nick</span>
          </div>
          <p style={{ fontSize: 14, color: P.cream, lineHeight: 1.75, marginBottom: 0 }}>
            House hacking is one of the only strategies I know of that solves the two hardest parts of buying your first home at the same time: coming up with the payment, and qualifying for the loan in the first place. The catch is that "house hacking" has become a buzzword, and most of what gets posted online quietly skips the rules that decide whether a deal actually works. This page is the version I'd walk a client through at my kitchen table. The strategies that genuinely move the needle, the ones that sound good but won't help you qualify, and the fine print that kills deals at the appraisal stage if nobody checked it first.
          </p>
        </div>

        <H2>What house hacking actually means</H2>
        <Para>
          House hacking means you buy a property, live in part of it, and rent out the rest so the rent helps cover your mortgage. That's it. The reason it matters for a first-time or payment-sensitive buyer isn't just the lower monthly cost. It's that on the right loan, a portion of that rent counts as income when the lender decides how much you qualify for. You get a cheaper payment and a bigger approval from the same move.
        </Para>
        <Para>
          The honest part: you're becoming a landlord on day one. That comes with tenant screening, leases, repairs, vacancy, and the occasional 9pm phone call. None of that is a dealbreaker, but anyone selling you house hacking as passive income is leaving things out. The strategy works. It just isn't free money.
        </Para>
        <Para>
          There's also a split that almost nobody explains clearly, and it's the most important thing on this page. Some house-hacking strategies let the rent count toward your qualifying income. Others only help your cash flow after you already own the place. If you're buying with a low down payment and a tight debt-to-income ratio, the difference between those two buckets is the difference between getting approved and getting denied. So we'll separate them.
        </Para>

        <H2>The strategies that help you qualify</H2>
        <Para>
          These are the three plays where rental income can actually lower your debt-to-income ratio and increase what you're approved for. This is where the real leverage is for a first-time buyer.
        </Para>

        <H3>1. The duplex (2 units): the cleanest entry point</H3>
        <Para>
          {renderInline("A two-unit property is the most forgiving way to start. You live in one unit, rent the other, and on an FHA loan you can do it with **3.5% down** (with a 580 or higher credit score). The lender can count **75% of the market rent** from the unit you're renting as qualifying income. The 25% haircut covers vacancy and upkeep.")}
        </Para>
        <Para>
          {renderInline("Why the duplex is the friendly option: it is **exempt from the FHA self-sufficiency test** that trips up larger multi-unit deals (more on that below). A duplex just has to appraise, meet condition standards, and have you occupy one side as your primary residence.")}
        </Para>
        <Para noMargin>The numbers:</Para>
        <Bullets items={[
          "Down payment is 3.5% of the price, not the loan limit. On a $500,000 duplex that's about **$17,500**.",
          "Rent the other unit for $1,500/mo, and roughly **$1,125/mo** counts as qualifying income.",
          "You have plenty of room on the FHA loan amount. In the Nashville metro (the Nashville-Davidson-Murfreesboro-Franklin MSA, which includes Davidson, Williamson, Rutherford, and Wilson counties), FHA will lend up to **$1,317,650** on a duplex. In a lower-cost county like Shelby (Memphis), the duplex cap is **$693,050**. Same loan, same 3.5% down, very different ceiling depending on where you buy.",
        ]} />
        <Para>
          Your exact ceiling depends on the county. You can look up <a href="/geek-maps/tennessee-loan-limits" style={LINK_STYLE}>your county's limit on the Tennessee loan-limits map</a>.
        </Para>

        <H3>2. The triplex or fourplex (3-4 units): bigger upside, one big catch</H3>
        <Para>
          {renderInline("Three and four-unit properties are where house hacking gets powerful. You're living in one unit and renting two or three. You still get **3.5% down on FHA**, and the most FHA will lend climbs fast with each unit. In a lower-cost county like Shelby (Memphis):")}
        </Para>
        <Bullets items={[
          "Triplex: up to **$837,700**",
          "Fourplex: up to **$1,041,125**",
        ]} />
        <Para>
          {renderInline("In the Nashville metro those caps run much higher: triplex up to **$1,592,700**, fourplex up to **$1,979,350**. (In the highest-cost U.S. counties they reach **$1,933,200** and **$2,402,625**.) A fourplex cap is nearly double the single-family number in any given area. That's not an accident. FHA recognizes these are income-producing properties.")}
        </Para>
        <Para>
          {renderInline("Here's the catch, and it's the part that ends more of these deals than anything else: **the FHA self-sufficiency test**. For 3 and 4-unit properties only, FHA requires that **75% of the appraiser's total market rent for every unit, including the one you live in, is equal to or greater than the full monthly payment (PITI).** If it isn't, FHA won't insure the loan. Period. Your own income doesn't rescue it. The property itself has to \"pencil.\"")}
        </Para>
        <Para noMargin>A quick worked example:</Para>
        <Bullets items={[
          "Appraiser's total market rent for all units: $4,000/mo",
          "75% of that (the Net Self-Sufficiency Rental Income): **$3,000/mo**",
          "Proposed full payment (PITI): $2,900/mo",
          "$3,000 is greater than $2,900, so it **passes**",
        ]} />
        <Para>
          {renderInline("Now move the numbers a little. If the appraiser comes back at $3,800 total rent and your payment is $2,950, then 75% is $2,850, which is less than $2,950, and the deal **fails**, even if you personally earn plenty to cover it.")}
        </Para>

        <GeekTip title="Run the self-sufficiency test before you write the offer, not after.">
          <TipBody>
            The test runs at the appraisal stage, which means most buyers find out their fourplex doesn't qualify after they're already under contract and out of pocket for the appraisal. The rent estimate that matters is the <em>appraiser's</em>, not your agent's optimistic pro forma. If a deal is close, a slightly low rent estimate or a high vacancy factor can flip it from pass to fail. Pull comparable rents yourself first, and if it's tight, think hard before you commit.
          </TipBody>
        </GeekTip>

        <Para>
          If a 3-4 unit deal fails the FHA test, you have moves: a larger down payment to shrink the payment, buying down the rate, or switching to conventional financing, which doesn't have a self-sufficiency test at all (see the grid).
        </Para>

        <H3>3. The single-family + ADU: the quiet best option for payment-sensitive buyers</H3>
        <Para>
          {renderInline("An accessory dwelling unit (ADU) is a separate living space on a single-family lot. A basement apartment, a garage conversion, a casita, a mother-in-law suite. The strategic point that most people miss: **a single-family home with one ADU is still a one-unit property** in the eyes of the loan. That means one-unit loan limits, one-unit down payment, and **no self-sufficiency test**. You get a house-hacking income stream without crossing into multi-unit underwriting.")}
        </Para>
        <Para noMargin>
          {renderInline("Since 2023 (FHA Mortgagee Letter 2023-17), FHA lets you **count the ADU's rent as qualifying income**:")}
        </Para>
        <Bullets items={[
          "Up to **75%** of the ADU's market rent (the lesser of the appraiser's market rent or the actual lease)",
          "**50%** of estimated rent if you're building a new ADU through the Standard 203(k) rehab loan",
          "A hard cap either way: the ADU income can't exceed **30% of your total monthly qualifying income**",
        ]} />
        <Para>
          Conventional financing also allows ADU rental income on an owner-occupied one-unit property (most commonly through HomeReady), and the property still counts as one unit.
        </Para>

        <GeekTip title={'The ADU is often the smartest play precisely because it stays "one unit."'}>
          <TipBody>
            A duplex and a single-family-plus-ADU can look almost identical in real life. But the loan treats them very differently. The ADU keeps you in one-unit territory: lower down payment math, simpler appraisal, and none of the self-sufficiency hurdle. For a buyer who's payment-sensitive and wants the rent to help them qualify without taking on full multi-unit complexity, this is frequently the path of least resistance.
          </TipBody>
        </GeekTip>

        <H3>The VA angle: $0 down multi-unit, plus buying more than one home</H3>
        <Para>
          If you've served, the VA loan stacks two advantages on top of everything above.
        </Para>
        <Para>
          {renderInline("**Multi-unit with no down payment.** You can buy up to a **4-unit property with $0 down** on a VA loan, as long as you live in one unit as your primary residence. With full entitlement, there's no loan limit at all (county limits only come into play if part of your entitlement is already tied up). Rental income from the other units can help you qualify, though VA has its own documentation and reserve expectations for projected rent.")}
        </Para>
        <Para>
          {renderInline("**Buying more than one home with one benefit.** A lot of veterans think you only get to use your VA loan once. You don't. Through what's called **second-tier (bonus) entitlement**, you can keep your first VA-financed home (rent it out once you've met the occupancy requirement) and use your *remaining* entitlement to buy a second primary residence, often still with $0 down. Some veterans repeat this and end up owning two or three properties over time.")}
        </Para>
        <Para noMargin>The math, using 2026 figures:</Para>
        <Bullets items={[
          "2026 one-unit county limit (used for the entitlement calc even on multi-unit): **$832,750**",
          "Total guaranty available: 25% of that, or **$208,187.50**",
          "Say your first VA loan was $300,000, which uses $75,000 of entitlement",
          "Remaining entitlement: **$133,187.50**",
          "That supports a second zero-down VA loan up to about **$532,750** (remaining entitlement times four)",
        ]} />
        <Para noMargin>Two honest cautions on the multi-home play:</Para>
        <ol style={{ margin: "4px 0 16px 0", paddingLeft: 22 }}>
          <li style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7, marginBottom: 8 }}>
            {renderInline("**Occupancy is the rule, not a suggestion.** Every VA purchase requires that you genuinely intend to move into the new home as your primary residence, typically within 60 days. You can't use a VA loan to buy a pure rental or a vacation home. The strategy works because life moves you (a new job, a PCS, a growing family), not because you're gaming it.")}
          </li>
          <li style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7 }}>
            {renderInline("**The second-use funding fee jumps.** First-time VA use with no money down is a **2.15%** funding fee. Subsequent use is **3.3%**. On a $400,000 loan that's the difference between **$8,600** and **$13,200**.")}
          </li>
        </ol>

        <GeekTip title="Before you assume the higher VA funding fee, check your exemption.">
          <TipBody>
            That jump from 2.15% to 3.3% is real money, but it's waived entirely for veterans with a service-connected disability rating of 10% or higher, surviving spouses receiving DIC, and active-duty Purple Heart recipients. A lot of repeat VA buyers who qualify for the exemption don't realize the fee is $0 for them. And new for 2026, when the fee does apply, it's tax-deductible as upfront mortgage insurance (talk to your tax pro). Run your actual number before you budget for the worst case.
          </TipBody>
        </GeekTip>

        <H2>The strategies people talk about that won't help you qualify</H2>
        <Para>
          {renderInline("These are popular, they show up in every house-hacking video, and they can absolutely improve your cash flow. But on most loans, the income does **not** count toward qualifying. If you need the rent to get *approved*, these usually won't get you there. Know the difference before you build a plan around them.")}
        </Para>
        <Para>
          {renderInline("**Renting by the room (roommates / a single-family you fill with tenants).** Great for cash flow once you own. But boarder and roommate income is hard to use for qualifying. Conventional HomeReady allows limited boarder income (with a documented history and capped contribution), and FHA generally wants a long, documented track record. For most first-time buyers, plan on this as a way to lower your real-world cost, not a way to boost your approval amount.")}
        </Para>
        <Para>
          {renderInline("**Short-term rentals (Airbnb the spare room or unit).** Same story, more so. Projected short-term rental income generally can't be used to qualify on a purchase, and you're taking on local zoning and permitting risk that can change with a city council vote. Treat any STR income as upside, never as the thing that makes your approval work.")}
        </Para>

        <H2>How rental income is actually calculated</H2>
        <Para>
          A plain-English summary of the rules behind the strategies above:
        </Para>
        <Bullets items={[
          "**2 to 4 units (the rented units):** lenders typically count **75% of market rent** (or the lease, lesser of) as qualifying income. The 25% haircut is the vacancy and maintenance factor.",
          "**3 to 4 units (FHA only):** on top of the 75% rule, the property must separately pass the **self-sufficiency test** described earlier. Two different hurdles, both have to clear.",
          "**ADU:** **75%** of market rent with a rental history (or **50%** for a new 203(k)-built ADU), capped at **30%** of your total qualifying income.",
          "**First-time buyer, no landlord history:** you can usually still use 2-4 unit rental income to qualify, but on conventional you generally need a **current housing expense** (you have to be paying rent now). If you've been living rent-free, the lender often won't let you count future rental income.",
        ]} />

        <H2>The part nobody puts in the brochure</H2>
        <Para>
          Real numbers and real responsibilities, so you walk in with eyes open:
        </Para>
        <Bullets items={[
          "**Reserves.** The conventional 5%-down 2-4 unit program requires **six months of payments in reserve** after your down payment and closing costs. VA and FHA have their own reserve expectations, especially when you're counting projected rent. Cash to close is not the whole picture.",
          "**You manage it, or you pay someone.** Self-manage and you're the maintenance department. Hire a manager and budget 8-10% of rent.",
          "**Separate utilities and condition standards.** Multi-unit properties need a sane way to split utilities, and FHA in particular holds the property to condition requirements that a fixer might fail.",
          "**Vacancy is real.** The 25% haircut exists for a reason. Plan for a month or two of empty units across a year, because it happens.",
        ]} />

        <H2>Which strategy fits which buyer</H2>
        <Para>
          Quick orientation. The grid below has the detail.
        </Para>
        <Bullets items={[
          "**Lowest cash, want rent to help you qualify, keep it simple:** FHA duplex, or a single-family with an ADU.",
          "**More qualifying power and you can clear the math:** FHA 3-4 unit (mind the self-sufficiency test), or conventional 5%-down 2-4 unit (no self-sufficiency test, but six months reserves).",
          "**You're a veteran:** VA multi-unit with $0 down is hard to beat, and second-tier entitlement opens the door to more than one property over time.",
          "**You mainly want cash flow and already qualify comfortably:** room rental or STR can boost your bottom line, just don't lean on that income to get approved.",
        ]} />

        <H2>House hacking by strategy and loan program</H2>
        <HouseHackingGrid />

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Let's see if a house hack works for your numbers</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 10 }}>
            The strategy that's right for you comes down to your credit, your cash, your income, and which loan lets the rent do the most work. That's a 20-minute conversation, and it's worth having before you fall in love with a specific property. Bring this page to it.
          </p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 0 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={LINK_STYLE}>(615) 656-0737</a> or email <a href="mailto:Nick.Peters@rate.com" aria-label="Email Nick Peters at Nick.Peters@rate.com" style={LINK_STYLE}>Nick.Peters@rate.com</a>.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: HUD Handbook 4000.1 (current version November 2025, Update 17), self-sufficiency test, multi-unit occupancy, and rental income; FHA Mortgagee Letter 2023-17, ADU rental income (75% / 50% / 30% cap); FHFA 2026 conforming loan limits and HUD 2026 FHA loan limits announcement; VA.gov home loan entitlement and limits (second-tier/bonus entitlement, $832,750 one-unit 2026 limit, occupancy) and the VA.gov funding fee chart (2.15% / 3.3%, exemptions, 2026 deductibility); Fannie Mae Selling Guide, 5% down owner-occupied 2-4 unit (effective November 18, 2023), rental income (B3-3.1), and HomeReady ADU/boarder income. All math Python-verified June 2026.
        </p>

      </article>

      <MobileToolbar />
    </main>
  );
}
