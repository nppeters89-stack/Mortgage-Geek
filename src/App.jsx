import { useState } from "react";
import { WelcomeToast } from "./components/WelcomeToast";
import { AboutPage } from "./pages/AboutPage";
import { ComparePage } from "./pages/ComparePage";
import { CashToClosePage } from "./pages/CashToClosePage";
import { PreQualPage } from "./pages/PreQualPage";
import { CalculatorPage } from "./pages/CalculatorPage";
import { InstallPage } from "./pages/InstallPage";
import { DeepDivesHubPage } from "./pages/DeepDivesHubPage";
import { DerogatoryCreditPage } from "./pages/DerogatoryCreditPage";
import { MainSite } from "./pages/MainSite";

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
    return <MainSite />;
  };

  return (<>{renderPage()}<WelcomeToast /></>);
}
