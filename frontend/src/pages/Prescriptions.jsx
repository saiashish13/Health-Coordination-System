import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import MedicineSelector from "../components/MedicineSelector";
import { prescriptionApi, medicineApi, patientApi, doctorApi, getUserSession } from "../services/api";
import { filterByRole } from "../utils/roleFilter";
import { useToast } from "../context/ToastContext";
import { Pill, Plus, Search, Globe } from "lucide-react";
import "../styles/Dashboard.css";

function Prescriptions() {
  const currentUser = getUserSession();
  const { addToast } = useToast();

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [patientId, setPatientId] = useState(() => currentUser?.role === "PATIENT" ? currentUser?.profile_id || "" : "");
  const [medicineName, setMedicineName] = useState("Amoxicillin 500mg");
  const [selectedMedDetails, setSelectedMedDetails] = useState(null);
  const [dosage, setDosage] = useState("500mg");
  const [frequency, setFrequency] = useState("Twice daily after meals");
  const [duration, setDuration] = useState("7 Days");
  const [instructions, setInstructions] = useState("Take with full glass of water");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      prescriptionApi.getAll().catch(() => []),
      patientApi.getAll().catch(() => []),
      doctorApi.getAll().catch(() => [])
    ])
      .then(([prescs, pats, docs]) => {
        setPrescriptions(prescs || []);
        setPatients(pats || []);
        setDoctors(docs || []);
        if (pats?.length > 0 && !patientId) setPatientId(pats[0].PatientID);
      })
      .catch(err => console.error("Error fetching prescriptions", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectMedicineDetails = (med) => {
    setSelectedMedDetails(med);
    setMedicineName(med.name);
    if (med.defaultDosage) setDosage(med.defaultDosage);
    if (med.form) setInstructions(`Form: ${med.form}. Take as directed.`);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!patientId || !medicineName) {
      addToast("Please select patient and medicine name", "warning");
      return;
    }

    try {
      let medicineId = 1;
      try {
        const meds = await medicineApi.getAll();
        const existing = meds.find(m => (m.MedicineName || "").toLowerCase().includes(medicineName.toLowerCase()));
        if (existing) {
          medicineId = existing.MedicineID;
        } else {
          const newMed = await medicineApi.create({
            MedicineName: medicineName,
            DosageForm: selectedMedDetails?.form || "Tablet",
            Manufacturer: selectedMedDetails?.manufacturer || "Global Pharma"
          });
          medicineId = newMed.MedicineID;
        }
      } catch {
        medicineId = 1;
      }

      await prescriptionApi.create({
        PatientID: parseInt(patientId),
        DoctorID: currentUser?.profile_id || (doctors[0]?.DoctorID || 1),
        items: [
          {
            MedicineID: medicineId,
            Dosage: dosage,
            Frequency: frequency,
            Duration: duration,
            Instructions: instructions
          }
        ]
      });

      addToast("Prescription issued successfully!", "success");
      setShowCreateForm(false);
      setDosage("");
      setFrequency("");
      setDuration("");
      setInstructions("");
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to create prescription", "error");
    }
  };

  const roleFiltered = filterByRole(prescriptions, currentUser);

  const filtered = roleFiltered.filter(p => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const presId = String(p.PrescriptionID || p.id || "").toLowerCase();
    const patientName = (p.patient?.user?.FullName || p.patient?.FullName || p.PatientName || `Patient #${p.PatientID || ""}`).toLowerCase();
    const doctorName = (p.doctor?.user?.FullName || p.doctor?.FullName || p.DoctorName || `Doctor #${p.DoctorID || ""}`).toLowerCase();
    const dateText = p.PrescriptionDate ? new Date(p.PrescriptionDate).toLocaleDateString().toLowerCase() : "";

    const itemsText = (p.items || []).map(i => `${i.medicine?.MedicineName || ''} ${i.Dosage || ''} ${i.Instructions || ''}`).join(" ").toLowerCase();

    return patientName.includes(search) || 
           doctorName.includes(search) ||
           presId.includes(search) ||
           dateText.includes(search) ||
           itemsText.includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Prescriptions" 
          subtitle={currentUser?.role === "DOCTOR" ? "Clinical prescriptions issued by me" : currentUser?.role === "PATIENT" ? "My prescribed medication list & dosage instructions" : "Issued clinical prescriptions and prescribed medicine catalog items"}
          icon={Pill}
          actions={
            (currentUser?.role === "DOCTOR" || currentUser?.role === "ADMIN" || currentUser?.role === "HOSPITAL") && (
              <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                <Plus size={18} />
                <span>Issue Prescription</span>
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
                placeholder="Search by patient, doctor, medicine, dosage or Prescription ID..."
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
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Prescription Date</th>
                    <th>Prescribed World Medicines & Dosage</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No prescriptions found matching your profile and search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.PrescriptionID}>
                        <td style={{ fontWeight: "700" }}>#{p.PrescriptionID}</td>
                        <td style={{ fontWeight: "600" }}>{p.patient?.user?.FullName || p.patient?.FullName || `Patient #${p.PatientID}`}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>Dr. {p.doctor?.user?.FullName || p.doctor?.FullName || `Doctor #${p.DoctorID}`}</td>
                        <td>{new Date(p.PrescriptionDate).toLocaleDateString()}</td>
                        <td>
                          {p.items && p.items.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px" }}>
                              {p.items.map((item) => (
                                <li key={item.PrescriptionItemID || Math.random()}>
                                  <strong style={{ color: "var(--primary)" }}>
                                    {item.medicine?.MedicineName || `Medication #${item.MedicineID}`}
                                  </strong>
                                  {" - "}{item.Dosage} ({item.Frequency || "Daily"}, {item.Duration || "Standard course"})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Standard Clinical Order</span>
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

        {/* Modal for Creating Prescription */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Issue New Prescription (World Medicines Database)"
        >
          <form onSubmit={handleCreatePrescription} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Patient</label>
              {patients.length > 0 ? (
                <select
                  className="form-input role-select"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
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
                  placeholder="Enter Patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Select Medicine (Global World Catalog)</span>
                <span style={{ fontSize: "11px", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Globe size={13} /> 150+ World Medicines & Custom
                </span>
              </label>
              <MedicineSelector
                value={medicineName}
                onChange={setMedicineName}
                onSelectMedicineDetails={handleSelectMedicineDetails}
                placeholder="Search any medicine in the world (e.g. Paracetamol, Augmentin, Ozempic...)"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Dosage</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 500mg, 10ml, 1 tablet"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Frequency</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Twice daily after meals"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Duration</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 7 Days, 1 Month"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Instructions</label>
              <input
                type="text"
                className="form-input"
                placeholder="Special administration instructions..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Issue Official Prescription
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default Prescriptions;