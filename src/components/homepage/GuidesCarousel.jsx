import { P, F } from "../../theme";
import { withAlpha } from "../../utils/format";
import { useCarousel, CAROUSEL_GAP } from "./useCarousel";

// "Guides" carousel for the bottom of the Learning Hub. Surfaces the four deep
// references (Deep Dives, Geek Charts, Pre-Approval Checklist, Jargon Decoder)
// as an auto-advancing carousel of dark cards, so they get real prominence
// instead of only living as small sidebar links. Recreated from the design
// handoff using our tokens (theme.js), our Figtree type system at the handoff's
// scale, and our existing iconography (the nav emojis + the built geek-charts
// glyph). Full-bleed dark band via .section-bleed, mirroring ToolsCTA.

// Design palette mapped to theme tokens (no hardcoded hex).
const ACCENT = P.gold; // Rate red (#CF3338)
const BAND = P.navyDark; // band background (#131416)
const CARD = P.navy; // card surface, one step up from the band
const HEAD = P.cream; // headings / primary text
const BODY = P.warmGrayLight; // secondary body text (#9A9DA2)
const META = P.warmGray; // muted meta label (#6E7176)
const NUM = withAlpha(P.warmGrayLight, 0.5); // dim card number
const BORDER = withAlpha(P.white, 0.08);
const TILE = withAlpha(P.white, 0.06);
const DOT_OFF = withAlpha(P.white, 0.22);
const NAV_BORDER = withAlpha(P.white, 0.16);

// Icons come from our existing set: the nav emojis for three cards, and the
// built geek-charts glyph SVG for Geek Charts (rendered in the 60x60 tile).
const CARDS = [
  { icon: "🐳", num: "01", kicker: "By program", title: "Deep Dives", desc: "In-depth answers to the trickiest questions, broken down by loan program.", meta: "By program", cta: "Explore", href: "/deep-dives" },
  { glyph: "/assets/geek-charts-glyph.svg", num: "02", kicker: "Long-term data", title: "Geek Charts", desc: "The long-run market history behind rates, home prices, and affordability, charted from real data.", meta: "Long-term data", cta: "Explore", href: "/geek-charts" },
  { icon: "✅", num: "03", kicker: "Get organized", title: "Pre-Approval Checklist", desc: "Every document to gather before you apply, in one organized place.", meta: "20 documents", cta: "Open", href: "/pre-approval-checklist" },
  { icon: "📖", num: "04", kicker: "Speak the language", title: "Jargon Decoder", desc: "Mortgage terms explained in plain, human language. No lender-speak.", meta: "34 terms", cta: "Open", href: "/jargon-decoder" },
];

export function GuidesCarousel({ showCounts = true, autoplay = true }) {
  // Mechanics live in useCarousel, shared with the Your Toolkit rail above.
  const { rootRef, index, next, prev, goTo, cardBasis, trackTransform, dots } =
    useCarousel({ count: CARDS.length, autoplay });

  return (
    <section id="guides" className="section-bleed guides-section" style={{ background: BAND, color: HEAD, padding: "88px 40px 96px" }}>
      <style>{`
        .guides-track { transition: transform .6s cubic-bezier(.65,.02,.25,1); }
        .guides-card { transition: transform .5s cubic-bezier(.65,.02,.25,1), border-color .25s ease, box-shadow .25s ease; }
        .guides-card:hover { transform: translateY(-5px); border-color: ${ACCENT}; box-shadow: 0 18px 40px rgba(0,0,0,.35); }
        .guides-navbtn { transition: background .2s ease, border-color .2s ease, filter .2s ease; }
        .guides-navbtn:hover { background: ${withAlpha(P.white, 0.08)}; border-color: ${withAlpha(P.white, 0.32)}; }
        .guides-navbtn--next:hover { background: ${ACCENT}; border-color: ${ACCENT}; filter: brightness(1.1); }
        .guides-dot { transition: width .35s ease, background .25s ease; }
        @media (max-width: 640px) {
          .guides-section { padding-top: 60px !important; padding-bottom: 68px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .guides-track, .guides-card { transition: none; }
        }
      `}</style>

      <div ref={rootRef} style={{ maxWidth: 1200, margin: "0 auto", overflow: "hidden" }}>
        {/* Header + controls */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 44 }}>
          <div style={{ maxWidth: 640 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: ACCENT, display: "block", marginBottom: 10, fontFamily: F.body }}>Guides</span>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 3.5vw, 36px)", color: HEAD, marginBottom: 10, lineHeight: 1.15 }}>Go deeper when you're ready.</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: BODY, margin: 0, fontFamily: F.body }}>Four references worth bookmarking: in-depth answers by loan program, the data behind rates and home prices, a pre-approval checklist, and a plain-language glossary.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" aria-label="Previous guide" onClick={prev} className="guides-navbtn" style={{ width: 52, height: 52, borderRadius: 999, border: `1px solid ${NAV_BORDER}`, background: "transparent", color: HEAD, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>←</button>
            <button type="button" aria-label="Next guide" onClick={next} className="guides-navbtn guides-navbtn--next" style={{ width: 52, height: 52, borderRadius: 999, border: `1px solid ${ACCENT}`, background: ACCENT, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>→</button>
          </div>
        </div>

        {/* Viewport + track */}
        <div style={{ overflow: "hidden" }}>
          <div className="guides-track" style={{ display: "flex", gap: CAROUSEL_GAP, transform: trackTransform }}>
            {CARDS.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="guides-card"
                style={{ display: "flex", flexDirection: "column", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "30px 28px 26px", minHeight: 300, boxSizing: "border-box", flex: `0 0 ${cardBasis}`, textDecoration: "none", color: HEAD }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: TILE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, lineHeight: 1, flexShrink: 0 }}>
                    {c.glyph ? <img src={c.glyph} alt="" aria-hidden="true" width={32} height={32} style={{ display: "block", borderRadius: 6 }} /> : c.icon}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: NUM, letterSpacing: "0.04em", fontFamily: F.body }}>{c.num}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, margin: "26px 0 10px", fontFamily: F.body }}>{c.kicker}</div>
                <h3 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.015em", margin: "0 0 12px", color: HEAD, fontFamily: F.display }}>{c.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.5, color: BODY, margin: 0, flexGrow: 1, fontFamily: F.body }}>{c.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 26, paddingTop: 18, borderTop: `1px solid ${BORDER}` }}>
                  {showCounts && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: META, fontFamily: F.body }}>{c.meta}</span>}
                  <span style={{ fontSize: 15, fontWeight: 700, color: ACCENT, fontFamily: F.body, marginLeft: "auto" }}>{c.cta} →</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        {dots.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 40 }}>
            {dots.map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goTo(i)}
                className="guides-dot"
                style={{ height: 8, border: "none", padding: 0, cursor: "pointer", borderRadius: 999, width: i === index ? 34 : 8, background: i === index ? ACCENT : DOT_OFF }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
