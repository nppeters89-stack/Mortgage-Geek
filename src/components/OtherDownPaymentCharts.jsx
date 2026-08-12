import { ComposedChart, BarChart, Bar, Cell, Area, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine, LabelList, Customized } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { withAlpha } from "../utils/format";
import { PRICE_TO_INCOME, PAYMENT_BURDEN, FTHB_AGE, DSR_AGGREGATE, DSR_AVG, STUDENT_LOANS_G19, SL_DELINQUENCY } from "../data/geekCharts";

// Geek Chart #9, "The Other Down Payment": the six data visuals for the part-2
// companion to the Price-to-Income page, on the same dark charcoal canvas as the
// sibling charts. STATIC ONLY in this phase (no entrance or replay animation);
// Nick will direct animation as a separate follow-up. The visuals mirror the
// site's redesigned Geek Charts conventions: threshold coloring off a series
// average (red worse / blue better), red gradient area fills, endpoint and peak
// point labels placed clear of the data (never on a line or bar body), and an
// sr-only data table behind every plot. Colors come from CHART_COLORS / P via
// withAlpha, mapped by visual result; no hardcoded hex. Red on this dark surface
// is the lifted red (CHART_COLORS.accent).
//
// The hero's "What it costs" panel is the one deliberate departure from the
// site's single-axis convention: it carries a DUAL Y AXIS (price-to-income ratio
// on the left, payment burden percent on the right) so the two cost curves share
// one 2020-to-2026 frame. Approved by Nick against this designed backdrop; do not
// normalize it to one axis. Its data is SLICED from the canonical PRICE_TO_INCOME
// and PAYMENT_BURDEN exports (and the age panel from FTHB_AGE), never duplicated.

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

// A point label as an SVG text node, used by the Customized label layers. Kept
// off the data per the text-overlay rule (callers pass the clearance in dy/dx).
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

const legendCss = `
  .odp-legend { display: flex; flex-wrap: wrap; gap: 10px 18px; margin: 2px 2px 12px; }
  .odp-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 500; color: ${withAlpha(CHART_COLORS.line, 0.72)}; }
  .odp-swatch { display: inline-block; width: 16px; height: 3px; border-radius: 999px; flex-shrink: 0; }
  .odp-swatch--dash { height: 0; border-top: 1px dashed ${withAlpha(CHART_COLORS.line, 0.5)}; border-radius: 0; }
  .odp-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
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

// ── Hero: two panels, cost lines vs buyer age, 2020 to 2026 ──────────────────
// Panel A ("What it costs") is the dual-axis exception: price-to-income (red,
// left axis, red fill) against payment burden (blue, right axis, no fill), both
// sliced from the canonical exports. Panel B ("Who buys") is the first-time buyer
// age sliced from FTHB_AGE, red with a fill, with the dashed 33 old-ceiling line.
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

function HeroPanelALabels(props) {
  const x = scale(props.xAxisMap);
  const yr = scale(props.yAxisMap, "r");
  const yp = scale(props.yAxisMap, "p");
  if (!x || !yr || !yp) return null;
  return (
    <g>
      <Txt x={x("2022")} y={yr(4.67) - 12} text="4.67x peak" color={RED} />
      <Txt x={x("2026") + 4} y={yr(3.81) + 22} text="3.81x" color={RED} anchor="end" />
      <Txt x={x("2023")} y={yp(26.5) - 12} text="26.5% peak" color={BLUE} />
      <Txt x={x("2026") + 4} y={yp(23.0) - 12} text="23.0%" color={BLUE} anchor="end" />
    </g>
  );
}

function HeroPanelBLabels(props) {
  const x = scale(props.xAxisMap);
  const y = scale(props.yAxisMap);
  if (!x || !y) return null;
  return (
    <g>
      <Txt x={x("2025") + 4} y={y(40) - 12} text={"40 · record"} color={RED} anchor="end" />
      <Txt x={x("2025") + 2} y={y(33) + 16} text={"33 · the old ceiling"} color={mutedText} anchor="end" size={11.5} />
    </g>
  );
}

export function CostsHero() {
  return (
    <div className="odp-hero">
      <style>{`
        ${legendCss}
        .odp-hero { width: 100%; }
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

      <div className="odp-hero-grid">
        {/* Panel A: the two cost curves on a dual axis (the approved exception). */}
        <div className="odp-hero-panel">
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
                <Area yAxisId="r" type="monotone" dataKey="pti" baseValue={3.6} stroke={RED} strokeWidth={2.5} fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
                <Line yAxisId="p" type="monotone" dataKey="pb" stroke={BLUE} strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={false} />
                <Customized component={HeroPanelALabels} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="odp-hero-verdict"><strong>Peaked.</strong> <span style={{ color: BLUE }}>Easing since.</span></div>
        </div>

        {/* Panel B: first-time buyer age with the dashed old ceiling. */}
        <div className="odp-hero-panel">
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
                <Area type="monotone" dataKey="age" baseValue={31} stroke={RED} strokeWidth={2.5} fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
                <Customized component={HeroPanelBLabels} />
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

function DsrLabel(props) {
  const x = scale(props.xAxisMap);
  const y = scale(props.yAxisMap);
  if (!x || !y) return null;
  const last = dsr.length - 1;
  return <Txt x={x(last) + 4} y={y(dsr[last]) - 12} text="11.16%" color={BLUE} anchor="end" />;
}

export function DsrChart() {
  return (
    <div className="odp-chart">
      <style>{`${legendCss} .odp-dsr-plot { width: 100%; height: 250px; } @media (max-width: 640px) { .odp-dsr-plot { height: 230px; } }`}</style>
      <div className="odp-legend">
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />Worse than average</span>
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: BLUE }} />Better than average</span>
        <span className="odp-legend-item"><span className="odp-swatch odp-swatch--dash" />Series average 12.44%</span>
      </div>
      <div className="odp-dsr-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dsrData} margin={{ top: 16, right: 10, left: 0, bottom: 4 }}>
            <Customized component={DsrDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="i" type="number" domain={[0, dsr.length - 1]} ticks={dsrTicks} tickFormatter={(i) => String(DSR_AGGREGATE.quarters[i].y)} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[8, 17]} ticks={[8, 10, 12, 14, 16]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
            <ReferenceLine y={DSR_AVG} stroke={DASH} strokeDasharray="5 5" />
            <Area type="monotone" dataKey="v" baseValue={8} stroke="none" fill="url(#odpDsrFill)" dot={false} isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="v" stroke="url(#odpDsrStroke)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" dot={false} isAnimationActive={false} activeDot={false} />
            <Customized component={DsrLabel} />
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

function MountainLabel(props) {
  const x = scale(props.xAxisMap);
  const y = scale(props.yAxisMap);
  if (!x || !y) return null;
  const last = sl.length - 1;
  return <Txt x={x(last) + 4} y={y(sl[last]) - 12} text="$1.78T" color={CREAM} anchor="end" />;
}

export function StudentLoanMountain() {
  return (
    <div className="odp-chart">
      <style>{`${legendCss} .odp-mtn-plot { width: 100%; height: 280px; } @media (max-width: 640px) { .odp-mtn-plot { height: 250px; } }`}</style>
      <div className="odp-legend">
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />Student loans owned and securitized</span>
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: GRAY }} />Gray segment: payment pause era</span>
      </div>
      <div className="odp-mtn-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={slData} margin={{ top: 20, right: 10, left: 0, bottom: 4 }}>
            <Customized component={FadeDefs} />
            <Customized component={MountainDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="i" type="number" domain={[0, sl.length - 1]} ticks={slTicks} tickFormatter={(i) => String(STUDENT_LOANS_G19.quarters[i].y)} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[0, 2000]} ticks={[0, 500, 1000, 1500, 2000]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}T`} width={44} />
            <Area type="monotone" dataKey="v" baseValue={0} stroke="none" fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="v" stroke="url(#odpSlStroke)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" dot={false} isAnimationActive={false} activeDot={false} />
            <Customized component={MountainLabel} />
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
// gradient, value labels above each bar.
const flow = SL_DELINQUENCY.flow;

function flowLabel(props) {
  const { x, y, width, value, index } = props;
  if (x == null) return null;
  return (
    <text x={x + width / 2} y={y - 10} textAnchor="middle" fill={index === 0 ? mutedText : RED} fontSize={12} fontWeight={700} fontFamily={F.body}>
      {value.toFixed(2)}%
    </text>
  );
}

export function FlowBars() {
  return (
    <div className="odp-chart">
      <style>{`.odp-flow-plot { width: 100%; height: 210px; }`}</style>
      <div className="odp-flow-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={flow} margin={{ top: 24, right: 8, left: 0, bottom: 4 }}>
            <Customized component={FadeDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: tickColor, fontSize: 12 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[0, 15]} ticks={[0, 5, 10, 15]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={110} isAnimationActive={false}>
              {flow.map((_, i) => <Cell key={i} fill={i === 0 ? GRAYBAR : "url(#odpBarRed)"} />)}
              <LabelList dataKey="value" content={flowLabel} />
            </Bar>
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

function stockLabel(props) {
  const { x, y, width, index } = props;
  if (x == null || index !== stock.length - 1) return null;
  return (
    <text x={x + width / 2} y={y - 10} textAnchor="middle" fill={RED} fontSize={12} fontWeight={700} fontFamily={F.body}>10.3%</text>
  );
}

export function StockBars() {
  return (
    <div className="odp-chart">
      <style>{`${legendCss} .odp-stock-plot { width: 100%; height: 220px; }`}</style>
      <div className="odp-legend">
        <span className="odp-legend-item"><span className="odp-swatch" style={{ background: RED }} />Delinquency rate</span>
        <span className="odp-legend-item"><span className="odp-swatch odp-swatch--dash" />Pre-pandemic norm (routinely above 10%)</span>
      </div>
      <div className="odp-stock-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stock} margin={{ top: 22, right: 8, left: 0, bottom: 10 }}>
            <Customized component={FadeDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" interval={0} tick={<WrapTick />} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} height={44} />
            <YAxis domain={[0, 12.5]} ticks={[0, 5, 10]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
            <ReferenceLine y={NORM} stroke={DASH} strokeDasharray="6 5" />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={90} isAnimationActive={false}>
              {stock.map((d, i) => <Cell key={i} fill={d.pause ? GRAYBAR : "url(#odpBarRed)"} />)}
              <LabelList dataKey="value" content={stockLabel} />
            </Bar>
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

function AgeCompanionLabel(props) {
  const x = scale(props.xAxisMap);
  const y = scale(props.yAxisMap);
  if (!x || !y) return null;
  return <Txt x={x("2025") + 4} y={y(40) - 12} text={"40 · record"} color={RED} anchor="end" />;
}

export function AgeCompanion() {
  return (
    <div className="odp-chart">
      <style>{`.odp-age-plot { width: 100%; height: 170px; }`}</style>
      <div className="odp-age-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={acData} margin={{ top: 20, right: 12, left: 0, bottom: 4 }}>
            <Customized component={FadeDefs} />
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }} />
            <YAxis domain={[30, 42]} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
            <Area type="monotone" dataKey="age" baseValue={30} stroke={RED} strokeWidth={2.5} fill="url(#odpRedFill)" dot={false} isAnimationActive={false} activeDot={false} />
            <Customized component={AgeCompanionLabel} />
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
