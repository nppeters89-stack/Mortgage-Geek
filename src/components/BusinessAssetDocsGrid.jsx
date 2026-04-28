import { P, F } from "../theme";

const ROWS = [
  {
    loanProgram: "Conventional",
    loanSub: "Fannie Mae",
    standard: [
      { t: "Two months", b: true },
      { t: " of business bank statements." },
    ],
    alternative: [
      { t: "Current " },
      { t: "Business Balance Sheet", b: true },
      { t: " may be required if statements are insufficient." },
    ],
  },
  {
    loanProgram: "Conventional",
    loanSub: "Freddie Mac",
    standard: [
      { t: "Two months", b: true },
      { t: " of bank statements WITH signed " },
      { t: "YTD P&L", b: true },
      { t: ", OR " },
      { t: "three months", b: true },
      { t: " of bank statements." },
    ],
    alternative: [
      { t: "More flexible than Fannie on the bank-statement-only path." },
    ],
  },
  {
    loanProgram: "FHA",
    standard: [
      { t: "Two months", b: true },
      { t: " of business bank statements." },
    ],
    alternative: [
      { t: "CPA letter", b: true },
      { t: " accepted if statements are insufficient." },
    ],
  },
  {
    loanProgram: "VA",
    standard: [
      { t: "Two months", b: true },
      { t: " of business bank statements." },
    ],
    alternative: [
      { t: "CPA letter", b: true },
      { t: " accepted if statements are insufficient." },
    ],
  },
  {
    loanProgram: "USDA",
    standard: [
      { t: "Two months", b: true },
      { t: " of business bank statements." },
    ],
    alternative: [
      { t: "CPA letter", b: true },
      { t: " accepted if statements are insufficient." },
    ],
  },
];

function renderProse(parts) {
  return parts.map((part, i) =>
    part.b ? <strong key={i} style={{ color: P.navy, fontWeight: 700 }}>{part.t}</strong> : <span key={i}>{part.t}</span>
  );
}

export function BusinessAssetDocsGrid() {
  return (
    <div className="bag-container" role="region" aria-label="Business asset documentation requirements by loan program">
      <style>{`
        .bag-container {
          margin: 28px 0;
          font-family: ${F.body};
        }

        .bag-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .bag-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
          table-layout: fixed;
        }
        .bag-table thead th {
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
        .bag-table thead th.bag-loan-head { width: 25%; }
        .bag-table thead th.bag-standard-head { width: 37.5%; }

        .bag-table tbody tr:nth-child(odd) { background: ${P.white}; }
        .bag-table tbody tr:nth-child(even) { background: ${P.cream}; }
        .bag-table tbody td {
          padding: 18px 16px;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: top;
          line-height: 1.55;
          font-size: 14px;
          color: ${P.text};
        }
        .bag-table tbody tr:last-child td { border-bottom: none; }
        .bag-table tbody td:last-child { border-right: none; }

        .bag-loan {
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 15px;
          line-height: 1.3;
        }
        .bag-loan-sub {
          display: block;
          font-size: 12px;
          font-weight: 400;
          color: ${P.warmGray};
          font-style: italic;
          margin-top: 3px;
        }

        .bag-alt {
          border-left: 3px solid ${P.gold};
          padding: 4px 0 4px 12px;
          margin-left: 2px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .bag-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .bag-table-wrap { display: none; }
          .bag-mobile-stack { display: block; }
          .bag-mobile-card {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .bag-mobile-title {
            display: block;
            font-size: 15px;
            font-weight: 700;
            color: ${P.navy};
            line-height: 1.3;
          }
          .bag-mobile-sub {
            display: block;
            font-size: 12px;
            font-weight: 400;
            color: ${P.warmGray};
            font-style: italic;
            margin-top: 2px;
            margin-bottom: 12px;
          }
          .bag-mobile-row {
            padding: 12px 0;
            border-top: 1px solid ${P.creamDark};
          }
          .bag-mobile-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            margin-bottom: 6px;
          }
          .bag-mobile-content {
            font-size: 14px;
            line-height: 1.55;
            color: ${P.text};
          }
          .bag-mobile-content .bag-alt {
            margin-top: 2px;
          }
        }

        @media print {
          .bag-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .bag-alt { border-left-color: ${P.gold} !important; }
        }
      `}</style>

      <div className="bag-table-wrap">
        <table className="bag-table" aria-label="Business asset documentation by loan program">
          <thead>
            <tr>
              <th scope="col" className="bag-loan-head">Loan Program</th>
              <th scope="col" className="bag-standard-head">Standard Documentation</th>
              <th scope="col">Alternative or Additional</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={`${row.loanProgram}-${row.loanSub || ""}`}>
                <td>
                  <span className="bag-loan">{row.loanProgram}</span>
                  {row.loanSub && <span className="bag-loan-sub">{row.loanSub}</span>}
                </td>
                <td>{renderProse(row.standard)}</td>
                <td>
                  <div className="bag-alt">{renderProse(row.alternative)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bag-mobile-stack">
        {ROWS.map((row) => (
          <div key={`${row.loanProgram}-${row.loanSub || ""}-m`} className="bag-mobile-card">
            <span className="bag-mobile-title">{row.loanProgram}</span>
            {row.loanSub && <span className="bag-mobile-sub">{row.loanSub}</span>}
            {!row.loanSub && <span style={{ display: "block", height: 8 }} />}
            <div className="bag-mobile-row">
              <span className="bag-mobile-label">Standard Documentation</span>
              <div className="bag-mobile-content">{renderProse(row.standard)}</div>
            </div>
            <div className="bag-mobile-row">
              <span className="bag-mobile-label">Alternative or Additional</span>
              <div className="bag-mobile-content">
                <div className="bag-alt">{renderProse(row.alternative)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
