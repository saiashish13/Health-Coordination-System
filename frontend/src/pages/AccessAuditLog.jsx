import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { adminApi } from "../services/api";
import { ShieldCheck, Search } from "lucide-react";
import "../styles/Dashboard.css";

function AccessAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    adminApi.getAuditLogs()
      .then(res => setLogs(res))
      .catch(err => console.error("Error fetching audit logs", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    return (log.ActionType || "").toLowerCase().includes(search) || 
           (log.ResourceType || "").toLowerCase().includes(search) ||
           String(log.LogID).includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Security & HIPAA Access Audit Log" 
          subtitle="Immutable audit trail recording access and modifications to protected health information (PHI)"
          icon={ShieldCheck}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by action, resource type or log ID..."
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
                    <th>Log ID</th>
                    <th>User ID</th>
                    <th>Action</th>
                    <th>Resource Type</th>
                    <th>Resource ID</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No audit logs recorded.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((l) => (
                      <tr key={l.LogID}>
                        <td style={{ fontWeight: "700" }}>#{l.LogID}</td>
                        <td>User #{l.UserID || "System"}</td>
                        <td><Badge status="ACTIVE" text={l.ActionType} /></td>
                        <td>{l.ResourceType}</td>
                        <td>#{l.ResourceID}</td>
                        <td>{l.Timestamp ? new Date(l.Timestamp).toLocaleString() : "N/A"}</td>
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

export default AccessAuditLog;