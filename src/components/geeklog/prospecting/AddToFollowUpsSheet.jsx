import { useState, useMemo, useEffect, useRef } from "react";
import { T, FF, APP_MAX } from "../gl2Tokens";
import { idFromPhone, searchContacts } from "./prospectsModel";
import { ghostAction } from "./detailActionStyles";

// Add to Follow Ups, a two step sheet.
//
// Step 1 is search first on purpose: most of the time the person is already in
// the seeded list and the right move is a pin, not a new record. Only when the
// search comes up empty does step 2 create anything.
//
// Duplicates are structurally impossible rather than merely discouraged: the form
// checks the normalized phone against every contact before it writes, and the
// server repeats the check against its own hash.
//
// position:fixed rather than the absolute overlay Settings uses, because this
// renders from inside the tab's scroll container. It matches the app column with
// APP_MAX so it does not stretch across a desktop monitor.

const overlay = {
  position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
  width: "100%", maxWidth: APP_MAX, zIndex: 60,
  background: `linear-gradient(180deg, ${T.bg0} 0%, ${T.bg1} 78%)`,
  display: "flex", flexDirection: "column",
  paddingTop: "env(safe-area-inset-top, 0px)",
};

const fieldWrap = { marginTop: 14 };
const fieldLabel = { fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dim, marginBottom: 6 };
const fieldInput = {
  width: "100%", background: T.surface, color: T.cream, border: `1px solid ${T.line}`,
  borderRadius: 10, padding: "12px 13px", fontFamily: FF.body, fontSize: 16, outline: "none",
};

function Field({ label, value, onChange, placeholder, type = "text", inputMode, autoFocus, error }) {
  return (
    <div style={fieldWrap}>
      <div style={fieldLabel}>{label}</div>
      <input type={type} inputMode={inputMode} value={value} autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...fieldInput, border: `1px solid ${error ? T.redLift : T.line}` }} />
      {error && <div style={{ fontSize: 12.5, color: T.redLift, marginTop: 5, fontFamily: FF.body }}>{error}</div>}
    </div>
  );
}

// A search hit. Status tells Nick why tapping may not do what he expects, before
// he taps: someone already in Follow Ups or SOI is not addable.
function ResultRow({ prospect: p, status, onTap }) {
  return (
    <div role="button" tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } }}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 10px", borderBottom: `1px solid ${T.line}`, cursor: "pointer", borderRadius: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 17, color: T.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
        <div style={{ fontSize: 12.5, color: T.dim, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.brokerage || p.phone || " "}
        </div>
        {status && <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>{status}</div>}
      </div>
      <div style={{ flex: "none", textAlign: "right" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.cream, fontVariantNumeric: "tabular-nums" }}>{p.buysides ?? 0}</div>
        <div style={{ fontSize: 9.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>buysides</div>
      </div>
    </div>
  );
}

export function AddToFollowUpsSheet({ prospects, onClose, onPin, onCreate, describeStatus }) {
  const [step, setStep] = useState("search");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", brokerage: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [dupe, setDupe] = useState(null); // existing contact matching the typed phone
  const [saving, setSaving] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => { if (step === "search") searchRef.current?.focus(); }, [step]);

  const results = useMemo(() => searchContacts(prospects, query).slice(0, 40), [prospects, query]);

  const setField = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "phone") setDupe(null);
    setErrors((e) => (e[k] ? { ...e, [k]: null } : e));
  };

  const submitForm = () => {
    const name = form.name.trim();
    const id = idFromPhone(form.phone);
    const next = {};
    if (!name) next.name = "Name is required";
    if (!id) next.phone = "Phone is required";
    else if (id.length < 7) next.phone = "That does not look like a full phone number";
    if (Object.keys(next).length) { setErrors(next); return; }

    // Duplicate guard: never create a second record for a number we already know.
    const existing = prospects.find((p) => idFromPhone(p.phone) === id);
    if (existing) { setDupe(existing); return; }

    setSaving(true);
    onCreate({ ...form, name })
      .catch((err) => setErrors({ form: err?.message || "Could not save this contact" }))
      .finally(() => setSaving(false));
  };

  return (
    <div style={overlay} role="dialog" aria-label="Add to Follow Ups">
      <div style={{ flex: "0 0 auto", padding: "14px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, color: T.cream }}>
          {step === "search" ? "Add to Follow Ups" : "New contact"}
        </div>
        <button type="button" onClick={step === "search" ? onClose : () => { setStep("search"); setDupe(null); setErrors({}); }}
          style={{ background: "none", border: "none", color: T.dim, fontFamily: FF.body, fontSize: 14, cursor: "pointer", padding: "6px 2px" }}>
          {step === "search" ? "Close" : "Back"}
        </button>
      </div>

      {step === "search" ? (
        <>
          <div style={{ flex: "0 0 auto", padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2.4" style={{ flex: "none" }}>
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
              </svg>
              <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, brokerage, or phone" aria-label="Search contacts"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: T.cream, fontFamily: FF.body, fontSize: 16 }} />
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 12px 0" }}>
            {!query.trim() ? (
              <div style={{ textAlign: "center", color: T.faint, padding: "44px 30px", fontSize: 13.5, lineHeight: 1.6 }}>
                Search anyone already on your list.<br />Not there? Add them as a new contact below.
              </div>
            ) : results.length === 0 ? (
              <div style={{ textAlign: "center", color: T.faint, padding: "44px 30px", fontSize: 13.5, lineHeight: 1.6 }}>
                No match for &ldquo;{query.trim()}&rdquo;.<br />Add them as a new contact below.
              </div>
            ) : (
              results.map((p) => {
                const id = idFromPhone(p.phone);
                return <ResultRow key={id} prospect={p} status={describeStatus(id)} onTap={() => onPin(p)} />;
              })
            )}
          </div>

          <div style={{ flex: "0 0 auto", padding: "10px 20px calc(16px + env(safe-area-inset-bottom, 0px))" }}>
            <button type="button" onClick={() => { setStep("form"); setForm((f) => ({ ...f, name: f.name || query.trim() })); }}
              style={{ ...ghostAction, marginTop: 0 }}>
              Add new contact
            </button>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px calc(24px + env(safe-area-inset-bottom, 0px))" }}>
          <Field label="Name" value={form.name} onChange={setField("name")} placeholder="Full name" autoFocus error={errors.name} />
          <Field label="Phone" value={form.phone} onChange={setField("phone")} placeholder="(615) 555-0142" type="tel" inputMode="tel" error={errors.phone} />
          <Field label="Email" value={form.email} onChange={setField("email")} placeholder="Optional" type="email" inputMode="email" />
          <Field label="Brokerage" value={form.brokerage} onChange={setField("brokerage")} placeholder="Optional" />

          <div style={fieldWrap}>
            <div style={fieldLabel}>Note</div>
            <textarea value={form.notes} onChange={(e) => setField("notes")(e.target.value)}
              placeholder="Where you met, what they work on. Shows in the intel block."
              style={{ ...fieldInput, minHeight: 92, resize: "vertical", lineHeight: 1.5 }} />
          </div>

          {dupe && (
            <div style={{ marginTop: 16, border: `1px solid ${T.line}`, borderRadius: 12, background: T.surface, padding: "13px 15px" }}>
              <div style={{ fontSize: 12.5, color: T.dim, fontFamily: FF.body, lineHeight: 1.5 }}>
                That number already belongs to <strong style={{ color: T.cream, fontWeight: 600 }}>{dupe.name}</strong>. Nothing was created.
              </div>
              <button type="button" onClick={() => onPin(dupe)} style={{ ...ghostAction, marginTop: 12 }}>
                Add {dupe.name} to Follow Ups
              </button>
            </div>
          )}

          {errors.form && (
            <div style={{ marginTop: 14, fontSize: 13, color: T.redLift, fontFamily: FF.body, lineHeight: 1.5 }}>{errors.form}</div>
          )}

          <button type="button" onClick={submitForm} disabled={saving}
            style={{ width: "100%", marginTop: 20, padding: 16, borderRadius: 12, border: "none", background: saving ? T.surface : T.green, color: saving ? T.faint : T.cream, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
            {saving ? "Saving…" : "Save and add to Follow Ups"}
          </button>
        </div>
      )}
    </div>
  );
}
