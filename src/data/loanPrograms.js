// Loan program terms: minimum down, financed upfront fees, and mortgage
// insurance rate and duration for the four programs.
//
// These rates are ported verbatim from the calculator (CalculatorPage.jsx,
// which currently derives them inline). Kept pure and data-only so the
// rent-vs-buy simulation can project them over 360 months. If the calculator is
// ever refactored to import from here, the two tools stay in sync by
// construction; until then, a rate change must be made in both places.

export const LOAN_PROGRAMS = ["Conventional", "FHA", "VA", "USDA"];

export const VA_USAGE_LABELS = {
  first: "First-Time Use",
  subsequent: "Subsequent Use",
  exempt: "Exempt (Disability)",
};

// How long mortgage insurance is charged:
//   "ltv78" — until the balance amortizes to 78% of the original price
//   "life"  — for as long as the loan is open
//   "11yr"  — 132 months (FHA with 10% or more down)
//   "none"  — never charged
const MI_DROP_RATIO = 0.78;
const FHA_11YR_MONTHS = 132;

// Conventional PMI, by down payment tier. 0 at 20% or more down.
export function conventionalMiRate(downPct) {
  if (downPct >= 20) return 0;
  if (downPct >= 10) return 0.27;
  if (downPct >= 5) return 0.37;
  return 0.52;
}

// FHA annual MIP.
export function fhaMiRate(downPct) {
  return downPct < 5 ? 0.55 : 0.5;
}

// USDA annual guarantee fee.
export const USDA_MI_RATE = 0.35;

// VA funding fee, by usage type and down payment.
export function vaFeeRate(vaUsage, downPct) {
  if (vaUsage === "exempt") return 0;
  if (downPct >= 10) return 1.25;
  if (downPct >= 5) return 1.5;
  return vaUsage === "first" ? 2.15 : 3.3;
}

// Resolve a program into the terms the simulation needs.
//
// `baseLoan` is price minus down payment. `loan` adds any financed upfront fee
// (FHA UFMIP, VA funding fee, USDA guarantee fee), which is what the payment
// amortizes on. Mortgage insurance is charged against `baseLoan`, matching the
// calculator.
export function programTerms({ program, price, downPct, vaUsage = "first" }) {
  const down = (price * downPct) / 100;
  const baseLoan = price - down;

  switch (program) {
    case "FHA": {
      const upfront = baseLoan * 0.0175;
      return {
        program, baseLoan, down, upfront, loan: baseLoan + upfront,
        upfrontLabel: "UFMIP (1.75%)",
        miRate: fhaMiRate(downPct),
        miLabel: `MIP (${fhaMiRate(downPct)}%)`,
        miMode: downPct < 10 ? "life" : "11yr",
        miNote: downPct < 10 ? "MIP for life of loan" : "MIP removable after 11 years",
        minDown: 3.5,
        eligible: downPct >= 3.5,
        ineligibleReason: downPct < 3.5 ? "FHA loans require a minimum down payment of 3.5%." : null,
      };
    }
    case "VA": {
      const rate = vaFeeRate(vaUsage, downPct);
      const upfront = baseLoan * (rate / 100);
      return {
        program, baseLoan, down, upfront, loan: baseLoan + upfront,
        upfrontLabel: rate > 0 ? `Funding Fee (${rate}%)` : null,
        miRate: 0,
        miLabel: null,
        miMode: "none",
        miNote: vaUsage === "exempt"
          ? "Funding fee waived, service-connected disability"
          : "No monthly mortgage insurance",
        minDown: 0,
        eligible: true,
        ineligibleReason: null,
      };
    }
    case "USDA": {
      const upfront = baseLoan * 0.01;
      return {
        program, baseLoan, down, upfront, loan: baseLoan + upfront,
        upfrontLabel: "Guarantee Fee (1.00%)",
        miRate: USDA_MI_RATE,
        miLabel: `Annual Fee (${USDA_MI_RATE}%)`,
        miMode: "life",
        miNote: "Annual fee for life of loan, subject to property and income eligibility",
        minDown: 0,
        eligible: true,
        ineligibleReason: null,
      };
    }
    default: {
      const rate = conventionalMiRate(downPct);
      return {
        program: "Conventional", baseLoan, down, upfront: 0, loan: baseLoan,
        upfrontLabel: null,
        miRate: rate,
        miLabel: rate > 0 ? `PMI (${rate}%)` : null,
        miMode: rate > 0 ? "ltv78" : "none",
        miNote: downPct >= 20 ? "No PMI required" : "PMI est. based on 740+ FICO, under 43% DTI",
        minDown: 3,
        eligible: downPct >= 3,
        ineligibleReason: downPct < 3 ? "Conventional loans require a minimum down payment of 3%." : null,
      };
    }
  }
}

// Whether mortgage insurance is charged in a given month, given the
// start-of-month balance. Pure so the simulation can call it per month.
export function miChargedThisMonth({ miMode, balance, price, month }) {
  if (miMode === "none" || balance <= 0) return false;
  if (miMode === "life") return true;
  if (miMode === "11yr") return month <= FHA_11YR_MONTHS;
  return balance > MI_DROP_RATIO * price; // ltv78
}
