import { P, F } from "../theme";
import { withAlpha } from "../utils/format";

const ROWS = [
  {
    id: "standard",
    range: "PITI ≤ 29% AND Total Debt ≤ 41%",
    status: "standard",
    statusLabel: "Within Standard",
    waiverNeeded: "None required",
    conditions: "No waiver required",
    gusOutcome: "GUS may Accept",
  },
  {
    id: "waiver-piti",
    range: "PITI 29.01% to 34%, Total Debt ≤ 44%",
    status: "waiver",
    statusLabel: "Waiver Required",
    waiverNeeded: "Up to 34% PITI ceiling",
    conditions: "680+ credit score plus documented compensating factor",
    gusOutcome: "Manual UW with waiver request",
  },
  {
    id: "waiver-td",
    range: "Total Debt 41.01% to 44%, PITI ≤ 34%",
    status: "waiver",
    statusLabel: "Waiver Required",
    waiverNeeded: "Up to 44% Total Debt ceiling",
    conditions: "680+ credit score plus documented compensating factor",
    gusOutcome: "Manual UW with waiver request",
  },
  {
    id: "ineligible",
    range: "PITI > 34% OR Total Debt > 44%",
    status: "ineligible",
    statusLabel: "Ineligible",
    waiverNeeded: "No waiver available",
    conditions: "Not approvable on purchase transactions",
    gusOutcome: "Ineligible",
  },
];

export function USDARatioThresholdGrid() {
  const captionId = "usdartg-caption";

  return (
    <div className="usdartg-container" role="region" aria-label="USDA ratio threshold table">
      <style>{`
        .usdartg-container {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 14px;
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .usdartg-table-wrap { padding: 22px 18px; }
        .usdartg-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
        }
        .usdartg-table caption {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          padding-bottom: 12px;
        }
        .usdartg-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 12px 12px;
          text-align: left;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .usdartg-table thead th:first-child { border-top-left-radius: 6px; }
        .usdartg-table thead th:last-child { border-top-right-radius: 6px; }
        .usdartg-table tbody td {
          padding: 14px 12px;
          color: ${P.text};
          border-bottom: 1px solid ${P.creamDark};
          line-height: 1.55;
          vertical-align: top;
        }
        .usdartg-table tbody tr:last-child td { border-bottom: none; }

        .usdartg-row-standard td { background: ${withAlpha(P.success, 0.10)}; }
        .usdartg-row-waiver td { background: ${withAlpha(P.caution, 0.09)}; }
        .usdartg-row-ineligible td { background: ${withAlpha(P.danger, 0.09)}; }

        .usdartg-range {
          font-weight: 600;
          color: ${P.navy};
          font-size: 14px;
          letter-spacing: 0.2px;
        }
        .usdartg-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.3px;
          line-height: 1.3;
        }
        .usdartg-status-standard { color: ${P.success}; }
        .usdartg-status-waiver { color: ${P.caution}; }
        .usdartg-status-ineligible { color: ${P.danger}; }
        .usdartg-status-icon {
          flex-shrink: 0;
          font-size: 14px;
          line-height: 1;
          font-weight: 700;
        }
        .usdartg-waiver-needed {
          display: block;
          margin-top: 4px;
          font-size: 12.5px;
          color: ${P.warmGray};
          font-style: italic;
          line-height: 1.5;
        }
        .usdartg-conditions {
          font-size: 13.5px;
          color: ${P.text};
          line-height: 1.55;
        }
        .usdartg-gus {
          font-size: 13px;
          color: ${P.warmGray};
          font-weight: 600;
          line-height: 1.5;
        }

        .usdartg-caption-note {
          font-size: 13px;
          color: ${P.warmGray};
          font-style: italic;
          line-height: 1.6;
          padding: 0 4px 4px;
          margin-top: 14px;
        }

        .usdartg-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .usdartg-table-wrap { padding: 22px 14px; }
          .usdartg-table { display: none; }
          .usdartg-mobile-stack { display: block; }
          .usdartg-card {
            border: 1px solid ${P.creamDark};
            border-radius: 10px;
            background: ${P.white};
            padding: 14px 16px;
            margin-bottom: 12px;
          }
          .usdartg-card-standard { border-left: 3px solid ${P.success}; background: ${withAlpha(P.success, 0.08)}; }
          .usdartg-card-waiver { border-left: 3px solid ${P.caution}; background: ${withAlpha(P.caution, 0.08)}; }
          .usdartg-card-ineligible { border-left: 3px solid ${P.danger}; background: ${withAlpha(P.danger, 0.08)}; }
          .usdartg-card-range {
            display: block;
            font-family: ${F.body};
            font-weight: 700;
            font-size: 14px;
            color: ${P.navy};
            line-height: 1.4;
            margin-bottom: 10px;
          }
          .usdartg-card-row {
            display: block;
            margin-bottom: 8px;
          }
          .usdartg-card-row:last-child { margin-bottom: 0; }
          .usdartg-card-label {
            display: block;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
            color: ${P.warmGrayLight};
            margin-bottom: 3px;
            font-family: ${F.body};
          }
          .usdartg-card-value {
            display: block;
            font-size: 13.5px;
            color: ${P.text};
            line-height: 1.5;
          }
        }

        @media print {
          .usdartg-container { box-shadow: none; break-inside: avoid; }
          .usdartg-table thead th,
          .usdartg-row-standard td,
          .usdartg-row-waiver td,
          .usdartg-row-ineligible td {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="usdartg-table-wrap">
        <table className="usdartg-table" aria-labelledby={captionId}>
          <caption id={captionId}>USDA ratio thresholds and waiver requirements</caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: "30%" }}>Ratio Range</th>
              <th scope="col" style={{ width: "22%" }}>Status / Waiver Need</th>
              <th scope="col" style={{ width: "28%" }}>Conditions for Waiver</th>
              <th scope="col" style={{ width: "20%" }}>GUS Outcome</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const icon = row.status === "standard" ? "✓" : row.status === "waiver" ? "!" : "✕";
              return (
                <tr key={row.id} className={`usdartg-row-${row.status}`}>
                  <td className="usdartg-range">{row.range}</td>
                  <td>
                    <span className={`usdartg-status usdartg-status-${row.status}`}>
                      <span className="usdartg-status-icon" aria-hidden="true">{icon}</span>
                      {row.statusLabel}
                    </span>
                    <span className="usdartg-waiver-needed">{row.waiverNeeded}</span>
                  </td>
                  <td className="usdartg-conditions">{row.conditions}</td>
                  <td className="usdartg-gus">{row.gusOutcome}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="usdartg-mobile-stack">
          {ROWS.map((row) => {
            const icon = row.status === "standard" ? "✓" : row.status === "waiver" ? "!" : "✕";
            return (
              <div key={row.id} className={`usdartg-card usdartg-card-${row.status}`}>
                <span className="usdartg-card-range">{row.range}</span>
                <span className="usdartg-card-row">
                  <span className="usdartg-card-label">Status</span>
                  <span className={`usdartg-status usdartg-status-${row.status}`}>
                    <span className="usdartg-status-icon" aria-hidden="true">{icon}</span>
                    {row.statusLabel}
                  </span>
                </span>
                <span className="usdartg-card-row">
                  <span className="usdartg-card-label">Waiver Need</span>
                  <span className="usdartg-card-value">{row.waiverNeeded}</span>
                </span>
                <span className="usdartg-card-row">
                  <span className="usdartg-card-label">Conditions for Waiver</span>
                  <span className="usdartg-card-value">{row.conditions}</span>
                </span>
                <span className="usdartg-card-row">
                  <span className="usdartg-card-label">GUS Outcome</span>
                  <span className="usdartg-card-value">{row.gusOutcome}</span>
                </span>
              </div>
            );
          })}
        </div>

        <p className="usdartg-caption-note">
          Refinance transactions follow different ratio rules. See the full USDA handbook (Chapter 11.3.B) for refinance guidance.
        </p>
      </div>
    </div>
  );
}
