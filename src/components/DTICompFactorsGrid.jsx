import { useState } from "react";
import { P, F } from "../theme";

const ROWS = [
  {
    id: "sub-580",
    score: "500–579 or no score",
    ratios: "31 / 43",
    summary: "Compensating factors not available",
    detail: {
      text: "Borrowers with scores below 580 or no credit score cannot exceed 31/43 on a manual. Compensating factors can't stretch this tier.",
      bullets: [
        "Housing ratio cap: 31%",
        "Total DTI cap: 43%",
        "Energy-efficient homes may stretch to 33 / 45",
        "No compensating factors can unlock higher ratios at this credit tier",
      ],
    },
  },
  {
    id: "baseline",
    score: "580 and above",
    ratios: "31 / 43",
    summary: "No compensating factors required",
    detail: {
      text: "This is the baseline tier. If your ratios are at or below 31/43, you don't need to document any compensating factors on a manual.",
      bullets: [
        "Housing ratio cap: 31%",
        "Total DTI cap: 43%",
        "Energy-efficient homes may stretch to 33 / 45",
        "Still requires the 1-month reserves baseline from borrower's own funds",
      ],
    },
  },
  {
    id: "one-factor",
    score: "580 and above",
    ratios: "37 / 47",
    summary: "One compensating factor required",
    detail: {
      text: "To stretch into this tier, you need ONE of the following documented compensating factors:",
      bullets: [
        "Verified cash reserves (3+ months for 1–2 unit, 6+ months for 3–4 unit)",
        "Minimal increase in housing payment (new PITI within the lesser of $100 or 5% of current housing payment)",
        "Residual income meeting VA's regional standard for household size",
      ],
    },
  },
  {
    id: "no-disc",
    score: "580 and above",
    ratios: "40 / 40",
    summary: "No discretionary debt (sole factor)",
    detail: {
      text: "This tier is unique. The ONLY compensating factor that qualifies is no discretionary debt, and it stands alone.",
      bullets: [
        "Established tradelines open for at least 6 months",
        "All revolving accounts paid in full each month for at least the past 6 months",
        "Once the new mortgage starts, no installment-style debt other than the mortgage itself",
        "Housing ratio and total DTI both capped at 40%",
      ],
    },
  },
  {
    id: "two-factors",
    score: "580 and above",
    ratios: "40 / 50",
    summary: "Two compensating factors required",
    detail: {
      text: "The top tier HUD allows on a manual. Needs TWO of the following documented factors:",
      bullets: [
        "Verified cash reserves (3+ months for 1–2 unit, 6+ months for 3–4 unit)",
        "Minimal increase in housing payment (within $100 or 5% of current)",
        "Significant additional income not included in qualifying income (12+ months history, documented to continue, only usable between 37/47 and 40/50)",
        "Residual income meeting VA's regional standard",
      ],
    },
  },
];

export function DTICompFactorsGrid() {
  const [openRowId, setOpenRowId] = useState(null);

  const toggle = (id) => setOpenRowId((prev) => (prev === id ? null : id));

  const onKeyDown = (e, idx) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = document.getElementById(`dti-row-btn-${(idx + 1) % ROWS.length}`);
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = document.getElementById(`dti-row-btn-${(idx - 1 + ROWS.length) % ROWS.length}`);
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById("dti-row-btn-0")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`dti-row-btn-${ROWS.length - 1}`)?.focus();
    }
  };

  return (
    <div
      style={{
        background: P.white,
        border: `1px solid ${P.creamDark}`,
        borderRadius: 12,
        overflow: "hidden",
        margin: "28px 0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
      role="region"
      aria-label="DTI and compensating factors grid"
    >
      <style>{`
        .dti-row-btn {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 1.6fr 36px;
          gap: 16px;
          align-items: center;
          width: 100%;
          min-height: 64px;
          padding: 16px 20px;
          background: ${P.white};
          border: none;
          border-top: 1px solid ${P.creamDark};
          border-left: 3px solid transparent;
          font-family: ${F.body};
          font-size: 14px;
          color: ${P.text};
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, border-left-color 0.15s;
        }
        .dti-row-btn:first-of-type { border-top: none; }
        .dti-row-btn:hover { background: ${P.cream}; }
        .dti-row-btn:focus-visible { outline: 2px solid ${P.gold}; outline-offset: -2px; }
        .dti-row-btn-open {
          background: ${P.cream} !important;
          border-left-color: ${P.gold} !important;
        }
        .dti-row-score { font-weight: 600; color: ${P.navy}; }
        .dti-row-ratios {
          font-family: ${F.display};
          font-size: 18px;
          color: ${P.gold};
        }
        .dti-row-summary { color: ${P.warmGray}; font-size: 13px; line-height: 1.5; }
        .dti-row-icon {
          font-family: ${F.body};
          font-size: 20px;
          color: ${P.warmGrayLight};
          justify-self: end;
          transition: transform 0.2s;
          line-height: 1;
        }
        .dti-row-icon-open { transform: rotate(45deg); color: ${P.gold}; }
        .dti-row-detail {
          background: ${P.cream};
          border-left: 3px solid ${P.gold};
          border-top: 1px solid ${P.creamDark};
          padding: 20px 24px;
        }
        .dti-row-detail p {
          font-size: 14px;
          line-height: 1.65;
          color: ${P.text};
          margin-bottom: 12px;
        }
        .dti-row-detail ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .dti-row-detail li {
          font-size: 14px;
          line-height: 1.6;
          color: ${P.text};
          padding: 6px 0 6px 22px;
          position: relative;
        }
        .dti-row-detail li::before {
          content: "•";
          position: absolute;
          left: 6px;
          top: 6px;
          color: ${P.gold};
          font-weight: 700;
        }
        .dti-row-headers {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 1.6fr 36px;
          gap: 16px;
          padding: 12px 20px;
          background: ${P.navy};
          color: ${P.white};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }
        @media (max-width: 600px) {
          .dti-row-headers { display: none; }
          .dti-row-btn {
            grid-template-columns: 1fr 28px;
            grid-template-rows: auto auto auto;
            gap: 6px 12px;
            padding: 14px 16px;
            min-height: 64px;
          }
          .dti-row-score {
            grid-column: 1;
            grid-row: 1;
            font-size: 12px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            color: ${P.warmGrayLight};
            font-weight: 600;
          }
          .dti-row-ratios {
            grid-column: 1;
            grid-row: 2;
            font-size: 22px;
          }
          .dti-row-summary {
            grid-column: 1 / span 2;
            grid-row: 3;
          }
          .dti-row-icon {
            grid-column: 2;
            grid-row: 1 / span 2;
            align-self: center;
          }
          .dti-row-detail { padding: 16px 18px; }
        }
      `}</style>

      <div className="dti-row-headers" aria-hidden="true">
        <span>Credit Score</span>
        <span>Max Ratios</span>
        <span>Compensating Factors</span>
        <span></span>
      </div>

      {ROWS.map((row, idx) => {
        const isOpen = openRowId === row.id;
        const panelId = `dti-row-panel-${row.id}`;
        const btnId = `dti-row-btn-${idx}`;
        return (
          <div key={row.id}>
            <button
              id={btnId}
              type="button"
              className={`dti-row-btn${isOpen ? " dti-row-btn-open" : ""}`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(row.id)}
              onKeyDown={(e) => onKeyDown(e, idx)}
            >
              <span className="dti-row-score">{row.score}</span>
              <span className="dti-row-ratios">{row.ratios}</span>
              <span className="dti-row-summary">{row.summary}</span>
              <span className={`dti-row-icon${isOpen ? " dti-row-icon-open" : ""}`} aria-hidden="true">+</span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className="dti-row-detail"
              >
                <p>{row.detail.text}</p>
                <ul>
                  {row.detail.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
