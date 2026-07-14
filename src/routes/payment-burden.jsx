import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { PaymentBurdenPage as default } from "../pages/PaymentBurdenPage";
export const meta = () => buildMeta({
  title: "The Mortgage Payment Burden, 1971 to 2026 | Geek Charts | The Mortgage Geek",
  description: "Is housing affordability the worst it has ever been? The payment on the median home as a share of median income, 1971 to 2026. Today's 23% is near the average.",
  path: "/geek-charts/mortgage-payment-burden",
  schema: articleSchema({
    title: "The Mortgage Payment Burden, 1971 to 2026",
    description: "Is housing affordability the worst it has ever been? The payment on the median home as a share of median income, 1971 to 2026. Today's 23% is near the average.",
    url: "https://mortgagegeek.ai/geek-charts/mortgage-payment-burden",
    datePublished: "2026-07-09",
    dateModified: "2026-07-09",
  }),
});
