import { T } from "../gl2Tokens";
import { goalIndexOf } from "./prospectsModel";

// The seven-stage progress indicator from the cockpit preview: one pill per
// pipeline stage, filled red through the contact's current stage, all green once
// they reach the goal (SOI). Stage 0 (New) leaves every pill empty. Shared by the
// mobile queue row and (Phase 2) the desktop board. Colors from gl2Tokens.
export function StageDots({ stage, stages, goalIndex = goalIndexOf(stages) }) {
  return (
    <span style={{ display: "flex", gap: 4 }} aria-hidden="true">
      {stages.map((_, i) => {
        const on = i <= stage && stage > 0;
        const bg = on ? (stage === goalIndex ? T.green : T.redLift) : T.bg0;
        return <span key={i} style={{ width: 16, height: 5, borderRadius: 3, background: bg }} />;
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
