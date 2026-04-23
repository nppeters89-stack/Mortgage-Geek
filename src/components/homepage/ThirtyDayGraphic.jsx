import { P, F } from "../../theme";

export function ThirtyDayGraphic({ activeStep }) {
  const phases = [
    { label: "Processing", start: 0, end: 50, color: P.navy },
    { label: "Underwriting", start: 50, end: 83, color: P.gold },
    { label: "Closing", start: 83, end: 100, color: P.sage },
  ];
  return (
    <div className="content-card" style={{ padding: "24px", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h4 style={{ fontFamily: F.display, fontSize: 20, color: P.navy, marginBottom: 2 }}>The 30-Day Timeline</h4>
          <p style={{ fontSize: 12, color: P.warmGrayLight }}>Contract to keys — here's how the time breaks down</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${P.navy}08`, padding: "8px 14px", borderRadius: 8, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="9" stroke={P.navy} strokeWidth="1.5" fill="none" />
            <path d="M10 5V10.5L13.5 13" stroke={P.navy} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
            <span style={{ fontFamily: F.display, fontSize: 20, color: P.navy, lineHeight: 1.1 }}>30–45</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: P.warmGray, letterSpacing: 0.3, marginTop: 2 }}>days typical</span>
          </div>
        </div>
      </div>
      {/* Timeline bar */}
      <div style={{ position: "relative", height: 40, borderRadius: 8, overflow: "hidden", background: P.cream, marginBottom: 12 }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${p.start}%`, width: `${p.end - p.start}%`,
            background: p.color,
            opacity: activeStep === i ? 1 : 0.25,
            transition: "opacity 0.3s",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRight: i < 2 ? "2px solid rgba(255,255,255,0.5)" : "none",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" }}>{p.label}</span>
          </div>
        ))}
      </div>
      {/* Day markers */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px" }}>
        {[{ day: "Day 1", pos: "0%" }, { day: "Day 15", pos: "50%" }, { day: "Day 25", pos: "83%" }, { day: "Day 30", pos: "100%" }].map((m, i) => (
          <span key={i} style={{ fontSize: 10, fontWeight: 600, color: P.warmGrayLight, letterSpacing: 0.3 }}>{m.day}</span>
        ))}
      </div>
    </div>
  );
}
