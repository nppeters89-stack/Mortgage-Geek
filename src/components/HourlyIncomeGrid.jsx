import { useState, useId } from "react";
import { P, F } from "../theme";

const PROGRAMS = [
  { key: "fnma",  label: "FNMA" },
  { key: "fhlmc", label: "FHLMC" },
  { key: "fha",   label: "FHA" },
  { key: "va",    label: "VA" },
  { key: "usda",  label: "USDA" },
];

const SCENARIOS = [
  {
    id: "hours-dont-vary",
    label: "Hours don't vary",
    cells: {
      fnma:  { brief: "Current rate × hrs × 52 ÷ 12", full: "Current hourly rate × hours per week × 52 ÷ 12 = monthly qualifying income. Treated similarly to salaried income when hours are stable." },
      fhlmc: { brief: "Current rate × hrs × 52 ÷ 12", full: "Same calculation as Fannie Mae. Stable hours simplify the consistency analysis." },
      fha:   { brief: "Current rate × hrs × 52 ÷ 12", full: "HUD 4000.1 II.A.4.c.iii: 'For employees who are paid hourly, and whose hours do not vary, the Mortgagee must consider the Borrower's current hourly rate to calculate Effective Income.'" },
      va:    { brief: "Defers to investor", full: "VA Pamphlet 26-7 is largely silent on hourly-specific calculations. In practice, lenders apply Fannie Mae or FHA standards. Confirm with your loan officer." },
      usda:  { brief: "Treated as base wages", full: "HB-1-3555 Att. 9-A: Hourly income treated under 'base wages.' Calculation aligned with current rate × stable hours." },
    },
  },
  {
    id: "hours-vary-ytd-consistent",
    label: "Hours vary, YTD consistent with prior year",
    cells: {
      fnma:  { brief: "YTD average", full: "B3-3.3-01 (Variable Base Income, effective March 2026): When YTD earnings are roughly consistent with prior-year W-2, lender uses YTD average." },
      fhlmc: { brief: "YTD average", full: "Same framework as Fannie Mae. Two-year history standard, with YTD average usable when consistency test passes." },
      fha:   { brief: "2-year average", full: "HUD 4000.1 II.A.4.c.iii: 'For employees who are paid hourly and whose hours vary, the Mortgagee must average the income over the previous two years.'" },
      va:    { brief: "Defers to investor", full: "VA defers to lender's adopted framework. Most lenders apply Fannie or FHA standards." },
      usda:  { brief: "YTD if 1+ yr history", full: "USDA requires 1-year minimum history. With consistent YTD, lender uses YTD average for stable-pattern hourly workers." },
    },
  },
  {
    id: "hours-vary-ytd-differs",
    label: "Hours vary, YTD differs from prior year",
    cells: {
      fnma:  { brief: "Lower of YTD or prior yr", full: "When YTD departs significantly from prior year, default is the lower of the two unless documented exception applies (pay raise, medical leave, other documented leave)." },
      fhlmc: { brief: "Lower of YTD or prior yr", full: "Same framework as Fannie Mae. Lower of YTD or prior year unless documented exception." },
      fha:   { brief: "2-year average", full: "FHA's standard 2-year averaging applies regardless of YTD vs. prior-year variance, unless the documented pay-raise exception is invoked." },
      va:    { brief: "Defers to investor", full: "VA defers to lender's adopted framework." },
      usda:  { brief: "Lower of YTD or available", full: "Conservative averaging when YTD trends differ significantly from prior period." },
    },
  },
  {
    id: "pay-rate-increase",
    label: "Pay rate increase documented",
    cells: {
      fnma:  { brief: "New rate × hours", full: "Documented pay rate increase allows underwriter to use the new rate going forward, supporting use of YTD average at the higher rate." },
      fhlmc: { brief: "New rate × hours", full: "Same as Fannie Mae. Documented pay rate increase recognized in calculation." },
      fha:   { brief: "12-mo avg × current rate", full: "HUD 4000.1 II.A.4.c.iii: 'If the Mortgagee can document an increase in pay rate, the Mortgagee may use the most recent 12-month average of hours at the current pay rate.' This is FHA's most generous exception for hourly borrowers." },
      va:    { brief: "Defers to investor", full: "VA defers to lender's adopted framework. Documented pay rate increase typically honored under either Fannie or FHA frameworks." },
      usda:  { brief: "Pay rate change honored", full: "Documented pay rate increases are recognized; calculation uses current rate." },
    },
  },
  {
    id: "minimum-history",
    label: "Minimum history requirement",
    cells: {
      fnma:  { brief: "2 years", full: "Two-year history of variable base income is the standard. Less than 2 years requires documented positive factors." },
      fhlmc: { brief: "2 years", full: "Two-year history standard. 12-24 months may be considered with documented positive factors." },
      fha:   { brief: "2 years (12 mo w/ factors)", full: "Two-year uninterrupted history is the default. 12-month history may be considered with strong positive factors documented." },
      va:    { brief: "Defers to investor", full: "VA defers to lender's adopted framework on history requirements." },
      usda:  { brief: "1 year minimum", full: "USDA's 1-year minimum is more lenient than other programs. Income must still be documented as stable." },
    },
  },
];

export function HourlyIncomeGrid() {
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
    <div className="hig-container" role="region" aria-label="Hourly income calculation rules by loan program">
      <style>{`
        .hig-container {
          margin: 28px 0;
          font-family: ${F.body};
        }
        .hig-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .hig-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 13px;
          table-layout: fixed;
        }
        .hig-table thead th {
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
        .hig-table thead th.hig-scenario-head {
          text-align: left;
          padding-left: 18px;
          width: 26%;
        }
        .hig-table tbody tr.hig-row {
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          border-left: 3px solid transparent;
        }
        .hig-table tbody tr.hig-row:nth-child(odd)  { background: ${P.white}; }
        .hig-table tbody tr.hig-row:nth-child(even) { background: ${P.cream}; }
        .hig-table tbody tr.hig-row:hover { background: rgba(207, 51, 56, 0.06); }
        .hig-table tbody tr.hig-row.active {
          background: rgba(207, 51, 56, 0.10);
          border-left: 3px solid ${P.gold};
        }
        .hig-table tbody tr.hig-row:focus-visible { outline: 2px solid ${P.navy}; outline-offset: -2px; }
        .hig-table tbody th.hig-scenario-name {
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
        .hig-table tbody td.hig-cell {
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
        .hig-table tbody td.hig-cell:last-child { border-right: none; }
        .hig-table tbody tr.hig-panel-row { background: ${P.navyDark}; }
        .hig-table tbody tr.hig-panel-row td {
          padding: 0;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .hig-panel-inner {
          padding: 22px 24px 24px;
          background: ${P.navyDark};
          border-left: 3px solid ${P.gold};
          border-bottom: 1px solid ${P.creamDark};
        }
        .hig-panel-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 14px;
        }
        .hig-panel-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .hig-panel-cell {
          background: rgba(250, 247, 242, 0.05);
          border: 1px solid rgba(207, 51, 56, 0.25);
          border-radius: 6px;
          padding: 14px;
        }
        .hig-panel-cell-prog {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 6px;
        }
        .hig-panel-cell-text {
          font-size: 13px;
          color: ${P.cream};
          line-height: 1.6;
        }

        .hig-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .hig-table-wrap { display: none; }
          .hig-mobile-stack { display: block; }
          .hig-mcard {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .hig-mcard.active { border-left-color: ${P.gold}; }
          .hig-mcard-title {
            display: block;
            font-size: 14px;
            font-weight: 700;
            color: ${P.navy};
            margin-bottom: 12px;
            line-height: 1.4;
          }
          .hig-mchip-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-top: 1px solid ${P.creamDark};
            cursor: pointer;
            min-height: 44px;
          }
          .hig-mchip-row:first-of-type { border-top: none; }
          .hig-mchip-prog {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            min-width: 70px;
            padding-top: 4px;
          }
          .hig-mchip-brief {
            font-size: 13px;
            color: ${P.text};
            text-align: right;
            flex: 1;
            line-height: 1.45;
          }
          .hig-mchip-row.expanded {
            flex-direction: column;
            align-items: stretch;
            background: ${P.navyDark};
            border-radius: 6px;
            padding: 12px 14px;
            margin: 8px 0;
            border-top: none;
          }
          .hig-mchip-row.expanded .hig-mchip-prog { color: ${P.goldLight}; }
          .hig-mchip-row.expanded .hig-mchip-brief {
            color: ${P.cream};
            text-align: left;
            margin-top: 6px;
            line-height: 1.6;
          }
        }

        @media print {
          .hig-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .hig-panel-inner { background: ${P.navyDark} !important; }
          .hig-panel-cell-prog { color: ${P.goldLight} !important; }
          .hig-panel-cell-text { color: ${P.cream} !important; }
        }
      `}</style>

      <div className="hig-table-wrap">
        <table className="hig-table" aria-label="Hourly income calculation by scenario and loan program">
          <thead>
            <tr>
              <th scope="col" className="hig-scenario-head">Scenario</th>
              {PROGRAMS.map((p) => (
                <th key={p.key} scope="col">{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((s) => {
              const isOpen = openId === s.id;
              const panelId = `${baseId}-panel-${s.id}`;
              const rowId = `${baseId}-row-${s.id}`;
              return (
                <RowGroup
                  key={s.id}
                  scenario={s}
                  isOpen={isOpen}
                  rowId={rowId}
                  panelId={panelId}
                  onToggle={() => toggle(s.id)}
                  onKey={(e) => onKey(e, s.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="hig-mobile-stack">
        {SCENARIOS.map((s) => {
          const isOpen = openId === s.id;
          return (
            <div key={s.id} className={`hig-mcard${isOpen ? " active" : ""}`}>
              <span className="hig-mcard-title">{s.label}</span>
              {PROGRAMS.map((p) => {
                const cell = s.cells[p.key];
                const expanded = isOpen;
                const chipId = `${baseId}-mchip-${s.id}-${p.key}`;
                return (
                  <div
                    key={p.key}
                    id={chipId}
                    className={`hig-mchip-row${expanded ? " expanded" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    onClick={() => toggle(s.id)}
                    onKeyDown={(e) => onKey(e, s.id)}
                  >
                    <span className="hig-mchip-prog">{p.label}</span>
                    <span className="hig-mchip-brief">{expanded ? cell.full : cell.brief}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RowGroup({ scenario, isOpen, rowId, panelId, onToggle, onKey }) {
  return (
    <>
      <tr
        id={rowId}
        className={`hig-row${isOpen ? " active" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={onKey}
      >
        <th scope="row" className="hig-scenario-name">{scenario.label}</th>
        {PROGRAMS.map((p) => (
          <td key={p.key} className="hig-cell">{scenario.cells[p.key].brief}</td>
        ))}
      </tr>
      {isOpen && (
        <tr className="hig-panel-row">
          <td colSpan={PROGRAMS.length + 1}>
            <div
              className="hig-panel-inner"
              id={panelId}
              role="region"
              aria-labelledby={rowId}
            >
              <div className="hig-panel-eyebrow">{scenario.label} — full guidance by program</div>
              <div className="hig-panel-grid">
                {PROGRAMS.map((p) => (
                  <div key={p.key} className="hig-panel-cell">
                    <div className="hig-panel-cell-prog">{p.label}</div>
                    <div className="hig-panel-cell-text">{scenario.cells[p.key].full}</div>
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
