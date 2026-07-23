import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { PriceToIncomePage as default } from "../pages/PriceToIncomePage";
export const meta = () => buildMeta({
  title: "The Payment Was Never the Problem: Price-to-Income Ratio, 1971 to 2026 | Mortgage Geek",
  description: "Why are first-time homebuyers older than ever when the mortgage payment is historically average? 56 years of price-to-income data explain it, from a Nashville loan officer.",
  path: "/geek-charts/price-to-income-ratio",
  schema: articleSchema({
    title: "The Payment Was Never the Problem: Price-to-Income Ratio, 1971 to 2026",
    description: "Why are first-time homebuyers older than ever when the mortgage payment is historically average? 56 years of price-to-income data explain it, from a Nashville loan officer.",
    url: "https://mortgagegeek.ai/geek-charts/price-to-income-ratio",
    datePublished: "2026-07-23",
    dateModified: "2026-07-23",
  }),
});
