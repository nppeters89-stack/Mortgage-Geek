// Normalized data for the Derogatory Credit Wait Periods deep dive.
// Drives the WaitPeriodRows + Ch13Card components.
import { PROGRAM_COLORS } from "../theme";

// Ported to the Rate secondary palette (Phase 4a). Fannie/Freddie are both
// Conventional, so Fannie takes Rate Blue and Freddie a lighter sibling shade
// (#3D6FA8, 4.77:1 on cream) to keep the two agencies visually distinct — these
// values render as 26px display text and as bar fills.
export const DEROG_PROGRAM_COLORS = {
  Fannie: PROGRAM_COLORS.Conventional, // Rate Blue
  Freddie: "#3D6FA8",                  // lighter Rate Blue (Conventional sibling)
  FHA: PROGRAM_COLORS.FHA,             // Rate Gold
  VA: PROGRAM_COLORS.VA,               // Rate Burgundy
  USDA: PROGRAM_COLORS.USDA,           // Rate Green
};

export const PROGRAM_META = {
  Fannie: { full: "Fannie Mae", flavor: "Conventional" },
  Freddie: { full: "Freddie Mac", flavor: "Conventional" },
  FHA: { full: "FHA", flavor: "Government" },
  VA: { full: "VA", flavor: "Government · Veterans" },
  USDA: { full: "USDA", flavor: "Government · Rural" },
};

export const SCALE_MAX = 8;

export const EVENTS = {
  chapter7: {
    id: "chapter7",
    rows: [
      { program: "Fannie",  std: 4, stdLabel: "4 yrs", extYears: 2, extLabel: "2 yrs",         note: "From discharge or dismissal" },
      { program: "Freddie", std: 4, stdLabel: "4 yrs", extYears: 2, extLabel: "2 yrs",         note: "From discharge or dismissal" },
      { program: "FHA",     std: 2, stdLabel: "2 yrs", extYears: 1, extLabel: "1 yr (manual)", note: "From discharge" },
      { program: "VA",      std: 2, stdLabel: "2 yrs", extYears: 1, extLabel: "1 yr (manual)", note: "From discharge" },
      { program: "USDA",    std: 3, stdLabel: "3 yrs", extYears: 1, extLabel: "1 yr (manual)", note: "From discharge" },
    ],
  },
  foreclosure: {
    id: "foreclosure",
    rows: [
      { program: "Fannie",  std: 7, stdLabel: "7 yrs", extYears: 3, extLabel: "3 yrs (90% LTV cap)", note: "Primary residence purchase only" },
      { program: "Freddie", std: 7, stdLabel: "7 yrs", extYears: 3, extLabel: "3 yrs (90% LTV cap)", note: "Primary or rate/term refi" },
      { program: "FHA",     std: 3, stdLabel: "3 yrs", extYears: 1, extLabel: "1 yr (manual)",       note: "From completion date" },
      { program: "VA",      std: 2, stdLabel: "2 yrs", extYears: 1, extLabel: "1 yr (manual)",       note: "From completion date" },
      { program: "USDA",    std: 3, stdLabel: "3 yrs", extYears: 1, extLabel: "1 yr (manual)",       note: "From completion date" },
    ],
  },
  shortsale: {
    id: "shortsale",
    rows: [
      { program: "Fannie",  std: 4, stdLabel: "4 yrs",   extYears: 2, extLabel: "2 yrs",        note: "SS and DIL treated identically" },
      { program: "Freddie", std: 4, stdLabel: "4 yrs",   extYears: 2, extLabel: "2 yrs (90%)",  note: "SS and DIL treated identically" },
      { program: "FHA",     std: 3, stdLabel: "3 yrs",   extYears: 1, extLabel: "1 yr (manual)", note: "SS and DIL treated identically" },
      { program: "VA",      std: 0, stdLabel: "No wait*", extYears: 1, extLabel: "1 yr",        note: "*If no lates before sale; DIL = 2 yrs" },
      { program: "USDA",    std: 3, stdLabel: "3 yrs",   extYears: 1, extLabel: "1 yr (manual)", note: "SS and DIL treated identically" },
    ],
  },
};

// Late Mortgage Payments section (A1 model: a Ch13-style cell per program with a
// headline, an AUS-vs-manual badge, and a detailed note). Content verified Aug
// 2026 against HUD 4000.1, Fannie Selling Guide B3-5.3-03 / B3-5.3-09, VA M26-7
// Ch. 4, and USDA HB-1-3555 Ch. 10. Two items ship hedged pending Nick's sign-off:
// the Freddie 5202.5 manual-UW housing-history language, and any USDA shelter-cost
// percentage (the handbook says "significantly reduce," not a fixed 50%).
export const LATE_PAYMENTS = {
  rows: [
    {
      program: "Fannie",
      headline: "Hard eligibility line",
      badge: "hardline",
      badgeLabel: "Eligibility line",
      note: "Any 60, 90, 120, or 150-day mortgage late reported in the 12 months before the credit report date is \"excessive prior mortgage delinquency,\" and the loan **can't be delivered to Fannie Mae**. That's a true eligibility line, not an AUS gate. Separately, DU returns Ineligible if a mortgage is currently two or more payments past due, or was two or more past due at any point in the last 12 months. **A single 30-day mortgage late can still get a DU approval** depending on the rest of the file. A 60-day or worse late means waiting until it's more than 12 months old.",
      source: "Selling Guide B3-5.3-03, B3-5.3-09",
    },
    {
      program: "Freddie",
      headline: "AUS-driven, no bright line",
      badge: "aus",
      badgeLabel: "AUS gate",
      note: "On LPA there's **no published late-payment count**. Your credit is acceptable if the loan gets a Risk Class of Accept. Recent mortgage lates weigh heavily in that call, but Freddie doesn't publish a bright line for AUS files. Manually underwritten loans, and borrowers without usable credit scores, face explicit housing-history requirements in Guide 5202.5. [VERIFY: exact current 5202.5 manual-UW housing-history language pending Nick's confirmation.]",
      source: "Seller/Servicer Guide 5202.5",
    },
    {
      program: "FHA",
      headline: "Kicks to manual",
      badge: "manual",
      badgeLabel: "Kicks to manual",
      note: "**Purchase / no-cash-out refi (TOTAL):** your file gets kicked to manual underwriting if any mortgage tradeline in the 12 months before case number assignment shows any of these: three or more lates over 30 days; one 60-day late plus one 30-day late; one payment over 90 days late; or fewer than three consecutive payments since a forbearance plan ended. **Cash-out refi (TOTAL):** kicked to manual for a current delinquency, any delinquency within 12 months, or fewer than 12 consecutive payments since forbearance ended (so a cash-out effectively needs a clean 12 months to stay automated). **These are downgrade triggers, not automatic denials.** A downgraded file can still close if it clears manual underwriting, where acceptable housing history generally means no mortgage lates in the last 12 months. [NICK: real-world example of a downgraded file that still closed]",
      source: "HUD Handbook 4000.1 (TOTAL + Manual UW)",
    },
    {
      program: "VA",
      headline: "Judgment, no published line",
      badge: "judgment",
      badgeLabel: "Lender judgment",
      note: "The handbook publishes **no bright-line late count**. VA credit underwriting is judgment-based: a mortgage late in the last 12 months generally needs a written explanation and is weighed within the whole credit picture. In practice, lenders want 12 months with no more than one 30-day mortgage late, and many run a 0x30 overlay. **That's lender practice, not handbook text.**",
      source: "Lender's Handbook M26-7, Chapter 4",
    },
    {
      program: "USDA",
      headline: "Clean on GUS, exception on manual",
      badge: "exception",
      badgeLabel: "Documented exception",
      note: "**GUS Accept files:** no bright-line late count is applied. **Manually underwritten files:** more than one 30-day late on rent or mortgage in the last 12 months is an indicator of unacceptable credit. It can be overcome with a documented credit exception (circumstances that were temporary, beyond the applicant's control, and resolved), or where the new loan significantly reduces shelter costs. This models the Guaranteed program; don't borrow Direct-program thresholds.",
      source: "HB-1-3555, Chapter 10",
    },
  ],
};

export const EVENT_SOURCES = {
  chapter7: {
    Fannie: "Selling Guide B3-5.3-07",
    Freddie: "Selling Guide 5202.5",
    FHA: "HUD 4000.1 II.A.5.b.iv",
    VA: "Lender's Handbook M26-7 Ch. 4",
    USDA: "HB-1-3555 Chapter 10",
  },
  chapter13: {
    Fannie: "Selling Guide B3-5.3-07",
    Freddie: "Selling Guide 5202.5",
    FHA: "HUD 4000.1 II.A.4.b.iii(A); II.A.5.b.iv",
    VA: "Lender's Handbook M26-7 Ch. 4",
    USDA: "HB-1-3555 Chapter 10",
  },
  foreclosure: {
    Fannie: "Selling Guide B3-5.3-07",
    Freddie: "Selling Guide 5202.5",
    FHA: "HUD 4000.1 II.A.5.a.iii",
    VA: "Lender's Handbook M26-7 Ch. 4",
    USDA: "HB-1-3555 Chapter 10",
  },
  shortsale: {
    Fannie: "Selling Guide B3-5.3-07",
    Freddie: "Selling Guide 5202.5",
    FHA: "HUD 4000.1 II.A.5.a.iii",
    VA: "Lender's Handbook M26-7 Ch. 4",
    USDA: "HB-1-3555 Chapter 10",
  },
};

export const CH13_PATHS = [
  { key: "activePlan", label: "During active plan" },
  { key: "discharged", label: "Discharged (completed)" },
  { key: "dismissed",  label: "Dismissed (failed)" },
];

// Badge vocabulary: "aus" (solid navy pill), "manual" (outlined navy pill),
// "exception" (outlined muted-red pill), "na" (dashed gray pill).
// headlineSize "sm" renders the headline at 16px instead of 21px.
export const CH13_DATA = {
  rows: [
    {
      program: "Fannie",
      paths: {
        activePlan: {
          headline: "Not eligible", headlineSize: "sm", muted: true,
          badge: "na", badgeLabel: "Not eligible",
          note: "Must wait for discharge or dismissal. No in-plan path exists.",
        },
        discharged: {
          headline: "2 yrs",
          badge: "aus", badgeLabel: "AUS OK",
          note: "From discharge date. **Extenuating circumstances do not shorten this**: it is 2 years either way.",
        },
        dismissed: {
          headline: "4 yrs",
          badge: "aus", badgeLabel: "AUS OK",
          note: "From dismissal date. Drops to **2 yrs with documented extenuating circumstances**.",
        },
      },
      source: "Selling Guide B3-5.3-07",
    },
    {
      program: "Freddie",
      paths: {
        activePlan: {
          headline: "Not eligible", headlineSize: "sm", muted: true,
          badge: "na", badgeLabel: "Not eligible",
          note: "Must wait for discharge or dismissal. No in-plan path exists.",
        },
        discharged: {
          headline: "2 yrs",
          badge: "aus", badgeLabel: "AUS OK",
          note: "From discharge date. Same 2 years with or without extenuating circumstances.",
        },
        dismissed: {
          headline: "4 yrs",
          badge: "aus", badgeLabel: "AUS OK",
          note: "From dismissal date. Drops to **2 yrs with documented extenuating circumstances**.",
        },
      },
      source: "Selling Guide 5202.5",
    },
    {
      program: "FHA",
      paths: {
        activePlan: {
          headline: "12 mo in plan",
          badge: "manual", badgeLabel: "Manual UW",
          note: "12 months of on-time trustee payments at case number assignment, plus **written court permission** to enter the mortgage.",
        },
        discharged: {
          headline: "No wait",
          badge: "manual", badgeLabel: "Manual UW < 2 yrs",
          note: "Eligible immediately, but a TOTAL Accept **must be downgraded to manual** when the discharge is within 2 years of case number assignment. AUS opens at the 2-year mark.",
          ausUnlock: true,
        },
        dismissed: {
          headline: "Underwriter review", headlineSize: "sm",
          badge: "manual", badgeLabel: "Manual UW",
          note: "No fixed wait published. Expect a manual underwrite with full credit analysis of why the plan failed.",
        },
      },
      source: "HUD 4000.1 II.A.4.b.iii(A); II.A.5.b.iv",
    },
    {
      program: "VA",
      paths: {
        activePlan: {
          headline: "12 mo in plan",
          badge: "manual", badgeLabel: "Manual UW",
          note: "12 months of satisfactory payments, and the **trustee or bankruptcy judge approves** the new credit. Lender may then give favorable consideration.",
        },
        discharged: {
          headline: "No wait",
          badge: "aus", badgeLabel: "AUS OK",
          note: "A completed plan means the lender **may conclude satisfactory credit is re-established**. AUS per findings; VA files can always fall back to manual.",
        },
        dismissed: {
          headline: "Underwriter review", headlineSize: "sm",
          badge: "manual", badgeLabel: "Manual UW",
          note: "The handbook publishes no Ch 13 dismissal rule. Overall credit picture and re-established history govern.",
        },
      },
      source: "Lender's Handbook M26-7 Ch. 4",
    },
    {
      program: "USDA",
      paths: {
        activePlan: {
          headline: "Eligible in plan",
          badge: "aus", badgeLabel: "GUS Accept OK",
          note: "All plan payments on time plus written court/trustee permission. **GUS Accept files need no seasoning and no credit exception.** GUS Refer or manual files must show 12 months of the plan elapsed.",
        },
        discharged: {
          headline: "No wait",
          badge: "aus", badgeLabel: "GUS Accept OK",
          note: "No credit exception on GUS Accept. Manual or Refer files completed **less than 12 months ago require a documented credit exception**; at 12+ months, none needed.",
        },
        dismissed: {
          headline: "Credit review", headlineSize: "sm",
          badge: "exception", badgeLabel: "Credit exception",
          note: "For a dismissed or not-completed plan, the lender evaluates the overall credit profile to determine if a credit exception applies.",
        },
      },
      source: "HB-1-3555 Chapter 10",
    },
  ],
};
