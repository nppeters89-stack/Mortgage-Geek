import { useState } from "react";
import { P, F } from "../theme";

const TERMS = [
  {
    id: "note-rate",
    title: "Note Rate",
    summary: "The initial rate, fixed for the initial fixed period.",
    body: "The initial interest rate charged when an ARM is originated, fixed for the entire initial fixed period. Also called the start rate, teaser rate, or discounted rate. This is the rate that determines your initial monthly payment.",
  },
  {
    id: "margin",
    title: "Margin",
    summary: "Fixed percentage added to the index. Set at origination, never changes.",
    body: "The fixed percentage added to the index to calculate the fully indexed rate at each adjustment. Set at origination, never changes. Typical range: 2.0% to 3.5%. The margin is one of the most important comparison points when shopping ARMs across lenders.",
  },
  {
    id: "index",
    title: "Index",
    summary: "Market benchmark used to calculate adjustments. Usually SOFR or CMT.",
    body: "A market benchmark interest rate used to calculate ARM adjustments. The two most common are SOFR (Secured Overnight Financing Rate) and CMT (Constant Maturity Treasury). The index is set by market forces, not by you or your lender, and it's whatever value applies on your specific adjustment date.",
  },
  {
    id: "fully-indexed-rate",
    title: "Fully Indexed Rate",
    summary: "Index + Margin, rounded to the nearest 1/8 of a percent.",
    body: "The actual rate your loan will adjust to at any given adjustment date, calculated as Index + Margin. Federal regulations require lenders to round this to the nearest 1/8 of a percent.",
  },
  {
    id: "floor",
    title: "Floor",
    summary: "The minimum rate your loan can charge. Usually set at the original note rate.",
    body: "The minimum rate your loan can ever charge, even if the index drops dramatically. Usually set at the original note rate. So if you started at 6.0% and your floor is 6.0%, your rate cannot go below 6.0% even if the fully indexed rate would calculate lower.",
  },
  {
    id: "ceiling",
    title: "Ceiling (Lifetime Cap)",
    summary: "The maximum rate your loan can ever charge. Note rate plus the lifetime cap.",
    body: "The maximum rate your loan can ever charge over the life of the loan. Usually expressed as your original note rate plus the lifetime cap percentage. If you started at 6.0% with a 5.0% lifetime cap, your ceiling is 11.0%.",
  },
  {
    id: "initial-cap",
    title: "Initial Cap (First Adjustment Cap)",
    summary: "Maximum rate change at the very first adjustment.",
    body: "The maximum amount your rate can change at the very first adjustment, after the initial fixed period ends. A 5% initial cap means the rate can go up or down by no more than 5 percentage points at the first reset.",
  },
  {
    id: "periodic-cap",
    title: "Periodic Cap (Subsequent Adjustment Cap)",
    summary: "Maximum rate change at each adjustment after the first one.",
    body: "The maximum amount your rate can change at each adjustment after the first one. A 1% periodic cap means each subsequent adjustment is limited to 1 percentage point in either direction.",
  },
  {
    id: "lifetime-cap",
    title: "Lifetime Cap",
    summary: "Maximum total amount the rate can ever exceed the original note rate.",
    body: "The maximum amount your rate can ever exceed the original note rate, total, over the life of the loan. The lifetime cap is the ceiling minus the note rate. A 5% lifetime cap on a 6.0% note rate means your rate can never go above 11.0%.",
  },
  {
    id: "payment-shock",
    title: "Payment Shock",
    summary: "The increase in your monthly payment when a rate adjustment lands.",
    body: "The increase in your monthly payment when an adjustment causes your rate to jump significantly. Lenders care about payment shock because borrowers who can't absorb it tend to default. Some lender overlays specifically test for payment shock as part of qualifying.",
  },
  {
    id: "qualifying-rate",
    title: "Qualifying Rate",
    summary: "The rate the lender uses to decide whether you can afford the loan.",
    body: "The rate the lender uses to determine whether you can afford the loan. On a fixed-rate loan this is just your note rate. On an ARM, the qualifying rate is often higher than your note rate (more on this below), which means your DTI calculation uses a payment higher than what you'll actually pay during the fixed period.",
  },
  {
    id: "fully-amortizing-payment",
    title: "Fully Amortizing Payment",
    summary: "Monthly payment required to pay off the loan in full by maturity.",
    body: "The monthly payment required to pay off the loan in full by the end of its term, accounting for both principal and interest. ARMs recast their amortization schedule at each adjustment to ensure the loan still pays off by maturity.",
  },
];

export function ARMTermsGlossary() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const onKeyDown = (e, idx) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.getElementById(`armg-btn-${(idx + 1) % TERMS.length}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      document.getElementById(`armg-btn-${(idx - 1 + TERMS.length) % TERMS.length}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById("armg-btn-0")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`armg-btn-${TERMS.length - 1}`)?.focus();
    }
  };

  return (
    <div className="armg-container" role="region" aria-label="ARM terms glossary">
      <style>{`
        .armg-container {
          background: ${P.navyDark};
          border: 2px solid ${P.gold};
          border-radius: 14px;
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 8px 32px rgba(15, 37, 48, 0.22);
        }
        .armg-row-btn {
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
        .armg-row-btn:first-of-type { border-top: none; }
        .armg-row-btn:hover { background: rgba(255, 255, 255, 0.03); }
        .armg-row-btn:focus-visible { outline: 2px solid ${P.goldLight}; outline-offset: -2px; }
        .armg-row-btn-open {
          background: rgba(255, 255, 255, 0.04) !important;
          border-left-color: ${P.gold} !important;
        }
        .armg-row-title {
          display: block;
          font-family: ${F.body};
          font-size: 15px;
          font-weight: 600;
          color: ${P.cream};
          letter-spacing: 0.2px;
          margin-bottom: 4px;
        }
        .armg-row-summary {
          display: block;
          font-family: ${F.body};
          font-size: 13.5px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.62);
        }
        .armg-row-icon {
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
        .armg-row-icon-open {
          transform: translateY(-50%) rotate(45deg);
          color: ${P.goldLight};
        }
        .armg-row-detail {
          background: ${P.cream};
          border-left: 3px solid ${P.gold};
          border-top: 1px solid rgba(212, 168, 67, 0.25);
          padding: 22px 26px;
        }
        .armg-row-detail p {
          font-family: ${F.body};
          font-size: 14px;
          line-height: 1.7;
          color: ${P.text};
          margin-bottom: 0;
        }

        @media (max-width: 600px) {
          .armg-row-btn { padding: 20px 50px 20px 22px; }
          .armg-row-icon { right: 20px; }
          .armg-row-detail { padding: 18px 20px; }
        }
      `}</style>

      {TERMS.map((term, idx) => {
        const isOpen = openId === term.id;
        const panelId = `armg-panel-${term.id}`;
        const btnId = `armg-btn-${idx}`;
        return (
          <div key={term.id}>
            <button
              id={btnId}
              type="button"
              className={`armg-row-btn${isOpen ? " armg-row-btn-open" : ""}`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(term.id)}
              onKeyDown={(e) => onKeyDown(e, idx)}
            >
              <span className="armg-row-title">{term.title}</span>
              <span className="armg-row-summary">{term.summary}</span>
              <span className={`armg-row-icon${isOpen ? " armg-row-icon-open" : ""}`} aria-hidden="true">+</span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className="armg-row-detail"
              >
                <p>{term.body}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
