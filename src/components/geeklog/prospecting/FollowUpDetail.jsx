import { useState } from "react";
import { T, FF } from "../gl2Tokens";
import { ContactHeader } from "./ContactHeader";
import { AddToContactsButton } from "./AddToContactsButton";
import { AddToSoiButton } from "./AddToSoiButton";
import { AddedToRacButton } from "./AddedToRacButton";
import { formatTouchDate } from "./prospectsModel";
import { ghostAction } from "./detailActionStyles";

// Contact detail, shared by Follow Ups and SOI: the ContactHeader, a compact
// read-only "First contact" block from the original call log, a follow-up
// composer, and the touch history (newest first, each an accordion consistent
// with the intel block). onLogFollowUp hands the note up; the parent appends the
// touch and re-renders this view with it on top.
//
// Both views write touches to the same prospects:fu:{id} key through the same
// parent handler, so a contact keeps one history across a promotion or a removal.
// The views differ only in backLabel and which membership action they pass:
// Follow Ups passes onAddToSoi, SOI passes footerAction (Remove from SOI).
//
// The First contact block is already conditional on `log`, so a pinned contact
// with no call log renders without it and needs no special-casing.
export function FollowUpDetail({ prospect: p, log, touches, onBack, onLogFollowUp, onToast, onAddToSoi, onCopyForExcel, inRac = false, onToggleRac, footerAction = null, backLabel = "Follow Ups" }) {
  const [note, setNote] = useState("");
  const history = [...(touches || [])].sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const submit = () => {
    const text = note.trim();
    if (!text) return;
    onLogFollowUp(text);
    setNote("");
  };

  return (
    <div style={{ padding: "0 20px 40px" }}>
      <button type="button" onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: T.dim, fontFamily: FF.body, fontSize: 14, padding: "18px 0 8px", cursor: "pointer" }}>
        ← {backLabel}
      </button>

      <ContactHeader prospect={p} callAction={
        <>
          <AddToContactsButton prospect={p} onToast={onToast} />
          {onToggleRac && <AddedToRacButton inRac={inRac} onToggle={onToggleRac} />}
          {onAddToSoi && <AddToSoiButton onAdd={onAddToSoi} />}
          {onCopyForExcel && (
            <button type="button" onClick={onCopyForExcel} style={{ ...ghostAction, marginTop: 8 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" />
              </svg>
              Copy contact for Excel
            </button>
          )}
        </>
      } />

      {log && (
        <div style={{ marginTop: 22, border: `1px solid ${T.line}`, borderRadius: 12, background: T.surface, padding: "13px 15px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, marginBottom: 6 }}>First contact</div>
          <div style={{ fontSize: 14, color: T.cream, fontFamily: FF.body }}>
            {formatTouchDate(log.ts)}
            {log.outcome ? ` · ${log.outcome}` : ""}
            {log.score ? ` · ${log.score}/10` : ""}
          </div>
          {log.note && <div style={{ fontSize: 13.5, color: T.dim, marginTop: 6, lineHeight: 1.5, fontFamily: FF.body, whiteSpace: "pre-wrap" }}>{log.note}</div>}
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <h2 style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 22, marginBottom: 12, color: T.cream }}>Log a follow up</h2>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened on this touch..."
          style={{ width: "100%", minHeight: 88, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.body, fontSize: 15, lineHeight: 1.5 }} />
        <button type="button" onClick={submit} disabled={!note.trim()}
          style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: 12, border: "none", background: note.trim() ? T.green : T.surface, color: note.trim() ? T.cream : T.faint, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: note.trim() ? "pointer" : "default" }}>
          Log follow up
        </button>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, marginBottom: 10 }}>History · {history.length}</div>
          {history.map((t, i) => (
            <details key={`${t.ts}-${i}`} style={{ border: `1px solid ${T.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
              <summary style={{ listStyle: "none", display: "flex", alignItems: "baseline", gap: 10, padding: "12px 14px", cursor: "pointer", background: T.surface }}>
                <span style={{ flex: "none", fontSize: 12.5, fontWeight: 600, color: T.cream, fontVariantNumeric: "tabular-nums" }}>{formatTouchDate(t.ts)}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: FF.body }}>{t.note}</span>
              </summary>
              <div style={{ padding: "12px 14px", fontSize: 14, lineHeight: 1.55, color: T.cream, background: T.bg0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: FF.body }}>{t.note || "No note"}</div>
            </details>
          ))}
        </div>
      )}

      {footerAction}
    </div>
  );
}
