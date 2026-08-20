import { useState, useEffect } from "react";
import { T, FF } from "../gl2Tokens";
import { ContactHeader } from "./ContactHeader";
import { AddToContactsButton } from "./AddToContactsButton";
import { AddToSoiButton } from "./AddToSoiButton";
import { AddedToRacButton } from "./AddedToRacButton";
import { formatTouchDate, stageTag, goalIndexOf, heatColor, COLD_CHECKIN_CAP } from "./prospectsModel";
import { ghostAction } from "./detailActionStyles";
import { copyText } from "./clipboard";
import { MotivationBox } from "./MotivationBox";

// Contact detail, shared by Follow Ups and SOI. It renders the ContactHeader, a
// read-only "First contact" block from the original call log, a composer, and the
// touch history. The composer has three modes, all optional so the SOI tab keeps
// its original behavior with no new props:
//   "plain" (default): one textarea + Log follow up. onLogFollowUp(note).
//   "stage": a stage selector (defaulting to the next stage) + textarea. Logs the
//            touch at the chosen stage via onLogFollowUp(note, stage); choosing
//            the goal stage promotes to SOI in the parent.
//   "cold":  a cold check-in composer (disabled at the cap) plus Revive to
//            pipeline. onColdCheckIn(note) and onRevive().
// showStageTags turns on the red/blue/gray stage tags in the history rows.
//
// Both Follow Ups and SOI write touches to the same prospects:fu:{id} key through
// the same parent handler, so a contact keeps one history across a promotion.
// The tappable 1-10 heat row. Shared by the First contact block (contacts with
// a call log) and the standalone score box (contacts added by hand, who have no
// log until their first score creates one).
function ScoreRow({ score, onSet }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim }}>Interaction score</span>
        {!!score && <span style={{ fontSize: 13, fontWeight: 700, color: heatColor(score), fontVariantNumeric: "tabular-nums" }}>{score}/10</span>}
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 9 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const v = i + 1;
          const on = (score || 0) >= v;
          return (
            <button key={v} type="button" onClick={() => v !== score && onSet(v)} aria-label={`Set score to ${v}`}
              style={{ flex: 1, height: 26, borderRadius: 7, border: `1px solid ${on ? heatColor(v) : T.line}`, background: on ? heatColor(v) : "transparent", color: on ? T.bg1 : T.faint, fontFamily: FF.body, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 }}>
              {v}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: T.faint, marginTop: 7, lineHeight: 1.45 }}>Membership follows the score: below 9 drops this contact from Follow Ups (unless pinned by hand).</div>
    </>
  );
}

export function FollowUpDetail({
  prospect: p, log, touches, onBack, onLogFollowUp, onToast, onAddToSoi, onCopyForExcel,
  inRac = false, onToggleRac, footerAction = null, backLabel = "Follow Ups",
  composerMode = "plain", stages = null, stageIndex = 0, goalIndex, coldCount = 0,
  statusLine = "", onColdCheckIn, onRevive, showStageTags = false,
  motivation = "", onSaveMotivation = null, copyPhoneOnTap = false, onSetScore = null,
  onLogReferral = null,
}) {
  const goal = goalIndex != null ? goalIndex : goalIndexOf(stages || undefined);
  const [note, setNote] = useState("");
  // Stage defaults to the next stage up, capped at the goal. Re-sync as the
  // contact's derived stage advances (the parent re-renders this view after each
  // logged touch), so the selector keeps pointing one stage ahead.
  const [stageSel, setStageSel] = useState(() => Math.min(stageIndex + 1, goal));
  const [refMode, setRefMode] = useState(false); // "soi" composer: touch vs referral tab
  useEffect(() => { setStageSel(Math.min(stageIndex + 1, goal)); }, [stageIndex, goal]);

  const history = [...(touches || [])].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const atCap = coldCount >= COLD_CHECKIN_CAP;

  const submitPlain = () => {
    const text = note.trim();
    if (!text) return;
    onLogFollowUp(text);
    setNote("");
  };
  const submitStage = () => {
    const text = note.trim();
    if (!text) return;
    onLogFollowUp(text, stageSel);
    setNote("");
  };
  const submitSoi = () => {
    const text = note.trim();
    if (!text) return;
    if (refMode) onLogReferral?.(text); else onLogFollowUp(text);
    setNote("");
  };
  const submitCold = () => {
    const text = note.trim();
    if (!text || atCap) return;
    onColdCheckIn?.(text);
    setNote("");
  };

  const tagColor = (tone) => (tone === "cold" ? T.cold : tone === "dead" ? T.faint : tone === "ref" ? T.amber : T.redLift);

  return (
    <div style={{ padding: "0 20px 40px" }}>
      <button type="button" onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: T.dim, fontFamily: FF.body, fontSize: 14, padding: "18px 0 8px", cursor: "pointer" }}>
        ← {backLabel}
      </button>

      <ContactHeader prospect={p}
        onPhone={copyPhoneOnTap ? () => copyText(p.phone).then(() => onToast?.("Phone number copied"), () => onToast?.("Copy failed")) : null}
        onEmail={copyPhoneOnTap && p.email ? () => copyText(p.email).then(() => onToast?.("Email copied"), () => onToast?.("Copy failed")) : null}
        callAction={
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

      {onSaveMotivation && <MotivationBox value={motivation} onSave={onSaveMotivation} />}

      {statusLine && (
        <div style={{ marginTop: 12, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: composerMode === "cold" ? T.cold : composerMode === "soi" ? T.amber : T.redLift }}>{statusLine}</div>
      )}

      {log && (
        <div style={{ marginTop: 22, border: `1px solid ${T.line}`, borderRadius: 12, background: T.surface, padding: "13px 15px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, marginBottom: 6 }}>First contact</div>
          <div style={{ fontSize: 14, color: T.cream, fontFamily: FF.body }}>
            {formatTouchDate(log.ts)}
            {log.outcome ? ` · ${log.outcome}` : ""}
            {log.score ? ` · ${log.score}/10` : ""}
          </div>
          {log.note && <div style={{ fontSize: 13.5, color: T.dim, marginTop: 6, lineHeight: 1.5, fontFamily: FF.body, whiteSpace: "pre-wrap" }}>{log.note}</div>}
          {onSetScore && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.lineSoft}` }}>
              <ScoreRow score={log.score || 0} onSet={onSetScore} />
            </div>
          )}
        </div>
      )}

      {/* A hand-added contact has no call log yet; the standalone score box
          gives them one - their first score creates the log. */}
      {!log && onSetScore && (
        <div style={{ marginTop: 22, border: `1px solid ${T.line}`, borderRadius: 12, background: T.surface, padding: "13px 15px" }}>
          <ScoreRow score={0} onSet={onSetScore} />
        </div>
      )}

      {/* Composer: soi (two-mode touch/referral), cold, stage, or plain. */}
      {composerMode === "soi" ? (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setRefMode(false)}
              style={{ flex: 1, padding: 11, borderRadius: 10, border: `1px solid ${refMode ? T.line : T.cream}`, background: refMode ? T.surface : T.cream, color: refMode ? T.dim : T.bg1, fontFamily: FF.body, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              Log touch
            </button>
            <button type="button" onClick={() => setRefMode(true)}
              style={{ flex: 1, padding: 11, borderRadius: 10, border: `1px solid ${refMode ? T.amber : T.line}`, background: refMode ? T.amber : T.surface, color: refMode ? T.bg1 : T.dim, fontFamily: FF.body, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              Log referral
            </button>
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={refMode ? "Who did they send? Client name and context." : "What did this touch look like..."}
            style={{ width: "100%", marginTop: 12, minHeight: 88, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.body, fontSize: 15, lineHeight: 1.5 }} />
          <button type="button" onClick={submitSoi} disabled={!note.trim()}
            style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: 12, border: "none", background: !note.trim() ? T.surface : refMode ? T.amber : T.green, color: !note.trim() ? T.faint : refMode ? T.bg1 : T.cream, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: note.trim() ? "pointer" : "default" }}>
            {refMode ? "Log referral" : "Log touch"}
          </button>
        </div>
      ) : composerMode === "cold" ? (
        <div style={{ marginTop: 26 }}>
          <h2 style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 22, marginBottom: 12, color: T.cream }}>Cold check-in ({Math.min(coldCount + 1, COLD_CHECKIN_CAP)} of {COLD_CHECKIN_CAP})</h2>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Light touch. What did you send or say..."
            style={{ width: "100%", minHeight: 88, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.body, fontSize: 15, lineHeight: 1.5 }} />
          <button type="button" onClick={submitCold} disabled={!note.trim() || atCap}
            style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: 12, border: "none", background: !note.trim() || atCap ? T.surface : T.cold, color: !note.trim() || atCap ? T.faint : T.cream, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: !note.trim() || atCap ? "default" : "pointer" }}>
            {atCap ? "At 5 of 5 check-ins" : "Log check-in"}
          </button>
          {onRevive && (
            <button type="button" onClick={onRevive}
              style={{ width: "100%", marginTop: 10, padding: 14, borderRadius: 12, border: `1px solid ${T.greenWashLine}`, background: "none", color: T.green, fontFamily: FF.body, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Revive to pipeline
            </button>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 26 }}>
          <h2 style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 22, marginBottom: 12, color: T.cream }}>Log a follow up</h2>
          {composerMode === "stage" && stages && (
            <select value={stageSel} onChange={(e) => setStageSel(Number(e.target.value))}
              style={{ width: "100%", marginBottom: 10, background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 12px", fontFamily: FF.body, fontSize: 15 }}>
              {stages.map((label, i) => (i === 0 ? null : <option key={i} value={i}>{label}</option>))}
            </select>
          )}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened on this touch..."
            style={{ width: "100%", minHeight: 88, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.body, fontSize: 15, lineHeight: 1.5 }} />
          <button type="button" onClick={composerMode === "stage" ? submitStage : submitPlain} disabled={!note.trim()}
            style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: 12, border: "none", background: note.trim() ? (composerMode === "stage" && stageSel === goal ? T.redLift : T.green) : T.surface, color: note.trim() ? T.cream : T.faint, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: note.trim() ? "pointer" : "default" }}>
            {composerMode === "stage" && stageSel === goal ? "Promote to SOI" : "Log follow up"}
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, marginBottom: 10 }}>History · {history.length}</div>
          {history.map((t, i) => {
            const tag = showStageTags && stages ? stageTag(t, stages) : null;
            const isRef = t.stage === -3;
            return (
              <details key={`${t.ts}-${i}`} style={{ border: `1px solid ${T.line}`, borderLeft: isRef ? `3px solid ${T.amber}` : `1px solid ${T.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 8, background: isRef ? "rgba(201,162,58,0.05)" : "transparent" }}>
                <summary style={{ listStyle: "none", display: "flex", alignItems: "baseline", gap: 10, padding: "12px 14px", cursor: "pointer", background: T.surface }}>
                  <span style={{ flex: "none", fontSize: 12.5, fontWeight: 600, color: T.cream, fontVariantNumeric: "tabular-nums" }}>{formatTouchDate(t.ts)}</span>
                  {isRef && !tag && <span style={{ flex: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.amber }}>{"★"} Referral</span>}
                  {tag && <span style={{ flex: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: tagColor(tag.tone) }}>{tag.tone === "ref" ? `${"★"} ${tag.label}` : tag.label}</span>}
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: FF.body }}>{t.note}</span>
                </summary>
                <div style={{ padding: "12px 14px", fontSize: 14, lineHeight: 1.55, color: T.cream, background: T.bg0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: FF.body }}>{t.note || "No note"}</div>
              </details>
            );
          })}
        </div>
      )}

      {footerAction}
    </div>
  );
}
