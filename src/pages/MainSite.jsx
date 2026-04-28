import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { P, F, globalCSS } from "../theme";
import { useIsMobile, useIsStandalone } from "../utils/hooks";
import { Sidebar } from "../components/Sidebar";
import { MobileToolbar } from "../components/MobileToolbar";
import { Hero } from "../components/homepage/Hero";
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

export function MainSite() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();
  // Signals that a navigation just occurred, so the scroll-lock cleanup
  // should skip restoring the previous scroll position (the navigation
  // handler is scrolling to the target section). Prevents a race where
  // the scroll-restore overrides scrollIntoView on mobile nav clicks.
  const skipScrollRestore = useRef(false);
  const skipTransition = useRef(false);

  // Scroll-lock: when sidebar is open, add `sidebar-locked` class to <html>.
  // CSS then applies overflow:hidden + height:100% to html/body so neither
  // can scroll. preventDefault on document touchmove (outside the sidebar)
  // is kept as belt-and-suspenders for iOS Safari.
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

      // Lock direction after 8px of movement
      if (!dirLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        dirLocked = true;
        isHorizontal = Math.abs(dx) > Math.abs(dy);
        if (!isHorizontal) { tracking = false; return; }
        const main = getMain();
        const bar = getBar();
        if (main) main.classList.add("sidebar-dragging");
        if (bar) bar.classList.add("sidebar-dragging");
        addScrollBlocker();
      }

      if (!dirLocked || !isHorizontal) return;

      const main = getMain();
      const bar = getBar();
      if (!main) return;

      if (mode === "opening") {
        const dragPx = Math.max(0, Math.min(dx, SIDEBAR_W));
        const pct = dragPx / SIDEBAR_W;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${dragPx}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${dragPx}px)`;
      } else if (mode === "closing") {
        const dragPx = Math.max(0, Math.min(-dx, SIDEBAR_W));
        const pct = 1 - (dragPx / SIDEBAR_W);
        const offset = SIDEBAR_W - dragPx;
        const radius = Math.round(pct * 16);
        main.style.transform = `translateX(${offset}px)`;
        main.style.borderRadius = `${radius}px 0 0 0`;
        main.style.setProperty("--sidebar-dim", pct);
        if (bar) bar.style.transform = `translateX(${offset}px)`;
      }
    };

    const onTouchEnd = () => {
      if (!tracking || !isHorizontal) { tracking = false; return; }
      const dx = currentX - startX;
      const main = getMain();
      const bar = getBar();

      // Re-enable CSS transitions for snap
      if (main) main.classList.remove("sidebar-dragging");
      if (bar) bar.classList.remove("sidebar-dragging");

      // Clear inline styles — let CSS classes handle the snap
      if (main) { main.style.transform = ""; main.style.borderRadius = ""; main.style.removeProperty("--sidebar-dim"); }
      if (bar) bar.style.transform = "";
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

  // Overscroll bounce is prevented via CSS `overscroll-behavior: none` on
  // body and .main-content (see globalCSS). A prior JS implementation attached
  // a non-passive touchmove listener to document, which froze scrolling on
  // Android Chrome because it forces touchmove onto the JS main thread and
  // disables compositor scrolling. CSS handles the same job natively on
  // iOS Safari 16+ and all modern Android browsers.

  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // If sidebar is open on mobile, we need to close it FIRST so the body
      // becomes unfrozen before scrollIntoView runs. Set the skip flag so the
      // cleanup doesn't restore the old scroll position, then defer the scroll.
      if (mobileOpen) {
        // Disable transition so content snaps back instantly (no navy flash)
        const main = document.querySelector(".main-content");
        const bar = document.querySelector(".mobile-bar");
        if (main) main.style.transition = "none";
        if (bar) bar.style.transition = "none";
        setMobileOpen(false);
        // Wait one frame for DOM to update, then scroll and restore transitions
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "instant", block: "start" });
          window.history.replaceState(null, "", `#${id}`);
          requestAnimationFrame(() => {
            if (main) main.style.transition = "";
            if (bar) bar.style.transition = "";
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

  // Deep link: scroll to section on initial load from hash or path
  useEffect(() => {
    const scrollToTarget = () => {
      let target = window.location.hash?.replace("#", "");
      // Also support /calculator style paths
      if (!target) {
        const path = window.location.pathname?.replace("/", "");
        if (path) target = path;
      }
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

  return (
    <div className="app-root" style={{ fontFamily: F.body, color: P.text, display: "flex", minHeight: "100vh", minHeight: "100dvh" }}>
      <SEOHead
        title="The Mortgage Geek — Plain-English Mortgage Tools & Guides"
        description="Free mortgage calculators, side-by-side loan comparisons, and deep-dive guides for first-time buyers. Written by a 12-year mortgage pro, not an algorithm."
        path="/"
      />
      <style>{globalCSS}</style>
      <Sidebar activeSection={activeSection === "process" ? "getting-started" : activeSection} onNavigate={handleNavigate} onSubNavigate={handleSubNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className={`main-content ${mobileOpen ? "main-content-open" : ""}`} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} onClick={(e) => { if (mobileOpen) { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(false); } }}>
        <Hero onNavigate={handleNavigate} />
        <Page>
          <JourneyOverview onNavigate={handleSubNavigate} />
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
          <footer style={{ padding: "40px 40px 32px", borderTop: `1px solid ${P.creamDark}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap", maxWidth: 720 }}>
              {/* Disclaimer text */}
              <div style={{ flex: 1, minWidth: 250 }}>
                <p style={{ fontFamily: F.display, fontSize: 18, color: P.navy, marginBottom: 2 }}>The Mortgage Geek 🤓</p>
                <p style={{ fontFamily: F.display, fontSize: 12, color: P.gold, fontStyle: "italic", marginBottom: 12, letterSpacing: 0.3 }}>Mortgages Demystified.</p>
                <p style={{ fontSize: 11, lineHeight: 1.6, color: P.warmGrayLight, marginBottom: 8 }}>
                  This content is for educational purposes only and does not constitute financial advice. Loan programs, rates, terms, and guidelines are subject to change without notice. Always consult directly with a licensed mortgage professional for guidance specific to your situation.
                </p>
                <p style={{ fontSize: 11, color: P.warmGrayLight, opacity: 0.6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span>(615) 656-0737 · NMLS# 1119524 ·</span>
                  <svg width="11" height="12" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
                    <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                    <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
                    <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
                  </svg>
                  <span>Equal Housing Lender</span>
                </p>
              </div>
            </div>
          </footer>
        </Page>
      </main>

      {!mobileOpen && <MobileToolbar />}
    </div>
  );
}
