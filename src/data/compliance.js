// Single source of truth for Rate compliance data. Every component
// that displays personal/corporate NMLS, branch info, the Equal Housing
// Lender attribution, or the verbatim corporate disclosure imports from
// here. If a number, address, or URL changes, change it in this file.

export const PERSONAL_NMLS = "1119524";
export const CORPORATE_NMLS = "2611";

export const LO_NAME = "Nick Peters";
export const LO_TITLE = "VP of Mortgage Lending";
export const LO_PHONE = "(615) 656-0737";
export const LO_EMAIL = "Nick.Peters@rate.com";
// LO landing page on the lender's site. Empty string while transition is
// in flight; the footer hides the link when this is falsy.
export const LO_WEBSITE = "";

export const BRANCH_PHONE = "(615) 682-0366";
export const BRANCH_ADDRESS = {
  street: "501 Corporate Centre Drive, Suite 310",
  city: "Franklin",
  state: "TN",
  zip: "37067",
};

export const TRADE_NAME = "Rate";
export const LEGAL_ENTITY = "Guaranteed Rate, Inc.";

export const NMLS_CONSUMER_ACCESS_URL = "https://www.nmlsconsumeraccess.org/";
export const LICENSING_URL = "https://www.rate.com/licensing";

// Verbatim corporate disclosure block supplied by compliance. Do not
// paraphrase. Do not add or remove punctuation. The bullet (•) and pipe
// (|) characters are intentional and preserved exactly.
export const CORPORATE_DISCLOSURE =
  "Guaranteed Rate, Inc. NMLS 2611. 3940 N. Ravenswood Ave., Chicago, IL 60613. (866) 934-7283 • rate.com. Equal Housing Lender. For licensing information, go to www.nmlsconsumeraccess.org | www.rate.com/licensing | www.rate.com/privacy";

// Product-specific disclosures shown as footnotes in the footer, referenced
// from the homepage value-prop cards by the * / ** markers after each headline.
// Boilerplate already embedded elsewhere in the footer (Equal Housing Lender,
// NMLS 2611, the nmlsconsumeraccess.org licensing reference) is intentionally
// omitted here to avoid duplication. Same Day text is the official full T&C.
export const PRODUCT_FOOTNOTES = [
  {
    marker: "*",
    text: "PowerBid Approval assumes receipt of all required documentation, a re-review of financial condition and may be revoked at any time if there is a change impairing ability to repay and/or if any borrower information is inaccurate or incomplete. Applicant subject to credit and underwriting approval. Restrictions apply.",
  },
  {
    marker: "**",
    text: "Rate's Same Day Mortgage promotion offers qualified customers who provide certain required financial information/documentation to Rate within 24 hours of locking a rate on a mortgage loan the opportunity to receive a loan approval within 1 business day of timely submission of documentation and does not suggest that the borrower will receive funding on the same day as their application submission. For purposes of this offer, documents provided after 1 pm local time or on a weekend or company holiday will be deemed submitted the next business day. Rate cannot guarantee that a loan will be approved or that a closing will occur within a specific timeframe. Rate reserves the right to revoke this approval at any time if there is a change in your financial condition or credit history which would impair your ability to repay this obligation. Read and understand your Loan Commitment before waiving any mortgage contingencies. Borrower documentation and Intent to Proceed must be signed within 24 business hours of receipt. Not eligible for all loan types or residence types. Minimum down payment requirements apply. Not all borrowers will be approved. Borrower's interest rate will depend upon the specific characteristics of borrower's loan transaction, credit profile and other criteria. Not available in all states. Restrictions apply. Visit rate.com/same-day-mortgage for terms and conditions.",
  },
];
