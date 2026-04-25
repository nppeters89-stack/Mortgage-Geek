// Normalized data for the Derogatory Credit Wait Periods deep dive.
// Drives the WaitPeriodRows + Ch13Card components.

export const DEROG_PROGRAM_COLORS = {
  Fannie: "#1B3A4B",
  Freddie: "#2C5468",
  FHA: "#8B6914",
  VA: "#5A7A6E",
  USDA: "#B8860B",
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
  latepayments: {
    id: "latepayments",
    rows: [
      { program: "Fannie",  std: 1, stdLabel: "12 mo clean", extYears: null, extLabel: null, note: "From last 60+ day delinquency" },
      { program: "Freddie", std: 1, stdLabel: "12 mo clean", extYears: null, extLabel: null, note: "Max one 30-day late in 24 mo" },
      { program: "FHA",     std: 1, stdLabel: "Varies",      extYears: null, extLabel: null, note: "Stricter on cash-out + manual UW" },
      { program: "VA",      std: 1, stdLabel: "12 mo",       extYears: null, extLabel: null, note: "Max one 30-day late in 12 mo" },
      { program: "USDA",    std: 1, stdLabel: "12 mo",       extYears: null, extLabel: null, note: "Max one 30-day late OR carve-outs" },
    ],
  },
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
    FHA: "HUD 4000.1 II.A.5.b.iv",
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
  latepayments: {
    Fannie: "Selling Guide B3-5.3-03",
    Freddie: "Selling Guide 5202.5",
    FHA: "HUD 4000.1 II.A.4.b.K",
    VA: "Lender's Handbook M26-7 Ch. 4",
    USDA: "HB-1-3555 Chapter 10",
  },
};

export const CH13_PATHS = [
  { key: "discharged", label: "Discharged" },
  { key: "dismissed",  label: "Dismissed" },
  { key: "activePlan", label: "During active plan" },
];

export const CH13_DATA = {
  rows: [
    {
      program: "Fannie",
      paths: {
        discharged: { years: 2, label: "2 yrs" },
        dismissed:  { years: 4, label: "4 yrs" },
        activePlan: { years: null, label: "Not eligible" },
      },
      source: "Selling Guide B3-5.3-07",
    },
    {
      program: "Freddie",
      paths: {
        discharged: { years: 2, label: "2 yrs" },
        dismissed:  { years: 4, label: "4 yrs" },
        activePlan: { years: null, label: "Not eligible" },
      },
      source: "Selling Guide 5202.5",
    },
    {
      program: "FHA",
      paths: {
        discharged: { years: 0, label: "No wait" },
        dismissed:  { years: 1, label: "Manual UW" },
        activePlan: { years: 1, label: "12 mo + court OK" },
      },
      source: "HUD 4000.1 II.A.5.b.iv",
    },
    {
      program: "VA",
      paths: {
        discharged: { years: 0, label: "No wait" },
        dismissed:  { years: 1, label: "Manual UW" },
        activePlan: { years: 1, label: "12 mo + court OK" },
      },
      source: "Lender's Handbook M26-7 Ch. 4",
    },
    {
      program: "USDA",
      paths: {
        discharged: { years: 1, label: "12 mo" },
        dismissed:  { years: 1, label: "Credit exception" },
        activePlan: { years: 1, label: "12 mo + court OK" },
      },
      source: "HB-1-3555 Chapter 10",
    },
  ],
};
