import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { diagnosisApi, medicalRecordApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Stethoscope, Plus, Search } from "lucide-react";
import "../styles/Dashboard.css";

function Diagnoses() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [recordId, setRecordId] = useState("");
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [description, setDescription] = useState("");

  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      diagnosisApi.getAll().catch(() => []),
      medicalRecordApi.getAll().catch(() => [])
    ])
      .then(([diagList, recList]) => {
        setDiagnoses(diagList || []);
        setMedicalRecords(recList || []);
        if (recList?.length > 0 && !recordId) setRecordId(recList[0].RecordID);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!recordId || !diagnosisCode || !description) {
      addToast("Please select medical record and fill ICD code and description", "warning");
      return;
    }
    try {
      await diagnosisApi.create(parseInt(recordId), {
        DiagnosisCode: diagnosisCode,
        Description: description
      });
      addToast("Diagnosis created successfully!", "success");
      setShowForm(false);
      setDiagnosisCode("");
      setDescription("");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to create diagnosis", "error");
    }
  };

  const filtered = diagnoses.filter(d => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const diagId = String(d.DiagnosisID || d.id || "").toLowerCase();
    const recId = String(d.RecordID || "").toLowerCase();
    const code = (d.DiagnosisCode || d.ICDCode || "").toLowerCase();
    const desc = (d.Description || "").toLowerCase();
    const dateText = d.DiagnosisDate ? new Date(d.DiagnosisDate).toLocaleDateString().toLowerCase() : "";

    return code.includes(search) || 
           desc.includes(search) ||
           diagId.includes(search) ||
           recId.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Clinical Diagnoses" 
          subtitle="ICD-10 clinical diagnosis records attached to medical history files"
          icon={Stethoscope}
          actions={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              <span>Add Diagnosis</span>
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
                placeholder="Search by ICD-10 code, description, Record ID or Diagnosis ID..."
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
                    <th>Diagnosis ID</th>
                    <th>Record ID</th>
                    <th>ICD-10 Code</th>
                    <th>Description</th>
                    <th>Diagnosis Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No diagnosis records found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d) => (
                      <tr key={d.DiagnosisID}>
                        <td style={{ fontWeight: "700" }}>#{d.DiagnosisID}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>#{d.RecordID}</td>
                        <td><Badge status="ACTIVE" text={d.DiagnosisCode || "I10"} /></td>
                        <td>{d.Description}</td>
                        <td>{d.DiagnosisDate ? new Date(d.DiagnosisDate).toLocaleDateString() : "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Clinical Diagnosis">
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Medical Record</label>
              {medicalRecords.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  required
                >
                  {medicalRecords.map(r => (
                    <option key={r.RecordID} value={r.RecordID}>
                      Record #{r.RecordID} - Patient ID: {r.PatientID} ({r.Symptoms ? r.Symptoms.slice(0, 30) + '...' : 'Clinical File'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Medical Record ID"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>ICD-10 Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. I10, J45.909, E11.9"
                value={diagnosisCode}
                onChange={(e) => setDiagnosisCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Description</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Detailed diagnosis description and clinical findings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: "auto" }}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Save Diagnosis Entry
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default Diagnoses;