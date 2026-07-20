import { generateAmortData } from "./math.js";

// Single source of truth for the per-program mortgage math shared by the
// Mortgage Calculator and the Rent vs Own tool. Both used to derive these
// numbers independently (the calculator inline, Rent vs Own in loanPrograms.js),
// which is how their diagnostics could drift. They now both call resolveProgram
// and monthlyPI here, so the payment, mortgage insurance, and financed fees
// agree by construction.
//
// Pure and SSR-safe: no window, no fetch, no Date. Values and formulas are the
// calculator's, moved verbatim.

export const LOAN_PROGRAMS = ["Conventional", "FHA", "VA", "USDA"];

export const VA_USAGE_LABELS = {
  first: "First-Time Use",
  subsequent: "Subsequent Use",
  exempt: "Exempt (Disability)",
};

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

// Monthly principal and interest for a loan at an annual rate over a term in
// years. The calculator reads this off generateAmortData; sharing that keeps a
// single amortization formula behind both tools.
export function monthlyPI(loan, rate, term = 30) {
  return generateAmortData(loan, rate, term).monthly;
}

// Monthly mortgage insurance: an annual rate on the base loan, spread over 12.
export function monthlyMI(baseLoan, miRate) {
  return (baseLoan * (miRate / 100)) / 12;
}

// Resolve a program to its loan structure and mortgage insurance.
//
//   baseLoan = price minus down payment (the calculator's `downAmt` override
//              wins when passed, matching its dollar-entry field).
//   loan     = baseLoan plus any financed upfront fee (FHA UFMIP, VA funding
//              fee, USDA guarantee fee); this is what the payment amortizes on.
//   miRate   = annual mortgage insurance rate, charged on baseLoan.
//
// Down payment tiers and eligibility use the percentage, matching the
// calculator. Presentation the tools do not share (card notes, ineligibility
// wording, loan limits, the Rent vs Own MI drop-off schedule) is left to each
// tool; this returns the numbers and the labels both already rendered the same.
export function resolveProgram({ program, price, downPct, downAmt = null, vaUsage = "first" }) {
  const down = downAmt !== null ? downAmt : (price * downPct) / 100;
  const baseLoan = price - down;

  switch (program) {
    case "FHA": {
      const rate = fhaMiRate(downPct);
      const upfront = baseLoan * 0.0175;
      return {
        program, down, baseLoan, upfront, loan: baseLoan + upfront,
        upfrontLabel: "UFMIP (1.75%)",
        miRate: rate,
        miLabel: `MIP (${rate}%)`,
        minDown: 3.5,
        eligible: downPct >= 3.5,
        isVA: false,
      };
    }
    case "VA": {
      const fee = vaFeeRate(vaUsage, downPct);
      const upfront = baseLoan * (fee / 100);
      return {
        program, down, baseLoan, upfront, loan: baseLoan + upfront,
        upfrontLabel: fee > 0 ? `Funding Fee (${fee}%)` : null,
        miRate: 0,
        miLabel: null,
        minDown: 0,
        eligible: true,
        isVA: true,
      };
    }
    case "USDA": {
      const upfront = baseLoan * 0.01;
      return {
        program, down, baseLoan, upfront, loan: baseLoan + upfront,
        upfrontLabel: "Guarantee Fee (1.00%)",
        miRate: USDA_MI_RATE,
        miLabel: `Annual Fee (${USDA_MI_RATE}%)`,
        minDown: 0,
        eligible: true,
        isVA: false,
      };
    }
    default: {
      const rate = conventionalMiRate(downPct);
      return {
        program: "Conventional", down, baseLoan, upfront: 0, loan: baseLoan,
        upfrontLabel: null,
        miRate: rate,
        miLabel: rate > 0 ? `PMI (${rate}%)` : null,
        minDown: 3,
        eligible: downPct >= 3,
        isVA: false,
      };
    }
  }
}
