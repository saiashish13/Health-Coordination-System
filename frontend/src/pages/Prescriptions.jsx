import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import { prescriptionApi, medicineApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Pill, Plus, Search } from "lucide-react";
import "../styles/Dashboard.css";

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const currentUser = getUserSession();
  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([prescriptionApi.getAll(), medicineApi.getAll()])
      .then(([prescs, meds]) => {
        setPrescriptions(prescs);
        setMedicines(meds);
        if (meds.length > 0) setSelectedMedicineId(meds[0].MedicineID);
      })
      .catch(err => console.error("Error fetching prescriptions", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([prescriptionApi.getAll(), medicineApi.getAll()])
      .then(([prescs, meds]) => {
        setPrescriptions(prescs);
        setMedicines(meds);
        if (meds.length > 0) setSelectedMedicineId(meds[0].MedicineID);
      })
      .catch(err => console.error("Error fetching prescriptions", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      await prescriptionApi.create({
        PatientID: parseInt(patientId),
        DoctorID: currentUser?.profile_id || 1,
        items: [
          {
            MedicineID: parseInt(selectedMedicineId),
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

  const filtered = prescriptions.filter(p => {
    const search = searchTerm.toLowerCase();
    const patientName = p.patient?.user?.FullName || `Patient #${p.PatientID}`;
    const doctorName = p.doctor?.user?.FullName || `Doctor #${p.DoctorID}`;
    return patientName.toLowerCase().includes(search) || 
           doctorName.toLowerCase().includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Prescriptions" 
          subtitle="Issued clinical prescriptions and prescribed medication items"
          icon={Pill}
          actions={
            (currentUser?.role === "DOCTOR" || currentUser?.role === "ADMIN") && (
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
                placeholder="Search by patient or doctor..."
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
                    <th>Prescribed Items</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No prescriptions found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.PrescriptionID}>
                        <td style={{ fontWeight: "700" }}>#{p.PrescriptionID}</td>
                        <td>{p.patient?.user?.FullName || `Patient #${p.PatientID}`}</td>
                        <td>{p.doctor?.user?.FullName || `Doctor #${p.DoctorID}`}</td>
                        <td>{new Date(p.PrescriptionDate).toLocaleDateString()}</td>
                        <td>
                          {p.items && p.items.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px" }}>
                              {p.items.map((item) => (
                                <li key={item.PrescriptionItemID}>
                                  <strong>{item.medicine?.MedicineName || `Med #${item.MedicineID}`}</strong> - {item.Dosage} ({item.Frequency}, {item.Duration})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>No items</span>
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
          title="Issue New Prescription"
        >
          <form onSubmit={handleCreatePrescription} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Patient ID</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Select Medicine</label>
              <select
                className="form-input role-select"
                value={selectedMedicineId}
                onChange={(e) => setSelectedMedicineId(e.target.value)}
              >
                {medicines.map((m) => (
                  <option key={m.MedicineID} value={m.MedicineID}>
                    {m.MedicineName} ({m.DosageForm || "Form"})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Dosage</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 500mg, 10ml"
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
                placeholder="Additional instructions..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" style={{ marginTop: "8px" }}>
              Issue Prescription
            </button>
          </form>
        </Modal>

      </div>

      <Footer />
    </div>
  );
}

export default Prescriptions;