import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { medicationOrderApi, organizationApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ShoppingBag, Plus, Search, Check, Clock } from "lucide-react";
import "../styles/Dashboard.css";

function MedicationOrders() {
  const [orders, setOrders] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  const [patientId, setPatientId] = useState("");
  const [pharmacyId, setPharmacyId] = useState("");
  const [prescriptionId, setPrescriptionId] = useState("");

  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([medicationOrderApi.getAll(), organizationApi.getAll("PHARMACY")])
      .then(([ordList, pharmList]) => {
        setOrders(ordList);
        setPharmacies(pharmList);
        if (pharmList.length > 0) setPharmacyId(pharmList[0].OrganizationID);
      })
      .catch(err => console.error("Error fetching medication orders", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([medicationOrderApi.getAll(), organizationApi.getAll("PHARMACY")])
      .then(([ordList, pharmList]) => {
        setOrders(ordList);
        setPharmacies(pharmList);
        if (pharmList.length > 0) setPharmacyId(pharmList[0].OrganizationID);
      })
      .catch(err => console.error("Error fetching medication orders", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
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

  const filtered = orders.filter(o => {
    const search = searchTerm.toLowerCase();
    const patientName = o.patient?.user?.FullName || `Patient #${o.PatientID}`;
    const pharmacyName = o.pharmacy?.OrganizationName || `Pharmacy #${o.PharmacyID}`;
    return patientName.toLowerCase().includes(search) || 
           pharmacyName.toLowerCase().includes(search) ||
           String(o.OrderID).includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Medication Orders" 
          subtitle="Pharmacy prescription fulfillment, dispatching, and status tracking"
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
                placeholder="Search by Order ID, patient or pharmacy..."
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
                        No medication orders found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.OrderID}>
                        <td style={{ fontWeight: "700" }}>#{o.OrderID}</td>
                        <td>{o.patient?.user?.FullName || `Patient #${o.PatientID}`}</td>
                        <td>{o.pharmacy?.OrganizationName || `Pharmacy #${o.PharmacyID}`}</td>
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Prescription ID</label>
              <input
                type="number"
                className="form-input"
                placeholder="Prescription ID"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Pharmacy Organization</label>
              <select
                className="form-input role-select"
                value={pharmacyId}
                onChange={(e) => setPharmacyId(e.target.value)}
              >
                {pharmacies.map((p) => (
                  <option key={p.OrganizationID} value={p.OrganizationID}>
                    {p.OrganizationName}
                  </option>
                ))}
              </select>
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