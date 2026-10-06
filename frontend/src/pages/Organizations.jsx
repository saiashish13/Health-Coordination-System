import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { organizationApi } from "../services/api";
import { Building2, Search } from "lucide-react";
import "../styles/Dashboard.css";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    organizationApi.getAll()
      .then(res => setOrganizations(res))
      .catch(err => console.error("Error fetching organizations", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = organizations.filter(o => {
    const search = searchTerm.toLowerCase();
    return (o.OrganizationName || "").toLowerCase().includes(search) || 
           (o.Type || "").toLowerCase().includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Organizations Directory" 
          subtitle="Hospitals, diagnostic laboratories, and pharmacy network nodes"
          icon={Building2}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by organization name or type..."
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
                    <th>Org ID</th>
                    <th>Organization Name</th>
                    <th>Type</th>
                    <th>Address</th>
                    <th>Contact Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No organizations found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.OrganizationID}>
                        <td style={{ fontWeight: "700" }}>#{o.OrganizationID}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>{o.OrganizationName}</td>
                        <td><Badge status="ACTIVE" text={o.Type} /></td>
                        <td>{o.Address || "Main Medical Campus"}</td>
                        <td>{o.Phone || "+1 (800) 555-0199"}</td>
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

export default Organizations;