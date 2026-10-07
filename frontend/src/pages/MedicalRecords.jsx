import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { medicalRecordApi, patientApi, doctorApi, getUserSession } from "../services/api";
import { filterByRole } from "../utils/roleFilter";
import { useToast } from "../context/ToastContext";
import { FileText, Plus, Search } from "lucide-react";
import "../styles/Dashboard.css";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const currentUser = getUserSession();
  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [symptoms, setSymptoms] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      medicalRecordApi.getAll().catch(() => []),
      patientApi.getAll().catch(() => []),
      doctorApi.getAll().catch(() => [])
    ])
      .then(([recs, pats, docs]) => {
        setRecords(recs || []);
        setPatients(pats || []);
        setDoctors(docs || []);
        if (pats?.length > 0 && !patientId) setPatientId(pats[0].PatientID);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!patientId || !symptoms) {
      addToast("Please select patient and enter symptoms", "warning");
      return;
    }
    try {
      await medicalRecordApi.create({
        PatientID: parseInt(patientId),
        DoctorID: currentUser?.profile_id || (doctors[0]?.DoctorID || 1),
        Symptoms: symptoms,
        ClinicalNotes: clinicalNotes
      });
      addToast("Medical record added! (AI Recommendation draft auto-created)", "success");
      setShowAddForm(false);
      setSymptoms("");
      setClinicalNotes("");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to create medical record", "error");
    }
  };

  const roleFiltered = filterByRole(records, currentUser);

  const filtered = roleFiltered.filter(r => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const recId = String(r.RecordID || r.id || "").toLowerCase();
    const patientName = (r.patient?.user?.FullName || r.patient?.FullName || r.PatientName || `Patient #${r.PatientID || ""}`).toLowerCase();
    const doctorName = (r.doctor?.user?.FullName || r.doctor?.FullName || r.DoctorName || `Doctor #${r.DoctorID || ""}`).toLowerCase();
    const symptomsText = (r.Symptoms || r.symptoms || "").toLowerCase();
    const notesText = (r.ClinicalNotes || r.clinical_notes || "").toLowerCase();
    const dateText = r.RecordDate ? new Date(r.RecordDate).toLocaleDateString().toLowerCase() : "";

    return patientName.includes(search) || 
           doctorName.includes(search) || 
           symptomsText.includes(search) ||
           notesText.includes(search) ||
           recId.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Medical Records" 
          subtitle={currentUser?.role === "DOCTOR" ? "My documented clinical patient medical history" : currentUser?.role === "PATIENT" ? "My official medical records & health history" : "Review and record patient clinical documentation"}
          icon={FileText}
          actions={
            (currentUser?.role === "DOCTOR" || currentUser?.role === "ADMIN" || currentUser?.role === "HOSPITAL") && (
              <button className="btn-primary" onClick={() => setShowAddForm(true)}>
                <Plus size={18} />
                <span>Create Medical Record</span>
              </button>
            )
          }
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by patient, doctor, symptoms, notes or Record ID..."
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
                    <th>Record ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Record Date</th>
                    <th>Symptoms</th>
                    <th>Clinical Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No medical records found matching your profile and search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.RecordID}>
                        <td style={{ fontWeight: "700" }}>#{r.RecordID}</td>
                        <td style={{ fontWeight: "600" }}>{r.patient?.user?.FullName || r.patient?.FullName || `Patient #${r.PatientID}`}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>Dr. {r.doctor?.user?.FullName || r.doctor?.FullName || `Doctor #${r.DoctorID}`}</td>
                        <td>{new Date(r.RecordDate).toLocaleDateString()}</td>
                        <td>{r.Symptoms || "N/A"}</td>
                        <td>{r.ClinicalNotes || "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Creating Record */}
        <Modal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          title="New Medical Record Entry"
        >
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Patient</label>
              {patients.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                >
                  {patients.map(p => (
                    <option key={p.PatientID} value={p.PatientID}>
                      {p.user?.FullName || `Patient #${p.PatientID}`} (ID: {p.PatientID})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Reported Symptoms</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe symptoms presented by patient..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ height: "auto" }}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Clinical Notes / Findings</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Doctor's clinical findings and diagnostic plan..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                style={{ height: "auto" }}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Save Medical Record
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default MedicalRecords;