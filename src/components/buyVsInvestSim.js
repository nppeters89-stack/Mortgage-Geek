// Part 2 monthly simulation for the Homes Priced in the S&P 500 tool. This is a
// deliberate, scoped exception to the Geek Charts no-runtime-math rule: because
// Part 2 is now interactive (adjustable rate, early-payoff strategy, reinvest
// toggle), its equity, profit, balance, and side-fund series are computed here
// by a 360-month simulation. The homeVal and spPath arrays remain canonical data
// from geekCharts.js. The base case (6.43%, no extra, no reinvest) reproduces the
// shipped fixtures exactly (see SP500_PART2_FIXTURES in geekCharts.js). Pure and
// SSR-safe: no window, no fetch, no Date.
import { HOMES_IN_SP500 } from "../data/geekCharts";

export const SIM = {
  HP: 500000, // purchase price
  DP: 25000, // down payment
  L0: 475000, // original loan
  RS: 0.10 / 12, // monthly index / side-fund return (10% annual)
  TAXM: 3756 / 12, // monthly property tax (0.75% of price, held flat)
  INSM: 1752 / 12, // monthly homeowner's insurance (0.35%, held flat)
  MIM: (475000 * 0.0037) / 12, // monthly mortgage insurance (0.37% of original loan)
  MI_DROP_BAL: 0.78 * 500000, // 390000: automatic MI termination at 78% of original price
};

const homeVal = HOMES_IN_SP500.homeVal; // canonical, year 0..30
const spPath = HOMES_IN_SP500.spPath; // canonical, year 0..30

// Standard amortized monthly payment on L0 at the given annual rate (percent).
export function monthlyPayment(rate) {
  const i = rate / 100 / 12;
  if (i === 0) return SIM.L0 / 360;
  return (SIM.L0 * i) / (1 - Math.pow(1 + i, -360));
}

// The calculator's conservative default: round the live rate to the nearest
// 0.125 and add one more 0.125 buffer (mirrors CalculatorPage roundRate). Used
// for the slider default when the live conventional rate resolves.
export function roundDefaultRate(liveRate) {
  return Math.round(liveRate / 0.125) * 0.125 + 0.125;
}

// strategy: 'monthly' (extra added to principal each month) | 'annual' (lump each
// 12th month) | 'biweekly' (PAY/12 extra each month; 26 half-payments = 13 full).
export function simulateBuyVsInvest({ rate = 6.43, strategy = "monthly", amount = 0, reinvest = false }) {
  const { L0, RS, TAXM, INSM, MIM, MI_DROP_BAL, DP } = SIM;
  const i = rate / 100 / 12;
  const PAY = monthlyPayment(rate);
  const extraMonthly = strategy === "monthly" ? amount : strategy === "biweekly" ? PAY / 12 : 0;
  const annualLump = strategy === "annual" ? amount : 0;

  let balance = L0, fund = 0;
  let cumI = 0, cumLoanPay = 0, cumTI = 0, cumMI = 0;
  let miDropMonth = null, paidOffMonth = null;

  const years = [];
  const record = (y) => {
    const equity = homeVal[y] - balance;
    const netProfit = equity + fund - DP - cumLoanPay - cumTI - cumMI;
    years[y] = {
      year: y,
      balance: Math.round(balance),
      homeVal: homeVal[y],
      equity: Math.round(equity),
      fund: Math.round(fund),
      loanPayments: Math.round(cumLoanPay),
      taxesIns: Math.round(cumTI),
      mi: Math.round(cumMI),
      netProfit: Math.round(netProfit),
      spPath: spPath[y],
    };
  };
  record(0);

  for (let m = 1; m <= 360; m++) {
    cumTI += TAXM + INSM; // taxes + insurance accrue every month for all 30 years

    if (balance > 0) {
      // MI charged while the start-of-month balance is above 78% of price.
      if (balance > MI_DROP_BAL) cumMI += MIM;
      else if (miDropMonth === null) miDropMonth = m;

      const interest = balance * i;
      const lump = m % 12 === 0 ? annualLump : 0;
      const principalReduction = PAY - interest + extraMonthly + lump;
      if (principalReduction >= balance) {
        // Payoff month: pay interest plus the remaining balance.
        cumLoanPay += interest + balance;
        balance = 0;
        paidOffMonth = m;
        if (miDropMonth === null) miDropMonth = m; // payoff before 78% also ends MI
      } else {
        balance -= principalReduction;
        cumLoanPay += PAY + extraMonthly + lump;
      }
      cumI += interest;
    } else if (reinvest) {
      // Loan is gone: the freed scheduled payment compounds into the side fund.
      const lump = m % 12 === 0 ? annualLump : 0;
      const contribution = PAY + extraMonthly + lump;
      fund = fund * (1 + RS) + contribution;
      cumLoanPay += contribution; // counted as a loan-side outflow per the footnote
    }

    if (m % 12 === 0) record(m / 12);
  }

  return {
    payment: PAY,
    totalInterest: Math.round(cumI),
    totalMI: Math.round(cumMI),
    miDropMonth,       // 1..360, or null if never (loan open past 360)
    paidOffMonth,      // 1..360, or null if not paid off within 30 years
    years,             // [year0..year30]
  };
}

// Interest saved by the extra payments: baseline (no extra) minus current, both
// at the SAME selected rate. Never compared against the 6.43% baseline.
export function interestSavedAt(rate, current) {
  const baseline = simulateBuyVsInvest({ rate, strategy: "monthly", amount: 0, reinvest: false });
  return Math.max(0, baseline.totalInterest - current.totalInterest);
}

// Computed once at module load. Deterministic and SSR-safe, so it backs the
// static base-case readouts and the sr-only table without reacting to inputs.
export const BASE_CASE = simulateBuyVsInvest({ rate: 6.43, strategy: "monthly", amount: 0, reinvest: false });
