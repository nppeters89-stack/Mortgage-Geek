import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { HouseHackingPage as default } from "../pages/HouseHackingPage";
export const meta = () => buildMeta({
  title: "House Hacking 2026: FHA, VA & Conventional Strategies | The Mortgage Geek",
  description: "How to live in part of a property and rent the rest. FHA duplex, 3-4 unit, ADU, and VA multi-unit strategies, plus which ones let rental income help you qualify.",
  path: "/deep-dives/house-hacking",
  schema: articleSchema({
    title: "House Hacking: Using Rental Income to Buy and Afford Your First Home",
    description: "How to live in part of a property and rent the rest. FHA duplex, 3-4 unit, ADU, and VA multi-unit strategies, plus which ones let rental income help you qualify.",
    url: "https://mortgagegeek.ai/deep-dives/house-hacking",
    datePublished: "2026-06-29",
    dateModified: "2026-06-29",
  }),
});
