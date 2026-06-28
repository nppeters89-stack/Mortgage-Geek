import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { HourlyPartTimeIncomePage as default } from "../pages/HourlyPartTimeIncomePage";
export const meta = () => buildMeta({
  title: "Hourly, Part-Time & Seasonal Income for Mortgage Qualifying: Real LO Guide | Mortgage Geek",
  description: "Mortgage qualifying with hourly, part-time, or seasonal income. Calculation rules by loan program (FNMA, FHLMC, FHA, VA, USDA), with worked examples and real LO insight.",
  path: "/deep-dives/hourly-and-part-time-income",
  schema: articleSchema({
    title: "Hourly, Part-Time & Seasonal Income for Mortgage Qualifying",
    description: "Mortgage qualifying with hourly, part-time, or seasonal income. Calculation rules by loan program (FNMA, FHLMC, FHA, VA, USDA), with worked examples and real LO insight.",
    url: "https://mortgagegeek.ai/deep-dives/hourly-and-part-time-income",
    datePublished: "2026-04-30",
    dateModified: "2026-04-30",
  }),
});
