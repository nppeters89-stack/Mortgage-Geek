// Click-to-draw line animation for the Geek Charts, used by HomesInSp500Chart
// and BuyVsInvestChart. The author draws each line manually while narrating
// over a screen recording, so the two hard requirements are: the draw must
// finish even when the tab is backgrounded (screen recorders steal focus and
// browsers throttle requestAnimationFrame to ~1fps), and every call must be
// safely cancellable on unmount or replay.
//
// Technique: measure the path, hide it with a full stroke-dashoffset, then
// transition the offset to 0 so the stroke "draws" left to right. A separate
// rAF loop walks a tracer dot along the path via getPointAtLength. The rAF
// loop is presentation only. Completion is owned by a setTimeout fallback so a
// throttled tab still lands in the finished state.

// Milliseconds of slack past the nominal duration before the fallback timer
// force-finishes the draw. Matches the design handoff.
const FALLBACK_SLACK = 60;

// Animate one SVG path drawing itself.
//
//   pathEl   the <path> or <polyline> to draw
//   duration ms for the full draw (linear)
//   onTick   (t, point) each rAF frame, t 0..1, point {x,y} on the path.
//            Used to move the tracer dot and to advance the calc-strip year.
//   onDone   called exactly once when the draw completes, by whichever of the
//            rAF loop or the fallback timer gets there first.
//
// Returns a cancel function. Cancelling stops the loop and the timer and
// leaves the path fully drawn, which is the correct resting state for an
// unmount or a resize re-render mid-draw.
export function drawPath(pathEl, { duration = 4000, onTick, onDone } = {}) {
  if (!pathEl || typeof pathEl.getTotalLength !== "function") {
    onDone?.();
    return () => {};
  }

  const len = pathEl.getTotalLength();
  // A zero-length path (empty or single-point series) has nothing to draw and
  // would make t = elapsed/0 non-finite. Land it in the done state directly.
  if (!Number.isFinite(len) || len <= 0) {
    onDone?.();
    return () => {};
  }

  let finished = false;
  let raf = 0;
  let timer = 0;
  let start = 0;

  // Idempotent. Force-sets the final visual state so a throttled tab that
  // never got a last rAF frame still ends fully drawn.
  const finalize = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    pathEl.style.transition = "";
    pathEl.style.strokeDasharray = "";
    pathEl.style.strokeDashoffset = "";
    onDone?.();
  };

  // Hide the stroke, then force a reflow so the browser commits the hidden
  // state as the transition's starting value. Without the reflow the two
  // style writes coalesce and the line simply appears.
  pathEl.style.transition = "none";
  pathEl.style.strokeDasharray = `${len}`;
  pathEl.style.strokeDashoffset = `${len}`;
  pathEl.getBoundingClientRect();

  pathEl.style.transition = `stroke-dashoffset ${duration}ms linear`;
  pathEl.style.strokeDashoffset = "0";

  const tick = (now) => {
    if (finished) return;
    if (!start) start = now;
    const t = Math.min(1, (now - start) / duration);
    if (onTick) {
      // getPointAtLength throws on a detached node if the chart re-rendered
      // underneath us mid-draw. Treat that as "stop tracing", not a crash;
      // the fallback timer still finalizes.
      try {
        onTick(t, pathEl.getPointAtLength(len * t));
      } catch {
        cancelAnimationFrame(raf);
        return;
      }
    }
    if (t < 1) raf = requestAnimationFrame(tick);
    else finalize();
  };
  raf = requestAnimationFrame(tick);
  timer = setTimeout(finalize, duration + FALLBACK_SLACK);

  return finalize;
}

// Put a path straight into its finished state with no animation. Used by the
// mobile and reduced-motion paths, where the charts render fully drawn.
export function clearDrawState(pathEl) {
  if (!pathEl) return;
  pathEl.style.transition = "";
  pathEl.style.strokeDasharray = "";
  pathEl.style.strokeDashoffset = "";
}

// Hide a path before its turn to draw. Recharts re-renders the whole SVG on
// resize and on any state change, which wipes inline styles, so the charts
// re-apply this on every render for lines that have not been drawn yet.
export function hidePath(pathEl) {
  if (!pathEl || typeof pathEl.getTotalLength !== "function") return;
  const len = pathEl.getTotalLength();
  if (!Number.isFinite(len) || len <= 0) return;
  pathEl.style.transition = "none";
  pathEl.style.strokeDasharray = `${len}`;
  pathEl.style.strokeDashoffset = `${len}`;
}
