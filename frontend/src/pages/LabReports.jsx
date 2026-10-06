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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testId, setTestId] = useState("");
  const [results, setResults] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingReportId, setUploadingReportId] = useState(null);

  const currentUser = getUserSession();
  const { addToast } = useToast();

  const loadReports = () => {
    setLoading(true);
    labApi.getReports()
      .then(res => setReports(res))
      .catch(err => console.error("Error fetching lab reports", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    labApi.getReports()
      .then(res => setReports(res))
      .catch(err => console.error("Error fetching lab reports", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      await labApi.createReport({
        TestID: parseInt(testId),
        Results: results
      });
      addToast("Lab report created successfully!", "success");
      setShowCreateForm(false);
      setTestId("");
      setResults("");
      loadReports();
    } catch (err) {
      addToast(err.message || "Failed to create lab report", "error");
    }
  };

  const handleFileUpload = async (reportId) => {
    if (!selectedFile) return;
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await labApi.uploadReportFile(reportId, formData);
      addToast(`File uploaded successfully for Report #${reportId}`, "success");
      setSelectedFile(null);
      setUploadingReportId(null);
      loadReports();
    } catch (err) {
      addToast("Error uploading file: " + err.message, "error");
    }
  };

  const filtered = reports.filter(r => {
    const search = searchTerm.toLowerCase();
    return String(r.ReportID).includes(search) || 
           String(r.TestID).includes(search) || 
           (r.Results || "").toLowerCase().includes(search);
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
                placeholder="Search by Report ID, Test ID or results..."
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
                    <th>Results</th>
                    <th>Attachment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No lab reports found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.ReportID}>
                        <td style={{ fontWeight: "700" }}>#{r.ReportID}</td>
                        <td>#{r.TestID}</td>
                        <td>{new Date(r.ReportDate).toLocaleDateString()}</td>
                        <td>{r.Results}</td>
                        <td>
                          {r.ReportFileURL ? (
                            <a
                              href={`http://localhost:8000${r.ReportFileURL}`}
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Lab Test ID</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter Lab Test ID"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Diagnostic Results & Findings</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Enter findings and summary..."
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