export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="ambient-bg"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div className="ambient-rotate" />
      <div
        className="ambient-orb orb-1"
        style={{
          width: 600,
          height: 600,
          top: "-150px",
          left: "-150px",
          background:
            "radial-gradient(circle, #8AFF3C, transparent 70%)",
          opacity: 0.08,
          filter: "blur(120px)",
        }}
      />
      <div
        className="ambient-orb orb-2"
        style={{
          width: 400,
          height: 400,
          bottom: "-100px",
          right: "-100px",
          background:
            "radial-gradient(circle, #a8ff6e, transparent 70%)",
          opacity: 0.06,
          filter: "blur(120px)",
        }}
      />
      <div
        className="ambient-orb orb-3"
        style={{
          width: 350,
          height: 350,
          top: "10%",
          right: "5%",
          background:
            "radial-gradient(circle, #7c3aed, transparent 70%)",
          opacity: 0.05,
          filter: "blur(80px)",
        }}
      />
      <div
        className="ambient-orb orb-4"
        style={{
          width: 200,
          height: 200,
          bottom: "10%",
          left: "45%",
          background:
            "radial-gradient(circle, #d4ffaa, transparent 70%)",
          opacity: 0.04,
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
