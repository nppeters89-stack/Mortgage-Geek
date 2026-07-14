import { P, F, globalCSS, CHART_COLORS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { GEEK_CHARTS } from "../data/geekCharts";
import { GeekChartPreview } from "../components/GeekChartPreview";
import { GeekChartsLockup } from "../components/GeekChartsLockup";
import { withAlpha } from "../utils/format";

// Dark-mode Geek Charts hub. Cards are mapped from the GEEK_CHARTS registry, so
// adding a chart later is one data entry plus one page. Mirrors the structural
// role of the Deep Dives hub. Metadata lives in the route adapter
// (routes/geek-charts.jsx); like those hubs it carries no collection schema.

const CREAM = CHART_COLORS.line;
const BODY = withAlpha(CHART_COLORS.line, 0.72);
const MUTED = withAlpha(CHART_COLORS.line, 0.5);
const BORDER = withAlpha(CHART_COLORS.line, 0.1);
const SURFACE = P.navy;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatUpdated(iso) {
  const [y, m] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export function GeekChartsHubPage() {
  return (
    <main style={{ fontFamily: F.body, color: CREAM, background: P.navyDark, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>
      <style>{`
        .gc-card { display: flex; flex-direction: column; gap: 18px; background: ${SURFACE}; border: 1px solid ${BORDER}; border-left: 3px solid ${CHART_COLORS.gold}; border-radius: 12px; padding: 22px 26px; }
        .gc-card-row { display: flex; gap: 24px; align-items: center; }
        .gc-card-text { flex: 1 1 300px; min-width: 0; }
        .gc-card-preview { flex: 0 0 auto; width: 220px; aspect-ratio: 4 / 3; background: ${P.navyDark}; border: 1px solid ${BORDER}; border-radius: 8px; overflow: hidden; }
        .gc-card-footer { display: flex; align-items: center; justify-content: space-between; }
        @media (max-width: 640px) {
          .gc-card { gap: 16px; padding: 20px 20px; }
          .gc-card-row { flex-direction: column; align-items: stretch; gap: 16px; }
          .gc-card-text { flex: 0 0 auto; }
          .gc-card-preview { width: 100%; aspect-ratio: 3 / 2; }
        }
      `}</style>

      <div className="pwa-safe-top" style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-white-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: BORDER, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--dark" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-cream-truered-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <a href="/learn" style={{ fontSize: 13, color: MUTED, textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}><span aria-hidden="true">←</span><img src="/assets/learning-hub-mark-cream-sm.svg" alt="" width={20} height={16} style={{ display: "block" }} />Learning Hub</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <GeekChartsLockup variant="dark" height={104} style={{ margin: "0 auto 20px" }} />
          <h1 style={{ fontFamily: F.display, fontSize: 42, color: CREAM, fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}>
            Long-run market history, <em style={{ fontStyle: "italic", color: CHART_COLORS.gold }}>charted</em>.
          </h1>
          <p style={{ fontSize: 15, color: BODY, maxWidth: 640, margin: "0 auto", lineHeight: 1.65 }}>
            Each chart takes a number that gets talked about loosely and shows you the actual series, built on real data from authoritative sources. Then it explains, in plain terms, what the history means if you are trying to buy a home.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {GEEK_CHARTS.map((c) => (
            <a key={c.slug} href={`/geek-charts/${c.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="gc-card">
                <div className="gc-card-row">
                  <div className="gc-card-text">
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                      <h2 style={{ fontFamily: F.display, fontSize: 22, color: CREAM, fontWeight: 400, lineHeight: 1.2, margin: 0 }}>{c.title}</h2>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: CHART_COLORS.gold, border: `1px solid ${withAlpha(CHART_COLORS.gold, 0.4)}`, borderRadius: 999, padding: "2px 9px" }}>{c.period}</span>
                    </div>
                    <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65, margin: 0 }}>{c.tagline}</p>
                  </div>
                  <div className="gc-card-preview">
                    <GeekChartPreview slug={c.slug} />
                  </div>
                </div>
                <div className="gc-card-footer">
                  <span style={{ fontSize: 11, color: MUTED, fontStyle: "italic" }}>Updated · {formatUpdated(c.updated)}</span>
                  <span style={{ fontSize: 13, color: CHART_COLORS.gold, fontWeight: 600 }}>Open →</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, padding: "24px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: BODY, fontStyle: "italic", margin: 0 }}>More Geek Charts coming. Two more are in the queue.</p>
        </div>
      </div>

      <MobileToolbar />
    </main>
  );
}
