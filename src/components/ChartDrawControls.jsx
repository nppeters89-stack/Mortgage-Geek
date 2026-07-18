import { CHART_COLORS, F, P } from "../theme";
import { withAlpha } from "../utils/format";

// Presentation controls for the click-to-draw Geek Charts: a primary
// advance button, a replay, and a 3s/4s/5s speed segment. The author drives
// these while narrating over a screen recording, so the labels say what the
// next click will do rather than naming a generic state.
//
// Rendered only when the draw animation is active (desktop, motion allowed).
// On phones and under prefers-reduced-motion the charts render fully drawn and
// this bar is not mounted at all.

const CREAM = CHART_COLORS.line;
const MUT = withAlpha(CHART_COLORS.line, 0.55);
const BORDER = withAlpha(CHART_COLORS.line, 0.14);
const INSET = withAlpha(CHART_COLORS.line, 0.04);
const BLUE = CHART_COLORS.sp500;

const SPEEDS = [3000, 4000, 5000];

export const drawControlsCss = `
  .cdc { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-bottom: 14px; }
  .cdc-btn { position: relative; overflow: hidden; font-family: ${F.body}; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 999px; cursor: pointer; color: ${CREAM}; background: ${withAlpha(CHART_COLORS.sp500, 0.16)}; border: 1px solid ${withAlpha(CHART_COLORS.sp500, 0.6)}; transition: background .15s, opacity .15s; }
  .cdc-btn:hover:not(:disabled) { background: ${withAlpha(CHART_COLORS.sp500, 0.28)}; }
  .cdc-btn:disabled { cursor: default; opacity: 0.45; }

  /* A slow highlight sweeps the advance button so the eye lands on the thing
     to click. Same idiom as the reinvest button on the projection chart.
     It runs only while the button is actually waiting on a click: once a draw
     is in flight or the sequence is finished, a moving highlight would be
     pointing at nothing. */
  .cdc-btn-label { position: relative; z-index: 2; }
  .cdc-shimmer { position: absolute; z-index: 1; top: 0; bottom: 0; left: -45%; width: 45%; transform: skewX(-20deg); background: linear-gradient(90deg, transparent 0%, ${withAlpha(CHART_COLORS.sp500, 0.5)} 50%, transparent 100%); animation: cdcShimmer 2.6s linear infinite; pointer-events: none; }
  .cdc-btn:disabled .cdc-shimmer, .cdc-btn.is-drawing .cdc-shimmer { display: none; animation: none; }
  @keyframes cdcShimmer { 0% { left: -45%; } 100% { left: 130%; } }
  @media (prefers-reduced-motion: reduce) { .cdc-shimmer { display: none; animation: none; } }
  .cdc-ghost { font-family: ${F.body}; font-size: 13px; font-weight: 500; padding: 9px 14px; border-radius: 999px; cursor: pointer; color: ${MUT}; background: transparent; border: 1px solid ${BORDER}; transition: color .15s, border-color .15s; }
  .cdc-ghost:hover:not(:disabled) { color: ${CREAM}; border-color: ${withAlpha(CHART_COLORS.line, 0.3)}; }
  .cdc-ghost:disabled { cursor: default; opacity: 0.4; }
  .cdc-speed { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; }
  .cdc-speed-l { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${MUT}; }
  .cdc-seg { display: inline-flex; background: ${INSET}; border: 1px solid ${BORDER}; border-radius: 999px; padding: 2px; }
  .cdc-seg button { font-family: ${F.body}; font-size: 12px; font-weight: 700; padding: 5px 11px; border-radius: 999px; cursor: pointer; background: transparent; border: 0; color: ${MUT}; transition: color .15s, background .15s; }
  .cdc-seg button:hover:not(:disabled) { color: ${CREAM}; }
  .cdc-seg button.is-active { background: ${withAlpha(CHART_COLORS.sp500, 0.2)}; color: ${CREAM}; }
  .cdc-seg button:disabled { cursor: default; opacity: 0.4; }
  .cdc-hint { font-size: 11px; color: ${withAlpha(CHART_COLORS.line, 0.45)}; flex-basis: 100%; margin: 0; }
`;

export function ChartDrawControls({
  advanceLabel,
  onAdvance,
  onReplay,
  canAdvance,
  canReplay,
  duration,
  onDuration,
  drawing,
  hint,
  onKeyDown,
}) {
  // Shortcuts live here rather than on the plot: the plot is aria-hidden (the
  // sr-only data table is the accessible version of the chart), and a
  // focusable node inside an aria-hidden subtree is a WCAG failure. Space and
  // Enter come free from the focused button; this only adds R to replay.
  return (
    <div className="cdc" onKeyDown={onKeyDown}>
      <button
        type="button"
        className={`cdc-btn${drawing ? " is-drawing" : ""}`}
        onClick={onAdvance}
        disabled={!canAdvance}
      >
        <span className="cdc-btn-label">{advanceLabel}</span>
        <span className="cdc-shimmer" aria-hidden="true" />
      </button>
      <button type="button" className="cdc-ghost" onClick={onReplay} disabled={!canReplay}>
        Replay
      </button>

      <div className="cdc-speed">
        <span className="cdc-speed-l">Speed</span>
        <div className="cdc-seg" role="group" aria-label="Draw speed">
          {SPEEDS.map((ms) => (
            <button
              key={ms}
              type="button"
              className={duration === ms ? "is-active" : ""}
              aria-pressed={duration === ms}
              disabled={drawing}
              onClick={() => onDuration(ms)}
            >
              {ms / 1000}s
            </button>
          ))}
        </div>
      </div>

      {hint && <p className="cdc-hint">{hint}</p>}
    </div>
  );
}

// Tracer dot that rides the leading edge of the line being drawn.
//
// Module-level and prop-free on purpose. Recharts tears down and rebuilds the
// whole SVG on every chart render, so a React ref to this circle goes stale
// the moment any state changes. The charts instead find it by class off their
// plot container and set cx/cy/fill/opacity imperatively, which survives the
// rebuild. Driving it through React state would also mean a re-render per
// frame at 60fps, stuttering the very draw it decorates.
export const TRACER_CLASS = "chart-tracer";

export function Tracer() {
  return (
    <circle
      className={TRACER_CLASS}
      r={6.5}
      fill={BLUE}
      stroke={P.navyDark}
      strokeWidth={2}
      opacity={0}
      style={{ pointerEvents: "none" }}
    />
  );
}
