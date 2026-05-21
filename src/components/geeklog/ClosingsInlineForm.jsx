// Expandable inline form for logging a closing. Collapsed by default
// to keep the dashboard quiet; expands to a small card with four fields
// (date + three optional text fields) and a Save button. Resets fields
// on successful save but stays expanded so a second closing on the
// same day is one click away.

import { useId, useState } from "react";
import { P, F } from "../../theme";
import { saveClosing } from "../../utils/geeklogApi";

const BORROWER_MAX = 60;
const LOANTYPE_MAX = 30;
const NOTE_MAX = 200;

function todayChicagoISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const labelStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 700,
  color: P.warmGray,
  textTransform: "uppercase",
  letterSpacing: 1.5,
};

const inputStyle = {
  fontFamily: F.body,
  fontSize: 15,
  padding: "12px 14px",
  minHeight: 44,
  background: P.white,
  color: P.navyDark,
  border: `1px solid ${P.creamDark}`,
  borderRadius: 8,
  outline: "none",
};

export function ClosingsInlineForm({ apiKey, onClosingSaved, showToast }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [date, setDate] = useState(todayChicagoISO);
  const [borrower, setBorrower] = useState("");
  const [loanType, setLoanType] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const dateId = useId();
  const borrowerId = useId();
  const loanTypeId = useId();
  const noteId = useId();

  const reset = () => {
    setDate(todayChicagoISO());
    setBorrower("");
    setLoanType("");
    setNote("");
    setError(null);
  };

  const collapse = () => {
    setIsExpanded(false);
    reset();
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await saveClosing(apiKey, { date, borrower, loanType, note });
      showToast?.({ message: "Closing saved", variant: "success" });
      // Reset fields but stay expanded for fast repeat entry.
      setBorrower("");
      setLoanType("");
      setNote("");
      setDate(todayChicagoISO());
      onClosingSaved?.();
    } catch (err) {
      const msg = err.message || "Save failed";
      setError(msg);
      showToast?.({ message: `Save failed: ${msg}`, variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        aria-expanded={false}
        style={{
          fontFamily: F.body,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.3,
          padding: "12px 20px",
          minHeight: 44,
          background: P.cream,
          color: P.navy,
          border: `1px solid ${P.creamDark}`,
          borderRadius: 8,
          cursor: "pointer",
          width: "100%",
          transition: "background 0.15s ease",
        }}
      >
        + Log a closing
      </button>
    );
  }

  return (
    <div
      style={{
        background: P.cream,
        border: `1px solid ${P.creamDark}`,
        borderRadius: 10,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ ...labelStyle, margin: 0, fontSize: 12, letterSpacing: 1.8 }}>
          Log a closing
        </h2>
        <button
          type="button"
          onClick={collapse}
          aria-label="Close closings form"
          aria-expanded={true}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "transparent",
            border: "none",
            color: P.warmGray,
            cursor: "pointer",
            fontSize: 22,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={dateId} style={labelStyle}>Date</label>
        <input
          id={dateId}
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          disabled={isSaving}
          style={inputStyle}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={borrowerId} style={labelStyle}>
          Borrower <span style={{ fontWeight: 400, color: P.warmGrayLight, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id={borrowerId}
          type="text"
          value={borrower}
          onChange={(e) => setBorrower(e.target.value.slice(0, BORROWER_MAX))}
          maxLength={BORROWER_MAX}
          disabled={isSaving}
          placeholder="Smith"
          style={inputStyle}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={loanTypeId} style={labelStyle}>
          Type <span style={{ fontWeight: 400, color: P.warmGrayLight, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id={loanTypeId}
          type="text"
          value={loanType}
          onChange={(e) => setLoanType(e.target.value.slice(0, LOANTYPE_MAX))}
          maxLength={LOANTYPE_MAX}
          disabled={isSaving}
          placeholder="FHA"
          style={inputStyle}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={noteId} style={labelStyle}>
          Note <span style={{ fontWeight: 400, color: P.warmGrayLight, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id={noteId}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
          maxLength={NOTE_MAX}
          disabled={isSaving}
          placeholder="Optional. Brief note."
          style={inputStyle}
        />
      </div>

      {error && (
        <p style={{
          fontFamily: F.body,
          fontSize: 13,
          color: P.warmGray,
          background: P.creamDark,
          padding: "8px 12px",
          borderRadius: 6,
          margin: 0,
        }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        style={{
          fontFamily: F.body,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 0.3,
          padding: "14px 28px",
          minHeight: 48,
          background: isSaving ? P.warmGrayLight : P.navy,
          color: P.cream,
          border: "none",
          borderRadius: 8,
          cursor: isSaving ? "not-allowed" : "pointer",
          transition: "background 0.15s ease",
        }}
      >
        {isSaving ? "Saving…" : "Save closing"}
      </button>
    </div>
  );
}
