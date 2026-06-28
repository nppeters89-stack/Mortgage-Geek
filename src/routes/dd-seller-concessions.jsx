import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { SellerConcessionsPage as default } from "../pages/SellerConcessionsPage";
export const meta = () => buildMeta({
  title: "Seller Concessions: How Much the Seller Can Pay, by Loan Program | Mortgage Geek",
  description: "Conventional, FHA, VA, and USDA seller concession limits explained by a 12-year LO. What counts, what doesn't, agent commissions after NAR, and where deals break.",
  path: "/deep-dives/seller-concessions",
  schema: articleSchema({
    title: "Seller Concessions: How Much the Seller Can Actually Pay, by Loan Program",
    description: "Conventional, FHA, VA, and USDA seller concession limits explained by a 12-year LO. What counts, what doesn't, agent commissions after NAR, and where deals break.",
    url: "https://mortgagegeek.ai/deep-dives/seller-concessions",
    datePublished: "2026-06-10",
    dateModified: "2026-06-10",
  }),
});
