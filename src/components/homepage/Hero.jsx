import { P, F } from "../../theme";
import { REVIEWS } from "../../data/reviews";
import { ContactCard } from "./ContactCard";

// Hero photo treatment (spec Photo §): half-body cutout on the charcoal hero,
// anchored bottom-right of the copy block on desktop, dropped below the copy on
// mobile. The journey track is a sibling below, so it never overlaps. Red lives
// only in the primary CTA; the photo is never tinted.
const heroCSS = `
  /* Hero content is constrained to the same centered column as the content
     cards below (Page: max 1180 + clamp gutters). The section background stays
     full-bleed. */
  .hero-inner { position: relative; max-width: 1180px; margin: 0 auto; padding-left: clamp(20px, 4vw, 56px); padding-right: clamp(20px, 4vw, 56px); }
  .hero-copy { position: relative; z-index: 2; max-width: 600px; padding-bottom: clamp(48px, 6vw, 72px); }
  .hero-photo { position: absolute; right: clamp(20px, 4vw, 56px); bottom: 0; z-index: 1; pointer-events: none; line-height: 0; }
  .hero-photo img { display: block; width: auto; height: clamp(300px, 32vw, 430px); }
  /* Soft elliptical ground shadow so the cutout sits on the surface. */
  .hero-photo::after { content: ""; position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); width: 72%; height: 34px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%); filter: blur(5px); z-index: -1; }
  /* Reserve at least the photo's height in the column so the bottom-anchored
     cutout never gets its top clipped by the section's overflow:hidden when the
     copy is short. Matches .hero-photo img height. */
  @media (min-width: 1024px) {
    .hero-inner { min-height: clamp(300px, 32vw, 430px); }
  }
  @media (max-width: 1023px) {
    .hero-copy { max-width: none; padding-bottom: 0; }
    .hero-photo { position: static; display: block; right: auto; margin: 28px auto 0; }
    .hero-photo img { height: auto; width: clamp(220px, 62vw, 300px); margin: 0 auto; }
    .hero-photo::after { display: none; }
  }
`;

export function Hero() {
  const { rating, count } = REVIEWS;
  const hasRating = typeof rating === "number" && count > 0;

  return (
    <section id="hero" style={{ position: "relative", background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`, padding: "80px 0 0", overflow: "hidden" }}>
      <style>{heroCSS}</style>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 100%, rgba(207,51,56,0.08) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(207,51,56,0.08) 0%, transparent 50%)" }} />

      <div className="hero-inner">
        <div className="hero-copy">
          <h1 style={{ fontFamily: F.body, fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.05, letterSpacing: -0.5, marginBottom: 12 }}>
            Nick Peters
          </h1>
          <p style={{ fontFamily: F.body, fontSize: "clamp(13px, 1.5vw, 16px)", fontWeight: 500, letterSpacing: 0.3, color: "rgba(255,255,255,0.62)", marginBottom: 16 }}>
            VP of Mortgage Lending
            <span style={{ margin: "0 9px", color: "rgba(255,255,255,0.3)" }}>·</span>
            NMLS #1119524
            <span style={{ margin: "0 9px", color: "rgba(255,255,255,0.3)" }}>·</span>
            Nashville, TN
          </p>

          {/* Track-record badge: pops against the dark hero. */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 999,
            background: "rgba(207,51,56,0.14)", border: "1px solid rgba(230,106,110,0.45)",
            marginBottom: hasRating ? 24 : 36,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={P.goldLight} aria-hidden="true">
              <path d="M12 2l2.4 6.9H21l-5.4 4 2 6.8L12 15.6 6.4 19.7l2-6.8L3 8.9h6.6L12 2z"/>
            </svg>
            <span style={{ fontFamily: F.body, fontSize: "clamp(13px, 1.5vw, 15px)", fontWeight: 700, letterSpacing: 0.2, color: P.goldLight }}>
              12+ years and 1,000+ closed loans
            </span>
          </span>

          {hasRating && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              <span aria-hidden="true" style={{ color: P.goldLight, fontSize: 16, letterSpacing: 1, lineHeight: 1 }}>★★★★★</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{rating.toFixed(1)} on Google</span>
            </div>
          )}

          {/* CTA row: one "Contact Nick" card trigger + Start Learning. */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <ContactCard />
            <a href="/learn" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", borderRadius: 10,
              background: "transparent", color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: F.body, fontSize: 14, fontWeight: 500,
              textDecoration: "none", letterSpacing: 0.2,
            }}>
              Start Learning →
            </a>
          </div>
        </div>

        {/* Cutout anchors to .hero-inner, so it sits flush at the bottom of the
            centered hero column (aligned with the content cards below). */}
        <picture className="hero-photo">
        <source media="(min-width: 1024px)" srcSet="/hero-cutout-desktop.webp" />
        <source srcSet="/hero-cutout-mobile.webp" />
        <img
          src="/hero-cutout-desktop.webp"
          width="1323"
          height="1280"
          alt="Nick Peters, mortgage loan officer"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        </picture>
      </div>
    </section>
  );
}
