import { useState, useEffect } from "react";
import { T, FF } from "../gl2Tokens";

// Compact Instagram handle on the contact card. Same orange wash as the
// motivation box so it reads as part of that contact-intel cluster, but a
// single line rather than a notes field. Saves on blur (or Enter). Empty
// clears. A set handle is an @link to instagram.com/{handle}.
export function InstagramHandle({ value, onSave }) {
  const stored = (value || "").replace(/^@+/, "").trim();
  const [text, setText] = useState(stored);
  const [editing, setEditing] = useState(!stored);
  useEffect(() => {
    setText(stored);
    setEditing(!stored);
  }, [stored]);

  const save = () => {
    const next = text.replace(/^@+/, "").trim();
    if (next !== stored) onSave(next);
    setEditing(!next);
    setText(next || stored);
  };

  return (
    <div style={{ marginTop: 12, border: `1px solid ${T.orangeWashLine}`, borderRadius: 10, background: T.orangeWash, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      {!editing && stored ? (
        <>
          <a href={`https://instagram.com/${stored}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, minWidth: 0, fontFamily: FF.body, fontSize: 14, fontWeight: 600, color: T.cream, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            @{stored}
          </a>
          <button type="button" onClick={() => setEditing(true)}
            style={{ flex: "none", background: "none", border: "none", padding: 0, fontFamily: FF.body, fontSize: 12, fontWeight: 600, color: T.orange, cursor: "pointer" }}>
            Edit
          </button>
        </>
      ) : (
        <>
          <span style={{ flex: "none", fontFamily: FF.body, fontSize: 14, fontWeight: 600, color: T.orange }}>@</span>
          <input value={text} autoFocus={!!stored} onChange={(e) => setText(e.target.value)}
            onBlur={save} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            placeholder="Instagram" autoComplete="off" autoCapitalize="off" spellCheck={false}
            style={{ flex: 1, minWidth: 0, background: "transparent", color: T.cream, border: "none", outline: "none", padding: 0, fontFamily: FF.body, fontSize: 14.5 }} />
        </>
      )}
    </div>
  );
}
