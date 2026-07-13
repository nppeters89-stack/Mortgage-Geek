import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { GoldHousingRatioPage as default } from "../pages/GoldHousingRatioPage";
export const meta = () => buildMeta({
  title: "The Gold-to-Housing Ratio, 1970 to 2026 | Geek Charts | The Mortgage Geek",
  description: "How many ounces of gold it takes to buy the average American home, charted 1970 to 2026. Today it is about 124 ounces, tied with 1980 for the fewest ever.",
  path: "/geek-charts/gold-to-housing-ratio",
  schema: articleSchema({
    title: "The Gold-to-Housing Ratio, 1970 to 2026",
    description: "How many ounces of gold it takes to buy the average American home, charted 1970 to 2026. Today it is about 124 ounces, tied with 1980 for the fewest ever.",
    url: "https://mortgagegeek.ai/geek-charts/gold-to-housing-ratio",
    datePublished: "2026-07-09",
    dateModified: "2026-07-09",
  }),
});
