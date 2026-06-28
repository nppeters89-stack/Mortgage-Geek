import { Meta, Links, Outlet, ScrollRestoration, Scripts } from "react-router";
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
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        {/* title + description + og/twitter title/description/url are now provided
            per-route via `meta` exports (root defaults below, pages override), so
            they prerender into each route's static HTML. */}

        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Browser tab favicon: red-tile MG (reads on light + dark tabs). */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16.png" />
        <link rel="icon" type="image/png" href="/favicons/favicon.png" />
        {/* iOS / PWA home-screen icon: cream variant (cache-busted). */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png?v=cream" />

        {/* iOS Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mortgage Geek" />

        {/* Android / Chrome */}
        <meta name="theme-color" content="#131416" />
        <meta name="application-name" content="Mortgage Geek" />

        {/* Open Graph + Twitter — site-wide static bits (per-page title/description/
            url come from route meta). */}
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mortgagegeek.ai/favicons/icon-512.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="https://mortgagegeek.ai/favicons/icon-512.png" />

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
