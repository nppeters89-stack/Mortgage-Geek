// Per-Deep-Dive footer attribution. Kept intentionally minimal: the
// site-wide SiteFooter (rendered globally in App.jsx) carries the brand
// voice, EHL mark, branch info, and the corporate disclosure block.
// This footer only adds the small "who wrote this" line that anchors
// each Deep Dive page on its own.

import { P, F } from "../theme";
import { LO_NAME, PERSONAL_NMLS, CORPORATE_NMLS, TRADE_NAME } from "../data/compliance";

export function DeepDiveFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${P.creamDark}`, marginTop: 48, paddingTop: 28, paddingBottom: 16, textAlign: "center" }}>
      <p style={{ fontFamily: F.body, fontSize: 12, color: P.warmGrayLight, lineHeight: 1.6, marginBottom: 4 }}>
        {LO_NAME}, NMLS# {PERSONAL_NMLS}
      </p>
      <p style={{ fontFamily: F.body, fontSize: 12, color: P.warmGrayLight, lineHeight: 1.6 }}>
        {TRADE_NAME} · Corporate NMLS# {CORPORATE_NMLS}
      </p>
    </footer>
  );
}
