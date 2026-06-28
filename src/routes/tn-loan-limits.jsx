import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { TNLoanLimitsPage as default } from "../pages/TNLoanLimitsPage";
export const meta = () => buildMeta({
  title: "Tennessee Loan Limits 2026: Interactive Map by County | Mortgage Geek",
  description: "Interactive map of 2026 Tennessee loan limits by county. Conforming, FHA, VA, USDA limits for all 95 TN counties. Updated annually. Real LO insight on what they mean.",
  path: "/geek-maps/tennessee-loan-limits",
  schema: articleSchema({
    title: "Tennessee Loan Limits 2026: Interactive Map by County",
    description: "Interactive map of 2026 Tennessee loan limits by county. Conforming, FHA, VA, USDA limits for all 95 TN counties. Updated annually. Real LO insight on what they mean.",
    url: "https://mortgagegeek.ai/geek-maps/tennessee-loan-limits",
    datePublished: "2026-04-30",
    dateModified: "2026-04-30",
  }),
});
