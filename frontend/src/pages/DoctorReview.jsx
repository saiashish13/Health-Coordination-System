import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { aiApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Stethoscope, Check, X, Search } from "lucide-react";
import "../styles/Dashboard.css";

function DoctorReview() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { addToast } = useToast();

  const loadRecommendations = () => {
    setLoading(true);
    aiApi.getRecommendations()
      .then(res => setRecommendations(res))
      .catch(err => console.error("Error fetching AI recommendations", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    aiApi.getRecommendations()
      .then(res => setRecommendations(res))
      .catch(err => console.error("Error fetching AI recommendations", err))
      .finally(() => setLoading(false));
  }, []);

  const handleReviewApprove = async (recId) => {
    try {
      await aiApi.reviewRecommendation(recId);
      addToast(`Recommendation #${recId} validated & approved!`, "success");
      loadRecommendations();
    } catch (err) {
      addToast("Error reviewing recommendation: " + err.message, "error");
    }
  };

  const handleReject = async (recId) => {
    try {
      await aiApi.rejectRecommendation(recId);
      addToast(`Recommendation #${recId} rejected.`, "info");
      loadRecommendations();
    } catch (err) {
      addToast("Error rejecting recommendation: " + err.message, "error");
    }
  };

  const filtered = recommendations.filter(rec => {
    const search = searchTerm.toLowerCase();
    const patientName = rec.patient?.user?.FullName || `Patient #${rec.PatientID}`;
    return patientName.toLowerCase().includes(search) || 
           (rec.RecommendationText || "").toLowerCase().includes(search) ||
           String(rec.RecommendationID).includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Physician Clinical Verification" 
          subtitle="Review and validate AI-generated recommendations before clinical execution"
          icon={Stethoscope}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by ID, patient or text..."
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
                    <th>Record ID</th>
                    <th>Recommendation Text</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No pending recommendations in verification queue.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((rec) => (
                      <tr key={rec.RecommendationID}>
                        <td style={{ fontWeight: "700" }}>#{rec.RecommendationID}</td>
                        <td>{rec.patient?.user?.FullName || `Patient #${rec.PatientID}`}</td>
                        <td>{rec.RecordID ? `#${rec.RecordID}` : "N/A"}</td>
                        <td>{rec.RecommendationText}</td>
                        <td><Badge status={rec.Status} /></td>
                        <td>
                          {rec.Status === "PENDING" ? (
                            <div className="action-btn-group">
                              <button
                                onClick={() => handleReviewApprove(rec.RecommendationID)}
                                className="btn-secondary btn-xs"
                              >
                                <Check size={14} color="var(--success)" />
                                Validate & Approve
                              </button>
                              <button
                                onClick={() => handleReject(rec.RecommendationID)}
                                className="btn-ghost btn-xs"
                                style={{ color: "var(--error)" }}
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Decision Recorded</span>
                          )}
                        </td>
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

export default DoctorReview;