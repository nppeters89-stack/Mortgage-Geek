import { P, F } from "../../theme";
import { REVIEWS } from "../../data/reviews";

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
          <p style={{ fontFamily: F.body, fontSize: "clamp(14px, 1.6vw, 17px)", fontWeight: 500, letterSpacing: 0.3, color: "rgba(255,255,255,0.62)", marginBottom: hasRating ? 24 : 36 }}>
            VP of Mortgage Lending
            <span style={{ margin: "0 10px", color: "rgba(255,255,255,0.3)" }}>|</span>
            NMLS #1119524
          </p>

          {hasRating && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              <span aria-hidden="true" style={{ color: P.goldLight, fontSize: 16, letterSpacing: 1, lineHeight: 1 }}>★★★★★</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{rating.toFixed(1)} from {count}+ Google reviews</span>
            </div>
          )}

          {/* CTA row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="tel:+16156560737" aria-label="Call Nick Peters at (615) 656-0737" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", borderRadius: 10,
              background: P.gold, color: "#fff",
              fontFamily: F.body, fontSize: 15, fontWeight: 600,
              textDecoration: "none", letterSpacing: 0.3,
              boxShadow: "0 4px 16px rgba(207,51,56,0.3)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="sms:+16156560737&body=Hi%2C%20I%20found%20your%20site%20and%20had%20a%20question%20about%20mortgages." aria-label="Text Nick Peters at (615) 656-0737" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", borderRadius: 10,
              background: "rgba(255,255,255,0.12)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: F.body, fontSize: 15, fontWeight: 600,
              textDecoration: "none", letterSpacing: 0.3,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="btn-label-mobile-hide">Text</span>
            </a>
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
