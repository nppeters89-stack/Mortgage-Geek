import { useState } from "react";
import { P, F } from "../theme";

const FACTORS = [
  {
    id: "credit",
    title: "1. Excellent credit history",
    summary: "Generally a 680+ credit score with no major derogs in the last 12 months.",
    body: "Generally interpreted as a credit score of 680+ with no major derogatory events in the last 12 months. Each lender's overlay defines this slightly differently, but 680 is the most common floor.",
    docs: "Documentation: credit report.",
  },
  {
    id: "conservative",
    title: "2. Conservative use of consumer credit",
    summary: "Low utilization, no new credit recently, paying balances in full.",
    body: "Low credit utilization on revolving accounts (typically under 30%), no new credit obtained in the recent past, and a pattern of paying balances in full or near-full each month.",
    docs: "Documentation: credit report.",
  },
  {
    id: "payment-shock",
    title: "3. Minimum payment shock (under 20%)",
    summary: "New PITI is no more than 20% higher than current housing payment.",
    body: "Payment shock is calculated as (proposed housing payment minus current housing payment) divided by current housing payment. If the new PITI is no more than 20% higher than the current housing payment, this counts as a comp factor. Cannot be used if the borrower has no current housing payment (living rent-free).",
    docs: "Documentation: 12-month housing history.",
  },
  {
    id: "long-term-employment",
    title: "4. Long-term employment (2+ years)",
    summary: "Stable employment of 2+ years, especially in same industry or with same employer.",
    body: "Stable, continuous employment of at least 2 years, especially in the same industry or with the same employer.",
    docs: "Documentation: employer-verified work history.",
  },
  {
    id: "down-payment",
    title: "5. Sizable down payment (5%+)",
    summary: "Most VA loans are 0% down. 5%+ from borrower's own funds qualifies.",
    body: "Most VA loans are 0% down. A down payment of 5% or more from the borrower's own funds (no gifts) qualifies as a comp factor.",
    docs: null,
  },
  {
    id: "reserves",
    title: "6. Significant liquid assets / reserves (2+ months PITI)",
    summary: "Reserves above and beyond what's needed for closing. Tiered to DTI bands.",
    body: "Reserves above and beyond what's needed for closing. Tiered:",
    bullets: [
      "2 months reserves: usable up to 50% DTI",
      "3 months reserves: usable up to 55% DTI",
      "4+ months reserves: usable at all DTI ranges",
    ],
    bulletsFooter: "Reserves must be in the borrower's own accounts (no gifts, no cash-out proceeds).",
    note: "VA's handbook lists \"significant liquid assets\" as a comp factor but does not explicitly tie reserve months to specific DTI bands. The tiering above is a conservative way to think about how reserves stack against higher DTI on a manual file. Lender overlays may approach this differently.",
  },
  {
    id: "residual-200",
    title: "7. Residual income at 200%+ of guideline (2x residual)",
    summary: "Residual income at least double the regional minimum for family size.",
    body: "If residual income is at least double the regional minimum for the family size, this counts as a strong comp factor. This is one of the most powerful factors available on a VA manual.",
    docs: null,
  },
  {
    id: "additional-income",
    title: "8. Additional income not used in qualifying",
    summary: "Documented, stable income not included in qualifying calculation.",
    body: "Income that's documented and stable but not included in the qualifying calculation. Example: bonus or commission income with less than 2 years of history that becomes a comp factor instead.",
    docs: null,
  },
  {
    id: "military-benefits",
    title: "9. Military benefits",
    summary: "Tax-free benefits the veteran is currently receiving but not counted in qualifying income.",
    body: "Tax-free benefits the veteran is currently receiving but that aren't counted in qualifying income (educational benefits, certain disability compensation, etc.).",
    docs: "Documentation: VA award letters.",
  },
  {
    id: "homeownership",
    title: "10. Satisfactory homeownership experience",
    summary: "Borrower previously owned a home for 2+ years with on-time payments.",
    body: "The borrower has previously owned a home for 2+ years and made payments on time.",
    docs: "Documentation: previous mortgage history.",
  },
  {
    id: "childcare-credit",
    title: "11. Tax credits for childcare",
    summary: "Federal childcare tax credit supported by tax returns.",
    body: "If tax returns support a childcare expense and the borrower is eligible for the federal childcare tax credit, that credit can be used as a comp factor.",
    docs: null,
  },
  {
    id: "tax-benefits",
    title: "12. Tax benefits for home ownership",
    summary: "Documented property tax exemption (e.g., disabled veteran exemption).",
    body: "If the veteran qualifies with property taxes that may be reduced by an exemption (such as a disabled veteran property tax exemption), the documented exemption can be used as a comp factor.",
    docs: null,
  },
  {
    id: "energy-efficient",
    title: "13. Energy efficient home (RESNET HERS report)",
    summary: "HERS report dated within 12 months of closing for documented energy-efficient homes.",
    body: "For homes with documented energy efficiency, an Energy Rating System (HERS) report dated within 12 months of closing can be used as a comp factor, provided family size doesn't exceed bedroom count plus one. Per VA Circular 26-25-7.",
    docs: null,
  },
];

export function VACompFactorsGrid() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const onKeyDown = (e, idx) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.getElementById(`vacf-btn-${(idx + 1) % FACTORS.length}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      document.getElementById(`vacf-btn-${(idx - 1 + FACTORS.length) % FACTORS.length}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById("vacf-btn-0")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`vacf-btn-${FACTORS.length - 1}`)?.focus();
    }
  };

  return (
    <div className="vacf-container" role="region" aria-label="VA compensating factors">
      <style>{`
        .vacf-container {
          background: ${P.navyDark};
          border: 2px solid ${P.gold};
          border-radius: 14px;
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 8px 32px rgba(15, 37, 48, 0.22);
        }
        .vacf-row-btn {
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
        .vacf-row-btn:first-of-type { border-top: none; }
        .vacf-row-btn:hover { background: rgba(255, 255, 255, 0.03); }
        .vacf-row-btn:focus-visible { outline: 2px solid ${P.gold}; outline-offset: -2px; }
        .vacf-row-btn-open {
          background: rgba(255, 255, 255, 0.04) !important;
          border-left-color: ${P.gold} !important;
        }
        .vacf-row-title {
          display: block;
          font-family: ${F.body};
          font-size: 15px;
          font-weight: 600;
          color: ${P.cream};
          letter-spacing: 0.2px;
          margin-bottom: 4px;
        }
        .vacf-row-summary {
          display: block;
          font-family: ${F.body};
          font-size: 13.5px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.62);
        }
        .vacf-row-icon {
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
        .vacf-row-icon-open {
          transform: translateY(-50%) rotate(45deg);
          color: ${P.goldLight};
        }
        .vacf-row-detail {
          background: ${P.cream};
          border-left: 3px solid ${P.gold};
          border-top: 1px solid rgba(212, 168, 67, 0.25);
          padding: 22px 26px;
        }
        .vacf-row-detail p {
          font-family: ${F.body};
          font-size: 14px;
          line-height: 1.7;
          color: ${P.text};
          margin-bottom: 12px;
        }
        .vacf-row-detail p:last-child { margin-bottom: 0; }
        .vacf-row-detail ul {
          list-style: none;
          padding: 0;
          margin: 0 0 12px;
        }
        .vacf-row-detail li {
          font-family: ${F.body};
          font-size: 14px;
          line-height: 1.6;
          color: ${P.text};
          padding: 6px 0 6px 22px;
          position: relative;
        }
        .vacf-row-detail li::before {
          content: "•";
          position: absolute;
          left: 6px;
          top: 6px;
          color: ${P.gold};
          font-weight: 700;
        }
        .vacf-row-docs {
          font-family: ${F.body};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${P.goldMuted};
        }
        .vacf-row-note {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px dashed ${P.creamDark};
          font-family: ${F.body};
          font-size: 12.5px;
          line-height: 1.6;
          color: ${P.warmGray};
          font-style: italic;
        }

        @media (max-width: 600px) {
          .vacf-row-btn { padding: 20px 50px 20px 22px; }
          .vacf-row-icon { right: 20px; }
          .vacf-row-detail { padding: 18px 20px; }
        }
      `}</style>

      {FACTORS.map((factor, idx) => {
        const isOpen = openId === factor.id;
        const panelId = `vacf-panel-${factor.id}`;
        const btnId = `vacf-btn-${idx}`;
        return (
          <div key={factor.id}>
            <button
              id={btnId}
              type="button"
              className={`vacf-row-btn${isOpen ? " vacf-row-btn-open" : ""}`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(factor.id)}
              onKeyDown={(e) => onKeyDown(e, idx)}
            >
              <span className="vacf-row-title">{factor.title}</span>
              <span className="vacf-row-summary">{factor.summary}</span>
              <span className={`vacf-row-icon${isOpen ? " vacf-row-icon-open" : ""}`} aria-hidden="true">+</span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className="vacf-row-detail"
              >
                <p>{factor.body}</p>
                {factor.bullets && (
                  <ul>
                    {factor.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
                {factor.bulletsFooter && <p>{factor.bulletsFooter}</p>}
                {factor.docs && (
                  <p><span className="vacf-row-docs">{factor.docs}</span></p>
                )}
                {factor.note && (
                  <p className="vacf-row-note">{factor.note}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
