import { P, F } from "../../theme";
import { JOURNEY_STEPS } from "../../data/journeySteps";

export function JourneyOverviewMobile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
      {JOURNEY_STEPS.map((s, i) => (
        <div key={s.n}>
          {s.n === 4 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px" }}>
              <div style={{ flex: 1, height: 1, background: P.creamDark }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: P.goldMuted, whiteSpace: "nowrap" }}>▼ CONTRACT SIGNED ▼</span>
              <div style={{ flex: 1, height: 1, background: P.creamDark }} />
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr",
              gap: 12,
              alignItems: "start",
              padding: "14px 16px",
              background: P.cream,
              border: `1px solid ${P.creamDark}`,
              borderRadius: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: s.phase === "Your Pace" ? P.navy : P.gold,
                color: P.cream,
                fontFamily: F.display,
                fontSize: 16,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {s.n}
            </div>
            <div>
              <Pill phase={s.phase} />
              <div
                style={{
                  fontFamily: F.display,
                  color: P.text,
                  fontSize: 16,
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontFamily: F.body,
                  color: P.textLight,
                  fontSize: 13,
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {s.caption}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Pill({ phase }) {
  const isPre = phase === "Your Pace";
  const color = isPre ? P.navy : P.gold;
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: F.body,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        padding: "3px 12px",
        borderRadius: 10,
        color,
        background: `${color}12`,
      }}
    >
      {phase}
    </span>
  );
}
