import { P, F } from "../../theme";
import { JOURNEY_STEPS } from "../../data/journeySteps";
import { withAlpha } from "../../utils/format";
import { JOURNEY_MOTION_CSS, useIdleMotion, ringDelay } from "./journeyMotion";

export function JourneyOverviewMobile() {
  const yourPace = JOURNEY_STEPS.filter((s) => s.phase === "Your Pace");
  const thirtyDays = JOURNEY_STEPS.filter((s) => s.phase === "~30 Days");
  const rootRef = useIdleMotion();

  return (
    <div
      ref={rootRef}
      style={{
        marginTop: 24,
        background: P.white,
        border: `1px solid ${P.creamDark}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        position: "relative",
      }}
    >
      <style>{JOURNEY_MOTION_CSS}</style>

      {/* Shimmer sweeping down the card. Decorative and non-interactive. */}
      <div
        aria-hidden="true"
        className="mg-journey-shimmer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(180deg, transparent, ${withAlpha(P.gold, 0.06)}, transparent)`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      <PhaseGroup label="Your Pace" pillBg={P.creamDark} pillColor={P.text} steps={yourPace} circleColor={P.navy} />

      <ContractBand />

      <PhaseGroup label="~30 Days" pillBg={P.gold} pillColor={P.white} steps={thirtyDays} circleColor={P.gold} ring beat />
    </div>
  );
}

function PhaseGroup({ label, pillBg, pillColor, steps, circleColor, ring = false, beat = false }) {
  return (
    <div style={{ padding: "20px 20px 22px" }}>
      <span
        className={beat ? "mg-journey-beat" : undefined}
        style={{
          display: "inline-block",
          fontFamily: F.body,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          padding: "4px 12px",
          borderRadius: 999,
          color: pillColor,
          background: pillBg,
          marginBottom: 14,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((s, i) => (
          <StepRow key={s.n} step={s} circleColor={circleColor} ring={ring} ringIndex={i} />
        ))}
      </div>
    </div>
  );
}

function StepRow({ step, circleColor, ring = false, ringIndex = 0 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 14, alignItems: "center" }}>
      <div
        className={ring ? "mg-journey-ring" : undefined}
        style={{
          animationDelay: ring ? ringDelay(ringIndex) : undefined,
          width: 32,
          height: 32,
          borderRadius: 999,
          background: circleColor,
          color: P.white,
          fontFamily: F.body,
          fontSize: 14,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {step.n}
      </div>
      <div style={{ fontFamily: F.body, color: P.text, fontSize: 15, fontWeight: 600 }}>{step.title}</div>
      <div style={{ fontFamily: F.body, color: P.warmGray, fontSize: 12, fontWeight: 500, textAlign: "right" }}>{step.timeframe}</div>
    </div>
  );
}

function ContractBand() {
  return (
    <div
      style={{
        background: P.creamDark,
        padding: "14px 20px",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 14,
        alignItems: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: F.body,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          padding: "5px 12px",
          borderRadius: 999,
          color: P.white,
          background: P.gold,
          whiteSpace: "nowrap",
        }}
      >
        Contract Signed
      </span>
      <span style={{ fontFamily: F.body, fontSize: 12, color: P.warmGray, lineHeight: 1.4 }}>
        The 30-day clock starts
      </span>
    </div>
  );
}
