import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { medicineApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Pill, Plus, Search } from "lucide-react";
import "../styles/Dashboard.css";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [medicineName, setMedicineName] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [strength, setStrength] = useState("");
  const [manufacturer, setManufacturer] = useState("");

  const currentUser = getUserSession();
  const { addToast } = useToast();

  const loadMedicines = () => {
    setLoading(true);
    medicineApi.getAll()
      .then(res => setMedicines(res))
      .catch(err => console.error("Error fetching medicines", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    medicineApi.getAll()
      .then(res => setMedicines(res))
      .catch(err => console.error("Error fetching medicines", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await medicineApi.create({
        MedicineName: medicineName,
        DosageForm: dosageForm,
        Strength: strength,
        Manufacturer: manufacturer
      });
      addToast("Medicine added to inventory successfully!", "success");
      setShowForm(false);
      setMedicineName("");
      setDosageForm("");
      setStrength("");
      setManufacturer("");
      loadMedicines();
    } catch (err) {
      addToast(err.message || "Failed to add medicine", "error");
    }
  };

  const filtered = medicines.filter(m => {
    const search = searchTerm.toLowerCase();
    return (m.MedicineName || "").toLowerCase().includes(search) || 
           (m.Manufacturer || "").toLowerCase().includes(search) ||
           (m.DosageForm || "").toLowerCase().includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Pharmacy Medicine Inventory" 
          subtitle="Catalog of pharmaceutical drugs, dosage forms, and manufacturers"
          icon={Pill}
          actions={
            (currentUser?.role === "PHARMACY" || currentUser?.role === "ADMIN") && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={18} />
                <span>Add Medicine</span>
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
                placeholder="Search by drug name, manufacturer, or form..."
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
                    <th>Medicine ID</th>
                    <th>Medicine Name</th>
                    <th>Dosage Form</th>
                    <th>Strength</th>
                    <th>Manufacturer</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No medicines found in catalog.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m) => (
                      <tr key={m.MedicineID}>
                        <td style={{ fontWeight: "700" }}>#{m.MedicineID}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>{m.MedicineName}</td>
                        <td>{m.DosageForm || "Tablet / Capsule"}</td>
                        <td>{m.Strength || "Standard"}</td>
                        <td>{m.Manufacturer || "Pharma Inc."}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Medicine to Catalog">
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Medicine Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Amoxicillin, Paracetamol"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Dosage Form</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tablet, Syrup, Injection"
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Strength</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 500 mg, 250 mg / 5ml"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Manufacturer</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pfizer, Novartis, Sun Pharma"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Add Medicine to Catalog
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default Medicines;