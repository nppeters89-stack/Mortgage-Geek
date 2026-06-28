import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { BusinessAssetsPage as default } from "../pages/BusinessAssetsPage";
export const meta = () => buildMeta({
  title: "Business Assets for Down Payment: How to Use Money From Your Company to Buy a Home | Mortgage Geek",
  description: "Using business funds for a down payment? Lenders need to see that the withdrawal won't hurt the business. Cash flow analysis, CPA letters, agency-specific rules.",
  path: "/deep-dives/business-assets",
  schema: articleSchema({
    title: "Business Assets for Down Payment: How to Use Money From Your Company to Buy a Home",
    description: "Using business funds for a down payment? Lenders need to see that the withdrawal won't hurt the business. Cash flow analysis, CPA letters, agency-specific rules.",
    url: "https://mortgagegeek.ai/deep-dives/business-assets",
    datePublished: "2026-04-28",
    dateModified: "2026-04-28",
  }),
});
