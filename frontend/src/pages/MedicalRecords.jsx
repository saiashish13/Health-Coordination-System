import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { medicalRecordApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { FileText, Plus, Search } from "lucide-react";
import "../styles/Dashboard.css";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [patientId, setPatientId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

  const currentUser = getUserSession();
  const { addToast } = useToast();

  const loadRecords = () => {
    setLoading(true);
    medicalRecordApi.getAll()
      .then(res => setRecords(res))
      .catch(err => console.error("Error fetching medical records", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    medicalRecordApi.getAll()
      .then(res => setRecords(res))
      .catch(err => console.error("Error fetching medical records", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordApi.create({
        PatientID: parseInt(patientId),
        DoctorID: currentUser?.profile_id || 1,
        Symptoms: symptoms,
        ClinicalNotes: clinicalNotes
      });
      addToast("Medical record added! (AI Recommendation draft auto-created)", "success");
      setShowAddForm(false);
      setSymptoms("");
      setClinicalNotes("");
      loadRecords();
    } catch (err) {
      addToast(err.message || "Failed to create medical record", "error");
    }
  };

  const filtered = records.filter(r => {
    const search = searchTerm.toLowerCase();
    const patientName = r.patient?.user?.FullName || `Patient #${r.PatientID}`;
    const doctorName = r.doctor?.user?.FullName || `Doctor #${r.DoctorID}`;
    return patientName.toLowerCase().includes(search) || 
           doctorName.toLowerCase().includes(search) || 
           (r.Symptoms || "").toLowerCase().includes(search) ||
           (r.ClinicalNotes || "").toLowerCase().includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Medical Records" 
          subtitle="Review and record patient clinical documentation and history logs"
          icon={FileText}
          actions={
            (currentUser?.role === "DOCTOR" || currentUser?.role === "ADMIN") && (
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
                placeholder="Search by patient, doctor or symptoms..."
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
                        No medical records found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.RecordID}>
                        <td style={{ fontWeight: "700" }}>#{r.RecordID}</td>
                        <td>{r.patient?.user?.FullName || `Patient #${r.PatientID}`}</td>
                        <td>{r.doctor?.user?.FullName || `Doctor #${r.DoctorID}`}</td>
                        <td>{new Date(r.RecordDate).toLocaleDateString()}</td>
                        <td>{r.Symptoms}</td>
                        <td>{r.ClinicalNotes}</td>
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Reported Symptoms</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe symptoms..."
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
                placeholder="Doctor's notes..."
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