import { buildMeta } from "../utils/routeMeta";
import { webApplicationSchema } from "../utils/schema";
export { CalculatorPage as default } from "../pages/CalculatorPage";
export const meta = () => buildMeta({
  title: "Mortgage Calculator — Compare Conventional, FHA, VA, USDA | Mortgage Geek",
  description: "Calculate monthly payments and see how Conventional, FHA, VA, and USDA loans compare for the same home. Includes PMI, MIP, USDA fees, and live rates.",
  path: "/calculator",
  schema: webApplicationSchema({
    title: "Mortgage Calculator — Mortgage Geek",
    description: "Calculate monthly payments and compare Conventional, FHA, VA, and USDA loans side by side.",
    url: "https://mortgagegeek.ai/calculator",
  }),
});
