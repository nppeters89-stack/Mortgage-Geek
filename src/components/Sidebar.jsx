import { useState } from "react";
import { P, F } from "../theme";
import { NAV_TOPICS, NAV_TOOLS } from "../data/nav.js";
import { HEADSHOT } from "../data/headshot.js";
import { useIsMobile, useIsStandalone } from "../utils/hooks";
import { MortgageCalcIcon, CompareIcon, PreQualIcon, CashToCloseIcon } from "./icons";

export function Sidebar({ activeSection, onNavigate, onSubNavigate, mobileOpen, setMobileOpen }) {
  const [expandedNav, setExpandedNav] = useState(null);
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();

  return (
    <>
      <div className={`mobile-bar ${mobileOpen ? "mobile-bar-open" : ""}`}>
        <div className="mobile-bar-inner">
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileOpen(false);
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "inherit", cursor: "pointer", minWidth: 0 }}
          >
            {/* Co-brand lock-up on the white mobile bar: Rate (black) | divider |
                MG lock-up (MORTGAGE / GEEK + new single-notch mark, light variant). */}
            <img src="/rate-2color-black-tight.svg" alt="Rate" width={58} height={24} style={{ display: "block", flexShrink: 0 }} />
            <span aria-hidden="true" style={{ width: 1, height: 24, background: P.creamDark, flexShrink: 0, margin: "0 8px" }} />
            <span className="mg-lockup mg--light" style={{ "--mg-h": "26px" }}>
              <img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
              <span className="mg-lockup__words">
                <span className="mg-lockup__top">Mortgage</span>
                <span className="mg-lockup__geek">Geek</span>
              </span>
            </span>
          </a>
          <button className="hamburger" onClick={() => { if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(!mobileOpen); }}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "0 0 24px" }}>
          <div className="pwa-safe-top-sidebar" style={{ padding: "16px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", margin: "0 auto 16px", border: `3px solid ${P.gold}`, background: "rgba(255,255,255,0.05)" }}>
              <img src={HEADSHOT} alt="Nick Peters, mortgage loan officer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <a
              href="/"
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileOpen(false);
                }
              }}
              style={{ textDecoration: "none", color: "inherit", display: "block", cursor: "pointer", textAlign: "center" }}
              aria-label="Mortgage Geek"
            >
              {/* Same MG lock-up as the main page (dark variant) with the new
                  single-notch mark: MORTGAGE / GEEK + cream four-pane monogram. */}
              <span className="mg-lockup mg--dark" style={{ "--mg-h": "46px" }}>
                <img className="mg-lockup__mark" src="/assets/mg-mark-cream-truered.svg" alt="" aria-hidden="true" />
                <span className="mg-lockup__words">
                  <span className="mg-lockup__top">Mortgage</span>
                  <span className="mg-lockup__geek">Geek</span>
                </span>
              </span>
            </a>
            <a href="/about" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", marginTop: 6, display: "inline-block", transition: "color 0.15s" }} onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"} onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.35)"}>About Nick →</a>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}><a href="tel:+16156560737" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>(615) 656-0737</a></p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>NMLS #1119524</p>
          </div>
          <nav style={{ padding: "20px 12px", flex: 1 }}>
            {!isStandalone && (
              <>
                <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: `${P.goldLight}`, padding: "0 12px 10px", textTransform: "uppercase", opacity: 0.7 }}>App</span>
                <button
                  onClick={() => { window.location.href = "/install"; }}
                  className="nav-btn"
                  style={{ background: `${P.gold}15`, border: `1px solid ${P.gold}40` }}
                >
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>📲</span>
                  <span style={{ color: "#fff" }}>Install App</span>
                </button>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 12px" }} />
              </>
            )}
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", padding: "0 12px 10px", textTransform: "uppercase" }}>TOPICS</span>
            {NAV_TOPICS.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.subs) {
                      // Parent topic with dropdown — expand/collapse; also navigate on desktop
                      setExpandedNav(expandedNav === item.id ? null : item.id);
                      if (!isMobile) onNavigate(item.id);
                    } else {
                      // Leaf topic — navigate directly and close mobile sidebar
                      onNavigate(item.id);
                      setMobileOpen(false);
                    }
                  }}
                  className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
                  style={{ justifyContent: "space-between" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {item.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={16} variant="cream" /> : item.icon === "__COMPARE_ICON__" ? <CompareIcon size={18} variant="cream" /> : item.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={18} variant="cream" /> : item.icon === "__CASH_ICON__" ? <CashToCloseIcon size={18} variant="cream" /> : item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  {item.subs && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", transition: "transform 0.2s", transform: expandedNav === item.id ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                  )}
                </button>
                {item.subs && expandedNav === item.id && (
                  <div style={{ paddingLeft: 50, paddingBottom: 4 }}>
                    {item.subs.map((sub, si) => (
                      <button
                        key={si}
                        onClick={() => {
                          onSubNavigate(sub.id, sub.step);
                          setMobileOpen(false);
                        }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "7px 12px", border: "none", borderRadius: 6,
                          background: "transparent", fontFamily: F.body,
                          fontSize: 12, color: "rgba(255,255,255,0.4)",
                          cursor: "pointer", transition: "all 0.15s",
                          borderLeft: "1px solid rgba(255,255,255,0.08)",
                          marginBottom: 1,
                        }}
                        onMouseEnter={(e) => { e.target.style.color = "rgba(255,255,255,0.7)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.4)"; e.target.style.background = "transparent"; }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 12px" }} />
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", padding: "0 12px 10px", textTransform: "uppercase" }}>TOOLS</span>
            {NAV_TOOLS.filter(item => item.href && !item.reference).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.href) { window.location.href = item.href; return; }
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={16} variant="cream" /> : item.icon === "__COMPARE_ICON__" ? <CompareIcon size={18} variant="cream" /> : item.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={18} variant="cream" /> : item.icon === "__CASH_ICON__" ? <CashToCloseIcon size={18} variant="cream" /> : item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 12px" }} />
            <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", padding: "0 12px 10px", textTransform: "uppercase" }}>Reference</span>
            {NAV_TOOLS.filter(item => !item.href || item.reference).map((item) => {
              const iconNode = (
                <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon === "__CALC_ICON__" ? <MortgageCalcIcon size={16} variant="cream" /> : item.icon === "__COMPARE_ICON__" ? <CompareIcon size={18} variant="cream" /> : item.icon === "__PREQUAL_ICON__" ? <PreQualIcon size={18} variant="cream" /> : item.icon === "__CASH_ICON__" ? <CashToCloseIcon size={18} variant="cream" /> : item.icon}
                </span>
              );
              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
                    style={{ opacity: 0.82, textDecoration: "none" }}
                  >
                    {iconNode}
                    <span>{item.label}</span>
                  </a>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  className={`nav-btn ${activeSection === item.id ? "nav-btn-active" : ""}`}
                  style={{ opacity: 0.82 }}
                >
                  {iconNode}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontSize: 10, lineHeight: 1.5, color: "rgba(255,255,255,0.25)" }}>Educational content only.<br />Not financial advice.</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <svg width="9" height="10" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ verticalAlign: "middle" }}>
                <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
                <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
              </svg>
              <span>Equal Housing Lender</span>
            </p>
          </div>
        </div>
      </aside>
      <div className={`sidebar-overlay ${mobileOpen ? "sidebar-overlay-visible" : ""}`} id="sidebar-overlay-drag" onClick={() => { if (mobileOpen) { if (navigator.vibrate) navigator.vibrate(10); setMobileOpen(false); } }} />
    </>
  );
}
