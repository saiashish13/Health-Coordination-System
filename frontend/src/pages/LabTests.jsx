import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { labApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { FlaskConical, Plus, Search, Check, Clock, XCircle } from "lucide-react";
import "../styles/Dashboard.css";

function LabTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [patientId, setPatientId] = useState("");
  const [testType, setTestType] = useState("");

  const { addToast } = useToast();

  const loadTests = () => {
    setLoading(true);
    labApi.getTests()
      .then(res => setTests(res))
      .catch(err => console.error("Error fetching lab tests", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    labApi.getTests()
      .then(res => setTests(res))
      .catch(err => console.error("Error fetching lab tests", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await labApi.createTest({
        PatientID: parseInt(patientId),
        TestType: testType
      });
      addToast("Lab test ordered successfully!", "success");
      setShowForm(false);
      setTestType("");
      loadTests();
    } catch (err) {
      addToast(err.message || "Failed to order lab test", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await labApi.updateTestStatus(id, status);
      addToast(`Lab Test #${id} status updated to ${status}`, "success");
      loadTests();
    } catch (err) {
      addToast("Error updating test status: " + err.message, "error");
    }
  };

  const filtered = tests.filter(t => {
    const search = searchTerm.toLowerCase();
    return (t.TestType || "").toLowerCase().includes(search) || 
           String(t.TestID).includes(search) ||
           String(t.PatientID).includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Diagnostic Lab Tests" 
          subtitle="Order and track patient blood panels, imaging, and diagnostic testing"
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
                placeholder="Search by Test ID, Patient ID or test type..."
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
                    <th>Patient ID</th>
                    <th>Test Type</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No lab test orders found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.TestID}>
                        <td style={{ fontWeight: "700" }}>#{t.TestID}</td>
                        <td>Patient #{t.PatientID}</td>
                        <td>{t.TestType}</td>
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Test Type / Panel Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, MRI Scan"
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