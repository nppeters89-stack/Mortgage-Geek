import { useState, useEffect, useRef } from "react";
import { P, F } from "../theme";
import { withAlpha } from "../utils/format";

const SCENARIOS = [
  "Job started, no paystub yet",
  "Job starts 1-60 days after closing",
  "Job starts 60-90+ days after closing",
];

const PROGRAMS = [
  { key: "FHA", label: "FHA" },
  { key: "VA", label: "VA" },
  { key: "USDA", label: "USDA" },
  { key: "FNMA", label: "Conv (FNMA)" },
  { key: "FHLMC", label: "Conv (FHLMC)" },
];

const ELIGIBILITY = {
  "Job started, no paystub yet": {
    FHA:   { status: "standard", label: "Standard path", note: "Offer letter + VOE/third-party verification of start, income, and YTD earnings." },
    VA:    { status: "standard", label: "Standard path", note: "Offer letter + VOE/third-party verification." },
    USDA:  { status: "standard", label: "Standard path", note: "Offer letter + VOE/third-party verification." },
    FNMA:  { status: "standard", label: "Standard path", note: "Paystub, WVOE, or third-party verification documentation." },
    FHLMC: { status: "standard", label: "Standard path", note: "Paystub, WVOE, or third-party verification documentation." },
  },
  "Job starts 1-60 days after closing": {
    FHA:   { status: "standard", label: "Standard path", note: "Fully executed offer letter, contingencies cleared, paystub within 60 days of closing." },
    VA:    { status: "standard", label: "Standard path", note: "Fully executed offer letter, contingencies cleared, start date within 60 days post-closing." },
    USDA:  { status: "standard", label: "Standard path", note: "Fully executed offer letter, contingencies cleared, start date within 60 days post-closing." },
    FNMA:  { status: "option",   label: "Option 2",      note: "Start no earlier than 30 days before note, no later than 90 days after. Reserves required. Purchase, primary, one-unit, fixed base income only." },
    FHLMC: { status: "option",   label: "Option 1 or 2", note: "Both Freddie options work in this window. Option 1: paystub will not be obtained before delivery. Option 2: paystub will be obtained before delivery." },
  },
  "Job starts 60-90+ days after closing": {
    FHA:   { status: "management_review", label: "Lender discretion", note: "Past the standard 60-day FHA window, there's no automatic path. The lender has to make the call, which typically means a senior underwriter or underwriting manager has to sign off on the file. Common professions (doctors, teachers, professors) are where these get approved. Post-closing paystub follow-up required." },
    VA:    { status: "management_review", label: "Lender discretion", note: "Past the standard 60-day VA window, there's no automatic path. The lender has to make the call, which typically means an underwriting manager (Regional Underwriting Manager at most shops) has to sign off. Common professions, case by case." },
    USDA:  { status: "management_review", label: "Lender discretion", note: "Past the standard 60-day USDA window, there's no automatic path. The lender has to make the call, which typically means an underwriting manager has to sign off on the file. Common professions, case by case." },
    FNMA:  { status: "option",   label: "Option 1 or 2", note: "Option 1 (paystub before delivery) or Option 2 (offer letter only, with reserves). Start date must be within 90 days." },
    FHLMC: { status: "option",   label: "Option 1 or 2", note: "Option 1 (start before delivery, no paystub) or Option 2 (paystub before delivery). Start date within 90 days." },
  },
};

const STATUS_VISUALS = {
  standard:          { icon: "✓", color: P.success, bg: withAlpha(P.success, 0.15), border: withAlpha(P.success, 0.32) },
  option:            { icon: "✓", color: P.success, bg: withAlpha(P.success, 0.10), border: withAlpha(P.success, 0.28) },
  management_review: { icon: "⚠", color: P.caution, bg: withAlpha(P.caution, 0.12), border: withAlpha(P.caution, 0.32) },
  ineligible:        { icon: "✗", color: P.danger,  bg: withAlpha(P.danger, 0.12),  border: withAlpha(P.danger, 0.32) },
};

const TIMELINE = [
  { key: "FHA",   label: "FHA",          standardWindow: [0, 60],   extendedWindow: [60, 120] },
  { key: "VA",    label: "VA",           standardWindow: [0, 60],   extendedWindow: [60, 120] },
  { key: "USDA",  label: "USDA",         standardWindow: [0, 60],   extendedWindow: [60, 120] },
  { key: "FNMA",  label: "Conv (FNMA)",  standardWindow: [-30, 90], extendedWindow: [90, 120] },
  { key: "FHLMC", label: "Conv (FHLMC)", standardWindow: [0, 90],   extendedWindow: [90, 120] },
];

// Timeline SVG geometry (viewBox 0 0 1100 360).
const SVG_WIDTH = 1100;
const SVG_HEIGHT = 360;
const CHART_X = 200;            // x-coordinate for "0 days" tick
const CHART_RIGHT = 1060;
const X_MIN_DAYS = -30;
const X_MAX_DAYS = 120;
const ROW_TOP = 60;
const ROW_HEIGHT = 44;
const BAND_HEIGHT = 28;
const AXIS_Y = ROW_TOP + TIMELINE.length * ROW_HEIGHT + 12;
const dayToX = (d) => CHART_X + ((d - 0) * (CHART_RIGHT - CHART_X)) / (X_MAX_DAYS - 0);

function cellId(scenarioIdx, programIdx) {
  return `eim-cell-${scenarioIdx}-${programIdx}`;
}

function tooltipId(scenarioIdx, programIdx) {
  return `eim-tip-${scenarioIdx}-${programIdx}`;
}

export function ExpectedIncomeMatrix() {
  const [activeCell, setActiveCell] = useState(null);
  const [hoverBand, setHoverBand] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!activeCell && !hoverBand) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveCell(null);
        setHoverBand(null);
      }
    };
    const onKey = (e) => { if (e.key === "Escape") { setActiveCell(null); setHoverBand(null); } };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeCell, hoverBand]);

  const toggleCell = (id) => setActiveCell((prev) => (prev === id ? null : id));

  const activeNote = (() => {
    if (!activeCell) return null;
    const m = activeCell.match(/^eim-cell-(\d+)-(\d+)$/);
    if (!m) return null;
    const scenario = SCENARIOS[Number(m[1])];
    const program = PROGRAMS[Number(m[2])];
    if (!scenario || !program) return null;
    const data = ELIGIBILITY[scenario][program.key];
    return { scenario, program, data, visual: STATUS_VISUALS[data.status] };
  })();

  return (
    <div className="eim-container" ref={containerRef} role="region" aria-label="Expected income eligibility by borrower scenario and loan program">
      <style>{`
        .eim-container {
          margin: 28px 0;
          font-family: ${F.body};
        }

        /* Section 1: Top alert banner */
        .eim-banner {
          background: ${P.navy};
          color: ${P.cream};
          border-left: 4px solid ${P.gold};
          border-radius: 8px;
          padding: 18px 22px;
          margin-bottom: 24px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .eim-banner-title {
          display: block;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: ${P.goldLight};
          margin-bottom: 8px;
        }
        .eim-banner-body {
          font-size: 14px;
          line-height: 1.65;
          color: ${P.cream};
          margin: 0;
        }
        .eim-banner-body strong { color: ${P.goldLight}; font-weight: 700; }

        /* Section 2: Matrix */
        .eim-table-wrap {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .eim-table {
          width: 100%;
          border-collapse: collapse;
          font-family: ${F.body};
          font-size: 14px;
          table-layout: fixed;
        }
        .eim-table thead th {
          background: ${P.navy};
          color: ${P.cream};
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px 8px;
          text-align: center;
          border: none;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .eim-table thead th.eim-scenario-head {
          text-align: left;
          padding-left: 18px;
          width: 28%;
        }
        .eim-table tbody tr:nth-child(odd)  { background: ${P.white}; }
        .eim-table tbody tr:nth-child(even) { background: ${P.cream}; }
        .eim-table tbody th.eim-scenario-name {
          text-align: left;
          padding: 16px 14px 16px 18px;
          color: ${P.navy};
          font-family: ${F.body};
          font-weight: 600;
          font-size: 13.5px;
          line-height: 1.4;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
        }
        .eim-table tbody td {
          padding: 8px;
          text-align: center;
          border-right: 1px solid ${P.creamDark};
          border-bottom: 1px solid ${P.creamDark};
          vertical-align: middle;
        }
        .eim-table tbody tr:last-child th,
        .eim-table tbody tr:last-child td { border-bottom: none; }
        .eim-table tbody td:last-child { border-right: none; }

        .eim-cell-btn {
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
        .eim-cell-btn:hover { transform: translateY(-1px); }
        .eim-cell-btn:focus-visible { outline: 2px solid ${P.navy}; outline-offset: 2px; }
        .eim-cell-icon { font-size: 16px; line-height: 1; font-weight: 700; }
        .eim-cell-label { font-size: 12px; font-weight: 600; line-height: 1.2; letter-spacing: 0.2px; }

        /* Mobile stacked cards */
        .eim-mobile-stack { display: none; }

        /* Detail panel below the matrix */
        .eim-detail {
          margin-top: 22px;
          background: ${P.navyDark};
          border: 2px solid ${P.gold};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(15, 37, 48, 0.2);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .eim-detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 22px;
          background: rgba(0,0,0,0.25);
          border-bottom: 1px solid rgba(212, 168, 67, 0.35);
        }
        .eim-detail-icon { font-size: 16px; line-height: 1; }
        .eim-detail-title {
          font-size: 15px;
          font-weight: 600;
          color: ${P.cream};
          line-height: 1.3;
          flex: 1;
        }
        .eim-detail-close {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: ${P.cream};
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          letter-spacing: 0.4px;
        }
        .eim-detail-close:hover { background: rgba(255,255,255,0.08); }
        .eim-detail-body {
          background: ${P.cream};
          padding: 22px 26px;
          font-size: 14.5px;
          line-height: 1.7;
          color: ${P.text};
        }
        .eim-detail-empty {
          padding: 22px 26px;
          background: ${P.cream};
          font-size: 13.5px;
          color: ${P.warmGray};
          font-style: italic;
          line-height: 1.6;
        }

        /* Section 3: Timeline */
        .eim-timeline-wrap {
          margin-top: 28px;
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 8px;
          padding: 22px 18px 14px;
          box-shadow: 0 2px 12px rgba(15, 37, 48, 0.06);
        }
        .eim-timeline-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          margin-bottom: 14px;
        }
        .eim-svg {
          width: 100%;
          height: auto;
          display: block;
          font-family: ${F.body};
        }
        .eim-svg text {
          font-family: ${F.body};
        }
        .eim-svg .eim-band-rect { cursor: pointer; transition: opacity 0.15s; }
        .eim-svg .eim-band-rect:hover { opacity: 1 !important; }
        .eim-svg .eim-band-rect:focus-visible { outline: 2px solid ${P.navy}; }

        .eim-timeline-caption {
          font-size: 12px;
          color: ${P.warmGray};
          font-style: italic;
          margin-top: 12px;
          line-height: 1.55;
        }

        .eim-timeline-mobile { display: none; }

        .eim-tooltip {
          position: absolute;
          z-index: 30;
          background: ${P.navyDark};
          color: ${P.cream};
          font-size: 12px;
          line-height: 1.55;
          padding: 8px 12px;
          border-radius: 6px;
          max-width: 220px;
          width: max-content;
          box-shadow: 0 6px 18px rgba(15, 37, 48, 0.28);
          pointer-events: none;
        }

        .eim-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 700px) {
          .eim-table-wrap { display: none; }
          .eim-mobile-stack { display: block; }
          .eim-mobile-card {
            background: ${P.white};
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.navy};
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(15, 37, 48, 0.05);
          }
          .eim-mobile-card-title {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: ${P.navy};
            margin-bottom: 12px;
            line-height: 1.4;
          }
          .eim-mobile-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 0;
            border-top: 1px solid ${P.creamDark};
          }
          .eim-mobile-row:first-of-type { border-top: none; }
          .eim-mobile-prog {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: ${P.warmGray};
            min-width: 92px;
            padding-top: 6px;
          }
          .eim-mobile-status {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            text-align: right;
            flex: 1;
            min-width: 0;
          }
          .eim-mobile-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: ${F.body};
            font-size: 12px;
            font-weight: 600;
            min-height: 44px;
            padding: 8px 12px;
            border-radius: 12px;
            border: 1px solid;
            background: transparent;
            cursor: pointer;
          }
          .eim-mobile-note {
            font-size: 12px;
            color: ${P.warmGray};
            line-height: 1.55;
          }
        }

        @media (max-width: 600px) {
          .eim-svg-desktop { display: none; }
          .eim-timeline-mobile { display: block; }
          .eim-timeline-prog {
            border: 1px solid ${P.creamDark};
            border-left: 3px solid ${P.sage};
            border-radius: 8px;
            background: ${P.white};
            padding: 12px 14px;
            margin-bottom: 8px;
          }
          .eim-timeline-prog-name {
            display: block;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: ${P.navy};
            margin-bottom: 4px;
          }
          .eim-timeline-prog-range {
            display: block;
            font-size: 13px;
            color: ${P.text};
            line-height: 1.55;
          }
          .eim-timeline-prog-extended {
            display: block;
            font-size: 12px;
            color: ${P.goldMuted};
            line-height: 1.55;
            margin-top: 2px;
          }
        }

        @media print {
          .eim-banner { background: ${P.navy} !important; color: ${P.cream} !important; }
          .eim-table thead th { background: ${P.navy} !important; color: ${P.cream} !important; }
          .eim-detail { background: ${P.navyDark} !important; }
          .eim-detail-close { display: none; }
          .eim-cell-btn { cursor: default; }
        }
      `}</style>

      {/* SECTION 1: Banner */}
      <div className="eim-banner" role="note">
        <span className="eim-banner-title">The 60-day vs. 90-day split</span>
        <p className="eim-banner-body">
          Government loans (FHA, VA, USDA) require the new job to start within <strong>60 days</strong> of closing for standard expected income qualification. Conventional loans (Fannie Mae and Freddie Mac) extend the window to <strong>90 days</strong> with the right documentation and reserves.
        </p>
      </div>

      {/* SECTION 2: Matrix (desktop) */}
      <div className="eim-table-wrap">
        <table className="eim-table" aria-label="Eligibility by borrower scenario and loan program">
          <thead>
            <tr>
              <th scope="col" className="eim-scenario-head">Scenario</th>
              {PROGRAMS.map((program) => (
                <th key={program.key} scope="col">{program.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((scenario, sIdx) => (
              <tr key={scenario}>
                <th scope="row" className="eim-scenario-name">{scenario}</th>
                {PROGRAMS.map((program, pIdx) => {
                  const id = cellId(sIdx, pIdx);
                  const tipId = tooltipId(sIdx, pIdx);
                  const data = ELIGIBILITY[scenario][program.key];
                  const visual = STATUS_VISUALS[data.status];
                  const isActive = activeCell === id;
                  return (
                    <td key={program.key} style={{ background: visual.bg }}>
                      <button
                        type="button"
                        className="eim-cell-btn"
                        aria-expanded={isActive}
                        aria-controls={tipId}
                        onClick={() => toggleCell(id)}
                        style={{ borderColor: isActive ? visual.border : "transparent" }}
                      >
                        <span className="eim-cell-icon" aria-hidden="true" style={{ color: visual.color }}>{visual.icon}</span>
                        <span className="eim-cell-label" style={{ color: visual.color }}>{data.label}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 2 (mobile): stacked cards */}
      <div className="eim-mobile-stack">
        {SCENARIOS.map((scenario, sIdx) => (
          <div key={scenario} className="eim-mobile-card">
            <span className="eim-mobile-card-title">{scenario}</span>
            {PROGRAMS.map((program, pIdx) => {
              const id = cellId(sIdx, pIdx);
              const tipId = tooltipId(sIdx, pIdx);
              const data = ELIGIBILITY[scenario][program.key];
              const visual = STATUS_VISUALS[data.status];
              const isActive = activeCell === id;
              return (
                <div key={program.key} className="eim-mobile-row">
                  <span className="eim-mobile-prog">{program.label}</span>
                  <span className="eim-mobile-status">
                    <button
                      type="button"
                      className="eim-mobile-btn"
                      aria-expanded={isActive}
                      aria-controls={tipId}
                      onClick={() => toggleCell(id)}
                      style={{ color: visual.color, background: visual.bg, borderColor: visual.border }}
                    >
                      <span aria-hidden="true">{visual.icon}</span>
                      {data.label}
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Detail panel for the active cell */}
      <div className="eim-detail" aria-live="polite">
        {activeNote ? (
          <>
            <div className="eim-detail-header">
              <span className="eim-detail-icon" aria-hidden="true" style={{ color: activeNote.visual.color }}>{activeNote.visual.icon}</span>
              <span className="eim-detail-title" id={tooltipId(SCENARIOS.indexOf(activeNote.scenario), PROGRAMS.indexOf(activeNote.program))}>
                {activeNote.program.label}: {activeNote.scenario}
                <span style={{ display: "block", fontSize: 12, color: P.goldLight, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 4 }}>
                  {activeNote.data.label}
                </span>
              </span>
              <button type="button" className="eim-detail-close" onClick={() => setActiveCell(null)} aria-label="Close detail">
                Close
              </button>
            </div>
            <div className="eim-detail-body">
              {activeNote.data.note}
            </div>
          </>
        ) : (
          <div className="eim-detail-empty">
            Click any cell above to see the requirements, documentation, and restrictions for that scenario and loan program.
          </div>
        )}
      </div>

      {/* SECTION 3: Timeline (desktop SVG) */}
      <div className="eim-timeline-wrap">
        <div className="eim-timeline-title">Eligibility Window by Loan Program</div>

        <svg
          className="eim-svg eim-svg-desktop"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Horizontal timeline showing each loan program's expected income eligibility window across days from closing, from 30 days before to 120 days after closing."
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Reference grid: vertical guide lines at -30, 0, 30, 60, 90, 120 */}
          {[
            { day: -30, label: "−30 days", color: P.warmGrayLight, dashed: true,  width: 1 },
            { day: 0,   label: "Closing",  color: P.navy,           dashed: false, width: 2 },
            { day: 30,  label: "30 days",  color: P.warmGrayLight, dashed: true,  width: 1 },
            { day: 60,  label: "Govt 60-day cutoff", color: P.gold, dashed: true,  width: 2 },
            { day: 90,  label: "Conv 90-day cutoff", color: P.gold, dashed: true,  width: 2 },
            { day: 120, label: "120 days", color: P.warmGrayLight, dashed: true,  width: 1 },
          ].map(({ day, label, color, dashed, width }) => {
            const x = dayToX(day);
            return (
              <g key={day}>
                <line
                  x1={x} y1={ROW_TOP - 16}
                  x2={x} y2={AXIS_Y}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={dashed ? "4 4" : ""}
                  opacity={dashed ? 0.55 : 1}
                />
                <text
                  x={x} y={ROW_TOP - 22}
                  fontSize="11"
                  fontWeight={day === 0 || day === 60 || day === 90 ? "700" : "600"}
                  fill={day === 0 ? P.navy : day === 60 || day === 90 ? P.goldMuted : P.warmGray}
                  textAnchor="middle"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Per-program rows */}
          {TIMELINE.map((prog, idx) => {
            const rowY = ROW_TOP + idx * ROW_HEIGHT;
            const bandY = rowY + (ROW_HEIGHT - BAND_HEIGHT) / 2;
            const stdX1 = dayToX(prog.standardWindow[0]);
            const stdX2 = dayToX(prog.standardWindow[1]);
            const extX1 = dayToX(prog.extendedWindow[0]);
            const extX2 = dayToX(prog.extendedWindow[1]);
            const grayLeftEnd = dayToX(prog.standardWindow[0]); // gray fills before standard
            const isHover = hoverBand === `${prog.key}-std` || hoverBand === `${prog.key}-ext`;

            return (
              <g key={prog.key}>
                {/* Background gray strip showing full chart range */}
                <rect
                  x={dayToX(X_MIN_DAYS)} y={bandY}
                  width={dayToX(X_MAX_DAYS) - dayToX(X_MIN_DAYS)} height={BAND_HEIGHT}
                  fill={P.warmGray} opacity="0.10"
                  rx="3"
                />

                {/* Pre-standard gray (e.g., FHA/VA/USDA/FHLMC have nothing before 0) */}
                {prog.standardWindow[0] > X_MIN_DAYS && (
                  <rect
                    x={dayToX(X_MIN_DAYS)} y={bandY}
                    width={grayLeftEnd - dayToX(X_MIN_DAYS)} height={BAND_HEIGHT}
                    fill={P.warmGray} opacity="0.18"
                  />
                )}

                {/* Standard eligibility window — sage band */}
                <rect
                  className="eim-band-rect"
                  x={stdX1} y={bandY}
                  width={stdX2 - stdX1} height={BAND_HEIGHT}
                  fill={P.sage} opacity={isHover ? 0.92 : 0.7}
                  rx="2"
                  onMouseEnter={() => setHoverBand(`${prog.key}-std`)}
                  onMouseLeave={() => setHoverBand((h) => (h === `${prog.key}-std` ? null : h))}
                  tabIndex={0}
                  role="button"
                  aria-label={`${prog.label} standard eligibility: day ${prog.standardWindow[0]} to day ${prog.standardWindow[1]}`}
                />

                {/* Extended (mgmt review) window — gold band */}
                <rect
                  className="eim-band-rect"
                  x={extX1} y={bandY}
                  width={extX2 - extX1} height={BAND_HEIGHT}
                  fill={P.gold} opacity={isHover ? 0.65 : 0.45}
                  rx="2"
                  onMouseEnter={() => setHoverBand(`${prog.key}-ext`)}
                  onMouseLeave={() => setHoverBand((h) => (h === `${prog.key}-ext` ? null : h))}
                  tabIndex={0}
                  role="button"
                  aria-label={`${prog.label} extended/review window: day ${prog.extendedWindow[0]} to day ${prog.extendedWindow[1]}`}
                />

                {/* Caution glyph at the boundary */}
                <text
                  x={extX1 + 2} y={bandY + BAND_HEIGHT / 2 + 5}
                  fontSize="14" fontWeight="700" fill={P.goldMuted}
                  textAnchor="start"
                  aria-hidden="true"
                >
                  ⚠
                </text>

                {/* Program label (left, in the chart's left margin) */}
                <text
                  x={CHART_X - 12} y={bandY + BAND_HEIGHT / 2 + 4}
                  fontSize="13" fontWeight="600" fill={P.navy}
                  textAnchor="end"
                >
                  {prog.label}
                </text>
              </g>
            );
          })}

          {/* X-axis baseline */}
          <line
            x1={dayToX(X_MIN_DAYS)} y1={AXIS_Y}
            x2={dayToX(X_MAX_DAYS)} y2={AXIS_Y}
            stroke={P.navy} strokeWidth="1.5"
          />
          {/* X-axis label */}
          <text
            x={(dayToX(X_MIN_DAYS) + dayToX(X_MAX_DAYS)) / 2}
            y={AXIS_Y + 32}
            fontSize="13" fontWeight="700" fill={P.navy}
            textAnchor="middle"
          >
            Days from Closing
          </text>

          {/* Inline mini-legend */}
          <g transform={`translate(${dayToX(X_MIN_DAYS)}, ${AXIS_Y + 50})`}>
            <rect x="0" y="0" width="22" height="12" fill={P.sage} opacity="0.7" rx="2" />
            <text x="28" y="10" fontSize="12" fill={P.text}>Standard path</text>
            <rect x="160" y="0" width="22" height="12" fill={P.gold} opacity="0.45" rx="2" />
            <text x="188" y="10" fontSize="12" fill={P.text}>Extended / mgmt review</text>
            <rect x="380" y="0" width="22" height="12" fill={P.warmGray} opacity="0.18" rx="2" />
            <text x="408" y="10" fontSize="12" fill={P.text}>Outside window</text>
          </g>
        </svg>

        {/* Mobile: vertical program list with text-only ranges */}
        <div className="eim-timeline-mobile" aria-hidden="true">
          {TIMELINE.map((prog) => (
            <div key={prog.key} className="eim-timeline-prog">
              <span className="eim-timeline-prog-name">{prog.label}</span>
              <span className="eim-timeline-prog-range">
                Standard window: day {prog.standardWindow[0]} to day {prog.standardWindow[1]} after closing
              </span>
              <span className="eim-timeline-prog-extended">
                Mgmt/review window: day {prog.extendedWindow[0]} to day {prog.extendedWindow[1]}
              </span>
            </div>
          ))}
        </div>

        {/* Hidden screen-reader equivalent (always present for AT) */}
        <div className="eim-sr-only">
          <p>Eligibility window summary by loan program:</p>
          <ul>
            {TIMELINE.map((prog) => (
              <li key={prog.key}>
                {prog.label}: standard path runs from day {prog.standardWindow[0]} to day {prog.standardWindow[1]} after closing. Extended or management review window runs from day {prog.extendedWindow[0]} to day {prog.extendedWindow[1]}.
              </li>
            ))}
          </ul>
        </div>

        <p className="eim-timeline-caption">
          Hover over a band (or tap on mobile) for details on each program's eligibility window.
        </p>
      </div>
    </div>
  );
}
