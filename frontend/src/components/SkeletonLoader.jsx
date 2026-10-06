export default function SkeletonLoader({ type = "table", rows = 5 }) {
  if (type === "card") {
    return (
      <div className="dashboard-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="metric-card">
            <div className="skeleton-box" style={{ height: "20px", width: "60%", marginBottom: "12px" }} />
            <div className="skeleton-box" style={{ height: "36px", width: "40%", marginBottom: "16px" }} />
            <div className="skeleton-box" style={{ height: "16px", width: "80%" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="table-card-wrapper">
      <div className="skeleton-box" style={{ height: "32px", width: "30%", marginBottom: "20px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-box" style={{ height: "40px", width: "100%" }} />
        ))}
      </div>
    </div>
  );
}
