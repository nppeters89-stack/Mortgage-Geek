// Social-proof config — DISPLAY ONLY.
//
// Updated by hand as Google reviews come in. No Google API and no review JSON-LD
// (self-serving review structured data on our own domain is excluded on purpose;
// the rating that search engines read lives on the Google Business Profile). This
// section mirrors it for visitors and links out.
//
// HOW TO POPULATE:
//   rating     overall Google star average (e.g. 5.0). null until there is one.
//   count      total number of Google reviews. 0 until there are any.
//   profileUrl Google Business Profile / share link (powers "Read on Google").
//   reviews    array of { name, rating, date, quote }. name = first name + last
//              initial. date = "YYYY-MM". Empty [] -> the section shows the
//              rating + a "Read reviews on Google" invite instead of cards.
//
// TODO (Nick): one review is live; paste it here as the first entry, e.g.
//   { name: "Jane D.", rating: 5, date: "2026-06", quote: "…the exact review text…" }
// and bump `count` as more come in. The rating below reflects a single 5-star
// review — confirm/adjust when more land.
export const REVIEWS = {
  rating: 5.0,
  count: 1,
  profileUrl: "https://share.google/XxR3CclTTKrEqo0N8",
  reviews: [
    // Real Google reviews go here. Left empty until the live review text is
    // pasted in (we don't display fabricated/placeholder testimonials).
  ],
};
