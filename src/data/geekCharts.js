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
    slug: "mortgage-payment-burden",
    title: "The Mortgage Payment Burden",
    tagline: "The payment on the median home as a share of the median income, 1971 to today. The surprise: today is almost exactly average.",
    period: "1971 to 2026",
    updated: "2026-07-09",
  },
  {
    slug: "home-prices-income-inflation",
    title: "Home Prices, Inflation, and Family Income",
    tagline: "Three lines, one race, 55 years. Homes rose 19.5x, incomes 10.7x, inflation 8.3x. The gap is the whole story.",
    period: "1970 to 2025",
    updated: "2026-07-09",
  },
  {
    slug: "rent-vs-home-prices",
    title: "The Rent Line",
    tagline: "Rent versus home prices since 1970. Home prices dipped eight times. Rent has never gone down. Not once.",
    period: "1970 to 2026",
    updated: "2026-07-09",
  },
  {
    slug: "homes-priced-in-sp500",
    title: "Homes Priced in the S&P 500",
    tagline: "Stocks beat houses for four decades. So why did houses build the middle class? One word: leverage. Two charts, one answer.",
    period: "1970 to 2026",
    updated: "2026-07-13",
  },
  {
    slug: "first-time-homebuyer-age",
    title: "The Age of the First-Time Homebuyer",
    tagline: "For forty years the answer was about 30. It is now 40, the oldest ever recorded, and the reason is not the monthly payment.",
    period: "1981 to 2025",
    updated: "2026-07-17",
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

// The Mortgage Payment Burden, 1971 to 2026. ratio = annual P&I (median new home,
// 20% down, that year's average 30-yr rate) as a percent of median family income.
// pmt / price / rate back the tooltip. Income runs through 2024, so 2025-2026 hold
// the latest reading. Precomputed; not recomputed at runtime.
const pbYears = Array.from({ length: 2026 - 1971 + 1 }, (_, i) => 1971 + i);

const pbRatio = [16.5, 16.4, 19.1, 22.0, 22.2, 22.6, 23.3, 25.9, 29.7, 34.4, 41.3, 38.2, 33.1, 34.1, 31.0, 26.7, 29.0,
  30.2, 30.5, 29.5, 26.4, 24.3, 22.5, 24.6, 23.0, 22.9, 22.1, 20.6, 21.9, 23.4, 21.4, 21.9, 20.6, 22.8,
  23.9, 25.1, 23.8, 21.5, 18.6, 18.4, 17.8, 17.3, 18.6, 20.1, 18.7, 18.4, 19.4, 20.2, 16.9, 16.0, 17.4,
  25.0, 26.5, 24.6, 23.7, 23.0];

const pbPmt = [142, 152, 192, 236, 254, 281, 311, 380, 486, 603, 770, 747, 678, 752, 716, 656, 748, 811, 868, 868, 790,
  739, 694, 793, 778, 808, 819, 804, 890, 988, 919, 945, 905, 1028, 1119, 1221, 1218, 1105, 930, 923, 906,
  896, 1014, 1114, 1103, 1117, 1230, 1325, 1214, 1122, 1285, 1932, 2227, 2167, 2094, 2024];

const pbPrice = [25225, 27525, 32600, 36050, 39275, 44225, 48900, 55850, 62750, 64750, 68950, 69225, 75375, 79950,
  84275, 92025, 104700, 112225, 120425, 122300, 119975, 121375, 126500, 130425, 133475, 140250,
  145000, 151925, 160125, 167550, 173100, 186025, 192125, 218150, 236550, 243750, 244950, 229550,
  215650, 222700, 224900, 244400, 266225, 285775, 294150, 305125, 322425, 325275, 320250, 328150,
  383000, 432950, 426525, 418975, 415400, 403200];

const pbRate = [7.54, 7.38, 8.04, 9.19, 9.05, 8.87, 8.85, 9.64, 11.20, 13.74, 16.64, 16.04, 13.24, 13.88, 12.43,
  10.19, 10.21, 10.34, 10.32, 10.13, 9.25, 8.39, 7.31, 8.38, 7.93, 7.81, 7.60, 6.94, 7.44, 8.05, 6.97,
  6.54, 5.83, 5.84, 5.87, 6.41, 6.34, 6.03, 5.04, 4.69, 4.45, 3.66, 3.98, 4.17, 3.85, 3.65, 3.99, 4.54,
  3.94, 3.11, 2.96, 5.34, 6.81, 6.72, 6.47, 6.43];

export const BURDEN_AVG = 23.7;
export const PAYMENT_BURDEN = { years: pbYears, ratio: pbRatio, pmt: pbPmt, price: pbPrice, rate: pbRate };

// The Rent Line, 1970 to 2026. rentIdx = CPI rent of primary residence; homeIdx =
// average home price; both indexed to 1970 = 100. rentYoY / homeYoY are the
// year-over-year percent changes (first entry null). 2025 rent averages 11 months
// (Oct 2025 unpublished), 2026 rent averages Jan-May and home is the Q1 reading.
// Precomputed; not recomputed at runtime.
const rlYears = Array.from({ length: 2026 - 1970 + 1 }, (_, i) => 1970 + i);

const rentIdx = [100.0, 104.5, 108.2, 112.9, 118.5, 124.7, 131.4, 139.4, 149.0, 159.8, 174.0, 189.0, 203.4, 215.3,
  226.5, 240.4, 254.4, 264.7, 274.8, 285.6, 297.6, 308.2, 315.9, 323.2, 331.2, 339.4, 348.4, 358.5,
  370.1, 381.7, 395.5, 413.1, 429.5, 441.9, 453.8, 467.3, 484.1, 504.7, 523.2, 535.1, 536.3, 545.4,
  560.0, 575.7, 594.0, 615.1, 638.3, 662.6, 686.7, 712.0, 734.4, 750.8, 796.1, 859.4, 903.4, 935.3,
  954.0];

const rlHomeIdx = [100.0, 105.4, 112.9, 131.7, 145.3, 159.6, 180.3, 203.9, 235.3, 269.8, 286.6, 312.1, 314.6, 336.9,
  366.0, 378.3, 420.5, 478.7, 520.3, 555.8, 559.4, 552.6, 542.9, 553.4, 578.5, 591.9, 621.1, 656.2,
  679.7, 730.5, 770.6, 791.9, 850.7, 917.6, 1021.1, 1093.0, 1140.3, 1162.5, 1084.7, 1010.7, 1020.7,
  992.9, 1081.5, 1206.9, 1296.2, 1315.0, 1349.5, 1430.2, 1435.2, 1425.4, 1455.5, 1698.6, 1937.8,
  1902.9, 1905.7, 1950.1, 1931.0];

const rentYoY = [null, 4.5, 3.5, 4.4, 5.0, 5.3, 5.3, 6.1, 6.9, 7.2, 8.9, 8.7, 7.6, 5.8, 5.2, 6.2, 5.8, 4.1, 3.8, 3.9, 4.2,
  3.5, 2.5, 2.3, 2.5, 2.5, 2.7, 2.9, 3.2, 3.1, 3.6, 4.5, 4.0, 2.9, 2.7, 3.0, 3.6, 4.3, 3.7, 2.3, 0.2, 1.7,
  2.7, 2.8, 3.2, 3.5, 3.8, 3.8, 3.6, 3.7, 3.1, 2.2, 6.0, 7.9, 5.1, 3.5, 2.0];

const homeYoY = [null, 5.4, 7.0, 16.7, 10.3, 9.8, 13.0, 13.1, 15.4, 14.7, 6.2, 8.9, 0.8, 7.1, 8.7, 3.4, 11.2, 13.8, 8.7,
  6.8, 0.6, -1.2, -1.8, 1.9, 4.5, 2.3, 4.9, 5.6, 3.6, 7.5, 5.5, 2.8, 7.4, 7.9, 11.3, 7.0, 4.3, 1.9, -6.7,
  -6.8, 1.0, -2.7, 8.9, 11.6, 7.4, 1.4, 2.6, 6.0, 0.3, -0.7, 2.1, 16.7, 14.1, -1.8, 0.1, 2.3, -1.0];

export const RENT_LINE = { years: rlYears, rentIdx, homeIdx: rlHomeIdx, rentYoY, homeYoY };

// Homes Priced in the S&P 500, a two-part page. Group 1 (ratio series) is the
// historical chart: sp500Ratio = home price / index level (how many S&P units
// buy the average home), with home (ASPUS average price) and sp (S&P 500 annual
// average of monthly averages; 2026 = spot as of Jul 13) backing the tooltip.
// All three align to spYears by index, 1970 to 2026 (57 entries). Group 2
// (projection series) is the 30-year wealth illustration: a $500,000 purchase,
// $25,000 down, $475,000 30-yr fixed at 6.43%, 5.4% annual appreciation, and a
// 10% annual total return on the same $25,000 invested in the index. equity =
// homeVal - loanBal. All four align to projYears by index, year 0 to 30 (31
// entries). Every array is precomputed and canonical; nothing is recomputed at
// runtime. SP_RATIO_AVG is the long-run average of the ratio series.
const spYears = Array.from({ length: 2026 - 1970 + 1 }, (_, i) => 1970 + i);

const sp500Ratio = [320.2, 285.9, 275.4, 326.8, 469.1, 493.6, 471.0, 553.4, 653.0, 697.9, 643.0, 649.6,
  700.3, 559.6, 607.9, 539.6, 474.2, 444.8, 521.7, 458.8, 445.5, 391.5, 348.0, 326.7, 334.9, 291.2,
  246.7, 200.4, 167.1, 146.8, 143.9, 177.0, 227.7, 253.8, 240.7, 241.3, 231.9, 209.8, 236.8, 284.5,
  238.8, 208.5, 208.9, 195.8, 178.9, 170.0, 171.9, 155.7, 139.4, 130.4, 120.5, 106.1, 125.9, 118.5,
  93.6, 83.7, 68.0];

const spHome = [26650, 28100, 30075, 35100, 38725, 42525, 48050, 54350, 62700, 71900, 76375, 83175, 83850,
  89775, 97550, 100825, 112075, 127575, 138650, 148125, 149075, 147275, 144675, 147475, 154175,
  157750, 165525, 174875, 181150, 194675, 205375, 211050, 226700, 244550, 272125, 291275, 303900,
  309800, 289075, 269350, 272025, 264600, 288225, 321650, 345450, 350450, 359650, 381150, 382475,
  379875, 387900, 452675, 516425, 507125, 507875, 519700, 514600];

const sp = [83.22, 98.28, 109.21, 107.42, 82.55, 86.16, 102.02, 98.21, 96.02, 103.02, 118.78, 128.04,
  119.73, 160.42, 160.47, 186.85, 236.36, 286.84, 265.78, 322.83, 334.59, 376.18, 415.74, 451.41,
  460.33, 541.64, 670.83, 872.67, 1084.31, 1326.06, 1427.01, 1192.08, 995.63, 963.69, 1130.55,
  1207.06, 1310.67, 1476.63, 1220.89, 946.74, 1139.31, 1268.89, 1379.56, 1642.51, 1930.67, 2061.2,
  2091.84, 2448.22, 2744.68, 2912.5, 3218.5, 4266.8, 4100.7, 4280.78, 5428.1, 6210.97, 7570.03];

export const SP_RATIO_AVG = 312;

// Group 2: the 30-year projection. See header note above for assumptions.
const projYears = Array.from({ length: 31 }, (_, i) => i);

const projEquity = [25000, 57380, 91575, 127686, 165821, 206096, 248631, 293554, 340998, 391108, 444034,
  499935, 558980, 621346, 687222, 756807, 830310, 907955, 989977, 1076623, 1168157, 1264857, 1367015,
  1474943, 1588969, 1709440, 1836722, 1971205, 2113299, 2263437, 2422079];

const projSpPath = [25000, 27500, 30250, 33275, 36603, 40263, 44289, 48718, 53590, 58949, 64844, 71328,
  78461, 86307, 94937, 104431, 114874, 126362, 138998, 152898, 168187, 185006, 203507, 223858, 246243,
  270868, 297954, 327750, 360525, 396577, 436235];

const projHomeVal = [500000, 527000, 555458, 585453, 617067, 650389, 685510, 722527, 761544, 802667,
  846011, 891696, 939847, 990599, 1044091, 1100472, 1159898, 1222532, 1288549, 1358131, 1431470,
  1508769, 1590243, 1676116, 1766626, 1862024, 1962573, 2068552, 2180254, 2297988, 2422079];

const projLoanBal = [475000, 469620, 463883, 457767, 451246, 444292, 436879, 428974, 420545, 411559,
  401977, 391761, 380868, 369253, 356870, 343666, 329588, 314577, 298572, 281507, 263312, 243912,
  223228, 201173, 177657, 152584, 125851, 97347, 66955, 34551, 0];

// One named export, two groups. Group 1 (ratio series) backs the historical
// chart; group 2 (projection series) backs the 30-year wealth chart. Field
// names do not collide, so both groups live on one object per the phase spec.
export const HOMES_IN_SP500 = {
  // Group 1: ratio series (1970 to 2026, 57 entries).
  years: spYears,
  ratio: sp500Ratio,
  home: spHome,
  sp,
  // Group 2: projection series (year 0 to 30, 31 entries). As of Phase 6B, Part 2
  // is an interactive tool whose equity/profit/balance/side-fund series are
  // simulated client-side (see components/buyVsInvestSim.js). homeVal and spPath
  // stay canonical inputs. equity and loanBal are now VERIFICATION FIXTURES: the
  // tool's base case (6.43%, no extra, no reinvest) must reproduce them (equity
  // within the same +/-1 rounding it shipped with). Do not edit to "fix" the tool.
  projYears,
  equity: projEquity,
  spPath: projSpPath,
  homeVal: projHomeVal,
  loanBal: projLoanBal,
};

// Base-case (6.43%, no extra payment, no reinvest) net profit by year, the
// previously implied "profit" fixture for Part 2. The Phase 6B simulation must
// reproduce this exactly; it also backs the static sr-only table. Net profit =
// equity + side fund - down payment - loan payments - taxes/insurance - MI.
export const SP500_PART2_NET_PROFIT_BASE = [0, -10651, -19488, -26408, -31304, -34060, -34557,
  -32666, -28252, -21174, -11280, 1590, 19067, 40160, 64762, 93073, 125303, 161674, 202422,
  247795, 298055, 353480, 414365, 481019, 553770, 632967, 718976, 812185, 913005, 1021869, 1139237];

// Chart 7: the median age of the first-time homebuyer, from NAR's Profile of
// Home Buyers and Sellers. Survey observations only, no interpolation: NAR did
// not run the survey every year in the 1980s and 1990s, so surveyYears/surveyAges
// are paired and the chart connects the years that exist. BAND_LOW/BAND_HIGH are
// the 1981 to 2020 range (28 to 33), the band the line held for forty years
// before breaking out.
const fthbSurveyYears = [1981, 1985, 1987, 1989, 1991, 1993, 1995, 1997, 2000, 2002, 2003, 2004, 2005,
  2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
  2022, 2023, 2024, 2025];
const fthbSurveyAges = [29, 29, 29, 30, 28, 32, 31, 32, 32, 31, 32, 32, 32, 32, 31, 30, 30, 30, 31, 31,
  31, 31, 31, 32, 32, 32, 33, 33, 33, 36, 35, 38, 40];

export const FTHB_AGE = {
  surveyYears: fthbSurveyYears,
  surveyAges: fthbSurveyAges,
  BAND_LOW: 28,
  BAND_HIGH: 33,
};
