import { useState, useEffect, useRef } from "react";
import { P, F } from "../theme";

const INELIG_RED = "#B85450";

const STATUSES = [
  "US Citizen",
  "Lawful Permanent Resident (Green Card)",
  "Asylee or Refugee",
  "Non-Permanent Resident (Work Visa or EAD)",
  "Other Temporary Visitor (Tourist, Business Visitor, etc.)",
];

const PROGRAMS = ["Conventional", "FHA", "VA", "USDA"];

const ELIGIBILITY = {
  "US Citizen": {
    Conventional: { status: "eligible", note: "Standard underwriting" },
    FHA:          { status: "eligible", note: "Standard underwriting" },
    VA:           { status: "conditional", note: "With qualifying military service" },
    USDA:         { status: "eligible", note: "Property and income limits apply" },
  },
  "Lawful Permanent Resident (Green Card)": {
    Conventional: { status: "eligible", note: "No restrictions" },
    FHA:          { status: "eligible", note: "No restrictions" },
    VA:           { status: "conditional", note: "With qualifying military service" },
    USDA:         { status: "eligible", note: "Property and income limits apply" },
  },
  "Asylee or Refugee": {
    Conventional: { status: "eligible", note: "Treated similarly to permanent resident" },
    FHA:          { status: "ineligible", note: "FHA closed to asylees and refugees on May 25, 2025" },
    VA:           { status: "conditional", note: "With qualifying military service" },
    USDA:         { status: "eligible", note: "Treated similarly to permanent resident" },
  },
  "Non-Permanent Resident (Work Visa or EAD)": {
    Conventional: { status: "eligible", note: "With valid work authorization through closing" },
    FHA:          { status: "ineligible", note: "FHA closed to non-permanent residents on May 25, 2025" },
    VA:           { status: "conditional", note: "Rare. Most non-permanent residents are not VA-eligible" },
    USDA:         { status: "eligible", note: "With valid work authorization through closing" },
  },
  "Other Temporary Visitor (Tourist, Business Visitor, etc.)": {
    Conventional: { status: "ineligible", note: "No work authorization or residency intent" },
    FHA:          { status: "ineligible", note: "No work authorization or residency intent" },
    VA:           { status: "ineligible", note: "No work authorization or residency intent" },
    USDA:         { status: "ineligible", note: "No work authorization or residency intent" },
  },
};

const STATUS_VISUALS = {
  eligible: { icon: "✓", label: "Eligible", color: P.sageDark, bg: "rgba(90, 122, 110, 0.15)", border: "rgba(90, 122, 110, 0.30)" },
  ineligible: { icon: "✗", label: "Not Eligible", color: INELIG_RED, bg: "rgba(184, 84, 80, 0.12)", border: "rgba(184, 84, 80, 0.32)" },
  conditional: { icon: "⚠", label: "Conditional", color: P.goldMuted, bg: "rgba(184, 134, 11, 0.12)", border: "rgba(184, 134, 11, 0.32)" },
};

const WORK_VISAS = [
  { code: "H-1B", desc: "Specialty occupation work visa (most common)" },
  { code: "H-1B1", desc: "Specialty occupation, Singapore/Chile treaty" },
  { code: "L-1", desc: "Intracompany transferee" },
  { code: "O-1", desc: "Extraordinary ability (sciences, arts, business, athletics)" },
  { code: "E-1/E-2/E-3", desc: "Treaty traders/investors" },
  { code: "TN/TC", desc: "NAFTA/USMCA (Canadian and Mexican professionals)" },
  { code: "R-1", desc: "Religious workers" },
  { code: "J-1", desc: "Exchange visitor (with 212(e) waiver)" },
  { code: "F-1", desc: "Student visa with valid work authorization (CPT/OPT)" },
];

const EAD_CATEGORIES = [
  { code: "A03", desc: "Refugee" },
  { code: "A05", desc: "Asylum granted" },
  { code: "C03", desc: "Student practical training (OPT/STEM-OPT)" },
  { code: "C08", desc: "Asylum applicant, status pending" },
  { code: "C09", desc: "Adjustment of status (green card pending)" },
  { code: "C26", desc: "Spouse of H-type visa holder" },
  { code: "C33", desc: "DACA recipient (Conventional via DU only)" },
];

const INELIGIBLE_STATUSES = [
  { code: "B-1/B-2", desc: "Tourist or business visitor (no work authorization)" },
  { code: "F-1 without work auth", desc: "Student visa, no CPT/OPT" },
  { code: "A/A-2", desc: "Diplomats (outside US legal jurisdiction)" },
  { code: "C", desc: "Transiting through the US" },
  { code: "H-2A/H-2B", desc: "Temporary agricultural/non-agricultural workers (rare exceptions possible)" },
  { code: "H-3", desc: "Temporary training" },
];

function cellId(statusIdx, programIdx) {
  return `reg-cell-${statusIdx}-${programIdx}`;
}

function tooltipId(statusIdx, programIdx) {
  return `reg-tip-${statusIdx}-${programIdx}`;
}

export function ResidencyEligibilityGrid() {
  const [activeCell, setActiveCell] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!activeCell) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveCell(null);
      }
    };
    const onKey = (e) => { if (e.key === "Escape") setActiveCell(null); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeCell]);

  const toggleCell = (id) => setActiveCell((prev) => (prev === id ? null : id));

  const renderCellInner = (status, program) => {
    const data = ELIGIBILITY[status][program];
    const visual = STATUS_VISUALS[data.status];
    return (
      <>
        <span className="reg-cell-icon" aria-hidden="true" style={{ color: visual.color }}>{visual.icon}</span>
        <span className="reg-cell-label" style={{ color: visual.color }}>{visual.label}</span>
      </>
    );
  };

  return (
    <div className="reg-container" ref={containerRef} role="region" aria-label="Residency status by loan program eligibility">
      <style>{`
        .reg-container {
          margin: 28px 0;
          font-family: ${F.body};
        }

        .reg-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: ${P.navy};
          color: ${P.cream};
          border-left: 4px solid ${P.gold};
          border-radius: 8px;
          padding: 20px 22px;
          margin-bottom: 22px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .reg-banner-icon {
          font-size: 18px;
          line-height: 1.4;
          color: ${P.goldLight};
          flex-shrink: 0;
        }
        .reg-banner-body {
          font-size: 14px;
          line-height: 1.65;
          color: ${P.cream};
        }
        .reg-banner-body strong { color: ${P.goldLight}; font-weight: 700; }

        .reg-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .reg-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
          table-layout: fixed;
        }
        .reg-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px 10px;
          text-align: center;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .reg-table thead th.reg-status-head {
          text-align: left;
          padding-left: 18px;
          width: 32%;
        }
        .reg-table tbody tr:nth-child(odd) { background: ${P.white}; }
        .reg-table tbody tr:nth-child(even) { background: ${P.cream}; }
        .reg-table tbody th.reg-status-name {
          text-align: left;
          padding: 16px 14px 16px 18px;
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 14px;
          line-height: 1.4;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
        }
        .reg-table tbody td {
          padding: 8px;
          text-align: center;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
          position: relative;
        }
        .reg-table tbody tr:last-child th,
        .reg-table tbody tr:last-child td { border-bottom: none; }
        .reg-table tbody td:last-child { border-right: none; }

        .reg-cell-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          min-height: 64px;
          padding: 10px 6px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          font-family: ${F.body};
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .reg-cell-btn:hover { transform: translateY(-1px); }
        .reg-cell-btn:focus-visible { outline: 2px solid ${P.navy}; outline-offset: 2px; }
        .reg-cell-icon { font-size: 16px; line-height: 1; font-weight: 700; }
        .reg-cell-label { font-size: 12px; font-weight: 600; line-height: 1.2; letter-spacing: 0.2px; }

        .reg-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          background: ${P.navyDark};
          color: ${P.cream};
          font-size: 12px;
          line-height: 1.55;
          padding: 10px 12px;
          border-radius: 6px;
          max-width: 240px;
          width: max-content;
          box-shadow: 0 6px 18px rgba(15, 37, 48, 0.28);
          pointer-events: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .reg-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: ${P.navyDark};
        }
        .reg-tooltip-bottom { bottom: auto; top: calc(100% + 8px); }
        .reg-tooltip-bottom::after {
          top: auto;
          bottom: 100%;
          border-top-color: transparent;
          border-bottom-color: ${P.navyDark};
        }

        .reg-mobile-stack { display: none; }

        .reg-detail {
          margin-top: 22px;
          background: ${P.navyDark};
          border: 2px solid ${P.gold};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(15, 37, 48, 0.2);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .reg-detail-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          min-height: 64px;
          padding: 18px 24px;
          background: transparent;
          border: none;
          color: ${P.cream};
          font-family: ${F.body};
          text-align: left;
          cursor: pointer;
        }
        .reg-detail-btn:focus-visible { outline: 2px solid ${P.goldLight}; outline-offset: -2px; }
        .reg-detail-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: ${P.cream};
          line-height: 1.4;
        }
        .reg-detail-intro {
          display: block;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.65);
          margin-top: 4px;
          font-style: italic;
        }
        .reg-detail-chevron {
          font-size: 20px;
          color: ${P.goldLight};
          line-height: 1;
          transition: transform 0.2s;
        }
        .reg-detail-chevron-open { transform: rotate(180deg); }

        .reg-detail-panel {
          background: ${P.cream};
          border-top: 1px solid rgba(212, 168, 67, 0.35);
          padding: 26px 28px;
        }
        .reg-detail-section + .reg-detail-section { margin-top: 26px; }
        .reg-detail-section h4 {
          font-family: ${F.body};
          font-size: 14px;
          font-weight: 600;
          color: ${P.navy};
          letter-spacing: 0.3px;
          margin-bottom: 12px;
        }
        .reg-detail-list { list-style: none; padding: 0; margin: 0; }
        .reg-detail-list li {
          font-size: 14px;
          line-height: 1.7;
          color: ${P.text};
          padding: 4px 0 4px 22px;
          position: relative;
        }
        .reg-detail-list li::before {
          content: "•";
          position: absolute;
          left: 6px;
          top: 4px;
          color: ${P.gold};
          font-weight: 700;
        }
        .reg-detail-list li strong { color: ${P.navy}; font-weight: 700; }
        .reg-detail-note {
          font-size: 13px;
          font-style: italic;
          color: ${P.warmGray};
          margin-top: 10px;
          line-height: 1.6;
        }

        @media (max-width: 700px) {
          .reg-table-wrap { display: none; }
          .reg-mobile-stack { display: block; }
          .reg-mobile-card {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .reg-mobile-card-title {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: ${P.navy};
            margin-bottom: 12px;
            line-height: 1.4;
          }
          .reg-mobile-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 0;
            border-top: 1px solid ${P.creamDark};
          }
          .reg-mobile-row:first-of-type { border-top: none; }
          .reg-mobile-prog {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            min-width: 90px;
            padding-top: 2px;
          }
          .reg-mobile-status {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            text-align: right;
            flex: 1;
          }
          .reg-mobile-status-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 12px;
            border: 1px solid;
          }
          .reg-mobile-note {
            font-size: 12px;
            color: ${P.warmGray};
            line-height: 1.55;
          }
          .reg-detail-btn { padding: 16px 20px; }
          .reg-detail-panel { padding: 22px 20px; }
        }

        @media print {
          .reg-banner { background: ${P.navy} !important; color: ${P.cream} !important; }
          .reg-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .reg-detail { background: ${P.navyDark} !important; }
          .reg-detail-chevron { display: none; }
          .reg-tooltip { display: none !important; }
          .reg-cell-btn { cursor: default; }
        }
      `}</style>

      <div className="reg-banner" role="alert">
        <span className="reg-banner-icon" aria-hidden="true">⚠</span>
        <p className="reg-banner-body">
          <strong>Important update:</strong> As of May 25, 2025, FHA only accepts US citizens and lawful permanent residents (green card holders). All non-permanent resident categories, including H-1B holders, EAD holders, asylees, and refugees, are no longer eligible for new FHA loans.
        </p>
      </div>

      <div className="reg-table-wrap">
        <table className="reg-table" aria-label="Eligibility by borrower status and loan program">
          <thead>
            <tr>
              <th scope="col" className="reg-status-head">Borrower Status</th>
              {PROGRAMS.map((program) => (
                <th key={program} scope="col">{program}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STATUSES.map((status, sIdx) => (
              <tr key={status}>
                <th scope="row" className="reg-status-name">{status}</th>
                {PROGRAMS.map((program, pIdx) => {
                  const id = cellId(sIdx, pIdx);
                  const tipId = tooltipId(sIdx, pIdx);
                  const data = ELIGIBILITY[status][program];
                  const visual = STATUS_VISUALS[data.status];
                  const isActive = activeCell === id;
                  const tooltipBottom = sIdx === 0;
                  return (
                    <td key={program} style={{ background: visual.bg }}>
                      <button
                        type="button"
                        className="reg-cell-btn"
                        aria-describedby={isActive ? tipId : undefined}
                        aria-expanded={isActive}
                        onClick={() => toggleCell(id)}
                        onMouseEnter={() => setActiveCell(id)}
                        onMouseLeave={() => setActiveCell((prev) => (prev === id ? null : prev))}
                        onFocus={() => setActiveCell(id)}
                        onBlur={() => setActiveCell((prev) => (prev === id ? null : prev))}
                        style={{ borderColor: isActive ? visual.border : "transparent" }}
                      >
                        {renderCellInner(status, program)}
                      </button>
                      {isActive && (
                        <div
                          id={tipId}
                          role="tooltip"
                          className={`reg-tooltip${tooltipBottom ? " reg-tooltip-bottom" : ""}`}
                        >
                          {data.note}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reg-mobile-stack">
        {STATUSES.map((status) => (
          <div key={status} className="reg-mobile-card">
            <span className="reg-mobile-card-title">{status}</span>
            {PROGRAMS.map((program) => {
              const data = ELIGIBILITY[status][program];
              const visual = STATUS_VISUALS[data.status];
              return (
                <div key={program} className="reg-mobile-row">
                  <span className="reg-mobile-prog">{program}</span>
                  <span className="reg-mobile-status">
                    <span
                      className="reg-mobile-status-label"
                      style={{ color: visual.color, background: visual.bg, borderColor: visual.border }}
                    >
                      <span aria-hidden="true">{visual.icon}</span>
                      {visual.label}
                    </span>
                    <span className="reg-mobile-note">{data.note}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="reg-detail">
        <button
          type="button"
          className="reg-detail-btn"
          aria-expanded={detailOpen}
          aria-controls="reg-detail-panel"
          onClick={() => setDetailOpen((o) => !o)}
        >
          <span className="reg-detail-title">
            What counts as Non-Permanent Resident?
            <span className="reg-detail-intro">Click to see common visa types, EAD categories, and ineligible statuses.</span>
          </span>
          <span aria-hidden="true" className={`reg-detail-chevron${detailOpen ? " reg-detail-chevron-open" : ""}`}>▾</span>
        </button>
        {detailOpen && (
          <div id="reg-detail-panel" className="reg-detail-panel">
            <div className="reg-detail-section">
              <h4>Common Work Visas (Conventional and USDA eligible)</h4>
              <ul className="reg-detail-list">
                {WORK_VISAS.map((v) => (
                  <li key={v.code}><strong>{v.code}:</strong> {v.desc}</li>
                ))}
              </ul>
              <p className="reg-detail-note">Many other visa categories may qualify. Talk to your LO if your specific visa isn't listed.</p>
            </div>
            <div className="reg-detail-section">
              <h4>Common EAD Categories (Conventional and USDA eligible)</h4>
              <ul className="reg-detail-list">
                {EAD_CATEGORIES.map((v) => (
                  <li key={v.code}><strong>{v.code}:</strong> {v.desc}</li>
                ))}
              </ul>
            </div>
            <div className="reg-detail-section">
              <h4>Statuses that do NOT qualify on agency loans</h4>
              <ul className="reg-detail-list">
                {INELIGIBLE_STATUSES.map((v) => (
                  <li key={v.code}><strong>{v.code}:</strong> {v.desc}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
