import { buildMeta } from "../utils/routeMeta";
import { webApplicationSchema } from "../utils/schema";
export { RentVsOwnPage as default } from "../pages/RentVsOwnPage";
export const meta = () => buildMeta({
  title: "Rent vs. Own Calculator: What You'd Actually Walk Away With",
  description: "A rent vs. own calculator that charges both sides for everything. Set your price, rent, rate, and how long you'll stay, then see which one leaves you with more.",
  path: "/rent-vs-own",
  schema: webApplicationSchema({
    title: "Rent vs. Own Calculator | The Mortgage Geek",
    description: "Compare owning and renting over 30 years. Charges the owner closing costs, taxes, insurance, mortgage insurance, and selling costs, and invests the renter's savings at a selected return.",
    url: "https://mortgagegeek.ai/rent-vs-own",
  }),
});
