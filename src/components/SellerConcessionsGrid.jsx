import { useState, useId } from "react";
import { P, F } from "../theme";

const PROGRAMS = [
  { key: "conv", label: "Conventional", subtitle: "Fannie / Freddie" },
  { key: "fha",  label: "FHA" },
  { key: "va",   label: "VA" },
  { key: "usda", label: "USDA", subtitle: "Guaranteed" },
];

const ROWS = [
  {
    id: "primary-less-10",
    label: "Primary residence, less than 10% down",
    cells: {
      conv: {
        brief: "3% max",
        full:  "With LTV above 90%, the cap is 3% of the lesser of sales price or appraised value. This is the tightest owner-occupied cap on the page and the one most often violated in offers written from FHA memory.",
      },
      fha: {
        brief: "6% max",
        full:  "Flat 6% of the lesser of sales price or appraised value, regardless of down payment. At minimum down payment, FHA allows double the concession room of conventional.",
      },
      va: {
        brief: "All closing costs + 4% concessions",
        full:  "No VA cap on seller-paid reasonable and customary closing costs. True concessions (funding fee paid by the seller, prepaids, debt payoff, buydown escrows, gifts) are capped at 4% of the VA reasonable value from the Notice of Value.",
      },
      usda: {
        brief: "6% max",
        full:  "Up to 6% of the sales price toward the buyer's reasonable closing costs and prepaids, at any down payment including the program's standard zero down.",
      },
    },
  },
  {
    id: "primary-10-25",
    label: "Primary residence, 10% to less than 25% down",
    cells: {
      conv: {
        brief: "6% max",
        full:  "LTV from 75.01% to 90% allows 6%. Note that exactly 10% down (90.00% LTV) qualifies for this tier, which is why moving from 5% to 10% down doubles the concession ceiling.",
      },
      fha: {
        brief: "6% max (unchanged)",
        full:  "Same flat 6%. Down payment size never changes the FHA cap.",
      },
      va: {
        brief: "Same two buckets (unchanged)",
        full:  "VA's structure doesn't change with down payment. Closing costs uncapped; concessions capped at 4% of reasonable value.",
      },
      usda: {
        brief: "6% max (unchanged)",
        full:  "Same 6%. USDA borrowers putting money down is uncommon, but the cap doesn't move either way.",
      },
    },
  },
  {
    id: "primary-25-plus",
    label: "Primary residence, 25% or more down",
    cells: {
      conv: {
        brief: "9% max",
        full:  "LTV at or below 75% allows 9%, the highest cap on this page. Exactly 25% down (75.00% LTV) qualifies. On a $400,000 home that's $36,000 of capacity, enough to fund costs, points, and a deep buydown simultaneously.",
      },
      fha: {
        brief: "6% max (unchanged)",
        full:  "Still 6%. A buyer with 25% down who needs maximum concession room is usually better served by conventional at this tier.",
      },
      va: {
        brief: "Same two buckets (unchanged)",
        full:  "Unchanged structure at any down payment.",
      },
      usda: {
        brief: "6% max (unchanged)",
        full:  "Unchanged.",
      },
    },
  },
  {
    id: "second-and-investment",
    label: "Second homes and investment properties",
    cells: {
      conv: {
        brief: "Second home: same tiers. Investment: 2% flat",
        full:  "Second homes follow the same 3/6/9 LTV tiers as primary residences. Investment properties are capped at 2% of the lesser of price or value at EVERY LTV. The 2% catches investors off guard constantly; it often won't cover prepaids on an escrowed rental purchase.",
      },
      fha: {
        brief: "Owner-occupied only",
        full:  "FHA purchase financing requires owner occupancy, so the investment scenario doesn't arise. (Multi-unit FHA purchases require the borrower to occupy one unit, and the standard 6% applies.)",
      },
      va: {
        brief: "Owner-occupied only",
        full:  "VA financing requires the veteran to occupy the home. No investment-property concession scenario exists.",
      },
      usda: {
        brief: "Owner-occupied only",
        full:  "USDA requires owner occupancy of the rural property. No second home or investment use.",
      },
    },
  },
  {
    id: "what-money-pays-for",
    label: "What the money can pay for",
    cells: {
      conv: {
        brief: "Costs, prepaids, points, MI, buydowns, up to 12 mo HOA",
        full:  "Closing costs, prepaid taxes and insurance, discount points, mortgage insurance premiums, temporary or permanent buydown funds, and HOA assessments covering up to 12 months after settlement (added in the 2025 guide update). Never the down payment, reserves, or minimum borrower contribution.",
      },
      fha: {
        brief: "Costs, prepaids, points, UFMIP, buydowns",
        full:  "Closing costs, prepaids, discount points, the upfront mortgage insurance premium, and buydown funds. Never the 3.5% minimum required investment.",
      },
      va: {
        brief: "Two buckets; see what counts as a \"concession\"",
        full:  "Bucket one (uncapped): all reasonable and customary closing costs and market-normal discount points. Bucket two (4% cap): seller payment of the buyer's funding fee (buyer-paid or financed fees never touch this math), prepaid escrows, buyer debt payoff, buydown escrows, gifts like appliances, and above-market points.",
      },
      usda: {
        brief: "Costs and prepaids",
        full:  "Reasonable closing costs and prepaid items, limited to what the buyer actually owes. On modest-priced properties the actual-cost ceiling usually binds before the 6% does.",
      },
    },
  },
  {
    id: "agent-commission",
    label: "Buyer's agent commission",
    cells: {
      conv: {
        brief: "Doesn't count toward cap (if customary)",
        full:  "Per April 2024 GSE guidance, seller-paid buyer agent compensation does not count toward IPC limits when customary for the market. Caution from the 2025 update: an agent rebate NOT credited toward the transaction is a sales concession.",
      },
      fha: {
        brief: "Doesn't count toward cap (if customary)",
        full:  "FHA confirmed that customary, reasonable seller-paid buyer broker compensation is not treated as an interested party contribution under existing policy.",
      },
      va: {
        brief: "Doesn't count toward 4%; veterans may also pay their own",
        full:  "Customary seller-paid buyer agent compensation sits outside the 4% concession bucket. Separately, VA's 2024 circular permits veterans to pay their own buyer-broker charges, removing the historical bar that threatened to lock VA buyers out of the post-settlement market.",
      },
      usda: {
        brief: "Doesn't count toward 6% (clarified 2025)",
        full:  "USDA clarified in 2025 that seller funds paying the buyer's agent compensation are not counted toward the 6% concession limit.",
      },
    },
  },
  {
    id: "above-cap",
    label: "What happens above the cap",
    cells: {
      conv: {
        brief: "Excess = price reduction for LTV math",
        full:  "Excess financing concessions are reclassified as sales concessions, deducted from the sales price, and the maximum LTV is recalculated on the reduced number. An over-capped 95% LTV deal can come out of underwriting needing more cash down.",
      },
      fha: {
        brief: "Dollar-for-dollar price reduction",
        full:  "Excess over 6% is treated as an inducement to purchase; the sales price is reduced dollar-for-dollar before the maximum mortgage is calculated, shrinking the loan and forcing a restructure.",
      },
      va: {
        brief: "Excessive = unacceptable; amend the contract",
        full:  "Concessions over 4% of reasonable value are deemed excessive and unacceptable for VA guaranty. There's no price-reduction workaround; the contract must be amended to bring concessions within the cap before closing.",
      },
      usda: {
        brief: "Reduce to actual costs / amend",
        full:  "Credits beyond the 6% cap or beyond actual costs must be restructured or amended out; excess can't flow to the buyer as cash.",
      },
    },
  },
];

export function SellerConcessionsGrid() {
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
    <div className="scg-container" role="region" aria-label="Seller concession limits by loan program">
      <style>{`
        .scg-container {
          margin: 28px 0;
          font-family: ${F.body};
        }
        .scg-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .scg-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 13px;
          table-layout: fixed;
        }
        .scg-table thead th {
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
        .scg-table thead th.scg-scenario-head {
          text-align: left;
          padding-left: 18px;
          width: 22%;
        }
        .scg-prog-sub {
          display: block;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.8px;
          text-transform: none;
          color: ${P.goldLight};
          margin-top: 3px;
          font-style: italic;
        }
        .scg-table tbody tr.scg-row {
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          border-left: 3px solid transparent;
        }
        .scg-table tbody tr.scg-row:nth-child(odd)  { background: ${P.white}; }
        .scg-table tbody tr.scg-row:nth-child(even) { background: ${P.cream}; }
        .scg-table tbody tr.scg-row:hover { background: rgba(184, 134, 11, 0.06); }
        .scg-table tbody tr.scg-row.active {
          background: rgba(184, 134, 11, 0.10);
          border-left: 3px solid ${P.gold};
        }
        .scg-table tbody tr.scg-row:focus-visible { outline: 2px solid ${P.navy}; outline-offset: -2px; }
        .scg-table tbody th.scg-scenario-name {
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
        .scg-table tbody td.scg-cell {
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
        .scg-table tbody td.scg-cell:last-child { border-right: none; }
        .scg-table tbody tr.scg-panel-row { background: ${P.navyDark}; }
        .scg-table tbody tr.scg-panel-row td {
          padding: 0;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .scg-panel-inner {
          padding: 22px 24px 24px;
          background: ${P.navyDark};
          border-left: 3px solid ${P.gold};
          border-bottom: 1px solid ${P.creamDark};
        }
        .scg-panel-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 14px;
        }
        .scg-panel-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .scg-panel-cell {
          background: rgba(250, 247, 242, 0.05);
          border: 1px solid rgba(212, 168, 67, 0.25);
          border-radius: 6px;
          padding: 14px;
        }
        .scg-panel-cell-prog {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 6px;
        }
        .scg-panel-cell-text {
          font-size: 13px;
          color: ${P.cream};
          line-height: 1.6;
        }

        .scg-sr-only {
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

        .scg-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .scg-table-wrap { display: none; }
          .scg-mobile-stack { display: block; }
          .scg-mcard {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .scg-mcard.active { border-left-color: ${P.gold}; }
          .scg-mcard-title {
            display: block;
            font-size: 14px;
            font-weight: 700;
            color: ${P.navy};
            margin-bottom: 12px;
            line-height: 1.4;
          }
          .scg-mchip-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-top: 1px solid ${P.creamDark};
            cursor: pointer;
            min-height: 44px;
          }
          .scg-mchip-row:first-of-type { border-top: none; }
          .scg-mchip-prog {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            min-width: 70px;
            padding-top: 4px;
          }
          .scg-mchip-brief {
            font-size: 13px;
            color: ${P.text};
            text-align: right;
            flex: 1;
            line-height: 1.45;
          }
          .scg-mchip-row.expanded {
            flex-direction: column;
            align-items: stretch;
            background: ${P.navyDark};
            border-radius: 6px;
            padding: 12px 14px;
            margin: 8px 0;
            border-top: none;
          }
          .scg-mchip-row.expanded .scg-mchip-prog { color: ${P.goldLight}; }
          .scg-mchip-row.expanded .scg-mchip-brief {
            color: ${P.cream};
            text-align: left;
            margin-top: 6px;
            line-height: 1.6;
          }
        }

        @media print {
          .scg-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .scg-panel-inner { background: ${P.navyDark} !important; }
          .scg-panel-cell-prog { color: ${P.goldLight} !important; }
          .scg-panel-cell-text { color: ${P.cream} !important; }
        }
      `}</style>

      <div className="scg-table-wrap">
        <table className="scg-table" aria-label="Seller concessions by scenario and loan program">
          <thead>
            <tr>
              <th scope="col" className="scg-scenario-head">Comparison</th>
              {PROGRAMS.map((p) => (
                <th key={p.key} scope="col">
                  {p.label}
                  {p.subtitle && <span className="scg-prog-sub">{p.subtitle}</span>}
                </th>
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

      <div className="scg-mobile-stack">
        {ROWS.map((row) => {
          const isOpen = openId === row.id;
          return (
            <div key={row.id} className={`scg-mcard${isOpen ? " active" : ""}`}>
              <span className="scg-mcard-title">{row.label}</span>
              {PROGRAMS.map((p) => {
                const cell = row.cells[p.key];
                const expanded = isOpen;
                const chipId = `${baseId}-mchip-${row.id}-${p.key}`;
                return (
                  <div
                    key={p.key}
                    id={chipId}
                    className={`scg-mchip-row${expanded ? " expanded" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    onClick={() => toggle(row.id)}
                    onKeyDown={(e) => onKey(e, row.id)}
                  >
                    <span className="scg-mchip-prog">{p.label}</span>
                    <span className="scg-mchip-brief">{expanded ? cell.full : cell.brief}</span>
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
      <div className="scg-sr-only">
        <table>
          <caption>Seller concession limits by program: full reference</caption>
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              {PROGRAMS.map((p) => (
                <th key={p.key} scope="col">
                  {p.label}{p.subtitle ? ` (${p.subtitle})` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {PROGRAMS.map((p) => (
                  <td key={p.key}>
                    {row.cells[p.key].brief}. {row.cells[p.key].full}
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
        className={`scg-row${isOpen ? " active" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={onKey}
      >
        <th scope="row" className="scg-scenario-name">{row.label}</th>
        {PROGRAMS.map((p) => (
          <td key={p.key} className="scg-cell">{row.cells[p.key].brief}</td>
        ))}
      </tr>
      {isOpen && (
        <tr className="scg-panel-row">
          <td colSpan={PROGRAMS.length + 1}>
            <div
              className="scg-panel-inner"
              id={panelId}
              role="region"
              aria-labelledby={rowId}
            >
              <div className="scg-panel-eyebrow">{row.label}: full breakdown by program</div>
              <div className="scg-panel-grid">
                {PROGRAMS.map((p) => (
                  <div key={p.key} className="scg-panel-cell">
                    <div className="scg-panel-cell-prog">{p.label}</div>
                    <div className="scg-panel-cell-text">{row.cells[p.key].full}</div>
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
