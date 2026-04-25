import { useEffect, useMemo, useState } from "react";
import { P, F } from "../theme";

const STORAGE_PREFIX = "mg-checklist-";

function loadInitial(id) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function InteractiveChecklist({ id, sections, defaultCollapsed = false, title = "Checklist" }) {
  const [checked, setChecked] = useState(() => loadInitial(id));
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(checked)); } catch {}
  }, [id, checked]);

  const totalItems = useMemo(
    () => sections.reduce((sum, sec) => sum + sec.subsections.reduce((s, sub) => s + sub.items.length, 0), 0),
    [sections]
  );
  const totalDone = useMemo(
    () => sections.reduce(
      (sum, sec) => sum + sec.subsections.reduce(
        (s, sub) => s + sub.items.filter((it) => checked[it.id]).length, 0
      ), 0
    ),
    [sections, checked]
  );

  const contentId = `ic-content-${id}`;

  const toggle = (itemId) => {
    setChecked((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const reset = () => {
    setChecked({});
    try { localStorage.removeItem(`${STORAGE_PREFIX}${id}`); } catch {}
  };

  const sectionStats = useMemo(() => {
    return sections.map((sec) => {
      const items = sec.subsections.flatMap((sub) => sub.items);
      const total = items.length;
      const done = items.filter((it) => checked[it.id]).length;
      return { total, done };
    });
  }, [sections, checked]);

  return (
    <div className="ic-root">
      <style>{`
        .ic-root { margin: 24px 0; }
        .ic-content {
          background: ${P.white};
          border: 1px solid ${P.creamDark};
          border-radius: 12px;
          padding: 28px 28px 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          margin-top: 12px;
        }
        .ic-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
          padding: 14px 18px;
          background: ${P.navy};
          border: none;
          border-radius: 8px;
          color: ${P.white};
          font-family: ${F.body};
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ic-toggle:hover { background: ${P.navyDark}; }
        .ic-toggle:focus-visible { outline: 2px solid ${P.gold}; outline-offset: 2px; }
        .ic-toggle-label { display: inline-flex; align-items: center; gap: 10px; }
        .ic-toggle-count {
          font-size: 11px;
          font-weight: 600;
          color: ${P.goldLight};
          letter-spacing: 0.6px;
        }
        .ic-toggle-chevron {
          font-size: 14px;
          color: ${P.goldLight};
          transition: transform 0.2s;
        }
        .ic-toggle-chevron-open { transform: rotate(180deg); }
        .ic-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin: 18px 0;
          flex-wrap: wrap;
        }
        .ic-pdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          background: ${P.navy};
          color: ${P.white};
          font-family: ${F.body};
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ic-pdf-btn:hover { background: ${P.navyDark}; }
        .ic-pdf-btn:focus-visible { outline: 2px solid ${P.gold}; outline-offset: 2px; }
        .ic-reset-btn {
          background: transparent;
          border: 1px solid ${P.creamDark};
          color: ${P.goldMuted};
          font-family: ${F.body};
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.4px;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .ic-reset-btn:hover { background: ${P.cream}; border-color: ${P.gold}; color: ${P.gold}; }
        .ic-reset-btn:focus-visible { outline: 2px solid ${P.gold}; outline-offset: 2px; }
        .ic-content-collapsed { display: none; }
        .ic-section { margin-top: 36px; }
        .ic-section:first-of-type { margin-top: 0; }
        .ic-section-title {
          font-family: ${F.display};
          font-size: 24px;
          color: ${P.navy};
          font-weight: 400;
          line-height: 1.25;
          margin: 0 0 6px;
        }
        .ic-section-progress {
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          margin-bottom: 10px;
        }
        .ic-section-desc {
          font-family: ${F.body};
          font-size: 14px;
          color: ${P.warmGray};
          line-height: 1.7;
          font-style: italic;
          margin: 0 0 14px;
        }
        .ic-subsection { margin-top: 18px; }
        .ic-subsection-heading {
          font-family: ${F.body};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${P.goldMuted};
          margin: 0 0 8px;
        }
        .ic-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          width: 100%;
          min-height: 44px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font-family: ${F.body};
          font-size: 14.5px;
          line-height: 1.6;
          color: ${P.text};
          text-align: left;
          cursor: pointer;
          transition: background 0.12s;
        }
        .ic-item:hover { background: ${P.creamDark}; }
        .ic-item:focus-visible { outline: 2px solid ${P.gold}; outline-offset: -2px; }
        .ic-checkbox {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          margin-top: 2px;
          border: 2px solid ${P.gold};
          border-radius: 4px;
          background: ${P.white};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.12s, border-color 0.12s;
        }
        .ic-checkbox-checked {
          background: ${P.navy};
          border-color: ${P.navy};
        }
        .ic-checkbox-checked svg { display: block; }
        .ic-checkbox svg { display: none; }
        .ic-item-text { flex: 1; }
        .ic-item-checked .ic-item-text {
          color: ${P.warmGrayLight};
          text-decoration: line-through;
          text-decoration-color: ${P.warmGrayLight};
        }

        @media (max-width: 600px) {
          .ic-content { padding: 22px 18px 26px; }
          .ic-section-title { font-size: 22px; }
          .ic-item { padding: 12px 10px; font-size: 14px; }
          .ic-toggle { padding: 14px 16px; font-size: 12.5px; }
        }

        .print-only { display: none; }

        @media print {
          @page { size: portrait; margin: 0.5in; }
          body { background: #fff !important; }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }

          .ic-root { margin: 0 !important; }
          .ic-content {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .ic-content-collapsed { display: block !important; }
          .ic-section { margin-top: 22px !important; page-break-inside: avoid; }
          .ic-section:first-of-type { margin-top: 0 !important; }
          .ic-section-title { font-size: 18px !important; margin-bottom: 4px !important; }
          .ic-section-desc { font-size: 11px !important; margin-bottom: 8px !important; }
          .ic-subsection { margin-top: 12px !important; page-break-inside: avoid; }
          .ic-subsection-heading { font-size: 9px !important; letter-spacing: 1.4px !important; margin-bottom: 4px !important; }
          .ic-item {
            min-height: 0 !important;
            padding: 4px 0 !important;
            font-size: 11px !important;
            line-height: 1.45 !important;
            page-break-inside: avoid;
          }
          .ic-item:hover { background: transparent !important; }
          .ic-checkbox {
            width: 12px !important;
            height: 12px !important;
            border-width: 1.5px !important;
            margin-top: 2px !important;
          }
          .ic-checkbox svg { width: 8px !important; height: 8px !important; }
        }
      `}</style>

      <button
        type="button"
        className="ic-toggle no-print"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls={contentId}
      >
        <span className="ic-toggle-label">
          {collapsed ? "Show " : "Hide "}{title}
          <span className="ic-toggle-count">
            {totalDone > 0 ? `${totalDone} of ${totalItems} checked` : `${totalItems} items`}
          </span>
        </span>
        <span className={`ic-toggle-chevron${collapsed ? "" : " ic-toggle-chevron-open"}`} aria-hidden="true">▼</span>
      </button>

      <div id={contentId} className={`ic-content${collapsed ? " ic-content-collapsed" : ""}`}>
        <div className="print-only" style={{ marginBottom: 18, paddingBottom: 12, borderBottom: `2px solid ${P.navy}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: F.display, fontSize: 18, color: P.navy, marginBottom: 2 }}>🤓 The Mortgage Geek · FHA Manual Underwriting Checklist</div>
              <div style={{ fontSize: 10, color: P.warmGray }}>Nick Peters · NMLS# 1119524 · (615) 656-0737 · mortgagegeek.ai/deep-dives/fha-manual-underwriting</div>
            </div>
            <div style={{ fontSize: 9, color: P.warmGrayLight, textAlign: "right" }}>
              Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="ic-toolbar no-print">
          <button
            type="button"
            className="ic-pdf-btn"
            onClick={() => window.print()}
          >
            📄 Save as PDF
          </button>
          <button
            type="button"
            className="ic-reset-btn"
            onClick={reset}
            aria-label="Reset all checklist progress"
          >
            Reset checklist
          </button>
        </div>

        {sections.map((section, sIdx) => {
        const stats = sectionStats[sIdx];
        return (
          <section key={section.title} className="ic-section" aria-labelledby={`ic-sec-${sIdx}`}>
            <h3 id={`ic-sec-${sIdx}`} className="ic-section-title">{section.title}</h3>
            <div className="ic-section-progress no-print">
              {stats.done} of {stats.total} items checked
            </div>
            {section.description && (
              <p className="ic-section-desc">{section.description}</p>
            )}
            {section.subsections.map((sub, subIdx) => (
              <div key={`${sIdx}-${subIdx}`} className="ic-subsection">
                {sub.heading && (
                  <div className="ic-subsection-heading">{sub.heading}</div>
                )}
                {sub.items.map((item) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggle(item.id)}
                      className={`ic-item${isChecked ? " ic-item-checked" : ""}`}
                    >
                      <span
                        className={`ic-checkbox${isChecked ? " ic-checkbox-checked" : ""}`}
                        aria-hidden="true"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6.5L4.5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="ic-item-text">{item.text}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </section>
        );
      })}

        <div className="print-only" style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${P.creamDark}`, textAlign: "center", fontSize: 9, color: P.warmGrayLight, lineHeight: 1.6 }}>
          Nick Peters · NMLS# 1119524 · (615) 656-0737 · Full guide: mortgagegeek.ai/deep-dives/fha-manual-underwriting · Educational only · Equal Housing Lender
        </div>
      </div>
    </div>
  );
}
