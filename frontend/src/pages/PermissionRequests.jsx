import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import PatientSelector from "../components/PatientSelector";
import { permissionApi, patientApi, doctorApi, getUserSession } from "../services/api";
import { filterByRole } from "../utils/roleFilter";
import { useToast } from "../context/ToastContext";
import { ShieldCheck, Plus, Search, Check, X } from "lucide-react";
import "../styles/Dashboard.css";

function PermissionRequests() {
  const currentUser = getUserSession();
  const { addToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [doctorId, setDoctorId] = useState(() => currentUser?.role === "DOCTOR" ? currentUser?.profile_id || "" : "");
  const [reason, setReason] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      permissionApi.getRequests().catch(() => []),
      patientApi.getAll().catch(() => []),
      doctorApi.getAll().catch(() => [])
    ])
      .then(([reqs, pats, docs]) => {
        setRequests(reqs || []);
        setPatients(pats || []);
        setDoctors(docs || []);

        if (pats?.length > 0 && !patientId) setPatientId(pats[0].PatientID);
        if (docs?.length > 0 && !doctorId) setDoctorId(docs[0].DoctorID);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!patientId || !doctorId || !reason) {
      addToast("Please fill in patient, doctor and reason for request", "warning");
      return;
    }
    try {
      await permissionApi.createRequest({
        PatientID: parseInt(patientId),
        DoctorID: parseInt(doctorId),
        Reason: reason
      });
      addToast("Access permission request submitted successfully!", "success");
      setShowForm(false);
      setReason("");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to submit permission request", "error");
    }
  };

  const handleApprove = async (id) => {
    try {
      await permissionApi.approveRequest(id);
      addToast(`Permission request #${id} approved!`, "success");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to approve request", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await permissionApi.rejectRequest(id);
      addToast(`Permission request #${id} rejected.`, "info");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to reject request", "error");
    }
  };

  const roleFiltered = filterByRole(requests, currentUser);

  const filtered = roleFiltered.filter(r => {
    const st = (r.Status || "").toUpperCase();
    if (statusFilter === "APPROVED" && st !== "APPROVED") return false;
    if (statusFilter === "REJECTED" && st !== "REJECTED" && st !== "REVOKED") return false;
    if (statusFilter === "PENDING" && st !== "PENDING") return false;

    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const reqId = String(r.RequestID || r.id || "").toLowerCase();
    const patientName = (r.patient?.user?.FullName || r.patient?.FullName || `Patient #${r.PatientID}`).toLowerCase();
    const doctorName = (r.doctor?.user?.FullName || r.doctor?.FullName || `Doctor #${r.DoctorID}`).toLowerCase();
    const reasonText = (r.Reason || "").toLowerCase();
    const statusText = (r.Status || "").toLowerCase();
    const dateText = r.RequestedAt ? new Date(r.RequestedAt).toLocaleDateString().toLowerCase() : "";

    return patientName.includes(search) || 
           doctorName.includes(search) ||
           reqId.includes(search) ||
           reasonText.includes(search) ||
           statusText.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Patient Access Permissions" 
          subtitle={currentUser?.role === "DOCTOR" ? "My confirmed (approved), unconfirmed (denied), and pending patient access permissions" : currentUser?.role === "PATIENT" ? "My record access authorization requests & consent history" : "Manage HIPAA consent and data sharing authorization requests"}
          icon={ShieldCheck}
          actions={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              <span>New Permission Request</span>
            </button>
          }
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
              <div className="search-filter-box" style={{ flex: 1, minWidth: "260px" }}>
                <Search size={16} className="search-icon-inside" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by Request ID, Patient, Doctor, reason or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="status-tabs" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`btn-xs ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "20px" }}
                >
                  All Permissions
                </button>
                <button
                  onClick={() => setStatusFilter("APPROVED")}
                  className={`btn-xs ${statusFilter === "APPROVED" ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "20px" }}
                >
                  Confirmed (Approved)
                </button>
                <button
                  onClick={() => setStatusFilter("REJECTED")}
                  className={`btn-xs ${statusFilter === "REJECTED" ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "20px" }}
                >
                  Unconfirmed (Denied)
                </button>
                <button
                  onClick={() => setStatusFilter("PENDING")}
                  className={`btn-xs ${statusFilter === "PENDING" ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "20px" }}
                >
                  Pending
                </button>
              </div>
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
                        No permission requests found matching your profile and search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.RequestID}>
                        <td style={{ fontWeight: "700" }}>#{r.RequestID}</td>
                        <td style={{ fontWeight: "600" }}>{r.patient?.user?.FullName || r.patient?.FullName || `Patient #${r.PatientID}`}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>Dr. {r.doctor?.user?.FullName || r.doctor?.FullName || `Doctor #${r.DoctorID}`}</td>
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Patient (Search by Name or ID)</label>
              <PatientSelector
                patients={patients}
                value={patientId}
                onChange={setPatientId}
                disabled={currentUser?.role === "PATIENT"}
                placeholder="Search patient by Name or ID (e.g. John or 1)..."
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Doctor</label>
              {doctors.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                  disabled={currentUser?.role === "DOCTOR"}
                >
                  {doctors.map(d => (
                    <option key={d.DoctorID} value={d.DoctorID}>
                      Dr. {d.user?.FullName || `Doctor #${d.DoctorID}`} - {d.Specialty || "General"} (ID: {d.DoctorID})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Doctor ID"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                />
              )}
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