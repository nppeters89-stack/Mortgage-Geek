import { buildVCard, vcardFilename } from "./vcard";
import { ghostAction } from "./detailActionStyles";

// "Add to Contacts": hands a .vcf to the OS so iOS opens its native Create New
// Contact screen. Share-first because that is the only path that works from the
// installed standalone PWA, where there is no Safari download UI to fall back on;
// the blob anchor covers desktop and any browser without file share support.
//
// Self-contained on purpose: it takes a prospect and a toast callback, so dropping
// it into the Prospecting detail later is one line. Currently Follow Ups only.
export function AddToContactsButton({ prospect, onToast }) {
  const handleClick = async () => {
    let file;
    try {
      const vcard = buildVCard(prospect);
      file = new File([vcard], vcardFilename(prospect?.name), { type: "text/vcard" });
    } catch {
      onToast?.("Could not create contact card");
      return;
    }

    // Must stay inside the tap handler: iOS requires the user gesture for share.
    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file] });
        onToast?.("Contact card ready");
      } catch (err) {
        // Dismissing the share sheet is a normal outcome, not a failure.
        if (err?.name !== "AbortError") onToast?.("Could not create contact card");
      }
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
