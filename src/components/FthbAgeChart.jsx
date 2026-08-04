import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea, Customized } from "recharts";
import { P, F, CHART_COLORS, FTHB_HEAT } from "../theme";
import { withAlpha } from "../utils/format";
import { FTHB_AGE } from "../data/geekCharts";
import { drawPath, clearDrawState, hidePath } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, drawControlsCss } from "./ChartDrawControls";

// The Age of the First-Time Homebuyer: NAR's median first-time buyer age by
// survey year, on a dark charcoal canvas. One line that warms across time (cool
// slate in the 1980s, amber through the 2000s, hot red at 2025) with a soft glow
// fill under it, so the post-2020 breakout gains visual mass. The data is a
// survey and not every year exists (NAR skipped years in the 1980s and 1990s),
// so the line connects the years that do. The heat stops live in FTHB_HEAT; the
// gradients are declared once in the chart's <defs> (see HeatDefs) so the
// draw-reveal always has them. Colors from FTHB_HEAT / CHART_COLORS / P; no
// hardcoded hex.
//
// The chart renders drawn by default. Replaying is a two-step click: the first
// (Replay) blanks the line and hides the callouts, the second (Draw) draws the
// line with a tracer, then the 1991 low and the 2025 record fade in. The
// whisper-subtle band from 28 to 33 is the chart's argument: for forty years the
// line lived inside it, then broke out after 2020. Its label sits BELOW the band
// in open space (ages under 28), never on the line; the two callout dots sit in
// open space off the line too. Only prefers-reduced-motion hides the controls
// and shows the finished chart. sr-only table mirrors the series for crawlers.
export function FthbAgeChart() {
  const { surveyYears, surveyAges, BAND_LOW, BAND_HIGH } = FTHB_AGE;
  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();

  // The chart starts drawn (phase "done", callouts shown); replaying is a two-
  // step click: done → armed (line blanked) → drawing → points → done.
  const [phase, setPhase] = useState("done");
  const [reveal, setReveal] = useState(1);
  const [duration, setDuration] = useState(4000);

  const plotRef = useRef(null);
  const timers = useRef([]);
  const cancels = useRef([]);

  const shown = staticCharts ? "done" : phase;
  const shownReveal = staticCharts ? 1 : reveal;

  const data = useMemo(
    () => surveyYears.map((year, i) => ({ year, age: surveyAges[i] })),
    [surveyYears, surveyAges]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const faint = withAlpha(CHART_COLORS.line, 0.4);
  const ageAt = (yr) => surveyAges[surveyYears.indexOf(yr)];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancels.current.forEach((c) => c?.());
    cancels.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const linePath = () => plotRef.current?.querySelector(".fthb-line .recharts-line-curve");

  // Recharts wipes inline dash styles on every render and on resize. Keep the
  // line in the right state: visible when settled, blanked while armed (it only
  // self-hides mid-draw).
  useEffect(() => {
    const line = linePath();
    if (!line) return;
    if (shown === "done" || shown === "points") clearDrawState(line);
    else if (shown === "armed") hidePath(line);
  });

  // Draw the line with a tracer, then reveal the callouts.
  useEffect(() => {
    if (phase !== "drawing") return;
    const line = linePath();
    if (!line) {
      setPhase("points");
      return;
    }
    const tracer = plotRef.current?.querySelector(".fthb-tracer");
    if (tracer) tracer.setAttribute("opacity", "1");

    const finish = () => {
      if (tracer) tracer.setAttribute("opacity", "0");
      setPhase("points");
      timers.current.push(setTimeout(() => setReveal(1), 200));
      timers.current.push(setTimeout(() => setPhase("done"), 900));
    };

    cancels.current.push(
      drawPath(line, {
        duration,
        onTick: (_t, pt) => { if (tracer) { tracer.setAttribute("cx", pt.x); tracer.setAttribute("cy", pt.y); } },
        onDone: finish,
      })
    );
    // Duration is read once per run; speed is locked while drawing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // The control is a two-step toggle. From the drawn state, the first click
  // arms it: hide the callouts and blank the line. The second click starts the
  // draw. A click mid-draw is ignored.
  const advance = useCallback(() => {
    if (staticCharts || phase === "drawing") return;
    if (phase === "armed") {
      setPhase("drawing");
      return;
    }
    // phase "done": arm it.
    clearTimers();
    const tracer = plotRef.current?.querySelector(".fthb-tracer");
    if (tracer) tracer.setAttribute("opacity", "0");
    setReveal(0);
    setPhase("armed");
  }, [staticCharts, phase, clearTimers]);

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
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 210 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: CHART_COLORS.line, flexShrink: 0 }} />
          median first-time buyer age: {d.age}
        </p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: 0 }}>
          NAR Profile of Home Buyers and Sellers
        </p>
      </div>
    );
  };

  // A single warm tracer (orange, the gradient's mid tone) that rides the line
  // while it draws — no white on the series, even mid-draw.
  const Tracer = () => <circle className="fthb-tracer" r={6} fill={FTHB_HEAT.orange} stroke={P.navyDark} strokeWidth={2} opacity={0} style={{ pointerEvents: "none" }} />;

  // The two heat gradients, declared once as a Recharts <Customized> layer so
  // they live in the chart SVG from mount (the draw-reveal and the fill both
  // reference them by id). Stroke warms left→right across the line's own
  // bounding box; fill fades top→bottom to nothing at the baseline. Default
  // objectBoundingBox units map 1981→first stop and 2025→last regardless of
  // viewport width, so the sweep spans the full series at any screen size.
  const HeatDefs = () => (
    <defs>
      <linearGradient id="fthbAgeStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={FTHB_HEAT.slate} />
        <stop offset="0.5" stopColor={FTHB_HEAT.amber} />
        <stop offset="0.78" stopColor={FTHB_HEAT.orange} />
        <stop offset="1" stopColor={FTHB_HEAT.red} />
      </linearGradient>
      <linearGradient id="fthbAgeFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={FTHB_HEAT.red} stopOpacity={0.3} />
        <stop offset="0.55" stopColor={FTHB_HEAT.fillMid} stopOpacity={0.1} />
        <stop offset="1" stopColor={FTHB_HEAT.slate} stopOpacity={0} />
      </linearGradient>
    </defs>
  );

  // The two callouts (1991 low, 2025 record) drawn through Recharts' scales so
  // they track the points on resize. Rendered as one plain SVG layer we fully
  // control: absent while the line blanks and draws, then faded in via the
  // reveal flag. Recharts' own ReferenceDot labels fight CSS opacity (a
  // function-form label ignores it outright), so we own this layer instead.
  const Callouts = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const { xAxisMap, yAxisMap } = props;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    const low = ageAt(1991);
    const rec = ageAt(2025);
    return (
      <g className="fthb-callouts" style={{ opacity: shownReveal >= 1 ? 1 : 0, transition: "opacity .45s ease", pointerEvents: "none" }}>
        {/* 1991 record low: income-blue dot, label below in open space. */}
        <circle cx={xScale(1991)} cy={yScale(low)} r={5} fill={CHART_COLORS.income} stroke={P.navyDark} strokeWidth={2} />
        <text x={xScale(1991)} y={yScale(low) + 22} textAnchor="middle" fill={CHART_COLORS.income} fontSize={12} fontFamily={F.body} fontWeight={700}>{`${low} · 1991`}</text>
        {/* 2025 record high: hot-red dot at the top right, with one concentric
            ring pulsing outward (non-scaling stroke, so it thins as it grows,
            not fattens). Label grows leftward above the dot, clear of the rising
            line and the edge. */}
        <circle className="fthb-pulse" cx={xScale(2025)} cy={yScale(rec)} r={5} fill="none" stroke={FTHB_HEAT.red} strokeWidth={1.5} vectorEffect="non-scaling-stroke" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        <circle cx={xScale(2025)} cy={yScale(rec)} r={4.5} fill={FTHB_HEAT.red} stroke={P.navyDark} strokeWidth={2} />
        <text x={xScale(2025) - 8} y={yScale(rec) - 12} textAnchor="end" fill={CHART_COLORS.accent} fontSize={12} fontFamily={F.body} fontWeight={700}>{`${rec} · record`}</text>
      </g>
    );
  };

  const label = phase === "drawing" ? "Drawing…" : phase === "armed" ? "Draw" : "Replay";

  return (
    <div className="fthb-chart">
      <style>{`
        ${drawControlsCss}
        .fthb-chart { width: 100%; }
        .fthb-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .fthb-plot { height: 340px; } }
        .fthb-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

        /* Glow fill rises from the baseline behind the line. Origin is the
           bottom of the fill's own box (the y=18 baseline). The whole draw
           sequence — line, fill, reveal — is paced off --draw-dur, set inline
           from the SPEED control, so 3s/4s/5s scales everything together. The
           fill starts at ~45% of the draw and grows over ~25% of it. */
        .fthb-area .recharts-area-area { transform-box: fill-box; transform-origin: bottom; }
        .fthb-plot[data-phase="armed"] .fthb-area .recharts-area-area { opacity: 0; transform: scaleY(0); }
        .fthb-plot[data-phase="drawing"] .fthb-area .recharts-area-area {
          animation: fthbFillRise calc(var(--draw-dur, 4000ms) * 0.25) cubic-bezier(.4, 0, .2, 1) calc(var(--draw-dur, 4000ms) * 0.45) both;
        }
        @keyframes fthbFillRise { from { opacity: 0; transform: scaleY(0); } to { opacity: 1; transform: scaleY(1); } }

        /* The 2025 marker's outward ring pulse (starts with the callouts, after
           the draw completes; loops ~2.4s). scale + non-scaling stroke keeps the
           ring thin as it expands. */
        .fthb-pulse { animation: fthbPulse 2.4s ease-out infinite; }
        @keyframes fthbPulse { from { transform: scale(1); opacity: 0.85; } to { transform: scale(4.4); opacity: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .fthb-callouts { transition: none !important; }
          .fthb-pulse { display: none; animation: none; }
          .fthb-area .recharts-area-area { animation: none; }
        }
      `}</style>

      {!staticCharts && (
        <ChartDrawControls
          label={label}
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

      <div className="fthb-plot" aria-hidden="true" ref={plotRef} data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1981, 2025]}
              ticks={[1981, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[18, 44]}
              ticks={[18, 22, 26, 30, 34, 38, 42]}
              allowDataOverflow
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            {/* The 1981 to 2020 range. Whisper-subtle wash; the label sits BELOW
                the band, in the open space under age 28, clear of the line.
                Explicit x1/x2 span the full domain. Without them Recharts renders
                the band's label but not its fill rect. */}
            <ReferenceArea
              x1={1981}
              x2={2025}
              y1={BAND_LOW}
              y2={BAND_HIGH}
              fill={withAlpha(CHART_COLORS.line, 0.035)}
              stroke="none"
              ifOverflow="hidden"
              label={({ viewBox }) => (
                <text x={viewBox.x + 6} y={viewBox.y + viewBox.height + 56} fill={faint} fontSize={11} fontFamily={F.body}>{`the 1981 to 2020 range: ${BAND_LOW} to ${BAND_HIGH}`}</text>
              )}
            />
            {/* The heat gradients, defined once for the stroke and the fill. */}
            <Customized component={HeatDefs} />
            {shown === "done" && <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
            {/* Glow fill: same monotone shape as the line, closed to the y=18
                baseline, rendered behind the line. Its CSS-driven rise is keyed
                off the plot's data-phase (see the style block). */}
            <Area
              className="fthb-area"
              type="monotone"
              dataKey="age"
              baseValue={18}
              stroke="none"
              fill="url(#fthbAgeFill)"
              isAnimationActive={false}
              activeDot={false}
            />
            <Line
              className="fthb-line"
              type="monotone"
              dataKey="age"
              stroke="url(#fthbAgeStroke)"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{ r: 5, fill: FTHB_HEAT.red, stroke: P.navyDark, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {/* Both callouts as one owned SVG layer (see Callouts above). */}
            <Customized component={Callouts} />
            {!staticCharts && <Customized component={Tracer} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full survey series. */}
      <div className="fthb-sr-only">
        <table>
          <caption>Median age of the first-time homebuyer by survey year, from the National Association of Realtors Profile of Home Buyers and Sellers. Survey years only; the survey was not conducted every year in the 1980s and 1990s.</caption>
          <thead>
            <tr>
              <th scope="col">Survey year</th>
              <th scope="col">Median first-time buyer age</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
