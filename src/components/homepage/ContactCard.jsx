import { useEffect, useRef, useState, useCallback } from "react";
import { P, F } from "../../theme";
import { LO_NAME, LO_TITLE, LO_PHONE, LO_EMAIL, PERSONAL_NMLS } from "../../data/compliance";

// "Contact Nick" trigger + an accessible contact-card dialog. Built with React
// state (no popover library). Reuses the LO phone/email from compliance.js — no
// new contact values. Renders as a centered modal with a dimmed backdrop, which
// guarantees no overflow at 375px and gives clean Escape/outside-click/focus
// behavior. The trigger stays in flow so the hero has no layout shift when closed.
const telDigits = LO_PHONE.replace(/\D/g, "");           // "6156560737"
const TEL = `tel:+1${telDigits}`;
const SMS = `sms:+1${telDigits}`;
const MAILTO = `mailto:${LO_EMAIL}`;

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

const ROWS = [
  { key: "call", label: "Call", value: LO_PHONE, href: TEL, Icon: PhoneIcon },
  { key: "text", label: "Text", value: LO_PHONE, href: SMS, Icon: TextIcon },
  { key: "email", label: "Email", value: LO_EMAIL, href: MAILTO, Icon: MailIcon },
];

export function ContactCard({ triggerStyle }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  // On close, return focus to the trigger. On open, move focus into the dialog.
  useEffect(() => {
    if (open) {
      const node = dialogRef.current;
      if (node) {
        const first = node.querySelector("a, button");
        (first || node).focus();
      }
    } else if (triggerRef.current && document.activeElement === document.body) {
      triggerRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        // Simple focus trap: keep Tab within the dialog.
        const node = dialogRef.current;
        if (!node) return;
        const focusables = node.querySelectorAll('a[href], button:not([disabled])');
        if (!focusables.length) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleTrigger = () => {
    setOpen((v) => !v);
  };
  const handleRowClick = () => {
    // Selecting a row fires its link, then closes the card.
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTrigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "14px 24px", borderRadius: 10,
          background: P.gold, color: "#fff", border: "none",
          fontFamily: F.body, fontSize: 15, fontWeight: 600,
          textDecoration: "none", letterSpacing: 0.3, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(207,51,56,0.3)",
          minHeight: 44,
          ...triggerStyle,
        }}
      >
        <PhoneIcon />
        Contact Nick
      </button>

      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Contact ${LO_NAME}`}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 360,
              background: P.white, color: P.text,
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              outline: "none",
            }}
          >
            {/* Identity header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 22px 18px", borderBottom: `1px solid ${P.creamDark}` }}>
              <img src="/avatar-96.webp" alt="" aria-hidden="true" width={56} height={56} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${P.creamDark}` }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: P.navy, lineHeight: 1.1 }}>{LO_NAME}</div>
                <div style={{ fontFamily: F.body, fontSize: 13, color: P.warmGray, marginTop: 3 }}>{LO_TITLE}</div>
                <div style={{ fontFamily: F.body, fontSize: 12, color: P.warmGrayLight, marginTop: 2 }}>NMLS #{PERSONAL_NMLS}</div>
              </div>
            </div>

            {/* Contact rows */}
            <div>
              {ROWS.map((r, i) => (
                <a
                  key={r.key}
                  href={r.href}
                  onClick={handleRowClick}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    minHeight: 56, padding: "12px 22px",
                    textDecoration: "none", color: P.navy,
                    borderTop: i === 0 ? "none" : `1px solid ${P.cream}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = P.cream)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: `${P.gold}14`, color: P.gold, flexShrink: 0 }}>
                    <r.Icon />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: F.body, fontSize: 14, fontWeight: 600, color: P.navy }}>{r.label}</span>
                    <span style={{ display: "block", fontFamily: F.body, fontSize: 13, color: P.warmGray, wordBreak: "break-word" }}>{r.value}</span>
                  </span>
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
              style={{
                width: "100%", minHeight: 48, border: "none", borderTop: `1px solid ${P.creamDark}`,
                background: "transparent", color: P.warmGray,
                fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
