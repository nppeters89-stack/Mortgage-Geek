import { T, FF } from "../gl2Tokens";

// Reply marker for cards with any inbound reply in history: speech bubble,
// reply count, and the age of the newest reply. Accent green while the reply
// is newer than the last outbound touch (a response is owed), muted once the
// contact has been touched since. Sits as a flex-none sibling in the same row
// as the fire flag so it can never overlap the name or brokerage text.
export function ReplyBadge({ count, days = null, owed = false }) {
  if (!count) return null;
  const c = owed ? T.greenBright : T.dimmer;
  return (
    <span title={owed ? "They replied. A response is owed." : "Replied earlier, touched since"}
      style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 3, fontFamily: FF.body, fontSize: 10.5, fontWeight: 700, color: c, fontVariantNumeric: "tabular-nums" }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {count}{days == null ? "" : ` · ${days}d`}
    </span>
  );
}
