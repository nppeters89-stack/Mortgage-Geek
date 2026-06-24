import { useEffect, useRef, useState } from "react";
import { P, F, HOME } from "../../theme";
import { LO_NAME, LO_TITLE, LO_PHONE, LO_EMAIL, PERSONAL_NMLS } from "../../data/compliance";

// "Contact Nick" trigger + an accessible contact-card dialog. Built with React
// state (no popover lib). Reuses the LO phone/email from compliance.js — no new
// contact values. Renders as a centered modal with a dimmed backdrop, so it
// never overflows at 375px and gives clean Escape/outside-click/focus behavior.
// The trigger stays in flow → no hero layout shift when closed.
const telDigits = LO_PHONE.replace(/\D/g, "");
const TEL = `tel:+1${telDigits}`;
const SMS = `sms:+1${telDigits}`;
const MAILTO = `mailto:${LO_EMAIL}`;

function PhoneIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
}
function TextIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
}
function MailIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
}

const ROWS = [
  { key: "call", label: "Call", value: LO_PHONE, href: TEL, Icon: PhoneIcon },
  { key: "text", label: "Text", value: LO_PHONE, href: SMS, Icon: TextIcon },
  { key: "email", label: "Email", value: LO_EMAIL, href: MAILTO, Icon: MailIcon },
];

export function ContactCard({ triggerLabel = "Contact Nick", triggerClassName, triggerStyle }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      const node = dialogRef.current;
      if (node) { const first = node.querySelector("a, button"); (first || node).focus(); }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); triggerRef.current?.focus(); return; }
      if (e.key === "Tab") {
        const node = dialogRef.current; if (!node) return;
        const f = node.querySelectorAll('a[href], button:not([disabled])'); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const closeAndRefocus = () => { setOpen(false); triggerRef.current?.focus(); };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={triggerClassName ? triggerStyle : {
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "15px 26px", borderRadius: 10, minHeight: 44, boxSizing: "border-box",
          background: HOME.red, color: "#fff", border: "none",
          fontFamily: F.sans, fontSize: 16, fontWeight: 700, cursor: "pointer", ...triggerStyle,
        }}
      >
        {triggerLabel}
      </button>

      {open && (
        <div onClick={closeAndRefocus} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Contact ${LO_NAME}`}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 360, background: HOME.white, color: P.text, borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", outline: "none", fontFamily: F.sans }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 22px 18px", borderBottom: `1px solid ${HOME.borderCard}` }}>
              <img src="/avatar-96.webp" alt="" aria-hidden="true" width={56} height={56} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${HOME.borderCard}` }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: HOME.ink, lineHeight: 1.15 }}>{LO_NAME}</div>
                <div style={{ fontSize: 13, color: HOME.textSecondary, marginTop: 3 }}>{LO_TITLE}</div>
                <div style={{ fontSize: 12, color: HOME.textMuted, marginTop: 2 }}>NMLS #{PERSONAL_NMLS}</div>
              </div>
            </div>
            <div>
              {ROWS.map((r, i) => (
                <a
                  key={r.key}
                  href={r.href}
                  onClick={closeAndRefocus}
                  style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 56, padding: "12px 22px", textDecoration: "none", color: HOME.ink, borderTop: i === 0 ? "none" : `1px solid ${HOME.borderHairline}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = HOME.cream)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: `${HOME.red}14`, color: HOME.red, flexShrink: 0 }}><r.Icon /></span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: HOME.ink }}>{r.label}</span>
                    <span style={{ display: "block", fontSize: 13, color: HOME.textSecondary, wordBreak: "break-word" }}>{r.value}</span>
                  </span>
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={closeAndRefocus}
              style={{ width: "100%", minHeight: 48, border: "none", borderTop: `1px solid ${HOME.borderCard}`, background: "transparent", color: HOME.textSecondary, fontFamily: F.sans, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
