import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { prescriptionApi } from "../services/api";
import { Pill, Search } from "lucide-react";
import "../styles/Dashboard.css";

function PrescriptionItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    prescriptionApi.getAll()
      .then(res => {
        const allItems = [];
        res.forEach(p => {
          if (p.items) {
            p.items.forEach(i => allItems.push({ ...i, patientName: p.patient?.user?.FullName }));
          }
        });
        setItems(allItems);
      })
      .catch(err => console.error("Error fetching prescription items", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    const search = searchTerm.toLowerCase();
    const medName = item.medicine?.MedicineName || `Medicine #${item.MedicineID}`;
    return medName.toLowerCase().includes(search) || 
           String(item.PrescriptionItemID).includes(search) ||
           String(item.PrescriptionID).includes(search);
  });

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Prescription Item Directory" 
          subtitle="Granular dosage, frequency, and instructions for prescribed medicines"
          icon={Pill}
        />

        <div className="table-card-wrapper">
          <div className="table-toolbar">
            <div className="search-filter-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by Item ID, Prescription ID or medicine..."
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
                    <th>Item ID</th>
                    <th>Prescription ID</th>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                        No prescription items found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.PrescriptionItemID}>
                        <td style={{ fontWeight: "700" }}>#{item.PrescriptionItemID}</td>
                        <td>#{item.PrescriptionID}</td>
                        <td style={{ fontWeight: "600", color: "var(--primary)" }}>
                          {item.medicine?.MedicineName || `Medicine #${item.MedicineID}`}
                        </td>
                        <td>{item.Dosage || "N/A"}</td>
                        <td>{item.Frequency || "N/A"}</td>
                        <td>{item.Duration || "N/A"}</td>
                        <td>{item.Instructions || "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default PrescriptionItems;