import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { ResidencyRulesPage as default } from "../pages/ResidencyRulesPage";
export const meta = () => buildMeta({
  title: "Residency and Visa Rules for US Mortgages: What Status Lets You Buy a Home | Mortgage Geek",
  description: "Mortgage residency rules explained: which visas, EADs, and statuses qualify for FHA, VA, conventional, and USDA loans. Updated for the May 2025 FHA rule change.",
  path: "/deep-dives/residency-rules",
  schema: articleSchema({
    title: "Residency and Visa Rules for US Mortgages: What Status Lets You Buy a Home",
    description: "Mortgage residency rules explained: which visas, EADs, and statuses qualify for FHA, VA, conventional, and USDA loans. Updated for the May 2025 FHA rule change.",
    url: "https://mortgagegeek.ai/deep-dives/residency-rules",
    datePublished: "2026-04-26",
    dateModified: "2026-04-26",
  }),
});
