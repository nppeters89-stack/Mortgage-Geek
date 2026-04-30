import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { DeepDiveFooter } from "../components/DeepDiveFooter";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { TNLoanLimitsMap } from "../components/TNLoanLimitsMap";

const TITLE = "Tennessee Loan Limits 2026: Interactive Map by County | The Mortgage Geek";
const DESCRIPTION = "Interactive map of 2026 Tennessee loan limits by county. Conforming, FHA, VA, USDA limits for all 95 TN counties. Updated annually. Real LO insight on what they mean.";
const PATH = "/geek-maps/tennessee-loan-limits";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-30";
const MODIFIED = "2026-04-30";

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
  const text = typeof children === "string" ? children : "";
  const colonIdx = text.indexOf(".");
  const before = colonIdx > -1 ? text.slice(0, colonIdx + 1) : text;
  const after = colonIdx > -1 ? text.slice(colonIdx + 1) : "";
  return (
    <h2 style={{ fontFamily: F.display, fontSize: 28, color: P.navy, fontWeight: 400, lineHeight: 1.2, marginTop: 48, marginBottom: 18 }}>
      {before}
      {after && <em style={{ fontStyle: "italic", color: P.gold, fontWeight: 400 }}>{after}</em>}
    </h2>
  );
}

function H3({ children }) {
  return (
    <h3 style={{ fontFamily: F.body, fontSize: 17, color: P.navy, fontWeight: 600, lineHeight: 1.3, marginTop: 28, marginBottom: 12 }}>
      {children}
    </h3>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 14px 0" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7, padding: "4px 0 4px 22px", position: "relative" }}>
          <span style={{ position: "absolute", left: 6, top: 4, color: P.gold, fontWeight: 700 }}>•</span>
          {renderInline(item)}
        </li>
      ))}
    </ul>
  );
}

const LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function TNLoanLimitsPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Tennessee Loan Limits 2026: Interactive Map by County",
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
            <a href="/geek-maps" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← All Geek Maps</a>
          </div>
        </div>
      </div>

      <article className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 860, margin: "0 auto" }}>

        <header style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.gold }}>🗺 Geek Map</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight }}>·</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Updated April 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
            Tennessee Loan Limits 2026: <em style={{ fontStyle: "italic", color: P.gold }}>Interactive Map by County</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            Loan limits set the line between a "regular" mortgage and a jumbo loan. They vary by county, by loan program, and by year. This map shows the 2026 limits for every Tennessee county, current as of January 2026 and refreshed each November when FHFA and HUD publish the next year's numbers.
          </p>
        </header>

        <div style={{ background: "rgba(184, 134, 11, 0.06)", border: `1px solid rgba(184, 134, 11, 0.25)`, borderLeft: `3px solid ${P.gold}`, borderRadius: 6, padding: "14px 18px", marginBottom: 8 }}>
          <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: P.navy, fontWeight: 600 }}>Updated for 2026.</strong> Conventional and FHA limits effective January 1, 2026. Sourced directly from FHFA and HUD.
          </p>
        </div>

        <TNLoanLimitsMap />

        <H2>What loan limits actually are</H2>
        <Para>
          A loan limit is the largest mortgage a particular program will fund as a "standard" loan. Below the limit, you're in conventional or FHA territory with normal rates and terms. Above the limit, you're in jumbo territory, which means stricter qualifying, larger down payments, and sometimes different rate behavior.
        </Para>
        <Para>
          Two things to understand:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The limits change every year.</strong> FHFA (which sets conventional/conforming limits) and HUD (which sets FHA limits) recalculate annually based on national home price changes. The 2026 limits took effect January 1.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The limits vary by county.</strong> In most of the country, including most of Tennessee, every county uses the same baseline. But counties with elevated home prices, including the 14 counties in the Nashville-Davidson MSA, get higher "high-cost area" limits because the formula recognizes that local home prices justify a higher cap.
        </Para>
        <Para>
          For 2026 in Tennessee, that breaks down to:
        </Para>
        <Bullets items={[
          "**Baseline counties (81 of 95):** Conventional limit $832,750. FHA limit $541,287.",
          "**High-cost Nashville MSA counties (14 of 95):** Both conventional AND FHA limits = $1,029,250.",
        ]} />
        <Para>
          The rest of this page explains what those numbers actually mean for each loan program.
        </Para>

        <H2>The four programs and how they handle limits</H2>
        <Para>
          Each of the four major loan programs treats "limits" differently. Here's what each one actually means for a borrower in Tennessee.
        </Para>

        <H3>Conventional (Conforming) loans</H3>
        <Para>
          Conforming limits are set by the <strong style={{ color: P.navy, fontWeight: 600 }}>Federal Housing Finance Agency (FHFA)</strong> for loans backed by Fannie Mae and Freddie Mac. These limits are the most consequential of the four because they define the boundary between "conventional" and "jumbo" territory:
        </Para>
        <Bullets items={[
          "**At or below the conforming limit:** Standard conventional loan with typical rates, normal qualifying, and the option to put as little as 3% down on a primary residence.",
          "**Above the conforming limit:** You're in jumbo loan territory, which generally requires 10-20% down, higher credit scores (often 700+), more reserves, and stricter income documentation.",
        ]} />
        <Para>
          The 2026 baseline ($832,750) covers most TN counties. The 14 Nashville MSA high-cost counties get the elevated $1,029,250 limit because their MSA-level median home price triggered the high-cost formula.
        </Para>

        <H3>FHA loans</H3>
        <Para>
          <a href="/deep-dives/fha-manual-underwriting" style={LINK_STYLE}>FHA</a> limits are set separately by <strong style={{ color: P.navy, fontWeight: 600 }}>HUD</strong> and are NOT the same as conforming limits. The formula uses 65% of the conforming baseline as a floor and the conforming high-cost ceiling as a ceiling. For 2026 in Tennessee:
        </Para>
        <Bullets items={[
          "**Baseline TN counties: FHA limit = $541,287** (much lower than the $832,750 conforming limit). This is the practical FHA cap for most TN buyers.",
          "**High-cost Nashville MSA counties: FHA limit = $1,029,250** (matches conforming in those specific counties because both calculations hit the same ceiling).",
        ]} />
        <Para>
          FHA loans above the limit aren't "FHA jumbo." They're not FHA at all. If you need to borrow more than the FHA limit in your county, you'd switch to conventional (if under the conforming limit) or jumbo (if above conforming).
        </Para>
        <Para>
          The takeaway: in baseline TN counties, FHA tops out at about $541K. If you're shopping above that, FHA is off the table even if you'd prefer it for credit or down payment reasons.
        </Para>

        <H3>VA loans</H3>
        <Para>
          This one's more nuanced than the map alone shows. <a href="/deep-dives/va-manual-underwriting" style={LINK_STYLE}>VA loans</a> don't have their own published per-county limit. The way the program actually works depends on whether you have <strong style={{ color: P.navy, fontWeight: 600 }}>full entitlement</strong> or <strong style={{ color: P.navy, fontWeight: 600 }}>partial entitlement</strong>:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Full entitlement (the most common scenario):</strong> You have full entitlement if you've never used your VA loan benefit, or if you used it and have since paid off and sold the property (restoring the entitlement). With full entitlement:
        </Para>
        <Bullets items={[
          "Loans **at or below the conforming limit** for your county = $0 down",
          "Loans **above the conforming limit** = you put down **25% of the amount that exceeds the limit**",
        ]} />
        <Para>
          Worked example for Knox County (baseline, conforming = $832,750):
        </Para>
        <Bullets items={[
          "$700K loan: $0 down required",
          "$832,750 loan: $0 down required (at the limit)",
          "$1,000,000 loan: $1M minus $832,750 = $167,250 over the limit. 25% of $167,250 = **$41,813 down payment**.",
          "$1,500,000 loan: $1.5M minus $832,750 = $667,250 over the limit. 25% of $667,250 = **$166,813 down payment**.",
        ]} />
        <Para>
          The VA still allows the loan; you just bring some money in to cover the portion above conforming. There's no hard "VA loan limit" because you can keep going as long as you can put 25% down on the overage.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Partial entitlement:</strong> If you have an existing VA loan, defaulted on a prior VA loan, or otherwise have used some of your entitlement without restoring it, the math gets more complex. Your remaining entitlement guarantees a smaller portion of the new loan, which often means a down payment is required even below the conforming limit. This is sometimes called <strong style={{ color: P.navy, fontWeight: 600 }}>bonus entitlement</strong> math.
        </Para>
        <Para>
          For partial entitlement, the Veterans United VA Bonus Entitlement Calculator is a useful starting point. I plan to build a TN-specific version of this calculator and link it here once it's done. In the meantime, if you're working with partial entitlement, contact me directly and we'll work through your specific numbers.
        </Para>

        <H3>USDA loans</H3>
        <Para>
          <a href="/deep-dives/usda-manual-underwriting" style={LINK_STYLE}>USDA's Section 502 Guaranteed Loan program</a> (the common one) has <strong style={{ color: P.navy, fontWeight: 600 }}>no maximum loan amount and no purchase price cap.</strong> The program isn't capped at a dollar figure the way conventional and FHA are. Instead, USDA limits eligibility through two other mechanisms:
        </Para>
        <Bullets items={[
          "**Income limits.** Total household income must be at or below 115% of the area median income. In most of Tennessee, the 1-4 person household income cap is around $112,450 (varies by county); the 5-8 person cap is around $148,450.",
          "**Property eligibility.** The home must be in a USDA-eligible rural area. \"Rural\" in USDA terms includes a lot more than people assume; many small towns and outlying suburbs of TN qualify even if they don't feel rural. The USDA eligibility map at eligibility.sc.egov.usda.gov is the authoritative source.",
        ]} />
        <Para>
          Practically, USDA's lack of a loan limit doesn't matter much because the income cap and rural eligibility tend to filter out high-end purchases naturally. But if you qualify on income and the property is eligible, there's no mortgage-side dollar ceiling.
        </Para>

        <H2>Conforming vs jumbo. What happens above the limit</H2>
        <Para>
          When a borrower's loan amount exceeds their county's conforming limit, the loan becomes a jumbo loan. Practical implications:
        </Para>
        <Bullets items={[
          "**Down payment.** Most jumbo programs require 10-20% down. Some specialty jumbos go to 5-10% but with tighter qualifying.",
          "**Credit score.** 700 minimum is typical for jumbo; 720-740 for the best pricing. Conforming loans can go to 620 (or lower with FHA).",
          "**Reserves.** Jumbo lenders typically want 6-12 months of mortgage payments in liquid reserves. Conforming requires 0-2 months for most files.",
          "**Documentation.** Jumbo files often require more detailed income documentation, especially for self-employed borrowers.",
          "**Rate.** Historically jumbo rates ran a bit higher than conforming. In recent years, well-qualified jumbo borrowers sometimes get rates very close to (or even below) conforming. Depends heavily on the lender and the file.",
        ]} />
        <Para>
          The practical takeaway: if you're shopping near the conforming limit, the choice between staying conforming and going jumbo can shift your monthly payment, your cash-to-close, and your qualifying difficulty meaningfully. If you're at $850K in a baseline TN county, you're $17K over the conforming line; that's the difference between a 3% down conventional and a 10-20% down jumbo. Worth running both scenarios before locking in a strategy.
        </Para>
        <Para>
          If you're a veteran with full entitlement above the conforming limit, the VA path can sidestep most of the jumbo qualifying tightness because the loan stays a VA loan; you just pay 25% of the overage as a down payment (see the VA section above for the math).
        </Para>

        <H2>Why the map updates each November</H2>
        <Para>
          FHFA announces the next year's conforming limits in late November. HUD typically updates FHA limits in early-to-mid December. Both take effect on January 1.
        </Para>
        <Para>
          When that happens each year:
        </Para>
        <Bullets items={[
          "The data on this page gets refreshed within a few days of the announcement.",
          "The URL stays the same.",
          "The year references update throughout the page.",
          "Past data isn't archived publicly here, but is preserved in our internal records for reference.",
        ]} />
        <Para>
          If you're reading this in November or December and the map still shows last year's limits, the new ones are likely a week or two from being incorporated. Loans you originate after January 1 will use the new limits even if your application started in December.
        </Para>

        <H2>A note on data sources</H2>
        <Para>
          The data on this page comes from two authoritative sources:
        </Para>
        <Bullets items={[
          "**FHFA 2026 Conforming Loan Limit Values.** The official FHFA-published data for all U.S. counties, announced November 25, 2025, effective January 1, 2026.",
          "**HUD FHA Loan Limits for CY2026.** The official HUD-published data for FHA limits, accessible at entp.hud.gov/idapp/html/hicostlook.cfm.",
        ]} />
        <Para>
          If you find a discrepancy between this map and what your lender or another source says, the FHFA and HUD official tools are the tiebreakers. Lender systems sometimes lag the official announcement by a few days; FHFA and HUD are always current.
        </Para>

        <H2>Final thought</H2>
        <Para>
          If you're house-hunting and you've identified a target neighborhood or county, knowing your loan limits early shapes which programs make sense, what your down payment range looks like, and whether you should be having a "jumbo conversation" or a "conforming conversation" with your lender. The map above answers the first part. The rest of the conversation is where I come in. If you'd like to walk through how the limits interact with your specific situation, I'm reachable at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={LINK_STYLE}>(615) 656-0737</a> or <a href="mailto:npeters@annie-mac.com" aria-label="Email Nick Peters at npeters@annie-mac.com" style={LINK_STYLE}>npeters@annie-mac.com</a>.
        </Para>
        <Para>
          Nick Peters, NMLS #1119524
        </Para>

        <DeepDiveFooter />

      </article>

      <MobileToolbar />
    </main>
  );
}
