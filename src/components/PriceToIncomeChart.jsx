import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceDot, Customized } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { PRICE_TO_INCOME, PTI_AVG } from "../data/geekCharts";
import { drawPath, hidePath, clearDrawState } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, Tracer, TRACER_CLASS, drawControlsCss } from "./ChartDrawControls";

// The Price-to-Income Ratio: median new home sales price over median family
// income, 1971 to 2026, on a dark charcoal canvas. Cream ratio line against
// the 56-year average (dashed reference line at 3.52), mirroring the payment
// burden chart. Colors from CHART_COLORS / P via withAlpha; no hardcoded hex.
// The y-axis floors at 2 (the series sits 2.45 to 4.67, so a zero floor would
// flatten the shape) and ceilings at 5.5 for headroom, so the 2022 peak label
// sits well clear above the line per the text-overlay rule. sr-only table
// mirrors the series for crawlers.
//
// The chart renders fully drawn by default. Replaying is a two-step click, the
// same toggle as the Rent Line chart: the first click (Replay) blanks the chart
// and arms it, the second (Draw, or R) starts the sequence. Phases:
// done -> armed -> line -> ma -> done. The sequence: the cream ratio line
// draws, a pulse ring blooms on the 2022 peak, then a thicker gold 10-year
// moving average draws in on top and settles into a slow glow, so the smoothed
// trend reads as the story under the volatile ratio. Only prefers-reduced-motion
// hides the controls and the pulses.

const CREAM = CHART_COLORS.line;
const GOLD = CHART_COLORS.gold;
const ACCENT = CHART_COLORS.accent;
const MA_WINDOW = 10;

export function PriceToIncomeChart() {
  const { years, ratio, price, income } = PRICE_TO_INCOME;
  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();

  // Starts fully drawn (phase "done"): cream line, 2022 pulse, gold trend all
  // visible. One click re-runs the sequence, phases: line (cream draws) → ma
  // (gold trend draws) → done.
  const [phase, setPhase] = useState("done");
  const [duration, setDuration] = useState(4000);

  const plotRef = useRef(null);
  const timers = useRef([]);
  const cancelDraw = useRef(null);

  // On phones and under reduced motion the chart is simply finished.
  const shown = staticCharts ? "done" : phase;

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

  const whitePath = () => plotRef.current?.querySelector(".pti-line-white .recharts-line-curve");
  const maPath = () => plotRef.current?.querySelector(".pti-line-ma .recharts-line-curve");

  // Recharts rebuilds the SVG on every render, wiping inline dash styles. Keep
  // each line in the right state. When settled, both are shown. When armed, both
  // are blanked (the first click clears the chart). While the cream line draws,
  // the gold line stays hidden until its turn; while the gold line draws, the
  // cream line is already shown. Lines the draw effect owns are left alone.
  useEffect(() => {
    const w = whitePath(), m = maPath();
    if (!w || !m) return;
    if (shown === "done") {
      clearDrawState(w);
      clearDrawState(m);
    } else if (shown === "armed") {
      hidePath(w);
      hidePath(m);
    } else if (shown === "line") {
      hidePath(m); // cream draws (draw effect owns it); gold waits
    } else if (shown === "ma") {
      clearDrawState(w); // cream already drawn; gold draws (draw effect owns it)
    }
  });

  // The draw has to start AFTER the render that sets the phase, not inside the
  // click handler: Recharts rebuilds its SVG on every render, so a path styled
  // during the handler is detached by the time the browser paints. One effect
  // handles both draws; the tracer recolors per line.
  useEffect(() => {
    if (phase !== "line" && phase !== "ma") return;
    const isLine = phase === "line";
    const path = isLine ? whitePath() : maPath();
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (!path) {
      setPhase(isLine ? "ma" : "done");
      return;
    }
    if (tracer) {
      tracer.setAttribute("fill", isLine ? CREAM : GOLD);
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
        setPhase(isLine ? "ma" : "done");
      },
    });
    // Duration is read once at the start of a draw; the speed control is locked
    // while drawing, so it is intentionally not a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // The control is a two-step toggle. From the drawn state, the first click
  // (Replay) arms the chart: blank both lines and clear the pulse. The second
  // click (Draw) starts the sequence. A click mid-draw is ignored.
  const advance = useCallback(() => {
    if (staticCharts || phase === "line" || phase === "ma") return;
    if (phase === "armed") {
      setPhase("line");
      return;
    }
    // phase "done": arm it.
    clearTimers();
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (tracer) tracer.setAttribute("opacity", "0");
    setPhase("armed");
  }, [staticCharts, phase, clearTimers]);

  // Space and Enter already activate the focused button natively; R advances the
  // two-step toggle, scoped to the control bar.
  const onKeyDown = (e) => {
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      advance();
    }
  };

  const drawing = phase === "line" || phase === "ma";
  const replayLabel = drawing ? "Drawing…" : phase === "armed" ? "Draw" : "Replay";

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 220 }}>
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
  // the point on resize. Mounted once the cream line has drawn (phase ma/done).
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

  return (
    <div className="pti-chart">
      <style>{`
        ${drawControlsCss}
        .pti-chart { width: 100%; }
        .pti-legend { display: flex; flex-wrap: wrap; gap: 14px 20px; margin-bottom: 14px; }
        .pti-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: ${withAlpha(CHART_COLORS.line, 0.75)}; }
        .pti-swatch { display: inline-block; width: 20px; border-radius: 999px; flex-shrink: 0; }
        .pti-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .pti-plot { height: 340px; } }
        .pti-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

        /* 2022 peak marker (red dot + label): hidden while the chart is blank
           or drawing, fades in with the pulse once the cream line lands. */
        .pti-peak { opacity: 0; transition: opacity .45s ease; }
        .pti-plot[data-phase="ma"] .pti-peak,
        .pti-plot[data-phase="done"] .pti-peak { opacity: 1; }

        /* 2022 peak pulse: expanding ring, active once the cream line is drawn. */
        .pti-pulse { animation: ptiPulse 1.8s ease-out infinite; }
        @keyframes ptiPulse {
          0%   { r: 6px;  opacity: .9; }
          100% { r: 26px; opacity: 0; }
        }
        /* Gold trend: a soft glow that pulses once the whole sequence settles,
           so the smoothed line reads as the emphasized trend. */
        .pti-plot[data-phase="done"] .pti-line-ma .recharts-line-curve {
          animation: ptiTrendGlow 1.8s ease-in-out infinite;
        }
        @keyframes ptiTrendGlow {
          0%, 100% { filter: drop-shadow(0 0 1px ${withAlpha(GOLD, 0.4)}); }
          50%      { filter: drop-shadow(0 0 6px ${withAlpha(GOLD, 0.9)}); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pti-peak { transition: none; }
          .pti-pulse { display: none; }
          .pti-plot[data-phase="done"] .pti-line-ma .recharts-line-curve { animation: none; }
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
          hint={phase === "armed"
            ? "Click Draw to start."
            : (hasHover ? "Press Replay, then Draw to redraw the ratio and the 10-year trend. R advances." : "Tap Replay, then Draw to redraw the ratio and the 10-year trend.")}
        />
      )}

      <div className="pti-legend">
        <span className="pti-legend-item"><span className="pti-swatch" style={{ background: CREAM, height: 3 }} />Price to income (median home / median family income)</span>
        <span className="pti-legend-item"><span className="pti-swatch" style={{ background: GOLD, height: 4 }} />10-year trend</span>
      </div>

      <div className="pti-plot" data-phase={shown} aria-hidden="true" ref={plotRef}>
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
              domain={[2, 5.5]}
              ticks={[2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}x`}
              width={40}
            />
            {/* Hover read-out only once the sequence has settled. */}
            {shown === "done" && <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
            {/* 56-year average (the essay and methodology state the span). The
                terse "avg 3.52x" matches the payment burden chart's label and
                stays short enough that the 1980s rise in the data line never
                reaches it at narrow mobile widths. */}
            <ReferenceLine
              y={PTI_AVG}
              stroke={CHART_COLORS.axis}
              strokeDasharray="5 5"
              label={{ value: `avg ${PTI_AVG}x`, position: "insideTopLeft", fill: tickColor, fontSize: 10, fontFamily: F.body }}
            />
            {/* Cream ratio line drawn first; gold trend on top so the smoothed
                curve reads as the added emphasis. */}
            <Line className="pti-line-white" type="monotone" dataKey="ratio" stroke={CREAM} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            <Line className="pti-line-ma" type="monotone" dataKey="ma" stroke={GOLD} strokeWidth={4} dot={false} isAnimationActive={false} connectNulls={false} />
            {/* 2022 peak: the hardest door ever. Red dot with a custom label
                lifted 16px above the dot center (Recharts' "top" pins a fixed
                small offset that stays cramped no matter the ceiling), centered
                so it clears the line on both sides. Hidden while the chart is
                blank or the line is drawing; it fades in with the pulse once the
                cream line lands (data-phase gates the .pti-peak group opacity). */}
            <ReferenceDot className="pti-peak" x={2022} y={ratioAt(2022)} r={5} fill={ACCENT} stroke={P.navyDark} strokeWidth={2} isFront
              label={({ viewBox }) => (
                <text x={viewBox.x} y={viewBox.y - 16} textAnchor="middle" fill={ACCENT} fontSize={12} fontFamily={F.body} fontWeight={700}>4.67x 2022</text>
              )} />
            <Customized component={PeakPulse} />
            {!staticCharts && <Customized component={() => <Tracer fill={CREAM} />} />}
          </LineChart>
        </ResponsiveContainer>
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
