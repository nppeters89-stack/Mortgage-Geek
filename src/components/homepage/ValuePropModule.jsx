import { P, F } from "../../theme";
import { LazyVideo } from "./LazyVideo";

// Surface themes. Red is reserved for ONE module (PowerBid) so red stays a
// spark per the brand spec. All text/background pairs clear WCAG AA.
const SURFACES = {
  red: {
    // Rich deep-maroon -> Arrow Red gradient (not a flat red wash). Darkest at
    // the top-left where the copy sits, so white text pops; distinct from the
    // Same Day card's cool charcoal gradient.
    bg: `linear-gradient(150deg, ${P.goldDeep} 0%, ${P.goldMuted} 48%, ${P.gold} 100%)`,
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
  portrait:   { aspect: "9 / 16", colFlex: "1 1 240px", maxW: 290 },
  portrait45: { aspect: "4 / 5",  colFlex: "1 1 300px", maxW: 360 }, // 4:5 vertical (~450px at cap)
  square:     { aspect: "1 / 1",  colFlex: "1 1 300px", maxW: 380 },
  landscape:  { aspect: "16 / 9", colFlex: "1 1 420px", maxW: 560 },
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
  eyebrow, headline, body, bullets, ctaLabel, ctaHref, ctaExternal = false,
  ctaMark = null, ctaButton = null, ctaBanner = null, headlineFootnote = null,
  videoUrl, videoAspect = "square", coverFrame = "first", surface = "charcoal",
  agentFacing = false, markSlot = null, disclosureSlot = null, fullTermsHref = null,
}) {
  const t = SURFACES[surface] || SURFACES.charcoal;
  const m = MEDIA[videoAspect] || MEDIA.square;

  const ctaStyle = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 24px", borderRadius: 10,
    fontFamily: F.body, fontSize: 15, fontWeight: 600,
    textDecoration: "none", letterSpacing: 0.2, border: "none",
    ...t.cta,
    ...(ctaButton || {}), // per-module override so a logo reads on the button
  };

  // CTA label may embed a {mark} token replaced by the product logomark inline,
  // so the button reads e.g. "Get [PowerBid] Approved". width/height from the
  // viewBox prevent layout shift; displayH sets the rendered height.
  const renderCtaContent = () => {
    const inlineMark = ctaMark && ctaMark.src ? (
      <img
        key="ctamark"
        src={ctaMark.src}
        alt={ctaMark.alt}
        width={ctaMark.w}
        height={ctaMark.h}
        style={{ display: "inline-block", width: "auto", height: ctaMark.displayH || 18, verticalAlign: "middle", margin: "0 2px" }}
      />
    ) : null;
    const label = ctaLabel || "";
    const pieces = inlineMark && label.includes("{mark}")
      ? label.split("{mark}").flatMap((seg, i) => (i === 0 ? [seg] : [inlineMark, seg]))
      : [inlineMark, label].filter(Boolean);
    return (
      <>
        {pieces.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : p))}
        {" "}
        <span aria-hidden="true">→</span>
      </>
    );
  };

  // Banner-style CTA: a light/outlined pill carrying the product logomark, a
  // brace divider, and a tagline. Clickable as a whole. ctaBanner = { logoSrc,
  // logoAlt, logoW, logoH, tagline }.
  const renderBanner = () => {
    const b = ctaBanner;
    const inner = (
      <>
        <img
          src={b.logoSrc}
          alt={b.logoAlt}
          width={b.logoW}
          height={b.logoH}
          style={{ display: "block", width: "auto", height: "clamp(40px, 7vw, 52px)", flexShrink: 0 }}
        />
        <span aria-hidden="true" style={{ fontFamily: F.display, fontSize: "clamp(40px, 8vw, 58px)", lineHeight: 0.7, color: "rgba(207,51,56,0.35)", fontWeight: 400, flexShrink: 0 }}>
          &#125;
        </span>
        <span style={{ fontFamily: F.body, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 700, lineHeight: 1.25, color: P.gold, flex: 1, minWidth: 0 }}>
          {b.tagline}
        </span>
        <span aria-hidden="true" style={{ fontSize: 22, color: P.gold, flexShrink: 0, fontWeight: 700 }}>&rarr;</span>
      </>
    );
    const bannerStyle = {
      display: "flex", alignItems: "center", gap: "clamp(14px, 2.5vw, 24px)",
      width: "100%", padding: "clamp(16px, 2.5vw, 22px) clamp(20px, 3vw, 28px)",
      background: "#FFFFFF", border: "1px solid rgba(207,51,56,0.25)",
      borderRadius: 18, textDecoration: "none", flexWrap: "wrap",
      boxShadow: "0 2px 14px rgba(0,0,0,0.10)",
    };
    return ctaHref ? (
      <a href={ctaHref} aria-label={b.logoAlt + ": " + b.tagline} {...(ctaExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={bannerStyle}>
        {inner}
      </a>
    ) : (
      <span role="button" aria-disabled="true" aria-label={b.logoAlt + ": " + b.tagline} style={{ ...bannerStyle, cursor: "default" }}>{inner}</span>
    );
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
          {/* Official Rate product mark (lock-up). Rendered at its natural
              aspect — never stretched. width/height from the viewBox prevent
              layout shift; CSS max-height + width:auto does the visual sizing.
              Wide wordmarks cap at 40px, near-square badges at 64px. Renders
              nothing (clean empty space) when no mark is provided. */}
          {markSlot && markSlot.src ? (
            <img
              src={markSlot.src}
              alt={markSlot.alt}
              width={markSlot.w}
              height={markSlot.h}
              style={{
                display: "block",
                width: "auto",
                height: "auto",
                maxHeight: markSlot.w / markSlot.h >= 2 ? 58 : 92,
                maxWidth: "100%",
                marginBottom: 16,
              }}
            />
          ) : null}

          {agentFacing && (
            <span style={{ display: "inline-block", background: P.navy, color: P.cream, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", padding: "4px 11px", borderRadius: 50, marginBottom: 14 }}>
              For agents
            </span>
          )}

          {/* Eyebrow is redundant when the product logomark already names the
              product (card mark or CTA banner), so suppress it there. */}
          {eyebrow && !(markSlot && markSlot.src) && !ctaBanner && (
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", color: t.eyebrow, marginBottom: 12 }}>
              {eyebrow}
            </span>
          )}

          {headline && (
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px, 3.2vw, 34px)", fontWeight: 400, color: t.headline, lineHeight: 1.18, marginBottom: body ? 14 : 22 }}>
              {headline}
              {headlineFootnote && (
                <sup style={{ fontSize: "0.5em", fontWeight: 600, marginLeft: 2, verticalAlign: "super", opacity: 0.8 }}>{headlineFootnote}</sup>
              )}
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

          {ctaBanner ? renderBanner() : ctaLabel && (() => {
            // Accessible name: replace the {mark} token with the mark's alt text.
            const ctaAria = ctaMark && ctaMark.src
              ? ctaLabel.replace("{mark}", ctaMark.alt)
              : ctaLabel;
            return ctaHref ? (
              <a
                href={ctaHref}
                aria-label={ctaAria}
                {...(ctaExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={ctaStyle}
              >
                {renderCtaContent()}
              </a>
            ) : (
              // ctaHref pending (Rate funnel URL). Render the button visually but
              // inert until the URL is added in config — no dead anchor.
              <span role="button" aria-disabled="true" aria-label={ctaAria} style={{ ...ctaStyle, cursor: "default" }}>
                {renderCtaContent()}
              </span>
            );
          })()}

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
              <LazyVideo videoUrl={videoUrl} aspect={m.aspect} coverFrame={coverFrame} label={eyebrow || headline || "value prop"} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
