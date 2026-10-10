import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import SkeletonLoader from "../components/SkeletonLoader";
import { getUserSession, setUserSession, authApi, patientApi, doctorApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { 
  User, 
  Mail, 
  Building2, 
  HeartPulse, 
  Save, 
  IdCard
} from "lucide-react";
import "../styles/Dashboard.css";

function Profile() {
  const currentUser = getUserSession();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    userId: "",
    profileId: "",
    fullName: "",
    email: "",
    phone: "",
    role: "PATIENT",
    // Patient Specific
    bloodGroup: "O+",
    dateOfBirth: "",
    gender: "Unspecified",
    emergencyContact: "",
    address: "",
    // Doctor / Hospital Specific
    hospitalName: "",
    specialty: "",
    licenseNumber: ""
  });

  const loadProfileDetails = async () => {
    setLoading(true);
    try {
      const me = await authApi.getMe();
      const role = (me.Role || currentUser?.role || "PATIENT").toUpperCase();

      let patientExtra = {};
      let doctorExtra = {};

      if (role === "PATIENT" && me.PatientID) {
        try {
          const pat = await patientApi.getMe();
          patientExtra = {
            bloodGroup: pat.BloodGroup || "O+",
            dateOfBirth: pat.DateOfBirth || "",
            gender: pat.Gender || "Unspecified",
            emergencyContact: pat.EmergencyContact || "",
            address: pat.Address || ""
          };
        } catch {
          // fallback to auth profile data
        }
      } else if (role === "DOCTOR") {
        try {
          const doc = await doctorApi.getMe();
          doctorExtra = {
            hospitalName: doc.HospitalName || doc.organization?.OrganizationName || "Central City Hospital",
            specialty: doc.Specialty || "",
            licenseNumber: doc.LicenseNumber || ""
          };
        } catch {
          // fallback
        }
      }

      setFormData({
        userId: me.UserID || currentUser?.user_id || "",
        profileId: me.PatientID || me.DoctorID || currentUser?.profile_id || "",
        fullName: me.FullName || currentUser?.full_name || "",
        email: me.Email || currentUser?.email || "",
        phone: me.Phone || "",
        role: role,
        bloodGroup: me.BloodGroup || patientExtra.bloodGroup || "O+",
        dateOfBirth: me.DateOfBirth || patientExtra.dateOfBirth || "",
        gender: me.Gender || patientExtra.gender || "Unspecified",
        emergencyContact: me.EmergencyContact || patientExtra.emergencyContact || "",
        address: patientExtra.address || "",
        hospitalName: me.HospitalName || doctorExtra.hospitalName || currentUser?.hospital_name || "Central City Hospital",
        specialty: me.Specialty || doctorExtra.specialty || "",
        licenseNumber: me.LicenseNumber || doctorExtra.licenseNumber || ""
      });
    } catch (err) {
      console.error("Error loading profile details", err);
      // Fallback from session data
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          userId: currentUser.user_id || "",
          profileId: currentUser.profile_id || "",
          fullName: currentUser.full_name || "",
          email: currentUser.email || "",
          role: (currentUser.role || "PATIENT").toUpperCase(),
          hospitalName: currentUser.hospital_name || "Central City Hospital",
          bloodGroup: currentUser.blood_group || "O+"
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileDetails();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const role = formData.role.toUpperCase();

      if (role === "PATIENT" && formData.profileId) {
        await patientApi.update(formData.profileId, {
          FullName: formData.fullName,
          Phone: formData.phone,
          BloodGroup: formData.bloodGroup,
          DateOfBirth: formData.dateOfBirth,
          Gender: formData.gender,
          EmergencyContact: formData.emergencyContact,
          Address: formData.address
        });
      } else if (role === "DOCTOR") {
        await doctorApi.updateMe({
          FullName: formData.fullName,
          HospitalName: formData.hospitalName,
          Specialty: formData.specialty,
          LicenseNumber: formData.licenseNumber,
          Phone: formData.phone
        });
      }

      // Update localStorage user session state
      const updatedSession = {
        ...currentUser,
        full_name: formData.fullName,
        hospital_name: formData.hospitalName,
        blood_group: formData.bloodGroup,
        profile_id: formData.profileId ? parseInt(formData.profileId) : currentUser?.profile_id
      };
      setUserSession(updatedSession);

      addToast("Profile details updated successfully!", "success");
    } catch (err) {
      console.error("Error saving profile", err);
      addToast(err.message || "Failed to update profile details", "error");
    } finally {
      setSaving(false);
    }
  };

  const isPatient = formData.role === "PATIENT";
  const isDoctor = formData.role === "DOCTOR";

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="My Profile & Account Details" 
          subtitle={isPatient ? "Manage your personal health profile, blood group, and emergency contact details" : "Manage your clinical hospital credentials, specialty, and contact information"}
          icon={User}
        />

        {loading ? (
          <SkeletonLoader rows={8} />
        ) : (
          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Top Branding Banner Header */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "var(--accent-gradient)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "24px",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)"
                }}>
                  {(formData.fullName || formData.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>
                    {formData.fullName || "User Profile"}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Mail size={14} color="var(--primary)" />
                      {formData.email}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>•</span>
                    <Badge status="ACTIVE" text={formData.role} />
                    {formData.profileId && (
                      <span style={{ fontSize: "12px", background: "var(--primary-light)", color: "var(--primary)", padding: "2px 8px", borderRadius: "12px", fontWeight: "700" }}>
                        ID #{formData.profileId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
              >
                <Save size={18} />
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>

            {/* Main Form Fields Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              
              {/* Card 1: Account Credentials & Identifiers */}
              <div className="table-card-wrapper" style={{ padding: "20px" }}>
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <IdCard size={18} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                    Account Credentials & Identification
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Email Address (Gmail)</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Profile ID / User ID (Editable)</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>System Identifier</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.profileId || formData.userId}
                      onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Contact Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Role Specific Medical or Hospital Information */}
              <div className="table-card-wrapper" style={{ padding: "20px" }}>
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  {isPatient ? (
                    <HeartPulse size={18} color="var(--error)" />
                  ) : (
                    <Building2 size={18} color="var(--primary)" />
                  )}
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                    {isPatient ? "Patient Medical & Emergency Details" : "Hospital & Clinical Credentials"}
                  </h3>
                </div>

                {isPatient ? (
                  /* PATIENT SPECIFIC FIELDS */
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    <div className="form-group">
                      <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary)", marginBottom: "4px", display: "block" }}>
                        Blood Group (Patient Only)
                      </label>
                      <select
                        className="form-input role-select"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      >
                        <option value="O+">O Positive (O+)</option>
                        <option value="O-">O Negative (O-)</option>
                        <option value="A+">A Positive (A+)</option>
                        <option value="A-">A Negative (A-)</option>
                        <option value="B+">B Positive (B+)</option>
                        <option value="B-">B Negative (B-)</option>
                        <option value="AB+">AB Positive (AB+)</option>
                        <option value="AB-">AB Negative (AB-)</option>
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="form-group">
                        <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Date of Birth</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="YYYY-MM-DD (e.g. 1990-05-15)"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Gender</label>
                        <select
                          className="form-input role-select"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Unspecified">Unspecified</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Emergency Contact</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Name & Phone (e.g. Jane Doe - 555-0198)"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Residential Medical Address</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="Enter full address..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        style={{ height: "auto" }}
                      />
                    </div>

                  </div>
                ) : (
                  /* DOCTOR / HOSPITAL / LAB / PHARMACY SPECIFIC FIELDS */
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    <div className="form-group">
                      <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary)", marginBottom: "4px", display: "block" }}>
                        Hospital / Clinic / Organization Name
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Central City Hospital"
                        value={formData.hospitalName}
                        onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                        required
                      />
                    </div>

                    {isDoctor && (
                      <>
                        <div className="form-group">
                          <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Medical Specialty</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Cardiology, Neurology, Pediatrics"
                            value={formData.specialty}
                            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Medical License Number</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. MD-884920"
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Hospital / Practice Location</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="100 Health Ave, Medical District"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Bottom Save Action Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", fontSize: "15px" }}
              >
                <Save size={18} />
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>

          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
