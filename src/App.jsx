import { useState, lazy, Suspense } from "react";
import { WelcomeToast } from "./components/WelcomeToast";
import { SiteFooter } from "./components/SiteFooter";

const AboutPage = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ComparePage = lazy(() => import("./pages/ComparePage").then(m => ({ default: m.ComparePage })));
const CashToClosePage = lazy(() => import("./pages/CashToClosePage").then(m => ({ default: m.CashToClosePage })));
const PreQualPage = lazy(() => import("./pages/PreQualPage").then(m => ({ default: m.PreQualPage })));
const CalculatorPage = lazy(() => import("./pages/CalculatorPage").then(m => ({ default: m.CalculatorPage })));
const InstallPage = lazy(() => import("./pages/InstallPage").then(m => ({ default: m.InstallPage })));
const DeepDivesHubPage = lazy(() => import("./pages/DeepDivesHubPage").then(m => ({ default: m.DeepDivesHubPage })));
const DerogatoryCreditPage = lazy(() => import("./pages/DerogatoryCreditPage").then(m => ({ default: m.DerogatoryCreditPage })));
const FHAManualUnderwritingPage = lazy(() => import("./pages/FHAManualUnderwritingPage").then(m => ({ default: m.FHAManualUnderwritingPage })));
const VAManualUnderwritingPage = lazy(() => import("./pages/VAManualUnderwritingPage").then(m => ({ default: m.VAManualUnderwritingPage })));
const USDAManualUnderwritingPage = lazy(() => import("./pages/USDAManualUnderwritingPage").then(m => ({ default: m.USDAManualUnderwritingPage })));
const ARMsDemystifiedPage = lazy(() => import("./pages/ARMsDemystifiedPage").then(m => ({ default: m.ARMsDemystifiedPage })));
const ResidencyRulesPage = lazy(() => import("./pages/ResidencyRulesPage").then(m => ({ default: m.ResidencyRulesPage })));
const SelfEmploymentDocumentationPage = lazy(() => import("./pages/SelfEmploymentDocumentationPage").then(m => ({ default: m.SelfEmploymentDocumentationPage })));
const BusinessAssetsPage = lazy(() => import("./pages/BusinessAssetsPage").then(m => ({ default: m.BusinessAssetsPage })));
const ExpectedIncomePage = lazy(() => import("./pages/ExpectedIncomePage").then(m => ({ default: m.ExpectedIncomePage })));
const DebtsPaidByOthersPage = lazy(() => import("./pages/DebtsPaidByOthersPage").then(m => ({ default: m.DebtsPaidByOthersPage })));
const GiftFundsPage = lazy(() => import("./pages/GiftFundsPage").then(m => ({ default: m.GiftFundsPage })));
const HourlyPartTimeIncomePage = lazy(() => import("./pages/HourlyPartTimeIncomePage").then(m => ({ default: m.HourlyPartTimeIncomePage })));
const SellerConcessionsPage = lazy(() => import("./pages/SellerConcessionsPage").then(m => ({ default: m.SellerConcessionsPage })));
const RateBuydownsPage = lazy(() => import("./pages/RateBuydownsPage").then(m => ({ default: m.RateBuydownsPage })));
const SellerCreditOptimizerPage = lazy(() => import("./pages/SellerCreditOptimizerPage").then(m => ({ default: m.SellerCreditOptimizerPage })));
const GeekMapsHubPage = lazy(() => import("./pages/GeekMapsHubPage").then(m => ({ default: m.GeekMapsHubPage })));
const TNLoanLimitsPage = lazy(() => import("./pages/TNLoanLimitsPage").then(m => ({ default: m.TNLoanLimitsPage })));
const MainSite = lazy(() => import("./pages/MainSite").then(m => ({ default: m.MainSite })));
const GeekLogPage = lazy(() => import("./pages/GeekLogPage").then(m => ({ default: m.GeekLogPage })));

export default function MortgageLandingPage() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname?.replace(/^\//, "");
    if (path === "calculator") return "calculator";
    if (path === "prequal") return "prequal";
    if (path === "about") return "about";
    if (path === "compare") return "compare";
    if (path === "cash-to-close") return "cashtoclose";
    if (path === "install") return "install";
    if (path === "deep-dives") return "deepdives-hub";
    if (path === "deep-dives/derogatory-credit") return "deepdives-derogatory";
    if (path === "deep-dives/fha-manual-underwriting") return "deepdives-fha-manual";
    if (path === "deep-dives/va-manual-underwriting") return "deepdives-va-manual";
    if (path === "deep-dives/usda-manual-underwriting") return "deepdives-usda-manual";
    if (path === "deep-dives/arms-demystified") return "deepdives-arms";
    if (path === "deep-dives/residency-rules") return "deepdives-residency";
    if (path === "deep-dives/self-employed-documentation") return "deepdives-selfemployed";
    if (path === "deep-dives/business-assets") return "deepdives-business-assets";
    if (path === "deep-dives/expected-income") return "deepdives-expected-income";
    if (path === "deep-dives/debts-paid-by-others") return "deepdives-debts-paid-by-others";
    if (path === "deep-dives/gift-funds") return "deepdives-gift-funds";
    if (path === "deep-dives/hourly-and-part-time-income") return "deepdives-hourly-part-time";
    if (path === "deep-dives/seller-concessions") return "deepdives-seller-concessions";
    if (path === "deep-dives/rate-buydowns") return "deepdives-rate-buydowns";
    if (path === "tools/seller-credit-optimizer") return "seller-credit-optimizer";
    if (path === "geek-maps") return "geek-maps-hub";
    if (path === "geek-maps/tennessee-loan-limits") return "geek-maps-tn-loan-limits";
    if (path === "geek-log") return "geek-log";
    return "main";
  });

  const renderPage = () => {
    if (currentPage === "calculator") return <CalculatorPage />;
    if (currentPage === "prequal") return <PreQualPage />;
    if (currentPage === "about") return <AboutPage />;
    if (currentPage === "compare") return <ComparePage />;
    if (currentPage === "cashtoclose") return <CashToClosePage />;
    if (currentPage === "install") return <InstallPage />;
    if (currentPage === "deepdives-hub") return <DeepDivesHubPage />;
    if (currentPage === "deepdives-derogatory") return <DerogatoryCreditPage />;
    if (currentPage === "deepdives-fha-manual") return <FHAManualUnderwritingPage />;
    if (currentPage === "deepdives-va-manual") return <VAManualUnderwritingPage />;
    if (currentPage === "deepdives-usda-manual") return <USDAManualUnderwritingPage />;
    if (currentPage === "deepdives-arms") return <ARMsDemystifiedPage />;
    if (currentPage === "deepdives-residency") return <ResidencyRulesPage />;
    if (currentPage === "deepdives-selfemployed") return <SelfEmploymentDocumentationPage />;
    if (currentPage === "deepdives-business-assets") return <BusinessAssetsPage />;
    if (currentPage === "deepdives-expected-income") return <ExpectedIncomePage />;
    if (currentPage === "deepdives-debts-paid-by-others") return <DebtsPaidByOthersPage />;
    if (currentPage === "deepdives-gift-funds") return <GiftFundsPage />;
    if (currentPage === "deepdives-hourly-part-time") return <HourlyPartTimeIncomePage />;
    if (currentPage === "deepdives-seller-concessions") return <SellerConcessionsPage />;
    if (currentPage === "deepdives-rate-buydowns") return <RateBuydownsPage />;
    if (currentPage === "seller-credit-optimizer") return <SellerCreditOptimizerPage />;
    if (currentPage === "geek-maps-hub") return <GeekMapsHubPage />;
    if (currentPage === "geek-maps-tn-loan-limits") return <TNLoanLimitsPage />;
    if (currentPage === "geek-log") return <GeekLogPage />;
    return <MainSite />;
  };

  return (
    <>
      <Suspense fallback={
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F2",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          color: "#6B6358",
          letterSpacing: "0.5px"
        }}>
          Loading…
        </div>
      }>
        {renderPage()}
      </Suspense>
      {/* Homepage (MainSite) renders the fixed 280px Sidebar. Other pages
          don't, so only pass hasSidebar on '/'. The footer uses this to
          mirror .main-content's margin-left offset at >900px.

          `layout` selects the footer's max-width + horizontal padding so
          its gutters line up with whichever page-content wrapper is
          rendered above:
            - 'home'     → MainSite (Page primitive + section padding)
            - 'tool'     → calc / prequal / compare / cash-to-close
                           (tool-page-content at maxW 1100, columns centered)
            - 'deepdive' → individual Deep Dive articles
                           (article at maxW 860)
            - default 'home' for hub/about/install/geek-maps */}
      <SiteFooter
        hasSidebar={currentPage === "main"}
        layout={
          currentPage === "calculator" ||
          currentPage === "prequal" ||
          currentPage === "compare" ||
          currentPage === "cashtoclose" ||
          currentPage === "seller-credit-optimizer"
            ? "tool"
            : currentPage.startsWith("deepdives-") && currentPage !== "deepdives-hub"
            ? "deepdive"
            : "home"
        }
      />
      <WelcomeToast />
    </>
  );
}
