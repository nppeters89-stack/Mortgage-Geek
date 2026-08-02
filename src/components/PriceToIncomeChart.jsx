import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot, Customized } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { PRICE_TO_INCOME, PTI_AVG } from "../data/geekCharts";
import { drawPath, hidePath, clearDrawState } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, Tracer, TRACER_CLASS, drawControlsCss } from "./ChartDrawControls";

// The Price-to-Income hero, v2: a two-panel unit on the dark charcoal canvas.
// Panel A ("the inputs") plots the two nominal-dollar lines that back the
// ratio: the median new home price in lifted red and the median family income
// in the legible income blue, 1971 to 2026, on a single $0 to $450K axis. Panel
// B ("the door") is the ratio itself, red divided by blue: the cream line, the
// dashed 56-year average at 3.52, and the gold 10-year moving average, exactly
// as built before. The white line is literally the red divided by the blue, so
// the two panels share one PRICE_TO_INCOME source and the tooltips show the
// division both ways. Colors come from CHART_COLORS / P via withAlpha; no
// hardcoded hex.
//
// Panel B's y-axis floors at 2 (the ratio sits 2.45 to 4.67, so a zero floor
// would flatten it) and ceilings at 5.5 for headroom, so the 2022 peak label
// clears the line per the text-overlay rule. sr-only table mirrors the series.
//
// The hero renders fully drawn by default. Replay is a staged, click-gated
// sequence driven by the single control button, the same infrastructure as the
// Rent Line chart, extended to walk both panels one line per click:
//   done -> armed -> price -> priceDone -> income -> incomeDone -> ratio -> ma -> done
// Replay blanks both panels (empty axes stay visible). Click 1 draws the red
// price line, click 2 the blue income line, click 3 the cream ratio line, and
// once the ratio lands the dashed average and the gold moving average appear
// with a pulse on the 2022 peak. Only prefers-reduced-motion and phones skip
// the controls and pulses and render the whole thing finished.

const CREAM = CHART_COLORS.line;
const GOLD = CHART_COLORS.gold;
const ACCENT = CHART_COLORS.accent; // lifted red: panel A price line and the 2022 peak
const BLUE = CHART_COLORS.income; // legible blue: panel A income line
const MA_WINDOW = 10;

// Which line each drawing phase owns, where to find it and its tracer, its
// tracer color, and the phase to settle into when the draw finishes.
const DRAW = {
  price: { line: ".pti-price", panel: ".pti-panel-a", color: ACCENT, next: "priceDone" },
  income: { line: ".pti-income", panel: ".pti-panel-a", color: BLUE, next: "incomeDone" },
  ratio: { line: ".pti-line-white", panel: ".pti-panel-b", color: CREAM, next: "ma" },
  ma: { line: ".pti-line-ma", panel: ".pti-panel-b", color: GOLD, next: "done" },
};

// Per phase, which lines are shown (fully drawn), hidden (blanked before their
// turn), or owned (left alone because the draw effect is animating them).
const LINE_STATE = {
  done: { show: ["price", "income", "ratio", "ma"] },
  armed: { hide: ["price", "income", "ratio", "ma"] },
  price: { own: ["price"], hide: ["income", "ratio", "ma"] },
  priceDone: { show: ["price"], hide: ["income", "ratio", "ma"] },
  income: { show: ["price"], own: ["income"], hide: ["ratio", "ma"] },
  incomeDone: { show: ["price", "income"], hide: ["ratio", "ma"] },
  ratio: { show: ["price", "income"], own: ["ratio"], hide: ["ma"] },
  ma: { show: ["price", "income", "ratio"], own: ["ma"] },
};

// The control button's label maps to the NEXT action from each settled phase.
const STEP_LABEL = {
  done: "Replay",
  armed: "1. Draw the price",
  priceDone: "2. Draw the paycheck",
  incomeDone: "3. Divide them",
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
  const drawing = phase === "price" || phase === "income" || phase === "ratio" || phase === "ma";

  // Trailing 10-year moving average of the ratio, the smoothed trend line.
  // Derived from the canonical ratio series, not stored: the first 9 years lack
  // a full window, so they are null and the gold line begins in 1980 (no
  // interpolation across the gap).
  const ma = useMemo(() => ratio.map((_, i) => {
    if (i < MA_WINDOW - 1) return null;
    let sum = 0;
    for (let k = i - MA_WINDOW + 1; k <= i; k++) sum += ratio[k];
    return sum / MA_WINDOW;
  }), [ratio]);

  const data = useMemo(
    () => years.map((year, i) => ({ year, ratio: ratio[i], price: price[i], income: income[i], ma: ma[i] })),
    [years, ratio, price, income, ma]
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
      ratio: curve(".pti-line-white"),
      ma: curve(".pti-line-ma"),
    };
    // Panels not mounted yet (first paint / resize): try again next render.
    if (!paths.price || !paths.ratio) return;
    const state = LINE_STATE[shown] || LINE_STATE.done;
    (state.show || []).forEach((k) => paths[k] && clearDrawState(paths[k]));
    (state.hide || []).forEach((k) => paths[k] && hidePath(paths[k]));
  });

  // The draw has to start AFTER the render that sets the phase, not inside the
  // click handler: Recharts rebuilds its SVG on every render, so a path styled
  // during the handler is detached by the time the browser paints. One effect
  // handles every stage; it reads the phase's config, recolors the panel's
  // tracer, draws, and settles into the next phase on completion.
  useEffect(() => {
    const cfg = DRAW[phase];
    if (!cfg) return;
    const path = curve(cfg.line);
    const tracer = plotRef.current?.querySelector(`${cfg.panel} .${TRACER_CLASS}`);
    if (!path) {
      setPhase(cfg.next);
      return;
    }
    if (tracer) {
      tracer.setAttribute("fill", cfg.color);
      tracer.setAttribute("opacity", "1");
    }
    cancelDraw.current = drawPath(path, {
      duration,
      onTick: (_t, pt) => {
        if (!tracer) return;
        tracer.setAttribute("cx", pt.x);
        tracer.setAttribute("cy", pt.y);
      },
      onDone: () => {
        if (tracer) tracer.setAttribute("opacity", "0");
        setPhase(cfg.next);
      },
    });
    // Duration is read once at the start of a draw; the speed control is locked
    // while drawing, so it is intentionally not a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // The control advances the staged sequence one click at a time. From the
  // drawn state the first click (Replay) blanks both panels; each later click
  // draws the next line. A click mid-draw is ignored.
  const advance = useCallback(() => {
    if (staticCharts || drawing) return;
    if (phase === "done") {
      clearTimers();
      const tracers = plotRef.current?.querySelectorAll(`.${TRACER_CLASS}`);
      tracers?.forEach((t) => t.setAttribute("opacity", "0"));
      setPhase("armed");
      return;
    }
    if (phase === "armed") setPhase("price");
    else if (phase === "priceDone") setPhase("income");
    else if (phase === "incomeDone") setPhase("ratio");
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
    ? (hasHover ? "Press Replay, then draw the price, the paycheck, and the ratio in turn. R advances." : "Tap Replay, then draw the price, the paycheck, and the ratio in turn.")
    : phase === "armed" ? "Click to draw the median new home price."
    : phase === "priceDone" ? "Click to draw the median family income."
    : phase === "incomeDone" ? "Click to divide them into the ratio."
    : "Drawing…";

  const showRatioPanel = shown === "ratio" || shown === "ma" || shown === "done";
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

  // Panel B read-out: the ratio, the trend, and the division that produced it.
  const RatioTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={tooltipBox}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: CHART_COLORS.line, marginBottom: d.ma != null ? 4 : 6 }}>price to income: {d.ratio.toFixed(2)}x</p>
        {d.ma != null && (
          <p style={{ fontSize: 12, color: GOLD, fontWeight: 600, marginBottom: 6 }}>10-year trend: {d.ma.toFixed(2)}x</p>
        )}
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), lineHeight: 1.5, margin: 0 }}>
          {fmt(d.price)} median new home / {fmt(d.income)} median family income
        </p>
      </div>
    );
  };

  // Pulse ring on the 2022 peak, drawn through Recharts' own scales so it tracks
  // the point on resize. Mounted once the cream ratio line has drawn (ma/done).
  const PeakPulse = (props) => {
    const { xAxisMap, yAxisMap } = props;
    if (shown !== "ma" && shown !== "done") return null;
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
        .pti-panel-a .pti-plot { width: 100%; height: 300px; min-height: 240px; }
        .pti-panel-b .pti-plot { width: 100%; height: 300px; min-height: 240px; }
        @media (max-width: 640px) {
          .pti-panel-a .pti-plot, .pti-panel-b .pti-plot { height: 240px; }
        }
        .pti-divider { text-align: center; color: ${withAlpha(CHART_COLORS.line, 0.5)}; font-size: 12px; letter-spacing: 0.02em; padding: 8px 0 12px; }
        .pti-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

        /* 2022 peak marker (red dot + label): hidden while panel B is blank or
           the ratio is drawing, fades in with the pulse once the line lands. */
        .pti-peak { opacity: 0; transition: opacity .45s ease; }
        .pti-panel-b[data-phase="ma"] .pti-peak,
        .pti-panel-b[data-phase="done"] .pti-peak { opacity: 1; }

        /* 2022 peak pulse: expanding ring, active once the ratio line is drawn. */
        .pti-pulse { animation: ptiPulse 1.8s ease-out infinite; }
        @keyframes ptiPulse {
          0%   { r: 6px;  opacity: .9; }
          100% { r: 26px; opacity: 0; }
        }
        /* Gold trend: a soft glow that pulses once the whole sequence settles,
           so the smoothed line reads as the emphasized trend. */
        .pti-panel-b[data-phase="done"] .pti-line-ma .recharts-line-curve {
          animation: ptiTrendGlow 1.8s ease-in-out infinite;
        }
        @keyframes ptiTrendGlow {
          0%, 100% { filter: drop-shadow(0 0 1px ${withAlpha(GOLD, 0.4)}); }
          50%      { filter: drop-shadow(0 0 6px ${withAlpha(GOLD, 0.9)}); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pti-peak { transition: none; }
          .pti-pulse { display: none; }
          .pti-panel-b[data-phase="done"] .pti-line-ma .recharts-line-curve { animation: none; }
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

      {/* Panel B: the ratio, red divided by blue. */}
      <div className="pti-panel-b" data-phase={shown}>
        <div className="pti-legend">
          <span className="pti-legend-item"><span className="pti-swatch" style={{ background: CREAM, height: 3 }} />Price to income (median home / median family income)</span>
          <span className="pti-legend-item"><span className="pti-swatch pti-swatch--dash" />56-year avg {PTI_AVG}x</span>
          <span className="pti-legend-item"><span className="pti-swatch" style={{ background: GOLD, height: 4 }} />10-year trend</span>
        </div>
        <div className="pti-plot" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 4 }}>
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
              {shown === "done" && <Tooltip content={<RatioTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
              {/* 56-year average. Appears with the moving average once the ratio
                  line has drawn (phase ma/done), so panel B populates in order:
                  ratio, then the dashed average and the gold trend. The terse
                  label matches the payment burden chart and stays short enough
                  that the 1980s rise in the ratio never reaches it on mobile. */}
              {showRatioPanel && (shown === "ma" || shown === "done") && (
                <ReferenceLine
                  y={PTI_AVG}
                  stroke={CHART_COLORS.axis}
                  strokeDasharray="5 5"
                  label={{ value: `avg ${PTI_AVG}x`, position: "insideTopLeft", fill: tickColor, fontSize: 10, fontFamily: F.body }}
                />
              )}
              <Line className="pti-line-white" type="monotone" dataKey="ratio" stroke={CREAM} strokeWidth={2.75} dot={false} isAnimationActive={false} />
              <Line className="pti-line-ma" type="monotone" dataKey="ma" stroke={GOLD} strokeWidth={4} dot={false} isAnimationActive={false} connectNulls={false} />
              {/* 2022 peak: the hardest door ever. Red dot with a custom label
                  lifted 16px above the dot center, centered so it clears the
                  line on both sides. Hidden until the ratio line lands. */}
              <ReferenceDot className="pti-peak" x={2022} y={ratioAt(2022)} r={5} fill={ACCENT} stroke={P.navyDark} strokeWidth={2} isFront
                label={({ viewBox }) => (
                  <text x={viewBox.x} y={viewBox.y - 16} textAnchor="middle" fill={ACCENT} fontSize={12} fontFamily={F.body} fontWeight={700}>4.67x 2022</text>
                )} />
              <Customized component={PeakPulse} />
              {!staticCharts && <Customized component={() => <Tracer fill={CREAM} />} />}
            </LineChart>
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
