import { forwardRef, useImperativeHandle, useState } from "react";
import { CHART_COLORS, F, P } from "../theme";
import { fmt, withAlpha } from "../utils/format";

// The "How the net profit is built" strip that sits under the leverage chart.
//
// Split out of BuyVsInvestChart and driven through an imperative ref on
// purpose. During a line draw the year has to advance 0 to 30 in step with the
// tracer, which is ~60 updates a second. If that year lived in the chart's own
// state, every frame would re-render the LineChart, and because Recharts
// rebuilds its SVG on each render the in-flight stroke-dashoffset transition
// would be destroyed on the first frame. The line would never visibly draw.
//
// Keeping the year here means a frame only re-renders this strip. The chart
// stays untouched for the whole draw.
//
// Layout: a horizontal row of cards on desktop, where the equation reads left
// to right. Below 700px that row becomes a vertical ledger, one line per term
// with the operator in a fixed left gutter and the value right-aligned. An
// earlier version kept the horizontal row and let it scroll sideways, which
// hid most of the equation behind a swipe most people never tried.

const CREAM = CHART_COLORS.line;
const MUT = withAlpha(CHART_COLORS.line, 0.55);
const DIM = withAlpha(CHART_COLORS.line, 0.4);
const BORDER = withAlpha(CHART_COLORS.line, 0.14);
const INSET = withAlpha(CHART_COLORS.line, 0.04);

export const breakdownCss = `
  .bvi-breakdown { margin-top: 18px; border: 1px solid ${BORDER}; border-radius: 12px; padding: 14px 16px; background: ${INSET}; }
  .bvi-bd-title { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: ${MUT}; margin-bottom: 12px; }
  .bvi-bd-row { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px; }
  .bvi-bd-item { display: flex; align-items: stretch; gap: 8px; }
  .bvi-bd-op { display: flex; align-items: center; font-family: ${F.display}; font-size: 18px; color: ${DIM}; padding: 0 1px; }
  .bvi-bd-cell { min-width: 96px; background: ${P.navyDark}; border: 1px solid ${BORDER}; border-radius: 8px; padding: 8px 10px; }
  .bvi-bd-l { font-size: 9.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: ${MUT}; margin-bottom: 4px; white-space: nowrap; }
  .bvi-bd-v { font-family: ${F.display}; font-size: 15px; color: ${CREAM}; }
  .bvi-bd-foot { font-size: 11px; line-height: 1.5; color: ${withAlpha(CHART_COLORS.line, 0.55)}; margin: 12px 0 0; }

  /* Phones: one term per line, nothing clipped, no sideways scroll. */
  @media (max-width: 700px) {
    .bvi-breakdown { padding: 14px 14px 12px; }
    .bvi-bd-row { flex-direction: column; flex-wrap: nowrap; gap: 0; }
    .bvi-bd-item { width: 100%; align-items: center; gap: 8px; border-bottom: 1px solid ${withAlpha(CHART_COLORS.line, 0.08)}; }
    .bvi-bd-item:last-child { border-bottom: 0; }
    .bvi-bd-op { flex: 0 0 16px; justify-content: center; font-size: 16px; padding: 0; }
    /* Terms with no operator (the first one) still need the gutter so every
       label starts on the same x. */
    .bvi-bd-item--noop { padding-left: 24px; }
    .bvi-bd-cell { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: transparent; border: 0; border-radius: 0; padding: 11px 0; }
    .bvi-bd-l { margin-bottom: 0; white-space: normal; font-size: 10.5px; letter-spacing: .4px; }
    .bvi-bd-v { font-size: 17px; text-align: right; white-space: nowrap; }
    /* The bottom line gets a rule above it and a little more weight. */
    .bvi-bd-item--total { border-top: 1px solid ${BORDER}; margin-top: 4px; }
    .bvi-bd-item--total .bvi-bd-v { font-size: 19px; }
    .bvi-bd-item--total .bvi-bd-l { color: ${withAlpha(CHART_COLORS.line, 0.75)}; }
  }
`;

export const BuyVsInvestBreakdown = forwardRef(function BuyVsInvestBreakdown(
  { sim, activeReinvest, profitColor, hint },
  ref
) {
  const [year, setYear] = useState(30);

  useImperativeHandle(ref, () => ({
    setYear: (y) => setYear(Math.max(0, Math.min(30, y))),
  }), []);

  const b = sim.years[Math.max(0, Math.min(30, year))];
  const netColor = b.netProfit < 0 ? CHART_COLORS.accent : profitColor;

  // One entry per term of the equation. Each carries its own leading operator
  // so the list can lay out horizontally or vertically without changing shape.
  const terms = [
    { label: "Home value", value: b.homeVal },
    { op: "−", label: "Loan balance", value: b.balance },
    { op: "=", label: "Equity", value: b.equity },
    ...(activeReinvest && b.fund > 0 ? [{ op: "+", label: "Side fund", value: b.fund }] : []),
    { op: "−", label: "Down payment", value: 25000 },
    { op: "−", label: "Loan payments", value: b.loanPayments },
    { op: "−", label: "Taxes + insurance", value: b.taxesIns },
    { op: "−", label: "Mortgage insurance", value: b.mi },
    { op: "=", label: "Net profit", value: b.netProfit, color: netColor, total: true },
  ];

  return (
    <div className="bvi-breakdown" aria-live="polite">
      <div className="bvi-bd-title">How the net profit is built · Year {year}{hint ? ` (${hint})` : ""}</div>
      <div className="bvi-bd-row">
        {terms.map((t) => (
          <div
            key={t.label}
            className={`bvi-bd-item${t.op ? "" : " bvi-bd-item--noop"}${t.total ? " bvi-bd-item--total" : ""}`}
          >
            {t.op && <span className="bvi-bd-op" aria-hidden="true">{t.op}</span>}
            <div className="bvi-bd-cell">
              <div className="bvi-bd-l">{t.label}</div>
              <div className="bvi-bd-v" style={t.color ? { color: t.color } : undefined}>{fmt(t.value)}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="bvi-bd-foot">Loan payments include principal, interest, any extra payments, and, when reinvest is on, the contributions flowing into the side fund after payoff.</p>
    </div>
  );
});
