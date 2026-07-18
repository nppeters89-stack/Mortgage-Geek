import { buildMeta } from "../utils/routeMeta";
import { webApplicationSchema } from "../utils/schema";
export { RentVsBuyPage as default } from "../pages/RentVsBuyPage";
export const meta = () => buildMeta({
  title: "Rent vs. Buy Calculator: What You'd Actually Walk Away With",
  description: "A rent vs. buy calculator that charges both sides for everything. Set your price, rent, rate, and how long you'll stay, then see which one leaves you with more.",
  path: "/rent-vs-buy",
  schema: webApplicationSchema({
    title: "Rent vs. Buy Calculator | The Mortgage Geek",
    description: "Compare buying and renting over 30 years. Charges the buyer closing costs, taxes, insurance, mortgage insurance, and selling costs, and invests the renter's savings at a selected return.",
    url: "https://mortgagegeek.ai/rent-vs-buy",
  }),
});
