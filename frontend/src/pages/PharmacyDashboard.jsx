import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { dashboardApi } from "../services/api";
import { Pill, ShoppingBag, FileText, ArrowRight } from "lucide-react";
import "../styles/Dashboard.css";

function PharmacyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getPharmacy()
      .then(res => setData(res))
      .catch(err => console.error("Error loading pharmacy dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Pharmacy Portal" 
          subtitle={`Pharmacy Hub: ${data?.profile?.name || "Central Pharmacy"}`}
          icon={Pill}
        />

        {loading ? (
          <SkeletonLoader type="card" />
        ) : (
          <div className="dashboard-grid">
            
            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Medicine Catalog</span>
                  <div className="metric-icon-box">
                    <Pill size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.medicines || 0}</div>
              </div>
              <Link to="/medicines" className="metric-link">
                <span>Manage Inventory</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Dispense Orders</span>
                  <div className="metric-icon-box" style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" }}>
                    <ShoppingBag size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.orders || 0}</div>
              </div>
              <Link to="/medication-orders" className="metric-link" style={{ color: "#f59e0b" }}>
                <span>Fulfill Orders</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-card-top">
                  <span className="metric-title">Prescriptions</span>
                  <div className="metric-icon-box" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>
                    <FileText size={22} />
                  </div>
                </div>
                <div className="metric-value">{data?.metrics?.prescriptions || 0}</div>
              </div>
              <Link to="/prescriptions" className="metric-link" style={{ color: "#10b981" }}>
                <span>View Prescriptions</span>
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

export default PharmacyDashboard;