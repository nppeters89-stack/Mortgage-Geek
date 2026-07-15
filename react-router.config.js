/** @type {import('@react-router/dev/config').Config} */
// Explicit prerender list = the 25 PUBLIC routes. NOT `prerender: true` (blanket
// mode can't enumerate the splat catch-all and would try the private route).
// /geek-log is intentionally EXCLUDED (private, noindex) and stays SPA-served via
// the fallback. TODO: deep-dive slugs are hardcoded here; if a slug data source
// is added later, derive this list from it to keep them in sync.
const PRERENDER_PATHS = [
  "/",
  "/learn",
  "/about",
  "/calculator",
  "/prequal",
  "/compare",
  "/cash-to-close",
  "/pre-approval-checklist",
  "/jargon-decoder",
  "/install",
  "/deep-dives",
  "/deep-dives/derogatory-credit",
  "/deep-dives/fha-manual-underwriting",
  "/deep-dives/va-manual-underwriting",
  "/deep-dives/usda-manual-underwriting",
  "/deep-dives/arms-demystified",
  "/deep-dives/residency-rules",
  "/deep-dives/self-employed-documentation",
  "/deep-dives/business-assets",
  "/deep-dives/expected-income",
  "/deep-dives/debts-paid-by-others",
  "/deep-dives/gift-funds",
  "/deep-dives/hourly-and-part-time-income",
  "/deep-dives/seller-concessions",
  "/deep-dives/rate-buydowns",
  "/deep-dives/house-hacking",
  "/deep-dives/tennessee-loan-limits",
  "/geek-charts",
  "/geek-charts/gold-to-housing-ratio",
  "/geek-charts/treasury-yield-mortgage-rates",
  "/geek-charts/mortgage-payment-burden",
  "/geek-charts/home-prices-income-inflation",
  "/geek-charts/rent-vs-home-prices",
  "/geek-charts/homes-priced-in-sp500",
];

export default {
  appDirectory: "src",
  ssr: false,
  prerender: PRERENDER_PATHS,
};
