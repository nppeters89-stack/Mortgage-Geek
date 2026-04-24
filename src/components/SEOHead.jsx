import { Helmet } from "react-helmet-async";

// Centralized SEO tag management. Every routed page calls this with its
// title, description, and path — canonical URL and og:url are constructed
// from the path so social shares correctly reflect the page being shared.
//
// Props:
//   title       — full <title> tag content (shown in Google results, browser tab)
//   description — meta description (shown as snippet in Google results)
//   path        — pathname only (e.g., "/calculator", "/deep-dives/derogatory-credit")
//                 Leading slash required. Root homepage uses "/".
export function SEOHead({ title, description, path }) {
  const baseUrl = "https://mortgagegeek.ai";
  const canonical = `${baseUrl}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph — overrides the hardcoded defaults in index.html */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />

      {/* Twitter Card — mirrors Open Graph for Twitter/X shares */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
