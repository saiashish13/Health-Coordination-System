import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { permissionApi } from "../services/api";
import { ShieldCheck, Search } from "lucide-react";
import "../styles/Dashboard.css";

function PatientDoctorAccess() {
  const [accessLinks, setAccessLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    permissionApi.getDoctorAccessLinks()
      .then(res => setAccessLinks(res || []))
      .catch(err => console.error("Error fetching access links", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = accessLinks.filter(acc => {
    const st = (acc.Status || "").toUpperCase();
    if (statusFilter === "ACTIVE" && st !== "ACTIVE") return false;
    if (statusFilter === "REVOKED" && st !== "REVOKED" && st !== "EXPIRED") return false;

    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const accId = String(acc.AccessID || acc.id || "").toLowerCase();
    const patientName = (acc.patient?.user?.FullName || acc.patient?.FullName || `Patient #${acc.PatientID}`).toLowerCase();
    const doctorName = (acc.doctor?.user?.FullName || acc.doctor?.FullName || `Doctor #${acc.DoctorID}`).toLowerCase();
    const statusText = (acc.Status || "").toLowerCase();
    const grantedText = acc.GrantedAt ? new Date(acc.GrantedAt).toLocaleDateString().toLowerCase() : "";
    const expiresText = acc.ExpiresAt ? new Date(acc.ExpiresAt).toLocaleDateString().toLowerCase() : "";

    return patientName.includes(search) || 
           doctorName.includes(search) ||
           accId.includes(search) ||
           statusText.includes(search) ||
           grantedText.includes(search) ||
           expiresText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Patient-Doctor Access Links" 
          subtitle="Confirmed active & unconfirmed (expired/revoked) access tokens granting permission to patient medical history"
          icon={ShieldCheck}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
              <div className="search-filter-box" style={{ flex: 1, minWidth: "260px" }}>
                <Search size={16} className="search-icon-inside" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by Access ID, patient, doctor or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="status-tabs" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`btn-xs ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "20px" }}
                >
                  All Links
                </button>
                <button
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`btn-xs ${statusFilter === "ACTIVE" ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "20px" }}
                >
                  Confirmed (Active)
                </button>
                <button
                  onClick={() => setStatusFilter("REVOKED")}
                  className={`btn-xs ${statusFilter === "REVOKED" ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "20px" }}
                >
                  Unconfirmed (Revoked / Expired)
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader rows={6} />
          ) : (
            <div className="table-responsive-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Access ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Granted Date</th>
                    <th>Expiration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No doctor access links found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((acc) => (
                      <tr key={acc.AccessID}>
                        <td style={{ fontWeight: "700" }}>#{acc.AccessID}</td>
                        <td style={{ fontWeight: "600" }}>{acc.patient?.user?.FullName || acc.patient?.FullName || `Patient #${acc.PatientID}`}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>Dr. {acc.doctor?.user?.FullName || acc.doctor?.FullName || `Doctor #${acc.DoctorID}`}</td>
                        <td>{acc.GrantedAt ? new Date(acc.GrantedAt).toLocaleDateString() : "N/A"}</td>
                        <td>{acc.ExpiresAt ? new Date(acc.ExpiresAt).toLocaleDateString() : "Permanent / Revocable"}</td>
                        <td><Badge status={acc.Status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default PatientDoctorAccess;