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

const CREAM = CHART_COLORS.line;
const MUT = withAlpha(CHART_COLORS.line, 0.55);
const DIM = withAlpha(CHART_COLORS.line, 0.4);
const BORDER = withAlpha(CHART_COLORS.line, 0.14);
const INSET = withAlpha(CHART_COLORS.line, 0.04);

export const breakdownCss = `
  .bvi-breakdown { margin-top: 18px; border: 1px solid ${BORDER}; border-radius: 12px; padding: 14px 16px; background: ${INSET}; }
  .bvi-bd-title { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: ${MUT}; margin-bottom: 12px; }
  .bvi-bd-row { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px; }
  .bvi-bd-op { display: flex; align-items: center; font-family: ${F.display}; font-size: 18px; color: ${DIM}; padding: 0 1px; }
  .bvi-bd-cell { min-width: 96px; background: ${P.navyDark}; border: 1px solid ${BORDER}; border-radius: 8px; padding: 8px 10px; }
  .bvi-bd-l { font-size: 9.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: ${MUT}; margin-bottom: 4px; white-space: nowrap; }
  .bvi-bd-v { font-family: ${F.display}; font-size: 15px; color: ${CREAM}; }
  .bvi-bd-foot { font-size: 11px; line-height: 1.5; color: ${withAlpha(CHART_COLORS.line, 0.55)}; margin: 12px 0 0; }

  /* On phones the strip scrolls inside its own box rather than widening the page. */
  @media (max-width: 700px) {
    .bvi-bd-row { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; }
    .bvi-bd-cell { flex: 0 0 auto; }
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

  return (
    <div className="bvi-breakdown" aria-live="polite">
      <div className="bvi-bd-title">How the net profit is built · Year {year}{hint ? ` (${hint})` : ""}</div>
      <div className="bvi-bd-row">
        <BdCell label="Home value" value={fmt(b.homeVal)} />
        <Op>−</Op><BdCell label="Loan balance" value={fmt(b.balance)} />
        <Op>=</Op><BdCell label="Equity" value={fmt(b.equity)} />
        {activeReinvest && b.fund > 0 && (<><Op>+</Op><BdCell label="Side fund" value={fmt(b.fund)} /></>)}
        <Op>−</Op><BdCell label="Down payment" value={fmt(25000)} />
        <Op>−</Op><BdCell label="Loan payments" value={fmt(b.loanPayments)} />
        <Op>−</Op><BdCell label="Taxes + insurance" value={fmt(b.taxesIns)} />
        <Op>−</Op><BdCell label="Mortgage insurance" value={fmt(b.mi)} />
        <Op>=</Op><BdCell label="Net profit" value={fmt(b.netProfit)} valueColor={netColor} />
      </div>
      <p className="bvi-bd-foot">Loan payments include principal, interest, any extra payments, and, when reinvest is on, the contributions flowing into the side fund after payoff.</p>
    </div>
  );
});

function Op({ children }) {
  return <span className="bvi-bd-op" aria-hidden="true">{children}</span>;
}

function BdCell({ label, value, valueColor }) {
  return (
    <div className="bvi-bd-cell">
      <div className="bvi-bd-l">{label}</div>
      <div className="bvi-bd-v" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
    </div>
  );
}
