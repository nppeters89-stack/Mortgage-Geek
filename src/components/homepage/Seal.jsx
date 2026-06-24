// Reusable 5-step process seal (design handoff). Scales by one `size` prop.
// Master art is the standalone SVG (live DM Sans + Figtree text, both loaded
// site-wide). variant: "primary" (dark band) | "reversed" (light/photo) | "favicon".
const SRC = {
  primary: "/assets/seal-primary.svg",
  reversed: "/assets/seal-reversed.svg",
  favicon: "/assets/seal-favicon.svg",
};

export function Seal({ size = 220, variant = "primary", className, style }) {
  return (
    <img
      src={SRC[variant] || SRC.primary}
      width={size}
      height={size}
      alt="The Five-Step Process for Real Estate Agents"
      className={className}
      style={{ display: "block", ...style }}
    />
  );
}
