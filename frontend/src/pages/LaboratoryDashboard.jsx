import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { dashboardApi } from "../services/api";
import { FlaskConical, FileSpreadsheet, ArrowRight } from "lucide-react";
import "../styles/Dashboard.css";

function LaboratoryDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getLaboratory()
      .then(res => setData(res))
      .catch(err => console.error("Error loading laboratory dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Laboratory Diagnostic Portal" 
          subtitle={`Diagnostic Center: ${data?.profile?.name || "Main Lab"}`}
          icon={FlaskConical}
        />

        {loading ? (
          <SkeletonLoader type="card" />
        ) : (
          <div className="dashboard-grid">
            
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Lab Test Orders</span>
                  <div className="metric-icon-box">
                    <FlaskConical size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.tests || 0}</div>
              </div>
              <Link to="/lab-tests" className="metric-link">
                <span>Manage Tests</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Generated Reports</span>
                  <div className="metric-icon-box" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>
                    <FileSpreadsheet size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.reports || 0}</div>
              </div>
              <Link to="/lab-reports" className="metric-link" style={{ color: "#10b981" }}>
                <span>Upload & View Reports</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default LaboratoryDashboard;