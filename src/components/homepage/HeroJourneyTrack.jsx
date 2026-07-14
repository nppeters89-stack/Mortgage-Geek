import { P, F } from "../../theme";
import { JOURNEY_STEPS } from "../../data/journeySteps";
import { withAlpha } from "../../utils/format";

const CIRCLE_SIZE = 36;

export function HeroJourneyTrack() {
  return (
    <div
      className="hero-journey-track"
      style={{
        padding: "24px 32px 22px",
        background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 60%, ${P.navyLight} 100%)`,
        border: `1px solid ${withAlpha(P.cream, 0.1)}`,
        borderRadius: 16,
      }}
    >
      <HeaderRow />
      <Track />
      <div style={{ height: 1, borderTop: `1px dashed ${withAlpha(P.cream, 0.14)}`, margin: "20px 0 16px" }} />
      <FooterRow />
    </div>
  );
}

function HeaderRow() {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: P.gold }}>
          The Journey
        </span>
        <span style={{ fontFamily: F.display, fontSize: 22, color: P.cream, fontWeight: 400, lineHeight: 1.2 }}>
          6 steps to your keys
        </span>
      </div>
      <span style={{ fontFamily: F.body, fontSize: 11, color: withAlpha(P.cream, 0.55), whiteSpace: "nowrap" }}>
        est. ~45 days total
      </span>
    </div>
  );
}

function Track() {
  return (
    <div style={{ position: "relative", padding: "0 4px" }}>
      {/* Connecting line — sits behind the circles, inset to span circle centers */}
      <div
        style={{
          position: "absolute",
          top: CIRCLE_SIZE / 2,
          left: `calc(100% / 12)`,
          right: `calc(100% / 12)`,
          height: 1,
          background: withAlpha(P.cream, 0.18),
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {JOURNEY_STEPS.map((s) => (
          <Step key={s.n} step={s} />
        ))}
      </div>
    </div>
  );
}

function Step({ step }) {
  const isThirty = step.phase === "~30 Days";
  const circleBg = isThirty ? P.gold : P.navyLight;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: 999,
          background: circleBg,
          border: `2px solid ${withAlpha(P.cream, 0.18)}`,
          color: P.cream,
          fontFamily: F.body,
          fontSize: 14,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        {step.n}
      </div>
      <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: P.cream, marginTop: 12, lineHeight: 1.25 }}>
        {step.title}
      </div>
      <div style={{ fontFamily: F.body, fontSize: 11, color: withAlpha(P.cream, 0.55), marginTop: 4, lineHeight: 1.4 }}>
        {step.timeframe}
      </div>
    </div>
  );
}

function FooterRow() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
      <PhaseLabel pill="Your Pace" pillColor={withAlpha(P.cream, 0.7)} pillBg={withAlpha(P.cream, 0.1)} pillBorder={withAlpha(P.cream, 0.18)} desc="Open-ended. No clock yet." align="left" />
      <PhaseLabel pill="~30 Days · After Contract" pillColor={P.cream} pillBg={P.gold} pillBorder={P.gold} desc="Lender + escrow drive the timeline." align="right" />
    </div>
  );
}

function PhaseLabel({ pill, pillColor, pillBg, pillBorder, desc, align }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: align === "right" ? "flex-end" : "flex-start", textAlign: align }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: F.body,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          padding: "4px 12px",
          borderRadius: 999,
          color: pillColor,
          background: pillBg,
          border: `1px solid ${pillBorder}`,
        }}
      >
        {pill}
      </span>
      <span style={{ fontFamily: F.body, fontSize: 12, color: withAlpha(P.cream, 0.6) }}>
        {desc}
      </span>
    </div>
  );
}
