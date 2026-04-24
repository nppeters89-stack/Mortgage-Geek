import { P, F, PROGRAM_COLORS } from "../../theme";

export function GiftFundsGrid() {
  const programs = [
    {
      name: "Conventional (Fannie Mae)",
      color: PROGRAM_COLORS.Conventional,
      donors: "Spouse, child, parent, sibling, grandparent, aunt/uncle, cousin, domestic partner, fiancé(e), godparent, or a former relative. Trusts and estates of a related person also qualify.",
      notes: "Broad definition — most family and extended-family donors are eligible.",
    },
    {
      name: "Conventional (Freddie Mac)",
      color: PROGRAM_COLORS.Conventional,
      donors: "All Fannie categories above, plus any 'unrelated individual with close, family-like ties' to the borrower. Wedding and graduation gifts from non-relatives are also allowed (must be deposited within 90 days).",
      notes: "The most liberal program — includes close family friends if the relationship is documented.",
    },
    {
      name: "FHA",
      color: PROGRAM_COLORS.FHA,
      donors: "Family member (as defined by HUD — includes cousins), employer, labor union, close friend with a documented relationship, charitable organization, or a government agency providing homeownership assistance.",
      notes: "Close-friend gifts require a detailed letter documenting the relationship and its length.",
    },
    {
      name: "VA",
      color: PROGRAM_COLORS.VA,
      donors: "Any donor who has no affiliation with the builder, developer, real estate agent, or any other party to the transaction.",
      notes: "Most flexible on relationship — no family requirement — but strict on avoiding conflicts of interest.",
    },
    {
      name: "USDA",
      color: P.sage,
      donors: "Any donor with no financial interest in the sale of the property (not the seller, builder, real estate agent, etc.).",
      notes: "Rules out interested parties but otherwise flexible on relationship.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray }}>
        Gift funds are cash from a qualified donor who expects no repayment. Every program allows them — but the rules on who can give, and how the money must be documented, vary significantly.
      </p>

      <h5 style={{ fontFamily: F.display, fontSize: 16, color: P.navy, marginTop: 10, marginBottom: 4 }}>Who qualifies as a donor</h5>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {programs.map((p, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${p.color}`, paddingLeft: 12, paddingTop: 2, paddingBottom: 2 }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: p.color, marginBottom: 2 }}>{p.name}</span>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: P.warmGray, marginBottom: 2 }}>{p.donors}</p>
            <p style={{ fontSize: 11, lineHeight: 1.5, color: P.warmGrayLight, fontStyle: "italic" }}>{p.notes}</p>
          </div>
        ))}
      </div>

      <div style={{ background: P.white, borderLeft: `3px solid ${P.gold}`, padding: "14px 18px", borderRadius: "0 8px 8px 0", marginTop: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 5 }}>🤓 Privacy Tip</span>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: P.text, fontWeight: 600, marginBottom: 6 }}>
          Keep the gift in the donor's account until closing — and we won't need their bank statements.
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.65, color: P.warmGray }}>
          When a donor sends gift funds directly to the title/closing agent (not to the borrower first), most programs don't require the donor to provide bank statements. A canceled check, wire confirmation, or cashier's check reflecting the donor as remitter is enough. This is a significant relief for family members who'd rather not share their full financial picture with a mortgage underwriter — and it's often the smoothest delivery path for everyone involved.
        </p>
      </div>

      <h5 style={{ fontFamily: F.display, fontSize: 16, color: P.navy, marginTop: 14, marginBottom: 4 }}>Every program requires a gift letter</h5>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: P.warmGray, marginBottom: 4 }}>
        The gift letter is signed by both the donor and borrower. It must include:
      </p>
      <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, lineHeight: 1.75, color: P.warmGray }}>
        <li>Donor's name, address, and phone number</li>
        <li>Donor's relationship to the borrower</li>
        <li>The dollar amount of the gift</li>
        <li>A statement that no repayment is expected or required</li>
      </ul>

      <p style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic", marginTop: 10, lineHeight: 1.6 }}>
        Gift requirements change periodically and may vary by lender overlay. This is a plain-English summary of current agency guidelines — your loan originator will confirm the exact documentation your file needs.
      </p>
    </div>
  );
}
