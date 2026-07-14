import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { PricesIncomeInflationPage as default } from "../pages/PricesIncomeInflationPage";
export const meta = () => buildMeta({
  title: "Home Prices vs. Income vs. Inflation, 1970 to 2025 | Geek Charts | The Mortgage Geek",
  description: "Have home prices grown faster than incomes? Home prices, family income, and inflation from 1970 to 2025, indexed to 100. Homes rose 19.5x, incomes 10.7x.",
  path: "/geek-charts/home-prices-income-inflation",
  schema: articleSchema({
    title: "Home Prices, Inflation, and Family Income, 1970 to 2025",
    description: "Have home prices grown faster than incomes? Home prices, family income, and inflation from 1970 to 2025, indexed to 100. Homes rose 19.5x, incomes 10.7x.",
    url: "https://mortgagegeek.ai/geek-charts/home-prices-income-inflation",
    datePublished: "2026-07-09",
    dateModified: "2026-07-09",
  }),
});
