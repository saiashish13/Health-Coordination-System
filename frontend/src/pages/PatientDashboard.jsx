import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { dashboardApi } from "../services/api";
import { 
  Calendar, 
  FileText, 
  FlaskConical, 
  Pill, 
  ShoppingBag, 
  Bot, 
  ArrowRight,
  HeartPulse
} from "lucide-react";
import "../styles/Dashboard.css";

function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getPatient()
      .then(res => setData(res))
      .catch(err => console.error("Error loading patient dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Patient Portal" 
          subtitle={`Welcome back, ${data?.profile?.fullName || "Patient"}! Manage your medical care below.`}
          icon={HeartPulse}
        />

        {loading ? (
          <SkeletonLoader type="card" />
        ) : (
          <div className="dashboard-grid">
            
            {/* Appointments Card */}
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Active Appointments</span>
                  <div className="metric-icon-box">
                    <Calendar size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.appointments || 0}</div>
              </div>
              <Link to="/appointments" className="metric-link">
                <span>View Appointments</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Medical Records Card */}
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">History Records</span>
                  <div className="metric-icon-box" style={{ color: "#6366f1", background: "rgba(99, 102, 241, 0.1)" }}>
                    <FileText size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.records || 0}</div>
              </div>
              <Link to="/medical-records" className="metric-link" style={{ color: "#6366f1" }}>
                <span>View Medical Records</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Lab Reports Card */}
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Completed Lab Reports</span>
                  <div className="metric-icon-box" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>
                    <FlaskConical size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.labReports || 0}</div>
              </div>
              <Link to="/lab-reports" className="metric-link" style={{ color: "#10b981" }}>
                <span>View Lab Reports</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Prescriptions Card */}
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Active Prescriptions</span>
                  <div className="metric-icon-box" style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" }}>
                    <Pill size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.prescriptions || 0}</div>
              </div>
              <Link to="/prescriptions" className="metric-link" style={{ color: "#f59e0b" }}>
                <span>View Prescriptions</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Medication Orders Card */}
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Pharmacy Orders</span>
                  <div className="metric-icon-box" style={{ color: "#ec4899", background: "rgba(236, 72, 153, 0.1)" }}>
                    <ShoppingBag size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.medicationOrders || 0}</div>
              </div>
              <Link to="/medication-orders" className="metric-link" style={{ color: "#ec4899" }}>
                <span>View Orders</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* AI Assistant Card */}
            <div className="metric-card" style={{ border: "1px solid var(--primary-light)", background: "var(--bg-card)" }}>
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">AI Care Coordinator</span>
                  <div className="metric-icon-box" style={{ color: "var(--primary)", background: "var(--primary-light)" }}>
                    <Bot size={22} />
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Instant health answers and personal symptom analysis.
                </p>
              </div>
              <Link to="/ai-assistant" className="btn-primary btn-xs" style={{ marginTop: "12px", width: "fit-content" }}>
                <span>Launch AI Assistant</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default PatientDashboard;