import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Users from "./pages/Users";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Organizations from "./pages/Organizations";

import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import LaboratoryDashboard from "./pages/LaboratoryDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";

import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Diagnoses from "./pages/Diagnoses";
import LabReports from "./pages/LabReports";
import LabTests from "./pages/LabTests";

import Medicines from "./pages/Medicines";
import MedicationOrders from "./pages/MedicationOrders";
import Prescriptions from "./pages/Prescriptions";
import PrescriptionItems from "./pages/PrescriptionItems";

import PermissionRequests from "./pages/PermissionRequests";
import PatientDoctorAccess from "./pages/PatientDoctorAccess";
import PatientAccessPermissions from "./pages/PatientAccessPermissions";

import AIInteractions from "./pages/AIInteractions";
import AIRecommendations from "./pages/AIRecommendations";
import DoctorReview from "./pages/DoctorReview";

import Notifications from "./pages/Notifications";
import AccessAuditLog from "./pages/AccessAuditLog";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>

            {/* Login and Registration */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Users, Patients, Doctors and Organizations */}
            <Route path="/users" element={<Users />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/organizations" element={<Organizations />} />

            {/* Dashboards */}
            <Route
              path="/patient-dashboard"
              element={<PatientDashboard />}
            />

            <Route
              path="/doctor-dashboard"
              element={<DoctorDashboard />}
            />

            <Route
              path="/hospital-dashboard"
              element={<HospitalDashboard />}
            />

            <Route
              path="/laboratory-dashboard"
              element={<LaboratoryDashboard />}
            />

            <Route
              path="/pharmacy-dashboard"
              element={<PharmacyDashboard />}
            />

            {/* Healthcare Data */}
            <Route
              path="/appointments"
              element={<Appointments />}
            />

            <Route
              path="/medical-records"
              element={<MedicalRecords />}
            />

            <Route
              path="/diagnoses"
              element={<Diagnoses />}
            />

            <Route
              path="/lab-tests"
              element={<LabTests />}
            />

            <Route
              path="/lab-reports"
              element={<LabReports />}
            />

            {/* Pharmacy */}
            <Route
              path="/medicines"
              element={<Medicines />}
            />

            <Route
              path="/prescriptions"
              element={<Prescriptions />}
            />

            <Route
              path="/prescription-items"
              element={<PrescriptionItems />}
            />

            <Route
              path="/medication-orders"
              element={<MedicationOrders />}
            />

            {/* Access Control */}
            <Route
              path="/permission-requests"
              element={<PermissionRequests />}
            />

            <Route
              path="/patient-doctor-access"
              element={<PatientDoctorAccess />}
            />

            <Route
              path="/access-permissions"
              element={<PatientAccessPermissions />}
            />

            {/* AI Care Coordination */}
            <Route
              path="/ai-assistant"
              element={<AIInteractions />}
            />

            <Route
              path="/ai-recommendations"
              element={<AIRecommendations />}
            />

            <Route
              path="/doctor-review"
              element={<DoctorReview />}
            />

            {/* System */}
            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/access-audit-log"
              element={<AccessAuditLog />}
            />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;