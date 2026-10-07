import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { medicationOrderApi, organizationApi, patientApi, prescriptionApi, getUserSession } from "../services/api";
import { filterByRole } from "../utils/roleFilter";
import { useToast } from "../context/ToastContext";
import { ShoppingBag, Plus, Search, Check, Clock } from "lucide-react";
import "../styles/Dashboard.css";

function MedicationOrders() {
  const currentUser = getUserSession();
  const [orders, setOrders] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [pharmacyId, setPharmacyId] = useState("");
  const [prescriptionId, setPrescriptionId] = useState("");

  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      medicationOrderApi.getAll().catch(() => []),
      organizationApi.getAll("PHARMACY").catch(() => []),
      patientApi.getAll().catch(() => []),
      prescriptionApi.getAll().catch(() => [])
    ])
      .then(([ordList, pharmList, patList, prescList]) => {
        setOrders(ordList || []);
        setPharmacies(pharmList || []);
        setPatients(patList || []);
        setPrescriptions(prescList || []);

        if (pharmList?.length > 0 && !pharmacyId) setPharmacyId(pharmList[0].OrganizationID);
        if (patList?.length > 0 && !patientId) setPatientId(patList[0].PatientID);
        if (prescList?.length > 0 && !prescriptionId) setPrescriptionId(prescList[0].PrescriptionID);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!patientId || !pharmacyId || !prescriptionId) {
      addToast("Please select patient, prescription and pharmacy", "warning");
      return;
    }
    try {
      await medicationOrderApi.create({
        PatientID: parseInt(patientId),
        PharmacyID: parseInt(pharmacyId),
        PrescriptionID: parseInt(prescriptionId)
      });
      addToast("Medication order placed successfully!", "success");
      setShowOrderForm(false);
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to place medication order", "error");
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await medicationOrderApi.updateStatus(orderId, status);
      addToast(`Order #${orderId} status set to ${status}`, "success");
      loadData();
    } catch (err) {
      addToast("Error updating order status: " + err.message, "error");
    }
  };

  const roleFiltered = filterByRole(orders, currentUser);

  const filtered = roleFiltered.filter(o => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const ordId = String(o.OrderID || o.id || "").toLowerCase();
    const presId = String(o.PrescriptionID || "").toLowerCase();
    const patientName = (o.patient?.user?.FullName || o.patient?.FullName || `Patient #${o.PatientID}`).toLowerCase();
    const pharmacyName = (o.pharmacy?.OrganizationName || o.pharmacy?.name || `Pharmacy #${o.PharmacyID}`).toLowerCase();
    const statusText = (o.Status || "").toLowerCase();
    const dateText = o.OrderDate ? new Date(o.OrderDate).toLocaleDateString().toLowerCase() : "";

    return patientName.includes(search) || 
           pharmacyName.includes(search) ||
           ordId.includes(search) ||
           presId.includes(search) ||
           statusText.includes(search) ||
           dateText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Medication Orders" 
          subtitle={currentUser?.role === "PATIENT" ? "My pharmacy medication orders & fulfillment status" : "Pharmacy prescription fulfillment, dispatching, and status tracking"}
          icon={ShoppingBag}
          actions={
            <button className="btn-primary" onClick={() => setShowOrderForm(true)}>
              <Plus size={18} />
              <span>Place Order</span>
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
                placeholder="Search by Order ID, Patient, Pharmacy, status or Prescription ID..."
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
                    <th>Order ID</th>
                    <th>Patient</th>
                    <th>Pharmacy</th>
                    <th>Prescription</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No medication orders found matching your profile and search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.OrderID}>
                        <td style={{ fontWeight: "700" }}>#{o.OrderID}</td>
                        <td style={{ fontWeight: "600" }}>{o.patient?.user?.FullName || o.patient?.FullName || `Patient #${o.PatientID}`}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>{o.pharmacy?.OrganizationName || `Pharmacy #${o.PharmacyID}`}</td>
                        <td>#{o.PrescriptionID}</td>
                        <td>{new Date(o.OrderDate).toLocaleDateString()}</td>
                        <td><Badge status={o.Status} /></td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              onClick={() => handleStatusUpdate(o.OrderID, "PROCESSING")}
                              className="btn-secondary btn-xs"
                            >
                              <Clock size={14} color="var(--warning)" />
                              Processing
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(o.OrderID, "READY")}
                              className="btn-secondary btn-xs"
                            >
                              Ready
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(o.OrderID, "COMPLETED")}
                              className="btn-secondary btn-xs"
                            >
                              <Check size={14} color="var(--success)" />
                              Complete
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

        <Modal isOpen={showOrderForm} onClose={() => setShowOrderForm(false)} title="Place Order to Pharmacy">
          <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Prescription</label>
              {prescriptions.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  required
                >
                  {prescriptions.map(pr => (
                    <option key={pr.PrescriptionID} value={pr.PrescriptionID}>
                      Prescription #{pr.PrescriptionID} - Patient ID: {pr.PatientID} ({new Date(pr.PrescriptionDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Prescription ID"
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Pharmacy Organization</label>
              {pharmacies.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={pharmacyId}
                  onChange={(e) => setPharmacyId(e.target.value)}
                  required
                >
                  {pharmacies.map((p) => (
                    <option key={p.OrganizationID} value={p.OrganizationID}>
                      {p.OrganizationName} (ID: {p.OrganizationID})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Pharmacy ID (e.g. 3)"
                  value={pharmacyId}
                  onChange={(e) => setPharmacyId(e.target.value)}
                  required
                />
              )}
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Submit Order to Pharmacy
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default MedicationOrders;