import { useState, useEffect, useRef } from "react";
import { F, P } from "../theme";
import { withAlpha } from "../utils/format";
import { useIsMobile, useIsStandalone } from "../utils/hooks";
import { MortgageCalcIcon, CompareIcon, PreQualIcon, CashToCloseIcon } from "./icons";

export function MobileToolbar({ hrefOverrides = {} }) {
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();
  const toolbarH = isStandalone ? 76 : 56;
  const [offset, setOffset] = useState(toolbarH);
  const lastY = useRef(0);
  useEffect(() => {
    if (!isMobile) return;
    let off = toolbarH;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        const nearBottom = (window.innerHeight + y) >= (document.documentElement.scrollHeight - 150);
        if (y < 100 || nearBottom) { off = toolbarH; } else { off = Math.max(0, Math.min(toolbarH, off + delta)); }
        lastY.current = y;
        setOffset(off);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, toolbarH]);
  if (!isMobile) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150, overflow: "hidden", pointerEvents: offset >= toolbarH ? "none" : "auto" }}>
      <nav style={{ transform: `translateY(${offset}px)`, willChange: "transform", background: withAlpha(P.navyDark, 0.75), backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingBottom: `max(${isStandalone ? 32 : 16}px, env(safe-area-inset-bottom, 0px))`, display: "flex", justifyContent: "center", alignItems: "center", height: isStandalone ? 76 : 56, paddingTop: isStandalone ? 32 : `max(16px, env(safe-area-inset-bottom, 0px))` }}>
        <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", maxWidth: 320, width: "100%" }}>
          {[
            { icon: "__CASH_ICON__", label: "Cash to Close", href: "/cash-to-close" },
            { icon: "__PREQUAL_ICON__", label: "Pre-Qual", href: "/prequal" },
            { icon: "__COMPARE_ICON__", label: "Compare", href: "/compare" },
            { icon: "__CALC_ICON__", label: "Calculator", href: "/calculator" },
          ].map((t) => (
            <a key={t.href} href={hrefOverrides[t.href] || t.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "0" }}>
              <span style={{ fontSize: 22, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {t.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={20} variant="cream" /> : t.icon === "__COMPARE_ICON__" ? <CompareIcon size={22} variant="cream" /> : t.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={22} variant="cream" /> : t.icon === "__CASH_ICON__" ? <CashToCloseIcon size={22} variant="cream" /> : t.icon}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#fff", fontFamily: F.body, letterSpacing: 0.3 }}>{t.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
