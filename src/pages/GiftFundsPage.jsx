import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { ShareButton } from "../components/ShareButton";
import { articleSchema } from "../utils/schema";
import { GiftFundDonorMatrix } from "../components/GiftFundDonorMatrix";

const TITLE = "Gift Funds for Down Payment: Who Can Give, How They Document It, by Loan Program | Mortgage Geek";
const DESCRIPTION = "Gift funds mortgage rules: donor eligibility by loan program, gift letter requirements, transfer documentation, the donor-direct-to-title privacy path. Real LO guide.";
const PATH = "/deep-dives/gift-funds";
const URL = `https://mortgagegeek.ai${PATH}`;
const PUBLISHED = "2026-04-29";
const MODIFIED = "2026-04-29";

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: P.navy, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function Para({ children, noMargin }) {
  return (
    <p style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.75, marginBottom: noMargin ? 0 : 14 }}>
      {children}
    </p>
  );
}

function H2({ children }) {
  const text = typeof children === "string" ? children : "";
  const colonIdx = text.indexOf(".");
  const before = colonIdx > -1 ? text.slice(0, colonIdx + 1) : text;
  const after = colonIdx > -1 ? text.slice(colonIdx + 1) : "";
  return (
    <h2 style={{ fontFamily: F.display, fontSize: 28, color: P.navy, fontWeight: 400, lineHeight: 1.2, marginTop: 48, marginBottom: 18 }}>
      {before}
      {after && <em style={{ fontStyle: "italic", color: P.gold, fontWeight: 400 }}>{after}</em>}
    </h2>
  );
}

function H3({ children }) {
  return (
    <h3 style={{ fontFamily: F.body, fontSize: 17, color: P.navy, fontWeight: 600, lineHeight: 1.3, marginTop: 28, marginBottom: 12 }}>
      {children}
    </h3>
  );
}

function GeekTip({ title, children }) {
  const [open, setOpen] = useState(false);
  const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const panelId = `geektip-panel-${slug}`;
  return (
    <div style={{ background: P.navy, borderRadius: 8, margin: "24px 0", borderLeft: `3px solid ${P.gold}` }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          minHeight: 44,
          padding: "14px 22px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: F.body,
        }}
      >
        <span style={{ fontSize: 16 }}>🤓</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: P.goldLight, flex: 1 }}>Geek Tip — {title}</span>
        <span aria-hidden="true" style={{ fontSize: 20, color: P.goldLight, lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div id={panelId} style={{ padding: "0 22px 18px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TipBody({ text }) {
  return (
    <p style={{ fontSize: 14, color: P.cream, lineHeight: 1.7, marginBottom: 10 }}>
      {renderInline(text).map((piece, j) =>
        typeof piece === "string" ? piece :
        piece.type === "strong" ? <strong key={j} style={{ color: P.goldLight, fontWeight: 600 }}>{piece.props.children}</strong> :
        piece
      )}
    </p>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 14px 0" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 15, color: P.warmGray, lineHeight: 1.7, padding: "4px 0 4px 22px", position: "relative" }}>
          <span style={{ position: "absolute", left: 6, top: 4, color: P.gold, fontWeight: 700 }}>•</span>
          {renderInline(item)}
        </li>
      ))}
    </ul>
  );
}

const LINK_STYLE = { color: P.navy, fontWeight: 600, textDecoration: "underline" };

export function GiftFundsPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        schema={articleSchema({
          title: "Gift Funds for Down Payment: Who Can Give, How They Document It, by Loan Program",
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
        })}
      />
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--light" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShareButton variant="header" headerTone="light" />
            <a href="/deep-dives" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500 }}>← All Deep Dives</a>
          </div>
        </div>
      </div>

      <article className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 860, margin: "0 auto" }}>

        <header style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.gold }}>🐳 Deep Dive</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight }}>·</span>
            <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified April 2026</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 40, color: P.navy, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
            Gift Funds for Down Payment: <em style={{ fontStyle: "italic", color: P.gold }}>Who Can Give, How They Document It, by Loan Program</em>
          </h1>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7, marginBottom: 14 }}>
            Gift funds are cash from a qualified donor who expects no repayment. Every major loan program allows them. The catch is that the rules on who can give, and how the money has to be documented, vary significantly between programs, and getting the details wrong can delay your closing.
          </p>
          <p style={{ fontSize: 16, color: P.warmGray, lineHeight: 1.7 }}>
            This page covers what's required for each loan program, who qualifies as a donor, what the gift letter has to say, and how the money has to move from the donor to your closing. If you're planning to use a gift toward your down payment or closing costs, this is your reference.
          </p>
        </header>

        <div style={{ background: "rgba(207, 51, 56, 0.06)", border: `1px solid rgba(207, 51, 56, 0.25)`, borderRadius: 8, padding: "16px 20px", marginBottom: 36, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤓</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 6 }}>A note on who wrote this</p>
            <p style={{ fontSize: 13.5, color: P.warmGray, lineHeight: 1.7, margin: 0 }}>
              I'm Nick Peters (NMLS #1119524), a licensed loan originator. The rules below come from agency guidelines (Fannie Mae Selling Guide B3-4.3-04, Freddie Mac Single-Family Seller/Servicer Guide Section 5501.4, HUD Handbook 4000.1, VA Pamphlet 26-7, USDA HB-1-3555) and 12+ years of writing files where gift funds were involved. Lenders vary on this topic, especially around documentation specifics. Your specific file is evaluated by your lender's underwriter against agency guidelines plus their own overlays.
            </p>
          </div>
        </div>

        <H2>First, what counts as a "gift"?</H2>
        <Para>
          In mortgage underwriting, <strong style={{ color: P.navy, fontWeight: 600 }}>a gift is cash or equity provided to the borrower by a qualified donor with no expectation of repayment.</strong> Three core requirements apply across every loan program:
        </Para>
        <Bullets items={[
          "**No repayment.** The funds must truly be a gift. If there's any expectation that you'll pay the donor back (now or later), the funds are a loan, and loans aren't an acceptable source of down payment.",
          "**Donor must be qualified.** Each loan program defines who can give. Some programs are broad (VA, USDA), some are restricted to specific categories (FHA, Fannie Mae, Freddie Mac).",
          "**Funds must be documented.** Gift letters, transfer evidence, and sometimes the donor's bank statements are required to confirm the gift is legitimate and the money actually moved.",
        ]} />
        <Para>
          Sources that are not acceptable as gift funds across all loan programs:
        </Para>
        <Bullets items={[
          "**Cash on hand.** Funds held outside a financial institution don't count, even if you can prove the donor has them.",
          "**Borrowed funds.** If the donor took out a loan to fund the gift, the gift may still be acceptable but requires additional documentation showing the loan source isn't an interested party in your transaction.",
          "**Anyone with a financial interest in the property sale.** Sellers, builders, real estate agents, mortgage loan officers, and anyone affiliated with these parties cannot be donors.",
        ]} />

        <H2>Who can give. The big chart.</H2>
        <Para>
          Below is the at-a-glance comparison. The donor categories on the left axis run from broadest (family) to most restricted (institutions). The five program columns show whether each donor type is eligible. <strong style={{ color: P.navy, fontWeight: 600 }}>The first thing to look at is your row.</strong> If your donor falls into a category that isn't allowed under your loan program, the gift won't count and you'll need a different source of funds or a different program.
        </Para>

        <GiftFundDonorMatrix />

        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Important context for VA and USDA:</strong> These two programs don't enumerate eligible donor categories the way <a href="/deep-dives/fha-manual-underwriting" style={LINK_STYLE}>FHA</a>, Fannie Mae, and Freddie Mac do. Their rule is simpler: anyone who is not an interested party to the transaction can be a donor. That makes <a href="/deep-dives/va-manual-underwriting" style={LINK_STYLE}>VA</a> and <a href="/deep-dives/usda-manual-underwriting" style={LINK_STYLE}>USDA</a> the most flexible programs on relationship requirements. The chart shows ✓ across the board for VA and USDA because every category listed is allowed under the no-interested-party framework.
        </Para>
        <Para>
          A few program-specific features worth knowing:
        </Para>
        <Bullets items={[
          "**Fannie Mae** also allows trust or estate gifts from a related person, with proper trust/estate documentation in the gift letter.",
          "**Freddie Mac** is the most expansive on extended relationships. It allows an unrelated individual with close, family-like ties as a donor. It also has a unique rule for wedding and graduation gifts (covered below).",
          "**FHA** explicitly includes employers, labor unions, charitable organizations, and government agencies. But cousins go through the close-friend documentation path, not the family path.",
        ]} />

        <H2>The donor-direct-to-title privacy path</H2>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>This is the most useful practical insight on this page.</strong>
        </Para>
        <Para>
          When a donor sends gift funds directly to the title or closing agent (not to the borrower first), most programs do not require the donor to provide their bank statements. A canceled check, wire confirmation, or cashier's check that reflects the donor as remitter is enough.
        </Para>
        <Para>
          Why this matters: many family members would rather not share their full financial picture with a mortgage underwriter. A parent who's giving their child $30,000 for a down payment doesn't necessarily want to hand over two months of bank statements showing their entire financial situation. The donor-direct-to-title path avoids that.
        </Para>

        <GeekTip title="Keep the gift in the donor's account until closing">
          <TipBody text="When the donor sends gift funds directly to the title agent or settlement agent at closing (instead of transferring them to the borrower's account first), most programs don't require the donor to share bank statements. A canceled check, wire confirmation, or cashier's check showing the donor as the source is usually sufficient. This is a significant relief for family members who'd rather not share their full financial picture with a mortgage underwriter, and it's often the smoothest delivery path for everyone involved." />
        </GeekTip>

        <Para>
          The donor-direct-to-title path is allowed across all five major loan programs, with slight variations in what specific documentation is acceptable. For most files, the cleanest approach is:
        </Para>
        <Bullets items={[
          "Donor completes and signs the gift letter",
          "At or near closing, donor wires the funds directly to the title company or sends a cashier's check from their bank with the donor's name as remitter",
          "The Closing Disclosure shows the gift funds as having been received from the donor",
          "No donor bank statements required",
        ]} />
        <Para>
          Two scenarios where this gets more complicated:
        </Para>
        <Bullets items={[
          "**FHA effective 8/19/2024:** Money orders are no longer accepted as documentation when funds are sent directly to title. Use electronic transfer, bank certified check, cashier's check, or other official bank check instead.",
          "**Fannie Mae's deposit account requirement:** Even on the direct-to-title path, Fannie wants to see that funds came from a deposit institution account (checking, savings, investment, or trust/estate account owned by the donor). A donor's third-party payment app like Venmo or Zelle, by itself, isn't sufficient unless the documentation shows the funds moved through the donor's actual bank account.",
        ]} />

        <H2>What every gift letter must say</H2>
        <Para>
          A <strong style={{ color: P.navy, fontWeight: 600 }}>gift letter</strong> is a written, signed document that confirms the gift is legitimate. It's required across every loan program, and the requirements are essentially identical regardless of program.
        </Para>
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>Important:</strong> You don't have to draft the gift letter yourself. Your loan officer will send you (and your donor) a standard gift letter form to fill out. It's a fill-in-the-blanks document, not something you write from scratch. The information below is what the form will ask for, so you and your donor know what to expect when it arrives.
        </Para>
        <Para>
          The standard gift letter requires:
        </Para>
        <Bullets items={[
          "**Donor's name, address, and phone number**",
          "**Donor's relationship to the borrower** (specifically: how they're related and, in the case of a friend or extended relationship, the nature of the relationship)",
          "**The dollar amount of the gift** (Freddie Mac and Fannie Mae allow either the actual amount or a maximum amount; FHA wants the actual amount)",
          "**A statement that no repayment is expected or required**",
          "**Signatures and dates from both the donor and the borrower**",
        ]} />
        <Para>
          If the gift is from a trust or estate (Fannie Mae and Freddie Mac), the gift letter must additionally name the trust or estate and be signed by the trustee or authorized representative.
        </Para>
        <Para>
          One Freddie Mac detail worth noting: as of 2022, Freddie permits gift letters to state either the actual amount or the maximum amount. This eliminates the need for a corrected gift letter if the actual gift comes in slightly less than originally planned.
        </Para>

        <GeekTip title="Don't deposit the gift before the gift letter is signed">
          <TipBody text="If you deposit a gift into your account before the donor has signed the gift letter, the underwriter will see a large unexplained deposit on your bank statement. You'll then have to source it after the fact, which is more complicated than just having the gift letter ready first. The right sequence: gift letter signed first, transfer second, file submission third." />
        </GeekTip>

        <H2>How the money has to move</H2>
        <Para>
          Across all loan programs, the lender needs to see the <strong style={{ color: P.navy, fontWeight: 600 }}>paper trail</strong> of the gift moving from the donor to either you or the closing agent. The specific documentation required depends on which path the funds take.
        </Para>

        <H3>Path 1: Donor sends funds directly to title or closing agent (preferred)</H3>
        <Para>
          This is the cleanest path because the donor's bank statements are typically not required. Acceptable documentation:
        </Para>
        <Bullets items={[
          "**Electronic transfer (wire):** Wire confirmation showing the donor's account as the source",
          "**Cashier's check or bank certified check:** With the donor's name as remitter",
          "**Other official bank check**",
        ]} />
        <Para>
          <strong style={{ color: P.navy, fontWeight: 600 }}>FHA-specific note (case numbers on or after 8/19/2024):</strong> Money orders are no longer acceptable for this path. Use one of the alternatives above.
        </Para>

        <H3>Path 2: Donor sends funds to the borrower, who then deposits them</H3>
        <Para>
          This path is also acceptable but requires more documentation because the lender needs to verify both the donor's withdrawal and the borrower's deposit:
        </Para>
        <Bullets items={[
          "**Donor's canceled check** plus **evidence of deposit** into the borrower's account",
          "**Donor's withdrawal receipt** plus **evidence of deposit** into the borrower's account",
          "**Electronic transfer evidence** showing funds moving from donor's account to borrower's account",
          "**Donor's bank statement** showing the withdrawal and **borrower's deposit slip or statement** showing the deposit",
        ]} />
        <Para>
          The donor's bank statement may also be required in some programs to verify the donor had the funds available to give.
        </Para>

        <H3>Path 3: Donor sends funds directly to the builder (earnest money only)</H3>
        <Para>
          Some programs allow gift funds to be paid directly to the builder as earnest money, with documentation showing the gift on the Closing Disclosure. Specifically:
        </Para>
        <Bullets items={[
          "**Fannie Mae and Freddie Mac:** Allowed, with documentation of the gift from donor to builder/agent",
          "**FHA:** Allowed in some cases with the credit reflected on the CD",
          "**VA, USDA:** Generally allowed under the standard donor framework",
        ]} />
        <Para>
          For all paths: when the donor's contribution shows up on the Closing Disclosure as a credit toward the borrower's costs, the documentation must clearly tie that credit back to a qualified donor.
        </Para>

        <H2>Notable program-specific variations</H2>
        <Para>
          A few rules worth knowing because they unlock paths borrowers don't realize exist.
        </Para>

        <H3>Freddie Mac wedding and graduation gifts</H3>
        <Para>
          Freddie Mac is the only program with a formal rule for <strong style={{ color: P.navy, fontWeight: 600 }}>wedding and graduation gifts from anyone</strong>, related or unrelated. The rule:
        </Para>
        <Bullets items={[
          "**Eligibility:** Wedding gifts and graduation gifts from anyone (including unrelated persons) are allowed for primary residence purchases only.",
          "**Timing:** Gift funds must be deposited in the borrower's account within 90 days of the marriage license/certificate date or the graduation date.",
          "**Documentation:** A copy of the marriage license/certificate or the diploma/transcript supporting the date, plus verification of the gift funds in the borrower's depository account.",
        ]} />
        <Para>
          This is genuinely useful for newlyweds or recent graduates who received cash gifts from extended family, friends, or coworkers. Outside of this rule, most of those donors wouldn't qualify under Freddie's standard donor criteria.
        </Para>

        <GeekTip title="The wedding/graduation rule is one of the most under-used gift fund paths">
          <TipBody text="If you got married or graduated within the last 90 days and received cash gifts from people who aren't relatives, those gifts are usable on a Freddie Mac mortgage even though they wouldn't qualify under the standard donor categories. Most LOs don't volunteer this rule because it doesn't come up often, but if it fits your situation, it can be a meaningful unlock. Bring documentation of the event and the deposits." />
        </GeekTip>

        <H3>FHA's close-friend rule</H3>
        <Para>
          FHA allows close friends as donors, but the documentation bar is higher than for family. The friend must have a "clearly defined and documented interest in the borrower," which the underwriter validates through a Letter of Explanation from the donor that includes:
        </Para>
        <Bullets items={[
          "Name of donor and their relationship to borrower",
          "Detailed explanation of the relationship, including length of time",
        ]} />
        <Para>
          A note on cousins: under FHA's current handbook (4000.1), cousins aren't automatically classified as family members. They typically go through the close-friend documentation path instead. The matrix from many lenders explicitly notes that a cousin can qualify as a close friend of the borrower, meaning the close-friend LOE serves the documentation purpose for cousin gifts.
        </Para>

        <H3>Trust and estate gifts (Fannie Mae and Freddie Mac)</H3>
        <Para>
          Both Fannie Mae and Freddie Mac allow gifts from a <strong style={{ color: P.navy, fontWeight: 600 }}>trust established by a related person</strong> or <strong style={{ color: P.navy, fontWeight: 600 }}>the estate of a related person</strong>. The gift letter must name the trust or estate and be signed by the trustee or authorized representative. This matters when an inheritance or trust distribution is being used toward a down payment.
        </Para>

        <H3>What about foreign donors?</H3>
        <Para>
          Funds that originate from a country on the OFAC sanctions list are subject to additional review and may not be eligible at all. If your donor is overseas or the funds are coming from a foreign account, expect the lender to request additional source documentation and to verify the donor and the country of origin against the OFAC sanctions list. Most files with foreign-source gifts close fine; they just take longer.
        </Para>

        <H2>Why gift fund files fail. The patterns I see.</H2>
        <Para>
          Like any other component of a mortgage file, gift funds have predictable failure modes:
        </Para>
        <Bullets items={[
          "**Surprise donor disqualification.** Borrower assumes their boss, a family friend, or an extended relative qualifies as a donor. They don't, under the specific loan program. The file pivots late or has to find different funds. Fix: confirm donor eligibility at pre-approval, not at conditions.",
          "**Cash deposit before gift letter.** Borrower deposits cash from a relative into their account before the gift letter is signed. The deposit shows up on bank statements as unexplained, and even with a retroactive gift letter, the file becomes more complicated to source. Fix: get the gift letter signed first, then transfer the funds.",
          "**Matching deposits in the donor's account.** When the donor's bank statements are reviewed, large deposits that match the gift amount need explanation. If the donor recently received $25,000 from somewhere and is now giving $25,000 to the borrower, the underwriter wants to know where the donor's $25,000 came from. A loan from an interested party, a payment from the seller's family, or a similarly suspect source disqualifies the gift. Fix: if your donor recently received a large deposit, be ready to document its source.",
          "**Money orders on FHA files (post-8/19/2024).** Donor sends a money order to the title agent thinking it's a cashier's check. The underwriter rejects it. Files have to be reworked late in the process. Fix: use a wire, cashier's check, or bank certified check instead.",
          "**Venmo, Zelle, or CashApp transfers without bank account documentation.** Donor sends gift funds via a payment app, and the only documentation is the app screenshot. The lender needs to see the funds going through the donor's actual bank account. Fix: have the donor send funds via wire or check from their bank, or supplement the app screenshot with the donor's bank statement showing the transfer.",
          "**Gift on a non-allowed property type.** Gift funds can't be used for investment property purchases. If you're using the loan for a rental property, the gift fund framework doesn't apply at all. Fix: structure differently or use personal funds for investment properties.",
          "**Borrower repays the donor after closing.** The gift becomes a loan retroactively, which violates the no-repayment rule. Lenders rarely catch this directly, but if the borrower mentions it casually or the donor's later financial transactions reveal it, the loan can be flagged for fraud. Fix: a gift is a gift. If you intend to repay the donor, structure it as a private loan from the start, but understand that loans aren't acceptable down payment sources.",
        ]} />
        <Para>
          In my experience, well-prepared gift fund files close at very high rates. The failures are almost always about preparation gaps that could have been caught at <a href="/prequal" style={LINK_STYLE}>pre-approval</a>.
        </Para>

        <H2>Frequently asked questions</H2>

        <H3>Is there a maximum gift amount?</H3>
        <Para>
          There's no agency-set maximum on gift funds for a primary residence purchase. The IRS has annual gift tax exclusion limits for the donor's tax purposes (currently $19,000 per donor per recipient in 2026, or higher under lifetime exemption rules), but those are tax considerations, not mortgage qualifying limits. From the lender's perspective, the gift can cover the entire down payment and closing costs on a primary residence. Second homes and 2-4 unit principal residences with high LTV may require a 5% borrower contribution from the borrower's own funds.
        </Para>

        <H3>Do I have to pay tax on the gift?</H3>
        <Para>
          Generally no, gift recipients don't pay tax on gifts received. The donor may have tax-reporting obligations if the gift exceeds the annual exclusion ($19,000 in 2026), but the donor is responsible for that filing, not the recipient. Talk to a tax professional for specifics on your situation. Mortgage qualifying isn't affected either way.
        </Para>

        <H3>Can the donor send funds via Venmo or Zelle?</H3>
        <Para>
          Yes, but with the right documentation. Funds transferred via third-party payment apps are acceptable when the file documents that the funds moved from the donor's actual bank account through the app to the borrower's account or to the closing agent. A screenshot of the app transfer alone usually isn't enough; the lender will want to see the donor's bank statement showing the transfer to the app, and your bank statement showing the receipt.
        </Para>

        <H3>Can my parents pay my closing costs directly to the title company?</H3>
        <Para>
          Yes, this is the donor-direct-to-title path. As long as the gift letter is in place and the donor's payment is documented (wire confirmation, cashier's check with donor as remitter, etc.), the funds count as a qualified gift. This is often the cleanest path because the donor doesn't have to share their full bank statements.
        </Para>

        <H3>Will my donor's bank statements be reviewed?</H3>
        <Para>
          Sometimes, depending on the path. If the donor sends funds directly to the title or closing agent, most programs don't require the donor's bank statements. If the donor sends funds to your account first and you then deposit them, the donor's bank statement showing the withdrawal is typically required. The donor-to-title path is the privacy-friendly option.
        </Para>

        <H3>What if my donor isn't a US citizen?</H3>
        <Para>
          Non-citizen donors are generally allowed across all loan programs, with no specific citizenship requirement. The funds may receive additional scrutiny if they originate from countries on the OFAC sanctions list, in which case extra documentation and review is required. Otherwise, the donor's citizenship status doesn't disqualify the gift.
        </Para>

        <H3>Can the same donor give to multiple borrowers?</H3>
        <Para>
          Yes. A donor can give to multiple borrowers, including in the same transaction (parents giving to both adult children who are buying together, for example). Each gift requires its own gift letter and documentation. Tax considerations for the donor are separate.
        </Para>

        <H2>A final note. What this page is and isn't.</H2>
        <Para>
          This page summarizes gift fund mortgage rules across the major agency loan programs as they exist in 2026. It is not:
        </Para>
        <Bullets items={[
          "**Tax advice.** Tax implications of gift-giving are between the donor and a tax professional.",
          "**A guarantee that any specific gift will be approved.** Lender overlays vary, and individual underwriters may request additional documentation.",
          "**A substitute for your LO.** Specific files require specific evaluation.",
        ]} />
        <Para>
          If you have a self-employed donor whose gift comes from business funds, that's a different framework. For more on how lenders evaluate business funds going to personal use, see the <a href="/deep-dives/self-employed-documentation" style={LINK_STYLE}>Self-Employment Documentation Deep Dive</a>. And if you're trying to figure out how a gift moves the math on your monthly numbers, the <a href="/calculator" style={LINK_STYLE}>calculator</a> is the fastest way to see it.
        </Para>
        <Para>
          If you're navigating a mortgage application with gift funds in play and want to talk through your specific situation, I'm reachable at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={LINK_STYLE}>(615) 656-0737</a> or <a href="mailto:Nick.Peters@rate.com" aria-label="Email Nick Peters at Nick.Peters@rate.com" style={LINK_STYLE}>Nick.Peters@rate.com</a>. Bring an idea of who's giving, how much, and what loan program you're targeting. We'll work through the rest.
        </Para>

        <div style={{ marginTop: 48, padding: "28px 28px", background: P.creamDark, borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 20, color: P.navy, fontWeight: 600, marginBottom: 6, fontFamily: F.display }}>Got a gift in play and want to talk through it?</p>
          <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 4 }}>
            Call me at <a href="tel:+16156560737" aria-label="Call Nick Peters at 615-656-0737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>(615) 656-0737</a> or email <a href="mailto:Nick.Peters@rate.com" aria-label="Email Nick Peters at Nick.Peters@rate.com" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Nick.Peters@rate.com</a>.
          </p>
          <p style={{ fontSize: 13, color: P.warmGrayLight, lineHeight: 1.65, fontStyle: "italic" }}>
            Bring an idea of who's giving, how much, and what loan program you're targeting. We'll work through the rest before you go under contract.
          </p>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, lineHeight: 1.6, marginTop: 40, fontStyle: "italic" }}>
          Sources: Fannie Mae Selling Guide B3-4.3-04 (Personal Gifts); Freddie Mac Single-Family Seller/Servicer Guide Section 5501.4 (Other sources of funds); FHA Single Family Housing Policy Handbook 4000.1, Sections II.A.4.d.iii(F) and II.A.5.c.iii(F) (Gifts); FHA policy update effective for case numbers assigned on or after 8/19/2024 (gift fund documentation methods); VA Lender's Handbook (Pamphlet 26-7), Chapter 4; USDA Rural Development Single Family Housing Guaranteed Loan Program Handbook (HB-1-3555), Chapter 9; author's 12+ years of field experience originating mortgages with gift fund components.
        </p>


      </article>

      <MobileToolbar />
    </main>
  );
}
