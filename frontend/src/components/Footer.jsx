import { Activity, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-container" style={{
      marginTop: "auto",
      borderTop: "1px solid var(--border-color)",
      background: "var(--bg-card)",
      backdropFilter: "blur(12px)",
      padding: "40px 0 24px 0",
      color: "var(--text-secondary)",
      fontSize: "14px"
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "32px",
        marginBottom: "32px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Activity size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: "800", fontSize: "18px", color: "var(--text-primary)" }}>
              Health<span style={{ color: "var(--primary)" }}>Sync</span>
            </span>
          </div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.5" }}>
            Empowering modern digital healthcare management with secure, instant care coordination and AI recommendations.
          </p>
        </div>

        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
            System Portals
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><Link to="/patient-dashboard" style={{ color: "var(--text-secondary)" }}>Patient Portal</Link></li>
            <li><Link to="/doctor-dashboard" style={{ color: "var(--text-secondary)" }}>Doctor Portal</Link></li>
            <li><Link to="/hospital-dashboard" style={{ color: "var(--text-secondary)" }}>Hospital Management</Link></li>
            <li><Link to="/laboratory-dashboard" style={{ color: "var(--text-secondary)" }}>Laboratory Hub</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
            Quick Services
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><Link to="/appointments" style={{ color: "var(--text-secondary)" }}>Book Appointment</Link></li>
            <li><Link to="/medical-records" style={{ color: "var(--text-secondary)" }}>Medical History</Link></li>
            <li><Link to="/lab-reports" style={{ color: "var(--text-secondary)" }}>Diagnostic Reports</Link></li>
            <li><Link to="/prescriptions" style={{ color: "var(--text-secondary)" }}>Pharmacy Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
            Security & Trust
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontWeight: "600", fontSize: "13px" }}>
            <Shield size={16} />
            <span>256-bit Encrypted HIPAA Compliant</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "8px" }}>
            All patient medical records are secured via strict role-based access token controls.
          </p>
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
          Crafted with care <Heart size={13} color="var(--error)" fill="var(--error)" /> for modern medicine
        </span>
      </div>
    </footer>
  );
}
