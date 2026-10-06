import { 
  Activity, 
  Shield, 
  Heart, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  Clock, 
  Stethoscope, 
  UserCheck, 
  Building2, 
  FlaskConical, 
  Pill,
  Award,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getUserSession } from "../services/api";

export default function Footer() {
  const location = useLocation();
  const user = getUserSession();
  const role = (user?.role || "").toUpperCase();

  // Role-specific descriptions and content configurations
  const getRoleContent = () => {
    switch (role) {
      case "DOCTOR":
        return {
          roleBadge: "Doctor Portal",
          icon: Stethoscope,
          description: `Welcome, Dr. ${user?.email ? user.email.split('@')[0] : "Physician"}. Dedicated clinical decision support, electronic health records, and AI-assisted care workflows.`,
          colTitle1: "Clinical Shortcuts",
          colLinks1: [
            { label: "Patient Directory", to: "/patients" },
            { label: "Appointments Roster", to: "/appointments" },
            { label: "Medical Records", to: "/medical-records" },
            { label: "Issue Prescriptions", to: "/prescriptions" },
            { label: "AI Clinical Reviews", to: "/ai-recommendations" },
          ],
          colTitle2: "Clinical Desk Support",
          colItems2: [
            { label: "Physician Helpline", val: "+1 (800) 555-DOCS", icon: PhoneCall },
            { label: "Clinical Support", val: "doc-support@healthsync.care", icon: Mail },
            { label: "License Status", val: "Active Medical Board", icon: Award },
            { label: "Consultation Queue", val: "Priority Telehealth Active", icon: Clock },
          ]
        };

      case "PATIENT":
        return {
          roleBadge: "Patient Portal",
          icon: UserCheck,
          description: "Your personal digital health hub — track medical records, schedule doctor appointments, view lab reports, and consult AI care guidance.",
          colTitle1: "My Health Services",
          colLinks1: [
            { label: "Book Appointment", to: "/appointments" },
            { label: "Medical Records", to: "/medical-records" },
            { label: "Lab Reports", to: "/lab-reports" },
            { label: "Active Prescriptions", to: "/prescriptions" },
            { label: "AI Care Assistant", to: "/ai-assistant" },
          ],
          colTitle2: "Patient Care Line",
          colItems2: [
            { label: "24/7 Care Hotline", val: "+1 (800) 555-0199", icon: PhoneCall },
            { label: "Patient Helpdesk", val: "patient-care@healthsync.care", icon: Mail },
            { label: "Emergency Response", val: "Dial 911 / 112", icon: Shield },
            { label: "Care Network", val: "50+ Accredited Hospitals", icon: Activity },
          ]
        };

      case "LAB":
      case "LABORATORY":
        return {
          roleBadge: "Laboratory Hub",
          icon: FlaskConical,
          description: "Diagnostic laboratory operations — process test requests, record specimen findings, generate report files, and deliver rapid diagnostic insights.",
          colTitle1: "Lab Operations",
          colLinks1: [
            { label: "Laboratory Dashboard", to: "/laboratory-dashboard" },
            { label: "Diagnostic Lab Tests", to: "/lab-tests" },
            { label: "Patient Lab Reports", to: "/lab-reports" },
            { label: "Notifications", to: "/notifications" },
          ],
          colTitle2: "Lab Quality & Support",
          colItems2: [
            { label: "Lab Technical Support", val: "lab-ops@healthsync.care", icon: Mail },
            { label: "Accreditation", val: "CLIA & CAP Certified", icon: Award },
            { label: "Turnaround Sync", val: "Express 4-Hour Result Delivery", icon: Clock },
          ]
        };

      case "PHARMACY":
        return {
          roleBadge: "Pharmacy Hub",
          icon: Pill,
          description: "Pharmacy dispensing & inventory management — manage e-prescriptions, fulfill medication orders, and verify drug interaction compliance.",
          colTitle1: "Pharmacy Operations",
          colLinks1: [
            { label: "Pharmacy Dashboard", to: "/pharmacy-dashboard" },
            { label: "Medicine Inventory", to: "/medicines" },
            { label: "Prescription Queue", to: "/prescriptions" },
            { label: "Medication Orders", to: "/medication-orders" },
          ],
          colTitle2: "Pharmacy Desk",
          colItems2: [
            { label: "Rx Dispensing Hotline", val: "+1 (800) 555-PHARM", icon: PhoneCall },
            { label: "Pharmacist Help", val: "pharmacy@healthsync.care", icon: Mail },
            { label: "Compliance", val: "FDA & DEA Tracked", icon: Shield },
          ]
        };

      case "HOSPITAL":
      case "ADMIN":
        return {
          roleBadge: "Hospital Administration",
          icon: Building2,
          description: "Executive facility operations & system governance — manage multi-specialty users, monitor consent access logs, and oversee organization metrics.",
          colTitle1: "System Administration",
          colLinks1: [
            { label: "Hospital Management", to: "/hospital-dashboard" },
            { label: "User Directory", to: "/users" },
            { label: "Patient Roster", to: "/patients" },
            { label: "Doctor Roster", to: "/doctors" },
            { label: "Access Audit Logs", to: "/access-audit-log" },
          ],
          colTitle2: "Facility Operations",
          colItems2: [
            { label: "Admin Operations Desk", val: "admin-ops@healthsync.care", icon: Mail },
            { label: "Facility Governance", val: "Role-Based JWT Security", icon: Shield },
            { label: "System Uptime", val: "99.99% Enterprise Service", icon: CheckCircle2 },
          ]
        };

      default:
        // Guest / Public / Unauthenticated
        return {
          roleBadge: "Digital Healthcare",
          icon: Sparkles,
          description: "Empowering modern digital healthcare management with secure, instant care coordination, remote telehealth access, and AI clinical recommendations.",
          colTitle1: "System Access",
          colLinks1: [
            { label: "Sign In Portal", to: "/" },
            { label: "Register New Account", to: "/register" },
            { label: "Book Appointment", to: "/appointments" },
            { label: "AI Care Assistant", to: "/ai-assistant" },
          ],
          colTitle2: "General Information",
          colItems2: [
            { label: "24/7 Care Hotline", val: "+1 (800) 555-0199", icon: PhoneCall },
            { label: "General Inquiries", val: "info@healthsync.care", icon: Mail },
            { label: "Response Time", val: "Instant Virtual Desk", icon: Clock },
          ]
        };
    }
  };

  const content = getRoleContent();

  return (
    <footer className="footer-container" style={{
      marginTop: "auto",
      borderTop: "1px solid var(--border-color)",
      background: "var(--bg-card)",
      backdropFilter: "blur(16px)",
      padding: "44px 0 28px 0",
      color: "var(--text-secondary)",
      fontSize: "14px"
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "36px",
        marginBottom: "36px"
      }}>
        
        {/* Column 1: Brand & Role Description */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
            }}>
              <Activity size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: "800", fontSize: "20px", color: "var(--text-primary)" }}>
              Health<span className="gradient-text">Sync</span>
            </span>
          </div>

          <div 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "3px 10px", 
              borderRadius: "var(--radius-full)", 
              background: "var(--primary-light)", 
              color: "var(--primary)",
              fontSize: "12px",
              fontWeight: "700",
              marginBottom: "12px" 
            }}
          >
            <content.icon size={13} />
            <span>{content.roleBadge}</span>
          </div>

          <p style={{ margin: "0 0 14px 0", color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.6" }}>
            {content.description}
          </p>

          <div 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              color: "var(--success)",
              fontSize: "12px",
              fontWeight: "600" 
            }}
          >
            <CheckCircle2 size={13} />
            <span>All Systems Operational</span>
          </div>
        </div>

        {/* Column 2: Role-tailored Links */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "700", marginBottom: "14px" }}>
            {content.colTitle1}
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {content.colLinks1.map((link, idx) => (
              <li key={idx}>
                <Link to={link.to} className="breadcrumbs-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Role-tailored Field Desk & Operational Contacts */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "700", marginBottom: "14px" }}>
            {content.colTitle2}
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            {content.colItems2.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "var(--text-secondary)" }}>
                  <ItemIcon size={16} color="var(--primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
                      {item.label}
                    </span>
                    <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{item.val}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Column 4: Security & HIPAA Standard */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "700", marginBottom: "14px" }}>
            Security & Compliance
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--emerald)", fontWeight: "700", fontSize: "13px", marginBottom: "10px" }}>
            <Shield size={16} />
            <span>256-bit Encrypted HIPAA Platform</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "0 0 10px 0", lineHeight: "1.5" }}>
            Protected by role-based access token control & end-to-end cryptographic consent authorization.
          </p>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-hover)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            Session Scoped: <strong style={{ color: "var(--primary)" }}>{role || "GUEST"}</strong>
          </div>
        </div>

      </div>

      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "20px 24px 0 24px",
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        fontSize: "13px",
        color: "var(--text-muted)"
      }}>
        <span>© {new Date().getFullYear()} HealthSync Management System. All rights reserved.</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          Crafted with precision <Heart size={13} color="var(--error)" fill="var(--error)" /> for digital healthcare
        </span>
      </div>
    </footer>
  );
}
