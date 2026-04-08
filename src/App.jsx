import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────

const P = {
  navy: "#1B3A4B", navyDark: "#0F2530", navyLight: "#2C5468",
  gold: "#B8860B", goldLight: "#D4A843", goldMuted: "#8B6914",
  cream: "#FAF7F2", creamDark: "#F0EBE3",
  warmGray: "#6B6358", warmGrayLight: "#9B9488",
  white: "#FFFFFF", sage: "#5A7A6E",
  text: "#2C2825", textLight: "#5C5650",
};

const F = {
  display: "'Instrument Serif', Georgia, serif",
  body: "'DM Sans', -apple-system, sans-serif",
};

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function generateAmortData(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  const monthly = monthlyRate > 0
    ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1)
    : principal / n;
  let balance = principal;
  const data = [];
  for (let yr = 1; yr <= years; yr++) {
    let yearInterest = 0, yearPrincipal = 0;
    for (let m = 0; m < 12; m++) {
      const intPmt = balance * monthlyRate;
      const prinPmt = monthly - intPmt;
      yearInterest += intPmt;
      yearPrincipal += prinPmt;
      balance -= prinPmt;
    }
    data.push({ year: yr, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest), balance: Math.max(0, Math.round(balance)) });
  }
  return { data, monthly };
}

const HEADSHOT = "data:image/jpeg;base64,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";
// ─── Data ────────────────────────────────────────────────────────────────────

const PRE_CONTRACT_STEPS = [
  { num: "01", title: "Pre-Qualification", short: "Know your numbers before you shop.", detail: "A pre-qualification is your financial snapshot. A loan originator reviews your income, assets, and credit to estimate what you can afford. It's fast, usually free, and gives you a realistic price range before you start house-hunting. This is NOT a guarantee of approval — it's a starting point.", tip: "Get pre-qualified before you fall in love with a house you can't afford.", timeframe: "Same day – 1 week" },
  { num: "02", title: "Pre-Approval", short: "The green light sellers want to see.", detail: "Pre-approval goes deeper than pre-qualification. Your lender verifies your income, pulls your credit, and reviews your financial documents. You receive a conditional commitment letter stating how much you're approved to borrow. In competitive markets, sellers often won't consider offers without one.", tip: "A pre-approval letter typically expires after 60–90 days. Time your application wisely.", timeframe: "1 – 3 business days" },
  { num: "03", title: "House Hunting & Contract", short: "Find the right home, make the right offer.", detail: "With pre-approval in hand, you work with your real estate agent to find a home and submit an offer. Once accepted, you'll sign a purchase agreement that includes the price, closing date, contingencies (like inspections and financing), and earnest money deposit.", tip: "Your earnest money deposit (typically 1–3% of the purchase price) shows the seller you're serious. It's applied toward your down payment at closing.", timeframe: "Weeks to months" },
];

const ACTIVE_LOAN_STEPS = [
  { num: "01", title: "Loan Processing", short: "The paperwork marathon begins.", detail: "Your loan file moves to processing. The processor orders the appraisal, verifies employment and income, reviews bank statements, confirms title history, and assembles your complete file. This is where responsiveness matters — the faster you return documents, the smoother this goes.", tip: "Do NOT change jobs, make large purchases, open new credit, or move money between accounts during processing. Any change can derail your approval.", days: "1–15", phase: "Week 1–2" },
  { num: "02", title: "Underwriting", short: "The gatekeeper makes the call.", detail: "The underwriter is the decision-maker. They analyze your complete file against lending guidelines — credit, income, assets, property — and issue one of three decisions: Approved, Suspended (needs more info), or Denied. Most approvals come with conditions — additional documents or explanations needed before final sign-off.", tip: "\"Clear to close\" is the phrase you want to hear. It means the underwriter has signed off on everything.", days: "15–25", phase: "Week 2–3" },
  { num: "03", title: "Closing", short: "Sign, fund, get the keys.", detail: "You'll receive a Closing Disclosure at least 3 business days before closing, detailing every cost. At the closing table, you'll sign the mortgage note (your promise to repay), the deed of trust (the lien on the property), and dozens of other documents. Bring your ID and a cashier's check (or wire instructions) for your closing costs and down payment.", tip: "Review your Closing Disclosure line by line and compare it to your original Loan Estimate. Question anything that changed.", days: "25–30", phase: "Week 4" },
];

const MORTGAGE_TYPES = [
  { name: "Conventional", tagline: "The standard. Flexible and widely available.", minDown: "3%", credit: "620+", pmi: "Required below 20% down; removable", bestFor: "Borrowers with solid credit and some savings", keyFacts: ["Not government-backed — follows Fannie Mae/Freddie Mac guidelines", "PMI (Private Mortgage Insurance) drops off at 80% LTV", "Available in fixed-rate and adjustable-rate options", "Loan limits vary by county — check your area's conforming limit", "Typically the best rate for borrowers with 740+ credit and 20% down"] },
  { name: "FHA", tagline: "Lower barriers to entry. Government-insured.", minDown: "3.5%", credit: "580+", pmi: "MIP required for life of loan (most cases)", bestFor: "First-time buyers or those rebuilding credit", keyFacts: ["Insured by the Federal Housing Administration", "More lenient on credit scores and debt-to-income ratios", "Upfront MIP (1.75% of loan amount) + annual MIP", "MIP stays for the life of the loan if you put less than 10% down", "Requires the property to meet FHA minimum property standards"] },
  { name: "VA", tagline: "Earned benefit. Zero down payment.", minDown: "0%", credit: "No VA minimum (lenders typically want 580–620+)", pmi: "None — VA Funding Fee instead", bestFor: "Eligible veterans, active-duty, and surviving spouses", keyFacts: ["Guaranteed by the Department of Veterans Affairs", "No down payment required and no monthly mortgage insurance", "VA Funding Fee (1.25–3.3%) can be financed into the loan", "Funding Fee is waived for veterans with service-connected disabilities", "Limits on what the seller can pay in concessions (up to 4%)"] },
  { name: "USDA", tagline: "Rural and suburban. Zero down.", minDown: "0%", credit: "640+ (typical)", pmi: "Guarantee fee (upfront + annual)", bestFor: "Moderate-income buyers in eligible rural areas", keyFacts: ["Backed by the U.S. Department of Agriculture", "Income limits apply — generally 115% of area median income", "Property must be in a USDA-eligible area (more areas qualify than you'd think)", "Upfront guarantee fee (1%) + annual fee (0.35%)", "Cannot be used for investment properties — primary residence only"] },
  { name: "Jumbo", tagline: "Beyond conforming limits. Higher stakes.", minDown: "10–20%", credit: "700+ (typical)", pmi: "Varies by lender", bestFor: "Buyers in high-cost markets or purchasing luxury properties", keyFacts: ["Exceeds conforming loan limits (varies by county)", "Not backed by Fannie Mae or Freddie Mac — higher lender risk", "Stricter requirements: higher credit scores, lower DTI, larger reserves", "Rates can be competitive despite higher risk profile", "May require two appraisals depending on the lender"] },
];

const CLOSING_COSTS = [
  { category: "Lender Fees", items: [
    { name: "Origination Fee", desc: "The lender's charge for originating (creating) your loan. Typically 0.5–1% of the loan amount. On a $300,000 loan, that's $1,500–$3,000. This is negotiable — and it's one of the first places to compare between lenders. Some lenders advertise \"no origination fee\" but make up for it with a higher interest rate." },
    { name: "Discount Points", desc: "Prepaid interest used to buy down your rate. One point = 1% of the loan amount and typically reduces your rate by about 0.25%. On a $300,000 loan, one point costs $3,000. The break-even is usually 4–6 years — if you plan to keep the loan longer than that, points can save you money. If not, skip them." },
    { name: "Underwriting & Processing Fee", desc: "Two fees often listed separately but sometimes bundled together. The underwriting fee ($400–$900) covers the underwriter's analysis of your loan file — the person who ultimately decides whether to approve your loan. The processing fee ($300–$500) covers the work of assembling, organizing, and verifying all your documents before the file reaches underwriting. Some lenders roll both into the origination fee; others itemize them. Either way, you're paying for this work — the question is how it shows up on your Closing Disclosure." },
    { name: "Appraisal Fee", desc: "Ordered and managed by the lender through an Appraisal Management Company (AMC). Pays for an independent, licensed appraiser to determine the property's market value. The lender needs to confirm the home is worth at least what you're borrowing. Typically $400–$700 for a standard single-family home. Complex, rural, or high-value properties may cost more. This is a zero-tolerance fee under TRID — the amount on your Closing Disclosure cannot exceed what was quoted on your Loan Estimate." },
    { name: "Credit Report Fee", desc: "Covers the cost of pulling a tri-merge credit report from all three bureaus (Equifax, Experian, TransUnion). This is one of the first fees you'll pay — often collected at application. Typically $30–$85. Like the appraisal, this is a zero-tolerance fee under TRID." },
    { name: "Rate Lock Fee", desc: "Some lenders charge a fee to lock your interest rate for a set period (typically 30–60 days). Many lenders include this at no extra cost. Extended locks (90+ days) are more likely to carry a fee." },
  ]},
  { category: "Title & Settlement", items: [
    { name: "Title Search", desc: "A deep dive into public records to confirm the seller legally owns the property and to uncover any liens, judgments, or encumbrances. This protects you from inheriting someone else's debts. Typically $150–$400." },
    { name: "Lender's Title Insurance", desc: "A one-time premium that protects the lender's interest in the property if a title defect surfaces after closing — things like undisclosed heirs, forged documents, recording errors, or outstanding liens that weren't caught in the title search. Required on every mortgage. The coverage amount equals the loan balance and decreases as you pay down the mortgage, eventually expiring when the loan is paid off. The cost is based on the loan amount — typically $500–$1,500." },
    { name: "Owner's Title Insurance", desc: "Protects you — the buyer — from the same title defects as the lender's policy, but for your equity in the property. Unlike the lender's policy, owner's title insurance covers you for as long as you own the home and can even protect you after you sell if a claim arises from your period of ownership. This is optional but strongly recommended. It's a one-time cost, and when purchased simultaneously with the lender's policy (called a 'simultaneous issue'), you typically receive a significant discount. Without it, you'd be personally liable for legal costs and potential losses if a title defect surfaces — even one that predates your purchase." },
    { name: "Settlement/Closing Fee", desc: "Paid to the title company or attorney who conducts the closing. They coordinate document signing, fund disbursement, and recording. Typically $500–$1,500. In some states (like Tennessee), an attorney is required to conduct closings." },
  ]},
  { category: "Third-Party Services", items: [
    { name: "Flood Certification", desc: "A third-party service that checks whether the property falls within a FEMA-designated flood zone. If it does, flood insurance is required — and that adds to your monthly payment. Typically $15–$30." },
    { name: "Survey Fee", desc: "A licensed surveyor maps the property boundaries and identifies any encroachments or easements. Not required in every state or for every transaction. Typically $300–$500 when required." },
    { name: "Home Inspection", desc: "Not a lender requirement and not technically a closing cost — you pay this upfront, usually within a week of going under contract. But it's essential. A qualified inspector examines the home's structure, roof, HVAC, plumbing, electrical, and more. Typically $300–$600. Never skip this." },
    { name: "Pest/Termite Inspection", desc: "Checks for wood-destroying organisms (termites, carpenter ants, etc.) and damage they may have caused. Required by VA loans, recommended for all. Typically $75–$150." },
  ]},
  { category: "Government Fees", items: [
    { name: "Recording Fees", desc: "Paid to the county recorder's office to officially record the new deed and mortgage in public records. This is what makes your ownership and the lender's lien a matter of public record. Varies by county — typically $50–$250." },
    { name: "Transfer Taxes / Deed Stamps", desc: "A state and/or local tax triggered by the transfer of property ownership. Rates vary widely — some states don't charge them at all, others can be significant (e.g., 1–2% of the sale price). Transfer taxes are a zero-tolerance fee under TRID. Check your specific state and county." },
    { name: "Mortgage Tax", desc: "Some states impose a separate tax on the mortgage document itself, calculated as a percentage of the loan amount. Not universal — but where it applies, it can be one of the larger closing costs." },
  ]},
  { category: "Prepaids & Escrow", items: [
    { name: "Prepaid Interest", desc: "Per-diem interest from your closing date through the end of that month. For example, if you close on the 15th of a 30-day month, you'll prepay 15 days of interest. This is why closing at the end of the month reduces your out-of-pocket costs — fewer days to prepay." },
    { name: "Homeowners Insurance (Year 1)", desc: "Your first year's premium is typically due in full at or before closing. Required by every lender. Shop around — premiums vary significantly between carriers. On average $1,200–$2,500/year for a standard home, but varies by location, coverage, and property type." },
    { name: "Property Tax Escrow", desc: "You'll prepay several months of property taxes into an escrow account so the lender can pay your next tax bill on time. The exact amount depends on when taxes are due in your area and when you close. Typically 2–6 months of taxes." },
    { name: "Insurance Escrow", desc: "Similar to the tax escrow — a few months of homeowners insurance premiums are deposited into escrow as a cushion. Typically 2–3 months." },
    { name: "Mortgage Insurance Premium (FHA)", desc: "FHA loans require an upfront mortgage insurance premium (UFMIP) of 1.75% of the loan amount, due at closing. On a $300,000 loan, that's $5,250. This can be financed into the loan amount so you don't pay it out of pocket — but you still pay interest on it." },
  ]},
  { category: "Situational Costs", items: [
    { name: "HOA Transfer Fee", desc: "If the property is in a homeowners association, the HOA may charge a transfer or move-in fee when ownership changes. Typically $200–$500. Who pays this (buyer or seller) is negotiable in the purchase contract." },
    { name: "VA Funding Fee", desc: "VA loans require a funding fee (1.25–3.3% of the loan amount) instead of monthly mortgage insurance. The fee varies based on down payment, loan type, and whether it's your first VA loan. Veterans with service-connected disabilities are exempt. Can be financed into the loan." },
    { name: "USDA Guarantee Fee", desc: "USDA loans charge an upfront guarantee fee of 1% of the loan amount, plus a 0.35% annual fee. The upfront fee can be financed. On a $200,000 loan, that's $2,000 upfront and about $58/month." },
    { name: "Condo/Co-op Questionnaire", desc: "If purchasing a condo, the lender requires a questionnaire from the HOA covering financials, insurance, litigation, and owner-occupancy rates. The HOA charges for this — typically $100–$400. Necessary for the lender to approve the project." },
  ]},
];

const TRID_BUCKETS = [
  {
    category: "Zero Tolerance",
    limit: "0%",
    limitNote: "No increase allowed",
    color: "#C0392B",
    examples: "Origination fees, discount points, transfer taxes, appraisal fees, credit report fees, and any fee paid to the lender or its affiliates",
    cure: "Any increase in amount — the lender must reimburse the borrower for the full difference",
    detail: "Fees in this category cannot increase from the Loan Estimate to the Closing Disclosure. Period. The logic is simple: lenders control these fees or have direct access to exact amounts, so there's no excuse for underestimating them. If the actual fee exceeds the estimate, the lender pays the difference back to you — this is called a \"fee cure.\" The only exception is if a valid changed circumstance occurs (like switching loan products or a property change) that triggers a revised Loan Estimate.",
  },
  {
    category: "10% Cumulative Tolerance",
    limit: "10%",
    limitNote: "Aggregate increase",
    color: "#D4A843",
    examples: "Third-party services selected from the lender's written list, title and settlement fees, and recording fees",
    cure: "Sum of these fees exceeds 10% of the original total — lender reimburses the overage",
    detail: "Unlike zero-tolerance fees (assessed individually), these are assessed as a group. The lender adds up all 10%-bucket fees on the Loan Estimate, then compares that total to what you actually pay at closing. If the actual total exceeds the estimate by more than 10%, the lender must cure the overage. For example, if your estimated 10%-bucket total is $2,000 and actual costs come in at $2,250 — that's a 12.5% increase, so the lender owes you $50 (the amount over the $2,200 threshold). Key detail: if you shop for a service and choose a provider not on the lender's written list, that fee shifts out of this bucket and into the unlimited category.",
  },
  {
    category: "No Tolerance (Unlimited)",
    limit: "Unlimited",
    limitNote: "Good faith only",
    color: "#5A7A6E",
    examples: "Prepaid interest, property insurance premiums, property taxes, HOA fees, and services where the borrower chose a provider not on the lender's list",
    cure: "None — as long as the original estimate was disclosed in good faith based on the best information available",
    detail: "These fees can increase by any amount without triggering a fee cure, provided the lender made the original estimate in good faith using the best information reasonably available at the time. The rationale: these are costs the lender doesn't control — insurance premiums are set by carriers, property taxes by municipalities, and prepaid interest depends on your closing date. If you shop for a service (like a home inspection) and pick a provider outside the lender's written list, that fee also moves here — giving you freedom to choose, but removing the lender's obligation to guarantee the price.",
  },
];

const BORROWER_PROFILE = [
  { title: "Credit", sections: [
    { heading: "What Lenders See", content: "Your credit score is a three-digit summary of how you manage debt. Lenders pull from all three bureaus (Equifax, Experian, TransUnion) and typically use the middle score. For joint applications, they use the lower of the two middle scores." },
    { heading: "Score Ranges & Impact", content: "740+ gets the best conventional rates. 700–739 is still strong. 660–699 is workable but costs more in rate or PMI. 620–659 limits your options to FHA or select conventional programs. Below 580, you're looking at very limited options with higher costs." },
    { heading: "What Hurts Most", content: "Late payments (especially recent ones), collections, charge-offs, bankruptcies, and high credit utilization. A single 30-day late payment can drop your score 60–100 points. Maxed-out credit cards signal risk even if you pay on time." },
    { heading: "What Helps", content: "Pay everything on time. Keep credit card balances below 30% of limits (below 10% is ideal). Don't close old accounts — length of credit history matters. Don't open new credit before or during the mortgage process." },
  ]},
  { title: "Income & Employment", sections: [
    { heading: "Stability Is King", content: "Lenders want to see a stable, predictable income stream. Two years of consistent employment history is the standard benchmark. Gaps in employment need to be explained." },
    { heading: "W-2 vs. Self-Employed", content: "W-2 income is straightforward: your base pay plus any consistent overtime, bonuses, or commissions (averaged over 2 years). Self-employed borrowers face more scrutiny — lenders use your tax returns (Schedule C, K-1, or corporate returns) and average your net income over two years. Write-offs reduce your taxable income, but they also reduce your qualifying income." },
    { heading: "Debt-to-Income Ratio (DTI)", content: "DTI is your total monthly debt payments divided by your gross monthly income. Most programs cap at 43–50% total DTI. Front-end DTI (housing costs only) is typically capped at 28–31%. Lower is always better — it gives you room for life." },
  ]},
  { title: "Assets & Reserves", sections: [
    { heading: "What Counts", content: "Checking and savings accounts, investment accounts (stocks, bonds, mutual funds), retirement accounts (401k, IRA — typically 60–70% of vested value), gift funds from family (with proper documentation), and proceeds from the sale of another property." },
    { heading: "Sourcing & Seasoning", content: "Lenders need to trace every dollar. Large deposits (anything that isn't a payroll deposit) need a paper trail. 'Seasoned' funds (in your account for 60+ days) raise fewer questions. Cash deposits are the hardest to document — avoid them during the loan process." },
    { heading: "Reserves", content: "Reserves are the funds left over after your down payment and closing costs. Expressed in months of mortgage payments (PITIA: principal, interest, taxes, insurance, and HOA). Some programs require 2–6 months of reserves. More reserves = lower risk = better terms." },
  ]},
  { title: "Property & Real Estate", sections: [
    { heading: "Primary Residence vs. Investment", content: "Rates and requirements change dramatically based on occupancy. Primary residence gets the best terms. Second homes require higher down payments (typically 10%+). Investment properties require 15–25% down with higher rates." },
    { heading: "If You Already Own Property", content: "Existing mortgages count toward your DTI. Rental income from investment properties can be used to offset those payments — typically 75% of rental income (to account for vacancies and expenses). You'll need leases and tax returns to document rental income." },
    { heading: "The Appraisal", content: "The property itself has to qualify too. The appraiser confirms the home's value supports the loan amount and checks for safety and livability issues. FHA and VA appraisals are stricter than conventional — they require the property to meet minimum standards." },
  ]},
];

const MORTGAGE_STRUCTURE = [
  { title: "Loan Term", content: [
    { heading: "30-Year Fixed", text: "The most common mortgage in America. Lower monthly payments spread over 30 years, but you pay significantly more interest over the life of the loan. For a $300,000 loan at 7%, you'll pay roughly $418,527 in total interest." },
    { heading: "15-Year Fixed", text: "Higher monthly payments, but you build equity faster and pay far less interest. That same $300,000 loan at 6.5% costs roughly $170,000 in total interest — less than half the 30-year. Rates are typically 0.5–0.75% lower than 30-year." },
    { heading: "Other Terms", text: "20-year and 25-year terms split the difference. 10-year terms exist for aggressive payoff strategies. Some lenders offer custom terms. The right term depends on your cash flow, goals, and how long you plan to keep the property." },
  ]},
  { title: "Fixed vs. ARM", content: [
    { heading: "Fixed Rate", text: "Your rate and payment never change for the life of the loan. Predictability is the advantage. In a rising-rate environment, you're locked in. The trade-off: fixed rates are typically higher than the initial rate on an ARM." },
    { heading: "Adjustable Rate (ARM)", text: "A lower initial rate for a fixed period (typically 5, 7, or 10 years), then the rate adjusts periodically based on a market index plus a margin. A 5/1 ARM is fixed for 5 years, then adjusts annually. ARMs have rate caps — limits on how much the rate can change per adjustment and over the life of the loan." },
    { heading: "When ARMs Make Sense", text: "If you plan to sell or refinance within the fixed period. If you need the lower payment to qualify. If you believe rates will decrease. The risk: if rates rise and you're still in the loan when it adjusts, your payment increases — sometimes significantly." },
  ]},
  { title: "Amortization", content: [
    { heading: "The Front-Loaded Interest Problem", text: "In the early years of your mortgage, the vast majority of your payment goes toward interest, not principal. On a 30-year $300,000 loan at 7%, your first payment of $1,996 breaks down to roughly $1,750 in interest and only $246 toward principal. This ratio gradually shifts over time." },
    { heading: "The Tipping Point", text: "It takes roughly 20 years on a 30-year mortgage before you're paying more toward principal than interest each month. This is why extra principal payments early in the loan have an outsized impact — every extra dollar skips past years of scheduled interest." },
    { heading: "Extra Payments", text: "One extra payment per year on a 30-year mortgage can shave 4–5 years off the term. Even rounding up your payment makes a difference. Always specify that extra payments go toward principal, not the next month's payment." },
  ]},
];

const NAV_TOPICS = [
  { id: "getting-started", label: "Getting Started", icon: "🏁", subs: [
    { label: "Pre-Qualification", id: "getting-started", step: 0 },
    { label: "Pre-Approval", id: "getting-started", step: 1 },
    { label: "House Hunting & Contract", id: "getting-started", step: 2 },
  ]},
  { id: "process", label: "The 30-Day Process", icon: "📋", subs: [
    { label: "Loan Processing", id: "process", step: 0 },
    { label: "Underwriting", id: "process", step: 1 },
    { label: "Closing", id: "process", step: 2 },
  ]},
  { id: "types", label: "Mortgage Types", icon: "🏦", subs: [
    { label: "Conventional", id: "types", step: 0 },
    { label: "FHA", id: "types", step: 1 },
    { label: "VA", id: "types", step: 2 },
    { label: "USDA", id: "types", step: 3 },
    { label: "Jumbo", id: "types", step: 4 },
  ]},
  { id: "costs", label: "Closing Costs", icon: "💰", subs: [
    { label: "Lender Fees", id: "costs", step: 0 },
    { label: "Title & Settlement", id: "costs", step: 1 },
    { label: "Third-Party Services", id: "costs", step: 2 },
    { label: "Government Fees", id: "costs", step: 3 },
    { label: "Prepaids & Escrow", id: "costs", step: 4 },
    { label: "TRID Fee Tolerances", id: "costs", step: "trid" },
  ]},
  { id: "profile", label: "Borrower Profile", icon: "👤", subs: [
    { label: "Credit", id: "profile", step: 0 },
    { label: "Income & Employment", id: "profile", step: 1 },
    { label: "Assets & Reserves", id: "profile", step: 2 },
    { label: "Property & Real Estate", id: "profile", step: 3 },
  ]},
  { id: "structure", label: "Mortgage Structure", icon: "🏗", subs: [
    { label: "Loan Term", id: "structure", step: 0 },
    { label: "Fixed vs. ARM", id: "structure", step: 1 },
    { label: "Amortization", id: "structure", step: 2 },
  ]},
  { id: "rates", label: "Interest Rates", icon: "📈", subs: [
    { label: "What Drives Rates", id: "rates", step: 0 },
    { label: "Rate Options & Points", id: "rates", step: 1 },
    { label: "Live Rates", id: "rates", step: 2 },
  ]},
  { id: "checklist", label: "Pre-Approval Checklist", icon: "✅" },
  { id: "next-steps", label: "Get Started", icon: "🚀" },
];

const NAV_TOOLS = [
  { id: "calculator", label: "Payment Calculator", icon: "🧮", href: "/calculator" },
  { id: "prequal", label: "Pre-Qual Simulator", icon: "🎯", href: "/prequal" },
  { id: "glossary", label: "Jargon Decoder", icon: "📖" },
];

// ─── Components ──────────────────────────────────────────────────────────────

function Sidebar({ activeSection, onNavigate, onSubNavigate, mobileOpen, setMobileOpen }) {
  const [expandedNav, setExpandedNav] = useState(null);

  return (
    <>
      <div className="mobile-bar">
        <div className="mobile-bar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>🤓</span>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 18, color: "#fff" }}>The Mortgage Geek</span>
          </div>
          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "0 0 24px" }}>
          <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", margin: "0 auto 16px", border: `3px solid ${P.gold}`, background: "rgba(255,255,255,0.05)" }}>
              <img src={HEADSHOT} alt="The Mortgage Geek" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>🤓</span>
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: 24, color: "#fff", fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>The Mortgage Geek</h1>
            <p style={{ fontSize: 12, color: P.goldLight, fontWeight: 500, marginTop: 8, letterSpacing: 0.5 }}>12+ Years of Mortgage Wisdom</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}><a href="tel:+16156560737" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>(615) 656-0737</a></p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>NMLS# 1119524</p>
          </div>
          <nav style={{ padding: "20px 12px", flex: 1 }}>
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", padding: "0 12px 10px", textTransform: "uppercase" }}>TOPICS</span>
            {NAV_TOPICS.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    onNavigate(item.id);
                    if (item.subs) {
                      setExpandedNav(expandedNav === item.id ? null : item.id);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
                  style={{ justifyContent: "space-between" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.subs && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", transition: "transform 0.2s", transform: expandedNav === item.id ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                  )}
                </button>
                {item.subs && expandedNav === item.id && (
                  <div style={{ paddingLeft: 50, paddingBottom: 4 }}>
                    {item.subs.map((sub, si) => (
                      <button
                        key={si}
                        onClick={() => {
                          onSubNavigate(sub.id, sub.step);
                          setMobileOpen(false);
                        }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "7px 12px", border: "none", borderRadius: 6,
                          background: "transparent", fontFamily: F.body,
                          fontSize: 12, color: "rgba(255,255,255,0.4)",
                          cursor: "pointer", transition: "all 0.15s",
                          borderLeft: "1px solid rgba(255,255,255,0.08)",
                          marginBottom: 1,
                        }}
                        onMouseEnter={(e) => { e.target.style.color = "rgba(255,255,255,0.7)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.4)"; e.target.style.background = "transparent"; }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 12px" }} />
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", padding: "0 12px 10px", textTransform: "uppercase" }}>TOOLS</span>
            {NAV_TOOLS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.href) { window.location.href = item.href; return; }
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <svg width="24" height="26" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 6, opacity: 0.5 }}>
              <path d="M20 0L0 16.5V42H40V16.5L20 0Z" fill="white"/>
              <path d="M20 2.5L2.5 17.5V40H37.5V17.5L20 2.5Z" fill="#0F2530" stroke="white" strokeWidth="0.5"/>
              <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <rect x="12" y="22" width="16" height="3" fill="white"/>
              <rect x="12" y="28" width="16" height="3" fill="white"/>
            </svg>
            <p style={{ fontSize: 10, lineHeight: 1.5, color: "rgba(255,255,255,0.25)" }}>Educational content only.<br />Not financial advice.</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Equal Housing Lender</p>
          </div>
        </div>
      </aside>
      <div className={`sidebar-overlay ${mobileOpen ? "sidebar-overlay-visible" : ""}`} id="sidebar-overlay-drag" onClick={() => { if (mobileOpen) setMobileOpen(false); }} />
    </>
  );
}

function Hero({ onNavigate }) {
  return (
    <section id="hero" style={{ position: "relative", background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`, padding: "80px 40px 64px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 100%, rgba(184,134,11,0.08) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(90,122,110,0.1) 0%, transparent 50%)" }} />
      <div style={{ position: "relative", maxWidth: 680 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.goldLight, marginBottom: 20, opacity: 0.8 }}>MortgageGeek.ai</p>
        <h2 style={{ fontFamily: F.display, fontSize: "clamp(30px, 4.5vw, 50px)", fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
          A mortgage doesn't have to be <span style={{ color: P.goldLight }}>complicated.</span>
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", maxWidth: 540, marginBottom: 36 }}>
          Everything you need to understand the mortgage process — from first conversation to closing day — explained in plain language by someone who's done it thousands of times.
        </p>

        {/* CTA row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <a href="tel:+16156560737" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 24px", borderRadius: 10,
            background: P.gold, color: "#fff",
            fontFamily: F.body, fontSize: 15, fontWeight: 600,
            textDecoration: "none", letterSpacing: 0.3,
            boxShadow: "0 4px 16px rgba(184,134,11,0.3)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Call
          </a>
          <a href="sms:+16156560737&body=Hi%2C%20I%20found%20your%20site%20and%20had%20a%20question%20about%20mortgages." style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 24px", borderRadius: 10,
            background: "rgba(255,255,255,0.12)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            fontFamily: F.body, fontSize: 15, fontWeight: 600,
            textDecoration: "none", letterSpacing: 0.3,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Text
          </a>
          <button onClick={() => onNavigate("getting-started")} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 24px", borderRadius: 10,
            background: "transparent", color: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: F.body, fontSize: 14, fontWeight: 500,
            cursor: "pointer", letterSpacing: 0.2,
          }}>
            Start Learning ↓
          </button>
        </div>

      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ maxWidth: 640, marginBottom: 40 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 10 }}>{eyebrow}</span>
      <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 3.5vw, 36px)", color: P.navy, marginBottom: 10, lineHeight: 1.15 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, lineHeight: 1.7, color: P.warmGray }}>{subtitle}</p>}
    </div>
  );
}

function JourneyOverview({ onNavigate }) {
  const preSteps = [
    { num: "1", label: "Pre-Qualify", section: "getting-started", step: 0 },
    { num: "2", label: "Pre-Approve", section: "getting-started", step: 1 },
    { num: "3", label: "Find a Home", section: "getting-started", step: 2 },
  ];
  const postSteps = [
    { num: "4", label: "Processing", section: "process", step: 0 },
    { num: "5", label: "Underwriting", section: "process", step: 1 },
    { num: "6", label: "Closing", section: "process", step: 2 },
  ];

  const StepRow = ({ steps, color, label }) => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, background: `${color}12`, padding: "3px 12px", borderRadius: 10 }}>{label}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        {steps.map((s, i) => (
          <button key={i} onClick={() => onNavigate(s.section, s.step)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.15s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{s.num}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: P.warmGray, textAlign: "center", lineHeight: 1.3, maxWidth: 70 }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section style={{ padding: "48px 40px 24px" }}>
      <div style={{ maxWidth: 720 }}>
        <div className="content-card" style={{ padding: "28px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 4 }}>Your Mortgage Journey</h3>
            <p style={{ fontSize: 12, color: P.warmGrayLight }}>6 steps from first conversation to getting your keys</p>
          </div>

          <StepRow steps={preSteps} color={P.navy} label="Your Pace" />

          {/* Contract signed divider — perfectly centered */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: P.creamDark }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: P.gold, whiteSpace: "nowrap" }}>▼ CONTRACT SIGNED ▼</span>
            <div style={{ flex: 1, height: 1, background: P.creamDark }} />
          </div>

          <StepRow steps={postSteps} color={P.gold} label="~30 Days" />
        </div>
      </div>
    </section>
  );
}

function PreContract({ navTarget }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (navTarget?.section === "getting-started" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const step = PRE_CONTRACT_STEPS[active];
  return (
    <section id="getting-started" style={{ padding: "64px 40px" }}>
      <SectionHeader
        eyebrow="Steps 1–3 · Before the Clock Starts"
        title="Getting Started"
        subtitle="These steps happen at your own pace — before you're under contract. No deadlines, no pressure. Take the time to get it right."
      />
      <div className="process-grid">
        <div className="process-steps">
          {PRE_CONTRACT_STEPS.map((s, i) => (
            <button key={i} onClick={() => setActive(i)} className={`process-step ${active === i ? "process-step-active" : ""}`}>
              <span className={`process-num ${active === i ? "process-num-active" : ""}`}>{s.num}</span>
              <div>
                <span style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.title}</span>
                <span style={{ display: "block", fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>{s.short}</span>
              </div>
            </button>
          ))}
          {/* Visual transition arrow */}
          <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, background: `${P.gold}15`, padding: "10px 20px", borderRadius: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.gold }}>Contract Signed</span>
              <span style={{ fontSize: 10, color: P.warmGrayLight }}>The 30-day clock starts ↓</span>
            </div>
          </div>
        </div>
        <div className="process-detail">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: F.display, fontSize: 48, color: P.creamDark, lineHeight: 1 }}>{step.num}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: P.sage, background: `${P.sage}15`, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.3 }}>{step.timeframe}</span>
          </div>
          <h3 style={{ fontFamily: F.display, fontSize: 24, color: P.navy, marginBottom: 12 }}>{step.title}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 24 }}>{step.detail}</p>
          <div style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text, fontWeight: 500 }}>{step.tip}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThirtyDayGraphic({ activeStep }) {
  const phases = [
    { label: "Processing", start: 0, end: 50, color: P.navy },
    { label: "Underwriting", start: 50, end: 83, color: P.gold },
    { label: "Closing", start: 83, end: 100, color: P.sage },
  ];
  return (
    <div className="content-card" style={{ padding: "24px", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 2 }}>The 30-Day Timeline</h4>
          <p style={{ fontSize: 12, color: P.warmGrayLight }}>Contract to keys — here's how the time breaks down</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${P.navy}08`, padding: "8px 14px", borderRadius: 8 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke={P.navy} strokeWidth="1.5" fill="none" />
            <path d="M10 5V10.5L13.5 13" stroke={P.navy} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: F.display, fontSize: 22, color: P.navy }}>30</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: P.warmGray, lineHeight: 1.2 }}>days<br/>typical</span>
        </div>
      </div>
      {/* Timeline bar */}
      <div style={{ position: "relative", height: 40, borderRadius: 8, overflow: "hidden", background: P.cream, marginBottom: 12 }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${p.start}%`, width: `${p.end - p.start}%`,
            background: p.color,
            opacity: activeStep === i ? 1 : 0.25,
            transition: "opacity 0.3s",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRight: i < 2 ? "2px solid rgba(255,255,255,0.5)" : "none",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" }}>{p.label}</span>
          </div>
        ))}
      </div>
      {/* Day markers */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px" }}>
        {[{ day: "Day 1", pos: "0%" }, { day: "Day 15", pos: "50%" }, { day: "Day 25", pos: "83%" }, { day: "Day 30", pos: "100%" }].map((m, i) => (
          <span key={i} style={{ fontSize: 10, fontWeight: 600, color: P.warmGrayLight, letterSpacing: 0.3 }}>{m.day}</span>
        ))}
      </div>
    </div>
  );
}

function ActiveLoanProcess({ navTarget }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (navTarget?.section === "process" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const step = ACTIVE_LOAN_STEPS[active];
  return (
    <section id="process" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader
        eyebrow="Steps 4–6 · The Clock Is Ticking"
        title="The 30-Day Loan Process"
        subtitle="Once you're under contract, the countdown begins. Here's what happens during the roughly 30 days between a ratified contract and your closing date."
      />
      <ThirtyDayGraphic activeStep={active} />
      <div className="process-grid">
        <div className="process-steps">
          {ACTIVE_LOAN_STEPS.map((s, i) => (
            <button key={i} onClick={() => setActive(i)} className={`process-step ${active === i ? "process-step-active" : ""}`}>
              <span className={`process-num ${active === i ? "process-num-active" : ""}`}>{s.num}</span>
              <div>
                <span style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.title}</span>
                <span style={{ display: "block", fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>{s.short}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="process-detail">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: F.display, fontSize: 48, color: P.creamDark, lineHeight: 1 }}>{step.num}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: P.sage, background: `${P.sage}15`, padding: "3px 10px", borderRadius: 20 }}>{step.phase}</span>
              <span style={{ fontSize: 10, color: P.warmGrayLight, fontWeight: 500, padding: "0 10px" }}>Days {step.days}</span>
            </div>
          </div>
          <h3 style={{ fontFamily: F.display, fontSize: 24, color: P.navy, marginBottom: 12 }}>{step.title}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 24 }}>{step.detail}</p>
          <div style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text, fontWeight: 500 }}>{step.tip}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MortgageTypes({ navTarget }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (navTarget?.section === "types" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const t = MORTGAGE_TYPES[active];
  return (
    <section id="types" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader eyebrow="Know Your Options" title="Selecting a Mortgage" subtitle="Each loan type exists for a reason. The right one depends on your credit, savings, military status, and where you're buying." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {MORTGAGE_TYPES.map((m, i) => (
          <button key={m.name} onClick={() => setActive(i)} className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}>{m.name}</button>
        ))}
      </div>
      <div className="content-card" style={{ maxWidth: 720 }}>
        <div style={{ padding: "28px 32px 20px", borderBottom: `1px solid ${P.creamDark}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 26, color: P.navy, marginBottom: 4 }}>{t.name}</h3>
          <p style={{ fontSize: 14, color: P.warmGray, fontStyle: "italic" }}>{t.tagline}</p>
        </div>
        <div style={{ padding: "20px 32px", borderBottom: `1px solid ${P.creamDark}` }}>
          {[{ l: "Min. Down Payment", v: t.minDown }, { l: "Credit Requirement", v: t.credit }, { l: "Mortgage Insurance", v: t.pmi }, { l: "Best For", v: t.bestFor }].map((f) => (
            <div key={f.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${P.cream}`, gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: P.warmGrayLight, minWidth: 140 }}>{f.l}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: P.text, flex: 1, textAlign: "right" }}>{f.v}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "20px 32px 28px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.navy, marginBottom: 14 }}>Key Facts</h4>
          {t.keyFacts.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.6, color: P.warmGray, marginBottom: 8 }}>
              <span style={{ color: P.gold, fontWeight: 700, flexShrink: 0 }}>→</span><span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCosts({ navTarget }) {
  const [showDetail, setShowDetail] = useState(false);
  const [openCat, setOpenCat] = useState(0);
  const [openItem, setOpenItem] = useState(null);
  const [openTrid, setOpenTrid] = useState(null);
  const [costPrice, setCostPrice] = useState(350000);
  useEffect(() => {
    if (navTarget?.section === "costs") {
      if (navTarget.step === "trid") { setShowDetail(true); setOpenTrid(0); }
      else if (typeof navTarget.step === "number") { setShowDetail(true); setOpenCat(navTarget.step); setOpenItem(null); }
    }
  }, [navTarget]);

  const lowEst = Math.round(costPrice * 0.02);
  const highEst = Math.round(costPrice * 0.05);

  return (
    <section id="costs" style={{ padding: "64px 40px" }}>
      <SectionHeader eyebrow="Follow the Money" title="All About Closing Costs" subtitle="Every home purchase comes with costs beyond the down payment. Here's the quick version — and a deep dive if you want it." />
      <div style={{ maxWidth: 720 }}>

        {/* Quick Summary */}
        <div className="content-card" style={{ padding: "28px", marginBottom: 24 }}>
          <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 16 }}>Quick Estimate</h4>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray, marginBottom: 20 }}>
            Closing costs typically run <strong>2–5% of the purchase price</strong>. This covers lender fees, title insurance, government recording, prepaid taxes & insurance, and more. The exact amount depends on your loan type, location, and what you negotiate with the seller.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Purchase Price</label>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "9px 12px" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray, marginRight: 4 }}>$</span>
                <input type="text" inputMode="decimal" value={costPrice.toLocaleString("en-US")}
                  onChange={(e) => { const v = parseFloat(e.target.value.replace(/,/g, "")); if (!isNaN(v)) setCostPrice(v); }}
                  style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", width: "100%" }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: P.creamDark, borderRadius: 10, padding: "16px", textAlign: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Low End (2%)</span>
              <span style={{ fontFamily: F.display, fontSize: 26, color: P.navy }}>{fmt(lowEst)}</span>
            </div>
            <div style={{ background: P.creamDark, borderRadius: 10, padding: "16px", textAlign: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>High End (5%)</span>
              <span style={{ fontFamily: F.display, fontSize: 26, color: P.navy }}>{fmt(highEst)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "14px 16px", background: P.cream, borderRadius: 8 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray }}>
              <strong>Geek Tip:</strong> You can often negotiate seller concessions (seller pays part of your closing costs) — especially in a buyer's market. FHA allows up to 6%, VA up to 4%, and Conventional up to 3–9% depending on down payment.
            </p>
          </div>
        </div>

        {/* Toggle for full detail */}
        <button onClick={() => setShowDetail(!showDetail)} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: `1px solid ${P.navy}`,
          background: showDetail ? P.navy : "transparent", color: showDetail ? "#fff" : P.navy,
          fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer",
          marginBottom: 24, transition: "all 0.2s",
        }}>
          {showDetail ? "Hide Detailed Breakdown ↑" : `View All 26 Closing Costs in Detail ↓`}
        </button>

        {/* Full detailed breakdown */}
        {showDetail && (
          <>
            {CLOSING_COSTS.map((cat, ci) => (
              <div key={ci} className="content-card" style={{ marginBottom: 10 }}>
                <button onClick={() => { setOpenCat(openCat === ci ? -1 : ci); setOpenItem(null); }} className={`costs-cat-head ${openCat === ci ? "costs-cat-head-active" : ""}`}>
                  <span>{cat.category}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, opacity: 0.4, fontWeight: 500 }}>{cat.items.length}</span>
                    <span style={{ fontSize: 18, fontWeight: 300 }}>{openCat === ci ? "−" : "+"}</span>
                  </span>
                </button>
                {openCat === ci && cat.items.map((item, ii) => (
                  <div key={ii} style={{ borderTop: `1px solid ${P.cream}` }}>
                    <button onClick={() => setOpenItem(openItem === `${ci}-${ii}` ? null : `${ci}-${ii}`)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", border: "none", background: "transparent", fontFamily: F.body, fontSize: 13, fontWeight: 500, color: P.text, cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: 16, color: P.warmGrayLight }}>{openItem === `${ci}-${ii}` ? "−" : "+"}</span>
                    </button>
                    {openItem === `${ci}-${ii}` && <p style={{ padding: "0 20px 14px 36px", fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>{item.desc}</p>}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* TRID section also inside detail view */}
        {showDetail && (
          <div style={{ marginTop: 48 }}>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 10 }}>Your Protection</span>
              <h3 style={{ fontFamily: F.display, fontSize: "clamp(22px, 3vw, 30px)", color: P.navy, marginBottom: 10, lineHeight: 1.15 }}>TRID Fee Tolerance Matrix</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: P.warmGray }}>
                The TILA-RESPA Integrated Disclosure (TRID) rule — also known as "Know Before You Owe" — is your consumer protection against surprise fee increases at closing. It categorizes every closing cost into one of three tolerance "buckets" that determine how much (if at all) a fee can increase between your Loan Estimate and your Closing Disclosure. If a lender exceeds the allowed tolerance, they must reimburse you — this is called a "fee cure."
              </p>
            </div>

            {TRID_BUCKETS.map((bucket, i) => (
          <div key={i} className="content-card" style={{ marginBottom: 12 }}>
            <button
              onClick={() => setOpenTrid(openTrid === i ? null : i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
                border: "none", background: openTrid === i ? P.navy : "#fff", fontFamily: F.body,
                cursor: "pointer", transition: "all 0.15s", borderRadius: openTrid === i ? "12px 12px 0 0" : 12,
                textAlign: "left",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: openTrid === i ? "rgba(255,255,255,0.12)" : `${bucket.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: F.display, fontSize: 16, fontWeight: 700,
                  color: openTrid === i ? "#fff" : bucket.color,
                }}>{bucket.limit}</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  display: "block", fontSize: 15, fontWeight: 600,
                  color: openTrid === i ? "#fff" : P.navy, marginBottom: 2,
                }}>{bucket.category}</span>
                <span style={{
                  display: "block", fontSize: 12,
                  color: openTrid === i ? "rgba(255,255,255,0.5)" : P.warmGrayLight,
                }}>{bucket.limitNote}</span>
              </div>
              <span style={{
                fontSize: 18, fontWeight: 300,
                color: openTrid === i ? "rgba(255,255,255,0.5)" : P.warmGrayLight,
              }}>{openTrid === i ? "−" : "+"}</span>
            </button>
            {openTrid === i && (
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>{bucket.detail}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: P.cream, borderRadius: 8, padding: "12px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Common Fees in This Bucket</span>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text }}>{bucket.examples}</p>
                  </div>
                  <div style={{ background: P.cream, borderRadius: 8, padding: "12px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>When a Cure Is Triggered</span>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text }}>{bucket.cure}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

            <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 18px", background: P.white, borderRadius: 8, border: `1px solid rgba(0,0,0,0.04)`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
                <strong>Why this matters to you:</strong> Compare your final Closing Disclosure line-by-line against your original Loan Estimate. If fees in the zero-tolerance bucket increased at all, or if 10%-bucket fees collectively jumped more than 10%, your lender owes you money. You have 3 business days to review your Closing Disclosure before closing — use them.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BorrowerProfile({ navTarget }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (navTarget?.section === "profile" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  return (
    <section id="profile" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader eyebrow="What Lenders Evaluate" title="Your Borrower Profile" subtitle="Every lending decision comes down to four pillars." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {BORROWER_PROFILE.map((b, i) => (
          <button key={b.title} onClick={() => setActive(i)} className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}>{b.title}</button>
        ))}
      </div>
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
        {BORROWER_PROFILE[active].sections.map((s, i) => (
          <div key={i} className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>{s.heading}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{s.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AmortizationChart({ principal = 300000, rate = 7, years = 30 }) {
  const { data } = useMemo(() => generateAmortData(principal, rate, years), [principal, rate, years]);
  const crossover = data.findIndex((d) => d.principal > d.interest);

  const CustomTooltip = ({ active: a, payload, label }) => {
    if (!a || !payload?.length) return null;
    return (
      <div style={{ background: P.navyDark, borderRadius: 8, padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", minWidth: 180 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Year {label}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: P.navy, flexShrink: 0 }} />
          Principal: {fmt(payload.find((p) => p.dataKey === "principal")?.value || 0)}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: P.gold, flexShrink: 0 }} />
          Interest: {fmt(payload.find((p) => p.dataKey === "interest")?.value || 0)}
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          Balance: {fmt(payload.find((p) => p.dataKey === "balance")?.value || 0)}
        </p>
      </div>
    );
  };

  return (
    <div className="content-card" style={{ maxWidth: 720, padding: "28px 24px" }}>
      <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 4 }}>How Your Payment Shifts Over Time</h4>
      <p style={{ fontSize: 12, color: P.warmGrayLight, lineHeight: 1.5, marginBottom: 16 }}>
        {fmt(principal)} loan at {rate}% over {years} years — watch how interest dominates early, then principal takes over
      </p>
      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: P.warmGray }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: P.navy }} /> Principal Paid
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: P.warmGray }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: P.gold }} /> Interest Paid
        </span>
      </div>
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPrin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.navy} stopOpacity={0.6} />
                <stop offset="100%" stopColor={P.navy} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradInt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.gold} stopOpacity={0.6} />
                <stop offset="100%" stopColor={P.gold} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: P.warmGrayLight, fontSize: 11 }} axisLine={{ stroke: "rgba(0,0,0,0.08)" }} tickLine={false} />
            <YAxis tick={{ fill: P.warmGrayLight, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="interest" stackId="1" stroke={P.gold} fill="url(#gradInt)" strokeWidth={2} />
            <Area type="monotone" dataKey="principal" stackId="1" stroke={P.navy} fill="url(#gradPrin)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20, padding: "16px 18px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
          <strong>The crossover:</strong> On this loan, it takes about {crossover > 0 ? crossover + 1 : Math.round(years * 0.6)} years before you're paying more toward principal than interest each month. Every extra dollar you pay toward principal early on saves you multiples in interest over the life of the loan.
        </p>
      </div>
    </div>
  );
}

function MortgageStructure({ navTarget }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (navTarget?.section === "structure" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const isAmort = MORTGAGE_STRUCTURE[active].title === "Amortization";
  return (
    <section id="structure" style={{ padding: "64px 40px" }}>
      <SectionHeader eyebrow="Under the Hood" title="Mortgage Structure" subtitle="The mechanics of how your mortgage actually works." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {MORTGAGE_STRUCTURE.map((s, i) => (
          <button key={s.title} onClick={() => setActive(i)} className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}>{s.title}</button>
        ))}
      </div>
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16, marginBottom: isAmort ? 28 : 0 }}>
        {MORTGAGE_STRUCTURE[active].content.map((c, i) => (
          <div key={i} className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>{c.heading}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{c.text}</p>
          </div>
        ))}
      </div>
      {isAmort && <AmortizationChart />}
    </section>
  );
}

function InterestRates({ navTarget }) {
  const [activeTab, setActiveTab] = useState(0);
  const [liveRates, setLiveRates] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);

  useEffect(() => {
    if (navTarget?.section === "rates" && typeof navTarget.step === "number") {
      setActiveTab(navTarget.step);
      if (navTarget.step === 2 && !liveRates && !rateLoading) fetchRates();
    }
  }, [navTarget]);

  const tabs = ["What Drives Rates", "Rate Options & Points", "Live Rates"];

  const fetchRates = async () => {
    setRateLoading(true);
    setRateError(null);
    try {
      const res = await fetch('/api/rates');
      const data = await res.json();
      if (data.success) {
        setLiveRates(data);
      } else {
        setRateError(data.error || 'Unable to fetch rates.');
      }
    } catch (err) {
      setRateError('Unable to connect. Please try again.');
    }
    setRateLoading(false);
  };

  const handleTabClick = (i) => {
    setActiveTab(i);
    if (i === 2 && !liveRates && !rateLoading) fetchRates();
  };

  // Sample rate sheet for a $300k conventional loan, 30yr fixed, 740+ credit, 80% LTV
  const rateSheet = [
    { rate: "5.750%", points: 2.125, cost: 6375, payment: 1751, savings: "Lowest payment — but heavy upfront cost" },
    { rate: "5.875%", points: 1.750, cost: 5250, payment: 1773, savings: "Strong rate with moderate buy-down" },
    { rate: "6.000%", points: 1.250, cost: 3750, payment: 1799, savings: "Good balance of rate and upfront cost" },
    { rate: "6.125%", points: 0.875, cost: 2625, payment: 1824, savings: "Slight buy-down, minimal out-of-pocket" },
    { rate: "6.250%", points: 0.375, cost: 1125, payment: 1847, savings: "Near-par rate — very little upfront" },
    { rate: "6.375%", points: 0.000, cost: 0, payment: 1871, savings: "Par rate — no points, no credits" },
    { rate: "6.500%", points: -0.250, cost: -750, payment: 1896, savings: "Lender credit of $750 toward closing costs" },
    { rate: "6.750%", points: -0.750, cost: -2250, payment: 1948, savings: "Lender credit of $2,250 — higher rate, lower cash to close" },
  ];

  return (
    <section id="rates" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader
        eyebrow="The Number Everyone Asks About"
        title="Interest Rates"
        subtitle="Your interest rate isn't one number — it's a spectrum of options. Understanding what drives it and how to read a rate sheet puts you in control."
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => handleTabClick(i)} className={`tab-btn ${activeTab === i ? "tab-btn-active" : ""}`}>{t}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>It's Not Just "The Rate"</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>
              There is no single mortgage rate. On any given day, lenders offer a menu of rates — each paired with a different combination of discount points or lender credits. A lower rate costs more upfront (points), while a higher rate can actually put money back in your pocket (credits toward closing costs). Your job isn't to find "the lowest rate" — it's to find the right trade-off between your upfront costs and your monthly payment.
            </p>
          </div>
          <div className="content-card" style={{ padding: "24px 28px" }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>What Determines Your Rate</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>
              Your individual rate is determined by a combination of market conditions and your personal risk profile. Here are the primary factors, roughly in order of impact:
            </p>
            {[
              { factor: "The Bond Market (MBS)", desc: "Mortgage rates track mortgage-backed securities (MBS), not the Fed Funds rate directly. When investors demand higher yields on MBS, rates go up. The Fed influences this indirectly, but the bond market drives daily rate movement." },
              { factor: "Credit Score", desc: "The single biggest borrower-controlled factor. A 740+ score gets the best pricing. Every 20-point drop below that adds cost — either in rate or points. The difference between a 740 and a 660 can be 0.5–1.0% in rate." },
              { factor: "Loan-to-Value (LTV)", desc: "How much you're borrowing relative to the home's value. 80% LTV (20% down) gets the best pricing. Higher LTV = higher risk = higher rate or PMI." },
              { factor: "Loan Type & Term", desc: "FHA rates are often lower than conventional (government backing reduces lender risk). 15-year rates are lower than 30-year. ARMs start lower than fixed rates." },
              { factor: "Property Type & Use", desc: "Single-family primary residence gets the best rate. Condos, multi-units, second homes, and investment properties all carry pricing adjustments (called LLPAs — Loan-Level Price Adjustments)." },
              { factor: "Debt-to-Income Ratio", desc: "Higher DTI can trigger pricing adjustments on some loan programs, especially above 40–45%." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <span style={{ color: P.gold, fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>→</span>
                <div>
                  <span style={{ fontWeight: 600, color: P.text, fontSize: 13 }}>{item.factor}:</span>{" "}
                  <span style={{ fontSize: 13, color: P.warmGray, lineHeight: 1.6 }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
              <strong>The Fed doesn't set mortgage rates.</strong> The Federal Reserve sets the federal funds rate (currently 3.50–3.75%), which directly affects short-term rates like credit cards and HELOCs. Mortgage rates are long-term rates driven by the bond market. The Fed influences them indirectly — but they don't move in lockstep.
            </p>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div style={{ maxWidth: 800 }}>
          <div className="content-card" style={{ padding: "24px 28px", marginBottom: 16 }}>
            <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 4 }}>Reading a Rate Sheet</h4>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray, marginBottom: 4 }}>
              Below is a simplified example of how rate options work on a <strong>$300,000 conventional 30-year fixed loan</strong> (740+ credit, 80% LTV). Every rate below is available on the same day — you choose where on the spectrum to land.
            </p>
            <p style={{ fontSize: 12, color: P.warmGrayLight, fontStyle: "italic" }}>
              Illustrative example only — actual pricing varies by lender, day, and borrower profile.
            </p>
          </div>
          {/* Rate grid */}
          <div className="content-card" style={{ overflow: "hidden", padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr", padding: "12px 20px", background: P.navy, gap: 8 }}>
              {["Rate", "Points", "Cost / Credit", "Payment", "What It Means"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 }}>{h}</span>
              ))}
            </div>
            {rateSheet.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr", padding: "12px 20px", gap: 8,
                borderBottom: `1px solid ${P.cream}`, alignItems: "center",
                background: row.points === 0 ? `${P.gold}08` : "transparent",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: P.navy, fontFamily: F.display }}>{row.rate}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: row.points < 0 ? P.sage : row.points === 0 ? P.warmGray : P.goldMuted }}>
                  {row.points > 0 ? `${row.points} pts` : row.points === 0 ? "Par" : `(${Math.abs(row.points)}) credit`}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: row.cost < 0 ? P.sage : row.cost === 0 ? P.warmGray : P.text }}>
                  {row.cost < 0 ? `-${fmt(Math.abs(row.cost))}` : row.cost === 0 ? "$0" : fmt(row.cost)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{fmt(row.payment)}</span>
                <span style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.4 }}>{row.savings}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
              <strong>The par rate</strong> (highlighted above) is the rate where you pay zero points and receive zero credits — it's the "break-even" price. Rates above par give you credits (the lender pays you). Rates below par cost you points (you pay the lender). There's no universally "best" option — it depends on how long you plan to keep the loan and how much cash you have for closing.
            </p>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div style={{ maxWidth: 720 }}>
          <div className="content-card" style={{ padding: "28px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 4 }}>Current Market Rates</h4>
                <p style={{ fontSize: 12, color: P.warmGrayLight }}>
                  {liveRates ? liveRates.date : "National averages updated every business day"}
                </p>
              </div>
              {liveRates && (
                <button onClick={fetchRates} disabled={rateLoading} style={{
                  padding: "6px 14px", borderRadius: 6, border: `1px solid ${P.creamDark}`,
                  background: P.cream, fontFamily: F.body, fontSize: 11, fontWeight: 600,
                  color: P.warmGray, cursor: rateLoading ? "wait" : "pointer",
                }}>
                  {rateLoading ? "Updating..." : "↻ Refresh"}
                </button>
              )}
            </div>

            {rateLoading && !liveRates && (
              <div style={{ textAlign: "center", padding: "48px 0", color: P.warmGrayLight }}>
                <div style={{ fontSize: 24, marginBottom: 8, display: "inline-block", animation: "ratespin 1s linear infinite" }}>⟳</div>
                <p style={{ fontSize: 13 }}>Fetching today's rates...</p>
                <style>{`@keyframes ratespin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {rateError && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 13, color: P.warmGray, marginBottom: 12 }}>{rateError}</p>
                <button onClick={fetchRates} style={{
                  padding: "8px 20px", borderRadius: 8, border: `1px solid ${P.navy}`,
                  background: "transparent", fontFamily: F.body, fontSize: 13,
                  fontWeight: 600, color: P.navy, cursor: "pointer",
                }}>
                  Try Again
                </button>
              </div>
            )}

            {liveRates && liveRates.rates && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {liveRates.rates.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center",
                    padding: "16px 20px", borderRadius: 10, gap: 14,
                    background: i === 0 ? P.navy : P.cream,
                    border: i === 0 ? "none" : `1px solid ${P.creamDark}`,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: i === 0 ? "#fff" : P.navy }}>{r.label}</span>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: F.display, fontSize: 28, color: i === 0 ? "#fff" : P.navy }}>{r.rate}%</span>
                      {r.change && (
                        <span style={{
                          fontSize: 12, fontWeight: 600,
                          color: i === 0
                            ? (parseFloat(r.change) <= 0 ? "#7DCEA0" : "#F1948A")
                            : (parseFloat(r.change) <= 0 ? "#27AE60" : "#E74C3C"),
                        }}>
                          {parseFloat(r.change) > 0 ? "+" : ""}{r.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {liveRates && (
              <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 14 }}>
                Source: <a href="https://www.mortgagenewsdaily.com/mortgage-rates" target="_blank" rel="noopener noreferrer" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>{liveRates.source}</a>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
              <strong>These are national averages</strong> — your actual rate will differ based on your credit, down payment, loan type, and lender. Use these as a benchmark, not a guarantee. The best way to know your real rate? Get pre-approved.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function CalcInput({ label, value, onChange, prefix, suffix, step = 1, min = 0, max = 99999999, comma }) {
  const fmtComma = (v) => comma ? Number(v).toLocaleString("en-US") : String(v);
  const [localVal, setLocalVal] = useState(fmtComma(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setLocalVal(fmtComma(value)); }, [value, focused]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setLocalVal(raw);
    const cleaned = comma ? raw.replace(/,/g, "") : raw;
    const v = parseFloat(cleaned);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  };

  const handleFocus = () => {
    setFocused(true);
    setLocalVal(String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    const cleaned = comma ? localVal.replace(/,/g, "") : localVal;
    const v = parseFloat(cleaned);
    if (isNaN(v) || v < min) { onChange(min); setLocalVal(fmtComma(min)); }
    else if (v > max) { onChange(max); setLocalVal(fmtComma(max)); }
    else { onChange(v); setLocalVal(fmtComma(v)); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 8, overflow: "hidden", background: P.cream }}>
        {prefix && <span style={{ padding: "9px 0 9px 12px", fontSize: 14, fontWeight: 600, color: P.warmGray }}>{prefix}</span>}
        <input type={comma ? "text" : "number"} inputMode="decimal" value={localVal} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} step={step}
          style={{ flex: 1, border: "none", background: "transparent", padding: "9px 12px", fontSize: 15, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", width: "100%" }} />
        {suffix && <span style={{ padding: "9px 12px 9px 0", fontSize: 14, fontWeight: 600, color: P.warmGray }}>{suffix}</span>}
      </div>
    </div>
  );
}

function PreApprovalChecklist() {
  const [checkedItems, setCheckedItems] = useState({});
  const toggle = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));

  const categories = [
    { title: "Income & Employment", items: [
      { id: "paystubs", label: "Most recent 30 days of pay stubs" },
      { id: "w2", label: "W-2s from the past 2 years" },
      { id: "tax_returns", label: "Federal tax returns (past 2 years) — all pages" },
      { id: "self_employed", label: "If self-employed: business tax returns + year-to-date profit & loss" },
      { id: "other_income", label: "Other income docs: Social Security, pension, rental income, alimony, etc." },
    ]},
    { title: "Assets & Bank Statements", items: [
      { id: "bank_statements", label: "Most recent 2 months of bank statements — all pages, all accounts" },
      { id: "retirement", label: "Retirement / investment account statements (most recent quarter)" },
      { id: "gift_letter", label: "If using gift funds: gift letter + proof of donor's ability + transfer documentation" },
      { id: "large_deposits", label: "Explanation for any large deposits (outside of regular payroll)" },
    ]},
    { title: "Identity & Residency", items: [
      { id: "drivers_license", label: "Valid government-issued photo ID (driver's license or passport)" },
      { id: "ssn", label: "Social Security number (for credit pull authorization)" },
      { id: "address_history", label: "Addresses for the past 2 years" },
      { id: "rent_history", label: "Landlord contact info or 12 months of rent payment proof (if renting)" },
    ]},
    { title: "Property & Debts", items: [
      { id: "purchase_contract", label: "Signed purchase contract (once you're under contract)" },
      { id: "real_estate_owned", label: "Details on any real estate you currently own" },
      { id: "debt_info", label: "Monthly debt obligations: car payments, student loans, credit cards, child support" },
      { id: "bankruptcy", label: "If applicable: bankruptcy discharge papers, divorce decree" },
    ]},
    { title: "VA Borrowers (if applicable)", items: [
      { id: "dd214", label: "DD-214 (Certificate of Release or Discharge)" },
      { id: "coe", label: "Certificate of Eligibility (COE) — or I can pull this for you" },
      { id: "disability_letter", label: "If exempt from funding fee: VA disability rating letter" },
    ]},
  ];

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section id="checklist" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader eyebrow="Get Organized" title="Pre-Approval Checklist" subtitle="Gathering these documents before you apply will speed up your approval and reduce back-and-forth. Check them off as you go." />
      <div style={{ maxWidth: 720 }}>
        {/* Progress bar */}
        <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: P.navy }}>{checkedCount} of {totalItems} items ready</span>
            <span style={{ fontSize: 12, color: P.warmGrayLight }}>{totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0}%</span>
          </div>
          <div style={{ height: 8, background: P.creamDark, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(checkedCount / totalItems) * 100}%`, background: checkedCount === totalItems ? P.sage : P.gold, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          {checkedCount === totalItems && (
            <p style={{ fontSize: 12, color: P.sage, fontWeight: 600, marginTop: 8, textAlign: "center" }}>You're ready to apply! Reach out and let's get started.</p>
          )}
        </div>

        {categories.map((cat, ci) => (
          <div key={ci} className="content-card" style={{ padding: "20px 24px", marginBottom: 10 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: P.navy, marginBottom: 12 }}>{cat.title}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cat.items.map((item) => (
                <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, lineHeight: 1.5, color: checkedItems[item.id] ? P.warmGrayLight : P.text }}>
                  <input type="checkbox" checked={!!checkedItems[item.id]} onChange={() => toggle(item.id)}
                    style={{ marginTop: 3, accentColor: P.gold, flexShrink: 0 }} />
                  <span style={{ textDecoration: checkedItems[item.id] ? "line-through" : "none" }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
            <strong>Don't have everything?</strong> That's okay — you don't need every single item to get started. A pre-qualification conversation only needs the basics. We can work through the rest as your application progresses.
          </p>
        </div>
      </div>
    </section>
  );
}

function NextSteps() {
  return (
    <section id="next-steps" style={{ padding: "64px 40px" }}>
      <div style={{ maxWidth: 720 }}>
        <div style={{
          background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`,
          borderRadius: 16, padding: "48px 36px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 100%, rgba(184,134,11,0.1) 0%, transparent 50%)" }} />
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldLight, display: "block", marginBottom: 12 }}>Ready?</span>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px, 3.5vw, 34px)", color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
              Let's figure out your next move.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", marginBottom: 32, maxWidth: 480 }}>
              Whether you're ready to get pre-approved or just have a quick question — I'm here. No pressure, no obligation. Just a conversation.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="tel:+16156560737" style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10,
                background: P.gold, textDecoration: "none", color: "#fff",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>Call me</span>
                  <span style={{ display: "block", fontSize: 12, opacity: 0.7 }}>(615) 656-0737 — let's talk through your scenario</span>
                </div>
              </a>

              <a href="sms:+16156560737&body=Hi%2C%20I%20found%20your%20site%20and%20had%20a%20question%20about%20mortgages." style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none", color: "#fff",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>Text me</span>
                  <span style={{ display: "block", fontSize: 12, opacity: 0.5 }}>Quick question? Shoot me a text — I respond fast</span>
                </div>
              </a>

              <div className="nextsteps-tools" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <a href="/prequal" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none", color: "rgba(255,255,255,0.7)",
                }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <div>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>What can I afford?</span>
                    <span style={{ display: "block", fontSize: 11, opacity: 0.5 }}>Pre-Qual Simulator</span>
                  </div>
                </a>

                <a href="/calculator" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none", color: "rgba(255,255,255,0.7)",
                }}>
                  <span style={{ fontSize: 20 }}>🧮</span>
                  <div>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>Run the numbers</span>
                    <span style={{ display: "block", fontSize: 11, opacity: 0.5 }}>Payment Calculator</span>
                  </div>
                </a>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 24, textAlign: "center" }}>NMLS# 1119524 · Equal Housing Lender</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolsCTA() {
  const tools = [
    {
      icon: "🧮", title: "Payment Calculator", href: "/calculator",
      desc: "Same house, three programs. Compare Conventional, FHA, and VA payment breakdowns with live rates.",
    },
    {
      icon: "🎯", title: "Pre-Qual Simulator", href: "/prequal",
      desc: "Enter your income and debts — see what you can afford under each loan program with real DTI limits.",
    },
  ];
  return (
    <section id="tools-cta" style={{ padding: "64px 40px", background: P.creamDark }}>
      <div style={{ maxWidth: 720 }}>
        <SectionHeader eyebrow="Your Toolkit" title="Run the Numbers" subtitle="Two free tools built by a loan originator — not a marketing team. No login, no data collected, no strings attached." />
        <div className="tools-grid-cta" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {tools.map((t, i) => (
            <a key={i} href={t.href} className="content-card" style={{
              display: "flex", flexDirection: "column", padding: 0, textDecoration: "none",
              overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "28px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>{t.icon}</span>
                <span style={{ fontFamily: F.display, fontSize: 20, color: "#fff" }}>{t.title}</span>
              </div>
              <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray, flex: 1 }}>{t.desc}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 13, fontWeight: 600, color: P.gold }}>
                  Open {t.title.split(" ")[0]} →
                </span>
              </div>
            </a>
          ))}
        </div>
        <style>{`@media (max-width: 500px) { .tools-grid-cta, .nextsteps-tools { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </section>
  );
}

function PreQualPage() {
  const [grossIncome, setGrossIncome] = useState(6500);
  const [monthlyDebts, setMonthlyDebts] = useState(450);
  const [downPct, setDownPct] = useState(5);
  const [showStudentCalc, setShowStudentCalc] = useState(false);
  const [studentBalance, setStudentBalance] = useState(0);
  const [convRate, setConvRate] = useState(6.75);
  const [fhaRate, setFhaRate] = useState(6.25);
  const [vaRate, setVaRate] = useState(6.25);
  const [vaUsage, setVaUsage] = useState("first");
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville/Davidson");
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const insRate = 0.35;

  // Default 2026 loan limits (1-unit)
  const DEFAULT_LIMITS = { fha: 541287, conv: 832750, va: 832750 };
  const NASH_MSA_LIMITS = { fha: 1029250, conv: 1029250, va: 1029250 };
  const ATL_MSA_LIMITS = { fha: 718750, conv: 832750, va: 832750 };

  const PQ_TAX_RATES = {
    AL: { name: "Alabama", rate: 0.41, metros: [
      { name: "Birmingham", rate: 0.52 }, { name: "Huntsville", rate: 0.46 }, { name: "Mobile", rate: 0.48 },
    ]},
    AK: { name: "Alaska", rate: 1.19 },
    AZ: { name: "Arizona", rate: 0.62, metros: [
      { name: "Phoenix/Maricopa", rate: 0.64 }, { name: "Tucson/Pima", rate: 0.93 },
    ]},
    AR: { name: "Arkansas", rate: 0.62 },
    CA: { name: "California", rate: 0.71, metros: [
      { name: "Los Angeles", rate: 0.76, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "San Francisco", rate: 0.68, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "San Diego", rate: 0.73, limits: { fha: 1006250, conv: 1006250, va: 1006250 } },
      { name: "Orange County", rate: 0.69, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "Sacramento", rate: 0.87 }, { name: "Riverside", rate: 0.95 },
    ]},
    CO: { name: "Colorado", rate: 0.51, metros: [
      { name: "Denver", rate: 0.54, limits: { fha: 862500, conv: 862500, va: 862500 } },
      { name: "Colorado Springs", rate: 0.54 }, { name: "Aurora/Arapahoe", rate: 0.55, limits: { fha: 862500, conv: 862500, va: 862500 } },
    ]},
    CT: { name: "Connecticut", rate: 2.15 },
    DE: { name: "Delaware", rate: 0.57 },
    FL: { name: "Florida", rate: 0.86, metros: [
      { name: "Miami-Dade", rate: 0.97 }, { name: "Jacksonville/Duval", rate: 0.89 }, { name: "Tampa/Hillsborough", rate: 0.95 },
      { name: "Orlando/Orange", rate: 0.89 }, { name: "Palm Beach", rate: 1.05 }, { name: "Broward/Ft Lauderdale", rate: 1.02 },
    ]},
    GA: { name: "Georgia", rate: 0.92, metros: [
      { name: "Atlanta/Fulton", rate: 1.11, limits: ATL_MSA_LIMITS }, { name: "Cobb County", rate: 0.95, limits: ATL_MSA_LIMITS },
      { name: "DeKalb County", rate: 1.20, limits: ATL_MSA_LIMITS }, { name: "Gwinnett County", rate: 1.02, limits: ATL_MSA_LIMITS },
    ]},
    HI: { name: "Hawaii", rate: 0.28 }, ID: { name: "Idaho", rate: 0.63 },
    IL: { name: "Illinois", rate: 2.07, metros: [
      { name: "Chicago/Cook", rate: 2.10 }, { name: "DuPage County", rate: 1.96 }, { name: "Lake County", rate: 2.68 }, { name: "Will County", rate: 2.42 },
    ]},
    IN: { name: "Indiana", rate: 0.85, metros: [
      { name: "Indianapolis/Marion", rate: 1.02 }, { name: "Fort Wayne/Allen", rate: 0.88 },
    ]},
    IA: { name: "Iowa", rate: 1.57 },
    KS: { name: "Kansas", rate: 1.41, metros: [
      { name: "Kansas City/Johnson", rate: 1.37 }, { name: "Wichita/Sedgwick", rate: 1.48 },
    ]},
    KY: { name: "Kentucky", rate: 0.86, metros: [
      { name: "Louisville/Jefferson", rate: 1.06 }, { name: "Lexington/Fayette", rate: 0.92 },
    ]},
    LA: { name: "Louisiana", rate: 0.55 }, ME: { name: "Maine", rate: 1.30 },
    MD: { name: "Maryland", rate: 1.07, metros: [
      { name: "Baltimore City", rate: 2.25 }, { name: "Montgomery County", rate: 0.93, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "Prince George's", rate: 1.15, limits: { fha: 1149825, conv: 1149825, va: 1149825 } }, { name: "Anne Arundel", rate: 0.94 },
    ]},
    MA: { name: "Massachusetts", rate: 1.23, metros: [
      { name: "Boston/Suffolk", rate: 0.89, limits: { fha: 914250, conv: 914250, va: 914250 } },
      { name: "Middlesex County", rate: 1.20, limits: { fha: 914250, conv: 914250, va: 914250 } }, { name: "Worcester County", rate: 1.35 },
    ]},
    MI: { name: "Michigan", rate: 1.54, metros: [
      { name: "Detroit/Wayne", rate: 2.58 }, { name: "Oakland County", rate: 1.49 }, { name: "Grand Rapids/Kent", rate: 1.31 },
    ]},
    MN: { name: "Minnesota", rate: 1.12, metros: [
      { name: "Minneapolis/Hennepin", rate: 1.18 }, { name: "St Paul/Ramsey", rate: 1.24 },
    ]},
    MS: { name: "Mississippi", rate: 0.65 },
    MO: { name: "Missouri", rate: 0.97, metros: [
      { name: "St Louis City", rate: 1.38 }, { name: "Kansas City/Jackson", rate: 1.22 },
    ]},
    MT: { name: "Montana", rate: 0.74 }, NE: { name: "Nebraska", rate: 1.73 },
    NV: { name: "Nevada", rate: 0.55, metros: [
      { name: "Las Vegas/Clark", rate: 0.60 }, { name: "Reno/Washoe", rate: 0.61 },
    ]},
    NH: { name: "New Hampshire", rate: 2.18 },
    NJ: { name: "New Jersey", rate: 2.23, metros: [
      { name: "Bergen County", rate: 2.41 }, { name: "Essex County", rate: 2.36 },
      { name: "Middlesex County", rate: 2.57 }, { name: "Morris County", rate: 2.15 },
    ]},
    NM: { name: "New Mexico", rate: 0.67 },
    NY: { name: "New York", rate: 1.72, metros: [
      { name: "New York City", rate: 0.88, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "Long Island/Nassau", rate: 2.22, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "Westchester", rate: 1.62, limits: { fha: 1149825, conv: 1149825, va: 1149825 } }, { name: "Buffalo/Erie", rate: 2.42 },
    ]},
    NC: { name: "North Carolina", rate: 0.84, metros: [
      { name: "Charlotte/Mecklenburg", rate: 0.94 }, { name: "Raleigh/Wake", rate: 0.82 }, { name: "Durham", rate: 1.13 },
    ]},
    ND: { name: "North Dakota", rate: 0.98 },
    OH: { name: "Ohio", rate: 1.56, metros: [
      { name: "Columbus/Franklin", rate: 1.57 }, { name: "Cleveland/Cuyahoga", rate: 2.06 }, { name: "Cincinnati/Hamilton", rate: 1.89 },
    ]},
    OK: { name: "Oklahoma", rate: 0.87 },
    OR: { name: "Oregon", rate: 0.97, metros: [
      { name: "Portland/Multnomah", rate: 1.12 }, { name: "Washington County", rate: 0.95 },
    ]},
    PA: { name: "Pennsylvania", rate: 1.58, metros: [
      { name: "Philadelphia", rate: 1.36 }, { name: "Pittsburgh/Allegheny", rate: 2.14 }, { name: "Montgomery County", rate: 1.56 },
    ]},
    RI: { name: "Rhode Island", rate: 1.63 },
    SC: { name: "South Carolina", rate: 0.57, metros: [
      { name: "Charleston", rate: 0.52 }, { name: "Greenville", rate: 0.64 }, { name: "Columbia/Richland", rate: 0.68 },
    ]},
    SD: { name: "South Dakota", rate: 1.31 },
    TN: { name: "Tennessee", rate: 0.56, metros: [
      { name: "Nashville/Davidson", rate: 0.95, limits: NASH_MSA_LIMITS },
      { name: "Memphis/Shelby", rate: 1.55 },
      { name: "Knoxville/Knox", rate: 0.82 },
      { name: "Chattanooga/Hamilton", rate: 0.85 },
      { name: "Williamson County", rate: 0.53, limits: NASH_MSA_LIMITS },
      { name: "Rutherford County", rate: 0.80, limits: NASH_MSA_LIMITS },
      { name: "Sumner County", rate: 0.70, limits: NASH_MSA_LIMITS },
      { name: "Wilson County", rate: 0.65, limits: NASH_MSA_LIMITS },
    ]},
    TX: { name: "Texas", rate: 1.80, metros: [
      { name: "Houston/Harris", rate: 2.09 }, { name: "Dallas/Dallas Co", rate: 1.93 },
      { name: "Austin/Travis", rate: 1.68, limits: { fha: 571550, conv: 832750, va: 832750 } },
      { name: "San Antonio/Bexar", rate: 1.89 }, { name: "Fort Worth/Tarrant", rate: 2.10 }, { name: "Collin County", rate: 1.82 },
    ]},
    UT: { name: "Utah", rate: 0.58, metros: [
      { name: "Salt Lake County", rate: 0.67, limits: { fha: 732750, conv: 832750, va: 832750 } }, { name: "Utah County", rate: 0.52 },
    ]},
    VT: { name: "Vermont", rate: 1.90 },
    VA: { name: "Virginia", rate: 0.82, metros: [
      { name: "Fairfax County", rate: 1.03, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "Virginia Beach", rate: 0.87 },
      { name: "Arlington County", rate: 0.98, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
      { name: "Richmond City", rate: 1.12 },
    ]},
    WA: { name: "Washington", rate: 0.98, metros: [
      { name: "Seattle/King", rate: 0.93, limits: { fha: 1029250, conv: 1029250, va: 1029250 } },
      { name: "Tacoma/Pierce", rate: 1.14, limits: { fha: 1029250, conv: 1029250, va: 1029250 } }, { name: "Snohomish County", rate: 0.92, limits: { fha: 1029250, conv: 1029250, va: 1029250 } },
    ]},
    WV: { name: "West Virginia", rate: 0.58 },
    WI: { name: "Wisconsin", rate: 1.85, metros: [
      { name: "Milwaukee", rate: 2.53 }, { name: "Madison/Dane", rate: 1.90 },
    ]},
    WY: { name: "Wyoming", rate: 0.61 },
    DC: { name: "Washington DC", rate: 0.56, limits: { fha: 1149825, conv: 1149825, va: 1149825 } },
  };

  const stateData = PQ_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const loanLimits = selectedMetro?.limits || stateData?.limits || DEFAULT_LIMITS;

  useEffect(() => {
    const newMetros = PQ_TAX_RATES[taxState]?.metros;
    if (newMetros && newMetros.length > 0) setTaxMetro(newMetros[0].name);
    else setTaxMetro("");
  }, [taxState]);

  const roundRate = (r) => Math.round(r / 0.125) * 0.125;
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv = find("30-year fixed"); const fha = find("fha"); const va = find("va");
          if (conv) setConvRate(roundRate(parseFloat(conv.rate)));
          if (fha) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today"); setRatesLoaded(true);
        }
      } catch (e) { /* silent */ }
    })();
  }, []);

  // VA funding fee
  const vaFeeRate = useMemo(() => {
    if (vaUsage === "exempt") return 0;
    if (downPct >= 10) return 1.25;
    if (downPct >= 5) return 1.50;
    return vaUsage === "first" ? 2.15 : 3.30;
  }, [vaUsage, downPct]);

  // Solve max price from max housing payment
  const solvePrice = (maxPayment, rate, miRateAnnual, upfrontFeePct) => {
    if (maxPayment <= 0) return 0;
    const mr = (rate / 100) / 12;
    const n = 360;
    let price = maxPayment * 170;
    for (let i = 0; i < 25; i++) {
      const baseLoan = price * (1 - downPct / 100);
      const totalLoan = baseLoan * (1 + upfrontFeePct / 100);
      const pi = totalLoan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
      const mi = (baseLoan * (miRateAnnual / 100)) / 12;
      const tax = (price * (taxRate / 100)) / 12;
      const ins = (price * (insRate / 100)) / 12;
      const total = pi + mi + tax + ins;
      if (total < 1) break;
      price = Math.round(price * (maxPayment / total));
      if (Math.abs(total - maxPayment) < 5) break;
    }
    return Math.max(0, price);
  };

  // Program definitions
  const convMiRate = downPct < 5 ? 0.52 : downPct < 10 ? 0.37 : downPct < 20 ? 0.27 : 0;
  const fhaMiRate = downPct < 5 ? 0.55 : 0.50;

  const programs = [
    {
      name: "Conventional", color: P.navy, rate: convRate, setRate: setConvRate,
      frontMax: 0.4999, backMax: 0.4999, miRate: convMiRate, upfrontFee: 0,
      minDown: 3, eligible: downPct >= 3, loanLimit: loanLimits.conv,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : "No PMI",
      notes: "Front-end and back-end both 49.99%. DTI thresholds assume 740+ FICO — lower scores may reduce max DTI. PMI removable at 80% LTV.",
    },
    {
      name: "FHA", color: "#8B6914", rate: fhaRate, setRate: setFhaRate,
      frontMax: 0.4699, backMax: 0.5699, miRate: fhaMiRate, upfrontFee: 1.75,
      minDown: 3.5, eligible: downPct >= 3.5, loanLimit: loanLimits.fha,
      miLabel: `MIP (${fhaMiRate}%)`,
      notes: "Front-end 46.99%, back-end 56.99%. DTI thresholds assume 680+ FICO. UFMIP (1.75%) financed. MIP for life if <10% down.",
    },
    {
      name: "VA", color: P.sage, rate: vaRate, setRate: setVaRate,
      frontMax: null, backMax: 0.50, miRate: 0, upfrontFee: vaFeeRate,
      minDown: 0, eligible: true, loanLimit: loanLimits.va,
      miLabel: "No monthly MI",
      notes: `Back-end 50%. DTI thresholds assume 680+ FICO. Funding fee ${vaFeeRate}% financed. No monthly MI. Can exceed 50% with strong residual income.`,
    },
  ];

  // Calculate for each program
  const results = programs.map(prog => {
    if (!prog.eligible) return { ...prog, maxPrice: 0, maxPayment: 0, comfPrice: 0, comfPayment: 0, frontMaxHousing: 0, backTotalMax: 0, backMaxHousing: 0, overLimit: false };

    // Front-end: max HOUSING payment (independent of debts)
    const frontMaxHousing = prog.frontMax ? Math.floor(grossIncome * prog.frontMax) : Infinity;

    // Back-end: max TOTAL of (housing + all debts)
    const backTotalMax = Math.floor(grossIncome * prog.backMax);
    // Therefore max housing from back-end = total max - existing debts
    const backMaxHousing = backTotalMax - monthlyDebts;

    // Actual max housing = whichever is lower
    const maxPayment = Math.max(0, Math.min(frontMaxHousing, backMaxHousing));
    const bindingConstraint = frontMaxHousing <= backMaxHousing ? "front-end" : "back-end";

    // Comfortable range (75% of limits)
    const comfFront = prog.frontMax ? Math.floor(grossIncome * prog.frontMax * 0.75) : Infinity;
    const comfBack = Math.floor(grossIncome * prog.backMax * 0.75) - monthlyDebts;
    const comfPayment = Math.max(0, Math.min(comfFront, comfBack));

    let maxPrice = solvePrice(maxPayment, prog.rate, prog.miRate, prog.upfrontFee);
    const comfPrice = solvePrice(comfPayment, prog.rate, prog.miRate, prog.upfrontFee);

    // Loan limit check — cap price if base loan would exceed the limit
    let maxLoan = maxPrice * (1 - downPct / 100);
    let overLimit = false;
    if (maxLoan > prog.loanLimit && downPct < 100) {
      maxPrice = Math.floor(prog.loanLimit / (1 - downPct / 100));
      maxLoan = prog.loanLimit;
      overLimit = true;
    }

    const maxTotalLoan = maxLoan * (1 + prog.upfrontFee / 100);
    const comfLoan = comfPrice * (1 - downPct / 100);

    const currentBackDTI = grossIncome > 0 ? ((monthlyDebts + maxPayment) / grossIncome * 100) : 0;

    return { ...prog, maxPrice, maxPayment, comfPrice, comfPayment, maxLoan, maxTotalLoan, comfLoan, currentBackDTI, bindingConstraint, frontMaxHousing, backTotalMax, backMaxHousing, overLimit };
  });

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100vh" }}>
      <style>{globalCSS}{`
        .pq-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pq-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        @media (max-width: 700px) {
          .pq-input-cols { grid-template-columns: 1fr; }
          .pq-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src={HEADSHOT} alt="The Mortgage Geek" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${P.gold}` }} />
            <div>
              <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff", display: "block", lineHeight: 1.2 }}>The Mortgage Geek</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>NMLS# 1119524</span>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20pre-qual%20simulator%20and%20had%20a%20question." style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Text
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>What Can You Afford?</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8 }}>Pre-Qual Simulator</h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>Enter your income and debts. See what you qualify for under each loan program — with their real DTI limits and mortgage insurance rules.</p>
        </div>

        {/* Inputs */}
        <div className="content-card" style={{ padding: "28px", marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" }}>
          <div className="pq-input-cols">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CalcInput label="Gross Monthly Income" value={grossIncome} onChange={setGrossIncome} prefix="$" step={250} comma />
              <CalcInput label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" step={50} comma />
              <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.5 }}>Include: car, student loans, credit cards (min payments), personal loans, child support.</p>
              <button onClick={() => setShowStudentCalc(!showStudentCalc)} style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                fontSize: 11, fontWeight: 600, color: P.gold, cursor: "pointer", fontFamily: F.body, padding: "4px 0",
              }}>
                <span style={{ fontSize: 12 }}>🎓</span>
                {showStudentCalc ? "Hide" : "Student Loan Payment Calculator"}
                <span style={{ fontSize: 10, transition: "transform 0.2s", transform: showStudentCalc ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
              {showStudentCalc && (
                <div style={{ background: P.creamDark, borderRadius: 8, padding: "14px 16px" }}>
                  <p style={{ fontSize: 11, color: P.warmGray, marginBottom: 10, lineHeight: 1.5 }}>
                    For student loans currently at <strong>$0/mo</strong> due to deferment, forbearance, or income-driven repayment — lenders still count a payment. Enter your total balance to calculate the qualifying payment.
                  </p>
                  <CalcInput label="Total Student Loan Balance" value={studentBalance} onChange={setStudentBalance} prefix="$" step={1000} comma />
                  {studentBalance > 0 && (
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: P.white, borderRadius: 8, padding: "10px 14px" }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Qualifying Payment (0.5%)</span>
                        <span style={{ fontFamily: F.display, fontSize: 22, color: P.navy }}>{fmt(Math.round(studentBalance * 0.005))}/mo</span>
                      </div>
                      <button onClick={() => setMonthlyDebts(prev => prev + Math.round(studentBalance * 0.005))} style={{
                        padding: "8px 14px", borderRadius: 6, border: "none",
                        background: P.navy, color: "#fff", fontSize: 11, fontWeight: 600,
                        cursor: "pointer", fontFamily: F.body, whiteSpace: "nowrap",
                      }}>
                        + Add to Debts
                      </button>
                    </div>
                  )}
                  <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>
                    0.5% of principal balance is the standard qualifying calculation for deferred student loans (Conventional, FHA, VA). If your loans are on an active repayment plan with a documented payment, use that actual payment instead.
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CalcInput label="Down Payment" value={downPct} onChange={setDownPct} suffix="%" step={1} min={0} max={100} />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>VA Eligibility</label>
                <select value={vaUsage} onChange={(e) => setVaUsage(e.target.value)}
                  style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "9px 12px", fontSize: 13, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                  <option value="first">First-Time Use</option>
                  <option value="subsequent">Subsequent Use</option>
                  <option value="exempt">Exempt (Disability)</option>
                </select>
              </div>
              <div style={{ padding: "10px 14px", background: P.creamDark, borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Current Debt-Only DTI</span>
                <span style={{ fontFamily: F.display, fontSize: 22, color: grossIncome > 0 && (monthlyDebts / grossIncome) > 0.30 ? P.gold : P.sage }}>{grossIncome > 0 ? ((monthlyDebts / grossIncome) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
          {/* Property location row */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${P.creamDark}` }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>Property Location</label>
            <div style={{ display: "grid", gridTemplateColumns: metroList.length > 0 ? "1fr 1fr" : "1fr", gap: 8 }}>
              <select value={taxState} onChange={(e) => setTaxState(e.target.value)}
                style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "9px 12px", fontSize: 13, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                {Object.entries(PQ_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                  <option key={code} value={code}>{s.name}</option>
                ))}
              </select>
              {metroList.length > 0 && (
                <select value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)}
                  style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "9px 12px", fontSize: 13, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                  <option value="">State Avg ({stateData.rate}%)</option>
                  {metroList.map((m) => (
                    <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>
                  ))}
                </select>
              )}
            </div>
            <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 6 }}>Limits: FHA {fmt(loanLimits.fha)} · Conv {fmt(loanLimits.conv)} · VA {fmt(loanLimits.va)}</p>
          </div>
        </div>

        {/* Rate inputs */}
        <div className="content-card" style={{ padding: "16px 28px", marginBottom: 32, maxWidth: 800, margin: "0 auto 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Interest Rates by Program</span>
            {ratesLoaded && (
              <span style={{ fontSize: 11, color: P.sage, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.sage, display: "inline-block" }} />
                Live · {rateSource}
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: P.warmGrayLight, marginBottom: 12 }}>National averages via MND. Adjust to match your quote.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Conventional", rate: convRate, setRate: setConvRate, color: P.navy },
              { label: "FHA", rate: fhaRate, setRate: setFhaRate, color: "#8B6914" },
              { label: "VA", rate: vaRate, setRate: setVaRate, color: P.sage },
            ].map((p) => (
              <RateInput key={p.label} label={p.label} rate={p.rate} setRate={p.setRate} color={p.color} />
            ))}
          </div>
        </div>

        {/* Program result cards */}
        <div className="pq-cards-grid">
          {results.map((prog, i) => {
            if (!prog.eligible) {
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", opacity: 0.6 }}>
                  <div style={{ background: P.warmGrayLight, padding: "20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 24, color: "#fff" }}>Ineligible</span>
                  </div>
                  <div style={{ padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>⚠️</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 4 }}>Min {prog.minDown}% Down Required</p>
                    <p style={{ fontSize: 11, color: P.warmGray }}>Increase down payment to {prog.minDown}% to see {prog.name} results.</p>
                  </div>
                </div>
              );
            }

            const bestPrice = Math.max(...results.filter(r => r.eligible && r.maxPrice > 0).map(r => r.maxPrice));
            const isBest = prog.maxPrice === bestPrice && prog.maxPrice > 0;

            return (
              <div key={i} className="content-card" style={{ overflow: "hidden", position: "relative" }}>
                {/* Header */}
                <div style={{ background: prog.color, padding: "20px", textAlign: "center", position: "relative" }}>
                  {isBest && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: "#fff", color: prog.color, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "3px 8px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>★ Most Power</span>
                  )}
                  <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{prog.name} · Max Purchase</span>
                  <span style={{ fontFamily: F.display, fontSize: 34, color: "#fff" }}>{fmt(prog.maxPrice)}</span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {prog.rate}% · {prog.overLimit ? "capped at loan limit" : `${prog.bindingConstraint} DTI binding`}
                  </span>
                  {prog.overLimit && (
                    <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "3px 10px", borderRadius: 10 }}>
                      ⚠️ Loan limit: {fmt(prog.loanLimit)}
                    </span>
                  )}
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {/* DTI breakdown */}
                  <div style={{ marginBottom: 14 }}>
                    {prog.frontMax && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 6 }}>
                        <span>Front-End Max Housing</span>
                        <span style={{ fontWeight: 700, color: prog.bindingConstraint === "front-end" ? prog.color : P.warmGrayLight }}>{fmt(prog.frontMaxHousing)} {prog.bindingConstraint === "front-end" ? "← binding" : ""}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 4 }}>
                      <span>Back-End Max (Housing + Debts)</span>
                      <span style={{ fontWeight: 700, color: prog.bindingConstraint === "back-end" ? prog.color : P.warmGrayLight }}>{fmt(prog.backTotalMax)}</span>
                    </div>
                    <div style={{ height: 6, background: P.creamDark, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", width: `${Math.min((prog.currentBackDTI / (prog.backMax * 100)) * 100, 100)}%`, background: prog.color, borderRadius: 3 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight }}>
                      <span>Back-End DTI</span>
                      <span>{prog.currentBackDTI.toFixed(1)}% / {(prog.backMax * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Max breakdown */}
                  <div style={{ marginBottom: 12 }}>
                    {[
                      { label: "Max Housing Payment", val: fmt(prog.maxPayment), bold: true },
                      ...(monthlyDebts > 0 ? [{ label: "Housing + Debts", val: fmt(prog.maxPayment + monthlyDebts), sub: `of ${fmt(prog.backTotalMax)} back-end max` }] : []),
                      { label: "Loan Amount", val: fmt(prog.maxLoan), warn: prog.overLimit },
                      { label: "Loan Limit", val: fmt(prog.loanLimit), dim: !prog.overLimit },
                      ...(prog.upfrontFee > 0 ? [{ label: `Financed Fee (${prog.upfrontFee}%)`, val: fmt(prog.maxLoan * (prog.upfrontFee / 100)) }] : []),
                      { label: "Down Payment", val: fmt(prog.maxPrice * (downPct / 100)) },
                      { label: prog.miLabel, val: prog.miRate > 0 ? fmt((prog.maxLoan * prog.miRate / 100) / 12) + "/mo" : "—" },
                    ].map((r, ri) => (
                      <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11, color: r.dim ? P.creamDark : P.warmGray, borderBottom: `1px solid ${P.cream}`, opacity: r.dim ? 0.6 : 1 }}>
                        <span>{r.label}</span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: r.bold ? 700 : 600, color: r.warn ? "#C0392B" : r.bold ? prog.color : r.dim ? P.warmGrayLight : P.text }}>{r.val}</span>
                          {r.sub && <span style={{ display: "block", fontSize: 9, color: P.warmGrayLight }}>{r.sub}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comfortable range */}
                  <div style={{ background: P.creamDark, borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Comfortable Range</span>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Purchase Price</span>
                      <span style={{ fontWeight: 700, color: P.sage }}>{fmt(prog.comfPrice)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Housing Payment</span>
                      <span style={{ fontWeight: 600, color: P.text }}>{fmt(prog.comfPayment)}/mo</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 10, color: P.warmGrayLight, lineHeight: 1.5, fontStyle: "italic" }}>{prog.notes}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Geek tip */}
        <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
              <p style={{ marginBottom: 8 }}>
                <strong>Why the numbers differ:</strong> FHA uses two separate DTI caps — a 46.99% front-end (housing payment alone can't exceed this) and a 56.99% back-end (housing + all debts combined). With low debts, the front-end is your ceiling; as debts rise, the back-end takes over. Conventional uses a single 49.99% cap for both front-end and back-end — your housing payment and your total debts must each stay under this threshold. VA allows up to 50% back-end with no monthly MI — often the strongest option for eligible borrowers.
              </p>
              <p>
                <strong>This is a simulator, not a commitment.</strong> Actual pre-approval depends on credit score, reserves, employment history, and property type. Use these numbers to guide your house hunting — then call me for the real thing.
              </p>
            </div>
          </div>
        </div>

        {/* Text results */}
        {(() => {
          const eligible = results.filter(r => r.eligible && r.maxPrice > 0);
          const lines = eligible.map(r => `${r.name}: max ${fmt(r.maxPrice)} (${fmt(r.maxPayment)}/mo)`).join("\n");
          const body = encodeURIComponent(
            `Hi! Here's my pre-qual scenario from MortgageGeek.ai:\n\n` +
            `Income: ${fmt(grossIncome)}/mo | Debts: ${fmt(monthlyDebts)}/mo | ${downPct}% down\n\n` +
            `${lines}\n\n` +
            `Can we discuss getting pre-approved?`
          );
          return (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <a href={`sms:+16156560737&body=${body}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 10,
                background: P.gold, color: "#fff",
                fontFamily: F.body, fontSize: 14, fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(184,134,11,0.3)",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Text Me These Results
              </a>
              <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 6 }}>Opens a text with your scenario pre-filled — ready to send</p>
            </div>
          );
        })()}

        {/* Cross-link to calculator */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            🧮 Run a payment scenario in the Calculator →
          </a>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          This simulator is for educational purposes only. Contact me at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized pre-approval. NMLS# 1119524.
        </p>
      </div>
    </div>
  );
}

function JargonDecoder() {
  const [search, setSearch] = useState("");
  const [openTerm, setOpenTerm] = useState(null);

  const terms = [
    { term: "APR", def: "Annual Percentage Rate — your interest rate plus lender fees, expressed as a yearly rate. APR is always higher than your note rate because it includes costs like origination fees and discount points. Use APR to compare the true cost of loans from different lenders." },
    { term: "Amortization", def: "The process of paying off your loan over time through scheduled payments. Early payments are mostly interest; later payments are mostly principal. A 30-year amortization schedule shows exactly how this shifts month by month." },
    { term: "Appraisal", def: "An independent assessment of a property's market value, ordered by the lender through an Appraisal Management Company (AMC). The lender needs to confirm the home is worth what you're borrowing. Typically $400–$700." },
    { term: "ARM", def: "Adjustable Rate Mortgage — a loan with an interest rate that changes after an initial fixed period. A 7/6 ARM is fixed for 7 years, then adjusts every 6 months based on a market index (usually SOFR). Lower initial rate, but risk of increases later." },
    { term: "Clear to Close", def: "The best phrase in the mortgage process. It means the underwriter has approved your loan with all conditions satisfied, and you're authorized to proceed to the closing table." },
    { term: "Closing Disclosure (CD)", def: "A 5-page document you receive at least 3 business days before closing. It details every cost, your loan terms, and your monthly payment. Compare it line-by-line against your Loan Estimate — discrepancies may require a fee cure." },
    { term: "Conforming Loan", def: "A mortgage that meets Fannie Mae or Freddie Mac guidelines, including being under the conforming loan limit ($766,550 in most areas for 2024). Loans above this limit are called jumbo loans." },
    { term: "Conventional Loan", def: "A mortgage not insured by a government agency (FHA, VA, USDA). Follows Fannie Mae or Freddie Mac guidelines. Requires PMI if less than 20% down, but PMI is removable once you reach 80% LTV." },
    { term: "DTI", def: "Debt-to-Income Ratio — your total monthly debt payments divided by your gross monthly income. Lenders typically want this below 43–45% for conventional loans, though FHA can go higher. Lower DTI = stronger borrower profile." },
    { term: "Earnest Money", def: "A deposit (typically 1–3% of purchase price) submitted with your offer to show the seller you're serious. It's held in escrow and applied toward your down payment or closing costs at closing." },
    { term: "Escrow", def: "Has two meanings: (1) An account where your lender holds money for property taxes and homeowners insurance, paying them on your behalf. (2) The period between contract signing and closing when a neutral third party holds funds and documents." },
    { term: "FHA Loan", def: "A mortgage insured by the Federal Housing Administration. Lower barriers to entry (3.5% minimum down, 580+ credit score), but requires both upfront MIP (1.75%) and monthly MIP, which stays for the life of the loan if you put less than 10% down." },
    { term: "LTV", def: "Loan-to-Value Ratio — your loan amount divided by the property value. A $270,000 loan on a $300,000 home = 90% LTV. LTV affects your rate, PMI requirements, and loan eligibility. Lower LTV = less risk for the lender." },
    { term: "Loan Estimate (LE)", def: "A standardized 3-page document the lender must provide within 3 business days of receiving your application. It outlines your estimated rate, monthly payment, closing costs, and loan terms. Use it to compare offers from multiple lenders." },
    { term: "Loan Originator (LO)", def: "The licensed professional who guides you through the mortgage process — from application to closing. Your LO structures your loan, advises on programs, and coordinates with processing, underwriting, and title." },
    { term: "MIP", def: "Mortgage Insurance Premium — the FHA equivalent of PMI. Comes in two parts: an upfront premium (1.75% of the loan, usually financed) and a monthly premium (0.50–0.55% annually). Unlike conventional PMI, FHA MIP typically stays for the life of the loan." },
    { term: "MBS", def: "Mortgage-Backed Securities — bonds created by bundling thousands of mortgages together and selling them to investors. MBS prices directly influence mortgage rates: when MBS prices rise, rates tend to fall, and vice versa." },
    { term: "PITI", def: "Principal, Interest, Taxes, and Insurance — the four components of your total monthly housing payment. When someone asks 'what's your mortgage payment,' this is the complete answer, not just principal and interest." },
    { term: "PMI", def: "Private Mortgage Insurance — required on conventional loans with less than 20% down. Protects the lender (not you) if you default. The key advantage over FHA MIP: PMI is removable once you reach 80% LTV through payments or appreciation." },
    { term: "Pre-Approval", def: "A conditional commitment from a lender stating how much you're approved to borrow, based on verified income, assets, and credit. Stronger than pre-qualification and often required by sellers before accepting an offer." },
    { term: "Pre-Qualification", def: "An initial estimate of what you can afford, based on self-reported financial information. Faster and less rigorous than pre-approval. Good starting point, but not a guarantee of approval." },
    { term: "Rate Lock", def: "An agreement with your lender to hold a specific interest rate for a set period (typically 30–60 days). Protects you from rate increases while your loan is being processed. Once locked, your rate won't change even if market rates rise." },
    { term: "SOFR", def: "Secured Overnight Financing Rate — the benchmark index used for most adjustable-rate mortgages (ARMs). Replaced LIBOR in 2023. When your ARM adjusts, the new rate = SOFR + a fixed margin set at origination." },
    { term: "Title Insurance", def: "A one-time premium that protects against title defects — things like undisclosed heirs, forged documents, or recording errors. Lender's title insurance is required; owner's title insurance is optional but strongly recommended." },
    { term: "TRID", def: "TILA-RESPA Integrated Disclosure — the \"Know Before You Owe\" rule that standardized mortgage disclosures. It governs your Loan Estimate and Closing Disclosure and sets fee tolerance limits protecting you from surprise cost increases." },
    { term: "Underwriting", def: "The process where your complete loan file is analyzed against lending guidelines. The underwriter reviews your credit, income, assets, and the property to make the approval decision. This is the gatekeeper step." },
    { term: "UFMIP", def: "Upfront Mortgage Insurance Premium — the one-time FHA insurance charge of 1.75% of the loan amount, due at closing. Almost always financed into the loan so you don't pay it out of pocket, but you do pay interest on it." },
    { term: "VA Funding Fee", def: "A one-time fee on VA loans (1.25–3.3% of loan amount) that replaces monthly mortgage insurance. The fee varies based on down payment, usage type (first-time vs. subsequent), and loan purpose. Veterans with service-connected disabilities are exempt." },
    { term: "VA Loan", def: "A mortgage guaranteed by the Department of Veterans Affairs for eligible veterans, active-duty service members, and surviving spouses. No down payment required, no monthly mortgage insurance, and competitive rates." },
  ];

  const filtered = search.trim() === "" ? terms : terms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="glossary" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader eyebrow="Speak the Language" title="Jargon Decoder" subtitle="Mortgages come with their own vocabulary. Here's every term you'll encounter, explained in plain language." />
      <div style={{ maxWidth: 720 }}>
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 10, background: P.white, padding: "10px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: 16, marginRight: 10, opacity: 0.4 }}>🔍</span>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: F.body, color: P.text, outline: "none" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", fontSize: 16, color: P.warmGrayLight, cursor: "pointer" }}>✕</button>}
          </div>
          <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 6 }}>{filtered.length} term{filtered.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""}</p>
        </div>

        {/* Terms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((t, i) => (
            <div key={i} className="content-card" style={{ overflow: "hidden" }}>
              <button onClick={() => setOpenTerm(openTerm === i ? null : i)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", border: "none", background: openTerm === i ? P.navy : P.white,
                fontFamily: F.body, cursor: "pointer", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: openTerm === i ? "#fff" : P.navy, letterSpacing: 0.2 }}>{t.term}</span>
                <span style={{ fontSize: 16, fontWeight: 300, color: openTerm === i ? "rgba(255,255,255,0.5)" : P.warmGrayLight }}>{openTerm === i ? "−" : "+"}</span>
              </button>
              {openTerm === i && (
                <div style={{ padding: "14px 20px", borderTop: `1px solid ${P.cream}` }}>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{t.def}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>🤓</span>
            <p style={{ fontSize: 14, color: P.warmGray }}>No terms found for "{search}"</p>
            <p style={{ fontSize: 12, color: P.warmGrayLight, marginTop: 4 }}>Try a different search or <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: P.gold, fontWeight: 600, cursor: "pointer", fontFamily: F.body, fontSize: 12 }}>view all terms</button></p>
          </div>
        )}
      </div>
    </section>
  );
}

function RateInput({ label, rate, setRate, color }) {
  const [localVal, setLocalVal] = useState(String(rate));
  useEffect(() => { setLocalVal(String(rate)); }, [rate]);
  const handleChange = (e) => {
    setLocalVal(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 15) setRate(v);
  };
  const handleBlur = () => {
    const v = parseFloat(localVal);
    if (isNaN(v) || v < 0) { setRate(0); setLocalVal("0"); }
    else if (v > 15) { setRate(15); setLocalVal("15"); }
    else { setRate(v); setLocalVal(String(v)); }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: P.cream, border: `1px solid ${P.creamDark}` }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: color, flex: 1 }}>{label}</span>
      <input
        type="number" inputMode="decimal" value={localVal} onChange={handleChange} onBlur={handleBlur}
        step={0.125}
        style={{ border: "none", background: "transparent", fontSize: 16, fontFamily: F.body, fontWeight: 700, color: P.text, outline: "none", textAlign: "right", width: 64 }}
      />
      <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray }}>%</span>
    </div>
  );
}

function CalculatorPage() {
  const [homePrice, setHomePrice] = useState(350000);
  const [convRate, setConvRate] = useState(6.75);
  const [fhaRate, setFhaRate] = useState(6.25);
  const [vaRate, setVaRate] = useState(6.25);
  const [term, setTerm] = useState(30);
  const [downPct, setDownPct] = useState(3.5);
  const [downDollarOverride, setDownDollarOverride] = useState(null);
  useEffect(() => { setDownDollarOverride(null); }, [homePrice]); // reset override when price changes

  const handleDownPctChange = (v) => { setDownPct(v); setDownDollarOverride(null); };
  const handleDownDollarChange = (v) => {
    setDownDollarOverride(v);
    if (homePrice > 0) setDownPct(Math.round((v / homePrice) * 10000) / 100);
  };
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville");
  const [vaUsage, setVaUsage] = useState("first");

  const STATE_TAX_RATES = {
    AL: { name: "Alabama", rate: 0.41, metros: [
      { name: "Birmingham", rate: 0.52 }, { name: "Huntsville", rate: 0.46 }, { name: "Mobile", rate: 0.48 },
    ]},
    AK: { name: "Alaska", rate: 1.19 },
    AZ: { name: "Arizona", rate: 0.62, metros: [
      { name: "Phoenix/Maricopa", rate: 0.64 }, { name: "Tucson/Pima", rate: 0.93 },
    ]},
    AR: { name: "Arkansas", rate: 0.62 },
    CA: { name: "California", rate: 0.71, metros: [
      { name: "Los Angeles", rate: 0.76 }, { name: "San Francisco", rate: 0.68 }, { name: "San Diego", rate: 0.73 },
      { name: "Orange County", rate: 0.69 }, { name: "Sacramento", rate: 0.87 }, { name: "Riverside", rate: 0.95 },
    ]},
    CO: { name: "Colorado", rate: 0.51, metros: [
      { name: "Denver", rate: 0.54 }, { name: "Colorado Springs", rate: 0.54 }, { name: "Aurora/Arapahoe", rate: 0.55 },
    ]},
    CT: { name: "Connecticut", rate: 2.15 },
    DE: { name: "Delaware", rate: 0.57 },
    FL: { name: "Florida", rate: 0.86, metros: [
      { name: "Miami-Dade", rate: 0.97 }, { name: "Jacksonville/Duval", rate: 0.89 }, { name: "Tampa/Hillsborough", rate: 0.95 },
      { name: "Orlando/Orange", rate: 0.89 }, { name: "Palm Beach", rate: 1.05 }, { name: "Broward/Ft Lauderdale", rate: 1.02 },
    ]},
    GA: { name: "Georgia", rate: 0.92, metros: [
      { name: "Atlanta/Fulton", rate: 1.11 }, { name: "Cobb County", rate: 0.95 }, { name: "DeKalb County", rate: 1.20 },
      { name: "Gwinnett County", rate: 1.02 },
    ]},
    HI: { name: "Hawaii", rate: 0.28 },
    ID: { name: "Idaho", rate: 0.63 },
    IL: { name: "Illinois", rate: 2.07, metros: [
      { name: "Chicago/Cook", rate: 2.10 }, { name: "DuPage County", rate: 1.96 }, { name: "Lake County", rate: 2.68 },
      { name: "Will County", rate: 2.42 },
    ]},
    IN: { name: "Indiana", rate: 0.85, metros: [
      { name: "Indianapolis/Marion", rate: 1.02 }, { name: "Fort Wayne/Allen", rate: 0.88 },
    ]},
    IA: { name: "Iowa", rate: 1.57 },
    KS: { name: "Kansas", rate: 1.41, metros: [
      { name: "Kansas City/Johnson", rate: 1.37 }, { name: "Wichita/Sedgwick", rate: 1.48 },
    ]},
    KY: { name: "Kentucky", rate: 0.86, metros: [
      { name: "Louisville/Jefferson", rate: 1.06 }, { name: "Lexington/Fayette", rate: 0.92 },
    ]},
    LA: { name: "Louisiana", rate: 0.55 },
    ME: { name: "Maine", rate: 1.30 },
    MD: { name: "Maryland", rate: 1.07, metros: [
      { name: "Baltimore City", rate: 2.25 }, { name: "Montgomery County", rate: 0.93 },
      { name: "Prince George's", rate: 1.15 }, { name: "Anne Arundel", rate: 0.94 },
    ]},
    MA: { name: "Massachusetts", rate: 1.23, metros: [
      { name: "Boston/Suffolk", rate: 0.89 }, { name: "Middlesex County", rate: 1.20 }, { name: "Worcester County", rate: 1.35 },
    ]},
    MI: { name: "Michigan", rate: 1.54, metros: [
      { name: "Detroit/Wayne", rate: 2.58 }, { name: "Oakland County", rate: 1.49 }, { name: "Grand Rapids/Kent", rate: 1.31 },
    ]},
    MN: { name: "Minnesota", rate: 1.12, metros: [
      { name: "Minneapolis/Hennepin", rate: 1.18 }, { name: "St Paul/Ramsey", rate: 1.24 },
    ]},
    MS: { name: "Mississippi", rate: 0.65 },
    MO: { name: "Missouri", rate: 0.97, metros: [
      { name: "St Louis City", rate: 1.38 }, { name: "Kansas City/Jackson", rate: 1.22 },
    ]},
    MT: { name: "Montana", rate: 0.74 },
    NE: { name: "Nebraska", rate: 1.73 },
    NV: { name: "Nevada", rate: 0.55, metros: [
      { name: "Las Vegas/Clark", rate: 0.60 }, { name: "Reno/Washoe", rate: 0.61 },
    ]},
    NH: { name: "New Hampshire", rate: 2.18 },
    NJ: { name: "New Jersey", rate: 2.23, metros: [
      { name: "Bergen County", rate: 2.41 }, { name: "Essex County", rate: 2.36 },
      { name: "Middlesex County", rate: 2.57 }, { name: "Morris County", rate: 2.15 },
    ]},
    NM: { name: "New Mexico", rate: 0.67 },
    NY: { name: "New York", rate: 1.72, metros: [
      { name: "New York City", rate: 0.88 }, { name: "Long Island/Nassau", rate: 2.22 },
      { name: "Westchester", rate: 1.62 }, { name: "Buffalo/Erie", rate: 2.42 },
    ]},
    NC: { name: "North Carolina", rate: 0.84, metros: [
      { name: "Charlotte/Mecklenburg", rate: 0.94 }, { name: "Raleigh/Wake", rate: 0.82 }, { name: "Durham", rate: 1.13 },
    ]},
    ND: { name: "North Dakota", rate: 0.98 },
    OH: { name: "Ohio", rate: 1.56, metros: [
      { name: "Columbus/Franklin", rate: 1.57 }, { name: "Cleveland/Cuyahoga", rate: 2.06 }, { name: "Cincinnati/Hamilton", rate: 1.89 },
    ]},
    OK: { name: "Oklahoma", rate: 0.87 },
    OR: { name: "Oregon", rate: 0.97, metros: [
      { name: "Portland/Multnomah", rate: 1.12 }, { name: "Washington County", rate: 0.95 },
    ]},
    PA: { name: "Pennsylvania", rate: 1.58, metros: [
      { name: "Philadelphia", rate: 1.36 }, { name: "Pittsburgh/Allegheny", rate: 2.14 }, { name: "Montgomery County", rate: 1.56 },
    ]},
    RI: { name: "Rhode Island", rate: 1.63 },
    SC: { name: "South Carolina", rate: 0.57, metros: [
      { name: "Charleston", rate: 0.52 }, { name: "Greenville", rate: 0.64 }, { name: "Columbia/Richland", rate: 0.68 },
    ]},
    SD: { name: "South Dakota", rate: 1.31 },
    TN: { name: "Tennessee", rate: 0.56, metros: [
      { name: "Nashville/Davidson", rate: 0.95 }, { name: "Memphis/Shelby", rate: 1.55 },
      { name: "Knoxville/Knox", rate: 0.82 }, { name: "Chattanooga/Hamilton", rate: 0.85 },
      { name: "Williamson County", rate: 0.53 }, { name: "Rutherford County", rate: 0.80 },
      { name: "Sumner County", rate: 0.70 }, { name: "Wilson County", rate: 0.65 },
    ]},
    TX: { name: "Texas", rate: 1.80, metros: [
      { name: "Houston/Harris", rate: 2.09 }, { name: "Dallas/Dallas Co", rate: 1.93 },
      { name: "Austin/Travis", rate: 1.68 }, { name: "San Antonio/Bexar", rate: 1.89 },
      { name: "Fort Worth/Tarrant", rate: 2.10 }, { name: "Collin County", rate: 1.82 },
    ]},
    UT: { name: "Utah", rate: 0.58, metros: [
      { name: "Salt Lake County", rate: 0.67 }, { name: "Utah County", rate: 0.52 },
    ]},
    VT: { name: "Vermont", rate: 1.90 },
    VA: { name: "Virginia", rate: 0.82, metros: [
      { name: "Fairfax County", rate: 1.03 }, { name: "Virginia Beach", rate: 0.87 },
      { name: "Arlington County", rate: 0.98 }, { name: "Richmond City", rate: 1.12 },
    ]},
    WA: { name: "Washington", rate: 0.98, metros: [
      { name: "Seattle/King", rate: 0.93 }, { name: "Tacoma/Pierce", rate: 1.14 }, { name: "Snohomish County", rate: 0.92 },
    ]},
    WV: { name: "West Virginia", rate: 0.58 },
    WI: { name: "Wisconsin", rate: 1.85, metros: [
      { name: "Milwaukee", rate: 2.53 }, { name: "Madison/Dane", rate: 1.90 },
    ]},
    WY: { name: "Wyoming", rate: 0.61 },
    DC: { name: "Washington DC", rate: 0.56 },
  };

  const stateData = STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const [taxes, setTaxes] = useState(Math.round((350000 * (0.95 / 100)) / 12));
  useEffect(() => { setTaxes(Math.round((homePrice * (taxRate / 100)) / 12)); }, [taxState, taxMetro, homePrice]);
  // Reset metro when state changes
  useEffect(() => {
    const newMetros = STATE_TAX_RATES[taxState]?.metros;
    if (newMetros && newMetros.length > 0) setTaxMetro(newMetros[0].name);
    else setTaxMetro("");
  }, [taxState]);

  const [insurance, setInsurance] = useState(Math.round((350000 * 0.0035) / 12));
  useEffect(() => { setInsurance(Math.round((homePrice * 0.0035) / 12)); }, [homePrice]);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);

  // Round to nearest 0.125%
  const roundRate = (r) => Math.round(r / 0.125) * 0.125;

  // Fetch live rates on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv = find("30-year fixed");
          const fha = find("fha");
          const va = find("va");
          if (conv) setConvRate(roundRate(parseFloat(conv.rate)));
          if (fha) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today");
          setRatesLoaded(true);
        }
      } catch (e) { /* fail silently, use defaults */ }
    })();
  }, []);

  const downAmt = downDollarOverride !== null ? downDollarOverride : homePrice * (downPct / 100);
  const baseLoan = homePrice - downAmt;

  // Conventional
  const convLoan = baseLoan;
  const convMiRate = downPct < 5 ? 0.52 : downPct < 10 ? 0.37 : downPct < 20 ? 0.27 : 0;
  const convMI = (baseLoan * (convMiRate / 100)) / 12;
  const { monthly: convPI } = useMemo(() => generateAmortData(convLoan, convRate, term), [convLoan, convRate, term]);
  const convTotal = convPI + convMI + taxes + insurance;

  // FHA
  const fhaUpfront = baseLoan * 0.0175;
  const fhaLoan = baseLoan + fhaUpfront;
  const fhaMiRate = downPct < 5 ? 0.55 : 0.50;
  const fhaMI = (baseLoan * (fhaMiRate / 100)) / 12;
  const { monthly: fhaPI } = useMemo(() => generateAmortData(fhaLoan, fhaRate, term), [fhaLoan, fhaRate, term]);
  const fhaTotal = fhaPI + fhaMI + taxes + insurance;

  // VA - Funding fee varies by usage type and down payment
  const vaFeeRate = useMemo(() => {
    if (vaUsage === "exempt") return 0;
    if (downPct >= 10) return 1.25;
    if (downPct >= 5) return 1.50;
    // Less than 5% down
    return vaUsage === "first" ? 2.15 : 3.30;
  }, [vaUsage, downPct]);
  const vaFee = baseLoan * (vaFeeRate / 100);
  const vaLoan = baseLoan + vaFee;
  const { monthly: vaPI } = useMemo(() => generateAmortData(vaLoan, vaRate, term), [vaLoan, vaRate, term]);
  const vaTotal = vaPI + taxes + insurance;

  const vaUsageLabels = { first: "First-Time Use", subsequent: "Subsequent Use", exempt: "Exempt (Disability)" };

  const programs = [
    {
      name: "Conventional", color: P.navy, loan: convLoan, pi: convPI, mi: convMI,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : null,
      upfront: 0, upfrontLabel: null, total: convTotal, rate: convRate,
      note: downPct >= 20 ? "No PMI required" : `PMI est. based on 740+ FICO, <43% DTI`,
      eligible: downPct >= 3, minDown: 3,
    },
    {
      name: "FHA", color: "#8B6914", loan: fhaLoan, pi: fhaPI, mi: fhaMI,
      miLabel: `MIP (${fhaMiRate}%)`,
      upfront: fhaUpfront, upfrontLabel: "UFMIP (1.75%)", total: fhaTotal, rate: fhaRate,
      note: downPct < 10 ? "MIP for life of loan" : "MIP removable after 11 years",
      eligible: downPct >= 3.5, minDown: 3.5,
    },
    {
      name: "VA", color: P.sage, loan: vaLoan, pi: vaPI, mi: 0,
      miLabel: null,
      upfront: vaFee, upfrontLabel: vaFeeRate > 0 ? `Funding Fee (${vaFeeRate}%)` : null, total: vaTotal, rate: vaRate,
      note: vaUsage === "exempt"
        ? "Funding fee waived — service-connected disability"
        : `No monthly MI — ${vaUsageLabels[vaUsage].toLowerCase()}, ${downPct >= 10 ? "10%+ down" : downPct >= 5 ? "5–9.99% down" : "<5% down"}`,
      isVA: true, eligible: true, minDown: 0,
    },
  ];

  const eligibleTotals = programs.filter(p => p.eligible).map(p => p.total);
  const lowestTotal = eligibleTotals.length > 0 ? Math.min(...eligibleTotals) : 0;

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100vh" }}>
      <style>{globalCSS}{`
        .calc-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .calc-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        @media (max-width: 700px) {
          .calc-input-cols { grid-template-columns: 1fr; }
          .calc-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Calculator header */}
      <div style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src={HEADSHOT} alt="The Mortgage Geek" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${P.gold}` }} />
            <div>
              <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff", display: "block", lineHeight: 1.2 }}>The Mortgage Geek</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>NMLS# 1119524</span>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: P.gold, color: "#fff",
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20mortgage%20calculator%20and%20had%20a%20question." style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Text
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>Side-by-Side Comparison</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8 }}>Mortgage Payment Calculator</h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 540, margin: "0 auto" }}>One set of inputs, three loan programs. See how Conventional, FHA, and VA stack up for the same home.</p>
        </div>

        {/* Input card - 2 column layout */}
        <div className="content-card" style={{ padding: "28px", marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" }}>
          <div className="calc-input-cols">
            {/* Left column - Price & Down Payment */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CalcInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} comma />
              <CalcInput label="Down Payment %" value={downPct} onChange={handleDownPctChange} suffix="%" step={0.5} min={0} max={100} />
              <CalcInput label="Down Payment $" value={Math.round(downAmt)} onChange={handleDownDollarChange} prefix="$" step={1000} min={0} max={homePrice} comma />
              <div style={{ padding: "12px 14px", background: P.creamDark, borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Base Loan Amount</span>
                <span style={{ fontFamily: F.display, fontSize: 22, color: P.navy }}>{fmt(baseLoan)}</span>
              </div>
            </div>
            {/* Right column - Term, Insurance, Taxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Term</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[15, 30].map((t) => (
                    <button key={t} onClick={() => setTerm(t)} className={`tab-btn ${term === t ? "tab-btn-active" : ""}`} style={{ flex: 1, padding: "9px 0" }}>{t} yr</button>
                  ))}
                </div>
              </div>
              <CalcInput label="Homeowners Ins. (est.)" value={insurance} onChange={setInsurance} prefix="$" step={25} />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Property Tax Location</label>
                <select
                  value={taxState}
                  onChange={(e) => setTaxState(e.target.value)}
                  style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "9px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  {Object.entries(STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                    <option key={code} value={code}>{s.name}</option>
                  ))}
                </select>
                {metroList.length > 0 && (
                  <select
                    value={taxMetro}
                    onChange={(e) => setTaxMetro(e.target.value)}
                    style={{ border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "9px 12px", fontSize: 13, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", marginTop: 4, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  >
                    <option value="">State Avg ({stateData.rate}%)</option>
                    {metroList.map((m) => (
                      <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>
                    ))}
                  </select>
                )}
              </div>
              <CalcInput label="Monthly Tax" value={taxes} onChange={setTaxes} prefix="$" step={25} />
            </div>
          </div>
        </div>

        {/* Per-program rate inputs */}
        <div className="content-card" style={{ padding: "16px 28px", marginBottom: 32, maxWidth: 800, margin: "0 auto 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Interest Rates by Program</span>
            {ratesLoaded && (
              <span style={{ fontSize: 11, color: P.sage, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.sage, display: "inline-block" }} />
                Live rates loaded · {rateSource}
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: P.warmGrayLight, marginBottom: 12, lineHeight: 1.5 }}>
            National averages via Mortgage News Daily, rounded to the nearest 0.125%. Your actual rate may differ — adjust below to match your quote.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Conventional", rate: convRate, setRate: setConvRate, color: P.navy },
              { label: "FHA", rate: fhaRate, setRate: setFhaRate, color: "#8B6914" },
              { label: "VA", rate: vaRate, setRate: setVaRate, color: P.sage },
            ].map((p) => (
              <RateInput key={p.label} label={p.label} rate={p.rate} setRate={p.setRate} color={p.color} />
            ))}
          </div>
          {!ratesLoaded && (
            <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 8, fontStyle: "italic" }}>Adjust rates manually or they'll auto-populate when live data loads.</p>
          )}
        </div>

        {/* Side-by-side cards */}
        <div className="calc-cards-grid">
          {programs.map((prog, i) => {
            const isBest = prog.eligible && prog.total === lowestTotal;

            if (!prog.eligible) {
              return (
                <div key={i} className="content-card" style={{ overflow: "hidden", position: "relative", opacity: 0.6 }}>
                  <div style={{ background: P.warmGrayLight, padding: "24px 20px", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                    <span style={{ fontFamily: F.display, fontSize: 28, color: "#fff" }}>Ineligible</span>
                  </div>
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: P.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <span style={{ fontSize: 24 }}>⚠️</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: P.text, marginBottom: 6 }}>Minimum {prog.minDown}% Down Required</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray }}>
                      {prog.name} loans require a minimum down payment of {prog.minDown}% ({fmt(homePrice * (prog.minDown / 100))}). 
                      Increase your down payment to see {prog.name} payment details.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className="content-card" style={{ overflow: "hidden", position: "relative" }}>
                {/* Header */}
                <div style={{ background: prog.color, padding: "24px 20px", textAlign: "center", position: "relative" }}>
                  {isBest && (
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      background: "#fff", color: prog.color,
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
                      padding: "4px 10px", borderRadius: 50,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>★ Lowest</span>
                  )}
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{prog.name}</span>
                  <span style={{ fontFamily: F.display, fontSize: 40, color: "#fff" }}>{fmt(prog.total)}</span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>/month · {prog.rate}% rate</span>
                </div>

                <div style={{ padding: "20px" }}>
                  {/* Breakdown */}
                  <div style={{ marginBottom: 16 }}>
                    {[
                      { label: "Principal & Interest", val: prog.pi },
                      ...(prog.mi > 0 ? [{ label: prog.miLabel, val: prog.mi }] : []),
                      { label: "Taxes", val: taxes },
                      { label: "Insurance", val: insurance },
                    ].map((r, ri) => (
                      <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, color: P.warmGray, borderBottom: `1px solid ${P.cream}` }}>
                        <span>{r.label}</span>
                        <span style={{ fontWeight: 600, color: P.text }}>{fmt(r.val)}</span>
                      </div>
                    ))}
                  </div>

                  {/* VA Usage selector */}
                  {prog.isVA && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>VA Eligibility</label>
                      <select
                        value={vaUsage}
                        onChange={(e) => setVaUsage(e.target.value)}
                        style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.cream, padding: "8px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                      >
                        <option value="first">First-Time Use</option>
                        <option value="subsequent">Subsequent Use</option>
                        <option value="exempt">Exempt (Disability)</option>
                      </select>
                    </div>
                  )}

                  {/* Loan details */}
                  <div style={{ background: P.cream, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                    {prog.upfront > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                        <span style={{ color: P.warmGray }}>{prog.upfrontLabel}</span>
                        <span style={{ fontWeight: 600, color: P.text }}>{fmt(prog.upfront)}</span>
                      </div>
                    )}
                    {prog.isVA && prog.upfront === 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                        <span style={{ color: P.sage, fontWeight: 600 }}>Funding Fee Waived</span>
                        <span style={{ fontWeight: 600, color: P.sage }}>$0</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Total Loan Amount</span>
                      <span style={{ fontWeight: 700, color: prog.color }}>{fmt(prog.loan)}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", fontStyle: "italic" }}>{prog.note}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary insight */}
        <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
              {eligibleTotals.length >= 2 && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Monthly difference:</strong> The spread between the lowest and highest eligible payment is{" "}
                  <strong style={{ color: P.navy }}>{fmt(Math.max(...eligibleTotals) - lowestTotal)}/month</strong>{" "}
                  ({fmt((Math.max(...eligibleTotals) - lowestTotal) * 12)}/year).
                  {convRate !== fhaRate || convRate !== vaRate ? (
                    <span> Rate spread: Conv {convRate}% vs FHA {fhaRate}% vs VA {vaRate}% — this difference alone accounts for a meaningful portion of the payment gap.</span>
                  ) : null}
                </p>
              )}
              {programs.some(p => !p.eligible) && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Note:</strong> {programs.filter(p => !p.eligible).map(p => p.name).join(" and ")} {programs.filter(p => !p.eligible).length === 1 ? "is" : "are"} ineligible at {downPct}% down. 
                  {downPct < 3 ? " Minimum down payments: Conventional (3%), FHA (3.5%). Only VA allows 0% down." :
                   downPct < 3.5 ? " FHA requires a minimum 3.5% down payment. Increase to 3.5% to compare all three programs." : ""}
                </p>
              )}
              <p>
                {downPct >= 20
                  ? "With 20%+ down, Conventional has no PMI — often the clear winner. But compare the total loan amounts: FHA and VA finance upfront fees, meaning you borrow more even with the same down payment."
                  : downPct >= 5
                    ? "At this down payment, pay attention to mortgage insurance. Conventional PMI is removable at 80% LTV, FHA MIP may stay for the life of the loan, and VA has no monthly MI at all (but the funding fee adds to your balance). Conv PMI estimates here assume 740+ FICO and DTI under 43% — lower scores or higher DTI will increase PMI."
                    : downPct >= 3.5
                      ? "At less than 5% down, all three programs carry some form of mortgage insurance or upfront fee. Conv PMI estimates assume 740+ FICO and DTI under 43% — lower scores will increase PMI significantly. VA is often the best deal if you're eligible — no monthly MI at all."
                      : "At this down payment level, VA is likely your only option if you're eligible. Consider increasing your down payment to unlock Conventional and FHA programs."}
              </p>
              {vaUsage !== "exempt" && (
                <p style={{ marginTop: 8 }}>
                  <strong>VA funding fee:</strong> Currently set to {vaUsageLabels[vaUsage].toLowerCase()} at {vaFeeRate}%
                  {downPct < 5 && vaUsage === "subsequent" ? " — this is the highest tier. First-time users with the same down payment pay 2.15% instead." : ""}
                  {downPct >= 5 ? ` — at ${downPct >= 10 ? "10%+" : "5–9.99%"} down, the fee is the same for first-time and subsequent use.` : ""}
                  {" "}Use the dropdown on the VA card to compare scenarios. Veterans with service-connected disabilities are exempt entirely.
                </p>
              )}
              {vaUsage === "exempt" && (
                <p style={{ marginTop: 8 }}>
                  <strong>VA funding fee waived.</strong> Veterans with service-connected disabilities are exempt from the funding fee, making VA even more competitive — no upfront fee and no monthly MI.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Text results */}
        {(() => {
          const eligible = programs.filter(p => p.eligible);
          const winner = eligible.length > 0 ? eligible.reduce((a, b) => a.total < b.total ? a : b) : null;
          const lines = eligible.map(p => `${p.name}: ${fmt(p.total)}/mo (${p.rate}%)${p.total === lowestTotal ? " ← Lowest" : ""}`).join("\n");
          const body = encodeURIComponent(
            `Hi! Here's my mortgage scenario from MortgageGeek.ai:\n\n` +
            `${fmt(homePrice)} home | ${downPct}% down | ${term}yr\n\n` +
            `${lines}\n\n` +
            `Can we discuss my options?`
          );
          return (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <a href={`sms:+16156560737&body=${body}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 10,
                background: P.gold, color: "#fff",
                fontFamily: F.body, fontSize: 14, fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(184,134,11,0.3)",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Text Me These Results
              </a>
              <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 6 }}>Opens a text with your scenario pre-filled — ready to send</p>
            </div>
          );
        })()}

        {/* Cross-link to prequal */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <a href="/prequal" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            🎯 See what you qualify for in the Pre-Qual Simulator →
          </a>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          {ratesLoaded ? "Rates auto-populated from current national averages (Mortgage News Daily) and rounded to the nearest 0.125%. " : ""}
          This calculator is for educational purposes only. Actual rates, fees, and payment amounts vary by lender, credit profile, and loan scenario. Contact me at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized quote. NMLS# 1119524.
        </p>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function MortgageLandingPage() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname?.replace(/^\//, "");
    if (path === "calculator") return "calculator";
    if (path === "prequal") return "prequal";
    return "main";
  });

  if (currentPage === "calculator") return <CalculatorPage />;
  if (currentPage === "prequal") return <PreQualPage />;
  return <MainSite />;
}

function MainSite() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const [showFloatingCalc, setShowFloatingCalc] = useState(false);

  // Swipe-to-open/close sidebar — real-time finger tracking
  useEffect(() => {
    const SIDEBAR_W = 280;
    const EDGE_ZONE = 50;
    const SNAP_THRESHOLD = 80;
    let startX = 0, startY = 0, currentX = 0;
    let tracking = false, dirLocked = false, isHorizontal = false;
    let mode = null; // "opening" or "closing"

    const getSidebar = () => document.querySelector(".sidebar");
    const getOverlay = () => document.getElementById("sidebar-overlay-drag");

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      dirLocked = false;
      isHorizontal = false;

      if (!mobileOpen && startX < EDGE_ZONE) {
        mode = "opening";
        tracking = true;
      } else if (mobileOpen) {
        mode = "closing";
        tracking = true;
      } else {
        tracking = false;
      }
    };

    const onTouchMove = (e) => {
      if (!tracking) return;
      const touch = e.touches[0];
      currentX = touch.clientX;
      const dx = currentX - startX;
      const dy = touch.clientY - startY;

      // Lock direction after 8px of movement
      if (!dirLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        dirLocked = true;
        isHorizontal = Math.abs(dx) > Math.abs(dy);
        if (!isHorizontal) { tracking = false; return; }
        // Disable transitions for real-time tracking
        const sidebar = getSidebar();
        const overlay = getOverlay();
        if (sidebar) sidebar.classList.add("sidebar-dragging");
        if (overlay) overlay.classList.add("sidebar-dragging");
      }

      if (!dirLocked || !isHorizontal) return;

      const sidebar = getSidebar();
      const overlay = getOverlay();
      if (!sidebar) return;

      if (mode === "opening") {
        // dragPx: 0 (closed) to SIDEBAR_W (fully open)
        const dragPx = Math.max(0, Math.min(dx, SIDEBAR_W));
        const pct = dragPx / SIDEBAR_W;
        sidebar.style.transform = `translateX(${-SIDEBAR_W + dragPx}px)`;
        if (overlay) overlay.style.opacity = pct;
      } else if (mode === "closing") {
        // dx is negative when swiping left
        const dragPx = Math.max(0, Math.min(-dx, SIDEBAR_W));
        const pct = 1 - (dragPx / SIDEBAR_W);
        sidebar.style.transform = `translateX(${-dragPx}px)`;
        if (overlay) overlay.style.opacity = pct;
      }
    };

    const onTouchEnd = () => {
      if (!tracking || !isHorizontal) { tracking = false; return; }
      const dx = currentX - startX;
      const sidebar = getSidebar();
      const overlay = getOverlay();

      // Re-enable CSS transitions for snap
      if (sidebar) sidebar.classList.remove("sidebar-dragging");
      if (overlay) overlay.classList.remove("sidebar-dragging");

      // Clear inline styles — let CSS classes handle the snap
      if (sidebar) sidebar.style.transform = "";
      if (overlay) overlay.style.opacity = "";

      if (mode === "opening" && dx > SNAP_THRESHOLD) {
        setMobileOpen(true);
      } else if (mode === "closing" && dx < -SNAP_THRESHOLD) {
        setMobileOpen(false);
      }
      // If didn't pass threshold, CSS transitions snap back to current state

      tracking = false;
      mode = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => { setShowFloatingCalc(window.scrollY > 400); };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const handleSubNavigate = (sectionId, step) => {
    setNavTarget({ section: sectionId, step });
    handleNavigate(sectionId);
    setTimeout(() => setNavTarget(null), 500);
  };

  // Deep link: scroll to section on initial load from hash or path
  useEffect(() => {
    const scrollToTarget = () => {
      let target = window.location.hash?.replace("#", "");
      // Also support /calculator style paths
      if (!target) {
        const path = window.location.pathname?.replace("/", "");
        if (path) target = path;
      }
      if (target) {
        const el = document.getElementById(target);
        if (el) {
          setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
        }
      }
    };
    scrollToTarget();
    window.addEventListener("hashchange", scrollToTarget);
    return () => window.removeEventListener("hashchange", scrollToTarget);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, display: "flex", minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} onSubNavigate={handleSubNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main-content">
        <Hero onNavigate={handleNavigate} />
        <JourneyOverview onNavigate={handleSubNavigate} />
        <PreContract navTarget={navTarget} />
        <ActiveLoanProcess navTarget={navTarget} />
        <MortgageTypes navTarget={navTarget} />
        <ClosingCosts navTarget={navTarget} />
        <BorrowerProfile navTarget={navTarget} />
        <MortgageStructure navTarget={navTarget} />
        <InterestRates navTarget={navTarget} />
        <PreApprovalChecklist />
        <NextSteps />
        <ToolsCTA />
        <JargonDecoder />
        <footer style={{ padding: "40px 40px 32px", borderTop: `1px solid ${P.creamDark}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap", maxWidth: 720 }}>
            {/* Equal Housing Logo */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <svg width="40" height="42" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0L0 16.5V42H40V16.5L20 0Z" fill={P.navy}/>
                <path d="M20 2.5L2.5 17.5V40H37.5V17.5L20 2.5Z" fill={P.white} stroke={P.navy} strokeWidth="0.5"/>
                <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke={P.navy} strokeWidth="1.5" fill="none"/>
                <rect x="12" y="22" width="16" height="3" fill={P.navy}/>
                <rect x="12" y="28" width="16" height="3" fill={P.navy}/>
              </svg>
              <span style={{ fontSize: 7, fontWeight: 700, color: P.navy, letterSpacing: 0.3, textTransform: "uppercase", textAlign: "center", lineHeight: 1.2, maxWidth: 50 }}>Equal Housing Opportunity</span>
            </div>
            {/* Disclaimer text */}
            <div style={{ flex: 1, minWidth: 250 }}>
              <p style={{ fontFamily: F.display, fontSize: 18, color: P.navy, marginBottom: 8 }}>🤓 The Mortgage Geek</p>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: P.warmGrayLight, marginBottom: 8 }}>
                This content is for educational purposes only and does not constitute financial advice. Loan programs, rates, terms, and guidelines are subject to change without notice. Always consult directly with a licensed mortgage professional for guidance specific to your situation.
              </p>
              <p style={{ fontSize: 11, color: P.warmGrayLight, opacity: 0.6 }}>(615) 656-0737 · NMLS# 1119524 · Equal Housing Lender</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Floating tools button */}
      <a
        href="#tools-cta"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 20px", borderRadius: 50,
          background: P.gold, color: "#fff",
          fontFamily: F.body, fontSize: 14, fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(184,134,11,0.35), 0 2px 8px rgba(0,0,0,0.1)",
          transform: showFloatingCalc ? "translateY(0)" : "translateY(100px)",
          opacity: showFloatingCalc ? 1 : 0,
          transition: "all 0.3s ease",
          pointerEvents: showFloatingCalc ? "auto" : "none",
        }}
      >
        <span style={{ fontSize: 16 }}>🛠</span>
        Tools
      </a>
    </div>
  );
}

// ─── Global CSS ──────────────────────────────────────────────────────────────

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }

  .main-content { flex: 1; margin-left: 280px; min-width: 0; }
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: #0F2530; z-index: 150; overflow-y: auto; }
  .sidebar-overlay { display: none; }
  .mobile-bar { display: none; }
  .mobile-bar-inner { padding: 0 20px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
  .hamburger { background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; }

  .nav-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px; border: none; border-radius: 8px; background: transparent; color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-align: left; margin-bottom: 2px; }
  .nav-btn:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
  .nav-btn-active { background: rgba(255,255,255,0.08) !important; color: #fff !important; }

  .content-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }

  .tab-btn { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 20px; border-radius: 8px; border: 1px solid #F0EBE3; background: #fff; color: #9B9488; cursor: pointer; transition: all 0.15s; }
  .tab-btn:hover { border-color: #1B3A4B; color: #1B3A4B; }
  .tab-btn-active { background: #1B3A4B !important; color: #fff !important; border-color: #1B3A4B !important; }

  .process-grid { display: flex; gap: 24px; flex-wrap: wrap; }
  .process-steps { flex: 0 0 280px; display: flex; flex-direction: column; gap: 4px; min-width: 240px; }
  .process-step { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border: none; border-radius: 10px; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #6B6358; cursor: pointer; text-align: left; transition: all 0.15s; }
  .process-step:hover { background: rgba(255,255,255,0.6); }
  .process-step-active { background: #fff !important; color: #2C2825 !important; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
  .process-num { font-family: 'Instrument Serif', serif; font-size: 20px; color: #9B9488; min-width: 28px; line-height: 1.3; }
  .process-num-active { color: #B8860B !important; }
  .process-detail { flex: 1; background: #fff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.04); min-width: 300px; }

  .costs-cat-head { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border: none; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #1B3A4B; cursor: pointer; transition: all 0.15s; border-radius: 12px; }
  .costs-cat-head:hover { background: #FAF7F2; }
  .costs-cat-head-active { background: #1B3A4B !important; color: #fff !important; border-radius: 12px 12px 0 0; }

  .calc-grid { max-width: 880px; display: flex; gap: 28px; flex-wrap: wrap; }
  .calc-grid > *:first-child { flex: 1 1 300px; }
  .calc-grid > *:last-child { flex: 1 1 360px; }

  @media (max-width: 900px) {
    .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; padding-top: 56px; will-change: transform; }
    .sidebar-open { transform: translateX(0); }
    .sidebar-dragging { transition: none !important; }
    .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 140; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
    .sidebar-overlay-visible { opacity: 1; pointer-events: auto; }
    .mobile-bar { display: block !important; position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: #0F2530; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .main-content { margin-left: 0 !important; padding-top: 56px; }
    .process-grid { flex-direction: column; }
    .process-steps { flex: 1 1 auto; }
    .calc-grid { flex-direction: column; }
    .calc-grid > *:first-child, .calc-grid > *:last-child { flex: 1 1 auto; }
  }
  @media (max-width: 600px) {
    section { padding-left: 20px !important; padding-right: 20px !important; }
  }
`;
