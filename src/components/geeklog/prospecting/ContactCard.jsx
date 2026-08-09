import { useState } from "react";
import { T, FF } from "../gl2Tokens";
import { OUTCOMES, heatColor, dialHref } from "./prospectsModel";

// Contact card / detail view: serif name, brokerage + line type, buysides, email,
// a full-width tel: Call button, collapsible intel, and the call-log controls
// (outcome chips, 1-10 heat score, note, callback date). Save hands a log object
// up to the parent, which persists it via the keepalive pattern and returns to
// the queue. Colors/fonts from the Geek Log tokens.

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export function ContactCard({ prospect: p, log, onSave, onBack, onCopyOne }) {
  const [outcome, setOutcome] = useState(log?.outcome || "");
  const [score, setScore] = useState(log?.score || 0);
  const [note, setNote] = useState(log?.note || "");
  const [callback, setCallback] = useState(log?.callback || "");

  const notes = p.notes || "";
  const hasIntel = notes.length > 0;
  const intelOpen = notes.length < 200;

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

  const sub = [p.brokerage, p.lineType ? `${p.lineType} line` : ""].filter(Boolean).join(" · ");

  return (
    <div style={{ padding: "0 20px 40px" }}>
      <button type="button" onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: T.dim, fontFamily: FF.sans, fontSize: 14, padding: "18px 0 8px", cursor: "pointer" }}>
        ← Queue
      </button>

      <div style={{ fontFamily: FF.serif, fontSize: 34, lineHeight: 1.1, color: T.cream }}>{p.name}</div>
      {sub && <div style={{ color: T.dim, fontSize: 14, marginTop: 6, fontFamily: FF.sans }}>{sub}</div>}

      <div style={{ display: "flex", gap: 22, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{p.buysides}</div>
          <div style={{ fontSize: 10.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Buysides 12m</div>
        </div>
        {p.email && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, paddingTop: 4, color: T.cream, wordBreak: "break-all", fontFamily: FF.sans }}>{p.email}</div>
            <div style={{ fontSize: 10.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Email</div>
          </div>
        )}
      </div>

      <a href={dialHref(p.phone)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", marginTop: 20, padding: 18, background: T.redLift, color: T.cream, border: "none", borderRadius: 14, fontFamily: FF.sans, fontSize: 19, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.9.7a2 2 0 0 1 1.7 2z" />
        </svg>
        Call {p.phone}
      </a>

      {hasIntel && (
        <details open={intelOpen} style={{ marginTop: 18, border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden" }}>
          <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", cursor: "pointer", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, background: T.surface }}>
            Intel<span style={{ color: T.faint }}>▸</span>
          </summary>
          <div style={{ padding: "14px 15px", fontSize: 14, lineHeight: 1.55, color: T.cream, background: T.bg0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: FF.sans }}>{notes}</div>
        </details>
      )}

      <div style={{ marginTop: 26 }}>
        <h2 style={{ fontFamily: FF.serif, fontWeight: 400, fontSize: 22, marginBottom: 12, color: T.cream }}>Log this call</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {OUTCOMES.map((o) => {
            const on = outcome === o.value;
            return (
              <button key={o.value} type="button" onClick={() => pickOutcome(o.value)}
                style={{ padding: "12px 4px", borderRadius: 10, border: `1px solid ${on ? T.cream : T.line}`, background: on ? T.cream : T.surface, color: on ? T.bg1 : T.dim, fontFamily: FF.sans, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
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
              style={{ height: 40, border: "none", borderRadius: 6, cursor: "pointer", background: heatColor(i), opacity: score >= i ? 1 : 0.28, fontFamily: FF.sans, fontSize: 11, fontWeight: 700, color: "rgba(19,20,22,0.75)" }}>
              {i}
            </button>
          ))}
        </div>

        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes from the call..."
          style={{ width: "100%", marginTop: 20, minHeight: 88, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.sans, fontSize: 15, lineHeight: 1.5 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <label htmlFor="pf-cb" style={{ fontSize: 13, color: T.dim, flex: "none" }}>Call back</label>
          <input id="pf-cb" type="date" value={callback} onChange={(e) => setCallback(e.target.value)}
            style={{ flex: 1, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, color: T.cream, padding: "10px 12px", fontFamily: FF.sans, fontSize: 15, colorScheme: "dark" }} />
        </div>

        <button type="button" onClick={() => onSave(buildLog())}
          style={{ width: "100%", marginTop: 18, padding: 16, borderRadius: 12, border: "none", background: T.green, color: T.cream, fontFamily: FF.sans, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Save log
        </button>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="button" onClick={() => onCopyOne(buildLog())}
            style={{ flex: 1, padding: 13, borderRadius: 12, border: `1px solid ${T.line}`, background: "none", color: T.dim, fontFamily: FF.sans, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Copy update for Excel
          </button>
        </div>
      </div>
    </div>
  );
}
