import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { dashboardApi } from "../services/api";
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  FileText, 
  Pill, 
  ShieldAlert, 
  ArrowRight 
} from "lucide-react";
import "../styles/Dashboard.css";

function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getDoctor()
      .then(res => setData(res))
      .catch(err => console.error("Error loading doctor dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Doctor Portal" 
          subtitle={`Welcome, Dr. ${data?.profile?.fullName || "Doctor"} (${data?.profile?.specialty || "Clinical Specialist"})`}
          icon={Stethoscope}
        />

        {loading ? (
          <SkeletonLoader type="card" />
        ) : (
          <div className="dashboard-grid">
            
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Active Patients</span>
                  <div className="metric-icon-box">
                    <Users size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.patients || 0}</div>
              </div>
              <Link to="/patients" className="metric-link">
                <span>View Patients</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Upcoming Appointments</span>
                  <div className="metric-icon-box metric-box-1">
                    <Calendar size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.appointments || 0}</div>
              </div>
              <Link to="/appointments" className="metric-link metric-link-1">
                <span>View Appointments</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Medical Records</span>
                  <div className="metric-icon-box metric-box-2">
                    <FileText size={22} />
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Clinical history and diagnosis logs.
                </p>
              </div>
              <Link to="/medical-records" className="metric-link metric-link-2">
                <span>View Records</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Prescriptions</span>
                  <div className="metric-icon-box metric-box-3">
                    <Pill size={22} />
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Create and manage medication orders.
                </p>
              </div>
              <Link to="/prescriptions" className="metric-link metric-link-3">
                <span>Issue Prescription</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Access Requests</span>
                  <div className="metric-icon-box metric-box-4">
                    <ShieldAlert size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.pendingRequests || 0}</div>
              </div>
              <Link to="/permission-requests" className="metric-link metric-link-4">
                <span>Review Requests</span>
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

export default DoctorDashboard;