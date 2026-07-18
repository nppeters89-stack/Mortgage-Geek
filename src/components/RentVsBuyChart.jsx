import { useMemo, useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot, ReferenceLine, Customized } from "recharts";
import { P, F, CHART_COLORS, PROGRAM_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { useIsCockpit } from "../utils/hooks";
import { CockpitShell } from "./cockpit/CockpitShell";
import { SHARED_STATE_TAX_RATES } from "../data/taxRates";
import { LOAN_PROGRAMS, VA_USAGE_LABELS } from "../data/loanPrograms.js";
import { simulateRentVsBuy, roundDefaultRate, rentInYear, clampInput, DEFAULTS, LIMITS, BASE_CASE } from "./rentVsBuySim";

// The interactive Rent vs. Buy tool. All series come from the 360-month
// simulation in rentVsBuySim.js, which is pure and SSR-safe, so the prerendered
// HTML renders the default base case with no network. The live rate fetch is
// client-only. Colors from tokens; no hardcoded hex; no animation on the data
// lines. Labels sit in the right gutter and the top margin per the text-overlay
// rule (no boxes on the lines). The sr-only table stays the static base case.

const CREAM = CHART_COLORS.line;
const MUT = withAlpha(CHART_COLORS.line, 0.55);
const DIM = withAlpha(CHART_COLORS.line, 0.4);
const BORDER = withAlpha(CHART_COLORS.line, 0.14);
const HAIR = withAlpha(CHART_COLORS.line, 0.09);
const INSET = withAlpha(CHART_COLORS.line, 0.04);
const BUY = CHART_COLORS.accent;
const RENT = CHART_COLORS.sp500;
const GOLD = CHART_COLORS.gold;

// $X.XXM / $XXXK for the gutter endpoint labels.
const compact = (v) => {
  const a = Math.abs(v);
  const s = a >= 1e6 ? `$${(a / 1e6).toFixed(2)}M` : a >= 1e3 ? `$${Math.round(a / 1e3)}K` : `$${Math.round(a)}`;
  return v < 0 ? `-${s}` : s;
};
// Y-axis tick: millions as $1.5M, smaller values as $250K, zero as $0.
const axisFmt = (v) => {
  if (v === 0) return "$0";
  const a = Math.abs(v);
  const s = a >= 1e6 ? `$${(a / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M` : `$${Math.round(a / 1e3)}K`;
  return v < 0 ? `-${s}` : s;
};

const css = `
  .rvb { width: 100%; }
  .rvb-panel { background: ${INSET}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 16px; }
  .rvb-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
  .rvb-field { display: flex; flex-direction: column; gap: 6px; }
  .rvb-flabel { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: ${MUT}; }
  .rvb-field input[type=number] { width: 132px; font-family: ${F.body}; font-size: 14.5px; font-weight: 600; color: ${CREAM}; background: ${withAlpha(P.navyDark, 0.6)}; border: 1px solid ${BORDER}; border-radius: 9px; padding: 9px 12px; }
  .rvb-field input[type=number]:focus { outline: 2px solid ${withAlpha(BUY, 0.7)}; outline-offset: 1px; }

  .rvb-slider { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 10px; background: ${withAlpha(P.navyDark, 0.45)}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 11px 16px; }
  .rvb-slider-l { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: ${MUT}; min-width: 150px; }
  .rvb-slider-v { font-family: ${F.display}; font-size: 20px; color: ${CREAM}; min-width: 86px; }
  .rvb-slider input[type=range] { flex: 1; min-width: 170px; accent-color: ${BUY}; height: 22px; cursor: pointer; }
  .rvb-slider-hint { flex-basis: 100%; font-size: 11px; line-height: 1.5; color: ${DIM}; }

  .rvb-adv { margin-top: 12px; border: 1px solid ${BORDER}; border-radius: 12px; background: ${withAlpha(P.navyDark, 0.3)}; }
  .rvb-adv summary { cursor: pointer; list-style: none; padding: 11px 16px; font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: ${MUT}; }
  .rvb-adv summary::-webkit-details-marker { display: none; }
  .rvb-adv summary::after { content: " +"; color: ${BUY}; }
  .rvb-adv[open] summary::after { content: " \\2212"; }
  .rvb-adv-inner { padding: 4px 16px 14px; }
  .rvb-adv-note { font-size: 11.5px; line-height: 1.55; color: ${DIM}; margin: 10px 0 0; }

  .rvb-verdict { margin-top: 22px; background: ${P.navy}; border: 1px solid ${HAIR}; border-radius: 14px; padding: 22px 24px; }
  .rvb-verdict-k { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: ${MUT}; margin-bottom: 8px; }
  .rvb-verdict-line { font-family: ${F.display}; font-weight: 400; font-size: clamp(22px, 3.4vw, 30px); line-height: 1.2; color: ${CREAM}; }
  .rvb-verdict-sub { font-size: 13px; line-height: 1.6; color: ${withAlpha(CHART_COLORS.line, 0.72)}; margin: 8px 0 0; max-width: 74ch; }

  .rvb-readouts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 16px 0; }
  .rvb-ro { border-left: 2px solid ${HAIR}; padding-left: 12px; }
  .rvb-ro-t { font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: ${MUT}; margin-bottom: 3px; }
  .rvb-ro-n { font-family: ${F.display}; font-size: 20px; line-height: 1.15; }

  .rvb-legend { display: flex; flex-wrap: wrap; gap: 14px 20px; margin: 2px 0 14px; }
  .rvb-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 500; color: ${withAlpha(CHART_COLORS.line, 0.75)}; }
  .rvb-swatch { display: inline-block; width: 20px; border-radius: 999px; flex-shrink: 0; }
  .rvb-swatch-dash { display: inline-block; width: 20px; border-top: 3px dashed ${GOLD}; flex-shrink: 0; }
  .rvb-plot { width: 100%; height: 420px; min-height: 300px; }
  @media (max-width: 640px) { .rvb-plot { height: 340px; } }

  .rvb-bd { margin-top: 14px; border: 1px solid ${BORDER}; border-radius: 12px; padding: 14px 16px; background: ${withAlpha(P.navyDark, 0.45)}; }
  .rvb-bd-title { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: ${MUT}; margin-bottom: 10px; }
  .rvb-bd-title b { color: ${CREAM}; }
  .rvb-bd-title span { text-transform: none; letter-spacing: 0; font-weight: 400; }
  .rvb-bd-row { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px 6px; }
  .rvb-bd-op { display: flex; align-items: center; font-family: ${F.display}; font-size: 18px; color: ${DIM}; padding: 0 1px; }
  .rvb-bd-cell { min-width: 96px; background: ${P.navy}; border: 1px solid ${BORDER}; border-radius: 9px; padding: 8px 12px; }
  .rvb-bd-l { font-size: 9.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${MUT}; margin-bottom: 2px; white-space: nowrap; }
  .rvb-bd-v { font-family: ${F.display}; font-size: 16.5px; color: ${CREAM}; white-space: nowrap; }
  .rvb-bd-foot { font-size: 11.5px; line-height: 1.5; color: ${DIM}; margin: 9px 0 0; }

  /* Program tabs. Single-select: a rent-vs-buy projection plots one buying
     scenario against the renter, unlike the calculator's multi-select compare. */
  .rvb-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .rvb-tab { font-family: ${F.body}; font-size: 12.5px; font-weight: 700; padding: 9px 6px; border-radius: 8px; cursor: pointer; background: transparent; border: 1px solid ${BORDER}; color: ${MUT}; transition: color .15s, background .15s, border-color .15s; }
  .rvb-tab:hover:not(:disabled) { color: ${CREAM}; }
  .rvb-tab:disabled { cursor: not-allowed; opacity: 0.38; }
  .rvb-tab.is-active { color: ${CREAM}; }
  .rvb-note { font-size: 11.5px; line-height: 1.5; color: ${DIM}; margin: 8px 0 0; }
  .rvb-warn { font-size: 11.5px; line-height: 1.5; color: ${CHART_COLORS.accent}; margin: 8px 0 0; }

  .rvb-select { font-family: ${F.body}; font-size: 14px; font-weight: 600; color: ${CREAM}; background: ${withAlpha(P.navyDark, 0.6)}; border: 1px solid ${BORDER}; border-radius: 9px; padding: 9px 10px; width: 100%; }
  .rvb-select:focus { outline: 2px solid ${withAlpha(BUY, 0.7)}; outline-offset: 1px; }
  .rvb-select option { background: ${P.navy}; color: ${CREAM}; }
  .rvb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .rvb-caption { font-size: 13px; line-height: 1.65; color: ${withAlpha(CHART_COLORS.line, 0.72)}; margin: 16px 4px 0; max-width: 80ch; }
  .rvb-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

  /* Narrow viewports. The slider row's label + value + track exceed a 375px
     screen at their desktop minimums, so drop the minimums and let the track
     take a full row under its label. Number fields go fluid for the same
     reason. */
  @media (max-width: 560px) {
    .rvb-slider { gap: 6px 10px; padding: 11px 13px; }
    .rvb-slider-l { min-width: 0; flex: 1 1 auto; }
    .rvb-slider-v { min-width: 0; font-size: 18px; }
    .rvb-slider input[type=range] { flex-basis: 100%; min-width: 0; }
    .rvb-field input[type=number] { width: 100%; }
    .rvb-row > .rvb-field { flex: 1 1 140px; }
    .rvb-grid2 { grid-template-columns: 1fr; }
    .rvb-tab { padding: 9px 4px; font-size: 12px; }
    .rvb-bd-cell { min-width: 0; flex: 1 1 128px; }
  }
`;

// Number field that keeps its own text while you type. It commits only when the
// typed value is already in range, and clamps on blur, so a half-typed "5" in
// the price box never snaps the whole simulation to the minimum mid-keystroke.
function NumField({ id, label, field, value, step, onCommit }) {
  const [min, max] = LIMITS[field];
  const [text, setText] = useState(String(value));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(String(value)); }, [value]);
  return (
    <div className="rvb-field">
      <label className="rvb-flabel" htmlFor={id}>{label}</label>
      <input
        id={id} type="number" min={min} max={max} step={step} value={text}
        onFocus={() => { focused.current = true; }}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseFloat(e.target.value);
          if (Number.isFinite(n) && n >= min && n <= max) onCommit(n);
        }}
        onBlur={(e) => {
          focused.current = false;
          const n = parseFloat(e.target.value);
          const next = clampInput(field, n);
          onCommit(next);
          setText(String(next));
        }}
      />
    </div>
  );
}

// Dollar twin of a percentage field. Holds its own text while focused so typing
// "1" on the way to "1400" doesn't drive the percentage to a rounding artifact,
// and re-syncs from the incoming value whenever the user is not editing it
// (which is what keeps it in step when the percentage or home price changes).
function LinkedDollarField({ id, label, value, max, onCommit }) {
  const [text, setText] = useState(String(value));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(String(value)); }, [value]);
  const commit = (raw) => {
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(0, n));
  };
  return (
    <div className="rvb-field">
      <label className="rvb-flabel" htmlFor={id}>{label}</label>
      <input
        id={id} type="number" min={0} max={max} step={25} value={text}
        onFocus={() => { focused.current = true; }}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseFloat(e.target.value);
          if (Number.isFinite(n) && n >= 0 && n <= max) onCommit(n);
        }}
        onBlur={(e) => {
          focused.current = false;
          const next = commit(e.target.value);
          if (next === null) { setText(String(value)); return; }
          onCommit(next);
          setText(String(next));
        }}
      />
    </div>
  );
}

function Slider({ id, label, field, value, step, display, hint, onCommit }) {
  const [min, max] = LIMITS[field];
  return (
    <div className="rvb-slider">
      <label className="rvb-slider-l" htmlFor={id}>{label}</label>
      <span className="rvb-slider-v">{display}</span>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onCommit(parseFloat(e.target.value))}
      />
      <span className="rvb-slider-hint">{hint}</span>
    </div>
  );
}

function Op({ children }) {
  return <span className="rvb-bd-op" aria-hidden="true">{children}</span>;
}

function BdCell({ label, value, color }) {
  return (
    <div className="rvb-bd-cell">
      <div className="rvb-bd-l">{label}</div>
      <div className="rvb-bd-v" style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}

export function RentVsBuyChart() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [hoveredYear, setHoveredYear] = useState(null);
  const userTouchedRate = useRef(false);
  const isCockpit = useIsCockpit();

  // Property tax location, same source and shape as the calculator. The metro
  // defaults to the state average, which for Tennessee is the 0.75% the base
  // case documents.
  const [taxState, setTaxState] = useState("TN");
  const [taxMetro, setTaxMetro] = useState("");

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: clampInput(field, value) }));

  const stateData = SHARED_STATE_TAX_RATES[taxState];
  const metroList = stateData?.metros || [];
  const selectedMetro = metroList.find((m) => m.name === taxMetro);
  const taxRate = selectedMetro ? selectedMetro.rate : stateData?.rate ?? DEFAULTS.taxPct;
  // Reads naturally in "from {countyLabel}": "from Nashville/Davidson" or
  // "from the Tennessee average".
  const countyLabel = selectedMetro ? selectedMetro.name : stateData ? `the ${stateData.name} average` : "your county";

  // Location drives the tax rate. Kept as an effect (not derived at sim time) so
  // the Advanced panel's tax field stays a real, overridable input.
  useEffect(() => { set("taxPct", taxRate); }, [taxRate]);

  // Live 30-year rate from the same source as the calculator (client-only, so it
  // never runs during prerender). Falls back silently to the 6.43 default.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (cancelled || userTouchedRate.current || !data.success || !data.rates) return;
        const conv = data.rates.find((r) => r.label.toLowerCase().includes("30-year fixed"));
        if (!conv) return;
        const r = roundDefaultRate(parseFloat(conv.rate));
        if (r >= LIMITS.rate[0] && r <= LIMITS.rate[1]) {
          setInputs((prev) => (userTouchedRate.current ? prev : { ...prev, rate: Math.round(r / 0.125) * 0.125 }));
        }
      } catch { /* keep the 6.43 fallback */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const sim = useMemo(() => simulateRentVsBuy(inputs), [inputs]);
  const terms = sim.terms;
  const data = sim.years;
  const hz = inputs.hz;
  const atHorizon = data[hz];

  // Dynamic axis. Ceiling follows the taller series with headroom; floor only
  // opens up if the buyer starts underwater (transaction costs on day one).
  const { yMin, yMax, yTicks } = useMemo(() => {
    let peak = 1, low = 0;
    for (const row of data) {
      peak = Math.max(peak, row.buyerWealth, row.renterWealth);
      low = Math.min(low, row.buyerWealth, row.renterWealth);
    }
    const top = Math.max(250000, Math.ceil((peak * 1.12) / 250000) * 250000);
    const bottom = Math.min(0, Math.floor((low * 1.12) / 50000) * 50000);
    const step = top > 2000000 ? 500000 : 250000;
    const ticks = [];
    for (let t = 0; t <= top; t += step) ticks.push(t);
    return { yMin: bottom, yMax: top, yTicks: ticks };
  }, [data]);

  const endpoints = [
    { v: data[30].buyerWealth, color: BUY },
    { v: data[30].renterWealth, color: RENT },
  ];

  // Endpoint labels in the right gutter, anchored start, de-collided so no two
  // sit within 16px vertically. Uses Recharts' internal scales.
  const EndpointLabels = (props) => {
    const { yAxisMap, offset } = props;
    if (!yAxisMap || !offset) return null;
    const yScale = yAxisMap[Object.keys(yAxisMap)[0]]?.scale;
    if (!yScale) return null;
    const gx = offset.left + offset.width + 8;
    const items = endpoints
      .map((it) => ({ ...it, y: yScale(it.v), label: compact(it.v) }))
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) {
      if (items[i].y - items[i - 1].y < 16) items[i].y = items[i - 1].y + 16;
    }
    return (
      <g>
        {items.map((it, i) => (
          <text key={i} x={gx} y={it.y + 4} textAnchor="start" fontFamily={F.body} fontSize={12} fontWeight={700} fill={it.color}>{it.label}</text>
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
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), margin: "0 0 3px" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: BUY, flexShrink: 0 }} />
          buyer walks away: <span style={{ color: BUY, fontWeight: 700 }}>{fmt(d.buyerWealth)}</span>
        </p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: "0 0 6px" }}>
          home {fmt(d.homeVal)} / loan {fmt(d.balance)}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), margin: "0 0 3px" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: RENT, flexShrink: 0 }} />
          renter walks away: <span style={{ color: RENT, fontWeight: 700 }}>{fmt(d.renterWealth)}</span>
        </p>
        <p style={{ fontSize: 12, fontWeight: 700, color: d.advantage < 0 ? RENT : GOLD, margin: 0 }}>
          advantage: {fmt(d.advantage)}
        </p>
      </div>
    );
  };

  // Verdict at the selected horizon.
  const adv = atHorizon.advantage;
  const buyingAhead = adv >= 0;
  const verdictColor = buyingAhead ? BUY : RENT;
  const be = sim.breakevenYear;
  const verdictSub = be === null
    ? "Buying never catches renting within 30 years in this scenario. Slide your horizon or adjust the inputs to see how the answer moves."
    : `Buying pulls ahead of renting in year ${be}${sim.leadChangesLater ? ", though the lead changes hands again later in this scenario. The chart shows where" : " and stays ahead through year 30 in this scenario"}. Slide your horizon to see how the answer changes with how long you stay.`;

  // Breakdown strip follows the hover and falls back to the horizon.
  const by = Math.max(0, Math.min(30, hoveredYear ?? hz));
  const b = data[by];
  const flipYear = sim.flipMonth ? Math.ceil(sim.flipMonth / 12) : null;

  const caption = `At these inputs, owning starts at about ${fmt(sim.owningMonthOne)} a month against ${fmt(inputs.rent0)} rent, so the renter banks the difference early and starts ahead: on day one the renter holds the invested down payment and closing costs while an immediate sale would cost the buyer both sets of transaction costs. Rent compounds at ${inputs.rentG.toFixed(1)}% a year while the mortgage payment stays fixed. Rent passes the full cost of owning ${flipYear ? `around year ${flipYear}` : "never, within this window"}, and from there the flow reverses and the buyer banks the surplus. The buyer ${be === null ? "never catches the renter inside 30 years" : `first catches the renter in year ${be}`}. Read at your year-${hz} horizon, ${buyingAhead ? "buying" : "renting"} walks away ahead by ${fmt(Math.abs(adv))}. Hover any year to watch the calculation strip rebuild the number in front of you.`;

  // The inputs rail. On desktop this is the sticky left column; on mobile it
  // stacks above the results, matching the calculator.
  const rail = (
    <>
      {/* Inputs */}
      <div className="rvb-panel">
        {/* Loan program: single-select, since the projection plots one buying
            scenario against the renter. */}
        <div className="rvb-field" style={{ marginBottom: 12 }}>
          <span className="rvb-flabel">Loan program</span>
          <div className="rvb-tabs" role="group" aria-label="Loan program">
            {LOAN_PROGRAMS.map((name) => {
              const active = inputs.program === name;
              const color = PROGRAM_COLORS[name];
              return (
                <button
                  key={name}
                  type="button"
                  className={`rvb-tab${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => set("program", name)}
                  style={active ? { background: withAlpha(color, 0.18), borderColor: withAlpha(color, 0.75) } : undefined}
                >
                  {name === "Conventional" ? "Conv" : name}
                </button>
              );
            })}
          </div>
          {terms.ineligibleReason
            ? <p className="rvb-warn">{terms.ineligibleReason} The projection still runs, but this program would not be available at this down payment.</p>
            : <p className="rvb-note">{terms.miNote}{terms.upfrontLabel ? `. ${terms.upfrontLabel} financed into the loan.` : ""}</p>}
        </div>

        {inputs.program === "VA" && (
          <div className="rvb-field" style={{ marginBottom: 12 }}>
            <label className="rvb-flabel" htmlFor="rvb-vausage">VA funding fee usage</label>
            <select id="rvb-vausage" className="rvb-select" value={inputs.vaUsage} onChange={(e) => set("vaUsage", e.target.value)}>
              {Object.entries(VA_USAGE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
        )}

        <div className="rvb-row">
          <NumField id="rvb-price" label="Home price" field="price" value={inputs.price} step={5000} onCommit={(v) => set("price", v)} />
          <NumField id="rvb-down" label="Down payment %" field="downPct" value={inputs.downPct} step={0.5} onCommit={(v) => set("downPct", v)} />
          <NumField id="rvb-rent" label="Monthly rent today" field="rent0" value={inputs.rent0} step={50} onCommit={(v) => set("rent0", v)} />
        </div>

        {/* Property tax location, same tables the calculator uses. */}
        <div className="rvb-grid2" style={{ marginTop: 12 }}>
          <div className="rvb-field">
            <label className="rvb-flabel" htmlFor="rvb-state">State</label>
            <select id="rvb-state" className="rvb-select" value={taxState} onChange={(e) => { setTaxState(e.target.value); setTaxMetro(""); }}>
              {Object.entries(SHARED_STATE_TAX_RATES).map(([code, d]) => <option key={code} value={code}>{d.name}</option>)}
            </select>
          </div>
          <div className="rvb-field">
            <label className="rvb-flabel" htmlFor="rvb-metro">County / metro</label>
            <select id="rvb-metro" className="rvb-select" value={taxMetro} onChange={(e) => setTaxMetro(e.target.value)} disabled={!metroList.length}>
              <option value="">State Avg ({stateData?.rate}%)</option>
              {metroList.map((m) => <option key={m.name} value={m.name}>{m.name} ({m.rate}%)</option>)}
            </select>
          </div>
        </div>
        <p className="rvb-note">Property tax set to {taxRate}% a year from {countyLabel}. Override it under Advanced.</p>

        <Slider
          id="rvb-rate" label="Mortgage rate" field="rate" value={inputs.rate} step={0.125}
          display={`${inputs.rate.toFixed(2)}%`}
          hint="Defaults to today's 30-year average when it loads. 6.43% is the fallback."
          onCommit={(v) => { userTouchedRate.current = true; set("rate", v); }}
        />
        <Slider
          id="rvb-rentg" label="Rent growth / yr" field="rentG" value={inputs.rentG} step={0.1}
          display={`${inputs.rentG.toFixed(1)}%`}
          hint="4.1% is the 56-year national average (1970 to 2026). Rent has never had a down year."
          onCommit={(v) => set("rentG", v)}
        />
        <Slider
          id="rvb-inv" label="Investment return / yr" field="inv" value={inputs.inv} step={0.5}
          display={`${inputs.inv.toFixed(1)}%`}
          hint="10% is the long-run S&P 500 total-return average. Both side funds compound at this rate."
          onCommit={(v) => set("inv", v)}
        />
        <Slider
          id="rvb-hz" label="How long you'll stay" field="hz" value={inputs.hz} step={1}
          display={inputs.hz === 1 ? "1 yr" : `${inputs.hz} yrs`}
          hint="The verdict is read at this year. This is the question that decides most rent vs. buy math."
          onCommit={(v) => set("hz", v)}
        />

        <details className="rvb-adv">
          <summary>Advanced assumptions</summary>
          <div className="rvb-adv-inner">
            {/* Homeowner's insurance, entered either way. The percentage is the
                stored value; the dollar figure is the same number expressed
                against the current home price, and editing either updates the
                other. */}
            <span className="rvb-flabel">Homeowner's insurance</span>
            <div className="rvb-row" style={{ marginTop: 6 }}>
              <NumField
                id="rvb-ins" label="Percent of price / yr" field="insPct" value={inputs.insPct} step={0.05}
                onCommit={(v) => set("insPct", v)}
              />
              <LinkedDollarField
                id="rvb-ins-dollar" label="Dollars / yr"
                value={Math.round((inputs.price * inputs.insPct) / 100)}
                max={Math.round((inputs.price * LIMITS.insPct[1]) / 100)}
                onCommit={(dollars) => set("insPct", Math.round(((dollars / inputs.price) * 100) * 1000) / 1000)}
              />
            </div>
            <p className="rvb-adv-note">Insurance defaults to 0.35% of the price a year. Enter it either way: the two fields are the same number and stay in step.</p>

            <div className="rvb-row" style={{ marginTop: 14 }}>
              <NumField id="rvb-cc" label="Closing costs %" field="ccPct" value={inputs.ccPct} step={0.25} onCommit={(v) => set("ccPct", v)} />
              <NumField id="rvb-sell" label="Selling costs %" field="sellPct" value={inputs.sellPct} step={0.25} onCommit={(v) => set("sellPct", v)} />
            </div>
            <p className="rvb-adv-note">Closing costs are what you pay going in, when you buy the home ({fmt(Math.round((inputs.price * inputs.ccPct) / 100))} here), and the renter invests that same cash on day one instead. Selling costs are what comes off the top coming out, when you sell, and the buyer is charged them in every year of the chart.</p>
            <p className="rvb-adv-note">Property tax is set by the state and county above, not here. Mortgage insurance is automatic and follows the loan program: {terms.miLabel ? `${terms.miLabel}. ${terms.miNote}` : terms.miNote}. Taxes and insurance are held flat, a simplification the footnotes disclose.</p>
          </div>
        </details>
      </div>
    </>
  );

  // The results canvas.
  const canvas = (
    <>
      {/* Verdict */}
      <div className="rvb-verdict" aria-live="polite">
        <div className="rvb-verdict-k">The verdict at your horizon</div>
        <p className="rvb-verdict-line">
          At year {hz}, <span style={{ color: verdictColor }}>{buyingAhead ? "buying" : "renting"}</span> is ahead by{" "}
          <span style={{ color: verdictColor, whiteSpace: "nowrap" }}>{fmt(Math.abs(adv))}</span>
        </p>
        <p className="rvb-verdict-sub">{verdictSub}</p>
      </div>

      {/* Readouts */}
      <div className="rvb-readouts">
        <Readout label="Breakeven year" value={be === null ? "30+" : be === 0 ? "Day one" : String(be)} color={GOLD} />
        <Readout label="Owning, month one" value={`${fmt(sim.owningMonthOne)}/mo`} color={CREAM} />
        <Readout label="Renting, month one" value={`${fmt(inputs.rent0)}/mo`} color={CREAM} />
        <Readout label="Rent in your final year" value={`${fmt(rentInYear(inputs.rent0, inputs.rentG, hz))}/mo`} color={CREAM} />
        <Readout label="Buyer walks away with" value={fmt(atHorizon.buyerWealth)} color={BUY} />
        <Readout label="Renter walks away with" value={fmt(atHorizon.renterWealth)} color={RENT} />
      </div>

      {/* Legend */}
      <div className="rvb-legend">
        <span className="rvb-legend-item"><span className="rvb-swatch" style={{ background: BUY, height: 4 }} />Buyer: sell that year, pay off the loan, keep the side fund</span>
        <span className="rvb-legend-item"><span className="rvb-swatch" style={{ background: RENT, height: 3 }} />Renter: the invested portfolio</span>
        <span className="rvb-legend-item"><span className="rvb-swatch-dash" />Your horizon</span>
      </div>

      {/* Chart */}
      <div className="rvb-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 28, right: 76, left: 14, bottom: 4 }}
            onMouseMove={(e) => { if (e && e.activeLabel != null) setHoveredYear(Number(e.activeLabel)); }}
            onMouseLeave={() => setHoveredYear(null)}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year" type="number" domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]}
              allowDecimals={false} tickFormatter={(v) => (v === 0 ? "Year 0" : String(v))}
              tick={{ fill: MUT, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[yMin, yMax]} ticks={yTicks} tick={{ fill: MUT, fontSize: 11 }}
              tickLine={false} axisLine={false} tickFormatter={axisFmt} width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            {yMin < 0 && <ReferenceLine y={0} stroke={withAlpha(CHART_COLORS.line, 0.28)} />}
            <ReferenceLine
              x={hz} stroke={withAlpha(GOLD, 0.45)} strokeDasharray="5 5"
              label={{ value: `year ${hz}`, position: "top", fill: GOLD, fontSize: 11, fontFamily: F.body, fontWeight: 700 }}
            />
            <Line type="monotone" dataKey="renterWealth" stroke={RENT} strokeWidth={2.75} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="buyerWealth" stroke={BUY} strokeWidth={3.25} dot={false} isAnimationActive={false} />
            {be !== null && be > 0 && (
              <ReferenceDot x={be} y={data[be].buyerWealth} r={5} fill={GOLD} stroke={P.navy} strokeWidth={2} isFront />
            )}
            <ReferenceDot x={30} y={data[30].buyerWealth} r={4.5} fill={BUY} stroke={P.navy} strokeWidth={2} isFront />
            <ReferenceDot x={30} y={data[30].renterWealth} r={4.5} fill={RENT} stroke={P.navy} strokeWidth={2} isFront />
            <Customized component={EndpointLabels} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Calculation breakdown strip */}
      <div className="rvb-bd" aria-live="polite">
        <div className="rvb-bd-title">How the verdict is built · <b>Year {by}</b> <span>(hover the chart to change the year)</span></div>
        <div className="rvb-bd-row">
          <BdCell label="Sale, net of costs" value={fmt(b.homeVal * (1 - sim.sellCostRate))} />
          <Op>−</Op><BdCell label="Loan balance" value={fmt(b.balance)} />
          <Op>+</Op><BdCell label="Buyer side fund" value={fmt(b.buyerFund)} />
          <Op>=</Op><BdCell label="Buyer wealth" value={fmt(b.buyerWealth)} color={BUY} />
          <Op>vs</Op><BdCell label="Renter portfolio" value={fmt(b.renterWealth)} color={RENT} />
          <Op>=</Op><BdCell label="Advantage" value={fmt(b.advantage)} color={b.advantage < 0 ? RENT : GOLD} />
        </div>
        <p className="rvb-bd-foot">The renter's portfolio starts with the buyer's down payment plus closing costs invested on day one. Each month, whichever side pays less for housing invests the difference at the selected return. The buyer is always scored as if selling that year, with selling costs deducted, the strictest honest test.</p>
      </div>

      <p className="rvb-caption">{caption}</p>

      {/* Crawler / no-JS / screen-reader fallback: the static base-case scenario. */}
      <div className="rvb-sr-only">
        <table>
          <caption>Rent vs. buy comparison at the default assumptions ($400,000 home, 5% down, $2,000 rent, 6.43% rate, 4.1% rent growth, 10% investment return): buyer walk-away wealth versus renter portfolio by year. Buyer wealth is the home value net of selling costs, minus the loan balance, plus the buyer's side fund.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Buyer walk-away wealth</th>
              <th scope="col">Renter portfolio</th>
              <th scope="col">Advantage</th>
            </tr>
          </thead>
          <tbody>
            {BASE_CASE.years.filter((r) => r.year % 5 === 0).map((r) => (
              <tr key={r.year}>
                <th scope="row">{r.year}</th>
                <td>{fmt(r.buyerWealth)}</td>
                <td>{fmt(r.renterWealth)}</td>
                <td>{fmt(r.advantage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  // Desktop (>=1100px) gets the cockpit: sticky inputs rail on the left, results
  // canvas on the right. Below that, the same two blocks stack.
  if (isCockpit) {
    return (
      <div className="rvb">
        <style>{css}</style>
        <CockpitShell rail={rail} canvas={canvas} dividerColor={HAIR} />
      </div>
    );
  }

  return (
    <div className="rvb" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
      <style>{css}</style>
      {rail}
      <div style={{ marginTop: 22 }}>{canvas}</div>
    </div>
  );
}

function Readout({ label, value, color }) {
  return (
    <div className="rvb-ro">
      <div className="rvb-ro-t">{label}</div>
      <div className="rvb-ro-n" style={{ color }}>{value}</div>
    </div>
  );
}
