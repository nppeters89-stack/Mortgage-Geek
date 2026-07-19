import { P, HOME } from "../theme";

// Shared tool lockup: the tool's rail icon in a Ravenswood squircle, then an
// Archivo Extra-Bold title with the final word in Arrow Red, over a grey tracked
// descriptor. Same system as the Rent vs Own package, extended to the rest of
// the tools.
//
// Scale is matched to the Geek Charts hub lockup so every tool header reads at
// the same weight. That lockup renders at height 104 in a 720x320 viewBox (a
// 0.325 factor), which measures out to a 41.6px tile at 9.1px radius, a 23.4px
// Archivo wordmark, a 7.2px DM Sans descriptor tracked at 0.227em, and 13px
// between tile and text. Those are measured off the live lockup, not estimated.
//
// The tile stays Ravenswood and the icon stays cream on both surfaces, per the
// handoff: only the title and descriptor colors flip. Arrow Red holds true on
// dark rather than switching to the lifted red, which the guidelines call out.
//
// The title renders as a div, not a heading: these pages carry a separate
// editorial h1 below the lockup, and two competing headings would muddy the
// document outline.

const TILE = 42;
const ICON = 26;

// `iconScale` trims the glyph inside the tile without changing the tile. The
// calculator mark is a solid filled body that spans its whole viewBox, where the
// others are outline strokes carrying their own padding, so it reads far heavier
// at the same nominal size and takes a 0.5.
export function ToolLockup({ Icon, title, accent, descriptor, variant = "dark", iconScale = 1, style }) {
  const titleColor = variant === "light" ? P.text : P.white;
  const descriptorColor = variant === "light" ? HOME.textMuted : P.warmGrayLight;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 13, ...style }}>
      <span
        aria-hidden="true"
        style={{
          width: TILE, height: TILE, borderRadius: 9, background: P.navy,
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <Icon size={ICON * iconScale} variant="cream" />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: 23, letterSpacing: "-0.02em", lineHeight: 1, color: titleColor }}>
          {title} <span style={{ color: P.gold }}>{accent}</span>
        </div>
        {descriptor && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 7.2, letterSpacing: "0.227em", textTransform: "uppercase", color: descriptorColor, margin: "4px 0 0" }}>
            {descriptor}
          </p>
        )}
      </div>
    </div>
  );
}
