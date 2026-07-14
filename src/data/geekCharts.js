// Geek Charts registry + chart datasets. GEEK_CHARTS drives the hub cards, so
// adding a chart later means adding one entry here plus one page. Data arrays
// are annual figures; 2026 uses the Q1 2026 ASPUS home price and Jul 9 2026 spot
// gold. ratio = home price / gold price.

export const GEEK_CHARTS = [
  {
    slug: "gold-to-housing-ratio",
    title: "The Gold-to-Housing Ratio",
    tagline: "How many ounces of gold it takes to buy the average American home. Right now: the fewest ever recorded.",
    period: "1970 to 2026",
    updated: "2026-07-09",
  },
  {
    slug: "treasury-yield-mortgage-rates",
    title: "The 10-Year Treasury and the 30-Year Mortgage",
    tagline: "Seventy years of the benchmark rate that sets mortgage pricing, and the mortgage rate riding on top of it. Today sits near the long-run normal.",
    period: "1953 to 2026",
    updated: "2026-07-09",
  },
  {
    slug: "home-prices-income-inflation",
    title: "Home Prices, Inflation, and Family Income",
    tagline: "Three lines, one race, 55 years. Homes rose 19.5x, incomes 10.7x, inflation 8.3x. The gap is the whole story.",
    period: "1970 to 2025",
    updated: "2026-07-09",
  },
];

// Long-run average ratio (ounces of gold to buy the average home), 1970 to 2026.
export const LONG_RUN_AVG = 374;

const years = Array.from({ length: 2026 - 1970 + 1 }, (_, i) => 1970 + i);

const ratio = [739.9, 691.8, 514.8, 360.4, 251.5, 264.4, 385.2, 367.6, 324.2, 235.0, 124.2, 180.8,
  223.0, 211.7, 270.2, 318.1, 304.6, 285.4, 317.3, 388.8, 388.7, 406.7, 420.8, 409.9, 401.5, 411.0,
  426.8, 528.3, 615.7, 697.8, 735.8, 778.7, 731.9, 673.0, 664.2, 654.9, 503.6, 445.5, 331.5, 277.0,
  222.1, 168.4, 172.7, 227.9, 272.8, 302.0, 287.5, 303.2, 301.5, 272.8, 219.2, 251.7, 286.9, 261.0,
  212.1, 151.4, 124.2];

const home = [26650, 28100, 30075, 35100, 38725, 42525, 48050, 54350, 62700, 71900, 76375, 83175, 83850,
  89775, 97550, 100825, 112075, 127575, 138650, 148125, 149075, 147275, 144675, 147475, 154175,
  157750, 165525, 174875, 181150, 194675, 205375, 211050, 226700, 244550, 272125, 291275, 303900,
  309800, 289075, 269350, 272025, 264600, 288225, 321650, 345450, 350450, 359650, 381150, 382475,
  379875, 387900, 452675, 516425, 507125, 507875, 519700, 514600];

const gold = [36.02, 40.62, 58.42, 97.39, 154.00, 160.86, 124.74, 147.84, 193.40, 306.00, 615.00,
  460.00, 376.00, 424.00, 361.00, 317.00, 368.00, 447.00, 437.00, 381.00, 383.51, 362.11, 343.82,
  359.77, 384.00, 383.79, 387.81, 331.02, 294.24, 278.98, 279.11, 271.04, 309.73, 363.38, 409.72,
  444.74, 603.46, 695.39, 871.96, 972.35, 1224.53, 1571.52, 1668.98, 1411.23, 1266.40, 1160.60,
  1250.74, 1257.12, 1268.49, 1392.60, 1769.64, 1798.61, 1800.03, 1942.72, 2394.86, 3431.54,
  4143.59];

export const GOLD_HOUSING_RATIO = { years, ratio, home, gold };

// The 10-Year Treasury and the 30-Year Mortgage, 1953 to 2026. treasury is the
// 10-yr constant-maturity annual average (Fed H.15 / FRED GS10; 1953 = Apr-Dec).
// mortgage is Freddie Mac PMMS 30-yr fixed annual average (FRED MORTGAGE30US),
// series starts April 1971, so 1953 to 1970 are null (Recharts breaks the line).
// trend is a trailing 10-year simple moving average of treasury, precomputed
// (not recomputed at runtime), first value 1962 so 1953 to 1961 are null. 2026
// values are spot readings as of Jul 9, 2026. Each series aligns to rYears by
// index with null padding where it has not started.
const rYears = Array.from({ length: 2026 - 1953 + 1 }, (_, i) => 1953 + i);

const treasury = [2.85, 2.40, 2.82, 3.18, 3.65, 3.32, 4.33, 4.12, 3.88, 3.95, 4.00, 4.19, 4.28, 4.92, 5.07, 5.65, 6.67,
  7.35, 6.16, 6.21, 6.84, 7.56, 7.99, 7.61, 7.42, 8.41, 9.44, 11.46, 13.91, 13.00, 11.10, 12.44, 10.62,
  7.68, 8.38, 8.85, 8.50, 8.55, 7.86, 7.01, 5.87, 7.08, 6.58, 6.44, 6.35, 5.26, 5.64, 6.03, 5.02, 4.61,
  4.01, 4.27, 4.29, 4.79, 4.63, 3.67, 3.26, 3.21, 2.79, 1.80, 2.35, 2.54, 2.14, 1.84, 2.33, 2.91, 2.14,
  0.89, 1.44, 2.95, 3.96, 4.21, 4.29, 4.55];

// Freddie Mac 30-yr fixed, 1971 to 2026 (56 values); padded with 18 leading nulls (1953-1970).
const mortgageFrom1971 = [7.54, 7.38, 8.04, 9.19, 9.05, 8.87, 8.85, 9.64, 11.20, 13.74, 16.64, 16.04, 13.24, 13.88, 12.43,
  10.19, 10.21, 10.34, 10.32, 10.13, 9.25, 8.39, 7.31, 8.38, 7.93, 7.81, 7.60, 6.94, 7.44, 8.05, 6.97,
  6.54, 5.83, 5.84, 5.87, 6.41, 6.34, 6.03, 5.04, 4.69, 4.45, 3.66, 3.98, 4.17, 3.85, 3.65, 3.99, 4.54,
  3.94, 3.11, 2.96, 5.34, 6.81, 6.72, 6.47, 6.43];
const mortgage = [...Array(1971 - 1953).fill(null), ...mortgageFrom1971];

// Trailing 10-yr SMA of treasury, 1962 to 2026 (65 values); padded with 9 leading nulls (1953-1961).
const trendFrom1962 = [3.45, 3.56, 3.74, 3.89, 4.06, 4.21, 4.44, 4.67, 5.00, 5.22, 5.45, 5.73, 6.07, 6.44, 6.71, 6.95, 7.22,
  7.50, 7.91, 8.68, 9.36, 9.79, 10.28, 10.54, 10.55, 10.64, 10.69, 10.59, 10.30, 9.70, 9.10, 8.58, 8.04,
  7.64, 7.51, 7.31, 6.95, 6.66, 6.41, 6.13, 5.89, 5.70, 5.42, 5.19, 5.03, 4.85, 4.70, 4.46, 4.18, 3.95,
  3.67, 3.51, 3.33, 3.12, 2.82, 2.59, 2.52, 2.41, 2.17, 2.04, 2.15, 2.31, 2.48, 2.70, 2.97];
const trend = [...Array(1962 - 1953).fill(null), ...trendFrom1962];

export const RATES_HISTORY = { years: rYears, treasury, mortgage, trend };

// Home Prices, Inflation, and Family Income, 1970 to 2025. All three series are
// indexed to 1970 = 100 (homeIdx / cpiIdx / incomeIdx); the raw dollar and CPI
// levels (home / income / cpi) back the tooltip. income and incomeIdx run only
// through 2024 (the latest Census median family income), null-padded to 2025 so
// the line ends cleanly with no interpolation. Precomputed; not recomputed here.
const piYears = Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 1970 + i);

const homeIdx = [100.0, 105.4, 112.9, 131.7, 145.3, 159.6, 180.3, 203.9, 235.3, 269.8, 286.6, 312.1, 314.6, 336.9,
  366.0, 378.3, 420.5, 478.7, 520.3, 555.8, 559.4, 552.6, 542.9, 553.4, 578.5, 591.9, 621.1, 656.2,
  679.7, 730.5, 770.6, 791.9, 850.7, 917.6, 1021.1, 1093.0, 1140.3, 1162.5, 1084.7, 1010.7, 1020.7,
  992.9, 1081.5, 1206.9, 1296.2, 1315.0, 1349.5, 1430.2, 1435.2, 1425.4, 1455.5, 1698.6, 1937.8,
  1902.9, 1905.7, 1950.1];

const cpiIdx = [100.0, 104.4, 107.7, 114.4, 127.1, 138.7, 146.6, 156.2, 168.0, 187.1, 212.4, 234.3, 248.7, 256.7,
  267.8, 277.3, 282.5, 292.8, 304.9, 319.6, 336.9, 351.0, 361.6, 372.4, 382.0, 392.8, 404.4, 413.7,
  420.1, 429.4, 443.8, 456.4, 463.7, 474.2, 486.9, 503.4, 519.6, 534.3, 554.9, 552.8, 562.1, 579.6,
  591.8, 600.5, 610.1, 610.8, 618.6, 631.7, 647.2, 659.0, 667.0, 698.5, 754.4, 785.3, 808.5, 830.4];

const incomeIdx = [100.0, 104.3, 112.7, 122.1, 130.7, 139.0, 151.6, 162.3, 178.8, 198.5, 213.0, 226.9, 237.5, 249.1,
  267.9, 281.1, 298.6, 313.9, 326.2, 346.7, 358.3, 364.2, 370.6, 374.6, 393.0, 411.6, 428.7, 451.7,
  473.7, 494.9, 514.1, 521.0, 523.8, 533.9, 547.9, 569.5, 592.0, 621.9, 623.5, 609.0, 610.5, 617.9,
  630.8, 663.5, 675.3, 716.5, 736.9, 771.7, 797.1, 871.7, 854.9, 897.8, 940.0, 1021.6, 1072.3, null];

const piHome = [26650, 28100, 30075, 35100, 38725, 42525, 48050, 54350, 62700, 71900, 76375, 83175, 83850, 89775,
  97550, 100825, 112075, 127575, 138650, 148125, 149075, 147275, 144675, 147475, 154175, 157750,
  165525, 174875, 181150, 194675, 205375, 211050, 226700, 244550, 272125, 291275, 303900, 309800,
  289075, 269350, 272025, 264600, 288225, 321650, 345450, 350450, 359650, 381150, 382475, 379875,
  387900, 452675, 516425, 507125, 507875, 519700];

const cpiLevel = [38.8, 40.5, 41.8, 44.4, 49.3, 53.8, 56.9, 60.6, 65.2, 72.6, 82.4, 90.9, 96.5, 99.6, 103.9, 107.6,
  109.6, 113.6, 118.3, 124.0, 130.7, 136.2, 140.3, 144.5, 148.2, 152.4, 156.9, 160.5, 163.0, 166.6,
  172.2, 177.1, 179.9, 184.0, 188.9, 195.3, 201.6, 207.3, 215.3, 214.5, 218.1, 224.9, 229.6, 233.0,
  236.7, 237.0, 240.0, 245.1, 251.1, 255.7, 258.8, 271.0, 292.7, 304.7, 313.7, 322.2];

const piIncome = [9867, 10290, 11120, 12050, 12900, 13720, 14960, 16010, 17640, 19590, 21020, 22390, 23430, 24580,
  26430, 27740, 29460, 30970, 32190, 34210, 35350, 35940, 36570, 36960, 38780, 40610, 42300, 44570,
  46740, 48830, 50730, 51410, 51680, 52680, 54060, 56190, 58410, 61360, 61520, 60090, 60240, 60970,
  62240, 65470, 66630, 70700, 72710, 76140, 78650, 86010, 84350, 88590, 92750, 100800, 105800, null];

export const PRICES_INCOME_INFLATION = {
  years: piYears,
  homeIdx,
  cpiIdx,
  incomeIdx,
  home: piHome,
  cpi: cpiLevel,
  income: piIncome,
};
