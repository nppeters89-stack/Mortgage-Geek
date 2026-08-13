import { ghostAction } from "./detailActionStyles";

// "Add to SOI": promotes a Follow Ups contact into the sphere of influence. The
// contact graduates out of the Follow Ups queue on the way back, so the parent
// handles the navigation and the toast; this is only the control.
export function AddToSoiButton({ onAdd }) {
  return (
    <button type="button" onClick={onAdd} style={{ ...ghostAction, marginTop: 8 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" />
      </svg>
      Add to SOI
    </button>
  );
}
