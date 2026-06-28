import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { ARMsDemystifiedPage as default } from "../pages/ARMsDemystifiedPage";
export const meta = () => buildMeta({
  title: "ARMs Demystified: How Adjustable-Rate Mortgages Work, When They Make Sense, and What the Caps Actually Mean | Mortgage Geek",
  description: "Adjustable-rate mortgages explained in plain English. How caps work, when ARMs make sense, qualifying rate quirks. From a real LO with 12+ years.",
  path: "/deep-dives/arms-demystified",
  schema: articleSchema({
    title: "ARMs Demystified: How Adjustable-Rate Mortgages Actually Work",
    description: "Adjustable-rate mortgages explained in plain English. How caps work, when ARMs make sense, qualifying rate quirks. From a real LO with 12+ years.",
    url: "https://mortgagegeek.ai/deep-dives/arms-demystified",
    datePublished: "2026-04-26",
    dateModified: "2026-04-26",
  }),
});
