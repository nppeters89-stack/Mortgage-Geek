import { P, F, HOME } from "../../theme";

// Slim homepage header (sales page). The homepage no longer renders the Sidebar
// (that moved to /learn), so this is the homepage's only top chrome: the Rate
// co-brand lock-up, a Learn entry point, and the primary CTA. Matches the
// co-brand treatment used on the mobile bar and tool/deep-dive headers.
//
// Uses position:sticky (not the pwa-safe-top class, which becomes position:fixed
// on mobile and would hide the hero behind it).
export function HomeHeader() {
  return (
    <header
      className="no-print"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${HOME.borderLight}`,
        paddingTop: "calc(14px + env(safe-area-inset-top, 0px))",
        paddingBottom: 14,
        paddingLeft: "clamp(20px, 4vw, 40px)",
        paddingRight: "clamp(20px, 4vw, 40px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, maxWidth: 1180, margin: "0 auto" }}>
        {/* Rate x Mortgage Geek co-brand lock-up (light variant). Per the Lockup
            Implementation Spec; all sizing scales from --mg-h. The Rate mark +
            divider collapse <=600px (where the CTA shares the bar), leaving the
            standalone MG lock-up. */}
        <a href="/" aria-label="Mortgage Geek, a loan officer at Rate" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <span className="mg-cobrand mg--light" style={{ "--mg-h": "clamp(32px, 4.2vw, 40px)" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center", gap: "calc(var(--mg-h) * 0.39)" }}>
              <img className="mg-cobrand__rate" src="/assets/rate-2color-black.png" alt="Rate" />
              <span className="mg-cobrand__divider" aria-hidden="true"></span>
            </span>
            <span className="mg-lockup">
              <img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
              <span className="mg-lockup__words">
                <span className="mg-lockup__top">Mortgage</span>
                <span className="mg-lockup__geek">Geek</span>
              </span>
            </span>
          </span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <a className="home-nav-secondary" href="/learn" style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: HOME.ink, textDecoration: "none" }}>Learn</a>
          <a
            href="https://rate.com/nickpeters" target="_blank" rel="noopener noreferrer"
            aria-label="Apply now with Nick Peters at Rate (opens rate.com in a new tab)"
            onMouseEnter={(e) => (e.currentTarget.style.background = HOME.redHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = HOME.red)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 8,
              background: HOME.red, color: "#fff",
              fontFamily: F.sans, fontSize: 15, fontWeight: 700,
              textDecoration: "none", whiteSpace: "nowrap", minHeight: 44, boxSizing: "border-box",
            }}
          >Apply Now</a>
        </nav>
      </div>
    </header>
  );
}
