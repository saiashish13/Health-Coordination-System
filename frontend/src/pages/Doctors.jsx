import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { doctorApi } from "../services/api";
import { Stethoscope, Search } from "lucide-react";
import "../styles/Dashboard.css";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    doctorApi.getAll()
      .then(res => setDoctors(res || []))
      .catch(err => console.error("Error fetching doctors", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const docId = String(d.DoctorID || d.id || "").toLowerCase();
    const name = (d.user?.FullName || d.FullName || `Doctor #${d.DoctorID}`).toLowerCase();
    const email = (d.user?.Email || d.Email || "").toLowerCase();
    const specialty = (d.Specialty || "").toLowerCase();
    const license = (d.LicenseNumber || "").toLowerCase();

    return name.includes(search) || 
           specialty.includes(search) ||
           docId.includes(search) ||
           email.includes(search) ||
           license.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Doctor Directory" 
          subtitle="Certified medical doctors, clinical specialties, and licensing credentials"
          icon={Stethoscope}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by doctor name, specialty, Doctor ID, email or license..."
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
                    <th>Doctor ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Specialty</th>
                    <th>License Number</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No doctors found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d) => (
                      <tr key={d.DoctorID}>
                        <td style={{ fontWeight: "700" }}>#{d.DoctorID}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>Dr. {d.user?.FullName || d.FullName || "Provider"}</td>
                        <td>{d.user?.Email || d.Email || "N/A"}</td>
                        <td><Badge status="ACTIVE" text={d.Specialty || "General Medicine"} /></td>
                        <td>{d.LicenseNumber || "MED-884920"}</td>
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

export default Doctors;