import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { labApi, patientApi, getUserSession } from "../services/api";
import { filterByRole } from "../utils/roleFilter";
import { useToast } from "../context/ToastContext";
import { FlaskConical, Plus, Search, Check, Clock, XCircle } from "lucide-react";
import "../styles/Dashboard.css";

function LabTests() {
  const currentUser = getUserSession();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [testType, setTestType] = useState("");

  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      labApi.getTests().catch(() => []),
      patientApi.getAll().catch(() => [])
    ])
      .then(([tList, pList]) => {
        setTests(tList || []);
        setPatients(pList || []);
        if (pList?.length > 0 && !patientId) setPatientId(pList[0].PatientID);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!patientId || !testType) {
      addToast("Please select patient and test type", "warning");
      return;
    }
    try {
      await labApi.createTest({
        PatientID: parseInt(patientId),
        TestName: testType,
        TestType: testType
      });
      addToast("Lab test ordered successfully!", "success");
      setShowForm(false);
      setTestType("");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to order lab test", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await labApi.updateTestStatus(id, status);
      addToast(`Lab Test #${id} status updated to ${status}`, "success");
      loadData();
    } catch (err) {
      addToast("Error updating test status: " + err.message, "error");
    }
  };

  const roleFiltered = filterByRole(tests, currentUser);

  const filtered = roleFiltered.filter(t => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const testId = String(t.TestID || t.id || "").toLowerCase();
    const patId = String(t.PatientID || "").toLowerCase();
    const name = (t.TestName || t.TestType || "").toLowerCase();
    const status = (t.Status || "").toLowerCase();
    const patientName = (t.patient?.user?.FullName || t.patient?.FullName || `Patient #${t.PatientID}`).toLowerCase();
    const dateText = t.TestDate ? new Date(t.TestDate).toLocaleDateString().toLowerCase() : "";

    return name.includes(search) || 
           testId.includes(search) ||
           patId.includes(search) ||
           status.includes(search) ||
           patientName.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Diagnostic Lab Tests" 
          subtitle={currentUser?.role === "DOCTOR" ? "Lab tests ordered by me for my patients" : currentUser?.role === "PATIENT" ? "My ordered diagnostic lab tests" : "Order and track patient blood panels, imaging, and diagnostic testing"}
          icon={FlaskConical}
          actions={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              <span>Order Lab Test</span>
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
                placeholder="Search by Test ID, Patient name/ID, test type or status..."
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
                    <th>Test ID</th>
                    <th>Patient</th>
                    <th>Test Panel Name</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No lab test orders found matching your profile and search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.TestID}>
                        <td style={{ fontWeight: "700" }}>#{t.TestID}</td>
                        <td style={{ fontWeight: "600" }}>{t.patient?.user?.FullName || t.patient?.FullName || `Patient #${t.PatientID}`}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>{t.TestName || t.TestType || "Lipid Panel & CBC"}</td>
                        <td>{t.TestDate ? new Date(t.TestDate).toLocaleDateString() : "N/A"}</td>
                        <td><Badge status={t.Status} /></td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              onClick={() => handleStatusChange(t.TestID, "IN_PROGRESS")}
                              className="btn-secondary btn-xs"
                            >
                              <Clock size={14} color="var(--warning)" />
                              In Progress
                            </button>
                            <button
                              onClick={() => handleStatusChange(t.TestID, "COMPLETED")}
                              className="btn-secondary btn-xs"
                            >
                              <Check size={14} color="var(--success)" />
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusChange(t.TestID, "CANCELLED")}
                              className="btn-ghost btn-xs"
                              style={{ color: "var(--error)" }}
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

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Order Diagnostic Lab Test">
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Patient</label>
              {patients.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                  disabled={currentUser?.role === "PATIENT"}
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Test Type / Panel Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Complete Blood Count (CBC), Lipid Panel, MRI Scan, Hemoglobin A1C"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Submit Lab Order
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default LabTests;