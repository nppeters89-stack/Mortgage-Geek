import { idFromPhone, buildSmsUrl, e164Phone } from "./prospectsModel";
import { templateForStage, fill } from "./textTemplates";

// Pending text intent: written when the Text button fires, read when the app
// regains focus so the Sent it chip can offer a one-tap log. The app cannot
// know whether the text was actually sent, so nothing is ever logged
// optimistically. localStorage to match the rest of the Geek Log's storage;
// the TTL keeps a stale intent from resurfacing days later.

const KEY = "gl2:textintent";
const TTL_MS = 30 * 60 * 1000;

export function readTextIntent() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!v || typeof v !== "object" || !v.contactId) return null;
    if (!Number.isFinite(v.ts) || Date.now() - v.ts > TTL_MS) { clearTextIntent(); return null; }
    return v;
  } catch { return null; }
}

export function clearTextIntent() {
  try { localStorage.removeItem(KEY); } catch { /* best-effort */ }
}

// Fire a text: fill the stage-appropriate template, write the intent (a new
// tap overwrites any older one), then either navigate to sms: (touch devices)
// or hand back the body for a clipboard copy (desktop). Returns { ok: false }
// when the number cannot normalize, so callers can disable the button.
export function startText({ prospect, stage = 0, cold = false, prospectingTab = false, hook = "", ns = "agent" }) {
  const body = fill(templateForStage(stage, { prospectingTab, cold }), { ...prospect, hook });
  const url = buildSmsUrl(prospect.phone, body);
  if (!url) return { ok: false };
  try {
    localStorage.setItem(KEY, JSON.stringify({ contactId: idFromPhone(prospect.phone), stage, ts: Date.now(), ns }));
  } catch { /* best-effort */ }
  const touchDevice = typeof navigator !== "undefined" && (navigator.maxTouchPoints > 0 || "ontouchstart" in window);
  if (touchDevice) {
    window.location.href = url;
    return { ok: true, mode: "sms" };
  }
  return { ok: true, mode: "copy", body, number: e164Phone(prospect.phone) };
}
