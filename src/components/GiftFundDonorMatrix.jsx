import { P, F } from "../theme";
import { withAlpha } from "../utils/format";

const PROGRAMS = [
  { key: "FNMA", label: "Conv (FNMA)" },
  { key: "FHLMC", label: "Conv (FHLMC)" },
  { key: "FHA", label: "FHA" },
  { key: "VA", label: "VA" },
  { key: "USDA", label: "USDA" },
];

const DONORS = [
  {
    label: "Family by blood, marriage, adoption, or guardianship",
    eligibility: { FNMA: true, FHLMC: true, FHA: true, VA: true, USDA: true },
  },
  {
    label: "Spouse, domestic partner, fiancé, or godparent",
    eligibility: { FNMA: true, FHLMC: true, FHA: true, VA: true, USDA: true },
  },
  {
    label: "Close friend with documented relationship",
    eligibility: { FNMA: false, FHLMC: true, FHA: true, VA: true, USDA: true },
  },
  {
    label: "Employer or labor union",
    eligibility: { FNMA: false, FHLMC: false, FHA: true, VA: true, USDA: true },
  },
  {
    label: "Charitable organization or government agency",
    eligibility: { FNMA: false, FHLMC: false, FHA: true, VA: true, USDA: true },
  },
];

const YES = {
  symbol: "✓",
  bg: withAlpha(P.success, 0.15),
  border: withAlpha(P.success, 0.30),
  color: P.success,
};

const NO = {
  symbol: "✗",
  bg: withAlpha(P.warmGray, 0.10),
  border: withAlpha(P.warmGray, 0.22),
  color: P.warmGray,
};

function StatusCell({ donor, program, eligible }) {
  const s = eligible ? YES : NO;
  const verb = eligible ? "eligible for" : "not eligible for";
  return (
    <div
      className="gfd-status"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
      role="img"
      aria-label={`${donor}: ${verb} ${program}`}
    >
      <span aria-hidden="true">{s.symbol}</span>
    </div>
  );
}

export function GiftFundDonorMatrix() {
  return (
    <div
      className="gfd-container"
      role="region"
      aria-label="Gift fund donor eligibility by loan program"
    >
      <style>{`
        .gfd-container {
          margin: 28px 0;
          font-family: ${F.body};
        }

        .gfd-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .gfd-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
          table-layout: fixed;
        }
        .gfd-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px 14px;
          border: none;
          vertical-align: middle;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .gfd-table thead th.gfd-donor-head {
          width: 32%;
          text-align: left;
        }
        .gfd-table thead th.gfd-program-head {
          text-align: center;
        }

        .gfd-table tbody td {
          padding: 16px 14px;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
        }
        .gfd-table tbody tr:last-child td { border-bottom: none; }
        .gfd-table tbody td:last-child { border-right: none; }

        .gfd-donor-cell {
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 14px;
          line-height: 1.4;
          padding-left: 16px;
        }

        .gfd-status-cell {
          padding: 10px;
          text-align: center;
        }

        .gfd-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          border: 1px solid;
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .gfd-caption {
          font-size: 13px;
          color: ${P.warmGray};
          font-style: italic;
          line-height: 1.6;
          margin-top: 14px;
          text-align: center;
        }

        .gfd-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .gfd-table-wrap { display: none; }
          .gfd-mobile-stack { display: block; }

          .gfd-mobile-card {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .gfd-mobile-title {
            display: block;
            font-size: 14px;
            font-weight: 700;
            color: ${P.navy};
            line-height: 1.35;
            margin-bottom: 12px;
          }
          .gfd-mobile-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .gfd-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 11px;
            border-radius: 999px;
            border: 1px solid;
            font-size: 12px;
            font-weight: 600;
            font-family: ${F.body};
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .gfd-chip-symbol {
            font-size: 14px;
            font-weight: 700;
            line-height: 1;
          }
        }

        @media print {
          .gfd-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .gfd-status { border-width: 1px !important; }
        }
      `}</style>

      <div className="gfd-table-wrap">
        <table
          className="gfd-table"
          aria-label="Gift fund donor eligibility matrix by loan program"
        >
          <thead>
            <tr>
              <th scope="col" className="gfd-donor-head">Donor Category</th>
              {PROGRAMS.map((p) => (
                <th key={p.key} scope="col" className="gfd-program-head">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DONORS.map((row) => (
              <tr key={row.label}>
                <td className="gfd-donor-cell">{row.label}</td>
                {PROGRAMS.map((p) => (
                  <td key={p.key} className="gfd-status-cell">
                    <StatusCell
                      donor={row.label}
                      program={p.label}
                      eligible={row.eligibility[p.key]}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="gfd-mobile-stack">
        {DONORS.map((row) => (
          <div key={`${row.label}-m`} className="gfd-mobile-card">
            <span className="gfd-mobile-title">{row.label}</span>
            <div className="gfd-mobile-chips" role="list">
              {PROGRAMS.map((p) => {
                const eligible = row.eligibility[p.key];
                const s = eligible ? YES : NO;
                const verb = eligible ? "eligible for" : "not eligible for";
                return (
                  <span
                    key={p.key}
                    className="gfd-chip"
                    role="listitem"
                    aria-label={`${row.label}: ${verb} ${p.label}`}
                    style={{ background: s.bg, borderColor: s.border, color: s.color }}
                  >
                    <span className="gfd-chip-symbol" aria-hidden="true">{s.symbol}</span>
                    <span>{p.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="gfd-caption">
        VA and USDA show ✓ across the board because their rule is "anyone who is not an interested party," not a specific eligibility category list. See body text for details on program-specific variations.
      </p>
    </div>
  );
}
