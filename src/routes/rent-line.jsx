import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { RentLinePage as default } from "../pages/RentLinePage";
export const meta = () => buildMeta({
  title: "Rent vs. Home Prices, 1970 to 2026 | Geek Charts | The Mortgage Geek",
  description: "Does rent ever go down? Rent versus home prices since 1970, both indexed. Home prices dipped in eight years. Rent has never once fallen in 56 years.",
  path: "/geek-charts/rent-vs-home-prices",
  schema: articleSchema({
    title: "Rent vs. Home Prices, 1970 to 2026: The Rent Line",
    description: "Does rent ever go down? Rent versus home prices since 1970, both indexed. Home prices dipped in eight years. Rent has never once fallen in 56 years.",
    url: "https://mortgagegeek.ai/geek-charts/rent-vs-home-prices",
    datePublished: "2026-07-09",
    dateModified: "2026-07-09",
  }),
});
