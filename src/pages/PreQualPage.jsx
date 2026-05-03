import { useState, useEffect, useMemo, useId } from "react";
import { P, F, PROGRAM_COLORS, globalCSS } from "../theme";
import { SHARED_STATE_TAX_RATES, DEFAULT_LIMITS } from "../data/taxRates";
import { fmt } from "../utils/format";
import { calculateAPR } from "../utils/math";
import { useIsCockpit } from "../utils/hooks";
import { MortgageCalcIcon, PreQualIcon } from "../components/icons";
import { MobileToolbar } from "../components/MobileToolbar";
import { CalcInput } from "../components/CalcInput";
import { RateInput } from "../components/RateInput";
import { SEOHead } from "../components/SEOHead";
import { webApplicationSchema } from "../utils/schema";
import { CockpitShell } from "../components/cockpit/CockpitShell";
import { ProgramResultCardCompact } from "../components/prequal/ProgramResultCardCompact";
import { DetailPanel as PreQualDetailPanel } from "../components/prequal/DetailPanel";

export function PreQualPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [grossIncome, setGrossIncome] = useState(() => { const v = parseFloat(params.get("income")); return v > 0 ? v : 6500; });
  const [monthlyDebts, setMonthlyDebts] = useState(() => { const v = parseFloat(params.get("debts")); return v >= 0 ? v : 450; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 5; });
  const [downDollarOverride, setDownDollarOverride] = useState(null);
  const [downMode, setDownMode] = useState("pct"); // "pct" or "dollar"
  const [selectedProgram, setSelectedProgram] = useState(null); // null = auto-pick best
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const termSelectId = useId();
  const stateSelectId = useId();
  const vaUsageSelectId = useId();
  const [showStudentCalc, setShowStudentCalc] = useState(false);
  const [studentBalance, setStudentBalance] = useState(0);
  const [convRate, setConvRate] = useState(6.75);
  const [convRate30Api, setConvRate30Api] = useState(6.75);
  const [convRate15Api, setConvRate15Api] = useState(6.0);
  const [fhaRate, setFhaRate] = useState(6.25);
  const [vaRate, setVaRate] = useState(6.25);
  const [usdaRate, setUsdaRate] = useState(6.25);
  const [vaUsage, setVaUsage] = useState("first");
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville/Davidson");
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const insRate = 0.35;

  // Cockpit gate — at ≥1100px we render the rail+canvas cockpit layout;
  // below that we render the legacy stacked layout untouched.
  const isCockpit = useIsCockpit();

  const stateData = SHARED_STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const loanLimits = selectedMetro?.limits || stateData?.limits || DEFAULT_LIMITS;

  useEffect(() => {
    const newMetros = SHARED_STATE_TAX_RATES[taxState]?.metros;
    if (newMetros && newMetros.length > 0) setTaxMetro(newMetros[0].name);
    else setTaxMetro("");
  }, [taxState]);

  const roundRate = (r) => Math.round(r / 0.125) * 0.125;
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv30 = find("30-year fixed"); const conv15 = find("15-year fixed");
          const fha = find("fha"); const va = find("va"); const usda = find("usda");
          const r30 = conv30 ? roundRate(parseFloat(conv30.rate)) : 6.75;
          const r15 = conv15 ? roundRate(parseFloat(conv15.rate)) : 6.0;
          setConvRate30Api(r30);
          setConvRate15Api(r15);
          setConvRate(term === 15 ? r15 : r30);
          if (fha) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va) setVaRate(roundRate(parseFloat(va.rate)));
          if (usda) setUsdaRate(roundRate(parseFloat(usda.rate)));
          setRateSource(data.date || "today"); setRatesLoaded(true);
        }
      } catch (e) { /* silent */ }
    })();
  }, []);

  // Switch conv rate when term changes
  useEffect(() => {
    if (ratesLoaded) setConvRate(term === 15 ? convRate15Api : convRate30Api);
  }, [term]);

  // VA funding fee
  const vaFeeRate = useMemo(() => {
    if (vaUsage === "exempt") return 0;
    if (downPct >= 10) return 1.25;
    if (downPct >= 5) return 1.50;
    return vaUsage === "first" ? 2.15 : 3.30;
  }, [vaUsage, downPct]);

  // Solve max price from max housing payment
  // Effective down payment: use dollar override to derive percentage if set
  const isDollarMode = downMode === "dollar" && downDollarOverride > 0;

  const effectiveDownPct = useMemo(() => {
    if (!isDollarMode) return downPct;
    const roughMaxPayment = Math.floor(grossIncome * 0.45 - monthlyDebts);
    const roughPrice = Math.max(roughMaxPayment * 150, downDollarOverride * 2);
    return Math.min(Math.max(Math.round((downDollarOverride / roughPrice) * 10000) / 100, 0), 99);
  }, [isDollarMode, downDollarOverride, downPct, grossIncome, monthlyDebts]);

  const solvePrice = (maxPayment, rate, miRateAnnual, upfrontFeePct) => {
    if (maxPayment <= 0) return 0;
    const mr = (rate / 100) / 12;
    const n = term * 12;
    let price = maxPayment * 170;
    for (let i = 0; i < 25; i++) {
      const baseLoan = isDollarMode ? Math.max(price - downDollarOverride, 0) : price * (1 - effectiveDownPct / 100);
      const totalLoan = baseLoan * (1 + upfrontFeePct / 100);
      const pi = totalLoan > 0 ? totalLoan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : 0;
      const mi = (baseLoan * (miRateAnnual / 100)) / 12;
      const tax = (price * (taxRate / 100)) / 12;
      const ins = (price * (insRate / 100)) / 12;
      const total = pi + mi + tax + ins;
      if (total < 1) break;
      price = Math.round(price * (maxPayment / total));
      if (Math.abs(total - maxPayment) < 5) break;
    }
    return Math.max(0, price);
  };

  // Program definitions — use effectiveDownPct for MI tiers and eligibility
  const dpForCalc = isDollarMode ? effectiveDownPct : downPct;
  const convMiRate = dpForCalc < 5 ? 0.52 : dpForCalc < 10 ? 0.37 : dpForCalc < 20 ? 0.27 : 0;
  const fhaMiRate = dpForCalc < 5 ? 0.55 : 0.50;

  // Per-program ineligibility messaging. Each program populates ineligibleReason
  // with the {title, body} the result card renders when eligible === false.
  const convIneligibleReason = dpForCalc < 3
    ? { title: "Min 3% Down Required", body: "Conventional loans require a minimum 3% down payment. Increase your down payment to see Conventional results." }
    : null;
  const fhaIneligibleReason = dpForCalc < 3.5
    ? { title: "Min 3.5% Down Required", body: "FHA loans require a minimum 3.5% down payment. Increase your down payment to see FHA results." }
    : null;

  // USDA: standard income cap for 1-4 person households in most areas (FY2026).
  // High-cost MSAs are higher; we use the standard as the trigger.
  const USDA_INCOME_CAP_ANNUAL = 119850;
  const usdaIncomeOk = (grossIncome * 12) <= USDA_INCOME_CAP_ANNUAL;
  const usdaTermOk = term === 30;
  const usdaEligible = usdaIncomeOk && usdaTermOk;
  const usdaIneligibleReason = !usdaIncomeOk
    ? {
        title: "Income Exceeds USDA Limit",
        body: "USDA caps total household income at $119,850/year for 1-4 person households in most areas. USDA counts ALL adult household income, not just yours, so the actual cap may be reached even when individual income looks lower. Higher limits apply in some high-cost MSAs — verify your specific county limit with an MLO.",
      }
    : !usdaTermOk
    ? {
        title: "USDA 30-Year Only",
        body: "USDA loans are only available as 30-year fixed-rate mortgages. Switch the loan term to 30 years to see USDA results.",
      }
    : null;

  const programs = [
    {
      name: "Conventional", color: PROGRAM_COLORS.Conventional, rate: convRate, setRate: setConvRate,
      frontMax: 0.4999, backMax: 0.4999, miRate: convMiRate, upfrontFee: 0,
      minDown: 3, eligible: dpForCalc >= 3, loanLimit: loanLimits.conv,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : "No PMI",
      notes: "Front-end and back-end both 49.99%. DTI thresholds assume 740+ FICO — lower scores may reduce max DTI. PMI removable at 80% LTV.",
      ineligibleReason: convIneligibleReason,
    },
    {
      name: "FHA", color: PROGRAM_COLORS.FHA, rate: fhaRate, setRate: setFhaRate,
      frontMax: 0.4699, backMax: 0.5699, miRate: fhaMiRate, upfrontFee: 1.75,
      minDown: 3.5, eligible: dpForCalc >= 3.5, loanLimit: loanLimits.fha,
      miLabel: `MIP (${fhaMiRate}%)`,
      notes: "Front-end 46.99%, back-end 56.99%. DTI thresholds assume 680+ FICO. UFMIP (1.75%) financed. MIP for life if <10% down.",
      ineligibleReason: fhaIneligibleReason,
    },
    {
      name: "VA", color: PROGRAM_COLORS.VA, rate: vaRate, setRate: setVaRate,
      frontMax: 0.50, backMax: 0.55, miRate: 0, upfrontFee: vaFeeRate,
      minDown: 0, eligible: true, loanLimit: loanLimits.va,
      miLabel: "No monthly MI",
      notes: `Front-end 50%, back-end 55%. DTI thresholds assume 680+ FICO. Funding fee ${vaFeeRate}% financed. No monthly MI. Can exceed 55% with strong residual income.`,
    },
    {
      name: "USDA", color: PROGRAM_COLORS.USDA, rate: usdaRate, setRate: setUsdaRate,
      frontMax: 0.34, backMax: 0.4499, miRate: 0.35, upfrontFee: 1.00,
      minDown: 0, eligible: usdaEligible, loanLimit: Infinity,
      miLabel: "Annual Fee (0.35%)",
      notes: "Front-end 34%, back-end 44.99% (stretch maximums with compensating factors — standard GUS Accept is 29%/41%). 30-year fixed only. Annual fee for life of loan. Subject to property + household income eligibility.",
      ineligibleReason: usdaIneligibleReason,
    },
  ];

  // Calculate for each program
  const results = programs.map(prog => {
    const useFixedDown = isDollarMode;

    // When using fixed dollar down, dp-based eligibility is bypassed because the
    // price scales to meet minDown. Programs with non-dp eligibility (USDA's
    // income/term checks) keep their actual prog.eligible value.
    const isEligible = useFixedDown && prog.minDown > 0 ? true : prog.eligible;
    if (!isEligible) return { ...prog, maxPrice: 0, maxPayment: 0, comfPrice: 0, comfPayment: 0, frontMaxHousing: 0, backTotalMax: 0, backMaxHousing: 0, overLimit: false, actualDownAmt: 0, actualDownPctDisplay: 0 };

    // Front-end: max HOUSING payment (independent of debts)
    const frontMaxHousing = prog.frontMax ? Math.floor(grossIncome * prog.frontMax) : Infinity;

    // Back-end: max TOTAL of (housing + all debts)
    const backTotalMax = Math.floor(grossIncome * prog.backMax);
    const backMaxHousing = backTotalMax - monthlyDebts;

    let maxPayment = Math.max(0, Math.min(frontMaxHousing, backMaxHousing));
    const bindingConstraint = frontMaxHousing <= backMaxHousing ? "front-end" : "back-end";

    // Comfortable range (75% of limits)
    const comfFront = prog.frontMax ? Math.floor(grossIncome * prog.frontMax * 0.75) : Infinity;
    const comfBack = Math.floor(grossIncome * prog.backMax * 0.75) - monthlyDebts;
    const comfPayment = Math.max(0, Math.min(comfFront, comfBack));

    let maxPrice = solvePrice(maxPayment, prog.rate, prog.miRate, prog.upfrontFee);
    let comfPrice = solvePrice(comfPayment, prog.rate, prog.miRate, prog.upfrontFee);

    // When using fixed dollar down, cap price so down payment meets minimum %
    // e.g., $10,000 at 3% min → max price = $333,333
    let cappedByMinDown = false;
    if (useFixedDown && prog.minDown > 0) {
      const maxPriceFromMinDown = Math.floor(downDollarOverride / (prog.minDown / 100));
      if (maxPrice > maxPriceFromMinDown) {
        maxPrice = maxPriceFromMinDown;
        cappedByMinDown = true;
      }
      if (comfPrice > maxPriceFromMinDown) {
        comfPrice = maxPriceFromMinDown;
      }
    }

    // Calculate loan amounts
    let maxLoan = useFixedDown ? Math.max(maxPrice - downDollarOverride, 0) : maxPrice * (1 - dpForCalc / 100);
    let overLimit = false;
    if (maxLoan > prog.loanLimit) {
      maxLoan = prog.loanLimit;
      maxPrice = useFixedDown ? maxLoan + downDollarOverride : Math.floor(prog.loanLimit / (1 - dpForCalc / 100));
      overLimit = true;
      // When the loan limit is binding (not DTI), recompute maxPayment for
      // the clamped loan so DTI bars and currentBackDTI reflect the actual
      // scenario instead of pinning to the DTI cap. Same PI+MI+tax+ins
      // formula solvePrice uses internally.
      const mr = (prog.rate / 100) / 12;
      const n = term * 12;
      const totalLoan = maxLoan * (1 + prog.upfrontFee / 100);
      const pi = totalLoan > 0
        ? totalLoan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1)
        : 0;
      const mi = (maxLoan * (prog.miRate / 100)) / 12;
      const tax = (maxPrice * (taxRate / 100)) / 12;
      const ins = (maxPrice * (insRate / 100)) / 12;
      maxPayment = Math.round(pi + mi + tax + ins);
    }

    const maxTotalLoan = maxLoan * (1 + prog.upfrontFee / 100);
    const comfLoan = useFixedDown ? Math.max(comfPrice - downDollarOverride, 0) : comfPrice * (1 - dpForCalc / 100);
    const actualDownAmt = useFixedDown ? downDollarOverride : maxPrice * (dpForCalc / 100);
    const actualDownPctDisplay = maxPrice > 0 ? ((actualDownAmt / maxPrice) * 100).toFixed(1) : 0;

    const currentBackDTI = grossIncome > 0 ? ((monthlyDebts + maxPayment) / grossIncome * 100) : 0;

    // APR calculation for the max scenario
    const aprLenderFees = 1500 + 750 + (prog.name === "VA" ? 650 : prog.name === "FHA" ? 550 : prog.name === "USDA" ? 625 : 600) + 300 + 15 + 80;
    const aprUpfront = maxLoan * (prog.upfrontFee / 100);
    const aprCharges = aprLenderFees + aprUpfront;
    let aprMI = 0, aprMiMonths = 0;
    if (prog.name === "FHA") {
      aprMI = (maxLoan * (prog.miRate / 100)) / 12;
      aprMiMonths = dpForCalc < 10 ? term * 12 : 132;
    } else if (prog.name === "Conventional" && dpForCalc < 20) {
      aprMI = (maxLoan * (prog.miRate / 100)) / 12;
      aprMiMonths = 120;
    } else if (prog.name === "USDA") {
      aprMI = (maxLoan * (prog.miRate / 100)) / 12;
      aprMiMonths = term * 12; // life of loan
    }
    const apr = maxTotalLoan > 0 ? calculateAPR(maxTotalLoan, aprCharges, prog.rate, term, aprMI, aprMiMonths) : 0;

    return { ...prog, eligible: isEligible, maxPrice, maxPayment, comfPrice, comfPayment, maxLoan, maxTotalLoan, comfLoan, currentBackDTI, bindingConstraint, frontMaxHousing, backTotalMax, backMaxHousing, overLimit, actualDownAmt, actualDownPctDisplay, cappedByMinDown, apr };
  });

  // ===================================================================
  // Cockpit-shape program list. Translates the legacy `results` into
  // the field names the new ProgramResultCardCompact + DetailPanel
  // expect, plus computes JSX payloads (USDA callout, APR small-print)
  // that the page lifts verbatim — keeping all copy inside the page,
  // not in the shared components. Legacy renderer still uses `results`.
  // ===================================================================
  const eligibleResults = results.filter(r => r.eligible && r.maxPrice > 0);
  const bestPriceForPower = eligibleResults.length > 0
    ? Math.max(...eligibleResults.map(r => r.maxPrice))
    : 0;

  const cockpitResults = results.map(r => {
    const bindingForCockpit = !r.eligible
      ? null
      : r.overLimit
      ? "limit"
      : r.cappedByMinDown
      ? "minDown"
      : r.bindingConstraint === "front-end"
      ? "front"
      : r.bindingConstraint === "back-end"
      ? "back"
      : null;

    const bindingLabel = !r.eligible
      ? ""
      : r.overLimit
      ? "capped at loan limit"
      : r.cappedByMinDown
      ? `capped at ${r.minDown}% min down`
      : `${r.bindingConstraint} DTI binding`;

    const financedFee = r.upfrontFee > 0 ? r.maxLoan * (r.upfrontFee / 100) : 0;
    const monthlyMI = r.miRate > 0 ? (r.maxLoan * r.miRate / 100) / 12 : 0;

    // USDA-only household-income callout — lifted verbatim from the live card.
    const usdaIncomeCallout = r.name === "USDA" ? (
      <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
        <strong style={{ color: PROGRAM_COLORS.USDA }}>Household income, not just yours.</strong> USDA counts gross income from all adults (18+) in the household, even those not on the loan. Verify your total against the $119,850 limit (1-4 person, most areas) with an MLO before relying on this estimate.
      </p>
    ) : null;

    // APR small-print — two-paragraph block lifted verbatim from the live card.
    const aprSmallPrint = (
      <>
        <p style={{ fontSize: 9, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4 }}>Note rate {Number(r.rate).toFixed(3)}% · Includes lender fees{r.upfrontFee > 0 ? `, ${r.name === "FHA" ? "UFMIP" : r.name === "USDA" ? "USDA Guarantee Fee" : "VA funding fee"}` : ""}{r.miRate > 0 ? ", monthly MI" : ""}</p>
        <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
      </>
    );

    return {
      ...r,
      // Override bindingConstraint with the cockpit-component vocabulary.
      // The legacy renderer reads `results` (untouched), not this object.
      bindingConstraint: bindingForCockpit,
      bindingLabel,
      frontDTI: r.frontMax && grossIncome > 0 ? r.maxPayment / grossIncome : 0,
      backDTI: grossIncome > 0 ? (monthlyDebts + r.maxPayment) / grossIncome : 0,
      frontCap: r.frontMax || 0,
      backCap: r.backMax || 0,
      maxHousing: r.maxPayment,
      maxHousingPlusDebts: r.maxPayment + monthlyDebts,
      loanAmount: r.maxLoan,
      financedFee,
      financedFeeLabel: r.upfrontFee > 0 ? `Financed Fee (${r.upfrontFee}%)` : "",
      downPayment: r.actualDownAmt,
      mi: monthlyMI,
      comfortablePrice: r.comfPrice,
      comfortablePayment: r.comfPayment,
      note: r.notes,
      aprSmallPrint,
      usdaIncomeCallout,
      isVA: r.name === "VA",
      ineligibleReason: r.ineligibleReason?.title || null,
      ineligibleBody: r.ineligibleReason?.body || null,
      isMostPower: r.eligible && r.maxPrice > 0 && r.maxPrice === bestPriceForPower,
    };
  });

  // The cockpit's detail panel always shows something. Pick the user's
  // selection if any, otherwise fall back to the Most-Power program, then
  // to the first eligible result. Returns null only if zero programs qualify.
  const cockpitEligible = cockpitResults.filter(r => r.eligible && r.maxPrice > 0);
  const selectedProg = (() => {
    if (cockpitEligible.length === 0) return null;
    if (selectedProgram) {
      const found = cockpitEligible.find(r => r.name === selectedProgram);
      if (found) return found;
    }
    return cockpitEligible.find(r => r.isMostPower) || cockpitEligible[0];
  })();

  // Cross-link target — same logic as the legacy footer button: selected
  // program if set, else the highest max-price eligible program.
  const calculatorHref = (() => {
    const target = selectedProg;
    const targetPrice = target?.maxPrice || 0;
    const programParam = target ? `&program=${encodeURIComponent(target.name)}` : "";
    return `/calculator?price=${targetPrice > 0 ? targetPrice : 350000}&down=${downPct}&term=${term}${programParam}`;
  })();

  // ===================================================================
  // SHARED JSX — defined once and used by both the legacy stacked layout
  // and the cockpit layout below. Lifting these prevents drift between
  // the two branches and keeps each branch focused on layout (not copy).
  // ===================================================================

  const sharedHead = (
    <>
      <SEOHead
        title="Pre-Qualification Calculator — See What Mortgage You Can Afford"
        description="Enter your income and debts to see your maximum mortgage amount across Conventional, FHA, VA, and USDA. Free pre-qualification estimate, no credit check."
        path="/prequal"
        schema={webApplicationSchema({
          title: "Pre-Qualification Calculator — The Mortgage Geek",
          description: "See what mortgage you can afford across Conventional, FHA, VA, and USDA based on your income and debts.",
          url: "https://mortgagegeek.ai/prequal",
        })}
      />
      <style>{globalCSS}{`
        .pq-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pq-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        @media (max-width: 1100px) {
          .pq-cards-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (max-width: 700px) {
          .pq-input-cols { grid-template-columns: 1fr; }
          .pq-cards-grid { grid-template-columns: 1fr; }
        }
        /* ----- Cockpit-only rules (≥1100px viewports). ----- */
        .pq-cards-grid--compact { gap: 12px; margin-bottom: 0; }
        .pq-cards-grid--compact + .pq-detail-panel { margin-top: 0; }
        .pq-detail-panel-body { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1100px) { .pq-detail-panel-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; } }
        .pq-card-compact:hover:not(.pq-card-compact--ineligible):not(.pq-card-compact--selected) { border-color: rgba(184, 134, 11, 0.4); }
        .pq-card-compact:focus-visible { outline: 2px solid #B8860B; outline-offset: 2px; }
        /* In the cockpit rail the inputs card collapses to a single column
           and drops its centered max-width so it fits the 340px sticky rail. */
        .cockpit-rail .pq-input-cols { grid-template-columns: 1fr; }
      `}</style>
    </>
  );

  const headerJsx = (
    <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
          <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="tel:+16156560737" aria-label="Call Nick Peters at (615) 656-0737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span className="btn-label-mobile-hide">Call</span>
          </a>
          <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20pre-qual%20simulator%20and%20had%20a%20question." aria-label="Text Nick Peters at (615) 656-0737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="btn-label-mobile-hide">Text</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
        </div>
      </div>
    </div>
  );

  const introJsx = (
    <div style={{ textAlign: "center", marginBottom: 36 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 8 }}>What Can You Afford?</span>
      <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        Pre-Qual Simulator
        <PreQualIcon size={32} variant="navy" />
      </h1>
      <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>Enter your income and debts. See what you qualify for under each loan program — with their real DTI limits and mortgage insurance rules.</p>
    </div>
  );

  // The inputs card. `variant === 'rail'` drops the centered max-width and
  // tightens padding so it fits the 340px cockpit rail; legacy uses the
  // wider centered treatment that sits inside the tool-page-content wrapper.
  // Both variants share the navy gradient + gold top accent, mirroring the
  // calculator refresh's diagnostics-rail treatment.
  const renderInputsCard = (variant) => {
    const sharedCardStyle = {
      background: `linear-gradient(160deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`,
      borderTop: `3px solid ${P.gold}`,
      border: 'none',
      boxShadow: '0 4px 20px rgba(15, 37, 48, 0.18)',
    };
    const cardStyle = variant === "rail"
      ? { ...sharedCardStyle, padding: "20px", margin: 0 }
      : { ...sharedCardStyle, padding: "28px", marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" };
    return (
      <div className="content-card" style={cardStyle}>
        <div className="pq-input-cols">
          {/* Left column — Income, Debts & DTI */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <CalcInput label="Gross Monthly Income" value={grossIncome} onChange={setGrossIncome} prefix="$" step={250} comma labelColor={P.goldLight} />
            <CalcInput label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" step={50} comma labelColor={P.goldLight} />
            <p style={{ fontSize: 11, color: "rgba(250, 247, 242, 0.7)", lineHeight: 1.5, marginTop: -4 }}>Include: car, student loans, credit cards (min payments), personal loans, child support.</p>
            <button onClick={() => setShowStudentCalc(!showStudentCalc)} style={{
              display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              fontSize: 11, fontWeight: 600, color: P.goldLight, cursor: "pointer", fontFamily: F.body, padding: "0",
            }}>
              <span style={{ fontSize: 12 }}>🎓</span>
              {showStudentCalc ? "Hide Student Loan Calculator" : "Student Loan Payment Calculator"}
              <span style={{ fontSize: 10, transition: "transform 0.2s", transform: showStudentCalc ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
            </button>
            {showStudentCalc && (
              <div style={{ background: P.creamDark, borderRadius: 8, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, color: P.warmGray, marginBottom: 10, lineHeight: 1.5 }}>
                  For student loans currently at <strong>$0/mo</strong> due to deferment, forbearance, or income-driven repayment — lenders still count a payment.
                </p>
                <CalcInput label="Total Student Loan Balance" value={studentBalance} onChange={setStudentBalance} prefix="$" step={1000} comma />
                {studentBalance > 0 && (
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: P.white, borderRadius: 8, padding: "10px 14px" }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Qualifying Payment (0.5%)</span>
                      <span style={{ fontFamily: F.display, fontSize: 22, color: P.navy }}>{fmt(Math.round(studentBalance * 0.005))}/mo</span>
                    </div>
                    <button onClick={() => setMonthlyDebts(prev => prev + Math.round(studentBalance * 0.005))} style={{
                      padding: "8px 14px", borderRadius: 6, border: "none",
                      background: P.navy, color: "#fff", fontSize: 11, fontWeight: 600,
                      cursor: "pointer", fontFamily: F.body, whiteSpace: "nowrap",
                    }}>
                      + Add to Debts
                    </button>
                  </div>
                )}
                <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>
                  0.5% is the standard qualifying calc for deferred student loans. Use your actual payment if on an active repayment plan.
                </p>
              </div>
            )}
          </div>
          {/* Right column — Loan Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label htmlFor={termSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.goldLight }}>Loan Term</label>
              <select
                id={termSelectId}
                value={term}
                onChange={(e) => setTerm(parseInt(e.target.value))}
                style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                <option value={30}>30 years</option>
                <option value={15}>15 years</option>
              </select>
            </div>
            <div style={{ border: `1px solid ${P.creamDark}`, borderRadius: 10, padding: "14px 14px 10px", background: P.white }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.navy, display: "block", marginBottom: 10 }}>Down Payment</label>
              <div style={{ opacity: downMode === "pct" ? 1 : 0.3, pointerEvents: downMode === "pct" ? "auto" : "none", transition: "opacity 0.2s" }}>
                <CalcInput label="Percentage" value={downMode === "pct" ? downPct : ""} onChange={(v) => { setDownPct(v); }} suffix="%" step={1} min={0} max={100} />
              </div>
              <button onClick={() => {
                if (downMode === "pct") { setDownMode("dollar"); setDownDollarOverride(null); }
                else { setDownMode("pct"); setDownDollarOverride(null); }
              }} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
                padding: "7px 0", margin: "8px 0", borderRadius: 6, border: "none",
                background: P.gold, color: "#fff",
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.body,
              }}>
                Switch to {downMode === "pct" ? "Dollar Amount" : "Percentage"}
              </button>
              <div style={{ opacity: downMode === "dollar" ? 1 : 0.3, pointerEvents: downMode === "dollar" ? "auto" : "none", transition: "opacity 0.2s" }}>
                <CalcInput label="Dollar Amount" value={downMode === "dollar" && downDollarOverride ? downDollarOverride : ""} onChange={(v) => { setDownDollarOverride(v > 0 ? v : null); }} prefix="$" step={1000} comma />
              </div>
            </div>
          </div>
        </div>

        {/* Property location row */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid rgba(250, 247, 242, 0.15)` }}>
          <label htmlFor={stateSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.goldLight, display: "block", marginBottom: 6 }}>Property Location</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <select id={stateSelectId} value={taxState} onChange={(e) => setTaxState(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 32px 10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
              {Object.entries(SHARED_STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                <option key={code} value={code}>{s.name}</option>
              ))}
            </select>
            {metroList.length > 0 && (
              <select aria-label="County or metro tax area" value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 32px 10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                <option value="">State Avg ({stateData.rate}%)</option>
                {metroList.map((m) => (
                  <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>
                ))}
              </select>
            )}
          </div>
          <p style={{ fontSize: 10, color: "rgba(250, 247, 242, 0.6)", marginTop: 6 }}>Loan limits: FHA {fmt(loanLimits.fha)} · Conv {fmt(loanLimits.conv)} · VA {fmt(loanLimits.va)}. USDA uses an income cap (~$119,850 for 1-4 person households in most areas) instead of a loan limit.</p>
        </div>
      </div>
    );
  };

  // The navy per-program rate strip. Three variants:
  //   - 'rail'   → compact single-column treatment for the 340px cockpit rail
  //   - 'legacy' → centered 800px treatment used in the legacy stacked layout
  // Both share the navy gradient + gold top accent, mirroring the calculator
  // refresh's diagnostics-rail treatment.
  const renderRateStrip = (variant) => {
    const sharedStripStyle = {
      background: `linear-gradient(160deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`,
      borderRadius: 14,
      boxShadow: "0 4px 20px rgba(15, 37, 48, 0.18)",
      borderTop: `3px solid ${P.gold}`,
      position: "relative",
      overflow: "hidden",
    };
    const stripStyle = variant === "rail"
      ? { ...sharedStripStyle, padding: "16px 18px 18px", margin: 0 }
      : { ...sharedStripStyle, padding: "18px 28px 22px", maxWidth: 800, margin: "0 auto 32px" };

    const isRail = variant === "rail";
    const eyebrowSize = isRail ? 10 : 11;
    const disclaimerSize = isRail ? 10 : 11;
    const pillGap = isRail ? 6 : 8;

    return (
      <div style={stripStyle}>
        {/* Subtle gold radial glow in top-right corner for warmth */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 180,
          height: "100%",
          background: "radial-gradient(circle at top right, rgba(212, 168, 67, 0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8, position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: eyebrowSize, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>{isRail ? "Rates by Program" : "Interest Rates by Program"}</span>
          {ratesLoaded && (
            <span style={{ fontSize: eyebrowSize, color: P.goldLight, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: 0.9 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: P.goldLight,
                display: "inline-block",
                boxShadow: "0 0 6px rgba(212, 168, 67, 0.6)",
                animation: "rate-pulse 2s ease-in-out infinite",
              }} />
              {isRail ? `Live · ${rateSource}` : `Live rates loaded · ${rateSource}`}
            </span>
          )}
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: disclaimerSize, color: P.cream, opacity: 0.65, marginBottom: isRail ? 10 : 14, lineHeight: 1.5, position: "relative", zIndex: 1 }}>
          {isRail
            ? "National averages via Mortgage News Daily, rounded to 0.125%. Adjust to match your quote."
            : "National averages via Mortgage News Daily, rounded to the nearest 0.125%. Your actual rate may differ — adjust below to match your quote."}
        </p>

        {/* Rate pills — RateInput component unchanged, cream pills sit on navy */}
        <div style={{ display: "flex", flexDirection: "column", gap: pillGap, position: "relative", zIndex: 1 }}>
          {[
            { label: "Conventional", rate: convRate, setRate: setConvRate, color: P.navy },
            { label: "FHA", rate: fhaRate, setRate: setFhaRate, color: "#8B6914" },
            { label: "VA", rate: vaRate, setRate: setVaRate, color: P.sage },
            { label: "USDA", rate: usdaRate, setRate: setUsdaRate, color: PROGRAM_COLORS.USDA },
          ].map((p) => (
            <RateInput key={p.label} label={p.label} rate={p.rate} setRate={p.setRate} color={p.color} />
          ))}
        </div>

        {!ratesLoaded && (
          <p style={{ fontSize: disclaimerSize, color: P.cream, opacity: 0.6, marginTop: isRail ? 8 : 10, fontStyle: "italic", position: "relative", zIndex: 1 }}>Adjust rates manually or they'll auto-populate when live data loads.</p>
        )}
      </div>
    );
  };

  const geekTipJsx = (
    <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
          <p style={{ marginBottom: 8 }}>
            <strong>Why the numbers differ:</strong> FHA uses two separate DTI caps — a 46.99% front-end (housing payment alone can't exceed this) and a 56.99% back-end (housing + all debts combined). With low debts, the front-end is your ceiling; as debts rise, the back-end takes over. Conventional uses a single 49.99% cap for both front-end and back-end — your housing payment and your total debts must each stay under this threshold. VA allows up to 50% back-end with no monthly MI — often the strongest option for eligible borrowers. USDA caps tighter — 34% front-end, 44.99% back-end — and adds a $119,850/yr household income limit (1-4 person, most areas). Those DTI ceilings are stretch maximums; USDA's standard GUS-Accept threshold is 29%/41%, and going above requires compensating factors.
          </p>
          <p>
            <strong>This is a simulator, not a commitment.</strong> Actual pre-approval depends on credit score, reserves, employment history, and property type. Use these numbers to guide your house hunting — then call me for the real thing.
          </p>
        </div>
      </div>
    </div>
  );

  const disclaimerJsx = (
    <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
      This simulator is for educational purposes only. Contact me at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized pre-approval. NMLS# 1119524.
    </p>
  );

  // ===================================================================
  // COCKPIT BRANCH — desktop ≥1100px renders the rail+canvas layout.
  // The legacy stacked layout below is used at <1100px (tablets/mobile).
  // ===================================================================
  if (isCockpit) {
    const railJsx = (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {renderInputsCard("rail")}
        {renderRateStrip("rail")}
      </div>
    );
    const canvasJsx = (
      <>
        <div className="pq-cards-grid pq-cards-grid--compact">
          {cockpitResults.map((p, i) => (
            <ProgramResultCardCompact
              key={i}
              prog={p}
              selected={selectedProg && selectedProg.name === p.name}
              onSelect={() => setSelectedProgram(p.name)}
            />
          ))}
        </div>
        <PreQualDetailPanel
          prog={selectedProg}
          grossMonthlyIncome={grossIncome}
          monthlyDebts={monthlyDebts}
          vaUsage={vaUsage}
          setVaUsage={setVaUsage}
          vaUsageSelectId={vaUsageSelectId}
          dtiBarHeight={28}
          dtiLayout="stacked"
          calculatorHref={calculatorHref}
        />
        {geekTipJsx}
      </>
    );

    return (
      <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
        {sharedHead}
        {headerJsx}
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 24px 0" }}>
          {introJsx}
        </div>
        <CockpitShell rail={railJsx} canvas={canvasJsx} />
        <div style={{ background: P.creamDark, padding: "24px 24px 64px" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            {disclaimerJsx}
          </div>
        </div>
        <MobileToolbar />
      </main>
    );
  }

  // ===================================================================
  // LEGACY STACKED LAYOUT (<1100px) — preserved unchanged in behavior;
  // inline JSX has been lifted into the consts above. The cards grid
  // and per-program cross-link IIFE remain inline since they're
  // legacy-only and not reused.
  // ===================================================================
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      {sharedHead}
      {headerJsx}

      <div className="tool-page-content" style={{ padding: "40px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        {introJsx}
        {renderInputsCard("legacy")}
        {renderRateStrip("legacy")}
      </div>

      {/* RESULTS ZONE — deeper cream background extends from divider down to end of page */}
      <div style={{ background: P.creamDark, paddingBottom: 64 }}>
        <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto" }}>
          {/* Section divider — Your Results (background pill now matches the new deeper bg) */}
          <div style={{ margin: "40px auto 24px", maxWidth: 800, position: "relative", textAlign: "center" }}>
            <div style={{ height: 1, background: `linear-gradient(to right, transparent, rgba(155, 148, 136, 0.3), transparent)`, position: "absolute", left: 0, right: 0, top: "50%" }} />
            <div style={{ position: "relative", display: "inline-block", background: P.creamDark, padding: "0 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted }}>↓ Your Results ↓</span>
              <p style={{ fontSize: 13, color: P.warmGray, marginTop: 6, maxWidth: 480 }}>Tap any card to send that scenario to the calculator</p>
            </div>
          </div>

        {/* Program result cards */}
        <div className="pq-cards-grid">
          {results.map((prog, i) => {
            if (!prog.eligible && prog.ineligibleReason) {
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", opacity: 0.6 }}>
                  <div style={{ background: P.warmGrayLight, padding: "20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 24, color: "#fff" }}>Ineligible</span>
                  </div>
                  <div style={{ padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>⚠️</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 6 }}>{prog.ineligibleReason.title}</p>
                    <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5 }}>{prog.ineligibleReason.body}</p>
                    {prog.name === "USDA" && (
                      <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 12, lineHeight: 1.5 }}>
                        USDA measures total household income (all adults 18+, even non-borrowers). Consult an MLO to verify your household total before relying on this estimate.
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            const bestPrice = Math.max(...results.filter(r => r.eligible && r.maxPrice > 0).map(r => r.maxPrice));
            const isBest = prog.maxPrice === bestPrice && prog.maxPrice > 0;
            const isSelected = selectedProgram === prog.name;

            return (
              <div key={i} className="content-card" onClick={() => setSelectedProgram(isSelected ? null : prog.name)} style={{
                overflow: "hidden", position: "relative", cursor: "pointer",
                border: isSelected ? `3px solid ${P.gold}` : `3px solid transparent`,
                boxShadow: isSelected ? `0 0 0 4px rgba(184,134,11,0.15), 0 8px 30px rgba(0,0,0,0.12)` : undefined,
                transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
              }}>
                {isSelected && (
                  <span style={{ position: "absolute", top: 8, left: 8, zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "3px 10px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>✓ Selected</span>
                )}
                {/* Header */}
                <div style={{ background: prog.color, padding: "20px", textAlign: "center", position: "relative" }}>
                  {isBest && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: "#fff", color: prog.color, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "3px 8px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>★ Most Power</span>
                  )}
                  <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{prog.name} · Max Purchase</span>
                  <span style={{ fontFamily: F.display, fontSize: 34, color: "#fff" }}>{fmt(prog.maxPrice)}</span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {Number(prog.rate).toFixed(3)}% · {prog.overLimit ? "capped at loan limit" : prog.cappedByMinDown ? `capped at ${prog.minDown}% min down` : `${prog.bindingConstraint} DTI binding`}
                  </span>
                  {prog.overLimit && (
                    <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "3px 10px", borderRadius: 10 }}>
                      ⚠️ Loan limit: {fmt(prog.loanLimit)}
                    </span>
                  )}
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {prog.name === "USDA" && (
                    <div style={{
                      background: "rgba(160, 82, 45, 0.08)",
                      borderLeft: `3px solid ${PROGRAM_COLORS.USDA}`,
                      padding: "10px 14px",
                      marginBottom: 14,
                    }}>
                      <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                        <strong style={{ color: PROGRAM_COLORS.USDA }}>Household income, not just yours.</strong> USDA counts gross income from all adults (18+) in the household, even those not on the loan. Verify your total against the $119,850 limit (1-4 person, most areas) with an MLO before relying on this estimate.
                      </p>
                    </div>
                  )}
                  {/* DTI breakdown — two stacked bars */}
                  <div style={{ marginBottom: 14 }}>
                    {/* Front-End bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 4 }}>
                        <span>Front-End DTI {prog.bindingConstraint === "front-end" && prog.frontMax ? "← binding" : ""}</span>
                        <span style={{ fontWeight: 700, color: prog.frontMax && prog.bindingConstraint === "front-end" ? prog.color : P.warmGrayLight }}>
                          {prog.frontMax ? `${((prog.maxPayment / grossIncome) * 100).toFixed(1)}% / ${(prog.frontMax * 100).toFixed(1)}%` : "N/A (VA)"}
                        </span>
                      </div>
                      <div style={{ height: 6, background: P.creamDark, borderRadius: 3, overflow: "hidden" }}>
                        {prog.frontMax ? (
                          <div style={{ height: "100%", width: `${Math.min(((prog.maxPayment / grossIncome) / prog.frontMax) * 100, 100)}%`, background: prog.color, borderRadius: 3, transition: "width 0.3s" }} />
                        ) : (
                          <div style={{ height: "100%", width: "100%", background: `repeating-linear-gradient(45deg, ${P.creamDark}, ${P.creamDark} 4px, ${P.cream} 4px, ${P.cream} 8px)`, borderRadius: 3 }} />
                        )}
                      </div>
                    </div>
                    {/* Back-End bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 4 }}>
                        <span>Back-End DTI {prog.bindingConstraint === "back-end" ? "← binding" : ""}</span>
                        <span style={{ fontWeight: 700, color: prog.bindingConstraint === "back-end" ? prog.color : P.warmGrayLight }}>
                          {prog.currentBackDTI.toFixed(1)}% / {(prog.backMax * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: 6, background: P.creamDark, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((prog.currentBackDTI / (prog.backMax * 100)) * 100, 100)}%`, background: prog.color, borderRadius: 3, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  </div>

                  {/* Max breakdown */}
                  <div style={{ marginBottom: 12 }}>
                    {[
                      { label: "Max Housing Payment", val: fmt(prog.maxPayment), bold: true },
                      ...(monthlyDebts > 0 ? [{ label: "Housing + Debts", val: fmt(prog.maxPayment + monthlyDebts), sub: `of ${fmt(prog.backTotalMax)} back-end max` }] : []),
                      { label: "Loan Amount", val: fmt(prog.maxLoan), warn: prog.overLimit },
                      ...(prog.name === "USDA"
                        ? [{ label: "Income Limit", val: "$119,850/yr", sub: "1-4 ppl, most areas" }]
                        : [{ label: "Loan Limit", val: fmt(prog.loanLimit), dim: !prog.overLimit }]),
                      ...(prog.upfrontFee > 0 ? [{ label: `Financed Fee (${prog.upfrontFee}%)`, val: fmt(prog.maxLoan * (prog.upfrontFee / 100)) }] : []),
                      { label: "Down Payment", val: fmt(prog.actualDownAmt), sub: `${prog.actualDownPctDisplay}%` },
                      { label: prog.miLabel, val: prog.miRate > 0 ? fmt((prog.maxLoan * prog.miRate / 100) / 12) + "/mo" : "—" },
                    ].map((r, ri) => (
                      <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11, color: r.dim ? P.creamDark : P.warmGray, borderBottom: `1px solid ${P.cream}`, opacity: r.dim ? 0.6 : 1 }}>
                        <span>{r.label}</span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: r.bold ? 700 : 600, color: r.warn ? "#C0392B" : r.bold ? prog.color : r.dim ? P.warmGrayLight : P.text }}>{r.val}</span>
                          {r.sub && <span style={{ display: "block", fontSize: 9, color: P.warmGrayLight }}>{r.sub}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {prog.name === "VA" && (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: 12, padding: "10px 12px", background: P.creamDark, borderRadius: 8 }}>
                      <label htmlFor={vaUsageSelectId} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>VA Eligibility</label>
                      <select id={vaUsageSelectId} value={vaUsage} onChange={(e) => setVaUsage(e.target.value)}
                        style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.white, padding: "7px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                        <option value="first">First-Time Use</option>
                        <option value="subsequent">Subsequent Use</option>
                        <option value="exempt">Exempt (Disability)</option>
                      </select>
                    </div>
                  )}

                  <p style={{ fontSize: 10, color: P.warmGrayLight, lineHeight: 1.5, fontStyle: "italic" }}>{prog.notes}</p>

                  {/* APR */}
                  {prog.apr > 0 && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR at Max Purchase</span>
                      <span style={{ fontFamily: F.display, fontSize: 22, color: prog.color }}>{prog.apr.toFixed(3)}%</span>
                      <p style={{ fontSize: 9, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4 }}>Note rate {Number(prog.rate).toFixed(3)}% · Includes lender fees{prog.upfrontFee > 0 ? `, ${prog.name === "FHA" ? "UFMIP" : prog.name === "USDA" ? "USDA Guarantee Fee" : "VA funding fee"}` : ""}{prog.miRate > 0 ? ", monthly MI" : ""}</p>
                      <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cross-link to calculator */}
        {(() => {
          const eligible = results.filter(r => r.eligible && r.maxPrice > 0);
          const selected = selectedProgram ? eligible.find(r => r.name === selectedProgram) : null;
          const target = selected || eligible.reduce((a, b) => (a && a.maxPrice > b.maxPrice ? a : b), null);
          const targetPrice = target ? target.maxPrice : 0;
          const targetName = target ? target.name : "";
          const programParam = target ? `&program=${encodeURIComponent(target.name)}` : "";
          const calcUrl = `/calculator?price=${targetPrice > 0 ? targetPrice : 350000}&down=${downPct}&term=${term}${programParam}`;
          return (
            <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <a href={calcUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                <MortgageCalcIcon size={16} variant="navy" /> {targetPrice > 0 ? `Run ${targetName} ${fmt(targetPrice)}` : "Open the Calculator"} →
              </a>
              {!selectedProgram && eligible.length > 1 && (
                <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 8, fontStyle: "italic" }}>Tap a card above to choose a different scenario</p>
              )}
            </div>
            </>
          );
        })()}

        {disclaimerJsx}
        </div>
      </div>
      <MobileToolbar />
    </main>
  );
}
