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
  LayoutDashboard
} from "lucide-react";
import "../styles/Navbar.css";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentUser = getUserSession();
  const profileRef = useRef(null);

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
    </header>
  );
}