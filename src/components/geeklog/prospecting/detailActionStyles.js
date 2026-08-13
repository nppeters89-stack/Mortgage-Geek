// Shared button styling for the contact detail actions, so Add to Contacts and
// Add to SOI cannot drift apart. Both are secondary to the Call button, which
// stays the one filled control on the screen.

import { T, FF } from "../gl2Tokens";

// Full-width ghost button. Stacked rather than sat side by side: at 320px these
// labels plus their icons do not fit on one line without clipping.
export const ghostAction = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
  width: "100%", padding: 14,
  background: T.surface, color: T.cream, border: `1px solid ${T.line}`,
  borderRadius: 12, fontFamily: FF.body, fontSize: 15.5, fontWeight: 600,
  cursor: "pointer",
};

// Quiet text button for a destructive-ish action that should be reachable but
// never inviting. No fill, no border, dim until tapped.
export const quietAction = {
  display: "block", margin: "28px auto 0", padding: "10px 14px",
  background: "none", border: "none", color: T.dimmer,
  fontFamily: FF.body, fontSize: 13.5, fontWeight: 500, cursor: "pointer",
};
