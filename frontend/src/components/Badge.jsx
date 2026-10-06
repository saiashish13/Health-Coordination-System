export default function Badge({ status, text }) {
  const getBadgeType = (val) => {
    if (!val) return "info";
    const s = String(val).toUpperCase();
    if (s === "CONFIRMED" || s === "COMPLETED" || s === "ACTIVE" || s === "NORMAL" || s === "APPROVED") {
      return "success";
    }
    if (s === "PENDING" || s === "IN_PROGRESS" || s === "SCHEDULED" || s === "REVIEW") {
      return "warning";
    }
    if (s === "CANCELLED" || s === "REJECTED" || s === "HIGH_RISK" || s === "REVOKED") {
      return "error";
    }
    return "info";
  };

  const type = getBadgeType(status || text);

  return (
    <span className={`badge-pill badge-${type}`}>
      {text || status}
    </span>
  );
}
