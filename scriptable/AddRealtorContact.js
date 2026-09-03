// icon-color: red; icon-glyph: user-plus;
// share-sheet-inputs: file-url, plain-text;
//
// AddRealtorContact  (v2, adds in-app test mode)
// Adds a prospect to iOS Contacts, launched from the Geek Log PWA via:
//   scriptable:///run/AddRealtorContact?contact={urlencoded JSON}
// JSON shape: { "name": "", "phone": "", "email": "", "brokerage": "", "note": "" }
// Also works from the iOS share sheet with a .vcf file or plain text vCard.
// Running it directly inside Scriptable (no input) offers a test contact.

async function main() {
  let data = null;

  // Path 1: deep link with query parameters
  if (args.queryParameters && args.queryParameters.contact) {
    try {
      data = JSON.parse(args.queryParameters.contact);
    } catch (e) {
      await fail("Could not read contact data from the link.");
      return;
    }
  }

  // Path 2: share sheet with a vCard file
  if (!data && args.fileURLs && args.fileURLs.length > 0) {
    const fm = FileManager.local();
    const text = fm.readString(args.fileURLs[0]);
    data = parseVCard(text);
  }

  // Path 3: share sheet with plain text vCard
  if (!data && args.plainTexts && args.plainTexts.length > 0) {
    data = parseVCard(args.plainTexts[0]);
  }

  // Path 4: run directly in the Scriptable app with no input -> test mode
  if (!data && config.runsInApp) {
    const t = new Alert();
    t.title = "Test mode";
    t.message = "No contact data was passed in. Create a test contact to verify permissions and the creation flow?";
    t.addAction("Create test contact");
    t.addCancelAction("Cancel");
    const choice = await t.present();
    if (choice === -1) {
      return;
    }
    data = {
      name: "Geek Log Test",
      phone: "6155551234",
      email: "test@mortgagegeek.ai",
      brokerage: "Test Brokerage",
      note: "Test contact created by AddRealtorContact. Safe to delete."
    };
  }

  if (!data || !data.name || !data.phone) {
    await fail("No contact data found. Launch this from the Geek Log Add to Contacts button, or run it inside Scriptable for test mode.");
    return;
  }

  const digits = String(data.phone).replace(/[^0-9]/g, "");
  const dialable = digits.length === 10 ? "+1" + digits : "+" + digits;

  // Duplicate check by phone digits
  const container = await ContactsContainer.default();
  const existing = await Contact.all([container]);
  const dupe = existing.find(c =>
    (c.phoneNumbers || []).some(p => String(p.value || "").replace(/[^0-9]/g, "").endsWith(digits))
  );
  if (dupe) {
    await notify("Already in Contacts", data.name + " matches an existing contact.");
    return;
  }

  const c = new Contact();
  const parts = String(data.name).trim().split(/\s+/);
  c.familyName = parts.length > 1 ? parts.pop() : "";
  c.givenName = parts.join(" ");
  c.phoneNumbers = [{ label: "mobile", value: dialable }];
  if (data.email) c.emailAddresses = [{ label: "work", value: data.email }];
  if (data.brokerage) c.organizationName = data.brokerage;
  if (data.note) c.note = data.note;

  Contact.add(c, container.identifier);
  await Contact.persistChanges();
  await notify("Contact added", data.name + (data.brokerage ? " · " + data.brokerage : ""));
}

// ---------- helpers ----------

function parseVCard(text) {
  if (!text || text.indexOf("BEGIN:VCARD") === -1) return null;
  const out = { name: "", phone: "", email: "", brokerage: "", note: "" };
  const unesc = s => s.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
  for (const raw of text.split(/\r?\n/)) {
    const i = raw.indexOf(":");
    if (i === -1) continue;
    const key = raw.slice(0, i).split(";")[0].toUpperCase();
    const val = raw.slice(i + 1).trim();
    if (key === "FN") out.name = unesc(val);
    else if (key === "TEL" && !out.phone) out.phone = val;
    else if (key === "EMAIL" && !out.email) out.email = unesc(val);
    else if (key === "ORG") out.brokerage = unesc(val);
    else if (key === "NOTE") out.note = unesc(val);
  }
  return out.name && out.phone ? out : null;
}

async function notify(title, body) {
  const n = new Notification();
  n.title = title;
  n.body = body;
  await n.schedule();
}

async function fail(msg) {
  const a = new Alert();
  a.message = msg;
  a.title = "Add Contact";
  a.addAction("OK");
  await a.present();
}

await main();
Script.complete();
