import { buildMeta } from "../utils/routeMeta";
import { webApplicationSchema } from "../utils/schema";
export { PreQualPage as default } from "../pages/PreQualPage";
export const meta = () => buildMeta({
  title: "Pre-Qualification Calculator — See What Mortgage You Can Afford",
  description: "Enter your income and debts to see your maximum mortgage amount across Conventional, FHA, VA, and USDA. Free pre-qualification estimate, no credit check.",
  path: "/prequal",
  schema: webApplicationSchema({
    title: "Pre-Qualification Calculator — Mortgage Geek",
    description: "See what mortgage you can afford across Conventional, FHA, VA, and USDA based on your income and debts.",
    url: "https://mortgagegeek.ai/prequal",
  }),
});
