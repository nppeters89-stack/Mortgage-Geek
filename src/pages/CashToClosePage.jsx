import { useState, useEffect, useMemo, useId } from "react";
import { P, F, PROGRAM_COLORS, globalCSS } from "../theme";
import { CASH_STATE_DEFAULT_TAX_RATES, CASH_STATE_METROS, ALL_STATES_LIST } from "../data/taxRates";
import { fmt, withAlpha } from "../utils/format";
import { calculateAPR } from "../utils/math";
import { CashToCloseIcon } from "../components/icons";
import { MobileToolbar } from "../components/MobileToolbar";
import { CalcInput } from "../components/CalcInput";
import { RateInput } from "../components/RateInput";
import { SEOHead } from "../components/SEOHead";
import { webApplicationSchema } from "../utils/schema";

export function CashToClosePage() {
  // Tax reserves prepaid schedule by state — # of months collected based on closing month
  // From CL Guide National Taxes Matrix v32, defaulting to "all remaining" schedule
  // For 2/13 splits, use 13 (more conservative)

  const TAX_RESERVE_SCHEDULE = {
    TN: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    GA: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    MS: { 1:3, 2:4, 3:5, 4:6, 5:7, 6:8, 7:9, 8:10, 9:11, 10:12, 11:12, 12:2 },
    AR: { 1:12, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9, 11:10, 12:11 },
    KY: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    // ⚠ Auto-extracted, pending hand-verification
    AL: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    AZ: { 1:6, 2:2, 3:2, 4:5, 5:5, 6:5, 7:6, 8:7, 9:2, 10:3, 11:4, 12:5 },
    CA: { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:5, 11:5, 12:6 },
    CO: { 1:4, 2:5, 3:6, 4:2, 5:2, 6:3, 7:4, 8:5, 9:6, 10:2, 11:2, 12:3 },
    DE: { 1:7, 2:8, 3:9, 4:10, 5:11, 6:12, 7:13, 8:2, 9:3, 10:4, 11:5, 12:6 },
    FL: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:13, 11:3, 12:4 },
    HI: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:2, 8:3, 9:4, 10:5, 11:6, 12:1 },
    IA: { 1:7, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
    IL: { 1:7, 2:8, 3:9, 4:10, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
    IN: { 1:5, 2:6, 3:7, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:2, 11:3, 12:4 },
    KS: { 1:5, 2:6, 3:7, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:3, 12:4 },
    LA: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    MD: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:3 },
    MN: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:2, 10:3, 11:4, 12:5 },
    MO: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    NC: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    NE: { 1:3, 2:4, 3:5, 4:6, 5:7, 6:2, 7:3, 8:4, 9:5, 10:6, 11:7, 12:8 },
    NJ: { 1:2, 2:3, 3:4, 4:2, 5:3, 6:4, 7:2, 8:3, 9:4, 10:2, 11:3, 12:4 },
    NM: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9, 11:4, 12:5 },
    NV: { 1:2, 2:1, 3:2, 4:3, 5:4, 6:3, 7:3, 8:2, 9:2, 10:2, 11:2, 12:2 },
    OH: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:2, 7:3, 8:4, 9:5, 10:6, 11:7, 12:8 },
    OK: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:13, 12:13 },
    OR: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
    PA: { 1:11, 2:12, 3:13, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:9, 12:10 },
    SC: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    TX: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:13, 12:13 },
    UT: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
    VA: { 1:3, 2:4, 3:5, 4:6, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:2 },
    WA: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:2, 9:2, 10:3, 11:4, 12:5 },
    WI: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    WV: { 1:7, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
  };

  // Reasonable national fallback schedule for any state without verified data
  const FALLBACK_SCHEDULE = { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 };

  // States where the reserve schedule is an approximation (not from the CL Guide matrix).
  // These states are not covered by Davidson Homes Mortgage's title company reference,
  // so we apply the fallback pattern and disclose it to the user. If an authoritative
  // schedule becomes available, add the state to TAX_RESERVE_SCHEDULE and remove from here.
  const UNVERIFIED_RESERVES_STATES = new Set(["MA", "CT", "RI", "NH", "VT", "ME", "DC", "NY", "MI", "ND", "SD", "ID", "MT", "WY", "AK"]);

  // Metro-level reserve schedule overrides for sub-jurisdictions that run on different
  // tax collection calendars than the state default. When a metro is listed here, its
  // schedule is used instead of the state default. Verified from CL Guide Matrix v32.
  // Only populated for metros where data is confirmed. Southeast region verified.
  const METRO_RESERVE_OVERRIDES = {
    // TN: "Roane County and Kingsport, Jefferson, and Kingston Cities" use a different schedule (taxes due December)
    // The default "All remaining cities/counties" schedule applies everywhere else.
    // None of our current TN metros fall in the Roane/Kingsport subset, so no override needed yet.

    // GA: 4 distinct schedules across sub-jurisdictions
    GA: {
      // DeKalb and Newton Counties (taxes due Sep & Nov)
      "DeKalb County": { 1:11, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:6, 9:7, 10:8, 11:9, 12:10 },
      // Cobb, Fulton, Gwinnett, and Muscogee Counties (taxes due October)
      "Atlanta/Fulton":   { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      "Cobb County":      { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      "Gwinnett County":  { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      // Cherokee, Forsyth fall into "Barrow, Bryan, Cherokee, Clayton..." (taxes due Nov)
      "Cherokee County":  { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
      "Forsyth County":   { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
      // "All other counties" uses the "Coweta, Dougherty, Houston..." schedule (due Dec)
      "All other counties": { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    },

    // NC: 3 distinct schedules
    NC: {
      // Guilford County and Greensboro City (due August)
      "Guilford/Greensboro": { 1:8, 2:9, 3:10, 4:11, 5:12, 6:13, 7:2, 8:3, 9:4, 10:5, 11:6, 12:7 },
      // "All remaining counties/cities" default (due December) — what our current NC metros use
      // No override needed for Mecklenburg, Wake, Durham, Buncombe — they use the state default
    },

    // IL: Cook County has a different tax calendar (taxes due March/Sep) vs rest of state (June/Sep)
    IL: {
      "Cook/Chicago": { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:2, 10:3, 11:4, 12:5 },
      // DuPage, Lake, Will, Kane, McHenry use the "all remaining" state default
    },

    // OH: 6+ sub-jurisdictions based on county tax due dates. Biggest metros get overrides.
    OH: {
      // Cuyahoga County/Cleveland (taxes due Dec/June)
      "Cuyahoga/Cleveland": { 1:4, 2:5, 3:6, 4:7, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:2, 12:3 },
      // Franklin County/Columbus (taxes due Jan/June)
      "Franklin/Columbus": { 1:3, 2:4, 3:5, 4:6, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:2 },
      // Hamilton County/Cincinnati (taxes due March/Aug, in Butler/Mahoning group)
      "Hamilton/Cincinnati": { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:2, 8:2, 9:3, 10:4, 11:5, 12:6 },
      // Summit/Akron, Montgomery/Dayton, Lucas/Toledo are in the largest group (Feb/July) = state default
    },
  };

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const paramProgram = params.get("program");
  const paramRate = parseFloat(params.get("rate"));
  const [program, setProgram] = useState(["Conventional", "FHA", "VA", "USDA"].includes(paramProgram) ? paramProgram : "Conventional");
  const [homePrice, setHomePrice] = useState(() => { const v = parseFloat(params.get("price")); return v > 0 ? v : 350000; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 5; });
  const [convRate, setConvRate] = useState(paramProgram === "Conventional" && paramRate > 0 ? paramRate : 6.75);
  const [fhaRate, setFhaRate] = useState(paramProgram === "FHA" && paramRate > 0 ? paramRate : 6.25);
  const [vaRate, setVaRate] = useState(paramProgram === "VA" && paramRate > 0 ? paramRate : 6.25);
  const [usdaRate, setUsdaRate] = useState(paramProgram === "USDA" && paramRate > 0 ? paramRate : 6.25);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [closeDate, setCloseDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const closeDateId = useId();
  const termSelectId = useId();
  const stateSelectId = useId();
  const metroSelectId = useId();
  const vaUsageSelectId = useId();
  const waiveEscrowsSelectId = useId();
  const paramState = params.get("state");
  const paramMetro = params.get("metro");
  const [stateCode, setStateCode] = useState(paramState || "TN");
  const [taxMetro, setTaxMetro] = useState(paramMetro || "All other counties");
  const [totalCredits, setTotalCredits] = useState(0);
  const [waiveEscrows, setWaiveEscrows] = useState(false);
  const paramVaUsage = params.get("vaUsage");
  const [vaUsage, setVaUsage] = useState(["first", "subsequent", "exempt"].includes(paramVaUsage) ? paramVaUsage : "first");
  // Editable lender fees — same defaults across all loan programs
  const [feeUnderwriting, setFeeUnderwriting] = useState(995);
  const [feeProcessing, setFeeProcessing] = useState(910);
  const [feeAppraisal, setFeeAppraisal] = useState(800);
  const [feeVerification, setFeeVerification] = useState(1000);
  const [feeCreditReport, setFeeCreditReport] = useState(300);
  const [feeFloodCert, setFeeFloodCert] = useState(15);
  const [feeTaxService, setFeeTaxService] = useState(80);
  // Discount points — synced dollar/pct fields
  const [discountPointsPct, setDiscountPointsPct] = useState(0);
  const [discountPointsDollar, setDiscountPointsDollar] = useState(0);
  const [showPointsInfo, setShowPointsInfo] = useState(false);

  // Active rate switches with selected program
  const rate =
    program === "Conventional" ? convRate :
    program === "FHA"          ? fhaRate  :
    program === "USDA"         ? usdaRate :
                                 vaRate;
  const setRate = (v) => {
    if      (program === "Conventional") setConvRate(v);
    else if (program === "FHA")          setFhaRate(v);
    else if (program === "USDA")         setUsdaRate(v);
    else                                 setVaRate(v);
  };

  // Round to nearest 0.125%, then add a 0.25% buffer so the starting
  // auto-populated rate runs conservative (above true market). Users
  // can drag the slider down to match their actual quote.
  const roundRate = (r) => Math.round(r / 0.125) * 0.125 + 0.25;

  // Fetch live MND rates on mount. Sets rateLoading=true during fetch,
  // rateLoading=false + ratesLoaded=true + rateSource=date when complete.
  useEffect(() => {
    (async () => {
      setRateLoading(true);
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv30 = find("30-year fixed");
          const fha = find("fha");
          const va = find("va");
          if (conv30 && !(paramProgram === "Conventional" && paramRate > 0)) setConvRate(roundRate(parseFloat(conv30.rate)));
          if (fha) {
            const fhaParsed = roundRate(parseFloat(fha.rate));
            if (!(paramProgram === "FHA" && paramRate > 0)) setFhaRate(fhaParsed);
            // USDA tracks FHA from MND (MND doesn't publish a separate USDA rate)
            if (!(paramProgram === "USDA" && paramRate > 0)) setUsdaRate(fhaParsed);
          }
          if (va && !(paramProgram === "VA" && paramRate > 0)) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today");
          setRatesLoaded(true);
        }
      } catch (e) { /* fail silently, use defaults */ }
      setRateLoading(false);
    })();
  }, []);

  // Eligibility check: per-program guardrails. Each rule populates ineligibleReason
  // with the {title, body} the result panel renders when the user trips it.
  const minDown =
    program === "Conventional" ? 3   :
    program === "FHA"          ? 3.5 :
                                 0;     // VA and USDA both 0
  const downEligible = downPct >= minDown;
  const termEligible = program !== "USDA" || term === 30;
  const isEligible = downEligible && termEligible;

  const ineligibleReason = !downEligible
    ? {
        title: `Minimum ${minDown}% Down Required`,
        body: `${program} loans require a minimum down payment of ${minDown}% (${fmt(homePrice * (minDown / 100))} on a ${fmt(homePrice)} home). Increase your down payment or pick a different loan program above to see your cash to close estimate.`,
      }
    : !termEligible
    ? {
        title: "USDA 30-Year Only",
        body: "USDA loans are only available as 30-year fixed-rate mortgages. Switch the loan term to 30 years or pick a different loan program above to see your cash to close estimate.",
      }
    : null;

  // Auto-HOI from price × 0.35% (matches calculator)
  const insuranceAnnual = Math.round(homePrice * 0.0035);

  // Auto-update tax rate when state/metro changes
  const hasMetros = !!CASH_STATE_METROS[stateCode];
  const taxRate = hasMetros
    ? (CASH_STATE_METROS[stateCode]?.metros?.[taxMetro] ?? CASH_STATE_DEFAULT_TAX_RATES[stateCode] ?? 0.008)
    : (CASH_STATE_DEFAULT_TAX_RATES[stateCode] ?? 0.008);
  const taxAnnual = Math.round(homePrice * taxRate);

  // Reset metro to default when state changes
  useEffect(() => { setTaxMetro("All other counties"); }, [stateCode]);

  const downAmt = homePrice * (downPct / 100);
  const baseLoan = Math.max(homePrice - downAmt, 0);

  const handlePointsPctChange = (v) => { setDiscountPointsPct(v); setDiscountPointsDollar(Math.round(baseLoan * (v / 100))); };
  const handlePointsDollarChange = (v) => { setDiscountPointsDollar(v); setDiscountPointsPct(baseLoan > 0 ? Math.round((v / baseLoan) * 100000) / 1000 : 0); };

  // Upfront fees (financed)
  let upfrontFee = 0, upfrontLabel = "";
  if (program === "FHA") { upfrontFee = baseLoan * 0.0175; upfrontLabel = "UFMIP (1.75%)"; }
  if (program === "VA") {
    if (vaUsage === "exempt") { upfrontFee = 0; }
    else {
      const feeRate = vaUsage === "first" ? (downPct < 5 ? 2.15 : downPct < 10 ? 1.5 : 1.25) : (downPct < 5 ? 3.3 : downPct < 10 ? 1.5 : 1.25);
      upfrontFee = baseLoan * (feeRate / 100);
      upfrontLabel = `VA Funding Fee (${feeRate}%)`;
    }
  }
  if (program === "USDA") { upfrontFee = baseLoan * 0.01; upfrontLabel = "USDA Guarantee Fee (1.00%)"; }
  const totalLoan = baseLoan + upfrontFee;

  // Lender fees (editable)
  const underwriting = feeUnderwriting, processing = feeProcessing;
  const appraisal = feeAppraisal, verification = feeVerification;
  const creditReport = feeCreditReport, floodCert = feeFloodCert, taxService = feeTaxService;
  const lenderTotal = underwriting + processing + appraisal + verification + creditReport + floodCert + taxService + discountPointsDollar;

  // Title & Escrow — rates approximated from First American filed schedules for our 5 states
  // Lender's title: tiered rate, declines as loan amount grows (industry standard)
  // Roughly: $5/$1k on first $100k, $4/$1k on next $400k, $3/$1k above $500k
  const calcLendersTitle = (loan) => {
    if (loan <= 0) return 0;
    let total = 0;
    const tier1 = Math.min(loan, 100000);
    total += tier1 * 0.005;
    if (loan > 100000) {
      const tier2 = Math.min(loan - 100000, 400000);
      total += tier2 * 0.004;
    }
    if (loan > 500000) {
      const tier3 = loan - 500000;
      total += tier3 * 0.003;
    }
    return Math.max(250, total);
  };
  // Owner's title: similar tiered structure, slightly higher (covers full equity not just loan)
  const calcOwnersTitle = (price) => {
    if (price <= 0) return 0;
    let total = 0;
    const tier1 = Math.min(price, 100000);
    total += tier1 * 0.0058;
    if (price > 100000) {
      const tier2 = Math.min(price - 100000, 400000);
      total += tier2 * 0.0048;
    }
    if (price > 500000) {
      const tier3 = price - 500000;
      total += tier3 * 0.0038;
    }
    return Math.max(300, total);
  };
  const lendersTitle = calcLendersTitle(baseLoan);
  const ownersTitle = calcOwnersTitle(homePrice);
  const settlementFee = 500;
  const titleSearch = 200;
  const recordingFee = 125;
  const wireNotary = 75;
  const titleTotal = lendersTitle + ownersTitle + settlementFee + titleSearch + recordingFee + wireNotary;

  // Transfer taxes by state — buyer's portion only
  // TN: $0.37/$100 of value, paid by buyer (Tennessee Realty Transfer Tax)
  // GA: $1.00/$1000, paid by SELLER (no buyer impact for purchase)
  // MS: No state transfer tax
  // AR: $3.30/$1000, typically split or paid by buyer
  // KY: $0.50/$500 ($1.00/$1000), paid by SELLER
  let transferTax = 0, transferTaxNote = "";
  if (stateCode === "TN") { transferTax = homePrice * 0.0037; transferTaxNote = "TN Realty Transfer Tax: $0.37 per $100 of value"; }
  else if (stateCode === "GA") { transferTax = homePrice * 0.001; transferTaxNote = "GA Real Estate Transfer Tax: $1.00 per $1,000 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract)"; }
  else if (stateCode === "MS") { transferTax = 0; transferTaxNote = "Mississippi has no state transfer tax"; }
  else if (stateCode === "AR") { transferTax = homePrice * 0.0033; transferTaxNote = "AR Real Estate Transfer Tax: $3.30 per $1,000 of value"; }
  else if (stateCode === "KY") { transferTax = homePrice * 0.001; transferTaxNote = "KY Real Estate Transfer Tax: $0.50 per $500 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract)"; }
  else if (stateCode === "AL") { transferTax = baseLoan * 0.0015; transferTaxNote = "AL Mortgage Recording Tax: $0.15 per $100 of loan amount (buyer pays). Deed transfer tax of $0.50 per $500 is customarily paid by seller."; }
  else if (stateCode === "FL") { transferTax = baseLoan * 0.002; transferTaxNote = "FL Intangible Tax on Mortgage: $2.00 per $1,000 of loan (buyer pays). Documentary stamps on deed ($0.70 per $100 of price) are customarily paid by seller — Miami-Dade rate differs."; }
  else if (stateCode === "NC") { transferTax = homePrice * 0.002; transferTaxNote = "NC Excise Tax: $1.00 per $500 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract). 7 NC counties add a local 1% land transfer tax."; }
  else if (stateCode === "SC") { transferTax = homePrice * 0.0037; transferTaxNote = "SC Deed Recording Fee: $1.85 per $500 of value ($1.30 state + $0.55 county). Customarily paid by seller, but shown here as buyer cost — confirm with your contract."; }
  else if (stateCode === "VA") { transferTax = (homePrice * 0.0025) + (baseLoan * 0.0025); transferTaxNote = "VA State Recordation Tax: $0.25 per $100 of price (buyer/grantee pays) + $0.25 per $100 of loan amount (buyer pays mortgage tax). Grantor tax of $0.50 per $500 is paid by seller."; }
  else if (stateCode === "WV") { transferTax = homePrice * 0.0022; transferTaxNote = "WV Excise Tax: $1.10 per $500 of value (customarily paid by seller per WV Code §11-22-2, but shown here as buyer cost — confirm with your contract)."; }
  else if (stateCode === "MD") { transferTax = homePrice * 0.0075; transferTaxNote = "MD Transfer + Recordation Taxes: ~1.5% total (state 0.5% + county 0.5-1.5% + recordation 0.5-1.4%). Customarily split 50/50 between buyer and seller — ~0.75% shown as buyer's share. Baltimore City highest (~3% total). First-time MD homebuyers: state portion paid by seller."; }
  else if (stateCode === "DE") { transferTax = homePrice * 0.02; transferTaxNote = "DE Realty Transfer Tax: 4% total (2% state + up to 2% county/city), customarily split 50/50 — 2% shown as buyer's share. First-time DE buyers may qualify for a credit reducing rate by 0.5% (up to $2,000 on first $400k)."; }
  else if (stateCode === "NJ") { transferTax = homePrice >= 1000000 ? homePrice * 0.01 : 0; transferTaxNote = homePrice >= 1000000 ? "NJ Mansion Tax: 1% on properties $1M+ (buyer pays). Realty Transfer Fee (~0.4-0.6%) is paid by seller." : "NJ Realty Transfer Fee is paid by seller on the full sale. Buyer only pays the 1% 'Mansion Tax' on properties $1M or more — this purchase is below that threshold."; }
  else if (stateCode === "PA") { transferTax = homePrice * 0.01; transferTaxNote = "PA Realty Transfer Tax: 2% total (1% state + 1% local), customarily split 50/50 — 1% shown as buyer's share. Pittsburgh (5% total) and Philadelphia (4.578% total, effective July 2025) are much higher. Philadelphia adds a $256.75 deed recording fee."; }
  else if (stateCode === "DC") { transferTax = homePrice * 0.0145; transferTaxNote = "DC Recordation Tax (buyer pays): 1.45% on prices $400k+, 1.10% below. Seller separately pays a 1.45% (or 1.10%) transfer tax. First-time DC buyers may qualify for a reduced 0.725% recordation tax (income limits apply, max price $777k as of 10/1/25)."; }
  else if (stateCode === "NY") { transferTax = baseLoan * 0.018; transferTaxNote = "NY Mortgage Recording Tax (buyer pays): ~1.8% on loan amount. NYC rate is ~1.925%. State transfer tax of 0.4% is paid by seller; NYC adds RPTT 1-2.625% also typically seller-paid. Mansion tax (buyer) 1-3.9% on homes $1M+."; }
  else if (stateCode === "MA") { transferTax = 0; transferTaxNote = "MA Excise Tax: $2.28 per $500 of value (~0.456%), paid entirely by seller. Buyer owes no state transfer tax in Massachusetts."; }
  else if (stateCode === "CT") { transferTax = 0; transferTaxNote = "CT Conveyance Tax: 0.75% (under $800k) / 1.25% ($800k–$2.5M) / 2.25% (over $2.5M) + 0.25–0.5% municipal. Paid entirely by seller. Buyer owes no state conveyance tax in Connecticut."; }
  else if (stateCode === "RI") { transferTax = 0; transferTaxNote = "RI Real Estate Conveyance Tax: $2.30 per $500 of value (~0.46%), $4.60/$500 over $800k. Paid entirely by seller. Buyer owes no state conveyance tax in Rhode Island."; }
  else if (stateCode === "NH") { transferTax = homePrice * 0.0075; transferTaxNote = "NH Real Estate Transfer Tax: $0.75 per $100 of value (0.75% on buyer). NH is unique — both buyer and seller each pay the full 0.75% separately, effectively a 1.5% total tax on the transaction."; }
  else if (stateCode === "VT") {
    // Primary residence assumed: 0.5% on first $100k + 1.45% above
    const first100k = Math.min(homePrice, 100000);
    const above100k = Math.max(homePrice - 100000, 0);
    transferTax = (first100k * 0.005) + (above100k * 0.0145);
    transferTaxNote = "VT Property Transfer Tax (buyer pays): 0.5% on first $100k + 1.45% on remainder (primary residence). Non-primary residences: flat 1.45%. VT also charges a 0.2% Clean Water Surcharge on most transfers.";
  }
  else if (stateCode === "ME") {
    // 0.44% split 50/50 = 0.22% buyer. Luxury tier over $1M effective 11/1/25
    const standard = Math.min(homePrice, 1000000) * 0.0022;
    const luxury = Math.max(homePrice - 1000000, 0) * 0.006; // $6/$500 over $1M, split 50/50 = 0.6%
    transferTax = standard + luxury;
    transferTaxNote = "ME Real Estate Transfer Tax: $2.20 per $500 of value (~0.44%), split 50/50 between buyer and seller — 0.22% shown as buyer's share. Effective Nov 1, 2025: $6.00/$500 (~1.2%) applies to the portion above $1M (0.6% buyer's share).";
  }
  else if (stateCode === "CO") { transferTax = homePrice * 0.0001; transferTaxNote = "CO Documentary Fee: $0.01 per $100 of value (0.01%). Colorado has no state transfer tax (blocked by TABOR in 1992). Some resort municipalities (Aspen, Vail, Breckenridge, Crested Butte, Telluride) charge additional local transfer taxes of up to 2% — confirm with your agent if purchasing in those areas."; }
  else if (stateCode === "UT") { transferTax = 0; transferTaxNote = "Utah has no state or local real estate transfer tax."; }
  else if (stateCode === "NM") { transferTax = 0; transferTaxNote = "New Mexico has no state real estate transfer tax."; }
  else if (stateCode === "AZ") { transferTax = 2; transferTaxNote = "AZ Transfer Fee: flat $2 per transaction (essentially zero). Arizona has no percentage-based state transfer tax."; }
  else if (stateCode === "NV") {
    // Clark County (Vegas) higher rate ~0.51%, other counties ~0.39%. Seller pays.
    const isClark = taxMetro === "Clark/Las Vegas";
    transferTax = isClark ? homePrice * 0.0051 : homePrice * 0.0039;
    transferTaxNote = `NV Real Property Transfer Tax: ~${isClark ? "0.51%" : "0.39%"} in ${isClark ? "Clark County (Vegas/Henderson)" : "counties outside Clark"}. Customarily paid by seller, but shown here as buyer cost — confirm with your contract.`;
  }
  else if (stateCode === "ID") { transferTax = 0; transferTaxNote = "Idaho has no state real estate transfer tax."; }
  else if (stateCode === "MT") { transferTax = 0; transferTaxNote = "Montana has no state real estate transfer tax."; }
  else if (stateCode === "WY") { transferTax = 0; transferTaxNote = "Wyoming has no state real estate transfer tax."; }
  else if (stateCode === "IL") {
    // Chicago: buyer pays the 1.05% CTA portion of the city tax. Elsewhere: seller pays everything.
    const isChicago = taxMetro === "Cook/Chicago";
    transferTax = isChicago ? homePrice * 0.0105 : 0;
    transferTaxNote = isChicago
      ? "Chicago Real Property Transfer Tax: buyer pays the $3.75 per $500 CTA portion (1.05% of price). Seller pays the $3.00 per $500 city portion + state $0.50/$500 + Cook County $0.25/$500. Total Chicago transfer tax is ~1.50%."
      : "IL Real Estate Transfer Tax: $0.50 per $500 state (~0.10%) + $0.25 per $500 county. Customarily paid entirely by seller outside of Chicago. Some municipalities add their own tax.";
  }
  else if (stateCode === "IN") { transferTax = 0; transferTaxNote = "Indiana has no state real estate transfer tax."; }
  else if (stateCode === "OH") { transferTax = 0; transferTaxNote = "OH Conveyance Fee: $1.00 per $1,000 state + up to $3.00 per $1,000 county (~0.10-0.40% total). Customarily paid entirely by seller."; }
  else if (stateCode === "MI") { transferTax = 0; transferTaxNote = "MI Real Estate Transfer Tax: $3.75 per $500 state + $0.55 per $500 county (~0.86% total). Customarily paid entirely by seller per MCL 207.523."; }
  else if (stateCode === "WI") { transferTax = 0; transferTaxNote = "WI Real Estate Transfer Fee: $0.30 per $100 of value (~0.30%). Paid entirely by seller per Wisconsin statute — buyer owes no transfer fee."; }
  else if (stateCode === "MN") { transferTax = baseLoan * 0.0023; transferTaxNote = "MN Mortgage Registry Tax (buyer pays): 0.23% of loan amount. Separately, sellers pay a Deed Tax of 0.33% on the sale price. Hennepin and Ramsey counties add a 0.01% Environmental Response Fund Tax."; }
  else if (stateCode === "TX") { transferTax = 0; transferTaxNote = "Texas has no state real estate transfer tax. Buyers owe only standard recording fees (typically $30-50)."; }
  else if (stateCode === "LA") {
    // New Orleans: $325 flat documentary tax
    const isNOLA = taxMetro === "Orleans/New Orleans";
    transferTax = isNOLA ? 325 : 0;
    transferTaxNote = isNOLA
      ? "New Orleans Documentary Transaction Tax: flat $325 fee on all Orleans Parish transfers. Louisiana has no state-level transfer tax."
      : "Louisiana has no state real estate transfer tax. New Orleans charges a $325 flat documentary tax; other parishes do not.";
  }
  else if (stateCode === "OK") { transferTax = 0; transferTaxNote = "OK Documentary Stamp Tax: $0.75 per $500 of value (~0.15%). Customarily paid entirely by seller."; }
  else if (stateCode === "KS") { transferTax = 0; transferTaxNote = "Kansas has no state real estate transfer tax. The KS Mortgage Registration Tax was phased out in 2019 and is no longer charged."; }
  else if (stateCode === "NE") { transferTax = 0; transferTaxNote = "NE Documentary Stamp Tax: $2.25 per $1,000 of value (~0.225%). Customarily paid entirely by seller."; }
  else if (stateCode === "IA") { transferTax = Math.max(0, (homePrice - 500) * 0.0016); transferTaxNote = "IA Real Estate Transfer Tax: $0.80 per $500 of value (~0.16%), with the first $500 exempt. Buyer customarily pays per Iowa convention, though this is negotiable in the purchase contract."; }
  else if (stateCode === "MO") { transferTax = 0; transferTaxNote = "Missouri has no state real estate transfer tax. Buyers owe only standard recording fees."; }
  else if (stateCode === "ND") { transferTax = 0; transferTaxNote = "North Dakota has no state real estate transfer tax."; }
  else if (stateCode === "SD") { transferTax = 0; transferTaxNote = "SD Real Estate Transfer Fee: $0.50 per $500 of value (~0.10%). Customarily paid entirely by seller."; }
  else if (stateCode === "HI") { transferTax = 0; transferTaxNote = "HI Conveyance Tax: tiered 0.10%-1.00% for owner-occupants and 0.15%-1.25% for non-owner-occupants. Customarily paid entirely by seller. Rates increase for higher-value properties — sub-$600k properties are taxed at the lowest 0.10% tier."; }
  else if (stateCode === "AK") { transferTax = 0; transferTaxNote = "Alaska has no state real estate transfer tax. Some municipalities may charge small recording fees but no transfer tax."; }
  else if (stateCode === "OR") { transferTax = 0; transferTaxNote = "Oregon has no statewide real estate transfer tax. Washington County (which includes Beaverton and parts of Portland metro) charges a local transfer tax of 0.1% — confirm with your closing agent if purchasing there."; }
  else if (stateCode === "WA") { transferTax = 0; transferTaxNote = "WA Real Estate Excise Tax (REET): graduated state rate 1.1% (up to $525k) / 1.28% ($525k-$1.525M) / 2.75% ($1.525M-$3.025M) / 3.0% (over $3.025M), plus local REET ~0.5%. Paid by seller per RCW 82.45, though buyer is technically liable if seller doesn't pay. Combined rate typically 1.6% to 3.5%+ on the sale price."; }
  else if (stateCode === "CA") {
    // CA: county base 0.11% (seller pays). City taxes vary wildly.
    // SoCal convention: seller pays everything → buyer $0
    // NorCal convention (Oakland, Berkeley, etc.): city tax split 50/50 → buyer pays half
    // San Francisco: seller pays entire amount (unique full-seller-pays SF convention)
    // LA City with Mansion Tax: ULA 4%/5.5% on high-value sales
    const m = taxMetro;
    if (m === "Oakland") {
      // Oakland Measure U tiered: 1.0% ≤$300k, 1.5% ≤$2M, 1.75% ≤$5M, 2.5% >$5M. Split 50/50.
      const rate = homePrice <= 300000 ? 0.01 : homePrice <= 2000000 ? 0.015 : homePrice <= 5000000 ? 0.0175 : 0.025;
      transferTax = homePrice * rate * 0.5; // buyer's half
      transferTaxNote = `Oakland Real Property Transfer Tax: tiered ${(rate*100).toFixed(2)}% for this price range. Per NorCal convention, city transfer tax is split 50/50 between buyer and seller — buyer's half shown. Seller also pays the 0.11% county base tax. First-time low/moderate-income buyers may get 0.5% discount.`;
    } else if (m === "Berkeley") {
      // Berkeley: 1.5% ≤$1.5M, 2.5% >$1.5M. Split 50/50.
      const rate = homePrice <= 1500000 ? 0.015 : 0.025;
      transferTax = homePrice * rate * 0.5;
      transferTaxNote = `Berkeley Real Property Transfer Tax: ${(rate*100).toFixed(1)}% (${homePrice <= 1500000 ? "sales ≤$1.5M" : "sales >$1.5M"}). Per NorCal convention, city tax is split 50/50 — buyer's half shown. Measure W will raise rates on $1.6M+ transfers effective January 2027.`;
    } else if (m === "LA City Mansion Tax ($5.3M+)") {
      // LA City ULA: 4% on $5.3M-$10.6M, 5.5% on $10.6M+. Base 0.45% applies to all.
      // Seller pays per SoCal convention, but at this price point borrowers often ask about it.
      const ulaRate = homePrice >= 10600000 ? 0.055 : homePrice >= 5300000 ? 0.04 : 0;
      const ulaTax = homePrice * ulaRate;
      transferTax = 0; // SoCal: seller pays
      transferTaxNote = homePrice >= 5300000
        ? `LA City Measure ULA "Mansion Tax" applies: ${(ulaRate*100).toFixed(1)}% on this sale (~${fmt(ulaTax)}) plus 0.45% base city tax plus 0.11% county tax. Per SoCal convention, all transfer taxes are paid by the seller — shown as $0 to buyer. Thresholds adjust annually; effective 7/1/26 thresholds become $5.4M/$10.9M.`
        : `LA City Mansion Tax threshold is $5,300,000. This sale is below the ULA threshold — only the 0.45% base city tax + 0.11% county tax apply (total ~0.56%). Per SoCal convention, all transfer taxes are paid by the seller — shown as $0 to buyer.`;
    } else if (m === "San Francisco City") {
      transferTax = 0;
      transferTaxNote = "San Francisco Real Property Transfer Tax: tiered 0.25%-6.00% (0.5% ≤$250k, 0.68% to $1M, 0.75% to $5M, 2.25% to $10M, 2.75% to $25M, 3.0% >$25M). Paid entirely by seller per SF convention. SF has no county-level transfer tax (the city rate includes it).";
    } else if (["Los Angeles City (≤$5.3M)", "Santa Monica", "Culver City", "Beverly Hills", "Pasadena (LA County)", "Long Beach", "LA County (other cities)", "San Diego County", "Orange County", "Riverside County", "San Bernardino County", "Ventura County", "Sacramento County", "Fresno County"].includes(m)) {
      transferTax = 0;
      transferTaxNote = "CA County Documentary Transfer Tax: $1.10 per $1,000 of value (0.11%). Per Southern California convention, transfer taxes are paid entirely by the seller — shown as $0 to buyer. Some cities (Santa Monica $3/$1k, Culver City tiered 0.45%-4%, Los Angeles 0.45% + ULA) add their own taxes, also seller-paid.";
    } else {
      // Northern CA default (non-SF, non-Oakland/Berkeley): county tax split 50/50
      transferTax = homePrice * 0.00055; // half of 0.11%
      transferTaxNote = "CA County Documentary Transfer Tax: $1.10 per $1,000 of value (0.11%). Per Northern California convention, the county tax is commonly split 50/50 between buyer and seller — buyer's half (0.055%) shown. Any city-specific transfer taxes follow local custom.";
    }
  }
  else { transferTax = 0; transferTaxNote = `⚠️ Transfer tax for ${stateCode} not yet verified — confirm with your closing attorney. This estimate currently excludes any state-level transfer tax.`; }

  // Mortgage recording tax (TN has one!)
  let mortgageTax = 0;
  if (stateCode === "TN") { mortgageTax = Math.max(0, (baseLoan - 2000) * 0.00115); } // $0.115/$100 over $2k

  // Prepaids
  const insurancePrepaid = insuranceAnnual; // 12 months upfront
  // Daily interest from close date to end of month
  const closeDateObj = new Date(closeDate + "T00:00:00");
  const daysInMonth = new Date(closeDateObj.getFullYear(), closeDateObj.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - closeDateObj.getDate() + 1;
  const dailyInterest = (totalLoan * (rate / 100)) / 365;
  const prepaidInterest = dailyInterest * daysRemaining;
  const prepaidsTotal = insurancePrepaid + prepaidInterest;

  // Reserves (escrow setup)
  // Tax reserves: based on state-specific schedule by closing month
  const closingMonth = closeDateObj.getMonth() + 1; // 1-12
  // Tax reserve lookup: metro override first, then state default, then fallback
  const metroOverride = METRO_RESERVE_OVERRIDES[stateCode]?.[taxMetro];
  const taxReserveMonths = metroOverride?.[closingMonth]
    ?? TAX_RESERVE_SCHEDULE[stateCode]?.[closingMonth]
    ?? FALLBACK_SCHEDULE[closingMonth];
  const usingMetroSchedule = !!metroOverride;
  const rawTaxReserves = (taxAnnual / 12) * taxReserveMonths;
  const rawInsuranceReserves = (insuranceAnnual / 12) * 3;
  // Escrow waiver eligibility: Conventional with 20%+ down
  const canWaiveEscrows = program === "Conventional" && downPct >= 20;
  const escrowsWaived = canWaiveEscrows && waiveEscrows;
  const taxReserves = escrowsWaived ? 0 : rawTaxReserves;
  const insuranceReserves = escrowsWaived ? 0 : rawInsuranceReserves;
  const reservesTotal = taxReserves + insuranceReserves;

  // Totals
  const closingCostsExFee = lenderTotal + titleTotal + transferTax + mortgageTax + prepaidsTotal + reservesTotal;
  const closingCostsIncFee = closingCostsExFee + upfrontFee;
  const cashToClose = downAmt + closingCostsExFee - totalCredits;

  // APR calculation per Reg Z §1026.22 (actuarial method) and §1026.4(b)(5).
  // Prepaid finance charges (paid at closing or financed):
  //   - Lender fees (origination, underwriting, processing, credit, flood, tax service, appraisal)
  //   - Upfront MI (UFMIP for FHA, VA Funding Fee — these ARE finance charges)
  //   - Prepaid interest from closing date to month end
  // NOT included: title fees (borrower can shop), recording, transfer taxes,
  //   homeowner's insurance, tax/insurance escrows. Per Reg Z Appendix J.
  const aprFinanceCharges = lenderTotal + upfrontFee + prepaidInterest;

  // Monthly MI is also a finance charge for the period it is required (Reg Z §1026.4(b)(5)).
  // FHA <10% down: MI for life of loan (all 360 months on a 30-year)
  // FHA 10%+ down: MI for 11 years (132 months)
  // Conv with PMI: MI until 78% LTV reached. Estimate ~120 months conservatively for APR purposes.
  //   (Actual cancellation depends on amortization and is borrower-requested at 80% LTV.)
  // VA: no monthly MI ever.
  let aprMonthlyMI = 0;
  let aprMiMonths = 0;
  if (program === "FHA") {
    // FHA monthly MIP rate: 0.55% if <5% down, 0.50% if 5%+ down (matches our standard)
    const fhaMipRate = downPct < 5 ? 0.0055 : 0.0050;
    aprMonthlyMI = (baseLoan * fhaMipRate) / 12;
    aprMiMonths = downPct < 10 ? term * 12 : 132; // life of loan vs 11 years
  } else if (program === "Conventional" && downPct < 20) {
    // Conv PMI: tiered by down payment (matches calculator logic)
    const convPmiRate = downPct < 5 ? 0.0052 : downPct < 10 ? 0.0037 : 0.0027;
    aprMonthlyMI = (baseLoan * convPmiRate) / 12;
    aprMiMonths = 120; // ~10 years to 78% LTV at typical amortization
  } else if (program === "USDA") {
    // USDA annual fee: 0.35% of base loan, paid monthly for life of loan
    aprMonthlyMI = (baseLoan * 0.0035) / 12;
    aprMiMonths = term * 12; // life of loan, always
  }
  // VA: aprMonthlyMI stays 0

  const estimatedAPR = calculateAPR(totalLoan, aprFinanceCharges, rate, term, aprMonthlyMI, aprMiMonths);

  const PROG_COLOR = {
    Conventional: PROGRAM_COLORS.Conventional,
    FHA:          PROGRAM_COLORS.FHA,
    VA:           PROGRAM_COLORS.VA,
    USDA:         PROGRAM_COLORS.USDA,
  }[program];
  // Section header color: gold for Conv/VA (adds contrast against navy/sage subtotal pills),
  // navy for FHA/USDA (gold/sienna subtotal pills are warm, so navy headers stay clean)
  const headerColor = (program === "FHA" || program === "USDA") ? P.navy : P.gold;

  const Row = ({ label, val, sub, bold, color, italic, subtotal }) => (
    <div style={{
      display: "flex", justifyContent: "space-between",
      padding: subtotal ? "10px 14px" : "7px 0",
      fontSize: sub ? 12 : subtotal ? 14 : 13,
      borderBottom: subtotal ? "none" : `1px solid ${P.cream}`,
      background: subtotal ? PROG_COLOR : "transparent",
      borderRadius: subtotal ? 6 : 0,
      marginTop: subtotal ? 6 : 0,
      marginBottom: subtotal ? 4 : 0,
    }}>
      <span style={{ color: subtotal ? "rgba(255,255,255,0.85)" : P.warmGray, fontStyle: italic ? "italic" : "normal", paddingLeft: sub ? 12 : 0, fontWeight: subtotal ? 700 : 400, textTransform: subtotal ? "uppercase" : "none", letterSpacing: subtotal ? 0.5 : 0, fontSize: subtotal ? 11 : "inherit" }}>{label}</span>
      <span style={{ fontWeight: bold || subtotal ? 700 : 600, color: subtotal ? "#fff" : (color || P.text), fontSize: subtotal ? 16 : "inherit" }}>{val}</span>
    </div>
  );

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <SEOHead
        title="Cash to Close Calculator — Estimate Your Closing Costs by State"
        description="See exactly how much cash you need at closing. Includes down payment, closing costs, prepaids, and escrows — calculated for your specific state and county."
        path="/cash-to-close"
        schema={webApplicationSchema({
          title: "Cash to Close Calculator — The Mortgage Geek",
          description: "Estimate total cash needed at closing including down payment, closing costs, prepaids, and escrows.",
          url: "https://mortgagegeek.ai/cash-to-close",
        })}
      />
      <style>{globalCSS}{`
        .ctc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 600px) { .ctc-grid { grid-template-columns: 1fr; } }
        .ctc-loc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: stretch; margin-bottom: 12px; }
        .ctc-loc-grid > .ctc-date-cell { display: flex; flex-direction: column; }
        .ctc-loc-grid > .ctc-date-cell input { flex: 1; }
        .ctc-loc-grid > .ctc-location-stack { display: flex; flex-direction: column; gap: 12px; }
        @media (max-width: 600px) { .ctc-loc-grid { grid-template-columns: 1fr; } }
        .ctc-program-grid { display: flex; gap: 6px; }
        .ctc-program-grid > button { flex: 1; }
        @media (max-width: 480px) {
          .ctc-program-grid { flex-wrap: wrap; }
          .ctc-program-grid > button { flex: 1 1 calc(50% - 3px); }
        }
      `}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/mg-mark-cream-sm.svg" alt="" aria-hidden="true" width={16} height={20} style={{ display: "block" }} /></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" aria-label="Call Nick Peters at (615) 656-0737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20cash%20to%20close%20simulator%20and%20had%20a%20question." aria-label="Text Nick Peters at (615) 656-0737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 8 }}>The Bottom Line</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            Cash to Close Simulator
            <CashToCloseIcon size={38} variant="navy" />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 520, margin: "0 auto" }}>Estimate exactly how much money you'll need at the closing table — down payment, closing costs, prepaids, reserves, and credits.</p>
        </div>

        {/* Inputs */}
        <div className="content-card" style={{ padding: 24, marginBottom: 16 }}>
          {/* Program selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>Loan Program</label>
            <div className="ctc-program-grid">
              {["Conventional", "FHA", "VA", "USDA"].map(p => (
                <button key={p} onClick={() => setProgram(p)} style={{
                  padding: "11px 4px", borderRadius: 8, border: "none",
                  background: program === p ? PROGRAM_COLORS[p] : P.creamDark,
                  color: program === p ? "#fff" : P.warmGray,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body, transition: "all 0.15s",
                }}>{p}</button>
              ))}
            </div>
            {program === "USDA" && (
              <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 6, fontStyle: "italic", lineHeight: 1.5 }}>
                USDA loans require the property to be in a USDA-eligible rural area and household income to be within program limits. Verify both before relying on this estimate.
              </p>
            )}
          </div>

          {/* Tier 2 — Term + Home Price */}
          <div className="ctc-grid">
            <div>
              <label htmlFor={termSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Loan Term</label>
              <select id={termSelectId} value={term} onChange={(e) => setTerm(parseInt(e.target.value))} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                <option value={30}>30 years</option>
                <option value={15}>15 years</option>
              </select>
            </div>
            <CalcInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} comma />
          </div>

          {/* Tier 3 — Down Payment + Live Rate */}
          <div className="ctc-grid">
            <CalcInput label="Down Payment %" value={downPct} onChange={setDownPct} suffix="%" step={0.5} min={0} max={100} />
            <div style={{
              border: `1.5px solid ${P.gold}`,
              borderRadius: 8,
              background: "linear-gradient(135deg, rgba(207, 51, 56, 0.04) 0%, rgba(207, 51, 56, 0.06) 100%)",
              padding: "8px 12px 10px",
              position: "relative",
            }}>
              {!rateLoading && ratesLoaded && (
                <span style={{
                  position: "absolute",
                  top: -7,
                  right: 10,
                  background: P.gold,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: "2px 7px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                  LIVE
                </span>
              )}
              <RateInput label={`${program} Rate`} rate={rate} setRate={setRate} color={PROG_COLOR} />
              {rateLoading && (
                <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 2, fontWeight: 500, fontStyle: "italic" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: P.warmGrayLight, marginRight: 6, verticalAlign: "middle", animation: "rate-pulse 1.2s ease-in-out infinite" }} />
                  Loading today's rates...
                </p>
              )}
              {!rateLoading && ratesLoaded && rateSource && (
                <p style={{ fontSize: 10, color: P.warmGray, marginTop: 2, fontWeight: 500, fontStyle: "italic" }}>
                  {rateSource}
                </p>
              )}
            </div>
          </div>

          {/* Tier 4 — Close Date (left) + State/County stack (right) */}
          <div className="ctc-loc-grid">
            <div className="ctc-date-cell">
              <label htmlFor={closeDateId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Estimated Close Date</label>
              <input id={closeDateId} type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", minWidth: 0, WebkitAppearance: "none" }} />
            </div>
            <div className="ctc-location-stack">
              <div>
                <label htmlFor={stateSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>State</label>
                <select id={stateSelectId} value={stateCode} onChange={(e) => setStateCode(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                  {ALL_STATES_LIST.map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              {hasMetros ? (
                <div>
                  <label htmlFor={metroSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>County / Metro Area</label>
                  <select id={metroSelectId} value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                    {Object.entries(CASH_STATE_METROS[stateCode]?.metros || {}).map(([name, r]) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Property Tax Rate</label>
                  <div style={{ width: "100%", border: `1px dashed ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.warmGray }}>
                    Statewide avg ({(taxRate * 100).toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>
          </div>
          <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 4, fontStyle: "italic" }}>
            Auto-calculated: HOI {fmt(insuranceAnnual)}/yr (0.35% of price) · Property tax {fmt(taxAnnual)}/yr ({(taxRate * 100).toFixed(2)}%)
          </p>

          {program === "VA" && (
            <div style={{ marginTop: 12 }}>
              <label htmlFor={vaUsageSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>VA Eligibility</label>
              <select id={vaUsageSelectId} value={vaUsage} onChange={(e) => setVaUsage(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                <option value="first">First-Time Use</option>
                <option value="subsequent">Subsequent Use</option>
                <option value="exempt">Exempt (Disability)</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        {!isEligible ? (
          <div className="content-card" style={{ padding: "40px 32px", textAlign: "center", marginBottom: 16, overflow: "hidden" }}>
            <div style={{ background: P.warmGrayLight, margin: "-40px -32px 24px", padding: "24px", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{program}</span>
              <span style={{ fontFamily: F.display, fontSize: 30, color: "#fff" }}>Ineligible</span>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: P.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
            </div>
            <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 8 }}>{ineligibleReason.title}</h3>
            <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
              {ineligibleReason.body}
            </p>
          </div>
        ) : (
        <div className="content-card" style={{ overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: PROG_COLOR, padding: "24px 20px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{program} · Estimated Cash to Close</span>
            <span style={{ fontFamily: F.display, fontSize: 44, color: "#fff" }}>{fmt(cashToClose)}</span>
            <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Closing on {new Date(closeDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>

          <div style={{ padding: "20px 24px" }}>
            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 4 }}>Loan Amount</h3>
            <Row label="Base Loan Amount" val={fmt(baseLoan)} />
            {upfrontFee > 0 && <Row label={`+ ${upfrontLabel}`} val={fmt(upfrontFee)} sub italic />}
            <Row label="Total Loan (financed)" val={fmt(totalLoan)} bold color={PROG_COLOR} />

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Lender Fees <span style={{ fontSize: 10, fontWeight: 400, color: P.warmGrayLight }}>(editable)</span></h3>
            <CalcInput label="Underwriting" value={feeUnderwriting} onChange={setFeeUnderwriting} prefix="$" step={50} comma />
            <CalcInput label="Processing" value={feeProcessing} onChange={setFeeProcessing} prefix="$" step={50} comma />
            <CalcInput label="Appraisal" value={feeAppraisal} onChange={setFeeAppraisal} prefix="$" step={25} comma />
            <CalcInput label="Verification Fees" value={feeVerification} onChange={setFeeVerification} prefix="$" step={50} comma />
            <CalcInput label="Credit Report" value={feeCreditReport} onChange={setFeeCreditReport} prefix="$" step={25} comma />
            <CalcInput label="Flood Certification" value={feeFloodCert} onChange={setFeeFloodCert} prefix="$" step={5} />
            <CalcInput label="Tax Service" value={feeTaxService} onChange={setFeeTaxService} prefix="$" step={10} />

            {/* Discount Points */}
            <div style={{ marginTop: 10, padding: "12px 14px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: P.text }}>Discount Points</span>
                <button onClick={() => setShowPointsInfo(!showPointsInfo)} style={{ background: "none", border: "none", fontSize: 11, color: P.sageDark, fontWeight: 600, cursor: "pointer", fontFamily: F.body, textDecoration: "underline" }}>{showPointsInfo ? "Hide info ↑" : "What are points? ↓"}</button>
              </div>
              {showPointsInfo && (
                <div style={{ marginBottom: 12, padding: "12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray, marginBottom: 8 }}>
                    <strong style={{ color: P.navy }}>Discount points</strong> are upfront fees paid to the lender at closing to "buy down" your interest rate. Each point costs <strong>1% of the loan amount</strong> (e.g., 1 point on a $300,000 loan = $3,000).
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray, marginBottom: 8 }}>
                    Points are a trade-off: <strong>more cash upfront = lower monthly payment</strong>. Whether points make sense depends on how long you keep the loan. The "break-even" point is typically 4–7 years — if you sell or refinance before then, you may not recoup the upfront cost.
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray }}>
                    Common increments: 0.125, 0.250, 0.375, 0.500, 0.750, 1.000. Your Loan Estimate will show exactly how many points (if any) your rate includes. Points are a <strong>Reg Z finance charge</strong> and are factored into your APR.
                  </p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <CalcInput label="Points (%)" value={discountPointsPct} onChange={handlePointsPctChange} suffix="%" step={0.125} min={0} max={5} />
                <CalcInput label="Points ($)" value={discountPointsDollar} onChange={handlePointsDollarChange} prefix="$" step={100} comma />
              </div>
              {discountPointsDollar > 0 && (
                <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 4, textAlign: "center" }}>{discountPointsPct.toFixed(3)}% of {fmt(baseLoan)} loan = {fmt(discountPointsDollar)}</p>
              )}
            </div>

            <div style={{ marginTop: 10 }}><Row label="Lender Fees + Points Subtotal" val={fmt(lenderTotal)} subtotal /></div>

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Title & Escrow</h3>
            <Row label="Lender's Title Insurance" val={fmt(lendersTitle)} />
            <Row label="Owner's Title Insurance" val={fmt(ownersTitle)} />
            <Row label="Settlement / Closing Fee" val={fmt(settlementFee)} />
            <Row label="Title Search & Exam" val={fmt(titleSearch)} />
            <Row label="Recording Fee" val={fmt(recordingFee)} />
            <Row label="Wire & Notary" val={fmt(wireNotary)} />
            <Row label="Title & Escrow Subtotal" val={fmt(titleTotal)} subtotal />

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Government & Recording</h3>
            <Row label="Transfer Tax" val={fmt(transferTax)} />
            {mortgageTax > 0 && <Row label="Mortgage Recording Tax (TN)" val={fmt(mortgageTax)} />}
            <Row label="Government & Recording Subtotal" val={fmt(transferTax + mortgageTax)} subtotal />
            <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6 }}>{transferTaxNote}</p>

            <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(207,51,56,0.06)", borderRadius: 10, border: `1px solid rgba(207,51,56,0.15)` }}>
              <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 0 }}>Prepaid Items</h3>
              <Row label="12 Months Homeowner's Insurance" val={fmt(insurancePrepaid)} />
              <Row label={`Daily Interest (${daysRemaining} days × ${fmt(dailyInterest)})`} val={fmt(prepaidInterest)} />
              <Row label="Prepaids Subtotal" val={fmt(prepaidsTotal)} subtotal />
            </div>

            <div style={{ marginTop: 14, padding: "16px 18px", background: withAlpha(P.success, 0.07), borderRadius: 10, border: `1px solid ${withAlpha(P.success, 0.18)}` }}>
              <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 0 }}>Escrow Reserves</h3>

              {/* Escrow Waiver — Conv only. FHA/VA always require escrows. */}
              {program === "Conventional" ? (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}`, opacity: canWaiveEscrows ? 1 : 0.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <label htmlFor={waiveEscrowsSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Waive Escrows?</label>
                    <select
                      id={waiveEscrowsSelectId}
                      value={waiveEscrows ? "yes" : "no"}
                      onChange={(e) => setWaiveEscrows(e.target.value === "yes")}
                      disabled={!canWaiveEscrows}
                      style={{ border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.cream, padding: "6px 28px 6px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 700, color: P.text, outline: "none", cursor: canWaiveEscrows ? "pointer" : "not-allowed", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
                      <option value="no">No — Standard Escrow</option>
                      <option value="yes">Yes — Waive Escrows</option>
                    </select>
                  </div>
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>
                    {canWaiveEscrows
                      ? "20%+ down required · You'll pay taxes and insurance directly when due (not collected at closing or monthly)"
                      : "Escrow waiver requires 20% or more down payment"}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
                  <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                    <strong style={{ color: P.navy }}>🔒 Escrows required.</strong> {program} loans require an escrow account for property taxes and homeowner's insurance for the life of the loan — escrow waiver is not permitted.
                  </p>
                </div>
              )}

              {escrowsWaived ? (
                <>
                  <p style={{ fontSize: 12, color: P.success, fontWeight: 600, textAlign: "center", padding: "12px 0" }}>✓ Escrows waived — no reserves collected at closing</p>
                  <Row label="Reserves Subtotal" val={fmt(0)} subtotal />
                </>
              ) : (
                <>
                  <Row label={`${taxReserveMonths} Months Property Tax`} val={fmt(taxReserves)} />
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: -2, marginBottom: 4, paddingLeft: 0 }}>{usingMetroSchedule ? `${taxMetro} schedule` : UNVERIFIED_RESERVES_STATES.has(stateCode) ? `Approximate schedule (${stateCode})` : `${stateCode} schedule`} · closing in {closeDateObj.toLocaleString("en-US", { month: "long" })}</p>
                  <Row label="3 Months Insurance" val={fmt(insuranceReserves)} />
                  <Row label="Reserves Subtotal" val={fmt(reservesTotal)} subtotal />
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6 }}>{UNVERIFIED_RESERVES_STATES.has(stateCode) ? `${stateCode} uses an approximate national reserve pattern — a precise impound matrix isn't yet available for this state. Reserve amounts may differ from your actual Loan Estimate. Confirm exact reserve requirements with your closing agent.` : `Tax reserve months follow the ${stateCode} prepaid schedule based on your closing month. This varies by state and protects the lender from a tax lien gap.`}</p>
                </>
              )}
            </div>

            <h3 style={{ fontFamily: F.display, fontSize: 18, color: headerColor, marginBottom: 12, marginTop: 24, textAlign: "center" }}>Total Closing Costs</h3>
            <div style={{ padding: "18px 20px", background: P.cream, borderRadius: 12, border: `2px solid ${PROG_COLOR}` }}>
              {/* Stack of subtotals */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Lender Fees</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(lenderTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Title & Escrow</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(titleTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Government & Recording</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(transferTax + mortgageTax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Prepaid Items</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(prepaidsTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `2px solid ${P.warmGrayLight}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Escrow Reserves</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(reservesTotal)}</span>
              </div>

              {/* Grand total (excl. financed fee) */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 6px", fontSize: 15 }}>
                <span style={{ color: P.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 12 }}>Total Closing Costs</span>
                <span style={{ fontWeight: 700, color: PROG_COLOR, fontSize: 18, fontFamily: F.display }}>{fmt(closingCostsExFee)}</span>
              </div>

              {/* Financed fee section — FHA/VA only */}
              {upfrontFee > 0 && (
                <>
                  <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px dashed ${P.creamDark}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                      <span style={{ color: P.warmGrayLight, fontStyle: "italic" }}>+ {upfrontLabel} (financed)</span>
                      <span style={{ fontWeight: 600, color: P.warmGrayLight, fontStyle: "italic" }}>{fmt(upfrontFee)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", fontSize: 14 }}>
                      <span style={{ color: P.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>With Financed Fee</span>
                      <span style={{ fontWeight: 700, color: PROG_COLOR, fontSize: 16, fontFamily: F.display }}>{fmt(closingCostsIncFee)}</span>
                    </div>
                    <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>The {upfrontLabel} is rolled into your loan — not paid in cash at closing.</p>
                  </div>
                </>
              )}
            </div>

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 24 }}>Cash to Close Calculation</h3>
            <Row label="Down Payment" val={fmt(downAmt)} />
            <Row label="+ Total Closing Costs" val={fmt(closingCostsExFee)} />
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <CalcInput label="− Total Credits" value={totalCredits} onChange={setTotalCredits} prefix="$" step={500} comma />
              <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 4, lineHeight: 1.5 }}>Combine earnest money already paid, <a href="/deep-dives/seller-concessions" style={{ color: P.warmGray, fontWeight: 600, textDecoration: "underline" }}>seller concessions</a>, lender credits, and any other credits into one total here.</p>
            </div>

            <div style={{ marginTop: 16, padding: "16px 18px", background: PROG_COLOR, borderRadius: 10, textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.8 }}>Total Cash Needed at Closing</span>
              <span style={{ fontFamily: F.display, fontSize: 36, color: "#fff" }}>{fmt(cashToClose)}</span>
            </div>

            {/* APR disclosure — Reg Z compliance for borrower comparison */}
            <div style={{ marginTop: 14, padding: "16px 18px", background: P.cream, borderRadius: 10, border: `1px solid ${P.creamDark}`, textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Estimated APR</span>
                <span style={{ fontFamily: F.display, fontSize: 30, color: PROG_COLOR, fontWeight: 600, display: "block" }}>{estimatedAPR.toFixed(3)}%</span>
                <span style={{ fontSize: 10, color: P.warmGrayLight, display: "block", marginTop: 4 }}>Note rate {Number(rate).toFixed(3)}% · {term}-year term</span>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: P.warmGray, marginTop: 8, paddingTop: 10, borderTop: `1px solid ${P.creamDark}`, textAlign: "left" }}>
                <strong style={{ color: P.navy }}>What is APR?</strong> The Annual Percentage Rate reflects your note rate plus lender fees, prepaid interest, upfront mortgage insurance, and monthly mortgage insurance premiums for the period required — expressed as an annual rate. APR is typically 0.10–0.75% higher than your note rate for Conventional loans and 0.40–1.00% higher for FHA/VA/USDA loans (due to upfront and monthly MI), and is the standard apples-to-apples comparison number across lenders. This estimate includes lender fees ({fmt(lenderTotal)}){upfrontFee > 0 ? `, upfront ${program === "FHA" ? "MIP" : program === "USDA" ? "USDA Guarantee Fee" : "VA funding fee"} (${fmt(upfrontFee)})` : ""}, prepaid interest ({fmt(prepaidInterest)}){aprMonthlyMI > 0 ? `, and monthly MI of ${fmt(aprMonthlyMI)} for ${aprMiMonths} months` : ""}. Title fees, taxes, and insurance are excluded per Reg Z Appendix J. <strong>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</strong>
              </p>
            </div>
          </div>
        </div>
        )}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          {ratesLoaded ? `Rates auto-populated from Mortgage News Daily, rounded to the nearest 0.125% and bumped up 0.25% so the starting estimate stays conservative. ` : ""}APR estimate calculated per Reg Z Appendix J methodology — actual APR may vary based on final loan terms, points, and lender-specific fee structure. Estimates based on national averages and state-specific transfer tax conventions. Title fees vary by underwriter and county. Actual costs depend on lender, title company, and specific transaction. <strong>This is not a Loan Estimate or commitment to lend.</strong> NMLS #1119524.
        </p>
      </div>
      <MobileToolbar />
    </main>
  );
}
