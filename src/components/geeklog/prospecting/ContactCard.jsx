import { useState } from "react";
import { T, FF } from "../gl2Tokens";
import { OUTCOMES, heatColor } from "./prospectsModel";
import { ContactHeader } from "./ContactHeader";
import { AddToContactsButton } from "./AddToContactsButton";
import { MotivationBox } from "./MotivationBox";

// Contact card / detail view: the shared ContactHeader (name, brokerage, buysides,
// email, Call button, intel) plus the call-log controls (outcome chips, 1-10 heat
// score, note, callback date). Save hands a log object up to the parent, which
// persists it via the keepalive pattern and returns to the queue. Colors/fonts
// from the Geek Log tokens.

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export function ContactCard({ prospect: p, log, onSave, onBack, onCopyOne, onToast = null, motivation = "", onSaveMotivation = null, instagram = "", onSaveInstagram = null }) {
  const [outcome, setOutcome] = useState(log?.outcome || "");
  const [score, setScore] = useState(log?.score || 0);
  const [note, setNote] = useState(log?.note || "");
  const [callback, setCallback] = useState(log?.callback || "");

  const pickOutcome = (value) => {
    setOutcome(value);
    if (value === "Callback" && !callback) setCallback(tomorrowISO());
  };

  const buildLog = () => ({
    outcome,
    score: score || null,
    note: note.trim(),
    callback: callback || "",
    dateCalled: new Date().toISOString().slice(0, 10),
    ts: Date.now(),
  });

  return (
    <div style={{ padding: "0 20px 40px" }}>
      <button type="button" onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: T.dim, fontFamily: FF.body, fontSize: 14, padding: "18px 0 8px", cursor: "pointer" }}>
        ← Queue
      </button>

      <ContactHeader prospect={p} callAction={<AddToContactsButton prospect={p} onToast={onToast} />} instagram={instagram} onSaveInstagram={onSaveInstagram} />

      {/* Motivation lands here first: gathered DURING the call, so it is already
          on file when a 9+ score sends the contact to Follow Ups. */}
      {onSaveMotivation && <MotivationBox value={motivation} onSave={onSaveMotivation} />}

      <div style={{ marginTop: 26 }}>
        <h2 style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 22, marginBottom: 12, color: T.cream }}>Log this call</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {OUTCOMES.map((o) => {
            const on = outcome === o.value;
            return (
              <button key={o.value} type="button" onClick={() => pickOutcome(o.value)}
                style={{ padding: "12px 4px", borderRadius: 10, border: `1px solid ${on ? T.cream : T.line}`, background: on ? T.cream : T.surface, color: on ? T.bg1 : T.dim, fontFamily: FF.body, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                {o.value}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "20px 0 8px" }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim }}>Interaction score</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.cream }}>{score ? `${score} / 10` : "—"}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <button key={i} type="button" onClick={() => setScore(i)} aria-label={`Score ${i}`}
              style={{ height: 40, border: "none", borderRadius: 6, cursor: "pointer", background: heatColor(i), opacity: score >= i ? 1 : 0.28, fontFamily: FF.body, fontSize: 11, fontWeight: 700, color: "rgba(19,20,22,0.75)" }}>
              {i}
            </button>
          ))}
        </div>

        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes from the call..."
          style={{ width: "100%", marginTop: 20, minHeight: 88, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.body, fontSize: 15, lineHeight: 1.5 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <label htmlFor="pf-cb" style={{ fontSize: 13, color: T.dim, flex: "none" }}>Call back</label>
          <input id="pf-cb" type="date" value={callback} onChange={(e) => setCallback(e.target.value)}
            style={{ flex: 1, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, color: T.cream, padding: "10px 12px", fontFamily: FF.body, fontSize: 15, colorScheme: "dark" }} />
        </div>

        <button type="button" onClick={() => onSave(buildLog())}
          style={{ width: "100%", marginTop: 18, padding: 16, borderRadius: 12, border: "none", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Save log
        </button>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="button" onClick={() => onCopyOne(buildLog())}
            style={{ flex: 1, padding: 13, borderRadius: 12, border: `1px solid ${T.line}`, background: "none", color: T.dim, fontFamily: FF.body, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Copy update for Excel
          </button>
        </div>
      </div>
    </div>
  );
}
