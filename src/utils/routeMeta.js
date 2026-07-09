// Builds React Router v7 `meta` descriptors that PRERENDER into static HTML.
// This is the prerender-visible equivalent of what <SEOHead> (react-helmet-async)
// emits client-side. The tag set is an exact 1:1 of SEOHead's output: title,
// description, canonical, og:title/description/url, twitter:title/description,
// and an optional JSON-LD script. Values are relocated verbatim, not rewritten.
const BASE_URL = "https://mortgagegeek.ai";

// `shareTitle` (optional) overrides the social/link-preview title (og:title and
// twitter:title) while leaving the SEO <title> as `title`. Defaults to `title`
// so routes that don't pass it behave exactly as before.
export function buildMeta({ title, description, path, schema, shareTitle }) {
  const canonical = `${BASE_URL}${path}`;
  const ogTitle = shareTitle || title;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: description },
    ...(schema ? [{ "script:ld+json": schema }] : []),
  ];
}
