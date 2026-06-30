import { DEEP_DIVES as D, F } from "../../theme";

// One stylesheet for the /deep-dives index redesign, injected once by the page.
// Components stay presentational (markup + classNames). All colors come from the
// scoped DEEP_DIVES palette in theme.js (mapped by visual result). Light theme.
// Focus rings: 2px Arrow Red, offset 2-3px on every interactive element.
export const deepDivesCss = `
  .dd-wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

  /* ===== FeaturedCard ===== */
  .ddf-eyebrow { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: ${D.dim}; font-weight: 600; margin-bottom: 14px; }
  .ddf-card {
    display: flex; flex-wrap: wrap; gap: clamp(18px, 3vw, 28px); align-items: stretch;
    background: ${D.surface}; border: 1px solid ${D.divider}; border-radius: 20px;
    padding: clamp(22px, 3.5vw, 36px); text-decoration: none; color: inherit;
    transition: border-color 0.15s, background 0.15s;
  }
  .ddf-card:hover { border-color: ${D.accent}; background: ${D.hoverLift}; }
  .ddf-card:focus-visible { outline: 2px solid ${D.accent}; outline-offset: 3px; }
  .ddf-tile {
    flex: 0 0 auto; width: clamp(88px, 12vw, 124px); height: clamp(88px, 12vw, 124px);
    border-radius: 18px; background: ${D.inset}; display: flex; align-items: center;
    justify-content: center; font-size: clamp(44px, 7vw, 62px); line-height: 1;
  }
  .ddf-content { flex: 1 1 260px; min-width: 260px; display: flex; flex-direction: column; }
  .ddf-badge {
    align-self: flex-start; display: inline-flex; align-items: center;
    background: ${D.accent}; color: ${D.badgeText}; font-size: 12px; font-weight: 700;
    letter-spacing: 0.04em; padding: 5px 11px; border-radius: 999px; text-transform: uppercase;
    margin-bottom: 14px;
  }
  .ddf-title {
    font-family: ${F.display}; font-weight: 400; font-size: clamp(28px, 4vw, 40px);
    line-height: 1.08; letter-spacing: -0.01em; color: ${D.text}; margin: 0 0 12px;
  }
  .ddf-desc {
    font-family: ${F.body}; font-size: clamp(15px, 2vw, 17px); line-height: 1.6;
    color: ${D.body}; margin: 0 0 22px; max-width: 60ch;
  }
  .ddf-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .ddf-meta { font-size: 13px; color: ${D.dim}; font-weight: 500; }
  .ddf-read { font-size: 16px; color: ${D.accent}; font-weight: 600; }

  /* ===== LibraryCard ===== */
  .ddl-card {
    display: flex; flex-direction: column; height: 100%; padding: 20px; border-radius: 14px;
    background: ${D.surface}; border: 1px solid ${D.divider}; text-decoration: none; color: inherit;
    transition: border-color 0.15s, background 0.15s;
  }
  .ddl-card:hover { border-color: ${D.accent}; background: ${D.hoverLift}; }
  .ddl-card:focus-visible { outline: 2px solid ${D.accent}; outline-offset: 3px; }
  .ddl-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; min-height: 30px; }
  .ddl-emoji { font-size: 30px; line-height: 1; }
  .ddl-pill {
    font-size: 11px; font-weight: 700; letter-spacing: 0.04em; padding: 3px 9px;
    border-radius: 999px; color: #FFFFFF;
  }
  .ddl-title { font-family: ${F.display}; font-weight: 400; font-size: 21px; line-height: 1.12; color: ${D.text}; margin: 0 0 8px; }
  .ddl-tagline { font-family: ${F.body}; font-size: 14px; line-height: 1.5; color: ${D.muted}; margin: 0 0 16px; flex: 1; }
  .ddl-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .ddl-meta { font-size: 12px; color: ${D.dim}; }
  .ddl-read { font-size: 14px; color: ${D.accent}; font-weight: 600; }

  /* ===== CategorySection ===== */
  .ddcs-section { margin-bottom: 44px; }
  .ddcs-rule { border: none; border-top: 1px solid ${D.divider}; margin: 0 0 16px; }
  .ddcs-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; }
  .ddcs-num { font-size: 13px; color: ${D.dim}; font-variant-numeric: tabular-nums; font-weight: 600; letter-spacing: 0.04em; }
  .ddcs-h2 { font-family: ${F.display}; font-weight: 400; font-size: clamp(24px, 3vw, 31px); line-height: 1.1; color: ${D.text}; margin: 0; flex: 1; }
  .ddcs-count { font-size: 13px; color: ${D.dim}; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .ddcs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  /* ===== FilterBar ===== */
  .ddfb-bar {
    position: sticky; top: 0; z-index: 20; width: 100%;
    background: rgba(246, 245, 243, 0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid ${D.divider}; padding: 11px 0; margin-bottom: 28px;
  }
  .ddfb-inner { max-width: 1080px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 10px; }
  .ddfb-search-wrap { flex: 1; position: relative; display: flex; align-items: center; }
  .ddfb-search-icon { position: absolute; left: 13px; font-size: 14px; pointer-events: none; color: ${D.muted}; }
  .ddfb-input {
    width: 100%; box-sizing: border-box; background: ${D.inset}; border: 1px solid ${D.divider};
    border-radius: 11px; padding: 11px 38px 11px 36px; font-family: ${F.body}; font-size: 15px;
    color: ${D.text}; transition: border-color 0.15s;
  }
  .ddfb-input::placeholder { color: ${D.muted}; }
  .ddfb-input:hover { border-color: ${D.dividerStrong}; }
  .ddfb-input:focus-visible { outline: 2px solid ${D.accent}; outline-offset: 2px; border-color: ${D.accent}; }
  .ddfb-clear {
    position: absolute; right: 8px; width: 26px; height: 26px; border: none; background: transparent;
    color: ${D.muted}; font-size: 18px; line-height: 1; cursor: pointer; border-radius: 999px;
    display: flex; align-items: center; justify-content: center;
  }
  .ddfb-clear:hover { color: ${D.text}; background: ${D.menuHover}; }
  .ddfb-clear:focus-visible { outline: 2px solid ${D.accent}; outline-offset: 2px; }

  .ddfb-topics-wrap { flex: 0 0 auto; position: relative; }
  .ddfb-topics-btn {
    display: inline-flex; align-items: center; gap: 8px; background: ${D.surface};
    border: 1px solid ${D.dividerStrong}; border-radius: 11px; padding: 11px 13px;
    font-family: ${F.body}; font-size: 14px; font-weight: 600; color: ${D.text};
    cursor: pointer; transition: border-color 0.15s, background 0.15s; max-width: 220px;
  }
  .ddfb-topics-btn:hover { border-color: ${D.muted}; }
  .ddfb-topics-btn:focus-visible { outline: 2px solid ${D.accent}; outline-offset: 2px; }
  .ddfb-topics-btn.active { background: ${D.tintBg}; border-color: ${D.tintBorder}; color: ${D.tintText}; }
  .ddfb-topics-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ddfb-caret { font-size: 11px; flex-shrink: 0; }

  .ddfb-menu {
    position: absolute; top: calc(100% + 8px); right: 0; min-width: 260px; background: ${D.surface};
    border: 1px solid ${D.divider}; border-radius: 14px; box-shadow: 0 18px 44px rgba(22, 23, 26, 0.14);
    padding: 6px; z-index: 30; list-style: none; margin: 0;
  }
  .ddfb-option {
    display: flex; align-items: center; gap: 8px; width: 100%; box-sizing: border-box;
    padding: 9px 12px; border: none; background: transparent; border-radius: 9px; cursor: pointer;
    font-family: ${F.body}; font-size: 14px; font-weight: 500; color: ${D.text}; text-align: left;
    transition: background 0.15s;
  }
  .ddfb-option:hover { background: ${D.menuHover}; }
  .ddfb-option:focus-visible { outline: 2px solid ${D.accent}; outline-offset: -2px; }
  .ddfb-option.selected { background: ${D.tintBg}; color: ${D.tintText}; font-weight: 600; }
  .ddfb-check { width: 16px; flex-shrink: 0; color: ${D.tintText}; }
  .ddfb-opt-label { flex: 1; }
  .ddfb-opt-count { font-variant-numeric: tabular-nums; color: ${D.dim}; font-size: 13px; }
  .ddfb-option.selected .ddfb-opt-count { color: ${D.tintDim}; }

  /* ===== EmptyState ===== */
  .dde-empty {
    text-align: center; border: 1px dashed ${D.dividerStrong}; border-radius: 18px;
    padding: clamp(40px, 7vw, 72px) 24px; margin-bottom: 44px;
  }
  .dde-glyph { font-size: 40px; line-height: 1; margin-bottom: 16px; }
  .dde-title { font-family: ${F.display}; font-weight: 400; font-size: 28px; color: ${D.text}; margin: 0 0 10px; }
  .dde-text { font-size: 15px; line-height: 1.6; color: ${D.muted}; margin: 0 auto 6px; max-width: 48ch; }
  .dde-phone { color: ${D.accent}; font-weight: 600; text-decoration: none; }
  .dde-phone:hover { text-decoration: underline; }
  .dde-phone:focus-visible { outline: 2px solid ${D.accent}; outline-offset: 2px; border-radius: 4px; }

  @media (max-width: 520px) {
    .ddfb-topics-btn { max-width: 150px; }
  }
`;
