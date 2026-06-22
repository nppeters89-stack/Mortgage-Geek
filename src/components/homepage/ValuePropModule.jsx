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

// Media slot sizing by aspect. Portrait stays a slim column with a width cap so
// it never towers (cap ~290 -> ~516px tall); square/landscape get wider slots.
// The column centers its video, so it's also centered when stacked on mobile.
const MEDIA = {
  portrait:  { aspect: "9 / 16", colFlex: "1 1 240px", maxW: 290 },
  square:    { aspect: "1 / 1",  colFlex: "1 1 300px", maxW: 380 },
  landscape: { aspect: "16 / 9", colFlex: "1 1 420px", maxW: 560 },
};

// Auto-linkify the two known URLs that appear in official disclosure text,
// keeping the config a plain string. Returns text + <a> nodes.
const DISCLOSURE_LINKS = [
  { token: "nmlsconsumeraccess.org", href: "https://nmlsconsumeraccess.org" },
  { token: "rate.com/same-day-mortgage", href: "https://rate.com/same-day-mortgage" },
];
function linkifyDisclosure(text) {
  if (!text) return text;
  let parts = [text];
  for (const { token, href } of DISCLOSURE_LINKS) {
    parts = parts.flatMap((part) => {
      if (typeof part !== "string" || !part.includes(token)) return [part];
      const segs = part.split(token);
      const out = [];
      segs.forEach((s, i) => {
        if (i > 0) out.push(<a key={token + i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>{token}</a>);
        if (s) out.push(s);
      });
      return out;
    });
  }
  return parts;
}

export function ValuePropModule({
  eyebrow, headline, body, bullets, ctaLabel, ctaHref, videoUrl, videoAspect = "square",
  surface = "charcoal", agentFacing = false, markSlot = null, disclosureSlot = null,
  fullTermsHref = null,
}) {
  const t = SURFACES[surface] || SURFACES.charcoal;
  const m = MEDIA[videoAspect] || MEDIA.square;

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
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
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

          {/* Official on-page fine print (rendered small but AA-legible).
              Reserved -> renders nothing. Known URLs auto-linkified. */}
          {disclosureSlot ? (
            <div style={{ marginTop: 22, maxWidth: 580 }}>
              <p style={{ fontFamily: F.body, fontSize: 11.5, lineHeight: 1.55, color: t.disclosure, margin: 0 }}>
                {linkifyDisclosure(disclosureSlot)}
                {fullTermsHref && (
                  <>
                    {" "}
                    <a href={fullTermsHref} target="_blank" rel="noopener noreferrer" style={{ color: t.disclosure, textDecoration: "underline", fontWeight: 600 }}>Full terms</a>
                  </>
                )}
              </p>
            </div>
          ) : null}
        </div>

        {/* Media column only when a clip is wired. Sized by videoAspect; the
            column centers its video so portrait stays slim and never towers. */}
        {videoUrl && (
          <div style={{ flex: m.colFlex, minWidth: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: m.maxW }}>
              <LazyVideo videoUrl={videoUrl} aspect={m.aspect} surface={surface} label={eyebrow || headline || "value prop"} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
