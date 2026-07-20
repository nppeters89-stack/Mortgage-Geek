// Monthly symmetric rent-vs-own simulation for the Rent vs. Own tool. Pure and
// SSR-safe: no window, no fetch, no Date, so the prerender renders the base case
// with no network. Colocated with the component that owns it rather than added
// to utils/math.js, matching buyVsInvestSim.js.
//
// The model charges both sides for everything and scores the owner as if selling
// that year, with selling costs off the top, the strictest honest test:
//   - The renter's portfolio starts with the owner's down payment plus closing
//     costs invested on day one.
//   - Each month the full cost of owning (P&I, taxes, insurance, MI) is compared
//     against that month's rent, and whichever side pays less invests the
//     difference at the selected return.
//   - Owner wealth in any year = home value net of selling costs, minus the loan
//     balance, plus the owner's side fund. Renter wealth = the portfolio.
//
// Model-correctness anchor: at $400,000, 5% down, 6.43%, 6% selling cost, the
// model reproduces the verified Python reference exactly (advantage +$118,714 at
// year 10, breakeven year 4, owning $2,868/mo). That scenario is a fixture for
// the math, not the shipped default.
//
// The shipped default matches the payment calculator's opening scenario
// ($350,000, 3.5% down, Conventional at 6.75%, the calculator's default 0.70%
// property tax, 0.35% insurance, 7% selling cost): owning is ahead $137,870 at
// year 10, breakeven year 3, owning $2,643/mo, which equals the calculator's
// Conventional payment for the same inputs. Any change should be checked against
// both.
//
// The per-program loan, mortgage insurance, and payment come from the shared
// mortgageMath module (via loanPrograms), so this tool and the calculator cannot
// diverge on the mortgage math.
import { programTerms, miChargedThisMonth } from "../data/loanPrograms.js";
import { monthlyPI } from "../utils/mortgageMath.js";

// Home value compound annual growth: 5.4%, the 1970-2026 CAGR of the Census/HUD
// average sales price of houses sold (FRED: ASPUS). Not user-adjustable.
export const HOME_GROWTH = 1.054;

const TERM_MONTHS = 360;
const YEARS = 30;

// Defaults match the payment calculator's opening scenario so the two tools
// agree out of the box: $350k, 3.5% down, Conventional, the calculator's
// fallback rate, and its default 0.70% Tennessee property tax. The live tool
// overwrites rate (per-program API) and taxPct (state/county selector) on mount.
export const DEFAULTS = {
  program: "Conventional",
  vaUsage: "first",
  price: 350000,
  downPct: 3.5,
  rent0: 2000,
  rate: 6.75,
  rentG: 4.1,
  inv: 10,
  hz: 10,
  taxPct: 0.7,
  insPct: 0.35,
  ccPct: 3,
  sellPct: 7,
};

// Input bounds. Shared by the sim clamp and the control min/max so a slider and
// a typed number can never disagree about what is valid.
export const LIMITS = {
  price: [50000, 2000000],
  downPct: [0, 50],
  rent0: [100, 20000],
  rate: [3, 10],
  rentG: [0, 8],
  inv: [4, 12],
  hz: [1, 30],
  taxPct: [0, 4],
  insPct: [0, 2],
  ccPct: [0, 8],
  sellPct: [0, 12],
};

// Numeric fields are clamped to their bounds. Non-numeric fields (program,
// vaUsage) have no bounds and pass through untouched.
export function clampInput(key, value) {
  const bounds = LIMITS[key];
  if (!bounds) return value;
  if (!Number.isFinite(value)) return DEFAULTS[key];
  return Math.min(bounds[1], Math.max(bounds[0], value));
}

// Standard amortized monthly payment, over the same 30-year amortization the
// calculator uses (via the shared mortgageMath helper) so the payment is
// identical across both tools.
export function monthlyPayment(loan, rate) {
  return monthlyPI(loan, rate, TERM_MONTHS / 12);
}

// The calculator's conservative default: round the live rate to the nearest
// 0.125 and add one more 0.125 buffer (mirrors CalculatorPage roundRate and
// buyVsInvestSim.roundDefaultRate).
export function roundDefaultRate(liveRate) {
  return Math.round(liveRate / 0.125) * 0.125 + 0.125;
}

// Rent in a given year, stepping up once per year at the selected growth rate.
export function rentInYear(rent0, rentG, year) {
  return rent0 * Math.pow(1 + rentG / 100, Math.max(0, year - 1));
}

export function simulateRentVsOwn(input = {}) {
  const s = { ...DEFAULTS, ...input };

  const price = s.price;
  const closing = (price * s.ccPct) / 100;

  // Program terms decide the financed upfront fee, the mortgage insurance rate,
  // and how long that insurance is charged. Conventional at under 20% down
  // resolves to PMI dropping at 78% of the original price, which is the
  // scenario the verified fixtures were built on.
  const terms = programTerms({ program: s.program, price, downPct: s.downPct, vaUsage: s.vaUsage });
  const { down, baseLoan, upfront, loan, miMode } = terms;

  const r = s.rate / 100 / 12;
  const invM = s.inv / 100 / 12;
  const g = s.rentG / 100;
  const sell = s.sellPct / 100;

  const taxM = (price * s.taxPct) / 100 / 12;
  const insM = (price * s.insPct) / 100 / 12;
  // Mortgage insurance accrues on the base loan (before any financed upfront
  // fee), matching the calculator.
  const miM = (baseLoan * (terms.miRate / 100)) / 12;
  const chargesMI = terms.miRate > 0;

  const payment = monthlyPayment(loan, s.rate);

  const homeVal = [];
  for (let y = 0; y <= YEARS; y++) homeVal.push(price * Math.pow(HOME_GROWTH, y));

  let balance = loan;
  let ownerFund = 0;
  let renterFund = down + closing;
  let miDropMonth = 0;
  let flipMonth = 0; // first month owning costs less than rent

  const years = [
    {
      year: 0,
      ownerWealth: homeVal[0] * (1 - sell) - loan,
      renterWealth: renterFund,
      homeVal: homeVal[0],
      balance: loan,
      ownerFund: 0,
    },
  ];

  for (let m = 1; m <= TERM_MONTHS; m++) {
    const rent = s.rent0 * Math.pow(1 + g, Math.floor((m - 1) / 12));

    // MI is assessed on the start-of-month balance. When it stops depends on the
    // program: PMI at 78% of the original price, FHA for the life of the loan
    // (or 132 months at 10% or more down), USDA for the life of the loan.
    let mi = 0;
    if (chargesMI && miDropMonth === 0) {
      if (miChargedThisMonth({ miMode, balance, price, month: m })) mi = miM;
      else miDropMonth = m;
    }

    let pi = 0;
    if (balance > 0) {
      const interest = balance * r;
      const principal = payment - interest;
      if (balance - principal <= 0) {
        pi = interest + balance; // payoff month: interest plus what is left
        balance = 0;
      } else {
        balance -= principal;
        pi = payment;
      }
    }

    const owningCost = pi + taxM + insM + mi;
    const diff = owningCost - rent;
    if (flipMonth === 0 && diff < 0) flipMonth = m;

    // Whichever side pays less this month invests the difference.
    renterFund = renterFund * (1 + invM) + Math.max(0, diff);
    ownerFund = ownerFund * (1 + invM) + Math.max(0, -diff);

    if (m % 12 === 0) {
      const y = m / 12;
      years.push({
        year: y,
        ownerWealth: homeVal[y] * (1 - sell) - balance + ownerFund,
        renterWealth: renterFund,
        homeVal: homeVal[y],
        balance,
        ownerFund,
      });
    }
  }

  for (const row of years) row.advantage = row.ownerWealth - row.renterWealth;

  // First year the owner reaches the renter. The lines can cross more than once,
  // so the verdict at the selected horizon is read separately.
  let breakevenYear = null;
  for (let y = 0; y <= YEARS; y++) {
    if (years[y].advantage >= 0) {
      breakevenYear = y;
      break;
    }
  }
  const leadChangesLater =
    breakevenYear !== null && years.slice(breakevenYear).some((row) => row.advantage < 0);

  return {
    years,
    breakevenYear,
    leadChangesLater,
    payment,
    // Rounds taxes and insurance to whole dollars the way the payment calculator
    // does, so this readout equals the calculator's total to the dollar. The
    // month-by-month simulation above keeps the precise values, so the chart and
    // verdict are unaffected.
    owningMonthOne: payment + Math.round(taxM) + Math.round(insM) + (chargesMI ? miM : 0),
    sellCostRate: sell,
    miDropMonth: miDropMonth || null,
    flipMonth: flipMonth || null,
    chargesMI,
    terms,
  };
}

// Computed once at module load. Deterministic and SSR-safe, so it backs the
// static sr-only table without reacting to inputs.
export const BASE_CASE = simulateRentVsOwn();
