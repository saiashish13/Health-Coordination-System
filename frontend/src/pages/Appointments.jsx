import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { appointmentApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Calendar, Plus, Search, Check, Clock, XCircle } from "lucide-react";
import "../styles/Dashboard.css";

function Appointments() {
  const currentUser = getUserSession();
  const { addToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  
  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [doctorId, setDoctorId] = useState(() => currentUser?.role === "DOCTOR" ? currentUser?.profile_id || "" : "");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");

  const loadAppointments = () => {
    setLoading(true);
    appointmentApi.getAll()
      .then(res => setAppointments(res))
      .catch(err => console.error("Error fetching appointments", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    appointmentApi.getAll()
      .then(res => setAppointments(res))
      .catch(err => console.error("Error fetching appointments", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
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
      loadAppointments();
    } catch (err) {
      addToast(err.message || "Failed to schedule appointment", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      addToast(`Appointment #${id} set to ${status}`, "success");
      loadAppointments();
    } catch (err) {
      addToast("Error updating status: " + err.message, "error");
    }
  };

  const filtered = appointments.filter(a => {
    const search = searchTerm.toLowerCase();
    const patientName = a.patient?.user?.FullName || `Patient #${a.PatientID}`;
    const doctorName = a.doctor?.user?.FullName || `Doctor #${a.DoctorID}`;
    const reasonText = a.Reason || "";
    return patientName.toLowerCase().includes(search) || 
           doctorName.toLowerCase().includes(search) || 
           reasonText.toLowerCase().includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Appointments Management" 
          subtitle="View, schedule, and update patient clinical appointments"
          icon={Calendar}
          actions={
            <button className="btn-primary" onClick={() => setShowScheduleForm(true)}>
              <Plus size={18} />
              <span>Schedule Appointment</span>
            </button>
          }
        />

        {/* Search & Toolbar */}
        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by patient, doctor or reason..."
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
                      <tr key={a.AppointmentID}>
                        <td style={{ fontWeight: "700" }}>#{a.AppointmentID}</td>
                        <td>{a.patient?.user?.FullName || `Patient #${a.PatientID}`}</td>
                        <td>{a.doctor?.user?.FullName || `Doctor #${a.DoctorID}`}</td>
                        <td>{new Date(a.AppointmentDate).toLocaleString()}</td>
                        <td><Badge status={a.Status} /></td>
                        <td>{a.Reason || "N/A"}</td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              onClick={() => handleStatusChange(a.AppointmentID, "CONFIRMED")}
                              className="btn-secondary btn-xs"
                              title="Confirm"
                            >
                              <Check size={14} color="var(--success)" />
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusChange(a.AppointmentID, "COMPLETED")}
                              className="btn-secondary btn-xs"
                              title="Complete"
                            >
                              <Clock size={14} color="var(--primary)" />
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusChange(a.AppointmentID, "CANCELLED")}
                              className="btn-ghost btn-xs"
                              style={{ color: "var(--error)" }}
                              title="Cancel"
                            >
                              <XCircle size={14} />
                              Cancel
                            </button>
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Patient ID</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter Patient ID"
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
                placeholder="Enter Doctor ID"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              />
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
                placeholder="Chief complaint or symptoms..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ height: "auto" }}
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