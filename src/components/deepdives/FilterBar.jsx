import { useEffect, useRef, useState } from "react";

// Slim sticky row: free-text search + a single Topics dropdown (button + listbox
// popover). Controlled: category + query live in the page; menuOpen is local UI
// state. Closes on select, outside-click, or Escape. Counts are passed in and
// already reflect the active query.
export function FilterBar({ query, onQueryChange, selectedCategory, onSelectCategory, options }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef(null);
  const active = selectedCategory !== "All";
  const buttonLabel = active ? selectedCategory : "All topics";

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const select = (value) => {
    onSelectCategory(value);
    setMenuOpen(false);
  };

  return (
    <div className="ddfb-bar">
      <div className="ddfb-inner">
        <div className="ddfb-search-wrap">
          <span className="ddfb-search-icon" aria-hidden="true">🔍</span>
          <input
            className="ddfb-input"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search guides…"
            aria-label="Search deep dives"
          />
          {query && (
            <button type="button" className="ddfb-clear" aria-label="Clear search" onClick={() => onQueryChange("")}>
              ×
            </button>
          )}
        </div>

        <div className="ddfb-topics-wrap" ref={wrapRef}>
          <button
            type="button"
            className={`ddfb-topics-btn${active ? " active" : ""}`}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span aria-hidden="true">☰</span>
            <span className="ddfb-topics-label">{buttonLabel}</span>
            <span className="ddfb-caret" aria-hidden="true">{menuOpen ? "▴" : "▾"}</span>
          </button>

          {menuOpen && (
            <ul className="ddfb-menu" role="listbox" aria-label="Filter by topic">
              {options.map((opt) => {
                const isSel = opt.value === selectedCategory;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSel}
                    tabIndex={0}
                    className={`ddfb-option${isSel ? " selected" : ""}`}
                    onClick={() => select(opt.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        select(opt.value);
                      }
                    }}
                  >
                    <span className="ddfb-check" aria-hidden="true">{isSel ? "✓" : ""}</span>
                    <span className="ddfb-opt-label">{opt.label}</span>
                    <span className="ddfb-opt-count">{opt.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
