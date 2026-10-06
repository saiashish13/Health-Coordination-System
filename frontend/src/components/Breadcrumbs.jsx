import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const pathMap = {
  "patient-dashboard": "Patient Portal",
  "doctor-dashboard": "Doctor Portal",
  "hospital-dashboard": "Hospital Management",
  "laboratory-dashboard": "Laboratory Portal",
  "pharmacy-dashboard": "Pharmacy Portal",
  "appointments": "Appointments",
  "medical-records": "Medical Records",
  "diagnoses": "Diagnoses",
  "lab-tests": "Lab Tests",
  "lab-reports": "Lab Reports",
  "medicines": "Medicines Inventory",
  "prescriptions": "Prescriptions",
  "prescription-items": "Prescription Items",
  "medication-orders": "Medication Orders",
  "permission-requests": "Permission Requests",
  "patient-doctor-access": "Doctor Access Links",
  "access-permissions": "Access Permissions",
  "ai-assistant": "AI Assistant",
  "ai-recommendations": "AI Recommendations",
  "doctor-review": "Clinical AI Reviews",
  "notifications": "Notifications",
  "access-audit-log": "Audit Logs",
  "users": "User Directory",
  "patients": "Patients",
  "doctors": "Doctors",
  "organizations": "Organizations"
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0 || location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-nav">
      <Link to="/" className="breadcrumbs-link" title="Home">
        <Home size={14} />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = pathMap[value] || value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <span key={to} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span className="breadcrumbs-separator">
              <ChevronRight size={13} />
            </span>
            {isLast ? (
              <span className="breadcrumbs-current">{displayName}</span>
            ) : (
              <Link to={to} className="breadcrumbs-link">
                {displayName}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
