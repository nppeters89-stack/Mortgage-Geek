import { useState, useEffect } from "react";
import { T, FF } from "../gl2Tokens";

// The motivation note: why this prospect would switch. Deliberately loud (neon
// orange) so an empty box reads as "you have not asked yet" during a call. Saves
// on the button or on blur; empty text clears the note.
export function MotivationBox({ value, onSave }) {
  const [text, setText] = useState(value || "");
  useEffect(() => { setText(value || ""); }, [value]);
  const dirty = text.trim() !== (value || "").trim();

  const save = () => { if (dirty) onSave(text.trim()); };

  return (
    <div style={{ marginTop: 14, border: `1.5px solid ${T.orangeWashLine}`, borderRadius: 12, background: T.orangeWash, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.orange }}>Motivation to switch</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={save}
        placeholder="Why would they move their business to you? Ask on the next call."
        style={{ width: "100%", marginTop: 8, minHeight: 56, resize: "vertical", background: "transparent", color: T.cream, border: "none", outline: "none", padding: 0, fontFamily: FF.body, fontSize: 14.5, lineHeight: 1.5 }} />
      {dirty && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={save}
          style={{ marginTop: 8, padding: "8px 16px", borderRadius: 9, border: "none", background: T.orange, color: T.bg1, fontFamily: FF.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Save motivation
        </button>
      )}
    </div>
  );
}
