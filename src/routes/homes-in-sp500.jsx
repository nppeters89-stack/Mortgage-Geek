import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { HomesInSp500Page as default } from "../pages/HomesInSp500Page";
export const meta = () => buildMeta({
  title: "Homes Priced in the S&P 500, 1970 to 2026 | Geek Charts | The Mortgage Geek",
  description: "Do stocks beat real estate? Priced in S&P 500 units, the average home just hit an all-time low, yet leverage is why housing built the middle class.",
  path: "/geek-charts/homes-priced-in-sp500",
  schema: articleSchema({
    title: "Homes Priced in the S&P 500, 1970 to 2026",
    description: "Do stocks beat real estate? Priced in S&P 500 units, the average home just hit an all-time low, yet leverage is why housing built the middle class.",
    url: "https://mortgagegeek.ai/geek-charts/homes-priced-in-sp500",
    datePublished: "2026-07-13",
    dateModified: "2026-07-13",
  }),
});
