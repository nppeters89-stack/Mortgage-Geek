import { P, F } from "../theme";
import { withAlpha } from "../utils/format";

const ROWS = [
  {
    loanType: "Conventional",
    loanSub: "Fannie Mae",
    required: { lead: "Optional.", body: "May be requested if application is 120+ days after last business tax year-end." },
    canIncrease: { verdict: "no", text: "No, even if audited." },
  },
  {
    loanType: "Conventional",
    loanSub: "Freddie Mac",
    required: { lead: "Optional.", body: "May be requested if application is 120+ days after last business tax year-end." },
    canIncrease: { verdict: "yes", text: "Yes, if audited." },
  },
  {
    loanType: "FHA",
    required: { lead: "Required", body: "if a calendar quarter or more has elapsed since last tax year-end." },
    canIncrease: { verdict: "yes", text: "Yes, if audited." },
  },
  {
    loanType: "VA",
    required: { lead: "Optional on AUS files.", body: "Required on manual underwrites if 7+ months have elapsed since last tax year-end." },
    canIncrease: { verdict: "yes", text: "Yes, if audited." },
  },
  {
    loanType: "USDA",
    loanSub: "Rural Development",
    required: { lead: "Required.", body: "" },
    canIncrease: { verdict: "no", text: "No, even if audited." },
  },
];

const VERDICT_VISUALS = {
  yes: { color: P.success, accent: P.success, bg: withAlpha(P.success, 0.10) },
  no:  { color: P.warmGray, accent: P.warmGrayLight, bg: withAlpha(P.warmGray, 0.06) },
};

export function PLRequirementsGrid() {
  return (
    <div className="plr-container" role="region" aria-label="Profit and loss statement requirements by loan program">
      <style>{`
        .plr-container {
          margin: 28px 0;
          font-family: ${F.body};
        }

        .plr-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .plr-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
          table-layout: fixed;
        }
        .plr-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px 16px;
          text-align: left;
          border: none;
          vertical-align: middle;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .plr-table thead th.plr-loan-head { width: 22%; }
        .plr-table thead th.plr-required-head { width: 44%; }

        .plr-table tbody tr:nth-child(odd) { background: ${P.white}; }
        .plr-table tbody tr:nth-child(even) { background: ${P.cream}; }
        .plr-table tbody td {
          padding: 18px 16px;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: top;
          line-height: 1.55;
          font-size: 14px;
          color: ${P.text};
        }
        .plr-table tbody tr:last-child td { border-bottom: none; }
        .plr-table tbody td:last-child { border-right: none; }

        .plr-loan {
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 15px;
          line-height: 1.3;
        }
        .plr-loan-sub {
          display: block;
          font-size: 12px;
          font-weight: 400;
          color: ${P.warmGray};
          font-style: italic;
          margin-top: 3px;
        }

        .plr-lead {
          font-weight: 700;
          color: ${P.navy};
        }
        .plr-body {
          display: block;
          margin-top: 4px;
          color: ${P.text};
        }

        .plr-verdict {
          border-left: 3px solid;
          padding: 4px 0 4px 12px;
          margin-left: 2px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .plr-verdict-text {
          font-weight: 600;
        }

        .plr-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .plr-table-wrap { display: none; }
          .plr-mobile-stack { display: block; }
          .plr-mobile-card {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .plr-mobile-title {
            display: block;
            font-size: 15px;
            font-weight: 700;
            color: ${P.navy};
            line-height: 1.3;
          }
          .plr-mobile-sub {
            display: block;
            font-size: 12px;
            font-weight: 400;
            color: ${P.warmGray};
            font-style: italic;
            margin-top: 2px;
            margin-bottom: 12px;
          }
          .plr-mobile-row {
            padding: 12px 0;
            border-top: 1px solid ${P.creamDark};
          }
          .plr-mobile-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            margin-bottom: 6px;
          }
          .plr-mobile-content {
            font-size: 14px;
            line-height: 1.55;
            color: ${P.text};
          }
          .plr-mobile-content .plr-verdict {
            margin-top: 2px;
          }
        }

        @media print {
          .plr-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
        }
      `}</style>

      <div className="plr-table-wrap">
        <table className="plr-table" aria-label="P&L requirements by loan type">
          <thead>
            <tr>
              <th scope="col" className="plr-loan-head">Loan Type</th>
              <th scope="col" className="plr-required-head">P&amp;L Required?</th>
              <th scope="col">Can P&amp;L Increase Qualifying Income?</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const v = VERDICT_VISUALS[row.canIncrease.verdict];
              return (
                <tr key={`${row.loanType}-${row.loanSub || ""}`}>
                  <td>
                    <span className="plr-loan">{row.loanType}</span>
                    {row.loanSub && <span className="plr-loan-sub">{row.loanSub}</span>}
                  </td>
                  <td>
                    <span className="plr-lead">{row.required.lead}</span>
                    {row.required.body && <span className="plr-body">{row.required.body}</span>}
                  </td>
                  <td>
                    <div className="plr-verdict" style={{ borderColor: v.accent, background: v.bg }}>
                      <span className="plr-verdict-text" style={{ color: v.color }}>{row.canIncrease.text}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="plr-mobile-stack">
        {ROWS.map((row) => {
          const v = VERDICT_VISUALS[row.canIncrease.verdict];
          return (
            <div key={`${row.loanType}-${row.loanSub || ""}-m`} className="plr-mobile-card">
              <span className="plr-mobile-title">{row.loanType}</span>
              {row.loanSub && <span className="plr-mobile-sub">{row.loanSub}</span>}
              {!row.loanSub && <span style={{ display: "block", height: 8 }} />}
              <div className="plr-mobile-row">
                <span className="plr-mobile-label">P&amp;L Required?</span>
                <div className="plr-mobile-content">
                  <span className="plr-lead">{row.required.lead}</span>
                  {row.required.body && <span className="plr-body">{row.required.body}</span>}
                </div>
              </div>
              <div className="plr-mobile-row">
                <span className="plr-mobile-label">Can P&amp;L Increase Income?</span>
                <div className="plr-mobile-content">
                  <div className="plr-verdict" style={{ borderColor: v.accent, background: v.bg }}>
                    <span className="plr-verdict-text" style={{ color: v.color }}>{row.canIncrease.text}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
