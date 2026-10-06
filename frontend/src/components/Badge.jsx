import { CheckCircle2, Clock, AlertCircle, Info, ShieldAlert } from "lucide-react";

export default function Badge({ status, text }) {
  const getBadgeMeta = (val) => {
    if (!val) return { type: "info", Icon: Info };
    const s = String(val).toUpperCase();
    if (s === "CONFIRMED" || s === "COMPLETED" || s === "ACTIVE" || s === "NORMAL" || s === "APPROVED") {
      return { type: "success", Icon: CheckCircle2 };
    }
    if (s === "PENDING" || s === "IN_PROGRESS" || s === "SCHEDULED" || s === "REVIEW") {
      return { type: "warning", Icon: Clock };
    }
    if (s === "CANCELLED" || s === "REJECTED" || s === "HIGH_RISK" || s === "REVOKED") {
      return { type: "error", Icon: ShieldAlert };
    }
    return { type: "info", Icon: Info };
  };

  const { type, Icon } = getBadgeMeta(status || text);

  return (
    <span className={`badge-pill badge-${type}`}>
      <Icon size={12} />
      <span>{text || status}</span>
    </span>
  );
}
