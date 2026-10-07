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

  useEffect(() => {
    permissionApi.getDoctorAccessLinks()
      .then(res => setAccessLinks(res || []))
      .catch(err => console.error("Error fetching access links", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = accessLinks.filter(acc => {
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
          subtitle="Active and expired access tokens granting physicians permission to patient medical history"
          icon={ShieldCheck}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by Access ID, patient, doctor or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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