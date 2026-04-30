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
    id: "pt-2plus-years",
    label: "Part-time / secondary, 2+ years history",
    cells: {
      fnma:  { brief: "Standard qualifying", full: "B3-3.4-01: 2+ years of uninterrupted history meets the standard requirement. Income usable for qualifying." },
      fhlmc: { brief: "Standard qualifying", full: "Section 5303.2(a)(ii): 2-year history considered stable. Standard qualifying treatment applies." },
      fha:   { brief: "Standard qualifying", full: "HUD 4000.1 II.A.4.c.iv & vi: Uninterrupted 2-year history meets standard. Reasonable expectation of continuance required. Income averaged over 2-year period." },
      va:    { brief: "Standard qualifying", full: "VA Pamphlet 26-7 Chap 4 Sec 2-h: 2 years of stable, reliable secondary income meets standard. Continuance and consistency required." },
      usda:  { brief: "Standard qualifying", full: "HB-1-3555 Att. 9-A: 2-year history with presumed continuance unless documented evidence of cessation." },
    },
  },
  {
    id: "pt-12-24-months",
    label: "Part-time / secondary, 12-24 months history",
    cells: {
      fnma:  { brief: "Allowed w/ positive factors", full: "12-24 months allowed if documented positive factors offset shorter history (income trending up, same line of work, consistent receipt across employers, documented continuance)." },
      fhlmc: { brief: "Allowed w/ positive factors", full: "12-24 months may be considered with documented stability. Specific example given: borrower had full-time job in same line of work but must now work multiple part-time jobs; consistency must be demonstrated." },
      fha:   { brief: "Allowed if documented", full: "HUD 4000.1 allows shorter history if positive factors are documented. Underwriter discretion applies; documentation must be strong." },
      va:    { brief: "Allowed w/ stability", full: "VA Pamphlet 26-7: Stability and reliability for the period must be demonstrated; underwriter judgment applies." },
      usda:  { brief: "Generally requires 2 years", full: "USDA generally enforces the 2-year requirement. Less than 2 years rarely accepted for part-time / secondary income." },
    },
  },
  {
    id: "pt-under-12-months",
    label: "Part-time / secondary, less than 12 months",
    cells: {
      fnma:  { brief: "Generally excluded", full: "Less than 12 months of history is below the agency floor. Income generally cannot be used in qualifying." },
      fhlmc: { brief: "Generally excluded", full: "Below agency minimum. Income excluded." },
      fha:   { brief: "Generally excluded", full: "Below FHA threshold; income excluded from qualifying." },
      va:    { brief: "Generally excluded", full: "VA stability requirement cannot be demonstrated with less than 12 months of receipt." },
      usda:  { brief: "Excluded", full: "Below USDA threshold; income not usable for qualifying." },
    },
  },
  {
    id: "seasonal-2plus",
    label: "Seasonal, 2+ years same line of work",
    cells: {
      fnma:  { brief: "2-yr avg + rehire confirmation", full: "B3-3.3-08 (Seasonal Income, effective March 2026): 2 years in same job. Confirm with employer there is reasonable expectation of rehire next season. Income averaged over 2 full years." },
      fhlmc: { brief: "2-yr avg + rehire confirmation", full: "Section 5303.2(a)(ii): 2 years same job. Reasonable expectation of rehire required. Specific example: teacher who works summer school in school system, demonstrated for at least 1 year and expected next year." },
      fha:   { brief: "2-yr avg + rehire confirmation", full: "HUD 4000.1 defines seasonal as 'not year-round' regardless of hours per week. Verify same line of work for 2 years. Average seasonal income over 2 full years. Verify likely rehire for next season." },
      va:    { brief: "Defers to lender", full: "VA Pamphlet 26-7 is largely silent on seasonal jobs specifically. Lender applies Fannie or FHA framework in practice." },
      usda:  { brief: "2-yr avg + presumed continuance", full: "HB-1-3555 Att. 9-A: 2-year history with presumed continuance unless documented cessation." },
    },
  },
  {
    id: "off-season-unemployment",
    label: "Off-season unemployment income",
    cells: {
      fnma:  { brief: "Usable with 2-yr history", full: "Documented unemployment income from seasonal layoff, expected to recur, reported on federal tax returns. 2-year history required." },
      fhlmc: { brief: "Usable with 2-yr history", full: "Same framework as Fannie Mae. Off-season unemployment usable when documented as recurring seasonal pattern with tax return support." },
      fha:   { brief: "Usable with 2-yr history", full: "HUD 4000.1: Unemployment income from off-season may be considered if 2 full years have been received and documented as part of seasonal pattern." },
      va:    { brief: "Defers to lender", full: "VA defers to lender's adopted framework." },
      usda:  { brief: "Per general framework", full: "USDA applies general income continuance framework. Documented and recurring off-season income usable per stability requirements." },
    },
  },
];

export function PartTimeSeasonalGrid() {
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
    <div className="pts-container" role="region" aria-label="Part-time, secondary, and seasonal income rules by loan program">
      <style>{`
        .pts-container {
          margin: 28px 0;
          font-family: ${F.body};
        }
        .pts-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pts-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 13px;
          table-layout: fixed;
        }
        .pts-table thead th {
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
        .pts-table thead th.pts-scenario-head {
          text-align: left;
          padding-left: 18px;
          width: 30%;
        }
        .pts-table tbody tr.pts-row {
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          border-left: 3px solid transparent;
        }
        .pts-table tbody tr.pts-row:nth-child(odd)  { background: ${P.white}; }
        .pts-table tbody tr.pts-row:nth-child(even) { background: ${P.cream}; }
        .pts-table tbody tr.pts-row:hover { background: rgba(184, 134, 11, 0.06); }
        .pts-table tbody tr.pts-row.active {
          background: rgba(184, 134, 11, 0.10);
          border-left: 3px solid ${P.gold};
        }
        .pts-table tbody tr.pts-row:focus-visible { outline: 2px solid ${P.navy}; outline-offset: -2px; }
        .pts-table tbody th.pts-scenario-name {
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
        .pts-table tbody td.pts-cell {
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
        .pts-table tbody td.pts-cell:last-child { border-right: none; }
        .pts-table tbody tr.pts-panel-row { background: ${P.navyDark}; }
        .pts-table tbody tr.pts-panel-row td {
          padding: 0;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pts-panel-inner {
          padding: 22px 24px 24px;
          background: ${P.navyDark};
          border-left: 3px solid ${P.gold};
          border-bottom: 1px solid ${P.creamDark};
        }
        .pts-panel-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 14px;
        }
        .pts-panel-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .pts-panel-cell {
          background: rgba(250, 247, 242, 0.05);
          border: 1px solid rgba(212, 168, 67, 0.25);
          border-radius: 6px;
          padding: 14px;
        }
        .pts-panel-cell-prog {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 6px;
        }
        .pts-panel-cell-text {
          font-size: 13px;
          color: ${P.cream};
          line-height: 1.6;
        }

        .pts-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .pts-table-wrap { display: none; }
          .pts-mobile-stack { display: block; }
          .pts-mcard {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .pts-mcard.active { border-left-color: ${P.gold}; }
          .pts-mcard-title {
            display: block;
            font-size: 14px;
            font-weight: 700;
            color: ${P.navy};
            margin-bottom: 12px;
            line-height: 1.4;
          }
          .pts-mchip-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-top: 1px solid ${P.creamDark};
            cursor: pointer;
            min-height: 44px;
          }
          .pts-mchip-row:first-of-type { border-top: none; }
          .pts-mchip-prog {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            min-width: 70px;
            padding-top: 4px;
          }
          .pts-mchip-brief {
            font-size: 13px;
            color: ${P.text};
            text-align: right;
            flex: 1;
            line-height: 1.45;
          }
          .pts-mchip-row.expanded {
            flex-direction: column;
            align-items: stretch;
            background: ${P.navyDark};
            border-radius: 6px;
            padding: 12px 14px;
            margin: 8px 0;
            border-top: none;
          }
          .pts-mchip-row.expanded .pts-mchip-prog { color: ${P.goldLight}; }
          .pts-mchip-row.expanded .pts-mchip-brief {
            color: ${P.cream};
            text-align: left;
            margin-top: 6px;
            line-height: 1.6;
          }
        }

        @media print {
          .pts-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .pts-panel-inner { background: ${P.navyDark} !important; }
          .pts-panel-cell-prog { color: ${P.goldLight} !important; }
          .pts-panel-cell-text { color: ${P.cream} !important; }
        }
      `}</style>

      <div className="pts-table-wrap">
        <table className="pts-table" aria-label="Part-time, secondary, and seasonal income by scenario and loan program">
          <thead>
            <tr>
              <th scope="col" className="pts-scenario-head">Scenario</th>
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

      <div className="pts-mobile-stack">
        {SCENARIOS.map((s) => {
          const isOpen = openId === s.id;
          return (
            <div key={s.id} className={`pts-mcard${isOpen ? " active" : ""}`}>
              <span className="pts-mcard-title">{s.label}</span>
              {PROGRAMS.map((p) => {
                const cell = s.cells[p.key];
                const expanded = isOpen;
                const chipId = `${baseId}-mchip-${s.id}-${p.key}`;
                return (
                  <div
                    key={p.key}
                    id={chipId}
                    className={`pts-mchip-row${expanded ? " expanded" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    onClick={() => toggle(s.id)}
                    onKeyDown={(e) => onKey(e, s.id)}
                  >
                    <span className="pts-mchip-prog">{p.label}</span>
                    <span className="pts-mchip-brief">{expanded ? cell.full : cell.brief}</span>
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
        className={`pts-row${isOpen ? " active" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={onKey}
      >
        <th scope="row" className="pts-scenario-name">{scenario.label}</th>
        {PROGRAMS.map((p) => (
          <td key={p.key} className="pts-cell">{scenario.cells[p.key].brief}</td>
        ))}
      </tr>
      {isOpen && (
        <tr className="pts-panel-row">
          <td colSpan={PROGRAMS.length + 1}>
            <div
              className="pts-panel-inner"
              id={panelId}
              role="region"
              aria-labelledby={rowId}
            >
              <div className="pts-panel-eyebrow">{scenario.label} — full guidance by program</div>
              <div className="pts-panel-grid">
                {PROGRAMS.map((p) => (
                  <div key={p.key} className="pts-panel-cell">
                    <div className="pts-panel-cell-prog">{p.label}</div>
                    <div className="pts-panel-cell-text">{scenario.cells[p.key].full}</div>
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
