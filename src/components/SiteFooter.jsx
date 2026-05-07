// Global site footer with all required AnnieMac compliance disclosures.
// Rendered once in App.jsx beneath the routed page content so it appears
// on every route.
//
// Three zones, separated by 1px P.creamDark dividers:
//   Zone 1 — Brand voice (Mortgage Geek heading, tagline, educational
//            disclaimer)
//   Zone 2 — Attribution (AnnieMac icon + LO + branch/licensing in two
//            columns on desktop, stacked on mobile)
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
  BRANCH_PHONE,
  BRANCH_ADDRESS,
  TRADE_NAME,
  NMLS_CONSUMER_ACCESS_URL,
  LICENSING_URL,
  CORPORATE_DISCLOSURE,
} from "../data/compliance";

// Phone display string normalized to a tel: href ("(615) 656-0737" → "6156560737").
const telHref = (display) => `tel:${display.replace(/\D/g, "")}`;

// The verbatim corporate disclosure embeds the http:// URL inside parens.
// Render the URL portion as a clickable anchor while keeping the
// surrounding parens and the rest of the paragraph as plain text. The
// href intentionally matches the displayed http:// URL exactly.
function renderDisclosure() {
  const url = "http://www.nmlsconsumeraccess.org/";
  const idx = CORPORATE_DISCLOSURE.indexOf(url);
  if (idx === -1) return CORPORATE_DISCLOSURE;
  const before = CORPORATE_DISCLOSURE.slice(0, idx);
  const after = CORPORATE_DISCLOSURE.slice(idx + url.length);
  return (
    <>
      {before}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mg-footer-link"
        style={{ color: P.warmGray, textDecoration: "underline" }}
      >
        {url}
      </a>
      {after}
    </>
  );
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

export function SiteFooter({ hasSidebar = false }) {
  const isMobile = useIsMobile(768);

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
        }
      `}</style>

      <div
        style={{
          // Mirror the Page primitive (src/components/homepage/Page.jsx)
          // so the footer's gutters line up exactly with content above:
          // maxWidth 1180, fluid horizontal padding clamp(20, 4vw, 56).
          // Vertical padding stays responsive per the spec (32 mobile / 48 desktop).
          maxWidth: 1180,
          margin: "0 auto",
          paddingLeft: "clamp(20px, 4vw, 56px)",
          paddingRight: "clamp(20px, 4vw, 56px)",
          paddingTop: isMobile ? 32 : 48,
          paddingBottom: isMobile ? 32 : 48,
          boxSizing: "border-box",
        }}
      >
        {/* ----------------- ZONE 1 — Brand voice ----------------- */}
        <div>
          <h2
            aria-label="The Mortgage Geek"
            style={{
              fontFamily: F.display,
              fontWeight: 400,
              fontSize: 22,
              color: P.navy,
              margin: 0,
              display: "flex",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <span>The Mortgage Geek</span>
            <span aria-hidden="true" style={{ fontSize: 18 }}>🤓</span>
          </h2>
          <p
            style={{
              fontFamily: F.display,
              fontStyle: "italic",
              fontSize: 14,
              color: P.gold,
              margin: "2px 0 0",
            }}
          >
            Mortgages Demystified.
          </p>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 12,
              lineHeight: 1.65,
              color: P.warmGray,
              maxWidth: 560,
              margin: "14px 0 0",
            }}
          >
            This content is for educational purposes only and does not constitute financial advice. Loan programs, rates, terms, and guidelines are subject to change without notice. Always consult directly with a licensed mortgage professional for guidance specific to your situation.
          </p>
        </div>

        <hr style={dividerStyle} />

        {/* ----------------- ZONE 2 — Attribution ----------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 32,
          }}
        >
          {/* LEFT — AnnieMac + LO + contact + EHL */}
          <div>
            {/* AnnieMac icon + trade name + corporate NMLS */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src="/anniemac-icon.png"
                alt=""
                aria-hidden="true"
                style={{ width: 36, height: 36, display: "block", flexShrink: 0 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontFamily: F.body,
                    fontSize: 13,
                    fontWeight: 500,
                    color: P.navy,
                    letterSpacing: 0.3,
                  }}
                >
                  AnnieMac Home Mortgage
                </span>
                <span
                  style={{
                    fontFamily: F.body,
                    fontSize: 11,
                    fontWeight: 500,
                    color: P.warmGrayLight,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Corporate NMLS# {CORPORATE_NMLS}
                </span>
              </div>
            </div>

            {/* Loan officer name */}
            <p
              style={{
                fontFamily: F.body,
                fontSize: 14,
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
                fontSize: 13,
                color: P.warmGray,
                margin: "2px 0 0",
              }}
            >
              {LO_TITLE} · NMLS# {PERSONAL_NMLS}
            </p>

            {/* Direct contact */}
            <p
              style={{
                fontFamily: F.body,
                fontSize: 13,
                color: P.warmGray,
                margin: "12px 0 0",
                lineHeight: 1.85,
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
            </p>

            {/* Equal Housing Lender row */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <EHLLogo size={22} color={P.navy} />
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: 12,
                  color: P.warmGray,
                  letterSpacing: 0.3,
                }}
              >
                Equal Housing Lender
              </span>
            </div>
          </div>

          {/* RIGHT — Branch office + licensing */}
          <div>
            <h3 style={sectionHeadingStyle}>Branch Office</h3>
            <p
              style={{
                fontFamily: F.body,
                fontSize: 13,
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

            <h3 style={{ ...sectionHeadingStyle, marginTop: 24 }}>Licensing</h3>
            <div
              style={{
                fontFamily: F.body,
                fontSize: 13,
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

        {/* ----------------- ZONE 3 — Corporate fine print ----------------- */}
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
