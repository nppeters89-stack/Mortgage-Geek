import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { GiftFundsPage as default } from "../pages/GiftFundsPage";

export const meta = () => buildMeta({
  title: "Gift Funds for Down Payment: Who Can Give, How They Document It, by Loan Program | Mortgage Geek",
  description: "Gift funds mortgage rules: donor eligibility by loan program, gift letter requirements, transfer documentation, the donor-direct-to-title privacy path. Real LO guide.",
  path: "/deep-dives/gift-funds",
  schema: articleSchema({
    title: "Gift Funds for Down Payment: Who Can Give, How They Document It, by Loan Program",
    description: "Gift funds mortgage rules: donor eligibility by loan program, gift letter requirements, transfer documentation, the donor-direct-to-title privacy path. Real LO guide.",
    url: "https://mortgagegeek.ai/deep-dives/gift-funds",
    datePublished: "2026-04-29",
    dateModified: "2026-04-29",
  }),
});
