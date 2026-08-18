import { T } from "../gl2Tokens";
import { ghostAction } from "./detailActionStyles";

// "Added to RAC": marks a contact as copied into the CRM, which puts a green
// check beside their name in the Follow Ups and SOI queues so the ones still
// needing entry are obvious at a glance.
//
// A toggle, not a one-way action, matching Remove from SOI and Remove from
// Follow Ups: nothing here is destructive, so a mis-tap should be undoable with
// the same button rather than needing a confirmation dialog.
export function AddedToRacButton({ inRac, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={inRac}
      style={{
        ...ghostAction,
        marginTop: 8,
        color: inRac ? T.greenBright : T.cream,
        borderColor: inRac ? T.greenWashLine : T.line,
        background: inRac ? T.greenWash : T.surface,
      }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        {inRac
          ? <path d="M20 6L9 17l-5-5" />
          : <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.4 2.4 4.6-4.8" /></>}
      </svg>
      {inRac ? "Added to RAC" : "Add to RAC"}
    </button>
  );
}
