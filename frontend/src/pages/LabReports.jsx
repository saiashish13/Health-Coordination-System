import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { labApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { FlaskConical, Plus, Search, FileUp, ExternalLink } from "lucide-react";
import "../styles/Dashboard.css";

function LabReports() {
  const [reports, setReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testId, setTestId] = useState("");
  const [results, setResults] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingReportId, setUploadingReportId] = useState(null);

  const currentUser = getUserSession();
  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      labApi.getReports().catch(() => []),
      labApi.getTests().catch(() => [])
    ])
      .then(([repList, tList]) => {
        setReports(repList || []);
        setTests(tList || []);
        if (tList?.length > 0 && !testId) setTestId(tList[0].TestID);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!testId || !results) {
      addToast("Please select lab test and enter diagnostic results", "warning");
      return;
    }
    try {
      await labApi.createReport({
        TestID: parseInt(testId),
        Results: results
      });
      addToast("Lab report created successfully!", "success");
      setShowCreateForm(false);
      setResults("");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to create lab report", "error");
    }
  };

  const handleFileUpload = async (reportId) => {
    if (!selectedFile) {
      addToast("Please select a file to upload", "warning");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await labApi.uploadReportFile(reportId, formData);
      addToast(`File uploaded successfully for Report #${reportId}`, "success");
      setSelectedFile(null);
      setUploadingReportId(null);
      loadData();
    } catch (err) {
      addToast("Error uploading file: " + err.message, "error");
    }
  };

  const filtered = reports.filter(r => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const repId = String(r.ReportID || r.id || "").toLowerCase();
    const tId = String(r.TestID || "").toLowerCase();
    const resultsText = (r.Results || "").toLowerCase();
    const dateText = r.ReportDate ? new Date(r.ReportDate).toLocaleDateString().toLowerCase() : "";

    return repId.includes(search) || 
           tId.includes(search) || 
           resultsText.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Lab Reports" 
          subtitle="Diagnostic laboratory report findings and document attachments"
          icon={FlaskConical}
          actions={
            (currentUser?.role === "LAB" || currentUser?.role === "ADMIN" || currentUser?.role === "DOCTOR") && (
              <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                <Plus size={18} />
                <span>Create Lab Report</span>
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
                placeholder="Search by Report ID, Test ID, results text or date..."
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
                    <th>Report ID</th>
                    <th>Test ID</th>
                    <th>Report Date</th>
                    <th>Diagnostic Results & Findings</th>
                    <th>Attachment Document</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No lab reports found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.ReportID}>
                        <td style={{ fontWeight: "700" }}>#{r.ReportID}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>#{r.TestID}</td>
                        <td>{new Date(r.ReportDate).toLocaleDateString()}</td>
                        <td>{r.Results}</td>
                        <td>
                          {r.ReportFileURL ? (
                            <a
                              href={r.ReportFileURL.startsWith("http") ? r.ReportFileURL : `http://localhost:8000${r.ReportFileURL}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--primary)", fontWeight: "600" }}
                            >
                              <span>View Document</span>
                              <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>No File Uploaded</span>
                          )}
                        </td>
                        <td>
                          {uploadingReportId === r.ReportID ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                style={{ fontSize: "12px", width: "160px" }}
                              />
                              <button onClick={() => handleFileUpload(r.ReportID)} className="btn-primary btn-xs">
                                Upload
                              </button>
                              <button onClick={() => setUploadingReportId(null)} className="btn-ghost btn-xs">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setUploadingReportId(r.ReportID)}
                              className="btn-secondary btn-xs"
                            >
                              <FileUp size={14} />
                              Upload File
                            </button>
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

        {/* Modal for Creating Lab Report */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="New Laboratory Report"
        >
          <form onSubmit={handleCreateReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Lab Test</label>
              {tests.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  required
                >
                  {tests.map(t => (
                    <option key={t.TestID} value={t.TestID}>
                      Test #{t.TestID} - {t.TestName || t.TestType || "Lab Test"} (Patient ID: {t.PatientID})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter Lab Test ID (e.g. 1)"
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Diagnostic Results & Findings</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Enter clinical findings, blood work levels, and diagnostic summary..."
                value={results}
                onChange={(e) => setResults(e.target.value)}
                style={{ height: "auto" }}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Submit Lab Report
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default LabReports;