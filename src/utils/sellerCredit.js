// Frozen engine for the Seller Credit Optimizer tool. Implements the
// build brief's rules verbatim and matches the Rate Buydowns Deep Dive's
// locked numbers within $1 across acceptance Tests A-F.
//
// All payment math goes through src/utils/math.js; we never reimplement
// amortization. The `monthlyPayment` helper just unwraps the `.monthly`
// field that generateAmortData returns.
//
// Program-aware cap layer (Conv / FHA / VA / USDA) sits on top of the
// program-agnostic deployment math. Switching programs MUST NOT change
// any payment number; only cap evaluation and per-card status change.

import { generateAmortData } from "./math.js";

export function monthlyPayment(loan, rate, years) {
  return generateAmortData(loan, rate, years).monthly;
}

// Round UP to the nearest 0.125 percentage point (an eighth). Lenders
// price in eighths and the engine rounds conservatively (worse for the
// borrower) so the page never overstates the rate a buydown will get.
export function ceilToEighth(percent) {
  return Math.ceil(percent * 8) / 8;
}

// Resolve the down payment to a single dollar amount given the toggle
// mode. % mode keeps the percentage constant when the price moves
// (price cut option); $ mode keeps the dollar amount constant.
function resolveDown({ price, downMode, downPct, downDollar }) {
  return downMode === "%" ? (price * downPct) / 100 : downDollar;
}

// Conventional primary/second-home IPC tiers (rule 7). Investment is
// deliberately deferred per the brief.
function conventionalCapPct(ltv) {
  if (ltv > 0.90) return 0.03;
  if (ltv > 0.75) return 0.06;
  return 0.09;
}

// Per-program cap info. Conv is LTV-tiered; FHA/USDA are flat 6%; VA is
// a 4% concession bucket alongside an uncapped customary-costs bucket.
// All caps computed against the entered purchase price (a simplification
// over Conv/FHA's "lesser of price or appraised value" and VA's "Notice
// of Value"; this matches the deferred appraised-value-input decision).
export function programCap(program, { price, ltv }) {
  switch (program) {
    case "fha":
      return { programKey: "fha", label: "FHA", capPct: 0.06, capValue: price * 0.06, basis: "price", isTwoBucket: false };
    case "usda":
      return { programKey: "usda", label: "USDA", capPct: 0.06, capValue: price * 0.06, basis: "sales price", isTwoBucket: false };
    case "va":
      return { programKey: "va", label: "VA", capPct: 0.04, capValue: price * 0.04, basis: "appraised value (price proxy)", isTwoBucket: true };
    case "conventional":
    default: {
      const capPct = conventionalCapPct(ltv);
      return { programKey: "conventional", label: "Conventional", capPct, capValue: price * capPct, basis: "price", isTwoBucket: false };
    }
  }
}

// Helpers for per-card cap status. The page interprets `kind` to decide
// which message (warning vs. caveat) to render.
function statusPriceCut() {
  return { kind: "none" };
}

function statusSingleCap(credit, capValue) {
  return credit > capValue
    ? { kind: "exceeded", credit, capValue }
    : { kind: "fit", credit, capValue };
}

function statusVaClosingCosts() {
  return { kind: "va-uncapped-closing" };
}

function statusVaPoints() {
  return { kind: "va-uncapped-points" };
}

function statusVaTwoOne(buydownCost, capValue) {
  return buydownCost > capValue
    ? { kind: "va-2-1-exceeded", buydownCost, capValue }
    : { kind: "va-2-1-fit", buydownCost, capValue };
}

export function computeDeployments(inputs) {
  const {
    price,
    downMode,      // "%" or "$"
    downPct,       // used when downMode === "%"
    downDollar,    // used when downMode === "$"
    rate,          // note rate as a percent number, e.g. 7.00
    term,          // years (15 / 20 / 30)
    credit,        // dollar credit on the table
    costsInput,    // estimated closing costs + prepaids ($)
    program = "conventional",
  } = inputs;

  // -------- Baseline (program-agnostic) --------
  const down = resolveDown({ price, downMode, downPct, downDollar });
  const loan = price - down;
  const basePayment = monthlyPayment(loan, rate, term);
  const ltv = price > 0 ? loan / price : 0;

  // -------- Price cut (rule 4) --------
  const newPrice = price - credit;
  const newDown = resolveDown({ price: newPrice, downMode, downPct, downDollar });
  const newLoan = newPrice - newDown;
  const priceCutPayment = monthlyPayment(newLoan, rate, term);
  const priceCutMonthlyDelta = basePayment - priceCutPayment;
  const downPaymentDelta = down - newDown;

  // -------- Closing costs (rule 5) --------
  const closingCostsApplied = Math.min(credit, costsInput);
  const closingCostsExcess = Math.max(0, credit - costsInput);

  // -------- Permanent points (rules 1 + 2) --------
  const pointsByCredit = loan > 0 ? credit / (loan * 0.01) : 0;
  const pointsAvailable = Math.min(pointsByCredit, 3);
  const pointsConsumed = pointsAvailable * loan * 0.01;
  const pointsLeftover = Math.max(0, credit - pointsConsumed);
  const rawReduction = pointsAvailable * 0.25;
  const rawBoughtRate = rate - rawReduction;
  const boughtRate = ceilToEighth(rawBoughtRate);
  const pointsEdgeCase = boughtRate >= rate - 1e-9;
  const pointsPayment = pointsEdgeCase ? basePayment : monthlyPayment(loan, boughtRate, term);
  const pointsMonthlyDelta = basePayment - pointsPayment;

  // -------- 2-1 buydown (rule 3) --------
  const year1Rate = rate - 2;
  const year2Rate = rate - 1;
  const year1Payment = monthlyPayment(loan, year1Rate, term);
  const year2Payment = monthlyPayment(loan, year2Rate, term);
  const year1Subsidy = basePayment - year1Payment;
  const year2Subsidy = basePayment - year2Payment;
  const twoOneCost = 12 * year1Subsidy + 12 * year2Subsidy;
  const twoOneLeftover = Math.max(0, credit - twoOneCost);
  const twoOneShortfall = Math.max(0, twoOneCost - credit);

  // -------- Five-year value bars (rule 6) --------
  const priceCut5yr = priceCutMonthlyDelta * 60;
  const closingCosts5yr = closingCostsApplied;
  const points5yr = pointsMonthlyDelta * 60;
  const twoOne5yr = twoOneCost + twoOneLeftover;

  // -------- Program-aware cap evaluation --------
  const cap = programCap(program, { price, ltv });

  // Per-card cap status. Price cut never consumes the cap. VA splits the
  // remaining deployments into bucket-one (uncapped) and bucket-two
  // (4%-capped, evaluated against the 2-1's escrow cost, not the credit).
  let priceCutStatus, closingCostsStatus, pointsStatus, twoOneStatus;
  priceCutStatus = statusPriceCut();
  if (program === "va") {
    closingCostsStatus = statusVaClosingCosts();
    pointsStatus = statusVaPoints();
    twoOneStatus = statusVaTwoOne(twoOneCost, cap.capValue);
  } else {
    closingCostsStatus = statusSingleCap(credit, cap.capValue);
    pointsStatus = statusSingleCap(credit, cap.capValue);
    twoOneStatus = statusSingleCap(credit, cap.capValue);
  }

  // Top-level "headline" exceeded boolean: true only for the single-cap
  // programs when credit exceeds the cap (back-compat with the existing
  // Conventional banner behavior). VA never sets this; its per-card
  // 2-1 warning is the only over-cap signal in VA mode.
  const headlineExceeded = program !== "va" && credit > cap.capValue;

  return {
    baseline: { down, loan, basePayment, ltv },
    priceCut: {
      newPrice,
      newDown,
      newLoan,
      payment: priceCutPayment,
      monthlyDelta: priceCutMonthlyDelta,
      downPaymentDelta,
      fiveYearValue: priceCut5yr,
      capStatus: priceCutStatus,
    },
    closingCosts: {
      applied: closingCostsApplied,
      excess: closingCostsExcess,
      fiveYearValue: closingCosts5yr,
      capStatus: closingCostsStatus,
    },
    points: {
      pointsBought: pointsAvailable,
      pointsConsumed,
      leftover: pointsLeftover,
      rawBoughtRate,
      boughtRate,
      payment: pointsPayment,
      monthlyDelta: pointsMonthlyDelta,
      edgeCase: pointsEdgeCase,
      fiveYearValue: points5yr,
      capStatus: pointsStatus,
    },
    twoOne: {
      year1Rate,
      year1Payment,
      year1Subsidy,
      year2Rate,
      year2Payment,
      year2Subsidy,
      cost: twoOneCost,
      leftover: twoOneLeftover,
      shortfall: twoOneShortfall,
      fiveYearValue: twoOne5yr,
      capStatus: twoOneStatus,
    },
    cap: {
      // New program-aware fields:
      program: cap.programKey,
      label: cap.label,
      capValue: cap.capValue,
      capPct: cap.capPct,
      basis: cap.basis,
      isTwoBucket: cap.isTwoBucket,
      headlineExceeded,
      // Back-compat with the existing page (Conv unchanged):
      ltv,
      capDollars: cap.capValue,
      exceedsCap: headlineExceeded,
    },
  };
}
