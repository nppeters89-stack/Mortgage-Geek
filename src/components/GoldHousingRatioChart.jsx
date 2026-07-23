import { useEffect, useRef } from "react";
import { P, CHART_COLORS } from "../theme";
import { fmt, withAlpha } from "../utils/format";
import { GOLD_HOUSING_RATIO, LONG_RUN_AVG } from "../data/geekCharts";

// Animated Gold-to-Housing Ratio chart (ported from a self-contained
// vanilla-JS/SVG prototype into this React component). It renders drawn by
// default; Replay re-runs it: the gold line draws, the 2001/1980/today markers
// cascade in, then the 1980 and today points pulse with a dashed connector (the
// same 124 oz, 46 years apart). Hover read-out appears only once it is drawn.
//
// The prototype's IIFE runs inside a useEffect, scoped to the component root via
// a ref (no document-wide queries, no global :root vars, keyframes namespaced).
// It is driven by the canonical GOLD_HOUSING_RATIO data, not re-pasted values.
// All colors come from CHART_COLORS / P (withAlpha for translucency). DM Sans is
// already loaded site-wide, so no font links are added. An sr-only table mirrors
// the series so the prerendered HTML stays crawler-readable.

const G = CHART_COLORS.gold;
const R = CHART_COLORS.accent;
const C = CHART_COLORS.line;
const HAIR = withAlpha(CHART_COLORS.line, 0.09);
const DIM = withAlpha(CHART_COLORS.line, 0.62);
const FAINT = withAlpha(CHART_COLORS.line, 0.4);

const CSS = `
  .ghr-anim { font-family: 'DM Sans', -apple-system, sans-serif; }
  .ghr-anim .legend { display: flex; flex-wrap: wrap; gap: 18px; margin-bottom: 14px; }
  .ghr-anim .li { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: ${DIM}; }
  .ghr-anim .sw { display: inline-block; width: 20px; height: 0; border-top: 3px solid; border-radius: 2px; }
  .ghr-anim .sw.gold { border-color: ${G}; }
  .ghr-anim .sw.dash { border-top-style: dashed; border-color: ${FAINT}; }

  .ghr-anim .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-bottom: 16px; }
  .ghr-anim .btnDraw { appearance: none; border: 1px solid ${withAlpha(CHART_COLORS.gold, 0.45)}; background: ${withAlpha(CHART_COLORS.gold, 0.1)};
    color: ${G}; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .3px;
    padding: 11px 20px; border-radius: 9px; cursor: pointer; transition: background .15s, opacity .15s; }
  .ghr-anim .btnDraw:hover { background: ${withAlpha(CHART_COLORS.gold, 0.18)}; }
  .ghr-anim .btnDraw:disabled { opacity: .4; cursor: default; }
  .ghr-anim .btnGhost { border-color: ${HAIR}; background: transparent; color: ${DIM}; font-weight: 600; }
  .ghr-anim .btnGhost:hover { background: ${withAlpha(CHART_COLORS.line, 0.05)}; }
  .ghr-anim .btnDraw:focus-visible, .ghr-anim .chartbox:focus-visible, .ghr-anim .speed button:focus-visible { outline: 2px solid ${G}; outline-offset: 2px; }
  .ghr-anim .status { font-size: 13px; color: ${DIM}; font-weight: 500; }
  .ghr-anim .status b { color: ${C}; font-weight: 700; }
  .ghr-anim .speed { display: inline-flex; gap: 2px; background: ${withAlpha(P.navyDark, 0.5)}; border: 1px solid ${HAIR}; border-radius: 8px; padding: 2px; margin-left: auto; }
  .ghr-anim .speed .lbl { font-size: 10.5px; color: ${FAINT}; font-weight: 700; padding: 7px 6px 7px 9px; letter-spacing: 1.4px; }
  .ghr-anim .speed button { border: 0; background: transparent; color: ${FAINT}; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; padding: 7px 11px; border-radius: 6px; cursor: pointer; }
  .ghr-anim .speed button.active { background: ${withAlpha(CHART_COLORS.line, 0.1)}; color: ${C}; }

  .ghr-anim .chartbox { position: relative; width: 100%; }
  .ghr-anim .plot svg { display: block; width: 100%; }
  .ghr-anim svg text { font-family: 'DM Sans', sans-serif; }

  .ghr-anim .hint { position: absolute; left: 50%; top: 16px; transform: translateX(-50%);
    background: ${withAlpha(P.text, 0.9)}; border: 1px solid ${withAlpha(CHART_COLORS.gold, 0.35)};
    border-radius: 999px; padding: 9px 18px; font-size: 12.5px; font-weight: 700; color: ${G};
    white-space: nowrap; pointer-events: none; z-index: 6; box-shadow: 0 8px 24px ${withAlpha(P.navyDark, 0.45)};
    display: flex; align-items: center; gap: 9px; transition: opacity .25s; }
  .ghr-anim .hint .dotc { width: 11px; height: 11px; border-radius: 50%; background: ${G}; box-shadow: 0 0 0 3px ${withAlpha(CHART_COLORS.gold, 0.18)}; }
  .ghr-anim .hint.hidden { opacity: 0; }

  .ghr-anim .tip { position: absolute; display: none; pointer-events: none; background: ${withAlpha(P.text, 0.97)};
    border: 1px solid ${HAIR}; border-radius: 8px; padding: 9px 12px; z-index: 5;
    font-size: 12.5px; color: ${C}; white-space: nowrap; box-shadow: 0 8px 24px ${withAlpha(P.navyDark, 0.45)}; }
  .ghr-anim .tip .ty { font-weight: 700; margin-bottom: 5px; }
  .ghr-anim .tip .tr { display: flex; align-items: center; gap: 7px; line-height: 1.5; }
  .ghr-anim .tip .tr b { font-weight: 700; color: ${G}; }
  .ghr-anim .tip .ts { color: ${FAINT}; font-size: 11px; margin-top: 4px; }

  .ghr-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

  @keyframes ghr-tieRing { 0% { r: 6px; opacity: .9; } 100% { r: 30px; opacity: 0; } }
  @keyframes ghr-tieGlow { 0%, 100% { filter: drop-shadow(0 0 3px ${withAlpha(CHART_COLORS.gold, 0.6)}); } 50% { filter: drop-shadow(0 0 12px ${withAlpha(CHART_COLORS.gold, 1)}); } }

  /* Reduced motion: keep the chart drawn but hide the controls and the tie
     pulse, matching the other Geek Charts. */
  @media (prefers-reduced-motion: reduce) {
    .ghr-anim .controls { display: none; }
    .ghr-anim #pulseLow1, .ghr-anim #pulseLow2, .ghr-anim #pulseNow1, .ghr-anim #pulseNow2 { display: none !important; animation: none !important; }
    .ghr-anim #dotLow, .ghr-anim #dotNow { animation: none !important; }
  }
`;

export function GoldHousingRatioChart() {
  const rootRef = useRef(null);
  const { years, ratio, home, gold } = GOLD_HOUSING_RATIO;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (sel) => root.querySelector(sel);

    const n = years.length;
    const YMAX = 800;
    const AVG = LONG_RUN_AVG;

    const CREAM = C, RED = R, GOLD = G;
    const GRID = CHART_COLORS.grid, AXIS = CHART_COLORS.axis;
    const MUT = withAlpha(C, 0.55), FNT = withAlpha(C, 0.4);
    const NAVY = P.navy;
    const AVGLINE = withAlpha(C, 0.28), GUIDE = withAlpha(C, 0.3), TIE = withAlpha(G, 0.55);

    const iPeak = years.indexOf(2001), iLow = years.indexOf(1980), iNow = n - 1;

    let D = {};
    let xOf, yOf;
    // Starts finished (drawn, markers shown, the 1980/today tie pulsing); Replay
    // re-runs it, matching the other Geek Charts.
    let phase = "tie";
    let drawDur = 4000;
    let timers = [];
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const gline = (x1, y1, x2, y2, stroke, w, dash) =>
      '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
    const gtext = (x, y, s, fill, anchor, size, weight, id) =>
      "<text" + (id ? ' id="' + id + '"' : "") + ' x="' + x + '" y="' + y + '" fill="' + fill + '" font-size="' + (size || 11) + '"' + (weight ? ' font-weight="' + weight + '"' : "") + ' text-anchor="' + anchor + '">' + esc(s) + "</text>";

    function render() {
      const box = $("#chartbox");
      const width = box.clientWidth || 680;
      const height = Math.round(Math.min(Math.max(width * 0.6, 320), 540));
      const mL = 54, mR = 16, mT = 14, mB = 30;
      const pW = width - mL - mR;
      const pH = height - mT - mB;
      D = { width, height, mL, mR, mT, mB, pW, pH };
      xOf = (i) => mL + (i / (n - 1)) * pW;
      yOf = (v) => mT + pH * (1 - v / YMAX);

      // On narrow (mobile) widths the plot is too tight for the full-size marker
      // labels and the long tie-connector caption, which overlap. Shrink the
      // labels and drop the connector caption there (the dashed connector, the
      // pulsing dots, and the stat card below still convey the 1980/today tie).
      const narrow = width < 560;
      const lblSz = narrow ? 10.5 : 12.5;

      const parts = [];
      for (let g = 0; g <= YMAX; g += 100) {
        const gy = yOf(g);
        parts.push(gline(mL, gy, mL + pW, gy, GRID, 1));
        parts.push(gtext(mL - 8, gy + 4, g === 0 ? "0" : g + " oz", MUT, "end"));
      }
      for (let i = 0; i < n; i++) {
        const yr = years[i];
        if (yr % 10 === 0 || i === n - 1) {
          const xx = xOf(i);
          parts.push(gtext(xx, mT + pH + 20, String(yr), FNT, "middle"));
          parts.push(gline(xx, mT + pH, xx, mT + pH + 4, AXIS, 1));
        }
      }
      parts.push(gline(mL, mT + pH, mL + pW, mT + pH, AXIS, 1));
      parts.push(gline(mL, yOf(AVG), mL + pW, yOf(AVG), AVGLINE, 1, "6 5"));
      parts.push(gtext(mL + pW - 6, yOf(AVG) - 6, "avg " + AVG + " oz", FNT, "end", 11));

      const pts = ratio.map((v, i) => xOf(i).toFixed(1) + "," + yOf(v).toFixed(1)).join(" ");
      parts.push('<polyline id="line-ratio" points="' + pts + '" fill="none" stroke="' + GOLD + '" stroke-width="2.75" stroke-linejoin="round" stroke-linecap="round"/>');

      parts.push('<g id="tieGroup" style="opacity:0;transition:opacity .5s">');
      parts.push(gline(xOf(iLow), yOf(ratio[iLow]), xOf(iNow), yOf(ratio[iNow]), TIE, 1.5, "5 5"));
      if (!narrow) {
        const midX = (xOf(iLow) + xOf(iNow)) / 2;
        parts.push(gtext(midX, yOf(ratio[iLow]) + 30, "same ratio · 124 oz · 46 years apart", GOLD, "middle", 12.5, "700"));
      }
      parts.push("</g>");

      parts.push('<g id="ptPeak" style="opacity:0;transition:opacity .45s">');
      parts.push('<circle cx="' + xOf(iPeak) + '" cy="' + yOf(ratio[iPeak]) + '" r="4.5" fill="' + RED + '" stroke="' + NAVY + '" stroke-width="2"/>');
      parts.push(gtext(xOf(iPeak), yOf(ratio[iPeak]) - 12, "779 oz · 2001", RED, "middle", lblSz, "700"));
      parts.push("</g>");

      parts.push('<g id="ptLow" style="opacity:0;transition:opacity .45s">');
      parts.push('<circle id="pulseLow1" cx="' + xOf(iLow) + '" cy="' + yOf(ratio[iLow]) + '" r="6" fill="none" stroke="' + GOLD + '" stroke-width="2.5" style="display:none"/>');
      parts.push('<circle id="pulseLow2" cx="' + xOf(iLow) + '" cy="' + yOf(ratio[iLow]) + '" r="6" fill="none" stroke="' + GOLD + '" stroke-width="2.5" style="display:none"/>');
      parts.push('<circle id="dotLow" cx="' + xOf(iLow) + '" cy="' + yOf(ratio[iLow]) + '" r="4.5" fill="' + CREAM + '" stroke="' + NAVY + '" stroke-width="2"/>');
      parts.push(gtext(xOf(iLow), yOf(ratio[iLow]) + 24, "124 oz · 1980", MUT, "middle", lblSz, "700", "lblLow"));
      parts.push("</g>");

      parts.push('<g id="ptNow" style="opacity:0;transition:opacity .45s">');
      parts.push('<circle id="pulseNow1" cx="' + xOf(iNow) + '" cy="' + yOf(ratio[iNow]) + '" r="6" fill="none" stroke="' + GOLD + '" stroke-width="2.5" style="display:none"/>');
      parts.push('<circle id="pulseNow2" cx="' + xOf(iNow) + '" cy="' + yOf(ratio[iNow]) + '" r="6" fill="none" stroke="' + GOLD + '" stroke-width="2.5" style="display:none"/>');
      parts.push('<circle id="dotNow" cx="' + xOf(iNow) + '" cy="' + yOf(ratio[iNow]) + '" r="5" fill="' + GOLD + '" stroke="' + NAVY + '" stroke-width="2"/>');
      parts.push(gtext(xOf(iNow) - 9, yOf(ratio[iNow]) + 24, "124 oz today", GOLD, "end", lblSz, "700", "lblNow"));
      parts.push("</g>");

      parts.push('<line id="guide" x1="0" y1="' + mT + '" x2="0" y2="' + (mT + pH) + '" stroke="' + GUIDE + '" stroke-width="1" stroke-dasharray="4 4" style="display:none"/>');
      parts.push('<circle id="dotR" r="4.5" fill="' + GOLD + '" stroke="' + NAVY + '" stroke-width="2" style="display:none"/>');
      parts.push('<circle id="tracer" r="6.5" fill="' + GOLD + '" stroke="' + NAVY + '" stroke-width="1.5" style="display:none"/>');

      $("#plot").innerHTML =
        '<svg id="svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + " " + height + '">' + parts.join("") + "</svg>";
      applyPhase();
    }

    const lineLen = (el) => { try { return el.getTotalLength(); } catch (e) { return 0; } };
    const setOpacity = (id, v) => { const el = $("#" + id); if (el) el.style.opacity = v; };

    function applyPhase() {
      const line = $("#line-ratio");
      const len = lineLen(line);
      line.style.transition = "none";
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = (phase === "idle" || phase === "drawing") ? len : 0;
      const pointsShown = (phase === "points" || phase === "tie");
      setOpacity("ptPeak", pointsShown ? 1 : 0);
      setOpacity("ptLow", pointsShown ? 1 : 0);
      setOpacity("ptNow", pointsShown ? 1 : 0);
      setOpacity("tieGroup", phase === "tie" ? 1 : 0);
      if (phase === "tie") startTiePulse(); else stopTiePulse();
    }

    function startTiePulse() {
      ["pulseLow1", "pulseNow1"].forEach((id) => { const e = $("#" + id); if (e) { e.style.display = ""; e.style.animation = "ghr-tieRing 1.8s ease-out infinite"; } });
      ["pulseLow2", "pulseNow2"].forEach((id) => { const e = $("#" + id); if (e) { e.style.display = ""; e.style.animation = "ghr-tieRing 1.8s ease-out 0.9s infinite"; } });
      const dl = $("#dotLow");
      if (dl) { dl.setAttribute("fill", GOLD); dl.setAttribute("r", "5.5"); dl.style.animation = "ghr-tieGlow 1.8s ease-in-out infinite"; }
      const dn = $("#dotNow");
      if (dn) { dn.setAttribute("r", "5.5"); dn.style.animation = "ghr-tieGlow 1.8s ease-in-out infinite"; }
      const ll = $("#lblLow"); if (ll) ll.setAttribute("fill", GOLD);
    }
    function stopTiePulse() {
      ["pulseLow1", "pulseLow2", "pulseNow1", "pulseNow2"].forEach((id) => { const e = $("#" + id); if (e) { e.style.display = "none"; e.style.animation = "none"; } });
      const dl = $("#dotLow");
      if (dl) { dl.setAttribute("fill", CREAM); dl.setAttribute("r", "4.5"); dl.style.animation = "none"; }
      const dn = $("#dotNow");
      if (dn) { dn.setAttribute("r", "5"); dn.style.animation = "none"; }
      const ll = $("#lblLow"); if (ll) ll.setAttribute("fill", MUT);
    }

    function play() {
      if (phase !== "idle") return;
      phase = "drawing";
      updateUI();
      const line = $("#line-ratio");
      const len = lineLen(line);
      line.style.transition = "none";
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.getBoundingClientRect();
      line.style.transition = "stroke-dashoffset " + drawDur + "ms linear";
      line.style.strokeDashoffset = 0;
      const tr = $("#tracer");
      if (tr) tr.style.display = "";
      const start = performance.now();
      let doneDrawing = false;
      function frame(now) {
        const t = Math.min((now - start) / drawDur, 1);
        if (tr) { let pt = null; try { pt = line.getPointAtLength(len * t); } catch (e) {} if (pt) { tr.setAttribute("cx", pt.x); tr.setAttribute("cy", pt.y); } }
        if (t < 1 && !doneDrawing && phase === "drawing") requestAnimationFrame(frame);
        else finishDraw();
      }
      function finishDraw() {
        if (doneDrawing || phase !== "drawing") return;
        doneDrawing = true;
        line.style.strokeDashoffset = 0;
        if (tr) tr.style.display = "none";
        cascadePoints();
      }
      requestAnimationFrame(frame);
      later(finishDraw, drawDur + 60);
    }

    function cascadePoints() {
      phase = "points";
      updateUI();
      later(() => setOpacity("ptPeak", 1), 150);
      later(() => setOpacity("ptLow", 1), 900);
      later(() => setOpacity("ptNow", 1), 1650);
      later(() => { phase = "tie"; setOpacity("tieGroup", 1); startTiePulse(); updateUI(); }, 2500);
    }

    // Re-run from the drawn state: reset to empty, then draw again. Ignored
    // while a run is in progress.
    function replay() {
      if (phase === "drawing" || phase === "points") return;
      clearTimers();
      stopTiePulse();
      const tr = $("#tracer"); if (tr) tr.style.display = "none";
      hideHover();
      phase = "idle";
      applyPhase();
      updateUI();
      requestAnimationFrame(() => play());
    }

    function updateUI() {
      const btn = $("#btnPlay");
      const status = $("#status");
      const busy = phase === "drawing" || phase === "points";
      btn.disabled = busy;
      if (phase === "drawing") {
        btn.textContent = "Drawing…";
        status.innerHTML = "Drawing the <b>gold-to-housing ratio</b>…";
      } else if (phase === "points") {
        btn.textContent = "Marking extremes…";
        status.innerHTML = "Marking the <b>2001 high</b>, the <b>1980 low</b>, and <b>today</b>…";
      } else {
        btn.textContent = "Replay";
        status.innerHTML = "<b>1980</b> and <b>today</b>, the same 124 oz, 46 years apart. Press <b>Replay</b> to run it again.";
      }
    }

    function hideHover() {
      ["guide", "dotR"].forEach((id) => { const el = $("#" + id); if (el) el.style.display = "none"; });
      const tip = $("#tip"); if (tip) tip.style.display = "none";
    }
    function onMove(e) {
      if (phase !== "tie") return;
      const svg = $("#svg"); if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left;
      if (px < D.mL - 6 || px > D.mL + D.pW + 6) { hideHover(); return; }
      let i = Math.round((px - D.mL) / D.pW * (n - 1));
      if (i < 0) i = 0; if (i > n - 1) i = n - 1;
      const gx = xOf(i), gy = yOf(ratio[i]);
      const g = $("#guide"); g.setAttribute("x1", gx); g.setAttribute("x2", gx); g.style.display = "";
      const d = $("#dotR"); d.setAttribute("cx", gx); d.setAttribute("cy", gy); d.style.display = "";
      const label = years[i] + (years[i] <= 1971 ? " (gold pegged era)" : (years[i] === 2026 ? " (as of Jul 9)" : ""));
      const tip = $("#tip");
      tip.innerHTML = '<div class="ty">' + label + "</div>" +
        '<div class="tr">home in gold: <b>' + Math.round(ratio[i]) + " oz</b></div>" +
        '<div class="ts">' + fmt(home[i]) + " home / " + fmt(gold[i]) + " gold</div>";
      tip.style.display = "block";
      const tw = tip.offsetWidth;
      let left = gx + 14;
      if (left + tw > D.width - 6) left = gx - 14 - tw;
      if (left < 6) left = 6;
      tip.style.left = left + "px";
      tip.style.top = (D.mT + 6) + "px";
    }

    // The plot is hover-only now (no click-to-draw); Replay lives on the button.
    const cb = $("#chartbox");
    cb.addEventListener("pointermove", onMove);
    cb.addEventListener("pointerleave", hideHover);

    const playBtn = $("#btnPlay");
    const onPlayBtn = (e) => { e.stopPropagation(); replay(); };
    const onBtnKey = (e) => { if (e.key === "r" || e.key === "R") { e.preventDefault(); replay(); } };
    playBtn.addEventListener("click", onPlayBtn);
    playBtn.addEventListener("keydown", onBtnKey);

    const speedBtns = root.querySelectorAll(".speed button");
    const speedHandlers = [];
    speedBtns.forEach((b) => {
      const h = () => { drawDur = +b.getAttribute("data-dur"); speedBtns.forEach((q) => q.classList.remove("active")); b.classList.add("active"); };
      b.addEventListener("click", h);
      speedHandlers.push([b, h]);
    });

    let rt;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { hideHover(); render(); }, 120); };
    window.addEventListener("resize", onResize);

    render();
    updateUI();

    return () => {
      clearTimers();
      clearTimeout(rt);
      window.removeEventListener("resize", onResize);
      cb.removeEventListener("pointermove", onMove);
      cb.removeEventListener("pointerleave", hideHover);
      playBtn.removeEventListener("click", onPlayBtn);
      playBtn.removeEventListener("keydown", onBtnKey);
      speedHandlers.forEach(([b, h]) => b.removeEventListener("click", h));
    };
  }, [years, ratio, home, gold]);

  return (
    <div className="ghr-anim" ref={rootRef}>
      <style>{CSS}</style>

      <div className="legend">
        <span className="li"><span className="sw gold" aria-hidden="true" />Ounces of gold per average U.S. home</span>
        <span className="li"><span className="sw dash" aria-hidden="true" />Long-run average (374 oz)</span>
      </div>

      <div className="controls">
        <button id="btnPlay" type="button" className="btnDraw">Replay</button>
        <span id="status" className="status" />
        <span className="speed" aria-label="Draw speed">
          <span className="lbl">SPEED</span>
          <button type="button" data-dur="3000">3s</button>
          <button type="button" data-dur="4000" className="active">4s</button>
          <button type="button" data-dur="5000">5s</button>
        </span>
      </div>

      <div id="chartbox" className="chartbox">
        <div id="plot" className="plot" aria-hidden="true" />
        <div id="tip" className="tip" />
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full series as a table. */}
      <div className="ghr-sr-only">
        <table>
          <caption>Gold to housing ratio by year: ounces of gold to buy the average American home, with the underlying average home price and gold price per ounce.</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Ounces of gold to buy a home</th>
              <th scope="col">Average home price</th>
              <th scope="col">Gold price per ounce</th>
            </tr>
          </thead>
          <tbody>
            {years.map((yr, i) => (
              <tr key={yr}>
                <th scope="row">{yr}</th>
                <td>{Math.round(ratio[i])} oz</td>
                <td>{fmt(home[i])}</td>
                <td>{fmt(gold[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
