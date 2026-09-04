// Geek Log widget for Scriptable
// Shows this week's total conversations, big and bold.
// Supports home screen (small) and lock screen (circular, rectangular, inline).
//
// ---- One-time setup ----
// The widget authenticates with a device token stored in the Scriptable
// Keychain. Run this three-line script once in Scriptable, then delete it:
//
//   Keychain.set("geeklog-device-token", "PASTE_DEVICE_TOKEN_HERE");
//   console.log("stored");
//   Script.complete();
//
// The token value is GEEKLOG_DEVICE_TOKEN from the Vercel project env. This
// file is the source of truth for the device-token allowlist: the token may
// call GET /api/geeklog/activity and nothing else.

const API_URL = "https://mortgagegeek.ai/api/geeklog/activity";
const TOKEN_KEY = "geeklog-device-token";

// Conversations sub-categories. This MUST match the server's
// sumConversations: pastClient + lead + inProcess + prospecting + currentSoi.
const CONV_KEYS = ["pastClient", "lead", "inProcess", "prospecting", "currentSoi"];
const CACHE_KEY = "geeklog-widget-cache";

// Brand colors
const BG_TOP = new Color("#24272A");
const BG_BOTTOM = new Color("#131416");
const CREAM = new Color("#FFFEFB");
const DIM = new Color("#FFFEFB", 0.56);
const DIMMER = new Color("#FFFEFB", 0.32);
const GREEN = new Color("#2FBF71");
const GREEN_BRIGHT = new Color("#63E6A0");

async function fetchWeek() {
  if (!Keychain.contains(TOKEN_KEY)) {
    if (config.runsInApp) {
      const a = new Alert();
      a.title = "Geek Log setup";
      a.message = "No device token stored. Run the setup snippet from the comment at the top of this script, then run the widget again.";
      a.addAction("OK");
      await a.present();
    }
    throw new Error("no device token");
  }
  const req = new Request(API_URL);
  req.headers = { "Authorization": "Bearer " + Keychain.get(TOKEN_KEY) };
  req.timeoutInterval = 10;
  return await req.loadJSON();
}

function sumConversations(data) {
  let total = 0;
  for (const day of data.days || []) {
    for (const k of CONV_KEYS) total += Number(day[k]) || 0;
  }
  return total;
}

async function getStats() {
  try {
    const data = await fetchWeek();
    const stats = {
      conv: sumConversations(data),
      target: Number(data.weeklyTarget) || 50,
      stale: false,
    };
    Keychain.set(CACHE_KEY, JSON.stringify(stats));
    return stats;
  } catch (e) {
    // Offline or API hiccup: show last known number, marked stale.
    if (Keychain.contains(CACHE_KEY)) {
      const cached = JSON.parse(Keychain.get(CACHE_KEY));
      return { ...cached, stale: true };
    }
    return { conv: null, target: 50, stale: true };
  }
}

function numberColor(conv, target) {
  if (conv === null) return DIMMER;
  return conv >= target ? GREEN_BRIGHT : CREAM;
}

function display(conv) {
  return conv === null ? "--" : String(conv);
}

function buildSmall(stats) {
  const w = new ListWidget();
  const grad = new LinearGradient();
  grad.colors = [BG_TOP, BG_BOTTOM];
  grad.locations = [0, 1];
  w.backgroundGradient = grad;
  w.setPadding(14, 16, 14, 16);

  const label = w.addText("CONVERSATIONS");
  label.font = Font.semiboldSystemFont(10);
  label.textColor = stats.conv !== null && stats.conv > 0 ? GREEN : DIM;
  label.minimumScaleFactor = 0.8;

  w.addSpacer();

  const num = w.addText(display(stats.conv));
  num.font = Font.boldSystemFont(54);
  num.textColor = numberColor(stats.conv, stats.target);
  num.minimumScaleFactor = 0.5;
  num.lineLimit = 1;

  w.addSpacer();

  const sub = w.addText(
    stats.conv !== null && stats.conv >= stats.target
      ? "Target cleared"
      : "of " + stats.target + " this week" + (stats.stale ? " (offline)" : "")
  );
  sub.font = Font.mediumSystemFont(11);
  sub.textColor = DIMMER;
  sub.minimumScaleFactor = 0.8;

  return w;
}

function buildAccessoryRectangular(stats) {
  // Lock screen rectangle: number left, label right.
  const w = new ListWidget();
  const row = w.addStack();
  row.centerAlignContent();

  const num = row.addText(display(stats.conv));
  num.font = Font.boldSystemFont(32);
  num.minimumScaleFactor = 0.6;

  row.addSpacer(8);

  const col = row.addStack();
  col.layoutVertically();
  const l1 = col.addText("CONV");
  l1.font = Font.semiboldSystemFont(11);
  const l2 = col.addText("of " + stats.target);
  l2.font = Font.mediumSystemFont(11);

  return w;
}

function buildAccessoryCircular(stats) {
  // Lock screen circle: progress ring style via text only (keep it simple).
  const w = new ListWidget();
  w.addSpacer();
  const num = w.addText(display(stats.conv));
  num.font = Font.boldSystemFont(20);
  num.centerAlignText();
  num.minimumScaleFactor = 0.5;
  const sub = w.addText("/" + stats.target);
  sub.font = Font.mediumSystemFont(9);
  sub.centerAlignText();
  w.addSpacer();
  return w;
}

function buildAccessoryInline(stats) {
  const w = new ListWidget();
  w.addText("Conversations " + display(stats.conv) + " / " + stats.target);
  return w;
}

const stats = await getStats();

let widget;
switch (config.widgetFamily) {
  case "accessoryRectangular":
    widget = buildAccessoryRectangular(stats);
    break;
  case "accessoryCircular":
    widget = buildAccessoryCircular(stats);
    break;
  case "accessoryInline":
    widget = buildAccessoryInline(stats);
    break;
  default:
    widget = buildSmall(stats);
}

// Tapping the widget opens the Geek Log.
widget.url = "https://mortgagegeek.ai/geek-log";

// Ask iOS to refresh in about 15 minutes. iOS decides the real cadence.
widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentSmall();
}
Script.complete();
