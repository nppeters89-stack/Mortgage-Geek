import { P } from "../../theme";

// Always-on Mortgage Geek / Rate cobrand lockup for the Geek Log surface
// (dark-variant: white Rate logo + cream MG mark + red "Geek" wordmark).
//
// Built from INLINE SVG marks (not <img> or the shared .cobrand-rate /
// .mg-lockup CSS) for two reasons:
//   1. The snapshot PNG is captured with html-to-image, which drops raster
//      <img>/background images on mobile WebKit. Native inline SVG rasterizes
//      reliably (the same reason the old logo used an <image href> data URL).
//   2. The .cobrand-rate class is display:none <=600px, which would strip the
//      Rate half from the PNG whenever it is generated on a phone. This lockup
//      always shows the full cobrand at any viewport.
//
// The "Mortgage Geek" wordmark is HTML text (DM Sans + Archivo); GeekLogPage
// loads those fonts so getFontEmbedCSS() embeds them into the exported PNG.
// Every dimension derives from `markH`, mirroring the .mg-lockup proportions.
export function GeekLogCobrand({ markH = 28 }) {
  const rateH = markH * 0.93;
  const rateW = rateH * (795 / 328);
  const markW = markH * (548 / 680);
  const dividerMargin = markH * 0.5;
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {/* Rate logo (2-color, white wordmark + red roof), inlined from
          /rate-2color-white-tight.svg. */}
      <svg viewBox="214.9 232 795 328" width={rateW} height={rateH} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rate" style={{ display: "block", flexShrink: 0 }}>
        <path fill="#fff" d="M218.51,236h155.56c63.98,0,118.31,29.36,118.31,93.34,0,35.93-18.4,61.35-51.27,76.25v1.31c25.42,9.64,38.56,27.17,43.82,51.71,8.33,37.68,1.32,82.82,12.71,85.89v4.82h-90.27c-8.76-6.14-5.26-44.7-11.83-72.74-5.7-24.1-16.21-36.37-42.94-36.37h-42.51v109.11h-91.59V236Zm91.59,138.91h49.08c26.29,0,40.75-11.39,40.75-33.3,0-20.6-13.15-33.74-39.44-33.74h-50.39v67.05Z" />
        <path fill="#fff" d="M684.86,544.99c-4.85-3.03-5.73-10.73-5.73-24.82v-88.46c0-24.57-9.51-42.95-28.27-54.63-13.75-8.46-31.36-12.07-58.89-12.07-61.33,0-84.52,33.88-85.78,65.59l-.07,1.9h65.59l.21-1.58c1.76-12.99,8.97-19.58,21.43-19.58,11.53,0,16.91,4.82,16.91,15.17,0,8.89-6.63,13.59-45.9,17.96-28.25,3.17-65.8,12.45-65.8,56.28,0,33.86,23.3,54.9,60.8,54.9,22.87,0,41.07-7.61,52.86-22.04,1.24,6.99,3,12.21,5.57,16.63l.53,.91h67.4v-5.61l-.86-.54Zm-72.87-72.58v12.72c0,20.65-14.47,28.01-28.01,28.01-9.01,0-18.64-3.99-18.64-15.17,0-8.56,3.75-14.02,23.54-18.34,9.2-2.01,16.8-4.39,23.11-7.22Z" />
        <path fill="#fff" d="M1004.75,476.85c.74-37.26-10.44-68.43-31.47-87.76-17.71-16.2-40.06-24.42-66.45-24.42-55.73,0-96.19,40.31-96.19,95.84s40.55,95.49,98.61,95.49c23.31,0,41.06-4.69,57.53-15.2,17.99-11.51,30.54-27.47,34.44-43.78l.54-2.25h-66.87l-.52,.93c-4.55,8.13-12.3,12.25-23.04,12.25-17.31,0-28.22-9.86-32.46-29.31h125.84l.04-1.79Zm-125.89-36.55c3.89-18.53,13.75-27.92,29.36-27.92,14.14,0,24.26,10.39,27.35,27.92h-56.71Z" />
        <path fill="#fff" d="M810.07,413.77v-43.2h-33.65v-58.12l-67.83,34.85v23.27h-22.9v43.2h22.9v84.55c0,46.72,26.66,56.29,66.7,56.29,10.53,0,20.62-1.3,32.69-4.21l1.4-.34v-51.61l-1.95,.13c-12.51,.85-22.45,1.14-27.3-3.39-2.5-2.33-3.71-6.08-3.71-11.44v-69.99h33.65Z" />
        <polygon fill="#cf3438" points="589.7 236.16 589.7 303.32 556.88 303.32 659.24 355.92 761.61 303.32 728.84 303.32 728.84 236.16 589.7 236.16" />
      </svg>

      <span aria-hidden="true" style={{ width: 1, height: rateH, background: "rgba(246,245,243,0.3)", flexShrink: 0, margin: `0 ${dividerMargin}px` }} />

      {/* Mortgage Geek lockup: mark (inlined from mg-mark-cream-truered-sm.svg)
          + wordmark. */}
      <span style={{ display: "inline-flex", alignItems: "center", gap: markH * 0.24 }}>
        <svg viewBox="236 368 548 680" width={markW} height={markH} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
          <path fill="#FBF9F5" fillRule="evenodd" d="M 511 369 L 698 499 L 640 543 L 511 455 L 382 542 L 322 500 Z M 237 1047 L 312 1047 L 312 624 L 510 769 L 706 624 L 707 752 L 782 752 L 783 476 L 511 675 L 237 476 Z M 412 734 C 386 774 368 815 368 858 C 368 964 452 1046 520 1047 L 782 1047 L 782 824 L 621 824 C 608 809 589 799 569 799 C 540 799 517 823 517 856 C 517 889 543 912 573 912 C 594 912 610 902 621 886 L 650 886 L 650 907 L 677 907 L 677 886 L 706 886 L 707 969 L 541 970 C 485 970 445 920 445 857 C 445 826 456 799 473 778 L 415 735 Z M 554.4 839 C 563.2 839 570.4 846.2 570.4 855 C 570.4 863.8 563.2 871 554.4 871 C 545.6 871 538.4 863.8 538.4 855 C 538.4 846.2 545.6 839 554.4 839 Z" />
          <rect x="470" y="523" width="81" height="81" fill="#CF3338" />
        </svg>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, transform: `translateY(${markH * 0.05}px)` }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: markH * 0.24, letterSpacing: "0.24em", textTransform: "uppercase", color: "#E8E6E1" }}>Mortgage</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: markH * 0.6, letterSpacing: "-0.01em", textTransform: "uppercase", color: P.gold, marginTop: markH * 0.05 }}>Geek</span>
        </span>
      </span>
    </span>
  );
}
