import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { getUserSession, clearSession } from "../services/api";
import { supabase } from "../services/supabase";
import { 
  Activity, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown, 
  Bell,
  LayoutDashboard,
  User,
  Building2,
  HeartPulse,
  Save
} from "lucide-react";
import Modal from "./Modal";
import { authApi, patientApi, doctorApi, setUserSession } from "../services/api";
import "../styles/Navbar.css";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    hospitalName: "",
    bloodGroup: "O+",
    specialty: "",
    emergencyContact: ""
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const currentUser = getUserSession();
  const profileRef = useRef(null);

  const handleOpenProfileModal = async () => {
    setShowProfileModal(true);
    if (!currentUser) return;

    try {
      const me = await authApi.getMe();
      setProfileData({
        fullName: me.FullName || currentUser.full_name || "",
        email: me.Email || currentUser.email || "",
        phone: me.Phone || "",
        role: (me.Role || currentUser.role || "PATIENT").toUpperCase(),
        hospitalName: me.HospitalName || currentUser.hospital_name || "Central City Hospital",
        bloodGroup: me.BloodGroup || currentUser.blood_group || "O+",
        specialty: me.Specialty || "",
        emergencyContact: ""
      });
    } catch {
      setProfileData({
        fullName: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: "",
        role: (currentUser.role || "PATIENT").toUpperCase(),
        hospitalName: currentUser.hospital_name || "Central City Hospital",
        bloodGroup: currentUser.blood_group || "O+",
        specialty: "",
        emergencyContact: ""
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const role = (profileData.role || "").toUpperCase();
      if (role === "PATIENT" && currentUser?.profile_id) {
        await patientApi.update(currentUser.profile_id, {
          FullName: profileData.fullName,
          Phone: profileData.phone,
          BloodGroup: profileData.bloodGroup,
          EmergencyContact: profileData.emergencyContact
        });
      } else if (role === "DOCTOR") {
        await doctorApi.updateMe({
          FullName: profileData.fullName,
          HospitalName: profileData.hospitalName,
          Specialty: profileData.specialty,
          Phone: profileData.phone
        });
      }

      // Update stored session
      const updatedSession = {
        ...currentUser,
        full_name: profileData.fullName,
        hospital_name: profileData.hospitalName,
        blood_group: profileData.bloodGroup
      };
      setUserSession(updatedSession);

      addToast("Profile details updated successfully!", "success");
      setShowProfileModal(false);
    } catch (err) {
      addToast(err.message || "Failed to save profile details", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  // Monitor scroll for glass navbar background shift
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard accessibility: Escape key closes menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
    setProfileOpen(false);
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
    } catch {
      // ignore
    }
    clearSession();
    setProfileOpen(false);
    setMobileOpen(false);
    if (addToast) addToast("Logged out successfully", "info");
    navigate("/");
    window.location.href = "/";
  };

  // Determine user dashboard path based on role
  const getDashboardPath = () => {
    if (!currentUser) return "/";
    const role = (currentUser.role || "").toUpperCase();
    if (role === "DOCTOR") return "/doctor-dashboard";
    if (role === "HOSPITAL" || role === "ADMIN") return "/hospital-dashboard";
    if (role === "LAB") return "/laboratory-dashboard";
    if (role === "PHARMACY") return "/pharmacy-dashboard";
    return "/patient-dashboard";
  };

  // Role based Nav Links
  const renderNavLinks = () => {
    if (!currentUser) {
      return (
        <>
          <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
            Sign In
          </Link>
          <Link to="/register" className={`nav-link ${location.pathname === "/register" ? "active" : ""}`}>
            Register
          </Link>
        </>
      );
    }

    const role = (currentUser.role || "").toUpperCase();
    const dashPath = getDashboardPath();

    return (
      <>
        <Link to={dashPath} className={`nav-link ${location.pathname === dashPath ? "active" : ""}`}>
          Dashboard
        </Link>
        
        {(role === "PATIENT" || role === "DOCTOR" || role === "HOSPITAL" || role === "ADMIN") && (
          <Link to="/appointments" className={`nav-link ${location.pathname === "/appointments" ? "active" : ""}`}>
            Appointments
          </Link>
        )}

        {(role === "PATIENT" || role === "DOCTOR") && (
          <Link to="/medical-records" className={`nav-link ${location.pathname === "/medical-records" ? "active" : ""}`}>
            Records
          </Link>
        )}

        {(role === "PATIENT" || role === "LAB") && (
          <Link to="/lab-reports" className={`nav-link ${location.pathname === "/lab-reports" ? "active" : ""}`}>
            Lab Reports
          </Link>
        )}

        {(role === "PATIENT" || role === "PHARMACY" || role === "DOCTOR") && (
          <Link to="/prescriptions" className={`nav-link ${location.pathname === "/prescriptions" ? "active" : ""}`}>
            Prescriptions
          </Link>
        )}

        {role === "PATIENT" && (
          <Link to="/ai-assistant" className={`nav-link ${location.pathname === "/ai-assistant" ? "active" : ""}`}>
            AI Assistant
          </Link>
        )}

        <Link to="/notifications" className={`nav-link ${location.pathname === "/notifications" ? "active" : ""}`}>
          Notifications
        </Link>

        <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>
          Profile
        </Link>
      </>
    );
  };

  return (
    <header className={`navbar-header ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        
        {/* Brand Logo */}
        <Link to={getDashboardPath()} className="navbar-brand">
          <div className="brand-icon">
            <Activity size={22} color="#ffffff" />
          </div>
          <span className="brand-text">Health<span className="brand-highlight">Sync</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav-links" aria-label="Main Navigation">
          {renderNavLinks()}
        </nav>

        {/* Right Action Menu */}
        <div className="navbar-actions">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <div className={`theme-icon-wrapper ${theme === "dark" ? "is-dark" : "is-light"}`}>
              <Sun className="sun-icon" size={19} />
              <Moon className="moon-icon" size={19} />
            </div>
          </button>

          {/* User Logged Out Actions */}
          {!currentUser ? (
            <div className="auth-buttons-group">
              <Link to="/" className="btn-ghost nav-signin-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary nav-register-btn">
                Get Started
              </Link>
            </div>
          ) : (
            /* User Logged In Profile Menu */
            <div className="profile-menu-container" ref={profileRef}>
              <button
                className="profile-avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="User profile menu"
              >
                <div className="avatar-circle">
                  {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="avatar-role">{(currentUser.role || "User")}</span>
                <ChevronDown size={15} className={`chevron-icon ${profileOpen ? "rotate" : ""}`} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">
                    <p className="user-email">{currentUser.email || "User Session"}</p>
                    <span className="role-badge">{(currentUser.role || "PATIENT").toUpperCase()}</span>
                  </div>
                  <div className="dropdown-divider" />
                  
                  <Link to={getDashboardPath()} className="dropdown-item">
                    <LayoutDashboard size={16} />
                    <span>My Dashboard</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="dropdown-item"
                  >
                    <User size={16} />
                    <span>My Profile Details</span>
                  </Link>
                  
                  <Link to="/notifications" className="dropdown-item">
                    <Bell size={16} />
                    <span>Notifications</span>
                  </Link>

                  <div className="dropdown-divider" />
                  
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Slide-in Menu */}
      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="drawer-title">Navigation</span>
              <button className="drawer-close-btn" onClick={() => setMobileOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-nav-links">
              {renderNavLinks()}
            </nav>

            {currentUser ? (
              <div className="mobile-auth-actions" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                <button 
                  onClick={handleLogout} 
                  className="btn-secondary w-full"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--error)" }}
                >
                  <LogOut size={18} />
                  <span>Logout ({currentUser.email || "Session"})</span>
                </button>
              </div>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/" className="btn-secondary w-full" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary w-full" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Details & Update Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="My Profile & Hospital / Medical Details"
      >
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ background: "var(--bg-card)", padding: "12px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <strong style={{ fontSize: "14px", color: "var(--primary)" }}>{profileData.email}</strong>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Role: <strong>{profileData.role}</strong> {currentUser?.profile_id ? `• Profile ID #${currentUser.profile_id}` : ""}
              </div>
            </div>
            <span style={{ fontSize: "11px", background: "var(--primary-light)", color: "var(--primary)", padding: "4px 8px", borderRadius: "12px", fontWeight: "700" }}>
              ACTIVE SESSION
            </span>
          </div>

          <div className="form-group">
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 555-0199"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />
          </div>

          {profileData.role === "PATIENT" ? (
            <>
              <div className="form-group">
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Blood Group (Patient)</label>
                <select
                  className="form-input role-select"
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
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

              <div className="form-group">
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Emergency Contact</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jane Doe (555-0198)"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Hospital / Clinic / Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Central City Hospital"
                  value={profileData.hospitalName}
                  onChange={(e) => setProfileData({ ...profileData, hospitalName: e.target.value })}
                  required
                />
              </div>

              {profileData.role === "DOCTOR" && (
                <div className="form-group">
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Medical Specialty</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cardiology, Pediatrics"
                    value={profileData.specialty}
                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={profileSaving}
            style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <Save size={16} />
            <span>{profileSaving ? "Saving Profile..." : "Save Profile Details"}</span>
          </button>
        </form>
      </Modal>

    </header>
  );
}