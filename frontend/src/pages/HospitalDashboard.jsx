import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { dashboardApi } from "../services/api";
import { Building2, Users, UserCheck, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";
import "../styles/Dashboard.css";

function HospitalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getHospital()
      .then(res => setData(res))
      .catch(err => console.error("Error loading hospital dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Hospital & Admin Portal" 
          subtitle={`Hospital Management Overview: ${data?.profile?.name || "System Admin"}`}
          icon={Building2}
        />

        {loading ? (
          <SkeletonLoader type="card" />
        ) : (
          <div className="dashboard-grid">
            
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">System Users</span>
                  <div className="metric-icon-box">
                    <Users size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.users || 0}</div>
              </div>
              <Link to="/users" className="metric-link">
                <span>Manage Users</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Registered Doctors</span>
                  <div className="metric-icon-box" style={{ color: "#6366f1", background: "rgba(99, 102, 241, 0.1)" }}>
                    <UserCheck size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.doctors || 0}</div>
              </div>
              <Link to="/doctors" className="metric-link" style={{ color: "#6366f1" }}>
                <span>Manage Doctors</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Hospital Patients</span>
                  <div className="metric-icon-box" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>
                    <Building2 size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.patients || 0}</div>
              </div>
              <Link to="/patients" className="metric-link" style={{ color: "#10b981" }}>
                <span>View Patients</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Organizations</span>
                  <div className="metric-icon-box" style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" }}>
                    <ShieldCheck size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.organizations || 0}</div>
              </div>
              <Link to="/organizations" className="metric-link" style={{ color: "#f59e0b" }}>
                <span>View Organizations</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Security Audit Log</span>
                  <div className="metric-icon-box" style={{ color: "#ec4899", background: "rgba(236, 72, 153, 0.1)" }}>
                    <FileCheck size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.auditLogs || 0}</div>
              </div>
              <Link to="/access-audit-log" className="metric-link" style={{ color: "#ec4899" }}>
                <span>View Audit Trail</span>
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

export default HospitalDashboard;