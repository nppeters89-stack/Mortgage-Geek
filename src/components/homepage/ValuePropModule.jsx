import { P, F } from "../../theme";
import { LazyVideo } from "./LazyVideo";

// Surface themes. Red is reserved for ONE module (PowerBid) so red stays a
// spark per the brand spec. All text/background pairs clear WCAG AA.
const SURFACES = {
  red: {
    bg: P.gold,
    border: "none",
    eyebrow: "rgba(255,255,255,0.92)",
    headline: "#FFFFFF",
    body: "rgba(255,255,255,0.92)",
    cta: { background: "#FFFFFF", color: P.navy },
    disclosure: "rgba(255,255,255,0.9)",
  },
  charcoal: {
    bg: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 60%, ${P.navyLight} 100%)`,
    border: "none",
    eyebrow: P.goldLight,
    headline: "#FFFFFF",
    body: "rgba(255,255,255,0.74)",
    cta: { background: P.gold, color: "#FFFFFF" },
    disclosure: "rgba(255,255,255,0.62)",
  },
  cream: {
    bg: P.white,
    border: `1px solid ${P.creamDark}`,
    eyebrow: P.goldMuted,
    headline: P.navy,
    body: P.warmGray,
    cta: { background: P.gold, color: "#FFFFFF" },
    disclosure: P.warmGray,
  },
};

export function ValuePropModule({
  eyebrow, headline, body, bullets, ctaLabel, ctaHref, videoUrl, videoPoster,
  surface = "charcoal", agentFacing = false, markSlot = null, disclosureSlot = null,
  disclosurePending = false, fullTermsHref = null,
}) {
  const t = SURFACES[surface] || SURFACES.charcoal;

  const ctaStyle = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 24px", borderRadius: 10,
    fontFamily: F.body, fontSize: 15, fontWeight: 600,
    textDecoration: "none", letterSpacing: 0.2, border: "none",
    ...t.cta,
  };

  return (
    <section
      style={{
        background: t.bg,
        border: t.border,
        borderRadius: 16,
        padding: "clamp(28px, 4vw, 44px)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px, 4vw, 44px)", alignItems: "center" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          {/* Reserved slot for the official Rate product mark. Renders nothing
              until provided — no placeholder text. */}
          {markSlot ? <div style={{ marginBottom: 16 }}>{markSlot}</div> : null}

          {agentFacing && (
            <span style={{ display: "inline-block", background: P.navy, color: P.cream, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", padding: "4px 11px", borderRadius: 50, marginBottom: 14 }}>
              For agents
            </span>
          )}

          {eyebrow && (
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", color: t.eyebrow, marginBottom: 12 }}>
              {eyebrow}
            </span>
          )}

          {headline && (
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px, 3.2vw, 34px)", fontWeight: 400, color: t.headline, lineHeight: 1.18, marginBottom: body ? 14 : 22 }}>
              {headline}
            </h2>
          )}

          {body && (
            <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.7, color: t.body, marginBottom: 24, maxWidth: 520 }}>
              {body}
            </p>
          )}

          {Array.isArray(bullets) && bullets.length > 0 && (
            <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.5, color: t.body, display: "flex", gap: 10 }}>
                  <span aria-hidden="true" style={{ color: t.cta.background === "#FFFFFF" ? "#FFFFFF" : P.gold, fontWeight: 700 }}>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {ctaLabel && (
            ctaHref ? (
              <a href={ctaHref} target="_blank" rel="noopener noreferrer" style={ctaStyle}>
                {ctaLabel} <span aria-hidden="true">→</span>
              </a>
            ) : (
              // ctaHref pending (Rate funnel URL). Render the button visually but
              // inert until the URL is added in config — no dead anchor.
              <span role="button" aria-disabled="true" style={{ ...ctaStyle, cursor: "default" }}>
                {ctaLabel} <span aria-hidden="true">→</span>
              </span>
            )
          )}

          {/* Reserved fine-print slot. Renders nothing until provided. */}
          {disclosureSlot ? (
            <div style={{ marginTop: 22, maxWidth: 560 }}>
              {disclosurePending && (
                <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: t.disclosure, marginBottom: 5, opacity: 0.85 }}>
                  Draft, pending Rate confirmation
                </span>
              )}
              <p style={{ fontFamily: F.body, fontSize: 11, lineHeight: 1.5, color: t.disclosure, margin: 0 }}>
                {disclosureSlot}
                {" "}
                {fullTermsHref ? (
                  <a href={fullTermsHref} target="_blank" rel="noopener noreferrer" style={{ color: t.disclosure, textDecoration: "underline", fontWeight: 600 }}>Full terms</a>
                ) : (
                  <span aria-disabled="true" style={{ textDecoration: "underline", fontWeight: 600 }}>Full terms</span>
                )}
              </p>
            </div>
          ) : null}
        </div>

        {/* Video column only when a clip (or stand-in) is wired. */}
        {videoUrl && (
          <div style={{ flex: "0 1 360px", width: "100%", maxWidth: 380 }}>
            <LazyVideo videoUrl={videoUrl} poster={videoPoster} label={headline || eyebrow || "value prop"} />
          </div>
        )}
      </div>
    </section>
  );
}
