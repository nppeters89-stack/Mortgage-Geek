import { buildMeta } from "../utils/routeMeta";
import { articleSchema } from "../utils/schema";
export { SelfEmploymentDocumentationPage as default } from "../pages/SelfEmploymentDocumentationPage";
export const meta = () => buildMeta({
  title: "Self-Employed Mortgage Documentation: What Lenders Actually Want to See | Mortgage Geek",
  description: "Self-employed mortgage requirements explained: 2-year rule, tax returns, P&L statements, qualifying income calculations. From a real LO with 12+ years.",
  path: "/deep-dives/self-employed-documentation",
  schema: articleSchema({
    title: "Self-Employed Mortgage Documentation: What Lenders Actually Want to See",
    description: "Self-employed mortgage requirements explained: 2-year rule, tax returns, P&L statements, qualifying income calculations. From a real LO with 12+ years.",
    url: "https://mortgagegeek.ai/deep-dives/self-employed-documentation",
    datePublished: "2026-04-26",
    dateModified: "2026-04-26",
  }),
});
