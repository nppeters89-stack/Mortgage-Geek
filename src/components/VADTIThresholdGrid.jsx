import { P, F } from "../theme";

const ROWS = [
  { range: "Under 41%", factors: "None required", notes: "Within VA's standard threshold" },
  { range: "41.01% to 45%", factors: "1 to 2 factors", notes: "Most files settle here on manual" },
  { range: "45.01% to 50%", factors: "2 to 3 factors", notes: "Second-level UW review typical" },
  { range: "50.01% to 55%", factors: "3 to 4 factors", notes: "Some lender overlays cap at 50%" },
  { range: "55.01% to 60%", factors: "4+ factors", notes: "Many lenders won't go here at all" },
  { range: "Over 60%", factors: "5+ factors", notes: "Rare, requires exceptional file" },
];

export function VADTIThresholdGrid() {
  const captionId = "vadti-caption";

  return (
    <div className="vadti-container" role="region" aria-label="VA DTI threshold table">
      <style>{`
        .vadti-container {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 14px;
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .vadti-table-wrap { padding: 22px 18px; }
        .vadti-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
        }
        .vadti-table caption {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          padding-bottom: 12px;
        }
        .vadti-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 12px 14px;
          text-align: left;
          border: none;
        }
        .vadti-table thead th:first-child { border-top-left-radius: 6px; }
        .vadti-table thead th:last-child { border-top-right-radius: 6px; }
        .vadti-table tbody td {
          padding: 14px;
          color: ${P.text};
          border-bottom: 1px solid ${P.creamDark};
          line-height: 1.5;
          vertical-align: top;
        }
        .vadti-table tbody tr:nth-child(odd) td { background: ${P.cream}; }
        .vadti-table tbody tr:nth-child(even) td { background: ${P.white}; }
        .vadti-table tbody tr:last-child td { border-bottom: none; }
        .vadti-range {
          font-family: ${F.body};
          font-weight: 700;
          font-size: 14px;
          color: ${P.goldMuted};
          letter-spacing: 0.4px;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .vadti-factors {
          font-weight: 600;
          color: ${P.navy};
        }
        .vadti-notes {
          font-size: 13px;
          color: ${P.warmGray};
          font-style: italic;
        }

        .vadti-mobile-stack { display: none; }

        @media (max-width: 600px) {
          .vadti-table-wrap { padding: 22px 14px; }
          .vadti-table { display: none; }
          .vadti-mobile-stack { display: block; }
          .vadti-card {
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.gold};
            border-radius: 8px;
            background: ${P.white};
            padding: 14px 16px;
            margin-bottom: 10px;
          }
          .vadti-card-range {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            color: ${P.goldMuted};
            margin-bottom: 6px;
            font-family: ${F.body};
          }
          .vadti-card-factors {
            display: block;
            font-family: ${F.body};
            font-size: 15px;
            font-weight: 600;
            color: ${P.navy};
            margin-bottom: 6px;
          }
          .vadti-card-notes {
            display: block;
            font-family: ${F.body};
            font-size: 13px;
            color: ${P.warmGray};
            font-style: italic;
            line-height: 1.55;
          }
        }
      `}</style>

      <div className="vadti-table-wrap">
        <table className="vadti-table" aria-labelledby={captionId}>
          <caption id={captionId}>
            DTI thresholds and compensating factor requirements
          </caption>
          <thead>
            <tr>
              <th scope="col">DTI range</th>
              <th scope="col">Comp factors needed</th>
              <th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.range}>
                <td className="vadti-range">{row.range}</td>
                <td className="vadti-factors">{row.factors}</td>
                <td className="vadti-notes">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="vadti-mobile-stack">
          {ROWS.map((row) => (
            <div key={row.range} className="vadti-card">
              <span className="vadti-card-range">{row.range}</span>
              <span className="vadti-card-factors">{row.factors}</span>
              <span className="vadti-card-notes">{row.notes}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
