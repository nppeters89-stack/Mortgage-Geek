// Monthly symmetric rent-vs-buy simulation for the Rent vs. Buy tool. Pure and
// SSR-safe: no window, no fetch, no Date, so the prerender renders the base case
// with no network. Colocated with the component that owns it rather than added
// to utils/math.js, matching buyVsInvestSim.js.
//
// The model charges both sides for everything and scores the buyer as if selling
// that year, with selling costs off the top, the strictest honest test:
//   - The renter's portfolio starts with the buyer's down payment plus closing
//     costs invested on day one.
//   - Each month the full cost of owning (P&I, taxes, insurance, MI) is compared
//     against that month's rent, and whichever side pays less invests the
//     difference at the selected return.
//   - Buyer wealth in any year = home value net of selling costs, minus the loan
//     balance, plus the buyer's side fund. Renter wealth = the portfolio.
//
// The default scenario reproduces the verified reference fixtures exactly:
// advantage +$118,714 at year 10, breakeven year 4, owning $2,868/mo, buyer
// $314,658, renter $195,944. See BASE_CASE below.

// Home value compound annual growth: 5.4%, the 1970-2026 CAGR of the Census/HUD
// average sales price of houses sold (FRED: ASPUS). Not user-adjustable.
export const HOME_GROWTH = 1.054;

// Mortgage insurance: 0.37% of the original loan per year, charged while the
// down payment is under 20%, until the balance amortizes to 78% of the original
// purchase price (the automatic termination standard).
const MI_ANNUAL_RATE = 0.0037;
const MI_DROP_RATIO = 0.78;
const MAX_LTV_WITHOUT_MI = 0.8;

const TERM_MONTHS = 360;
const YEARS = 30;

export const DEFAULTS = {
  price: 400000,
  downPct: 5,
  rent0: 2000,
  rate: 6.43,
  rentG: 4.1,
  inv: 10,
  hz: 10,
  taxPct: 0.75,
  insPct: 0.35,
  ccPct: 3,
  sellPct: 6,
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
  hz: [5, 30],
  taxPct: [0, 4],
  insPct: [0, 2],
  ccPct: [0, 8],
  sellPct: [0, 12],
};

export function clampInput(key, value) {
  const bounds = LIMITS[key];
  if (!bounds || !Number.isFinite(value)) return DEFAULTS[key];
  return Math.min(bounds[1], Math.max(bounds[0], value));
}

// Standard amortized monthly payment on the loan at the given annual rate.
export function monthlyPayment(loan, rate) {
  const i = rate / 100 / 12;
  if (i === 0) return loan / TERM_MONTHS;
  return (loan * i * Math.pow(1 + i, TERM_MONTHS)) / (Math.pow(1 + i, TERM_MONTHS) - 1);
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

export function simulateRentVsBuy(input = {}) {
  const s = { ...DEFAULTS, ...input };

  const price = s.price;
  const down = (price * s.downPct) / 100;
  const closing = (price * s.ccPct) / 100;
  const loan = price - down;

  const r = s.rate / 100 / 12;
  const invM = s.inv / 100 / 12;
  const g = s.rentG / 100;
  const sell = s.sellPct / 100;

  const taxM = (price * s.taxPct) / 100 / 12;
  const insM = (price * s.insPct) / 100 / 12;
  const miM = (loan * MI_ANNUAL_RATE) / 12;
  const miDropBal = MI_DROP_RATIO * price;
  const chargesMI = loan / price > MAX_LTV_WITHOUT_MI;

  const payment = monthlyPayment(loan, s.rate);

  const homeVal = [];
  for (let y = 0; y <= YEARS; y++) homeVal.push(price * Math.pow(HOME_GROWTH, y));

  let balance = loan;
  let buyerFund = 0;
  let renterFund = down + closing;
  let miDropMonth = 0;
  let flipMonth = 0; // first month owning costs less than rent

  const years = [
    {
      year: 0,
      buyerWealth: homeVal[0] * (1 - sell) - loan,
      renterWealth: renterFund,
      homeVal: homeVal[0],
      balance: loan,
      buyerFund: 0,
    },
  ];

  for (let m = 1; m <= TERM_MONTHS; m++) {
    const rent = s.rent0 * Math.pow(1 + g, Math.floor((m - 1) / 12));

    // MI is assessed on the start-of-month balance, and stops for good the first
    // month the balance has amortized to 78% of the original price.
    let mi = 0;
    if (chargesMI && miDropMonth === 0) {
      if (balance <= miDropBal) miDropMonth = m;
      else mi = miM;
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
    buyerFund = buyerFund * (1 + invM) + Math.max(0, -diff);

    if (m % 12 === 0) {
      const y = m / 12;
      years.push({
        year: y,
        buyerWealth: homeVal[y] * (1 - sell) - balance + buyerFund,
        renterWealth: renterFund,
        homeVal: homeVal[y],
        balance,
        buyerFund,
      });
    }
  }

  for (const row of years) row.advantage = row.buyerWealth - row.renterWealth;

  // First year the buyer reaches the renter. The lines can cross more than once,
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
    owningMonthOne: payment + taxM + insM + (chargesMI ? miM : 0),
    sellCostRate: sell,
    miDropMonth: miDropMonth || null,
    flipMonth: flipMonth || null,
    chargesMI,
  };
}

// Computed once at module load. Deterministic and SSR-safe, so it backs the
// static sr-only table without reacting to inputs.
export const BASE_CASE = simulateRentVsBuy();
