import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { DebtsPaidByOthersPage as default } from "../pages/DebtsPaidByOthersPage";
export const meta = () => buildMeta({
  title: "Debts Paid by Others: How to Exclude Someone Else's Payments From Your Mortgage DTI | Mortgage Geek",
  description: "Debts paid by others mortgage rules: when a parent or spouse pays your loan, when you can exclude it from DTI. Agency-by-agency rules. Real LO insights.",
  path: "/deep-dives/debts-paid-by-others",
  schema: articleSchema({
    title: "Debts Paid by Others: How to Exclude Someone Else's Payments From Your Mortgage DTI",
    description: "Debts paid by others mortgage rules: when a parent or spouse pays your loan, when you can exclude it from DTI. Agency-by-agency rules. Real LO insights.",
    url: "https://mortgagegeek.ai/deep-dives/debts-paid-by-others",
    datePublished: "2026-04-29",
    dateModified: "2026-04-29",
  }),
});
