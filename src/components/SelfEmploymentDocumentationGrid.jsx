import { P, F } from "../theme";

const COLUMNS = [
  { key: "soleprop",    label: "Sole Prop",    sub: "Schedule C" },
  { key: "scorp",       label: "S-Corp",       sub: "Form 1120-S" },
  { key: "partnership", label: "Partnership",  sub: "Form 1065" },
  { key: "ccorp",       label: "C-Corp",       sub: "Form 1120" },
];

const ROWS = [
  {
    label: "Personal tax returns",
    sub: "1040 + W-2s if applicable",
    cells: ["required", "required", "required", "required"],
  },
  {
    label: "Business tax returns",
    cells: ["na", "required", "required", "required"],
  },
  {
    label: "K-1 statements",
    cells: ["na", "required", "required", "na"],
  },
  {
    label: "Year-to-date Profit & Loss statement",
    cells: ["sometimes", "sometimes", "sometimes", "sometimes"],
  },
  {
    label: "Balance sheet",
    cells: ["no", "sometimes", "sometimes", "sometimes"],
  },
];

const STATUS_VISUALS = {
  required: {
    icon: "✓",
    label: "Required",
    color: P.sageDark,
    bg: "rgba(90, 122, 110, 0.15)",
    border: "rgba(90, 122, 110, 0.30)",
  },
  na: {
    icon: "—",
    label: "N/A",
    color: P.warmGray,
    bg: "rgba(107, 99, 88, 0.08)",
    border: "rgba(107, 99, 88, 0.20)",
  },
  sometimes: {
    icon: "⚠",
    label: "Sometimes",
    color: P.goldMuted,
    bg: "rgba(184, 134, 11, 0.12)",
    border: "rgba(184, 134, 11, 0.32)",
  },
  no: {
    icon: "·",
    label: "No",
    color: P.warmGray,
    bg: P.white,
    border: "rgba(107, 99, 88, 0.15)",
  },
};

export function SelfEmploymentDocumentationGrid() {
  return (
    <div className="sed-container" role="region" aria-label="Self-employment documentation requirements by business structure">
      <style>{`
        .sed-container {
          margin: 28px 0;
          font-family: ${F.body};
        }

        .sed-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .sed-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
          table-layout: fixed;
        }
        .sed-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px 10px;
          text-align: center;
          border: none;
          vertical-align: middle;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .sed-table thead th.sed-doc-head {
          text-align: left;
          padding-left: 18px;
          width: 30%;
        }
        .sed-col-sub {
          display: block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.6px;
          text-transform: none;
          color: rgba(250, 247, 242, 0.7);
          margin-top: 3px;
        }

        .sed-table tbody tr:nth-child(odd) { background: ${P.white}; }
        .sed-table tbody tr:nth-child(even) { background: ${P.cream}; }
        .sed-table tbody th.sed-doc-name {
          text-align: left;
          padding: 16px 14px 16px 18px;
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 14px;
          line-height: 1.4;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
        }
        .sed-doc-sub {
          display: block;
          font-size: 12px;
          font-weight: 400;
          color: ${P.warmGray};
          margin-top: 2px;
          font-style: italic;
        }
        .sed-table tbody td {
          padding: 8px;
          text-align: center;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
        }
        .sed-table tbody tr:last-child th,
        .sed-table tbody tr:last-child td { border-bottom: none; }
        .sed-table tbody td:last-child { border-right: none; }

        .sed-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          min-height: 60px;
          padding: 8px 6px;
          border: 1px solid transparent;
          border-radius: 6px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .sed-cell-icon { font-size: 16px; line-height: 1; font-weight: 700; }
        .sed-cell-label { font-size: 12px; font-weight: 600; line-height: 1.2; letter-spacing: 0.2px; }

        .sed-mobile-stack { display: none; }

        .sed-caption {
          margin-top: 14px;
          font-size: 13px;
          line-height: 1.55;
          color: ${P.warmGray};
          font-style: italic;
          padding: 0 4px;
        }

        @media (max-width: 700px) {
          .sed-table-wrap { display: none; }
          .sed-mobile-stack { display: block; }
          .sed-mobile-card {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .sed-mobile-card-title {
            display: block;
            font-size: 14px;
            font-weight: 700;
            color: ${P.navy};
            margin-bottom: 2px;
            line-height: 1.4;
            letter-spacing: 0.3px;
            text-transform: uppercase;
          }
          .sed-mobile-card-sub {
            display: block;
            font-size: 12px;
            font-weight: 400;
            color: ${P.warmGray};
            font-style: italic;
            margin-bottom: 12px;
          }
          .sed-mobile-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-top: 1px solid ${P.creamDark};
          }
          .sed-mobile-row:first-of-type { border-top: none; }
          .sed-mobile-doc {
            font-size: 13px;
            font-weight: 600;
            color: ${P.navy};
            flex: 1;
            line-height: 1.4;
          }
          .sed-mobile-doc-sub {
            display: block;
            font-size: 11px;
            font-weight: 400;
            color: ${P.warmGray};
            font-style: italic;
            margin-top: 2px;
          }
          .sed-mobile-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 12px;
            border: 1px solid;
            flex-shrink: 0;
            white-space: nowrap;
          }
        }

        @media print {
          .sed-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
        }
      `}</style>

      <div className="sed-table-wrap">
        <table className="sed-table" aria-label="Documentation requirements by business structure">
          <thead>
            <tr>
              <th scope="col" className="sed-doc-head">Document</th>
              {COLUMNS.map((col) => (
                <th key={col.key} scope="col">
                  {col.label}
                  <span className="sed-col-sub">{col.sub}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="sed-doc-name">
                  {row.label}
                  {row.sub && <span className="sed-doc-sub">{row.sub}</span>}
                </th>
                {row.cells.map((status, cIdx) => {
                  const visual = STATUS_VISUALS[status];
                  return (
                    <td key={COLUMNS[cIdx].key} style={{ background: visual.bg }}>
                      <div className="sed-cell" style={{ borderColor: visual.border }}>
                        <span className="sed-cell-icon" aria-hidden="true" style={{ color: visual.color }}>{visual.icon}</span>
                        <span className="sed-cell-label" style={{ color: visual.color }}>{visual.label}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sed-mobile-stack">
        {COLUMNS.map((col, cIdx) => (
          <div key={col.key} className="sed-mobile-card">
            <span className="sed-mobile-card-title">{col.label}</span>
            <span className="sed-mobile-card-sub">{col.sub}</span>
            {ROWS.map((row) => {
              const visual = STATUS_VISUALS[row.cells[cIdx]];
              return (
                <div key={row.label} className="sed-mobile-row">
                  <span className="sed-mobile-doc">
                    {row.label}
                    {row.sub && <span className="sed-mobile-doc-sub">{row.sub}</span>}
                  </span>
                  <span
                    className="sed-mobile-status"
                    style={{ color: visual.color, background: visual.bg, borderColor: visual.border }}
                  >
                    <span aria-hidden="true">{visual.icon}</span>
                    {visual.label}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="sed-caption">
        Sometimes = depends on loan type and timing. See the P&amp;L Requirements grid below for details.
      </p>
    </div>
  );
}
