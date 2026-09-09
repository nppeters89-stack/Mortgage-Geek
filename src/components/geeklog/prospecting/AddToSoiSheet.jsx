import { useState, useMemo, useEffect, useRef } from "react";
import { T, FF, APP_MAX } from "../gl2Tokens";
import { idFromPhone, searchContacts, formatPhoneInput, SOI_CATEGORIES } from "./prospectsModel";
import { ghostAction } from "./detailActionStyles";

// Add to SOI, the SOI tab's own front door. Same shape as AddToFollowUpsSheet
// (search first, create only when the search comes up empty) because the right
// move is usually promoting someone already on the list, not a second record
// for a number we already know. Two differences:
//
//   - Every path ends on a category. SOI membership carries one, the cockpit
//     filters and counts by it, so asking here is cheaper than the orange
//     "uncategorized" chase on the board later.
//   - Creating writes twice: the contact record, then SOI membership. The new
//     contact is also pinned to Follow Ups by the manual-contact write, which
//     is inert while they are in SOI (the queue excludes SOI members) and is
//     where they should land if they are ever demoted.
//
// position:fixed and APP_MAX for the same reason as the Follow Ups sheet: it
// renders from inside a tab's scroll container and must not stretch across a
// desktop monitor.

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

// The one field both paths share. Required, so it is styled as a live choice
// rather than an optional afterthought.
function CategoryPicker({ value, onChange, error }) {
  return (
    <div style={fieldWrap}>
      <div style={fieldLabel}>Category</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {SOI_CATEGORIES.map((c) => {
          const on = value === c.id;
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => onChange(on ? "" : c.id)}
              style={{ border: `1px solid ${on ? T.greenWashLine : error ? T.redLift : T.line}`, background: on ? T.greenWash : "none", color: on ? T.greenBright : T.dim, borderRadius: 999, padding: "8px 13px", fontFamily: FF.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {c.label}
            </button>
          );
        })}
      </div>
      {error && <div style={{ fontSize: 12.5, color: T.redLift, marginTop: 6, fontFamily: FF.body }}>{error}</div>}
    </div>
  );
}

function ResultRow({ prospect: p, status, disabled, onTap }) {
  return (
    <div role="button" tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onTap}
      onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onTap(); } }}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 10px", borderBottom: `1px solid ${T.line}`, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, borderRadius: 8 }}>
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

export function AddToSoiSheet({ prospects, soi = {}, onClose, onAddExisting, onCreate, describeStatus }) {
  const [step, setStep] = useState("search");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null); // existing contact awaiting a category
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", brokerage: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [dupe, setDupe] = useState(null);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => { if (step === "search") searchRef.current?.focus(); }, [step]);

  const results = useMemo(() => searchContacts(prospects, query).slice(0, 40), [prospects, query]);

  const setField = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "phone") setDupe(null);
    setErrors((e) => (e[k] ? { ...e, [k]: null } : e));
  };

  const back = () => {
    if (step === "search") { onClose(); return; }
    setStep("search"); setPicked(null); setCategory(""); setDupe(null); setErrors({});
  };

  const pick = (p) => { setPicked(p); setCategory(""); setErrors({}); setStep("category"); };

  const confirmExisting = () => {
    if (!category) { setErrors({ category: "Pick a category" }); return; }
    onAddExisting(picked, category);
  };

  const submitForm = () => {
    const name = form.name.trim();
    const id = idFromPhone(form.phone);
    const next = {};
    if (!name) next.name = "Name is required";
    if (!id) next.phone = "Phone is required";
    else if (id.length < 7) next.phone = "That does not look like a full phone number";
    if (!category) next.category = "Pick a category";
    if (Object.keys(next).length) { setErrors(next); return; }

    // Same duplicate guard as Follow Ups: never a second record for a number we
    // already know. An existing contact can still be promoted from here.
    const existing = prospects.find((p) => idFromPhone(p.phone) === id);
    if (existing) { setDupe(existing); return; }

    setSaving(true);
    onCreate({ ...form, name }, category)
      .catch((err) => setErrors({ form: err?.message || "Could not save this contact" }))
      .finally(() => setSaving(false));
  };

  const heading = step === "search" ? "Add to SOI" : step === "category" ? picked?.name || "Category" : "New SOI contact";

  return (
    <div style={overlay} role="dialog" aria-label="Add to SOI">
      <div style={{ flex: "0 0 auto", padding: "14px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, color: T.cream, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{heading}</div>
        <button type="button" onClick={back}
          style={{ flex: "none", background: "none", border: "none", color: T.dim, fontFamily: FF.body, fontSize: 14, cursor: "pointer", padding: "6px 2px" }}>
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
                const already = !!soi[id];
                return (
                  <ResultRow key={id} prospect={p} disabled={already}
                    status={already ? "Already in your SOI" : describeStatus ? describeStatus(id) : null}
                    onTap={() => pick(p)} />
                );
              })
            )}
          </div>

          <div style={{ flex: "0 0 auto", padding: "10px 20px calc(16px + env(safe-area-inset-bottom, 0px))" }}>
            <button type="button" onClick={() => { setStep("form"); setErrors({}); setForm((f) => ({ ...f, name: f.name || query.trim() })); }}
              style={{ ...ghostAction, marginTop: 0 }}>
              Add new contact
            </button>
          </div>
        </>
      ) : step === "category" ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px calc(24px + env(safe-area-inset-bottom, 0px))" }}>
          <div style={{ marginTop: 6, fontSize: 13.5, color: T.dim, fontFamily: FF.body, lineHeight: 1.6 }}>
            {picked?.brokerage ? `${picked.brokerage} · ` : ""}{picked?.phone || ""}
          </div>
          <CategoryPicker value={category} onChange={(v) => { setCategory(v); setErrors({}); }} error={errors.category} />
          <button type="button" onClick={confirmExisting}
            style={{ width: "100%", marginTop: 22, padding: 16, borderRadius: 12, border: "none", background: category ? T.green : T.surface, color: category ? T.cream : T.faint, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: category ? "pointer" : "default" }}>
            Add {picked?.name || "them"} to SOI
          </button>
          <div style={{ fontSize: 12, color: T.faint, marginTop: 12, lineHeight: 1.6 }}>
            Nothing is moved or deleted. Their touch history comes with them, and removing them later drops them back into Follow Ups intact.
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px calc(24px + env(safe-area-inset-bottom, 0px))" }}>
          <Field label="Name" value={form.name} onChange={setField("name")} placeholder="Full name" autoFocus error={errors.name} />
          <Field label="Phone" value={form.phone} onChange={(v) => setField("phone")(formatPhoneInput(v, form.phone))} placeholder="615-555-0142" type="tel" inputMode="tel" error={errors.phone} />
          <Field label="Email" value={form.email} onChange={setField("email")} placeholder="Optional" type="email" inputMode="email" />
          <Field label="Brokerage" value={form.brokerage} onChange={setField("brokerage")} placeholder="Optional" />

          <CategoryPicker value={category} onChange={(v) => { setCategory(v); setErrors((e) => ({ ...e, category: null })); }} error={errors.category} />

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
              {soi[idFromPhone(dupe.phone)] ? (
                <div style={{ fontSize: 12.5, color: T.faint, marginTop: 10 }}>They are already in your SOI.</div>
              ) : (
                <button type="button" onClick={() => pick(dupe)} style={{ ...ghostAction, marginTop: 12 }}>
                  Add {dupe.name} to SOI
                </button>
              )}
            </div>
          )}

          {errors.form && (
            <div style={{ marginTop: 14, fontSize: 13, color: T.redLift, fontFamily: FF.body, lineHeight: 1.5 }}>{errors.form}</div>
          )}

          <button type="button" onClick={submitForm} disabled={saving}
            style={{ width: "100%", marginTop: 20, padding: 16, borderRadius: 12, border: "none", background: saving ? T.surface : T.green, color: saving ? T.faint : T.cream, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
            {saving ? "Saving…" : "Save and add to SOI"}
          </button>
        </div>
      )}
    </div>
  );
}
