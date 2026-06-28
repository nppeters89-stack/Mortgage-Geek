// Builds React Router v7 `meta` descriptors that PRERENDER into static HTML.
// This is the prerender-visible equivalent of what <SEOHead> (react-helmet-async)
// emits client-side. The tag set is an exact 1:1 of SEOHead's output: title,
// description, canonical, og:title/description/url, twitter:title/description,
// and an optional JSON-LD script. Values are relocated verbatim, not rewritten.
const BASE_URL = "https://mortgagegeek.ai";

export function buildMeta({ title, description, path, schema }) {
  const canonical = `${BASE_URL}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(schema ? [{ "script:ld+json": schema }] : []),
  ];
}
