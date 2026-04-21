import { useState, useEffect, useLayoutEffect, useMemo, useRef, Fragment } from "react";
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

// Single source of truth for program colors — used in calculator, prequal, and comparison
const PROGRAM_COLORS = {
  Conventional: "#1B3A4B", // navy
  FHA: "#8B6914",          // goldMuted (darker for better white text contrast)
  VA: "#5A7A6E",           // sage
};

const F = {
  display: "'Instrument Serif', Georgia, serif",
  body: "'DM Sans', -apple-system, sans-serif",
};

// ─── Shared Tax Rate Tables ──────────────────────────────────────────────────
// Single source of truth for state/metro property tax rates used across the
// Calculator, Pre-Qual, and Cash to Close tools. When updating rates, update
// here and all three tools will reflect the change.

// 2026 loan limits (1-unit) referenced by SHARED_STATE_TAX_RATES metros.
const DEFAULT_LIMITS = { fha: 541287, conv: 832750, va: 832750 };
const NASH_MSA_LIMITS = { fha: 1029250, conv: 1029250, va: 1029250 };
const ATL_MSA_LIMITS = { fha: 718750, conv: 832750, va: 832750 };

// Used by PreQualPage and CalculatorPage. Rates are expressed as percentages
// (e.g., 0.95 = 0.95% effective annual rate). Some metros include FHA/Conv/VA
// loan limits for Pre-Qual's max-affordability calculation.
const SHARED_STATE_TAX_RATES = {
  AL: { name: "Alabama", rate: 0.41, metros: [
    { name: "Birmingham", rate: 0.52 }, { name: "Huntsville", rate: 0.46 }, { name: "Mobile", rate: 0.48 },
  ]},
  AK: { name: "Alaska", rate: 1.19 },
  AZ: { name: "Arizona", rate: 0.62, metros: [
    { name: "Phoenix/Maricopa", rate: 0.64 }, { name: "Tucson/Pima", rate: 0.93 },
  ]},
  AR: { name: "Arkansas", rate: 0.87, metros: [
    { name: "Benton County", rate: 1.03 },
    { name: "Craighead County", rate: 0.81 },
    { name: "Faulkner County", rate: 0.86 },
    { name: "Greene County", rate: 0.75 },
    { name: "Lonoke County", rate: 0.72 },
    { name: "Pulaski County", rate: 1.20 },
    { name: "Saline County", rate: 0.87 },
    { name: "Washington County", rate: 0.96 },
    { name: "White County", rate: 0.61 },
  ]},
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
  MS: { name: "Mississippi", rate: 1.10, metros: [
    { name: "DeSoto County", rate: 1.10 },
    { name: "Forrest County", rate: 1.55 },
    { name: "George County", rate: 0.80 },
    { name: "Harrison County", rate: 1.01 },
    { name: "Hinds County", rate: 1.49 },
    { name: "Jackson County", rate: 1.17 },
    { name: "Lamar County", rate: 1.09 },
    { name: "Madison County", rate: 1.02 },
    { name: "Marshall County", rate: 1.06 },
    { name: "Rankin County", rate: 1.12 },
  ]},
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
  TN: { name: "Tennessee", rate: 0.75, metros: [
    { name: "Anderson County", rate: 0.70 },
    { name: "Blount County", rate: 0.40 },
    { name: "Bradley County", rate: 0.79 },
    { name: "Chattanooga/Hamilton", rate: 0.85 },
    { name: "Fayette County", rate: 0.48 },
    { name: "Greene County", rate: 0.84 },
    { name: "Hamblen County", rate: 0.56 },
    { name: "Jefferson County", rate: 0.67 },
    { name: "Knoxville/Knox", rate: 0.82 },
    { name: "Lincoln County", rate: 0.47 },
    { name: "Madison County", rate: 0.87 },
    { name: "Marshall County", rate: 0.78 },
    { name: "Maury County", rate: 0.68 },
    { name: "McMinn County", rate: 0.49 },
    { name: "Memphis/Shelby", rate: 1.55 },
    { name: "Nashville/Davidson", rate: 0.95, limits: NASH_MSA_LIMITS },
    { name: "Putnam County", rate: 0.94 },
    { name: "Rhea County", rate: 0.47 },
    { name: "Roane County", rate: 0.54 },
    { name: "Robertson County", rate: 0.67 },
    { name: "Rutherford County", rate: 0.80, limits: NASH_MSA_LIMITS },
    { name: "Sevier County", rate: 0.48 },
    { name: "Sullivan County", rate: 1.19 },
    { name: "Sumner County", rate: 0.70, limits: NASH_MSA_LIMITS },
    { name: "Union County", rate: 0.47 },
    { name: "Washington County", rate: 0.77 },
    { name: "Williamson County", rate: 0.53, limits: NASH_MSA_LIMITS },
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

// Used by CashToClosePage. Rates are expressed as decimals (e.g., 0.0095 = 0.95%)
// because they're multiplied directly by home price in the reserve math.
const CASH_STATE_DEFAULT_TAX_RATES = {
  AL:0.0040, AK:0.0117, AZ:0.0066, AR:0.0087, CA:0.0073, CO:0.0051, CT:0.0214, DE:0.0061, DC:0.0062,
  FL:0.0091, GA:0.0090, HI:0.0028, ID:0.0069, IL:0.0223, IN:0.0085, IA:0.0157, KS:0.0141, KY:0.0085,
  LA:0.0055, ME:0.0136, MD:0.0109, MA:0.0123, MI:0.0154, MN:0.0112, MS:0.0110, MO:0.0097, MT:0.0084,
  NE:0.0173, NV:0.0060, NH:0.0218, NJ:0.0249, NM:0.0080, NY:0.0173, NC:0.0084, ND:0.0098, OH:0.0156,
  OK:0.0090, OR:0.0093, PA:0.0158, RI:0.0163, SC:0.0057, SD:0.0132, TN:0.0075, TX:0.0180, UT:0.0066,
  VT:0.0190, VA:0.0082, WA:0.0098, WV:0.0058, WI:0.0185, WY:0.0061,
};

// Metro-level tax rate overrides for Cash to Close (decimal format).
const CASH_STATE_METROS = {
  TN: { metros: { "Anderson County": 0.0070, "Blount County": 0.0040, "Bradley County": 0.0079, "Chattanooga/Hamilton": 0.0090, "Fayette County": 0.0048, "Greene County": 0.0084, "Hamblen County": 0.0056, "Jefferson County": 0.0067, "Knoxville/Knox": 0.0085, "Lincoln County": 0.0047, "Madison County": 0.0087, "Marshall County": 0.0078, "Maury County": 0.0068, "McMinn County": 0.0049, "Memphis/Shelby": 0.0148, "Nashville/Davidson": 0.0095, "Putnam County": 0.0094, "Rhea County": 0.0047, "Roane County": 0.0054, "Robertson County": 0.0067, "Rutherford County": 0.0080, "Sevier County": 0.0048, "Sullivan County": 0.0119, "Sumner County": 0.0049, "Union County": 0.0047, "Washington County": 0.0077, "Williamson County": 0.0066, "Wilson County": 0.0072, "All other counties": 0.0075 } },
  GA: { metros: { "Atlanta/Fulton": 0.0110, "DeKalb County": 0.0125, "Cobb County": 0.0085, "Gwinnett County": 0.0105, "Cherokee County": 0.0078, "Forsyth County": 0.0070, "All other counties": 0.0090 } },
  MS: { metros: { "DeSoto County": 0.0110, "Forrest County": 0.0155, "George County": 0.0080, "Harrison County": 0.0101, "Hinds County": 0.0149, "Jackson County": 0.0117, "Lamar County": 0.0109, "Madison County": 0.0102, "Marshall County": 0.0106, "Rankin County": 0.0112, "All other counties": 0.0110 } },
  AR: { metros: { "Benton County": 0.0103, "Craighead County": 0.0081, "Faulkner County": 0.0086, "Greene County": 0.0075, "Lonoke County": 0.0072, "Pulaski County": 0.0120, "Saline County": 0.0087, "Washington County": 0.0096, "White County": 0.0061, "All other counties": 0.0087 } },
  KY: { metros: { "Louisville/Jefferson": 0.0120, "Lexington/Fayette": 0.0095, "Northern KY": 0.0110, "All other counties": 0.0085 } },
  AL: { metros: { "Birmingham/Jefferson": 0.0058, "Madison/Huntsville": 0.0046, "Mobile County": 0.0050, "Montgomery County": 0.0045, "Baldwin County": 0.0033, "All other counties": 0.0040 } },
  FL: { metros: { "Miami-Dade": 0.0102, "Broward County": 0.0108, "Palm Beach": 0.0098, "Orange/Orlando": 0.0095, "Hillsborough/Tampa": 0.0099, "Duval/Jacksonville": 0.0094, "All other counties": 0.0091 } },
  NC: { metros: { "Mecklenburg/Charlotte": 0.0098, "Wake/Raleigh": 0.0086, "Guilford/Greensboro": 0.0095, "Durham County": 0.0110, "Buncombe/Asheville": 0.0072, "All other counties": 0.0084 } },
  SC: { metros: { "Charleston County": 0.0050, "Greenville County": 0.0064, "Richland/Columbia": 0.0070, "Horry/Myrtle Beach": 0.0042, "All other counties": 0.0057 } },
  VA: { metros: { "Fairfax County": 0.0114, "Arlington County": 0.0103, "Loudoun County": 0.0099, "Prince William": 0.0105, "Virginia Beach": 0.0084, "Richmond City": 0.0120, "Henrico County": 0.0085, "All other counties": 0.0082 } },
  WV: { metros: { "Kanawha/Charleston": 0.0058, "Berkeley County": 0.0055, "Monongalia/Morgantown": 0.0062, "All other counties": 0.0058 } },
  MD: { metros: { "Montgomery County": 0.0094, "Prince George's": 0.0112, "Baltimore City": 0.0162, "Baltimore County": 0.0112, "Anne Arundel": 0.0093, "Howard County": 0.0108, "Frederick County": 0.0097, "All other counties": 0.0109 } },
  DE: { metros: { "New Castle County": 0.0070, "Kent County": 0.0055, "Sussex County": 0.0045, "All other counties": 0.0061 } },
  NJ: { metros: { "Bergen County": 0.0216, "Essex County": 0.0274, "Hudson County": 0.0188, "Middlesex County": 0.0246, "Monmouth County": 0.0195, "Ocean County": 0.0197, "Morris County": 0.0217, "All other counties": 0.0249 } },
  PA: { metros: { "Philadelphia County": 0.0161, "Allegheny/Pittsburgh": 0.0224, "Montgomery County": 0.0141, "Bucks County": 0.0148, "Chester County": 0.0145, "Delaware County": 0.0199, "All other counties": 0.0158 } },
  DC: { metros: { "Washington DC": 0.0062 } },
  NY: { metros: { "New York City (5 boroughs)": 0.0120, "Nassau County": 0.0204, "Suffolk County": 0.0188, "Westchester County": 0.0226, "Rockland County": 0.0189, "Erie/Buffalo": 0.0212, "Monroe/Rochester": 0.0266, "All other counties": 0.0173 } },
  MA: { metros: { "Boston/Suffolk": 0.0056, "Middlesex (Cambridge)": 0.0108, "Worcester County": 0.0151, "Essex County": 0.0115, "Norfolk County": 0.0105, "Plymouth County": 0.0134, "Berkshire County": 0.0152, "All other counties": 0.0115 } },
  CT: { metros: { "Fairfield (Stamford)": 0.0152, "Hartford County": 0.0220, "New Haven County": 0.0208, "Litchfield County": 0.0175, "Middlesex County": 0.0186, "Tolland County": 0.0216, "All other counties": 0.0179 } },
  RI: { metros: { "Providence County": 0.0158, "Kent County": 0.0140, "Washington County": 0.0110, "Newport County": 0.0090, "All other counties": 0.0131 } },
  NH: { metros: { "Hillsborough (Manchester/Nashua)": 0.0222, "Rockingham County": 0.0192, "Merrimack County": 0.0228, "Strafford County": 0.0207, "All other counties": 0.0193 } },
  VT: { metros: { "Chittenden (Burlington)": 0.0195, "Rutland County": 0.0187, "Washington County": 0.0196, "Windsor County": 0.0178, "All other counties": 0.0183 } },
  ME: { metros: { "Cumberland (Portland)": 0.0131, "York County": 0.0124, "Penobscot County": 0.0150, "Kennebec County": 0.0142, "All other counties": 0.0124 } },
  CO: { metros: { "Denver County": 0.0058, "El Paso/Colorado Springs": 0.0055, "Jefferson County": 0.0060, "Arapahoe County": 0.0062, "Boulder County": 0.0057, "Douglas County": 0.0058, "Larimer/Fort Collins": 0.0055, "All other counties": 0.0049 } },
  UT: { metros: { "Salt Lake County": 0.0072, "Utah County (Provo)": 0.0060, "Davis County": 0.0068, "Weber County": 0.0078, "Washington (St. George)": 0.0055, "Summit (Park City)": 0.0048, "All other counties": 0.0063 } },
  NM: { metros: { "Bernalillo/Albuquerque": 0.0088, "Santa Fe County": 0.0055, "Doña Ana/Las Cruces": 0.0075, "Sandoval County": 0.0075, "All other counties": 0.0065 } },
  AZ: { metros: { "Maricopa/Phoenix": 0.0070, "Pima/Tucson": 0.0088, "Pinal County": 0.0082, "Yavapai County": 0.0065, "Mohave County": 0.0068, "Coconino/Flagstaff": 0.0070, "All other counties": 0.0072 } },
  NV: { metros: { "Clark/Las Vegas": 0.0055, "Washoe/Reno": 0.0065, "Lyon County": 0.0068, "Carson City": 0.0065, "All other counties": 0.0050 } },
  ID: { metros: { "Ada/Boise": 0.0063, "Canyon County": 0.0078, "Kootenai (Coeur d'Alene)": 0.0062, "Bonneville/Idaho Falls": 0.0075, "All other counties": 0.0069 } },
  MT: { metros: { "Yellowstone/Billings": 0.0093, "Missoula County": 0.0098, "Gallatin/Bozeman": 0.0078, "Flathead/Kalispell": 0.0082, "Cascade/Great Falls": 0.0106, "All other counties": 0.0074 } },
  WY: { metros: { "Laramie/Cheyenne": 0.0065, "Natrona/Casper": 0.0062, "Teton/Jackson": 0.0040, "Albany/Laramie": 0.0068, "All other counties": 0.0058 } },
  IL: { metros: { "Cook/Chicago": 0.0220, "DuPage County": 0.0205, "Lake County": 0.0246, "Will County": 0.0215, "Kane County": 0.0224, "McHenry County": 0.0250, "All other counties": 0.0208 } },
  IN: { metros: { "Marion/Indianapolis": 0.0098, "Lake County (Gary)": 0.0090, "Allen/Fort Wayne": 0.0080, "Hamilton County": 0.0091, "St. Joseph/South Bend": 0.0109, "All other counties": 0.0085 } },
  OH: { metros: { "Cuyahoga/Cleveland": 0.0205, "Franklin/Columbus": 0.0164, "Hamilton/Cincinnati": 0.0179, "Montgomery/Dayton": 0.0184, "Lucas/Toledo": 0.0188, "Summit/Akron": 0.0187, "All other counties": 0.0156 } },
  MI: { metros: { "Wayne/Detroit": 0.0172, "Oakland County": 0.0145, "Macomb County": 0.0150, "Kent/Grand Rapids": 0.0131, "Washtenaw/Ann Arbor": 0.0151, "Genesee/Flint": 0.0195, "All other counties": 0.0154 } },
  WI: { metros: { "Milwaukee County": 0.0215, "Dane/Madison": 0.0195, "Waukesha County": 0.0165, "Brown/Green Bay": 0.0185, "Racine County": 0.0220, "Kenosha County": 0.0215, "All other counties": 0.0185 } },
  MN: { metros: { "Hennepin/Minneapolis": 0.0126, "Ramsey/St. Paul": 0.0138, "Dakota County": 0.0108, "Anoka County": 0.0115, "Washington County": 0.0110, "Olmsted/Rochester": 0.0110, "All other counties": 0.0112 } },
  TX: { metros: { "Harris/Houston": 0.0194, "Dallas County": 0.0202, "Tarrant/Fort Worth": 0.0222, "Bexar/San Antonio": 0.0214, "Travis/Austin": 0.0178, "Collin/Plano": 0.0180, "Denton County": 0.0195, "Williamson County": 0.0201, "All other counties": 0.0180 } },
  LA: { metros: { "Orleans/New Orleans": 0.0068, "Jefferson Parish": 0.0054, "East Baton Rouge": 0.0060, "Caddo/Shreveport": 0.0070, "Lafayette Parish": 0.0045, "All other parishes": 0.0055 } },
  OK: { metros: { "Oklahoma County": 0.0098, "Tulsa County": 0.0108, "Cleveland County": 0.0092, "Canadian County": 0.0090, "All other counties": 0.0090 } },
  KS: { metros: { "Johnson County": 0.0125, "Sedgwick/Wichita": 0.0135, "Wyandotte/Kansas City": 0.0175, "Shawnee/Topeka": 0.0155, "Douglas/Lawrence": 0.0120, "All other counties": 0.0141 } },
  NE: { metros: { "Douglas/Omaha": 0.0188, "Lancaster/Lincoln": 0.0196, "Sarpy County": 0.0186, "All other counties": 0.0173 } },
  IA: { metros: { "Polk/Des Moines": 0.0165, "Linn/Cedar Rapids": 0.0162, "Scott/Davenport": 0.0172, "Johnson/Iowa City": 0.0148, "Black Hawk/Waterloo": 0.0175, "All other counties": 0.0157 } },
  MO: { metros: { "Jackson/Kansas City": 0.0126, "St. Louis County": 0.0124, "St. Louis City": 0.0138, "St. Charles": 0.0105, "Greene/Springfield": 0.0090, "All other counties": 0.0097 } },
  ND: { metros: { "Cass/Fargo": 0.0098, "Burleigh/Bismarck": 0.0095, "Grand Forks County": 0.0115, "All other counties": 0.0105 } },
  SD: { metros: { "Minnehaha/Sioux Falls": 0.0132, "Pennington/Rapid City": 0.0120, "Lincoln County": 0.0128, "All other counties": 0.0132 } },
  HI: { metros: { "Honolulu/Oahu": 0.0029, "Maui County": 0.0031, "Hawaii/Big Island": 0.0041, "Kauai County": 0.0024, "All other areas": 0.0028 } },
  AK: { metros: { "Anchorage": 0.0119, "Fairbanks North Star": 0.0135, "Matanuska-Susitna": 0.0105, "Kenai Peninsula": 0.0075, "Juneau": 0.0093, "All other boroughs": 0.0102 } },
  OR: { metros: { "Multnomah/Portland": 0.0112, "Washington County (Beaverton)": 0.0098, "Clackamas County": 0.0105, "Lane/Eugene": 0.0108, "Marion/Salem": 0.0115, "Deschutes/Bend": 0.0080, "All other counties": 0.0093 } },
  WA: { metros: { "King/Seattle": 0.0082, "Pierce/Tacoma": 0.0109, "Snohomish County": 0.0088, "Spokane County": 0.0105, "Clark/Vancouver": 0.0095, "Kitsap County": 0.0091, "Thurston/Olympia": 0.0102, "All other counties": 0.0098 } },
  CA: { metros: {
    "Los Angeles City (≤$5.3M)": 0.0072,
    "LA City Mansion Tax ($5.3M+)": 0.0072,
    "Santa Monica": 0.0070,
    "Culver City": 0.0068,
    "Beverly Hills": 0.0068,
    "Pasadena (LA County)": 0.0075,
    "Long Beach": 0.0078,
    "LA County (other cities)": 0.0075,
    "San Francisco City": 0.0068,
    "Oakland": 0.0078,
    "Berkeley": 0.0075,
    "San Jose/Santa Clara": 0.0073,
    "San Mateo County": 0.0053,
    "Marin County": 0.0062,
    "Contra Costa County": 0.0090,
    "Alameda County (other)": 0.0082,
    "San Diego County": 0.0068,
    "Orange County": 0.0069,
    "Riverside County": 0.0090,
    "San Bernardino County": 0.0088,
    "Ventura County": 0.0070,
    "Sacramento County": 0.0085,
    "Fresno County": 0.0084,
    "All other counties": 0.0078
  } },
};

// Full list of US states + DC for dropdown labels.
const ALL_STATES_LIST = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],
  ["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],
  ["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],
  ["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],
  ["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],
  ["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],
  ["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],
  ["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],
  ["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
];

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function generateAmortData(principal, annualRate, years, options = {}) {
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

function formatPayoff(months) {
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
function calculateAPR(loanAmount, prepaidFinanceCharges, noteRate, termYears, monthlyMI = 0, miMonths = 0) {
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

const HEADSHOT = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADcANwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD69pKdQRmqAZRTsYPSjrQA0ijFFFABikpaQ9aAExSU6kYgAljgUAJQcDqazPEGuadolhJd31wIkRS3QsTgZxgc18/eNvjDfXM1xPoN7CI4QrtbSA7wfbGBnHoe/tWcqiiXGDkfSMkiIpZjwOvFNgubacZhnjkxjO1s4z0/ka+K9a+MGp3WJL6FBIvAuIJXR5AO7IWwe2Rj1qrYfETUYLr7foeqyWbNyyRysAQTk/KTjisfrHkaewb6n3IMHoaMV8maV8bfFOnsk/2tb10O2a3mz84H8QHY/TrivefhX8TNE8d2B+zN9nv4wDLbO3PuV9QPzFawqxloROlKJ3dKBSDrmlrUzClxSUUALSUU4CgAx60uKM0UAJiilooAMUYoopWAKKfikIpgNoxRRQAlIadSNQA2ilpKAEOBXnnxg8XahoWjEaRZSSu7eXJctjyoQe/XJP0GB+ldh4tvYtO8OX19PNHDHDCzF3bABHT9a+Mfid8WtU8W28sTLDbQkBWCzFi+3oRnAx3HHXrWNWpyqxrShzO5neLfihq2oPPHdanJJFzlFlwDkcjkDjrXmmp60txcNPDJIm7seTx05/Gkuopb1DJhW5J3Z6/Ws6PS53lKqjEnggiuVa7nS7rQ0Dq8hyJLXduGQ+Mhh9fX2qTTru0urAgN5dxE+10PBKnocdD9Pyp+lWNysTW8y5yP3ZYZDf7J96o3Vg0gMUsJtrlcjco4dP6kH9DVpITk+hNY3lymsQWcrM0ZyFcc8YJyD+H8663wZ4h1DQvFy3djctBcQOrqynr3BP1wQfrXFaaZoLmK6njIa23YAOdxKlSPpnmtAtIdQF8ATGsKBwo5ypzgUpJdATb3Pvr4R/EXTfGWlRr58ceoxRgzQ5wT6so7iu+6jIr80/BPjTUvDWtWt7DcSQ3FtJv3A9jnI9xzg+tfoB8KPGFr418IW+qwmNZh+7njVs7GH/1sGt6VRvRnPUhbVHW0UUorcyCnCkHFLQACiiigAopaUDmgBACaXbTqKBBRRSGkFgIppGKXNBpgNopTRSGNI70lOqjr+o2+kaPdandOqQ20TOxJx0HT8elDdgR4L+2J40XS9Os/Dtqztc3CmSVf4VQgjkdyf0H1r5T8OaNqOt3zR28J2g8uy8L7V23jLUdT8e+P7vVL3DTXMhSNAfkiQcADPYAfia9J8NaLa6XpsUMCgcD5u7H1Pua86tO7uelh6PMrHEad8PLwoNhXI6nHWr//AArPUXTBeMKeQB/npXpVqjHCqhx9eK0oQ7cbwMegrnVSz0PQ+rRa1PJpvhzqjAeawfHoOain+H0/n7JImIC5yRnPvmvaI0weHyfpTpI8x5DAkdK0VR9TN4eKPD7/AOGZYKI1xk5zj6VNpvgKK0yZ/mHoK9ckh3fxn8qy7yEpnOMH3o9pcPYI8m8WfDiy1KzkNqDDMFyrKORWR8F/Gms/DTxusF9JMbYyYmhU/LLH2xnuP6V62zdcjnOK4L4l+GotShGoW0ai7gO4EDn3FVCo07GFairXR9qeGNasPEWh22r6bL5lvOuVPcH0PvWoor5P/ZV8eLpetDw1qErLDdkeUXYkB+mB7EivrHtXoU58yPLqQ5XYM0Ckpa0IFpKKcBQAq9KWkFLQIKKKKBhRRRQA0iinUlAhKbTieabSBBXBfH2fyPhjqXzFfM2xnjOQTz/Ku9ryb9qOVk8AwRLk+beKNobG7AJ/GoqfCzSHxI+efBenqUn1EqMkeWuB+dehWi7o07gAcVzPhpAmipDhdw5OO5NdVpHKKMda8etLU97DRtE1bG33DByBWzBbRJHkqSBVK2G0Bcc9vetBDIykMwUCoidL2EjKbiPIyPrQ3lDI8p+f0pYQQ2PMyM+tSHeGAzuHpitUzOSKieQxYNlfQVk6rEjfMgDHocVsMX5Pltjn0rI1IljhonHvjpTYJHM3aFZWyep9ayL1/wB4qEZB4x610F0u7cSeAcc1zV7n7ein0zSWrMahw2oWj6J4lS5tsqqyiZBnoc5Ir7u8L6jFq/hzT9TgcPHc26SAj3HP65r4q8XxCQJMOWU5wa+nP2btSF/8M7WLB3WkjQnJz3yP516FBnkYhHpWKKKUCuk5gpwpAKdTEFFFFAIKKKUDNIYmDRS0EUJ3FcSkpaKYDDSU9hmmUDCvGP2rJnXw5pUSnAedyx9BtA/rXs9eJftX5OkaIoAIM0hIz7Lz/n1rOr8LLpfEjyjw42YAv9a67RwASuMkd65fw5D5NqXY5JPftXRabOlvBLM/KhsfWvFnqz36Puxuzo4Wxx1PrV+1EZJd8fiK4PU/F01lbt5FqXk9AucVkaV4v1ie6H2mRgpbG3bgAfSrjFIpTu7HsK+UY2cEZUVCXAMUhx71zmlaq8sLbnzkEnJ5xWjczlbRJM8HHQdKpyNOXQ0b2aFEO5gAB1zWLdvDIGAkUd85rH8T6zHbqWMgLAfKPQ1wjpr2u3udMt5CP7+So/OrTW7MJSsrI7i9gJ+4wOT65rkdYLR3qE8AjAq42ieIrCPzbuU4UZ2oxOPpWLfaiLw+VNj7TEcqT1cUcq6GLm2tSnrYZlIBznOD717j+ypeBNP1bSeMoyTgg+owf6V4nerut3BUcDOPSvTv2WLo/wDCWahA23D2Csp7khuf0NdVF6nFiFofRtPUcU0dafXYcDCiiigAooooGAGTTqAMUtAhDQKMUCpsIQikpx6U2qGFIRxS0UCG4rw79rMhNE0O44KJcupIbnJC8fpXtt6rNZzqjFGMbbWHUHBwa+R/Gs11qfhprJzLE6SeY8bHKswyN3P41zYiqoJJ9TtwuHlVTmvsh4bxPpiNgcuckfWrHkSXupJa9IlwdxHHvVbwMudDiZu+f1NdRcaY1xbeXZkxysuGcHoK8qbsz1oK8UZXiP4g+DvCUf2eZjeXKYRhHGXCtjoSB19q5bVfFsmqanfW8GltbyWD7bqOWzK+WcgcurNjkjnpzXQQ/DjRF0+SwuLGdo5JPMchj878/Nk9+T+da+jeCLfRoJ/7It5NPhuECzYcruUc4+mea2h7OSIanF6GX4ZkujxNbyW7+X5iB+Vde5U967a9Ujw0ZgMsBkflXPPDHaKsUbMEUEKCSeT1PPQcVqXN4G0wxNkpt4rNL3jqjGTicBrqXTTCYlDtj8wtKcRxj1P+cmsia58SaPpMOrJMZI5rwW7M5YtEm0sXEKEEcDgEgk9662zCTqNxDFTjDqCCB0610FjpMJjEilQ556cVulE5JxlseSaf8SPGUkM0t3ok80EbYUYYM6nPO1skHAHQnGe9a1p5HiBodVsEZOMyI642nuDXodx4ciuNxmYFSfmCjGf0qncaPZafCUtIxEzYyV4z7VLn2J9m0tdThb6Im0kyuPkbOe9W/hV4jvfD11eXllIkMz24iE7YPljOTjPGfepdXj4uFXkIhyB9KwfCNkbzT8E5WL5nX1Oc8/SteZqN0ZwpqdRKWx9d/CXXrzxJ4HtdVvmLzPJKhcoFLBWwCQK6yuG+B67fAUagEILqXZ9Mj+ua7kV3U23FXPNxEVGrJLuLRRRWhigpQM0lOWgGLRRRQAUlLQelAMQU09acKRh3oEJRRRQMQgEEHoeDXzr4o0TZqd7aSRgm1LBu38Rx+mK+i68e+LyPaeJZfKTP22CN8DuRlT/IVyYumpRuepldS1Rw7nlXha1ns9OeOZNmXygzn5c8fjXcacfKjTd1I5+tc754d+gUFl+UjlT0P8qurds0piBwBwa82otj0qSu3E6mK9CjCKGboarapcytASxJOOPaorF0SMFvugcmsnWtZjkjlit+cfKG9z71S+E6FSSlexnXkgGPmDSNwRVh4zJp2ejYxx3qpBYxxRJNJOGHc5rsba00j+zFzO24oSMAdaqESpVVHc8zt5VtLowzMVzypxXZ+HmZ7YEMsi57HpXH65eaLFfO897DAiNje7gDPoPWotD1cfaphpkxljXBXHQ1tZbnMm72PR7jf5fXFc5q87Bc+nOPUelW7HV1u7Uhidw6jvmsbWp15+YAZ/MVDsy6kfdMiWVBcXEwUMPKztI4p3hRYLSaOLaGWZPmHp61ktL81yoOQIzgfX/9VdN4d0hrltPtLd913dSBd/X75x/n6VtB2SR50J8sm2fRfw0tFsvAWkQgYzbiQ+5Ylv610NR2dvHaWcNrEMRwxrGn0UAD+VSjFdyWh5E5c0mwFLRRVEgOtOxTR1p9AMKKKKACiiigYUUUUEjKKKKACuI+LemrNpNvqqx7pbJ8McdEbg/rj867eo7iGK4gkgnRZIpFKujDIYHqDUTipRaZpSm6clJHzLr5T7XE6qozjJAwCQaitH/eEtkFmyK9B+J/gSy0jQZtXsbm6cRzJiGQgqik4POMnnHWuAgCsbdsAAsR1715Fam4WTPfw1WM5c0dhdZ1CQJFYWnzXE3AHoO7H2FNure0g0r7IjF32/M56knqaW3h2ajeTtgv8qDP90DP8yazJ5IrmWUeegw3ViKqEY21N515c3LE4zU9DljuTcpLM0pbKShyPoMg1KfEXiSK0+y+UzGMbN2eueldhH/ZDHE9/Hx1Gat21t4ZuN876tFhMMQWAYcdq1UY9CHGq9TxyLw5e3N4bq5eUyE5LE8qeuBn7td54Vgt9HjCAHe3LMz5JNX9V1Lw6k0jJOOOc+prlPEninw7ZJv/ALSVeORt6Vr7vY5pwq09bndyv5pa5tlG9QGJXgOP896zPETGWxguYyQskij6ZOKpeB9RvdUtFuY7VoLGQ5heQbWcf3sHoPTNaviO1Fl4atUkILzXS4/Fx0rGcUn7pUKknFqRlNZsNVW1jQu0ybFX+83THP1r234R+CNWttai1fWbCSwiswfIhlxveTGM4B4UDPPc4rzLS7d7v4h6LZomC93ED648wf0Br6ubqSO5rpowT1Z51eq43iuolKKSlFdJwC0UUGqGKvWnU1R3p1ABRRRQAUUUUAwooooEMPWiiigApDS0hpMDJ8X6b/a/hjUdOUZeaBgn+8OV/UCvnC2JNmwPyvC+SD7dRX1IOtfPvxZ06LQPG9yLfAt7+MXGzHCMxOQPxBP41x4qHNG53YKrytxM3UoLe4VJVUjzUAb3xXnnxL+HZkuI9a8OXtxZyAA3FruJilOOuB0P0rudPu1ktWgY7WTkcZrQSYXVrhRkY7jGa5ItxV0etBKTuzl/D174HgjtYZPDdzPNHcKZfMYN8mz5jyefm6KfrntW/bS/DUW8Mh8G3kku/wDeLFAD5fU8ncAwzgVnXWi2L3IkTMEu7JKjrWlp+qT6VZS20U4CuwJ/dg8j6/Suim4Pc2qUqLV1J39TD8Sa9olldPLpHg62hRZIpN90gVmVTlkKgHHHAOe/SuIk0yDxbrovb20hW3RiRFGm2Njknn+91+ldrrixaneNPduJHb+EYABpNNtfLYbVEca/dUDitJTS2MZwoxVoK78zYi8mC1jiVECqAoUCsDxddf2n4l0vS02rHbnz5sDgBen61NcX5SSR9+I4hljuxyK5E3sq6bcamSTdalL5UOeoQf0xk1moPS5xTq3bSPVPgHa/298UJ9V27rfTYWkDH+8con82P4V9Imvnz9koj+09eVfu/Z4cH1w5r6DNdVL4Tzq3xCUoFIKdWqMRRQaSgmmA4dKWmL1p9ABRRRQMKQ0tJQDFpDS01utACUUUUAFIaWm1LEFeI/tFWrSazZSqOTZ8fUO3+Neu+Jda03w5oF7rusXK2thZRGaeVv4VHoO5JwAO5IFeIeJ9dn8ZaPoPiiS1NrFqFu7wwE5MURbKbj3YqQT7msa6fs2zpwv8RJnn9reurRzqQGGFcE8HNbmmXmbsKoxGRyAM81g65ZPZ3WYxiGQnNV9LvxDN9mlzl1IjbsT6frXJCz0O/mlCWh3stvaXUZxKM9Cc1iXulW4fMc7bSRjDcGprTy/L2iVQFOGGeRV+OFzCZbYr8rYyTyfw9K0hS5ep1qtGa1MqO3t4SrSRKmB9f8/WpNRubaGyndMZROOe5rUu443sxK8yAYxk9Sa4bxRqVtav5LlBHy75PAAzwa05E9TCrV5VZGB4mu3iiS0V9st0+1gOSM9T+VZ9/MLi/itYVBjgQQxYPT+839Ky5b6a+vpr8ghn+W3X+4vr+NdT4Y0WQKJpQfNkHQj7oqZyOOK1O/8Ag74oTwJBrOtXNhNeWUVosl2sH+tWIScsgP3ioydvGQDivpPw1rukeJdDtdb0K/hv9Pu03wzxHIYdx6gg8EHkHrXz/wCAtLjfw/rN5cRg210VtFB6OgU7/wD0KvI/gN8Sr74N+PNU8J6qJrvQJLlkkhDfNGwPyzJnjJXGRxnjuBXVRg3A5cQ/fPu2lzWV4W8Q6N4o0WHWNBv4b6yl4EkZ5Vu6sOqsO4PNalPYxHUUmaWmMKUGkopiH0UnalFIYhoFHWg9KYAelNoJ9KKBBRRWb4h13RvD2ntqGuanaadar1luJQgPsM8k+wzQBok1S1rVNO0bS7jVNVvYLKyt13yzTPtVB/noOp7V4H49/al8O2Ekln4Q02TVpl4+13OYoB7hfvt+O2vnb4i/E/xZ4+u0k1/Uy1nCxaG0iXy4UPrtHU+5ya0jSctwujsv2nPjPN4+KeGdBWS30NZAw3DEl1J0RmHZcnIX6E88D23U9NGnfD7Q7eIZj0wxWs2B91dgTd9NwX86+MvC8Z1Hxzo0UnzCXUYdw9g4P9K++NGSKa2ktrmNZbe4QpKjdCDRXpprl6F0ZWlzHmWsad9phKEZ4rhdR0idWaNTlhnAPGa9g1fSn0u7On3O9on5trjtIvof9sd/XrXJa5ZMlzkJznsOteQ4ODserzKep50NYvtNwJgXQHkPwT+PStCx8bWsIP2lZcEY24OB+XWuvstOs9QJhuIgzEdGFV9U+H2m43iBFA5NOMn2J5ezOF17xq1zB5MBGF5U4Of1rlJEvNUut8vzLuJC4OPx9a9F/wCELtEYstsDk8VZTRYrchEiAPOVArRSbWiM5LXVnN+F/DxaVXmQsep/pXomn6NPPJFY2sebm4IUAD7o/wAKm0PTdqDbHulc8Ko6egr07w7oy6NbGeVVa/lTBP8AzzHoP61pTpubsKc1TV3uZep2kGlaRa6Na8xWy4Y/33PU/ia+Ov2hoxbfE68kj4LRwufrtH+FfZGtqcndyzHP418aftBTef8AEvU/+mXlx/iEH+NenThZOx5k5NsT4cfE3xP4B1sat4evTGk2PtVrJ80FwB2dfX0IwR2NfWvgD9pzwHrttDHr32jQb4gCTehlt8+odfmA+q8V8FRyEDbnIqaKUqcgkH1FS4KW4XsfqpoWs6Rrtmt5oup2eo27DIktplkH446fjWgPavy58PeINW0i7W90nUruwuV6S28zRt+YIr23wL+07440Yxwa6lt4gtRgEzjy5wPaRRyf94GpdBrVApI+2qK8n8A/tAfDzxT5cE+oNod8+B5Go4VSfRZB8p/HFeqxSRyxJLE6yRuMqysCGHqCOtZtNblbko6UZpB6UUgFHSkY1Fe3dpY2zXN7cwW0C/ekmkCIPxPFec+J/jl8NtD3q2vDUJVzlLGMyj/vrhf1oSb2A9KrnvG3jTwx4MsPtniPV7exUjMcbHdLJ/uoPmP5Yr5o+Jn7VN7dW0ll4K07+zdwwby5KyTf8BX7q/U5r5s1/wAQ6preoy3+qX9xeXMpy800hdm+pNaRpt7ibPpX4mftV303m2XgjTVsI+QL28USSn3VPur+O6vnLxT4p1/xPqRvNb1W71C5c/6yeUsR7DsB7DisJmLHr+lTwL5fLD5j7VvGmkS5Eq/u02jk+vqaV5Pk2imMecj9aqzzfNtXH1q9idztPhJai6+I2kr1Ebl/xAr7h8OPlURvTFfGHwBQHxxaybcmIBiPbcoP6E19n2kRgmUjpWdZaJlU3qbt3aQXlo1peRCWFvzX0IPY1wvizw5PZ27OWE0IOY58cj2b0PvXodlIHQA4zU5iVkZGUMjDDKRkGuSdNTOqFRxPBZLZ2PmxkpIpzkCn3GsXlzAtj5WJDw7DpXf+JfBxt5GvtGTMZ/1lqTx/wA9vp0+lcrGtqZWDboJFOGSQYKn8a5XTcDrhVTRQhtzHEgIyw6EDvTV0+eaZYYo97yNhVUZJNdBZ2cl9MtvZDzX7kDhR7ntXdeG/DtvpKGdgJLtxhpD/AAj0X0FXTpuTInUUUZvhbw6ukW6zXAWS8YZA6iP6e/vWtOmxTI5ycVpOqjJPWsnVZMjaDXdCKirI4ZTcndnM6uTJIWA9hXxB8VJGuvH+vSFv+X+RR+Bx/Svus24Zi7Dp0r4I8Yzi48WavODkSX07f+RGrpitDB7nMuGSQhhSo2CMnHNXJkV1wR+NVJI2jbPaocbalJk0bGOT2q6jZGc8dqzpJEWMMx74A7mrFnvEZLjHoO4q12JL0czKev1ru/h38V/GXgiZf7D1maO2z89pN+9t3+qHgfUYNee5pd3FDjfcLn2n4F/al8OX8CReKdKudNuhgNNafvYWPrtJDL9Oa9MsfjJ8Mry2WdPGemRA/wAM7NE4+qsAa/ORJWXocVOt7MoxurJ0EVzs2vE/jnxD4iujc65rF7qMxOQ1xMXC/QdB+ArnLm9mm+87H6mqrHJ60i5681SiPmQoLMeuaXgHBoA47UEc9RVpWJbuI5BUg4qK3neGURvueM8Ke6+30qXGRyaGCoMgChoQss5bKrnHr61AvLE470maVDyOe9SVsex/sxQCXx9yoKrbEn8WAr7HtYw9pHn7yjafqOK+S/2TIlfxresei2i/+hivrqwUgup4D/MPw4P9KVTYILUsWhKAZ61oCdEjaSR1REUszMcBQBkkk9B71QcrGGd2VEUEszHAAHUmvFvjFZ6/8U7BvD+j65c6F4eVsXEiQbzfem/5lIQdl6Hqe1c1m9je5gfGT9qey0zUG0b4eWsGqvG+2fU5s+ScH5lhX+LjPzt8voD1rmr79pRxAiaX4eubk7cs2q3ayHJ6/cXkZzjkcV5r8afg1dfDa0sNUt9Ql1LT5iIp5pYBEY5TnaAoJypA656j6Vwds+5etCdhM9gv/wBonx+LiCXSDpmipExYxW1tvSTPUOHJBH6+9evfDH9qbw5q8kOmeOII9AvXIVb2IlrRz/tZ+aL8cr7ivjrU5hFGc9T0r1v9lz4a/wDCR6u3ibV7ZXsbUkWyyLlXk/vY74/n9KpXbshebPuT7TFcQJPbzJLFIodJI2DK6noQRwR71RuELmub0fTdT0h82U7T2rHm1c4UD1X+6fpxXTWsqSgZ3K3Uqw5H+P1FWriZk6/cLpmg3t8RloYmZR6tjAH54r88ryRpLiWRjkyOWP1JzX318ULjyvD17zhLaznu5f8AgEbbB+fP4V+f4zsXJ7VtDYyYhNI3zLjt6Uue1IQaoRDDBGkpdjuY9yOg9BVoEEcdKjHOaUHALZHAzTWgEh7GjNIh3ICe9ApgL+dBJo+p5oIJ5oAjxyBSgccGg9acAP0qQG4Pemy520/sajc549aAFiORnIpspPamwkjApZuAaQEZFJHguKUn5aZbnL/jU9Sj3/8AZFx/wmGqd8Wif+h19bxKREroMsuCPf2r5I/ZGP8AxWepj1tE/wDQ6+uoCQoqag4FLUEnvZUWSIx2CMN6N1mPv6KPTvSXFtHbcxRKF7gDqKv3fNrKD/dprfPEhYdVrOOho1c8T/a2heX4JaiFiEkEU9vKjZ5iIkA/LDGvjmwH7oE19h/tb3Mtr8GtUt4iAk9zbo+R0HmbuPxUV8as0kTW8SSttkVt3A7fhUz+IFsXfCmhXfjDxtZaFagkzy4Yj+FByzfgK/QPwR4ctfD+gWemWsKxQwQqoVRxxmvkv9i21hm+MF15o3+Vp0jLn1LoK+3NQUR7FUYG0VcNFciW9hqjEeR34AqrfoJrmC33MnOdyHBGPQ1bH+tVewHFVCc60gP900FnHfHBv7N+FHiu6eZ5ZH0903vgH5sIBx/vV8IuMdMV9uftUSNH8F9a2nG5oEP0Mq5r4kk+6DWtPYynuNpDnORSetO7VoQJxyelNmyYtvGXO2h6D/rYx6AmkMnAwMClxRnnFCk1YhTml/KkNISQaQj/2Q==";
function MortgageCalcIcon({ size = 24, variant = "navy", style = {} }) {
  // Body and buttons flip based on background context. Screen always stays gold.
  const bodyColor = variant === "cream" ? P.cream : P.navy;
  const buttonColor = variant === "cream" ? P.navy : P.cream;
  return (
    <svg
      width={size}
      height={size * (88 / 72)}
      viewBox="0 0 72 88"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Body */}
      <rect x="0" y="0" width="72" height="88" rx="10" fill={bodyColor} />
      {/* Gold screen (always gold, both variants) */}
      <rect x="8" y="8" width="56" height="22" rx="3" fill={P.gold} />
      {/* Dark readout dashes on gold screen (always navy-dark) */}
      <rect x="52" y="22" width="8" height="2" fill={P.navyDark} />
      <rect x="42" y="22" width="6" height="2" fill={P.navyDark} />
      <rect x="34" y="22" width="4" height="2" fill={P.navyDark} />
      {/* Button grid: 3 rows of 4 */}
      <rect x="8" y="38" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="24" y="38" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="40" y="38" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="56" y="38" width="8" height="10" rx="2" fill={buttonColor} />
      <rect x="8" y="52" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="24" y="52" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="40" y="52" width="12" height="10" rx="2" fill={buttonColor} />
      <rect x="56" y="52" width="8" height="10" rx="2" fill={buttonColor} />
      <rect x="8" y="66" width="12" height="14" rx="2" fill={buttonColor} />
      <rect x="24" y="66" width="12" height="14" rx="2" fill={buttonColor} />
      <rect x="40" y="66" width="12" height="14" rx="2" fill={buttonColor} />
      <rect x="56" y="66" width="8" height="14" rx="2" fill={buttonColor} />
    </svg>
  );
}

function CompareIcon({ size = 24, variant = "navy", style = {} }) {
  const ringColor = variant === "cream" ? P.cream : P.navy;
  // Slightly thicker stroke at very small sizes to maintain visibility after browser downscaling
  const strokeWidth = size <= 22 ? 5 : 3.5;
  const dotRadius = size <= 22 ? 5.5 : 4.5;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Top circle */}
      <circle cx="36" cy="26" r="22" fill="none" stroke={ringColor} strokeWidth={strokeWidth} />
      {/* Bottom-left circle */}
      <circle cx="24" cy="46" r="22" fill="none" stroke={ringColor} strokeWidth={strokeWidth} />
      {/* Bottom-right circle */}
      <circle cx="48" cy="46" r="22" fill="none" stroke={ringColor} strokeWidth={strokeWidth} />
      {/* Gold dot at centroid */}
      <circle cx="36" cy="39" r={dotRadius} fill={P.gold} />
    </svg>
  );
}

function PreQualIcon({ size = 24, variant = "navy", style = {} }) {
  // Body color flips by variant — gauge arc, symbols, and tick mark inherit
  const arcColor = variant === "cream" ? P.cream : P.navy;
  // Gold elements (needle, hub) stay gold in both variants — they're the signature accent
  const showSymbols = size >= 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Gauge arc */}
      <path
        d="M 8 50 A 28 28 0 0 1 64 50"
        stroke={arcColor}
        strokeWidth={size <= 22 ? 6 : size <= 32 ? 5 : 4}
        fill="none"
        strokeLinecap="round"
      />
      {/* ¢ on the lower-left (only at 40px+) */}
      {showSymbols && (
        <text
          x="16"
          y="48"
          textAnchor="middle"
          fontFamily="'DM Sans', sans-serif"
          fontSize="13"
          fontWeight="700"
          fill={arcColor}
        >
          ¢
        </text>
      )}
      {/* Top tick mark (only at 40px+) */}
      {showSymbols && (
        <line
          x1="36" y1="22" x2="36" y2="17"
          stroke={arcColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {/* $ on the lower-right (only at 40px+) */}
      {showSymbols && (
        <text
          x="56"
          y="48"
          textAnchor="middle"
          fontFamily="'DM Sans', sans-serif"
          fontSize="14"
          fontWeight="700"
          fill={arcColor}
        >
          $
        </text>
      )}
      {/* Gold needle pointing toward $ */}
      <line
        x1="36" y1="50" x2="52" y2="30"
        stroke={P.gold}
        strokeWidth={size <= 22 ? 6 : size <= 32 ? 5 : 3.5}
        strokeLinecap="round"
      />
      {/* Gold hub */}
      <circle cx="36" cy="50" r={size <= 22 ? 6 : size <= 32 ? 5 : 4} fill={P.gold} />
    </svg>
  );
}

function CashToCloseIcon({ size = 24, variant = "navy", style = {} }) {
  // Door body color flips by variant
  const doorColor = variant === "cream" ? P.cream : P.navy;
  // Inner panel uses a slightly darker shade of the body color for depth
  const panelColor = variant === "cream" ? P.creamDark : P.navyDark;
  // Gold elements ($ and knob) stay gold in both variants
  const showDetails = size >= 28;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Door silhouette with rounded top */}
      <path
        d="M 18 12 Q 18 8 22 8 L 50 8 Q 54 8 54 12 L 54 64 L 18 64 Z"
        fill={doorColor}
      />
      {/* Inner panel (only at 28px+) */}
      {showDetails && (
        <rect x="22" y="14" width="28" height="46" rx="2" fill={panelColor} />
      )}
      {/* Gold $ — sized differently based on whether the panel is showing */}
      <text
        x="36"
        y={showDetails ? 44 : 46}
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize={showDetails ? 22 : 34}
        fontWeight="700"
        fill={P.gold}
      >
        $
      </text>
      {/* Gold knob (only at 28px+) */}
      {showDetails && (
        <circle cx="48" cy="40" r="1.8" fill={P.gold} />
      )}
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PRE_CONTRACT_STEPS = [
  { num: "01", title: "Pre-Qualification", short: "Know your numbers before you shop.", detail: "Your financial snapshot. A lender reviews your income, assets, and credit to estimate what you can afford. Fast, usually free, and gets you a realistic price range before house-hunting. Not a guarantee of approval — just a starting point.", tip: "Get pre-qualified before you fall in love with a house you can't afford.", timeframe: "Same day – 1 week" },
  { num: "02", title: "Pre-Approval", short: "The green light sellers want to see.", detail: "Deeper than pre-qualification. Your lender verifies income, pulls credit, and reviews your financials. You get a conditional commitment letter stating how much you're approved to borrow. In competitive markets, sellers won't consider offers without one.", tip: "A pre-approval letter typically expires after 60–90 days. Time your application wisely.", timeframe: "1 – 3 business days" },
  { num: "03", title: "House Hunting & Contract", short: "Find the right home, make the right offer.", detail: "With pre-approval in hand, you work with your agent to find a home and submit an offer. Once accepted, you'll sign a purchase agreement covering price, closing date, contingencies (inspections, financing), and earnest money deposit.", tip: "Your earnest money deposit (typically 1–3% of the purchase price) shows the seller you're serious. It's applied toward your down payment at closing.", timeframe: "Weeks to months" },
];

const ACTIVE_LOAN_STEPS = [
  { num: "01", title: "Loan Processing", short: "The paperwork marathon begins.", detail: "Your file moves to processing. The processor orders the appraisal, verifies employment and income, reviews bank statements, confirms title, and assembles the full file. Responsiveness matters — the faster you return documents, the smoother this goes.", tip: "Do NOT change jobs, make large purchases, open new credit, or move money between accounts during processing. Any change can derail your approval.", days: "1–15", phase: "Week 1–2" },
  { num: "02", title: "Underwriting", short: "The gatekeeper makes the call.", detail: "The underwriter is the decision-maker. They analyze your file against lending guidelines — credit, income, assets, property — and issue one of three decisions: Approved, Suspended (needs more info), or Denied. Most approvals come with conditions: documents or explanations needed before final sign-off.", tip: "\"Clear to close\" is the phrase you want to hear. It means the underwriter has signed off on everything.", days: "15–25", phase: "Week 2–3" },
  { num: "03", title: "Closing", short: "Sign, fund, get the keys.", detail: "You'll receive a Closing Disclosure at least 3 business days before closing, detailing every cost. At the table, you'll sign the note (your promise to repay), the deed of trust (the lien on the property), and dozens of other documents. Bring your ID and a cashier's check (or wire instructions) for your cash to close.", tip: "Review your Closing Disclosure line by line and compare it to your original Loan Estimate. Question anything that changed.", days: "25–30", phase: "Week 4" },
];

const MORTGAGE_TYPES = [
  { name: "Conventional", tagline: "The standard. Flexible and widely available.", minDown: "3%", credit: "No GSE minimum with DU/LP approval; 620+ typical in practice", pmi: "Required below 20% down; removable", bestFor: "Borrowers with solid credit and some savings", keyFacts: ["Not government-backed — follows Fannie Mae/Freddie Mac guidelines", "As of Nov 2025, the 620 minimum score floor was removed — DU/LP automated approval is now the gatekeeper, though most lenders still require 620+", "PMI drops off at 80% LTV (unlike FHA, which can stay for life)", "Best rates go to 740+ credit with 20% down"] },
  { name: "FHA", tagline: "Lower barriers to entry. Government-insured.", minDown: "3.5%", credit: "500+ with 10% down; 580+ with 3.5% down", pmi: "MIP required for life of loan (most cases)", bestFor: "First-time buyers or those rebuilding credit", keyFacts: ["Insured by the Federal Housing Administration — more lenient on credit and DTI", "HUD's official minimum is 500 (10% down) or 580 (3.5% down); most lenders overlay 620+", "Upfront MIP (1.75%) + annual MIP — stays for life if you put less than 10% down", "Property must meet FHA minimum property standards"] },
  { name: "VA", tagline: "Earned benefit. Zero down payment.", minDown: "0%", credit: "No VA minimum (lenders typically want 580–620+)", pmi: "None — VA Funding Fee instead", bestFor: "Eligible veterans, active-duty, and surviving spouses", keyFacts: ["Guaranteed by the Department of Veterans Affairs", "Zero down payment and no monthly mortgage insurance", "VA Funding Fee (1.25–3.3%) can be financed; waived for service-connected disability", "Seller concessions capped at 4%"] },
  { name: "USDA", tagline: "Rural and suburban. Zero down.", minDown: "0%", credit: "No USDA minimum; most lenders require 640+", pmi: "Guarantee fee (upfront + annual)", bestFor: "Moderate-income buyers in eligible rural areas", keyFacts: ["Backed by the U.S. Department of Agriculture — 640+ is a lender overlay, not a federal rule", "Income limits apply — generally 115% of area median income", "Property must be in a USDA-eligible area (more areas qualify than you'd think)", "Upfront guarantee fee 1% + annual fee 0.35% — primary residence only"] },
  { name: "Jumbo", tagline: "Beyond conforming limits. Higher stakes.", minDown: "10–20%", credit: "700+ (typical)", pmi: "Varies by lender", bestFor: "Buyers in high-cost markets or purchasing luxury properties", keyFacts: ["Exceeds conforming loan limits — not backed by Fannie/Freddie, so higher lender risk", "Stricter requirements: higher credit, lower DTI, larger reserves", "Rates can be competitive despite the risk profile", "May require two appraisals depending on lender"] },
  { name: "Non-QM", tagline: "For borrowers who don't fit the standard box.", minDown: "10–25% (varies by program)", credit: "620+ typical; some programs 660+", pmi: "Varies by program; often none", bestFor: "Self-employed borrowers, 1099 contractors, recent credit events, foreign nationals", keyFacts: ["'Non-QM' (non-qualified mortgage) is an umbrella term — not a single loan. It covers any mortgage that falls outside the CFPB's Qualified Mortgage rules", "Common Non-QM programs: Bank Statement loans (qualify on 12–24 months of deposits, not tax returns), 1099 loans (qualify on 1099 income), P&L loans (CPA-prepared profit & loss), Asset Depletion loans (qualify off liquid assets), DSCR (see next card)", "Rates typically run 0.5–2% higher than conventional. The trade-off: alternative income documentation that matches how you actually earn", "Down payment is usually 10–20% on owner-occupied; 20–25% on investment. Some programs allow as low as 10% with strong credit", "Non-QM ≠ subprime. These loans still verify your ability to repay — just through alternative documentation. Legitimate Non-QM lenders include Angel Oak, Acra, Newrez, Griffin Funding, and many traditional lenders' Non-QM divisions"] },
  { name: "DSCR", tagline: "Investment property. Qualified by rent, not by you.", minDown: "20–25%", credit: "640+ minimum; 700+ for best terms", pmi: "None — not required on DSCR programs", bestFor: "Real estate investors buying rental property — including those with strong portfolios but heavily-deducted tax returns", keyFacts: ["DSCR = Debt Service Coverage Ratio. The property's rental income divided by its total monthly payment (PITIA). A 1.0 DSCR means the rent exactly covers the payment", "No personal income documentation. No W-2s, no tax returns, no employment verification. The property's cash flow does the qualifying", "Most lenders want DSCR ≥ 1.0 minimum; 1.25+ unlocks best pricing and highest LTV", "Rates run 1–2% above conventional investment rates. Most DSCR loans carry a prepayment penalty (typically a 3–5 year step-down)", "Investment property only — DSCR cannot be used for owner-occupied homes. Single-family, 2–4 unit, condos, and short-term rentals all eligible. LLC ownership fully supported", "Reserves of 3–6 months PITIA per financed property are typical"] },
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
    limit: "∞",
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
    { heading: "Score Ranges & Impact", content: "Lenders group scores into rough tiers. 740+ gets the best conventional rates and the lowest PMI. 700–739 is still strong. 660–699 works but costs more in rate or PMI. 620–659 widens options on most programs. Fannie Mae and Freddie Mac removed their hard 620 floor in late 2025, so scores in the 580–619 range can now qualify for conventional if the file gets automated-underwriting approval and the lender doesn't impose its own 620+ overlay — though in practice, most still do. Below 580, conventional is typically off the table; FHA remains available down to 500 with a larger down payment." },
    { heading: "What Hurts Most", content: "Late payments (especially recent ones), collections, charge-offs, bankruptcies, and high credit utilization. A single 30-day late payment can drop your score 60–100 points. Maxed-out credit cards signal risk even if you pay on time." },
    { heading: "What Helps", content: "Pay everything on time. Keep credit card balances below 30% of limits (below 10% is ideal). Don't close old accounts — length of credit history matters. Don't open new credit before or during the mortgage process." },
    { heading: "Buy Now, Pay Later? Think Again.", tip: true, content: "Short-term installment loans from Klarna, Affirm, Afterpay, and similar services often don't show up on your credit report — but they do show up on your bank statements. When an underwriter reviews your assets, recurring withdrawals to BNPL providers get flagged and manually added to your debts, even though the credit bureaus never counted them. A handful of $40–$80 monthly payments can add a few hundred dollars to your DTI and push a marginal file over the qualifying limit. If you're planning to apply for a mortgage in the next 6–12 months, pay these off and avoid opening new ones — the convenience isn't worth the qualifying hit." },
  ]},
  { title: "Income & Employment", sections: [
    { heading: "Stability Is King", content: "Lenders want to see a stable, predictable income stream. Two years of consistent employment history is the standard benchmark. Gaps in employment need to be explained." },
    { heading: "W-2 vs. Self-Employed", content: "W-2 income is straightforward: your base pay plus any consistent overtime, bonuses, or commissions (averaged over 2 years). Self-employed borrowers face more scrutiny — lenders use your tax returns (Schedule C, K-1, or corporate returns) and average your net income over two years. Write-offs reduce your taxable income, but they also reduce your qualifying income." },
    { heading: "Debt-to-Income Ratio (DTI)", content: "DTI is your total monthly debt payments divided by your gross monthly income, and it's the single biggest driver of how much home you can afford. Caps vary by program: Conventional allows up to 49.99% (front and back). FHA allows up to 46.99% on the front-end and 56.99% on the back-end — giving more room if you have meaningful non-housing debts. VA allows up to 50% front / 55% back, with flexibility above that when residual income is strong. The Pre-Qual simulator on this site uses these exact caps to show you what you can afford under each program." },
  ]},
  { title: "Assets & Reserves", sections: [
    { heading: "What Counts", content: "Checking and savings accounts, investment accounts (stocks, bonds, mutual funds), retirement accounts (401k, IRA — typically 60–70% of vested value), gift funds from family (with proper documentation), and proceeds from the sale of another property." },
    { heading: "Gift Funds — Who Can Gift, and How It Works", tip: true, render: "giftFundsGrid", content: "" },
    { heading: "Sourcing & Seasoning", content: "Lenders need to trace every dollar. Large deposits (anything that isn't a payroll deposit) need a paper trail. 'Seasoned' funds (in your account for 60+ days) raise fewer questions. Cash deposits are the hardest to document — avoid them during the loan process." },
    { heading: "What Counts as a Large Deposit", tip: true, content: "The threshold depends on your loan program. Conventional (Fannie Mae) flags any single deposit over 50% of your monthly qualifying income — so if you earn $6,000/mo, any deposit over $3,000 triggers a review. FHA uses a different rule: any deposit over 1% of the sales price. On a $400k home, that's $4,000. VA follows a similar 'unusual deposit' standard, typically around 2% of the loan amount. Deposits that are clearly sourced on the statement (payroll, Social Security, tax refunds, verified account-to-account transfers) don't require further documentation. Everything else — bonuses deposited by check, transfers from accounts you haven't disclosed, cash deposits, Venmo/Zelle transfers — needs a paper trail showing where it came from." },
    { heading: "Reserves", content: "Reserves are the funds left over after your down payment and closing costs, expressed in months of mortgage payments (PITIA: principal, interest, taxes, insurance, HOA). For most owner-occupied purchases with an AUS approval — conventional, FHA, VA, or USDA — reserves are not required at all. Where they start to matter: credit-challenged files that need compensating factors for AUS approval, manually underwritten government loans, investment property purchases (typically 2–6 months per retained property), and Jumbo loans (6–12+ months is common). More reserves never hurt — they strengthen the file and can unlock better pricing — but they're rarely a hard requirement on a clean primary-residence purchase." },
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
  { title: "Other Loan Features", content: [
    { heading: "Prepayment Penalties", text: "A prepayment penalty is a fee charged if you pay off the loan early — either by selling, refinancing, or making large extra principal payments above a certain threshold. The good news: on the vast majority of today's residential mortgages, there is no prepayment penalty. CFPB rules under Dodd-Frank prohibit them on FHA, VA, USDA, and any 'higher-priced' mortgage. On standard Conventional loans, penalties are technically allowed but rare — and are capped at 2% in years 1–2, 1% in year 3, and prohibited entirely after 36 months. Where prepayment penalties HAVE made a comeback: DSCR and other Non-QM investor loans, where 3–5 year step-down structures are now standard. If you're getting a DSCR loan to flip or quickly refinance, read the prepayment terms carefully — a 5% penalty on a $400k loan is $20,000 you'd rather not pay." },
    { heading: "Balloon Payments", text: "A balloon payment is a large lump sum due at the end of the loan term — usually after a period of lower monthly payments based on a longer amortization schedule. Example: a 7/30 balloon means you'd pay as if it were a 30-year loan for 7 years, then owe the entire remaining balance in one payment. Balloons were common before the 2008 crisis. They're now nearly extinct in residential lending. CFPB rules under Dodd-Frank prohibit balloon features on standard Qualified Mortgages. The narrow exception: 'Small Creditor Balloon QMs' issued by community banks and credit unions under $10B in assets, in rural or underserved areas, holding the loan in portfolio. If you're being offered a residential loan with a balloon outside that narrow exception, ask hard questions about why. Where balloons still legitimately exist: commercial real estate loans, hard money / bridge loans (typically 12–24 months), and seller-financed transactions." },
    { heading: "Why Lenders Bring These Up", text: "Most borrowers will never encounter prepayment penalties or balloon payments on a standard residential mortgage. We mention them because they DO show up in the more sophisticated end of the market — particularly DSCR investor loans, hard money, and some Non-QM programs. If a loan officer mentions either of these features, that's your cue to ask exactly when they apply, how much they cost, and whether there's a version of the same loan without them. CFPB rules require lenders offering a loan with a prepayment penalty to also offer a comparable loan without one." },
  ]},
];

const NAV_TOPICS = [
  { id: "getting-started", label: "Your Mortgage Journey", icon: "🔑", subs: [
    { label: "1. Pre-Qualification", id: "getting-started", step: 0 },
    { label: "2. Pre-Approval", id: "getting-started", step: 1 },
    { label: "3. House Hunting & Contract", id: "getting-started", step: 2 },
    { label: "4. Loan Processing", id: "process", step: 0 },
    { label: "5. Underwriting", id: "process", step: 1 },
    { label: "6. Closing", id: "process", step: 2 },
  ]},
  { id: "types", label: "Mortgage Types", icon: "🏦", subs: [
    { label: "Conventional", id: "types", step: 0 },
    { label: "FHA", id: "types", step: 1 },
    { label: "VA", id: "types", step: 2 },
    { label: "USDA", id: "types", step: 3 },
    { label: "Jumbo", id: "types", step: 4 },
    { label: "Non-QM", id: "types", step: 5 },
    { label: "DSCR", id: "types", step: 6 },
  ]},
  { id: "structure", label: "Mortgage Structure", icon: "🏗", subs: [
    { label: "Loan Term", id: "structure", step: 0 },
    { label: "Fixed vs. ARM", id: "structure", step: 1 },
    { label: "Amortization", id: "structure", step: 2 },
    { label: "Other Loan Features", id: "structure", step: 3 },
  ]},
  { id: "profile", label: "Borrower Profile", icon: "👤", subs: [
    { label: "Credit", id: "profile", step: 0 },
    { label: "Income & Employment", id: "profile", step: 1 },
    { label: "Assets & Reserves", id: "profile", step: 2 },
    { label: "Property & Real Estate", id: "profile", step: 3 },
  ]},
  { id: "rates", label: "Interest Rates", icon: "📈", subs: [
    { label: "What Drives Rates", id: "rates", step: 0 },
    { label: "Rate Options & Points", id: "rates", step: 1 },
    { label: "Live Rates", id: "rates", step: 2 },
    { label: "APR", id: "rates", step: 3 },
  ]},
  { id: "costs", label: "Closing Costs", icon: "🧾", subs: [
    { label: "All About", id: "costs", step: "top" },
    { label: "Lender Fees", id: "costs", step: 0 },
    { label: "Title & Settlement", id: "costs", step: 1 },
    { label: "Third-Party Services", id: "costs", step: 2 },
    { label: "Government Fees", id: "costs", step: 3 },
    { label: "Prepaids & Escrow", id: "costs", step: 4 },
    { label: "TRID Fee Tolerances", id: "costs", step: "trid" },
  ]},
  { id: "next-steps", label: "Get Started", icon: "🚀" },
];

const NAV_TOOLS = [
  { id: "calculator", label: "Mortgage Calculator", icon: "__CALC_ICON__", href: "/calculator" },
  { id: "prequal", label: "Pre-Qual Simulator", icon: "__PREQUAL_ICON__", href: "/prequal" },
  { id: "compare", label: "Loan Comparison", icon: "__COMPARE_ICON__", href: "/compare" },
  { id: "cashtoclose", label: "Cash to Close", icon: "__CASH_ICON__", href: "/cash-to-close" },
  { id: "checklist", label: "Pre-Approval Checklist", icon: "✅" },
  { id: "glossary", label: "Jargon Decoder", icon: "📖" },
];

// ─── Components ──────────────────────────────────────────────────────────────

// Media query hook — returns true when viewport is ≤820px (matches the
// mobile breakpoint used throughout the CSS). Used to swap layouts between
// side-by-side (desktop) and accordion (mobile) without DOM gymnastics.
function useIsMobile(breakpoint = 820) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

// Detect whether the app is being viewed as an installed PWA (standalone mode).
// Checks both the W3C display-mode media query (Android/Desktop) and Apple's
// legacy navigator.standalone property (iOS Safari). Used to hide the
// "Install App" sidebar entry when the user is already in the installed app.
function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    const mqStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = window.navigator.standalone === true;
    return mqStandalone || iosStandalone;
  });
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = (e) => setIsStandalone(e.matches || window.navigator.standalone === true);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isStandalone;
}

function Sidebar({ activeSection, onNavigate, onSubNavigate, mobileOpen, setMobileOpen }) {
  const [expandedNav, setExpandedNav] = useState(null);
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();

  return (
    <>
      <div className={`mobile-bar ${mobileOpen ? "mobile-bar-open" : ""}`}>
        <div className="mobile-bar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>🤓</span>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 18, color: "#fff" }}>The Mortgage Geek</span>
          </div>
          <button className="hamburger" onClick={() => { if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(!mobileOpen); }}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "0 0 24px" }}>
          <div className="pwa-safe-top-sidebar" style={{ padding: "16px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", margin: "0 auto 16px", border: `3px solid ${P.gold}`, background: "rgba(255,255,255,0.05)" }}>
              <img src={HEADSHOT} alt="The Mortgage Geek" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>🤓</span>
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: 24, color: "#fff", fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>The Mortgage Geek</h1>
            <p style={{ fontSize: 12, color: P.goldLight, fontWeight: 500, marginTop: 8, letterSpacing: 0.5 }}>12+ Years of Mortgage Wisdom</p>
            <a href="/about" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", marginTop: 6, display: "inline-block", transition: "color 0.15s" }} onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"} onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.35)"}>About Nick →</a>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}><a href="tel:+16156560737" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>(615) 656-0737</a></p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>NMLS# 1119524</p>
          </div>
          <nav style={{ padding: "20px 12px", flex: 1 }}>
            {!isStandalone && (
              <>
                <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: `${P.goldLight}`, padding: "0 12px 10px", textTransform: "uppercase", opacity: 0.7 }}>App</span>
                <button
                  onClick={() => { window.location.href = "/install"; }}
                  className="nav-btn"
                  style={{ background: `${P.gold}15`, border: `1px solid ${P.gold}40` }}
                >
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>📲</span>
                  <span style={{ color: "#fff" }}>Install App</span>
                </button>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 12px" }} />
              </>
            )}
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", padding: "0 12px 10px", textTransform: "uppercase" }}>TOPICS</span>
            {NAV_TOPICS.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.subs) {
                      // Parent topic with dropdown — expand/collapse; also navigate on desktop
                      setExpandedNav(expandedNav === item.id ? null : item.id);
                      if (!isMobile) onNavigate(item.id);
                    } else {
                      // Leaf topic — navigate directly and close mobile sidebar
                      onNavigate(item.id);
                      setMobileOpen(false);
                    }
                  }}
                  className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
                  style={{ justifyContent: "space-between" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {item.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={16} variant="cream" /> : item.icon === "__COMPARE_ICON__" ? <CompareIcon size={18} variant="cream" /> : item.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={18} variant="cream" /> : item.icon === "__CASH_ICON__" ? <CashToCloseIcon size={18} variant="cream" /> : item.icon}
                    </span>
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
            {NAV_TOOLS.filter(item => item.href).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.href) { window.location.href = item.href; return; }
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={16} variant="cream" /> : item.icon === "__COMPARE_ICON__" ? <CompareIcon size={18} variant="cream" /> : item.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={18} variant="cream" /> : item.icon === "__CASH_ICON__" ? <CashToCloseIcon size={18} variant="cream" /> : item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 12px" }} />
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", padding: "0 12px 10px", textTransform: "uppercase" }}>Reference</span>
            {NAV_TOOLS.filter(item => !item.href).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
                style={{ opacity: 0.82 }}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={16} variant="cream" /> : item.icon === "__COMPARE_ICON__" ? <CompareIcon size={18} variant="cream" /> : item.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={18} variant="cream" /> : item.icon === "__CASH_ICON__" ? <CashToCloseIcon size={18} variant="cream" /> : item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontSize: 10, lineHeight: 1.5, color: "rgba(255,255,255,0.25)" }}>Educational content only.<br />Not financial advice.</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <svg width="9" height="10" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
                <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
                <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
              </svg>
              <span>Equal Housing Lender</span>
            </p>
          </div>
        </div>
      </aside>
      <div className={`sidebar-overlay ${mobileOpen ? "sidebar-overlay-visible" : ""}`} id="sidebar-overlay-drag" onClick={() => { if (mobileOpen) { if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(false); } }} />
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
          Mortgages <span style={{ color: P.goldLight }}>Demystified.</span>
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", maxWidth: 540, marginBottom: 36 }}>
          The mortgage process, demystified. From first conversation to closing day, in plain English.
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
            <span className="btn-label-mobile-hide">Call</span>
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
            <span className="btn-label-mobile-hide">Text</span>
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
  const isMobile = useIsMobile();
  useEffect(() => { if (navTarget?.section === "getting-started" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const step = PRE_CONTRACT_STEPS[active];

  const renderDetail = (s) => (
    <div className="process-detail">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontFamily: F.display, fontSize: 48, color: P.creamDark, lineHeight: 1 }}>{s.num}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: P.sage, background: `${P.sage}15`, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.3 }}>{s.timeframe}</span>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 24, color: P.navy, marginBottom: 12 }}>{s.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 24 }}>{s.detail}</p>
      <div style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text, fontWeight: 500 }}>{s.tip}</p>
      </div>
    </div>
  );

  const contractDivider = (
    <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, background: `${P.gold}15`, padding: "10px 20px", borderRadius: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.gold }}>Contract Signed</span>
        <span style={{ fontSize: 10, color: P.warmGrayLight }}>The 30-day clock starts ↓</span>
      </div>
    </div>
  );

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
            <Fragment key={i}>
              <button onClick={() => setActive(active === i && isMobile ? -1 : i)} className={`process-step ${active === i ? "process-step-active" : ""}`}>
                <span className={`process-num ${active === i ? "process-num-active" : ""}`}>{s.num}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.title}</span>
                  <span style={{ display: "block", fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>{s.short}</span>
                </div>
                {isMobile && <span style={{ fontSize: 18, fontWeight: 300, color: P.warmGrayLight, marginLeft: 8 }}>{active === i ? "−" : "+"}</span>}
              </button>
              {isMobile && active === i && renderDetail(s)}
            </Fragment>
          ))}
          {contractDivider}
        </div>
        {!isMobile && renderDetail(step)}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${P.navy}08`, padding: "8px 14px", borderRadius: 8, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="9" stroke={P.navy} strokeWidth="1.5" fill="none" />
            <path d="M10 5V10.5L13.5 13" stroke={P.navy} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
            <span style={{ fontFamily: F.display, fontSize: 20, color: P.navy, lineHeight: 1.1 }}>30–45</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: P.warmGray, letterSpacing: 0.3, marginTop: 2 }}>days typical</span>
          </div>
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
  const isMobile = useIsMobile();
  useEffect(() => { if (navTarget?.section === "process" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  const step = ACTIVE_LOAN_STEPS[active];

  const renderDetail = (s) => (
    <div className="process-detail">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontFamily: F.display, fontSize: 48, color: P.creamDark, lineHeight: 1 }}>{s.num}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: P.sage, background: `${P.sage}15`, padding: "3px 10px", borderRadius: 20 }}>{s.phase}</span>
          <span style={{ fontSize: 10, color: P.warmGrayLight, fontWeight: 500, padding: "0 10px" }}>Days {s.days}</span>
        </div>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 24, color: P.navy, marginBottom: 12 }}>{s.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 24 }}>{s.detail}</p>
      <div style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: P.text, fontWeight: 500 }}>{s.tip}</p>
      </div>
    </div>
  );

  return (
    <section id="process" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader
        eyebrow="Steps 4–6 · The Clock Is Ticking"
        title="The 30-Day Loan Process"
        subtitle="Once you're under contract, the countdown begins. Most closings happen in 30–45 days — streamlined files can close faster, while complex files (self-employed income, appraisal issues, title problems) may take longer."
      />
      {!isMobile && <ThirtyDayGraphic activeStep={active} />}
      <div className="process-grid">
        <div className="process-steps">
          {ACTIVE_LOAN_STEPS.map((s, i) => (
            <Fragment key={i}>
              <button onClick={() => setActive(active === i && isMobile ? -1 : i)} className={`process-step ${active === i ? "process-step-active" : ""}`}>
                <span className={`process-num ${active === i ? "process-num-active" : ""}`}>{s.num}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.title}</span>
                  <span style={{ display: "block", fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>{s.short}</span>
                </div>
                {isMobile && <span style={{ fontSize: 18, fontWeight: 300, color: P.warmGrayLight, marginLeft: 8 }}>{active === i ? "−" : "+"}</span>}
              </button>
              {isMobile && active === i && renderDetail(s)}
            </Fragment>
          ))}
        </div>
        {!isMobile && renderDetail(step)}
      </div>
      {isMobile && <div style={{ marginTop: 20 }}><ThirtyDayGraphic activeStep={active} /></div>}
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
      {/* Two-row grouped tab layout: Standard programs (5) + Specialized programs (2) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 8 }}>
            Standard Programs
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MORTGAGE_TYPES.slice(0, 5).map((m, i) => (
              <button
                key={m.name}
                onClick={() => setActive(i)}
                className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}
                style={{ flex: "1 1 0", minWidth: 90 }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 8 }}>
            Specialized Programs
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MORTGAGE_TYPES.slice(5).map((m, idx) => {
              const i = idx + 5;
              return (
                <button
                  key={m.name}
                  onClick={() => setActive(i)}
                  className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}
                  style={{ flex: "1 1 0", minWidth: 90 }}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
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
      if (navTarget.step === "top") {
        setTimeout(() => { const el = document.getElementById("costs"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
      } else if (navTarget.step === "trid") {
        setShowDetail(true); setOpenTrid(0);
        setTimeout(() => { const el = document.getElementById("costs-trid"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
      } else if (typeof navTarget.step === "number") {
        setShowDetail(true); setOpenCat(navTarget.step); setOpenItem(null);
        setTimeout(() => { const el = document.getElementById(`costs-cat-${navTarget.step}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
      }
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
              <div key={ci} id={`costs-cat-${ci}`} className="content-card" style={{ marginBottom: 10 }}>
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
          <div id="costs-trid" style={{ marginTop: 48 }}>
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

            {/* Cash to Close Simulator CTA — appears at the end of the deep-dive for engaged readers */}
            <div style={{ marginTop: 40, padding: "28px 24px", borderRadius: 14, background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldLight, display: "block", marginBottom: 10, opacity: 0.85 }}>Put It All Together</span>
              <h3 style={{ fontFamily: F.display, fontSize: "clamp(22px, 3vw, 28px)", color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>See your exact <span style={{ color: P.goldLight }}>cash to close</span> estimate.</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", maxWidth: 460, margin: "0 auto 20px" }}>
                You know what every cost is — now see how they add up for your scenario. State-specific transfer taxes, metro-level property tax rates, and month-accurate reserve schedules across all 50 states.
              </p>
              <a href="/cash-to-close" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(184,134,11,0.3)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <CashToCloseIcon size={18} variant="navy" />
                  Open the Cash to Close Simulator →
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function GiftFundsGrid() {
  const programs = [
    {
      name: "Conventional (Fannie Mae)",
      color: PROGRAM_COLORS.Conventional,
      donors: "Spouse, child, parent, sibling, grandparent, aunt/uncle, cousin, domestic partner, fiancé(e), godparent, or a former relative. Trusts and estates of a related person also qualify.",
      notes: "Broad definition — most family and extended-family donors are eligible.",
    },
    {
      name: "Conventional (Freddie Mac)",
      color: PROGRAM_COLORS.Conventional,
      donors: "All Fannie categories above, plus any 'unrelated individual with close, family-like ties' to the borrower. Wedding and graduation gifts from non-relatives are also allowed (must be deposited within 90 days).",
      notes: "The most liberal program — includes close family friends if the relationship is documented.",
    },
    {
      name: "FHA",
      color: PROGRAM_COLORS.FHA,
      donors: "Family member (as defined by HUD — includes cousins), employer, labor union, close friend with a documented relationship, charitable organization, or a government agency providing homeownership assistance.",
      notes: "Close-friend gifts require a detailed letter documenting the relationship and its length.",
    },
    {
      name: "VA",
      color: PROGRAM_COLORS.VA,
      donors: "Any donor who has no affiliation with the builder, developer, real estate agent, or any other party to the transaction.",
      notes: "Most flexible on relationship — no family requirement — but strict on avoiding conflicts of interest.",
    },
    {
      name: "USDA",
      color: P.sage,
      donors: "Any donor with no financial interest in the sale of the property (not the seller, builder, real estate agent, etc.).",
      notes: "Rules out interested parties but otherwise flexible on relationship.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
        Gift funds are cash from a qualified donor who expects no repayment. Every program allows them — but the rules on who can give, and how the money must be documented, vary significantly.
      </p>

      <h5 style={{ fontFamily: F.display, fontSize: 16, color: P.navy, marginTop: 10, marginBottom: 4 }}>Who qualifies as a donor</h5>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {programs.map((p, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${p.color}`, paddingLeft: 12, paddingTop: 2, paddingBottom: 2 }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: p.color, marginBottom: 2 }}>{p.name}</span>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray, marginBottom: 2 }}>{p.donors}</p>
            <p style={{ fontSize: 11, lineHeight: 1.5, color: P.warmGrayLight, fontStyle: "italic" }}>{p.notes}</p>
          </div>
        ))}
      </div>

      <div style={{ background: P.white, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0", marginTop: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 5 }}>🤓 Privacy Tip</span>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: P.text, fontWeight: 600, marginBottom: 6 }}>
          Keep the gift in the donor's account until closing — and we won't need their bank statements.
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray }}>
          When a donor sends gift funds directly to the title/closing agent (not to the borrower first), most programs don't require the donor to provide bank statements. A canceled check, wire confirmation, or cashier's check reflecting the donor as remitter is enough. This is a significant relief for family members who'd rather not share their full financial picture with a mortgage underwriter — and it's often the smoothest delivery path for everyone involved.
        </p>
      </div>

      <h5 style={{ fontFamily: F.display, fontSize: 16, color: P.navy, marginTop: 14, marginBottom: 4 }}>Every program requires a gift letter</h5>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray, marginBottom: 4 }}>
        The gift letter is signed by both the donor and borrower. It must include:
      </p>
      <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>
        <li>Donor's name, address, and phone number</li>
        <li>Donor's relationship to the borrower</li>
        <li>The dollar amount of the gift</li>
        <li>A statement that no repayment is expected or required</li>
      </ul>

      <p style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic", marginTop: 10, lineHeight: 1.6 }}>
        Gift requirements change periodically and may vary by lender overlay. This is a plain-English summary of current agency guidelines — your loan originator will confirm the exact documentation your file needs.
      </p>
    </div>
  );
}

function BorrowerProfile({ navTarget }) {
  const [active, setActive] = useState(0);
  const [expandedTips, setExpandedTips] = useState({});
  useEffect(() => { if (navTarget?.section === "profile" && typeof navTarget.step === "number") setActive(navTarget.step); }, [navTarget]);
  useEffect(() => { setExpandedTips({}); }, [active]);
  return (
    <section id="profile" style={{ padding: "64px 40px", background: P.creamDark }}>
      <SectionHeader eyebrow="What Lenders Evaluate" title="Your Borrower Profile" subtitle="Every lending decision comes down to four pillars." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {BORROWER_PROFILE.map((b, i) => (
          <button key={b.title} onClick={() => setActive(i)} className={`tab-btn ${active === i ? "tab-btn-active" : ""}`}>{b.title}</button>
        ))}
      </div>
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
        {BORROWER_PROFILE[active].sections.map((s, i) => {
          if (s.tip) {
            const isExpanded = !!expandedTips[i];
            return (
              <div key={i} style={{ background: P.cream, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
                <button
                  onClick={() => setExpandedTips((prev) => ({ ...prev, [i]: !prev[i] }))}
                  style={{ background: "none", border: "none", padding: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: F.body, textAlign: "left" }}
                >
                  <span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 5 }}>🤓 Geek Tip</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{s.heading}</span>
                  </span>
                  <span style={{ fontSize: 11, color: P.gold, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", marginLeft: 12 }}>▼</span>
                </button>
                {isExpanded && (
                  s.render === "giftFundsGrid" ? <GiftFundsGrid /> : (
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: P.text, fontWeight: 500, marginTop: 12 }}>{s.content}</p>
                  )
                )}
              </div>
            );
          }
          return (
            <div key={i} className="content-card" style={{ padding: "24px 28px" }}>
              <h4 style={{ fontFamily: F.display, fontSize: 19, color: P.navy, marginBottom: 8 }}>{s.heading}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{s.content}</p>
            </div>
          );
        })}
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
        {fmt(principal)} loan at {Number(rate).toFixed(3)}% over {years} years — watch how interest dominates early, then principal takes over
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

  const tabs = ["What Drives Rates", "Rate Options & Points", "Live Rates", "APR"];

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
              { factor: "The Bond Market (MBS)", desc: "Mortgage rates track mortgage-backed securities, not the Fed Funds rate. When MBS yields rise, rates rise." },
              { factor: "Credit Score", desc: "The biggest borrower-controlled factor. 740+ gets the best pricing; every 20 points below adds cost. A 740 vs 660 can differ by 0.5–1.0% in rate." },
              { factor: "Loan-to-Value (LTV)", desc: "How much you're borrowing relative to the home's value. 80% LTV (20% down) gets the best pricing. Higher LTV means higher rate or PMI." },
              { factor: "Loan Type & Term", desc: "FHA rates often beat conventional (government backing reduces risk). 15-year beats 30-year. ARMs start lower than fixed." },
              { factor: "Property Type & Use", desc: "Primary single-family gets the best rate. Condos, multi-units, second homes, and investment properties all carry pricing adjustments (LLPAs)." },
              { factor: "Debt-to-Income Ratio", desc: "Higher DTI can trigger pricing adjustments, especially above 40–45%." },
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

      {activeTab === 3 && (() => {
        // APR comparison example: Two FHA lenders, same note rate, different fee structures
        const exLoan = 300000;
        const exUpfront = exLoan * 0.0175; // UFMIP
        const exTotalLoan = exLoan + exUpfront;
        const exRate = 6.5;
        const exTerm = 30;
        const exMipRate = 0.0055;
        const exMonthlyMI = (exLoan * exMipRate) / 12;
        const exMiMonths = exTerm * 12; // life of loan, <10% down

        // Lender A: no points, lower fees
        const aOrigin = 0;
        const aUnderwriting = 1200;
        const aProcessing = 500;
        const aCredit = 75;
        const aAppraisal = 550;
        const aFlood = 15;
        const aTaxSvc = 80;
        const aPoints = 0;
        const aPointsCost = 0;
        const aTotal = aOrigin + aUnderwriting + aProcessing + aCredit + aAppraisal + aFlood + aTaxSvc + aPointsCost;
        const aCharges = aTotal + exUpfront;
        const aAPR = calculateAPR(exTotalLoan, aCharges, exRate, exTerm, exMonthlyMI, exMiMonths);

        // Lender B: 1 full discount point, higher fees
        const bOrigin = 500;
        const bUnderwriting = 1500;
        const bProcessing = 750;
        const bCredit = 300;
        const bAppraisal = 550;
        const bFlood = 15;
        const bTaxSvc = 80;
        const bPoints = 1;
        const bPointsCost = exLoan * (bPoints / 100);
        const bTotal = bOrigin + bUnderwriting + bProcessing + bCredit + bAppraisal + bFlood + bTaxSvc + bPointsCost;
        const bCharges = bTotal + exUpfront;
        const bAPR = calculateAPR(exTotalLoan, bCharges, exRate, exTerm, exMonthlyMI, exMiMonths);

        const FeeRow = ({ label, a, b }) => (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "5px 0", borderBottom: `1px solid ${P.cream}`, fontSize: 12 }}>
            <span style={{ color: P.warmGray }}>{label}</span>
            <span style={{ textAlign: "right", fontWeight: 600, color: P.text }}>{fmt(a)}</span>
            <span style={{ textAlign: "right", fontWeight: 600, color: P.text }}>{fmt(b)}</span>
          </div>
        );

        return (
          <div style={{ maxWidth: 720 }}>
            <div className="content-card" style={{ padding: 28, marginBottom: 20 }}>
              <h4 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 12 }}>What is APR?</h4>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>
                The <strong style={{ color: P.text }}>Annual Percentage Rate (APR)</strong> is a standardized measure of your total borrowing cost, mandated by the federal Truth in Lending Act (Reg Z). It takes your note rate and factors in lender fees, discount points, upfront mortgage insurance, and monthly mortgage insurance premiums for the period they're required — expressing it all as a single annual percentage.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray, marginBottom: 16 }}>
                <strong style={{ color: P.text }}>Why it matters:</strong> Two lenders can quote you the exact same interest rate, but one could cost you thousands more in fees. The note rate only tells you the interest charged on the loan balance. APR reveals the <em>true cost of credit</em> — making it the best apples-to-apples comparison tool when shopping lenders.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: P.warmGray }}>
                <strong style={{ color: P.text }}>What's included in APR:</strong> Lender origination fees, underwriting, processing, discount points, upfront MIP (FHA) or VA funding fee, monthly mortgage insurance, and prepaid interest. <strong style={{ color: P.text }}>What's excluded:</strong> Title fees, recording fees, transfer taxes, homeowner's insurance, and escrow deposits — because these costs don't go to the lender.
              </p>
            </div>

            {/* Side-by-side lender comparison */}
            <div className="content-card" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>Real-World Example</span>
                <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 6 }}>Same Rate. Different Cost.</h4>
                <p style={{ fontSize: 13, color: P.warmGray }}>FHA loan · $300,000 · 3.5% down · {exRate.toFixed(3)}% note rate · 30-year fixed</p>
              </div>

              {/* Lender headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div />
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P.sage, display: "block" }}>Lender A</span>
                  <span style={{ fontSize: 10, color: P.warmGrayLight }}>No points, lower fees</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P.goldMuted, display: "block" }}>Lender B</span>
                  <span style={{ fontSize: 10, color: P.warmGrayLight }}>1 point + higher fees</span>
                </div>
              </div>

              {/* Fee breakdown */}
              <FeeRow label="Origination Fee" a={aOrigin} b={bOrigin} />
              <FeeRow label="Underwriting" a={aUnderwriting} b={bUnderwriting} />
              <FeeRow label="Processing" a={aProcessing} b={bProcessing} />
              <FeeRow label="Credit Report" a={aCredit} b={bCredit} />
              <FeeRow label="Appraisal" a={aAppraisal} b={bAppraisal} />
              <FeeRow label="Flood Cert + Tax Svc" a={aFlood + aTaxSvc} b={bFlood + bTaxSvc} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "5px 0", borderBottom: `1px solid ${P.cream}`, fontSize: 12 }}>
                <span style={{ color: P.warmGray }}>Discount Points</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: P.sage }}>{aPoints} pts ({fmt(aPointsCost)})</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: P.goldMuted }}>{bPoints} pt ({fmt(bPointsCost)})</span>
              </div>
              <FeeRow label="UFMIP (1.75%)" a={exUpfront} b={exUpfront} />

              {/* Totals */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "8px 0", marginTop: 4, borderTop: `2px solid ${P.navy}`, fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: P.navy }}>Total Finance Charges</span>
                <span style={{ textAlign: "right", color: P.sage }}>{fmt(aCharges)}</span>
                <span style={{ textAlign: "right", color: P.goldMuted }}>{fmt(bCharges)}</span>
              </div>

              {/* APR result cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                <div style={{ background: `${P.sage}12`, border: `2px solid ${P.sage}`, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: P.sage, display: "block", marginBottom: 4 }}>Lender A · APR</span>
                  <span style={{ fontFamily: F.display, fontSize: 32, color: P.sage, display: "block" }}>{aAPR.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGray, display: "block", marginTop: 4 }}>Note rate {exRate.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGrayLight, display: "block", marginTop: 2 }}>Fees: {fmt(aTotal)}</span>
                </div>
                <div style={{ background: `${P.goldMuted}12`, border: `2px solid ${P.goldMuted}`, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 4 }}>Lender B · APR</span>
                  <span style={{ fontFamily: F.display, fontSize: 32, color: P.goldMuted, display: "block" }}>{bAPR.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGray, display: "block", marginTop: 4 }}>Note rate {exRate.toFixed(3)}%</span>
                  <span style={{ fontSize: 11, color: P.warmGrayLight, display: "block", marginTop: 2 }}>Fees: {fmt(bTotal)}</span>
                </div>
              </div>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: P.text, fontWeight: 600, marginBottom: 4 }}>Same rate. Lender B costs {fmt(bCharges - aCharges)} more.</p>
                <p style={{ fontSize: 12, color: P.warmGray }}>APR reveals the difference: {bAPR.toFixed(3)}% vs {aAPR.toFixed(3)}%</p>
              </div>
            </div>

            {/* Geek tip */}
            <div className="content-card" style={{ padding: "18px 20px", display: "flex", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
              <div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: P.warmGray, marginBottom: 10 }}>
                  <strong style={{ color: P.text }}>Geek Tip:</strong> Always compare APR — not just the rate — when shopping lenders. A lower rate with high points or fees can cost more over the life of the loan than a slightly higher rate with lower fees. The Loan Estimate (page 3) is required to show APR, so request one from every lender you're considering.
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: P.warmGray }}>
                  <strong style={{ color: P.text }}>One caveat:</strong> APR assumes you keep the loan for the full term. If you plan to sell or refinance within 5–7 years, a higher-fee/lower-rate option may actually cost more because you don't hold the loan long enough to recoup the upfront cost. In that case, compare total cost over your expected holding period, not just APR.
                </p>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a href="/cash-to-close" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                <CashToCloseIcon size={18} variant="navy" />
                See Your Estimated APR in Cash to Close →
              </a>
            </div>
          </div>
        );
      })()}
    </section>
  );
}

function MobileToolbar({ hrefOverrides = {} }) {
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();
  const toolbarH = isStandalone ? 76 : 56;
  const [offset, setOffset] = useState(toolbarH);
  const lastY = useRef(0);
  useEffect(() => {
    if (!isMobile) return;
    let off = toolbarH;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        const nearBottom = (window.innerHeight + y) >= (document.documentElement.scrollHeight - 150);
        if (y < 100 || nearBottom) { off = toolbarH; } else { off = Math.max(0, Math.min(toolbarH, off + delta)); }
        lastY.current = y;
        setOffset(off);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, toolbarH]);
  if (!isMobile) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150, overflow: "hidden", pointerEvents: offset >= toolbarH ? "none" : "auto" }}>
      <nav style={{ transform: `translateY(${offset}px)`, willChange: "transform", background: "rgba(15, 37, 48, 0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingBottom: `max(${isStandalone ? 32 : 16}px, env(safe-area-inset-bottom, 0px))`, display: "flex", justifyContent: "center", alignItems: "center", height: isStandalone ? 76 : 56, paddingTop: isStandalone ? 32 : 16 }}>
        <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", maxWidth: 320, width: "100%" }}>
          {[
            { icon: "__CASH_ICON__", label: "Cash to Close", href: "/cash-to-close" },
            { icon: "__PREQUAL_ICON__", label: "Pre-Qual", href: "/prequal" },
            { icon: "__COMPARE_ICON__", label: "Compare", href: "/compare" },
            { icon: "__CALC_ICON__", label: "Calculator", href: "/calculator" },
          ].map((t) => (
            <a key={t.href} href={hrefOverrides[t.href] || t.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "0" }}>
              <span style={{ fontSize: 22, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {t.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={20} variant="cream" /> : t.icon === "__COMPARE_ICON__" ? <CompareIcon size={22} variant="cream" /> : t.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={22} variant="cream" /> : t.icon === "__CASH_ICON__" ? <CashToCloseIcon size={22} variant="cream" /> : t.icon}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#fff", fontFamily: F.body, letterSpacing: 0.3 }}>{t.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

function CalcInput({ label, value, onChange, prefix, suffix, step = 1, min = 0, max = 99999999, comma }) {
  const isEmpty = value === "" || value === null || value === undefined;
  const fmtComma = (v) => (v === "" || v === null || v === undefined) ? "" : comma ? Number(v).toLocaleString("en-US") : String(v);
  const [localVal, setLocalVal] = useState(fmtComma(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setLocalVal(fmtComma(value)); }, [value, focused]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setLocalVal(raw);
    if (raw === "") { onChange(0); return; }
    const cleaned = comma ? raw.replace(/,/g, "") : raw;
    const v = parseFloat(cleaned);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  };

  const handleFocus = () => {
    setFocused(true);
    setLocalVal(isEmpty ? "" : String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    if (localVal === "" && isEmpty) { setLocalVal(""); return; }
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
  const STORAGE_KEY = "mg_checklist";
  const [sectionOpen, setSectionOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : {}; }
    catch { return {}; }
  });
  const toggle = (id) => {
    setCheckedItems(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const resetAll = () => {
    setCheckedItems({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

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
    <section id="checklist" style={{ padding: "64px 40px" }}>
      <div onClick={() => setSectionOpen(!sectionOpen)} style={{ cursor: "pointer" }}>
        <SectionHeader eyebrow="Get Organized" title={`Pre-Approval Checklist ${sectionOpen ? "−" : "+"}`} subtitle={sectionOpen ? "Gathering these documents before you apply will speed up your approval and reduce back-and-forth. Check them off as you go." : (checkedCount > 0 ? `Click to expand — you've checked off ${checkedCount} of ${totalItems} items.` : `Click to reveal ${totalItems} documents to gather before you apply.`)} />
      </div>
      {sectionOpen && (
      <div style={{ maxWidth: 720 }}>
        {/* Progress bar */}
        <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: P.navy }}>{checkedCount} of {totalItems} items ready</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: P.warmGrayLight }}>{totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0}%</span>
              {checkedCount > 0 && (
                <button onClick={resetAll} style={{ background: "none", border: "none", fontSize: 11, color: P.warmGrayLight, cursor: "pointer", fontFamily: F.body, opacity: 0.6, textDecoration: "underline" }}>Reset</button>
              )}
            </div>
          </div>
          <div style={{ height: 8, background: P.creamDark, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(checkedCount / totalItems) * 100}%`, background: checkedCount === totalItems ? P.sage : P.gold, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          {checkedCount > 0 && checkedCount < totalItems && (
            <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 6, textAlign: "center" }}>Your progress is saved automatically</p>
          )}
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
      )}
    </section>
  );
}

function AboutPage() {
  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}</style>

      {/* Header */}
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 800, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>🤓</span>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 800, margin: "0 auto" }}>
        {/* Headshot + intro */}
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center", marginBottom: 48 }}>
          <div style={{ width: 140, height: 140, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `4px solid ${P.gold}`, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
            <img src={HEADSHOT} alt="Nick Peters" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>The Person Behind the Site</span>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(28px, 4vw, 38px)", color: P.navy, marginBottom: 6 }}>Nick Peters</h1>
            <p style={{ fontSize: 14, color: P.warmGray }}>Mortgage Loan Originator · NMLS# 1119524</p>
            <p style={{ fontSize: 13, color: P.warmGrayLight, marginTop: 2 }}>Nashville, TN · Licensed since 2014</p>
          </div>
        </div>

        {/* Bio */}
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            For twelve years, I worked the sales desk in new construction model homes. I was the person families approached after falling in love with a house — the one responsible for turning that excitement into numbers that actually worked. Some conversations ended in approvals. Others required me to gently explain why the answer was "not yet," and what steps we could take to change that.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            Builder lending taught me the real edges of the mortgage world in a way retail banking never could. Over the years, I've assisted countless homebuyers of all types and navigated virtually every loan scenario imaginable. I learned how to structure deals that were favorable and perfectly tailored to each customer's specific needs and situation.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            The Mortgage Geek exists because most mortgage websites are either generic rate-bait or thinly disguised lead forms. Neither respects the borrower. This site is the opposite bet: give you the real information, the real tools, and a real human to text when you're ready. No drip campaigns. No "apply now" before you know what you're applying for. Just a plain-English answer to whatever you need.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray }}>
            If you're anywhere in the mortgage process — whether you're just curious about what you can afford or you've already accepted an offer and your current lender has gone silent — feel free to text me. I'm happy to help, no matter what stage you're at.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 48 }}>
          {[
            { num: "12+", label: "Years in the industry" },
            { num: "Hundreds", label: "Families helped" },
          ].map((s, i) => (
            <div key={i} className="content-card" style={{ padding: "24px 16px", textAlign: "center" }}>
              <span style={{ fontFamily: F.display, fontSize: 30, color: P.navy, display: "block", marginBottom: 4 }}>{s.num}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: P.warmGrayLight, letterSpacing: 0.3, textTransform: "uppercase" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Programs */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 12 }}>Loan Programs Mastered</span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Conventional", "FHA", "VA", "USDA", "Jumbo", "DSCR"].map((p, i) => (
              <span key={i} style={{ padding: "8px 18px", borderRadius: 50, background: P.white, fontSize: 13, fontWeight: 600, color: P.navy, border: `1px solid ${P.creamDark}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>{p}</span>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div style={{
          background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 100%)`,
          borderRadius: 16, padding: "36px 32px", marginBottom: 48,
        }}>
          <h3 style={{ fontFamily: F.display, fontSize: 24, color: "#fff", marginBottom: 8 }}>Let's connect.</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Whether you're ready to get pre-approved or just have a question — reach out anytime.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="tel:+16156560737" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: P.gold, color: "#fff",
              fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              (615) 656-0737
            </a>
            <a href="sms:+16156560737&body=Hi%20Nick%2C%20I%20found%20your%20site%20and%20wanted%20to%20connect." style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Text me
            </a>
            <a href="https://www.linkedin.com/in/nickpeters2/" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: F.body, fontSize: 14, fontWeight: 500, textDecoration: "none",
            }}>
              LinkedIn →
            </a>
          </div>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          <span>NMLS# 1119524 ·</span>
          <svg width="11" height="12" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
            <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
            <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
            <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
          </svg>
          <span>Equal Housing Lender</span>
        </p>
      </div>
      <MobileToolbar />
    </div>
  );
}

function ComparePage() {
  const STORAGE_KEY = "mg_compare_scenarios";
  const [scenarios, setScenarios] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });

  const [selectedId, setSelectedId] = useState(null);

  const removeScenario = (id) => {
    const next = scenarios.filter(s => s.id !== id);
    setScenarios(next);
    if (selectedId === id) setSelectedId(null);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const resetAll = () => {
    if (!window.confirm("Clear all saved scenarios? This cannot be undone.")) return;
    setScenarios([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Find the cheapest total payment for "best" badge
  const lowestTotal = scenarios.length > 0 ? Math.min(...scenarios.map(s => s.total)) : 0;

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .compare-grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; align-items: flex-start; padding-top: 14px; }
        .compare-card { width: 320px; flex-shrink: 0; }
        @media (max-width: 720px) { .compare-card { width: 100%; max-width: 360px; } }

        .print-only { display: none; }

        @media print {
          @page { size: portrait; margin: 0.25in; }
          body { background: #fff !important; }
          body > div, body > div > div { min-height: auto !important; background: #fff !important; }
          body > div > div > div { padding: 10px 12px 4px !important; }
          .print-only { margin-top: 6px !important; padding-top: 4px !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }

          /* Force all colors and backgrounds to render in PDF */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .compare-grid {
            display: flex !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: flex-start !important;
            gap: 5px !important;
            padding-top: 8px !important;
            page-break-inside: avoid;
          }
          .compare-card {
            width: 32% !important;
            max-width: none !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .compare-card .card-header { padding: 8px 10px !important; }
          .compare-card .card-total { font-size: 15px !important; }
          .compare-card div, .compare-card span, .compare-card strong, .compare-card p { font-size: 6.5px !important; line-height: 1.25 !important; }
          .compare-card .card-total { font-size: 15px !important; }
          .compare-card ul { margin: 2px 0 0 !important; padding-left: 9px !important; }
          .compare-card li { margin-bottom: 0 !important; font-size: 6px !important; line-height: 1.2 !important; }
          .content-card { box-shadow: none !important; border: 1px solid #999 !important; }

          /* Darken labels and values in card body for high contrast on white */
          .compare-card .pdf-label { color: #4a4a4a !important; font-size: 6.5px !important; }
          .compare-card .pdf-value { color: #000 !important; font-size: 6.5px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20loan%20comparison%20tool%20and%20had%20a%20question." style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Print-only branded header */}
        <div className="print-only" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${P.navy}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 2 }}>🤓 The Mortgage Geek · Loan Comparison</div>
              <div style={{ fontSize: 11, color: P.warmGray }}>Nick Peters · NMLS# 1119524 · (615) 656-0737 · mortgagegeek.ai</div>
            </div>
            <div style={{ fontSize: 10, color: P.warmGrayLight, textAlign: "right" }}>Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>

        <div className="no-print" style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>Side by Side</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            Loan Comparison
            <CompareIcon size={32} variant="navy" />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>Save up to 3 scenarios from the calculator and compare them side by side. Your scenarios are saved on this device.</p>
        </div>

        {scenarios.length === 0 ? (
          <div className="content-card" style={{ padding: "48px 32px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <CompareIcon size={56} variant="navy" />
            </div>
            <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 8 }}>No scenarios saved yet</h3>
            <p style={{ fontSize: 14, color: P.warmGray, marginBottom: 24, lineHeight: 1.6 }}>
              Head to the calculator, build a scenario, select a loan program, and tap "Save to Comparison." Come back here to see them stacked side by side.
            </p>
            <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(184,134,11,0.3)" }}><MortgageCalcIcon size={18} variant="cream" /> Open the Calculator →</a>
          </div>
        ) : (
          <>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 13, color: P.warmGray }}>{scenarios.length} of 3 scenarios saved</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, border: "none", background: P.navy, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>📄 Save as PDF</button>
                <button onClick={resetAll} style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${P.creamDark}`, background: "transparent", fontSize: 11, fontWeight: 600, color: P.warmGrayLight, cursor: "pointer", fontFamily: F.body }}>Clear All</button>
              </div>
            </div>

            <div className="compare-grid">
              {scenarios.map((s) => {
                const isBest = s.total === lowestTotal && scenarios.length > 1;
                const isSelected = selectedId === s.id;
                const cardColor = PROGRAM_COLORS[s.program] || s.color || P.navy;
                return (
                  <div key={s.id} className="content-card compare-card" onClick={() => setSelectedId(isSelected ? null : s.id)} style={{ overflow: "visible", position: "relative", border: isSelected ? `2px solid ${cardColor}` : isBest ? `2px solid ${P.gold}` : "2px solid transparent", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: isSelected ? `0 0 0 3px ${cardColor}30` : undefined }}>
                    {isBest && <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "4px 12px", borderRadius: 50, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>★ Lowest Payment</span>}
                    <div className="card-header" style={{ background: cardColor, padding: "20px", textAlign: "center", borderRadius: "10px 10px 0 0" }}>
                      <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.program} · {s.term}yr</span>
                      <span className="card-total" style={{ fontFamily: F.display, fontSize: 28, color: "#fff" }}>{fmt(s.total)}/mo</span>
                      <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{fmt(s.homePrice)} · {s.downPct}% down · {Number(s.rate).toFixed(3)}%</span>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      {[
                        { label: "Home Price", val: fmt(s.homePrice) },
                        { label: "Down Payment", val: `${fmt(s.downAmt)} (${s.downPct}%)` },
                        { label: "Base Loan Amount", val: fmt(s.baseLoan || (s.homePrice - s.downAmt)) },
                        ...(s.upfront > 0 ? [{ label: s.upfrontLabel || "Upfront Fee", val: `+ ${fmt(s.upfront)}`, sub: true }] : []),
                        ...(s.upfront > 0 ? [{ label: "Total Loan (financed)", val: fmt(s.totalLoan || s.loan), bold: true, color: cardColor }] : []),
                        { label: "Principal & Interest", val: `${fmt(s.pi)}/mo` },
                        ...(s.mi > 0 ? [{ label: "Mortgage Insurance", val: `${fmt(s.mi)}/mo` }] : []),
                        { label: "Property Tax", val: `${fmt(s.tax)}/mo` },
                        { label: "Insurance", val: `${fmt(s.insurance)}/mo` },
                        ...(s.hoa > 0 ? [{ label: "HOA Dues", val: `${fmt(s.hoa)}/mo` }] : []),
                        { label: "Total Payment", val: `${fmt(s.total)}/mo`, bold: true, color: cardColor },
                      ].map((row, ri, arr) => (
                        <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: row.sub ? 11 : 12, borderBottom: ri < arr.length - 1 ? `1px solid ${P.cream}` : "none" }}>
                          <span className="pdf-label" style={{ color: P.warmGrayLight, fontStyle: row.sub ? "italic" : "normal" }}>{row.label}</span>
                          <span className="pdf-value" style={{ fontWeight: row.bold ? 700 : 600, color: row.color || (row.bold ? cardColor : P.text) }}>{row.val}</span>
                        </div>
                      ))}
                      {/* APR */}
                      {s.apr > 0 && (
                        <div style={{ marginTop: 10, padding: "8px 10px", background: P.cream, borderRadius: 6, textAlign: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR</span>
                          <span style={{ fontFamily: F.display, fontSize: 18, color: cardColor, display: "block" }}>{s.apr.toFixed(3)}%</span>
                          <span style={{ fontSize: 9, color: P.warmGrayLight, display: "block", marginTop: 2 }}>Note rate {Number(s.rate).toFixed(3)}%</span>
                          <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                        </div>
                      )}
                      {/* Geek Tips */}
                      <div style={{ marginTop: 14, padding: "10px 12px", background: P.cream, borderRadius: 8, fontSize: 11, lineHeight: 1.6, color: P.warmGray }}>
                        <span style={{ fontSize: 13 }}>🤓</span> <strong style={{ color: P.text }}>Geek Tips:</strong>
                        {s.program === "Conventional" && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                            <li>PMI drops off automatically at 80% LTV — no refinance needed.</li>
                            <li>Conventional loans can sometimes be <strong>recast</strong>: make a large lump-sum payment toward principal, and the lender recalculates your monthly payment at the same rate and term — lowering it without refinancing.</li>
                            <li>Best rates go to 740+ credit scores; pricing adjustments increase below 700.</li>
                          </ul>
                        )}
                        {s.program === "FHA" && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                            {s.downPct >= 10 ? (
                              <li>With 10%+ down, your monthly mortgage insurance (MIP) <strong>drops off after 11 years</strong> — unlike FHA loans with less than 10% down, which carry MIP for the life of the loan.</li>
                            ) : (
                              <li>With less than 10% down, MIP stays for the <strong>life of the loan</strong>. Refinancing to conventional once you hit 80% LTV is the typical exit strategy.</li>
                            )}
                            <li>FHA loans are <strong>assumable</strong> — a future buyer can take over your loan at your locked-in rate, which can be a major selling advantage if rates rise.</li>
                            <li>More lenient credit and DTI requirements than conventional.</li>
                          </ul>
                        )}
                        {s.program === "VA" && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                            <li>No monthly mortgage insurance — ever. The VA funding fee is a one-time cost.</li>
                            <li>VA loans are <strong>assumable</strong> — a future buyer (even a non-veteran) can assume your rate and terms, which is a powerful advantage in a rising-rate market.</li>
                            <li>No down payment required and typically the lowest rates available.</li>
                          </ul>
                        )}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeScenario(s.id); }} className="no-print" style={{ width: "100%", marginTop: 14, padding: "8px 0", borderRadius: 6, border: `1px solid ${P.creamDark}`, background: "transparent", fontSize: 11, fontWeight: 600, color: P.warmGrayLight, cursor: "pointer", fontFamily: F.body }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedId && (() => {
              const s = scenarios.find(sc => sc.id === selectedId);
              if (!s) return null;
              const calcUrl = `/calculator?price=${s.homePrice}&down=${s.downPct}&term=${s.term}&rate=${s.rate}&program=${encodeURIComponent(s.program)}&tax=${s.tax}&insurance=${s.insurance}${s.hoa > 0 ? `&hoa=${s.hoa}` : ""}`;
              return (
                <div className="no-print" style={{ textAlign: "center", marginTop: 28 }}>
                  <p style={{ fontSize: 12, color: P.warmGray, marginBottom: 10 }}>Selected: <strong>{s.program} · {s.term}yr · {fmt(s.total)}/mo</strong></p>
                  <a href={calcUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: PROGRAM_COLORS[s.program] || P.navy, color: "#fff", fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: `0 4px 16px ${(PROGRAM_COLORS[s.program] || P.navy)}40` }}><MortgageCalcIcon size={18} variant="cream" /> Load in Calculator →</a>
                </div>
              );
            })()}

            {scenarios.length < 3 && (
              <div className="no-print" style={{ textAlign: "center", marginTop: 32 }}>
                <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>+ Add another scenario from the Calculator</a>
              </div>
            )}
          </>
        )}

        <p className="no-print" style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 40, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
          Scenarios are saved locally on this device only. Clearing your browser data will remove them. NMLS# 1119524.
        </p>

        {/* Print-only footer */}
        <div className="print-only" style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${P.creamDark}`, textAlign: "center", fontSize: 9, color: P.warmGrayLight, lineHeight: 1.6 }}>
          Educational only · Not a loan estimate or commitment to lend · Rates and terms subject to change · NMLS# 1119524 · Equal Housing Lender · mortgagegeek.ai
        </div>
      </div>
      <MobileToolbar />
    </div>
  );
}

function CashToClosePage() {
  // Tax reserves prepaid schedule by state — # of months collected based on closing month
  // From CL Guide National Taxes Matrix v32, defaulting to "all remaining" schedule
  // For 2/13 splits, use 13 (more conservative)

  const TAX_RESERVE_SCHEDULE = {
    TN: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    GA: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    MS: { 1:3, 2:4, 3:5, 4:6, 5:7, 6:8, 7:9, 8:10, 9:11, 10:12, 11:12, 12:2 },
    AR: { 1:12, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9, 11:10, 12:11 },
    KY: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    // ⚠ Auto-extracted, pending hand-verification
    AL: { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
    AZ: { 1:6, 2:2, 3:2, 4:5, 5:5, 6:5, 7:6, 8:7, 9:2, 10:3, 11:4, 12:5 },
    CA: { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:5, 11:5, 12:6 },
    CO: { 1:4, 2:5, 3:6, 4:2, 5:2, 6:3, 7:4, 8:5, 9:6, 10:2, 11:2, 12:3 },
    DE: { 1:7, 2:8, 3:9, 4:10, 5:11, 6:12, 7:13, 8:2, 9:3, 10:4, 11:5, 12:6 },
    FL: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:13, 11:3, 12:4 },
    HI: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:2, 8:3, 9:4, 10:5, 11:6, 12:1 },
    IA: { 1:7, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
    IL: { 1:7, 2:8, 3:9, 4:10, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
    IN: { 1:5, 2:6, 3:7, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:2, 11:3, 12:4 },
    KS: { 1:5, 2:6, 3:7, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:3, 12:4 },
    LA: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    MD: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:3 },
    MN: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:2, 10:3, 11:4, 12:5 },
    MO: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    NC: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    NE: { 1:3, 2:4, 3:5, 4:6, 5:7, 6:2, 7:3, 8:4, 9:5, 10:6, 11:7, 12:8 },
    NJ: { 1:2, 2:3, 3:4, 4:2, 5:3, 6:4, 7:2, 8:3, 9:4, 10:2, 11:3, 12:4 },
    NM: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9, 11:4, 12:5 },
    NV: { 1:2, 2:1, 3:2, 4:3, 5:4, 6:3, 7:3, 8:2, 9:2, 10:2, 11:2, 12:2 },
    OH: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:2, 7:3, 8:4, 9:5, 10:6, 11:7, 12:8 },
    OK: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:13, 12:13 },
    OR: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
    PA: { 1:11, 2:12, 3:13, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:9, 12:10 },
    SC: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    TX: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:13, 12:13 },
    UT: { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
    VA: { 1:3, 2:4, 3:5, 4:6, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:2 },
    WA: { 1:6, 2:7, 3:2, 4:3, 5:4, 6:5, 7:6, 8:2, 9:2, 10:3, 11:4, 12:5 },
    WI: { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    WV: { 1:7, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:3, 10:4, 11:5, 12:6 },
  };

  // Reasonable national fallback schedule for any state without verified data
  const FALLBACK_SCHEDULE = { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 };

  // States where the reserve schedule is an approximation (not from the CL Guide matrix).
  // These states are not covered by Davidson Homes Mortgage's title company reference,
  // so we apply the fallback pattern and disclose it to the user. If an authoritative
  // schedule becomes available, add the state to TAX_RESERVE_SCHEDULE and remove from here.
  const UNVERIFIED_RESERVES_STATES = new Set(["MA", "CT", "RI", "NH", "VT", "ME", "DC", "NY", "MI", "ND", "SD", "ID", "MT", "WY", "AK"]);

  // Metro-level reserve schedule overrides for sub-jurisdictions that run on different
  // tax collection calendars than the state default. When a metro is listed here, its
  // schedule is used instead of the state default. Verified from CL Guide Matrix v32.
  // Only populated for metros where data is confirmed. Southeast region verified.
  const METRO_RESERVE_OVERRIDES = {
    // TN: "Roane County and Kingsport, Jefferson, and Kingston Cities" use a different schedule (taxes due December)
    // The default "All remaining cities/counties" schedule applies everywhere else.
    // None of our current TN metros fall in the Roane/Kingsport subset, so no override needed yet.

    // GA: 4 distinct schedules across sub-jurisdictions
    GA: {
      // DeKalb and Newton Counties (taxes due Sep & Nov)
      "DeKalb County": { 1:11, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:6, 9:7, 10:8, 11:9, 12:10 },
      // Cobb, Fulton, Gwinnett, and Muscogee Counties (taxes due October)
      "Atlanta/Fulton":   { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      "Cobb County":      { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      "Gwinnett County":  { 1:6, 2:7, 3:8, 4:9, 5:10, 6:11, 7:12, 8:13, 9:2, 10:3, 11:4, 12:5 },
      // Cherokee, Forsyth fall into "Barrow, Bryan, Cherokee, Clayton..." (taxes due Nov)
      "Cherokee County":  { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
      "Forsyth County":   { 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:2, 11:3, 12:4 },
      // "All other counties" uses the "Coweta, Dougherty, Houston..." schedule (due Dec)
      "All other counties": { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13, 11:2, 12:3 },
    },

    // NC: 3 distinct schedules
    NC: {
      // Guilford County and Greensboro City (due August)
      "Guilford/Greensboro": { 1:8, 2:9, 3:10, 4:11, 5:12, 6:13, 7:2, 8:3, 9:4, 10:5, 11:6, 12:7 },
      // "All remaining counties/cities" default (due December) — what our current NC metros use
      // No override needed for Mecklenburg, Wake, Durham, Buncombe — they use the state default
    },

    // IL: Cook County has a different tax calendar (taxes due March/Sep) vs rest of state (June/Sep)
    IL: {
      "Cook/Chicago": { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:2, 9:2, 10:3, 11:4, 12:5 },
      // DuPage, Lake, Will, Kane, McHenry use the "all remaining" state default
    },

    // OH: 6+ sub-jurisdictions based on county tax due dates. Biggest metros get overrides.
    OH: {
      // Cuyahoga County/Cleveland (taxes due Dec/June)
      "Cuyahoga/Cleveland": { 1:4, 2:5, 3:6, 4:7, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:2, 12:3 },
      // Franklin County/Columbus (taxes due Jan/June)
      "Franklin/Columbus": { 1:3, 2:4, 3:5, 4:6, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:2 },
      // Hamilton County/Cincinnati (taxes due March/Aug, in Butler/Mahoning group)
      "Hamilton/Cincinnati": { 1:2, 2:2, 3:3, 4:4, 5:5, 6:6, 7:2, 8:2, 9:3, 10:4, 11:5, 12:6 },
      // Summit/Akron, Montgomery/Dayton, Lucas/Toledo are in the largest group (Feb/July) = state default
    },
  };

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const paramProgram = params.get("program");
  const paramRate = parseFloat(params.get("rate"));
  const [program, setProgram] = useState(["Conventional", "FHA", "VA"].includes(paramProgram) ? paramProgram : "Conventional");
  const [homePrice, setHomePrice] = useState(() => { const v = parseFloat(params.get("price")); return v > 0 ? v : 350000; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 5; });
  const [convRate, setConvRate] = useState(paramProgram === "Conventional" && paramRate > 0 ? paramRate : 6.75);
  const [fhaRate, setFhaRate] = useState(paramProgram === "FHA" && paramRate > 0 ? paramRate : 6.25);
  const [vaRate, setVaRate] = useState(paramProgram === "VA" && paramRate > 0 ? paramRate : 6.25);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [closeDate, setCloseDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const paramState = params.get("state");
  const paramMetro = params.get("metro");
  const [stateCode, setStateCode] = useState(paramState || "TN");
  const [taxMetro, setTaxMetro] = useState(paramMetro || "All other counties");
  const [totalCredits, setTotalCredits] = useState(0);
  const [waiveEscrows, setWaiveEscrows] = useState(false);
  const paramVaUsage = params.get("vaUsage");
  const [vaUsage, setVaUsage] = useState(["first", "subsequent", "exempt"].includes(paramVaUsage) ? paramVaUsage : "first");
  // Editable lender fees
  const [feeUnderwriting, setFeeUnderwriting] = useState(1500);
  const [feeProcessing, setFeeProcessing] = useState(750);
  const [feeAppraisal, setFeeAppraisal] = useState(() => program === "VA" ? 650 : program === "FHA" ? 550 : 600);
  const [feeCreditReport, setFeeCreditReport] = useState(300);
  const [feeFloodCert, setFeeFloodCert] = useState(15);
  const [feeTaxService, setFeeTaxService] = useState(80);
  // Discount points — synced dollar/pct fields
  const [discountPointsPct, setDiscountPointsPct] = useState(0);
  const [discountPointsDollar, setDiscountPointsDollar] = useState(0);
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  useEffect(() => { setFeeAppraisal(program === "VA" ? 650 : program === "FHA" ? 550 : 600); }, [program]);

  // Active rate switches with selected program
  const rate = program === "Conventional" ? convRate : program === "FHA" ? fhaRate : vaRate;
  const setRate = (v) => {
    if (program === "Conventional") setConvRate(v);
    else if (program === "FHA") setFhaRate(v);
    else setVaRate(v);
  };

  const roundRate = (r) => Math.round(r / 0.125) * 0.125;

  // Fetch live MND rates on mount. Sets rateLoading=true during fetch,
  // rateLoading=false + ratesLoaded=true + rateSource=date when complete.
  useEffect(() => {
    (async () => {
      setRateLoading(true);
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success && data.rates) {
          const find = (label) => data.rates.find((r) => r.label.toLowerCase().includes(label));
          const conv30 = find("30-year fixed");
          const fha = find("fha");
          const va = find("va");
          if (conv30 && !(paramProgram === "Conventional" && paramRate > 0)) setConvRate(roundRate(parseFloat(conv30.rate)));
          if (fha && !(paramProgram === "FHA" && paramRate > 0)) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va && !(paramProgram === "VA" && paramRate > 0)) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today");
          setRatesLoaded(true);
        }
      } catch (e) { /* fail silently, use defaults */ }
      setRateLoading(false);
    })();
  }, []);

  // Eligibility check: minimum down payment per program
  const minDown = program === "Conventional" ? 3 : program === "FHA" ? 3.5 : 0;
  const isEligible = downPct >= minDown;

  // Auto-HOI from price × 0.35% (matches calculator)
  const insuranceAnnual = Math.round(homePrice * 0.0035);

  // Auto-update tax rate when state/metro changes
  const hasMetros = !!CASH_STATE_METROS[stateCode];
  const taxRate = hasMetros
    ? (CASH_STATE_METROS[stateCode]?.metros?.[taxMetro] ?? CASH_STATE_DEFAULT_TAX_RATES[stateCode] ?? 0.008)
    : (CASH_STATE_DEFAULT_TAX_RATES[stateCode] ?? 0.008);
  const taxAnnual = Math.round(homePrice * taxRate);

  // Reset metro to default when state changes
  useEffect(() => { setTaxMetro("All other counties"); }, [stateCode]);

  const downAmt = homePrice * (downPct / 100);
  const baseLoan = Math.max(homePrice - downAmt, 0);

  const handlePointsPctChange = (v) => { setDiscountPointsPct(v); setDiscountPointsDollar(Math.round(baseLoan * (v / 100))); };
  const handlePointsDollarChange = (v) => { setDiscountPointsDollar(v); setDiscountPointsPct(baseLoan > 0 ? Math.round((v / baseLoan) * 100000) / 1000 : 0); };

  // Upfront fees (financed)
  let upfrontFee = 0, upfrontLabel = "";
  if (program === "FHA") { upfrontFee = baseLoan * 0.0175; upfrontLabel = "UFMIP (1.75%)"; }
  if (program === "VA") {
    if (vaUsage === "exempt") { upfrontFee = 0; }
    else {
      const feeRate = vaUsage === "first" ? (downPct < 5 ? 2.15 : downPct < 10 ? 1.5 : 1.25) : (downPct < 5 ? 3.3 : downPct < 10 ? 1.5 : 1.25);
      upfrontFee = baseLoan * (feeRate / 100);
      upfrontLabel = `VA Funding Fee (${feeRate}%)`;
    }
  }
  const totalLoan = baseLoan + upfrontFee;

  // Lender fees (editable)
  const underwriting = feeUnderwriting, processing = feeProcessing;
  const appraisal = feeAppraisal;
  const creditReport = feeCreditReport, floodCert = feeFloodCert, taxService = feeTaxService;
  const lenderTotal = underwriting + processing + appraisal + creditReport + floodCert + taxService + discountPointsDollar;

  // Title & Escrow — rates approximated from First American filed schedules for our 5 states
  // Lender's title: tiered rate, declines as loan amount grows (industry standard)
  // Roughly: $5/$1k on first $100k, $4/$1k on next $400k, $3/$1k above $500k
  const calcLendersTitle = (loan) => {
    if (loan <= 0) return 0;
    let total = 0;
    const tier1 = Math.min(loan, 100000);
    total += tier1 * 0.005;
    if (loan > 100000) {
      const tier2 = Math.min(loan - 100000, 400000);
      total += tier2 * 0.004;
    }
    if (loan > 500000) {
      const tier3 = loan - 500000;
      total += tier3 * 0.003;
    }
    return Math.max(250, total);
  };
  // Owner's title: similar tiered structure, slightly higher (covers full equity not just loan)
  const calcOwnersTitle = (price) => {
    if (price <= 0) return 0;
    let total = 0;
    const tier1 = Math.min(price, 100000);
    total += tier1 * 0.0058;
    if (price > 100000) {
      const tier2 = Math.min(price - 100000, 400000);
      total += tier2 * 0.0048;
    }
    if (price > 500000) {
      const tier3 = price - 500000;
      total += tier3 * 0.0038;
    }
    return Math.max(300, total);
  };
  const lendersTitle = calcLendersTitle(baseLoan);
  const ownersTitle = calcOwnersTitle(homePrice);
  const settlementFee = 500;
  const titleSearch = 200;
  const recordingFee = 125;
  const wireNotary = 75;
  const titleTotal = lendersTitle + ownersTitle + settlementFee + titleSearch + recordingFee + wireNotary;

  // Transfer taxes by state — buyer's portion only
  // TN: $0.37/$100 of value, paid by buyer (Tennessee Realty Transfer Tax)
  // GA: $1.00/$1000, paid by SELLER (no buyer impact for purchase)
  // MS: No state transfer tax
  // AR: $3.30/$1000, typically split or paid by buyer
  // KY: $0.50/$500 ($1.00/$1000), paid by SELLER
  let transferTax = 0, transferTaxNote = "";
  if (stateCode === "TN") { transferTax = homePrice * 0.0037; transferTaxNote = "TN Realty Transfer Tax: $0.37 per $100 of value"; }
  else if (stateCode === "GA") { transferTax = homePrice * 0.001; transferTaxNote = "GA Real Estate Transfer Tax: $1.00 per $1,000 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract)"; }
  else if (stateCode === "MS") { transferTax = 0; transferTaxNote = "Mississippi has no state transfer tax"; }
  else if (stateCode === "AR") { transferTax = homePrice * 0.0033; transferTaxNote = "AR Real Estate Transfer Tax: $3.30 per $1,000 of value"; }
  else if (stateCode === "KY") { transferTax = homePrice * 0.001; transferTaxNote = "KY Real Estate Transfer Tax: $0.50 per $500 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract)"; }
  else if (stateCode === "AL") { transferTax = baseLoan * 0.0015; transferTaxNote = "AL Mortgage Recording Tax: $0.15 per $100 of loan amount (buyer pays). Deed transfer tax of $0.50 per $500 is customarily paid by seller."; }
  else if (stateCode === "FL") { transferTax = baseLoan * 0.002; transferTaxNote = "FL Intangible Tax on Mortgage: $2.00 per $1,000 of loan (buyer pays). Documentary stamps on deed ($0.70 per $100 of price) are customarily paid by seller — Miami-Dade rate differs."; }
  else if (stateCode === "NC") { transferTax = homePrice * 0.002; transferTaxNote = "NC Excise Tax: $1.00 per $500 of value (customarily paid by seller, but shown here as buyer cost — confirm with your contract). 7 NC counties add a local 1% land transfer tax."; }
  else if (stateCode === "SC") { transferTax = homePrice * 0.0037; transferTaxNote = "SC Deed Recording Fee: $1.85 per $500 of value ($1.30 state + $0.55 county). Customarily paid by seller, but shown here as buyer cost — confirm with your contract."; }
  else if (stateCode === "VA") { transferTax = (homePrice * 0.0025) + (baseLoan * 0.0025); transferTaxNote = "VA State Recordation Tax: $0.25 per $100 of price (buyer/grantee pays) + $0.25 per $100 of loan amount (buyer pays mortgage tax). Grantor tax of $0.50 per $500 is paid by seller."; }
  else if (stateCode === "WV") { transferTax = homePrice * 0.0022; transferTaxNote = "WV Excise Tax: $1.10 per $500 of value (customarily paid by seller per WV Code §11-22-2, but shown here as buyer cost — confirm with your contract)."; }
  else if (stateCode === "MD") { transferTax = homePrice * 0.0075; transferTaxNote = "MD Transfer + Recordation Taxes: ~1.5% total (state 0.5% + county 0.5-1.5% + recordation 0.5-1.4%). Customarily split 50/50 between buyer and seller — ~0.75% shown as buyer's share. Baltimore City highest (~3% total). First-time MD homebuyers: state portion paid by seller."; }
  else if (stateCode === "DE") { transferTax = homePrice * 0.02; transferTaxNote = "DE Realty Transfer Tax: 4% total (2% state + up to 2% county/city), customarily split 50/50 — 2% shown as buyer's share. First-time DE buyers may qualify for a credit reducing rate by 0.5% (up to $2,000 on first $400k)."; }
  else if (stateCode === "NJ") { transferTax = homePrice >= 1000000 ? homePrice * 0.01 : 0; transferTaxNote = homePrice >= 1000000 ? "NJ Mansion Tax: 1% on properties $1M+ (buyer pays). Realty Transfer Fee (~0.4-0.6%) is paid by seller." : "NJ Realty Transfer Fee is paid by seller on the full sale. Buyer only pays the 1% 'Mansion Tax' on properties $1M or more — this purchase is below that threshold."; }
  else if (stateCode === "PA") { transferTax = homePrice * 0.01; transferTaxNote = "PA Realty Transfer Tax: 2% total (1% state + 1% local), customarily split 50/50 — 1% shown as buyer's share. Pittsburgh (5% total) and Philadelphia (4.578% total, effective July 2025) are much higher. Philadelphia adds a $256.75 deed recording fee."; }
  else if (stateCode === "DC") { transferTax = homePrice * 0.0145; transferTaxNote = "DC Recordation Tax (buyer pays): 1.45% on prices $400k+, 1.10% below. Seller separately pays a 1.45% (or 1.10%) transfer tax. First-time DC buyers may qualify for a reduced 0.725% recordation tax (income limits apply, max price $777k as of 10/1/25)."; }
  else if (stateCode === "NY") { transferTax = baseLoan * 0.018; transferTaxNote = "NY Mortgage Recording Tax (buyer pays): ~1.8% on loan amount. NYC rate is ~1.925%. State transfer tax of 0.4% is paid by seller; NYC adds RPTT 1-2.625% also typically seller-paid. Mansion tax (buyer) 1-3.9% on homes $1M+."; }
  else if (stateCode === "MA") { transferTax = 0; transferTaxNote = "MA Excise Tax: $2.28 per $500 of value (~0.456%), paid entirely by seller. Buyer owes no state transfer tax in Massachusetts."; }
  else if (stateCode === "CT") { transferTax = 0; transferTaxNote = "CT Conveyance Tax: 0.75% (under $800k) / 1.25% ($800k–$2.5M) / 2.25% (over $2.5M) + 0.25–0.5% municipal. Paid entirely by seller. Buyer owes no state conveyance tax in Connecticut."; }
  else if (stateCode === "RI") { transferTax = 0; transferTaxNote = "RI Real Estate Conveyance Tax: $2.30 per $500 of value (~0.46%), $4.60/$500 over $800k. Paid entirely by seller. Buyer owes no state conveyance tax in Rhode Island."; }
  else if (stateCode === "NH") { transferTax = homePrice * 0.0075; transferTaxNote = "NH Real Estate Transfer Tax: $0.75 per $100 of value (0.75% on buyer). NH is unique — both buyer and seller each pay the full 0.75% separately, effectively a 1.5% total tax on the transaction."; }
  else if (stateCode === "VT") {
    // Primary residence assumed: 0.5% on first $100k + 1.45% above
    const first100k = Math.min(homePrice, 100000);
    const above100k = Math.max(homePrice - 100000, 0);
    transferTax = (first100k * 0.005) + (above100k * 0.0145);
    transferTaxNote = "VT Property Transfer Tax (buyer pays): 0.5% on first $100k + 1.45% on remainder (primary residence). Non-primary residences: flat 1.45%. VT also charges a 0.2% Clean Water Surcharge on most transfers.";
  }
  else if (stateCode === "ME") {
    // 0.44% split 50/50 = 0.22% buyer. Luxury tier over $1M effective 11/1/25
    const standard = Math.min(homePrice, 1000000) * 0.0022;
    const luxury = Math.max(homePrice - 1000000, 0) * 0.006; // $6/$500 over $1M, split 50/50 = 0.6%
    transferTax = standard + luxury;
    transferTaxNote = "ME Real Estate Transfer Tax: $2.20 per $500 of value (~0.44%), split 50/50 between buyer and seller — 0.22% shown as buyer's share. Effective Nov 1, 2025: $6.00/$500 (~1.2%) applies to the portion above $1M (0.6% buyer's share).";
  }
  else if (stateCode === "CO") { transferTax = homePrice * 0.0001; transferTaxNote = "CO Documentary Fee: $0.01 per $100 of value (0.01%). Colorado has no state transfer tax (blocked by TABOR in 1992). Some resort municipalities (Aspen, Vail, Breckenridge, Crested Butte, Telluride) charge additional local transfer taxes of up to 2% — confirm with your agent if purchasing in those areas."; }
  else if (stateCode === "UT") { transferTax = 0; transferTaxNote = "Utah has no state or local real estate transfer tax."; }
  else if (stateCode === "NM") { transferTax = 0; transferTaxNote = "New Mexico has no state real estate transfer tax."; }
  else if (stateCode === "AZ") { transferTax = 2; transferTaxNote = "AZ Transfer Fee: flat $2 per transaction (essentially zero). Arizona has no percentage-based state transfer tax."; }
  else if (stateCode === "NV") {
    // Clark County (Vegas) higher rate ~0.51%, other counties ~0.39%. Seller pays.
    const isClark = taxMetro === "Clark/Las Vegas";
    transferTax = isClark ? homePrice * 0.0051 : homePrice * 0.0039;
    transferTaxNote = `NV Real Property Transfer Tax: ~${isClark ? "0.51%" : "0.39%"} in ${isClark ? "Clark County (Vegas/Henderson)" : "counties outside Clark"}. Customarily paid by seller, but shown here as buyer cost — confirm with your contract.`;
  }
  else if (stateCode === "ID") { transferTax = 0; transferTaxNote = "Idaho has no state real estate transfer tax."; }
  else if (stateCode === "MT") { transferTax = 0; transferTaxNote = "Montana has no state real estate transfer tax."; }
  else if (stateCode === "WY") { transferTax = 0; transferTaxNote = "Wyoming has no state real estate transfer tax."; }
  else if (stateCode === "IL") {
    // Chicago: buyer pays the 1.05% CTA portion of the city tax. Elsewhere: seller pays everything.
    const isChicago = taxMetro === "Cook/Chicago";
    transferTax = isChicago ? homePrice * 0.0105 : 0;
    transferTaxNote = isChicago
      ? "Chicago Real Property Transfer Tax: buyer pays the $3.75 per $500 CTA portion (1.05% of price). Seller pays the $3.00 per $500 city portion + state $0.50/$500 + Cook County $0.25/$500. Total Chicago transfer tax is ~1.50%."
      : "IL Real Estate Transfer Tax: $0.50 per $500 state (~0.10%) + $0.25 per $500 county. Customarily paid entirely by seller outside of Chicago. Some municipalities add their own tax.";
  }
  else if (stateCode === "IN") { transferTax = 0; transferTaxNote = "Indiana has no state real estate transfer tax."; }
  else if (stateCode === "OH") { transferTax = 0; transferTaxNote = "OH Conveyance Fee: $1.00 per $1,000 state + up to $3.00 per $1,000 county (~0.10-0.40% total). Customarily paid entirely by seller."; }
  else if (stateCode === "MI") { transferTax = 0; transferTaxNote = "MI Real Estate Transfer Tax: $3.75 per $500 state + $0.55 per $500 county (~0.86% total). Customarily paid entirely by seller per MCL 207.523."; }
  else if (stateCode === "WI") { transferTax = 0; transferTaxNote = "WI Real Estate Transfer Fee: $0.30 per $100 of value (~0.30%). Paid entirely by seller per Wisconsin statute — buyer owes no transfer fee."; }
  else if (stateCode === "MN") { transferTax = baseLoan * 0.0023; transferTaxNote = "MN Mortgage Registry Tax (buyer pays): 0.23% of loan amount. Separately, sellers pay a Deed Tax of 0.33% on the sale price. Hennepin and Ramsey counties add a 0.01% Environmental Response Fund Tax."; }
  else if (stateCode === "TX") { transferTax = 0; transferTaxNote = "Texas has no state real estate transfer tax. Buyers owe only standard recording fees (typically $30-50)."; }
  else if (stateCode === "LA") {
    // New Orleans: $325 flat documentary tax
    const isNOLA = taxMetro === "Orleans/New Orleans";
    transferTax = isNOLA ? 325 : 0;
    transferTaxNote = isNOLA
      ? "New Orleans Documentary Transaction Tax: flat $325 fee on all Orleans Parish transfers. Louisiana has no state-level transfer tax."
      : "Louisiana has no state real estate transfer tax. New Orleans charges a $325 flat documentary tax; other parishes do not.";
  }
  else if (stateCode === "OK") { transferTax = 0; transferTaxNote = "OK Documentary Stamp Tax: $0.75 per $500 of value (~0.15%). Customarily paid entirely by seller."; }
  else if (stateCode === "KS") { transferTax = 0; transferTaxNote = "Kansas has no state real estate transfer tax. The KS Mortgage Registration Tax was phased out in 2019 and is no longer charged."; }
  else if (stateCode === "NE") { transferTax = 0; transferTaxNote = "NE Documentary Stamp Tax: $2.25 per $1,000 of value (~0.225%). Customarily paid entirely by seller."; }
  else if (stateCode === "IA") { transferTax = Math.max(0, (homePrice - 500) * 0.0016); transferTaxNote = "IA Real Estate Transfer Tax: $0.80 per $500 of value (~0.16%), with the first $500 exempt. Buyer customarily pays per Iowa convention, though this is negotiable in the purchase contract."; }
  else if (stateCode === "MO") { transferTax = 0; transferTaxNote = "Missouri has no state real estate transfer tax. Buyers owe only standard recording fees."; }
  else if (stateCode === "ND") { transferTax = 0; transferTaxNote = "North Dakota has no state real estate transfer tax."; }
  else if (stateCode === "SD") { transferTax = 0; transferTaxNote = "SD Real Estate Transfer Fee: $0.50 per $500 of value (~0.10%). Customarily paid entirely by seller."; }
  else if (stateCode === "HI") { transferTax = 0; transferTaxNote = "HI Conveyance Tax: tiered 0.10%-1.00% for owner-occupants and 0.15%-1.25% for non-owner-occupants. Customarily paid entirely by seller. Rates increase for higher-value properties — sub-$600k properties are taxed at the lowest 0.10% tier."; }
  else if (stateCode === "AK") { transferTax = 0; transferTaxNote = "Alaska has no state real estate transfer tax. Some municipalities may charge small recording fees but no transfer tax."; }
  else if (stateCode === "OR") { transferTax = 0; transferTaxNote = "Oregon has no statewide real estate transfer tax. Washington County (which includes Beaverton and parts of Portland metro) charges a local transfer tax of 0.1% — confirm with your closing agent if purchasing there."; }
  else if (stateCode === "WA") { transferTax = 0; transferTaxNote = "WA Real Estate Excise Tax (REET): graduated state rate 1.1% (up to $525k) / 1.28% ($525k-$1.525M) / 2.75% ($1.525M-$3.025M) / 3.0% (over $3.025M), plus local REET ~0.5%. Paid by seller per RCW 82.45, though buyer is technically liable if seller doesn't pay. Combined rate typically 1.6% to 3.5%+ on the sale price."; }
  else if (stateCode === "CA") {
    // CA: county base 0.11% (seller pays). City taxes vary wildly.
    // SoCal convention: seller pays everything → buyer $0
    // NorCal convention (Oakland, Berkeley, etc.): city tax split 50/50 → buyer pays half
    // San Francisco: seller pays entire amount (unique full-seller-pays SF convention)
    // LA City with Mansion Tax: ULA 4%/5.5% on high-value sales
    const m = taxMetro;
    if (m === "Oakland") {
      // Oakland Measure U tiered: 1.0% ≤$300k, 1.5% ≤$2M, 1.75% ≤$5M, 2.5% >$5M. Split 50/50.
      const rate = homePrice <= 300000 ? 0.01 : homePrice <= 2000000 ? 0.015 : homePrice <= 5000000 ? 0.0175 : 0.025;
      transferTax = homePrice * rate * 0.5; // buyer's half
      transferTaxNote = `Oakland Real Property Transfer Tax: tiered ${(rate*100).toFixed(2)}% for this price range. Per NorCal convention, city transfer tax is split 50/50 between buyer and seller — buyer's half shown. Seller also pays the 0.11% county base tax. First-time low/moderate-income buyers may get 0.5% discount.`;
    } else if (m === "Berkeley") {
      // Berkeley: 1.5% ≤$1.5M, 2.5% >$1.5M. Split 50/50.
      const rate = homePrice <= 1500000 ? 0.015 : 0.025;
      transferTax = homePrice * rate * 0.5;
      transferTaxNote = `Berkeley Real Property Transfer Tax: ${(rate*100).toFixed(1)}% (${homePrice <= 1500000 ? "sales ≤$1.5M" : "sales >$1.5M"}). Per NorCal convention, city tax is split 50/50 — buyer's half shown. Measure W will raise rates on $1.6M+ transfers effective January 2027.`;
    } else if (m === "LA City Mansion Tax ($5.3M+)") {
      // LA City ULA: 4% on $5.3M-$10.6M, 5.5% on $10.6M+. Base 0.45% applies to all.
      // Seller pays per SoCal convention, but at this price point borrowers often ask about it.
      const ulaRate = homePrice >= 10600000 ? 0.055 : homePrice >= 5300000 ? 0.04 : 0;
      const ulaTax = homePrice * ulaRate;
      transferTax = 0; // SoCal: seller pays
      transferTaxNote = homePrice >= 5300000
        ? `LA City Measure ULA "Mansion Tax" applies: ${(ulaRate*100).toFixed(1)}% on this sale (~${fmt(ulaTax)}) plus 0.45% base city tax plus 0.11% county tax. Per SoCal convention, all transfer taxes are paid by the seller — shown as $0 to buyer. Thresholds adjust annually; effective 7/1/26 thresholds become $5.4M/$10.9M.`
        : `LA City Mansion Tax threshold is $5,300,000. This sale is below the ULA threshold — only the 0.45% base city tax + 0.11% county tax apply (total ~0.56%). Per SoCal convention, all transfer taxes are paid by the seller — shown as $0 to buyer.`;
    } else if (m === "San Francisco City") {
      transferTax = 0;
      transferTaxNote = "San Francisco Real Property Transfer Tax: tiered 0.25%-6.00% (0.5% ≤$250k, 0.68% to $1M, 0.75% to $5M, 2.25% to $10M, 2.75% to $25M, 3.0% >$25M). Paid entirely by seller per SF convention. SF has no county-level transfer tax (the city rate includes it).";
    } else if (["Los Angeles City (≤$5.3M)", "Santa Monica", "Culver City", "Beverly Hills", "Pasadena (LA County)", "Long Beach", "LA County (other cities)", "San Diego County", "Orange County", "Riverside County", "San Bernardino County", "Ventura County", "Sacramento County", "Fresno County"].includes(m)) {
      transferTax = 0;
      transferTaxNote = "CA County Documentary Transfer Tax: $1.10 per $1,000 of value (0.11%). Per Southern California convention, transfer taxes are paid entirely by the seller — shown as $0 to buyer. Some cities (Santa Monica $3/$1k, Culver City tiered 0.45%-4%, Los Angeles 0.45% + ULA) add their own taxes, also seller-paid.";
    } else {
      // Northern CA default (non-SF, non-Oakland/Berkeley): county tax split 50/50
      transferTax = homePrice * 0.00055; // half of 0.11%
      transferTaxNote = "CA County Documentary Transfer Tax: $1.10 per $1,000 of value (0.11%). Per Northern California convention, the county tax is commonly split 50/50 between buyer and seller — buyer's half (0.055%) shown. Any city-specific transfer taxes follow local custom.";
    }
  }
  else { transferTax = 0; transferTaxNote = `⚠️ Transfer tax for ${stateCode} not yet verified — confirm with your closing attorney. This estimate currently excludes any state-level transfer tax.`; }

  // Mortgage recording tax (TN has one!)
  let mortgageTax = 0;
  if (stateCode === "TN") { mortgageTax = Math.max(0, (baseLoan - 2000) * 0.00115); } // $0.115/$100 over $2k

  // Prepaids
  const insurancePrepaid = insuranceAnnual; // 12 months upfront
  // Daily interest from close date to end of month
  const closeDateObj = new Date(closeDate + "T00:00:00");
  const daysInMonth = new Date(closeDateObj.getFullYear(), closeDateObj.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - closeDateObj.getDate() + 1;
  const dailyInterest = (totalLoan * (rate / 100)) / 365;
  const prepaidInterest = dailyInterest * daysRemaining;
  const prepaidsTotal = insurancePrepaid + prepaidInterest;

  // Reserves (escrow setup)
  // Tax reserves: based on state-specific schedule by closing month
  const closingMonth = closeDateObj.getMonth() + 1; // 1-12
  // Tax reserve lookup: metro override first, then state default, then fallback
  const metroOverride = METRO_RESERVE_OVERRIDES[stateCode]?.[taxMetro];
  const taxReserveMonths = metroOverride?.[closingMonth]
    ?? TAX_RESERVE_SCHEDULE[stateCode]?.[closingMonth]
    ?? FALLBACK_SCHEDULE[closingMonth];
  const usingMetroSchedule = !!metroOverride;
  const rawTaxReserves = (taxAnnual / 12) * taxReserveMonths;
  const rawInsuranceReserves = (insuranceAnnual / 12) * 3;
  // Escrow waiver eligibility: Conventional with 20%+ down
  const canWaiveEscrows = program === "Conventional" && downPct >= 20;
  const escrowsWaived = canWaiveEscrows && waiveEscrows;
  const taxReserves = escrowsWaived ? 0 : rawTaxReserves;
  const insuranceReserves = escrowsWaived ? 0 : rawInsuranceReserves;
  const reservesTotal = taxReserves + insuranceReserves;

  // Totals
  const closingCostsExFee = lenderTotal + titleTotal + transferTax + mortgageTax + prepaidsTotal + reservesTotal;
  const closingCostsIncFee = closingCostsExFee + upfrontFee;
  const cashToClose = downAmt + closingCostsExFee - totalCredits;

  // APR calculation per Reg Z §1026.22 (actuarial method) and §1026.4(b)(5).
  // Prepaid finance charges (paid at closing or financed):
  //   - Lender fees (origination, underwriting, processing, credit, flood, tax service, appraisal)
  //   - Upfront MI (UFMIP for FHA, VA Funding Fee — these ARE finance charges)
  //   - Prepaid interest from closing date to month end
  // NOT included: title fees (borrower can shop), recording, transfer taxes,
  //   homeowner's insurance, tax/insurance escrows. Per Reg Z Appendix J.
  const aprFinanceCharges = lenderTotal + upfrontFee + prepaidInterest;

  // Monthly MI is also a finance charge for the period it is required (Reg Z §1026.4(b)(5)).
  // FHA <10% down: MI for life of loan (all 360 months on a 30-year)
  // FHA 10%+ down: MI for 11 years (132 months)
  // Conv with PMI: MI until 78% LTV reached. Estimate ~120 months conservatively for APR purposes.
  //   (Actual cancellation depends on amortization and is borrower-requested at 80% LTV.)
  // VA: no monthly MI ever.
  let aprMonthlyMI = 0;
  let aprMiMonths = 0;
  if (program === "FHA") {
    // FHA monthly MIP rate: 0.55% if <5% down, 0.50% if 5%+ down (matches our standard)
    const fhaMipRate = downPct < 5 ? 0.0055 : 0.0050;
    aprMonthlyMI = (baseLoan * fhaMipRate) / 12;
    aprMiMonths = downPct < 10 ? term * 12 : 132; // life of loan vs 11 years
  } else if (program === "Conventional" && downPct < 20) {
    // Conv PMI: tiered by down payment (matches calculator logic)
    const convPmiRate = downPct < 5 ? 0.0052 : downPct < 10 ? 0.0037 : 0.0027;
    aprMonthlyMI = (baseLoan * convPmiRate) / 12;
    aprMiMonths = 120; // ~10 years to 78% LTV at typical amortization
  }
  // VA: aprMonthlyMI stays 0

  const estimatedAPR = calculateAPR(totalLoan, aprFinanceCharges, rate, term, aprMonthlyMI, aprMiMonths);

  const PROG_COLOR = { Conventional: PROGRAM_COLORS.Conventional, FHA: PROGRAM_COLORS.FHA, VA: PROGRAM_COLORS.VA }[program];
  // Section header color: gold for Conv/VA (adds contrast against navy/sage subtotal pills),
  // navy for FHA (gold subtotal pills already contrast against the page, so navy headers stay clean)
  const headerColor = program === "FHA" ? P.navy : P.gold;

  const Row = ({ label, val, sub, bold, color, italic, subtotal }) => (
    <div style={{
      display: "flex", justifyContent: "space-between",
      padding: subtotal ? "10px 14px" : "7px 0",
      fontSize: sub ? 12 : subtotal ? 14 : 13,
      borderBottom: subtotal ? "none" : `1px solid ${P.cream}`,
      background: subtotal ? PROG_COLOR : "transparent",
      borderRadius: subtotal ? 6 : 0,
      marginTop: subtotal ? 6 : 0,
      marginBottom: subtotal ? 4 : 0,
    }}>
      <span style={{ color: subtotal ? "rgba(255,255,255,0.85)" : P.warmGray, fontStyle: italic ? "italic" : "normal", paddingLeft: sub ? 12 : 0, fontWeight: subtotal ? 700 : 400, textTransform: subtotal ? "uppercase" : "none", letterSpacing: subtotal ? 0.5 : 0, fontSize: subtotal ? 11 : "inherit" }}>{label}</span>
      <span style={{ fontWeight: bold || subtotal ? 700 : 600, color: subtotal ? "#fff" : (color || P.text), fontSize: subtotal ? 16 : "inherit" }}>{val}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .ctc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 600px) { .ctc-grid { grid-template-columns: 1fr; } }
        .ctc-loc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 600px) { .ctc-loc-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20cash%20to%20close%20simulator%20and%20had%20a%20question." style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>The Bottom Line</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            Cash to Close Simulator
            <CashToCloseIcon size={38} variant="navy" />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 520, margin: "0 auto" }}>Estimate exactly how much money you'll need at the closing table — down payment, closing costs, prepaids, reserves, and credits.</p>
        </div>

        {/* Inputs */}
        <div className="content-card" style={{ padding: 24, marginBottom: 16 }}>
          {/* Program selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>Loan Program</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["Conventional", "FHA", "VA"].map(p => (
                <button key={p} onClick={() => setProgram(p)} style={{
                  flex: 1, padding: "11px 0", borderRadius: 8, border: "none",
                  background: program === p ? PROGRAM_COLORS[p] : P.creamDark,
                  color: program === p ? "#fff" : P.warmGray,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body, transition: "all 0.15s",
                }}>{p}</button>
              ))}
            </div>
          </div>

          <div className="ctc-grid">
            <CalcInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} comma />
            <CalcInput label="Down Payment %" value={downPct} onChange={setDownPct} suffix="%" step={0.5} min={0} max={100} />
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Term</label>
              <div style={{ display: "flex", gap: 4 }}>
                {[15, 30].map((t) => (
                  <button key={t} onClick={() => setTerm(t)} className={`tab-btn ${term === t ? "tab-btn-active" : ""}`} style={{ flex: 1, padding: "11px 0", fontSize: 14 }}>{t} yr</button>
                ))}
              </div>
            </div>
            <div>
              <RateInput label={`${program} Rate${ratesLoaded ? " · Live" : ""}`} rate={rate} setRate={setRate} color={PROG_COLOR} />
              {rateLoading && (
                <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 4, fontWeight: 500, fontStyle: "italic" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: P.warmGrayLight, marginRight: 6, verticalAlign: "middle", animation: "rate-pulse 1.2s ease-in-out infinite" }} />
                  Loading today's rates...
                </p>
              )}
              {!rateLoading && ratesLoaded && (
                <p style={{ fontSize: 10, color: P.sage, marginTop: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.sage, display: "inline-block" }} />
                  Live · {rateSource || "today"}
                </p>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Estimated Close Date</label>
              <input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", minWidth: 0, WebkitAppearance: "none" }} />
            </div>
          </div>
          <div className="ctc-loc-grid" style={{ marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>State</label>
              <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                {ALL_STATES_LIST.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            {hasMetros ? (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>County / Metro Area</label>
                <select value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                  {Object.entries(CASH_STATE_METROS[stateCode]?.metros || {}).map(([name, r]) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>Property Tax Rate</label>
                <div style={{ width: "100%", border: `1px dashed ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "11px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.warmGray }}>
                  Statewide avg ({(taxRate * 100).toFixed(2)}%)
                </div>
              </div>
            )}
          </div>
          <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 4, fontStyle: "italic" }}>
            Auto-calculated: HOI {fmt(insuranceAnnual)}/yr (0.35% of price) · Property tax {fmt(taxAnnual)}/yr ({(taxRate * 100).toFixed(2)}%)
          </p>

          {program === "VA" && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 5 }}>VA Eligibility</label>
              <select value={vaUsage} onChange={(e) => setVaUsage(e.target.value)} style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none" }}>
                <option value="first">First-Time Use</option>
                <option value="subsequent">Subsequent Use</option>
                <option value="exempt">Exempt (Disability)</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        {!isEligible ? (
          <div className="content-card" style={{ padding: "40px 32px", textAlign: "center", marginBottom: 16, overflow: "hidden" }}>
            <div style={{ background: P.warmGrayLight, margin: "-40px -32px 24px", padding: "24px", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{program}</span>
              <span style={{ fontFamily: F.display, fontSize: 30, color: "#fff" }}>Ineligible</span>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: P.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
            </div>
            <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 8 }}>Minimum {minDown}% Down Required</h3>
            <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
              {program} loans require a minimum down payment of <strong>{minDown}%</strong> ({fmt(homePrice * (minDown / 100))} on a {fmt(homePrice)} home). Increase your down payment or pick a different loan program above to see your cash to close estimate.
            </p>
          </div>
        ) : (
        <div className="content-card" style={{ overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: PROG_COLOR, padding: "24px 20px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{program} · Estimated Cash to Close</span>
            <span style={{ fontFamily: F.display, fontSize: 44, color: "#fff" }}>{fmt(cashToClose)}</span>
            <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Closing on {new Date(closeDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>

          <div style={{ padding: "20px 24px" }}>
            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 4 }}>Loan Amount</h3>
            <Row label="Base Loan Amount" val={fmt(baseLoan)} />
            {upfrontFee > 0 && <Row label={`+ ${upfrontLabel}`} val={fmt(upfrontFee)} sub italic />}
            <Row label="Total Loan (financed)" val={fmt(totalLoan)} bold color={PROG_COLOR} />

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Lender Fees <span style={{ fontSize: 10, fontWeight: 400, color: P.warmGrayLight }}>(editable)</span></h3>
            <CalcInput label="Underwriting" value={feeUnderwriting} onChange={setFeeUnderwriting} prefix="$" step={50} comma />
            <CalcInput label="Processing" value={feeProcessing} onChange={setFeeProcessing} prefix="$" step={50} comma />
            <CalcInput label="Appraisal" value={feeAppraisal} onChange={setFeeAppraisal} prefix="$" step={25} comma />
            <CalcInput label="Credit Report" value={feeCreditReport} onChange={setFeeCreditReport} prefix="$" step={25} comma />
            <CalcInput label="Flood Certification" value={feeFloodCert} onChange={setFeeFloodCert} prefix="$" step={5} />
            <CalcInput label="Tax Service" value={feeTaxService} onChange={setFeeTaxService} prefix="$" step={10} />

            {/* Discount Points */}
            <div style={{ marginTop: 10, padding: "12px 14px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: P.text }}>Discount Points</span>
                <button onClick={() => setShowPointsInfo(!showPointsInfo)} style={{ background: "none", border: "none", fontSize: 11, color: P.sage, fontWeight: 600, cursor: "pointer", fontFamily: F.body, textDecoration: "underline" }}>{showPointsInfo ? "Hide info ↑" : "What are points? ↓"}</button>
              </div>
              {showPointsInfo && (
                <div style={{ marginBottom: 12, padding: "12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray, marginBottom: 8 }}>
                    <strong style={{ color: P.navy }}>Discount points</strong> are upfront fees paid to the lender at closing to "buy down" your interest rate. Each point costs <strong>1% of the loan amount</strong> (e.g., 1 point on a $300,000 loan = $3,000).
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray, marginBottom: 8 }}>
                    Points are a trade-off: <strong>more cash upfront = lower monthly payment</strong>. Whether points make sense depends on how long you keep the loan. The "break-even" point is typically 4–7 years — if you sell or refinance before then, you may not recoup the upfront cost.
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray }}>
                    Common increments: 0.125, 0.250, 0.375, 0.500, 0.750, 1.000. Your Loan Estimate will show exactly how many points (if any) your rate includes. Points are a <strong>Reg Z finance charge</strong> and are factored into your APR.
                  </p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <CalcInput label="Points (%)" value={discountPointsPct} onChange={handlePointsPctChange} suffix="%" step={0.125} min={0} max={5} />
                <CalcInput label="Points ($)" value={discountPointsDollar} onChange={handlePointsDollarChange} prefix="$" step={100} comma />
              </div>
              {discountPointsDollar > 0 && (
                <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 4, textAlign: "center" }}>{discountPointsPct.toFixed(3)}% of {fmt(baseLoan)} loan = {fmt(discountPointsDollar)}</p>
              )}
            </div>

            <div style={{ marginTop: 10 }}><Row label="Lender Fees + Points Subtotal" val={fmt(lenderTotal)} subtotal /></div>

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Title & Escrow</h3>
            <Row label="Lender's Title Insurance" val={fmt(lendersTitle)} />
            <Row label="Owner's Title Insurance" val={fmt(ownersTitle)} />
            <Row label="Settlement / Closing Fee" val={fmt(settlementFee)} />
            <Row label="Title Search & Exam" val={fmt(titleSearch)} />
            <Row label="Recording Fee" val={fmt(recordingFee)} />
            <Row label="Wire & Notary" val={fmt(wireNotary)} />
            <Row label="Title & Escrow Subtotal" val={fmt(titleTotal)} subtotal />

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 20 }}>Government & Recording</h3>
            <Row label="Transfer Tax" val={fmt(transferTax)} />
            {mortgageTax > 0 && <Row label="Mortgage Recording Tax (TN)" val={fmt(mortgageTax)} />}
            <Row label="Government & Recording Subtotal" val={fmt(transferTax + mortgageTax)} subtotal />
            <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6 }}>{transferTaxNote}</p>

            <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(184,134,11,0.06)", borderRadius: 10, border: `1px solid rgba(184,134,11,0.15)` }}>
              <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 0 }}>Prepaid Items</h3>
              <Row label="12 Months Homeowner's Insurance" val={fmt(insurancePrepaid)} />
              <Row label={`Daily Interest (${daysRemaining} days × ${fmt(dailyInterest)})`} val={fmt(prepaidInterest)} />
              <Row label="Prepaids Subtotal" val={fmt(prepaidsTotal)} subtotal />
            </div>

            <div style={{ marginTop: 14, padding: "16px 18px", background: "rgba(90,122,110,0.07)", borderRadius: 10, border: `1px solid rgba(90,122,110,0.18)` }}>
              <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 0 }}>Escrow Reserves</h3>

              {/* Escrow Waiver — Conv only. FHA/VA always require escrows. */}
              {program === "Conventional" ? (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}`, opacity: canWaiveEscrows ? 1 : 0.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Waive Escrows?</label>
                    <select
                      value={waiveEscrows ? "yes" : "no"}
                      onChange={(e) => setWaiveEscrows(e.target.value === "yes")}
                      disabled={!canWaiveEscrows}
                      style={{ border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.cream, padding: "6px 28px 6px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 700, color: P.text, outline: "none", cursor: canWaiveEscrows ? "pointer" : "not-allowed", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
                      <option value="no">No — Standard Escrow</option>
                      <option value="yes">Yes — Waive Escrows</option>
                    </select>
                  </div>
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>
                    {canWaiveEscrows
                      ? "20%+ down required · You'll pay taxes and insurance directly when due (not collected at closing or monthly)"
                      : "Escrow waiver requires 20% or more down payment"}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: P.white, borderRadius: 8, border: `1px solid ${P.creamDark}` }}>
                  <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                    <strong style={{ color: P.navy }}>🔒 Escrows required.</strong> {program} loans require an escrow account for property taxes and homeowner's insurance for the life of the loan — escrow waiver is not permitted.
                  </p>
                </div>
              )}

              {escrowsWaived ? (
                <>
                  <p style={{ fontSize: 12, color: P.sage, fontWeight: 600, textAlign: "center", padding: "12px 0" }}>✓ Escrows waived — no reserves collected at closing</p>
                  <Row label="Reserves Subtotal" val={fmt(0)} subtotal />
                </>
              ) : (
                <>
                  <Row label={`${taxReserveMonths} Months Property Tax`} val={fmt(taxReserves)} />
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: -2, marginBottom: 4, paddingLeft: 0 }}>{usingMetroSchedule ? `${taxMetro} schedule` : UNVERIFIED_RESERVES_STATES.has(stateCode) ? `Approximate schedule (${stateCode})` : `${stateCode} schedule`} · closing in {closeDateObj.toLocaleString("en-US", { month: "long" })}</p>
                  <Row label="3 Months Insurance" val={fmt(insuranceReserves)} />
                  <Row label="Reserves Subtotal" val={fmt(reservesTotal)} subtotal />
                  <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6 }}>{UNVERIFIED_RESERVES_STATES.has(stateCode) ? `${stateCode} uses an approximate national reserve pattern — a precise impound matrix isn't yet available for this state. Reserve amounts may differ from your actual Loan Estimate. Confirm exact reserve requirements with your closing agent.` : `Tax reserve months follow the ${stateCode} prepaid schedule based on your closing month. This varies by state and protects the lender from a tax lien gap.`}</p>
                </>
              )}
            </div>

            <h3 style={{ fontFamily: F.display, fontSize: 18, color: headerColor, marginBottom: 12, marginTop: 24, textAlign: "center" }}>Total Closing Costs</h3>
            <div style={{ padding: "18px 20px", background: P.cream, borderRadius: 12, border: `2px solid ${PROG_COLOR}` }}>
              {/* Stack of subtotals */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Lender Fees</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(lenderTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Title & Escrow</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(titleTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Government & Recording</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(transferTax + mortgageTax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `1px solid ${P.creamDark}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Prepaid Items</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(prepaidsTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: `2px solid ${P.warmGrayLight}` }}>
                <span style={{ color: P.warmGray, fontWeight: 600 }}>Escrow Reserves</span>
                <span style={{ fontWeight: 700, color: P.text }}>{fmt(reservesTotal)}</span>
              </div>

              {/* Grand total (excl. financed fee) */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 6px", fontSize: 15 }}>
                <span style={{ color: P.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 12 }}>Total Closing Costs</span>
                <span style={{ fontWeight: 700, color: PROG_COLOR, fontSize: 18, fontFamily: F.display }}>{fmt(closingCostsExFee)}</span>
              </div>

              {/* Financed fee section — FHA/VA only */}
              {upfrontFee > 0 && (
                <>
                  <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px dashed ${P.creamDark}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                      <span style={{ color: P.warmGrayLight, fontStyle: "italic" }}>+ {upfrontLabel} (financed)</span>
                      <span style={{ fontWeight: 600, color: P.warmGrayLight, fontStyle: "italic" }}>{fmt(upfrontFee)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", fontSize: 14 }}>
                      <span style={{ color: P.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>With Financed Fee</span>
                      <span style={{ fontWeight: 700, color: PROG_COLOR, fontSize: 16, fontFamily: F.display }}>{fmt(closingCostsIncFee)}</span>
                    </div>
                    <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>The {upfrontLabel} is rolled into your loan — not paid in cash at closing.</p>
                  </div>
                </>
              )}
            </div>

            <h3 style={{ fontFamily: F.display, fontSize: 16, color: headerColor, marginBottom: 8, marginTop: 24 }}>Cash to Close Calculation</h3>
            <Row label="Down Payment" val={fmt(downAmt)} />
            <Row label="+ Total Closing Costs" val={fmt(closingCostsExFee)} />
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <CalcInput label="− Total Credits" value={totalCredits} onChange={setTotalCredits} prefix="$" step={500} comma />
              <p style={{ fontSize: 10, color: P.warmGrayLight, fontStyle: "italic", marginTop: 4, lineHeight: 1.5 }}>Combine earnest money already paid, seller concessions, lender credits, and any other credits into one total here.</p>
            </div>

            <div style={{ marginTop: 16, padding: "16px 18px", background: PROG_COLOR, borderRadius: 10, textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.8 }}>Total Cash Needed at Closing</span>
              <span style={{ fontFamily: F.display, fontSize: 36, color: "#fff" }}>{fmt(cashToClose)}</span>
            </div>

            {/* APR disclosure — Reg Z compliance for borrower comparison */}
            <div style={{ marginTop: 14, padding: "16px 18px", background: P.cream, borderRadius: 10, border: `1px solid ${P.creamDark}`, textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>Estimated APR</span>
                <span style={{ fontFamily: F.display, fontSize: 30, color: PROG_COLOR, fontWeight: 600, display: "block" }}>{estimatedAPR.toFixed(3)}%</span>
                <span style={{ fontSize: 10, color: P.warmGrayLight, display: "block", marginTop: 4 }}>Note rate {Number(rate).toFixed(3)}% · {term}-year term</span>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: P.warmGray, marginTop: 8, paddingTop: 10, borderTop: `1px solid ${P.creamDark}`, textAlign: "left" }}>
                <strong style={{ color: P.navy }}>What is APR?</strong> The Annual Percentage Rate reflects your note rate plus lender fees, prepaid interest, upfront mortgage insurance, and monthly mortgage insurance premiums for the period required — expressed as an annual rate. APR is typically 0.10–0.75% higher than your note rate for Conventional loans and 0.40–1.00% higher for FHA/VA loans (due to upfront and monthly MI), and is the standard apples-to-apples comparison number across lenders. This estimate includes lender fees ({fmt(lenderTotal)}){upfrontFee > 0 ? `, upfront ${program === "FHA" ? "MIP" : "VA funding fee"} (${fmt(upfrontFee)})` : ""}, prepaid interest ({fmt(prepaidInterest)}){aprMonthlyMI > 0 ? `, and monthly MI of ${fmt(aprMonthlyMI)} for ${aprMiMonths} months` : ""}. Title fees, taxes, and insurance are excluded per Reg Z Appendix J. <strong>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</strong>
              </p>
            </div>
          </div>
        </div>
        )}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          {ratesLoaded ? `Rates auto-populated from Mortgage News Daily and rounded to the nearest 0.125%. ` : ""}APR estimate calculated per Reg Z Appendix J methodology — actual APR may vary based on final loan terms, points, and lender-specific fee structure. Estimates based on national averages and state-specific transfer tax conventions. Title fees vary by underwriter and county. Actual costs depend on lender, title company, and specific transaction. <strong>This is not a Loan Estimate or commitment to lend.</strong> NMLS# 1119524.
        </p>
      </div>
      <MobileToolbar />
    </div>
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
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24 }}>
                    <PreQualIcon size={22} variant="cream" />
                  </span>
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
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24 }}>
                    <MortgageCalcIcon size={22} variant="cream" />
                  </span>
                  <div>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>Run the numbers</span>
                    <span style={{ display: "block", fontSize: 11, opacity: 0.5 }}>Mortgage Calculator</span>
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
      icon: "__CALC_ICON__", title: "Mortgage Calculator", href: "/calculator",
      desc: "Same house, three programs. Compare Conventional, FHA, and VA payment breakdowns with live rates.",
    },
    {
      icon: "__PREQUAL_ICON__", title: "Pre-Qual Simulator", href: "/prequal",
      desc: "Enter your income and debts — see what you can afford under each loan program with real DTI limits.",
    },
    {
      icon: "__COMPARE_ICON__", title: "Loan Comparison", href: "/compare",
      desc: "Save up to 3 scenarios from the calculator and stack them side by side to find your best option.",
    },
    {
      icon: "__CASH_ICON__", title: "Cash to Close", href: "/cash-to-close",
      desc: "Estimate how much money you'll need at the closing table — down payment, closing costs, prepaids, and reserves.",
    },
  ];
  return (
    <section id="tools-cta" style={{ padding: "64px 40px", background: P.creamDark }}>
      <div style={{ maxWidth: 720 }}>
        <SectionHeader eyebrow="Your Toolkit" title="Run the Numbers" subtitle="Free tools built by a loan originator — not a marketing team. No login, no data collected, no strings attached." />
        <div className="tools-grid-cta" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {tools.map((t, i) => (
            <a key={i} href={t.href} className="content-card" style={{
              display: "flex", flexDirection: "column", padding: 0, textDecoration: "none",
              overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "28px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8, height: 44 }}>
                  {t.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={44} variant="cream" /> : t.icon === "__COMPARE_ICON__" ? <CompareIcon size={48} variant="cream" /> : t.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={48} variant="cream" /> : t.icon === "__CASH_ICON__" ? <CashToCloseIcon size={48} variant="cream" /> : t.icon}
                </span>
                <span style={{ fontFamily: F.display, fontSize: 20, color: "#fff", display: "block" }}>{t.title}</span>
              </div>
              <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray, flex: 1 }}>{t.desc}</p>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 13, fontWeight: 600, color: P.gold }}>
                  Open {t.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={14} /> : t.icon === "__COMPARE_ICON__" ? <CompareIcon size={14} variant="navy" /> : t.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={14} variant="navy" /> : t.icon === "__CASH_ICON__" ? <CashToCloseIcon size={14} variant="navy" /> : t.icon} →
                </span>
              </div>
            </a>
          ))}
        </div>
        <style>{`
          @media (max-width: 600px) { .tools-grid-cta, .nextsteps-tools { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </section>
  );
}

function PreQualPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [grossIncome, setGrossIncome] = useState(() => { const v = parseFloat(params.get("income")); return v > 0 ? v : 6500; });
  const [monthlyDebts, setMonthlyDebts] = useState(() => { const v = parseFloat(params.get("debts")); return v >= 0 ? v : 450; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 5; });
  const [downDollarOverride, setDownDollarOverride] = useState(null);
  const [downMode, setDownMode] = useState("pct"); // "pct" or "dollar"
  const [selectedProgram, setSelectedProgram] = useState(null); // null = auto-pick best
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [showStudentCalc, setShowStudentCalc] = useState(false);
  const [studentBalance, setStudentBalance] = useState(0);
  const [convRate, setConvRate] = useState(6.75);
  const [convRate30Api, setConvRate30Api] = useState(6.75);
  const [convRate15Api, setConvRate15Api] = useState(6.0);
  const [fhaRate, setFhaRate] = useState(6.25);
  const [vaRate, setVaRate] = useState(6.25);
  const [vaUsage, setVaUsage] = useState("first");
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville/Davidson");
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const insRate = 0.35;


  const stateData = SHARED_STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const loanLimits = selectedMetro?.limits || stateData?.limits || DEFAULT_LIMITS;

  useEffect(() => {
    const newMetros = SHARED_STATE_TAX_RATES[taxState]?.metros;
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
          const conv30 = find("30-year fixed"); const conv15 = find("15-year fixed");
          const fha = find("fha"); const va = find("va");
          const r30 = conv30 ? roundRate(parseFloat(conv30.rate)) : 6.75;
          const r15 = conv15 ? roundRate(parseFloat(conv15.rate)) : 6.0;
          setConvRate30Api(r30);
          setConvRate15Api(r15);
          setConvRate(term === 15 ? r15 : r30);
          if (fha) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today"); setRatesLoaded(true);
        }
      } catch (e) { /* silent */ }
    })();
  }, []);

  // Switch conv rate when term changes
  useEffect(() => {
    if (ratesLoaded) setConvRate(term === 15 ? convRate15Api : convRate30Api);
  }, [term]);

  // VA funding fee
  const vaFeeRate = useMemo(() => {
    if (vaUsage === "exempt") return 0;
    if (downPct >= 10) return 1.25;
    if (downPct >= 5) return 1.50;
    return vaUsage === "first" ? 2.15 : 3.30;
  }, [vaUsage, downPct]);

  // Solve max price from max housing payment
  // Effective down payment: use dollar override to derive percentage if set
  const isDollarMode = downMode === "dollar" && downDollarOverride > 0;

  const effectiveDownPct = useMemo(() => {
    if (!isDollarMode) return downPct;
    const roughMaxPayment = Math.floor(grossIncome * 0.45 - monthlyDebts);
    const roughPrice = Math.max(roughMaxPayment * 150, downDollarOverride * 2);
    return Math.min(Math.max(Math.round((downDollarOverride / roughPrice) * 10000) / 100, 0), 99);
  }, [isDollarMode, downDollarOverride, downPct, grossIncome, monthlyDebts]);

  const solvePrice = (maxPayment, rate, miRateAnnual, upfrontFeePct) => {
    if (maxPayment <= 0) return 0;
    const mr = (rate / 100) / 12;
    const n = term * 12;
    let price = maxPayment * 170;
    for (let i = 0; i < 25; i++) {
      const baseLoan = isDollarMode ? Math.max(price - downDollarOverride, 0) : price * (1 - effectiveDownPct / 100);
      const totalLoan = baseLoan * (1 + upfrontFeePct / 100);
      const pi = totalLoan > 0 ? totalLoan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : 0;
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

  // Program definitions — use effectiveDownPct for MI tiers and eligibility
  const dpForCalc = isDollarMode ? effectiveDownPct : downPct;
  const convMiRate = dpForCalc < 5 ? 0.52 : dpForCalc < 10 ? 0.37 : dpForCalc < 20 ? 0.27 : 0;
  const fhaMiRate = dpForCalc < 5 ? 0.55 : 0.50;

  const programs = [
    {
      name: "Conventional", color: PROGRAM_COLORS.Conventional, rate: convRate, setRate: setConvRate,
      frontMax: 0.4999, backMax: 0.4999, miRate: convMiRate, upfrontFee: 0,
      minDown: 3, eligible: dpForCalc >= 3, loanLimit: loanLimits.conv,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : "No PMI",
      notes: "Front-end and back-end both 49.99%. DTI thresholds assume 740+ FICO — lower scores may reduce max DTI. PMI removable at 80% LTV.",
    },
    {
      name: "FHA", color: PROGRAM_COLORS.FHA, rate: fhaRate, setRate: setFhaRate,
      frontMax: 0.4699, backMax: 0.5699, miRate: fhaMiRate, upfrontFee: 1.75,
      minDown: 3.5, eligible: dpForCalc >= 3.5, loanLimit: loanLimits.fha,
      miLabel: `MIP (${fhaMiRate}%)`,
      notes: "Front-end 46.99%, back-end 56.99%. DTI thresholds assume 680+ FICO. UFMIP (1.75%) financed. MIP for life if <10% down.",
    },
    {
      name: "VA", color: PROGRAM_COLORS.VA, rate: vaRate, setRate: setVaRate,
      frontMax: 0.50, backMax: 0.55, miRate: 0, upfrontFee: vaFeeRate,
      minDown: 0, eligible: true, loanLimit: loanLimits.va,
      miLabel: "No monthly MI",
      notes: `Front-end 50%, back-end 55%. DTI thresholds assume 680+ FICO. Funding fee ${vaFeeRate}% financed. No monthly MI. Can exceed 55% with strong residual income.`,
    },
  ];

  // Calculate for each program
  const results = programs.map(prog => {
    const useFixedDown = isDollarMode;

    // When using fixed dollar down, eligibility is determined by whether the dollar
    // amount can meet the minimum down requirement at ANY price (it always can, we just cap the price)
    const isEligible = useFixedDown ? true : prog.eligible;
    if (!isEligible) return { ...prog, maxPrice: 0, maxPayment: 0, comfPrice: 0, comfPayment: 0, frontMaxHousing: 0, backTotalMax: 0, backMaxHousing: 0, overLimit: false, actualDownAmt: 0, actualDownPctDisplay: 0 };

    // Front-end: max HOUSING payment (independent of debts)
    const frontMaxHousing = prog.frontMax ? Math.floor(grossIncome * prog.frontMax) : Infinity;

    // Back-end: max TOTAL of (housing + all debts)
    const backTotalMax = Math.floor(grossIncome * prog.backMax);
    const backMaxHousing = backTotalMax - monthlyDebts;

    const maxPayment = Math.max(0, Math.min(frontMaxHousing, backMaxHousing));
    const bindingConstraint = frontMaxHousing <= backMaxHousing ? "front-end" : "back-end";

    // Comfortable range (75% of limits)
    const comfFront = prog.frontMax ? Math.floor(grossIncome * prog.frontMax * 0.75) : Infinity;
    const comfBack = Math.floor(grossIncome * prog.backMax * 0.75) - monthlyDebts;
    const comfPayment = Math.max(0, Math.min(comfFront, comfBack));

    let maxPrice = solvePrice(maxPayment, prog.rate, prog.miRate, prog.upfrontFee);
    let comfPrice = solvePrice(comfPayment, prog.rate, prog.miRate, prog.upfrontFee);

    // When using fixed dollar down, cap price so down payment meets minimum %
    // e.g., $10,000 at 3% min → max price = $333,333
    let cappedByMinDown = false;
    if (useFixedDown && prog.minDown > 0) {
      const maxPriceFromMinDown = Math.floor(downDollarOverride / (prog.minDown / 100));
      if (maxPrice > maxPriceFromMinDown) {
        maxPrice = maxPriceFromMinDown;
        cappedByMinDown = true;
      }
      if (comfPrice > maxPriceFromMinDown) {
        comfPrice = maxPriceFromMinDown;
      }
    }

    // Calculate loan amounts
    let maxLoan = useFixedDown ? Math.max(maxPrice - downDollarOverride, 0) : maxPrice * (1 - dpForCalc / 100);
    let overLimit = false;
    if (maxLoan > prog.loanLimit) {
      maxLoan = prog.loanLimit;
      maxPrice = useFixedDown ? maxLoan + downDollarOverride : Math.floor(prog.loanLimit / (1 - dpForCalc / 100));
      overLimit = true;
    }

    const maxTotalLoan = maxLoan * (1 + prog.upfrontFee / 100);
    const comfLoan = useFixedDown ? Math.max(comfPrice - downDollarOverride, 0) : comfPrice * (1 - dpForCalc / 100);
    const actualDownAmt = useFixedDown ? downDollarOverride : maxPrice * (dpForCalc / 100);
    const actualDownPctDisplay = maxPrice > 0 ? ((actualDownAmt / maxPrice) * 100).toFixed(1) : 0;

    const currentBackDTI = grossIncome > 0 ? ((monthlyDebts + maxPayment) / grossIncome * 100) : 0;

    // APR calculation for the max scenario
    const aprLenderFees = 1500 + 750 + (prog.name === "VA" ? 650 : prog.name === "FHA" ? 550 : 600) + 300 + 15 + 80;
    const aprUpfront = maxLoan * (prog.upfrontFee / 100);
    const aprCharges = aprLenderFees + aprUpfront;
    let aprMI = 0, aprMiMonths = 0;
    if (prog.name === "FHA") {
      aprMI = (maxLoan * (prog.miRate / 100)) / 12;
      aprMiMonths = dpForCalc < 10 ? term * 12 : 132;
    } else if (prog.name === "Conventional" && dpForCalc < 20) {
      aprMI = (maxLoan * (prog.miRate / 100)) / 12;
      aprMiMonths = 120;
    }
    const apr = maxTotalLoan > 0 ? calculateAPR(maxTotalLoan, aprCharges, prog.rate, term, aprMI, aprMiMonths) : 0;

    return { ...prog, eligible: isEligible, maxPrice, maxPayment, comfPrice, comfPayment, maxLoan, maxTotalLoan, comfLoan, currentBackDTI, bindingConstraint, frontMaxHousing, backTotalMax, backMaxHousing, overLimit, actualDownAmt, actualDownPctDisplay, cappedByMinDown, apr };
  });

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .pq-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pq-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        @media (max-width: 700px) {
          .pq-input-cols { grid-template-columns: 1fr; }
          .pq-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20was%20using%20your%20pre-qual%20simulator%20and%20had%20a%20question." style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>What Can You Afford?</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            Pre-Qual Simulator
            <PreQualIcon size={32} variant="navy" />
          </h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 560, margin: "0 auto" }}>Enter your income and debts. See what you qualify for under each loan program — with their real DTI limits and mortgage insurance rules.</p>
        </div>

        {/* Inputs */}
        <div className="content-card" style={{ padding: "28px", marginBottom: 12, maxWidth: 800, margin: "0 auto 12px" }}>
          <div className="pq-input-cols">
            {/* Left column — Income, Debts & DTI */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CalcInput label="Gross Monthly Income" value={grossIncome} onChange={setGrossIncome} prefix="$" step={250} comma />
              <CalcInput label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" step={50} comma />
              <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.5, marginTop: -4 }}>Include: car, student loans, credit cards (min payments), personal loans, child support.</p>
              <button onClick={() => setShowStudentCalc(!showStudentCalc)} style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                fontSize: 11, fontWeight: 600, color: P.gold, cursor: "pointer", fontFamily: F.body, padding: "0",
              }}>
                <span style={{ fontSize: 12 }}>🎓</span>
                {showStudentCalc ? "Hide Student Loan Calculator" : "Student Loan Payment Calculator"}
                <span style={{ fontSize: 10, transition: "transform 0.2s", transform: showStudentCalc ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
              {showStudentCalc && (
                <div style={{ background: P.creamDark, borderRadius: 8, padding: "14px 16px" }}>
                  <p style={{ fontSize: 11, color: P.warmGray, marginBottom: 10, lineHeight: 1.5 }}>
                    For student loans currently at <strong>$0/mo</strong> due to deferment, forbearance, or income-driven repayment — lenders still count a payment.
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
                    0.5% is the standard qualifying calc for deferred student loans. Use your actual payment if on an active repayment plan.
                  </p>
                </div>
              )}
              <div style={{ padding: "10px 14px", background: P.creamDark, borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Current Debt-Only DTI</span>
                <span style={{ fontFamily: F.display, fontSize: 22, color: grossIncome > 0 && (monthlyDebts / grossIncome) > 0.30 ? P.gold : P.sage }}>{grossIncome > 0 ? ((monthlyDebts / grossIncome) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
            {/* Right column — Loan Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>Term</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[15, 30].map((t) => (
                    <button key={t} onClick={() => setTerm(t)} className={`tab-btn ${term === t ? "tab-btn-active" : ""}`} style={{ flex: 1, padding: "9px 0" }}>{t} yr</button>
                  ))}
                </div>
              </div>
              <div style={{ border: `1px solid ${P.creamDark}`, borderRadius: 10, padding: "14px 14px 10px", background: P.white }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.navy, display: "block", marginBottom: 10 }}>Down Payment</label>
                <div style={{ opacity: downMode === "pct" ? 1 : 0.3, pointerEvents: downMode === "pct" ? "auto" : "none", transition: "opacity 0.2s" }}>
                  <CalcInput label="Percentage" value={downMode === "pct" ? downPct : ""} onChange={(v) => { setDownPct(v); }} suffix="%" step={1} min={0} max={100} />
                </div>
                <button onClick={() => {
                  if (downMode === "pct") { setDownMode("dollar"); setDownDollarOverride(null); }
                  else { setDownMode("pct"); setDownDollarOverride(null); }
                }} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
                  padding: "7px 0", margin: "8px 0", borderRadius: 6, border: "none",
                  background: P.gold, color: "#fff",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.body,
                }}>
                  Switch to {downMode === "pct" ? "Dollar Amount" : "Percentage"}
                </button>
                <div style={{ opacity: downMode === "dollar" ? 1 : 0.3, pointerEvents: downMode === "dollar" ? "auto" : "none", transition: "opacity 0.2s" }}>
                  <CalcInput label="Dollar Amount" value={downMode === "dollar" && downDollarOverride ? downDollarOverride : ""} onChange={(v) => { setDownDollarOverride(v > 0 ? v : null); }} prefix="$" step={1000} comma />
                </div>
              </div>
            </div>
          </div>

          {/* Property location row */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${P.creamDark}` }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>Property Location</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select value={taxState} onChange={(e) => setTaxState(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 32px 10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                {Object.entries(SHARED_STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
                  <option key={code} value={code}>{s.name}</option>
                ))}
              </select>
              {metroList.length > 0 && (
                <select value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${P.creamDark}`, borderRadius: 8, background: P.cream, padding: "10px 32px 10px 12px", fontSize: 14, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
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

        {/* Section divider — Your Results */}
        <div style={{ margin: "40px auto 24px", maxWidth: 800, position: "relative", textAlign: "center" }}>
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${P.creamDark}, transparent)`, position: "absolute", left: 0, right: 0, top: "50%" }} />
          <div style={{ position: "relative", display: "inline-block", background: P.cream, padding: "0 20px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold }}>↓ Your Results ↓</span>
            <p style={{ fontSize: 13, color: P.warmGray, marginTop: 6, maxWidth: 480 }}>Tap any card to send that scenario to the calculator</p>
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
            const isSelected = selectedProgram === prog.name;

            return (
              <div key={i} className="content-card" onClick={() => setSelectedProgram(isSelected ? null : prog.name)} style={{
                overflow: "hidden", position: "relative", cursor: "pointer",
                border: isSelected ? `3px solid ${P.gold}` : `3px solid transparent`,
                boxShadow: isSelected ? `0 0 0 4px rgba(184,134,11,0.15), 0 8px 30px rgba(0,0,0,0.12)` : undefined,
                transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
              }}>
                {isSelected && (
                  <span style={{ position: "absolute", top: 8, left: 8, zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "3px 10px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>✓ Selected</span>
                )}
                {/* Header */}
                <div style={{ background: prog.color, padding: "20px", textAlign: "center", position: "relative" }}>
                  {isBest && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: "#fff", color: prog.color, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "3px 8px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>★ Most Power</span>
                  )}
                  <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{prog.name} · Max Purchase</span>
                  <span style={{ fontFamily: F.display, fontSize: 34, color: "#fff" }}>{fmt(prog.maxPrice)}</span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {Number(prog.rate).toFixed(3)}% · {prog.overLimit ? "capped at loan limit" : prog.cappedByMinDown ? `capped at ${prog.minDown}% min down` : `${prog.bindingConstraint} DTI binding`}
                  </span>
                  {prog.overLimit && (
                    <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "3px 10px", borderRadius: 10 }}>
                      ⚠️ Loan limit: {fmt(prog.loanLimit)}
                    </span>
                  )}
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {/* DTI breakdown — two stacked bars */}
                  <div style={{ marginBottom: 14 }}>
                    {/* Front-End bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 4 }}>
                        <span>Front-End DTI {prog.bindingConstraint === "front-end" && prog.frontMax ? "← binding" : ""}</span>
                        <span style={{ fontWeight: 700, color: prog.frontMax && prog.bindingConstraint === "front-end" ? prog.color : P.warmGrayLight }}>
                          {prog.frontMax ? `${((prog.maxPayment / grossIncome) * 100).toFixed(1)}% / ${(prog.frontMax * 100).toFixed(1)}%` : "N/A (VA)"}
                        </span>
                      </div>
                      <div style={{ height: 6, background: P.creamDark, borderRadius: 3, overflow: "hidden" }}>
                        {prog.frontMax ? (
                          <div style={{ height: "100%", width: `${Math.min(((prog.maxPayment / grossIncome) / prog.frontMax) * 100, 100)}%`, background: prog.color, borderRadius: 3, transition: "width 0.3s" }} />
                        ) : (
                          <div style={{ height: "100%", width: "100%", background: `repeating-linear-gradient(45deg, ${P.creamDark}, ${P.creamDark} 4px, ${P.cream} 4px, ${P.cream} 8px)`, borderRadius: 3 }} />
                        )}
                      </div>
                    </div>
                    {/* Back-End bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.warmGrayLight, marginBottom: 4 }}>
                        <span>Back-End DTI {prog.bindingConstraint === "back-end" ? "← binding" : ""}</span>
                        <span style={{ fontWeight: 700, color: prog.bindingConstraint === "back-end" ? prog.color : P.warmGrayLight }}>
                          {prog.currentBackDTI.toFixed(1)}% / {(prog.backMax * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: 6, background: P.creamDark, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((prog.currentBackDTI / (prog.backMax * 100)) * 100, 100)}%`, background: prog.color, borderRadius: 3, transition: "width 0.3s" }} />
                      </div>
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
                      { label: "Down Payment", val: fmt(prog.actualDownAmt), sub: `${prog.actualDownPctDisplay}%` },
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

                  {prog.name === "VA" && (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: 12, padding: "10px 12px", background: P.creamDark, borderRadius: 8 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 4 }}>VA Eligibility</label>
                      <select value={vaUsage} onChange={(e) => setVaUsage(e.target.value)}
                        style={{ width: "100%", border: `1px solid ${P.creamDark}`, borderRadius: 6, background: P.white, padding: "7px 10px", fontSize: 12, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9488' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                        <option value="first">First-Time Use</option>
                        <option value="subsequent">Subsequent Use</option>
                        <option value="exempt">Exempt (Disability)</option>
                      </select>
                    </div>
                  )}

                  <p style={{ fontSize: 10, color: P.warmGrayLight, lineHeight: 1.5, fontStyle: "italic" }}>{prog.notes}</p>

                  {/* APR */}
                  {prog.apr > 0 && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR at Max Purchase</span>
                      <span style={{ fontFamily: F.display, fontSize: 22, color: prog.color }}>{prog.apr.toFixed(3)}%</span>
                      <p style={{ fontSize: 9, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4 }}>Note rate {Number(prog.rate).toFixed(3)}% · Includes lender fees{prog.upfrontFee > 0 ? `, ${prog.name === "FHA" ? "UFMIP" : "VA funding fee"}` : ""}{prog.miRate > 0 ? ", monthly MI" : ""}</p>
                      <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                    </div>
                  )}
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

        {/* Cross-link to calculator */}
        {(() => {
          const eligible = results.filter(r => r.eligible && r.maxPrice > 0);
          const selected = selectedProgram ? eligible.find(r => r.name === selectedProgram) : null;
          const target = selected || eligible.reduce((a, b) => (a && a.maxPrice > b.maxPrice ? a : b), null);
          const targetPrice = target ? target.maxPrice : 0;
          const targetName = target ? target.name : "";
          const calcUrl = `/calculator?price=${targetPrice > 0 ? targetPrice : 350000}&down=${downPct}&term=${term}`;
          return (
            <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <a href={calcUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: `1px solid ${P.navy}`, color: P.navy, fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                <MortgageCalcIcon size={16} variant="navy" /> {targetPrice > 0 ? `Run ${targetName} ${fmt(targetPrice)}` : "Open the Calculator"} →
              </a>
              {!selectedProgram && eligible.length > 1 && (
                <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 8, fontStyle: "italic" }}>Tap a card above to choose a different scenario</p>
              )}
            </div>
            </>
          );
        })()}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          This simulator is for educational purposes only. Contact me at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized pre-approval. NMLS# 1119524.
        </p>
      </div>
      <MobileToolbar />
    </div>
  );
}

function JargonDecoder() {
  const [search, setSearch] = useState("");
  const [openTerm, setOpenTerm] = useState(null);
  const [sectionOpen, setSectionOpen] = useState(false);

  const terms = [
    { term: "1003", def: "The industry name for the Uniform Residential Loan Application — the official mortgage application form. Now technically called the URLA (Uniform Residential Loan Application) after being redesigned in 2021, but most loan originators still call it the '1003' (pronounced 'ten-oh-three'). It captures everything: income, assets, debts, property details, declarations. You'll sign multiple versions throughout the process as the file updates." },
    { term: "1004D", def: "The reinspection form an appraiser completes after the original appraisal — most commonly to verify that required repairs have been completed. If your appraisal came back 'subject to' repairs (like a missing handrail or a broken window), you'll need a 1004D before closing to confirm the work is done. Usually costs $150–$250 and takes a few days to schedule." },
    { term: "1007", def: "The Single-Family Comparable Rent Schedule — the appraiser's report estimating fair-market rent for an investment or two-to-four-unit property. When you're buying a rental or using rental income to qualify, the lender uses the 1007 to determine how much of that rental income can count toward your DTI. Without it, rental income typically can't be used for qualifying." },
    { term: "1031 Exchange", def: "An IRS tax provision that lets real estate investors defer capital gains taxes by rolling proceeds from the sale of one investment property into the purchase of another 'like-kind' property. Strict timelines apply: 45 days to identify the replacement property, 180 days to close. This is a tax strategy, not a loan type — but it often runs alongside financing, and a qualified intermediary (not your lender) handles the exchange itself." },
    { term: "APR", def: "Annual Percentage Rate — your interest rate plus lender fees, expressed as a yearly rate. APR is always higher than your note rate because it includes costs like origination fees and discount points. Use APR to compare the true cost of loans from different lenders." },
    { term: "Amortization", def: "The process of paying off your loan over time through scheduled payments. Early payments are mostly interest; later payments are mostly principal. A 30-year amortization schedule shows exactly how this shifts month by month." },
    { term: "Appraisal", def: "An independent assessment of a property's market value, ordered by the lender through an Appraisal Management Company (AMC). The lender needs to confirm the home is worth what you're borrowing. Typically $400–$700." },
    { term: "ARM", def: "Adjustable Rate Mortgage — a loan with an interest rate that changes after an initial fixed period. A 7/6 ARM is fixed for 7 years, then adjusts every 6 months based on a market index (usually SOFR). Lower initial rate, but risk of increases later." },
    { term: "Cash to Close", def: "The total amount of money you need to bring to the closing table to complete your home purchase. It includes your down payment, closing costs, prepaid items (taxes and insurance collected upfront), and escrow reserves, minus any credits like earnest money, seller concessions, or lender credits. This is the real number buyers need to plan for — often significantly more than just the down payment alone." },
    { term: "Clear to Close", def: "The best phrase in the mortgage process. It means the underwriter has approved your loan with all conditions satisfied, and you're authorized to proceed to the closing table." },
    { term: "Closing Disclosure (CD)", def: "A 5-page document you receive at least 3 business days before closing. It details every cost, your loan terms, and your monthly payment. Compare it line-by-line against your Loan Estimate — discrepancies may require a fee cure." },
    { term: "Conforming Loan", def: "A mortgage that meets Fannie Mae or Freddie Mac guidelines, including being under the conforming loan limit ($766,550 in most areas for 2024). Loans above this limit are called jumbo loans." },
    { term: "Conventional Loan", def: "A mortgage not insured by a government agency (FHA, VA, USDA). Follows Fannie Mae or Freddie Mac guidelines. Requires PMI if less than 20% down, but PMI is removable once you reach 80% LTV." },
    { term: "DTI", def: "Debt-to-Income Ratio — your total monthly debt payments divided by your gross monthly income. Caps vary by program: Conventional goes up to 49.99%, FHA up to 56.99% on the back-end, VA up to 55%. Front-end DTI (housing payment only) and back-end DTI (housing + all debts) are evaluated separately on FHA and VA. Lower is always better for approval odds and pricing." },
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
      <div onClick={() => setSectionOpen(!sectionOpen)} style={{ cursor: "pointer" }}>
        <SectionHeader eyebrow="Speak the Language" title={`Jargon Decoder ${sectionOpen ? "−" : "+"}`} subtitle={sectionOpen ? "Mortgages come with their own vocabulary. Here's every term you'll encounter, explained in plain language." : `Click to reveal ${terms.length} mortgage terms explained in plain language.`} />
      </div>
      {sectionOpen && (
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
      )}
    </section>
  );
}

function RateInput({ label, rate, setRate, color }) {
  const fmtRate = (r) => Number(r).toFixed(3);
  const [localVal, setLocalVal] = useState(fmtRate(rate));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setLocalVal(fmtRate(rate)); }, [rate, focused]);
  const handleChange = (e) => {
    setLocalVal(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 15) setRate(v);
  };
  const handleFocus = () => { setFocused(true); };
  const handleBlur = () => {
    setFocused(false);
    const v = parseFloat(localVal);
    if (isNaN(v) || v < 0) { setRate(0); setLocalVal(fmtRate(0)); }
    else if (v > 15) { setRate(15); setLocalVal(fmtRate(15)); }
    else { setRate(v); setLocalVal(fmtRate(v)); }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: P.cream, border: `1px solid ${P.creamDark}` }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: color, flex: 1 }}>{label}</span>
      <input
        type="number" inputMode="decimal" value={localVal} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
        step={0.125}
        style={{ border: "none", background: "transparent", fontSize: 16, fontFamily: F.body, fontWeight: 700, color: P.text, outline: "none", textAlign: "right", width: 64 }}
      />
      <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray }}>%</span>
    </div>
  );
}

function CalculatorPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const paramRate = parseFloat(params.get("rate"));
  const paramProgram = params.get("program");
  const [homePrice, setHomePrice] = useState(() => { const v = parseFloat(params.get("price")); return v > 0 ? v : 350000; });
  const [convRate, setConvRate] = useState(paramProgram === "Conventional" && paramRate > 0 ? paramRate : 6.75);
  const [convRate30Api, setConvRate30Api] = useState(6.75);
  const [convRate15Api, setConvRate15Api] = useState(6.0);
  const [fhaRate, setFhaRate] = useState(paramProgram === "FHA" && paramRate > 0 ? paramRate : 6.25);
  const [vaRate, setVaRate] = useState(paramProgram === "VA" && paramRate > 0 ? paramRate : 6.25);
  const [term, setTerm] = useState(() => { const v = parseInt(params.get("term")); return v === 15 ? 15 : 30; });
  const [downPct, setDownPct] = useState(() => { const v = parseFloat(params.get("down")); return v >= 0 && v <= 100 ? v : 3.5; });
  const [downDollarOverride, setDownDollarOverride] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [saveToast, setSaveToast] = useState(null);
  const [extraConfig, setExtraConfig] = useState({});
  const getExtraConfig = (programName) => extraConfig[programName] || { enabled: false, strategy: "monthly", amount: 0 };
  const updateExtraConfig = (programName, updates) => {
    setExtraConfig((prev) => ({ ...prev, [programName]: { ...getExtraConfig(programName), ...updates } }));
  };
  useEffect(() => { setDownDollarOverride(null); }, [homePrice]); // reset override when price changes

  const handleDownPctChange = (v) => { setDownPct(v); setDownDollarOverride(null); };
  const handleDownDollarChange = (v) => {
    setDownDollarOverride(v);
    if (homePrice > 0) setDownPct(Math.round((v / homePrice) * 10000) / 100);
  };
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("Nashville");
  const [vaUsage, setVaUsage] = useState("first");
  const paramHoa = parseFloat(params.get("hoa"));
  const [showHoa, setShowHoa] = useState(paramHoa > 0);
  const [hoa, setHoa] = useState(paramHoa > 0 ? paramHoa : 0);


  const stateData = SHARED_STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find(m => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate || 0.56;
  const [taxes, setTaxes] = useState(Math.round((350000 * (0.95 / 100)) / 12));
  useEffect(() => { setTaxes(Math.round((homePrice * (taxRate / 100)) / 12)); }, [taxState, taxMetro, homePrice]);
  // Reset metro when state changes
  useEffect(() => {
    const newMetros = SHARED_STATE_TAX_RATES[taxState]?.metros;
    if (newMetros && newMetros.length > 0) setTaxMetro(newMetros[0].name);
    else setTaxMetro("");
  }, [taxState]);

  const [insurance, setInsurance] = useState(Math.round((350000 * 0.0035) / 12));
  useEffect(() => { setInsurance(Math.round((homePrice * 0.0035) / 12)); }, [homePrice]);

  // Override taxes/insurance from URL params (e.g. loaded from comparison tool)
  useEffect(() => {
    const pTax = parseFloat(params.get("tax"));
    const pIns = parseFloat(params.get("insurance"));
    if (pTax > 0) setTimeout(() => setTaxes(pTax), 0);
    if (pIns > 0) setTimeout(() => setInsurance(pIns), 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          const conv30 = find("30-year fixed");
          const conv15 = find("15-year fixed");
          const fha = find("fha");
          const va = find("va");
          const r30 = conv30 ? roundRate(parseFloat(conv30.rate)) : 6.75;
          const r15 = conv15 ? roundRate(parseFloat(conv15.rate)) : 6.0;
          setConvRate30Api(r30);
          setConvRate15Api(r15);
          if (!(paramProgram === "Conventional" && paramRate > 0)) setConvRate(term === 15 ? r15 : r30);
          if (fha && !(paramProgram === "FHA" && paramRate > 0)) setFhaRate(roundRate(parseFloat(fha.rate)));
          if (va && !(paramProgram === "VA" && paramRate > 0)) setVaRate(roundRate(parseFloat(va.rate)));
          setRateSource(data.date || "today");
          setRatesLoaded(true);
        }
      } catch (e) { /* fail silently, use defaults */ }
    })();
  }, []);

  // Switch conv rate when term changes
  useEffect(() => {
    if (ratesLoaded) {
      setConvRate(term === 15 ? convRate15Api : convRate30Api);
    }
  }, [term]);

  const downAmt = downDollarOverride !== null ? downDollarOverride : homePrice * (downPct / 100);
  const baseLoan = homePrice - downAmt;

  // Conventional
  const convLoan = baseLoan;
  const convMiRate = downPct < 5 ? 0.52 : downPct < 10 ? 0.37 : downPct < 20 ? 0.27 : 0;
  const convMI = (baseLoan * (convMiRate / 100)) / 12;
  const { monthly: convPI } = useMemo(() => generateAmortData(convLoan, convRate, term), [convLoan, convRate, term]);
  const convTotal = convPI + convMI + taxes + insurance + hoa;

  // FHA
  const fhaUpfront = baseLoan * 0.0175;
  const fhaLoan = baseLoan + fhaUpfront;
  const fhaMiRate = downPct < 5 ? 0.55 : 0.50;
  const fhaMI = (baseLoan * (fhaMiRate / 100)) / 12;
  const { monthly: fhaPI } = useMemo(() => generateAmortData(fhaLoan, fhaRate, term), [fhaLoan, fhaRate, term]);
  const fhaTotal = fhaPI + fhaMI + taxes + insurance + hoa;

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
  const vaTotal = vaPI + taxes + insurance + hoa;

  const vaUsageLabels = { first: "First-Time Use", subsequent: "Subsequent Use", exempt: "Exempt (Disability)" };

  // Lender fees for APR calculation (matches Cash to Close simulator)
  const calcLenderFees = 1500 + 750 + 600 + 300 + 15 + 80; // underwriting + processing + appraisal + credit + flood + tax service

  // APR per program — includes lender fees, upfront MI, and monthly MI per Reg Z §1026.4(b)(5)
  const convAprCharges = calcLenderFees;
  const convAprMI = downPct < 20 ? (baseLoan * (convMiRate / 100)) / 12 : 0;
  const convAprMiMonths = downPct < 20 ? 120 : 0;
  const convAPR = calculateAPR(convLoan, convAprCharges, convRate, term, convAprMI, convAprMiMonths);

  const fhaAprCharges = calcLenderFees + fhaUpfront;
  const fhaAprMI = (baseLoan * (fhaMiRate / 100)) / 12;
  const fhaAprMiMonths = downPct < 10 ? term * 12 : 132;
  const fhaAPR = calculateAPR(fhaLoan, fhaAprCharges, fhaRate, term, fhaAprMI, fhaAprMiMonths);

  const vaAprCharges = calcLenderFees + vaFee;
  const vaAPR = calculateAPR(vaLoan, vaAprCharges, vaRate, term, 0, 0);

  const programs = [
    {
      name: "Conventional", color: PROGRAM_COLORS.Conventional, loan: convLoan, pi: convPI, mi: convMI,
      miLabel: convMiRate > 0 ? `PMI (${convMiRate}%)` : null,
      upfront: 0, upfrontLabel: null, total: convTotal, rate: convRate, apr: convAPR,
      note: downPct >= 20 ? "No PMI required" : `PMI est. based on 740+ FICO, <43% DTI`,
      eligible: downPct >= 3, minDown: 3,
    },
    {
      name: "FHA", color: PROGRAM_COLORS.FHA, loan: fhaLoan, pi: fhaPI, mi: fhaMI,
      miLabel: `MIP (${fhaMiRate}%)`,
      upfront: fhaUpfront, upfrontLabel: "UFMIP (1.75%)", total: fhaTotal, rate: fhaRate, apr: fhaAPR,
      note: downPct < 10 ? "MIP for life of loan" : "MIP removable after 11 years",
      eligible: downPct >= 3.5, minDown: 3.5,
    },
    {
      name: "VA", color: PROGRAM_COLORS.VA, loan: vaLoan, pi: vaPI, mi: 0,
      miLabel: null,
      upfront: vaFee, upfrontLabel: vaFeeRate > 0 ? `Funding Fee (${vaFeeRate}%)` : null, total: vaTotal, rate: vaRate, apr: vaAPR,
      note: vaUsage === "exempt"
        ? "Funding fee waived — service-connected disability"
        : `No monthly MI — ${vaUsageLabels[vaUsage].toLowerCase()}, ${downPct >= 10 ? "10%+ down" : downPct >= 5 ? "5–9.99% down" : "<5% down"}`,
      isVA: true, eligible: true, minDown: 0,
    },
  ];

  const eligibleTotals = programs.filter(p => p.eligible).map(p => p.total);
  const lowestTotal = eligibleTotals.length > 0 ? Math.min(...eligibleTotals) : 0;

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <style>{globalCSS}{`
        .calc-input-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .calc-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        @media (max-width: 700px) {
          .calc-input-cols { grid-template-columns: 1fr; }
          .calc-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Calculator header */}
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
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
              <span className="btn-label-mobile-hide">Call</span>
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
              <span className="btn-label-mobile-hide">Text</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>Side-by-Side Comparison</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            Mortgage Calculator
            <MortgageCalcIcon size={26} />
          </h1>
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
                  {Object.entries(SHARED_STATE_TAX_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
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
              {!showHoa ? (
                <button onClick={() => setShowHoa(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 12, color: P.sage, fontWeight: 600, cursor: "pointer" }}>+ Add HOA Dues <span style={{ fontSize: 10, fontWeight: 400, color: P.warmGrayLight }}>(optional)</span></button>
              ) : (
                <div>
                  <CalcInput label="Monthly HOA Dues (optional)" value={hoa} onChange={setHoa} prefix="$" step={25} />
                  <button onClick={() => { setShowHoa(false); setHoa(0); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0", border: "none", background: "transparent", fontFamily: F.body, fontSize: 11, color: P.warmGrayLight, cursor: "pointer", marginTop: 2 }}>✕ Remove HOA</button>
                </div>
              )}
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

        {/* Section divider — Your Results */}
        <div style={{ margin: "40px auto 24px", maxWidth: 800, position: "relative", textAlign: "center" }}>
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${P.creamDark}, transparent)`, position: "absolute", left: 0, right: 0, top: "50%" }} />
          <div style={{ position: "relative", display: "inline-block", background: P.cream, padding: "0 20px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold }}>↓ Your Results ↓</span>
            <p style={{ fontSize: 13, color: P.warmGray, marginTop: 6, maxWidth: 480 }}>Tap any card to select it, then save to the Loan Comparison Tool</p>
          </div>
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

            const isSelected = selectedProgram === prog.name;
            return (
              <div key={i} className="content-card" onClick={() => setSelectedProgram(isSelected ? null : prog.name)} style={{
                overflow: "hidden", position: "relative", cursor: "pointer",
                border: isSelected ? `3px solid ${P.gold}` : `3px solid transparent`,
                boxShadow: isSelected ? `0 0 0 4px rgba(184,134,11,0.15), 0 8px 30px rgba(0,0,0,0.12)` : undefined,
                transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
              }}>
                {isSelected && (
                  <span style={{ position: "absolute", top: 10, left: 10, zIndex: 5, background: P.gold, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "4px 10px", borderRadius: 50, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>✓ Selected</span>
                )}
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
                  <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>/month · {Number(prog.rate).toFixed(3)}% rate</span>
                </div>

                <div style={{ padding: "20px" }}>
                  {/* Breakdown */}
                  <div style={{ marginBottom: 16 }}>
                    {[
                      { label: "Principal & Interest", val: prog.pi },
                      ...(prog.mi > 0 ? [{ label: prog.miLabel, val: prog.mi }] : []),
                      { label: "Taxes", val: taxes },
                      { label: "Insurance", val: insurance },
                      ...(hoa > 0 ? [{ label: "HOA Dues", val: hoa }] : []),
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: P.warmGray }}>Base Loan Amount</span>
                      <span style={{ fontWeight: 600, color: P.text }}>{fmt(baseLoan)}</span>
                    </div>
                    {prog.upfront > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, fontStyle: "italic" }}>
                        <span style={{ color: P.warmGrayLight }}>+ {prog.upfrontLabel}</span>
                        <span style={{ fontWeight: 600, color: P.warmGrayLight }}>{fmt(prog.upfront)}</span>
                      </div>
                    )}
                    {prog.isVA && prog.upfront === 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, fontStyle: "italic" }}>
                        <span style={{ color: P.sage, fontWeight: 600 }}>Funding Fee Waived</span>
                        <span style={{ fontWeight: 600, color: P.sage }}>$0</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingTop: 6, borderTop: prog.upfront > 0 || prog.isVA ? `1px solid ${P.creamDark}` : "none" }}>
                      <span style={{ color: P.warmGray }}>Total Loan Amount</span>
                      <span style={{ fontWeight: 700, color: prog.color }}>{fmt(prog.loan)}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", fontStyle: "italic" }}>{prog.note}</p>

                  {/* Pay it off faster */}
                  {(() => {
                    const cfg = getExtraConfig(prog.name);
                    const biweeklyEquivalent = Math.round(prog.pi / 12);
                    return (
                      <div style={{ marginTop: 12 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { enabled: !cfg.enabled }); }}
                          style={{
                            width: "100%",
                            background: cfg.enabled ? prog.color : P.cream,
                            color: cfg.enabled ? "#fff" : P.text,
                            border: `1px solid ${cfg.enabled ? prog.color : P.creamDark}`,
                            borderRadius: 8,
                            padding: "10px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: F.body,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "background 0.15s, color 0.15s, border-color 0.15s",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>⚡</span>
                            <span>Pay it off faster</span>
                          </span>
                          <span style={{ fontSize: 14, opacity: 0.7 }}>{cfg.enabled ? "▾" : "▸"}</span>
                        </button>

                        {cfg.enabled && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginTop: 10, padding: "14px 14px 12px", background: P.cream, borderRadius: 8, border: `1px solid ${P.creamDark}` }}
                          >
                            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 8 }}>Strategy</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
                              {[
                                { key: "monthly", label: "Monthly" },
                                { key: "annual", label: "Annual" },
                                { key: "biweekly", label: "Bi-weekly" },
                              ].map((s) => {
                                const active = cfg.strategy === s.key;
                                return (
                                  <button
                                    key={s.key}
                                    onClick={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { strategy: s.key }); }}
                                    style={{
                                      background: active ? prog.color : "#fff",
                                      color: active ? "#fff" : P.text,
                                      border: `1px solid ${active ? prog.color : P.creamDark}`,
                                      borderRadius: 6,
                                      padding: "8px 4px",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      fontFamily: F.body,
                                      cursor: "pointer",
                                      transition: "background 0.15s, color 0.15s, border-color 0.15s",
                                    }}
                                  >
                                    {s.label}
                                  </button>
                                );
                              })}
                            </div>

                            {cfg.strategy === "biweekly" ? (
                              <div style={{ background: "#fff", borderRadius: 6, padding: "10px 12px", border: `1px solid ${P.creamDark}` }}>
                                <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                                  Paying half your P&I every two weeks results in 26 half-payments (13 full) per year — one extra monthly payment, split into <strong style={{ color: P.text }}>{fmt(biweeklyEquivalent)}/mo</strong> equivalent.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 6 }}>
                                  Extra {cfg.strategy === "annual" ? "per year" : "per month"}
                                </label>
                                <div style={{ position: "relative" }}>
                                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: P.warmGrayLight, fontWeight: 600 }}>$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={cfg.amount || ""}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => { e.stopPropagation(); updateExtraConfig(prog.name, { amount: parseFloat(e.target.value) || 0 }); }}
                                    placeholder="0"
                                    style={{
                                      width: "100%",
                                      background: "#fff",
                                      border: `1px solid ${P.creamDark}`,
                                      borderRadius: 6,
                                      padding: "10px 12px 10px 24px",
                                      fontSize: 13,
                                      fontFamily: F.body,
                                      fontWeight: 600,
                                      color: P.text,
                                      outline: "none",
                                      boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Compute original vs improved scenarios */}
                            {(() => {
                              const isConv = prog.name === "Conventional";
                              const isFHA = prog.name === "FHA";

                              let miDropoffType = "none";
                              let miMonths = 0;
                              if (isConv && prog.mi > 0) {
                                miDropoffType = "ltv";
                                miMonths = term * 12;
                              } else if (isFHA) {
                                miDropoffType = "term";
                                miMonths = downPct < 10 ? term * 12 : 132;
                              }

                              const originalResult = generateAmortData(prog.loan, prog.rate, term, {
                                strategy: "none",
                                monthlyMI: prog.mi,
                                miMonths,
                                homeValue: homePrice,
                                miDropoffType,
                              });

                              const improvedResult = generateAmortData(prog.loan, prog.rate, term, {
                                strategy: cfg.strategy,
                                extraAmount: cfg.amount,
                                monthlyMI: prog.mi,
                                miMonths,
                                homeValue: homePrice,
                                miDropoffType,
                              });

                              const hasMeaningfulInput =
                                cfg.strategy === "biweekly" ||
                                (cfg.amount && cfg.amount > 0);

                              if (!hasMeaningfulInput) {
                                return (
                                  <div style={{ marginTop: 12, padding: "14px 16px", background: P.cream, borderRadius: 6, textAlign: "center" }}>
                                    <p style={{ fontSize: 12, color: P.warmGrayLight, fontStyle: "italic" }}>
                                      Enter an amount above to see your savings.
                                    </p>
                                  </div>
                                );
                              }

                              const interestSaved = originalResult.totalInterest - improvedResult.totalInterest;
                              const monthsSaved = originalResult.payoffMonth - improvedResult.payoffMonth;

                              const miSaved = originalResult.miPaidTotal - improvedResult.miPaidTotal;
                              const miMonthsSaved = (originalResult.miEndMonth || 0) - (improvedResult.miEndMonth || 0);
                              const showPmiNote = (isConv || isFHA) && miSaved > 100;

                              const headlineLabel =
                                cfg.strategy === "biweekly" ? "Bi-weekly payments" :
                                cfg.strategy === "annual" ? `$${cfg.amount.toLocaleString()}/year extra` :
                                `$${cfg.amount.toLocaleString()}/month extra`;

                              return (
                                <div style={{ marginTop: 12, background: "linear-gradient(135deg, " + P.creamDark + " 0%, " + P.cream + " 100%)", borderRadius: 8, padding: "14px 12px" }}>
                                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 2 }}>
                                      Your Impact
                                    </span>
                                    <div style={{ fontFamily: F.display, fontSize: 17, color: P.navy }}>
                                      {headlineLabel}
                                    </div>
                                  </div>

                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                                    <div style={{ background: "#fff", borderRadius: 6, padding: "10px 11px", borderTop: `2px solid ${P.warmGrayLight}` }}>
                                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.warmGrayLight, marginBottom: 4 }}>
                                        Original
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Loan term</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {formatPayoff(originalResult.payoffMonth)}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Total interest</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {fmt(originalResult.totalInterest)}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ background: "#fff", borderRadius: 6, padding: "10px 11px", borderTop: `2px solid ${P.gold}` }}>
                                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.gold, marginBottom: 4 }}>
                                        With extra
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Payoff in</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {formatPayoff(improvedResult.payoffMonth)}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10, color: P.warmGray, lineHeight: 1.2 }}>Total interest</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: P.navy, fontVariantNumeric: "tabular-nums", lineHeight: 1.25 }}>
                                          {fmt(improvedResult.totalInterest)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ background: P.navy, color: P.cream, borderRadius: 6, padding: "10px 14px", textAlign: "center" }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: P.goldLight, textTransform: "uppercase", marginBottom: 2 }}>
                                      You save
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: P.cream, fontVariantNumeric: "tabular-nums", lineHeight: 1.4 }}>
                                      <span style={{ display: "block" }}>
                                        <strong style={{ color: P.goldLight }}>{fmt(interestSaved)}</strong> in interest
                                      </span>
                                      <span style={{ display: "block", fontSize: 13, fontWeight: 500, opacity: 0.92, marginTop: 2 }}>
                                        Pay off <strong style={{ color: P.goldLight, fontWeight: 700 }}>{formatPayoff(monthsSaved)}</strong> sooner
                                      </span>
                                    </div>
                                  </div>

                                  {showPmiNote && (
                                    <div style={{ marginTop: 8, padding: "7px 11px", background: "rgba(184, 134, 11, 0.08)", borderRadius: 4, borderLeft: `2px solid ${P.gold}` }}>
                                      <p style={{ fontSize: 10.5, color: P.warmGray, lineHeight: 1.4 }}>
                                        <strong style={{ color: P.navy }}>{isFHA ? "Note:" : "Bonus:"}</strong>{" "}
                                        {isFHA
                                          ? `FHA MIP runs the life of the loan with <10% down, but ends ${formatPayoff(miMonthsSaved)} earlier with these payments.`
                                          : `PMI also drops off ${formatPayoff(miMonthsSaved)} earlier, saving an additional ${fmt(miSaved)}.`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* APR */}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: P.cream, borderRadius: 8, textAlign: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 2 }}>Est. APR</span>
                    <span style={{ fontFamily: F.display, fontSize: 22, color: prog.color }}>{prog.apr.toFixed(3)}%</span>
                    <p style={{ fontSize: 9, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4 }}>Includes lender fees{prog.upfront > 0 ? `, ${prog.upfrontLabel}` : ""}{prog.mi > 0 ? ", monthly MI" : ""}. <a href={`/cash-to-close?price=${homePrice}&down=${downPct}&term=${term}&program=${encodeURIComponent(prog.name)}&rate=${prog.rate}&state=${taxState}&metro=${encodeURIComponent(taxMetro)}${prog.isVA ? `&vaUsage=${vaUsage}` : ""}${hoa > 0 ? `&hoa=${hoa}` : ""}`} style={{ color: P.warmGrayLight, textDecoration: "underline" }}>Full APR detail →</a></p>
                    <p style={{ fontSize: 8, color: P.warmGrayLight, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.</p>
                  </div>
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

        {/* Save to Comparison */}
        {(() => {
          const selectedProg = selectedProgram ? programs.find(p => p.name === selectedProgram && p.eligible) : null;
          const saveScenario = () => {
            if (!selectedProg) return;
            const STORAGE_KEY = "mg_compare_scenarios";
            let saved = [];
            try { const raw = localStorage.getItem(STORAGE_KEY); saved = raw ? JSON.parse(raw) : []; } catch {}
            if (saved.length >= 3) {
              setSaveToast({ type: "error", msg: "Comparison is full (3 max). Remove one first." });
              setTimeout(() => setSaveToast(null), 4000);
              return;
            }
            const scenario = {
              id: Date.now(),
              program: selectedProg.name,
              color: selectedProg.color,
              homePrice, downPct, downAmt, term, rate: selectedProg.rate,
              baseLoan, totalLoan: selectedProg.loan,
              upfront: selectedProg.upfront || 0,
              upfrontLabel: selectedProg.upfrontLabel || null,
              loan: selectedProg.loan, pi: selectedProg.pi, mi: selectedProg.mi,
              tax: taxes, insurance, hoa: hoa > 0 ? hoa : 0, total: selectedProg.total, apr: selectedProg.apr,
            };
            saved.push(scenario);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
            setSaveToast({ type: "success", msg: `${selectedProg.name} saved! ${saved.length} of 3 in comparison.` });
            setTimeout(() => setSaveToast(null), 4000);
          };
          return (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <button onClick={saveScenario} disabled={!selectedProg} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 10, border: "none",
                background: selectedProg ? P.navy : P.creamDark,
                color: selectedProg ? "#fff" : P.warmGrayLight,
                fontFamily: F.body, fontSize: 14, fontWeight: 600,
                cursor: selectedProg ? "pointer" : "not-allowed",
                boxShadow: selectedProg ? "0 4px 16px rgba(27,58,75,0.25)" : "none",
                transition: "all 0.2s",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <CompareIcon size={18} variant="cream" />
                  {selectedProg ? `Save ${selectedProg.name} to Loan Comparison` : "Select a card above to save"}
                </span>
              </button>
              {saveToast && (
                <p style={{ fontSize: 12, marginTop: 10, fontWeight: 600, color: saveToast.type === "error" ? "#C0392B" : P.sage }}>{saveToast.msg}</p>
              )}
              <div style={{ marginTop: 10 }}>
                <a href="/compare" style={{ fontSize: 12, color: P.warmGrayLight, textDecoration: "underline", fontFamily: F.body }}>View saved scenarios →</a>
              </div>
            </div>
          );
        })()}

        {/* Cross-link to prequal */}

        {/* Disclaimer */}
        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          {ratesLoaded ? "Rates auto-populated from current national averages (Mortgage News Daily) and rounded to the nearest 0.125%. " : ""}
          This calculator is for educational purposes only. Actual rates, fees, and payment amounts vary by lender, credit profile, and loan scenario. Contact me at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a> for a personalized quote. NMLS# 1119524.
        </p>
      </div>
      <MobileToolbar hrefOverrides={{ "/prequal": `/prequal?down=${downPct}&term=${term}` }} />
    </div>
  );
}

function InstallPage() {
  // Auto-detect OS from user agent. Default to iOS if unclear (iOS has the worst
  // discoverability for Add to Home Screen, so it's the more important case to surface).
  const [os, setOs] = useState(() => {
    if (typeof navigator === "undefined") return "ios";
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    return "ios";
  });

  // Detect if user is on iOS but NOT in Safari — critical edge case since
  // Chrome/Brave/Firefox on iOS CANNOT install PWAs (Apple restricts this to Safari).
  const isIosNotSafari = (() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const iOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Brave/i.test(ua);
    return iOS && !isSafari;
  })();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/install");
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Clipboard API unavailable (very rare on modern iOS) — fall back to manual prompt
      window.prompt("Copy this URL and paste it into Safari:", window.location.origin + "/install");
    }
  };

  const Step = ({ num, title, body }) => (
    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: P.gold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontSize: 16, fontWeight: 700 }}>{num}</div>
      <div style={{ flex: 1, paddingTop: 3 }}>
        <h4 style={{ fontFamily: F.display, fontSize: 17, color: P.navy, marginBottom: 4 }}>{title}</h4>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: P.warmGray }}>{body}</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 8 }}>One-Tap Access</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 10 }}>Install The Mortgage Geek</h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>Add this site to your home screen and it works like a real app — launches full-screen with its own icon, opens faster, and works offline.</p>
        </div>

        {/* Why install micro-section */}
        <div className="content-card" style={{ padding: "20px 22px", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>🚀</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Faster</strong><br/>Launches instantly, no typing URLs.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>📱</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Full-screen</strong><br/>No browser bars — feels like an app.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>⚡</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Works offline</strong><br/>Reference content loads without signal.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>🔒</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Private</strong><br/>No App Store account, no tracking.</p></div>
          </div>
        </div>

        {/* OS tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, background: P.creamDark, padding: 4, borderRadius: 10 }}>
          <button onClick={() => setOs("ios")} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: os === "ios" ? P.navy : "transparent", color: os === "ios" ? "#fff" : P.warmGray, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🍎 iPhone / iPad</button>
          <button onClick={() => setOs("android")} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: os === "android" ? P.navy : "transparent", color: os === "android" ? "#fff" : P.warmGray, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🤖 Android</button>
        </div>

        {/* iOS instructions */}
        {os === "ios" && (
          <div className="content-card" style={{ padding: "28px 24px" }}>
            {isIosNotSafari && (
              <div style={{ background: `${P.gold}15`, border: `1px solid ${P.gold}`, borderRadius: 10, padding: "16px 18px", marginBottom: 24 }}>
                <strong style={{ color: P.navy, fontSize: 13, display: "block", marginBottom: 6 }}>⚠️ You're not in Safari</strong>
                <p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.6, marginBottom: 12 }}>Apple restricts app installation to Safari only on iPhone/iPad — Chrome, Brave, and Firefox can't install web apps on iOS. Copy the link below, then paste it into Safari's address bar.</p>
                <button onClick={copyCurrentUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, background: copiedUrl ? P.sage : P.navy, color: "#fff", border: "none", fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                  {copiedUrl ? (<><span>✓</span><span>Copied — now open Safari</span></>) : (<><span>📋</span><span>Copy install link</span></>)}
                </button>
              </div>
            )}
            <Step num="1" title="Open in Safari" body="Make sure you're in Safari — not Chrome, Brave, or another browser. Apple only allows Safari to install web apps on iPhone." />
            <Step num="2" title="Tap the Share button" body="It's the square icon with an up arrow, at the bottom of the screen on iPhone or top-right on iPad." />
            <Step num="3" title='Scroll and tap "Add to Home Screen"' body="You may need to scroll down the share sheet to find it. The icon looks like a plus sign inside a square." />
            <Step num='4' title='Confirm "Open as Web App" is ON' body={'This toggle (new in iOS 17+) is crucial — it\'s what makes the app launch full-screen instead of just opening Safari. Leave it enabled.'} />
            <Step num="5" title="Tap Add" body="The icon appears on your home screen. Tap it any time to launch The Mortgage Geek full-screen." />
          </div>
        )}

        {/* Android instructions */}
        {os === "android" && (
          <div className="content-card" style={{ padding: "28px 24px" }}>
            <Step num="1" title="Open in Chrome" body="Chrome on Android has the best PWA install support. Samsung Internet also works, but Firefox and Brave on Android have inconsistent behavior." />
            <Step num="2" title="Tap the three-dot menu" body="In the top-right corner of Chrome. The menu will slide down with a list of options." />
            <Step num="3" title='Tap "Install app" or "Add to Home screen"' body="The exact label depends on your Chrome version. If you see an install prompt banner at the bottom of the screen, you can just tap that instead." />
            <Step num="4" title="Confirm Install" body="A dialog asks you to confirm. Tap Install. The Mortgage Geek icon is added to your app drawer and home screen." />
            <Step num="5" title="Launch it like any app" body="Tap the icon to open full-screen with no Chrome UI. It behaves just like a native app." />
          </div>
        )}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Questions? Call Nick at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a>. No account needed — just tap the icon.
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
    if (path === "about") return "about";
    if (path === "compare") return "compare";
    if (path === "cash-to-close") return "cashtoclose";
    if (path === "install") return "install";
    return "main";
  });

  const renderPage = () => {
    if (currentPage === "calculator") return <CalculatorPage />;
    if (currentPage === "prequal") return <PreQualPage />;
    if (currentPage === "about") return <AboutPage />;
    if (currentPage === "compare") return <ComparePage />;
    if (currentPage === "cashtoclose") return <CashToClosePage />;
    if (currentPage === "install") return <InstallPage />;
    return <MainSite />;
  };

  return (<>{renderPage()}<WelcomeToast /></>);
}

// One-time welcome toast shown to newly-installed PWA users on their first
// launch from the home screen. Uses a localStorage flag to ensure it only
// appears once per installation. Auto-dismisses after 6 seconds; also
// dismissible via the × button for users who tap it quickly.
function WelcomeToast() {
  const isStandalone = useIsStandalone();
  const STORAGE_KEY = "mg_welcomed_pwa";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isStandalone) return;
    let welcomed = false;
    try { welcomed = localStorage.getItem(STORAGE_KEY) === "1"; } catch {}
    if (welcomed) return;
    // Small delay so it doesn't flash the moment the app opens — feels more intentional
    const showTimer = setTimeout(() => setVisible(true), 600);
    const hideTimer = setTimeout(() => setVisible(false), 6600);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [isStandalone]);

  if (!visible) return null;
  return (
    <div role="status" style={{
      position: "fixed", left: 16, right: 16, bottom: `calc(20px + env(safe-area-inset-bottom, 0px))`,
      maxWidth: 480, margin: "0 auto", zIndex: 300,
      background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`,
      color: "#fff", borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 12px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
      border: `1px solid ${P.gold}40`,
      animation: "mg-toast-in 0.4s ease-out",
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>🎉</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontFamily: F.display, fontSize: 15, color: P.goldLight, display: "block", lineHeight: 1.2 }}>You're installed!</strong>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>The Mortgage Geek is now on your home screen. Welcome.</span>
      </div>
      <button onClick={() => setVisible(false)} aria-label="Dismiss" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  );
}

function MainSite() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();
  // Signals that a navigation just occurred, so the scroll-lock cleanup
  // should skip restoring the previous scroll position (the navigation
  // handler is scrolling to the target section). Prevents a race where
  // the scroll-restore overrides scrollIntoView on mobile nav clicks.
  const skipScrollRestore = useRef(false);
  const skipTransition = useRef(false);

  // Scroll-lock: when sidebar is open, add `sidebar-locked` class to <html>.
  // CSS then applies overflow:hidden + height:100% to html/body so neither
  // can scroll. preventDefault on document touchmove (outside the sidebar)
  // is kept as belt-and-suspenders for iOS Safari.
  useLayoutEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add("sidebar-locked");
      const onTouchMove = (e) => {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar && sidebar.contains(e.target)) return;
        e.preventDefault();
      };
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      return () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.documentElement.classList.remove("sidebar-locked");
        if (skipScrollRestore.current) {
          skipScrollRestore.current = false;
        }
      };
    }
  }, [mobileOpen]);

  // Swipe-to-open/close sidebar — X-style reveal (main content slides right)
  useEffect(() => {
    const SIDEBAR_W = 280;
    const EDGE_ZONE = window.innerWidth;
    const SNAP_THRESHOLD = 80;
    let startX = 0, startY = 0, currentX = 0;
    let tracking = false, dirLocked = false, isHorizontal = false;
    let mode = null; // "opening" or "closing"
    let scrollBlocker = null;

    const getMain = () => document.querySelector(".main-content");
    const getBar = () => document.querySelector(".mobile-bar");

    const addScrollBlocker = () => {
      if (scrollBlocker) return;
      scrollBlocker = (e) => { e.preventDefault(); };
      document.addEventListener("touchmove", scrollBlocker, { passive: false });
    };
    const removeScrollBlocker = () => {
      if (!scrollBlocker) return;
      document.removeEventListener("touchmove", scrollBlocker);
      scrollBlocker = null;
    };

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
        const main = getMain();
        const bar = getBar();
        if (main) main.classList.add("sidebar-dragging");
        if (bar) bar.classList.add("sidebar-dragging");
        addScrollBlocker();
      }

      if (!dirLocked || !isHorizontal) return;

      const main = getMain();
      const bar = getBar();
      if (!main) return;

      if (mode === "opening") {
        const dragPx = Math.max(0, Math.min(dx, SIDEBAR_W));
        const pct = dragPx / SIDEBAR_W;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${dragPx}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${dragPx}px)`;
      } else if (mode === "closing") {
        const dragPx = Math.max(0, Math.min(-dx, SIDEBAR_W));
        const pct = 1 - (dragPx / SIDEBAR_W);
        const offset = SIDEBAR_W - dragPx;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${offset}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${offset}px)`;
      }
    };

    const onTouchEnd = () => {
      if (!tracking || !isHorizontal) { tracking = false; return; }
      const dx = currentX - startX;
      const main = getMain();
      const bar = getBar();

      // Re-enable CSS transitions for snap
      if (main) main.classList.remove("sidebar-dragging");
      if (bar) bar.classList.remove("sidebar-dragging");

      // Clear inline styles — let CSS classes handle the snap
      if (main) { main.style.transform = ""; main.style.borderRadius = ""; main.style.removeProperty("--sidebar-dim"); }
      if (bar) bar.style.transform = "";
      removeScrollBlocker();

      if (mode === "opening" && dx > SNAP_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(10);
        setMobileOpen(true);
      } else if (mode === "closing" && dx < -SNAP_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(10);
        setMobileOpen(false);
      }

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
      removeScrollBlocker();
    };
  }, [mobileOpen]);

  // Overscroll bounce is prevented via CSS `overscroll-behavior: none` on
  // body and .main-content (see globalCSS). A prior JS implementation attached
  // a non-passive touchmove listener to document, which froze scrolling on
  // Android Chrome because it forces touchmove onto the JS main thread and
  // disables compositor scrolling. CSS handles the same job natively on
  // iOS Safari 16+ and all modern Android browsers.

  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // If sidebar is open on mobile, we need to close it FIRST so the body
      // becomes unfrozen before scrollIntoView runs. Set the skip flag so the
      // cleanup doesn't restore the old scroll position, then defer the scroll.
      if (mobileOpen) {
        // Disable transition so content snaps back instantly (no navy flash)
        const main = document.querySelector(".main-content");
        const bar = document.querySelector(".mobile-bar");
        if (main) main.style.transition = "none";
        if (bar) bar.style.transition = "none";
        setMobileOpen(false);
        // Wait one frame for DOM to update, then scroll and restore transitions
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "instant", block: "start" });
          window.history.replaceState(null, "", `#${id}`);
          requestAnimationFrame(() => {
            if (main) main.style.transition = "";
            if (bar) bar.style.transition = "";
          });
        });
      } else {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        window.history.replaceState(null, "", `#${id}`);
      }
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
          setTimeout(() => el.scrollIntoView({ behavior: "instant", block: "start" }), 300);
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
    <div className="app-root" style={{ fontFamily: F.body, color: P.text, display: "flex", minHeight: "100vh", minHeight: "100dvh" }}>
      <style>{globalCSS}</style>
      <Sidebar activeSection={activeSection === "process" ? "getting-started" : activeSection} onNavigate={handleNavigate} onSubNavigate={handleSubNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className={`main-content ${mobileOpen ? "main-content-open" : ""}`} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} onClick={(e) => { if (mobileOpen) { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(false); } }}>
        <Hero onNavigate={handleNavigate} />
        <JourneyOverview onNavigate={handleSubNavigate} />
        <PreContract navTarget={navTarget} />
        <ActiveLoanProcess navTarget={navTarget} />
        <MortgageTypes navTarget={navTarget} />
        <MortgageStructure navTarget={navTarget} />
        <BorrowerProfile navTarget={navTarget} />
        <InterestRates navTarget={navTarget} />
        <ClosingCosts navTarget={navTarget} />
        <NextSteps />
        <ToolsCTA />
        <PreApprovalChecklist />
        <JargonDecoder />
        <footer style={{ padding: "40px 40px 32px", borderTop: `1px solid ${P.creamDark}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap", maxWidth: 720 }}>
            {/* Disclaimer text */}
            <div style={{ flex: 1, minWidth: 250 }}>
              <p style={{ fontFamily: F.display, fontSize: 18, color: P.navy, marginBottom: 2 }}>The Mortgage Geek 🤓</p>
              <p style={{ fontFamily: F.display, fontSize: 12, color: P.gold, fontStyle: "italic", marginBottom: 12, letterSpacing: 0.3 }}>Mortgages Demystified.</p>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: P.warmGrayLight, marginBottom: 8 }}>
                This content is for educational purposes only and does not constitute financial advice. Loan programs, rates, terms, and guidelines are subject to change without notice. Always consult directly with a licensed mortgage professional for guidance specific to your situation.
              </p>
              <p style={{ fontSize: 11, color: P.warmGrayLight, opacity: 0.6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span>(615) 656-0737 · NMLS# 1119524 ·</span>
                <svg width="11" height="12" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
                  <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                  <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
                  <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
                </svg>
                <span>Equal Housing Lender</span>
              </p>
            </div>
          </div>
        </footer>
      </main>

      {!mobileOpen && <MobileToolbar />}
    </div>
  );
}

// ─── Global CSS ──────────────────────────────────────────────────────────────

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #FAF7F2; }
  body { background: #FAF7F2; margin: 0; min-height: 100vh; min-height: 100dvh; }
  #root { min-height: 100vh; min-height: 100dvh; }
  html { scroll-behavior: auto; }

  /* PWA safe-area handling: adds padding equal to iOS status bar height when
     running as an installed home-screen app with black-translucent status bar.
     Adds 0 in regular browsers, ~47px on modern iPhones in standalone mode.
     Also makes tool page headers sticky on scroll. */
  .pwa-safe-top { padding-top: calc(20px + env(safe-area-inset-top, 0px)) !important; position: sticky; top: 0; z-index: 100; }
  @media (max-width: 900px) { .pwa-safe-top { position: fixed !important; top: 0; left: 0; right: 0; z-index: 200; }
    .tool-page-content { padding-top: calc(100px + env(safe-area-inset-top, 0px)) !important; } }
  .pwa-safe-top-sidebar { padding-top: calc(32px + env(safe-area-inset-top, 0px)) !important; }
  body { padding-bottom: 0; }

  /* Hide Call/Text button labels on narrow screens — keeps the tool page headers
     from wrapping to two rows. Icons remain as universal glyphs. */
  @media (max-width: 520px) {
    .btn-label-mobile-hide { display: none; }
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }

  .main-content { flex: 1; margin-left: 280px; min-width: 0; }
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: #0F2530; z-index: 150; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom, 0px); }
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

  section[id], [id^="costs-cat-"], #costs-trid { scroll-margin-top: calc(16px + env(safe-area-inset-top, 0px)); }

  /* When sidebar is open, freeze document scroll via overflow:hidden.
     touch-action:none prevents iOS touch-scroll from driving the root
     scroller. We intentionally DO NOT set height:100% here — doing so
     reflows html/body and causes iOS to visually jump the viewport back
     to the top of the page while locked. overflow:hidden alone locks
     scrolling while preserving the current scroll position. */
  html.sidebar-locked,
  html.sidebar-locked body { overflow: hidden !important; touch-action: none !important; }

  /* App root: inherit html/body background (cream on desktop, navy on mobile).
     Prevents a flash of cream showing behind the sidebar during fast swipes. */
  .app-root { background: transparent; }

  @media (max-width: 900px) {
    html, body { background: #0F2530 !important; }
    body { overflow-x: hidden; overscroll-behavior: none; -webkit-overflow-scrolling: touch; }
    section[id], [id^="costs-cat-"], #costs-trid { scroll-margin-top: calc(64px + env(safe-area-inset-top, 0px)); }
    .sidebar { transform: translateZ(0); padding-top: calc(56px + env(safe-area-inset-top, 0px)); padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); z-index: 100; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; top: 0; left: 0; width: 280px; height: 100vh; height: 100dvh; bottom: auto; }
    .sidebar::before { content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0F2530; z-index: -1; }
    .sidebar-open { transform: none; }
    .sidebar-dragging { transition: none !important; }
    .sidebar-overlay { display: none; }
    .sidebar-overlay-visible { display: none; }
    .mobile-bar { display: block !important; position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: #0F2530; border-bottom: 1px solid rgba(255,255,255,0.06); padding-top: env(safe-area-inset-top, 0px); transition: transform 0.3s ease; will-change: transform; }
    .mobile-bar-open { transform: translateX(280px); }
    /* will-change: transform is permanent on mobile so the compositor layer
       exists BEFORE the sidebar-open transition starts. On iOS, applying
       will-change at the same frame as a transform change caused the element
       to snap to end-state before the layer was ready, making main-content
       arrive ahead of the (already composited) .mobile-bar.

       touch-action: pan-y blocks iOS from interpreting horizontal drags as
       a native pan/back-swipe gesture on main-content. Without this, iOS
       was compounding its own horizontal gesture with our JS translateX,
       causing main-content to drag much further right than the finger and
       snap back on release. The header is position:fixed so iOS native
       gestures don't affect it — hence it was the only element that moved
       correctly before this fix. */
    .main-content { margin-left: 0 !important; padding-top: calc(56px + env(safe-area-inset-top, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px); transition: transform 0.3s ease, border-radius 0.3s ease; position: relative; z-index: 130; background: #FAF7F2; min-height: 100dvh; will-change: transform; touch-action: pan-y; }
    .main-content::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); opacity: var(--sidebar-dim, 0); pointer-events: none; transition: opacity 0.3s ease; z-index: 9999; }
    .main-content-open { transform: translateX(280px); border-radius: 16px 0 0 0; overflow: hidden; box-shadow: -4px 0 24px rgba(0,0,0,0.15); --sidebar-dim: 1; }
    .main-content-open::after { pointer-events: auto; }
    .process-grid { flex-direction: column; }
    .process-steps { flex: 1 1 auto; }
    /* Mobile accordion: detail panel renders inline below its active step button
       instead of as a sibling column. Reduce padding for tighter mobile fit. */
    .process-steps .process-detail { margin: 4px 0 12px; padding: 24px 20px; }
    .calc-grid { flex-direction: column; }
    .calc-grid > *:first-child, .calc-grid > *:last-child { flex: 1 1 auto; }
  }
  @media (max-width: 600px) {
    section { padding-left: 20px !important; padding-right: 20px !important; }
  }

  @keyframes mg-toast-in {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes rate-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.9; }
  }
`;
