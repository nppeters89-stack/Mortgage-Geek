import { P, F } from "../../theme";
import { withAlpha } from "../../utils/format";
import { MortgageCalcIcon, CompareIcon, PreQualIcon, CashToCloseIcon, RentVsOwnIcon } from "../icons";
import { useCarousel, CAROUSEL_GAP } from "./useCarousel";

// "Your Toolkit" rail for the Learning Hub. Same card format and mechanics as
// the Guides carousel below it (auto-advance, arrows, progress dots), but on the
// section's existing light band, so the two rails read as a pair without the
// toolkit changing its place in the page's light/dark rhythm.
//
// The palette is the light-surface counterpart of Guides: card and tile step
// UP from the band where the dark version steps up from black, and text is ink
// rather than cream. Arrow Red carries the kicker and CTA in both.

const ACCENT = P.gold; // Arrow Red
const BAND = P.creamDark; // unchanged section background
const CARD = P.white; // card surface, one step up from the band
const HEAD = P.text; // headings / primary text
const BODY = P.warmGray; // secondary body text
const META = P.warmGrayLight; // muted meta label
const NUM = withAlpha(P.warmGrayLight, 0.75); // dim card number
const BORDER = withAlpha(P.navy, 0.1);
const TILE = withAlpha(P.navy, 0.06);
const DOT_OFF = withAlpha(P.navy, 0.18);
const NAV_BORDER = withAlpha(P.navy, 0.22);

// Kickers reuse each tool's lockup descriptor, so the card and the tool's own
// header say the same thing.
const CARDS = [
  { Icon: MortgageCalcIcon, iconSize: 30, num: "01", kicker: "Payment estimate", title: "Mortgage Calculator", desc: "Same house, four programs. Compare Conventional, FHA, VA, and USDA payment breakdowns with live rates.", meta: "4 programs", cta: "Open", href: "/calculator" },
  { Icon: PreQualIcon, iconSize: 34, num: "02", kicker: "Approval odds", title: "Pre-Qual Simulator", desc: "Enter your income and debts, then see what you can afford under each loan program with real DTI limits.", meta: "Real DTI limits", cta: "Open", href: "/prequal" },
  { Icon: CompareIcon, iconSize: 34, num: "03", kicker: "Side by side", title: "Loan Comparison", desc: "Save up to 3 scenarios from the calculator and stack them side by side to find your best option.", meta: "3 scenarios", cta: "Open", href: "/compare" },
  { Icon: CashToCloseIcon, iconSize: 34, num: "04", kicker: "Upfront costs", title: "Cash to Close", desc: "Estimate how much money you'll need at the closing table: down payment, closing costs, prepaids, and reserves.", meta: "By state", cta: "Open", href: "/cash-to-close" },
  { Icon: RentVsOwnIcon, iconSize: 34, num: "05", kicker: "Cost comparison", title: "Rent vs Own", desc: "Charges both sides for everything and scores owning as if you sold, to show which one leaves you with more.", meta: "30-year view", cta: "Open", href: "/rent-vs-own" },
];

export function ToolsCTA({ showCounts = true, autoplay = true }) {
  // Mechanics live in useCarousel, shared with the Guides rail below.
  const { rootRef, index, next, prev, goTo, cardBasis, trackTransform, dots } =
    useCarousel({ count: CARDS.length, autoplay });

  return (
    <section id="tools-cta" className="section-bleed tools-section" style={{ background: BAND, color: HEAD, padding: "72px 40px 80px" }}>
      <style>{`
        .tools-track { transition: transform .6s cubic-bezier(.65,.02,.25,1); }
        .tools-card { transition: transform .5s cubic-bezier(.65,.02,.25,1), border-color .25s ease, box-shadow .25s ease; }
        .tools-card:hover { transform: translateY(-5px); border-color: ${ACCENT}; box-shadow: 0 18px 40px rgba(22,23,26,.14); }
        .tools-navbtn { transition: background .2s ease, border-color .2s ease, filter .2s ease; }
        .tools-navbtn:hover { background: ${withAlpha(P.navy, 0.06)}; border-color: ${withAlpha(P.navy, 0.38)}; }
        .tools-navbtn--next:hover { background: ${ACCENT}; border-color: ${ACCENT}; filter: brightness(1.1); }
        .tools-dot { transition: width .35s ease, background .25s ease; }
        @media (max-width: 640px) {
          .tools-section { padding-top: 52px !important; padding-bottom: 60px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tools-track, .tools-card { transition: none; }
        }
      `}</style>

      <div ref={rootRef} style={{ maxWidth: 1200, margin: "0 auto", overflow: "hidden" }}>
        {/* Header + controls */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 44 }}>
          <div style={{ maxWidth: 640 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: ACCENT, display: "block", marginBottom: 10, fontFamily: F.body }}>Your Toolkit</span>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 3.5vw, 36px)", color: HEAD, marginBottom: 10, lineHeight: 1.15 }}>Run the numbers.</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: BODY, margin: 0, fontFamily: F.body }}>Five tools built by a loan originator, not a marketing team. No login, no data collected, no strings attached.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" aria-label="Previous tool" onClick={prev} className="tools-navbtn" style={{ width: 52, height: 52, borderRadius: 999, border: `1px solid ${NAV_BORDER}`, background: "transparent", color: HEAD, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>←</button>
            <button type="button" aria-label="Next tool" onClick={next} className="tools-navbtn tools-navbtn--next" style={{ width: 52, height: 52, borderRadius: 999, border: `1px solid ${ACCENT}`, background: ACCENT, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>→</button>
          </div>
        </div>

        {/* Viewport + track */}
        <div style={{ overflow: "hidden" }}>
          <div className="tools-track" style={{ display: "flex", gap: CAROUSEL_GAP, transform: trackTransform }}>
            {CARDS.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="tools-card"
                style={{ display: "flex", flexDirection: "column", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "30px 28px 26px", minHeight: 300, boxSizing: "border-box", flex: `0 0 ${cardBasis}`, textDecoration: "none", color: HEAD }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: TILE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <c.Icon size={c.iconSize} variant="navy" />
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
                className="tools-dot"
                style={{ height: 8, border: "none", padding: 0, cursor: "pointer", borderRadius: 999, width: i === index ? 34 : 8, background: i === index ? ACCENT : DOT_OFF }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
