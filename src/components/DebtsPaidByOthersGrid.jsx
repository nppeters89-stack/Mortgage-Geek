import { P, F } from "../theme";

const ROWS = [
  {
    loanProgram: "Fannie Mae",
    loanSub: "Conventional (FNMA)",
    obligated: "no",
    documentation: [
      { t: "12 months", b: true },
      { t: " of " },
      { t: "canceled checks", b: true },
      { t: " or " },
      { t: "bank statements", b: true },
      { t: " from the party making the payments." },
    ],
    limits: [
      { t: "Other party cannot be an " },
      { t: "interested party", b: true },
      { t: " to the transaction (seller, agent, builder, etc.)." },
    ],
  },
  {
    loanProgram: "Freddie Mac",
    loanSub: "Conventional (FHLMC)",
    obligated: "no",
    documentation: [
      { t: "12 months", b: true },
      { t: " of timely payment evidence from the party making the payments." },
    ],
    limits: [
      { t: "Other party cannot be an " },
      { t: "interested party", b: true },
      { t: ". Seller must evaluate the validity of the arrangement." },
    ],
  },
  {
    loanProgram: "FHA",
    obligated: "yes",
    documentation: [
      { t: "12 months", b: true },
      { t: " of " },
      { t: "canceled checks", b: true },
      { t: ", " },
      { t: "money order receipts", b: true },
      { t: ", or " },
      { t: "bank statements", b: true },
      { t: " from the third party." },
    ],
    limits: [
      { t: "Late payments", b: true },
      { t: " in the last 12 months disqualify the exclusion. A court-ordered divorce decree is acceptable evidence of responsibility." },
    ],
  },
  {
    loanProgram: "VA",
    obligated: "yes",
    documentation: [
      { t: "Evidence the debt is being paid by another obligated party, with no reason to believe the borrower will have to participate in repayment." },
    ],
    limits: [
      { t: "Underwriter judgment", b: true },
      { t: " carries more weight on VA than on the other agency programs." },
    ],
  },
  {
    loanProgram: "USDA",
    obligated: "yes",
    documentation: [
      { t: "12 months", b: true },
      { t: " of " },
      { t: "canceled checks", b: true },
      { t: ", " },
      { t: "money order receipts", b: true },
      { t: ", or " },
      { t: "bank statements", b: true },
      { t: " from the third party." },
    ],
    limits: [
      { t: "Late payments", b: true },
      { t: " in the last 12 months add the debt back into the " },
      { t: "long-term repayment ratio", b: true },
      { t: ". Debts marked individual on the credit report stay in DTI regardless." },
    ],
  },
];

function renderProse(parts) {
  return parts.map((part, i) =>
    part.b ? <strong key={i} style={{ color: P.navy, fontWeight: 700 }}>{part.t}</strong> : <span key={i}>{part.t}</span>
  );
}

const STATUS = {
  no: {
    label: "NO",
    sub: "more flexible",
    color: P.sageDark,
    bg: "rgba(90, 122, 110, 0.15)",
    border: "rgba(90, 122, 110, 0.30)",
  },
  yes: {
    label: "YES",
    sub: "must be on debt",
    color: P.goldMuted,
    bg: "rgba(184, 134, 11, 0.12)",
    border: "rgba(184, 134, 11, 0.32)",
  },
};

function StatusCell({ obligated }) {
  const s = STATUS[obligated];
  return (
    <div
      className="dpo-status"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <span className="dpo-status-label" style={{ color: s.color }}>
        {s.label}
      </span>
      <span className="dpo-status-sub" style={{ color: s.color }}>
        ({s.sub})
      </span>
    </div>
  );
}

export function DebtsPaidByOthersGrid() {
  return (
    <div className="dpo-container" role="region" aria-label="Debts paid by others requirements by loan program">
      <style>{`
        .dpo-container {
          margin: 28px 0;
          font-family: ${F.body};
        }

        .dpo-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .dpo-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
          table-layout: fixed;
        }
        .dpo-table thead th {
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
        .dpo-table thead th.dpo-loan-head { width: 18%; }
        .dpo-table thead th.dpo-status-head { width: 20%; text-align: center; }
        .dpo-table thead th.dpo-doc-head { width: 32%; }
        .dpo-table thead th.dpo-limits-head { width: 30%; }

        .dpo-table tbody tr:nth-child(odd) { background: ${P.white}; }
        .dpo-table tbody tr:nth-child(even) { background: ${P.cream}; }
        .dpo-table tbody td {
          padding: 18px 16px;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: top;
          line-height: 1.55;
          font-size: 14px;
          color: ${P.text};
        }
        .dpo-table tbody tr:last-child td { border-bottom: none; }
        .dpo-table tbody td:last-child { border-right: none; }
        .dpo-table tbody td.dpo-status-cell { vertical-align: middle; padding: 12px; }

        .dpo-loan {
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 15px;
          line-height: 1.3;
        }
        .dpo-loan-sub {
          display: block;
          font-size: 12px;
          font-weight: 400;
          color: ${P.warmGray};
          font-style: italic;
          margin-top: 3px;
        }

        .dpo-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 14px 8px;
          border-radius: 8px;
          border: 1px solid;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .dpo-status-label {
          font-family: ${F.body};
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
          line-height: 1;
        }
        .dpo-status-sub {
          font-size: 12px;
          font-style: italic;
          font-weight: 500;
          opacity: 0.85;
          line-height: 1.2;
          text-align: center;
        }

        .dpo-caption {
          font-size: 13px;
          color: ${P.warmGray};
          font-style: italic;
          line-height: 1.6;
          margin-top: 14px;
          text-align: center;
        }

        .dpo-mobile-stack { display: none; }

        @media (max-width: 700px) {
          .dpo-table-wrap { display: none; }
          .dpo-mobile-stack { display: block; }
          .dpo-mobile-card {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .dpo-mobile-title {
            display: block;
            font-size: 15px;
            font-weight: 700;
            color: ${P.navy};
            line-height: 1.3;
          }
          .dpo-mobile-sub {
            display: block;
            font-size: 12px;
            font-weight: 400;
            color: ${P.warmGray};
            font-style: italic;
            margin-top: 2px;
          }
          .dpo-mobile-status-row {
            margin-top: 14px;
            margin-bottom: 4px;
            padding-bottom: 14px;
            border-bottom: 1px solid ${P.creamDark};
          }
          .dpo-mobile-status-row .dpo-status {
            padding: 18px 12px;
          }
          .dpo-mobile-status-row .dpo-status-label {
            font-size: 26px;
          }
          .dpo-mobile-status-row .dpo-status-sub {
            font-size: 13px;
          }
          .dpo-mobile-row {
            padding: 12px 0;
            border-top: 1px solid ${P.creamDark};
          }
          .dpo-mobile-row:first-of-type {
            border-top: none;
          }
          .dpo-mobile-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            margin-bottom: 8px;
          }
          .dpo-mobile-content {
            font-size: 14px;
            line-height: 1.55;
            color: ${P.text};
          }
        }

        @media print {
          .dpo-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .dpo-status { border-width: 1px !important; }
        }
      `}</style>

      <div className="dpo-table-wrap">
        <table className="dpo-table" aria-label="Debts paid by others rules by loan program">
          <thead>
            <tr>
              <th scope="col" className="dpo-loan-head">Loan Program</th>
              <th scope="col" className="dpo-status-head">Other Party Must Be Obligated?</th>
              <th scope="col" className="dpo-doc-head">Required Documentation</th>
              <th scope="col" className="dpo-limits-head">Notable Limits</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.loanProgram}>
                <td>
                  <span className="dpo-loan">{row.loanProgram}</span>
                  {row.loanSub && <span className="dpo-loan-sub">{row.loanSub}</span>}
                </td>
                <td className="dpo-status-cell">
                  <StatusCell obligated={row.obligated} />
                </td>
                <td>{renderProse(row.documentation)}</td>
                <td>{renderProse(row.limits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dpo-mobile-stack">
        {ROWS.map((row) => (
          <div key={`${row.loanProgram}-m`} className="dpo-mobile-card">
            <span className="dpo-mobile-title">{row.loanProgram}</span>
            {row.loanSub && <span className="dpo-mobile-sub">{row.loanSub}</span>}
            <div className="dpo-mobile-status-row">
              <span className="dpo-mobile-label">Other Party Must Be Obligated?</span>
              <StatusCell obligated={row.obligated} />
            </div>
            <div className="dpo-mobile-row">
              <span className="dpo-mobile-label">Required Documentation</span>
              <div className="dpo-mobile-content">{renderProse(row.documentation)}</div>
            </div>
            <div className="dpo-mobile-row">
              <span className="dpo-mobile-label">Notable Limits</span>
              <div className="dpo-mobile-content">{renderProse(row.limits)}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="dpo-caption">
        Late payments by the third party in the last 12 months disqualify the exclusion across all programs.
      </p>
    </div>
  );
}
