import { useState } from "react";
import { P, F } from "../../theme";
import { SectionHeader } from "./SectionHeader";

export function JargonDecoder() {
  const [search, setSearch] = useState("");
  const [openTerm, setOpenTerm] = useState(null);
  const [sectionOpen, setSectionOpen] = useState(false);

  const terms = [
    { term: "1003", def: "The industry name for the Uniform Residential Loan Application — the official mortgage application form. Now technically called the URLA (Uniform Residential Loan Application) after being redesigned in 2021, but most loan originators still call it the '1003' (pronounced 'ten-oh-three'). It captures everything: income, assets, debts, property details, declarations. You'll sign multiple versions throughout the process as the file updates." },
    { term: "1004D", def: "The reinspection form an appraiser completes after the original appraisal — most commonly to verify that required repairs have been completed. If your appraisal came back 'subject to' repairs (like a missing handrail or a broken window), you'll need a 1004D before closing to confirm the work is done. Usually costs $150–$250 and takes a few days to schedule." },
    { term: "1007", def: "The Single-Family Comparable Rent Schedule — the appraiser's report estimating fair-market rent for an investment or two-to-four-unit property. When you're buying a rental or using rental income to qualify, the lender uses the 1007 to determine how much of that rental income can count toward your DTI. Without it, rental income typically can't be used for qualifying." },
    { term: "1031 Exchange", def: "An IRS tax provision that lets real estate investors defer capital gains taxes by rolling proceeds from the sale of one investment property into the purchase of another 'like-kind' property. Strict timelines apply: 45 days to identify the replacement property, 180 days to close. This is a tax strategy, not a loan type — but it often runs alongside financing, and a qualified intermediary (not your lender) handles the exchange itself." },
    { term: "APR", def: "Annual Percentage Rate — your interest rate plus lender fees, expressed as a yearly rate. APR is always higher than your note rate because it includes costs like origination fees and discount points. Use APR to compare the true cost of loans from different lenders." },
    { term: "Amortization", def: "The process of paying off your loan over time through scheduled payments. Early payments are mostly interest; later payments are mostly principal. A 30-year amortization schedule shows exactly how this shifts month by month." },
    { term: "Appraisal", def: "An independent assessment of a property's market value, ordered by the lender through an Appraisal Management Company (AMC). The lender needs to confirm the home is worth what you're borrowing. Typically $400–$700." },
    { term: "ARM", def: "Adjustable Rate Mortgage — a loan with an interest rate that changes after an initial fixed period. A 7/6 ARM is fixed for 7 years, then adjusts every 6 months based on a market index (usually SOFR). Lower initial rate, but risk of increases later.", link: { href: "/deep-dives/arms-demystified", label: "Read the ARMs Demystified deep dive" } },
    { term: "Cash to Close", def: "The total amount of money you need to bring to the closing table to complete your home purchase. It includes your down payment, closing costs, prepaid items (taxes and insurance collected upfront), and escrow reserves, minus any credits like earnest money, seller concessions, or lender credits. This is the real number buyers need to plan for — often significantly more than just the down payment alone." },
    { term: "Clear to Close", def: "The best phrase in the mortgage process. It means the underwriter has approved your loan with all conditions satisfied, and you're authorized to proceed to the closing table." },
    { term: "Closing Disclosure (CD)", def: "A 5-page document you receive at least 3 business days before closing. It details every cost, your loan terms, and your monthly payment. Compare it line-by-line against your Loan Estimate — discrepancies may require a fee cure." },
    { term: "Conforming Loan", def: "A mortgage that meets Fannie Mae or Freddie Mac guidelines, including being under the conforming loan limit ($766,550 in most areas for 2024). Loans above this limit are called jumbo loans." },
    { term: "Conventional Loan", def: "A mortgage not insured by a government agency (FHA, VA, USDA). Follows Fannie Mae or Freddie Mac guidelines. Requires PMI if less than 20% down, but PMI is removable once you reach 80% LTV." },
    { term: "DTI", def: "Debt-to-Income Ratio — your total monthly debt payments divided by your gross monthly income. Caps vary by program: Conventional goes up to 49.99%, FHA up to 56.99% on the back-end, VA up to 55%. Front-end DTI (housing payment only) and back-end DTI (housing + all debts) are evaluated separately on FHA and VA. Lower is always better for approval odds and pricing." },
    { term: "Earnest Money", def: "A deposit (typically 1–3% of purchase price) submitted with your offer to show the seller you're serious. It's held in escrow and applied toward your down payment or closing costs at closing." },
    { term: "Escrow", def: "Has two meanings: (1) An account where your lender holds money for property taxes and homeowners insurance, paying them on your behalf. (2) The period between contract signing and closing when a neutral third party holds funds and documents." },
    { term: "FHA Loan", def: "A mortgage insured by the Federal Housing Administration. Lower barriers to entry (3.5% minimum down, 580+ credit score), but requires both upfront MIP (1.75%) and monthly MIP, which stays for the life of the loan if you put less than 10% down." },
    { term: "LTV", def: "Loan-to-Value Ratio — your loan amount divided by the property value. A $270,000 loan on a $300,000 home = 90% LTV. LTV affects your rate, PMI requirements, and loan eligibility. Lower LTV = less risk for the lender." },
    { term: "Loan Estimate (LE)", def: "A standardized 3-page document the lender must provide within 3 business days of receiving your application. It outlines your estimated rate, monthly payment, closing costs, and loan terms. Use it to compare offers from multiple lenders." },
    { term: "Loan Originator (LO)", def: "The licensed professional who guides you through the mortgage process — from application to closing. Your LO structures your loan, advises on programs, and coordinates with processing, underwriting, and title." },
    { term: "MIP", def: "Mortgage Insurance Premium — the FHA equivalent of PMI. Comes in two parts: an upfront premium (1.75% of the loan, usually financed) and a monthly premium (0.50–0.55% annually). Unlike conventional PMI, FHA MIP typically stays for the life of the loan." },
    { term: "MBS", def: "Mortgage-Backed Securities — bonds created by bundling thousands of mortgages together and selling them to investors. MBS prices directly influence mortgage rates: when MBS prices rise, rates tend to fall, and vice versa." },
    { term: "PITI", def: "Principal, Interest, Taxes, and Insurance — the four components of your total monthly housing payment. When someone asks 'what's your mortgage payment,' this is the complete answer, not just principal and interest." },
    { term: "PMI", def: "Private Mortgage Insurance — required on conventional loans with less than 20% down. Protects the lender (not you) if you default. The key advantage over FHA MIP: PMI is removable once you reach 80% LTV through payments or appreciation." },
    { term: "Pre-Approval", def: "A conditional commitment from a lender stating how much you're approved to borrow, based on verified income, assets, and credit. Stronger than pre-qualification and often required by sellers before accepting an offer." },
    { term: "Pre-Qualification", def: "An initial estimate of what you can afford, based on self-reported financial information. Faster and less rigorous than pre-approval. Good starting point, but not a guarantee of approval." },
    { term: "Rate Lock", def: "An agreement with your lender to hold a specific interest rate for a set period (typically 30–60 days). Protects you from rate increases while your loan is being processed. Once locked, your rate won't change even if market rates rise." },
    { term: "SOFR", def: "Secured Overnight Financing Rate — the benchmark index used for most adjustable-rate mortgages (ARMs). Replaced LIBOR in 2023. When your ARM adjusts, the new rate = SOFR + a fixed margin set at origination.", link: { href: "/deep-dives/arms-demystified", label: "How ARMs use SOFR (deep dive)" } },
    { term: "Title Insurance", def: "A one-time premium that protects against title defects — things like undisclosed heirs, forged documents, or recording errors. Lender's title insurance is required; owner's title insurance is optional but strongly recommended." },
    { term: "TRID", def: "TILA-RESPA Integrated Disclosure — the \"Know Before You Owe\" rule that standardized mortgage disclosures. It governs your Loan Estimate and Closing Disclosure and sets fee tolerance limits protecting you from surprise cost increases." },
    { term: "Underwriting", def: "The process where your complete loan file is analyzed against lending guidelines. The underwriter reviews your credit, income, assets, and the property to make the approval decision. This is the gatekeeper step." },
    { term: "UFMIP", def: "Upfront Mortgage Insurance Premium — the one-time FHA insurance charge of 1.75% of the loan amount, due at closing. Almost always financed into the loan so you don't pay it out of pocket, but you do pay interest on it." },
    { term: "VA Funding Fee", def: "A one-time fee on VA loans (1.25–3.3% of loan amount) that replaces monthly mortgage insurance. The fee varies based on down payment, usage type (first-time vs. subsequent), and loan purpose. Veterans with service-connected disabilities are exempt." },
    { term: "VA Loan", def: "A mortgage guaranteed by the Department of Veterans Affairs for eligible veterans, active-duty service members, and surviving spouses. No down payment required, no monthly mortgage insurance, and competitive rates." },
  ];

  const filtered = search.trim() === "" ? terms : terms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="glossary" className="section-bleed" style={{ padding: "64px 40px", background: P.creamDark }}>
      <div onClick={() => setSectionOpen(!sectionOpen)} style={{ cursor: "pointer" }}>
        <SectionHeader eyebrow="Speak the Language" title={`Jargon Decoder ${sectionOpen ? "−" : "+"}`} subtitle={sectionOpen ? "Mortgages come with their own vocabulary. Here's every term you'll encounter, explained in plain language." : `Click to reveal ${terms.length} mortgage terms explained in plain language.`} />
      </div>
      {sectionOpen && (
      <div style={{ maxWidth: 720 }}>
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 10, background: P.white, padding: "10px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: 16, marginRight: 10, opacity: 0.4 }}>🔍</span>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms..."
              aria-label="Search mortgage terms"
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: F.body, color: P.text, outline: "none" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", fontSize: 16, color: P.warmGrayLight, cursor: "pointer" }}>✕</button>}
          </div>
          <p style={{ fontSize: 11, color: P.warmGrayLight, marginTop: 6 }}>{filtered.length} term{filtered.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""}</p>
        </div>

        {/* Terms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((t, i) => (
            <div key={i} className="content-card" style={{ overflow: "hidden" }}>
              <button onClick={() => setOpenTerm(openTerm === i ? null : i)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", border: "none", background: openTerm === i ? P.navy : P.white,
                fontFamily: F.body, cursor: "pointer", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: openTerm === i ? "#fff" : P.navy, letterSpacing: 0.2 }}>{t.term}</span>
                <span style={{ fontSize: 16, fontWeight: 300, color: openTerm === i ? "rgba(255,255,255,0.5)" : P.warmGrayLight }}>{openTerm === i ? "−" : "+"}</span>
              </button>
              {openTerm === i && (
                <div style={{ padding: "14px 20px", borderTop: `1px solid ${P.cream}` }}>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>{t.def}</p>
                  {t.link && (
                    <p style={{ fontSize: 12, marginTop: 10 }}>
                      <a href={t.link.href} style={{ color: P.gold, fontWeight: 600, textDecoration: "underline" }}>{t.link.label} →</a>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>🤓</span>
            <p style={{ fontSize: 14, color: P.warmGray }}>No terms found for "{search}"</p>
            <p style={{ fontSize: 12, color: P.warmGrayLight, marginTop: 4 }}>Try a different search or <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: P.gold, fontWeight: 600, cursor: "pointer", fontFamily: F.body, fontSize: 12 }}>view all terms</button></p>
          </div>
        )}
      </div>
      )}
    </section>
  );
}
