import { buildMeta } from "../utils/routeMeta";
export { MainSite as default } from "../pages/MainSite";
export const meta = () => buildMeta({
  title: "Mortgage Geek: A Clear Path to Your First Home",
  // Link-preview / social heading only (og:title + twitter:title); the SEO
  // <title> above is unchanged.
  shareTitle: "Nick Peters - VP of Mortgage Lending",
  description: "Real answers from a real loan officer. Get matched to the right loan program, see your real numbers, and reach a real person when you're ready to start.",
  path: "/",
});
