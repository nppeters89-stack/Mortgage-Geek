import { useState } from "react";
import { P, F } from "../theme";

const TIERS = {
  high: {
    id: "high",
    label: "Loan amount $80,000 +",
    addRule: "Add $80 per person up to family of 7",
    rows: [
      { family: "1", northeast: "$450", midwest: "$441", south: "$441", west: "$491" },
      { family: "2", northeast: "$755", midwest: "$738", south: "$738", west: "$823" },
      { family: "3", northeast: "$909", midwest: "$889", south: "$889", west: "$990" },
      { family: "4", northeast: "$1,025", midwest: "$1,003", south: "$1,003", west: "$1,117" },
      { family: "5", northeast: "$1,062", midwest: "$1,039", south: "$1,039", west: "$1,158" },
    ],
  },
  low: {
    id: "low",
    label: "Loan amount under $80,000",
    addRule: "Add $75 per person up to family of 7",
    rows: [
      { family: "1", northeast: "$390", midwest: "$382", south: "$382", west: "$425" },
      { family: "2", northeast: "$654", midwest: "$641", south: "$641", west: "$713" },
      { family: "3", northeast: "$788", midwest: "$772", south: "$772", west: "$859" },
      { family: "4", northeast: "$888", midwest: "$868", south: "$868", west: "$967" },
      { family: "5", northeast: "$921", midwest: "$902", south: "$902", west: "$1,004" },
    ],
  },
};

const REGIONS = [
  { name: "Northeast", states: "CT, ME, MA, NH, NJ, NY, PA, RI, VT" },
  { name: "Midwest", states: "IL, IN, IA, KS, MI, MN, MO, NE, ND, OH, SD, WI" },
  { name: "South", states: "AL, AR, DE, DC, FL, GA, KY, LA, MD, MS, NC, OK, PR, SC, TN, TX, VA, WV" },
  { name: "West", states: "AK, AZ, CA, CO, HI, ID, MT, NV, NM, OR, UT, WA, WY" },
];

export function VAResidualIncomeGrid() {
  const [tierId, setTierId] = useState("high");
  const tier = TIERS[tierId];
  const captionId = "vari-caption";

  return (
    <div className="vari-container" role="region" aria-label="VA residual income tables">
      <style>{`
        .vari-container {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 14px;
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .vari-toggle-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px 18px;
          background: ${P.cream};
          border-bottom: 1px solid ${P.creamDark};
        }
        .vari-toggle-btn {
          flex: 1 1 auto;
          min-height: 44px;
          padding: 10px 18px;
          border-radius: 8px;
          border: 1px solid ${P.creamDark};
          background: ${P.white};
          color: ${P.navy};
          font-family: ${F.body};
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.4px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .vari-toggle-btn:hover { border-color: ${P.gold}; }
        .vari-toggle-btn:focus-visible { outline: 2px solid ${P.gold}; outline-offset: 2px; }
        .vari-toggle-btn-active {
          background: ${P.navy};
          color: ${P.cream};
          border-color: ${P.navy};
        }
        .vari-toggle-btn-active:hover { background: ${P.navyDark}; border-color: ${P.navyDark}; }

        .vari-table-wrap { padding: 22px 18px 12px; }
        .vari-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
        }
        .vari-table caption {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          padding-bottom: 12px;
        }
        .vari-table thead th {
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
        .vari-table thead th:first-child { border-top-left-radius: 6px; }
        .vari-table thead th:last-child { border-top-right-radius: 6px; }
        .vari-table tbody td {
          padding: 12px 14px;
          color: ${P.text};
          border-bottom: 1px solid ${P.creamDark};
          font-variant-numeric: tabular-nums;
        }
        .vari-table tbody tr:nth-child(odd) td { background: ${P.cream}; }
        .vari-table tbody tr:nth-child(even) td { background: ${P.white}; }
        .vari-table tbody tr:last-child td { border-bottom: none; }
        .vari-family-cell {
          font-weight: 700;
          color: ${P.goldMuted};
          letter-spacing: 0.5px;
        }
        .vari-add-rule {
          margin: 12px 4px 4px;
          padding: 10px 14px;
          background: ${P.cream};
          border-left: 3px solid ${P.gold};
          border-radius: 4px;
          font-family: ${F.body};
          font-size: 13px;
          color: ${P.warmGray};
          font-style: italic;
          line-height: 1.55;
        }
        .vari-add-rule strong { color: ${P.navy}; font-style: normal; font-weight: 600; }

        .vari-region-key {
          padding: 18px 18px 22px;
          background: ${P.cream};
          border-top: 1px solid ${P.creamDark};
        }
        .vari-region-heading {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          margin: 0 0 12px;
          font-family: ${F.body};
        }
        .vari-region-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 10px;
        }
        .vari-region-card {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-left: 3px solid ${P.gold};
          border-radius: 6px;
          padding: 12px 14px;
        }
        .vari-region-name {
          display: block;
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          margin-bottom: 4px;
        }
        .vari-region-states {
          font-family: ${F.body};
          font-size: 13px;
          color: ${P.navy};
          line-height: 1.55;
        }

        .vari-mobile-stack { display: none; }

        @media (max-width: 600px) {
          .vari-toggle-row { flex-direction: column; }
          .vari-toggle-btn { flex: 1 1 100%; }
          .vari-table-wrap { padding: 22px 14px 8px; }
          .vari-table { display: none; }
          .vari-mobile-stack { display: block; }
          .vari-card {
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.gold};
            border-radius: 8px;
            background: ${P.white};
            padding: 14px 16px;
            margin-bottom: 10px;
          }
          .vari-card-family {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            color: ${P.goldMuted};
            margin-bottom: 8px;
            font-family: ${F.body};
          }
          .vari-card-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid ${P.creamDark};
            font-family: ${F.body};
            font-size: 14px;
          }
          .vari-card-row:last-child { border-bottom: none; }
          .vari-card-region {
            color: ${P.warmGray};
            font-weight: 500;
            font-size: 13px;
          }
          .vari-card-amount {
            color: ${P.navy};
            font-weight: 600;
            font-variant-numeric: tabular-nums;
          }
        }
      `}</style>

      <div className="vari-toggle-row" role="group" aria-label="Loan amount tier">
        {Object.values(TIERS).map((t) => {
          const active = t.id === tierId;
          return (
            <button
              key={t.id}
              type="button"
              className={`vari-toggle-btn${active ? " vari-toggle-btn-active" : ""}`}
              aria-pressed={active}
              onClick={() => setTierId(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="vari-table-wrap">
        <table className="vari-table" aria-labelledby={captionId}>
          <caption id={captionId}>
            Minimum residual income · {tier.label}
          </caption>
          <thead>
            <tr>
              <th scope="col">Family size</th>
              <th scope="col">Northeast</th>
              <th scope="col">Midwest</th>
              <th scope="col">South</th>
              <th scope="col">West</th>
            </tr>
          </thead>
          <tbody>
            {tier.rows.map((row) => (
              <tr key={row.family}>
                <td className="vari-family-cell">{row.family}</td>
                <td>{row.northeast}</td>
                <td>{row.midwest}</td>
                <td>{row.south}</td>
                <td>{row.west}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="vari-mobile-stack" aria-hidden="false">
          {tier.rows.map((row) => (
            <div key={row.family} className="vari-card">
              <span className="vari-card-family">Family of {row.family}</span>
              <div className="vari-card-row"><span className="vari-card-region">Northeast</span><span className="vari-card-amount">{row.northeast}</span></div>
              <div className="vari-card-row"><span className="vari-card-region">Midwest</span><span className="vari-card-amount">{row.midwest}</span></div>
              <div className="vari-card-row"><span className="vari-card-region">South</span><span className="vari-card-amount">{row.south}</span></div>
              <div className="vari-card-row"><span className="vari-card-region">West</span><span className="vari-card-amount">{row.west}</span></div>
            </div>
          ))}
        </div>

        <p className="vari-add-rule">
          <strong>Family of 6 or more:</strong> {tier.addRule}.
        </p>
      </div>

      <div className="vari-region-key">
        <p className="vari-region-heading">Region key</p>
        <div className="vari-region-grid">
          {REGIONS.map((r) => (
            <div key={r.name} className="vari-region-card">
              <span className="vari-region-name">{r.name}</span>
              <span className="vari-region-states">{r.states}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
