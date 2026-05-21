// Compact list of closings already logged for the year. Grouped by
// date with newest dates first; rows within a date stay in the
// server-returned order (oldest first within the day, since the API
// appends).
//
// Each row has a two-click confirm-delete: first click flips the
// button to "Delete?" for 3 seconds; second click within that window
// commits the delete via the G1 API. No native confirm() dialog.

import { useEffect, useState } from "react";
import { P, F } from "../../theme";
import { deleteClosing } from "../../utils/geeklogApi";

const labelStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 700,
  color: P.warmGray,
  textTransform: "uppercase",
  letterSpacing: 1.5,
};

function ClosingRow({ apiKey, closing, date, index, onClosingDeleted, showToast }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  const handleClick = async () => {
    if (busy) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await deleteClosing(apiKey, date, index);
      showToast?.({ message: "Closing deleted", variant: "success" });
      onClosingDeleted?.();
    } catch (err) {
      showToast?.({ message: `Delete failed: ${err.message}`, variant: "error" });
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  // Build the bullet-separated content. Empty fields are simply omitted
  // (no em-dash placeholder) per project voice rules.
  const parts = [closing.borrower, closing.loanType, closing.note].filter(
    (p) => typeof p === "string" && p.trim().length > 0
  );

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        background: P.white,
        border: `1px solid ${P.creamDark}`,
        borderRadius: 8,
        listStyle: "none",
      }}
    >
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 500, color: P.warmGray, fontVariantNumeric: "tabular-nums" }}>
          {date}
        </span>
        {parts.length > 0 && (
          <span style={{ fontFamily: F.body, fontSize: 14, color: P.navy, lineHeight: 1.4 }}>
            <span style={{ color: P.warmGrayLight, margin: "0 6px" }}>·</span>
            {parts.map((p, i) => (
              <span key={i}>
                {p}
                {i < parts.length - 1 && (
                  <span style={{ color: P.warmGrayLight, margin: "0 6px" }}>·</span>
                )}
              </span>
            ))}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        style={{
          fontFamily: F.body,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.3,
          padding: "8px 12px",
          minHeight: 36,
          background: "transparent",
          color: confirming ? P.navyDark : P.warmGray,
          border: "none",
          borderRadius: 6,
          cursor: busy ? "wait" : "pointer",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        {confirming ? "Delete?" : "Delete"}
      </button>
    </li>
  );
}

export function ClosingsList({ apiKey, closingsByDate, onClosingDeleted, showToast }) {
  const dates = Object.keys(closingsByDate || {}).filter(
    (d) => Array.isArray(closingsByDate[d]) && closingsByDate[d].length > 0
  );
  if (dates.length === 0) return null;
  // Newest date first (string sort is fine for ISO dates).
  dates.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ ...labelStyle, margin: 0 }}>Closings logged</h2>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0 }}>
        {dates.flatMap((date) =>
          closingsByDate[date].map((closing, idx) => (
            <ClosingRow
              key={`${date}-${idx}`}
              apiKey={apiKey}
              closing={closing}
              date={date}
              index={idx}
              onClosingDeleted={onClosingDeleted}
              showToast={showToast}
            />
          ))
        )}
      </ul>
    </div>
  );
}
