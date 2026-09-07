"""
Rent vs. Own reference implementation (Python) for fixture parity with the JS sim.

Reproduces the live mortgagegeek.ai/rent-vs-own model exactly when the four new
inputs are zeroed (maint_rate=0, cost_growth=0, renter_ins=0, hv_g=0.054), and
defines the target behavior for the four additions:

  1. maint_rate   : maintenance, % of CURRENT home value per year, charged monthly
  2. cost_growth  : annual growth applied to property tax, homeowners insurance,
                    and renter's insurance (stepped once per year, like rent)
  3. renter_ins   : renter's insurance, $/month in year 0
  4. hv_g         : appreciation default moves from ASPUS 5.4% to a repeat-sales CAGR

Conventions that must match the JS sim exactly (these are the ones that were
verified against the published table):
  - Home value steps once per year: hv(y) = price * (1 + hv_g) ** y
  - Rent steps once per year:       rent(y) = rent0 * (1 + rent_g) ** y
  - Side funds compound monthly at inv_g / 12 (simple division, not geometric)
  - Order inside each month: grow both side funds, THEN add that month's surplus
  - PMI charged while balance > pmi_stop * price (78% of ORIGINAL price)
  - Owner wealth at year y = hv(y) * (1 - sell_pct) - balance + owner_side
  - Breakeven = first year (annual snapshot) where owner >= renter; None if never

Run:  python3 rent_vs_own_reference.py   (prints all fixtures)
"""

def sim(price=350000, dp_pct=0.035, rate=0.0675, term=30,
        rent0=2000, rent_g=0.041, hv_g=0.054, inv_g=0.10,
        cc_pct=0.03, sell_pct=0.07,
        tax_rate=0.0095, ins_rate=0.0035,
        pmi_rate=0.0052, pmi_stop=0.78,
        maint_rate=0.0, cost_growth=0.0, renter_ins=0.0,
        horizon=30):
    loan = price * (1 - dp_pct)
    dp = price * dp_pct
    cc = price * cc_pct
    r = rate / 12
    n = term * 12
    pmt = loan * r / (1 - (1 + r) ** -n)
    bal = loan
    renter = dp + cc          # renter invests owner's upfront cash on day one
    side = 0.0                # owner side fund
    im = inv_g / 12
    rows = []
    for y in range(horizon + 1):
        hv = price * (1 + hv_g) ** y
        rows.append(dict(year=y, owner=hv * (1 - sell_pct) - bal + side,
                         renter=renter, bal=bal, side=side, hv=hv))
        if y == horizon:
            break
        esc = (1 + cost_growth) ** y
        rent = rent0 * (1 + rent_g) ** y
        tax_m = price * tax_rate / 12 * esc
        ins_m = price * ins_rate / 12 * esc
        rins_m = renter_ins * esc
        maint_m = hv * maint_rate / 12
        for _ in range(12):
            interest = bal * r
            principal = pmt - interest
            pmi = loan * pmi_rate / 12 if bal > pmi_stop * price else 0.0
            own = pmt + pmi + tax_m + ins_m + maint_m
            diff = own - (rent + rins_m)
            renter *= (1 + im)
            side *= (1 + im)
            if diff > 0:
                renter += diff
            else:
                side += -diff
            bal -= principal
    return rows, pmt

def breakeven(rows):
    for r in rows:
        if r['owner'] >= r['renter']:
            return r['year']
    return None

def band(**kw):
    """Breakeven under nearby assumptions: appreciation +/-0.5pt, maintenance +/-0.5pt (floor 0)."""
    base_g = kw.get('hv_g', 0.054)
    base_m = kw.get('maint_rate', 0.0)
    out = {}
    for label, g, m in [("appr-0.5", base_g - 0.005, base_m), ("appr+0.5", base_g + 0.005, base_m),
                        ("maint+0.5", base_g, base_m + 0.005), ("maint-0.5", base_g, max(0.0, base_m - 0.005))]:
        k = dict(kw); k['hv_g'] = g; k['maint_rate'] = m
        out[label] = breakeven(sim(**k)[0])
    return out

def print_fixture(name, **kw):
    rows, pmt = sim(**kw)
    print(f"\n### {name}")
    print("inputs:", {k: v for k, v in kw.items()})
    print(f"P&I payment: {pmt:,.2f}")
    print("year | owner_wealth | renter_portfolio | advantage | balance | owner_side")
    for y in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30]:
        r = rows[y]
        print(f"{y:>4} | {r['owner']:>12,.0f} | {r['renter']:>16,.0f} | {r['owner']-r['renter']:>9,.0f} | {r['bal']:>9,.0f} | {r['side']:>10,.0f}")
    print("breakeven year:", breakeven(rows))
    print("band:", band(**kw))

if __name__ == "__main__":
    print("FIXTURE A. Regression: live defaults, new inputs zeroed. MUST match the published table exactly.")
    print_fixture("A", maint_rate=0.0, cost_growth=0.0, renter_ins=0.0, hv_g=0.054)

    print("\nFIXTURE B. New model at explicit test inputs (appreciation 4.5% is a TEST value, not the final default).")
    print_fixture("B", maint_rate=0.01, cost_growth=0.03, renter_ins=20.0, hv_g=0.045)

    print("\nFIXTURE C. Same as B, 20% down conventional (no PMI).")
    print_fixture("C", dp_pct=0.20, pmi_rate=0.0, maint_rate=0.01, cost_growth=0.03, renter_ins=20.0, hv_g=0.045)

    print("\nFIXTURE D. Same as B, investment return 7% (the preset).")
    print_fixture("D", maint_rate=0.01, cost_growth=0.03, renter_ins=20.0, hv_g=0.045, inv_g=0.07)

    print("\nFIXTURE E. Maintenance only (isolates the maintenance charge).")
    print_fixture("E", maint_rate=0.01)

    print("\nFIXTURE F. Escalation + renter's insurance only (isolates the cost_growth path).")
    print_fixture("F", cost_growth=0.03, renter_ins=20.0)
