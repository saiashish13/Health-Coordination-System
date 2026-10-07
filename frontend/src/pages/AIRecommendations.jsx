import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { aiApi } from "../services/api";
import { BrainCircuit, Search } from "lucide-react";
import "../styles/Dashboard.css";

function AIRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    aiApi.getRecommendations()
      .then(res => setRecommendations(res || []))
      .catch(err => console.error("Error fetching AI recommendations", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = recommendations.filter(rec => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const recId = String(rec.RecommendationID || rec.id || "").toLowerCase();
    const patientName = (rec.patient?.user?.FullName || rec.patient?.FullName || `Patient #${rec.PatientID}`).toLowerCase();
    const typeText = (rec.RecommendationType || "").toLowerCase();
    const detailsText = (rec.RecommendationText || "").toLowerCase();
    const statusText = (rec.Status || "").toLowerCase();
    const dateText = rec.ReviewedAt ? new Date(rec.ReviewedAt).toLocaleDateString().toLowerCase() : "";

    return patientName.includes(search) || 
           typeText.includes(search) ||
           detailsText.includes(search) ||
           recId.includes(search) ||
           statusText.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="AI Care Recommendations" 
          subtitle="AI-generated care coordination draft recommendations awaiting physician validation"
          icon={BrainCircuit}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by ID, patient, recommendation type, details or status..."
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
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Recommendation Type</th>
                    <th>Recommendation Details</th>
                    <th>Status</th>
                    <th>Reviewed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No AI recommendations found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((rec) => (
                      <tr key={rec.RecommendationID}>
                        <td style={{ fontWeight: "700" }}>#{rec.RecommendationID}</td>
                        <td style={{ fontWeight: "600" }}>{rec.patient?.user?.FullName || rec.patient?.FullName || `Patient #${rec.PatientID}`}</td>
                        <td><Badge status="ACTIVE" text={rec.RecommendationType || "CARE_COORDINATION"} /></td>
                        <td>{rec.RecommendationText}</td>
                        <td><Badge status={rec.Status} /></td>
                        <td>{rec.ReviewedAt ? new Date(rec.ReviewedAt).toLocaleDateString() : "Pending Clinician Review"}</td>
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

export default AIRecommendations;