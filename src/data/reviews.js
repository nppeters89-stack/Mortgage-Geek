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
// Append real Google reviews to `reviews` and bump `count` as more come in.
export const REVIEWS = {
  rating: 5.0,
  count: 1,
  profileUrl: "https://share.google/XxR3CclTTKrEqo0N8",
  reviews: [
    {
      name: "Ashlyn M. Clayton",
      rating: 5,
      date: "2026-06",
      quote: "I’ve gotten the pleasure of working with Nick in a couple different capacities. I’m a realtor in Northeast Arkansas and have done roughly 40 deals with Nick including on the purchase of my own home. I genuinely do not believe there is a better loan officer than Nick. I would recommend him to anyone looking to get a mortgage loan.",
    },
  ],
};
