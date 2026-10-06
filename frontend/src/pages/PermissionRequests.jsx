import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { permissionApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ShieldCheck, Plus, Search, Check, X } from "lucide-react";
import "../styles/Dashboard.css";

function PermissionRequests() {
  const currentUser = getUserSession();
  const { addToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [doctorId, setDoctorId] = useState(() => currentUser?.role === "DOCTOR" ? currentUser?.profile_id || "" : "");
  const [reason, setReason] = useState("");

  const loadRequests = () => {
    setLoading(true);
    permissionApi.getRequests()
      .then(res => setRequests(res))
      .catch(err => console.error("Error fetching access requests", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    permissionApi.getRequests()
      .then(res => setRequests(res))
      .catch(err => console.error("Error fetching access requests", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await permissionApi.createRequest({
        PatientID: parseInt(patientId),
        DoctorID: parseInt(doctorId),
        Reason: reason
      });
      addToast("Access permission request submitted successfully!", "success");
      setShowForm(false);
      setReason("");
      loadRequests();
    } catch (err) {
      addToast(err.message || "Failed to submit permission request", "error");
    }
  };

  const handleApprove = async (id) => {
    try {
      await permissionApi.approveRequest(id);
      addToast(`Permission request #${id} approved!`, "success");
      loadRequests();
    } catch (err) {
      addToast(err.message || "Failed to approve request", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await permissionApi.rejectRequest(id);
      addToast(`Permission request #${id} rejected.`, "info");
      loadRequests();
    } catch (err) {
      addToast(err.message || "Failed to reject request", "error");
    }
  };

  const filtered = requests.filter(r => {
    const search = searchTerm.toLowerCase();
    const patientName = r.patient?.user?.FullName || `Patient #${r.PatientID}`;
    const doctorName = r.doctor?.user?.FullName || `Doctor #${r.DoctorID}`;
    return patientName.toLowerCase().includes(search) || 
           doctorName.toLowerCase().includes(search) ||
           String(r.RequestID).includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Patient Access Permissions" 
          subtitle="Manage HIPAA consent and data sharing authorization requests"
          icon={ShieldCheck}
          actions={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              <span>New Permission Request</span>
            </button>
          }
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by Request ID, patient or doctor..."
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
                    <th>Request ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Reason</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No permission requests found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.RequestID}>
                        <td style={{ fontWeight: "700" }}>#{r.RequestID}</td>
                        <td>{r.patient?.user?.FullName || `Patient #${r.PatientID}`}</td>
                        <td>{r.doctor?.user?.FullName || `Doctor #${r.DoctorID}`}</td>
                        <td>{r.Reason || "Medical Record Review"}</td>
                        <td>{r.RequestedAt ? new Date(r.RequestedAt).toLocaleDateString() : "N/A"}</td>
                        <td><Badge status={r.Status} /></td>
                        <td>
                          {r.Status === "PENDING" ? (
                            <div className="action-btn-group">
                              <button
                                onClick={() => handleApprove(r.RequestID)}
                                className="btn-secondary btn-xs"
                              >
                                <Check size={14} color="var(--success)" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(r.RequestID)}
                                className="btn-ghost btn-xs"
                                style={{ color: "var(--error)" }}
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Action Completed</span>
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

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Access Permission Request">
          <form onSubmit={handleCreateRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Patient ID</label>
              <input
                type="number"
                className="form-input"
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Doctor ID</label>
              <input
                type="number"
                className="form-input"
                placeholder="Doctor ID"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Reason for Access</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Reason for requesting clinical data access..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ height: "auto" }}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Submit Consent Request
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default PermissionRequests;