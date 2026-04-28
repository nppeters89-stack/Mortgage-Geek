import { P, F } from "../../theme";
import { JOURNEY_STEPS } from "../../data/journeySteps";

function withAlpha(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function HeroJourneyTrack() {
  return (
    <div
      className="hero-journey-track"
      style={{
        marginTop: 48,
        padding: "20px 24px",
        background: withAlpha(P.cream, 0.06),
        border: `1px solid ${withAlpha(P.cream, 0.12)}`,
        borderRadius: 12,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 12,
          alignItems: "start",
        }}
      >
        {JOURNEY_STEPS.map((s) => (
          <div key={s.n} style={{ textAlign: "left" }}>
            <Pill phase={s.phase} />
            <div
              style={{
                fontFamily: F.display,
                color: P.cream,
                fontSize: 15,
                fontWeight: 600,
                marginTop: 8,
                lineHeight: 1.25,
              }}
            >
              {s.n}. {s.title}
            </div>
            <div
              style={{
                fontFamily: F.body,
                color: withAlpha(P.cream, 0.65),
                fontSize: 11,
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {s.timeframe}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ phase }) {
  const isThirty = phase === "~30 Days";
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: F.body,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 999,
        color: isThirty ? P.goldLight : P.cream,
        background: isThirty ? withAlpha(P.gold, 0.18) : withAlpha(P.cream, 0.12),
        border: isThirty ? `1px solid ${withAlpha(P.gold, 0.4)}` : `1px solid ${withAlpha(P.cream, 0.22)}`,
      }}
    >
      {phase}
    </span>
  );
}
