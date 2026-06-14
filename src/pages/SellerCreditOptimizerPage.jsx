import { useState, useMemo } from "react";
import { P, F, PROGRAM_COLORS, globalCSS } from "../theme";
import { fmt } from "../utils/format";
import { CalcInput } from "../components/CalcInput";
import { RateInput } from "../components/RateInput";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { webApplicationSchema } from "../utils/schema";
import { computeDeployments } from "../utils/sellerCredit";

const TITLE = "Seller Credit Calculator: Price Cut vs Points vs 2-1 Buydown | The Mortgage Geek";
const DESCRIPTION = "Enter price, rate, and seller credit to see the same dollars four ways: price cut, closing costs, points, or a 2-1 buydown, with exact payment math.";
const PATH = "/tools/seller-credit-optimizer";

// Small toggle for $ / % inputs (down payment, seller credit).
function Toggle({ value, onChange, optionA, optionB }) {
  const Btn = (label, isActive) => (
    <button
      type="button"
      onClick={() => onChange(label)}
      aria-pressed={isActive}
      style={{
        flex: 1, minHeight: 44, border: "none", cursor: "pointer",
        background: isActive ? P.navy : "transparent",
        color: isActive ? P.cream : P.warmGray,
        fontFamily: F.body, fontWeight: 700, fontSize: 12,
        letterSpacing: 0.6, textTransform: "uppercase",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Input mode toggle" style={{
      display: "flex", border: `1px solid ${P.creamDark}`, borderRadius: 8,
      overflow: "hidden", background: P.cream, height: 44,
    }}>
      {Btn(optionA, value === optionA)}
      {Btn(optionB, value === optionB)}
    </div>
  );
}

// Result card shared shell.
function Card({ title, accentColor, children }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${P.creamDark}`,
      borderLeft: `3px solid ${accentColor || P.gold}`,
      borderRadius: 10, padding: "20px 22px",
    }}>
      <h3 style={{
        fontFamily: F.display, fontSize: 20, color: P.navy, fontWeight: 400,
        marginBottom: 12, lineHeight: 1.25,
      }}>{title}</h3>
      {children}
    </div>
  );
}

// Big primary number inside a card.
function BigNumber({ label, value, sub }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 4 }}>{label}</span>
      <span style={{ display: "block", fontFamily: F.display, fontSize: 30, color: P.navy, fontWeight: 400, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ display: "block", fontSize: 12, color: P.warmGray, marginTop: 4 }}>{sub}</span>}
    </div>
  );
}

// Inline labeled row inside a card.
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderTop: `1px solid ${P.creamDark}` }}>
      <span style={{ fontSize: 12, color: P.warmGray }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: P.navy }}>{value}</span>
    </div>
  );
}

function Caveat({ children }) {
  return (
    <p style={{ fontSize: 12, fontStyle: "italic", color: P.warmGrayLight, lineHeight: 1.6, marginTop: 12 }}>
      {children}
    </p>
  );
}

// Program-aware per-card cap message. Reads the engine's discriminated
// capStatus and renders the matching copy. Returns null when there is
// nothing to say (Price Cut, or "fit" without a VA caveat). Warnings
// use the gold-accent treatment that the existing edge messages
// already establish on this page.
function CapMessage({ capStatus, programLabel, fmtMoney }) {
  if (!capStatus || capStatus.kind === "none" || capStatus.kind === "fit") return null;
  const warnStyle = { fontSize: 12, color: P.gold, fontWeight: 600, marginTop: 10, lineHeight: 1.55 };
  const caveatStyle = { fontSize: 12, fontStyle: "italic", color: P.warmGrayLight, marginTop: 10, lineHeight: 1.55 };
  switch (capStatus.kind) {
    case "exceeded":
      return (
        <p role="note" style={warnStyle}>
          This credit ({fmtMoney(capStatus.credit)}) exceeds the {programLabel} cap of {fmtMoney(capStatus.capValue)}. The excess has to be restructured or moved to a price reduction.
        </p>
      );
    case "va-uncapped-closing":
      return (
        <p style={caveatStyle}>
          Customary closing costs are uncapped on VA (bucket one). The only limit here is your actual costs.
        </p>
      );
    case "va-uncapped-points":
      return (
        <p style={caveatStyle}>
          Market-rate points are uncapped on VA (bucket one). Points beyond the customary market rate count toward the 4% concession bucket. Confirm what's customary with your lender.
        </p>
      );
    case "va-2-1-fit":
      return (
        <p style={caveatStyle}>
          A temporary buydown escrow is a VA concession (bucket two), capped at 4% of value. The portion flowing to closing costs is bucket one and uncapped.
        </p>
      );
    case "va-2-1-exceeded":
      return (
        <p role="note" style={warnStyle}>
          This buydown escrow ({fmtMoney(capStatus.buydownCost)}) exceeds VA's 4% concession cap ({fmtMoney(capStatus.capValue)}). Trim the buydown or shift dollars to closing costs, which are uncapped.
        </p>
      );
    default:
      return null;
  }
}

// Cap summary block shown beneath the inputs panel. The text varies by
// active program; each variant ends with a link to the Seller
// Concessions Deep Dive for the full rules.
function CapSummary({ cap, fmtMoney }) {
  const link = <a href="/deep-dives/seller-concessions" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Seller Concessions Deep Dive</a>;
  const pct = (cap.capPct * 100).toFixed(0);
  const wrap = (body) => (
    <p style={{ fontSize: 13, color: P.warmGray, lineHeight: 1.65, marginTop: 16 }}>
      {body} Full rules: {link}.
    </p>
  );
  switch (cap.program) {
    case "fha":
      return wrap(<>FHA concession cap: 6% of price = <strong style={{ color: P.navy }}>{fmtMoney(cap.capValue)}</strong>. Every deployment except a price cut counts toward this cap. Cap is figured on the purchase price (assumes the home appraises at or above it).</>);
    case "usda":
      return wrap(<>USDA concession cap: 6% of the sales price = <strong style={{ color: P.navy }}>{fmtMoney(cap.capValue)}</strong>. Every deployment except a price cut counts toward this cap.</>);
    case "va":
      return wrap(<>VA uses two buckets. Customary closing costs are uncapped. True concessions (a temporary buydown escrow, prepaid escrows, above-market points) are capped at 4% of the appraised value = <strong style={{ color: P.navy }}>{fmtMoney(cap.capValue)}</strong>. A price cut is neither. Figured on the purchase price as a proxy for the Notice of Value.</>);
    case "conventional":
    default:
      return wrap(<>Conventional concession cap at this down payment: {pct}% of price = <strong style={{ color: P.navy }}>{fmtMoney(cap.capValue)}</strong>. Every deployment except a price cut counts toward this cap. Cap is figured on the purchase price (assumes the home appraises at or above it).</>);
  }
}

// Four-button program selector. Active button fills with the program
// color; inactive shows a tinted outline. Touch targets >=44px.
const PROGRAM_OPTIONS = [
  { key: "conventional", label: "Conventional" },
  { key: "fha",          label: "FHA"          },
  { key: "va",           label: "VA"           },
  { key: "usda",         label: "USDA"         },
];

function ProgramSelector({ value, onChange }) {
  return (
    <div role="group" aria-label="Loan program" style={{
      display: "flex", flexWrap: "wrap", gap: 8,
      background: "#fff", border: `1px solid ${P.creamDark}`,
      borderRadius: 10, padding: 8, marginBottom: 20,
    }}>
      {PROGRAM_OPTIONS.map((opt) => {
        const isActive = value === opt.key;
        const color = PROGRAM_COLORS[opt.label];
        return (
          <button
            key={opt.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.key)}
            style={{
              flex: "1 1 120px", minHeight: 44, padding: "10px 14px",
              border: `1px solid ${color}`, borderRadius: 8,
              background: isActive ? color : "transparent",
              color: isActive ? "#fff" : color,
              fontFamily: F.body, fontSize: 14, fontWeight: 700, letterSpacing: 0.4,
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >{opt.label}</button>
        );
      })}
    </div>
  );
}

export function SellerCreditOptimizerPage() {
  // -------- Inputs --------
  const [price, setPrice] = useState(400000);
  const [downMode, setDownMode] = useState("%");        // "%" | "$"
  const [downPct, setDownPct] = useState(5);
  const [downDollar, setDownDollar] = useState(20000);
  const [rate, setRate] = useState(7.00);
  const [term, setTerm] = useState(30);
  const [creditMode, setCreditMode] = useState("$");    // "$" | "%"
  const [creditDollar, setCreditDollar] = useState(10000);
  const [creditPct, setCreditPct] = useState(2.5);
  // Costs estimate: default 3% of price, becomes "user-edited" once the
  // user touches it (so subsequent price changes no longer auto-update it).
  const [costsTouched, setCostsTouched] = useState(false);
  const [costsInput, setCostsInputState] = useState(12000);
  const setCostsInput = (v) => { setCostsTouched(true); setCostsInputState(v); };
  const effectiveCosts = costsTouched ? costsInput : Math.round(price * 0.03);

  // Resolved credit dollars (clamped to 15% of price per the brief).
  const creditCap = price * 0.15;
  const creditResolved = Math.min(creditCap, creditMode === "$" ? creditDollar : (price * creditPct) / 100);

  // Active loan program. Conventional on load; switches do NOT mutate
  // any input (down payment / rate / credit all stay where the user
  // left them, per the brief).
  const [program, setProgram] = useState("conventional");

  // -------- Engine --------
  const result = useMemo(() => computeDeployments({
    price, downMode, downPct, downDollar,
    rate, term,
    credit: creditResolved,
    costsInput: effectiveCosts,
    program,
  }), [price, downMode, downPct, downDollar, rate, term, creditResolved, effectiveCosts, program]);

  // -------- Five-year bar scaling --------
  const fiveYearBars = [
    { label: "Price Cut",       value: result.priceCut.fiveYearValue,   color: P.warmGray },
    { label: "Closing Costs",   value: result.closingCosts.fiveYearValue, color: P.navyLight },
    { label: "Permanent Points", value: result.points.fiveYearValue,    color: P.gold },
    { label: "2-1 Buydown",     value: result.twoOne.fiveYearValue,    color: P.sage },
  ];
  const maxBar = Math.max(1, ...fiveYearBars.map((b) => b.value));

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={webApplicationSchema({
          title: "Seller Credit Optimizer | The Mortgage Geek",
          description: DESCRIPTION,
          url: `https://mortgagegeek.ai${PATH}`,
        })}
      />
      <style>{globalCSS}{`
        .sco-inputs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .sco-inputs > .sco-full { grid-column: 1 / -1; }
        @media (max-width: 700px) { .sco-inputs { grid-template-columns: 1fr; } }
        .sco-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 800px) { .sco-cards { grid-template-columns: 1fr; } }
        .sco-term-select { display: flex; gap: 6px; }
        .sco-term-select > button {
          flex: 1; min-height: 44px; padding: "0 12px"; border-radius: 8;
          border: 1px solid ${P.creamDark}; background: ${P.cream};
          font-family: ${F.body}; font-size: 14; font-weight: 600; color: ${P.navy};
          cursor: pointer;
        }
        .sco-term-select > button[aria-pressed="true"] { background: ${P.navy}; color: ${P.cream}; border-color: ${P.navy}; }
      `}</style>

      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>

        <header style={{ marginBottom: 24, textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 8 }}>Tool</span>
          <h1 style={{ fontFamily: F.display, fontSize: 38, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 8 }}>Seller Credit Optimizer</h1>
          <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.6, maxWidth: 640, margin: "0 auto" }}>
            The same seller credit, deployed four ways. See what each one is actually worth on your loan.
          </p>
        </header>

        <div style={{ background: "rgba(184, 134, 11, 0.06)", border: `1px solid rgba(184, 134, 11, 0.25)`, borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: P.warmGray, lineHeight: 1.5 }}>
          All figures are illustrative principal-and-interest estimates, not a quote or an offer. Buydown pricing changes daily; confirm real numbers with your lender after your rate is locked.
        </div>

        {/* ---------- Inputs panel ---------- */}
        <section aria-label="Loan and credit inputs" style={{ background: "#fff", border: `1px solid ${P.creamDark}`, borderRadius: 10, padding: "20px 22px", marginBottom: 20 }}>
          <div className="sco-inputs">
            <div className="sco-full">
              <CalcInput
                label="Purchase price"
                value={price} onChange={setPrice}
                prefix="$" comma step={1000} min={50000} max={3000000}
              />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Down payment</span>
                <div style={{ width: 110 }}><Toggle value={downMode} onChange={setDownMode} optionA="%" optionB="$" /></div>
              </div>
              {downMode === "%" ? (
                <CalcInput label="" value={downPct} onChange={setDownPct} suffix="%" step={0.5} min={3} max={80} />
              ) : (
                <CalcInput label="" value={downDollar} onChange={setDownDollar} prefix="$" comma step={1000} min={0} max={3000000} />
              )}
            </div>

            <div>
              <RateInput label="Note rate" rate={rate} setRate={setRate} color={P.navy} />
            </div>

            <div className="sco-full">
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 6 }}>Loan term</span>
              <div className="sco-term-select">
                {[15, 20, 30].map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={term === t}
                    onClick={() => setTerm(t)}
                    style={{
                      flex: 1, minHeight: 44, padding: "0 12px", borderRadius: 8,
                      border: `1px solid ${P.creamDark}`, background: term === t ? P.navy : P.cream,
                      fontFamily: F.body, fontSize: 14, fontWeight: 600,
                      color: term === t ? P.cream : P.navy,
                      cursor: "pointer",
                    }}
                  >{t}-year</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Seller credit</span>
                <div style={{ width: 130 }}><Toggle value={creditMode} onChange={setCreditMode} optionA="$" optionB="% of price" /></div>
              </div>
              {creditMode === "$" ? (
                <CalcInput label="" value={creditDollar} onChange={setCreditDollar} prefix="$" comma step={500} min={0} max={creditCap} />
              ) : (
                <CalcInput label="" value={creditPct} onChange={setCreditPct} suffix="%" step={0.25} min={0} max={15} />
              )}
            </div>

            <div>
              <CalcInput
                label="Closing costs + prepaids (est.)"
                value={effectiveCosts} onChange={setCostsInput}
                prefix="$" comma step={500} min={0} max={3000000}
              />
            </div>
          </div>

          {/* Program-aware cap summary (replaces the old conventional-only caveat) */}
          <CapSummary cap={result.cap} fmtMoney={fmt} />
        </section>

        {/* ---------- Program selector ---------- */}
        <ProgramSelector value={program} onChange={setProgram} />

        {/* ---------- Cap warning banner (single-cap programs only; VA never fires) ---------- */}
        {result.cap.headlineExceeded && (
          <div role="alert" style={{
            background: "rgba(184, 134, 11, 0.10)", border: `1px solid ${P.gold}`,
            borderLeft: `4px solid ${P.gold}`, borderRadius: 8,
            padding: "14px 18px", marginBottom: 20, fontSize: 14, color: P.navy, lineHeight: 1.6,
          }}>
            <strong style={{ color: P.navyDark }}>Concession cap exceeded.</strong> This credit exceeds the {result.cap.label} concession cap ({fmt(result.cap.capValue)} at {(result.cap.capPct * 100).toFixed(0)}%). Anything over the cap has to be restructured. See the <a href="/deep-dives/seller-concessions" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Seller Concessions Deep Dive</a>.
          </div>
        )}

        {/* ---------- Baseline summary ---------- */}
        <div style={{
          background: P.navyDark, color: P.cream, borderRadius: 10,
          padding: "18px 22px", marginBottom: 20,
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16,
        }}>
          <div>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldLight, marginBottom: 4 }}>Loan amount</span>
            <span style={{ fontFamily: F.display, fontSize: 22, color: P.cream }}>{fmt(result.baseline.loan)}</span>
          </div>
          <div>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldLight, marginBottom: 4 }}>Base P&amp;I (no credit)</span>
            <span style={{ fontFamily: F.display, fontSize: 22, color: P.cream }}>{fmt(result.baseline.basePayment)}<span style={{ fontSize: 12, marginLeft: 4 }}>/mo</span></span>
          </div>
          <div>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldLight, marginBottom: 4 }}>LTV</span>
            <span style={{ fontFamily: F.display, fontSize: 22, color: P.cream }}>{(result.baseline.ltv * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldLight, marginBottom: 4 }}>Credit on table</span>
            <span style={{ fontFamily: F.display, fontSize: 22, color: P.cream }}>{fmt(creditResolved)}</span>
          </div>
        </div>

        {/* ---------- Four result cards ---------- */}
        <section aria-label="Deployment options" className="sco-cards" style={{ marginBottom: 28 }}>

          {/* PRICE CUT */}
          <Card title="Price Cut" accentColor={P.warmGray}>
            <BigNumber
              label="New P&I"
              value={`${fmt(result.priceCut.payment)}/mo`}
              sub={`Saves ${fmt(result.priceCut.monthlyDelta)}/mo vs. baseline`}
            />
            <Row label="New purchase price" value={fmt(result.priceCut.newPrice)} />
            <Row label="New loan amount" value={fmt(result.priceCut.newLoan)} />
            <Row label="Down payment change" value={result.priceCut.downPaymentDelta > 0 ? `−${fmt(result.priceCut.downPaymentDelta)}` : "no change"} />
            <Row label="Five-year value" value={fmt(result.priceCut.fiveYearValue)} />
            <CapMessage capStatus={result.priceCut.capStatus} programLabel={result.cap.label} fmtMoney={fmt} />
            <Caveat>Consumes none of your concession cap. Most of its value is stored as a smaller balance, not delivered as monthly relief.</Caveat>
          </Card>

          {/* CLOSING COSTS */}
          <Card title="Closing Costs" accentColor={P.navyLight}>
            <BigNumber
              label="Payment"
              value={`${fmt(result.baseline.basePayment)}/mo`}
              sub="No change to monthly payment"
            />
            <Row label="Credit applied" value={fmt(result.closingCosts.applied)} />
            <Row label="Cash to close drops by" value={fmt(result.closingCosts.applied)} />
            <Row label="Five-year value" value={fmt(result.closingCosts.fiveYearValue)} />
            {result.closingCosts.excess > 0 && (
              <p role="note" style={{ fontSize: 12, color: P.gold, fontWeight: 600, marginTop: 10, lineHeight: 1.55 }}>
                Credits can't exceed your actual costs and prepaids. {fmt(result.closingCosts.excess)} of this credit has nowhere to go in this slot; see the price cut or buydown options.
              </p>
            )}
            <CapMessage capStatus={result.closingCosts.capStatus} programLabel={result.cap.label} fmtMoney={fmt} />
            <Caveat>Credits can't exceed your actual closing costs and prepaids.</Caveat>
          </Card>

          {/* PERMANENT POINTS */}
          <Card title="Permanent Points" accentColor={P.gold}>
            <BigNumber
              label="New P&I"
              value={`${fmt(result.points.payment)}/mo`}
              sub={result.points.edgeCase ? "No payment change at this credit size" : `Saves ${fmt(result.points.monthlyDelta)}/mo vs. baseline`}
            />
            <Row label="Bought rate" value={`${result.points.boughtRate.toFixed(3)}%`} />
            <Row label="Points purchased" value={result.points.pointsBought.toFixed(2)} />
            <Row label="Credit consumed by points" value={fmt(result.points.pointsConsumed)} />
            {result.points.leftover > 0 && (
              <Row label="Leftover to closing costs" value={fmt(result.points.leftover)} />
            )}
            <Row label="Five-year value" value={fmt(result.points.fiveYearValue)} />
            {result.points.edgeCase && (
              <p role="note" style={{ fontSize: 12, color: P.gold, fontWeight: 600, marginTop: 10, lineHeight: 1.55 }}>
                This credit is too small to move the rate a full eighth under our conservative model. Closing costs are likely the better slot. Your lender may be able to apply it as a pricing credit; ask after lock.
              </p>
            )}
            <CapMessage capStatus={result.points.capStatus} programLabel={result.cap.label} fmtMoney={fmt} />
            <Caveat>Planning assumption: 0.25% per point, rounded conservatively to the eighth. Real pricing varies daily with diminishing returns. Confirm with your lender after lock.</Caveat>
          </Card>

          {/* 2-1 BUYDOWN */}
          <Card title="2-1 Buydown" accentColor={P.sage}>
            <BigNumber
              label="Year 1 payment"
              value={`${fmt(result.twoOne.year1Payment)}/mo`}
              sub={`Saves ${fmt(result.twoOne.year1Subsidy)}/mo at ${(result.twoOne.year1Rate).toFixed(3)}%`}
            />
            <Row label={`Year 2 (at ${(result.twoOne.year2Rate).toFixed(3)}%)`} value={`${fmt(result.twoOne.year2Payment)}/mo`} />
            <Row label="Year 3 onward (note rate)" value={`${fmt(result.baseline.basePayment)}/mo`} />
            <Row label="Buydown cost" value={fmt(result.twoOne.cost)} />
            {result.twoOne.leftover > 0 && (
              <Row label="Leftover to closing costs" value={fmt(result.twoOne.leftover)} />
            )}
            {result.twoOne.shortfall > 0 && (
              <p role="note" style={{ fontSize: 12, color: P.gold, fontWeight: 600, marginTop: 10, lineHeight: 1.55 }}>
                Shortfall: {fmt(result.twoOne.shortfall)}. This credit doesn't fully fund the 2-1 on this loan; you or the seller would need to cover the difference.
              </p>
            )}
            <Row label="Five-year value" value={fmt(result.twoOne.fiveYearValue)} />
            <CapMessage capStatus={result.twoOne.capStatus} programLabel={result.cap.label} fmtMoney={fmt} />
            <Caveat>You qualify at the full note rate, not the bought-down payment. Unused escrow is credited if you refinance or sell during the buydown.</Caveat>
          </Card>
        </section>

        {/* ---------- Five-year bar comparison ---------- */}
        <section aria-label="Five-year value comparison" style={{ background: "#fff", border: `1px solid ${P.creamDark}`, borderRadius: 10, padding: "20px 22px", marginBottom: 28 }}>
          <h2 style={{ fontFamily: F.display, fontSize: 24, color: P.navy, fontWeight: 400, marginBottom: 6 }}>Five-year value, side by side</h2>
          <p style={{ fontSize: 13, color: P.warmGray, marginBottom: 16, lineHeight: 1.6 }}>
            What the credit hands back in the first sixty months. Price cut and points are monthly relief times sixty. Closing costs land on day one. The 2-1 delivers its full value in the first twenty-four months.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {fiveYearBars.map((b) => {
              const widthPct = maxBar > 0 ? Math.max(2, (b.value / maxBar) * 100) : 2;
              return (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: P.navy }}>{b.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{fmt(b.value)}</span>
                  </div>
                  <div style={{ background: P.cream, borderRadius: 4, height: 14, overflow: "hidden" }}>
                    <div style={{ background: b.color, width: `${widthPct}%`, height: "100%" }} aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- Closing cream CTA ---------- */}
        <div style={{ padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 16, color: P.navy, lineHeight: 1.7, marginBottom: 14, fontFamily: F.body }}>
            Want the full explanation of when each option wins? Read the <a href="/deep-dives/rate-buydowns" style={{ color: P.navy, fontWeight: 700, textDecoration: "underline" }}>Rate Buydowns Deep Dive</a>. And if you've got a live deal and an incentive on the table, bring me the scenario.
          </p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:nick@mortgagegeek.ai" aria-label="Email Nick Peters at nick@mortgagegeek.ai" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>nick@mortgagegeek.ai</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring the price, the contract incentive, your target program, and an honest read on your timeline. Ten minutes is usually enough.
          </p>
        </div>

      </div>

      <MobileToolbar />
    </main>
  );
}
