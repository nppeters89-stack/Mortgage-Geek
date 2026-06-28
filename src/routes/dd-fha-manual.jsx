import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { FHAManualUnderwritingPage as default } from "../pages/FHAManualUnderwritingPage";
export const meta = () => buildMeta({
  title: "FHA Manual Underwriting: HUD 4000.1 Rules, Compensating Factors, and How to Get Approved | Mortgage Geek",
  description: "FHA manual underwriting: HUD 4000.1 rules, DTI compensating factors, full documentation checklist. Plain English, from a real LO with 12+ years.",
  path: "/deep-dives/fha-manual-underwriting",
  schema: articleSchema({
    title: "FHA Manual Underwriting: HUD 4000.1 Rules, Compensating Factors, and How to Get Approved",
    description: "FHA manual underwriting: HUD 4000.1 rules, DTI compensating factors, full documentation checklist. Plain English, from a real LO with 12+ years.",
    url: "https://mortgagegeek.ai/deep-dives/fha-manual-underwriting",
    datePublished: "2026-04-24",
    dateModified: "2026-04-25",
  }),
});
