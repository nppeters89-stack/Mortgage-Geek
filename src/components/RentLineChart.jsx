import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot, Customized } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { withAlpha } from "../utils/format";
import { RENT_LINE } from "../data/geekCharts";
import { drawPath, clearDrawState, hidePath } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, drawControlsCss } from "./ChartDrawControls";

// The Rent Line: CPI rent of primary residence (red) vs average home price
// (cream), both indexed to 1970 = 100, on a dark charcoal canvas. Rent is the
// point of the chart: it has no down years. Colors from CHART_COLORS / P via
// withAlpha; no hardcoded hex.
//
// The chart renders drawn by default. Replaying takes two clicks: the first
// (Replay) blanks both lines and arms the chart, the second (Draw) draws BOTH
// lines at once (each with its own tracer), then the markers fade in and the
// 2010 gold dot pulses. The "down years" counts that used to sit on the line
// ends are dropped: the stat cards right below the chart already carry them, so
// the line ends are just their current-value dots now. Only
// prefers-reduced-motion hides the controls and shows the finished chart.

const RENT = CHART_COLORS.mortgage;
const HOME = CHART_COLORS.line;
const GOLD = CHART_COLORS.gold;

export function RentLineChart() {
  const { years, rentIdx, homeIdx, rentYoY, homeYoY } = RENT_LINE;
  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();

  // The chart starts drawn (phase "done", markers shown); replaying is a two-
  // step click: done → armed (lines blanked) → drawing → points → done.
  const [phase, setPhase] = useState("done");
  const [reveal, setReveal] = useState(1);
  const [duration, setDuration] = useState(4000);

  const plotRef = useRef(null);
  const timers = useRef([]);
  const cancels = useRef([]);

  const shown = staticCharts ? "done" : phase;
  const shownReveal = staticCharts ? 1 : reveal;

  const data = useMemo(
    () => years.map((year, i) => ({ year, rentIdx: rentIdx[i], homeIdx: homeIdx[i], rentYoY: rentYoY[i], homeYoY: homeYoY[i] })),
    [years, rentIdx, homeIdx, rentYoY, homeYoY]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const isNull = (v) => v === null || v === undefined;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancels.current.forEach((c) => c?.());
    cancels.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const homePath = () => plotRef.current?.querySelector(".rl-home .recharts-line-curve");
  const rentPath = () => plotRef.current?.querySelector(".rl-rent .recharts-line-curve");

  // Recharts wipes inline dash styles on every render and on resize. Keep both
  // lines in the right state: visible when settled, blanked while armed (they
  // only self-hide mid-draw).
  useEffect(() => {
    const home = homePath();
    const rent = rentPath();
    if (!home || !rent) return;
    if (shown === "done" || shown === "points") {
      clearDrawState(home);
      clearDrawState(rent);
    } else if (shown === "armed") {
      hidePath(home);
      hidePath(rent);
    }
  });

  // Draw both lines at once, each with its own tracer. The marker cascade waits
  // for both to finish (they share a duration, so within a frame of each other).
  useEffect(() => {
    if (phase !== "drawing") return;
    const home = homePath();
    const rent = rentPath();
    if (!home || !rent) {
      setPhase("points");
      return;
    }
    const homeTracer = plotRef.current?.querySelector(".rl-tracer-home");
    const rentTracer = plotRef.current?.querySelector(".rl-tracer-rent");
    if (homeTracer) homeTracer.setAttribute("opacity", "1");
    if (rentTracer) rentTracer.setAttribute("opacity", "1");

    let done = 0;
    const finish = () => {
      if (++done < 2) return;
      if (homeTracer) homeTracer.setAttribute("opacity", "0");
      if (rentTracer) rentTracer.setAttribute("opacity", "0");
      setPhase("points");
      timers.current.push(setTimeout(() => setReveal(1), 200));
      timers.current.push(setTimeout(() => setPhase("done"), 900));
    };

    cancels.current.push(
      drawPath(home, {
        duration,
        onTick: (_t, pt) => { if (homeTracer) { homeTracer.setAttribute("cx", pt.x); homeTracer.setAttribute("cy", pt.y); } },
        onDone: finish,
      })
    );
    cancels.current.push(
      drawPath(rent, {
        duration,
        onTick: (_t, pt) => { if (rentTracer) { rentTracer.setAttribute("cx", pt.x); rentTracer.setAttribute("cy", pt.y); } },
        onDone: finish,
      })
    );
    // Duration is read once per run; speed is locked while drawing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // The control is a two-step toggle. From the drawn state, the first click
  // arms it: hide the markers and blank both lines. The second click starts the
  // draw. A click mid-draw is ignored.
  const advance = useCallback(() => {
    if (staticCharts || phase === "drawing") return;
    if (phase === "armed") {
      setPhase("drawing");
      return;
    }
    // phase "done": arm it.
    clearTimers();
    [".rl-tracer-home", ".rl-tracer-rent"].forEach((c) => {
      const t = plotRef.current?.querySelector(c);
      if (t) t.setAttribute("opacity", "0");
    });
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
    const row = (label, idx, yoy, color) => (
      <p key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
        {label}: {Math.round(idx)}
        {!isNull(yoy) && (
          <span style={{ color: yoy < 0 ? CHART_COLORS.gold : CHART_COLORS.mortgage, fontWeight: 600 }}>
            ({yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}% YoY)
          </span>
        )}
      </p>
    );
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 210 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}{d.year === 2026 ? " (partial year)" : ""}</p>
        {row("rent", d.rentIdx, d.rentYoY, CHART_COLORS.mortgage)}
        {row("home", d.homeIdx, d.homeYoY, CHART_COLORS.line)}
      </div>
    );
  };

  // Pulse on the 2010 gold dot (rent's worst year, still positive), drawn through
  // Recharts' scales so it tracks the point on resize. Only once settled.
  const RentPulse = (props) => {
    const { xAxisMap, yAxisMap } = props;
    if (shown !== "done" || shownReveal < 1) return null;
    const xScale = xAxisMap?.[Object.keys(xAxisMap)[0]]?.scale;
    const yScale = yAxisMap?.[Object.keys(yAxisMap)[0]]?.scale;
    if (!xScale || !yScale) return null;
    return (
      <circle className="rl-pulse" cx={xScale(2010)} cy={yScale(536.3)} fill="none" stroke={GOLD} strokeWidth={2} style={{ pointerEvents: "none" }} />
    );
  };

  const HomeTracer = () => <circle className="rl-tracer-home" r={6} fill={HOME} stroke={P.navyDark} strokeWidth={2} opacity={0} style={{ pointerEvents: "none" }} />;
  const RentTracer = () => <circle className="rl-tracer-rent" r={6.5} fill={RENT} stroke={P.navyDark} strokeWidth={2} opacity={0} style={{ pointerEvents: "none" }} />;

  const replayLabel =
    phase === "drawing" ? "Drawing…" : phase === "armed" ? "Draw" : "Replay";

  return (
    <div className="rl-chart">
      <style>{`
        ${drawControlsCss}
        .rl-chart { width: 100%; }
        .rl-legend { display: flex; flex-wrap: wrap; gap: 16px 20px; margin-bottom: 16px; }
        .rl-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
        .rl-swatch { display: inline-block; width: 18px; height: 3px; border-radius: 999px; flex-shrink: 0; }
        .rl-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .rl-plot { height: 340px; } }
        .rl-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

        .rl-mk { opacity: 0; transition: opacity .45s ease; }
        .rl-plot[data-reveal="1"] .rl-mk { opacity: 1; }

        .rl-pulse { animation: rlPulse 1.8s ease-out infinite; }
        @keyframes rlPulse { 0% { r: 6px; opacity: .85; } 100% { r: 24px; opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .rl-mk { transition: none; }
          .rl-pulse { display: none; }
        }
      `}</style>

      <div className="rl-legend">
        <span className="rl-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.75) }}>
          <span className="rl-swatch" style={{ background: RENT, height: 4 }} />Rent
        </span>
        <span className="rl-legend-item" style={{ color: withAlpha(CHART_COLORS.line, 0.75) }}>
          <span className="rl-swatch" style={{ background: HOME, height: 3 }} />Home price
        </span>
      </div>

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
              ? (hasHover ? "Press Draw to draw both lines." : "Tap Draw to draw both lines.")
              : (hasHover ? "Press Replay, then Draw to redraw both lines. R advances." : "Tap Replay, then Draw to redraw both lines.")
          }
        />
      )}

      <div className="rl-plot" data-reveal={shownReveal} aria-hidden="true" ref={plotRef}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 4 }}>
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
              domain={[0, 2000]}
              ticks={[0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toLocaleString()}
              width={52}
            />
            {shown === "done" && <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
            <Line className="rl-home" type="monotone" dataKey="homeIdx" stroke={HOME} strokeWidth={2.5} strokeOpacity={0.85} dot={false} isAnimationActive={false} />
            <Line className="rl-rent" type="monotone" dataKey="rentIdx" stroke={RENT} strokeWidth={3.25} dot={false} isAnimationActive={false} />
            {/* 2010: rent's worst year, still positive. Gold dot with a pulse. */}
            <ReferenceDot className="rl-mk rl-mk-gold" x={2010} y={536.3} r={5} fill={GOLD} stroke={P.navyDark} strokeWidth={2} isFront />
            {/* Current-value dots at the line ends (labels dropped; the stat cards below carry the counts). */}
            <ReferenceDot className="rl-mk" x={2026} y={954.0} r={5} fill={RENT} stroke={P.navyDark} strokeWidth={2} isFront />
            <ReferenceDot className="rl-mk" x={2026} y={1931.0} r={5} fill={HOME} stroke={P.navyDark} strokeWidth={2} isFront />
            <Customized component={RentPulse} />
            {!staticCharts && <Customized component={HomeTracer} />}
            {!staticCharts && <Customized component={RentTracer} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="rl-sr-only">
        <table>
          <caption>Rent (CPI rent of primary residence) and average home price by year, each indexed to 1970 = 100, with each series' year-over-year percent change. Rent has no down years; home prices declined in eight years.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Rent index</th>
              <th scope="col">Home index</th>
              <th scope="col">Rent YoY</th>
              <th scope="col">Home YoY</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.rentIdx}</td>
                <td>{d.homeIdx}</td>
                <td>{isNull(d.rentYoY) ? "n/a" : `${d.rentYoY.toFixed(1)}%`}</td>
                <td>{isNull(d.homeYoY) ? "n/a" : `${d.homeYoY.toFixed(1)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
