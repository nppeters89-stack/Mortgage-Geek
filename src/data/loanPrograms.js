// Rent vs Own program terms. The numeric core (loan structure, MI rate,
// financed fees, eligibility) comes from the shared mortgageMath module, the
// same one the payment calculator uses, so the two tools cannot drift. What
// stays here is Rent vs Own's own layer: the plain-language notes and the
// mortgage-insurance drop-off schedule its 360-month simulation needs.

import { resolveProgram } from "../utils/mortgageMath.js";

// Re-exported so existing Rent vs Own imports (LOAN_PROGRAMS, VA_USAGE_LABELS,
// the rate helpers) keep resolving from one place.
export {
  LOAN_PROGRAMS,
  VA_USAGE_LABELS,
  conventionalMiRate,
  fhaMiRate,
  USDA_MI_RATE,
  vaFeeRate,
} from "../utils/mortgageMath.js";

// How long mortgage insurance is charged:
//   "ltv78" — until the balance amortizes to 78% of the original price
//   "life"  — for as long as the loan is open
//   "11yr"  — 132 months (FHA with 10% or more down)
//   "none"  — never charged
const MI_DROP_RATIO = 0.78;
const FHA_11YR_MONTHS = 132;

// Program terms for the simulation: the shared loan/MI/fee numbers plus the
// Rent vs Own presentation layer (drop-off mode, note, ineligibility wording).
export function programTerms({ program, price, downPct, vaUsage = "first" }) {
  const t = resolveProgram({ program, price, downPct, vaUsage });

  const extra = {
    Conventional: {
      miMode: t.miRate > 0 ? "ltv78" : "none",
      miNote: downPct >= 20 ? "No mortgage insurance required" : "Estimated at 740+ FICO, under 43% DTI",
      ineligibleReason: t.eligible ? null : "Conventional loans require a minimum down payment of 3%.",
    },
    FHA: {
      miMode: downPct < 10 ? "life" : "11yr",
      miNote: downPct < 10 ? "MIP for life of loan" : "MIP removable after 11 years",
      ineligibleReason: t.eligible ? null : "FHA loans require a minimum down payment of 3.5%.",
    },
    VA: {
      miMode: "none",
      miNote: vaUsage === "exempt"
        ? "Funding fee waived, service-connected disability"
        : "No monthly mortgage insurance",
      ineligibleReason: null,
    },
    USDA: {
      miMode: "life",
      miNote: "Annual fee for life of loan, subject to property and income eligibility",
      ineligibleReason: null,
    },
  }[t.program];

  return { ...t, ...extra };
}

// Whether mortgage insurance is charged in a given month, given the
// start-of-month balance. Pure so the simulation can call it per month.
export function miChargedThisMonth({ miMode, balance, price, month }) {
  if (miMode === "none" || balance <= 0) return false;
  if (miMode === "life") return true;
  if (miMode === "11yr") return month <= FHA_11YR_MONTHS;
  return balance > MI_DROP_RATIO * price; // ltv78
}
