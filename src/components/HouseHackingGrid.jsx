import { useState, useId } from "react";
import { P, F, PROGRAM_COLORS } from "../theme";

// Scenario x loan-program click-to-expand grid for the House Hacking Deep Dive.
// Mirrors the canonical SellerConcessionsGrid scaffold (table + row expand +
// mobile stacked cards + a11y + static crawler fallback). Program columns carry a
// decorative PROGRAM_COLORS top-border accent (kept off the header text, which
// stays on navy for AA). Each row expands to that scenario's detail, surfaced
// verbatim from the matching body section.
const PROGRAMS = [
  { key: "fha",  label: "FHA",          color: PROGRAM_COLORS.FHA },
  { key: "va",   label: "VA",           color: PROGRAM_COLORS.VA },
  { key: "conv", label: "Conventional", subtitle: "Fannie / Freddie", color: PROGRAM_COLORS.Conventional },
  { key: "usda", label: "USDA",         color: PROGRAM_COLORS.USDA },
];

const ROWS = [
  {
    id: "duplex",
    label: "Duplex (2 units)",
    cells: {
      fha:  "3.5% down. 75% of rent counts. No self-sufficiency test.",
      va:   "$0 down (full entitlement). Rent can help qualify.",
      conv: "5% down (owner-occupied). No self-sufficiency test.",
      usda: "Not eligible. Single-family owner-occupied only.",
    },
    detail: "A two-unit property is the most forgiving way to start. You live in one unit, rent the other, and on an FHA loan you can do it with 3.5% down (with a 580 or higher credit score). The lender can count 75% of the market rent from the unit you're renting as qualifying income. The 25% haircut covers vacancy and upkeep. Why the duplex is the friendly option: it is exempt from the FHA self-sufficiency test that trips up larger multi-unit deals. A duplex just has to appraise, meet condition standards, and have you occupy one side as your primary residence.",
  },
  {
    id: "triplex-fourplex",
    label: "Triplex / Fourplex (3-4 units)",
    cells: {
      fha:  "3.5% down BUT must pass the self-sufficiency test.",
      va:   "$0 down. Up to 4 units. Reserves/landlord docs for projected rent.",
      conv: "5% down. No self-sufficiency test. 6 months reserves required.",
      usda: "Not eligible.",
    },
    detail: "Three and four-unit properties are where house hacking gets powerful. You're living in one unit and renting two or three. You still get 3.5% down on FHA, and the most FHA will lend climbs fast with each unit. Here's the catch, and it's the part that ends more of these deals than anything else: the FHA self-sufficiency test. For 3 and 4-unit properties only, FHA requires that 75% of the appraiser's total market rent for every unit, including the one you live in, is equal to or greater than the full monthly payment (PITI). If it isn't, FHA won't insure the loan. Period. Your own income doesn't rescue it. The property itself has to “pencil.”",
  },
  {
    id: "sfh-adu",
    label: "Single-family + ADU",
    cells: {
      fha:  "Counts as 1 unit. Up to 75% of ADU rent (50% if new 203k), capped at 30% of income.",
      va:   "Allowed; property stays 1 unit. Standard VA occupancy.",
      conv: "Allowed (commonly HomeReady). Stays 1 unit.",
      usda: "ADU allowed in limited cases, but rental income not usable. Rural only.",
    },
    detail: "An accessory dwelling unit (ADU) is a separate living space on a single-family lot. A basement apartment, a garage conversion, a casita, a mother-in-law suite. The strategic point that most people miss: a single-family home with one ADU is still a one-unit property in the eyes of the loan. That means one-unit loan limits, one-unit down payment, and no self-sufficiency test. You get a house-hacking income stream without crossing into multi-unit underwriting. Since 2023 (FHA Mortgagee Letter 2023-17), FHA lets you count the ADU's rent as qualifying income: up to 75% of the ADU's market rent (the lesser of the appraiser's market rent or the actual lease), 50% of estimated rent if you're building a new ADU through the Standard 203(k) rehab loan, and a hard cap either way: the ADU income can't exceed 30% of your total monthly qualifying income.",
  },
  {
    id: "multiple-homes",
    label: "Keep a home, buy another (multiple homes)",
    cells: {
      fha:  "Possible but requires a valid reason to keep prior home; payment counts in DTI unless offset.",
      va:   "Second-tier (bonus) entitlement. Keep first VA home as rental, buy again, often $0 down.",
      conv: "Standard; new payment plus old count in DTI unless rented and documented.",
      usda: "Not designed for this.",
    },
    detail: "A lot of veterans think you only get to use your VA loan once. You don't. Through what's called second-tier (bonus) entitlement, you can keep your first VA-financed home (rent it out once you've met the occupancy requirement) and use your remaining entitlement to buy a second primary residence, often still with $0 down. Some veterans repeat this and end up owning two or three properties over time. Two honest cautions: occupancy is the rule, not a suggestion (every VA purchase requires that you genuinely intend to move into the new home as your primary residence, typically within 60 days), and the second-use funding fee jumps from 2.15% to 3.3% unless you are exempt.",
  },
  {
    id: "room-str",
    label: "Rent by the room / STR",
    cells: {
      fha:  "Income hard to use for qualifying (long history needed). Cash-flow play.",
      va:   "Same. Occupancy still required.",
      conv: "HomeReady allows limited boarder income with history. Otherwise cash-flow only.",
      usda: "Not applicable.",
    },
    detail: "These are popular, they show up in every house-hacking video, and they can absolutely improve your cash flow. But on most loans, the income does not count toward qualifying. If you need the rent to get approved, these usually won't get you there. Renting by the room: boarder and roommate income is hard to use for qualifying. Conventional HomeReady allows limited boarder income (with a documented history and capped contribution), and FHA generally wants a long, documented track record. Short-term rentals: projected short-term rental income generally can't be used to qualify on a purchase, and you're taking on local zoning and permitting risk that can change with a city council vote. Treat any STR income as upside, never as the thing that makes your approval work.",
  },
];

export function HouseHackingGrid() {
  const [openId, setOpenId] = useState(null);
  const baseId = useId();

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  const onKey = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  return (
    <div className="hhg-container" role="region" aria-label="House hacking strategies by loan program">
      <style>{`
        .hhg-container { margin: 28px 0; font-family: ${F.body}; }
        .hhg-table-wrap {
          background: ${P.white}; border: 1px solid ${P.creamDark}; border-radius: 8px;
          overflow: hidden; box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .hhg-table { width: 100%; border-collapse: collapse; font-family: ${F.body}; font-size: 13px; table-layout: fixed; }
        .hhg-table thead th {
          background: ${P.navy}; color: ${P.cream}; font-family: ${F.body}; font-size: 11px;
          font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 14px 8px;
          text-align: center; border: none;
        }
        .hhg-table thead th.hhg-prog { border-top: 4px solid var(--prog); }
        .hhg-table thead th.hhg-scenario-head { text-align: left; padding-left: 18px; width: 26%; }
        .hhg-prog-sub {
          display: block; font-size: 9.5px; font-weight: 500; letter-spacing: 0.8px;
          text-transform: none; color: ${P.goldLight}; margin-top: 3px; font-style: italic;
        }
        .hhg-table tbody tr.hhg-row { cursor: pointer; transition: background 0.15s, border-color 0.15s; border-left: 3px solid transparent; }
        .hhg-table tbody tr.hhg-row:nth-child(odd)  { background: ${P.white}; }
        .hhg-table tbody tr.hhg-row:nth-child(even) { background: ${P.cream}; }
        .hhg-table tbody tr.hhg-row:hover { background: rgba(207, 51, 56, 0.06); }
        .hhg-table tbody tr.hhg-row.active { background: rgba(207, 51, 56, 0.10); border-left: 3px solid ${P.gold}; }
        .hhg-table tbody tr.hhg-row:focus-visible { outline: 2px solid ${P.navy}; outline-offset: -2px; }
        .hhg-table tbody th.hhg-scenario-name {
          text-align: left; padding: 14px 14px 14px 16px; color: ${P.navy}; font-family: ${F.body};
          font-weight: 600; font-size: 13.5px; line-height: 1.4; border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark}; vertical-align: middle;
        }
        .hhg-table tbody td.hhg-cell {
          padding: 14px 10px; text-align: center; border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark}; vertical-align: middle; color: ${P.text};
          font-size: 13px; font-weight: 400; line-height: 1.4;
        }
        .hhg-table tbody td.hhg-cell:last-child { border-right: none; }
        .hhg-table tbody tr.hhg-panel-row { background: ${P.navyDark}; }
        .hhg-table tbody tr.hhg-panel-row td { padding: 0; border: none; }
        .hhg-panel-inner {
          padding: 22px 24px 24px; background: ${P.navyDark}; border-left: 3px solid ${P.gold};
          border-bottom: 1px solid ${P.creamDark};
        }
        .hhg-panel-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;
          color: ${P.goldLight}; margin-bottom: 12px;
        }
        .hhg-panel-text { font-size: 14px; color: ${P.cream}; line-height: 1.7; max-width: 760px; }
        .hhg-sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
        }
        .hhg-mobile-stack { display: none; }
        @media (max-width: 700px) {
          .hhg-table-wrap { display: none; }
          .hhg-mobile-stack { display: block; }
          .hhg-mcard {
            background: ${P.white}; border: 1px solid ${P.creamDark}; border-left: 3px solid ${P.navy};
            border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .hhg-mcard.active { border-left-color: ${P.gold}; }
          .hhg-mcard-head {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
            width: 100%; min-height: 44px; background: none; border: none; padding: 4px 0 12px;
            cursor: pointer; text-align: left; font-family: ${F.body};
          }
          .hhg-mcard-title { font-size: 14px; font-weight: 700; color: ${P.navy}; line-height: 1.4; flex: 1; }
          .hhg-mcard-caret { color: ${P.gold}; font-size: 18px; line-height: 1; flex-shrink: 0; }
          .hhg-mchip-row {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
            padding: 10px 0; border-top: 1px solid ${P.creamDark};
          }
          .hhg-mchip-prog {
            font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;
            color: ${P.warmGray}; min-width: 72px; padding-top: 2px; border-left: 3px solid var(--prog); padding-left: 8px;
          }
          .hhg-mchip-brief { font-size: 13px; color: ${P.text}; text-align: right; flex: 1; line-height: 1.45; }
          .hhg-mpanel { background: ${P.navyDark}; border-radius: 6px; padding: 14px; margin-top: 10px; }
          .hhg-mpanel-text { font-size: 13px; color: ${P.cream}; line-height: 1.65; }
        }
      `}</style>

      <div className="hhg-table-wrap">
        <table className="hhg-table" aria-label="House hacking strategies by scenario and loan program">
          <thead>
            <tr>
              <th scope="col" className="hhg-scenario-head">Strategy</th>
              {PROGRAMS.map((p) => (
                <th key={p.key} scope="col" className="hhg-prog" style={{ "--prog": p.color }}>
                  {p.label}
                  {p.subtitle && <span className="hhg-prog-sub">{p.subtitle}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const isOpen = openId === row.id;
              const panelId = `${baseId}-panel-${row.id}`;
              const rowId = `${baseId}-row-${row.id}`;
              return (
                <RowGroup
                  key={row.id}
                  row={row}
                  isOpen={isOpen}
                  rowId={rowId}
                  panelId={panelId}
                  onToggle={() => toggle(row.id)}
                  onKey={(e) => onKey(e, row.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="hhg-mobile-stack">
        {ROWS.map((row) => {
          const isOpen = openId === row.id;
          const panelId = `${baseId}-mpanel-${row.id}`;
          return (
            <div key={row.id} className={`hhg-mcard${isOpen ? " active" : ""}`}>
              <button
                type="button"
                className="hhg-mcard-head"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(row.id)}
              >
                <span className="hhg-mcard-title">{row.label}</span>
                <span className="hhg-mcard-caret" aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              {PROGRAMS.map((p) => (
                <div key={p.key} className="hhg-mchip-row">
                  <span className="hhg-mchip-prog" style={{ "--prog": p.color }}>{p.label}</span>
                  <span className="hhg-mchip-brief">{row.cells[p.key]}</span>
                </div>
              ))}
              {isOpen && (
                <div className="hhg-mpanel" id={panelId} role="region" aria-label={`${row.label}: detail`}>
                  <p className="hhg-mpanel-text">{row.detail}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Static fallback for crawlers / non-JS / screen readers: every brief + the
          row detail, so the grid is fully indexable in the prerendered HTML. */}
      <div className="hhg-sr-only">
        <table>
          <caption>House hacking strategies by loan program: full reference</caption>
          <thead>
            <tr>
              <th scope="col">Strategy</th>
              {PROGRAMS.map((p) => (
                <th key={p.key} scope="col">{p.label}{p.subtitle ? ` (${p.subtitle})` : ""}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {PROGRAMS.map((p) => (
                  <td key={p.key}>{row.cells[p.key]}</td>
                ))}
              </tr>
            ))}
            {ROWS.map((row) => (
              <tr key={`${row.id}-detail`}>
                <th scope="row">{row.label}: detail</th>
                <td colSpan={PROGRAMS.length}>{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowGroup({ row, isOpen, rowId, panelId, onToggle, onKey }) {
  return (
    <>
      <tr
        id={rowId}
        className={`hhg-row${isOpen ? " active" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={onKey}
      >
        <th scope="row" className="hhg-scenario-name">{row.label}</th>
        {PROGRAMS.map((p) => (
          <td key={p.key} className="hhg-cell">{row.cells[p.key]}</td>
        ))}
      </tr>
      {isOpen && (
        <tr className="hhg-panel-row">
          <td colSpan={PROGRAMS.length + 1}>
            <div className="hhg-panel-inner" id={panelId} role="region" aria-labelledby={rowId}>
              <div className="hhg-panel-eyebrow">{row.label}</div>
              <p className="hhg-panel-text">{row.detail}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
