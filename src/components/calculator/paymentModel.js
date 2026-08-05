import { resolveProgram, monthlyMI } from "../../utils/mortgageMath.js";
import { generateAmortData } from "../../utils/math.js";

// The one forward payment model for the mortgage calculator: price in, monthly
// payment (and its breakdown) out. It is the calculator's existing inline math,
// lifted verbatim into a pure function so a single code path backs both the
// price-first display and the payment-first solver. Do NOT add a reverse
// formula here: "Start with a payment" mode binary-searches price through THIS
// function (see solvePriceForPayment), so the two modes cannot drift.
//
// Pure and SSR-safe: no window, no fetch, no Date. All program structure,
// mortgage insurance, and financed upfront fees come from resolveProgram; the
// amortized P&I comes from generateAmortData. taxes, insurance, and hoa are the
// monthly dollar figures the page already holds (the caller decides whether they
// are user values or price-scaled ones); they are added, not recomputed here.
//
//   returns { ...resolveProgram fields, pi, mi, taxes, insurance, hoa, total }
//   where total is the full monthly payment (PITI plus MI where applicable).
export function computeMonthlyPayment({
  program,
  price,
  downPct,
  downAmt = null,
  term,
  rate,
  vaUsage = "first",
  taxes = 0,
  insurance = 0,
  hoa = 0,
}) {
  const t = resolveProgram({ program, price, downPct, downAmt, vaUsage });
  const pi = generateAmortData(t.loan, rate, term).monthly;
  const mi = monthlyMI(t.baseLoan, t.miRate);
  const total = pi + mi + taxes + insurance + hoa;
  return { ...t, pi, mi, taxes, insurance, hoa, total };
}

// Monthly property tax and homeowners insurance scaled to a purchase price, with
// the same whole-dollar rounding the calculator applies when price drives them.
// The solver uses this per trial price so its forward payment matches exactly
// what the page recomputes once the solved price feeds the price state, which is
// what makes the parity test (solve, re-enter the price, payments agree) hold.
export function priceScaledEscrow(price, taxRatePct, insRate = 0.0035) {
  return {
    taxes: Math.round((price * (taxRatePct / 100)) / 12),
    insurance: Math.round((price * insRate) / 12),
  };
}

// Solve for the purchase price whose forward payment (PITI plus MI) matches a
// target monthly payment, by binary-searching price through computeMonthlyPayment.
// This is deliberately a numeric solver, not a closed-form inverse: it drives the
// exact same forward model the display uses, so a solved price re-entered in
// price mode produces the same payment. Down payment is held as a percent
// (downAmt omitted) because the price field resets any dollar override on price
// change, so percent is the only value stable across the search.
//
// Taxes and insurance scale with the trial price (priceScaledEscrow); hoa is a
// flat add. Payment is monotonic increasing in price, so a plain bisection
// converges. Returns { price, payment, reason }:
//   reason null       -> price solves target within tolerance
//   reason "belowFloor" -> target is at or under the payment at the low bound
//                          (taxes, insurance, hoa, and the smallest loan); price null
//   reason "aboveCap"  -> target exceeds the payment at the high bound; price is
//                          the capped high bound
export function solvePriceForPayment(targetPayment, {
  program,
  downPct,
  term,
  rate,
  vaUsage = "first",
  taxRatePct,
  insRate = 0.0035,
  hoa = 0,
}, { lo = 25000, hi = 10000000, tolerance = 1, maxIter = 40 } = {}) {
  const paymentAt = (price) => {
    const { taxes, insurance } = priceScaledEscrow(price, taxRatePct, insRate);
    return computeMonthlyPayment({ program, price, downPct, downAmt: null, term, rate, vaUsage, taxes, insurance, hoa }).total;
  };

  if (!(targetPayment > 0)) return { price: null, payment: null, reason: "belowFloor" };

  const loPay = paymentAt(lo);
  if (targetPayment <= loPay) return { price: null, payment: loPay, reason: "belowFloor" };

  const hiPay = paymentAt(hi);
  if (targetPayment >= hiPay) return { price: hi, payment: hiPay, reason: "aboveCap" };

  let a = lo;
  let b = hi;
  let mid = (a + b) / 2;
  for (let i = 0; i < maxIter; i++) {
    mid = (a + b) / 2;
    const pay = paymentAt(mid);
    if (Math.abs(pay - targetPayment) <= tolerance) break;
    if (pay < targetPayment) a = mid;
    else b = mid;
  }
  return { price: mid, payment: paymentAt(mid), reason: null };
}
