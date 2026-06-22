import { P, F } from "../../theme";

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
        background: "#FFFFFF",
        borderBottom: `1px solid ${P.creamDark}`,
        paddingTop: "calc(14px + env(safe-area-inset-top, 0px))",
        paddingBottom: 14,
        paddingLeft: "clamp(20px, 4vw, 40px)",
        paddingRight: "clamp(20px, 4vw, 40px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, maxWidth: 1180, margin: "0 auto" }}>
        <a href="/" aria-label="Mortgage Geek home" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}>
            <img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} />
            <span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} />
          </span>
          <img src="/mg-mark-sm.svg" alt="" aria-hidden="true" width={21} height={26} style={{ display: "block", flexShrink: 0, marginRight: 7 }} />
          <span style={{ fontFamily: F.display, fontSize: 18, color: P.text, lineHeight: 1, transform: "translateY(0.05em)", whiteSpace: "nowrap" }}>Mortgage <span style={{ color: P.gold }}>Geek</span></span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a className="home-nav-secondary" href="/learn" style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: P.text, textDecoration: "none" }}>Learn</a>
          <a href="https://rate.com/nickpeters" target="_blank" rel="noopener noreferrer" aria-label="Get pre-approved with Nick Peters at Rate (opens rate.com in a new tab)" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 10,
            background: P.gold, color: "#fff",
            fontFamily: F.body, fontSize: 14, fontWeight: 600,
            textDecoration: "none", letterSpacing: 0.2, whiteSpace: "nowrap",
          }}>Get pre-approved</a>
        </nav>
      </div>
    </header>
  );
}
