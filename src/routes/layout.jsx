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

  // /geek-log is a gated, full-screen app that owns the whole viewport and does
  // not inject globalCSS. The marketing footer + welcome toast do not belong
  // there, and the footer's lockup would render unstyled (oversized) without
  // globalCSS. Render no site chrome on it.
  const isApp = p === "geek-log";

  return (
    <>
      <Outlet />
      {!isApp && <SiteFooter hasSidebar={hasSidebar} layout={layout} />}
      {!isApp && <WelcomeToast />}
    </>
  );
}
