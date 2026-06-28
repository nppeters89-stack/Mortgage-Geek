import { Outlet, useLocation } from "react-router";
import { SiteFooter } from "../components/SiteFooter";
import { WelcomeToast } from "../components/WelcomeToast";

// Global chrome (formerly rendered in App.jsx): the SiteFooter + WelcomeToast
// around every page, with the footer's props derived from the current route —
// reproducing App.jsx's behavior exactly. Pages still own their own layout.
const TOOL_PATHS = ["calculator", "prequal", "compare", "cash-to-close"];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const p = pathname.replace(/^\//, "").replace(/\/$/, "");

  const hasSidebar = p === "learn";
  const layout =
    TOOL_PATHS.includes(p)
      ? "tool"
      : p.startsWith("deep-dives/") // deep-dive articles, not the "deep-dives" hub
      ? "deepdive"
      : "home";

  return (
    <>
      <Outlet />
      <SiteFooter hasSidebar={hasSidebar} layout={layout} />
      <WelcomeToast />
    </>
  );
}
