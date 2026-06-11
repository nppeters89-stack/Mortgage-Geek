// Frozen engine for the Seller Credit Optimizer tool. Implements rules
// 1-7 from the build brief verbatim and matches the Rate Buydowns Deep
// Dive's locked numbers within $1 across acceptance Tests A-F.
//
// All payment math goes through src/utils/math.js; we never reimplement
// amortization. The `monthlyPayment` helper just unwraps the `.monthly`
// field that generateAmortData returns.

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
  } = inputs;

  // -------- Baseline --------
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
  // % mode: down payment drops; $ mode: unchanged (loan absorbs the cut).
  const downPaymentDelta = down - newDown;

  // -------- Closing costs (rule 5) --------
  const closingCostsApplied = Math.min(credit, costsInput);
  const closingCostsExcess = Math.max(0, credit - costsInput);

  // -------- Permanent points (rules 1 + 2) --------
  // Points purchasable = credit / (loan * 0.01), capped at 3.
  const pointsByCredit = loan > 0 ? credit / (loan * 0.01) : 0;
  const pointsAvailable = Math.min(pointsByCredit, 3);
  // Credit actually consumed by points; remainder flows to closing costs.
  const pointsConsumed = pointsAvailable * loan * 0.01;
  const pointsLeftover = Math.max(0, credit - pointsConsumed);
  const rawReduction = pointsAvailable * 0.25;
  const rawBoughtRate = rate - rawReduction;
  // Round UP (conservative): ceil to nearest 0.125% raises the rate back
  // toward note, never below. If the ceiling lands on the original rate,
  // the credit was too small to move an eighth (rule 2 edge).
  const boughtRate = ceilToEighth(rawBoughtRate);
  const pointsEdgeCase = boughtRate >= rate - 1e-9;
  const pointsPayment = pointsEdgeCase ? basePayment : monthlyPayment(loan, boughtRate, term);
  const pointsMonthlyDelta = basePayment - pointsPayment;

  // -------- 2-1 buydown (rule 3) --------
  // Exact sum of 24 monthly subsidies. No PV, no approximation.
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

  // -------- IPC cap (rule 7) --------
  const capPct = conventionalCapPct(ltv);
  const capDollars = price * capPct;
  const exceedsCap = credit > capDollars;

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
    },
    closingCosts: {
      applied: closingCostsApplied,
      excess: closingCostsExcess,
      fiveYearValue: closingCosts5yr,
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
    },
    cap: { ltv, capPct, capDollars, exceedsCap },
  };
}
