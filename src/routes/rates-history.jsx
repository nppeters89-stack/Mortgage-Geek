import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { RatesHistoryPage as default } from "../pages/RatesHistoryPage";
export const meta = () => buildMeta({
  title: "The 10-Year Treasury and the 30-Year Mortgage, 1953 to 2026 | Geek Charts | The Mortgage Geek",
  description: "Are mortgage rates historically high right now? Seventy years of the 30-year fixed and the 10-year Treasury. Today's 6.43% sits below the long-run average.",
  path: "/geek-charts/treasury-yield-mortgage-rates",
  schema: articleSchema({
    title: "The 10-Year Treasury and the 30-Year Mortgage, 1953 to 2026",
    description: "Are mortgage rates historically high right now? Seventy years of the 30-year fixed and the 10-year Treasury. Today's 6.43% sits below the long-run average.",
    url: "https://mortgagegeek.ai/geek-charts/treasury-yield-mortgage-rates",
    datePublished: "2026-07-09",
    dateModified: "2026-07-09",
  }),
});
