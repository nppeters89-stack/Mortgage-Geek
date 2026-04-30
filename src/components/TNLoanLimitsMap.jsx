import { useState, useRef, useEffect, useId, useMemo } from "react";
import { P, F } from "../theme";
import { tnLoanLimitsData } from "../data/tnLoanLimits2026";

// Map-specific fill tokens. Light enough that the navy stroke and the
// dark text stay readable; saturated enough to read on print. Kept inline
// rather than added to theme.js because they are local to this map's
// color encoding and shouldn't be reused elsewhere as generic tokens.
const MAP_BASELINE = "#D4DDD8";
const MAP_HIGH_COST = "#E8C97D";

const formatCurrency = (n) => "$" + Number(n).toLocaleString("en-US");

const COUNTIES = tnLoanLimitsData.counties;
const META = tnLoanLimitsData.metadata;

// Pre-sort once for the dropdown (alphabetical by name).
const COUNTIES_ALPHA = [...COUNTIES].sort((a, b) => a.name.localeCompare(b.name));

const HIGH_COST_COUNT = COUNTIES.filter((c) => c.is_high_cost).length;
const BASELINE_COUNT = COUNTIES.length - HIGH_COST_COUNT;

const MAP_CSS = `
  .tnmap-shell {
    background: ${P.white};
    border: 1px solid ${P.creamDark};
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(15, 37, 48, 0.04);
    position: relative;
    margin: 24px 0 32px;
  }
  .tnmap-mobile-search { display: none; margin-bottom: 16px; }
  .tnmap-mobile-search label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: ${P.navy};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }
  .tnmap-mobile-search select {
    width: 100%;
    padding: 12px 14px;
    font-size: 15px;
    font-family: inherit;
    color: ${P.navy};
    background: ${P.white};
    border: 1.5px solid ${P.creamDark};
    border-radius: 8px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231B3A4B' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    min-height: 44px;
  }
  .tnmap-mobile-search select:focus { outline: none; border-color: ${P.gold}; }

  .tnmap-wrap { position: relative; }
  .tnmap-svg {
    display: block;
    width: 100%;
    height: auto;
    background: ${P.cream};
    border-radius: 8px;
  }
  .tnmap-county {
    stroke: ${P.white};
    stroke-width: 0.6;
    cursor: pointer;
    transition: filter 0.15s ease, stroke-width 0.15s ease;
    outline: none;
  }
  .tnmap-county.baseline { fill: ${MAP_BASELINE}; }
  .tnmap-county.high-cost { fill: ${MAP_HIGH_COST}; }
  .tnmap-county:hover {
    stroke: ${P.navy};
    stroke-width: 1.5;
    filter: brightness(0.92);
  }
  .tnmap-county:focus-visible {
    stroke: ${P.navy};
    stroke-width: 2;
  }
  .tnmap-county.active {
    stroke: ${P.navy};
    stroke-width: 2;
    filter: brightness(0.88);
  }

  .tnmap-tooltip {
    position: absolute;
    pointer-events: none;
    background: ${P.navyDark};
    color: ${P.cream};
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    min-width: 260px;
    max-width: 300px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transition: opacity 0.12s ease;
    z-index: 10;
    border-left: 3px solid ${P.gold};
  }
  .tnmap-tooltip.visible { opacity: 1; }
  .tnmap-tt-title {
    font-family: ${F.display};
    font-size: 18px;
    color: ${P.goldLight};
    font-weight: 400;
    margin-bottom: 2px;
  }
  .tnmap-tt-msa {
    font-size: 11px;
    color: rgba(250, 247, 242, 0.55);
    margin-bottom: 10px;
    font-style: italic;
  }
  .tnmap-tt-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 5px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .tnmap-tt-row:last-child { border-bottom: none; }
  .tnmap-tt-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(250, 247, 242, 0.55);
  }
  .tnmap-tt-value {
    font-weight: 600;
    color: ${P.cream};
    font-size: 13px;
  }
  .tnmap-tt-value.cap {
    color: ${P.goldLight};
    font-weight: 700;
    font-size: 14px;
  }
  .tnmap-tt-value.note {
    font-size: 11px;
    color: ${P.cream};
    text-align: right;
    max-width: 60%;
    line-height: 1.35;
  }
  .tnmap-tt-vagroup {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
  }
  .tnmap-tt-vagroup .tnmap-tt-row { border-bottom: none; padding: 4px 0; }
  .tnmap-tt-vagroup .tnmap-tt-label { font-size: 10px; }

  .tnmap-legend {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${P.creamDark};
    flex-wrap: wrap;
    font-size: 12px;
    color: ${P.warmGray};
  }
  .tnmap-legend-item { display: flex; align-items: center; gap: 8px; }
  .tnmap-legend-swatch {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid ${P.white};
  }
  .tnmap-legend-swatch.baseline { background: ${MAP_BASELINE}; }
  .tnmap-legend-swatch.high-cost { background: ${MAP_HIGH_COST}; }

  .tnmap-info {
    margin-top: 16px;
    padding: 18px 20px;
    background: ${P.cream};
    border-radius: 8px;
    border-left: 3px solid ${P.creamDark};
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .tnmap-info.empty {
    text-align: center;
    color: ${P.warmGray};
    font-size: 13px;
  }
  .tnmap-info.empty strong { color: ${P.navy}; }
  .tnmap-info.has-county {
    background: ${P.white};
    border: 1px solid ${P.creamDark};
    border-left: 3px solid ${P.gold};
  }
  @media (min-width: 769px) {
    .tnmap-info.empty { display: none; }
  }

  .tnmap-info-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .tnmap-info-name {
    font-family: ${F.display};
    font-size: 22px;
    color: ${P.navy};
    font-weight: 400;
  }
  .tnmap-info-badge {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 12px;
    color: ${P.white};
  }
  .tnmap-info-badge.high-cost { background: ${P.gold}; }
  .tnmap-info-badge.baseline { background: ${P.sage}; }
  .tnmap-info-msa {
    font-size: 12px;
    color: ${P.warmGray};
    font-style: italic;
    margin-bottom: 14px;
  }
  .tnmap-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .tnmap-info-cell {
    background: ${P.cream};
    padding: 12px 14px;
    border-radius: 6px;
  }
  .tnmap-info-cell.full { grid-column: 1 / -1; }
  .tnmap-info-cell-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${P.navy};
    font-weight: 700;
    margin-bottom: 4px;
  }
  .tnmap-info-cell-value {
    font-size: 20px;
    font-weight: 700;
    color: ${P.goldMuted};
    line-height: 1.1;
  }
  .tnmap-info-cell-value.text {
    font-size: 15px;
    font-weight: 600;
    color: ${P.navy};
  }
  .tnmap-info-cell-note {
    font-size: 11px;
    color: ${P.warmGray};
    margin-top: 4px;
    line-height: 1.4;
  }

  .tnmap-cta {
    margin-top: 28px;
    padding: 28px 32px;
    background: linear-gradient(135deg, ${P.navy} 0%, ${P.navyDark} 100%);
    color: ${P.cream};
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }
  .tnmap-cta::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 100%;
    background: ${P.gold};
    opacity: 0.08;
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 0 100%);
  }
  .tnmap-cta-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }
  .tnmap-cta-text { flex: 1; min-width: 280px; }
  .tnmap-cta-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${P.goldLight};
    margin-bottom: 8px;
  }
  .tnmap-cta-headline {
    font-family: ${F.display};
    font-size: 26px;
    font-weight: 400;
    color: ${P.cream};
    line-height: 1.2;
    margin-bottom: 8px;
  }
  .tnmap-cta-headline em {
    font-style: italic;
    color: ${P.goldLight};
  }
  .tnmap-cta-sub {
    font-size: 14px;
    color: ${P.cream};
    opacity: 0.85;
    line-height: 1.5;
    max-width: 520px;
  }
  .tnmap-cta-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }
  .tnmap-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: ${P.gold};
    color: ${P.navyDark};
    text-decoration: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
    transition: background 0.15s ease, transform 0.15s ease;
    white-space: nowrap;
    justify-content: center;
    min-height: 44px;
  }
  .tnmap-cta-btn:hover {
    background: ${P.goldLight};
    transform: translateY(-1px);
  }
  .tnmap-cta-btn.secondary {
    background: transparent;
    color: ${P.cream};
    border: 1.5px solid ${P.cream};
  }
  .tnmap-cta-btn.secondary:hover {
    background: rgba(250, 247, 242, 0.1);
  }

  @media (max-width: 768px) {
    .tnmap-shell { padding: 16px; }
    .tnmap-mobile-search { display: block; }
    .tnmap-tooltip { display: none !important; }
    .tnmap-info { margin-top: 12px; }
    .tnmap-svg { margin-bottom: 0; }
    .tnmap-legend { font-size: 11px; gap: 14px; }
    .tnmap-info-grid { grid-template-columns: 1fr; gap: 8px; }
    .tnmap-info-name { font-size: 19px; }
    .tnmap-info-cell { padding: 10px 12px; }
    .tnmap-info-cell-value { font-size: 18px; }
    .tnmap-cta { padding: 22px 20px; }
    .tnmap-cta-inner { flex-direction: column; align-items: flex-start; }
    .tnmap-cta-buttons { width: 100%; flex-direction: row; }
    .tnmap-cta-btn { flex: 1; }
    .tnmap-cta-headline { font-size: 22px; }
  }

  @media print {
    .tnmap-tooltip, .tnmap-mobile-search, .tnmap-cta { display: none !important; }
    .tnmap-county {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .tnmap-info { display: block !important; border: 1px solid #ccc; }
  }
`;

export function TNLoanLimitsMap() {
  const [selectedFips, setSelectedFips] = useState(null);
  const [hoveredFips, setHoveredFips] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const shellRef = useRef(null);
  const tooltipRef = useRef(null);
  const selectId = useId();

  // Clear hover on document scroll so a sticky tooltip doesn't trail.
  useEffect(() => {
    const onScroll = () => setHoveredFips(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selected = useMemo(
    () => COUNTIES.find((c) => c.fips === selectedFips) || null,
    [selectedFips]
  );
  const hovered = useMemo(
    () => COUNTIES.find((c) => c.fips === hoveredFips) || null,
    [hoveredFips]
  );

  const onMouseMove = (e) => {
    if (!shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    const tt = tooltipRef.current ? tooltipRef.current.getBoundingClientRect() : { width: 280, height: 180 };
    let x = e.clientX - rect.left + 12;
    let y = e.clientY - rect.top + 12;
    if (x + tt.width + 16 > rect.width) x = e.clientX - rect.left - tt.width - 12;
    if (y + tt.height + 16 > rect.height) y = e.clientY - rect.top - tt.height - 12;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    setTooltipPos({ x, y });
  };

  const handleSelect = (fips) => {
    const num = typeof fips === "string" ? parseInt(fips, 10) : fips;
    setSelectedFips(Number.isNaN(num) ? null : num);
  };

  const renderInfoBadgeText = (c) => (c.is_high_cost ? "High-cost" : "Baseline");

  return (
    <section
      ref={shellRef}
      className="tnmap-shell"
      aria-label="Interactive Tennessee 2026 loan limits map"
    >
      <style>{MAP_CSS}</style>

      <div className="tnmap-mobile-search">
        <label htmlFor={selectId}>Pick your county</label>
        <select
          id={selectId}
          value={selectedFips ?? ""}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">— Select a county —</option>
          {COUNTIES_ALPHA.map((c) => (
            <option key={c.fips} value={c.fips}>
              {c.name} County{c.is_high_cost ? " (high-cost)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="tnmap-wrap">
        <svg
          className="tnmap-svg"
          viewBox={META.svg_viewbox}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Tennessee map of 95 counties shaded by 2026 loan limit category"
        >
          {COUNTIES.map((c) => {
            const isActive = selectedFips === c.fips;
            const cls = `tnmap-county ${c.is_high_cost ? "high-cost" : "baseline"}${isActive ? " active" : ""}`;
            return (
              <path
                key={c.fips}
                d={c.path}
                className={cls}
                data-fips={c.fips}
                tabIndex={0}
                role="button"
                aria-label={`${c.name} County: conventional limit ${formatCurrency(c.conforming_1unit)}, FHA limit ${formatCurrency(c.fha_1unit)}${c.is_high_cost ? ", high-cost area" : ""}`}
                onMouseEnter={() => setHoveredFips(c.fips)}
                onMouseMove={onMouseMove}
                onMouseLeave={() => setHoveredFips(null)}
                onFocus={() => setHoveredFips(c.fips)}
                onBlur={() => setHoveredFips(null)}
                onClick={() => handleSelect(c.fips)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(c.fips);
                  }
                }}
              />
            );
          })}
        </svg>

        <div
          ref={tooltipRef}
          className={`tnmap-tooltip ${hovered ? "visible" : ""}`}
          aria-hidden="true"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {hovered && (
            <>
              <div className="tnmap-tt-title">{hovered.name} County</div>
              <div className="tnmap-tt-msa">{hovered.msa_name.replace(/--/g, " / ")}</div>
              <div className="tnmap-tt-row">
                <span className="tnmap-tt-label">Conventional</span>
                <span className="tnmap-tt-value cap">{formatCurrency(hovered.conforming_1unit)}</span>
              </div>
              <div className="tnmap-tt-row">
                <span className="tnmap-tt-label">FHA</span>
                <span className="tnmap-tt-value cap">{formatCurrency(hovered.fha_1unit)}</span>
              </div>
              <div className="tnmap-tt-vagroup">
                <div className="tnmap-tt-row">
                  <span className="tnmap-tt-label">VA</span>
                  <span className="tnmap-tt-value note">{`$0 down up to ${formatCurrency(hovered.conforming_1unit)}; 25% down on overage`}</span>
                </div>
                <div className="tnmap-tt-row">
                  <span className="tnmap-tt-label">USDA</span>
                  <span className="tnmap-tt-value note">No max loan; income & rural eligibility apply</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="tnmap-legend">
        <div className="tnmap-legend-item">
          <span className="tnmap-legend-swatch baseline" aria-hidden="true" />
          <span>{`Baseline counties (${BASELINE_COUNT})`}</span>
        </div>
        <div className="tnmap-legend-item">
          <span className="tnmap-legend-swatch high-cost" aria-hidden="true" />
          <span>{`High-cost · Nashville MSA (${HIGH_COST_COUNT})`}</span>
        </div>
      </div>

      <div
        className={`tnmap-info ${selected ? "has-county" : "empty"}`}
        aria-live="polite"
      >
        {!selected && (
          <div>
            <strong>Tap or select a county</strong> to see its 2026 loan limits.
          </div>
        )}
        {selected && (
          <div>
            <div className="tnmap-info-header">
              <span className="tnmap-info-name">{selected.name} County</span>
              <span className={`tnmap-info-badge ${selected.is_high_cost ? "high-cost" : "baseline"}`}>
                {renderInfoBadgeText(selected)}
              </span>
            </div>
            <div className="tnmap-info-msa">{selected.msa_name.replace(/--/g, " / ")}</div>
            <div className="tnmap-info-grid">
              <div className="tnmap-info-cell">
                <div className="tnmap-info-cell-label">Conventional (Conforming)</div>
                <div className="tnmap-info-cell-value">{formatCurrency(selected.conforming_1unit)}</div>
                <div className="tnmap-info-cell-note">Loans above this become jumbo loans</div>
              </div>
              <div className="tnmap-info-cell">
                <div className="tnmap-info-cell-label">FHA</div>
                <div className="tnmap-info-cell-value">{formatCurrency(selected.fha_1unit)}</div>
                <div className="tnmap-info-cell-note">Set separately by HUD</div>
              </div>
              <div className="tnmap-info-cell full">
                <div className="tnmap-info-cell-label">VA</div>
                <div className="tnmap-info-cell-value text">$0 down up to the conforming limit</div>
                <div className="tnmap-info-cell-note">
                  Above the limit, full-entitlement borrowers put 25% down on the excess. Partial entitlement varies.
                </div>
              </div>
              <div className="tnmap-info-cell full">
                <div className="tnmap-info-cell-label">USDA</div>
                <div className="tnmap-info-cell-value text">No maximum loan amount</div>
                <div className="tnmap-info-cell-note">
                  Borrowers qualify based on income (≤115% of area median) and the property must be in a USDA-eligible rural area.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tnmap-cta">
        <div className="tnmap-cta-inner">
          <div className="tnmap-cta-text">
            <div className="tnmap-cta-eyebrow">Buying near a limit?</div>
            <div className="tnmap-cta-headline">
              Let's run <em>your</em> numbers.
            </div>
            <div className="tnmap-cta-sub">
              If you're shopping near the conforming limit (especially in the Nashville MSA), the choice between conventional, FHA, jumbo, or VA can shift your cash to close by tens of thousands. I work files like this every week.
            </div>
          </div>
          <div className="tnmap-cta-buttons">
            <a
              className="tnmap-cta-btn"
              href="tel:+16156560737"
              aria-label="Call Nick Peters at 615-656-0737"
            >
              📞 Call (615) 656-0737
            </a>
            <a
              className="tnmap-cta-btn secondary"
              href="mailto:npeters@annie-mac.com"
              aria-label="Email Nick Peters at npeters@annie-mac.com"
            >
              ✉ Email Nick
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
