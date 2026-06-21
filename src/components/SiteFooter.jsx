// Global site footer with all required lender compliance disclosures.
// Rendered once in App.jsx beneath the routed page content so it appears
// on every route.
//
// Three zones, separated by 1px P.creamDark dividers:
//   Zone 1 — Brand voice (Mortgage Geek heading, tagline, educational
//            disclaimer)
//   Zone 2 — Attribution (LO + branch/licensing in two columns on
//            desktop, stacked on mobile). The right column opens with
//            the Rate wordmark image followed by the corporate NMLS.
//   Zone 3 — Verbatim corporate disclosure
//
// All compliance copy and contact data is sourced from
// `data/compliance.js` (single source of truth). All colors and fonts
// come from `theme.js` (no hardcoded hex values). Consumes EHLLogo as
// a black-box component for the Equal Housing Lender mark.

import { P, F } from "../theme";
import { useIsMobile } from "../utils/hooks";
import { EHLLogo } from "./EHLLogo";
import {
  PERSONAL_NMLS,
  CORPORATE_NMLS,
  LO_NAME,
  LO_TITLE,
  LO_PHONE,
  LO_EMAIL,
  LO_WEBSITE,
  BRANCH_PHONE,
  BRANCH_ADDRESS,
  TRADE_NAME,
  NMLS_CONSUMER_ACCESS_URL,
  LICENSING_URL,
  CORPORATE_DISCLOSURE,
} from "../data/compliance";

// Phone display string normalized to a tel: href ("(615) 656-0737" → "6156560737").
const telHref = (display) => `tel:${display.replace(/\D/g, "")}`;

// The verbatim corporate disclosure embeds four URLs inline (rate.com,
// nmlsconsumeraccess.org, rate.com/licensing, rate.com/privacy). Walk
// the string left-to-right wrapping each occurrence in an anchor while
// preserving every other character. Order matters: matching "rate.com"
// before the www-prefixed variants ensures it doesn't get re-matched as
// a substring of "www.rate.com/licensing".
function renderDisclosure() {
  const links = [
    { text: "rate.com", href: "https://www.rate.com" },
    { text: "www.nmlsconsumeraccess.org", href: "https://www.nmlsconsumeraccess.org/" },
    { text: "www.rate.com/licensing", href: "https://www.rate.com/licensing" },
    { text: "www.rate.com/privacy", href: "https://www.rate.com/privacy" },
  ];
  const parts = [];
  let cursor = 0;
  links.forEach(({ text, href }, i) => {
    const idx = CORPORATE_DISCLOSURE.indexOf(text, cursor);
    if (idx === -1) return;
    parts.push(CORPORATE_DISCLOSURE.slice(cursor, idx));
    parts.push(
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mg-footer-link"
        style={{ color: P.warmGray, textDecoration: "underline" }}
      >
        {text}
      </a>
    );
    cursor = idx + text.length;
  });
  parts.push(CORPORATE_DISCLOSURE.slice(cursor));
  return <>{parts}</>;
}

// Shared style for inline link anchors (phone, email, licensing).
const inlineLinkStyle = {
  color: P.navy,
  fontWeight: 500,
  textDecoration: "none",
};

// Section heading style ("BRANCH OFFICE", "LICENSING").
const sectionHeadingStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: P.navy,
  marginBottom: 8,
};

// Divider rule between zones.
const dividerStyle = {
  border: 0,
  borderTop: `1px solid ${P.creamDark}`,
  margin: "28px 0",
};

// Per-route layout knobs. Each entry mirrors the page-content wrapper of
// that route family so the footer's left/right gutters land on the same
// vertical guide as the body content above.
//
//   home     → Homepage Page primitive (maxW 1180) + each <section>
//              applies an extra 40px horizontal pad on top, so the
//              footer's padding has to absorb both layers.
//   tool     → calc / prequal / compare / cash-to-close use
//              tool-page-content with maxW 1100 + 24px horizontal.
//              Columns are centered to balance the wider canvas.
//   deepdive → Deep Dive articles use <article> at maxW 860 +
//              24px horizontal.
const FOOTER_LAYOUTS = {
  home:     { maxWidth: 1180, paddingX: "clamp(60px, calc(4vw + 40px), 96px)", centerColumns: false },
  tool:     { maxWidth: 1100, paddingX: 24,                                     centerColumns: true  },
  deepdive: { maxWidth: 860,  paddingX: 24,                                     centerColumns: false },
};

export function SiteFooter({ hasSidebar = false, layout = "home" }) {
  const isMobile = useIsMobile(768);
  const L = FOOTER_LAYOUTS[layout] || FOOTER_LAYOUTS.home;

  // Mobile keeps the two columns side-by-side instead of stacking, but
  // the column content has to shrink to fit. fs/sz pick the desktop
  // value at >768px and the mobile value at <=768px. Mobile padding
  // overrides the layout's default to free up enough horizontal room
  // for two columns at 375px viewport.
  const fs = (desktop, mobile) => (isMobile ? mobile : desktop);
  const sz = (desktop, mobile) => (isMobile ? mobile : desktop);
  const innerPaddingX = isMobile ? 20 : L.paddingX;
  const columnGap = isMobile ? 16 : 100;

  return (
    <footer
      className={hasSidebar ? "mg-site-footer mg-site-footer--shifted" : "mg-site-footer"}
      style={{
        background: P.cream,
        borderTop: `1px solid ${P.creamDark}`,
        // No `width: 100%` here. With `margin-left: 280px` on the
        // homepage, width:100% would force the footer to overflow the
        // viewport by 280px on the right. Block-level <footer> defaults
        // to "available width minus margin", which is what we want.

        // Stack above the homepage's fixed sidebar (z-index 100 at
        // <=900px, 150 at >900px). .main-content uses position:relative
        // + z-index:130 so its cream background covers the sidebar at
        // mobile widths; the footer sits OUTSIDE .main-content, so it
        // needs the same trick on its own. 130 is high enough to cover
        // the mobile sidebar (100) and harmless at desktop where the
        // footer is shifted 280px and never overlaps the sidebar.
        position: "relative",
        zIndex: 130,
      }}
    >
      {/* Hover treatment for inline footer links + the homepage sidebar
          offset. .main-content uses 280px margin-left at >900px and 0
          on mobile; the footer mirrors the same behavior when its
          parent (App.jsx) flags hasSidebar. */}
      <style>{`
        .mg-footer-link:hover { text-decoration: underline; }
        .mg-site-footer--shifted { margin-left: 280px; }
        @media (max-width: 900px) {
          .mg-site-footer--shifted { margin-left: 0; }
          /* When MainSite opens the mobile sidebar drawer, .main-content
             gets transform: translateX(280px) to reveal it. The footer
             is OUTSIDE .main-content, so it has to slide in lockstep on
             its own — otherwise the page slab above slides over but the
             footer stays put, leaving an obvious seam. Match the same
             timing (.3s ease) as .main-content's transform.

             touch-action: pan-y mirrors .main-content. Without it, iOS
             treats a horizontal drag starting over the footer as a
             native back-swipe gesture and adds its own translation on
             top of our JS transform, so the footer races ahead of
             .main-content during the drag — visible as a speed mismatch
             and a seam at the footer's top edge. */
          .mg-site-footer { transition: transform 0.3s ease; will-change: transform; touch-action: pan-y; }
          html.sidebar-locked .mg-site-footer { transform: translateX(280px); --sidebar-dim: 1; }
          /* Mirror .main-content-open's dim overlay so the entire page
             slab — main-content + footer — darkens uniformly. Opacity
             tracks --sidebar-dim (set inline by the swipe handler frame
             by frame, and to 1 by the rule above when fully open) so
             the footer dims at exactly the same rate as .main-content
             during the drag — otherwise the page slab darkens
             progressively while the footer stays bright, leaving a
             visible horizontal seam at the boundary. */
          .mg-site-footer::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            opacity: var(--sidebar-dim, 0);
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 9999;
          }
          html.sidebar-locked .mg-site-footer::after {
            pointer-events: auto;
          }
        }
      `}</style>

      <div
        style={{
          // Page-equivalent inner container. Width + horizontal padding
          // come from FOOTER_LAYOUTS so the footer's content edges land
          // on the same vertical guide as the page-content wrapper above.
          maxWidth: L.maxWidth,
          margin: "0 auto",
          paddingLeft: innerPaddingX,
          paddingRight: innerPaddingX,
          paddingTop: isMobile ? 32 : 48,
          paddingBottom: isMobile ? 32 : 48,
          boxSizing: "border-box",
        }}
      >
        {/* ----------------- ZONE 2 — Attribution -----------------
            Flex row with wrap: each column sizes to its own content
            and the pair sits left-aligned at the inner container's
            left edge, matching the disclaimer paragraphs below them.
            On narrow widths flex-wrap drops the second column under
            the first. */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: columnGap,
            // Tool layouts center the columns on desktop to balance the
            // wider canvas. On mobile, columns scale down to fit
            // side-by-side and left-align reads cleaner.
            justifyContent: L.centerColumns && !isMobile ? "center" : "flex-start",
          }}
        >
          {/* LEFT — Brand voice + LO + contact + EHL.
              On mobile: flex 1 1 0 + minWidth 0 makes the column take
              an equal share of the available width and lets text wrap
              instead of forcing the row to overflow.
              On desktop: default content-width sizing. */}
          <div style={{ flex: isMobile ? "1 1 0" : undefined, minWidth: 0 }}>
            {/* Brand voice anchors the column. The lender attribution
                block lives at the top of the right column, above Branch
                Office. */}
            <h2
              aria-label="The Mortgage Geek"
              style={{
                fontFamily: F.display,
                fontWeight: 400,
                fontSize: fs(22, 18),
                color: P.navy,
                margin: 0,
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <span>The Mortgage Geek</span>
              <img src="/mg-mark-sm.svg" alt="" aria-hidden="true" width={18} height={22} style={{ alignSelf: "center", display: "block" }} />
            </h2>
            <p
              style={{
                fontFamily: F.display,
                fontStyle: "italic",
                fontSize: fs(14, 12),
                color: P.gold,
                margin: "2px 0 0",
              }}
            >
              Mortgages Demystified.
            </p>

            {/* Loan officer name */}
            <p
              style={{
                fontFamily: F.body,
                fontSize: fs(14, 13),
                fontWeight: 500,
                color: P.navy,
                margin: "14px 0 0",
              }}
            >
              {LO_NAME}
            </p>
            <p
              style={{
                fontFamily: F.body,
                fontSize: fs(13, 11),
                color: P.warmGray,
                margin: "2px 0 0",
              }}
            >
              NMLS #{PERSONAL_NMLS}
              <br />
              {LO_TITLE}
            </p>

            {/* Direct contact */}
            <p
              style={{
                fontFamily: F.body,
                fontSize: fs(13, 11),
                color: P.warmGray,
                margin: "12px 0 0",
                lineHeight: 1.85,
                wordBreak: "break-word",
              }}
            >
              Direct:{" "}
              <a href={telHref(LO_PHONE)} className="mg-footer-link" style={inlineLinkStyle}>
                {LO_PHONE}
              </a>
              <br />
              <a href={`mailto:${LO_EMAIL}`} className="mg-footer-link" style={inlineLinkStyle}>
                {LO_EMAIL}
              </a>
              {LO_WEBSITE && (
                <>
                  <br />
                  {/* Display strips protocol + trailing slash for a cleaner read;
                      href keeps the canonical URL from compliance.js. */}
                  <a
                    href={LO_WEBSITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mg-footer-link"
                    style={inlineLinkStyle}
                  >
                    {LO_WEBSITE.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </>
              )}
            </p>

            {/* Equal Housing Lender row */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <EHLLogo size={sz(14, 12)} color={P.navy} />
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: fs(12, 11),
                  color: P.warmGray,
                  letterSpacing: 0.3,
                }}
              >
                Equal Housing Lender
              </span>
            </div>
          </div>

          {/* RIGHT — Lender + Branch office + licensing. Mobile-flex
              treatment matches the LEFT column. */}
          <div style={{ flex: isMobile ? "1 1 0" : undefined, minWidth: 0 }}>
            {/* Rate wordmark + corporate NMLS, sitting above Branch
                Office so the corporate identity anchors the right
                column. Logo height is the live tuning knob — width is
                auto so the 2.5:1 wordmark scales proportionally. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: isMobile ? 16 : 24, minWidth: 0, alignItems: "flex-start" }}>
              <img
                src="/rate-logo.png"
                alt={TRADE_NAME}
                style={{ height: fs(28, 22), width: "auto", display: "block" }}
              />
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: fs(11, 10),
                  fontWeight: 500,
                  color: P.warmGrayLight,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Corporate NMLS #{CORPORATE_NMLS}
              </span>
            </div>

            <h3 style={{ ...sectionHeadingStyle, fontSize: fs(11, 10) }}>Branch Office</h3>
            <p
              style={{
                fontFamily: F.body,
                fontSize: fs(13, 11),
                lineHeight: 1.7,
                color: P.text,
                margin: 0,
              }}
            >
              {BRANCH_ADDRESS.street}
              <br />
              {BRANCH_ADDRESS.city}, {BRANCH_ADDRESS.state} {BRANCH_ADDRESS.zip}
              <br />
              Phone:{" "}
              <a href={telHref(BRANCH_PHONE)} className="mg-footer-link" style={inlineLinkStyle}>
                {BRANCH_PHONE}
              </a>
            </p>

            <h3 style={{ ...sectionHeadingStyle, fontSize: fs(11, 10), marginTop: 24 }}>Licensing</h3>
            <div
              style={{
                fontFamily: F.body,
                fontSize: fs(13, 11),
                lineHeight: 1.85,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <a
                href={LICENSING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-footer-link"
                style={inlineLinkStyle}
              >
                View licensed states{" "}
                <span style={{ color: P.gold, fontSize: 11, marginLeft: 4 }} aria-hidden="true">
                  ↗
                </span>
              </a>
              <a
                href={NMLS_CONSUMER_ACCESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-footer-link"
                style={inlineLinkStyle}
              >
                NMLS Consumer Access{" "}
                <span style={{ color: P.gold, fontSize: 11, marginLeft: 4 }} aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* ----------------- ZONE 3 — Fine print -----------------
            Educational disclaimer sits immediately above the verbatim
            corporate disclosure. Both span the full inner-container
            width and use the same fine-print typography so they read
            as a single block of legal text; a 24px gap separates them. */}
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            lineHeight: 1.65,
            color: P.warmGrayLight,
            margin: "0 0 24px",
          }}
        >
          This content is for educational purposes only and does not constitute financial advice. Loan programs, rates, terms, and guidelines are subject to change without notice. Always consult directly with a licensed mortgage professional for guidance specific to your situation. All applicants are subject to underwriting approval.
        </p>
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            lineHeight: 1.65,
            color: P.warmGrayLight,
            margin: 0,
          }}
        >
          {renderDisclosure()}
        </p>
      </div>
    </footer>
  );
}
