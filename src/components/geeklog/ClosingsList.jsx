// Compact list of closings already logged for the year. Grouped by
// date with newest dates first; rows within a date stay in the
// server-returned order (oldest first within the day, since the API
// appends).
//
// Each row has a two-click confirm-delete: first click flips the
// button to "Delete?" for 3 seconds; second click within that window
// commits the delete via the G1 API. No native confirm() dialog.
//
// G6: collapsed by default to the most recent N closings so the
// dashboard stays scannable as the list grows through the year. A
// toggle below the list reveals the full set when needed.

import { useEffect, useState } from "react";
import { P, F } from "../../theme";
import { deleteClosing } from "../../utils/geeklogApi";

const RECENT_LIMIT = 5;

const sectionHeaderStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 500,
  color: P.warmGray,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  margin: 0,
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

function ToggleButton({ showAll, total, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        alignSelf: "center",
        fontFamily: F.body,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 0.3,
        padding: "12px 16px",
        minHeight: 44,
        background: "transparent",
        color: hover ? P.navyDark : P.navy,
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        textDecoration: "underline",
        textUnderlineOffset: 3,
      }}
    >
      {showAll ? "Show recent only" : `Show all ${total} closings`}
    </button>
  );
}

export function ClosingsList({ apiKey, closingsByDate, onClosingDeleted, showToast }) {
  const [showAll, setShowAll] = useState(false);

  const dates = Object.keys(closingsByDate || {}).filter(
    (d) => Array.isArray(closingsByDate[d]) && closingsByDate[d].length > 0
  );
  if (dates.length === 0) return null;
  // Newest date first (string sort is fine for ISO dates).
  dates.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  // Flatten into a single chronologically-sorted array. We retain the
  // per-date `idx` so ClosingRow can issue the delete against the
  // correct array slot in KV. Intra-date order (oldest-first by
  // server append) is preserved — see G6 spec.
  const flatRows = [];
  for (const date of dates) {
    const arr = closingsByDate[date];
    for (let idx = 0; idx < arr.length; idx++) {
      flatRows.push({ date, closing: arr[idx], idx });
    }
  }

  const total = flatRows.length;
  const canCollapse = total > RECENT_LIMIT;
  const isCollapsed = canCollapse && !showAll;
  const visible = isCollapsed ? flatRows.slice(0, RECENT_LIMIT) : flatRows;

  // Section title flips to "All Closings" only when actively expanded
  // (i.e. there was something to expand). Small-count case stays
  // labeled "Recent Closings" with "N total".
  const sectionTitle = canCollapse && showAll ? "All Closings" : "Recent Closings";
  const countText = isCollapsed ? `${RECENT_LIMIT} of ${total}` : `${total} total`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "0 4px",
        gap: 12,
      }}>
        <h2 style={sectionHeaderStyle}>{sectionTitle}</h2>
        <span style={{ ...sectionHeaderStyle, fontVariantNumeric: "tabular-nums" }}>
          {countText}
        </span>
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0 }}>
        {visible.map(({ date, closing, idx }) => (
          <ClosingRow
            key={`${date}-${idx}`}
            apiKey={apiKey}
            closing={closing}
            date={date}
            index={idx}
            onClosingDeleted={onClosingDeleted}
            showToast={showToast}
          />
        ))}
      </ul>
      {canCollapse && (
        <ToggleButton
          showAll={showAll}
          total={total}
          onClick={() => setShowAll((s) => !s)}
        />
      )}
    </div>
  );
}
