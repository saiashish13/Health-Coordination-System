import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import PatientSelector from "../components/PatientSelector";
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
  const [viewingRecord, setViewingRecord] = useState(null);
  
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
                    <th>Actions / Record File</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
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
                        <td>
                          <button
                            onClick={() => setViewingRecord(r)}
                            className="btn-secondary btn-xs"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <FileText size={14} color="var(--primary)" />
                            <span>View Record File</span>
                          </button>
                        </td>
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Patient (Search by Name or ID)</label>
              <PatientSelector
                patients={patients}
                value={patientId}
                onChange={setPatientId}
                placeholder="Search patient by Name or ID (e.g. John or 1)..."
              />
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

        {/* Modal for Viewing Record File Document */}
        <Modal
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
          title={`Clinical Record Document #${viewingRecord?.RecordID}`}
        >
          {viewingRecord && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "12px", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ borderBottom: "1px solid var(--border-color)", pb: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, color: "var(--primary)" }}>HEALTHSYNC MEDICAL RECORD FILE</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Official Clinical Record File • Document ID #{viewingRecord.RecordID}</span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{new Date(viewingRecord.RecordDate).toLocaleDateString()}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>PATIENT NAME</strong>
                  <span>{viewingRecord.patient?.user?.FullName || viewingRecord.patient?.FullName || `Patient #${viewingRecord.PatientID}`}</span>
                </div>
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>ATTENDING PHYSICIAN</strong>
                  <span>Dr. {viewingRecord.doctor?.user?.FullName || viewingRecord.doctor?.FullName || `Doctor #${viewingRecord.DoctorID}`}</span>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "12px" }}>
                <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "4px" }}>PRESENTING SYMPTOMS</strong>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5" }}>{viewingRecord.Symptoms || "No symptoms recorded"}</p>
              </div>

              <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "12px" }}>
                <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "4px" }}>CLINICAL FINDINGS & NOTES</strong>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "var(--text-secondary)" }}>{viewingRecord.ClinicalNotes || viewingRecord.Notes || "Standard assessment recorded"}</p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  onClick={() => window.print()}
                  className="btn-secondary btn-xs"
                >
                  Print Record File
                </button>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="btn-primary btn-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default MedicalRecords;