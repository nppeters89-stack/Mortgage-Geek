import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { FthbAgePage as default } from "../pages/FthbAgePage";
export const meta = () => buildMeta({
  title: "The Age of the First-Time Homebuyer, 1981 to 2025 | Geek Charts | The Mortgage Geek",
  description: "The average age of a first-time homebuyer is now 40, the oldest ever recorded. Every year NAR has measured it since 1981, when the answer was about 30.",
  path: "/geek-charts/first-time-homebuyer-age",
  schema: articleSchema({
    title: "The Age of the First-Time Homebuyer, 1981 to 2025",
    description: "The average age of a first-time homebuyer is now 40, the oldest ever recorded. Every year NAR has measured it since 1981, when the answer was about 30.",
    url: "https://mortgagegeek.ai/geek-charts/first-time-homebuyer-age",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  }),
});
