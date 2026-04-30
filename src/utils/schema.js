// JSON-LD schema generators per Schema.org. Each function returns a plain
// JavaScript object that SEOHead will serialize to JSON and inject as a
// <script type="application/ld+json"> tag in the document head.
//
// Reference: https://schema.org/
//
// The PERSON schema is the foundation — every other schema references it
// via a stable @id so Google can connect all content to one verified entity.

const BASE_URL = "https://mortgagegeek.ai";
const PERSON_ID = `${BASE_URL}/about#person`;
const ORG_ID = `${BASE_URL}/#organization`;

// Nick Peters as a Schema.org Person entity. Used on the About page and
// referenced as "author" on every Article and "founder" on the Organization.
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Nick Peters",
    jobTitle: "Mortgage Loan Officer",
    description: "Mortgage loan officer with 12+ years of experience helping first-time buyers navigate the mortgage process. Plain-English guidance, real answers, no jargon.",
    url: `${BASE_URL}/about`,
    image: `${BASE_URL}/headshot.jpg`,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "NMLS",
      value: "1119524",
    },
    knowsAbout: [
      "Mortgage lending",
      "FHA loans",
      "VA loans",
      "Conventional mortgages",
      "USDA loans",
      "Mortgage underwriting",
      "First-time homebuyer guidance",
    ],
    telephone: "+1-615-656-0737",
    email: "npeters@annie-mac.com",
  };
}

// The Mortgage Geek as a FinancialService business entity. Used on the
// homepage to establish the site as a real-world financial services provider.
export function financialServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": ORG_ID,
    name: "The Mortgage Geek",
    url: BASE_URL,
    description: "Free mortgage calculators, side-by-side loan comparisons, and deep-dive guides for first-time buyers. Written by a 12-year mortgage pro.",
    founder: { "@id": PERSON_ID },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    serviceType: [
      "Mortgage origination",
      "Mortgage consulting",
      "First-time homebuyer education",
    ],
  };
}

// Article schema for Deep Dive pages. Accepts the page-specific metadata
// (title, description, url, datePublished, dateModified) and constructs
// a properly-formed NewsArticle-compatible Article schema.
//
// All Deep Dive articles cite the Person as author and reference the
// Organization as publisher for full entity-graph completeness.
export function articleSchema({ title, description, url, datePublished, dateModified }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    url: url,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

// WebApplication schema for tool pages (Calculator, PreQual, Compare,
// Cash to Close). Categorized as "FinanceApplication" so Google understands
// these as functional tools in the financial category.
export function webApplicationSchema({ title, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description: description,
    url: url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
  };
}
