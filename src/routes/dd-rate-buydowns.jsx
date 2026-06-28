import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { RateBuydownsPage as default } from "../pages/RateBuydownsPage";
export const meta = () => buildMeta({
  title: "Rate Buydowns: 2-1, Points, or Price Cut? The Same $10,000 Four Ways | Mortgage Geek",
  description: "A 12-year LO runs the same $10,000 seller credit four ways: price cut, closing costs, discount points, and a 2-1 buydown. Exact math, honest tradeoffs.",
  path: "/deep-dives/rate-buydowns",
  schema: articleSchema({
    title: "Rate Buydowns: The Same $10,000, Four Different Ways",
    description: "A 12-year LO runs the same $10,000 seller credit four ways: price cut, closing costs, discount points, and a 2-1 buydown. Exact math, honest tradeoffs.",
    url: "https://mortgagegeek.ai/deep-dives/rate-buydowns",
    datePublished: "2026-06-10",
    dateModified: "2026-06-10",
  }),
});
