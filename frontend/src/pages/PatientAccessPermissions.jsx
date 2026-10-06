import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { permissionApi } from "../services/api";
import { ShieldCheck, Search, CheckCircle, XCircle } from "lucide-react";
import "../styles/Dashboard.css";

function PatientAccessPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    permissionApi.getAccessPermissions()
      .then(res => setPermissions(res))
      .catch(err => console.error("Error fetching access permissions", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = permissions.filter(p => {
    const search = searchTerm.toLowerCase();
    return (p.ResourceType || "").toLowerCase().includes(search) || 
           String(p.PermissionID).includes(search) ||
           String(p.AccessID).includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Granular Resource Access Permissions" 
          subtitle="Resource-level read, write, and edit permission matrix for care providers"
          icon={ShieldCheck}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by resource type, Permission ID or Access ID..."
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
                    <th>Perm ID</th>
                    <th>Access Link ID</th>
                    <th>Resource Type</th>
                    <th>Can View</th>
                    <th>Can Add</th>
                    <th>Can Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No resource permissions recorded.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.PermissionID}>
                        <td style={{ fontWeight: "700" }}>#{p.PermissionID}</td>
                        <td>#{p.AccessID}</td>
                        <td><Badge status="ACTIVE" text={p.ResourceType} /></td>
                        <td>
                          {p.CanView ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--success)", fontWeight: "600" }}>
                              <CheckCircle size={15} /> Yes
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--error)", fontWeight: "600" }}>
                              <XCircle size={15} /> No
                            </span>
                          )}
                        </td>
                        <td>
                          {p.CanAdd ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--success)", fontWeight: "600" }}>
                              <CheckCircle size={15} /> Yes
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--error)", fontWeight: "600" }}>
                              <XCircle size={15} /> No
                            </span>
                          )}
                        </td>
                        <td>
                          {p.CanEdit ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--success)", fontWeight: "600" }}>
                              <CheckCircle size={15} /> Yes
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--error)", fontWeight: "600" }}>
                              <XCircle size={15} /> No
                            </span>
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

export default PatientAccessPermissions;