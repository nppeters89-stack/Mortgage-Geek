import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";

export function GeekMapsHubPage() {
  const maps = [
    {
      slug: "tennessee-loan-limits",
      emoji: "🗺",
      title: "Tennessee Loan Limits 2026",
      summary: "Interactive map of 2026 conforming and FHA loan limits across all 95 TN counties, with VA and USDA context. Refreshed every November when FHFA and HUD publish the next year's numbers.",
      lastUpdated: "April 2026",
    },
  ];

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title="Geek Maps: Interactive Mortgage Reference Tools | The Mortgage Geek"
        description="Interactive maps and look-up tools for mortgage planning. Tennessee loan limits, USDA eligibility, property taxes. Real data, refreshed as it updates."
        path="/geek-maps"
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/mg-mark-sm.svg" alt="" aria-hidden="true" width={21} height={26} style={{ display: "block" }} />
            <span style={{ fontFamily: F.display, fontSize: 18, color: P.text }}>Mortgage <span style={{ color: P.gold }}>Geek</span></span>
          </a>
          <a href="/" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🗺</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 10 }}>Geek Maps</span>
          <h1 style={{ fontFamily: F.display, fontSize: 42, color: P.navy, fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}>
            Look up <em style={{ fontStyle: "italic", color: P.gold }}>real numbers</em>, fast.
          </h1>
          <p style={{ fontSize: 15, color: P.warmGray, maxWidth: 620, margin: "0 auto", lineHeight: 1.65 }}>
            Interactive look-up tools and maps for mortgage planning. Built around real data from authoritative sources, refreshed as the data updates.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {maps.map((m) => (
            <a key={m.slug} href={`/geek-maps/${m.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: "24px 28px",
                border: `1px solid ${P.creamDark}`,
                borderLeft: `3px solid ${P.gold}`,
                transition: "transform 0.15s, box-shadow 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(15, 37, 48, 0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{m.emoji}</span>
                  <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, fontWeight: 400, lineHeight: 1.2 }}>{m.title}</h3>
                </div>
                <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 10 }}>{m.summary}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last updated · {m.lastUpdated}</span>
                  <span style={{ fontSize: 13, color: P.gold, fontWeight: 600 }}>Open →</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, padding: "24px", background: P.creamDark, borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: P.warmGray, fontStyle: "italic" }}>More Geek Maps coming. TN USDA eligibility map and TN property tax map are in the queue.</p>
        </div>
      </div>

      <MobileToolbar />
    </main>
  );
}
