import { useState } from "react";
import { P, F } from "../../theme";
import { SectionHeader } from "./SectionHeader";

export function PreApprovalChecklist() {
  const STORAGE_KEY = "mg_checklist";
  const [sectionOpen, setSectionOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : {}; }
    catch { return {}; }
  });
  const toggle = (id) => {
    setCheckedItems(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const resetAll = () => {
    setCheckedItems({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const categories = [
    { title: "Income & Employment", items: [
      { id: "paystubs", label: "Most recent 30 days of pay stubs" },
      { id: "w2", label: "W-2s from the past 2 years" },
      { id: "tax_returns", label: "Federal tax returns (past 2 years) — all pages" },
      { id: "self_employed", label: "If self-employed: business tax returns + year-to-date profit & loss" },
      { id: "other_income", label: "Other income docs: Social Security, pension, rental income, alimony, etc." },
    ]},
    { title: "Assets & Bank Statements", items: [
      { id: "bank_statements", label: "Most recent 2 months of bank statements — all pages, all accounts" },
      { id: "retirement", label: "Retirement / investment account statements (most recent quarter)" },
      { id: "gift_letter", label: "If using gift funds: gift letter + proof of donor's ability + transfer documentation" },
      { id: "large_deposits", label: "Explanation for any large deposits (outside of regular payroll)" },
    ]},
    { title: "Identity & Residency", items: [
      { id: "drivers_license", label: "Valid government-issued photo ID (driver's license or passport)" },
      { id: "ssn", label: "Social Security number (for credit pull authorization)" },
      { id: "address_history", label: "Addresses for the past 2 years" },
      { id: "rent_history", label: "Landlord contact info or 12 months of rent payment proof (if renting)" },
    ]},
    { title: "Property & Debts", items: [
      { id: "purchase_contract", label: "Signed purchase contract (once you're under contract)" },
      { id: "real_estate_owned", label: "Details on any real estate you currently own" },
      { id: "debt_info", label: "Monthly debt obligations: car payments, student loans, credit cards, child support" },
      { id: "bankruptcy", label: "If applicable: bankruptcy discharge papers, divorce decree" },
    ]},
    { title: "VA Borrowers (if applicable)", items: [
      { id: "dd214", label: "DD-214 (Certificate of Release or Discharge)" },
      { id: "coe", label: "Certificate of Eligibility (COE) — or I can pull this for you" },
      { id: "disability_letter", label: "If exempt from funding fee: VA disability rating letter" },
    ]},
  ];

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section id="checklist" style={{ padding: "64px 40px" }}>
      <div onClick={() => setSectionOpen(!sectionOpen)} style={{ cursor: "pointer" }}>
        <SectionHeader eyebrow="Get Organized" title={`Pre-Approval Checklist ${sectionOpen ? "−" : "+"}`} subtitle={sectionOpen ? "Gathering these documents before you apply will speed up your approval and reduce back-and-forth. Check them off as you go." : (checkedCount > 0 ? `Click to expand — you've checked off ${checkedCount} of ${totalItems} items.` : `Click to reveal ${totalItems} documents to gather before you apply.`)} />
      </div>
      {sectionOpen && (
      <div style={{ maxWidth: 720 }}>
        {/* Progress bar */}
        <div className="content-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: P.navy }}>{checkedCount} of {totalItems} items ready</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: P.warmGrayLight }}>{totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0}%</span>
              {checkedCount > 0 && (
                <button onClick={resetAll} style={{ background: "none", border: "none", fontSize: 11, color: P.textLight, cursor: "pointer", fontFamily: F.body, opacity: 0.6, textDecoration: "underline" }}>Reset</button>
              )}
            </div>
          </div>
          <div style={{ height: 8, background: P.creamDark, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(checkedCount / totalItems) * 100}%`, background: checkedCount === totalItems ? P.success : P.gold, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          {checkedCount > 0 && checkedCount < totalItems && (
            <p style={{ fontSize: 10, color: P.warmGrayLight, marginTop: 6, textAlign: "center" }}>Your progress is saved automatically</p>
          )}
          {checkedCount === totalItems && (
            <p style={{ fontSize: 12, color: P.success, fontWeight: 600, marginTop: 8, textAlign: "center" }}>You're ready to apply! Reach out and let's get started.</p>
          )}
        </div>

        {categories.map((cat, ci) => (
          <div key={ci} className="content-card" style={{ padding: "20px 24px", marginBottom: 10 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: P.navy, marginBottom: 12 }}>{cat.title}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cat.items.map((item) => (
                <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, lineHeight: 1.5, color: checkedItems[item.id] ? P.warmGrayLight : P.text }}>
                  <input type="checkbox" checked={!!checkedItems[item.id]} onChange={() => toggle(item.id)}
                    style={{ marginTop: 3, accentColor: P.gold, flexShrink: 0 }} />
                  <span style={{ textDecoration: checkedItems[item.id] ? "line-through" : "none" }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 18px", background: P.white, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🤓</span>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: P.warmGray }}>
            <strong>Don't have everything?</strong> That's okay — you don't need every single item to get started. A pre-qualification conversation only needs the basics. We can work through the rest as your application progresses.
          </p>
        </div>
      </div>
      )}
    </section>
  );
}
