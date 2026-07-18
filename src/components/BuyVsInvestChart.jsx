import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot, ReferenceLine, Customized } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { simulateBuyVsInvest, interestSavedAt, roundDefaultRate, BASE_CASE } from "./buyVsInvestSim";
import { drawPath, hidePath, clearDrawState } from "../utils/lineDraw";
import { useStaticCharts, useHasHover, useIsMobile } from "../utils/hooks";
import { ChartDrawControls, Tracer, TRACER_CLASS, drawControlsCss } from "./ChartDrawControls";
import { BuyVsInvestBreakdown, breakdownCss } from "./BuyVsInvestBreakdown";

// Homes Priced in the S&P 500, part 2: now an interactive projection tool. The
// buyer's equity, net profit, loan balance, and reinvest side fund are computed
// by a 360-month simulation (buyVsInvestSim.js) that reacts to an adjustable
// rate, an early-payoff strategy, and a reinvest toggle. This is the scoped
// runtime-math exception; homeVal and spPath stay canonical. Colors from tokens;
// no hardcoded hex. Labels sit in the right
// gutter and the top margin per the text-overlay rule (no boxes). The sr-only
// table stays the static base-case scenario for crawlers.
//
// The four lines draw themselves on click as a narration aid. Steps 1-3 draw
// the S&P path, home equity, and the monthly-baseline net profit. Step 4 flips
// the strategy to bi-weekly with reinvest ON and redraws net profit in green,
// which is the whole point of the chart: same $25K, different outcome. The
// manual controls stay locked until the sequence finishes so the author cannot
// desync the narration. Touch devices get the sequence too; only
// prefers-reduced-motion skips it.

const CREAM = CHART_COLORS.line;
const MUT = withAlpha(CHART_COLORS.line, 0.55);
const DIM = withAlpha(CHART_COLORS.line, 0.4);
const BORDER = withAlpha(CHART_COLORS.line, 0.14);
const INSET = withAlpha(CHART_COLORS.line, 0.04);
const GREEN = CHART_COLORS.reinvest;
const GOLD = CHART_COLORS.gold;
const BLUE = CHART_COLORS.sp500;
const REDLINE = CHART_COLORS.mortgage;

// $X.XXM / $XXXK for gutter endpoint labels.
const compact = (v, short = false) => {
  const a = Math.abs(v);
  const s = a >= 1e6 ? `$${(a / 1e6).toFixed(short ? 1 : 2)}M` : a >= 1e3 ? `$${Math.round(a / 1e3)}K` : `$${Math.round(a)}`;
  return v < 0 ? `-${s}` : s;
};
// Y-axis tick: whole millions as $1M, half-millions as $0.5M, zero as $0.
const mFmt = (v) => (v === 0 ? "$0" : `$${(v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`);
// "11 yrs 3 mo" from a month count.
const moLabel = (months) => {
  if (months == null) return "n/a";
  const y = Math.floor(months / 12), mo = months % 12;
  return mo ? `${y} yrs ${mo} mo` : `${y} yrs`;
};

const STRATEGIES = [
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Annual" },
  { key: "biweekly", label: "Bi-weekly" },
];

const css = `
  ${drawControlsCss}
  ${breakdownCss}
  .bvi { width: 100%; --green: ${GREEN}; }
  .bvi-controls { display: grid; gap: 14px; margin-bottom: 18px; }
  .bvi-rate { background: ${INSET}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 14px 16px; }
  .bvi-rate-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
  .bvi-rate-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${MUT}; }
  .bvi-rate-val { font-family: ${F.display}; font-size: 22px; color: ${CREAM}; }
  .bvi-rate input[type=range] { width: 100%; accent-color: ${BLUE}; height: 22px; cursor: pointer; }
  .bvi-rate-scale { display: flex; justify-content: space-between; font-size: 10px; color: ${DIM}; margin-top: 2px; }
  .bvi-row { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: flex-end; }
  .bvi-field { display: flex; flex-direction: column; gap: 7px; }
  .bvi-flabel { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${MUT}; }
  .bvi-tabs { display: inline-flex; gap: 6px; }
  .bvi-tab { font-family: ${F.body}; font-size: 13px; font-weight: 700; padding: 9px 16px; border-radius: 999px; cursor: pointer; background: transparent; border: 1px solid ${BORDER}; color: ${MUT}; transition: color .15s, background .15s, border-color .15s; }
  .bvi-tab:hover { color: ${CREAM}; }
  .bvi-tab.is-active { background: ${withAlpha(CHART_COLORS.sp500, 0.16)}; border-color: ${withAlpha(CHART_COLORS.sp500, 0.6)}; color: ${CREAM}; }
  .bvi-amt { position: relative; }
  .bvi-amt-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: ${MUT}; }
  .bvi-amt input { width: 160px; font-family: ${F.body}; font-size: 15px; color: ${CREAM}; background: ${INSET}; border: 1px solid ${BORDER}; border-radius: 9px; padding: 10px 12px 10px 24px; }
  .bvi-amt input:focus { outline: 2px solid ${withAlpha(CHART_COLORS.sp500, 0.6)}; outline-offset: 1px; }
  .bvi-explainer { max-width: 320px; font-size: 12px; line-height: 1.5; color: ${withAlpha(CHART_COLORS.line, 0.7)}; background: ${INSET}; border: 1px solid ${BORDER}; border-radius: 9px; padding: 10px 12px; }

  .bvi-reinvest { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; margin-top: 4px; padding: 14px 22px; border-radius: 12px; font-family: ${F.body}; font-size: 15px; font-weight: 700; cursor: pointer; color: ${CREAM}; background: ${withAlpha(GREEN, 0.08)}; border: 1.5px solid ${withAlpha(GREEN, 0.55)}; transition: background .2s, border-color .2s, box-shadow .2s, opacity .2s; }
  .bvi-reinvest:hover { background: ${withAlpha(GREEN, 0.16)}; }
  .bvi-reinvest .bvi-reinvest-label { position: relative; z-index: 2; }
  .bvi-reinvest .shimmer { position: absolute; z-index: 1; top: 0; bottom: 0; left: -45%; width: 45%; transform: skewX(-20deg); background: linear-gradient(90deg, transparent 0%, ${withAlpha(GREEN, 0.45)} 50%, transparent 100%); animation: bviShimmer 3s linear infinite; pointer-events: none; }
  .bvi-reinvest.is-on { color: ${P.navyDark}; background: linear-gradient(120deg, ${GREEN} 0%, ${withAlpha(GREEN, 0.82)} 100%); border-color: ${GREEN}; box-shadow: 0 0 22px ${withAlpha(GREEN, 0.5)}; }
  .bvi-reinvest.is-disabled { cursor: not-allowed; opacity: 0.4; border-color: ${BORDER}; background: ${INSET}; box-shadow: none; }
  .bvi-reinvest.is-disabled .shimmer, .bvi-reinvest.is-on .shimmer { display: none; animation: none; }
  @keyframes bviShimmer { 0% { left: -45%; } 100% { left: 130%; } }
  @media (prefers-reduced-motion: reduce) { .bvi-reinvest .shimmer { animation: none; display: none; } }

  .bvi-readouts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; }
  .bvi-cell { background: ${P.navy}; border: 1px solid ${BORDER}; border-radius: 10px; padding: 12px 14px; }
  .bvi-cell-l { font-size: 10px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: ${MUT}; margin-bottom: 5px; }
  .bvi-cell-v { font-family: ${F.display}; font-size: 20px; line-height: 1.1; }
  .bvi-cell-s { font-size: 11px; color: ${withAlpha(CHART_COLORS.line, 0.55)}; margin-top: 3px; }

  .bvi-legend { display: flex; flex-wrap: wrap; gap: 14px 20px; margin-bottom: 14px; }
  .bvi-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: ${withAlpha(CHART_COLORS.line, 0.75)}; }
  .bvi-swatch { display: inline-block; width: 18px; border-radius: 999px; flex-shrink: 0; }
  .bvi-plot { width: 100%; height: 420px; min-height: 300px; }
  /* Phones: pull the plot out into the panel's padding so the drawable area
     gets every pixel available, and go a little taller now that it is wider. */
  @media (max-width: 700px) { .bvi-plot { height: 370px; margin-left: -10px; margin-right: -10px; width: calc(100% + 20px); } }


  .bvi-plot.is-live { cursor: pointer; }
  .bvi-tab:disabled, .bvi-amt input:disabled, .bvi-rate input:disabled { cursor: not-allowed; opacity: 0.45; }

  /* Endpoint dot + gutter value fade in as each line lands. */
  .bvi-ep { opacity: 0; transition: opacity .4s ease; }
  .bvi-plot[data-steps="1"] .bvi-ep-sp,
  .bvi-plot[data-steps="2"] .bvi-ep-sp,
  .bvi-plot[data-steps="3"] .bvi-ep-sp,
  .bvi-plot[data-steps="4"] .bvi-ep-sp,
  .bvi-plot[data-steps="2"] .bvi-ep-eq,
  .bvi-plot[data-steps="3"] .bvi-ep-eq,
  .bvi-plot[data-steps="4"] .bvi-ep-eq,
  .bvi-plot[data-steps="3"] .bvi-ep-pf,
  .bvi-plot[data-steps="4"] .bvi-ep-pf { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .bvi-ep { transition: none; } }

  .bvi-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
`;

export function BuyVsInvestChart() {
  const [rate, setRate] = useState(6.43);
  const [strategy, setStrategy] = useState("monthly");
  const [amount, setAmount] = useState(0);
  const [reinvest, setReinvest] = useState(false);
  const userTouchedRate = useRef(false);

  const staticCharts = useStaticCharts();
  const hasHover = useHasHover();
  // Phone layout. The desktop chart spends 84px of right gutter on endpoint
  // value labels and 52px on the axis, which on a phone left only ~246px of
  // actual plot. Narrow trims all of that back and shortens the labels to
  // match, so the drawable area roughly matches the ratio chart above it.
  const narrow = useIsMobile(700);
  const mR = narrow ? 46 : 84;
  const mL = narrow ? 0 : 14;
  const yAxisW = narrow ? 38 : 52;
  // Lines finished so far (0-4). `drawingStep` is the one currently drawing,
  // null when idle. Step 4 redraws the profit line green after flipping the
  // strategy, so it targets the same path element as step 3.
  const [animSteps, setAnimSteps] = useState(0);
  const [drawingStep, setDrawingStep] = useState(null);
  const [duration, setDuration] = useState(4000);

  const plotRef = useRef(null);
  const stripRef = useRef(null);
  const cancelDraw = useRef(null);

  const shownSteps = staticCharts ? 4 : animSteps;
  const finished = shownSteps >= 4;
  const locked = !staticCharts && !finished;

  // Live conventional rate from the same source as the calculator (client-only;
  // never runs during prerender). Falls back silently to the 6.43 default.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (cancelled || userTouchedRate.current || !data.success || !data.rates) return;
        const conv = data.rates.find((r) => r.label.toLowerCase().includes("30-year fixed"));
        if (conv) {
          const r = roundDefaultRate(parseFloat(conv.rate));
          if (r >= 3 && r <= 10) setRate(Math.round(r / 0.125) * 0.125);
        }
      } catch { /* keep the 6.43 fallback */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const canReinvest = strategy === "biweekly" || amount > 0;
  const activeReinvest = reinvest && canReinvest;
  const profitColor = activeReinvest ? GREEN : GOLD;

  const sim = useMemo(
    () => simulateBuyVsInvest({ rate, strategy, amount, reinvest: activeReinvest }),
    [rate, strategy, amount, activeReinvest]
  );
  const interestSaved = useMemo(() => interestSavedAt(rate, sim), [rate, sim]);

  const data = useMemo(
    () => sim.years.map((r) => ({ year: r.year, equity: r.equity, profit: r.netProfit, spPath: r.spPath, fund: r.fund, homeVal: r.homeVal, loanBal: r.balance })),
    [sim]
  );

  // Dynamic axis. Ceiling follows the tallest series (never below 3M); floor
  // follows the underwater dip in the profit line, kept tight.
  const { yMin, yMax, yTicks } = useMemo(() => {
    let peak = 2422079, low = 0;
    for (const r of sim.years) {
      peak = Math.max(peak, r.equity, r.netProfit, r.spPath);
      low = Math.min(low, r.netProfit);
    }
    const top = Math.max(3000000, Math.ceil((peak * 1.12) / 500000) * 500000);
    const bottom = Math.min(0, Math.floor((low * 1.12) / 50000) * 50000);
    const step = top > 4000000 ? 1000000 : 500000;
    const ticks = [];
    for (let t = 0; t <= top; t += step) ticks.push(t);
    return { yMin: bottom, yMax: top, yTicks: ticks };
  }, [sim]);

  const endpoints = [
    { v: data[30].equity, color: REDLINE, cls: "bvi-ep-eq" },
    { v: data[30].profit, color: profitColor, cls: "bvi-ep-pf" },
    { v: data[30].spPath, color: BLUE, cls: "bvi-ep-sp" },
  ];

  // Endpoint labels drawn in the right gutter, anchored start, de-collided so no
  // two sit within 16px vertically. Uses Recharts' internal scales.
  const EndpointLabels = (props) => {
    const { yAxisMap, xAxisMap, offset } = props;
    if (!yAxisMap || !xAxisMap || !offset) return null;
    const yScale = yAxisMap[Object.keys(yAxisMap)[0]]?.scale;
    if (!yScale) return null;
    const gx = offset.left + offset.width + (narrow ? 4 : 8);
    const items = endpoints
      .map((it) => ({ ...it, y: yScale(it.v), label: compact(it.v, narrow) }))
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) {
      if (items[i].y - items[i - 1].y < 16) items[i].y = items[i - 1].y + 16;
    }
    return (
      <g>
        {items.map((it, i) => (
          <text key={i} className={`bvi-ep ${it.cls}`} x={gx} y={it.y + 4} textAnchor="start" fontFamily={F.body} fontSize={narrow ? 11 : 12} fontWeight={700} fill={it.color}>{it.label}</text>
        ))}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 230 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CREAM, marginBottom: 6 }}>Year {d.year}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: REDLINE, flexShrink: 0 }} />
          home equity: {fmt(d.equity)}
        </p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: "0 0 6px" }}>
          home {fmt(d.homeVal)} / loan {fmt(d.loanBal)}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), margin: "0 0 3px" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: profitColor, flexShrink: 0 }} />
          net profit: <span style={{ color: profitColor, fontWeight: 700 }}>{fmt(d.profit)}</span>
        </p>
        {activeReinvest && (
          <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: "0 0 6px" }}>side fund: {fmt(d.fund)}</p>
        )}
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), margin: 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
          S&amp;P path: {fmt(d.spPath)}
        </p>
      </div>
    );
  };

  const setAmt = (raw) => {
    const n = parseFloat(raw);
    setAmount(Number.isFinite(n) ? Math.min(100000, Math.max(0, n)) : 0);
  };

  const payoffYear = sim.paidOffMonth != null && sim.paidOffMonth < 360 ? sim.paidOffMonth / 12 : null;

  // Which path element each step draws. Steps 3 and 4 share the profit line.
  const STEP_SELECTOR = { 1: ".bvi-line-sp", 2: ".bvi-line-eq", 3: ".bvi-line-pf", 4: ".bvi-line-pf" };
  const STEP_COLOR = { 1: BLUE, 2: REDLINE, 3: GOLD, 4: GREEN };

  const pathFor = (step) =>
    plotRef.current?.querySelector(`${STEP_SELECTOR[step]} .recharts-line-curve`);

  // Recharts wipes inline styles on every render, so undrawn lines have to be
  // re-hidden after each one. The line currently drawing is skipped: the draw
  // effect owns its styles and re-hiding it here would kill the transition.
  useEffect(() => {
    for (const step of [1, 2, 3]) {
      if (drawingStep != null && (step === 3 ? drawingStep >= 3 : drawingStep === step)) continue;
      const el = pathFor(step);
      if (!el) continue;
      if (shownSteps >= step) clearDrawState(el);
      else hidePath(el);
    }
  });

  // Same reason as chart 1: the draw must start after the render that set the
  // step, or we would style a path node React is about to throw away.
  useEffect(() => {
    if (drawingStep == null) return;
    const step = drawingStep;
    const path = pathFor(step);
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (!path) {
      setAnimSteps(step);
      setDrawingStep(null);
      return;
    }
    if (tracer) {
      tracer.setAttribute("fill", STEP_COLOR[step]);
      tracer.setAttribute("opacity", "1");
    }

    cancelDraw.current = drawPath(path, {
      duration,
      onTick: (t, pt) => {
        if (tracer) {
          tracer.setAttribute("cx", pt.x);
          tracer.setAttribute("cy", pt.y);
        }
        // Imperative on purpose. See BuyVsInvestBreakdown.
        stripRef.current?.setYear(Math.round(t * 30));
      },
      onDone: () => {
        if (tracer) tracer.setAttribute("opacity", "0");
        stripRef.current?.setYear(30);
        setAnimSteps(step);
        setDrawingStep(null);
      },
    });
    // Duration is captured once per draw; the speed control is disabled while
    // a draw is in flight, so it is deliberately not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawingStep]);

  useEffect(() => () => cancelDraw.current?.(), []);

  const advance = useCallback(() => {
    if (staticCharts || drawingStep != null || animSteps >= 4) return;
    const next = animSteps + 1;
    // Step 4 is the reveal: same starting $25K, but bi-weekly payments with the
    // freed payment reinvested after payoff. Flip the controls first so the
    // line that draws is already the green one.
    if (next === 4) {
      setStrategy("biweekly");
      setAmount(0);
      setReinvest(true);
    }
    setDrawingStep(next);
  }, [staticCharts, drawingStep, animSteps]);

  const replay = useCallback(() => {
    if (staticCharts) return;
    cancelDraw.current?.();
    cancelDraw.current = null;
    const tracer = plotRef.current?.querySelector(`.${TRACER_CLASS}`);
    if (tracer) tracer.setAttribute("opacity", "0");
    setDrawingStep(null);
    setAnimSteps(0);
    setStrategy("monthly");
    setAmount(0);
    setReinvest(false);
    stripRef.current?.setYear(0);
  }, [staticCharts]);

  // See chart 1: the plot is aria-hidden, so shortcuts live on the control bar.
  // Space/Enter activate the focused Draw button natively; R resets.
  const onKeyDown = (e) => {
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      replay();
    }
  };

  const ADVANCE_LABELS = [
    "Draw $25K in the S&P",
    "Draw home equity",
    "Draw net profit",
    "Now pay it off faster",
  ];
  const advanceLabel = drawingStep != null ? "Drawing…" : finished ? "Drawn" : ADVANCE_LABELS[animSteps];

  const legend = [
    { label: "Home equity (gross)", color: REDLINE, h: 4 },
    { label: activeReinvest ? "Net profit, payment reinvested in the S&P after payoff" : "Net profit after every payment made", color: profitColor, h: 3 },
    { label: "$25K in the S&P 500", color: BLUE, h: 3 },
  ];

  return (
    <div className="bvi">
      <style>{css}</style>

      {/* Controls */}
      <div className="bvi-controls">
        <div className="bvi-rate">
          <div className="bvi-rate-top">
            <span className="bvi-rate-label">Interest rate</span>
            <span className="bvi-rate-val">{rate.toFixed(3)}%</span>
          </div>
          <input
            type="range" min="3" max="10" step="0.125" value={rate}
            aria-label="Interest rate" disabled={locked}
            onChange={(e) => { userTouchedRate.current = true; setRate(parseFloat(e.target.value)); }}
          />
          <div className="bvi-rate-scale"><span>3.00%</span><span>10.00%</span></div>
        </div>

        <div className="bvi-row">
          <div className="bvi-field">
            <span className="bvi-flabel">Early payoff strategy</span>
            <div className="bvi-tabs" role="group" aria-label="Early payoff strategy">
              {STRATEGIES.map((s) => (
                <button key={s.key} type="button" className={`bvi-tab${strategy === s.key ? " is-active" : ""}`} disabled={locked} onClick={() => setStrategy(s.key)}>{s.label}</button>
              ))}
            </div>
          </div>

          {strategy === "biweekly" ? (
            <div className="bvi-field" style={{ flex: "1 1 260px" }}>
              <span className="bvi-flabel">Bi-weekly</span>
              <div className="bvi-explainer">26 half-payments a year equals 13 full payments instead of 12.</div>
            </div>
          ) : (
            <div className="bvi-field">
              <label className="bvi-flabel" htmlFor="bvi-extra">{strategy === "annual" ? "Extra per year" : "Extra per month"}</label>
              <div className="bvi-amt">
                <span className="bvi-amt-prefix">$</span>
                <input id="bvi-extra" type="number" min="0" max="100000" value={amount || ""} placeholder="0" disabled={locked} onChange={(e) => setAmt(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            className={`bvi-reinvest${activeReinvest ? " is-on" : ""}${!canReinvest || locked ? " is-disabled" : ""}`}
            disabled={!canReinvest || locked}
            title={locked ? "Finish the walkthrough first" : !canReinvest ? "Add an extra payment first" : undefined}
            aria-pressed={activeReinvest}
            onClick={() => canReinvest && !locked && setReinvest((v) => !v)}
          >
            <span className="bvi-reinvest-label">Reinvest payment after payoff: {activeReinvest ? "ON" : "OFF"}</span>
            <span className="shimmer" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Readouts */}
      <div className="bvi-readouts">
        <Cell label="Paid off in" value={moLabel(sim.paidOffMonth ?? 360)} color={CREAM} />
        <Cell label="Total interest" value={fmt(sim.totalInterest)} color={CREAM} />
        <Cell label="Interest saved" value={fmt(interestSaved)} color={GREEN} />
        <Cell label="MI drops off" value={moLabel(sim.miDropMonth)} color={CREAM} />
        {activeReinvest && <Cell label="Side fund, year 30" value={fmt(sim.years[30].fund)} color={GREEN} />}
        <Cell label="Net profit, year 30" value={fmt(sim.years[30].netProfit)} color={profitColor} />
      </div>

      {/* Legend */}
      <div className="bvi-legend">
        {legend.map((s) => (
          <span key={s.label} className="bvi-legend-item">
            <span className="bvi-swatch" style={{ background: s.color, height: s.h }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Chart */}
      {!staticCharts && (
        <ChartDrawControls
          advanceLabel={advanceLabel}
          onAdvance={advance}
          onReplay={replay}
          canAdvance={!finished}
          canReplay={animSteps > 0 || drawingStep != null}
          duration={duration}
          onDuration={setDuration}
          drawing={drawingStep != null}
          onKeyDown={onKeyDown}
          hint={hasHover
            ? "Four clicks: the S&P path, home equity, net profit, then the faster payoff. R resets."
            : "Four taps: the S&P path, home equity, net profit, then the faster payoff."}
        />
      )}

      <div
        className={`bvi-plot${staticCharts ? "" : " is-live"}`}
        data-steps={shownSteps}
        aria-hidden="true"
        onClick={staticCharts ? undefined : advance}
        ref={plotRef}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 24, right: mR, left: mL, bottom: 4 }}
            onMouseMove={(s) => { if (finished && s && s.activeLabel != null) stripRef.current?.setYear(Number(s.activeLabel)); }}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year" type="number" domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]}
              allowDecimals={false} tickFormatter={(v) => (v === 0 ? "Year 0" : String(v))}
              tick={{ fill: MUT, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[yMin, yMax]} ticks={yTicks} tick={{ fill: MUT, fontSize: 11 }}
              tickLine={false} axisLine={false} tickFormatter={mFmt} width={yAxisW}
            />
            {finished && <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />}
            {yMin < 0 && <ReferenceLine y={0} stroke={withAlpha(CHART_COLORS.line, 0.28)} />}
            {payoffYear != null && (
              <ReferenceLine x={payoffYear} stroke={GREEN} strokeDasharray="5 5" strokeOpacity={0.9}
                label={{ value: "paid off", position: "top", fill: GREEN, fontSize: 11, fontFamily: F.body, fontWeight: 700 }} />
            )}
            <Line className="bvi-line-sp" type="monotone" dataKey="spPath" stroke={BLUE} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            <Line className="bvi-line-pf" type="monotone" dataKey="profit" stroke={profitColor} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            <Line className="bvi-line-eq" type="monotone" dataKey="equity" stroke={REDLINE} strokeWidth={3.25} dot={false} isAnimationActive={false} />
            <ReferenceDot className="bvi-ep bvi-ep-eq" x={30} y={data[30].equity} r={4} fill={REDLINE} stroke={P.navyDark} strokeWidth={2} isFront />
            <ReferenceDot className="bvi-ep bvi-ep-pf" x={30} y={data[30].profit} r={4} fill={profitColor} stroke={P.navyDark} strokeWidth={2} isFront />
            <ReferenceDot className="bvi-ep bvi-ep-sp" x={30} y={data[30].spPath} r={4} fill={BLUE} stroke={P.navyDark} strokeWidth={2} isFront />
            <Customized component={EndpointLabels} />
            {!staticCharts && <Customized component={Tracer} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Calculation breakdown strip. Year is driven imperatively: by the
          tracer during a draw, by hover once the sequence is done. */}
      <BuyVsInvestBreakdown
        ref={stripRef}
        sim={sim}
        activeReinvest={activeReinvest}
        profitColor={profitColor}
        hint={finished ? (hasHover ? "hover the chart to change the year" : "drag across the chart to change the year") : null}
      />

      {/* Crawler / no-JS / screen-reader fallback: the static base-case scenario (6.43%). */}
      <div className="bvi-sr-only">
        <table>
          <caption>Base-case 30-year projection at 6.43% with no extra payment: home equity, home value, loan balance, cumulative loan payments, cumulative taxes and insurance, cumulative mortgage insurance, and net profit by year. Net profit is equity minus the down payment and every dollar of loan payments, taxes, insurance, and mortgage insurance paid.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Home equity</th>
              <th scope="col">Home value</th>
              <th scope="col">Loan balance</th>
              <th scope="col">Loan payments</th>
              <th scope="col">Taxes + insurance</th>
              <th scope="col">Mortgage insurance</th>
              <th scope="col">Net profit</th>
            </tr>
          </thead>
          <tbody>
            {BASE_CASE.years.map((r) => (
              <tr key={r.year}>
                <th scope="row">{r.year}</th>
                <td>{fmt(r.equity)}</td>
                <td>{fmt(r.homeVal)}</td>
                <td>{fmt(r.balance)}</td>
                <td>{fmt(r.loanPayments)}</td>
                <td>{fmt(r.taxesIns)}</td>
                <td>{fmt(r.mi)}</td>
                <td>{fmt(r.netProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ label, value, color }) {
  return (
    <div className="bvi-cell">
      <div className="bvi-cell-l">{label}</div>
      <div className="bvi-cell-v" style={{ color }}>{value}</div>
    </div>
  );
}
