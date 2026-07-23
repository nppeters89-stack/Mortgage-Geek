import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot, Customized } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { HOMES_IN_SP500, SP_RATIO_AVG } from "../data/geekCharts";
import { drawPath, hidePath, clearDrawState } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, Tracer, TRACER_CLASS, drawControlsCss } from "./ChartDrawControls";

// Homes Priced in the S&P 500, part 1: how many units of the index it takes to
// buy the average home (home price / index level), on a dark charcoal canvas.
// One descending line (equity-market blue). The ratio has fallen for four
// decades because stocks outran houses. Colors from CHART_COLORS / P via
// withAlpha; no hardcoded hex. Reference dots mark the 1982 peak, the 2000
// dot-com low, and today; per the text-overlay rule their labels sit in open
// space (1982 above its dot in the top headroom, today below its dot where the
// line dives into the bottom-right corner), never on the line, and with no
// background boxes. sr-only table mirrors the series for crawlers.
//
// The chart renders drawn by default; Replay re-runs the animation as a
// narration aid for screen recordings: the blue line draws, then the three
// markers cascade in and the today marker settles into a slow pulse. Only
// prefers-reduced-motion hides the controls.

// Index level formatted with two decimals and thousands separators (7,570.03).
const spFmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Marker cascade offsets from the moment the line finishes, then the settle
// into the pulse. From the design handoff.
const MARKER_DELAYS = [150, 850, 1550];
const SETTLE_DELAY = 2300;

export function HomesInSp500Chart() {
  const { years, ratio, home, sp } = HOMES_IN_SP500;
  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();

  // The chart starts drawn (phase "done", all three markers revealed); Replay
  // re-runs the animation. Phases while running: drawing → points → done.
  const [phase, setPhase] = useState("done");
  const [reveal, setReveal] = useState(3);
  const [duration, setDuration] = useState(4000);

  const plotRef = useRef(null);
  const timers = useRef([]);
  const cancelDraw = useRef(null);

  // On phones and under reduced motion the chart is simply finished.
  const shown = staticCharts ? "done" : phase;
  const shownReveal = staticCharts ? 3 : reveal;

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], home: home[i], sp: sp[i] })),
    [years, ratio, home, sp]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const yAt = (yr) => ratio[years.indexOf(yr)];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelDraw.current?.();
    cancelDraw.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const linePath = () => plotRef.current?.querySelector(".recharts-line-curve");

  // Recharts rebuilds the SVG on every render and on resize, which wipes the
  // inline dash styles. Re-hide the line whenever it should not be visible yet.
  useEffect(() => {
    const path = linePath();
    if (!path) return;
    if (shown === "idle") hidePath(path);
    else if (shown === "done" || shown === "points") clearDrawState(path);
  });

  // The draw has to start AFTER the render that sets the phase, not inside the
  // click handler. Recharts rebuilds its SVG on every render, so a path styled
  // during the handler is a detached node by the time the browser paints and
  // the line just appears fully drawn. Running here means we style the path
  // that actually survived the rebuild.
  useEffect(() => {
    if (phase !== "drawing") return;
    const path = linePath();
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (!path) {
      setPhase("points");
      return;
    }
    if (tracer) tracer.setAttribute("opacity", "1");

    cancelDraw.current = drawPath(path, {
      duration,
      onTick: (_t, pt) => {
        if (!tracer) return;
        tracer.setAttribute("cx", pt.x);
        tracer.setAttribute("cy", pt.y);
      },
      onDone: () => {
        if (tracer) tracer.setAttribute("opacity", "0");
        setPhase("points");
        MARKER_DELAYS.forEach((ms, i) => {
          timers.current.push(setTimeout(() => setReveal(i + 1), ms));
        });
        timers.current.push(setTimeout(() => setPhase("done"), SETTLE_DELAY));
      },
    });
    // Duration is read once at the start of a draw; changing speed mid-draw is
    // blocked in the controls, so it is intentionally not a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Re-run the animation from the drawn state: reset the markers, then draw. The
  // drawing effect above re-hides the line and redraws it, and the cascade runs
  // again on completion. Ignored while a run is in progress.
  const replay = useCallback(() => {
    if (staticCharts || phase === "drawing") return;
    clearTimers();
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (tracer) tracer.setAttribute("opacity", "0");
    setReveal(0);
    setPhase("drawing");
  }, [staticCharts, phase, clearTimers]);

  // Space and Enter already activate the focused Replay button natively, so the
  // only shortcut worth adding is R to replay. Scoped to the control bar so it
  // never hijacks typing elsewhere on the page.
  const onKeyDown = (e) => {
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      replay();
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 210 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}{d.year === 2026 ? " (as of Jul 13)" : ""}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: CHART_COLORS.sp500, flexShrink: 0 }} />
          home in S&amp;P units: {Math.round(d.ratio)}
        </p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: 0 }}>
          {fmt(d.home)} home / S&amp;P {spFmt(d.sp)}
        </p>
      </div>
    );
  };

  // Pulse ring on the today marker, drawn through Recharts' own scales so it
  // tracks the point on resize. Only mounted once the cascade has settled.
  const TodayPulse = (props) => {
    const { xAxisMap, yAxisMap } = props;
    if (shown !== "done" || shownReveal < 3) return null;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    return (
      <circle
        className="hsp-pulse"
        cx={xScale(2026)}
        cy={yScale(yAt(2026))}
        fill="none"
        stroke={CHART_COLORS.sp500}
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  const replayLabel = phase === "drawing" ? "Drawing…" : "Replay";

  return (
    <div className="hsp-chart">
      <style>{`
        ${drawControlsCss}
        .hsp-chart { width: 100%; }
        .hsp-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .hsp-plot { height: 340px; } }
        .hsp-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

        .hsp-mk { opacity: 0; transition: opacity .45s ease; }
        .hsp-plot[data-reveal="1"] .hsp-mk-peak,
        .hsp-plot[data-reveal="2"] .hsp-mk-peak,
        .hsp-plot[data-reveal="3"] .hsp-mk-peak,
        .hsp-plot[data-reveal="2"] .hsp-mk-low,
        .hsp-plot[data-reveal="3"] .hsp-mk-low,
        .hsp-plot[data-reveal="3"] .hsp-mk-today { opacity: 1; }

        .hsp-pulse { animation: hspPulse 1.8s ease-out infinite; }
        @keyframes hspPulse {
          0%   { r: 6px;  opacity: .9; }
          100% { r: 26px; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hsp-mk { transition: none; }
          .hsp-pulse { display: none; }
        }
      `}</style>

      {!staticCharts && (
        <ChartDrawControls
          label={replayLabel}
          onClick={replay}
          disabled={phase === "drawing"}
          duration={duration}
          onDuration={setDuration}
          speedDisabled={phase === "drawing"}
          onKeyDown={onKeyDown}
          hint={hasHover ? "Press Replay to redraw the line. R also replays." : "Tap Replay to redraw the line."}
        />
      )}

      <div
        className="hsp-plot"
        data-reveal={shownReveal}
        aria-hidden="true"
        ref={plotRef}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 24, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1970, 2026]}
              ticks={[1970, 1980, 1990, 2000, 2010, 2020, 2026]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[0, 800]}
              ticks={[0, 100, 200, 300, 400, 500, 600, 700, 800]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            {/* Hover read-out only once the sequence has settled. */}
            {shown === "done" && <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
            <ReferenceLine
              y={SP_RATIO_AVG}
              stroke={CHART_COLORS.axis}
              strokeDasharray="6 5"
              label={{ value: `avg ${SP_RATIO_AVG}`, position: "insideTopRight", fill: withAlpha(CHART_COLORS.line, 0.5), fontSize: 11, fontFamily: F.body }}
            />
            <Line type="monotone" dataKey="ratio" stroke={CHART_COLORS.sp500} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            {/* 1982 peak: accent dot, label ABOVE in the top headroom (line is at ~700, ceiling 800). */}
            <ReferenceDot className="hsp-mk hsp-mk-peak" x={1982} y={yAt(1982)} r={5} fill={CHART_COLORS.accent} stroke={P.navyDark} strokeWidth={2} isFront
              label={{ value: "700 · 1982", position: "top", fill: CHART_COLORS.accent, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
            {/* 2000 dot-com low: unlabeled cream dot. */}
            <ReferenceDot className="hsp-mk hsp-mk-low" x={2000} y={yAt(2000)} r={4.5} fill={CHART_COLORS.line} stroke={P.navyDark} strokeWidth={2} isFront />
            {/* Today: sp500-color dot, label BELOW because the line descends into this corner. */}
            <ReferenceDot className="hsp-mk hsp-mk-today" x={2026} y={yAt(2026)} r={5} fill={CHART_COLORS.sp500} stroke={P.navyDark} strokeWidth={2} isFront
              label={{ value: "68 today", position: "bottom", fill: CHART_COLORS.sp500, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
            <Customized component={TodayPulse} />
            {!staticCharts && <Customized component={Tracer} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="hsp-sr-only">
        <table>
          <caption>Units of the S&amp;P 500 index needed to buy the average American home, by year, with the underlying average home price and S&amp;P 500 index level.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Home in S&amp;P 500 units</th>
              <th scope="col">Average home price</th>
              <th scope="col">S&amp;P 500 level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{Math.round(d.ratio)}</td>
                <td>{fmt(d.home)}</td>
                <td>{spFmt(d.sp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
