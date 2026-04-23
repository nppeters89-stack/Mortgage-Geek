// ─── Shared Tax Rate Tables ──────────────────────────────────────────────────
// Single source of truth for state/metro property tax rates used across the
// Calculator, Pre-Qual, and Cash to Close tools. When updating rates, update
// here and all three tools will reflect the change.

// 2026 loan limits (1-unit) referenced by SHARED_STATE_TAX_RATES metros.
export const DEFAULT_LIMITS = { fha: 541287, conv: 832750, va: 832750 };
export const NASH_MSA_LIMITS = { fha: 1029250, conv: 1029250, va: 1029250 };
export const ATL_MSA_LIMITS = { fha: 718750, conv: 832750, va: 832750 };

// Used by PreQualPage and CalculatorPage. Rates are expressed as percentages
// (e.g., 0.95 = 0.95% effective annual rate). Some metros include FHA/Conv/VA
// loan limits for Pre-Qual's max-affordability calculation.
export const SHARED_STATE_TAX_RATES = {
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
export const CASH_STATE_DEFAULT_TAX_RATES = {
  AL:0.0040, AK:0.0117, AZ:0.0066, AR:0.0087, CA:0.0073, CO:0.0051, CT:0.0214, DE:0.0061, DC:0.0062,
  FL:0.0091, GA:0.0090, HI:0.0028, ID:0.0069, IL:0.0223, IN:0.0085, IA:0.0157, KS:0.0141, KY:0.0085,
  LA:0.0055, ME:0.0136, MD:0.0109, MA:0.0123, MI:0.0154, MN:0.0112, MS:0.0110, MO:0.0097, MT:0.0084,
  NE:0.0173, NV:0.0060, NH:0.0218, NJ:0.0249, NM:0.0080, NY:0.0173, NC:0.0084, ND:0.0098, OH:0.0156,
  OK:0.0090, OR:0.0093, PA:0.0158, RI:0.0163, SC:0.0057, SD:0.0132, TN:0.0075, TX:0.0180, UT:0.0066,
  VT:0.0190, VA:0.0082, WA:0.0098, WV:0.0058, WI:0.0185, WY:0.0061,
};

// Metro-level tax rate overrides for Cash to Close (decimal format).
export const CASH_STATE_METROS = {
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
export const ALL_STATES_LIST = [
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
