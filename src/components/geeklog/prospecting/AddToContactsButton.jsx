import { buildVCard, vcardFilename } from "./vcard";
import { ghostAction } from "./detailActionStyles";

// "Add to Contacts": on iOS this deep-links into Nick's installed Scriptable
// script (AddRealtorContact), which creates the contact natively through
// Scriptable's Contacts API and shows its own confirmation banner. One tap, no
// share sheet: the Web Share path could not target Contacts directly on iOS and
// forced a save-to-Files detour. The compact contact JSON travels in the URL, so
// the intel dossier is deliberately NOT included (some are multi-KB). Off iOS the
// blob-anchor .vcf download stays as the fallback for desktop testing, which is
// why buildVCard remains.
//
// Self-contained on purpose: it takes a prospect and a toast callback, so
// dropping it into another detail view later is one line. Currently Follow Ups.
const IS_IOS = typeof navigator !== "undefined" && /iPhone|iPad/.test(navigator.userAgent);

export function AddToContactsButton({ prospect, onToast }) {
  const handleClick = () => {
    // iOS: hand the contact to Scriptable and let it create + confirm. Assigning
    // a custom-scheme URL is a real browser navigation, so React Router does not
    // intercept it; the OS switches to Scriptable. Fire and forget, no toast
    // (the script owns the confirmation banner).
    if (IS_IOS) {
      const buysides = prospect?.buysides;
      const payload = {
        name: prospect?.name,
        phone: prospect?.phone,
        email: prospect?.email || "",
        brokerage: prospect?.brokerage || "",
        note: "Realtor prospect via Mortgage Geek." + (buysides ? " " + buysides + " buysides 12m." : ""),
      };
      window.location.href =
        "scriptable:///run/AddRealtorContact?contact=" +
        encodeURIComponent(JSON.stringify(payload));
      return;
    }

    // Fallback (non-iOS): download the .vcf, unchanged, for desktop testing.
    let file;
    try {
      const vcard = buildVCard(prospect);
      file = new File([vcard], vcardFilename(prospect?.name), { type: "text/vcard" });
    } catch {
      onToast?.("Could not create contact card");
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onToast?.("Contact card downloaded");
    } catch {
      onToast?.("Could not create contact card");
    }
  };

  return (
    <button type="button" onClick={handleClick} style={{ ...ghostAction, marginTop: 10 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
      Add to Contacts
    </button>
  );
}
