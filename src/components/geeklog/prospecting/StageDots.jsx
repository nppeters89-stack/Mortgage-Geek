import { T, stageRampColor, whaleRampColor } from "../gl2Tokens";
import { goalIndexOf } from "./prospectsModel";

// The seven-stage progress indicator: one pill per pipeline stage, lit through
// the contact's current stage. Each lit pill carries its own step of the stage
// ramp, so the row kindles from dark red through neon orange into neon yellow on
// the goal notch. Stage 0 (New) leaves every pill empty. Shared by the mobile
// queue row and the desktop board. Colors from gl2Tokens.
export function StageDots({ stage, stages, goalIndex = goalIndexOf(stages), whale = false }) {
  const ramp = whale ? whaleRampColor : stageRampColor;
  // Whale pills light through the CURRENT column inclusive of index 0 (Value
  // Add 1 is a real first column, unlike the main pipeline's empty New).
  const litThrough = whale ? stage : (stage > 0 ? stage : -1);
  return (
    <span style={{ display: "flex", gap: 4 }} aria-hidden="true">
      {stages.map((_, i) => {
        const on = i <= litThrough;
        return <span key={i} style={{ width: 16, height: 5, borderRadius: 3, background: on ? ramp(i, stages.length) : T.bg0 }} />;
      })}
    </span>
  );
}

// The cold check-in pips: five dots, filled steel blue through the check-in count.
export function ColdPips({ count, cap = 5 }) {
  return (
    <span style={{ display: "flex", gap: 4, alignItems: "center" }} aria-hidden="true">
      {Array.from({ length: cap }, (_, i) => (
        <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < count ? T.cold : T.bg0, border: `1px solid ${i < count ? T.cold : T.line}` }} />
      ))}
    </span>
  );
}
