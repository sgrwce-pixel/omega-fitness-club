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
      <div
        className="ambient-orb orb-1"
        style={{
          width: 600,
          height: 600,
          top: "-150px",
          left: "-150px",
          background:
            "radial-gradient(circle, rgba(138,255,60,0.55) 0%, rgba(138,255,60,0.25) 30%, transparent 70%)",
          opacity: 0.12,
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
            "radial-gradient(circle, rgba(168,255,110,0.5) 0%, rgba(168,255,110,0.22) 30%, transparent 70%)",
          opacity: 0.09,
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
            "radial-gradient(circle, rgba(124,58,237,0.5) 0%, rgba(124,58,237,0.22) 30%, transparent 70%)",
          opacity: 0.07,
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
            "radial-gradient(circle, rgba(212,255,170,0.6) 0%, rgba(212,255,170,0.28) 30%, transparent 70%)",
          opacity: 0.06,
        }}
      />
    </div>
  );
}
