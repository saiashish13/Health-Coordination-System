import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { medicineApi, getUserSession } from "../services/api";
import { WORLD_MEDICINES, MEDICINE_CATEGORIES } from "../data/worldMedicines";
import { useToast } from "../context/ToastContext";
import { Pill, Plus, Search, Globe, Filter } from "lucide-react";
import "../styles/Dashboard.css";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showForm, setShowForm] = useState(false);
  
  const [medicineName, setMedicineName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosageForm, setDosageForm] = useState("Tablet");
  const [strength, setStrength] = useState("");
  const [manufacturer, setManufacturer] = useState("");

  const currentUser = getUserSession();
  const { addToast } = useToast();

  const loadMedicines = () => {
    setLoading(true);
    medicineApi.getAll()
      .then(res => {
        // Merge API medicines with World Medicines catalog ensuring unique entries
        const dbMeds = res || [];
        const existingNames = new Set(dbMeds.map(m => (m.MedicineName || "").toLowerCase()));
        
        const mergedWorld = WORLD_MEDICINES.filter(wm => !existingNames.has(wm.name.toLowerCase())).map((wm, index) => ({
          MedicineID: `WM-${index + 100}`,
          MedicineName: wm.name,
          GenericName: wm.genericName,
          DosageForm: wm.form,
          Strength: wm.defaultDosage || "Standard",
          Manufacturer: wm.manufacturer,
          Category: wm.category,
          BrandNames: wm.brandNames.join(", ")
        }));

        setMedicines([...dbMeds, ...mergedWorld]);
      })
      .catch(err => {
        console.error("Error fetching medicines", err);
        // Fallback to World Medicines catalog
        setMedicines(WORLD_MEDICINES.map((wm, idx) => ({
          MedicineID: `WM-${idx + 1}`,
          MedicineName: wm.name,
          GenericName: wm.genericName,
          DosageForm: wm.form,
          Strength: wm.defaultDosage || "Standard",
          Manufacturer: wm.manufacturer,
          Category: wm.category,
          BrandNames: wm.brandNames.join(", ")
        })));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await medicineApi.create({
        MedicineName: medicineName,
        GenericName: genericName || medicineName,
        DosageForm: dosageForm,
        Strength: strength,
        Manufacturer: manufacturer || "Global Pharma"
      });
      addToast("Medicine added to catalog successfully!", "success");
      setShowForm(false);
      setMedicineName("");
      setGenericName("");
      setDosageForm("Tablet");
      setStrength("");
      setManufacturer("");
      loadMedicines();
    } catch (err) {
      addToast(err.message || "Failed to add medicine", "error");
    }
  };

  const filtered = medicines.filter(m => {
    const search = searchTerm.toLowerCase().trim();
    const matchCategory = selectedCategory === "All Categories" || (m.Category || "") === selectedCategory;
    if (!matchCategory) return false;

    if (!search) return true;

    const medName = (m.MedicineName || "").toLowerCase();
    const genName = (m.GenericName || "").toLowerCase();
    const mfg = (m.Manufacturer || "").toLowerCase();
    const form = (m.DosageForm || "").toLowerCase();
    const brands = (m.BrandNames || "").toLowerCase();
    const cat = (m.Category || "").toLowerCase();

    return medName.includes(search) || 
           genName.includes(search) || 
           mfg.includes(search) ||
           form.includes(search) ||
           brands.includes(search) ||
           cat.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="World Pharmacy Medicine Catalog" 
          subtitle="Comprehensive registry of global pharmaceutical drugs, active generics, brand names, and dosage forms"
          icon={Pill}
          actions={
            (currentUser?.role === "PHARMACY" || currentUser?.role === "ADMIN" || currentUser?.role === "DOCTOR") && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={18} />
                <span>Add Medicine to Catalog</span>
              </button>
            )
          }
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar" style={{ flexWrap: "wrap", gap: "12px" }}>
            <div className="search-filter-box" style={{ flex: 1, minWidth: "260px" }}>
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by drug name, generic, brand, manufacturer, or form..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={16} color="var(--text-muted)" />
              <select
                className="form-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: "220px", height: "40px", fontSize: "13px" }}
              >
                {MEDICINE_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader rows={8} />
          ) : (
            <div className="table-responsive-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine ID</th>
                    <th>Medicine Name</th>
                    <th>Generic Name</th>
                    <th>Dosage Form</th>
                    <th>Strength</th>
                    <th>Category / Brands</th>
                    <th>Manufacturer</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No medicines found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m, idx) => (
                      <tr key={m.MedicineID || idx}>
                        <td style={{ fontWeight: "700" }}>#{m.MedicineID}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>{m.MedicineName}</td>
                        <td>{m.GenericName || m.MedicineName}</td>
                        <td><Badge status="ACTIVE" text={m.DosageForm || "Tablet"} /></td>
                        <td>{m.Strength || "Standard"}</td>
                        <td>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            <strong>{m.Category || "General Pharmaceutical"}</strong>
                            {m.BrandNames && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Brands: {m.BrandNames}</div>
                            )}
                          </div>
                        </td>
                        <td>{m.Manufacturer || "Global Pharma"}</td>
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
                placeholder="e.g. Paracetamol Extra, Augmentin 625mg"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Generic Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acetaminophen, Amoxicillin & Clavulanate"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Dosage Form</label>
              <select
                className="form-input role-select"
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup / Liquid">Syrup / Liquid</option>
                <option value="Injection">Injection</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Cream / Ointment">Cream / Ointment</option>
                <option value="Eye / Ear Drops">Eye / Ear Drops</option>
                <option value="Transdermal Patch">Transdermal Patch</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Strength / Concentration</label>
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
                placeholder="e.g. Pfizer, GSK, Novartis, Sun Pharma"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Save Medicine to Catalog
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default Medicines;