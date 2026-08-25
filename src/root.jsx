import { Meta, Links, Outlet, ScrollRestoration, Scripts, useLocation } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { P } from "./theme";

// JSON-LD blocks reproduced byte-for-byte from the old index.html so crawlers
// still see the Person + FinancialService schemas in the served HTML.
const PERSON_JSONLD = `
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://mortgagegeek.ai/about#person",
      "name": "Nick Peters",
      "jobTitle": "Mortgage Loan Officer",
      "description": "Mortgage loan officer with 12+ years of experience helping first-time buyers navigate the mortgage process. Plain-English guidance, real answers, no jargon.",
      "url": "https://mortgagegeek.ai/about",
      "image": "https://mortgagegeek.ai/headshot.jpg",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "NMLS",
        "value": "1119524"
      },
      "knowsAbout": [
        "Mortgage lending",
        "FHA loans",
        "VA loans",
        "Conventional mortgages",
        "USDA loans",
        "Mortgage underwriting",
        "First-time homebuyer guidance"
      ],
      "telephone": "+1-615-656-0737",
      "email": "Nick.Peters@rate.com",
      "worksFor": {
        "@type": "FinancialService",
        "name": "Rate",
        "legalName": "Guaranteed Rate, Inc.",
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "NMLS",
          "value": "2611"
        },
        "url": "https://www.rate.com"
      }
    }
    `;

const ORG_JSONLD = `
    {
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "@id": "https://mortgagegeek.ai/#organization",
      "name": "Mortgage Geek",
      "url": "https://mortgagegeek.ai",
      "description": "Free mortgage calculators, side-by-side loan comparisons, and deep-dive guides for first-time buyers. Written by a 12-year mortgage pro.",
      "telephone": "+1-615-656-0737",
      "image": "https://mortgagegeek.ai/favicons/icon-512.png",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "TN",
        "addressCountry": "US"
      },
      "founder": { "@id": "https://mortgagegeek.ai/about#person" },
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      },
      "serviceType": [
        "Mortgage origination",
        "Mortgage consulting",
        "First-time homebuyer education"
      ]
    }
    `;

// Service-worker registration moved verbatim from the old index.html body script.
const SW_REGISTER = `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js').catch((err) => {
            console.warn('Service worker registration failed:', err);
          });
        });
      }
    `;

// Document shell — every head/body element migrated from index.html. Pure shell:
// no nav/sidebar/business logic (the layout route + pages own all of that).
export function Layout({ children }) {
  // The gated /geek-log app installs as its own PWA with its own home-screen
  // identity. It is the ONLY route that swaps the manifest, apple-touch-icon,
  // and app title; every other route keeps the main Mortgage Geek icon and
  // manifest byte-for-byte as before. These head links are hardcoded in the
  // shell, so per-route overrides via helmet/route-meta only duplicate them
  // (browsers use the first manifest, iOS the site apple-touch-icon), which is
  // why the swap has to happen here.
  const { pathname } = useLocation();
  const isGeekLog = pathname.replace(/\/+$/, "") === "/geek-log";
  const manifestHref = isGeekLog ? "/geeklog.webmanifest" : "/manifest.json";
  const appleTouchHref = isGeekLog ? "/geeklog/icon-180.png" : "/favicons/apple-touch-icon.png?v=cream";
  // Browser-tab favicon follows the same split: green Geek Log icon on
  // /geek-log, red-tile MG everywhere else. (The Geek Log set has no 16px
  // cut; the 32 scales down fine.)
  // The Geek Log is an app, not a document: pinch and double-tap zoom are only
  // ever accidental there (and focusing a sub-16px input auto-zooms iOS). The
  // marketing site keeps normal zoom for accessibility.
  const viewportContent = isGeekLog
    ? "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    : "width=device-width, initial-scale=1.0, viewport-fit=cover";
  const favicon32Href = isGeekLog ? "/geeklog/icon-32.png" : "/favicons/favicon-32.png";
  const favicon16Href = isGeekLog ? "/geeklog/icon-32.png" : "/favicons/favicon-16.png";
  const faviconHref = isGeekLog ? "/geeklog/icon-48.png" : "/favicons/favicon.png";
  const appName = isGeekLog ? "Geek Log" : "Mortgage Geek";

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content={viewportContent} />
        {/* title + description + og/twitter title/description/url are now provided
            per-route via `meta` exports (root defaults below, pages override), so
            they prerender into each route's static HTML. */}

        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* PWA Manifest (Geek Log installs its own) */}
        <link rel="manifest" href={manifestHref} />

        {/* Browser tab favicon: red-tile MG (reads on light + dark tabs), or the
            green Geek Log icon on /geek-log. */}
        <link rel="icon" type="image/png" sizes="32x32" href={favicon32Href} />
        <link rel="icon" type="image/png" sizes="16x16" href={favicon16Href} />
        <link rel="icon" type="image/png" href={faviconHref} />
        {/* iOS / PWA home-screen icon: cream MG variant, or the Geek Log icon on /geek-log. */}
        <link rel="apple-touch-icon" sizes="180x180" href={appleTouchHref} />

        {/* iOS Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={appName} />

        {/* Android / Chrome */}
        <meta name="theme-color" content="#131416" />
        <meta name="application-name" content={appName} />

        {/* Open Graph + Twitter site-wide static bits. Per-page title, description,
            url, AND image come from route meta (buildMeta), which owns og:image /
            twitter:image as a single source so a per-route image (a tool's icon)
            overrides the default without a duplicate tag. */}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />

        {/* Schema.org Person + FinancialService — hardcoded so they're in the raw HTML for crawlers. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PERSON_JSONLD }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORG_JSONLD }} />

        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {/* Register Service Worker for PWA / offline support */}
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTER }} />
      </body>
    </html>
  );
}

// Default title/description/og/twitter for the document shell + any route that
// does not set its own meta (verbatim from the former index.html defaults).
// Each public route overrides these via its own `meta` export (React Router
// merges by key, so leaf values win and nothing is duplicated).
export function meta() {
  return [
    { title: "Mortgage Geek — Plain-English Mortgage Tools & Guides" },
    { name: "description", content: "Mortgages demystified. Everything you need to understand the mortgage process — from first conversation to closing day. Compare Conventional, FHA, and VA loans side by side." },
    { property: "og:title", content: "Mortgage Geek — Plain-English Mortgage Tools & Guides" },
    { property: "og:description", content: "Free mortgage calculators, side-by-side loan comparisons, and deep-dive guides for first-time buyers. Written by a 12-year mortgage pro, not an algorithm." },
    { property: "og:url", content: "https://mortgagegeek.ai/" },
    { name: "twitter:title", content: "Mortgage Geek | Mortgages Demystified" },
    { name: "twitter:description", content: "Mortgages demystified. Side-by-side payment calculator with live rates." },
  ];
}

export default function App() {
  return (
    <HelmetProvider>
      <Outlet />
    </HelmetProvider>
  );
}

// Initial-load fallback, mirroring the old App.jsx Suspense "Loading…" screen.
export function HydrateFallback() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: P.cream,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "14px",
      color: P.warmGray,
      letterSpacing: "0.5px",
    }}>
      Loading…
    </div>
  );
}
