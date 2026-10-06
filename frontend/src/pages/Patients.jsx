import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { patientApi } from "../services/api";
import { Users as UsersIcon, Search } from "lucide-react";
import "../styles/Dashboard.css";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    patientApi.getAll()
      .then(res => setPatients(res))
      .catch(err => console.error("Error fetching patients", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const search = searchTerm.toLowerCase();
    const name = p.user?.FullName || `Patient #${p.PatientID}`;
    const email = p.user?.Email || "";
    return name.toLowerCase().includes(search) || email.toLowerCase().includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Patient Directory" 
          subtitle="Registered patient profiles and emergency contact registry"
          icon={UsersIcon}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by patient name or email..."
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
                    <th>Patient ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Gender</th>
                    <th>Blood Type</th>
                    <th>Emergency Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.PatientID}>
                        <td style={{ fontWeight: "700" }}>#{p.PatientID}</td>
                        <td style={{ fontWeight: "600" }}>{p.user?.FullName || "N/A"}</td>
                        <td>{p.user?.Email || "N/A"}</td>
                        <td>{p.Gender || "Unspecified"}</td>
                        <td><Badge status="ACTIVE" text={p.BloodType || "O+"} /></td>
                        <td>{p.EmergencyContact || "N/A"}</td>
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

export default Patients;