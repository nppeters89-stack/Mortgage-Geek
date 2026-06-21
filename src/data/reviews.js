// Social-proof config — DISPLAY ONLY.
//
// Update these values by hand as Google reviews come in. There is intentionally
// NO Google API integration and NO review schema (JSON-LD) here: self-serving
// review structured data on our own domain is excluded on purpose. The rating
// search engines read lives on the Google Business Profile; this section just
// mirrors it for visitors and links out.
//
// HOW TO POPULATE:
//   rating     overall Google star average, e.g. 4.9 (null until you have one)
//   count      total number of Google reviews, e.g. 52 (0 until you have them)
//   profileUrl Google Business Profile reviews / "write a review" URL
//   reviews    array of { name, rating, date, quote }. name = first name + last
//              initial. date = "YYYY-MM". Leave [] to render the "leave a
//              review" invite instead of cards.
//
// The entries below are PLACEHOLDER SAMPLES so the layout is reviewable on the
// preview. Replace them (and the rating/count) with real Google reviews before
// this goes live.
export const REVIEWS = {
  rating: 5.0,
  count: 3,
  profileUrl: "", // TODO: real Google Business Profile reviews URL
  reviews: [
    { name: "Sample R.", rating: 5, date: "2026-05", quote: "Placeholder review. Replace with a real Google review before launch." },
    { name: "Sample T.", rating: 5, date: "2026-04", quote: "Placeholder review. Replace with a real Google review before launch." },
    { name: "Sample M.", rating: 5, date: "2026-03", quote: "Placeholder review. Replace with a real Google review before launch." },
  ],
};
