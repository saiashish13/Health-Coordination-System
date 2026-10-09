import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { appointmentApi, patientApi, doctorApi, getUserSession } from "../services/api";
import { filterByRole } from "../utils/roleFilter";
import { useToast } from "../context/ToastContext";
import { Calendar, Plus, Search, Check, Clock, XCircle } from "lucide-react";
import "../styles/Dashboard.css";

function Appointments() {
  const currentUser = getUserSession();
  const { addToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  
  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [doctorId, setDoctorId] = useState(() => currentUser?.role === "DOCTOR" ? currentUser?.profile_id || "" : "");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      appointmentApi.getAll().catch(() => []),
      patientApi.getAll().catch(() => []),
      doctorApi.getAll().catch(() => [])
    ])
      .then(([appts, pats, docs]) => {
        setAppointments(appts || []);
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

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!patientId || !doctorId || !appointmentDate) {
      addToast("Please fill out all required fields", "warning");
      return;
    }
    try {
      await appointmentApi.create({
        PatientID: parseInt(patientId),
        DoctorID: parseInt(doctorId),
        AppointmentDate: new Date(appointmentDate).toISOString(),
        Reason: reason
      });
      addToast("Appointment scheduled successfully!", "success");
      setShowScheduleForm(false);
      setReason("");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to schedule appointment", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      addToast(`Appointment #${id} set to ${status}`, "success");
      loadData();
    } catch (err) {
      addToast("Error updating status: " + err.message, "error");
    }
  };

  // Enforce role-based access filtering
  const roleFiltered = filterByRole(appointments, currentUser);

  const filtered = roleFiltered.filter(a => {
    if (statusFilter !== "ALL" && (a.Status || "").toUpperCase() !== statusFilter) {
      return false;
    }
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const apptId = String(a.AppointmentID || a.id || "").toLowerCase();
    const patientName = (a.patient?.user?.FullName || a.patient?.FullName || a.PatientName || `Patient #${a.PatientID || ""}`).toLowerCase();
    const doctorName = (a.doctor?.user?.FullName || a.doctor?.FullName || a.DoctorName || `Doctor #${a.DoctorID || ""}`).toLowerCase();
    const reasonText = (a.Reason || a.reason || "").toLowerCase();
    const statusText = (a.Status || a.status || "").toLowerCase();
    const dateText = a.AppointmentDate ? new Date(a.AppointmentDate).toLocaleString().toLowerCase() : "";

    return patientName.includes(search) || 
           doctorName.includes(search) || 
           reasonText.includes(search) ||
           statusText.includes(search) ||
           apptId.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Appointments Management" 
          subtitle={currentUser?.role === "DOCTOR" ? "My patient clinical appointments & scheduled requests" : currentUser?.role === "PATIENT" ? "My scheduled healthcare appointments" : "View, schedule, and update patient clinical appointments"}
          icon={Calendar}
          actions={
            currentUser?.role !== "DOCTOR" ? (
              <button className="btn-primary" onClick={() => setShowScheduleForm(true)}>
                <Plus size={18} />
                <span>Schedule Appointment</span>
              </button>
            ) : null
          }
        />

        {/* Search & Toolbar */}
        <div className="table-card-wrapper">
          <div className="table-toolbar" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
              <div className="search-filter-box" style={{ flex: 1, minWidth: "260px" }}>
                <Search size={16} className="search-icon-inside" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by patient, doctor, status, date or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="status-tabs" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["ALL", "SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`btn-xs ${statusFilter === st ? "btn-primary" : "btn-secondary"}`}
                    style={{ borderRadius: "20px" }}
                  >
                    {st === "SCHEDULED" ? "Scheduled" : st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
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
                    <th>Appt ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No appointments found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => (
                      <tr key={a.AppointmentID || a.id}>
                        <td style={{ fontWeight: "700" }}>#{a.AppointmentID}</td>
                        <td style={{ fontWeight: "600" }}>{a.patient?.user?.FullName || a.patient?.FullName || `Patient #${a.PatientID}`}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>Dr. {a.doctor?.user?.FullName || a.doctor?.FullName || `Doctor #${a.DoctorID}`}</td>
                        <td>{new Date(a.AppointmentDate).toLocaleString()}</td>
                        <td><Badge status={a.Status} /></td>
                        <td>{a.Reason || "Routine Checkup"}</td>
                        <td>
                          <div className="action-btn-group">
                            {(a.Status === "SCHEDULED" || a.Status === "PENDING") && (
                              <button
                                onClick={() => handleStatusChange(a.AppointmentID, "CONFIRMED")}
                                className="btn-secondary btn-xs"
                                style={{ color: "var(--success)", borderColor: "var(--success)" }}
                                title="Confirm Appointment"
                              >
                                <Check size={14} />
                                Confirm
                              </button>
                            )}
                            {a.Status === "CONFIRMED" && (
                              <button
                                onClick={() => handleStatusChange(a.AppointmentID, "COMPLETED")}
                                className="btn-secondary btn-xs"
                                style={{ color: "var(--primary)" }}
                                title="Mark Completed"
                              >
                                <Clock size={14} />
                                Complete
                              </button>
                            )}
                            {a.Status !== "COMPLETED" && a.Status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusChange(a.AppointmentID, "CANCELLED")}
                                className="btn-ghost btn-xs"
                                style={{ color: "var(--error)" }}
                                title="Cancel Appointment"
                              >
                                <XCircle size={14} />
                                Cancel
                              </button>
                            )}
                            {(a.Status === "COMPLETED" || a.Status === "CANCELLED") && (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Schedule Modal */}
        <Modal
          isOpen={showScheduleForm}
          onClose={() => setShowScheduleForm(false)}
          title="Schedule New Appointment"
        >
          <form onSubmit={handleSchedule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Patient Info</label>
              {currentUser?.role === "PATIENT" ? (
                <input
                  type="text"
                  className="form-input"
                  value={`${currentUser.full_name || currentUser.fullName || currentUser.email || "Patient"} (ID: #${currentUser.profile_id || 1})`}
                  disabled
                  style={{ background: "rgba(99, 102, 241, 0.08)", fontWeight: "600", color: "var(--primary)" }}
                />
              ) : (
                <PatientSelector
                  patients={patients}
                  value={patientId}
                  onChange={setPatientId}
                  placeholder="Search patient by Name or ID..."
                />
              )}
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
                      Dr. {d.user?.FullName || `Doctor #${d.DoctorID}`} - {d.Specialty || "Cardiology"} (ID: {d.DoctorID})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter Doctor ID (e.g. 1)"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Reason for Visit</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Chief complaint, symptoms, or routine checkup notes..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ height: "auto" }}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Submit Appointment Schedule
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default Appointments;