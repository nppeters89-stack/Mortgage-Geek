import { P, F } from "../../theme";

export function JourneyOverview({ onNavigate }) {
  const preSteps = [
    { num: "1", label: "Pre-Qualify", section: "getting-started", step: 0 },
    { num: "2", label: "Pre-Approve", section: "getting-started", step: 1 },
    { num: "3", label: "Find a Home", section: "getting-started", step: 2 },
  ];
  const postSteps = [
    { num: "4", label: "Processing", section: "process", step: 0 },
    { num: "5", label: "Underwriting", section: "process", step: 1 },
    { num: "6", label: "Closing", section: "process", step: 2 },
  ];

  const StepRow = ({ steps, color, label }) => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, background: `${color}12`, padding: "3px 12px", borderRadius: 10 }}>{label}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        {steps.map((s, i) => (
          <button key={i} onClick={() => onNavigate(s.section, s.step)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.15s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{s.num}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: P.warmGray, textAlign: "center", lineHeight: 1.3, maxWidth: 70 }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section style={{ padding: "48px 40px 24px" }}>
      <div style={{ maxWidth: 720 }}>
        <div className="content-card" style={{ padding: "28px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 4 }}>Your Mortgage Journey</h3>
            <p style={{ fontSize: 12, color: P.warmGrayLight }}>6 steps from first conversation to getting your keys</p>
          </div>

          <StepRow steps={preSteps} color={P.navy} label="Your Pace" />

          {/* Contract signed divider — perfectly centered */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: P.creamDark }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: P.gold, whiteSpace: "nowrap" }}>▼ CONTRACT SIGNED ▼</span>
            <div style={{ flex: 1, height: 1, background: P.creamDark }} />
          </div>

          <StepRow steps={postSteps} color={P.gold} label="~30 Days" />
        </div>
      </div>
    </section>
  );
}
