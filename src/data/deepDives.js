// Deep Dives index content. Titles, taglines, emojis, verified months, and
// categories are the exact strings from the design handoff's ARTICLES array.
// `slug` maps each to its existing /deep-dives/<slug> route. `program` is set
// only on the three Manual Underwriting cards (the only ones that get a pill);
// the pill color comes from PROGRAM_COLORS at render. House Hacking is the
// manually flagged Featured article; its `desc` is the real copy from the live
// card (the handoff's prototype paragraph was best-guess). No em-dashes.

// The six categories, in display order (section numbering 01..06).
export const CATEGORIES = [
  "Income & Employment",
  "Down Payment & Funds",
  "Credit & Existing Debts",
  "Manual Underwriting",
  "Costs, Rates & Negotiation",
  "Special Situations & Strategy",
];

export const ARTICLES = [
  { slug: "self-employed-documentation", emoji: "📊", title: "Self-Employed Documentation", tagline: "What lenders want from self-employed borrowers, by structure and program", verified: "May 2026", cat: "Income & Employment" },
  { slug: "hourly-and-part-time-income", emoji: "⏱️", title: "Hourly, Part-Time & Seasonal Income", tagline: "Qualifying with non-salary W-2 income across all five programs", verified: "Apr 2026", cat: "Income & Employment" },
  { slug: "expected-income", emoji: "📅", title: "Expected Income (New Job Offer)", tagline: "Qualifying on an offer letter for a job you haven't started yet", verified: "Feb 2026", cat: "Income & Employment" },

  { slug: "gift-funds", emoji: "🎁", title: "Gift Funds", tagline: "Who can give you down payment money, by program, with the 5×5 donor matrix", verified: "Apr 2026", cat: "Down Payment & Funds" },
  { slug: "business-assets", emoji: "🏦", title: "Business Assets", tagline: "Using company money for a down payment without hurting the business", verified: "Jan 2026", cat: "Down Payment & Funds" },

  { slug: "derogatory-credit", emoji: "⏳", title: "Derogatory Credit Wait Periods", tagline: "How long after bankruptcy, foreclosure, or short sale, across all five programs", verified: "Mar 2026", cat: "Credit & Existing Debts" },
  { slug: "debts-paid-by-others", emoji: "🤝", title: "Debts Paid by Others", tagline: "When someone else pays a debt in your name, can you drop it from DTI?", verified: "Dec 2025", cat: "Credit & Existing Debts" },

  { slug: "fha-manual-underwriting", emoji: "📋", title: "FHA Manual Underwriting", tagline: "When FHA sends your file to a human: HUD 4000.1 rules and downgrade triggers", verified: "Mar 2026", cat: "Manual Underwriting", program: "FHA" },
  { slug: "va-manual-underwriting", emoji: "🎖️", title: "VA Manual Underwriting", tagline: "When VA refers your file: residual income tables and the 13 comp factors", verified: "Feb 2026", cat: "Manual Underwriting", program: "VA" },
  { slug: "usda-manual-underwriting", emoji: "🌾", title: "USDA Manual Underwriting", tagline: "When GUS returns Refer: the ratio ceilings, the 680 gate, and the comp factors", verified: "Jan 2026", cat: "Manual Underwriting", program: "USDA" },

  { slug: "seller-concessions", emoji: "💰", title: "Seller Concessions", tagline: "What the seller can pay toward your costs, by program, including the VA two-bucket rule", verified: "May 2026", cat: "Costs, Rates & Negotiation" },
  { slug: "rate-buydowns", emoji: "📉", title: "Rate Buydowns", tagline: "One $10K credit run four ways: price cut, points, and a 2-1 buydown, with the math", verified: "Apr 2026", cat: "Costs, Rates & Negotiation" },
  { slug: "arms-demystified", emoji: "📈", title: "ARMs Demystified", tagline: "How adjustable-rate mortgages actually work, and when they bite", verified: "Feb 2026", cat: "Costs, Rates & Negotiation" },

  { slug: "residency-rules", emoji: "🌐", title: "Residency & Visa Rules", tagline: "Which residency status qualifies for which program, including the 2025 FHA change", verified: "Mar 2026", cat: "Special Situations & Strategy" },
  {
    slug: "house-hacking",
    emoji: "🏘️",
    title: "House Hacking",
    tagline: "Live in one unit, rent the rest, and learn which strategies actually help you qualify",
    verified: "Jun 2026",
    cat: "Special Situations & Strategy",
    featured: true,
    desc: "Live in part of a property and rent the rest so the income helps you buy and qualify. FHA duplex and 3-4 unit, the single-family-plus-ADU play, VA multi-unit at zero down with second-tier entitlement, plus which strategies actually count toward qualifying and which only help cash flow.",
  },
];
