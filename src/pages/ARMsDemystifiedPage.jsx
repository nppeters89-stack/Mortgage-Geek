import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { ARMRateAnatomyGraphic } from "../components/ARMRateAnatomyGraphic";
import { ARMTermsGlossary } from "../components/ARMTermsGlossary";

const TITLE = "ARMs Demystified: How Adjustable-Rate Mortgages Work, When They Make Sense, and What the Caps Actually Mean | Mortgage Geek";
const DESCRIPTION = "Adjustable-rate mortgages explained in plain English. How caps work, when ARMs make sense, qualifying rate quirks. From a real LO with 12+ years.";
const PATH = "/deep-dives/arms-demystified";
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

const CAPS_EXAMPLE_ROWS = [
  { year: "Years 1-7", rate: "6.0%", payment: "$2,398", change: "Initial fixed period" },
  { year: "Year 7.5 (first adjust)", rate: "7.0%", payment: "$2,659", change: "Index + margin lands at 7.0%" },
  { year: "Year 8", rate: "6.75%", payment: "$2,591", change: "Index drops slightly" },
  { year: "Year 9", rate: "7.0%", payment: "$2,659", change: "Back to 7.0%" },
  { year: "Year 10", rate: "6.5%", payment: "$2,524", change: "Index trends down" },
  { year: "Year 12", rate: "6.0%", payment: "$2,398", change: "Back to original rate" },
  { year: "Year 15", rate: "5.5%", payment: "$2,265", change: "Lower than original" },
];

function CapsExampleTable() {
  const captionId = "arm-caps-example-caption";
  return (
    <div className="arm-caps-container" role="region" aria-label="ARM worked example with realistic adjustments">
      <style>{`
        .arm-caps-container {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 14px;
          overflow: hidden;
          margin: 22px 0 28px;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .arm-caps-wrap { padding: 22px 18px; }
        .arm-caps-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
        }
        .arm-caps-table caption {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          padding-bottom: 12px;
        }
        .arm-caps-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 12px 14px;
          text-align: left;
          border: none;
        }
        .arm-caps-table thead th:first-child { border-top-left-radius: 6px; }
        .arm-caps-table thead th:last-child { border-top-right-radius: 6px; }
        .arm-caps-table tbody td {
          padding: 14px;
          color: ${P.text};
          border-bottom: 1px solid ${P.creamDark};
          line-height: 1.55;
          vertical-align: top;
        }
        .arm-caps-table tbody tr:nth-child(odd) td { background: ${P.cream}; }
        .arm-caps-table tbody tr:nth-child(even) td { background: ${P.white}; }
        .arm-caps-table tbody tr:last-child td { border-bottom: none; }
        .arm-caps-year {
          font-weight: 600;
          color: ${P.goldMuted};
          letter-spacing: 0.4px;
          white-space: nowrap;
        }
        .arm-caps-rate, .arm-caps-payment {
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .arm-caps-mobile-stack { display: none; }

        @media (max-width: 600px) {
          .arm-caps-wrap { padding: 22px 14px; }
          .arm-caps-table { display: none; }
          .arm-caps-mobile-stack { display: block; }
          .arm-caps-card {
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.gold};
            border-radius: 8px;
            background: ${P.white};
            padding: 14px 16px;
            margin-bottom: 10px;
          }
          .arm-caps-card-year {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            color: ${P.goldMuted};
            margin-bottom: 8px;
            font-family: ${F.body};
          }
          .arm-caps-card-row {
            display: flex;
            justify-content: space-between;
            font-family: ${F.body};
            font-size: 14px;
            color: ${P.text};
            line-height: 1.6;
            padding: 2px 0;
          }
          .arm-caps-card-label {
            color: ${P.warmGray};
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .arm-caps-card-change {
            display: block;
            font-family: ${F.body};
            font-size: 13px;
            color: ${P.text};
            line-height: 1.55;
            margin-top: 6px;
            font-style: italic;
          }
        }
      `}</style>
      <div className="arm-caps-wrap">
        <table className="arm-caps-table" aria-labelledby={captionId}>
          <caption id={captionId}>$400,000 7/6 ARM at 6.0% with 5/1/5 caps, moderate adjustment scenario</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Rate</th>
              <th scope="col">Monthly P&amp;I</th>
              <th scope="col">What changed</th>
            </tr>
          </thead>
          <tbody>
            {CAPS_EXAMPLE_ROWS.map((row) => (
              <tr key={row.year}>
                <td className="arm-caps-year">{row.year}</td>
                <td className="arm-caps-rate">{row.rate}</td>
                <td className="arm-caps-payment">{row.payment}</td>
                <td>{row.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="arm-caps-mobile-stack">
          {CAPS_EXAMPLE_ROWS.map((row) => (
            <div key={row.year} className="arm-caps-card">
              <span className="arm-caps-card-year">{row.year}</span>
              <div className="arm-caps-card-row">
                <span className="arm-caps-card-label">Rate</span>
                <span>{row.rate}</span>
              </div>
              <div className="arm-caps-card-row">
                <span className="arm-caps-card-label">Monthly P&amp;I</span>
                <span>{row.payment}</span>
              </div>
              <span className="arm-caps-card-change">{row.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ARMsDemystifiedPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "ARMs Demystified: How Adjustable-Rate Mortgages Actually Work",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><img src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" width={21} height={26} style={{ display: "block", flexShrink: 0, marginRight: 7 }} />
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
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified April 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
            ARMs Demystified: <em style={{ fontStyle: "italic", color: P.gold }}>How Adjustable-Rate Mortgages Actually Work</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            An adjustable-rate mortgage (ARM) is a home loan that starts with a fixed interest rate for a set number of years, then adjusts at regular intervals based on market conditions. That's the whole concept in one sentence. Everything else is mechanics: how the adjustments are calculated, what limits keep them from running away, and when an ARM is genuinely the right move versus when it puts a borrower in a bind.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            About 8% of mortgages in 2026 are ARMs, up from roughly 3% just a few years ago. The reason is simple: when fixed rates are high, the lower introductory rate on an ARM becomes attractive again. Whether that math actually works for a given borrower depends on details most online articles gloss over.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page covers what an ARM actually is, how the rate adjustments work, what the caps mean in real dollars, when ARMs make sense, and when they don't. If you're a borrower comparing ARM offers, a realtor working with a buyer who's considering one, or a fellow LO trying to explain this stuff cleanly to clients, this is for you.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator with 12+ years of experience writing mortgages. I'm not a financial advisor, and your specific decision depends on your specific situation. This page explains how ARMs work and when they tend to make sense, but the right call for your file is a conversation with someone who can look at the whole picture.
            </p>
          </div>
        </div>

        <H2>First, what is an ARM exactly?</H2>
        <Para>An adjustable-rate mortgage has two phases:</Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>1. The initial fixed period.</strong> Your interest rate is locked for a specific number of years at the start of the loan. Common fixed periods are 3, 5, 7, or 10 years. During this period, the loan behaves exactly like a fixed-rate mortgage. Your rate doesn't change, your payment doesn't change.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>2. The adjustment period.</strong> Once the initial fixed period ends, the rate starts adjusting at a regular interval (usually every 6 months or every year) for the remainder of the loan term. Each adjustment is calculated using a market benchmark plus a fixed margin set by the lender. This is where ARMs get more complex than fixed-rate loans.
        </Para>
        <Para>
          Most ARMs are 30-year loans overall. A "5/6 ARM" doesn't mean a 5-year loan or a 6-year loan. It means a 30-year mortgage where the first 5 years are at a fixed rate, then the rate adjusts every 6 months for the remaining 25 years.
        </Para>

        <H3>Reading ARM names</H3>
        <Para>The two-number naming convention trips up a lot of people. Here's the decoder:</Para>
        <Bullets items={[
          "**First number:** how many years the initial rate is fixed",
          "**Second number:** how often the rate adjusts after that",
        ]} />
        <Para>So:</Para>
        <Bullets items={[
          "**5/1 ARM:** Fixed for 5 years, adjusts every 1 year",
          "**5/6 ARM:** Fixed for 5 years, adjusts every 6 months",
          "**7/1 ARM:** Fixed for 7 years, adjusts every 1 year",
          "**7/6 ARM:** Fixed for 7 years, adjusts every 6 months",
          "**10/1 ARM:** Fixed for 10 years, adjusts every 1 year",
          "**10/6 ARM:** Fixed for 10 years, adjusts every 6 months",
        ]} />
        <Para>
          The most common ARMs in the market today are 5/6, 7/6, and 10/6. The shift from "/1" to "/6" happened a few years back when most lenders moved from annual adjustments to semi-annual, which means smaller but more frequent rate changes after the fixed period ends.
        </Para>

        <H2>Why ARMs exist (and why anyone would choose one)</H2>
        <Para>
          ARMs exist because of a basic mismatch in mortgage finance: <strong style={{ color: P.navy, fontWeight: 600 }}>lenders don't actually want to lock a 30-year fixed rate.</strong> Locking a 30-year rate means a lender is committing to a rate today that they'll be receiving for three decades, regardless of what happens to the cost of money in the meantime. That's a lot of risk to absorb, and lenders charge for it. The fixed-rate premium is real and significant.
        </Para>
        <Para>
          ARMs let lenders shift some of that risk to the borrower. In exchange, the borrower gets a lower starting rate. <strong style={{ color: P.navy, fontWeight: 600 }}>The rate discount on an ARM versus a fixed-rate loan is typically 0.25% to 0.75%, depending on market conditions and the length of the initial fixed period.</strong> When fixed rates are low (like 2020-2021), that discount isn't very compelling. When fixed rates are high (like 2023-2026), the discount becomes meaningful.
        </Para>
        <Para>
          So the basic logic for choosing an ARM is: <strong style={{ color: P.navy, fontWeight: 600 }}>you're trading future certainty for present savings.</strong> If your time horizon is short enough or your cash flow situation is tight enough, that trade can make sense. If you're settling into your forever home with a stable budget, it usually doesn't.
        </Para>

        <GeekTip title="The discount isn't always there">
          <TipBody text="ARM rates aren't automatically lower than fixed rates. There have been periods where ARM rates were equal to or even slightly higher than fixed rates because of how the yield curve was shaped. Always compare actual rates from your lender at the time of your specific loan, not assumptions about what ARMs &quot;should&quot; cost." />
        </GeekTip>

        <H2>The anatomy of an ARM rate</H2>
        <Para>
          This is the section worth taking time to actually understand. Once you see how an ARM rate is built, the rest of the topic becomes easy. Most online explanations of ARMs skip past this and go straight to the pros and cons, which is backwards.
        </Para>

        <ARMRateAnatomyGraphic />

        <Para>An ARM rate has five moving pieces. Here's each one in plain English.</Para>

        <H3>1. The note rate (initial fixed rate)</H3>
        <Para>
          This is the rate you start with. It's printed on your loan documents, it's what determines your initial monthly payment, and it stays in place for the entire initial fixed period (3, 5, 7, or 10 years depending on the ARM type). Sometimes called the "teaser rate" or "start rate," though those terms have a slightly negative connotation that doesn't really fit modern ARMs.
        </Para>
        <Para>
          The note rate is set at loan origination based on market conditions, the lender's pricing, and the specific ARM product you're choosing. It doesn't move during the initial fixed period.
        </Para>

        <H3>2. The index</H3>
        <Para>The index is the market benchmark your loan will use to calculate adjustments after the fixed period ends. Most modern ARMs use one of two indexes:</Para>
        <Bullets items={[
          "**SOFR (Secured Overnight Financing Rate).** Published daily by the Federal Reserve Bank of New York. This is the dominant index for ARMs originated since 2021, when LIBOR was phased out.",
          "**CMT (Constant Maturity Treasury).** Based on the yield on US Treasury securities. Less common than SOFR for new ARMs but still used.",
        ]} />
        <Para>
          The index is whatever it is at the time of each adjustment. Neither you nor your lender controls it. It's just a market reference point that everyone agrees to use.
        </Para>

        <H3>3. The margin</H3>
        <Para>
          The margin is a fixed percentage your lender adds to the index to calculate your actual rate at each adjustment. It's set when you originate the loan and never changes for the life of the loan.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Margins typically range from 2% to 3.5%</strong>, with the exact number depending on the lender, the ARM product, and your credit profile. A borrower with strong credit might get a 2.25% margin; a borrower with marginal credit might get a 3.0% margin on the same product.
        </Para>
        <Para>
          The margin is one of the most important things to compare when shopping ARMs across lenders. A 0.5% difference in margin doesn't matter at all during the fixed period (your note rate is what matters then), but over a 25-year adjustment phase it adds up significantly.
        </Para>

        <H3>4. The fully indexed rate</H3>
        <Para>This is what your rate will actually be at each adjustment, calculated as:</Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Fully Indexed Rate = Current Index + Margin</strong>
        </Para>
        <Para>
          If SOFR is 4.5% on your adjustment date and your margin is 2.75%, your fully indexed rate is 7.25%. Lenders are required to round to the nearest 1/8% (so 7.25% rather than 7.231%).
        </Para>
        <Para>
          The fully indexed rate is also what's used to qualify you for the loan in the first place, in some cases. More on that below.
        </Para>

        <H3>5. The caps</H3>
        <Para>
          Caps are the limits on how much your rate can change at each adjustment and over the life of the loan. They're the safety rails that prevent ARMs from being financial Russian roulette.
        </Para>
        <Para>
          A cap structure is written as three numbers separated by slashes, like <strong style={{ color: P.navy, fontWeight: 600 }}>5/1/5</strong> or <strong style={{ color: P.navy, fontWeight: 600 }}>2/1/5</strong>. Here's what each number means:
        </Para>
        <Bullets items={[
          "**First number (initial cap):** How much the rate can change at the *first* adjustment. A \"5\" means the rate can go up or down by no more than 5 percentage points at that first reset.",
          "**Second number (periodic cap):** How much the rate can change at each *subsequent* adjustment. A \"1\" means no more than 1 percentage point in either direction.",
          "**Third number (lifetime cap):** The maximum the rate can ever go above the original note rate. A \"5\" means the rate can never exceed your note rate plus 5 percentage points.",
        ]} />
        <Para>
          Caps protect borrowers from catastrophic rate moves. They also protect lenders from having to make wild rate decreases if rates plummet. Without caps, a 30-year ARM tied to SOFR would be unmarketable to almost anyone.
        </Para>

        <GeekTip title="The first cap matters most for short ARMs">
          <TipBody text="A 2/1/5 cap structure on a 5-year ARM is much more conservative than a 5/1/5 structure. The &quot;first cap&quot; is what limits the worst-case scenario at your first adjustment, which is also the most likely time you'd be hit with a rate hike. Always compare the cap structures across ARM offers, not just the note rates." />
        </GeekTip>

        <H2>Caps explained: what 5/1/5 actually means in real dollars</H2>
        <Para>
          Caps are the most misunderstood part of ARMs, and they're exactly the thing borrowers need to understand most. Let me walk through a concrete example.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Scenario:</strong> You take out a $400,000 7/6 ARM at a 6.0% note rate with 5/1/5 caps. Your initial monthly principal and interest payment is $2,398.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>At the end of year 7</strong>, your initial fixed period ends and the first adjustment happens. The first cap of "5" means your rate can go up or down by a maximum of 5 percentage points. So your worst-case rate at the first adjustment is <strong style={{ color: P.navy, fontWeight: 600 }}>11.0%</strong> (6.0% + 5.0%). Best case it goes down, but realistically the absolute worst case is 11.0%.
        </Para>
        <Para>
          At 11.0% on the remaining balance of about $367,000 (you've paid down some principal in the first 7 years), your new monthly P&amp;I would be roughly $3,654. That's an increase of $1,256 per month. <strong style={{ color: P.navy, fontWeight: 600 }}>This is what people mean by "payment shock."</strong>
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>At each adjustment after that</strong> (every 6 months for a 7/6 ARM), the periodic cap of "1" limits each subsequent change to 1 percentage point in either direction. So even if SOFR goes nuts, your rate can only rise 1% at each 6-month adjustment.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The lifetime cap of "5"</strong> is the absolute ceiling. Your rate can never exceed 11.0% (your 6.0% note rate plus 5.0%) for the life of the loan. So even in the worst case scenario where rates spike at the first adjustment and stay high, your payment stops climbing once you hit the lifetime cap.
        </Para>

        <H3>The "real world" reality</H3>
        <Para>
          Here's the honest truth about caps: <strong style={{ color: P.navy, fontWeight: 600 }}>the worst-case scenario rarely happens.</strong> The first cap exists for theoretical protection but is almost never fully used in practice. Real adjustments are usually in the range of 0.5% to 2.0%, not 5.0%, because the index doesn't typically move that violently in a year.
        </Para>
        <Para>
          But "rarely happens" is not "never happens." 2022 was the closest the market has come to a worst-case ARM scenario in decades, with SOFR jumping over 4% in a single year. ARMs that hit their first adjustment in late 2022 or 2023 saw real rate hikes in the 3-5% range, and a lot of borrowers got hurt.
        </Para>

        <H3>A worked example with realistic adjustments</H3>
        <Para>Let's run the same scenario with more realistic adjustments rather than worst-case:</Para>

        <CapsExampleTable />

        <Para>
          In a moderate scenario like this, the borrower experienced some payment volatility but never approached the lifetime cap. Their average rate over 30 years might end up similar to or even lower than what a fixed-rate loan would have delivered.
        </Para>
        <Para>
          The question isn't "will my rate definitely hit the lifetime cap?" It's "can I afford the payment if it does?" That's the test.
        </Para>

        <H2>The terms you need to know</H2>
        <Para>
          ARM terminology gets dense fast. Here's an interactive glossary of the terms that show up in your loan documents and rate quotes.
        </Para>

        <ARMTermsGlossary />

        <H2>How ARMs are qualified (and why your DTI looks different)</H2>
        <Para>
          This is the section most online articles skip, and it's exactly where borrowers and realtors get tripped up. <strong style={{ color: P.navy, fontWeight: 600 }}>The rate your lender uses to qualify you for an ARM is often not the rate you'll actually pay.</strong>
        </Para>

        <H3>The qualifying rate problem</H3>
        <Para>
          When you apply for a fixed-rate loan, your lender qualifies you using the actual rate you'll be paying. Your DTI calculation uses your real monthly payment.
        </Para>
        <Para>
          When you apply for an ARM, regulators and investors generally don't trust the note rate alone for qualifying purposes, because the note rate only applies for a few years. So the rule depends on the type of loan:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>For Conventional ARMs</strong> with an initial fixed period of 5 years or more, lenders typically qualify at the note rate. So a 5/6, 7/6, or 10/6 conventional ARM is usually qualified at the rate you'll actually pay during the initial fixed period.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>For Conventional ARMs</strong> with an initial fixed period of less than 5 years, lenders qualify at the higher of the note rate or the fully indexed rate. So a 3/1 ARM might be qualified at a rate 1-2% higher than your actual note rate.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>For Government ARMs (<a href="/deep-dives/fha-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>FHA</a>, <a href="/deep-dives/va-manual-underwriting" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>VA</a>, USDA)</strong> the rules vary by program but generally follow the conventional logic: longer fixed periods qualify at the note rate, shorter ones use the higher of note rate or fully indexed rate.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Some states</strong> have additional rules that can require qualifying at the fully indexed rate even for longer-fixed ARMs. Your LO should know whether your state is an "exception state."
        </Para>

        <H3>Why this matters for your DTI</H3>
        <Para>
          If your note rate is 6.0% but your fully indexed rate would calculate to 7.5%, and you're being qualified at 7.5%, your monthly payment for <a href="/calculator" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>DTI purposes</a> is calculated on 7.5%, not 6.0%. That can be a meaningful difference.
        </Para>
        <Para>
          For a $400,000 loan at 6.0% the monthly P&amp;I is $2,398. At 7.5% it's $2,797. That $399 difference flows straight into your DTI calculation. On a borrower with $8,000 in monthly income, that's a 5% DTI swing. Enough to push some files from approve to refer.
        </Para>
        <Para>
          The flip side: even though you're qualified at the higher rate, you're still actually paying the lower note rate during the fixed period. So borrowers who get qualified often find their actual cash flow is meaningfully easier than their DTI calculation suggested.
        </Para>

        <GeekTip title="Ask your LO what rate they're qualifying you at">
          <TipBody text="When you're shopping ARMs, ask each lender specifically what rate they're using to qualify you. The note rate, fully indexed rate, and qualifying rate can all be different, and most rate quotes don't make this clear. The qualifying rate is what determines whether you can get the loan at all." />
        </GeekTip>

        <H2>Why this matters right now (the 2026 context)</H2>
        <Para>
          ARMs are getting attention in 2026 for the same reason they got attention in the early 2000s: <strong style={{ color: P.navy, fontWeight: 600 }}>fixed mortgage rates are high, and the spread to ARM rates is meaningful again.</strong> ARMs now make up about 8% of the mortgage market, up from roughly 3% just a few years ago.
        </Para>
        <Para>
          The math is straightforward. When 30-year fixed rates are sitting in the high 6s to low 7s, and a 7/6 ARM is offering a starting rate in the high 5s to low 6s, that's a 0.5% to 1.0% discount over a 7-year fixed period. On a $400,000 loan, that's $200-400 per month in savings during the fixed period, or $24,000-48,000 over 7 years. Real money.
        </Para>
        <Para>
          But this is also exactly when ARMs get oversold to the wrong borrowers. A few things are worth thinking about:
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The rate environment that created the discount also creates the risk.</strong> ARMs are attractive now because fixed rates are high. But "fixed rates are high" also means "the index is high," which means "your fully indexed rate at first adjustment is going to be high." If you take a 7/6 ARM today and rates haven't dropped significantly by 2033, your first adjustment isn't going to be pretty.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>The "rates will drop" assumption is doing a lot of work.</strong> Most ARM pitches in 2026 implicitly assume rates will be lower in 5-7 years. That might be right. It might not. Nobody actually knows. The honest framing is: if rates don't drop, your ARM converts to roughly the rate you would have locked at fixed in 2026 anyway. The discount you got during the fixed period was real money, but the long-term math depends on assumptions.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Refinancing options aren't guaranteed.</strong> A common ARM strategy is "I'll just refinance to fixed before the adjustment if rates haven't dropped." This works fine in normal rate environments. It doesn't work if rates have gone up, if the borrower's credit has deteriorated, if their income has dropped, if the home value has fallen below 80% LTV, or if any other qualifying issue has emerged. In 2009-2010 and again in 2022-2023, plenty of ARM borrowers found themselves stuck in adjustments because they couldn't refinance.
        </Para>

        <H2>When an ARM actually makes sense</H2>
        <Para>
          There are three borrower profiles where ARMs are genuinely a good fit, and three where they're not. Here's how to think about it.
        </Para>

        <H3>When an ARM makes sense</H3>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>1. Short time horizon.</strong> If you're confident you'll sell or move before the initial fixed period ends, an ARM is essentially free money. You capture the rate discount during the fixed period and never face the adjustment risk. The most common version: military families, executives with predictable transfers, or buyers planning to upgrade to a larger home in 4-6 years.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>2. Investment property.</strong> Investors care about cash flow during the holding period more than long-term predictability. A lower initial rate translates to better cash flow on a rental, and many investors plan to refinance, sell, or 1031-exchange before the adjustment hits anyway. Rate adjustment risk is also easier to absorb on investment property because rents typically adjust upward over time.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>3. Cash flow constrained borrower with growing income.</strong> If you're early in your career, expect your income to rise meaningfully over the next 5-7 years, and need to qualify based on what you make today, the lower ARM payment can be the difference between getting into a house and not. The risk: you're betting on your income growth.
        </Para>

        <H3>When an ARM is risky</H3>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>1. Long-term primary residence.</strong> If you're buying a forever home and plan to stay 15+ years, the rate predictability of a fixed loan is worth more than the discount on an ARM. You'll likely be paying the fully indexed rate for most of the loan's life, and the difference between a 30-year fixed and an ARM's eventual blended rate isn't worth the volatility.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>2. Tight DTI files.</strong> If you're qualifying right at the DTI cap, you have no room to absorb a rate adjustment. A 1-2% increase in rate at first adjustment could push your housing payment to a level you literally cannot pay. ARMs require margin in your budget.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>3. Borrowers without reserves.</strong> Even if your DTI is comfortable, you need cash on hand to absorb payment shock. Borrowers who close with minimal reserves and then face a 6/12/18 month adjustment with a payment $300-600 higher tend to default. The mortgage industry has decades of data on this.
        </Para>

        <GeekTip title="The break-even calculation">
          <TipBody text="When evaluating an ARM versus a fixed-rate loan, calculate the rate at which the cumulative interest paid on the ARM (during the fixed period plus expected adjustments) equals what you'd pay on the fixed-rate loan over the same period. If your honest assessment of likely rates 5-7 years out is below that break-even, the ARM is the better math. If you think rates will be higher, the fixed loan is better. Most LOs won't run this calculation for you, but they should." />
        </GeekTip>

        <H2>Nick's take: how I counsel borrowers on ARMs</H2>
        <Para>
          In 12+ years originating mortgages, I've written my share of ARMs. I've also talked plenty of borrowers out of them when the file didn't fit. Here's what I've learned.
        </Para>
        <Para>
          The single biggest mistake I see is <strong style={{ color: P.navy, fontWeight: 600 }}>borrowers anchoring on the note rate without thinking about anything else.</strong> Someone sees a 5.75% ARM rate quoted next to a 6.875% fixed rate and immediately wants the ARM. They don't ask about the margin, don't look at the caps, and definitely don't model what happens at adjustment. By the time they understand what they signed up for, they're a few years into the loan and stuck with the answer.
        </Para>
        <Para>
          The second biggest mistake is <strong style={{ color: P.navy, fontWeight: 600 }}>assuming refinancing is always available.</strong> ARM borrowers who say "I'll just refi if rates go up" are betting that their credit, income, employment, and home value will all be in good shape at the moment they need to refinance. That's a lot of variables to bet on.
        </Para>
        <Para>
          The third mistake is <strong style={{ color: P.navy, fontWeight: 600 }}>using ARMs to qualify for more house than the borrower can really afford.</strong> If the only way the file works is on the lower ARM rate, that's not actually qualifying for the house. That's renting the house from the bank for 5-7 years and then finding out whether you can keep it.
        </Para>
        <Para>
          When I recommend an ARM, it's usually one of three situations: a borrower with a clear short timeline (military, planned upgrade, definite job move), an investor where the math obviously works, or a high-income/high-asset borrower for whom the rate volatility is genuinely irrelevant because they have the cash to handle it.
        </Para>
        <Para>
          When I push back, it's usually a primary residence borrower who has gotten excited about the lower rate without thinking about what happens in year 8. The conversation I have is "let me show you what your payment looks like at the lifetime cap, with no income growth assumed, and we'll talk about whether you'd still want this loan." Sometimes they decide the math still works for them. Often they decide it doesn't. Either way, the decision should be informed.
        </Para>
        <Para>
          In my experience, ARMs work great for the right borrower and terribly for the wrong one. The product itself isn't the problem. The fit is.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>Should I get an ARM in 2026?</H3>
        <Para>
          It depends on three things: how long you plan to stay in the home, how much room you have in your budget if the rate adjusts higher, and whether you have reserves to absorb payment shock. If you plan to stay less than 7 years, your DTI has comfortable margin, and you have 6+ months of payment reserves, an ARM might be a good fit. If you plan to stay 15+ years, your DTI is tight, or your reserves are minimal, the fixed-rate predictability is probably worth more than the ARM discount. If you want a rough starting point on the numbers, our <a href="/prequal" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>pre-qualification tool</a> takes about a minute.
        </Para>

        <H3>What happens if I can't refinance before the adjustment hits?</H3>
        <Para>
          You ride the adjustment. Your rate resets to the fully indexed rate (subject to caps), your payment changes, and you continue with the loan as adjusted. This is exactly the scenario ARM caps are designed to protect you from spiraling, but the new payment can still be significantly higher than your original. Your options at that point are: pay the higher amount, sell the home, or keep trying to refinance as conditions change.
        </Para>

        <H3>Can I pay off my ARM early?</H3>
        <Para>
          Almost always yes, without prepayment penalties. The vast majority of modern ARMs do not have prepayment penalties. Some lender overlays add them or offer a slightly lower rate in exchange for accepting one, but those are exceptions. Always check your specific loan documents.
        </Para>

        <H3>What if rates drop, does my payment automatically go down?</H3>
        <Para>
          Yes, subject to your loan's floor. If your floor is 5.0% and the fully indexed rate calculates to 4.0%, your rate stays at the floor. If your floor is set lower (or there's no floor), your rate adjusts down at the next adjustment date and your payment recalculates accordingly. The adjustment is automatic; you don't need to refinance to capture rate decreases.
        </Para>

        <H3>Is the "5/1/5" cap structure standard?</H3>
        <Para>
          5/1/5 is one of the most common cap structures, but not the only one. You'll also see 2/1/5 (more conservative initial cap), 2/2/6, and various others. The cap structure affects your worst-case scenario meaningfully, so always compare cap structures across ARM offers, not just rates.
        </Para>

        <H3>How is an ARM different from an interest-only loan?</H3>
        <Para>
          Different concepts. An ARM is about whether your rate adjusts. An interest-only loan is about whether your monthly payment includes principal. They can be combined (interest-only ARM), but most ARMs are fully amortizing, meaning your payment includes both principal and interest from day one. The principal portion grows over time exactly like a fixed loan, just on a recalculated schedule each time the rate changes.
        </Para>

        <H3>Can I convert my ARM to a fixed-rate loan without refinancing?</H3>
        <Para>
          Some ARMs include a "conversion option" allowing the borrower to convert to a fixed rate at certain points without going through a full refinance. These are increasingly rare in modern ARMs. Most ARM-to-fixed conversions happen via standard refinance.
        </Para>

        <H3>What's the difference between SOFR and CMT?</H3>
        <Para>
          SOFR (Secured Overnight Financing Rate) measures the cost of borrowing cash overnight, secured by Treasury collateral. It's the dominant index for ARMs originated since 2021. CMT (Constant Maturity Treasury) measures the yield on Treasury securities at a specific maturity (commonly 1-year). SOFR tends to be more volatile in the short term but generally tracks Federal Reserve policy closely. From a borrower's perspective the difference matters less than the margin and caps.
        </Para>

        <H2>A final note. What this page is and isn't</H2>
        <Para>
          This page is an explanation of how adjustable-rate mortgages work, organized in a way I wish more borrowers, realtors, and other LOs had access to. It is not:
        </Para>
        <Bullets items={[
          "**Financial advice for your specific situation.** The right loan depends on your income, time horizon, reserves, risk tolerance, and several other things that require an actual conversation.",
          "**A guarantee that ARMs are a good idea right now.** They are for some borrowers in 2026, and a bad idea for others.",
          "**A substitute for reading your actual loan documents.** Every ARM has specific terms, and the difference between one ARM and another can be significant.",
        ]} />
        <Para>
          If you're thinking about an ARM and want to talk through whether it makes sense for your situation, I'm reachable below. Bring your numbers, your timeline, and your honest answers to "what happens if I can't refinance in 7 years." We'll work through it.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Thinking about an ARM?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring your numbers, your timeline, and your honest answers about what happens if you can't refinance in 7 years.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Federal Reserve Bank of New York data on Secured Overnight Financing Rate (SOFR), 2026; Mortgage Bankers Association weekly mortgage applications survey, 2026 data on ARM share of originations; 12 CFR Part 1026 (Regulation Z) Adjustable-Rate Mortgage disclosure requirements; author's 12+ years of field experience originating ARM and fixed-rate mortgages.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
