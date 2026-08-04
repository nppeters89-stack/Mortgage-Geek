import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot, Customized } from "recharts";
import { P, F, CHART_COLORS, BURDEN_HEAT } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { PAYMENT_BURDEN, BURDEN_AVG } from "../data/geekCharts";
import { drawPath, hidePath, clearDrawState } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, Tracer, TRACER_CLASS, drawControlsCss } from "./ChartDrawControls";

// The Mortgage Payment Burden: P&I on the median new home (20% down, that year's
// average 30-yr rate) as a percent of median family income, 1971 to 2026, on a
// dark charcoal canvas. One threshold-colored line against the 56-year average:
// the stroke is red wherever the burden is worse than the 23.7% average and cool
// blue wherever it is better, so the nine crossings read as a rhythm of hot and
// cold decades. The color comes from the line's own y position via a vertical
// userSpaceOnUse gradient with a hard stop at the average (see BurdenDefs); no
// fills, no time ramp. Heat stops live in BURDEN_HEAT. Colors from BURDEN_HEAT /
// CHART_COLORS / P; no hardcoded hex. sr-only table mirrors the series.
//
// The chart renders drawn by default. Replaying is a two-step click, a
// narration aid for screen recordings: the first click (Replay) blanks the line
// and hides the markers, the second (Draw) draws the cream line, then four
// markers cascade in (1981 peak, 2020 low, 2023 squeeze, today) and the today
// marker settles into a slow pulse. Only prefers-reduced-motion hides the
// controls.

// Marker cascade offsets from the moment the line finishes, then the settle into
// the pulse. From the design handoff: peak +150, low +800, squeeze +1450, today
// +2100, done +2800.
const MARKER_DELAYS = [150, 800, 1450, 2100];
const SETTLE_DELAY = 2800;

const CREAM = CHART_COLORS.line;

export function PaymentBurdenChart() {
  const { years, ratio, pmt, price, rate } = PAYMENT_BURDEN;
  // Static (drawn, no controls) only under reduced motion. On phones the
  // controls show and the line draws on tap, matching the other Geek Charts.
  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();

  // The chart starts drawn (phase "done", all four markers revealed); replaying
  // is a two-step click: done → armed (line blanked) → drawing → points → done.
  const [phase, setPhase] = useState("done");
  const [reveal, setReveal] = useState(4);
  const [duration, setDuration] = useState(4000);

  const plotRef = useRef(null);
  const timers = useRef([]);
  const cancelDraw = useRef(null);

  // On phones and under reduced motion the chart is simply finished.
  const shown = staticCharts ? "done" : phase;
  const shownReveal = staticCharts ? 4 : reveal;

  // Markers are mounted only once the draw has finished (points/done). While the
  // chart is armed or drawing they are absent from the DOM, not merely faded:
  // Recharts' unlabeled ReferenceDots ignore the base opacity:0 rule, so gating
  // render is the only reliable way to blank them. Once mounted they still fade
  // in on their data-reveal cascade step.
  const showDots = shown === "done" || shown === "points";

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], pmt: pmt[i], price: price[i], rate: rate[i] })),
    [years, ratio, pmt, price, rate]
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
    if (shown === "armed" || shown === "idle") hidePath(path);
    else if (shown === "done" || shown === "points") clearDrawState(path);
  });

  // The draw has to start AFTER the render that sets the phase, not inside the
  // click handler: Recharts rebuilds its SVG on every render, so a path styled
  // during the handler is a detached node by the time the browser paints.
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

  // The control is a two-step toggle. From the drawn state, the first click
  // arms it: reset the markers and blank the line. The second click starts the
  // draw, and the cascade runs again on completion. A click mid-draw is ignored.
  const advance = useCallback(() => {
    if (staticCharts || phase === "drawing") return;
    if (phase === "armed") {
      setPhase("drawing");
      return;
    }
    // phase "done": arm it.
    clearTimers();
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (tracer) tracer.setAttribute("opacity", "0");
    setReveal(0);
    setPhase("armed");
  }, [staticCharts, phase, clearTimers]);

  // Space and Enter already activate the focused button natively; the only
  // shortcut worth adding is R to advance a step, scoped to the control bar.
  const onKeyDown = (e) => {
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      advance();
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 220 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>payment burden: {d.ratio.toFixed(1)}%</p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), lineHeight: 1.5, margin: 0 }}>
          {fmt(d.pmt)}/mo P&amp;I on a {fmt(d.price)} home at {d.rate.toFixed(2)}%
        </p>
      </div>
    );
  };

  // Pulse ring on the today marker, drawn through Recharts' own scales so it
  // tracks the point on resize. Only mounted once the cascade has settled.
  const TodayPulse = (props) => {
    const { xAxisMap, yAxisMap } = props;
    if (shown !== "done" || shownReveal < 4) return null;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    return (
      <circle
        className="pbn-pulse"
        cx={xScale(2026)}
        cy={yScale(yAt(2026))}
        fill="none"
        stroke={CREAM}
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  // The threshold stroke gradient, declared once as a Customized layer so it
  // lives in the SVG from mount (the draw and the draw-your-own reveal both
  // reference it by id). Vertical userSpaceOnUse gradient mapped to the plot's
  // top and bottom pixels, so the stops track burden values; the two stops that
  // straddle the crossover are emitted at avgOffset ± 0.001 (from yScale(23.7))
  // for a hard red/blue break exactly on the average at any plot height.
  const BurdenDefs = (props) => {
    const { yAxisMap } = props;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!yScale) return null;
    // yScale maps 0%→bottom and 45%→top, so its range is [plotBottom, plotTop].
    const [plotBottom, plotTop] = yScale.range();
    const avgOffset = (yScale(BURDEN_AVG) - plotTop) / (plotBottom - plotTop);
    const lo = avgOffset - 0.001;
    const hi = avgOffset + 0.001;
    return (
      <defs>
        <linearGradient id="burdenStroke" gradientUnits="userSpaceOnUse" x1="0" y1={plotTop} x2="0" y2={plotBottom}>
          <stop offset={0} stopColor={BURDEN_HEAT.worst} />
          <stop offset={lo} stopColor={BURDEN_HEAT.warm} />
          <stop offset={hi} stopColor={BURDEN_HEAT.cool} />
          <stop offset={1} stopColor={BURDEN_HEAT.best} />
        </linearGradient>
      </defs>
    );
  };

  // "41.3% 1981": the peak sits near the top of the plot, so there is no room to
  // stack a label above it. Set it BESIDE the spike, left-anchored ~30px to the
  // right of the peak, on two lines (value at the peak's y, year 19px below), no
  // pointer arrow. Fades in with the peak marker.
  const PeakLabel = (props) => {
    const { xAxisMap, yAxisMap } = props;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    const x = xScale(1981) + 30;
    const y = yScale(yAt(1981));
    return (
      <text className="pbn-lbl-peak" textAnchor="start" fill={CHART_COLORS.accent} fontSize={12} fontFamily={F.body} fontWeight={700} style={{ pointerEvents: "none" }}>
        <tspan x={x} y={y}>41.3%</tspan>
        <tspan x={x} y={y + 19}>1981</tspan>
      </text>
    );
  };

  // The "23.0% today" label. Rendered as its own SVG text, not the ReferenceDot
  // label, so it can sit ABOVE the dot and anchor at its end. The tail climbs
  // steeply from the 2020 low to 2023, so a label at the final point's y gets
  // crossed by the stroke; lifting it ~35px above the point and end-anchoring at
  // the plot's right edge clears the rising stroke and the axis edge alike. Fades
  // in with the marker via the same data-reveal step.
  const TodayLabel = (props) => {
    const { xAxisMap, yAxisMap } = props;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    return (
      <text
        className="pbn-lbl-today"
        x={xScale(2026) - 6}
        y={yScale(yAt(2026)) - 35}
        textAnchor="end"
        fill={CREAM}
        fontSize={12}
        fontFamily={F.body}
        fontWeight={700}
        style={{ pointerEvents: "none" }}
      >
        23.0% today
      </text>
    );
  };

  const replayLabel =
    phase === "drawing" ? "Drawing…" : phase === "armed" ? "Draw" : "Replay";

  return (
    <div className="pbn-chart">
      <style>{`
        ${drawControlsCss}
        .pbn-chart { width: 100%; }
        .pbn-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .pbn-plot { height: 340px; } }
        .pbn-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

        /* Threshold legend: red = worse than average, blue = better. Without it
           the color split reads as decorative. Same chip idiom as the other
           geek charts. */
        .pbn-legend { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-bottom: 12px; }
        .pbn-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: ${withAlpha(CHART_COLORS.line, 0.75)}; }
        .pbn-swatch { display: inline-block; width: 20px; height: 3px; border-radius: 999px; flex-shrink: 0; }

        /* Markers start hidden and fade in on their reveal step. */
        .pbn-mk { opacity: 0; transition: opacity .45s ease; }
        .pbn-plot[data-reveal="1"] .pbn-mk-peak,
        .pbn-plot[data-reveal="2"] .pbn-mk-peak,
        .pbn-plot[data-reveal="3"] .pbn-mk-peak,
        .pbn-plot[data-reveal="4"] .pbn-mk-peak,
        .pbn-plot[data-reveal="2"] .pbn-mk-low,
        .pbn-plot[data-reveal="3"] .pbn-mk-low,
        .pbn-plot[data-reveal="4"] .pbn-mk-low,
        .pbn-plot[data-reveal="3"] .pbn-mk-squeeze,
        .pbn-plot[data-reveal="4"] .pbn-mk-squeeze,
        .pbn-plot[data-reveal="4"] .pbn-mk-today { opacity: 1; }

        /* The separately-rendered labels fade in with their markers: the peak
           label with the 1981 dot (reveal 1), the today label with its dot
           (reveal 4). */
        .pbn-lbl-peak { opacity: 0; transition: opacity .45s ease; }
        .pbn-plot[data-reveal="1"] .pbn-lbl-peak,
        .pbn-plot[data-reveal="2"] .pbn-lbl-peak,
        .pbn-plot[data-reveal="3"] .pbn-lbl-peak,
        .pbn-plot[data-reveal="4"] .pbn-lbl-peak { opacity: 1; }
        .pbn-lbl-today { opacity: 0; transition: opacity .45s ease; }
        .pbn-plot[data-reveal="4"] .pbn-lbl-today { opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .pbn-lbl-peak, .pbn-lbl-today { transition: none; } }

        /* Today marker: expanding ring plus a soft dot glow, both once done. */
        .pbn-pulse { animation: pbnPulse 1.8s ease-out infinite; }
        @keyframes pbnPulse {
          0%   { r: 6px;  opacity: .9; }
          100% { r: 26px; opacity: 0; }
        }
        .pbn-plot[data-phase="done"] .pbn-mk-today { animation: pbnGlow 1.8s ease-in-out infinite; }
        @keyframes pbnGlow {
          0%, 100% { filter: drop-shadow(0 0 1px ${withAlpha(CHART_COLORS.line, 0.5)}); }
          50%      { filter: drop-shadow(0 0 6px ${withAlpha(CHART_COLORS.line, 0.9)}); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pbn-mk { transition: none; }
          .pbn-pulse { display: none; }
          .pbn-plot[data-phase="done"] .pbn-mk-today { animation: none; }
        }
      `}</style>

      {!staticCharts && (
        <ChartDrawControls
          label={replayLabel}
          onClick={advance}
          disabled={phase === "drawing"}
          duration={duration}
          onDuration={setDuration}
          speedDisabled={phase === "drawing"}
          onKeyDown={onKeyDown}
          hint={
            phase === "armed"
              ? (hasHover ? "Press Draw to draw the line." : "Tap Draw to draw the line.")
              : (hasHover ? "Press Replay, then Draw to redraw the line. R advances." : "Tap Replay, then Draw to redraw the line.")
          }
        />
      )}

      {/* Threshold legend: what the red/blue split means. Always shown (it
          explains the color even under reduced motion, where controls are off). */}
      <div className="pbn-legend">
        <span className="pbn-legend-item"><span className="pbn-swatch" style={{ background: BURDEN_HEAT.worst }} />worse than average</span>
        <span className="pbn-legend-item"><span className="pbn-swatch" style={{ background: BURDEN_HEAT.cool }} />better than average</span>
      </div>

      <div
        className="pbn-plot"
        data-reveal={shownReveal}
        data-phase={shown}
        aria-hidden="true"
        ref={plotRef}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 24, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1971, 2026]}
              ticks={[1980, 1990, 2000, 2010, 2020, 2026]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[0, 45]}
              ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            {/* Threshold stroke gradient (red above the average, blue below). */}
            <Customized component={BurdenDefs} />
            {/* Hover read-out only once the sequence has settled. */}
            {shown === "done" && <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
            <ReferenceLine
              y={BURDEN_AVG}
              stroke={CHART_COLORS.axis}
              strokeDasharray="5 5"
              label={{ value: `avg ${BURDEN_AVG}%`, position: "insideTopLeft", fill: tickColor, fontSize: 10, fontFamily: F.body }}
            />
            <Line type="monotone" dataKey="ratio" stroke="url(#burdenStroke)" strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" dot={false} isAnimationActive={false} />
            {/* Markers mount only once the line has drawn (see showDots). */}
            {showDots && <>
              {/* 1981 peak: red dot. Its label is rendered separately (PeakLabel)
                  so it can sit beside the spike, clear of the top edge. */}
              <ReferenceDot className="pbn-mk pbn-mk-peak" x={1981} y={yAt(1981)} r={5} fill={CHART_COLORS.accent} stroke={P.navyDark} strokeWidth={2} isFront />
              {/* 2020 low: unlabeled cream dot. */}
              <ReferenceDot className="pbn-mk pbn-mk-low" x={2020} y={yAt(2020)} r={4.5} fill={CHART_COLORS.line} stroke={P.navyDark} strokeWidth={2} isFront />
              {/* 2023 squeeze: unlabeled gold dot. */}
              <ReferenceDot className="pbn-mk pbn-mk-squeeze" x={2023} y={yAt(2023)} r={4.5} fill={CHART_COLORS.gold} stroke={P.navyDark} strokeWidth={2} isFront />
              {/* Today: cream dot. Its label is rendered separately (TodayLabel) so
                  it can sit below the dot, anchored end, clear of the pulse ring. */}
              <ReferenceDot className="pbn-mk pbn-mk-today" x={2026} y={yAt(2026)} r={5} fill={CHART_COLORS.line} stroke={P.navyDark} strokeWidth={2} isFront />
            </>}
            {showDots && <Customized component={PeakLabel} />}
            {showDots && <Customized component={TodayLabel} />}
            <Customized component={TodayPulse} />
            {!staticCharts && <Customized component={() => <Tracer fill={CREAM} />} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="pbn-sr-only">
        <table>
          <caption>Mortgage payment burden by year: principal and interest on the median new home (20 percent down, that year's average 30-year rate) as a percent of median family income, with the monthly payment, home price, and rate.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Payment burden</th>
              <th scope="col">Monthly P&amp;I</th>
              <th scope="col">Median home price</th>
              <th scope="col">30-year rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.ratio.toFixed(1)}%</td>
                <td>{fmt(d.pmt)}</td>
                <td>{fmt(d.price)}</td>
                <td>{d.rate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
