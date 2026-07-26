// Geek Log 2.0 tap feedback: a synthesized mechanical-counter tick via Web Audio
// (no audio asset files) plus best-effort haptics. Caller gates on the sound
// setting; visuals are never gated here.
//
// iOS audio rules: the AudioContext must be created/resumed from inside a user
// gesture, so callers invoke initAudio() on the first tap. All calls are
// no-ops until then and wrapped in try/catch so audio never throws into the UI.
//
// Haptics shipped: navigator.vibrate covers Android. iOS Safari ignores
// navigator.vibrate and exposes no web vibration API for installed PWAs; the
// documented workaround is toggling a hidden <input switch> (Safari's switch
// control fires a haptic). It is unreliable and often a no-op, so SOUND is the
// guaranteed floor and haptics are strictly best-effort.

let ctx = null;
let iosSwitch = null;

export function initAudio() {
  if (typeof window === "undefined") return;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
  } catch {
    /* audio unavailable; stay silent */
  }
}

// One short decaying blip. freq Hz, dur seconds, peak gain, oscillator type.
function blip(freq, dur, peak, type) {
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  } catch {
    /* ignore */
  }
}

// Increment: a crisp, quiet tick.
export function playTick() {
  blip(1180, 0.045, 0.06, "triangle");
}

// Milestone: a brighter two-note lift.
export function playMilestone() {
  blip(1180, 0.05, 0.07, "triangle");
  setTimeout(() => blip(1760, 0.07, 0.07, "triangle"), 55);
}

// Decrement: duller, lower.
export function playDown() {
  blip(360, 0.06, 0.05, "sine");
}

// Best-effort haptic. pattern is passed to navigator.vibrate when present.
export function haptic(pattern = 12) {
  if (typeof navigator === "undefined") return;
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
      return;
    }
    // iOS best-effort: bounce a hidden switch input.
    if (typeof document !== "undefined") {
      if (!iosSwitch) {
        const label = document.createElement("label");
        label.setAttribute("aria-hidden", "true");
        label.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.setAttribute("switch", "");
        label.appendChild(input);
        document.body.appendChild(label);
        iosSwitch = input;
      }
      iosSwitch.checked = !iosSwitch.checked;
    }
  } catch {
    /* haptics are best-effort; never throw */
  }
}
