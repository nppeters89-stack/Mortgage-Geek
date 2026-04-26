import { useState } from "react";
import { P, F } from "../theme";

const TIERS = [
  {
    id: "sub-580",
    score: "FICOs 500–579 or no score",
    ratios: "31% / 43%",
    headline: "Compensating factors not available at this credit tier",
    blurb: "Below-580 borrowers cannot stretch ratios on a manual. The 31/43 cap is firm, and comp factors don't unlock anything higher.",
    factorsRequired: 0,
    tone: "neutral",
    bullets: [
      "Housing ratio cap: 31%",
      "Total DTI cap: 43%",
      "Energy-efficient homes may stretch to 33% / 45%",
      "Reserves baseline (1 month, borrower's own funds) still required",
    ],
  },
  {
    id: "baseline",
    score: "FICOs 580 and above",
    ratios: "31% / 43%",
    headline: "No compensating factors required",
    blurb: "The baseline tier. If your ratios are at or below 31/43, you don't need to document any comp factors on a manual.",
    factorsRequired: 0,
    tone: "good",
    bullets: [
      "Housing ratio cap: 31%",
      "Total DTI cap: 43%",
      "Energy-efficient homes may stretch to 33% / 45%",
      "1-month reserves baseline (borrower's own funds) still required",
    ],
  },
  {
    id: "one-factor",
    score: "FICOs 580 and above",
    ratios: "37% / 47%",
    headline: "One compensating factor required",
    blurb: "To stretch into this tier, document ONE of the four factors below.",
    factorsRequired: 1,
    tone: "stretch",
    factorIds: ["reserves", "minimal-increase", "residual"],
  },
  {
    id: "no-disc",
    score: "FICOs 580 and above",
    ratios: "40% / 40%",
    headline: "No discretionary debt as the sole factor",
    blurb: "Unique tier. The ONLY qualifying factor is no discretionary debt, and it stands alone.",
    factorsRequired: "noDisc",
    tone: "stretch",
    bullets: [
      "Established tradelines open at least 6 months",
      "All revolving accounts paid in full each month for 6+ months",
      "Once the new mortgage starts, no installment debt other than the mortgage",
      "Housing ratio AND total DTI both capped at 40%",
    ],
  },
  {
    id: "two-factors",
    score: "FICOs 580 and above",
    ratios: "40% / 50%",
    headline: "Two compensating factors required",
    blurb: "The top tier HUD allows on a manual. Document TWO of the factors below.",
    factorsRequired: 2,
    tone: "max",
    factorIds: ["reserves", "minimal-increase", "additional-income", "residual"],
  },
];

const FACTOR_DETAILS = {
  reserves: {
    icon: "💰",
    label: "Verified cash reserves",
    detail: "3+ months PITI for 1–2 unit, 6+ months for 3–4 unit. Borrower's own funds only. Gift funds don't count. Retirement counts at 60% of vested balance.",
  },
  "minimal-increase": {
    icon: "🏠",
    label: "Minimal increase in housing payment",
    detail: "New PITI within the lesser of $100 or 5% of current housing payment. Requires documented 12-month housing history with no more than one 30-day late.",
  },
  "additional-income": {
    icon: "📈",
    label: "Significant additional income",
    detail: "Overtime, bonus, part-time, or seasonal income received 12+ months and likely to continue. Only usable in this top tier (37/47 to 40/50 band).",
  },
  residual: {
    icon: "💸",
    label: "Residual income (VA standard)",
    detail: "Meets VA's residual income requirement for household size and region. Most borrower-friendly factor when reserves are thin.",
  },
};

function ToneStripe({ tone }) {
  const color = {
    good: P.sage,
    stretch: P.gold,
    max: P.goldMuted,
    neutral: P.warmGrayLight,
  }[tone];
  return (
    <div
      style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: 4,
        background: color,
      }}
    />
  );
}

function TierCard({ t, idx, expanded, onToggle, onKeyDown, plainMode, density }) {
  const pad = density === "compact" ? "20px 22px" : density === "comfy" ? "32px 32px" : "26px 28px";
  const ratiosFontSize = density === "compact" ? 36 : density === "comfy" ? 56 : 44;
  const factors = t.factorIds ? t.factorIds.map((id) => FACTOR_DETAILS[id]) : null;
  const btnId = `dti-row-btn-${idx}`;
  const panelId = `dti-row-panel-${t.id}`;

  return (
    <article
      data-screen-label={`Tier ${idx + 1}`}
      style={{
        position: "relative",
        background: P.navyDark,
        border: `1px solid ${expanded ? "rgba(212, 168, 67, 0.5)" : "rgba(212, 168, 67, 0.18)"}`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: expanded
          ? "0 8px 32px rgba(15, 37, 48, 0.28)"
          : "0 2px 12px rgba(15, 37, 48, 0.14)",
        transition: "border-color .2s, box-shadow .2s",
      }}
    >
      <ToneStripe tone={t.tone} />

      <button
        id={btnId}
        type="button"
        onClick={onToggle}
        onKeyDown={(e) => onKeyDown(e, idx)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="stcb-row-btn"
        style={{
          appearance: "none",
          background: "transparent",
          border: "none",
          width: "100%",
          padding: pad,
          paddingLeft: density === "compact" ? 30 : 36,
          fontFamily: F.body,
          color: "rgba(255, 255, 255, 0.85)",
          textAlign: "left",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            color: P.gold,
            marginBottom: 8,
            fontFamily: F.body,
          }}>
            Tier {String(idx + 1).padStart(2, "0")} · {t.score}
          </div>
          <div className="stcb-row-ratios" style={{
            fontFamily: F.display,
            fontSize: ratiosFontSize,
            color: P.goldLight,
            lineHeight: 1.0,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            marginBottom: 14,
          }}>
            {t.ratios}
          </div>
          <div style={{
            fontFamily: F.display,
            fontSize: density === "compact" ? 18 : 22,
            color: "#fff",
            fontWeight: 400,
            lineHeight: 1.25,
            marginBottom: 8,
            letterSpacing: "-0.005em",
          }}>
            {plainMode ? t.headline : `Decision Score ${t.score.replace("FICOs ", "")} · max ${t.ratios}`}
          </div>
          {plainMode && (
            <div style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.62)",
              lineHeight: 1.6,
              maxWidth: 580,
            }}>
              {t.blurb}
            </div>
          )}
        </div>

        <div
          aria-hidden="true"
          style={{
            width: 36, height: 36,
            borderRadius: 999,
            border: `1px solid rgba(212, 168, 67, ${expanded ? 0.6 : 0.3})`,
            background: expanded ? "rgba(212, 168, 67, 0.15)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: P.goldLight,
            fontSize: 22,
            lineHeight: 1,
            transition: "transform .25s ease, border-color .2s, background .2s",
            transform: expanded ? "rotate(45deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          +
        </div>
      </button>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={btnId}
          className="stcb-row-detail"
          style={{
            background: P.cream,
            borderTop: `1px solid rgba(212, 168, 67, 0.25)`,
            padding: density === "compact" ? "20px 24px" : "26px 30px",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid rgba(184, 134, 11, 0.18)`,
          }}>
            <span style={{ fontSize: 14 }}>🤓</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: P.goldMuted,
            }}>
              HUD 4000.1 · §II.A.5.d.iii(B) · Row {idx + 1}
            </span>
          </div>

          {factors ? (
            <>
              <p style={{
                fontSize: 14.5,
                lineHeight: 1.7,
                color: P.warmGray,
                margin: "0 0 14px",
              }}>
                {t.blurb}
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 10,
              }}>
                {factors.map((f) => (
                  <div
                    key={f.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      background: P.creamDark,
                      borderLeft: `2px solid ${P.gold}`,
                      borderRadius: 4,
                      padding: "12px 14px",
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>{f.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: P.navy,
                        marginBottom: 4,
                        lineHeight: 1.35,
                      }}>
                        {f.label}
                      </div>
                      <div style={{
                        fontSize: 12.5,
                        lineHeight: 1.55,
                        color: P.warmGray,
                      }}>
                        {f.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {t.bullets.map((b, i) => (
                <li key={i} style={{
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  color: P.text,
                  padding: "5px 0 5px 22px",
                  position: "relative",
                }}>
                  <span style={{
                    position: "absolute",
                    left: 6,
                    top: 5,
                    color: P.gold,
                    fontWeight: 700,
                  }}>•</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

export function StackedTierCardsBranded({ plainMode = true, density = "regular" }) {
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId((p) => (p === id ? null : id));
  const gap = density === "compact" ? 10 : density === "comfy" ? 18 : 14;

  const onKeyDown = (e, idx) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.getElementById(`dti-row-btn-${(idx + 1) % TIERS.length}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      document.getElementById(`dti-row-btn-${(idx - 1 + TIERS.length) % TIERS.length}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById("dti-row-btn-0")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`dti-row-btn-${TIERS.length - 1}`)?.focus();
    }
  };

  return (
    <div
      role="region"
      aria-label="DTI and compensating factors grid"
      style={{
        display: "flex",
        flexDirection: "column",
        gap,
        margin: "28px 0",
      }}
    >
      <style>{`
        .stcb-row-btn:focus-visible {
          outline: 2px solid ${P.goldLight};
          outline-offset: -2px;
        }
        @media (max-width: 600px) {
          .stcb-row-btn {
            padding: 22px 20px 22px 26px !important;
            grid-template-columns: 1fr 32px !important;
            gap: 14px !important;
          }
          .stcb-row-ratios {
            font-size: 36px !important;
          }
          .stcb-row-detail {
            padding: 20px 18px !important;
          }
        }
      `}</style>

      {TIERS.map((t, idx) => (
        <TierCard
          key={t.id}
          t={t}
          idx={idx}
          expanded={openId === t.id}
          onToggle={() => toggle(t.id)}
          onKeyDown={onKeyDown}
          plainMode={plainMode}
          density={density}
        />
      ))}
    </div>
  );
}
