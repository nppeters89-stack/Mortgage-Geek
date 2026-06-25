import { useState, useEffect, useMemo, useId } from "react";
import { P, F, PROGRAM_COLORS, globalCSS } from "../theme";
import { SHARED_STATE_TAX_RATES, DEFAULT_LIMITS } from "../data/taxRates";
import { fmt } from "../utils/format";
import { generateAmortData, formatPayoff, calculateAPR } from "../utils/math";
import { MortgageCalcIcon, CompareIcon } from "../components/icons";
import { MobileToolbar } from "../components/MobileToolbar";
import { CalcInput } from "../components/CalcInput";
import { RateInput } from "../components/RateInput";
import { SEOHead } from "../components/SEOHead";
import { webApplicationSchema } from "../utils/schema";
import { useIsCockpit, usePieDiameter } from "../utils/hooks";
import { CockpitShell } from "../components/cockpit/CockpitShell";
import { ProgramCardCompact } from "../components/calculator/ProgramCardCompact";
import { DetailPanel } from "../components/calculator/DetailPanel";
import { PaymentPieChart } from "../components/calculator/PaymentPieChart";

const ALL_PROGRAMS = ["Conventional", "FHA", "VA", "USDA"];

export function CalculatorPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const paramRate = parseFloat(params.get("rate"));
  const paramProgram = params.get("program");
  const [homePrice, setHomePrice] = useState(() => { const v = parseFloat(params.get("price")); return v > 0 ? v : 350000; });
  const [convRate, setConvRate] = useState(paramProgram === "Conventional" && paramRate > 0 ? paramRate : 6.75);
  const [convRate30Api, setConvRate30Api] = useState(6.75);
  const [convRate15Api, setConvRate15Api] = useState(6.0);
  const [fhaRate, setFhaRate] = useState(paramProgram === "FHA" && paramRate > 0 ? paramRate : 6.25);
  const [vaRate, setVaRate] = useState(paramProgram === "VA" && paramRate > 0 ? paramRate : 6.25);
  const [usdaRate, setUsdaRate] = useState(paramProgram === "USDA" && paramRate > 0 ? paramRate : 6.25);
  // Per-program market baselines — fixed to the auto-populated rate from
  // MND so the rate slider has a stable ±2.5% window that doesn't drift
  // as the user adjusts. Updated only when fresh API data lands or
  // (for Conv) when the term toggles between 15 and 30.
  const [fhaRateApi, setFhaRateApi] = useState(6.25);
  const [vaRateApi, setVaRateApi] = useState(6.25);
  const [usdaRateApi, setUsdaRateApi] = useState(6.25);
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 3.5; });
  const [downDollarOverride, setDownDollarOverride] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [saveToast, setSaveToast] = useState(null);
  const isCockpit = useIsCockpit();
  const pieDiameter = usePieDiameter();
  const [visiblePrograms, setVisiblePrograms] = useState(() => {
    try {
      const saved = localStorage.getItem("mg_calc_visible_programs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0
            && parsed.every(n => ALL_PROGRAMS.includes(n))) {
          return parsed;
        }
      }
    } catch {}
    return ALL_PROGRAMS;
  });

  // Force URL-param program into the visible set (one-time, on mount)
  useEffect(() => {
    if (paramProgram && ALL_PROGRAMS.includes(paramProgram)
        && !visiblePrograms.includes(paramProgram)) {
      setVisiblePrograms(prev => ALL_PROGRAMS.filter(n => prev.includes(n) || n === paramProgram));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem("mg_calc_visible_programs", JSON.stringify(visiblePrograms));
    } catch {}
  }, [visiblePrograms]);

  // Clear selectedProgram if it's been hidden
  useEffect(() => {
    if (selectedProgram && !visiblePrograms.includes(selectedProgram)) {
      setSelectedProgram(null);
    }
  }, [visiblePrograms, selectedProgram]);

  const toggleProgram = (name) => {
    setVisiblePrograms(prev => {
      if (prev.includes(name)) {
        if (prev.length === 1) return prev; // never empty
        return prev.filter(n => n !== name);
      }
      // preserve canonical order rather than append-order
      return ALL_PROGRAMS.filter(n => prev.includes(n) || n === name);
    });
  };
  const [extraConfig, setExtraConfig] = useState({});
  const getExtraConfig = (programName) => extraConfig[programName] || { enabled: false, strategy: "monthly", amount: 0 };
  const updateExtraConfig = (programName, updates) => {
    setExtraConfig((prev) => ({ ...prev, [programName]: { ...getExtraConfig(programName), ...updates } }));
  };
  useEffect(() => { setDownDollarOverride(null); }, [homePrice]); // reset override when price changes

  const handleDownPctChange = (v) => { setDownPct(v); setDownDollarOverride(null); };
  const handleDownDollarChange = (v) => {
    setDownDollarOverride(v);
    if (homePrice > 0) setDownPct(Math.round((v / homePrice) * 10000) / 100);
  };
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville");
  const [vaUsage, setVaUsage] = useState("first");
  const paramHoa = parseFloat(params.get("hoa"));
  const [showHoa, setShowHoa] = useState(paramHoa > 0);
  const [hoa, setHoa] = useState(paramHoa > 0 ? paramHoa : 0);


  const stateData = SHARED_STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const loanLimits = selectedMetro?.limits || stateData?.limits || DEFAULT_LIMITS;
  const [taxes, setTaxes] = useState(Math.round((350000 * (0.95 / 100)) / 12));
  const taxesInputId = useId();
  const termSelectId = useId();
  const taxStateSelectId = useId();
  const vaUsageSelectId = useId();
  useEffect(() => { setTaxes(Math.round((homePrice * (taxRate / 100)) / 12)); }, [taxState, taxMetro, homePrice]);
  // Reset metro when state changes
  useEffect(() => {
    const newMetros = SHARED_STATE_TAX_RATES[taxState]?.metros;
    if (newMetros && newMetros.length > 0) setTaxMetro(newMetros[0].name);
    else setTaxMetro("");
  }, [taxState]);

  const [insurance, setInsurance] = useState(Math.round((350000 * 0.0035) / 12));
  useEffect(() => { setInsurance(Math.round((homePrice * 0.0035) / 12)); }, [homePrice]);

  // Override taxes/insurance from URL params (e.g. loaded from comparison tool)
  useEffect(() => {
    const pTax = parseFloat(params.get("tax"));
    const pIns = parseFloat(params.get("insurance"));
    if (pTax > 0) setTimeout(() => setTaxes(pTax), 0);
    if (pIns > 0) setTimeout(() => setInsurance(pIns), 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);

  // Round to nearest 0.125%, then add a 0.25% buffer so the starting
  // auto-populated rate runs conservative (above true market). Users
  // can drag the slider down to match their actual quote.
  const roundRate = (r) => Math.round(r / 0.125) * 0.125 + 0.25;

  // Fetch live rates on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv30 = find("30-year fixed");
          const conv15 = find("15-year fixed");
          const fha = find("fha");
          const va = find("va");
          const r30 = conv30 ? roundRate(parseFloat(conv30.rate)) : 6.75;
          const r15 = conv15 ? roundRate(parseFloat(conv15.rate)) : 6.0;
          setConvRate30Api(r30);
          setConvRate15Api(r15);
          if (!(paramProgram === "Conventional" && paramRate > 0)) setConvRate(term === 15 ? r15 : r30);
          if (fha) {
            const fhaParsed = roundRate(parseFloat(fha.rate));
            setFhaRateApi(fhaParsed);
            setUsdaRateApi(fhaParsed);
            if (!(paramProgram === "FHA" && paramRate > 0)) setFhaRate(fhaParsed);
            // USDA tracks FHA from MND (MND doesn't publish a separate USDA rate)
            if (!(paramProgram === "USDA" && paramRate > 0)) setUsdaRate(fhaParsed);
          }
          if (va) {
            const vaParsed = roundRate(parseFloat(va.rate));
            setVaRateApi(vaParsed);
            if (!(paramProgram === "VA" && paramRate > 0)) setVaRate(vaParsed);
          }
          setRateSource(data.date || "today");
          setRatesLoaded(true);
        }
      } catch (e) { /* fail silently, use defaults */ }
    })();
  }, []);

  // Switch conv rate when term changes
  useEffect(() => {
    if (ratesLoaded) {
      setConvRate(term === 15 ? convRate15Api : convRate30Api);
    }
  }, [term]);

  const downAmt = downDollarOverride !== null ? downDollarOverride : homePrice * (downPct / 100);
  const baseLoan = homePrice - downAmt;

  // Conventional
  const convLoan = baseLoan;
  const convMiRate = downPct < 5 ? 0.52 : downPct < 10 ? 0.37 : downPct < 20 ? 0.27 : 0;
  const convMI = (baseLoan * (convMiRate / 100)) / 12;
  const { monthly: convPI } = useMemo(() => generateAmortData(convLoan, convRate, term), [convLoan, convRate, term]);
  const convTotal = convPI + convMI + taxes + insurance + hoa;

  // FHA
  const fhaUpfront = baseLoan * 0.0175;
  const fhaLoan = baseLoan + fhaUpfront;
  const fhaMiRate = downPct < 5 ? 0.55 : 0.50;
  const fhaMI = (baseLoan * (fhaMiRate / 100)) / 12;
  const { monthly: fhaPI } = useMemo(() => generateAmortData(fhaLoan, fhaRate, term), [fhaLoan, fhaRate, term]);
  const fhaTotal = fhaPI + fhaMI + taxes + insurance + hoa;

  // VA - Funding fee varies by usage type and down payment
  const vaFeeRate = useMemo(() => {
    if (vaUsage === "exempt") return 0;
    if (downPct >= 10) return 1.25;
    if (downPct >= 5) return 1.50;
    // Less than 5% down
    return vaUsage === "first" ? 2.15 : 3.30;
  }, [vaUsage, downPct]);
  const vaFee = baseLoan * (vaFeeRate / 100);
  const vaLoan = baseLoan + vaFee;
  const { monthly: vaPI } = useMemo(() => generateAmortData(vaLoan, vaRate, term), [vaLoan, vaRate, term]);
  const vaTotal = vaPI + taxes + insurance + hoa;

  const vaUsageLabels = { first: "First-Time Use", subsequent: "Subsequent Use", exempt: "Exempt (Disability)" };

  // Lender fees for APR calculation (matches Cash to Close simulator)
  const calcLenderFees = 995 + 910 + 800 + 1000 + 300 + 15 + 80; // underwriting + processing + appraisal + verification + credit + flood + tax service

  // APR per program — includes lender fees, upfront MI, and monthly MI per Reg Z §1026.4(b)(5)
  const convAprCharges = calcLenderFees;
  const convAprMI = downPct < 20 ? (baseLoan * (convMiRate / 100)) / 12 : 0;
  const convAprMiMonths = downPct < 20 ? 120 : 0;
  const convAPR = calculateAPR(convLoan, convAprCharges, convRate, term, convAprMI, convAprMiMonths);

  const fhaAprCharges = calcLenderFees + fhaUpfront;
  const fhaAprMI = (baseLoan * (fhaMiRate / 100)) / 12;
  const fhaAprMiMonths = downPct < 10 ? term * 12 : 132;
  const fhaAPR = calculateAPR(fhaLoan, fhaAprCharges, fhaRate, term, fhaAprMI, fhaAprMiMonths);

  const vaAprCharges = calcLenderFees + vaFee;
  const vaAPR = calculateAPR(vaLoan, vaAprCharges, vaRate, term, 0, 0);

  // USDA — Rural Development guaranteed loan (FY2026 fees)
  const usdaUpfront = baseLoan * 0.01;
  const usdaLoan = baseLoan + usdaUpfront;
  const usdaMiRate = 0.35;
  const usdaMI = (baseLoan * (usdaMiRate / 100)) / 12;
  const { monthly: usdaPI } = useMemo(
    () => generateAmortData(usdaLoan, usdaRate, term),
    [usdaLoan, usdaRate, term]
  );
  const usdaTotal = usdaPI + usdaMI + taxes + insurance + hoa;

  const usdaAprCharges = calcLenderFees + usdaUpfront;
  const usdaAprMI = (baseLoan * (usdaMiRate / 100)) / 12;
  const usdaAprMiMonths = term * 12; // life of loan
  const usdaAPR = calculateAPR(
    usdaLoan, usdaAprCharges, usdaRate, term, usdaAprMI, usdaAprMiMonths
  );

  const programs = [
    {
      name: "Conventional", color: PROGRAM_COLORS.Conventional, loan: convLoan, pi: convPI, mi: convMI,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : null,
      upfront: 0, upfrontLabel: null, total: convTotal, rate: convRate, apr: convAPR,
      note: downPct >= 20 ? "No PMI required" : `PMI est. based on 740+ FICO, <43% DTI`,
      eligible: downPct >= 3, minDown: 3,
      loanLimit: loanLimits.conv, overLimit: baseLoan > loanLimits.conv,
      ineligibleReason: downPct < 3 ? {
        title: "Minimum 3% Down Required",
        body: `Conventional loans require a minimum down payment of 3% (${fmt(homePrice * 0.03)}). Increase your down payment to see Conventional payment details.`,
      } : null,
    },
    {
      name: "FHA", color: PROGRAM_COLORS.FHA, loan: fhaLoan, pi: fhaPI, mi: fhaMI,
      miLabel: `MIP (${fhaMiRate}%)`,
      upfront: fhaUpfront, upfrontLabel: "UFMIP (1.75%)", total: fhaTotal, rate: fhaRate, apr: fhaAPR,
      note: downPct < 10 ? "MIP for life of loan" : "MIP removable after 11 years",
      eligible: downPct >= 3.5, minDown: 3.5,
      loanLimit: loanLimits.fha, overLimit: baseLoan > loanLimits.fha,
      ineligibleReason: downPct < 3.5 ? {
        title: "Minimum 3.5% Down Required",
        body: `FHA loans require a minimum down payment of 3.5% (${fmt(homePrice * 0.035)}). Increase your down payment to see FHA payment details.`,
      } : null,
    },
    {
      name: "VA", color: PROGRAM_COLORS.VA, loan: vaLoan, pi: vaPI, mi: 0,
      miLabel: null,
      upfront: vaFee, upfrontLabel: vaFeeRate > 0 ? `Funding Fee (${vaFeeRate}%)` : null, total: vaTotal, rate: vaRate, apr: vaAPR,
      note: vaUsage === "exempt"
        ? "Funding fee waived — service-connected disability"
        : `No monthly MI — ${vaUsageLabels[vaUsage].toLowerCase()}, ${downPct >= 10 ? "10%+ down" : downPct >= 5 ? "5–9.99% down" : "<5% down"}`,
      isVA: true, eligible: true, minDown: 0,
      loanLimit: loanLimits.va, overLimit: baseLoan > loanLimits.va,
      ineligibleReason: null,
    },
    {
      name: "USDA", color: PROGRAM_COLORS.USDA, loan: usdaLoan, pi: usdaPI, mi: usdaMI,
      miLabel: `Annual Fee (${usdaMiRate}%)`,
      upfront: usdaUpfront, upfrontLabel: "Guarantee Fee (1.00%)",
      total: usdaTotal, rate: usdaRate, apr: usdaAPR,
      note: "Annual fee for life of loan · subject to property + income eligibility",
      eligible: term === 30, minDown: 0,
      loanLimit: null, overLimit: false,
      ineligibleReason: term !== 30 ? {
        title: "USDA 30-Year Only",
        body: "USDA loans are only available as 30-year fixed-rate mortgages. Switch the loan term to 30 years to see USDA payment details.",
      } : null,
    },
  ];

  const visibleProgramsList = programs.filter(p => visiblePrograms.includes(p.name));
  const overLimitPrograms = programs.filter(p => p.overLimit && p.eligible);
  const countyLabel = selectedMetro ? selectedMetro.name : (stateData ? `${stateData.name} default` : "county");

  const eligibleTotals = visibleProgramsList.filter(p => p.eligible).map(p => p.total);
  const lowestTotal = eligibleTotals.length > 0 ? Math.min(...eligibleTotals) : 0;

  // Cockpit-only: default-select the cheapest eligible program when nothing
  // is selected (or the prior selection has been hidden). We never auto-follow
  // lowestTotal recomputes — once the user has a pick, it stays put.
  useEffect(() => {
    if (!isCockpit) return;
    if (selectedProgram && visiblePrograms.includes(selectedProgram)) return;
    const cheapest = visibleProgramsList.find(p => p.eligible && !p.overLimit && p.total === lowestTotal);
    if (cheapest) setSelectedProgram(cheapest.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCockpit, lowestTotal, visiblePrograms, selectedProgram]);

  const selectedProg = selectedProgram ? programs.find(p => p.name === selectedProgram && p.eligible) : null;
  const saveScenario = () => {
    if (!selectedProg) return;
    const STORAGE_KEY = "mg_compare_scenarios";
    let saved = [];
    try { const raw = localStorage.getItem(STORAGE_KEY); saved = raw ? JSON.parse(raw) : []; } catch {}
    if (saved.length >= 3) {
      setSaveToast({ type: "error", msg: "Comparison is full (3 max). Remove one first." });
      setTimeout(() => setSaveToast(null), 4000);
      return;
    }
    const scenario = {
      id: Date.now(),
      program: selectedProg.name,
      color: selectedProg.color,
      homePrice, downPct, downAmt, term, rate: selectedProg.rate,
      baseLoan, totalLoan: selectedProg.loan,
      upfront: selectedProg.upfront || 0,
      upfrontLabel: selectedProg.upfrontLabel || null,
      loan: selectedProg.loan, pi: selectedProg.pi, mi: selectedProg.mi,
      tax: taxes, insurance, hoa: hoa > 0 ? hoa : 0, total: selectedProg.total, apr: selectedProg.apr,
    };
    saved.push(scenario);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
    setSaveToast({ type: "success", msg: `${selectedProg.name} saved! ${saved.length} of 3 in comparison.` });
    setTimeout(() => setSaveToast(null), 4000);
  };

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <SEOHead
        title="Mortgage Calculator — Compare Conventional, FHA, VA, USDA | Mortgage Geek"
        description="Calculate monthly payments and see how Conventional, FHA, VA, and USDA loans compare for the same home. Includes PMI, MIP, USDA fees, and live rates."
        path="/calculator"
        schema={webApplicationSchema({
          title: "Mortgage Calculator — Mortgage Geek",
          description: "Calculate monthly payments and compare Conventional, FHA, VA, and USDA loans side by side.",
          url: "https://mortgagegeek.ai/calculator",
        })}
      />
      <style>{globalCSS}{`
        .calc-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .calc-cards-grid { display: grid; gap: 16px; margin-bottom: 32px; max-width: 1100px; margin-left: auto; margin-right: auto; }
        .calc-cards-grid[data-count="1"] { grid-template-columns: minmax(280px, 380px); justify-content: center; }
        .calc-cards-grid[data-count="2"] { grid-template-columns: repeat(2, minmax(0, 380px)); justify-content: center; max-width: 800px; }
        .calc-cards-grid[data-count="3"] { grid-template-columns: repeat(3, 1fr); max-width: 900px; }
        .calc-cards-grid[data-count="4"] { grid-template-columns: repeat(4, 1fr); }
        .calc-dp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .calc-tax-group { background: ${P.cream}; border: 1px solid rgba(207, 51, 56, 0.25); border-radius: 10px; padding: 12px 14px 10px; display: flex; flex-direction: column; gap: 8px; }
        .calc-tax-group-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${P.textLight}; }
        .calc-program-toggle { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; max-width: 1100px; margin: 0 auto 24px; padding: 0 4px; }
        .calc-toggle-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-right: 4px; }
        .calc-toggle-pill { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 16px; min-height: 36px; border-radius: 50px; border: 1.5px solid; font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s; }
        .calc-toggle-pill:not(:disabled):hover { transform: translateY(-1px); }
        .calc-toggle-pill:not(:disabled):active { transform: translateY(0); }
        @media (max-width: 1100px) {
          .calc-cards-grid[data-count="3"],
          .calc-cards-grid[data-count="4"] {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            max-width: 700px;
          }
        }
        @media (max-width: 700px) {
          .calc-input-cols { grid-template-columns: 1fr; }
          .calc-cards-grid,
          .calc-cards-grid[data-count="1"],
          .calc-cards-grid[data-count="2"],
          .calc-cards-grid[data-count="3"],
          .calc-cards-grid[data-count="4"] {
            grid-template-columns: 1fr;
            max-width: none;
          }
          .calc-cards-grid[data-count="1"] { justify-content: stretch; }
          .calc-toggle-pill { min-height: 44px; padding: 10px 18px; font-size: 14px; flex: 1 1 calc(50% - 4px); }
          .calc-program-toggle { justify-content: center; }
          .calc-toggle-label { flex-basis: 100%; text-align: center; margin-right: 0; margin-bottom: 4px; }
        }

        /* Cockpit additions — desktop ≥1100px only (gated by isCockpit hook). */
        .calc-cockpit-cards { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 0; }
        .calc-cockpit-cards[data-count="1"] { grid-template-columns: minmax(0, 1fr); }
        .calc-cockpit-cards[data-count="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .calc-cockpit-cards[data-count="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .calc-detail-panel-body { display: grid; grid-template-columns: 1fr; gap: 20px; padding: 24px 28px 28px; }
        @media (min-width: 1100px) {
          .calc-detail-panel-body {
            grid-template-columns: minmax(240px, 300px) 1fr;
            align-items: start;
            gap: 28px;
          }
        }
        .calc-detail-panel { animation: calc-detail-fade 120ms ease-out; }
        @keyframes calc-detail-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .calc-cockpit-cards > .calc-compact-card { animation: calc-card-enter 280ms ease-out; }
        @keyframes calc-card-enter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .calc-detail-panel,
          .calc-cockpit-cards > .calc-compact-card { animation: none; }
        }
      `}</style>

      {/* Calculator header */}
      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--light" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" aria-label="Call Nick Peters at (615) 656-0737" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: P.gold, color: "#fff",
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20mortgage%20calculator%20and%20had%20a%20question." aria-label="Text Nick Peters at (615) 656-0737" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: "transparent", color: P.navy,
              border: `1px solid ${P.creamDark}`,
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      {!isCockpit && (
      <>
      <div className="tool-page-content" style={{ padding: "40px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 8 }}>Side-by-Side Comparison</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            Mortgage Calculator
            <MortgageCalcIcon size={26} />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>One set of inputs, four loan programs. See how Conventional, FHA, VA, and USDA stack up for the same home.</p>
        </div>

        {/* Input card - 2 column layout. Navy gradient background mirrors
            the rate strip below it for visual rhythm; gold top accent +
            light labels keep the dark surface readable. */}
        <div className="content-card" style={{
          padding: "28px",
          marginBottom: 12,
          maxWidth: 800,
          margin: "0 auto 12px",
          background: `linear-gradient(160deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`,
          borderTop: `3px solid ${P.gold}`,
          border: 'none',
          boxShadow: '0 4px 20px rgba(15, 37, 48, 0.18)',
        }}>
          {/* Compare-programs pill row — equal-width 4-column grid spanning
              the full input card. Lives at the top of the inputs because
              program selection is part of configuring the scenario, not
              part of reading the results. Active pills use a uniform gold
              border so the navy-on-navy Conv pill stays clearly readable. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }} role="group" aria-label="Select programs to compare">
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.goldLight }}>Compare</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {programs.map((prog) => {
                const isVisible = visiblePrograms.includes(prog.name);
                const isLast = visiblePrograms.length === 1 && isVisible;
                return (
                  <button
                    key={prog.name}
                    type="button"
                    onClick={() => toggleProgram(prog.name)}
                    disabled={isLast}
                    aria-pressed={isVisible}
                    aria-label={`${prog.name} — ${isVisible ? "visible, click to hide" : "hidden, click to show"}`}
                    style={{
                      background: isVisible ? prog.color : "#fff",
                      color: isVisible ? "#fff" : P.warmGray,
                      border: `2.5px solid ${isVisible ? P.goldLight : "rgba(207, 51, 56, 0.3)"}`,
                      borderRadius: 50,
                      padding: "10px 4px",
                      minHeight: 40,
                      fontFamily: F.body,
                      fontSize: 13,
                      fontWeight: isVisible ? 700 : 600,
                      letterSpacing: 0.3,
                      cursor: isLast ? "not-allowed" : "pointer",
                      opacity: isLast ? 0.7 : 1,
                      transition: "background 0.15s, color 0.15s, border-color 0.15s, font-weight 0.15s",
                      textAlign: "center",
                      boxShadow: isVisible ? "0 2px 8px rgba(207, 51, 56, 0.35)" : "none",
                    }}
                  >
                    {prog.name === "Conventional" ? "Conv" : prog.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="calc-input-cols">
            {/* LEFT COLUMN — Loan structure & amount */}
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

              <CalcInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} comma labelColor={P.goldLight} />

              <div className="calc-dp-row">
                <CalcInput label="Down Payment %" value={downPct} onChange={handleDownPctChange} suffix="%" step={0.5} min={0} max={100} labelColor={P.goldLight} />
                <CalcInput label="Down Payment $" value={Math.round(downAmt)} onChange={handleDownDollarChange} prefix="$" step={1000} min={0} max={homePrice} comma labelColor={P.goldLight} />
              </div>

              <div style={{ padding: "10px 14px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Base Loan Amount</span>
                <span style={{ fontFamily: F.display, fontSize: 20, color: P.navy }}>{fmt(baseLoan)}</span>
              </div>
            </div>

            {/* RIGHT COLUMN — Monthly escrow items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CalcInput label="Homeowners Ins. (est.)" value={insurance} onChange={setInsurance} prefix="$" step={25} labelColor={P.goldLight} />

              <div className="calc-tax-group">
                <div className="calc-tax-group-label">Property Tax</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label htmlFor={taxStateSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Location</label>
                  <select
                    id={taxStateSelectId}
                    value={taxState}
                    onChange={(e) => setTaxState(e.target.value)}
                    style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  >
                    {Object.entries(SHARED_STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                      <option key={code} value={code}>{s.name}</option>
                    ))}
                  </select>
                  {metroList.length > 0 && (
                    <select
                      aria-label="County or metro tax area"
                      value={taxMetro}
                      onChange={(e) => setTaxMetro(e.target.value)}
                      style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px", fontSize: 13, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", marginTop: 4, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                    >
                      <option value="">State Avg ({stateData.rate}%)</option>
                      {metroList.map((m) => (
                        <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>
                      ))}
                    </select>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label htmlFor={taxesInputId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Monthly Amount</label>
                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray, marginRight: 4 }}>$</span>
                    <input
                      id={taxesInputId}
                      type="text"
                      inputMode="decimal"
                      value={taxes.toLocaleString("en-US")}
                      onChange={(e) => { const v = parseFloat(e.target.value.replace(/,/g, "")); if (!isNaN(v)) setTaxes(v); else if (e.target.value === "") setTaxes(0); }}
                      style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", minWidth: 0, width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {!showHoa ? (
                <button onClick={() => setShowHoa(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 12, color: P.goldLight, fontWeight: 600, cursor: "pointer" }}>+ Add HOA Dues <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(250, 247, 242, 0.55)" }}>(optional)</span></button>
              ) : (
                <div>
                  <CalcInput label="Monthly HOA Dues (optional)" value={hoa} onChange={setHoa} prefix="$" step={25} labelColor={P.goldLight} />
                  <button onClick={() => { setShowHoa(false); setHoa(0); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 11, color: "rgba(250, 247, 242, 0.7)", cursor: "pointer", marginTop: 2 }}>✕ Remove HOA</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Per-program rate inputs — NAVY TREATMENT for visual prominence */}
        <div style={{
          background: P.navy,
          borderRadius: 14,
          padding: "18px 28px 22px",
          marginBottom: 32,
          maxWidth: 800,
          margin: "0 auto 32px",
          boxShadow: "0 4px 20px rgba(15, 37, 48, 0.18)",
          borderTop: `3px solid ${P.gold}`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle gold radial glow in top-right corner for warmth */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 180,
            height: "100%",
            background: "radial-gradient(circle at top right, rgba(207, 51, 56, 0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8, position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>Interest Rates by Program</span>
            {ratesLoaded && (
              <span style={{ fontSize: 11, color: P.goldLight, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: 0.9 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: P.goldLight,
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(207, 51, 56, 0.6)",
                  animation: "rate-pulse 2s ease-in-out infinite",
                }} />
                Live rates loaded · {rateSource}
              </span>
            )}
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: P.cream, opacity: 0.65, marginBottom: 14, lineHeight: 1.5, position: "relative", zIndex: 1 }}>
            National averages via Mortgage News Daily, rounded to the nearest 0.125% and bumped up 0.25% for a conservative starting estimate. Your actual rate may differ. Adjust below to match your quote.
          </p>

          {/* Rate pills — RateInput component unchanged, cream pills sit on navy.
              Filtered by visiblePrograms so only the programs the user is
              actually comparing show their rate slider. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
            {[
              { label: "Conventional", rate: convRate, setRate: setConvRate, color: PROGRAM_COLORS.Conventional, market: term === 15 ? convRate15Api : convRate30Api },
              { label: "FHA", rate: fhaRate, setRate: setFhaRate, color: PROGRAM_COLORS.FHA, market: fhaRateApi },
              { label: "VA", rate: vaRate, setRate: setVaRate, color: PROGRAM_COLORS.VA, market: vaRateApi },
              { label: "USDA", rate: usdaRate, setRate: setUsdaRate, color: PROGRAM_COLORS.USDA, market: usdaRateApi },
            ].filter((p) => visiblePrograms.includes(p.label)).map((p) => (
              <RateInput key={p.label} label={p.label} rate={p.rate} setRate={p.setRate} color={p.color} marketRate={p.market} />
            ))}
          </div>

          {!ratesLoaded && (
            <p style={{ fontSize: 11, color: P.cream, opacity: 0.6, marginTop: 10, fontStyle: "italic", position: "relative", zIndex: 1 }}>Adjust rates manually or they'll auto-populate when live data loads.</p>
          )}
        </div>
      </div>

      {/* RESULTS ZONE — deeper cream background extends from top of zone to
          end of page. paddingTop here (rather than margin-top on the inner
          divider) prevents margin-collapse from leaking the spacing into
          the lighter cream section above. */}
      <div style={{ background: P.creamDark, paddingTop: 56, paddingBottom: 64 }}>
        <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto" }}>
          {/* Section divider — Your Results (background pill matches the
              creamDark zone). No top margin: spacing comes from the parent's
              paddingTop so the band above stays creamDark, not page cream. */}
          <div style={{ margin: "0 auto 24px", maxWidth: 800, position: "relative", textAlign: "center" }}>
            <div style={{ height: 1, background: `linear-gradient(to right, transparent, rgba(155, 148, 136, 0.3), transparent)`, position: "absolute", left: 0, right: 0, top: "50%" }} />
            <div style={{ position: "relative", display: "inline-block", background: P.creamDark, padding: "0 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted }}>↓ Your Results ↓</span>
              <p style={{ fontSize: 13, color: P.warmGray, marginTop: 6, maxWidth: 480 }}>Tap any card to select it, then save to the Loan Comparison Tool</p>
            </div>
          </div>

        {/* Side-by-side cards */}
        <div className="calc-cards-grid" data-count={visibleProgramsList.length}>
          {visibleProgramsList.map((prog, i) => {
            const isBest = prog.eligible && prog.total === lowestTotal;

            if (!prog.eligible) {
              const reason = prog.ineligibleReason;
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", position: "relative", opacity: 0.6 }}>
                  <div style={{ background: P.warmGrayLight, padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 28, color: "#fff" }}>Ineligible</span>
                  </div>
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: P.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <span style={{ fontSize: 24 }}>⚠️</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: P.text, marginBottom: 6 }}>{reason.title}</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray }}>{reason.body}</p>
                  </div>
                </div>
              );
            }

            if (prog.overLimit) {
              const neededDown = homePrice - prog.loanLimit;
              const neededPct = homePrice > 0 ? (neededDown / homePrice) * 100 : 0;
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", position: "relative", opacity: 0.65 }}>
                  <div style={{ background: P.warmGrayLight, padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 28, color: "#fff" }}>Over Loan Limit</span>
                  </div>
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(207, 51, 56, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <span style={{ fontSize: 24 }}>⚠️</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: P.text, marginBottom: 6 }}>Exceeds {countyLabel} {prog.name} Limit</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray, marginBottom: 10 }}>
                      The {prog.name} loan limit for this area is <strong style={{ color: P.text }}>{fmt(prog.loanLimit)}</strong>. Your current loan amount of <strong style={{ color: P.text }}>{fmt(baseLoan)}</strong> exceeds it.
                    </p>
                    <div style={{ background: "rgba(207, 51, 56, 0.08)", border: "1px solid rgba(207, 51, 56, 0.25)", borderRadius: 8, padding: "10px 12px" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.goldMuted, marginBottom: 4 }}>To Qualify</p>
                      <p style={{ fontSize: 13, color: P.text, lineHeight: 1.5 }}>
                        Increase down payment to at least <strong>{fmt(neededDown)}</strong> ({neededPct.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            const isSelected = selectedProgram === prog.name;
            return (
              <div key={i} className="content-card" onClick={() => setSelectedProgram(isSelected ? null : prog.name)} style={{
                overflow: "hidden", position: "relative", cursor: "pointer",
                border: isSelected ? `3px solid ${P.gold}` : `3px solid transparent`,
                boxShadow: isSelected ? `0 0 0 4px rgba(207,51,56,0.15), 0 8px 30px rgba(0,0,0,0.12)` : undefined,
                transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
              }}>
                {isSelected && (
                  <span style={{ position: "absolute", top: 10, left: 10, zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "4px 10px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>✓ Selected</span>
                )}
                {/* Header */}
                <div style={{ background: prog.color, padding: "24px 20px", textAlign: "center", position: "relative" }}>
                  {isBest && (
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      background: "#fff", color: prog.color,
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
                      padding: "4px 10px", borderRadius: 50,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>★ Lowest</span>
                  )}
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                  <span style={{ fontFamily: F.display, fontSize: 40, color: "#fff" }}>{fmt(prog.total)}</span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>/month · {Number(prog.rate).toFixed(3)}% rate</span>
                </div>

                <div style={{ padding: "20px" }}>
                  {/* Pie chart — mounts when this card is selected so the
                      recharts entry animation plays each time the user
                      picks the card. Sits above the monthly breakdown.
                      Tooltip is disabled here; the breakdown rows below
                      carry color dots that match each slice, so tapping
                      slices is no longer needed. */}
                  {isSelected && prog.total > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <PaymentPieChart
                        programName={prog.name}
                        pi={prog.pi}
                        mi={prog.mi}
                        miLabel={prog.miLabel}
                        taxes={taxes}
                        insurance={insurance}
                        hoa={hoa}
                        total={prog.total}
                        diameter={pieDiameter}
                        showTooltip={false}
                      />
                    </div>
                  )}

                  {/* Breakdown — each row leads with a color dot that
                      matches the corresponding pie slice. Slice colors
                      mirror PaymentPieChart's logic (P&I = prog.color;
                      insurance flips to gold for VA where prog.color is
                      sage; MI = gold; HOA = warmGrayLight). */}
                  <div style={{ marginBottom: 16 }}>
                    {(() => {
                      const piColor = prog.color;
                      const insuranceColor = piColor === P.sage ? P.gold : P.sage;
                      // FHA's prog.color is goldMuted, so a gold MI dot would
                      // clash; swap to navy. Mirrors PaymentPieChart's slice rule.
                      const miColor = prog.name === "FHA" ? P.navy : P.gold;
                      return [
                        { label: "Principal & Interest", val: prog.pi, color: piColor },
                        ...(prog.mi > 0 ? [{ label: prog.miLabel, val: prog.mi, color: miColor }] : []),
                        { label: "Taxes", val: taxes, color: P.warmGray },
                        { label: "Insurance", val: insurance, color: insuranceColor },
                        ...(hoa > 0 ? [{ label: "HOA Dues", val: hoa, color: P.warmGrayLight }] : []),
                      ];
                    })().map((r, ri) => (
                      <div key={ri} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 12, color: P.warmGray, borderBottom: `1px solid ${P.cream}` }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: r.color, flexShrink: 0 }} aria-hidden="true" />
                          {r.label}
                        </span>
                        <span style={{ fontWeight: 600, color: P.text }}>{fmt(r.val)}</span>
                      </div>
                    ))}
                  </div>

                  {/* VA Usage selector */}
                  {prog.isVA && (
                    <div style={{ marginBottom: 12 }} onClick={(e) => e.stopPropagation()}>
                      <label htmlFor={vaUsageSelectId} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>VA Eligibility</label>
                      <select
                        id={vaUsageSelectId}
                        value={vaUsage}
                        onChange={(e) => setVaUsage(e.target.value)}
                        style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.cream, padding: "8px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                      >
                        <option value="first">First-Time Use</option>
                        <option value="subsequent">Subsequent Use</option>
                        <option value="exempt">Exempt (Disability)</option>
                      </select>
                    </div>
                  )}

                  {/* Loan details */}
                  <div style={{ background: P.cream, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Base Loan Amount</span>
                      <span style={{ fontWeight: 600, color: P.text }}>{fmt(baseLoan)}</span>
                    </div>
                    {prog.upfront > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, fontStyle: "italic" }}>
                        <span style={{ color: P.warmGrayLight }}>+ {prog.upfrontLabel}</span>
                        <span style={{ fontWeight: 600, color: P.warmGrayLight }}>{fmt(prog.upfront)}</span>
                      </div>
                    )}
                    {prog.isVA && prog.upfront === 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, fontStyle: "italic" }}>
                        <span style={{ color: P.sage, fontWeight: 600 }}>Funding Fee Waived</span>
                        <span style={{ fontWeight: 600, color: P.sage }}>$0</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingTop: 6, borderTop: prog.upfront > 0 || prog.isVA ? `1px solid ${P.creamDark}` : "none" }}>
                      <span style={{ color: P.warmGray }}>Total Loan Amount</span>
                      <span style={{ fontWeight: 700, color: prog.color }}>{fmt(prog.loan)}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", fontStyle: "italic" }}>{prog.note}</p>

                  {/* Pay it off faster */}
                  {(() => {
                    const cfg = getExtraConfig(prog.name);
                    const biweeklyEquivalent = Math.round(prog.pi / 12);
                    return (
                      <div style={{ marginTop: 12 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { enabled: !cfg.enabled }); }}
                          style={{
                            width: "100%",
                            background: cfg.enabled ? prog.color : P.cream,
                            color: cfg.enabled ? "#fff" : P.text,
                            border: `1px solid ${cfg.enabled ? prog.color : P.creamDark}`,
                            borderRadius: 8,
                            padding: "10px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: F.body,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "background 0.15s, color 0.15s, border-color 0.15s",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>⚡</span>
                            <span>Pay it off faster</span>
                          </span>
                          <span style={{ fontSize: 14, opacity: 0.7 }}>{cfg.enabled ? "▾" : "▸"}</span>
                        </button>

                        {cfg.enabled && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginTop: 10, padding: "14px 14px 12px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}
                          >
                            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 8 }}>Strategy</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
                              {[
                                { key: "monthly", label: "Monthly" },
                                { key: "annual", label: "Annual" },
                                { key: "biweekly", label: "Bi-weekly" },
                              ].map((s) => {
                                const active = cfg.strategy === s.key;
                                return (
                                  <button
                                    key={s.key}
                                    onClick={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { strategy: s.key }); }}
                                    style={{
                                      background: active ? prog.color : "#fff",
                                      color: active ? "#fff" : P.text,
                                      border: `1px solid ${active ? prog.color : P.creamDark}`,
                                      borderRadius: 6,
                                      padding: "8px 4px",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      fontFamily: F.body,
                                      cursor: "pointer",
                                      transition: "background 0.15s, color 0.15s, border-color 0.15s",
                                    }}
                                  >
                                    {s.label}
                                  </button>
                                );
                              })}
                            </div>

                            {cfg.strategy === "biweekly" ? (
                              <div style={{ background: "#fff", borderRadius: 6, padding: "10px 12px", border: `1px solid ${P.creamDark}` }}>
                                <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                                  Paying half your P&I every two weeks results in 26 half-payments (13 full) per year — one extra monthly payment, split into <strong style={{ color: P.text }}>{fmt(biweeklyEquivalent)}/mo</strong> equivalent.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <label htmlFor={`extra-payment-${prog.name}`} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>
                                  Extra {cfg.strategy === "annual" ? "per year" : "per month"}
                                </label>
                                <div style={{ position: "relative" }}>
                                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: P.warmGrayLight, fontWeight: 600 }}>$</span>
                                  <input
                                    id={`extra-payment-${prog.name}`}
                                    type="number"
                                    min="0"
                                    value={cfg.amount || ""}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { amount: parseFloat(e.target.value) || 0 }); }}
                                    placeholder="0"
                                    style={{
                                      width: "100%",
                                      background: "#fff",
                                      border: `1px solid ${P.creamDark}`,
                                      borderRadius: 6,
                                      padding: "10px 12px 10px 24px",
                                      fontSize: 13,
                                      fontFamily: F.body,
                                      fontWeight: 600,
                                      color: P.text,
                                      outline: "none",
                                      boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Compute original vs improved scenarios */}
                            {(() => {
                              const isConv = prog.name === "Conventional";
                              const isFHA = prog.name === "FHA";

                              let miDropoffType = "none";
                              let miMonths = 0;
                              if (isConv && prog.mi > 0) {
                                miDropoffType = "ltv";
                                miMonths = term * 12;
                              } else if (isFHA) {
                                miDropoffType = "term";
                                miMonths = downPct < 10 ? term * 12 : 132;
                              }

                              const originalResult = generateAmortData(prog.loan, prog.rate, term, {
                                strategy: "none",
                                monthlyMI: prog.mi,
                                miMonths,
                                homeValue: homePrice,
                                miDropoffType,
                              });

                              const improvedResult = generateAmortData(prog.loan, prog.rate, term, {
                                strategy: cfg.strategy,
                                extraAmount: cfg.amount,
                                monthlyMI: prog.mi,
                                miMonths,
                                homeValue: homePrice,
                                miDropoffType,
                              });

                              const hasMeaningfulInput =
                                cfg.strategy === "biweekly" ||
                                (cfg.amount && cfg.amount > 0);

                              if (!hasMeaningfulInput) {
                                return (
                                  <div style={{ marginTop: 12, padding: "14px 16px", background: P.cream, borderRadius: 6, textAlign: "center" }}>
                                    <p style={{ fontSize: 12, color: P.warmGrayLight, fontStyle: "italic" }}>
                                      Enter an amount above to see your savings.
                                    </p>
                                  </div>
                                );
                              }

                              const interestSaved = originalResult.totalInterest - improvedResult.totalInterest;
                              const monthsSaved = originalResult.payoffMonth - improvedResult.payoffMonth;

                              const miSaved = originalResult.miPaidTotal - improvedResult.miPaidTotal;
                              const miMonthsSaved = (originalResult.miEndMonth || 0) - (improvedResult.miEndMonth || 0);
                              const showPmiNote = (isConv || isFHA) && miSaved > 100;

                              const headlineLabel =
                                cfg.strategy === "biweekly" ? "Bi-weekly payments" :
                                cfg.strategy === "annual" ? `$${cfg.amount.toLocaleString()}/year extra` :
                                `$${cfg.amount.toLocaleString()}/month extra`;

                              return (
                                <div style={{ marginTop: 12, background: "linear-gradient(135deg, " + P.creamDark + " 0%, " + P.cream + " 100%)", borderRadius: 8, padding: "14px 12px" }}>
                                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 2 }}>
                                      Your Impact
                                    </span>
                                    <div style={{ fontFamily: F.display, fontSize: 17, color: P.navy }}>
                                      {headlineLabel}
                                    </div>
                                  </div>

                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                                    <div style={{ background: "#fff", borderRadius: 6, padding: "10px 11px", borderTop: `2px solid ${P.warmGrayLight}` }}>
                                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 4 }}>
                                        Original
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Loan term</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {formatPayoff(originalResult.payoffMonth)}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Total interest</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {fmt(originalResult.totalInterest)}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ background: "#fff", borderRadius: 6, padding: "10px 11px", borderTop: `2px solid ${P.gold}` }}>
                                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 4 }}>
                                        With extra
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Payoff in</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {formatPayoff(improvedResult.payoffMonth)}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Total interest</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {fmt(improvedResult.totalInterest)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ background: P.navy, color: P.cream, borderRadius: 6, padding: "10px 14px", textAlign: "center" }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: P.goldLight, textTransform: "uppercase", marginBottom: 2 }}>
                                      You save
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: P.cream, fontVariantNumeric: "tabular-nums", lineHeight: 1.4 }}>
                                      <span style={{ display: "block" }}>
                                        <strong style={{ color: P.goldLight }}>{fmt(interestSaved)}</strong> in interest
                                      </span>
                                      <span style={{ display: "block", fontSize: 13, fontWeight: 500, opacity: 0.92, marginTop: 2 }}>
                                        Pay off <strong style={{ color: P.goldLight, fontWeight: 700 }}>{formatPayoff(monthsSaved)}</strong> sooner
                                      </span>
                                    </div>
                                  </div>

                                  {showPmiNote && (
                                    <div style={{ marginTop: 8, padding: "7px 11px", background: "rgba(207, 51, 56, 0.08)", borderRadius: 4, borderLeft: `2px solid ${P.gold}` }}>
                                      <p style={{ fontSize: 10.5, color: P.warmGray, lineHeight: 1.4 }}>
                                        <strong style={{ color: P.navy }}>{isFHA ? "Note:" : "Bonus:"}</strong>{" "}
                                        {isFHA
                                          ? `FHA MIP runs the life of the loan with <10% down, but ends ${formatPayoff(miMonthsSaved)} earlier with these payments.`
                                          : `PMI also drops off ${formatPayoff(miMonthsSaved)} earlier, saving an additional ${fmt(miSaved)}.`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* APR */}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR</span>
                    <span style={{ fontFamily: F.display, fontSize: 22, color: prog.color }}>{prog.apr.toFixed(3)}%</span>
                    <p style={{ fontSize: 9, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4 }}>Includes lender fees{prog.upfront > 0 ? `, ${prog.upfrontLabel}` : ""}{prog.mi > 0 ? ", monthly MI" : ""}. <a href={`/cash-to-close?price=${homePrice}&down=${downPct}&term=${term}&program=${encodeURIComponent(prog.name)}&rate=${prog.rate}&state=${taxState}&metro=${encodeURIComponent(taxMetro)}${prog.isVA ? `&vaUsage=${vaUsage}` : ""}${hoa > 0 ? `&hoa=${hoa}` : ""}`} style={{ color: P.textLight, textDecoration: "underline" }}>Full APR detail →</a></p>
                    <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                  </div>

                  {/* Per-card Save-to-Compare CTA — shown only on the selected
                      eligible card so the bottom-of-page button is no longer
                      needed. stopPropagation prevents tapping the button from
                      toggling deselection. */}
                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); saveScenario(); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        marginTop: 12, padding: "12px 16px", borderRadius: 8, border: "none",
                        background: P.navy, color: "#fff",
                        fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        width: "100%",
                        boxShadow: "0 4px 16px rgba(27,58,75,0.20)",
                      }}
                    >
                      <CompareIcon size={16} variant="cream" />
                      Save to Loan Comparison
                    </button>
                  )}
                  {isSelected && saveToast && (
                    <p style={{ fontSize: 12, marginTop: 8, fontWeight: 600, textAlign: "center", color: saveToast.type === "error" ? P.danger : P.success }}>{saveToast.msg}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>


        {/* View-saved CTA — the save CTA itself lives inside the selected
            card, but a permanent button-styled entry point at the bottom
            lets users jump to /compare without first selecting. */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <a
            href="/compare"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 20px", borderRadius: 8,
              border: `1px solid ${P.navy}`, background: P.cream,
              color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <CompareIcon size={16} variant="navy" />
            View Saved Scenarios →
          </a>
        </div>

        {/* Cross-link to prequal */}

        {/* Disclaimer */}
        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          {ratesLoaded ? "Rates auto-populated from current national averages (Mortgage News Daily), rounded to the nearest 0.125% and bumped up 0.25% so the starting estimate stays conservative." : ""}
          This calculator is for educational purposes only. Actual rates, fees, and payment amounts vary by lender, credit profile, and loan scenario. Contact me at <a href="tel:+16156560737" style={{ color: P.textLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized quote. NMLS #1119524.
        </p>
        </div>
      </div>
      </>
      )}

      {isCockpit && (
      <>
        {/* Page intro */}
        <div className="tool-page-content" style={{ padding: "32px 24px 8px", maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 8 }}>Side-by-Side Comparison</span>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              Mortgage Calculator
              <MortgageCalcIcon size={26} />
            </h1>
            <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>One set of inputs, four loan programs. See how Conventional, FHA, VA, and USDA stack up for the same home.</p>
          </div>
        </div>

        <CockpitShell
          rail={
            <>
              {/* Compact input card — single column for the 340px rail.
                  Navy gradient background mirrors the rate strip below it
                  for visual rhythm. Gold top accent + cream/gold labels
                  keep the dark surface readable. */}
              <div className="content-card" style={{
                padding: "20px",
                marginBottom: 16,
                background: `linear-gradient(160deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`,
                borderTop: `3px solid ${P.gold}`,
                border: 'none',
                boxShadow: '0 4px 20px rgba(15, 37, 48, 0.18)',
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Compare-programs pill row — equal-width 4-column grid.
                      Sits at the top of the input card so program selection
                      lives alongside the inputs, not in the results area.
                      Active pills get a uniform gold border so the navy-on-
                      navy Conv pill stays clearly readable. */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }} role="group" aria-label="Select programs to compare">
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.goldLight }}>Compare</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                      {programs.map((prog) => {
                        const isVisible = visiblePrograms.includes(prog.name);
                        const isLast = visiblePrograms.length === 1 && isVisible;
                        const label = prog.name === "Conventional" ? "Conv" : prog.name;
                        return (
                          <button
                            key={prog.name}
                            type="button"
                            onClick={() => toggleProgram(prog.name)}
                            disabled={isLast}
                            aria-pressed={isVisible}
                            aria-label={`${prog.name} — ${isVisible ? "visible, click to hide" : "hidden, click to show"}`}
                            style={{
                              background: isVisible ? prog.color : "#fff",
                              color: isVisible ? "#fff" : P.warmGray,
                              border: `2.5px solid ${isVisible ? P.goldLight : "rgba(207, 51, 56, 0.3)"}`,
                              borderRadius: 50,
                              padding: "8px 4px",
                              minHeight: 36,
                              fontFamily: F.body,
                              fontSize: 12,
                              fontWeight: isVisible ? 700 : 600,
                              letterSpacing: 0.3,
                              cursor: isLast ? "not-allowed" : "pointer",
                              opacity: isLast ? 0.7 : 1,
                              transition: "background 0.15s, color 0.15s, border-color 0.15s, font-weight 0.15s",
                              textAlign: "center",
                              boxShadow: isVisible ? "0 2px 8px rgba(207, 51, 56, 0.35)" : "none",
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

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

                  <CalcInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} comma labelColor={P.goldLight} />

                  <div className="calc-dp-row">
                    <CalcInput label="Down Payment %" value={downPct} onChange={handleDownPctChange} suffix="%" step={0.5} min={0} max={100} labelColor={P.goldLight} />
                    <CalcInput label="Down Payment $" value={Math.round(downAmt)} onChange={handleDownDollarChange} prefix="$" step={1000} min={0} max={homePrice} comma labelColor={P.goldLight} />
                  </div>

                  <div style={{ padding: "10px 14px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Base Loan Amount</span>
                    <span style={{ fontFamily: F.display, fontSize: 20, color: P.navy }}>{fmt(baseLoan)}</span>
                  </div>

                  <CalcInput label="Homeowners Ins. (est.)" value={insurance} onChange={setInsurance} prefix="$" step={25} labelColor={P.goldLight} />

                  {/* Tax group — cream/gold treatment from the global
                      .calc-tax-group class. Kept distinct from the
                      surrounding navy card on purpose, per design. */}
                  <div className="calc-tax-group">
                    <div className="calc-tax-group-label">Property Tax</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label htmlFor={taxStateSelectId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Location</label>
                      <select
                        id={taxStateSelectId}
                        value={taxState}
                        onChange={(e) => setTaxState(e.target.value)}
                        style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                      >
                        {Object.entries(SHARED_STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                          <option key={code} value={code}>{s.name}</option>
                        ))}
                      </select>
                      {metroList.length > 0 && (
                        <select
                          aria-label="County or metro tax area"
                          value={taxMetro}
                          onChange={(e) => setTaxMetro(e.target.value)}
                          style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px", fontSize: 13, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", marginTop: 4, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236F6860' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                        >
                          <option value="">State Avg ({stateData.rate}%)</option>
                          {metroList.map((m) => (
                            <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label htmlFor={taxesInputId} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Monthly Amount</label>
                      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: "#fff", padding: "9px 12px" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray, marginRight: 4 }}>$</span>
                        <input
                          id={taxesInputId}
                          type="text"
                          inputMode="decimal"
                          value={taxes.toLocaleString("en-US")}
                          onChange={(e) => { const v = parseFloat(e.target.value.replace(/,/g, "")); if (!isNaN(v)) setTaxes(v); else if (e.target.value === "") setTaxes(0); }}
                          style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", minWidth: 0, width: "100%" }}
                        />
                      </div>
                    </div>
                  </div>

                  {!showHoa ? (
                    <button onClick={() => setShowHoa(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 12, color: P.goldLight, fontWeight: 600, cursor: "pointer" }}>+ Add HOA Dues <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(250, 247, 242, 0.55)" }}>(optional)</span></button>
                  ) : (
                    <div>
                      <CalcInput label="Monthly HOA Dues (optional)" value={hoa} onChange={setHoa} prefix="$" step={25} labelColor={P.goldLight} />
                      <button onClick={() => { setShowHoa(false); setHoa(0); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 11, color: "rgba(250, 247, 242, 0.7)", cursor: "pointer", marginTop: 2 }}>✕ Remove HOA</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact rate strip — same navy treatment, tightened for rail width */}
              <div style={{
                background: P.navy,
                borderRadius: 14,
                padding: "16px 18px 18px",
                boxShadow: "0 4px 20px rgba(15, 37, 48, 0.18)",
                borderTop: `3px solid ${P.gold}`,
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight }}>Rates by Program</span>
                  {ratesLoaded && (
                    <span style={{ fontSize: 10, color: P.goldLight, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: 0.9 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.goldLight, display: "inline-block", boxShadow: "0 0 6px rgba(207, 51, 56, 0.6)", animation: "rate-pulse 2s ease-in-out infinite" }} />
                      Live · {rateSource}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 10, color: P.cream, opacity: 0.65, marginBottom: 10, lineHeight: 1.4 }}>
                  National averages via Mortgage News Daily, rounded to 0.125% then bumped up 0.25% for a conservative estimate. Adjust to match your quote.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Conventional", rate: convRate, setRate: setConvRate, color: PROGRAM_COLORS.Conventional, market: term === 15 ? convRate15Api : convRate30Api },
                    { label: "FHA", rate: fhaRate, setRate: setFhaRate, color: PROGRAM_COLORS.FHA, market: fhaRateApi },
                    { label: "VA", rate: vaRate, setRate: setVaRate, color: PROGRAM_COLORS.VA, market: vaRateApi },
                    { label: "USDA", rate: usdaRate, setRate: setUsdaRate, color: PROGRAM_COLORS.USDA, market: usdaRateApi },
                  ].filter((p) => visiblePrograms.includes(p.label)).map((p) => (
                    <RateInput key={p.label} label={p.label} rate={p.rate} setRate={p.setRate} color={p.color} marketRate={p.market} />
                  ))}
                </div>
                {!ratesLoaded && (
                  <p style={{ fontSize: 10, color: P.cream, opacity: 0.6, marginTop: 8, fontStyle: "italic" }}>Adjust rates manually or they'll auto-populate when live data loads.</p>
                )}
              </div>
            </>
          }
          canvas={
            <>
              {/* Compact program cards row */}
              <div className="calc-cockpit-cards" data-count={visibleProgramsList.length}>
                {visibleProgramsList.map((prog) => (
                  <ProgramCardCompact
                    key={prog.name}
                    prog={prog}
                    isBest={prog.eligible && !prog.overLimit && prog.total === lowestTotal}
                    isSelected={selectedProgram === prog.name}
                    onSelect={() => setSelectedProgram(prog.name)}
                    countyLabel={countyLabel}
                    homePrice={homePrice}
                    baseLoan={baseLoan}
                  />
                ))}
              </div>

              {/* Detail panel when a program is selected. When nothing is
                  selected, show a 🤓 tip below the cards instead. */}
              {selectedProg ? (
                <DetailPanel
                  prog={selectedProg}
                  taxes={taxes}
                  insurance={insurance}
                  hoa={hoa}
                  baseLoan={baseLoan}
                  homePrice={homePrice}
                  downPct={downPct}
                  term={term}
                  taxState={taxState}
                  taxMetro={taxMetro}
                  vaUsage={vaUsage}
                  setVaUsage={setVaUsage}
                  extraConfig={extraConfig}
                  updateExtraConfig={updateExtraConfig}
                  vaUsageSelectId={vaUsageSelectId}
                  pieDiameter={pieDiameter}
                  saveToast={saveToast}
                  onSaveToComparison={saveScenario}
                />
              ) : (
                <p style={{ fontSize: 13, color: P.warmGray, margin: 0, textAlign: "center" }}>
                  <span style={{ marginRight: 6 }}>🤓</span>
                  Tap a card to view its detailed breakdown.
                </p>
              )}

              {/* Insight 🤓 — preserved verbatim from legacy */}
              <div className="content-card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
                    {eligibleTotals.length >= 2 && (
                      <p style={{ marginBottom: 8 }}>
                        <strong>Monthly difference:</strong> The spread between the lowest and highest eligible payment is{" "}
                        <strong style={{ color: P.navy }}>{fmt(Math.max(...eligibleTotals) - lowestTotal)}/month</strong>{" "}
                        ({fmt((Math.max(...eligibleTotals) - lowestTotal) * 12)}/year).
                        {(() => {
                          if (visibleProgramsList.length < 2) return null;
                          const rates = visibleProgramsList.map(p => p.rate);
                          if (new Set(rates).size < 2) return null;
                          const shortLabel = (name) => name === "Conventional" ? "Conv" : name;
                          const parts = visibleProgramsList.map(p => `${shortLabel(p.name)} ${p.rate}%`);
                          return (
                            <span> Rate spread: {parts.join(" vs ")} — this difference alone accounts for a meaningful portion of the payment gap.</span>
                          );
                        })()}
                      </p>
                    )}
                    {visibleProgramsList.some(p => !p.eligible) && (() => {
                      const ineligibleNames = visibleProgramsList.filter(p => !p.eligible).map(p => p.name);
                      const list = ineligibleNames.length === 1 ? ineligibleNames[0] :
                                   ineligibleNames.length === 2 ? `${ineligibleNames[0]} and ${ineligibleNames[1]}` :
                                   `${ineligibleNames.slice(0, -1).join(", ")}, and ${ineligibleNames[ineligibleNames.length - 1]}`;
                      const verb = ineligibleNames.length === 1 ? "is" : "are";
                      return (
                        <p style={{ marginBottom: 8 }}>
                          <strong>Note:</strong> {list} {verb} ineligible at the current settings — see the card{ineligibleNames.length === 1 ? "" : "s"} above for details.
                          {downPct < 3 ? " Minimum down payments: Conventional (3%), FHA (3.5%). VA and USDA both allow 0% down (USDA requires a 30-year term)." :
                           downPct < 3.5 ? " FHA requires a minimum 3.5% down payment to qualify." : ""}
                        </p>
                      );
                    })()}
                    <p>
                      {downPct >= 20
                        ? "With 20%+ down, Conventional has no PMI — often the clear winner. But compare the total loan amounts: FHA, VA, and USDA finance upfront fees, meaning you borrow more even with the same down payment."
                        : downPct >= 5
                          ? "At this down payment, pay attention to mortgage insurance. Conventional PMI is removable at 80% LTV, FHA MIP may stay for the life of the loan, VA has no monthly MI at all (but the funding fee adds to your balance), and USDA's annual fee stays for the life of the loan. Conv PMI estimates here assume 740+ FICO and DTI under 43% — lower scores or higher DTI will increase PMI."
                          : downPct >= 3.5
                            ? "At less than 5% down, all four programs carry some form of mortgage insurance or upfront fee. Conv PMI estimates assume 740+ FICO and DTI under 43% — lower scores will increase PMI significantly. VA is often the best deal if you're eligible — no monthly MI at all. USDA also allows 0% down with similar economics, but the property must be in an eligible rural area, household income has to be under program limits, and the annual fee stays for the life of the loan."
                            : term === 30
                              ? "At this down payment level, VA and USDA are likely your only options. VA requires a Certificate of Eligibility; USDA requires property + income eligibility (and is 30-year fixed only). Consider increasing your down payment to unlock Conventional and FHA programs."
                              : "At this down payment level, VA is likely your only option — USDA requires a 30-year term. Consider increasing your down payment or switching to a 30-year term to widen your options."}
                    </p>
                    {visiblePrograms.includes("VA") && vaUsage !== "exempt" && (
                      <p style={{ marginTop: 8 }}>
                        <strong>VA funding fee:</strong> Currently set to {vaUsageLabels[vaUsage].toLowerCase()} at {vaFeeRate}%
                        {downPct < 5 && vaUsage === "subsequent" ? " — this is the highest tier. First-time users with the same down payment pay 2.15% instead." : ""}
                        {downPct >= 5 ? ` — at ${downPct >= 10 ? "10%+" : "5–9.99%"} down, the fee is the same for first-time and subsequent use.` : ""}
                        {" "}Use the dropdown on the VA card to compare scenarios. Veterans with service-connected disabilities are exempt entirely.
                      </p>
                    )}
                    {visiblePrograms.includes("VA") && vaUsage === "exempt" && (
                      <p style={{ marginTop: 8 }}>
                        <strong>VA funding fee waived.</strong> Veterans with service-connected disabilities are exempt from the funding fee, making VA even more competitive — no upfront fee and no monthly MI.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Disclaimer — preserved verbatim */}
              <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
                {ratesLoaded ? "Rates auto-populated from current national averages (Mortgage News Daily), rounded to the nearest 0.125% and bumped up 0.25% so the starting estimate stays conservative." : ""}
                This calculator is for educational purposes only. Actual rates, fees, and payment amounts vary by lender, credit profile, and loan scenario. Contact me at <a href="tel:+16156560737" style={{ color: P.textLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized quote. NMLS #1119524.
              </p>
            </>
          }
        />
      </>
      )}
      <MobileToolbar hrefOverrides={{ "/prequal": `/prequal?down=${downPct}&term=${term}` }} />
    </main>
  );
}
