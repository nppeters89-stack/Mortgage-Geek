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
