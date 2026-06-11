import { useState, useId } from "react";
import { P, F } from "../theme";

const OPTIONS = [
  { key: "price",   label: "Price Cut" },
  { key: "costs",   label: "Closing Costs" },
  { key: "points",  label: "Permanent Points" },
  { key: "twoone",  label: "2-1 Buydown" },
];

const ROWS = [
  {
    id: "monthly-payment-effect",
    label: "Monthly payment effect",
    cells: {
      price: {
        brief: "Saves $63/mo",
        full:  "Loan drops to $370,500; payment drops to $2,465. The smallest monthly lever on the page because the value spreads across 360 payments.",
      },
      costs: {
        brief: "No change",
        full:  "Payment stays $2,528. This option trades monthly relief for day-one cash relief.",
      },
      points: {
        brief: "Saves $157/mo, permanent",
        full:  "Rate drops from 7.00% to roughly 6.375% (conservative 0.25% per point assumption; confirm real pricing with your lender after lock). Payment drops to $2,371 for the life of the loan.",
      },
      twoone: {
        brief: "Saves $488/mo yr 1, $250/mo yr 2",
        full:  "Year one paid as if 5.00% ($2,040); year two as if 6.00% ($2,278); full $2,528 from year three on. Note rate never changes; an escrow subsidy covers the difference.",
      },
    },
  },
  {
    id: "cash-at-closing-effect",
    label: "Cash at closing effect",
    cells: {
      price: {
        brief: "Down payment drops $500",
        full:  "5% of a $10,000 lower price. Modest, but real.",
      },
      costs: {
        brief: "Cash to close drops $10,000",
        full:  "Dollar-for-dollar relief, capped at your actual costs and prepaids. Credit beyond actual costs evaporates; size the ask to the real number.",
      },
      points: {
        brief: "No change",
        full:  "The credit pays the points; your down payment and costs are unaffected.",
      },
      twoone: {
        brief: "Leftover $1,143 to costs",
        full:  "The 2-1 costs $8,857 on this loan, so a $10,000 credit funds the full buydown with $1,143 remaining for closing costs.",
      },
    },
  },
  {
    id: "five-year-value-returned",
    label: "Five-year value returned",
    cells: {
      price: {
        brief: "$3,792 relief + $9,500 less owed",
        full:  "Sixty months at $63. The rest of the value is stored as a smaller balance, not delivered as cash flow.",
      },
      costs: {
        brief: "$10,000, all on day one",
        full:  "No ongoing relief, but the full credit lands immediately as cash you didn't spend.",
      },
      points: {
        brief: "$9,447 and still going",
        full:  "Best long-run option on the page. Crosses the 2-1's total around year three and never stops accruing.",
      },
      twoone: {
        brief: "$8,857, all in 24 months",
        full:  "Maximum early relief, zero after year two. Wins if your squeeze (or your income gap) lives in the first two years.",
      },
    },
  },
  {
    id: "effect-on-qualifying",
    label: "Effect on qualifying",
    cells: {
      price: {
        brief: "Slightly smaller loan",
        full:  "Marginally lower payment helps DTI a little. Rarely decisive.",
      },
      costs: {
        brief: "None",
        full:  "Qualifying payment unchanged.",
      },
      points: {
        brief: "Qualify at the LOWER rate",
        full:  "The bought-down rate IS the note rate, so underwriting uses the reduced payment. The only option here that meaningfully shrinks DTI; can turn a marginal file into an approval.",
      },
      twoone: {
        brief: "Qualify at the FULL rate",
        full:  "Fannie, FHA, and VA all require qualifying at the note rate, not the bought-down payment. The year-one payment helps your budget, not your approval.",
      },
    },
  },
  {
    id: "watch-out-for",
    label: "Watch out for",
    cells: {
      price: {
        brief: "Weak monthly relief",
        full:  "Don't take it by default. Its honest use cases: appraisal risk, or wanting a smaller balance after costs are already handled. It's also the only option that consumes none of your concession cap.",
      },
      costs: {
        brief: "The actual-cost ceiling",
        full:  "Credits can't exceed what you really owe. Get the lender's cash-to-close number BEFORE setting the ask, and check the program's concession cap (3% on this example loan).",
      },
      points: {
        brief: "Timeline risk + live pricing",
        full:  "Refinance or sell early and the value never accrues. Point pricing changes daily with diminishing returns when stacking; the 0.25%-per-point figure is a planning assumption, never a quote.",
      },
      twoone: {
        brief: "The year-three step-up",
        full:  "Make sure today's income covers the full payment comfortably; a buydown should make two years cheaper, not make an unaffordable home look affordable. Refund of unused escrow on refi or sale is the consolation, not the plan. Seller-funded buydowns also count toward concession caps.",
      },
    },
  },
];

export function SellerCreditDeploymentGrid() {
  const [openId, setOpenId] = useState(null);
  const baseId = useId();

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  const onKey = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  return (
    <div className="scdg-container" role="region" aria-label="Seller credit deployment comparison by option">
      <style>{`
        .scdg-container {
          margin: 28px 0;
          font-family: ${F.body};
        }
        .scdg-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .scdg-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 13px;
          table-layout: fixed;
        }
        .scdg-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px 8px;
          text-align: center;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .scdg-table thead th.scdg-scenario-head {
          text-align: left;
          padding-left: 18px;
          width: 22%;
        }
        .scdg-table tbody tr.scdg-row {
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          border-left: 3px solid transparent;
        }
        .scdg-table tbody tr.scdg-row:nth-child(odd)  { background: ${P.white}; }
        .scdg-table tbody tr.scdg-row:nth-child(even) { background: ${P.cream}; }
        .scdg-table tbody tr.scdg-row:hover { background: rgba(184, 134, 11, 0.06); }
        .scdg-table tbody tr.scdg-row.active {
          background: rgba(184, 134, 11, 0.10);
          border-left: 3px solid ${P.gold};
        }
        .scdg-table tbody tr.scdg-row:focus-visible { outline: 2px solid ${P.navy}; outline-offset: -2px; }
        .scdg-table tbody th.scdg-scenario-name {
          text-align: left;
          padding: 14px 14px 14px 16px;
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 13.5px;
          line-height: 1.4;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
        }
        .scdg-table tbody td.scdg-cell {
          padding: 14px 10px;
          text-align: center;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
          color: ${P.text};
          font-size: 13px;
          font-weight: 400;
          line-height: 1.4;
        }
        .scdg-table tbody td.scdg-cell:last-child { border-right: none; }
        .scdg-table tbody tr.scdg-panel-row { background: ${P.navyDark}; }
        .scdg-table tbody tr.scdg-panel-row td {
          padding: 0;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .scdg-panel-inner {
          padding: 22px 24px 24px;
          background: ${P.navyDark};
          border-left: 3px solid ${P.gold};
          border-bottom: 1px solid ${P.creamDark};
        }
        .scdg-panel-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 14px;
        }
        .scdg-panel-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .scdg-panel-cell {
          background: rgba(250, 247, 242, 0.05);
          border: 1px solid rgba(212, 168, 67, 0.25);
          border-radius: 6px;
          padding: 14px;
        }
        .scdg-panel-cell-prog {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 6px;
        }
        .scdg-panel-cell-text {
          font-size: 13px;
          color: ${P.cream};
          line-height: 1.6;
        }

        .scdg-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .scdg-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .scdg-table-wrap { display: none; }
          .scdg-mobile-stack { display: block; }
          .scdg-mcard {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .scdg-mcard.active { border-left-color: ${P.gold}; }
          .scdg-mcard-title {
            display: block;
            font-size: 14px;
            font-weight: 700;
            color: ${P.navy};
            margin-bottom: 12px;
            line-height: 1.4;
          }
          .scdg-mchip-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-top: 1px solid ${P.creamDark};
            cursor: pointer;
            min-height: 44px;
          }
          .scdg-mchip-row:first-of-type { border-top: none; }
          .scdg-mchip-prog {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            min-width: 90px;
            padding-top: 4px;
          }
          .scdg-mchip-brief {
            font-size: 13px;
            color: ${P.text};
            text-align: right;
            flex: 1;
            line-height: 1.45;
          }
          .scdg-mchip-row.expanded {
            flex-direction: column;
            align-items: stretch;
            background: ${P.navyDark};
            border-radius: 6px;
            padding: 12px 14px;
            margin: 8px 0;
            border-top: none;
          }
          .scdg-mchip-row.expanded .scdg-mchip-prog { color: ${P.goldLight}; }
          .scdg-mchip-row.expanded .scdg-mchip-brief {
            color: ${P.cream};
            text-align: left;
            margin-top: 6px;
            line-height: 1.6;
          }
        }

        @media print {
          .scdg-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .scdg-panel-inner { background: ${P.navyDark} !important; }
          .scdg-panel-cell-prog { color: ${P.goldLight} !important; }
          .scdg-panel-cell-text { color: ${P.cream} !important; }
        }
      `}</style>

      <div className="scdg-table-wrap">
        <table className="scdg-table" aria-label="Seller credit deployment by criterion and option">
          <thead>
            <tr>
              <th scope="col" className="scdg-scenario-head">Comparison</th>
              {OPTIONS.map((o) => (
                <th key={o.key} scope="col">{o.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const isOpen = openId === row.id;
              const panelId = `${baseId}-panel-${row.id}`;
              const rowId = `${baseId}-row-${row.id}`;
              return (
                <RowGroup
                  key={row.id}
                  row={row}
                  isOpen={isOpen}
                  rowId={rowId}
                  panelId={panelId}
                  onToggle={() => toggle(row.id)}
                  onKey={(e) => onKey(e, row.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="scdg-mobile-stack">
        {ROWS.map((row) => {
          const isOpen = openId === row.id;
          return (
            <div key={row.id} className={`scdg-mcard${isOpen ? " active" : ""}`}>
              <span className="scdg-mcard-title">{row.label}</span>
              {OPTIONS.map((o) => {
                const cell = row.cells[o.key];
                const expanded = isOpen;
                const chipId = `${baseId}-mchip-${row.id}-${o.key}`;
                return (
                  <div
                    key={o.key}
                    id={chipId}
                    className={`scdg-mchip-row${expanded ? " expanded" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    onClick={() => toggle(row.id)}
                    onKeyDown={(e) => onKey(e, row.id)}
                  >
                    <span className="scdg-mchip-prog">{o.label}</span>
                    <span className="scdg-mchip-brief">{expanded ? cell.full : cell.brief}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Static fallback table for crawlers / non-JS / screen readers.
          Mirrors every brief + full cell so the grid is indexable even
          when the interactive layer is unavailable. */}
      <div className="scdg-sr-only">
        <table>
          <caption>Seller credit deployment: full reference by option and criterion</caption>
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              {OPTIONS.map((o) => (
                <th key={o.key} scope="col">{o.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {OPTIONS.map((o) => (
                  <td key={o.key}>
                    {row.cells[o.key].brief}. {row.cells[o.key].full}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowGroup({ row, isOpen, rowId, panelId, onToggle, onKey }) {
  return (
    <>
      <tr
        id={rowId}
        className={`scdg-row${isOpen ? " active" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={onKey}
      >
        <th scope="row" className="scdg-scenario-name">{row.label}</th>
        {OPTIONS.map((o) => (
          <td key={o.key} className="scdg-cell">{row.cells[o.key].brief}</td>
        ))}
      </tr>
      {isOpen && (
        <tr className="scdg-panel-row">
          <td colSpan={OPTIONS.length + 1}>
            <div
              className="scdg-panel-inner"
              id={panelId}
              role="region"
              aria-labelledby={rowId}
            >
              <div className="scdg-panel-eyebrow">{row.label}: full breakdown by option</div>
              <div className="scdg-panel-grid">
                {OPTIONS.map((o) => (
                  <div key={o.key} className="scdg-panel-cell">
                    <div className="scdg-panel-cell-prog">{o.label}</div>
                    <div className="scdg-panel-cell-text">{row.cells[o.key].full}</div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
