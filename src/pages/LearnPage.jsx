import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { P, F, globalCSS } from "../theme";
import { useIsMobile, useIsStandalone } from "../utils/hooks";
import { Sidebar } from "../components/Sidebar";
import { MobileToolbar } from "../components/MobileToolbar";
import { Page } from "../components/homepage/Page";
import { JourneyOverview } from "../components/homepage/JourneyOverview";
import { PreContract } from "../components/homepage/PreContract";
import { ActiveLoanProcess } from "../components/homepage/ActiveLoanProcess";
import { MortgageTypes } from "../components/homepage/MortgageTypes";
import { ClosingCosts } from "../components/homepage/ClosingCosts";
import { BorrowerProfile } from "../components/homepage/BorrowerProfile";
import { MortgageStructure } from "../components/homepage/MortgageStructure";
import { InterestRates } from "../components/homepage/InterestRates";
import { PreApprovalChecklist } from "../components/homepage/PreApprovalChecklist";
import { NextSteps } from "../components/homepage/NextSteps";
import { ToolsCTA } from "../components/homepage/ToolsCTA";
import { JargonDecoder } from "../components/homepage/JargonDecoder";
import { SEOHead } from "../components/SEOHead";

// The mortgage education hub. This carries the full educational scroll plus the
// topic/tools sidebar and its IntersectionObserver scroll-spy, moved here from
// the homepage in the IA split. The homepage (MainSite) is now the sales page.
export function LearnPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();
  const skipScrollRestore = useRef(false);
  const skipTransition = useRef(false);

  // Scroll-lock: when sidebar is open, add `sidebar-locked` class to <html>.
  useLayoutEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add("sidebar-locked");
      const onTouchMove = (e) => {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar && sidebar.contains(e.target)) return;
        e.preventDefault();
      };
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      return () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.documentElement.classList.remove("sidebar-locked");
        if (skipScrollRestore.current) {
          skipScrollRestore.current = false;
        }
      };
    }
  }, [mobileOpen]);

  // Swipe-to-open/close sidebar — X-style reveal (main content slides right)
  useEffect(() => {
    const SIDEBAR_W = 280;
    const EDGE_ZONE = window.innerWidth;
    const SNAP_THRESHOLD = 80;
    let startX = 0, startY = 0, currentX = 0;
    let tracking = false, dirLocked = false, isHorizontal = false;
    let mode = null; // "opening" or "closing"
    let scrollBlocker = null;

    const getMain = () => document.querySelector(".main-content");
    const getBar = () => document.querySelector(".mobile-bar");
    const getFooter = () => document.querySelector(".mg-site-footer");

    const addScrollBlocker = () => {
      if (scrollBlocker) return;
      scrollBlocker = (e) => { e.preventDefault(); };
      document.addEventListener("touchmove", scrollBlocker, { passive: false });
    };
    const removeScrollBlocker = () => {
      if (!scrollBlocker) return;
      document.removeEventListener("touchmove", scrollBlocker);
      scrollBlocker = null;
    };

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      dirLocked = false;
      isHorizontal = false;

      if (!mobileOpen && startX < EDGE_ZONE) {
        mode = "opening";
        tracking = true;
      } else if (mobileOpen) {
        mode = "closing";
        tracking = true;
      } else {
        tracking = false;
      }
    };

    const onTouchMove = (e) => {
      if (!tracking) return;
      const touch = e.touches[0];
      currentX = touch.clientX;
      const dx = currentX - startX;
      const dy = touch.clientY - startY;

      if (!dirLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        dirLocked = true;
        isHorizontal = Math.abs(dx) > Math.abs(dy);
        if (!isHorizontal) { tracking = false; return; }
        const main = getMain();
        const bar = getBar();
        const footer = getFooter();
        if (main) main.classList.add("sidebar-dragging");
        if (bar) bar.classList.add("sidebar-dragging");
        if (footer) footer.classList.add("sidebar-dragging");
        addScrollBlocker();
      }

      if (!dirLocked || !isHorizontal) return;

      const main = getMain();
      const bar = getBar();
      const footer = getFooter();
      if (!main) return;

      if (mode === "opening") {
        const dragPx = Math.max(0, Math.min(dx, SIDEBAR_W));
        const pct = dragPx / SIDEBAR_W;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${dragPx}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${dragPx}px)`;
        if (footer) {
          footer.style.transform = `translateX(${dragPx}px)`;
          footer.style.setProperty("--sidebar-dim", pct);
        }
      } else if (mode === "closing") {
        const dragPx = Math.max(0, Math.min(-dx, SIDEBAR_W));
        const pct = 1 - (dragPx / SIDEBAR_W);
        const offset = SIDEBAR_W - dragPx;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${offset}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${offset}px)`;
        if (footer) {
          footer.style.transform = `translateX(${offset}px)`;
          footer.style.setProperty("--sidebar-dim", pct);
        }
      }
    };

    const onTouchEnd = () => {
      if (!tracking || !isHorizontal) { tracking = false; return; }
      const dx = currentX - startX;
      const main = getMain();
      const bar = getBar();
      const footer = getFooter();

      if (main) main.classList.remove("sidebar-dragging");
      if (bar) bar.classList.remove("sidebar-dragging");
      if (footer) footer.classList.remove("sidebar-dragging");

      if (main) { main.style.transform = ""; main.style.borderRadius = ""; main.style.removeProperty("--sidebar-dim"); }
      if (bar) bar.style.transform = "";
      if (footer) { footer.style.transform = ""; footer.style.removeProperty("--sidebar-dim"); }
      removeScrollBlocker();

      if (mode === "opening" && dx > SNAP_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(10);
        setMobileOpen(true);
      } else if (mode === "closing" && dx < -SNAP_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(10);
        setMobileOpen(false);
      }

      tracking = false;
      mode = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      removeScrollBlocker();
    };
  }, [mobileOpen]);

  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (el) {
      if (mobileOpen) {
        const main = document.querySelector(".main-content");
        const bar = document.querySelector(".mobile-bar");
        const footer = document.querySelector(".mg-site-footer");
        if (main) main.style.transition = "none";
        if (bar) bar.style.transition = "none";
        if (footer) footer.style.transition = "none";
        setMobileOpen(false);
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "instant", block: "start" });
          window.history.replaceState(null, "", `#${id}`);
          requestAnimationFrame(() => {
            if (main) main.style.transition = "";
            if (bar) bar.style.transition = "";
            if (footer) footer.style.transition = "";
          });
        });
      } else {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        window.history.replaceState(null, "", `#${id}`);
      }
    }
  };

  const handleSubNavigate = (sectionId, step) => {
    setNavTarget({ section: sectionId, step });
    handleNavigate(sectionId);
    setTimeout(() => setNavTarget(null), 500);
  };

  // Deep link: scroll to section on initial load from hash
  useEffect(() => {
    const scrollToTarget = () => {
      const target = window.location.hash?.replace("#", "");
      if (target) {
        const el = document.getElementById(target);
        if (el) {
          setTimeout(() => el.scrollIntoView({ behavior: "instant", block: "start" }), 300);
        }
      }
    };
    scrollToTarget();
    window.addEventListener("hashchange", scrollToTarget);
    return () => window.removeEventListener("hashchange", scrollToTarget);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Learning Hub pages use the Learning Hub favicon (open-book mark). Swap the
  // SVG icon link on mount; restore the site default on unmount.
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"][type="image/svg+xml"]')
      || (() => { const l = document.createElement("link"); l.rel = "icon"; l.type = "image/svg+xml"; document.head.appendChild(l); return l; })();
    const prev = link.getAttribute("href");
    link.setAttribute("href", "/favicons/learning-hub-favicon.svg");
    return () => { if (prev) link.setAttribute("href", prev); else link.remove(); };
  }, []);

  return (
    <div className="app-root" style={{ fontFamily: F.body, color: P.text, display: "flex", minHeight: "100vh", minHeight: "100dvh" }}>
      <SEOHead
        title="Learn Mortgages: Plain-English Guides, Tools & Loan Programs | Mortgage Geek"
        description="The plain-English mortgage education hub. The journey from pre-qualification to closing, how Conventional, FHA, VA, and USDA compare, plus rates, closing costs, and what underwriters look for."
        path="/learn"
      />
      <style>{globalCSS}</style>
      <Sidebar activeSection={activeSection === "process" ? "getting-started" : activeSection} onNavigate={handleNavigate} onSubNavigate={handleSubNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className={`main-content ${mobileOpen ? "main-content-open" : ""}`} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} onClick={(e) => { if (mobileOpen) { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(false); } }}>
        <Page>
          <header style={{ padding: "56px 0 8px", maxWidth: 760 }}>
            {/* Pronounced Learning Hub identity: open-book mark + bold wordmark. */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <img src="/assets/learning-hub-mark.svg" alt="" aria-hidden="true" style={{ height: "clamp(48px, 7vw, 72px)", width: "auto", display: "block" }} />
              <span style={{ fontFamily: F.display, fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", color: P.navy, lineHeight: 1 }}>Learning Hub</span>
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 400, color: P.navy, lineHeight: 1.15, marginBottom: 12 }}>
              Mortgages, <span style={{ color: P.gold }}>demystified.</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: P.warmGray, maxWidth: 560 }}>
              The whole process in plain English, from your first question to closing day.
            </p>
          </header>
          <JourneyOverview />
          <PreContract navTarget={navTarget} />
          <ActiveLoanProcess navTarget={navTarget} />
          <MortgageTypes navTarget={navTarget} />
          <MortgageStructure navTarget={navTarget} />
          <BorrowerProfile navTarget={navTarget} />
          <InterestRates navTarget={navTarget} />
          <ClosingCosts navTarget={navTarget} />
          <NextSteps />
          <ToolsCTA />
          <PreApprovalChecklist />
          <JargonDecoder />
        </Page>
      </main>

      {!mobileOpen && <MobileToolbar />}
    </div>
  );
}
