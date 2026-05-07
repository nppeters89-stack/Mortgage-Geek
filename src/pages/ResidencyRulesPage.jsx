import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { ResidencyEligibilityGrid } from "../components/ResidencyEligibilityGrid";

const TITLE = "Residency and Visa Rules for US Mortgages: What Status Lets You Buy a Home | The Mortgage Geek";
const DESCRIPTION = "Mortgage residency rules explained: which visas, EADs, and statuses qualify for FHA, VA, conventional, and USDA loans. Updated for the May 2025 FHA rule change.";
const PATH = "/deep-dives/residency-rules";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-26";
const MODIFIED = "2026-04-26";

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
  const colonIdx = text.indexOf(":");
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
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight, flex: 1 }}>Geek Tip — {title}</span>
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

const FHA_LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function ResidencyRulesPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Residency and Visa Rules for US Mortgages: What Status Lets You Buy a Home",
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
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified April 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
            Residency and Visa Rules for US Mortgages: <em style={{ fontStyle: "italic", color: P.gold }}>What Status Lets You Buy a Home</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            If you're not a US citizen, your immigration status determines which mortgage programs you can use, sometimes which lenders will work with you, and even which down payment requirements apply. The rules are clearer than they look, but they're spread across agency guidelines, lender overlays, and one big policy shift in May 2025 that closed the door on <a href="/deep-dives/fha-manual-underwriting" style={FHA_LINK_STYLE}>FHA loans</a> for most non-permanent residents.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page maps it all out. Five borrower statuses, four loan programs, one infographic. If you're a borrower trying to figure out where you stand, a realtor working with foreign-national buyers, or another LO who needs a quick reference, this is for you.
          </p>
        </header>

        <div style={{ background: "rgba(184, 134, 11, 0.06)", border: `1px solid rgba(184, 134, 11, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator. I'm not an immigration attorney. The rules below are mortgage qualification rules, not immigration rules. If you have questions about your immigration status itself (visa renewals, green card processing, asylum applications), that's a conversation for an immigration attorney. What I can tell you is which mortgage programs accept which statuses, and how to put a clean file together once you know yours.
            </p>
          </div>
        </div>

        <H2>The five borrower categories that matter</H2>
        <Para>
          Mortgage residency rules don't care about visa types per se. They care about <strong style={{ color: P.navy, fontWeight: 600 }}>what category of borrower you are</strong>. Five categories cover everyone:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>1. US Citizens.</strong> Born here or naturalized. No restrictions on any loan program.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>2. Lawful Permanent Residents.</strong> Green card holders, conditional or non-conditional. No restrictions on any loan program.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>3. Asylees and Refugees.</strong> Granted protected status due to persecution or fear of persecution. Eligible for Conventional, VA, and USDA, but no longer eligible for new FHA loans (the May 2025 rule change applied here too).
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>4. Non-Permanent Residents with work authorization.</strong> Here on a visa or EAD that allows them to work. This is where the rules get complicated, and where the May 2025 FHA change matters most.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>5. Other temporary visitors.</strong> Tourists, business visitors, students without work authorization, diplomats. These categories generally cannot get a US mortgage on agency loan programs.
        </Para>
        <Para>
          The infographic below maps each category to each loan program. The detail sections after it cover the nuances.
        </Para>

        <H2>The big chart. Who qualifies for what.</H2>

        <ResidencyEligibilityGrid />

        <H2>The May 25, 2025 FHA rule change</H2>
        <Para>
          This is the most important policy shift in residency-based mortgage rules in over a decade. Here's what changed and what it means.
        </Para>

        <H3>What the rule used to be</H3>
        <Para>
          Before May 25, 2025, FHA accepted non-permanent residents on essentially the same terms as permanent residents, as long as they had valid work authorization (an H-1B visa, an EAD card, etc.) and the work authorization was expected to continue. This made FHA a popular path for foreign nationals working in the US, especially first-time buyers who wanted the lower down payment requirement (3.5% versus 5% conventional).
        </Para>

        <H3>What the rule is now</H3>
        <Para>
          For FHA case numbers ordered on or after <strong style={{ color: P.navy, fontWeight: 600 }}>May 25, 2025</strong>, FHA only accepts:
        </Para>
        <Bullets items={[
          "US citizens",
          "Lawful permanent residents (green card holders, conditional or non-conditional)",
        ]} />
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>That's it.</strong> FHA no longer accepts H-1B visa holders, EAD card holders, asylees, refugees, or any other non-permanent resident category. No exceptions for length of work history, no exceptions for renewal track record, no exceptions for protected statuses. If you don't have a green card and you're not a US citizen, you cannot get an FHA loan.
        </Para>
        <Para>
          This caught a lot of LOs and borrowers off guard, especially for asylees and refugees who had previously been treated similarly to permanent residents on FHA. The May 2025 change was a clean cut: the only acceptable statuses now are citizen or green card.
        </Para>

        <H3>What this means in practice</H3>
        <Para>
          The vast majority of foreign nationals working in the US on visas are now redirected to <a href="/compare" style={FHA_LINK_STYLE}>conventional loans</a>. The practical differences:
        </Para>
        <Bullets items={[
          "**Down payment.** Conventional requires a minimum of 3% to 5% depending on the program (versus FHA's 3.5%). Not dramatically different on the surface.",
          "**Mortgage insurance.** Conventional uses Private Mortgage Insurance (PMI), which is removable once you reach 20% equity. FHA uses Mortgage Insurance Premium (MIP), which is generally permanent for the life of the loan unless you put down 10%+. So conventional is often *better* long-term for borrowers who would have used FHA.",
          "**Credit score requirements.** Conventional typically wants 620+ (with most lenders pricing best at 680+). FHA accepts down to 580. Borrowers with marginal credit who would have used FHA may now struggle to qualify conventionally.",
          "**Approval flexibility.** FHA is more forgiving on derogatory credit and higher DTI ratios. Conventional is stricter. Files that would have closed on FHA may not close conventionally.",
        ]} />
        <Para>
          The borrowers most affected by this rule are non-permanent residents with credit scores between 580 and 620, or with recent derogatory credit. Before May 2025, FHA was their path. After May 2025, many of them simply cannot qualify on agency loan programs.
        </Para>

        <GeekTip title="The rule applies to the case number date, not application date">
          <TipBody text="What matters is when the FHA case number was ordered, not when the loan application was started. If your case number was ordered before May 25, 2025, you may still be operating under the old rule. If your case number was ordered on or after that date, the new rule applies. Some borrowers in process at the changeover got grandfathered; new applications since haven't." />
        </GeekTip>

        <H2>Conventional, VA, and USDA. The status of these programs.</H2>
        <Para>
          The May 2025 change was FHA-only. The other three agency programs maintained their existing rules.
        </Para>

        <H3>Conventional (Fannie Mae and Freddie Mac)</H3>
        <Para>
          Conventional remains the most flexible on residency. Acceptable statuses:
        </Para>
        <Bullets items={[
          "US citizens",
          "Permanent residents (green card)",
          "Asylees and refugees",
          "Non-permanent residents with valid work authorization (visa or EAD)",
        ]} />
        <Para>
          Conventional cares about whether the borrower has lawful permission to be in the US and whether their work authorization extends through closing. The exact visa or EAD category is mostly a documentation question, not an eligibility question.
        </Para>
        <Para>
          There are limited exceptions. Diplomats with diplomatic immunity are not eligible (they're outside US legal jurisdiction). Tourists, business visitors, and students without work authorization are not eligible. The full list of ineligible statuses is in the appendix.
        </Para>

        <H3>VA</H3>
        <Para>
          VA loans require US military service, so the residency requirement is automatically met (you can't serve in the US military without lawful status). Veterans, active-duty service members, certain National Guard and Reserve members, and surviving spouses are eligible.
        </Para>
        <Para>
          Very rare cases where a VA-eligible borrower's spouse or co-borrower has a non-citizen status do come up. The VA borrower themselves still has to be a US citizen or qualifying permanent resident.
        </Para>

        <H3>USDA Rural Development</H3>
        <Para>
          USDA loans accept the same statuses as Conventional (citizens, permanent residents, asylees, refugees, and non-permanent residents with work authorization), with the additional requirement that the property be in a USDA-eligible rural area and the household meet USDA income limits. Residency rules are not the bottleneck on USDA loans; the location and income rules are. For how those rules play out on a manual file, see our <a href="/deep-dives/usda-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>USDA manual underwriting deep dive</a>.
        </Para>

        <H2>For non-permanent residents. What documents you actually need.</H2>
        <Para>
          If you're a non-permanent resident pursuing a conventional or USDA loan, your residency documentation is one of the more sensitive parts of the file. Here's what an experienced lender will ask for.
        </Para>

        <H3>Visa documentation</H3>
        <Para>
          A copy of your unexpired visa, valid through the closing date. Common acceptable visa types include H-1B, H-1B1, L-1, O-1, E-1/E-2/E-3, TN/TC NAFTA, R-1, and many others. The full list is extensive.
        </Para>
        <Para>
          The visa expiration date matters. Lenders want to see that your visa is valid through closing, not just the application date. If your visa expires shortly after closing and you don't have a renewal in process, the file may be conditional on proof of renewal.
        </Para>

        <H3>EAD card</H3>
        <Para>
          If your work authorization comes from an EAD (Employment Authorization Document) card rather than a visa, the EAD card needs to be valid through closing. Common acceptable EAD categories include C09 (adjustment of status), A05 (asylum granted), C03 (student practical training), C08 (asylum applicant pending), and many others.
        </Para>

        <H3>Renewal history</H3>
        <Para>
          If your visa or EAD expires within 12 months of closing, the lender will want to see a history of prior renewals. Multiple successful renewals in your history typically satisfy the lender that continuation is likely. No prior renewals creates a closer call that may require additional documentation from your employer or USCIS.
        </Para>

        <H3>Employer verification</H3>
        <Para>
          For visa-holders qualifying with employment income, the lender will run a standard verification of employment, plus often request a letter from the employer confirming the role, salary, and length of intended employment.
        </Para>

        <GeekTip title="Don't try to time your loan around a visa renewal">
          <TipBody text="Some borrowers think they should wait until their visa is freshly renewed before applying. In practice, the better strategy is to apply when you're financially ready and let the lender work with whatever timing your visa is on. If a renewal is in process, document the renewal application. If the visa is expiring soon and no renewal is in process, that's the issue, not the timing of your loan application." />
        </GeekTip>

        <H2>Asylees, refugees, and the documentation that works</H2>
        <Para>
          Asylees and refugees are protected statuses with their own documentation rules. <strong style={{ color: P.navy, fontWeight: 600 }}>Conventional, VA, and USDA loans accept asylee and refugee status.</strong> FHA no longer does, as of the May 2025 rule change.
        </Para>
        <Para>
          The good news: outside of FHA, asylee and refugee status is treated similarly to permanent resident status for mortgage qualification purposes. There's no work-authorization-renewal question to navigate the way there is with H-1Bs and EADs, because asylee and refugee status doesn't expire the same way a work visa does.
        </Para>
        <Para>Acceptable documentation for asylee status:</Para>
        <Bullets items={[
          "A05 EAD card",
          "I-94 Arrival/Departure Record showing asylum granted",
          "Court signed/stamped decision documents evidencing asylum has been granted",
        ]} />
        <Para>Acceptable documentation for refugee status:</Para>
        <Bullets items={[
          "A03 EAD card",
          "I-730 form approved by USCIS",
          "I-94 Arrival/Departure Record showing refugee status",
          "Court signed/stamped decision documents evidencing refugee status has been granted",
        ]} />
        <Para>
          Either status, when properly documented, qualifies for Conventional, VA, and USDA loans on the same terms as a permanent resident. For FHA, the borrower would need to obtain lawful permanent resident status (a green card) before applying.
        </Para>

        <GeekTip title="Asylees and refugees should not assume FHA is closed forever">
          <TipBody text="Many asylees and refugees are eligible to apply for a green card after one year (asylees) or one year of physical presence (refugees). Once you have permanent resident status, FHA reopens. If FHA is the right loan program for your situation but you're currently asylee or refugee status only, work with an immigration attorney on the green card timeline. The mortgage program will be there when you're ready." />
        </GeekTip>

        <H2>A note on DACA</H2>
        <Para>
          Deferred Action for Childhood Arrivals (DACA) recipients have an EAD card with category C33 and are eligible for conventional loans through Fannie Mae's Desktop Underwriter (DU) only, subject to standard documentation requirements. Freddie Mac (LPA) and FHA do not accept DACA recipients. VA and USDA generally don't either.
        </Para>
        <Para>
          The DACA program itself has been politically and legally volatile for years, and the rules around DACA borrowers can change with little notice. If you're a DACA recipient considering a mortgage, work with an LO who has done DACA loans recently. The rules may be different by the time you read this from when this page was published.
        </Para>

        <H2>Nick's take. What I tell foreign-national borrowers</H2>
        <Para>
          Most of what I tell foreign-national borrowers boils down to three things.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>First: don't assume FHA is your only path.</strong> A lot of online content for foreign-national buyers still mentions FHA as the easy first-time-buyer program. After May 2025, that's only true if you have a green card. For everyone else, conventional is the path. The rate and down payment differences are smaller than people think, and conventional avoids the permanent MIP that FHA charges.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Second: get your documentation in order before you apply.</strong> The single biggest source of delay on foreign-national files is incomplete or inconsistent documentation. Have your visa or EAD ready, your last two years of tax returns, your employment verification letter, and a clear picture of your renewal history. If you're missing any of these, your loan officer will spend three weeks chasing them instead of moving the file forward.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Third: pick a lender who works with foreign nationals routinely.</strong> Some lenders won't touch a non-permanent resident file. Others will, but their underwriters aren't familiar with the rules and they'll make conservative calls. The lenders who do these loans well do them every day. The difference shows up at conditions, where an experienced LO clears them in a week and an inexperienced one drags the file for months.
        </Para>
        <Para>
          In my experience, well-prepared foreign-national borrowers close at the same rate as domestic ones. The mythology that "foreign nationals are hard to close" is mostly about lenders who don't know the rules, not about borrowers who don't qualify.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>I have an H-1B. Can I get an FHA loan?</H3>
        <Para>
          Not for case numbers ordered on or after May 25, 2025. H-1B holders are eligible for conventional loans. If you specifically need FHA (perhaps for credit score reasons), you would need to obtain a green card first.
        </Para>

        <H3>What if my visa expires in 6 months?</H3>
        <Para>
          The lender wants to see that your work authorization is likely to continue. If you have a history of prior successful renewals, that history typically satisfies the lender. If you have no prior renewals and the visa is expiring soon, expect the lender to require additional documentation from your employer or USCIS confirming the renewal is in process.
        </Para>

        <H3>Do I need a Social Security Number for a mortgage?</H3>
        <Para>
          Yes, for agency loans (Conventional, FHA, VA, USDA), you need a valid Social Security Number. ITIN-only borrowers (Individual Taxpayer Identification Number) cannot use these loan programs. There are non-QM portfolio products that accept ITINs, but those are different products with different rates and terms.
        </Para>

        <H3>Can my non-citizen spouse co-borrow?</H3>
        <Para>
          Yes, with a few caveats. Both borrowers need lawful status. If you're a citizen and your spouse is on a non-immigrant visa, the spouse needs work authorization to contribute income to qualifying. If the spouse isn't using income, residency requirements are still verified but the documentation burden is lighter.
        </Para>

        <H3>I'm a green card holder. Are there any restrictions on me?</H3>
        <Para>
          For mortgage purposes, no. Permanent residents (green card holders) are treated essentially identically to citizens for mortgage qualification. The card needs to be valid (not expired or with an expired conditional period without an active renewal). Otherwise, no restrictions across any loan type.
        </Para>

        <H3>What's the difference between a visa and an EAD?</H3>
        <Para>
          A visa is permission to enter and remain in the US for a specific purpose (work, study, etc.) with restrictions on what you can do. An EAD (Employment Authorization Document) is a separate document specifically authorizing you to work, often issued to people who don't have an employment-based visa but have some other status that allows work (asylum applicants, students on practical training, spouses of certain visa holders, etc.). Both documents serve as work authorization for mortgage purposes.
        </Para>

        <H3>I had an FHA loan before May 2025. What happens if I refinance?</H3>
        <Para>
          If you're refinancing an existing FHA loan, the case number for the refinance is what matters. A new FHA case number ordered today on a refinance would be subject to the new rule. So a non-permanent resident who has an existing FHA loan generally cannot refinance into a new FHA loan today; they would need to refinance to conventional.
        </Para>

        <H3>I'm in the US on a B-1/B-2 tourist visa. Can I buy a house?</H3>
        <Para>
          You can buy a property in cash, but you cannot get an agency loan with a tourist visa. B-1/B-2 status is specifically for visitors, not residents. Some non-QM portfolio lenders do "foreign national" loans for property investment that don't require US residency, but those are different products with significantly different terms (typically 25-30% down, higher rates, no agency backing).
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page summarizes residency-based mortgage eligibility rules as they exist in 2026, organized by borrower status rather than by visa code. It is not:
        </Para>
        <Bullets items={[
          "**Immigration advice.** Your immigration status is determined by USCIS, not by your lender. If you have questions about your visa or green card itself, talk to an immigration attorney.",
          "**Legal advice.** The rules summarized here are based on agency guidelines (Fannie Mae, Freddie Mac, FHA, VA, USDA) and are subject to change. The May 2025 FHA change is a recent example. Verify current rules with a licensed loan officer before making decisions.",
          "**A guarantee of approval.** Even within an eligible status category, individual files have to clear all the standard underwriting hurdles (credit, income, assets, etc.). Status eligibility is necessary but not sufficient.",
        ]} />
        <Para>
          If you're trying to navigate this for a real loan and want to talk through your specific situation, I'm reachable at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={FHA_LINK_STYLE}>(615) 656-0737</a> or <a href="mailto:npeters@annie-mac.com" aria-label="Email Nick Peters at npeters@annie-mac.com" style={FHA_LINK_STYLE}>npeters@annie-mac.com</a>. Bring your status documents and a clear picture of your timeline. We'll figure out what's possible.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Need help figuring out your status?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:npeters@annie-mac.com" aria-label="Email Nick Peters at npeters@annie-mac.com" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>npeters@annie-mac.com</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your status documents and a clear picture of your timeline. We'll figure out what's possible.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: FHA Single Family Housing Policy Handbook 4000.1, Section II.A.1.b.iii (Residency Requirements), with May 25, 2025 update; FHA Mortgagee Letter announcing the May 2025 non-permanent resident rule change; Fannie Mae Selling Guide B2-2-02 (Non-US Citizen Borrower Eligibility); Freddie Mac Single-Family Seller/Servicer Guide 5103.2 (Non-US Citizen Borrowers); VA Lender's Handbook (Pamphlet 26-7), Chapter 4; USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook; author's 12+ years of field experience originating loans for foreign-national borrowers.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
