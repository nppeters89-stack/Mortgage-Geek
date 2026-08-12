import { useState, useEffect, useRef, useCallback } from "react";
import { ComposedChart, BarChart, Bar, Cell, Area, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine, Customized } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { withAlpha } from "../utils/format";
import { PRICE_TO_INCOME, PAYMENT_BURDEN, FTHB_AGE, DSR_AGGREGATE, DSR_AVG, STUDENT_LOANS_G19, SL_DELINQUENCY } from "../data/geekCharts";
import { drawPath, hidePath, clearDrawState } from "../utils/lineDraw";
import { useStaticCharts, useHasHover } from "../utils/hooks";
import { ChartDrawControls, Tracer, TRACER_CLASS, drawControlsCss } from "./ChartDrawControls";

// Geek Chart #9, "The Other Down Payment": the six data visuals for the part-2
// companion to the Price-to-Income page, on the same dark charcoal canvas as the
// sibling charts. They share the site's redesigned Geek Charts conventions:
// threshold coloring off a series average (red worse / blue better), red gradient
// area fills, endpoint and peak point labels placed clear of the data (never on a
// line or bar body), and an sr-only data table behind every plot.
//
// Animation matches the sibling charts (PaymentBurden, FthbAge, PriceToIncome).
// Every chart renders FULLY DRAWN by default; a control bar re-runs the entrance
// as a two-step click (Replay blanks it, Draw animates it) with a 3s/4s/5s speed
// segment. Line charts self-draw via stroke-dashoffset with a tracer dot riding
// the leading edge (drawPath); their area fills rise from the baseline; bar
// charts grow up from the baseline. Point labels and endpoint callouts fade in
// once the draw completes. The whole sequence is paced off --draw-dur, set from
// the speed control. Only prefers-reduced-motion opts out: it hides the controls
// and shows the finished chart (useStaticCharts). The shared machinery lives in
// useChartDraw below so each chart stays a thin declaration. Colors come from
// CHART_COLORS / P via withAlpha, mapped by visual result; no hardcoded hex. Red
// on this dark surface is the lifted red (CHART_COLORS.accent).
//
// The hero's "What it costs" panel is the one deliberate departure from the
// site's single-axis convention: it carries a DUAL Y AXIS (price-to-income ratio
// on the left, payment burden percent on the right) so the two cost curves share
// one 2020-to-2026 frame. Approved by Nick against this designed backdrop; do not
// normalize it to one axis. Its data is SLICED from the canonical PRICE_TO_INCOME
// and PAYMENT_BURDEN exports (and the age panels from FTHB_AGE), never duplicated.

const RED = CHART_COLORS.accent; // lifted red: the emphasis line/bar color on dark
const BLUE = CHART_COLORS.income; // the second cost line (payment burden) and DSR fill
const CREAM = CHART_COLORS.line;
const tickColor = withAlpha(CHART_COLORS.line, 0.55);
const mutedText = withAlpha(CHART_COLORS.line, 0.6);
const GRAY = withAlpha(CHART_COLORS.line, 0.42); // pause-era line segment / muted swatch
const GRAYBAR = withAlpha(CHART_COLORS.line, 0.3); // the pre-switch baseline bar
const DASH = CHART_COLORS.axis; // dashed reference lines (average, ceiling, norm)

// Pull a scale off a Customized layer's axis map by id (or the first axis when no
// id is passed). Recharts hands every Customized component xAxisMap / yAxisMap.
function scale(map, id) {
  if (!map) return null;
  const key = id != null && map[id] ? id : Object.keys(map)[0];
  return map[key]?.scale;
}

// A point label as an SVG text node, used by the fade-in label layers. Kept off
// the data per the text-overlay rule (callers pass the clearance in dy/dx).
function Txt({ x, y, text, color, anchor = "middle", size = 12 }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={700} fontFamily={F.body} style={{ pointerEvents: "none" }}>
      {text}
    </text>
  );
}

// Category-axis tick that wraps a two-word-plus label onto a second line at its
// last space, so the long "Pause era 2020-2024" tick does not collide with its
// neighbors at 375px. Single-token ticks render on one line.
function WrapTick({ x, y, payload }) {
  const s = String(payload.value);
  const i = s.lastIndexOf(" ");
  const l1 = i > 0 ? s.slice(0, i) : s;
  const l2 = i > 0 ? s.slice(i + 1) : "";
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill={tickColor} fontSize={11} fontFamily={F.body}>
      <tspan x={x}>{l1}</tspan>
      {l2 && <tspan x={x} dy={13}>{l2}</tspan>}
    </text>
  );
}

// Shared vertical fade gradients (object-bounding-box, so they need no scale):
// a red area fill and a blue area fill, each fading to nothing at the baseline.
function FadeDefs() {
  return (
    <defs>
      <linearGradient id="odpRedFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={RED} stopOpacity={0.22} />
        <stop offset="1" stopColor={RED} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="odpBlueFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={BLUE} stopOpacity={0.16} />
        <stop offset="1" stopColor={BLUE} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="odpBarRed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={RED} stopOpacity={1} />
        <stop offset="1" stopColor={RED} stopOpacity={0.6} />
      </linearGradient>
    </defs>
  );
}

// One style block shared by every chart: the draw-control chrome, the legend
// chrome, the sr-only table, and the entrance keyframes. The area fill rises from
// its baseline and bars grow up from theirs, both keyed off the plot's data-phase
// and paced by --draw-dur (from the speed control). Reduced-motion neutralizes
// all of it (the controls are not mounted in that mode anyway).
const chartCss = `
  ${drawControlsCss}
  .odp-anim { width: 100%; }
  .odp-legend { display: flex; flex-wrap: wrap; gap: 10px 18px; margin: 2px 2px 12px; }
  .odp-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 500; color: ${withAlpha(CHART_COLORS.line, 0.72)}; }
  .odp-swatch { display: inline-block; width: 16px; height: 3px; border-radius: 999px; flex-shrink: 0; }
  .odp-swatch--dash { height: 0; border-top: 1px dashed ${withAlpha(CHART_COLORS.line, 0.5)}; border-radius: 0; }
  .odp-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

  /* Area fills rise from the baseline as the line draws. */
  .odp-anim .recharts-area-area { transform-box: fill-box; transform-origin: bottom; }
  .odp-anim[data-phase="armed"] .recharts-area-area { opacity: 0; transform: scaleY(0); }
  .odp-anim[data-phase="drawing"] .recharts-area-area {
    animation: odpFillRise calc(var(--draw-dur, 4000ms) * 0.32) cubic-bezier(.4, 0, .2, 1) calc(var(--draw-dur, 4000ms) * 0.42) both;
  }
  @keyframes odpFillRise { from { opacity: 0; transform: scaleY(0); } to { opacity: 1; transform: scaleY(1); } }

  /* Bars grow up from the baseline over the draw. Target the bar path itself
     (not its wrapping group) so transform-box: fill-box resolves against a real
     shape's bounding box. */
  .odp-anim .recharts-bar-rectangle path { transform-box: fill-box; transform-origin: bottom; }
  .odp-anim[data-phase="armed"] .recharts-bar-rectangle path { transform: scaleY(0); }
  .odp-anim[data-phase="drawing"] .recharts-bar-rectangle path {
    animation: odpBarGrow var(--draw-dur, 4000ms) cubic-bezier(.2, .7, .2, 1) both;
  }
  @keyframes odpBarGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

  @media (prefers-reduced-motion: reduce) {
    .odp-anim .recharts-area-area, .odp-anim .recharts-bar-rectangle path { animation: none !important; transform: none !important; opacity: 1 !important; }
  }
`;

// A screen-reader / no-JS table mirroring a chart's series.
function SrTable({ caption, cols, rows }) {
  return (
    <div className="odp-sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>{cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <th scope="row">{r[0]}</th>
              {r.slice(1).map((v, j) => <td key={j}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Shared entrance-animation controller, matching the sibling charts. Owns the
// phase machine (done -> armed -> drawing -> points -> done), the reveal flag for
// fade-in labels, the 3s/4s/5s speed, and the plot ref. `lineSelectors` are the
// stroke paths (relative to the plot ref) to self-draw; the first one carries the
// tracer. Pass an empty list for bar charts, whose grow is CSS-driven off
// data-phase and which simply time out over the duration. Under reduced motion
// everything renders finished and the caller does not mount the controls.
function useChartDraw(lineSelectors = []) {
  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();
  const [phase, setPhase] = useState("done");
  const [reveal, setReveal] = useState(1);
  const [duration, setDuration] = useState(4000);
  const plotRef = useRef(null);
  const timers = useRef([]);
  const cancels = useRef([]);

  const shown = staticCharts ? "done" : phase;
  const shownReveal = staticCharts ? 1 : reveal;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancels.current.forEach((c) => c?.());
    cancels.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const linesOf = () => lineSelectors.map((s) => plotRef.current?.querySelector(s)).filter(Boolean);

  // Recharts wipes inline dash styles on every render and on resize, so re-apply
  // the right state each render: drawn when settled, blanked while armed. (The
  // area fills and bars are blanked by CSS off data-phase, not here.)
  useEffect(() => {
    if (!lineSelectors.length) return;
    const ls = linesOf();
    if (!ls.length) return;
    if (shown === "done" || shown === "points") ls.forEach(clearDrawState);
    else if (shown === "armed") ls.forEach(hidePath);
  });

  // Run the entrance after the render that sets phase to "drawing" (Recharts
  // rebuilds the SVG each render, so a path styled inside the click handler is
  // detached by paint). Lines self-draw with one shared tracer on the first line;
  // bar charts (no line selectors) just time out while their CSS grow runs.
  useEffect(() => {
    if (phase !== "drawing") return;
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    const finish = () => {
      if (tracer) tracer.setAttribute("opacity", "0");
      setPhase("points");
      timers.current.push(setTimeout(() => setReveal(1), 220));
      timers.current.push(setTimeout(() => setPhase("done"), 950));
    };
    const ls = linesOf();
    if (!ls.length) {
      timers.current.push(setTimeout(finish, duration));
      return;
    }
    if (tracer) tracer.setAttribute("opacity", "1");
    let remaining = ls.length;
    const one = () => { if (--remaining > 0) return; finish(); };
    ls.forEach((path, i) => {
      cancels.current.push(
        drawPath(path, {
          duration,
          onTick: i === 0 ? (_t, pt) => { if (tracer) { tracer.setAttribute("cx", pt.x); tracer.setAttribute("cy", pt.y); } } : undefined,
          onDone: one,
        })
      );
    });
    // Duration is read once per run; speed is locked while drawing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Two-step control. From the drawn state the first click arms it (labels off,
  // line/bars blanked); the second click runs the entrance. Clicks mid-draw are
  // ignored.
  const advance = useCallback(() => {
    if (staticCharts || phase === "drawing") return;
    if (phase === "armed") { setPhase("drawing"); return; }
    clearTimers();
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (tracer) tracer.setAttribute("opacity", "0");
    setReveal(0);
    setPhase("armed");
  }, [staticCharts, phase, clearTimers]);

  const onKeyDown = (e) => {
    if (e.key === "r" || e.key === "R") { e.preventDefault(); advance(); }
  };

  const label = phase === "drawing" ? "Drawing…" : phase === "armed" ? "Draw" : "Replay";
  const hint = phase === "armed"
    ? (hasHover ? "Press Draw to animate the chart." : "Tap Draw to animate the chart.")
    : (hasHover ? "Press Replay, then Draw to run it again. R advances." : "Tap Replay, then Draw to run it again.");

  return { staticCharts, phase, shown, reveal: shownReveal, duration, setDuration, plotRef, advance, onKeyDown, label, hint };
}

// A fade-in wrapper for the point-label / callout layers: absent while the chart
// is blank or drawing, faded in once the reveal flag flips after the draw.
function revealProps(reveal) {
  return { style: { opacity: reveal >= 1 ? 1 : 0, transition: "opacity .45s ease", pointerEvents: "none" } };
}

// ── Hero: two panels, cost lines vs buyer age, 2020 to 2026 ──────────────────
// Panel A ("What it costs") is the dual-axis exception: price-to-income (red,
// left axis, red fill) against payment burden (blue, right axis, no fill), both
// sliced from the canonical exports. Panel B ("Who buys") is the first-time buyer
// age sliced from FTHB_AGE, red with a fill, with the dashed 33 old-ceiling line.
// One control draws all three strokes together; the tracer rides the panel-A
// price line (the income line and the age line draw alongside, matching the
// Price-to-Income hero).
const H_START = 2020;
const pStart = PRICE_TO_INCOME.years.indexOf(H_START);
const bStart = PAYMENT_BURDEN.years.indexOf(H_START);
const heroYears = PRICE_TO_INCOME.years.slice(pStart); // 2020 to 2026
const heroData = heroYears.map((year, i) => ({
  year: String(year),
  pti: PRICE_TO_INCOME.ratio[pStart + i],
  pb: PAYMENT_BURDEN.ratio[bStart + i],
}));

const aStart = FTHB_AGE.surveyYears.indexOf(2020);
const ageYears = FTHB_AGE.surveyYears.slice(aStart); // 2020 to 2025
const ageData = ageYears.map((year, i) => ({ year: String(year), age: FTHB_AGE.surveyAges[aStart + i] }));

const HERO_LINES = [".odp-hp-a .recharts-area-curve", ".odp-hp-a .recharts-line-curve", ".odp-hp-b .recharts-area-curve"];

export function CostsHero() {
  const { staticCharts, shown, reveal, duration, setDuration, plotRef, advance, onKeyDown, label, hint, phase } = useChartDraw(HERO_LINES);

  const PanelALabels = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const x = scale(props.xAxisMap);
    const yr = scale(props.yAxisMap, "r");
    const yp = scale(props.yAxisMap, "p");
    if (!x || !yr || !yp) return null;
    return (
      <g {...revealProps(reveal)}>
        <Txt x={x("2022")} y={yr(4.67) - 12} text="4.67x peak" color={RED} />
        <Txt x={x("2026") + 4} y={yr(3.81) + 22} text="3.81x" color={RED} anchor="end" />
        <Txt x={x("2023")} y={yp(26.5) - 12} text="26.5% peak" color={BLUE} />
        <Txt x={x("2026") + 4} y={yp(23.0) - 12} text="23.0%" color={BLUE} anchor="end" />
      </g>
    );
  };

  const PanelBLabels = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const x = scale(props.xAxisMap);
    const y = scale(props.yAxisMap);
    if (!x || !y) return null;
    return (
      <g {...revealProps(reveal)}>
        <Txt x={x("2025") + 4} y={y(40) - 12} text={"40 · record"} color={RED} anchor="end" />
        <Txt x={x("2025") + 2} y={y(33) + 16} text={"33 · the old ceiling"} color={mutedText} anchor="end" size={11.5} />
      </g>
    );
  };

  return (
    <div className="odp-hero">
      <style>{`
        ${chartCss}
        .odp-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .odp-hero-panel { background: ${P.navy}; border-radius: 14px; padding: 18px 18px 12px; }
        .odp-hero-h3 { font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; color: ${CREAM}; margin: 0 0 10px; }
        .odp-hero-plot { width: 100%; height: 230px; }
        .odp-hero-verdict { font-size: 15px; margin: 8px 2px 4px; }
        .odp-src { font-size: 12px; color: ${withAlpha(CHART_COLORS.line, 0.5)}; margin: 8px 2px 0; line-height: 1.5; }
        @media (max-width: 640px) {
          .odp-hero-grid { grid-template-columns: 1fr; }
          .odp-hero-plot { height: 220px; }
        }
      `}</style>

      {!staticCharts && (
        <ChartDrawControls label={label} onClick={advance} disabled={phase === "drawing"} duration={duration} onDuration={setDuration} speedDisabled={phase === "drawing"} onKeyDown={onKeyDown} hint={hint} />
      )}

      <div className="odp-anim odp-hero-grid" ref={plotRef} data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        {/* Panel A: the two cost curves on a dual axis (the approved exception). */}
        <div className="odp-hero-panel odp-hp-a">
          <h3 className="odp-hero-h3">What it costs</h3>
          <div className="odp-legend">
            <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />Price to income</span>
            <span className="odp-legend-item"><span className="odp-swatch" style={{ background: BLUE }} />Payment burden</span>
          </div>
          <div className="odp-hero-plot" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={heroData} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
                <Customized component={FadeDefs} />
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
                <YAxis yAxisId="r" domain={[3.6, 4.9]} tick={{ fill: RED, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(1)}x`} width={40} />
                <YAxis yAxisId="p" orientation="right" domain={[14, 28]} tick={{ fill: BLUE, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
                <Area yAxisId="r" type="monotone" dataKey="pti" baseValue={3.6} stroke={RED} strokeWidth={2.5} strokeLinecap="round" fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
                <Line yAxisId="p" type="monotone" dataKey="pb" stroke={BLUE} strokeWidth={2.5} strokeLinecap="round" dot={false} isAnimationActive={false} activeDot={false} />
                <Customized component={PanelALabels} />
                {!staticCharts && <Customized component={() => <Tracer fill={RED} />} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="odp-hero-verdict"><strong>Peaked.</strong> <span style={{ color: BLUE }}>Easing since.</span></div>
        </div>

        {/* Panel B: first-time buyer age with the dashed old ceiling. */}
        <div className="odp-hero-panel odp-hp-b">
          <h3 className="odp-hero-h3">Who buys</h3>
          <div className="odp-legend">
            <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />First-time buyer age</span>
            <span className="odp-legend-item"><span className="odp-swatch odp-swatch--dash" />33 &middot; the old ceiling</span>
          </div>
          <div className="odp-hero-plot" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ageData} margin={{ top: 22, right: 12, left: 0, bottom: 4 }}>
                <Customized component={FadeDefs} />
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
                <YAxis domain={[31, 41]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <ReferenceLine y={33} stroke={DASH} strokeDasharray="6 5" />
                <Area type="monotone" dataKey="age" baseValue={31} stroke={RED} strokeWidth={2.5} strokeLinecap="round" fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
                <Customized component={PanelBLabels} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="odp-hero-verdict" style={{ color: RED }}><strong>Still climbing.</strong></div>
        </div>
      </div>
      <div className="odp-src">Price-to-income and payment burden: canonical Geek Charts series (Census/HUD, Freddie Mac PMMS). Buyer age: NAR Profile of Home Buyers and Sellers.</div>

      <SrTable
        caption="What it costs and who buys, 2020 to 2026: price-to-income ratio and payment burden percent, and the median first-time buyer age."
        cols={["Year", "Price to income", "Payment burden", "First-time buyer age"]}
        rows={heroYears.map((y, i) => [
          String(y),
          `${heroData[i].pti.toFixed(2)}x`,
          `${heroData[i].pb.toFixed(1)}%`,
          i < ageData.length ? ageData[i].age : "",
        ])}
      />
    </div>
  );
}

// ── Chart 1: aggregate household debt service ratio, 2005 to 2026 ────────────
// Threshold-colored line off the 12.44% series average (red above / blue below,
// a hard break exactly on the average), blue gradient fill, dashed average line,
// endpoint label "11.16%". Quarterly, index-based x with year ticks every 3 yrs.
const dsr = DSR_AGGREGATE.ratio;
const dsrData = dsr.map((v, i) => ({ i, v, q: DSR_AGGREGATE.quarters[i] }));
const dsrTicks = [];
DSR_AGGREGATE.quarters.forEach((qq, i) => { if (qq.q === 1 && qq.y % 3 === 0) dsrTicks.push(i); });

function DsrDefs(props) {
  const y = scale(props.yAxisMap);
  if (!y) return null;
  const [plotBottom, plotTop] = y.range();
  const avgOffset = (y(DSR_AVG) - plotTop) / (plotBottom - plotTop);
  const lo = avgOffset - 0.001;
  const hi = avgOffset + 0.001;
  // Vertical userSpaceOnUse gradient: red above the average, blue below, with the
  // break injected at avgOffset +/- 0.001 so it lands on 12.44% at any height.
  return (
    <defs>
      <linearGradient id="odpDsrStroke" gradientUnits="userSpaceOnUse" x1="0" y1={plotTop} x2="0" y2={plotBottom}>
        <stop offset={0} stopColor={RED} />
        <stop offset={lo} stopColor={RED} />
        <stop offset={hi} stopColor={BLUE} />
        <stop offset={1} stopColor={BLUE} />
      </linearGradient>
      <linearGradient id="odpDsrFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={BLUE} stopOpacity={0.16} />
        <stop offset="1" stopColor={BLUE} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export function DsrChart() {
  const { staticCharts, shown, reveal, duration, setDuration, plotRef, advance, onKeyDown, label, hint, phase } = useChartDraw([".recharts-line-curve"]);

  const EndLabel = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const x = scale(props.xAxisMap);
    const y = scale(props.yAxisMap);
    if (!x || !y) return null;
    const last = dsr.length - 1;
    return <g {...revealProps(reveal)}><Txt x={x(last) + 4} y={y(dsr[last]) - 12} text="11.16%" color={BLUE} anchor="end" /></g>;
  };

  return (
    <div className="odp-chart">
      <style>{`${chartCss} .odp-dsr-plot { width: 100%; height: 250px; } @media (max-width: 640px) { .odp-dsr-plot { height: 230px; } }`}</style>
      {!staticCharts && (
        <ChartDrawControls label={label} onClick={advance} disabled={phase === "drawing"} duration={duration} onDuration={setDuration} speedDisabled={phase === "drawing"} onKeyDown={onKeyDown} hint={hint} />
      )}
      <div className="odp-legend">
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />Worse than average</span>
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: BLUE }} />Better than average</span>
        <span className="odp-legend-item"><span className="odp-swatch odp-swatch--dash" />Series average 12.44%</span>
      </div>
      <div className="odp-anim odp-dsr-plot" aria-hidden="true" ref={plotRef} data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dsrData} margin={{ top: 16, right: 10, left: 0, bottom: 4 }}>
            <Customized component={DsrDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="i" type="number" domain={[0, dsr.length - 1]} ticks={dsrTicks} tickFormatter={(i) => String(DSR_AGGREGATE.quarters[i].y)} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[8, 17]} ticks={[8, 10, 12, 14, 16]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
            <ReferenceLine y={DSR_AVG} stroke={DASH} strokeDasharray="5 5" />
            <Area type="monotone" dataKey="v" baseValue={8} stroke="none" fill="url(#odpDsrFill)" dot={false} isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="v" stroke="url(#odpDsrStroke)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" dot={false} isAnimationActive={false} activeDot={false} />
            <Customized component={EndLabel} />
            {!staticCharts && <Customized component={() => <Tracer fill={RED} />} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption="Household debt service ratio, percent of disposable income, quarterly, 2005 Q1 to 2026 Q1, against the 12.44 percent series average."
        cols={["Quarter", "Debt service ratio"]}
        rows={dsrData.map((d) => [`${d.q.y} Q${d.q.q}`, `${d.v.toFixed(2)}%`])}
      />
    </div>
  );
}

// ── Chart 2: total student loans outstanding, 2006 to 2024 ───────────────────
// Red mountain with a red gradient fill; the stroke turns gray from the payment
// pause onward (index 57, 2020 Q2) via a horizontal userSpaceOnUse gradient with
// a hard break at that x. Endpoint label "$1.78T".
const sl = STUDENT_LOANS_G19.billions;
const slData = sl.map((v, i) => ({ i, v, q: STUDENT_LOANS_G19.quarters[i] }));
const slPause = STUDENT_LOANS_G19.pauseStartIndex;
const slTicks = [];
STUDENT_LOANS_G19.quarters.forEach((qq, i) => { if (qq.q === 1 && qq.y % 3 === 0) slTicks.push(i); });

function MountainDefs(props) {
  const x = scale(props.xAxisMap);
  if (!x) return null;
  const [left, right] = x.range();
  const pauseOff = (x(slPause) - left) / (right - left);
  const lo = Math.max(0, pauseOff - 0.001);
  const hi = Math.min(1, pauseOff + 0.001);
  // Horizontal userSpaceOnUse gradient: red through the pre-pause stretch, gray
  // from the pause onward, break at the pause-start x.
  return (
    <defs>
      <linearGradient id="odpSlStroke" gradientUnits="userSpaceOnUse" x1={left} y1="0" x2={right} y2="0">
        <stop offset={0} stopColor={RED} />
        <stop offset={lo} stopColor={RED} />
        <stop offset={hi} stopColor={GRAY} />
        <stop offset={1} stopColor={GRAY} />
      </linearGradient>
    </defs>
  );
}

export function StudentLoanMountain() {
  const { staticCharts, shown, reveal, duration, setDuration, plotRef, advance, onKeyDown, label, hint, phase } = useChartDraw([".recharts-line-curve"]);

  const EndLabel = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const x = scale(props.xAxisMap);
    const y = scale(props.yAxisMap);
    if (!x || !y) return null;
    const last = sl.length - 1;
    return <g {...revealProps(reveal)}><Txt x={x(last) + 4} y={y(sl[last]) - 12} text="$1.78T" color={CREAM} anchor="end" /></g>;
  };

  return (
    <div className="odp-chart">
      <style>{`${chartCss} .odp-mtn-plot { width: 100%; height: 280px; } @media (max-width: 640px) { .odp-mtn-plot { height: 250px; } }`}</style>
      {!staticCharts && (
        <ChartDrawControls label={label} onClick={advance} disabled={phase === "drawing"} duration={duration} onDuration={setDuration} speedDisabled={phase === "drawing"} onKeyDown={onKeyDown} hint={hint} />
      )}
      <div className="odp-legend">
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />Student loans owned and securitized</span>
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: GRAY }} />Gray segment: payment pause era</span>
      </div>
      <div className="odp-anim odp-mtn-plot" aria-hidden="true" ref={plotRef} data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={slData} margin={{ top: 20, right: 10, left: 0, bottom: 4 }}>
            <Customized component={FadeDefs} />
            <Customized component={MountainDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="i" type="number" domain={[0, sl.length - 1]} ticks={slTicks} tickFormatter={(i) => String(STUDENT_LOANS_G19.quarters[i].y)} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[0, 2000]} ticks={[0, 500, 1000, 1500, 2000]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}T`} width={44} />
            <Area type="monotone" dataKey="v" baseValue={0} stroke="none" fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="v" stroke="url(#odpSlStroke)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" dot={false} isAnimationActive={false} activeDot={false} />
            <Customized component={EndLabel} />
            {!staticCharts && <Customized component={() => <Tracer fill={RED} />} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption="Total student loans outstanding, billions of dollars, quarterly, 2006 Q1 to 2024 Q4; the gray segment marks the payment pause era from 2020 Q2."
        cols={["Quarter", "Student loans outstanding"]}
        rows={slData.map((d) => [`${d.q.y} Q${d.q.q}`, `$${d.v.toLocaleString("en-US", { maximumFractionDigits: 0 })} billion`])}
      />
    </div>
  );
}

// ── Chart 3: new flow into serious delinquency (the switch) ──────────────────
// Three bars: the pre-switch quarter in gray, the two 2025 quarters in the red
// gradient, value labels above each bar (fading in once the bars finish growing).
const flow = SL_DELINQUENCY.flow;

export function FlowBars() {
  const { staticCharts, shown, reveal, duration, setDuration, plotRef, advance, onKeyDown, label, hint, phase } = useChartDraw();

  const Labels = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const x = scale(props.xAxisMap);
    const y = scale(props.yAxisMap);
    if (!x || !y || !x.bandwidth) return null;
    const bw = x.bandwidth();
    return (
      <g {...revealProps(reveal)}>
        {flow.map((d, i) => (
          <text key={i} x={x(d.label) + bw / 2} y={y(d.value) - 10} textAnchor="middle" fill={i === 0 ? mutedText : RED} fontSize={12} fontWeight={700} fontFamily={F.body}>{d.value.toFixed(2)}%</text>
        ))}
      </g>
    );
  };

  return (
    <div className="odp-chart">
      <style>{`${chartCss} .odp-flow-plot { width: 100%; height: 210px; }`}</style>
      {!staticCharts && (
        <ChartDrawControls label={label} onClick={advance} disabled={phase === "drawing"} duration={duration} onDuration={setDuration} speedDisabled={phase === "drawing"} onKeyDown={onKeyDown} hint={hint} />
      )}
      <div className="odp-anim odp-flow-plot" aria-hidden="true" ref={plotRef} data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={flow} margin={{ top: 24, right: 8, left: 0, bottom: 4 }}>
            <Customized component={FadeDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: tickColor, fontSize: 12 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[0, 15]} ticks={[0, 5, 10, 15]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={110} isAnimationActive={false}>
              {flow.map((_, i) => <Cell key={i} fill={i === 0 ? GRAYBAR : "url(#odpBarRed)"} />)}
            </Bar>
            <Customized component={Labels} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption="New flow of student loan balances into serious delinquency (90 or more days), percent of balances, by quarter."
        cols={["Quarter", "Flow into 90+ delinquency"]}
        rows={flow.map((d) => [d.label, `${d.value.toFixed(2)}%`])}
      />
    </div>
  );
}

// ── Chart 4: student loan 90+ delinquency stock, with the age companion ──────
// Six bars (the pause-era baseline in gray, the 2025-2026 quarters in the red
// gradient), a dashed pre-pandemic norm line at 10 percent, and a "10.3%" label
// over the final bar.
const stock = SL_DELINQUENCY.stock;
const NORM = SL_DELINQUENCY.prePandemicNorm;

export function StockBars() {
  const { staticCharts, shown, reveal, duration, setDuration, plotRef, advance, onKeyDown, label, hint, phase } = useChartDraw();

  const Labels = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const x = scale(props.xAxisMap);
    const y = scale(props.yAxisMap);
    if (!x || !y || !x.bandwidth) return null;
    const bw = x.bandwidth();
    const last = stock[stock.length - 1];
    return <g {...revealProps(reveal)}><text x={x(last.label) + bw / 2} y={y(last.value) - 10} textAnchor="middle" fill={RED} fontSize={12} fontWeight={700} fontFamily={F.body}>10.3%</text></g>;
  };

  return (
    <div className="odp-chart">
      <style>{`${chartCss} .odp-stock-plot { width: 100%; height: 220px; }`}</style>
      {!staticCharts && (
        <ChartDrawControls label={label} onClick={advance} disabled={phase === "drawing"} duration={duration} onDuration={setDuration} speedDisabled={phase === "drawing"} onKeyDown={onKeyDown} hint={hint} />
      )}
      <div className="odp-legend">
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />Delinquency rate</span>
        <span className="odp-legend-item"><span className="odp-swatch odp-swatch--dash" />Pre-pandemic norm (routinely above 10%)</span>
      </div>
      <div className="odp-anim odp-stock-plot" aria-hidden="true" ref={plotRef} data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stock} margin={{ top: 22, right: 8, left: 0, bottom: 10 }}>
            <Customized component={FadeDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" interval={0} tick={<WrapTick />} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} height={44} />
            <YAxis domain={[0, 12.5]} ticks={[0, 5, 10]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
            <ReferenceLine y={NORM} stroke={DASH} strokeDasharray="6 5" />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={90} isAnimationActive={false}>
              {stock.map((d, i) => <Cell key={i} fill={d.pause ? GRAYBAR : "url(#odpBarRed)"} />)}
            </Bar>
            <Customized component={Labels} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption="Student loans, percent of balances 90 or more days delinquent, by quarter, against the pre-pandemic norm of about 10 percent."
        cols={["Quarter", "90+ delinquency rate"]}
        rows={stock.map((d) => [d.label, `${d.value.toFixed(2)}%`])}
      />
    </div>
  );
}

// Age companion (chart 4b): the median first-time buyer age over the same window,
// 2021 to 2025, red with a fill and the "40 · record" endpoint label.
const acStart = FTHB_AGE.surveyYears.indexOf(2021);
const acYears = FTHB_AGE.surveyYears.slice(acStart);
const acData = acYears.map((year, i) => ({ year: String(year), age: FTHB_AGE.surveyAges[acStart + i] }));

export function AgeCompanion() {
  const { staticCharts, shown, reveal, duration, setDuration, plotRef, advance, onKeyDown, label, hint, phase } = useChartDraw([".recharts-area-curve"]);

  const EndLabel = (props) => {
    if (shown !== "done" && shown !== "points") return null;
    const x = scale(props.xAxisMap);
    const y = scale(props.yAxisMap);
    if (!x || !y) return null;
    return <g {...revealProps(reveal)}><Txt x={x("2025") + 4} y={y(40) - 12} text={"40 · record"} color={RED} anchor="end" /></g>;
  };

  return (
    <div className="odp-chart">
      <style>{`${chartCss} .odp-age-plot { width: 100%; height: 170px; }`}</style>
      {!staticCharts && (
        <ChartDrawControls label={label} onClick={advance} disabled={phase === "drawing"} duration={duration} onDuration={setDuration} speedDisabled={phase === "drawing"} onKeyDown={onKeyDown} hint={hint} />
      )}
      <div className="odp-anim odp-age-plot" aria-hidden="true" ref={plotRef} data-phase={shown} style={{ "--draw-dur": `${duration}ms` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={acData} margin={{ top: 20, right: 12, left: 0, bottom: 4 }}>
            <Customized component={FadeDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[30, 42]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
            <Area type="monotone" dataKey="age" baseValue={30} stroke={RED} strokeWidth={2.5} strokeLinecap="round" fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
            <Customized component={EndLabel} />
            {!staticCharts && <Customized component={() => <Tracer fill={RED} />} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption="Median first-time homebuyer age, 2021 to 2025, ending at a record 40."
        cols={["Year", "Median first-time buyer age"]}
        rows={acData.map((d) => [d.year, d.age])}
      />
    </div>
  );
}
