import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { adminApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Users as UsersIcon, Search } from "lucide-react";
import "../styles/Dashboard.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { addToast } = useToast();

  const loadUsers = () => {
    setLoading(true);
    adminApi.getUsers()
      .then(res => setUsers(res))
      .catch(err => console.error("Error fetching users", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    adminApi.getUsers()
      .then(res => setUsers(res))
      .catch(err => console.error("Error fetching users", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await adminApi.updateUserRole(userId, role);
      addToast(`User #${userId} role updated to ${role}`, "success");
      loadUsers(true);
    } catch (err) {
      addToast(err.message || "Failed to update role", "error");
    }
  };

  const filtered = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return (u.FullName || "").toLowerCase().includes(search) || 
           (u.Email || "").toLowerCase().includes(search) ||
           (u.Role || "").toLowerCase().includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="User Account Management" 
          subtitle="System user directory and role assignment controls"
          icon={UsersIcon}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email or role..."
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
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Role Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No system users found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u.UserID}>
                        <td style={{ fontWeight: "700" }}>#{u.UserID}</td>
                        <td style={{ fontWeight: "600" }}>{u.FullName}</td>
                        <td>{u.Email}</td>
                        <td><Badge status={u.Role} /></td>
                        <td>
                          <select
                            className="form-input"
                            style={{ height: "32px", padding: "2px 8px", width: "130px", fontSize: "12px" }}
                            value={u.Role}
                            onChange={(e) => handleRoleChange(u.UserID, e.target.value)}
                          >
                            <option value="PATIENT">PATIENT</option>
                            <option value="DOCTOR">DOCTOR</option>
                            <option value="HOSPITAL">HOSPITAL</option>
                            <option value="LAB">LAB</option>
                            <option value="PHARMACY">PHARMACY</option>
                          </select>
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

export default Users;