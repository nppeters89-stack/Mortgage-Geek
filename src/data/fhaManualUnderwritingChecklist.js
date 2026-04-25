export const FHA_MANUAL_CHECKLIST = {
  workflows: [
    {
      id: "refer",
      label: "Refer/Eligible",
      blurb: "AUS returned Refer/Eligible from the start. The file is manual. Run through HUD's manual underwriting standards.",
      sections: [
        {
          title: "Initial borrower conversation",
          description: "Day-one questions for any borrower whose file is on Refer/Eligible. The faster you spot issues, the more time you have to address them.",
          subsections: [
            {
              heading: "Credit and payment history (manual standards)",
              items: [
                { id: "ref-credit-1", text: "Pulled credit report and reviewed for any open disputes" },
                { id: "ref-credit-2", text: "Mortgage payment history last 12 months: zero 30-day lates" },
                { id: "ref-credit-3", text: "Mortgage payment history last 24 months: max two 30-day lates" },
                { id: "ref-credit-4", text: "Installment loans last 12 months: zero 30-day lates" },
                { id: "ref-credit-5", text: "Installment loans last 24 months: max two 30-day lates" },
                { id: "ref-credit-6", text: "Revolving accounts last 12 months: no 90+ day lates, no three-or-more 60-day lates" },
                { id: "ref-credit-7", text: "Asked borrower to disclose any late payments not on credit report (private lenders, family loans)" },
              ],
            },
            {
              heading: "Bankruptcy and major derogatory events (manual standards)",
              items: [
                { id: "ref-bk-1", text: "Chapter 7 BK: discharge is 2+ years before case number assignment" },
                { id: "ref-bk-2", text: "Chapter 13 BK: either discharged 2+ years OR 12+ months of trustee payments with court approval" },
                { id: "ref-bk-3", text: "Foreclosure / DIL / short sale: 3+ years since completion" },
                { id: "ref-bk-4", text: "If extenuating circumstances claimed (serious illness, involuntary job loss, death of wage earner): documentation gathered" },
              ],
            },
            {
              heading: "Housing history",
              items: [
                { id: "ref-housing-1", text: "12 months of documentable housing history confirmed" },
                { id: "ref-housing-2", text: "Documentation source identified: canceled checks, bank statements, or rent-free letter" },
                { id: "ref-housing-3", text: "If rent-free: letter from whoever borrower lives with" },
              ],
            },
            {
              heading: "Income and employment",
              items: [
                { id: "ref-income-1", text: "All income sources have at least 12 months of history" },
                { id: "ref-income-2", text: "Identified all overtime, bonus, part-time, seasonal income for comp factor potential" },
                { id: "ref-income-3", text: "If self-employed: 2-year income trend calculated" },
              ],
            },
            {
              heading: "Assets",
              items: [
                { id: "ref-assets-1", text: "At least 1 month of PITI in reserves, from borrower's own funds (not gifts)" },
                { id: "ref-assets-2", text: "If using reserves as comp factor: 3+ months (1-2 unit) or 6+ months (3-4 unit)" },
                { id: "ref-assets-3", text: "Reviewed last 2 months of bank statements for large unexplained deposits" },
              ],
            },
            {
              heading: "Collections and charge-offs",
              items: [
                { id: "ref-coll-1", text: "Calculated cumulative non-medical collections balance" },
                { id: "ref-coll-2", text: "If non-medical collections $2,000+: chose path (payoff, payment plan, or 5% in DTI)" },
                { id: "ref-coll-3", text: "Open charge-offs identified; explanation letter collected" },
                { id: "ref-coll-4", text: "Confirmed medical collections will not require payoff or DTI inclusion" },
              ],
            },
          ],
        },
        {
          title: "DTI and compensating factors",
          description: "Run the qualifying ratios against the HUD grid to determine which tier the file falls into and what comp factors are needed.",
          subsections: [
            {
              heading: "Calculate ratios",
              items: [
                { id: "ref-ratio-1", text: "Calculated proposed front-end (housing) ratio: PITI / gross monthly income" },
                { id: "ref-ratio-2", text: "Calculated proposed back-end (total DTI) ratio: all monthly debts / gross monthly income" },
                { id: "ref-ratio-3", text: "Documented the lowest middle credit score for the borrower" },
              ],
            },
            {
              heading: "Match to HUD tier (find the row that matches the borrower's credit score and target ratios)",
              items: [
                { id: "ref-tier-1", text: "Tier 1: 31/43 or below, 580+ score — no comp factors required" },
                { id: "ref-tier-2", text: "Tier 2: 37/47 or below, 580+ score — one comp factor required" },
                { id: "ref-tier-3", text: "Tier 3: 40/40 exactly, 580+ score — no discretionary debt required" },
                { id: "ref-tier-4", text: "Tier 4: 40/50 or below, 580+ score — two comp factors required" },
                { id: "ref-tier-5", text: "Below 580 or no score — capped at 31/43 (33/45 with energy efficient)" },
              ],
            },
            {
              heading: "If using cash reserves",
              items: [
                { id: "ref-comp-reserves-1", text: "3+ months PITI for 1-2 unit (6+ for 3-4 unit), from own funds, no gifts" },
              ],
            },
            {
              heading: "If using minimal increase in housing payment",
              items: [
                { id: "ref-comp-housing-1", text: "12-month housing history with no more than one 30-day late" },
                { id: "ref-comp-housing-2", text: "New PITI does not exceed current housing payment by more than the lesser of $100 or 5%" },
                { id: "ref-comp-housing-3", text: "Borrower has a current housing payment (cannot use if rent-free)" },
              ],
            },
            {
              heading: "If using no discretionary debt",
              items: [
                { id: "ref-comp-disc-1", text: "Established tradelines open 6+ months" },
                { id: "ref-comp-disc-2", text: "All revolving accounts paid in full each month for past 6 months" },
              ],
            },
            {
              heading: "If using significant additional income",
              items: [
                { id: "ref-comp-addl-1", text: "OT/bonus/part-time/seasonal income has 12+ months of history" },
                { id: "ref-comp-addl-2", text: "Documented as likely to continue" },
                { id: "ref-comp-addl-3", text: "Sufficient to reduce DTI to 37/47 if included" },
                { id: "ref-comp-addl-4", text: "Combined with at least one other comp factor (cannot be sole factor above 37/47)" },
              ],
            },
            {
              heading: "If using residual income",
              items: [
                { id: "ref-comp-resid-1", text: "Calculated residual income per VA guidelines for household size and region" },
                { id: "ref-comp-resid-2", text: "Includes childcare, maintenance, utilities" },
              ],
            },
          ],
        },
        {
          title: "File documentation required at submission",
          description: "Documents the underwriter will require for any FHA manual underwrite. Gather them before submission rather than waiting for conditions.",
          subsections: [
            {
              heading: "Income documentation",
              items: [
                { id: "ref-doc-income-1", text: "Most recent 30 days of pay stubs" },
                { id: "ref-doc-income-2", text: "Most recent 2 years of W-2s" },
                { id: "ref-doc-income-3", text: "Most recent 2 years of personal tax returns (all schedules)" },
                { id: "ref-doc-income-4", text: "If self-employed: 2 years of business tax returns plus YTD P&L" },
                { id: "ref-doc-income-5", text: "Verbal Verification of Employment (VVOE) within 10 days of closing" },
                { id: "ref-doc-income-6", text: "Written Verification of Employment (WVOE) where required by overlay" },
              ],
            },
            {
              heading: "Asset documentation",
              items: [
                { id: "ref-doc-asset-1", text: "Most recent 2 months of asset statements for all accounts" },
                { id: "ref-doc-asset-2", text: "Source documentation for any large deposits over 50% of monthly income" },
                { id: "ref-doc-asset-3", text: "Gift letter and donor sourcing if any gift funds used" },
                { id: "ref-doc-asset-4", text: "Retirement account statements if using reserves at 60% vested balance" },
              ],
            },
            {
              heading: "Housing documentation",
              items: [
                { id: "ref-doc-housing-1", text: "Verification of Rent (VOR): 12 months of canceled checks OR 12 months of bank statements showing rent payments" },
                { id: "ref-doc-housing-2", text: "If currently owning: 12 months of mortgage statements" },
                { id: "ref-doc-housing-3", text: "If rent-free: signed letter from person borrower lives with" },
              ],
            },
            {
              heading: "Credit documentation",
              items: [
                { id: "ref-doc-credit-1", text: "Letter of explanation for any derogatory accounts" },
                { id: "ref-doc-credit-2", text: "Letter of explanation for any inquiries within last 90 days" },
                { id: "ref-doc-credit-3", text: "Documentation of any disputed account resolutions" },
                { id: "ref-doc-credit-4", text: "If extenuating circumstances claimed: full documentation per HUD guidelines" },
              ],
            },
            {
              heading: "Property documentation",
              items: [
                { id: "ref-doc-prop-1", text: "FHA case number assigned" },
                { id: "ref-doc-prop-2", text: "FHA appraisal ordered (cannot use existing appraisals)" },
                { id: "ref-doc-prop-3", text: "Title commitment showing clear title" },
                { id: "ref-doc-prop-4", text: "HOA documents if applicable" },
              ],
            },
          ],
        },
        {
          title: "Lender overlays to confirm up front",
          description: "HUD's rules are the floor. Your lender's overlays are the ceiling. Confirm these before getting deep into a file.",
          subsections: [
            {
              heading: null,
              items: [
                { id: "ref-overlay-1", text: "Minimum credit score (HUD allows 500, most lenders require 580+, some 620+)" },
                { id: "ref-overlay-2", text: "Maximum DTI (HUD allows 50 with comp factors, some lenders cap at 43-45)" },
                { id: "ref-overlay-3", text: "Reserves requirement on manuals (HUD requires 1 month, some lenders require 3+)" },
                { id: "ref-overlay-4", text: "Treatment of disputed accounts (HUD allows up to $1,000, some lenders zero tolerance)" },
                { id: "ref-overlay-5", text: "Treatment of charge-offs (HUD doesn't require payoff, some lenders do)" },
                { id: "ref-overlay-6", text: "Mortgage late tolerance on AUS-approved files (some lenders downgrade for any 30-day late)" },
                { id: "ref-overlay-7", text: "Bankruptcy seasoning (HUD baseline is 2 years, some lenders require 3-4)" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "downgrade",
      label: "Manual Downgrade",
      blurb: "AUS returned Approve/Eligible but the file may need to be downgraded to manual. Identify the trigger first, then switch to the Refer/Eligible workflow for the full manual underwriting review.",
      sections: [
        {
          title: "Mortgage payment history triggers",
          description: "Any one of these forces a downgrade from Approve/Eligible to manual. Pull the credit report and any prior mortgage history carefully.",
          subsections: [
            {
              heading: "Last 12 months",
              items: [
                { id: "dg-mort-1", text: "Three or more 30-day late mortgage payments" },
                { id: "dg-mort-2", text: "One 60-day late plus one 30-day late (any combination)" },
                { id: "dg-mort-3", text: "One 90-day late mortgage payment" },
                { id: "dg-mort-4", text: "Less than three consecutive on-time payments since completing a mortgage forbearance plan" },
                { id: "dg-mort-5", text: "Any mortgage delinquency in the 12 months before case number assignment" },
              ],
            },
            {
              heading: "Last 24 months (if mortgage isn't on credit report)",
              items: [
                { id: "dg-mort-6", text: "More than two 30-day late payments" },
              ],
            },
          ],
        },
        {
          title: "Credit and seasoning triggers",
          description: "Other HUD-required downgrade conditions. Each one is its own potential trigger.",
          subsections: [
            {
              heading: null,
              items: [
                { id: "dg-cred-1", text: "Disputed derogatory credit accounts of $1,000 or more collectively (excludes medical and identity-theft disputes)" },
                { id: "dg-cred-2", text: "Bankruptcy discharge within 2 years of case number assignment" },
                { id: "dg-cred-3", text: "Foreclosure, deed-in-lieu, or short sale within 3 years of case number assignment" },
              ],
            },
          ],
        },
        {
          title: "Income and undisclosed-debt triggers",
          description: "Issues the AUS may not catch but the underwriter is required to act on once visible.",
          subsections: [
            {
              heading: null,
              items: [
                { id: "dg-inc-1", text: "Self-employed borrower with income decline of 20% or more year-over-year" },
                { id: "dg-inc-2", text: "Undisclosed mortgage debt discovered during the process" },
              ],
            },
          ],
        },
        {
          title: "AUS-invisible bank statement red flags",
          description: "The AUS doesn't see bank statements. The underwriter does. Anything here can force a downgrade after the AUS has already given an Approve.",
          subsections: [
            {
              heading: null,
              items: [
                { id: "dg-bs-1", text: "Excessive NSF / overdraft activity" },
                { id: "dg-bs-2", text: "Buy-now-pay-later (BNPL) activity that isn't on the credit report" },
                { id: "dg-bs-3", text: "Payday loans or active short-term consumer lending" },
              ],
            },
          ],
        },
        {
          title: "After confirming the downgrade",
          description: "Once the file is downgraded, treat it as a manual. Switch to the Refer/Eligible workflow above and run through the full manual underwriting review.",
          subsections: [
            {
              heading: null,
              items: [
                { id: "dg-next-1", text: "Notified borrower the file is being downgraded; reset expectations on documentation and timeline" },
                { id: "dg-next-2", text: "Switched to Refer/Eligible workflow for the full manual underwriting review" },
              ],
            },
          ],
        },
      ],
    },
  ],
};
