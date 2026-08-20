// Builds React Router v7 `meta` descriptors that PRERENDER into static HTML.
// This is the prerender-visible equivalent of what <SEOHead> (react-helmet-async)
// emits client-side. The tag set is an exact 1:1 of SEOHead's output: title,
// description, canonical, og:title/description/url, twitter:title/description,
// and an optional JSON-LD script. Values are relocated verbatim, not rewritten.
const BASE_URL = "https://mortgagegeek.ai";

// The site-wide default link-preview image (the Mortgage Geek app icon). Routes
// that want their own preview image (e.g. a tool's icon in text-message and
// browser link previews) pass `image`. Kept here as the single source of the
// og:image / twitter:image tags: root.jsx deliberately does NOT emit those, so
// every page has exactly one of each and a per-route image cleanly overrides the
// default instead of colliding with a hardcoded tag (Open Graph treats the first
// og:image as primary, so a duplicate would defeat the override).
const DEFAULT_OG_IMAGE = `${BASE_URL}/favicons/icon-512.png`;

// `shareTitle` (optional) overrides the social/link-preview title (og:title and
// twitter:title) while leaving the SEO <title> as `title`. Defaults to `title`
// so routes that don't pass it behave exactly as before. `image` (optional) sets
// the link-preview image; defaults to the app icon so existing routes are
// unchanged. It should be an absolute URL to a raster image (PNG/JPG): SVG does
// not render in iMessage/Twitter/Facebook previews.
export function buildMeta({ title, description, path, schema, shareTitle, image }) {
  const canonical = `${BASE_URL}${path}`;
  const ogTitle = shareTitle || title;
  const ogImage = image || DEFAULT_OG_IMAGE;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    ...(schema ? [{ "script:ld+json": schema }] : []),
  ];
}
