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
