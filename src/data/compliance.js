// Single source of truth for AnnieMac compliance data. Every component
// that displays personal/corporate NMLS, branch info, the Equal Housing
// Lender attribution, or the verbatim corporate disclosure imports from
// here. If a number, address, or URL changes, change it in this file.

export const PERSONAL_NMLS = "1119524";
export const CORPORATE_NMLS = "338923";

export const LO_NAME = "Nick Peters";
export const LO_TITLE = "Sales Manager";
export const LO_PHONE = "(615) 656-0737";
export const LO_EMAIL = "npeters@annie-mac.com";
export const LO_WEBSITE = "https://annie-mac.com/lo/nickpeters/";

export const BRANCH_PHONE = "(302) 327-6115";
export const BRANCH_ADDRESS = {
  street: "700 East Gate Drive, Suite 400",
  city: "Mt Laurel",
  state: "NJ",
  zip: "08054",
};

export const TRADE_NAME = "AnnieMac Home Mortgage";
export const LEGAL_ENTITY = "American Neighborhood Mortgage Acceptance Company LLC";

export const NMLS_CONSUMER_ACCESS_URL = "https://www.nmlsconsumeraccess.org/";
export const LICENSING_URL = "https://annie-mac.com/licensing/";

// Verbatim corporate disclosure block. Preserves the http:// vs https://
// asymmetry, all parentheses, hyphens, and the single quote in
// "Veteran's" exactly as supplied. Do not paraphrase. Do not add or
// remove punctuation.
export const CORPORATE_DISCLOSURE =
  "©2026 American Neighborhood Mortgage Acceptance Company LLC (dba AnnieMac Home Mortgage, OVM with AnnieMac Home Mortgage, Family First A Division of AnnieMac Home Mortgage, homecomings Mortgage & Equity A Division of AnnieMac Home Mortgage) Corporate NMLS# 338923 (http://www.nmlsconsumeraccess.org/). AnnieMac Home Mortgage is an Equal Housing Opportunity. For a complete list of our licensed states visit: https://annie-mac.com/licensing/. American Neighborhood Mortgage Acceptance Company LLC (dba AnnieMac Home Mortgage, OVM with AnnieMac Home Mortgage, Family First A Division of AnnieMac Home Mortgage, homecomings Mortgage & Equity A Division of AnnieMac Home Mortgage) is not affiliated with the U.S. Department of Veteran's Affairs, the U.S. Department of Housing and Urban Development, the U.S. Department of Agriculture, or any other Federal Government Agency.";
