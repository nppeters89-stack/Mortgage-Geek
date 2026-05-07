// Global site footer with all required AnnieMac compliance disclosures.
// Rendered once in App.jsx beneath the routed page content so it appears
// on every route.
//
// All compliance copy and contact data is sourced from
// `data/compliance.js` (single source of truth). All colors and fonts
// come from `theme.js` (no hardcoded hex values).

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

// Phone string normalized to a tel: href ("(615) 656-0737" → "+16156560737").
const telHref = (display) => `tel:+1${display.replace(/\D/g, "")}`;

// The verbatim corporate disclosure embeds the http:// URL inside parens.
// We render the URL portion as a clickable anchor while keeping the
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

export function SiteFooter() {
  const isMobile = useIsMobile(768);

  const linkColor = P.navy;

  // Section heading style ("Branch Office", "Licensing").
  const sectionHeadingStyle = {
    fontFamily: F.body,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: P.navy,
    marginBottom: 8,
  };

  return (
    <footer
      style={{
        background: P.cream,
        borderTop: `1px solid ${P.creamDark}`,
        // Footer should always sit at the bottom, full width.
        width: "100%",
      }}
    >
      {/* Hover treatment for footer links. Inline styles can't express
          :hover, so we scope a tiny rule here. Underline-on-hover is
          off by default per the spec; the corporate-disclosure URL is
          always underlined so it reads as a link in the dense fine print. */}
      <style>{`
        .mg-footer-link:hover { text-decoration: underline; }
      `}</style>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: isMobile ? "32px 20px" : "48px 32px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 32 : 48,
        }}
      >
        {/* LEFT — Loan-officer attribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <img
            src="/anniemac-logo.png"
            alt="AnnieMac Home Mortgage"
            style={{ height: 40, width: "auto", display: "block" }}
          />

          <p
            style={{
              fontFamily: F.body,
              fontSize: 14,
              fontWeight: 600,
              color: P.navy,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {LO_NAME} · {LO_TITLE} at {TRADE_NAME}
          </p>

          <p style={{ fontFamily: F.body, fontSize: 13, color: P.warmGray, margin: 0, lineHeight: 1.5 }}>
            NMLS# {PERSONAL_NMLS} | Corporate NMLS# {CORPORATE_NMLS}
          </p>

          <p style={{ fontFamily: F.body, fontSize: 13, color: P.warmGray, margin: 0, lineHeight: 1.6 }}>
            Direct:{" "}
            <a
              href={telHref(LO_PHONE)}
              className="mg-footer-link"
              style={{ color: linkColor, textDecoration: "none", fontWeight: 600 }}
            >
              {LO_PHONE}
            </a>
            {" · "}
            <a
              href={`mailto:${LO_EMAIL}`}
              className="mg-footer-link"
              style={{ color: linkColor, textDecoration: "none", fontWeight: 600 }}
            >
              {LO_EMAIL}
            </a>
          </p>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <EHLLogo size={32} color={P.navy} />
            <span style={{ fontFamily: F.body, fontSize: 12, color: P.warmGray }}>
              Equal Housing Lender
            </span>
          </div>
        </div>

        {/* RIGHT — Branch office + licensing */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h3 style={sectionHeadingStyle}>Branch Office</h3>
            <p style={{ fontFamily: F.body, fontSize: 13, color: P.warmGray, margin: 0, lineHeight: 1.6 }}>
              {BRANCH_ADDRESS.street}
              <br />
              {BRANCH_ADDRESS.city}, {BRANCH_ADDRESS.state} {BRANCH_ADDRESS.zip}
              <br />
              Phone:{" "}
              <a
                href={telHref(BRANCH_PHONE)}
                className="mg-footer-link"
                style={{ color: linkColor, textDecoration: "none", fontWeight: 600 }}
              >
                {BRANCH_PHONE}
              </a>
            </p>
          </div>

          <div>
            <h3 style={sectionHeadingStyle}>Licensing</h3>
            <p style={{ fontFamily: F.body, fontSize: 13, color: P.warmGray, margin: 0, lineHeight: 1.8 }}>
              <a
                href={LICENSING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-footer-link"
                style={{ color: linkColor, textDecoration: "none", fontWeight: 600, display: "block" }}
              >
                View licensed states
              </a>
              <a
                href={NMLS_CONSUMER_ACCESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-footer-link"
                style={{ color: linkColor, textDecoration: "none", fontWeight: 600, display: "block" }}
              >
                NMLS Consumer Access
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Full-width corporate disclosure beneath both columns. */}
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: isMobile ? "0 20px 32px" : "0 32px 48px",
        }}
      >
        <hr
          style={{
            border: 0,
            borderTop: `1px solid ${P.creamDark}`,
            margin: "24px 0",
          }}
        />
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            lineHeight: 1.6,
            color: P.warmGray,
            margin: 0,
          }}
        >
          {renderDisclosure()}
        </p>
      </div>
    </footer>
  );
}
