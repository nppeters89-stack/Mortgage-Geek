import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { LineChart, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot, Customized } from "recharts";
import { P, F, CHART_COLORS, PTI_SCALE } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { PRICE_TO_INCOME, PTI_AVG } from "../data/geekCharts";
import { drawPath, hidePath, clearDrawState } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, Tracer, TRACER_CLASS, drawControlsCss } from "./ChartDrawControls";

// The Price-to-Income hero, v3: a two-panel unit on the dark charcoal canvas.
// Panel A ("the inputs") plots the two nominal-dollar lines that back the
// ratio: the median new home price in lifted red and the median family income
// in the legible income blue, 1971 to 2026, on a single $0 to $450K axis. Panel
// B ("the door") is the ratio itself, red divided by blue, now a single stroke
// whose color is driven by VERTICAL POSITION relative to the 56-year average at
// 3.52x: it warms and deepens to oxblood above the line (homes harder than
// normal) and cools to violet below it (cheaper than normal), washing out at the
// crossover. A split area fill hinged on the same 3.52x line reads red above /
// blue below. The ratio is literally red divided by blue, so the two panels
// share one PRICE_TO_INCOME source and the tooltips show the division both ways.
// The heat scale lives in PTI_SCALE; the gradients and the wipe clip are declared
// once in the panel-B <defs> (see RatioDefs). Colors from PTI_SCALE / CHART_COLORS
// / P; no hardcoded hex.
//
// Panel B's y-axis floors at 2 (the ratio sits 2.45 to 4.67, so a zero floor
// would flatten it) and ceilings at 5.5 for headroom, so the 2022 peak label
// clears the line per the text-overlay rule. sr-only table mirrors the series.
//
// The hero renders fully drawn by default. Replay is a staged, click-gated
// sequence driven by the single control button, extended to walk both panels:
//   done -> armed -> inputs -> inputsDone -> ratio -> done
// Replay blanks both panels (empty axes stay visible). Click 1 draws the red
// price line and the blue income line TOGETHER (both dash-draw over the same
// duration; the panel tracer rides the price line), click 2 reveals the ratio:
// unlike the panel-A lines, the gradient stroke and its split fill wipe in
// together left-to-right (a clip rect scaling in X) so the fill never trails the
// stroke; the dashed average and the 2022 peak land as it completes. Only
// prefers-reduced-motion and phones skip the controls and render finished.

const ACCENT = CHART_COLORS.accent; // lifted red: panel A price line and the 2022 peak
const BLUE = CHART_COLORS.income; // legible blue: panel A income line

// Legend swatch for the ratio: a horizontal gradient standing in for the
// vertical position scale, cheap (violet/blue, low ratio) on the left to hard
// (red/oxblood, high ratio) on the right. Built from PTI_SCALE, bottom→top.
const RATIO_LEGEND_GRADIENT = `linear-gradient(90deg, ${[...PTI_SCALE.strokeStops].reverse().map((s) => s.c).join(", ")})`;

// Per phase, which panel-A lines are shown (fully drawn), hidden (blanked before
// their turn), or owned (left alone because the draw effect is animating them).
// The price and income lines draw together in the single "inputs" phase, so they
// share every state. The ratio line/fill are governed by the wipe clip (CSS off
// data-phase), so they never appear here.
const LINE_STATE = {
  done: { show: ["price", "income"] },
  armed: { hide: ["price", "income"] },
  inputs: { own: ["price", "income"] },
  inputsDone: { show: ["price", "income"] },
  ratio: { show: ["price", "income"] },
};

// The control button's label maps to the NEXT action from each settled phase.
const STEP_LABEL = {
  done: "Replay",
  armed: "1. Draw the inputs",
  inputsDone: "2. Divide them",
};

export function PriceToIncomeChart() {
  const { years, ratio, price, income } = PRICE_TO_INCOME;
  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();

  const [phase, setPhase] = useState("done");
  const [duration, setDuration] = useState(4000);

  const plotRef = useRef(null);
  const timers = useRef([]);
  const cancelDraw = useRef(null);

  // On phones and under reduced motion the hero is simply finished.
  const shown = staticCharts ? "done" : phase;
  const drawing = phase === "inputs" || phase === "ratio";

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], price: price[i], income: income[i] })),
    [years, ratio, price, income]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const ratioAt = (yr) => ratio[years.indexOf(yr)];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelDraw.current?.();
    cancelDraw.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const curve = (cls) => plotRef.current?.querySelector(`${cls} .recharts-line-curve`);

  // Recharts rebuilds the SVG on every render, wiping inline dash styles, so the
  // right state is re-applied here each render. Lines the draw effect owns are
  // left untouched; the rest are shown (finished) or hidden (blanked) per phase.
  useEffect(() => {
    const paths = {
      price: curve(".pti-price"),
      income: curve(".pti-income"),
    };
    // Panel A not mounted yet (first paint / resize): try again next render.
    if (!paths.price) return;
    const state = LINE_STATE[shown] || LINE_STATE.done;
    (state.show || []).forEach((k) => paths[k] && clearDrawState(paths[k]));
    (state.hide || []).forEach((k) => paths[k] && hidePath(paths[k]));
  });

  // The draw has to start AFTER the render that sets the phase, not inside the
  // click handler: Recharts rebuilds its SVG on every render, so a path styled
  // during the handler is detached by the time the browser paints.
  useEffect(() => {
    // The ratio reveals by a left-to-right clip wipe (fill + gradient stroke
    // together), driven by CSS off panel B's data-phase. There is no path to
    // dash-draw and no tracer; we only settle into "done" once the wipe, whose
    // duration is the same SPEED value, has run. A timer (not an rAF loop) also
    // means a backgrounded tab still lands finished.
    if (phase === "ratio") {
      timers.current.push(setTimeout(() => setPhase("done"), duration));
      return;
    }
    if (phase !== "inputs") return;
    // The price and income lines draw together on this one click. Both dash-draw
    // over the same SPEED duration; the panel's single tracer rides the price
    // line. We settle into "inputsDone" only once BOTH strokes have finished.
    const pricePath = curve(".pti-price");
    const incomePath = curve(".pti-income");
    if (!pricePath || !incomePath) {
      setPhase("inputsDone");
      return;
    }
    const tracer = plotRef.current?.querySelector(`.pti-panel-a .${TRACER_CLASS}`);
    if (tracer) {
      tracer.setAttribute("fill", ACCENT);
      tracer.setAttribute("opacity", "1");
    }
    let remaining = 2;
    const finishOne = () => {
      if (--remaining > 0) return;
      if (tracer) tracer.setAttribute("opacity", "0");
      setPhase("inputsDone");
    };
    const cancelPrice = drawPath(pricePath, {
      duration,
      onTick: (_t, pt) => {
        if (!tracer) return;
        tracer.setAttribute("cx", pt.x);
        tracer.setAttribute("cy", pt.y);
      },
      onDone: finishOne,
    });
    const cancelIncome = drawPath(incomePath, { duration, onDone: finishOne });
    cancelDraw.current = () => { cancelPrice(); cancelIncome(); };
    // Duration is read once at the start of a draw; the speed control is locked
    // while drawing, so it is intentionally not a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // The control advances the staged sequence one click at a time. From the
  // drawn state the first click (Replay) blanks both panels; the next draws the
  // price and income lines together, then the last divides them into the ratio.
  // A click mid-draw is ignored.
  const advance = useCallback(() => {
    if (staticCharts || drawing) return;
    if (phase === "done") {
      clearTimers();
      const tracers = plotRef.current?.querySelectorAll(`.${TRACER_CLASS}`);
      tracers?.forEach((t) => t.setAttribute("opacity", "0"));
      setPhase("armed");
      return;
    }
    if (phase === "armed") setPhase("inputs");
    else if (phase === "inputsDone") setPhase("ratio");
  }, [staticCharts, drawing, phase, clearTimers]);

  // Space and Enter already activate the focused button natively; R advances the
  // sequence, scoped to the control bar.
  const onKeyDown = (e) => {
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      advance();
    }
  };

  const replayLabel = drawing ? "Drawing…" : (STEP_LABEL[phase] || "Replay");
  const hint = phase === "done"
    ? (hasHover ? "Press Replay, then draw the inputs and the ratio in turn. R advances." : "Tap Replay, then draw the inputs and the ratio in turn.")
    : phase === "armed" ? "Click to draw the price and the paycheck together."
    : phase === "inputsDone" ? "Click to divide them into the ratio."
    : "Drawing…";

  // The dashed 3.52x average (the fills' hinge) shows once the ratio reveal
  // begins and stays through the finished state.
  const showAvg = shown === "ratio" || shown === "done";
  const tooltipBox = { background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 220 };

  // Panel A read-out: both nominal-dollar values plus the ratio footer, so the
  // hover shows the two inputs and the answer they produce.
  const InputsTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={tooltipBox}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 3 }}>median new home: {fmt(d.price)}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 6 }}>median family income: {fmt(d.income)}</p>
        <p style={{ fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.6), fontWeight: 600, margin: 0 }}>Ratio: {d.ratio.toFixed(2)}x</p>
      </div>
    );
  };

  // Panel B read-out: the ratio and the division that produced it.
  const RatioTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={tooltipBox}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>price to income: {d.ratio.toFixed(2)}x</p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), lineHeight: 1.5, margin: 0 }}>
          {fmt(d.price)} median new home / {fmt(d.income)} median family income
        </p>
      </div>
    );
  };

  // The two panel-B gradients (position-driven stroke, split fill) and the wipe
  // clip, declared once as a Customized layer so they live in the SVG from mount
  // (the reveal and the draw-your-own reveal both reference them by id). Both
  // gradients use userSpaceOnUse mapped to the plot's top and bottom pixels, so
  // the stops track ratio values; the crossover pair is emitted at avgOffset ±
  // 0.001 (computed from yScale(3.52)) for a hard color break exactly on 3.52x.
  // The clip rect spans the plot and is scaled in X by CSS to wipe the reveal.
  const RatioDefs = (props) => {
    const { xAxisMap, yAxisMap } = props;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    // Plot pixel bounds straight off the scale ranges: yScale maps 2x→bottom and
    // 5.5x→top, so its range is [plotBottom, plotTop]; xScale's is [left, right].
    const [plotBottom, plotTop] = yScale.range();
    const [plotLeft, plotRight] = xScale.range();
    const avgOffset = (yScale(PTI_AVG) - plotTop) / (plotBottom - plotTop);
    const lo = avgOffset - 0.001;
    const hi = avgOffset + 0.001;
    const below = PTI_SCALE.strokeStops.filter((s) => s.off < avgOffset);
    const above = PTI_SCALE.strokeStops.filter((s) => s.off > avgOffset);
    const f = PTI_SCALE.fillStops;
    return (
      <defs>
        <linearGradient id="ptiStroke" gradientUnits="userSpaceOnUse" x1="0" y1={plotTop} x2="0" y2={plotBottom}>
          {below.map((s) => <stop key={s.off} offset={s.off} stopColor={s.c} />)}
          <stop offset={lo} stopColor={PTI_SCALE.crossWarm} />
          <stop offset={hi} stopColor={PTI_SCALE.crossBlue} />
          {above.map((s) => <stop key={s.off} offset={s.off} stopColor={s.c} />)}
        </linearGradient>
        <linearGradient id="ptiFill" gradientUnits="userSpaceOnUse" x1="0" y1={plotTop} x2="0" y2={plotBottom}>
          <stop offset={0} stopColor={f.redTop} stopOpacity={0.6} />
          <stop offset={lo} stopColor={f.redAvg} stopOpacity={0.08} />
          <stop offset={hi} stopColor={f.blueAvg} stopOpacity={0.08} />
          <stop offset={1} stopColor={f.blueBot} stopOpacity={0.45} />
        </linearGradient>
        <clipPath id="ptiWipe">
          <rect className="pti-wipe-rect" x={plotLeft} y={plotTop} width={plotRight - plotLeft} height={plotBottom - plotTop} />
        </clipPath>
      </defs>
    );
  };

  // Pulse ring on the 2022 peak, drawn through Recharts' own scales so it tracks
  // the point on resize. Mounted once the ratio has revealed (done).
  const PeakPulse = (props) => {
    const { xAxisMap, yAxisMap } = props;
    if (shown !== "done") return null;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    return (
      <circle
        className="pti-pulse"
        cx={xScale(2022)}
        cy={yScale(ratioAt(2022))}
        fill="none"
        stroke={ACCENT}
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  const xAxisProps = {
    dataKey: "year",
    type: "number",
    domain: [1971, 2026],
    ticks: [1980, 1990, 2000, 2010, 2020, 2026],
    allowDecimals: false,
    tick: { fill: tickColor, fontSize: 11 },
    tickLine: false,
    axisLine: { stroke: CHART_COLORS.axis },
  };

  return (
    <div className="pti-chart" ref={plotRef}>
      <style>{`
        ${drawControlsCss}
        .pti-chart { width: 100%; }
        .pti-legend { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-bottom: 12px; }
        .pti-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: ${withAlpha(CHART_COLORS.line, 0.75)}; }
        .pti-swatch { display: inline-block; width: 20px; border-radius: 999px; flex-shrink: 0; }
        .pti-swatch--dash { width: 20px; height: 0; border-top: 2px dashed ${withAlpha(CHART_COLORS.line, 0.5)}; border-radius: 0; }
        .pti-swatch--scale { width: 22px; height: 6px; background: ${RATIO_LEGEND_GRADIENT}; }
        .pti-panel-a .pti-plot { width: 100%; height: 300px; min-height: 240px; }
        .pti-panel-b .pti-plot { width: 100%; height: 300px; min-height: 240px; }
        @media (max-width: 640px) {
          .pti-panel-a .pti-plot, .pti-panel-b .pti-plot { height: 240px; }
        }
        .pti-divider { text-align: center; color: ${withAlpha(CHART_COLORS.line, 0.5)}; font-size: 12px; letter-spacing: 0.02em; padding: 8px 0 12px; }
        .pti-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

        /* 2022 peak marker (red dot + label): hidden while panel B is blank or
           the ratio is wiping in, fades in with the pulse once the reveal lands. */
        .pti-peak { opacity: 0; transition: opacity .45s ease; }
        .pti-panel-b[data-phase="done"] .pti-peak { opacity: 1; }

        /* 2022 peak pulse: expanding ring, active once the ratio has revealed. */
        .pti-pulse { animation: ptiPulse 1.8s ease-out infinite; }
        @keyframes ptiPulse {
          0%   { r: 6px;  opacity: .9; }
          100% { r: 26px; opacity: 0; }
        }

        /* Ratio reveal: the gradient fill and stroke share one clip whose rect
           scales in X from the plot's left edge, so both wipe in together left to
           right. Hidden (scaleX 0) before the ratio's turn; a full scaleX(1) once
           settled. The wipe duration is the SPEED value via --draw-dur, set on
           the panel, so 3s/4s/5s scales the reveal. */
        .pti-fill, .pti-ratio { clip-path: url(#ptiWipe); }
        .pti-wipe-rect { transform-box: fill-box; transform-origin: left; transform: scaleX(1); }
        .pti-panel-b[data-phase="armed"] .pti-wipe-rect,
        .pti-panel-b[data-phase="inputs"] .pti-wipe-rect,
        .pti-panel-b[data-phase="inputsDone"] .pti-wipe-rect { transform: scaleX(0); }
        .pti-panel-b[data-phase="ratio"] .pti-wipe-rect {
          animation: ptiWipe var(--draw-dur, 4000ms) cubic-bezier(.4, .05, .2, 1) forwards;
        }
        @keyframes ptiWipe { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        @media (prefers-reduced-motion: reduce) {
          .pti-peak { transition: none; }
          .pti-pulse { display: none; }
        }
      `}</style>

      {!staticCharts && (
        <ChartDrawControls
          label={replayLabel}
          onClick={advance}
          disabled={drawing}
          duration={duration}
          onDuration={setDuration}
          speedDisabled={drawing}
          onKeyDown={onKeyDown}
          hint={hint}
        />
      )}

      {/* Panel A: the two inputs in nominal dollars. */}
      <div className="pti-panel-a">
        <div className="pti-legend">
          <span className="pti-legend-item"><span className="pti-swatch" style={{ background: ACCENT, height: 3 }} />Median new home price</span>
          <span className="pti-legend-item"><span className="pti-swatch" style={{ background: BLUE, height: 3 }} />Median family income</span>
        </div>
        <div className="pti-plot" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis
                domain={[0, 450000]}
                ticks={[0, 100000, 200000, 300000, 400000]}
                tick={{ fill: tickColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v === 0 ? "$0" : `$${v / 1000}K`)}
                width={46}
              />
              {shown === "done" && <Tooltip content={<InputsTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
              <Line className="pti-price" type="monotone" dataKey="price" stroke={ACCENT} strokeWidth={2.75} dot={false} isAnimationActive={false} />
              <Line className="pti-income" type="monotone" dataKey="income" stroke={BLUE} strokeWidth={2.75} dot={false} isAnimationActive={false} />
              {!staticCharts && <Customized component={() => <Tracer fill={ACCENT} />} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Divider: the arithmetic that turns panel A into panel B. */}
      <div className="pti-divider">↓ red divided by blue, year by year ↓</div>

      {/* Panel B: the ratio, red divided by blue. --draw-dur drives the reveal
          wipe off the SPEED control. */}
      <div className="pti-panel-b" data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        <div className="pti-legend">
          <span className="pti-legend-item"><span className="pti-swatch pti-swatch--scale" />Price to income (median home / median family income)</span>
          <span className="pti-legend-item"><span className="pti-swatch pti-swatch--dash" />56-year avg {PTI_AVG}x</span>
        </div>
        <div className="pti-plot" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis
                domain={[2, 5.5]}
                ticks={[2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5]}
                tick={{ fill: tickColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}x`}
                width={46}
              />
              {/* Position-driven stroke gradient, split fill, and the wipe clip. */}
              <Customized component={RatioDefs} />
              {shown === "done" && <Tooltip content={<RatioTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
              {/* Split fill: one Area closed to the 3.52x average (not the plot
                  bottom), so the ptiFill gradient reads red above / blue below.
                  Behind the line; clipped by the reveal wipe. */}
              <Area className="pti-fill" type="monotone" dataKey="ratio" baseValue={PTI_AVG} stroke="none" fill="url(#ptiFill)" isAnimationActive={false} activeDot={false} dot={false} />
              {/* 56-year average, the fills' hinge. Appears with the ratio reveal
                  and stays. Label sits just above the dashed line (insideTopLeft),
                  never on the blue fill. */}
              {showAvg && (
                <ReferenceLine
                  y={PTI_AVG}
                  stroke={CHART_COLORS.axis}
                  strokeDasharray="5 5"
                  label={{ value: `avg ${PTI_AVG}x`, position: "insideTopLeft", fill: tickColor, fontSize: 10, fontFamily: F.body }}
                />
              )}
              <Line className="pti-ratio" type="monotone" dataKey="ratio" stroke="url(#ptiStroke)" strokeWidth={4.8} strokeLinecap="round" strokeLinejoin="round" dot={false} activeDot={false} isAnimationActive={false} />
              {/* 2022 peak: the hardest door ever. Red dot with a custom label
                  lifted 16px above the dot center, centered so it clears the
                  line on both sides. Hidden until the reveal lands. */}
              <ReferenceDot className="pti-peak" x={2022} y={ratioAt(2022)} r={5} fill={ACCENT} stroke={P.navyDark} strokeWidth={2} isFront
                label={({ viewBox }) => (
                  <text x={viewBox.x} y={viewBox.y - 16} textAnchor="middle" fill={ACCENT} fontSize={12} fontFamily={F.body} fontWeight={700}>4.67x 2022</text>
                )} />
              <Customized component={PeakPulse} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="pti-sr-only">
        <table>
          <caption>Price-to-income ratio by year: median new home sales price divided by median family income, 1971 to 2026, with the underlying home price and family income.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Price to income</th>
              <th scope="col">Median new home price</th>
              <th scope="col">Median family income</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.ratio.toFixed(2)}x</td>
                <td>{fmt(d.price)}</td>
                <td>{fmt(d.income)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
