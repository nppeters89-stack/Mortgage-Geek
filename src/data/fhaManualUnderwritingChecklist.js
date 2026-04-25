export const FHA_MANUAL_CHECKLIST = [
  {
    title: "Initial Borrower Conversation",
    description: "Use this checklist on day one with any borrower who has flags suggesting their file may go to manual underwriting (recent derog, mortgage lates, BK/foreclosure history, declining self-employed income, etc.). Catching these issues early is the single biggest factor in whether the file closes.",
    subsections: [
      {
        heading: "Credit and payment history",
        items: [
          { id: "credit-1", text: "Pulled credit report and reviewed for any disputed accounts" },
          { id: "credit-2", text: "Confirmed cumulative disputed derogatory accounts under $1,000 (excluding medical, identity theft)" },
          { id: "credit-3", text: "Reviewed mortgage payment history for last 12 months: zero 30-day lates required" },
          { id: "credit-4", text: "Reviewed mortgage payment history for last 24 months: max two 30-day lates" },
          { id: "credit-5", text: "Reviewed installment loan payments for last 12 months: zero 30-day lates required" },
          { id: "credit-6", text: "Reviewed installment loan payments for last 24 months: max two 30-day lates" },
          { id: "credit-7", text: "Reviewed revolving accounts for last 12 months: no 90+ day lates, no three-or-more 60-day lates" },
          { id: "credit-8", text: "Asked borrower to disclose any late payments not on credit report (private lenders, family loans)" },
        ],
      },
      {
        heading: "Bankruptcy and major derogatory events",
        items: [
          { id: "bk-1", text: "If Chapter 7 BK, confirmed discharge date is 2+ years before case number assignment" },
          { id: "bk-2", text: "If Chapter 13 BK, confirmed either discharged 2+ years OR 12+ months of trustee payments with court approval" },
          { id: "bk-3", text: "If foreclosure, deed-in-lieu, or short sale, confirmed 3+ years since completion" },
          { id: "bk-4", text: "If extenuating circumstances exist (serious illness, involuntary job loss, death of wage earner), gathered documentation" },
        ],
      },
      {
        heading: "Housing history",
        items: [
          { id: "housing-1", text: "Confirmed borrower has 12 months of documentable housing history" },
          { id: "housing-2", text: "Identified documentation source: canceled checks, bank statements, or rent-free letter" },
          { id: "housing-3", text: "If rent-free, gathered letter from whoever borrower lives with" },
        ],
      },
      {
        heading: "Income and employment",
        items: [
          { id: "income-1", text: "If self-employed, calculated 2-year income trend; flagged any 20%+ decline" },
          { id: "income-2", text: "Identified all overtime, bonus, part-time, seasonal income sources" },
          { id: "income-3", text: "Confirmed income sources have at least 12 months of history" },
        ],
      },
      {
        heading: "Assets",
        items: [
          { id: "assets-1", text: "Verified borrower has at least 1 month of PITI in reserves from own funds" },
          { id: "assets-2", text: "Confirmed reserves are NOT gift funds (gifts excluded from reserves on manuals)" },
          { id: "assets-3", text: "If using reserves as compensating factor, confirmed 3+ months (1-2 unit) or 6+ months (3-4 unit)" },
          { id: "assets-4", text: "Reviewed last 2 months of bank statements for: NSFs, BNPL activity, payday loans, large unexplained deposits" },
        ],
      },
      {
        heading: "Collections and charge-offs",
        items: [
          { id: "coll-1", text: "Calculated cumulative non-medical collections balance" },
          { id: "coll-2", text: "If non-medical collections $2,000+, chose path: payoff, payment plan, or 5% formula" },
          { id: "coll-3", text: "Identified any open charge-offs and collected explanation letter from borrower" },
          { id: "coll-4", text: "Confirmed medical collections will not require payoff or DTI inclusion" },
        ],
      },
    ],
  },
  {
    title: "DTI and Compensating Factors",
    description: "Once you have the borrower's full picture, run the qualifying ratios against the HUD grid to determine which tier they fall into and what compensating factors are needed.",
    subsections: [
      {
        heading: "Calculate ratios",
        items: [
          { id: "ratio-1", text: "Calculated proposed front-end (housing) ratio: PITI / gross monthly income" },
          { id: "ratio-2", text: "Calculated proposed back-end (total DTI) ratio: all monthly debts / gross monthly income" },
          { id: "ratio-3", text: "Documented the lowest middle credit score for the borrower" },
        ],
      },
      {
        heading: "Match to HUD tier (find the row that matches the borrower's credit score and target ratios)",
        items: [
          { id: "tier-1", text: "Tier 1: 31/43 or below, 580+ score — no comp factors required" },
          { id: "tier-2", text: "Tier 2: 37/47 or below, 580+ score — one comp factor required" },
          { id: "tier-3", text: "Tier 3: 40/40 exactly, 580+ score — no discretionary debt required" },
          { id: "tier-4", text: "Tier 4: 40/50 or below, 580+ score — two comp factors required" },
          { id: "tier-5", text: "Below 580 or no score — capped at 31/43 (33/45 with energy efficient)" },
        ],
      },
      {
        heading: "If using cash reserves",
        items: [
          { id: "comp-reserves-1", text: "3+ months PITI for 1-2 unit (6+ for 3-4 unit), from own funds, no gifts" },
        ],
      },
      {
        heading: "If using minimal increase in housing payment",
        items: [
          { id: "comp-housing-1", text: "12-month housing history with no more than one 30-day late" },
          { id: "comp-housing-2", text: "New PITI does not exceed current housing payment by more than the lesser of $100 or 5%" },
          { id: "comp-housing-3", text: "Borrower has a current housing payment (cannot use if rent-free)" },
        ],
      },
      {
        heading: "If using no discretionary debt",
        items: [
          { id: "comp-disc-1", text: "Established tradelines open 6+ months" },
          { id: "comp-disc-2", text: "All revolving accounts paid in full each month for past 6 months" },
        ],
      },
      {
        heading: "If using significant additional income",
        items: [
          { id: "comp-addl-1", text: "OT/bonus/part-time/seasonal income has 12+ months of history" },
          { id: "comp-addl-2", text: "Documented as likely to continue" },
          { id: "comp-addl-3", text: "Sufficient to reduce DTI to 37/47 if included" },
          { id: "comp-addl-4", text: "Combined with at least one other comp factor (cannot be sole factor above 37/47)" },
        ],
      },
      {
        heading: "If using residual income",
        items: [
          { id: "comp-resid-1", text: "Calculated residual income per VA guidelines for household size and region" },
          { id: "comp-resid-2", text: "Includes childcare, maintenance, utilities" },
        ],
      },
    ],
  },
  {
    title: "File Documentation Required at Submission",
    description: "These are documents the underwriter will require for any FHA manual underwrite. Gathering them before submission rather than waiting for conditions saves significant time.",
    subsections: [
      {
        heading: "Income documentation",
        items: [
          { id: "doc-income-1", text: "Most recent 30 days of pay stubs" },
          { id: "doc-income-2", text: "Most recent 2 years of W-2s" },
          { id: "doc-income-3", text: "Most recent 2 years of personal tax returns (all schedules)" },
          { id: "doc-income-4", text: "If self-employed: 2 years of business tax returns plus YTD P&L" },
          { id: "doc-income-5", text: "Verbal Verification of Employment (VVOE) within 10 days of closing" },
          { id: "doc-income-6", text: "Written Verification of Employment (WVOE) where required by overlay" },
        ],
      },
      {
        heading: "Asset documentation",
        items: [
          { id: "doc-asset-1", text: "Most recent 2 months of asset statements for all accounts" },
          { id: "doc-asset-2", text: "Source documentation for any large deposits over 50% of monthly income" },
          { id: "doc-asset-3", text: "Gift letter and donor sourcing if any gift funds used" },
          { id: "doc-asset-4", text: "Retirement account statements if using reserves at 60% vested balance" },
        ],
      },
      {
        heading: "Housing documentation",
        items: [
          { id: "doc-housing-1", text: "Verification of Rent (VOR): 12 months of canceled checks OR 12 months of bank statements showing rent payments" },
          { id: "doc-housing-2", text: "If currently owning: 12 months of mortgage statements" },
          { id: "doc-housing-3", text: "If rent-free: signed letter from person borrower lives with" },
        ],
      },
      {
        heading: "Credit documentation",
        items: [
          { id: "doc-credit-1", text: "Letter of explanation for any derogatory accounts" },
          { id: "doc-credit-2", text: "Letter of explanation for any inquiries within last 90 days" },
          { id: "doc-credit-3", text: "Documentation of any disputed account resolutions" },
          { id: "doc-credit-4", text: "If extenuating circumstances claimed: full documentation per HUD guidelines" },
        ],
      },
      {
        heading: "Property documentation",
        items: [
          { id: "doc-prop-1", text: "FHA case number assigned" },
          { id: "doc-prop-2", text: "FHA appraisal ordered (cannot use existing appraisals)" },
          { id: "doc-prop-3", text: "Title commitment showing clear title" },
          { id: "doc-prop-4", text: "HOA documents if applicable" },
        ],
      },
    ],
  },
  {
    title: "Lender Overlays to Confirm Up Front",
    description: "HUD's rules are the floor. Your lender's overlays are the ceiling. Confirm these before getting deep into a file:",
    subsections: [
      {
        heading: null,
        items: [
          { id: "overlay-1", text: "Minimum credit score (HUD allows 500, most lenders require 580+, some 620+)" },
          { id: "overlay-2", text: "Maximum DTI (HUD allows 50 with comp factors, some lenders cap at 43-45)" },
          { id: "overlay-3", text: "Reserves requirement on manuals (HUD requires 1 month, some lenders require 3+)" },
          { id: "overlay-4", text: "Treatment of disputed accounts (HUD allows up to $1,000, some lenders zero tolerance)" },
          { id: "overlay-5", text: "Treatment of charge-offs (HUD doesn't require payoff, some lenders do)" },
          { id: "overlay-6", text: "Mortgage late tolerance on AUS-approved files (some lenders downgrade for any 30-day late)" },
          { id: "overlay-7", text: "Bankruptcy seasoning (HUD baseline is 2 years, some lenders require 3-4)" },
        ],
      },
    ],
  },
];
