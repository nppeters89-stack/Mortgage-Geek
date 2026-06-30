import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { ARTICLES, CATEGORIES } from "../data/deepDives";
import { deepDivesCss } from "../components/deepdives/deepDivesStyles";
import { FeaturedCard } from "../components/deepdives/FeaturedCard";
import { FilterBar } from "../components/deepdives/FilterBar";
import { CategorySection } from "../components/deepdives/CategorySection";
import { EmptyState } from "../components/deepdives/EmptyState";

const FEATURED = ARTICLES.find((a) => a.featured);

export function DeepDivesHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");

  // Pure client-side filter: all cards render at build time (prerendered SEO
  // HTML); state only toggles visibility. A card is visible if its category
  // matches AND its (title + tagline) contains the trimmed, case-insensitive
  // query.
  const q = query.trim().toLowerCase();
  const matchesQuery = (a) => q === "" || `${a.title} ${a.tagline}`.toLowerCase().includes(q);
  const isVisible = (a) => (selectedCategory === "All" || a.cat === selectedCategory) && matchesQuery(a);

  const showFeatured = selectedCategory === "All" && q === "";
  const totalVisible = ARTICLES.filter(isVisible).length;
  const showEmpty = totalVisible === 0;

  // Dropdown counts reflect the active query (not the selected category) so they
  // update as the user types.
  const options = [
    { value: "All", label: "All topics", count: ARTICLES.filter(matchesQuery).length },
    ...CATEGORIES.map((cat) => ({
      value: cat,
      label: cat,
      count: ARTICLES.filter((a) => a.cat === cat && matchesQuery(a)).length,
    })),
  ];

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>
      <style>{deepDivesCss}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--light" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <a href="/" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      {/* Eyebrow + H1 + intro: kept exactly as built (copy untouched). */}
      <div style={{ padding: "48px 24px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🐳</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 10 }}>Deep Dives</span>
          <h1 style={{ fontFamily: F.display, fontSize: 42, color: P.navy, fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}>
            Where <em style={{ fontStyle: "italic", color: P.gold }}>real questions</em> get real answers.
          </h1>
          <p style={{ fontSize: 15, color: P.warmGray, maxWidth: 620, margin: "0 auto", lineHeight: 1.65 }}>
            Mortgage guidelines aren't one-size-fits-all. Different loan programs have different rules — sometimes dramatically different. These deep dives compare how the five major programs handle common borrower situations, with clear answers and the source handbook sections cited.
          </p>
        </div>
      </div>

      {showFeatured && (
        <div className="dd-wrap" style={{ marginBottom: 32 }}>
          <FeaturedCard article={FEATURED} />
        </div>
      )}

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        options={options}
      />

      <div className="dd-wrap">
        {showEmpty ? (
          <EmptyState />
        ) : (
          CATEGORIES.map((cat, i) => (
            <CategorySection
              key={cat}
              number={String(i + 1).padStart(2, "0")}
              title={cat}
              articles={ARTICLES.filter((a) => a.cat === cat && isVisible(a))}
            />
          ))
        )}
      </div>

      <div className="dd-wrap" style={{ paddingBottom: 64 }}>
        <div style={{ textAlign: "center", padding: "24px", background: P.creamDark, borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: P.warmGray, fontStyle: "italic" }}>More deep dives coming soon. Got a topic you want covered? <a href="tel:+16156560737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Call (615) 656-0737</a>.</p>
        </div>
      </div>

      <MobileToolbar />
    </main>
  );
}
