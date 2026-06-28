import { buildMeta } from "../utils/routeMeta";
import { webApplicationSchema } from "../utils/schema";
export { CashToClosePage as default } from "../pages/CashToClosePage";
export const meta = () => buildMeta({
  title: "Cash to Close Calculator — Estimate Your Closing Costs by State",
  description: "See exactly how much cash you need at closing. Includes down payment, closing costs, prepaids, and escrows — calculated for your specific state and county.",
  path: "/cash-to-close",
  schema: webApplicationSchema({
    title: "Cash to Close Calculator — Mortgage Geek",
    description: "Estimate total cash needed at closing including down payment, closing costs, prepaids, and escrows.",
    url: "https://mortgagegeek.ai/cash-to-close",
  }),
});
