import { buildMeta } from "../utils/routeMeta";
import { webApplicationSchema } from "../utils/schema";
export { ComparePage as default } from "../pages/ComparePage";
export const meta = () => buildMeta({
  title: "Side-by-Side Loan Comparison Tool — Save and Compare Scenarios",
  description: "Save up to 3 loan scenarios and compare them side by side. Different rates, terms, down payments — see the real difference in monthly payment and total cost.",
  path: "/compare",
  schema: webApplicationSchema({
    title: "Loan Comparison Tool — Mortgage Geek",
    description: "Save and compare up to 3 mortgage scenarios side by side.",
    url: "https://mortgagegeek.ai/compare",
  }),
});
