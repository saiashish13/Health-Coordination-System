import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import PatientSelector from "../components/PatientSelector";
import { patientApi, permissionApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { 
  Users as UsersIcon, 
  Search, 
  Eye, 
  FileText, 
  Pill, 
  FlaskConical, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Mail, 
  Phone, 
  User
} from "lucide-react";
import "../styles/Dashboard.css";

function Patients() {
  const currentUser = getUserSession();
  const { addToast } = useToast();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states for Patient Details & Medical History
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // profile, records, prescriptions, lab, appointments
  const [detailLoading, setDetailLoading] = useState(false);

  // History state
  const [patientRecords, setPatientRecords] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [patientLabReports, setPatientLabReports] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);

  // Request Access Modal
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [allPatientsList, setAllPatientsList] = useState([]);
  const [targetPatientId, setTargetPatientId] = useState("");
  const [accessReason, setAccessReason] = useState("");

  const loadPatients = () => {
    setLoading(true);
    patientApi.getAll()
      .then(res => setPatients(res || []))
      .catch(err => {
        console.error("Error fetching patients", err);
        addToast(err.message || "Failed to load active patients", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const [permissionRestricted, setPermissionRestricted] = useState(false);

  const handleOpenDetailModal = async (patient) => {
    setSelectedPatient(patient);
    setDetailModalOpen(true);
    setActiveTab("profile");
    setDetailLoading(true);
    setPermissionRestricted(false);

    try {
      const [records, prescs, labs, appts] = await Promise.all([
        patientApi.getMedicalRecords(patient.PatientID).catch(err => {
          if (err.message && err.message.includes("permission")) setPermissionRestricted(true);
          return [];
        }),
        patientApi.getPrescriptions(patient.PatientID).catch(err => {
          if (err.message && err.message.includes("permission")) setPermissionRestricted(true);
          return [];
        }),
        patientApi.getLabReports(patient.PatientID).catch(err => {
          if (err.message && err.message.includes("permission")) setPermissionRestricted(true);
          return [];
        }),
        patientApi.getAppointments(patient.PatientID).catch(() => [])
      ]);

      setPatientRecords(records || []);
      setPatientPrescriptions(prescs || []);
      setPatientLabReports(labs || []);
      setPatientAppointments(appts || []);
    } catch (err) {
      console.error("Error loading patient detailed history", err);
      setPermissionRestricted(true);
      addToast("Permission restricted or error loading medical details", "warning");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenRequestAccess = () => {
    setShowRequestAccessModal(true);
    patientApi.getAll()
      .then(res => setAllPatientsList(res || []))
      .catch(() => []);
  };

  const handleSendAccessRequest = async (e) => {
    e.preventDefault();
    if (!targetPatientId || !accessReason) {
      addToast("Please select patient and specify reason for access", "warning");
      return;
    }

    try {
      await permissionApi.createRequest({
        PatientID: parseInt(targetPatientId),
        DoctorID: currentUser?.profile_id || 1,
        Reason: accessReason
      });
      addToast("Permission access request submitted to patient!", "success");
      setShowRequestAccessModal(false);
      setAccessReason("");
    } catch (err) {
      addToast(err.message || "Failed to submit permission request", "error");
    }
  };

  const filtered = patients.filter(p => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const patId = String(p.PatientID || p.id || "").toLowerCase();
    const name = (p.user?.FullName || p.FullName || `Patient #${p.PatientID}`).toLowerCase();
    const email = (p.user?.Email || p.Email || "").toLowerCase();
    const phone = (p.user?.Phone || p.Phone || p.EmergencyContact || "").toLowerCase();
    const gender = (p.Gender || "").toLowerCase();
    const bloodType = (p.BloodType || "").toLowerCase();

    return name.includes(search) || 
           email.includes(search) ||
           phone.includes(search) ||
           patId.includes(search) ||
           gender.includes(search) ||
           bloodType.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Active Patients Directory" 
          subtitle={currentUser?.role === "DOCTOR" ? "Patients who have granted medical access or scheduled appointments with you" : "Registered patient profiles and emergency contact registry"}
          icon={UsersIcon}
          actions={
            currentUser?.role === "DOCTOR" ? (
              <button className="btn-primary" onClick={handleOpenRequestAccess}>
                <Plus size={18} />
                <span>Request Patient Access</span>
              </button>
            ) : null
          }
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by Patient ID, Full Name, Email, Phone number, or Blood Type..."
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
                    <th>Patient ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Gender & DOB</th>
                    <th>Permission Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                        {currentUser?.role === "DOCTOR" 
                          ? "No active patient permissions found. Patients must grant permission or schedule an appointment to appear here."
                          : "No patients found matching your search."
                        }
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const email = p.user?.Email || p.Email || "Not Specified";
                      const phone = p.user?.Phone || p.Phone || p.EmergencyContact || "Not Specified";
                      const fullName = p.user?.FullName || p.FullName || `Patient #${p.PatientID}`;

                      return (
                        <tr key={p.PatientID}>
                          <td style={{ fontWeight: "700" }}>#{p.PatientID}</td>
                          <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--primary-light)",
                                color: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "700",
                                fontSize: "13px"
                              }}>
                                {fullName.charAt(0).toUpperCase()}
                              </div>
                              <span>{fullName}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: email !== "Not Specified" ? "var(--text-primary)" : "var(--text-muted)" }}>
                              <Mail size={14} color="var(--primary)" />
                              {email}
                            </span>
                          </td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <Phone size={14} color="var(--success)" />
                              {phone}
                            </span>
                          </td>
                          <td>
                            <div>
                              <span style={{ fontWeight: "600" }}>{p.Gender || "Unspecified"}</span>
                              {p.DateOfBirth && (
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                                  DOB: {p.DateOfBirth}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <Badge status="ACTIVE" text="Access Granted" />
                          </td>
                          <td>
                            <button
                              onClick={() => handleOpenDetailModal(p)}
                              className="btn-secondary btn-xs"
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                              title="View Patient Medical History & Reports"
                            >
                              <Eye size={14} color="var(--primary)" />
                              <span>View Patient Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Patient Details & Complete Medical History Modal */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Patient Clinical History: ${selectedPatient?.user?.FullName || selectedPatient?.FullName || `Patient #${selectedPatient?.PatientID}`}`}
        >
          {selectedPatient && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Header Info Card */}
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px"
              }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Patient ID</span>
                  <strong style={{ fontSize: "15px" }}>#{selectedPatient.PatientID}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Full Name</span>
                  <strong style={{ fontSize: "15px", color: "var(--primary)" }}>{selectedPatient.user?.FullName || selectedPatient.FullName || "N/A"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Email Address</span>
                  <span style={{ fontSize: "13px" }}>{selectedPatient.user?.Email || selectedPatient.Email || "Not Specified"}</span>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Phone Number</span>
                  <span style={{ fontSize: "13px" }}>{selectedPatient.user?.Phone || selectedPatient.Phone || selectedPatient.EmergencyContact || "Not Specified"}</span>
                </div>
              </div>

              {/* Detail Navigation Tabs */}
              <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", pb: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`btn-xs ${activeTab === "profile" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <User size={14} />
                  <span>Profile Info</span>
                </button>
                <button
                  onClick={() => setActiveTab("records")}
                  className={`btn-xs ${activeTab === "records" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <FileText size={14} />
                  <span>Medical History ({patientRecords.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("prescriptions")}
                  className={`btn-xs ${activeTab === "prescriptions" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Pill size={14} />
                  <span>Prescriptions ({patientPrescriptions.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("lab")}
                  className={`btn-xs ${activeTab === "lab" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <FlaskConical size={14} />
                  <span>Lab Reports ({patientLabReports.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className={`btn-xs ${activeTab === "appointments" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Calendar size={14} />
                  <span>Appointments ({patientAppointments.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              {detailLoading ? (
                <SkeletonLoader rows={4} />
              ) : (
                <div>
                  {permissionRestricted && (
                    <div style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid var(--error)",
                      borderRadius: "var(--radius-md)",
                      padding: "16px",
                      marginBottom: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--error)", fontWeight: "700", fontSize: "14px" }}>
                        <ShieldCheck size={18} />
                        <span>Patient Access Permission Required</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        Patient #{selectedPatient.PatientID} ({selectedPatient.user?.FullName || selectedPatient.FullName || "Patient"}) has not granted active permission to view full medical history, lab reports, or prescriptions.
                      </p>
                      <button
                        onClick={() => {
                          setTargetPatientId(String(selectedPatient.PatientID));
                          setShowRequestAccessModal(true);
                        }}
                        className="btn-primary btn-xs"
                        style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <Plus size={14} />
                        <span>Send Access Permission Request</span>
                      </button>
                    </div>
                  )}

                  {activeTab === "profile" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--primary)" }}>Personal & Medical Info</h4>
                        <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Gender:</strong> {selectedPatient.Gender || "Unspecified"}</p>
                        <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Date of Birth:</strong> {selectedPatient.DateOfBirth || "N/A"}</p>
                        <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--primary)", fontWeight: "700" }}>
                          <strong>Blood Group:</strong> {selectedPatient.BloodGroup || selectedPatient.BloodType || "O+"}
                        </p>
                      </div>
                      <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--primary)" }}>Contact & Address</h4>
                        <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Emergency Contact:</strong> {selectedPatient.EmergencyContact || "N/A"}</p>
                        <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Address:</strong> {selectedPatient.Address || "Registered Medical Address"}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "records" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {patientRecords.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No medical records logged for this patient.</p>
                      ) : (
                        patientRecords.map((r) => (
                          <div key={r.RecordID} style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-card)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                              <strong style={{ fontSize: "14px" }}>Record #{r.RecordID}</strong>
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{new Date(r.RecordDate).toLocaleDateString()}</span>
                            </div>
                            <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Symptoms:</strong> {r.Symptoms}</p>
                            {r.Notes && <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--text-secondary)" }}><strong>Notes:</strong> {r.Notes}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "prescriptions" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {patientPrescriptions.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No active prescriptions issued for this patient.</p>
                      ) : (
                        patientPrescriptions.map((pr) => (
                          <div key={pr.PrescriptionID} style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-card)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                              <strong style={{ fontSize: "14px", color: "var(--primary)" }}>Prescription #{pr.PrescriptionID}</strong>
                              <Badge status={pr.Status || "ACTIVE"} />
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Issued: {new Date(pr.PrescriptionDate).toLocaleDateString()}</span>
                            {pr.items && pr.items.length > 0 && (
                              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border-color)" }}>
                                {pr.items.map(item => (
                                  <div key={item.ItemID} style={{ fontSize: "13px", margin: "4px 0" }}>
                                    • <strong>{item.medicine?.MedicineName || `Medicine #${item.MedicineID}`}:</strong> {item.Dosage} - {item.Frequency} ({item.Duration})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "lab" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {patientLabReports.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No lab reports generated for this patient.</p>
                      ) : (
                        patientLabReports.map((lr) => (
                          <div key={lr.ReportID} style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-card)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                              <strong style={{ fontSize: "14px" }}>Report #{lr.ReportID}</strong>
                              <Badge status="COMPLETED" text="Verified Report" />
                            </div>
                            <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Findings:</strong> {lr.ResultSummary || "Normal Laboratory Findings"}</p>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Reported Date: {new Date(lr.ReportDate).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "appointments" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {patientAppointments.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No appointment history for this patient.</p>
                      ) : (
                        patientAppointments.map((ap) => (
                          <div key={ap.AppointmentID} style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-card)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                              <strong style={{ fontSize: "14px" }}>Appt #{ap.AppointmentID}</strong>
                              <Badge status={ap.Status} />
                            </div>
                            <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Date:</strong> {new Date(ap.AppointmentDate).toLocaleString()}</p>
                            <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Reason:</strong> {ap.Reason || "Routine Checkup"}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </Modal>

        {/* Request Access Modal */}
        <Modal
          isOpen={showRequestAccessModal}
          onClose={() => setShowRequestAccessModal(false)}
          title="Request Medical Record Access"
        >
          <form onSubmit={handleSendAccessRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Patient (Search by Name or ID)</label>
              <PatientSelector
                patients={allPatientsList}
                value={targetPatientId}
                onChange={setTargetPatientId}
                placeholder="Search patient by Name or ID (e.g. John or 1)..."
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Reason for Request</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Clinical justification for requesting access to patient medical records..."
                value={accessReason}
                onChange={(e) => setAccessReason(e.target.value)}
                style={{ height: "auto" }}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Submit Permission Request to Patient
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default Patients;