import { useState } from "react";
import { P, F } from "../theme";

const FACTORS = [
  {
    id: "reserves",
    title: "1. Cash reserves at 3+ months PITI",
    summary: "Post-closing reserves equal to or greater than 3 months of the proposed PITI payment.",
    body: "Accumulated savings or cash reserves available post-closing equal to or greater than three months of the proposed PITI payment. Must come from the borrower's own funds (no gifts, no business funds). Cash on hand is not eligible.",
    docs: "Documentation: VOD, recent bank statements per Chapter 9 requirements.",
  },
  {
    id: "employment",
    title: "2. Continuous employment with current primary employer (2+ years)",
    summary: "Continuously employed with the current primary employer for at least 2 years.",
    body: "The applicant has been continuously employed with the current primary employer for at least 2 years. Not applicable for self-employed applicants. Borrowers receiving Social Security benefits or retirement income for 2+ years may use a steady-receipt-of-benefits version of this factor.",
    docs: "Documentation: VOE form.",
  },
  {
    id: "min-increase",
    title: "3. Minimum increase in housing payment",
    summary: "Proposed PITI is equal to or less than the applicant's current verified housing expense.",
    body: "The proposed PITI is equal to or less than the applicant's current verified housing expense. Family or interested-party rent histories require canceled checks, money orders, or electronic payment confirmations.",
    docs: "Documentation: VOR or VOM showing actual payment due, with no more than one 30-day late in the previous 12 months.",
  },
  {
    id: "energy-efficient",
    title: "4. Energy efficient home",
    summary: "Subject property is an energy-efficient dwelling meeting current IECC standards.",
    body: "The subject property is an energy-efficient dwelling that meets the current International Energy Conservation Code (IECC) standards. Existing dwellings retrofitted to meet current IECC standards are eligible.",
    docs: "Documentation: lender verification of the home's compliance with IECC.",
  },
  {
    id: "payment-shock",
    title: "5. Payment shock minimal",
    summary: "Per PN 621 (August 2024). New PITI does not represent a meaningful payment shock relative to current housing.",
    body: "Per Procedure Notice 621 (effective August 5, 2024), payment shock is now a recognized compensating factor. The new PITI must not represent a meaningful payment shock relative to the current housing expense.",
    docs: "Documentation: similar to factor #3 (VOR or VOM with 12-month payment history).",
  },
];

export function USDACompFactorsGrid() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const onKeyDown = (e, idx) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.getElementById(`usdacf-btn-${(idx + 1) % FACTORS.length}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      document.getElementById(`usdacf-btn-${(idx - 1 + FACTORS.length) % FACTORS.length}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById("usdacf-btn-0")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`usdacf-btn-${FACTORS.length - 1}`)?.focus();
    }
  };

  return (
    <div className="usdacf-container" role="region" aria-label="USDA compensating factors">
      <style>{`
        .usdacf-container {
          background: ${P.navyDark};
          border: 2px solid ${P.gold};
          border-radius: 14px;
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 8px 32px rgba(15, 37, 48, 0.22);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .usdacf-row-btn {
          position: relative;
          display: block;
          width: 100%;
          min-height: 56px;
          padding: 22px 56px 22px 28px;
          background: transparent;
          border: none;
          border-top: 1px solid rgba(212, 168, 67, 0.18);
          border-left: 3px solid transparent;
          font-family: ${F.body};
          color: rgba(255, 255, 255, 0.78);
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, border-left-color 0.15s;
        }
        .usdacf-row-btn:first-of-type { border-top: none; }
        .usdacf-row-btn:hover { background: rgba(255, 255, 255, 0.03); }
        .usdacf-row-btn:focus-visible { outline: 2px solid ${P.goldLight}; outline-offset: -2px; }
        .usdacf-row-btn-open {
          background: rgba(255, 255, 255, 0.04) !important;
          border-left-color: ${P.gold} !important;
        }
        .usdacf-row-title {
          display: block;
          font-family: ${F.body};
          font-size: 15px;
          font-weight: 600;
          color: ${P.cream};
          letter-spacing: 0.2px;
          margin-bottom: 4px;
        }
        .usdacf-row-summary {
          display: block;
          font-family: ${F.body};
          font-size: 13.5px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.62);
        }
        .usdacf-row-icon {
          position: absolute;
          top: 50%;
          right: 24px;
          transform: translateY(-50%);
          font-family: ${F.body};
          font-size: 22px;
          color: ${P.gold};
          line-height: 1;
          transition: transform 0.2s;
        }
        .usdacf-row-icon-open {
          transform: translateY(-50%) rotate(45deg);
          color: ${P.goldLight};
        }
        .usdacf-row-detail {
          background: ${P.cream};
          border-left: 3px solid ${P.gold};
          border-top: 1px solid rgba(212, 168, 67, 0.25);
          padding: 22px 26px;
        }
        .usdacf-row-detail p {
          font-family: ${F.body};
          font-size: 14px;
          line-height: 1.7;
          color: ${P.text};
          margin-bottom: 12px;
        }
        .usdacf-row-detail p:last-child { margin-bottom: 0; }
        .usdacf-row-docs {
          font-family: ${F.body};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${P.goldMuted};
        }

        @media (max-width: 600px) {
          .usdacf-row-btn { padding: 20px 50px 20px 22px; }
          .usdacf-row-icon { right: 20px; }
          .usdacf-row-detail { padding: 18px 20px; }
        }

        @media print {
          .usdacf-container { box-shadow: none; break-inside: avoid; }
        }
      `}</style>

      {FACTORS.map((factor, idx) => {
        const isOpen = openId === factor.id;
        const panelId = `usdacf-panel-${factor.id}`;
        const btnId = `usdacf-btn-${idx}`;
        return (
          <div key={factor.id}>
            <button
              id={btnId}
              type="button"
              className={`usdacf-row-btn${isOpen ? " usdacf-row-btn-open" : ""}`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(factor.id)}
              onKeyDown={(e) => onKeyDown(e, idx)}
            >
              <span className="usdacf-row-title">{factor.title}</span>
              <span className="usdacf-row-summary">{factor.summary}</span>
              <span className={`usdacf-row-icon${isOpen ? " usdacf-row-icon-open" : ""}`} aria-hidden="true">+</span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className="usdacf-row-detail"
              >
                <p>{factor.body}</p>
                {factor.docs && (
                  <p><span className="usdacf-row-docs">{factor.docs}</span></p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
