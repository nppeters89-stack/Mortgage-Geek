// Mortgage math helpers — amortization schedules, payoff time formatting, and APR calculation.
// These are pure numeric functions with no dependency on theme, hooks, or React.

export function generateAmortData(principal, annualRate, years, options = {}) {
  // Backward compatible: when called without options, behavior is identical to before.
  // Options:
  //   strategy: "none" | "monthly" | "annual" | "biweekly" (default "none")
  //   extraAmount: dollars applied monthly or annually (per strategy)
  //   monthlyMI, miMonths, homeValue, miDropoffType: used to compute MI savings when extra payments
  //     drop LTV below 78% (Conv) or simply shorten the term (FHA life-of-loan).
  const {
    strategy = "none",
    extraAmount = 0,
    monthlyMI = 0,
    miMonths = 0,
    homeValue = 0,
    miDropoffType = "none",
  } = options;

  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  const baseMonthly = monthlyRate > 0
    ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1)
    : principal / n;

  // Bi-weekly collapses to "one extra monthly payment per year", spread across 12 months.
  // Annual P&I impact is identical to true 26-half-payment bi-weekly.
  const effectiveMonthlyExtra =
    strategy === "monthly" ? extraAmount :
    strategy === "biweekly" ? baseMonthly / 12 :
    0;
  const annualExtraOnce = strategy === "annual" ? extraAmount : 0;

  let balance = principal;
  const data = [];
  let totalInterestPaid = 0;
  let payoffMonth = null;
  let miEndMonth = null;
  let miPaidTotal = 0;

  const maxMonths = years * 12;
  let yearInterest = 0;
  let yearPrincipal = 0;

  for (let mIdx = 0; mIdx < maxMonths && balance > 0.01; mIdx++) {
    const monthNumber = mIdx + 1;
    const yr = Math.floor(mIdx / 12) + 1;
    const monthInYear = mIdx % 12;

    const intPmt = balance * monthlyRate;
    let prinPmt = baseMonthly - intPmt + effectiveMonthlyExtra;

    if (annualExtraOnce > 0 && monthInYear === 11) {
      prinPmt += annualExtraOnce;
    }

    if (prinPmt > balance) prinPmt = balance;

    balance -= prinPmt;
    totalInterestPaid += intPmt;
    yearInterest += intPmt;
    yearPrincipal += prinPmt;

    // MI tracking — stop counting MI once it drops off
    if (miEndMonth === null && miDropoffType !== "none") {
      let miStillActive = true;
      if (miDropoffType === "ltv" && homeValue > 0) {
        // Conv PMI auto-drops at 78% LTV of original value (HPA 1998)
        if (balance / homeValue <= 0.78) {
          miStillActive = false;
          miEndMonth = monthNumber;
        }
      } else if (miDropoffType === "term") {
        if (monthNumber > miMonths) {
          miStillActive = false;
          miEndMonth = monthNumber;
        }
      }
      if (miStillActive) {
        miPaidTotal += monthlyMI;
      }
    }

    if (balance <= 0.01 && payoffMonth === null) {
      payoffMonth = monthNumber;
    }

    // Close out the year record at month 12 or on payoff — whichever comes first
    if (monthInYear === 11 || balance <= 0.01) {
      data.push({
        year: yr,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.max(0, Math.round(balance)),
      });
      yearInterest = 0;
      yearPrincipal = 0;
    }
  }

  if (payoffMonth === null) payoffMonth = maxMonths;
  if (miEndMonth === null && miDropoffType !== "none") {
    miEndMonth = payoffMonth;
  }

  return {
    data,
    monthly: baseMonthly,
    payoffMonth,
    totalInterest: Math.round(totalInterestPaid),
    miEndMonth,
    miPaidTotal: Math.round(miPaidTotal),
  };
}

export function formatPayoff(months) {
  if (!months || months <= 0) return "—";
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return mos + " mo";
  if (mos === 0) return yrs + " yr";
  return yrs + " yr " + mos + " mo";
}

// Calculate APR per Reg Z Appendix J using bisection method on a variable payment stream.
// Per Reg Z §1026.4(b)(5), mortgage insurance premiums ARE finance charges for the period
// they are required. So for FHA loans with <10% down (MI for life), monthly MIP must be
// added to every payment. For Conv with PMI, MI runs until ~78% LTV (typically ~10 years
// depending on amortization). For VA, no monthly MI.
//
// The actuarial method solves for the rate where the PV of the actual monthly outflow
// stream (P&I + MI while applicable) equals the net amount financed.
//
// - loanAmount: total financed amount (includes any UFMIP/funding fee rolled in)
// - prepaidFinanceCharges: lender fees + upfront MI + prepaid interest
// - noteRate: contract rate as a percent (e.g., 5.375)
// - termYears: loan term in years
// - monthlyMI: monthly MI dollar amount (0 if none)
// - miMonths: number of months MI is required (use termYears*12 for FHA <10% down)
export function calculateAPR(loanAmount, prepaidFinanceCharges, noteRate, termYears, monthlyMI = 0, miMonths = 0) {
  if (loanAmount <= 0 || noteRate <= 0 || termYears <= 0) return noteRate;

  const n = termYears * 12;
  const monthlyNoteRate = noteRate / 100 / 12;

  // Compute scheduled monthly P&I using the note rate and full loan amount
  const monthlyPI = (loanAmount * monthlyNoteRate * Math.pow(1 + monthlyNoteRate, n))
    / (Math.pow(1 + monthlyNoteRate, n) - 1);

  // Net amount financed = loan minus prepaid finance charges
  const netAmountFinanced = loanAmount - prepaidFinanceCharges;
  if (netAmountFinanced <= 0) return noteRate;

  // PV of the variable payment stream:
  // - Months 1 through miMonths: monthlyPI + monthlyMI
  // - Months miMonths+1 through n: monthlyPI only
  const pvAtRate = (monthlyRate) => {
    if (monthlyRate <= 0) return Infinity;
    // PV of full P&I stream over all n months
    const pvPI = monthlyPI * (1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate;
    // PV of MI stream over miMonths only
    let pvMI = 0;
    if (monthlyMI > 0 && miMonths > 0) {
      const miCount = Math.min(miMonths, n);
      pvMI = monthlyMI * (1 - Math.pow(1 + monthlyRate, -miCount)) / monthlyRate;
    }
    return pvPI + pvMI;
  };

  // Bisection bracket: APR must be ≥ note rate. Upper bound starts at 3x note rate.
  let low = monthlyNoteRate;
  let high = monthlyNoteRate * 3;

  // Expand high if needed (extreme MI scenarios could push APR very high)
  let safety = 0;
  while (pvAtRate(high) > netAmountFinanced && safety < 30) {
    high *= 1.5;
    safety++;
  }

  // Bisection iteration — always converges, no derivative bugs
  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const pv = pvAtRate(mid);
    const diff = pv - netAmountFinanced;
    if (Math.abs(diff) < 0.01) {
      return Math.round(mid * 12 * 10000) / 100; // annualize, 2 decimal places
    }
    if (diff > 0) {
      low = mid;  // PV too high → need higher rate
    } else {
      high = mid; // PV too low → need lower rate
    }
  }

  return Math.round(((low + high) / 2) * 12 * 10000) / 100;
}
