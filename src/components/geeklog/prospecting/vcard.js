// vCard 3.0 builder for the "Add to Contacts" hand-off. Pure: no React, no I/O,
// no network. iOS gives web apps no contact-write API, so the only route into the
// native address book is handing the OS a .vcf and letting it open its own
// "Create New Contact" screen. This file is just the text format.

// RFC 2426 value escaping: backslash first (so we don't double-escape the ones we
// add), then the separators, then real newlines to the literal \n sequence.
function esc(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r\n|\r|\n/g, "\\n");
}

// Last whitespace-separated token is the family name, everything before it is the
// given name. A single-token name goes in the given slot with family empty, which
// is what iOS wants for "Cher" or a team name.
export function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { given: "", family: "" };
  if (parts.length === 1) return { given: parts[0], family: "" };
  return { given: parts.slice(0, -1).join(" "), family: parts[parts.length - 1] };
}

// E.164 where we can infer it: a bare 10-digit US number gets +1, an 11-digit
// number already starting with 1 gets the plus. Anything else passes through as
// its digits so we never mangle a number we don't understand.
export function telValue(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits;
}

// Filename for the share sheet / download. Letters, digits, spaces and hyphens
// survive; everything else collapses out so iOS doesn't reject the attachment.
export function vcardFilename(name) {
  const safe = String(name || "").replace(/[^A-Za-z0-9 -]/g, "").replace(/\s+/g, " ").trim();
  return `${safe || "Contact"}.vcf`;
}

// Build the card. ORG and EMAIL are omitted entirely when empty rather than
// emitted blank, because a blank property shows up as an empty field in the iOS
// create-contact screen. CRLF endings per spec.
export function buildVCard(contact) {
  const { name, phone, email, brokerage, buysides } = contact || {};
  const { given, family } = splitName(name);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(family)};${esc(given)};;;`,
    `FN:${esc(String(name || "").trim())}`,
  ];

  if (brokerage) lines.push(`ORG:${esc(brokerage)}`);
  lines.push(`TEL;TYPE=CELL:${telValue(phone)}`);
  if (email) lines.push(`EMAIL:${esc(email)}`);
  lines.push(`NOTE:${esc(`Realtor prospect via Mortgage Geek. ${buysides ?? 0} buysides 12m.`)}`);
  lines.push("END:VCARD");

  return `${lines.join("\r\n")}\r\n`;
}
