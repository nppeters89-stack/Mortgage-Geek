import { useState } from "react";
import { P, F } from "../theme";

const TERMS = [
  { id: "note-rate", cat: "rate", title: "Note Rate", summary: "The initial rate, fixed for the initial fixed period.", body: "The initial interest rate charged when an ARM is originated, fixed for the entire initial fixed period. Also called the start rate, teaser rate, or discounted rate. This is the rate that determines your initial monthly payment." },
  { id: "margin", cat: "rate", title: "Margin", summary: "Fixed percentage added to the index. Set at origination, never changes.", body: "The fixed percentage added to the index to calculate the fully indexed rate at each adjustment. Set at origination, never changes. Typical range: 2.0% to 3.5%. The margin is one of the most important comparison points when shopping ARMs across lenders." },
  { id: "index", cat: "rate", title: "Index", summary: "Market benchmark used to calculate adjustments. Usually SOFR or CMT.", body: "A market benchmark interest rate used to calculate ARM adjustments. The two most common are SOFR (Secured Overnight Financing Rate) and CMT (Constant Maturity Treasury). The index is set by market forces, not by you or your lender, and it's whatever value applies on your specific adjustment date." },
  { id: "fully-indexed-rate", cat: "rate", title: "Fully Indexed Rate", summary: "Index + Margin, rounded to the nearest 1/8 of a percent.", body: "The actual rate your loan will adjust to at any given adjustment date, calculated as Index + Margin. Federal regulations require lenders to round this to the nearest 1/8 of a percent." },
  { id: "floor", cat: "caps", title: "Floor", summary: "The minimum rate your loan can charge. Usually set at the original note rate.", body: "The minimum rate your loan can ever charge, even if the index drops dramatically. Usually set at the original note rate. So if you started at 6.0% and your floor is 6.0%, your rate cannot go below 6.0% even if the fully indexed rate would calculate lower." },
  { id: "ceiling", cat: "caps", title: "Ceiling (Lifetime Cap)", summary: "The maximum rate your loan can ever charge. Note rate plus the lifetime cap.", body: "The maximum rate your loan can ever charge over the life of the loan. Usually expressed as your original note rate plus the lifetime cap percentage. If you started at 6.0% with a 5.0% lifetime cap, your ceiling is 11.0%." },
  { id: "initial-cap", cat: "caps", title: "Initial Cap (First Adjustment Cap)", summary: "Maximum rate change at the very first adjustment.", body: "The maximum amount your rate can change at the very first adjustment, after the initial fixed period ends. A 5% initial cap means the rate can go up or down by no more than 5 percentage points at the first reset." },
  { id: "periodic-cap", cat: "caps", title: "Periodic Cap (Subsequent Adjustment Cap)", summary: "Maximum rate change at each adjustment after the first one.", body: "The maximum amount your rate can change at each adjustment after the first one. A 1% periodic cap means each subsequent adjustment is limited to 1 percentage point in either direction." },
  { id: "lifetime-cap", cat: "caps", title: "Lifetime Cap", summary: "Maximum total amount the rate can ever exceed the original note rate.", body: "The maximum amount your rate can ever exceed the original note rate, total, over the life of the loan. The lifetime cap is the ceiling minus the note rate. A 5% lifetime cap on a 6.0% note rate means your rate can never go above 11.0%." },
  { id: "payment-shock", cat: "uw", title: "Payment Shock", summary: "The increase in your monthly payment when a rate adjustment lands.", body: "The increase in your monthly payment when an adjustment causes your rate to jump significantly. Lenders care about payment shock because borrowers who can't absorb it tend to default. Some lender overlays specifically test for payment shock as part of qualifying." },
  { id: "qualifying-rate", cat: "uw", title: "Qualifying Rate", summary: "The rate the lender uses to decide whether you can afford the loan.", body: "The rate the lender uses to determine whether you can afford the loan. On a fixed-rate loan this is just your note rate. On an ARM, the qualifying rate is often higher than your note rate (more on this below), which means your DTI calculation uses a payment higher than what you'll actually pay during the fixed period." },
  { id: "fully-amortizing-payment", cat: "uw", title: "Fully Amortizing Payment", summary: "Monthly payment required to pay off the loan in full by maturity.", body: "The monthly payment required to pay off the loan in full by the end of its term, accounting for both principal and interest. ARMs recast their amortization schedule at each adjustment to ensure the loan still pays off by maturity." },
];

const CATEGORIES = [
  { id: "rate", label: "Rate Mechanics" },
  { id: "caps", label: "Caps & Limits" },
  { id: "uw", label: "Underwriting" },
];

export function ARMTermsGlossary() {
  const [activeCat, setActiveCat] = useState("rate");
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  const setCat = (id) => { setActiveCat(id); setOpenId(null); };

  const visible = TERMS.filter((t) => t.cat === activeCat);

  const onTabKeyDown = (e, idx) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % CATEGORIES.length;
      document.getElementById(`armg-tab-${CATEGORIES[next].id}`)?.focus();
      setCat(CATEGORIES[next].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + CATEGORIES.length) % CATEGORIES.length;
      document.getElementById(`armg-tab-${CATEGORIES[prev].id}`)?.focus();
      setCat(CATEGORIES[prev].id);
    }
  };

  return (
    <div className="armg-container" role="region" aria-label="ARM terms glossary">
      <style>{`
        .armg-container {
          background: linear-gradient(180deg, ${P.navyDark} 0%, ${P.navy} 100%);
          border: 1px solid rgba(207, 51, 56, 0.25);
          border-radius: 14px;
          padding: 18px;
          margin: 28px 0;
          box-shadow: 0 8px 32px rgba(15, 37, 48, 0.22);
        }

        /* Pill tabs */
        .armg-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .armg-tab {
          flex: 1 1 auto;
          min-width: 90px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.06);
          color: ${P.cream};
          border: 1px solid rgba(207, 51, 56, 0.2);
          border-radius: 10px;
          font-family: ${F.body};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
        }
        .armg-tab:hover { background: rgba(255, 255, 255, 0.1); }
        .armg-tab:focus-visible { outline: 2px solid ${P.goldLight}; outline-offset: 2px; }
        .armg-tab-active {
          background: ${P.gold} !important;
          color: ${P.navyDark} !important;
          border-color: ${P.gold} !important;
        }
        .armg-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 10px;
          background: rgba(207, 51, 56, 0.2);
          color: ${P.goldLight};
          font-size: 11px;
          font-weight: 700;
        }
        .armg-tab-active .armg-tab-count {
          background: rgba(15, 37, 48, 0.18);
          color: ${P.navyDark};
        }

        /* Card grid — 1 col on phone, multi-col on wider screens */
        .armg-grid {
          display: grid;
          gap: 8px;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }
        .armg-card {
          background: ${P.cream};
          border: 1px solid ${P.creamDark};
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .armg-card-open {
          border-color: ${P.gold} !important;
          box-shadow: 0 4px 16px rgba(207, 51, 56, 0.18) !important;
          grid-column: 1 / -1;
        }
        .armg-card-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 16px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          font-family: ${F.body};
          gap: 10px;
          min-height: 56px;
        }
        .armg-card-btn:focus-visible { outline: 2px solid ${P.gold}; outline-offset: -2px; border-radius: 10px; }
        .armg-card-title {
          font-size: 14.5px;
          font-weight: 700;
          color: ${P.navy};
          line-height: 1.3;
          margin-bottom: 4px;
        }
        .armg-card-open .armg-card-title { margin-bottom: 0; }
        .armg-card-summary {
          font-size: 12.5px;
          color: ${P.warmGray};
          line-height: 1.4;
        }
        .armg-card-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(207, 51, 56, 0.12);
          color: ${P.goldMuted};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .armg-card-open .armg-card-icon {
          background: ${P.gold};
          color: ${P.navyDark};
          transform: rotate(45deg);
        }
        .armg-card-detail {
          padding: 14px 16px 16px;
          border-top: 1px solid ${P.creamDark};
          margin-top: 4px;
        }
        .armg-card-quote {
          font-family: ${F.display};
          font-size: 15px;
          font-style: italic;
          color: ${P.goldMuted};
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .armg-card-body {
          font-family: ${F.body};
          font-size: 13.5px;
          line-height: 1.7;
          color: ${P.text};
          margin: 0;
        }

        @media (max-width: 600px) {
          .armg-container { padding: 14px; }
          .armg-tab { padding: 10px 10px; font-size: 12.5px; }
        }
      `}</style>

      {/* Pill tabs */}
      <div className="armg-tabs" role="tablist" aria-label="Term categories">
        {CATEGORIES.map((cat, idx) => {
          const active = activeCat === cat.id;
          const count = TERMS.filter((t) => t.cat === cat.id).length;
          return (
            <button
              key={cat.id}
              id={`armg-tab-${cat.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`armg-panel-${cat.id}`}
              tabIndex={active ? 0 : -1}
              className={`armg-tab${active ? " armg-tab-active" : ""}`}
              onClick={() => setCat(cat.id)}
              onKeyDown={(e) => onTabKeyDown(e, idx)}
            >
              <span>{cat.label}</span>
              <span className="armg-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <div
        className="armg-grid"
        id={`armg-panel-${activeCat}`}
        role="tabpanel"
        aria-labelledby={`armg-tab-${activeCat}`}
      >
        {visible.map((term) => {
          const isOpen = openId === term.id;
          const detailId = `armg-detail-${term.id}`;
          return (
            <div key={term.id} className={`armg-card${isOpen ? " armg-card-open" : ""}`}>
              <button
                type="button"
                className="armg-card-btn"
                aria-expanded={isOpen}
                aria-controls={detailId}
                onClick={() => toggle(term.id)}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="armg-card-title">{term.title}</div>
                  {!isOpen && <div className="armg-card-summary">{term.summary}</div>}
                </div>
                <div className="armg-card-icon" aria-hidden="true">+</div>
              </button>
              {isOpen && (
                <div id={detailId} className="armg-card-detail">
                  <div className="armg-card-quote">&ldquo;{term.summary}&rdquo;</div>
                  <p className="armg-card-body">{term.body}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
