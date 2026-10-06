import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import { authApi, setAuthToken, setUserSession } from "../services/api";
import { signInWithGoogle, signInWithGithub, supabase } from "../services/supabase";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { User, Mail, Lock, Eye, EyeOff, UserCheck, ShieldCheck, ArrowRight, CheckCircle2, Activity, Sun, Moon } from "lucide-react";
import "../styles/Auth.css";

function Register() {
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Patient");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          setLoading(true);
          const userEmail = session.user.email;
          const userFullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split("@")[0];

          const res = await authApi.googleLogin({
            email: userEmail,
            fullName: userFullName,
            role: role.toUpperCase()
          });

          setAuthToken(res.access_token);
          setUserSession(res);

          addToast("Google Sign-Up successful!", "success");

          const userRole = (res.role || "").toUpperCase();
          if (userRole === "DOCTOR") navigate("/doctor-dashboard");
          else if (userRole === "HOSPITAL" || userRole === "ADMIN") navigate("/hospital-dashboard");
          else if (userRole === "LAB") navigate("/laboratory-dashboard");
          else if (userRole === "PHARMACY") navigate("/pharmacy-dashboard");
          else navigate("/patient-dashboard");
        } catch (err) {
          setError(err.message || "Failed to complete Google Sign-Up with backend");
          addToast(err.message || "Google Sign-Up failed", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [navigate, role, addToast]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak password", class: "strength-weak" };
    if (score === 2) return { score: 2, label: "Medium password", class: "strength-medium" };
    return { score: 3, label: "Strong password", class: "strength-strong" };
  };

  const strength = getPasswordStrength(password);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword && confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Service & Privacy Policy");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      // 1. Sign up with Supabase Auth (triggers confirmation email)
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role.toUpperCase()
          }
        }
      });

      if (sbError) {
        throw new Error(sbError.message);
      }

      // 2. Register/sync user profile in application database
      let res;
      try {
        res = await authApi.register({
          fullName,
          email,
          password,
          role: role.toUpperCase()
        });
      } catch (apiErr) {
        if (apiErr.message && apiErr.message.includes("already exists")) {
          try {
            res = await authApi.login({ email, password });
          } catch {
            throw apiErr;
          }
        } else {
          throw apiErr;
        }
      }

      addToast("Account created successfully!", "success");

      // 3. Handle email confirmation requirement vs immediate session
      if (!sbData?.session && sbData?.user) {
        setSuccessMsg(`Registration successful! A confirmation email has been sent to ${email}. Please check your inbox to verify.`);
        return;
      }

      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setUserSession(res);

        const userRole = (res.role || "").toUpperCase();
        if (userRole === "PATIENT") {
          navigate("/patient-dashboard");
        } else if (userRole === "DOCTOR") {
          navigate("/doctor-dashboard");
        } else if (userRole === "HOSPITAL" || userRole === "ADMIN") {
          navigate("/hospital-dashboard");
        } else if (userRole === "LAB") {
          navigate("/laboratory-dashboard");
        } else if (userRole === "PHARMACY") {
          navigate("/pharmacy-dashboard");
        } else {
          navigate("/patient-dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "Registration failed");
      addToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to initialize Google Sign-Up");
      addToast("Google Sign-Up failed", "error");
      setLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGithub();
    } catch (err) {
      setError(err.message || "Failed to initialize GitHub Sign-Up");
      addToast(err.message || "GitHub Sign-Up failed", "error");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
      <BackgroundBlobs />

      {/* Floating Header Bar for Auth Pages */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "24px",
        right: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 100
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "var(--accent-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
          }}>
            <Activity size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>
            Health<span style={{ color: "var(--primary)" }}>Sync</span>
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle Theme"
        >
          <div className={`theme-icon-wrapper ${theme === "dark" ? "is-dark" : "is-light"}`}>
            <Sun className="sun-icon" size={19} />
            <Moon className="moon-icon" size={19} />
          </div>
        </button>
      </div>

      <main className="auth-page-wrapper" style={{ paddingTop: "80px" }}>
        <div className="auth-split-container">
          
          {/* Left Decorative Branding Panel */}
          <div className="auth-branding-panel">
            <div className="branding-shapes-container">
              <div className="floating-shape shape-1" />
              <div className="floating-shape shape-2" />
              <div className="floating-shape shape-3" />
            </div>

            <div className="branding-content">
              <div className="branding-badge">
                <ShieldCheck size={14} /> HIPAA Compliant Portal
              </div>
              <h1 className="branding-title">
                Join HealthSync Digital Ecosystem
              </h1>
              <p className="branding-subtitle">
                Create your role-based account to start managing patients, appointments, laboratory diagnostics, and electronic prescriptions securely.
              </p>
            </div>

            <div className="branding-footer-quote">
              <p style={{ margin: 0 }}>
                "Unified access control and instant AI assistance for clinical decisions."
              </p>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>— Certified Medical Network</span>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="auth-form-panel">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Get started with your free healthcare portal</p>
            </div>

            {error && (
              <div className="stagger-item stagger-1" style={{
                background: "var(--error-bg)",
                border: "1px solid var(--error)",
                color: "var(--error)",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "20px"
              }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div className="stagger-item stagger-1" style={{
                background: "var(--success-bg)",
                border: "1px solid var(--success)",
                color: "var(--success)",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "20px"
              }}>
                {successMsg}
              </div>
            )}

            {/* Social Logins */}
            <div className="social-buttons-grid stagger-item stagger-1">
              <button
                type="button"
                className="btn-social"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                className="btn-social"
                onClick={handleGithubSignUp}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="auth-divider stagger-item stagger-2">
              <span className="divider-text">Or register with email</span>
            </div>

            <form onSubmit={handleRegister}>
              
              {/* Full Name Field */}
              <div className="form-group stagger-item stagger-3">
                <User className="input-icon-left" size={18} />
                <input
                  type="text"
                  className={`form-input ${touched.fullName && !fullName ? "is-invalid" : ""} ${fullName ? "is-valid" : ""}`}
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="form-group stagger-item stagger-3">
                <Mail className="input-icon-left" size={18} />
                <input
                  type="email"
                  className={`form-input ${touched.email && !email ? "is-invalid" : ""} ${email && email.includes("@") ? "is-valid" : ""}`}
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                />
              </div>

              {/* Role Selection Dropdown */}
              <div className="form-group stagger-item stagger-4">
                <UserCheck className="input-icon-left" size={18} />
                <select
                  className="form-input role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Patient">Role: Patient Portal</option>
                  <option value="Doctor">Role: Medical Doctor</option>
                  <option value="Hospital">Role: Hospital / Admin</option>
                  <option value="Laboratory">Role: Diagnostic Lab</option>
                  <option value="Pharmacy">Role: Pharmacy</option>
                </select>
              </div>

              {/* Password Field */}
              <div className="form-group stagger-item stagger-4" style={{ marginBottom: "12px" }}>
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input has-right-icon"
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Bar Meter */}
              {password && (
                <div className="password-strength-container stagger-item">
                  <div className="strength-bar-track">
                    <div className={`strength-bar-fill ${strength.class}`} />
                  </div>
                  <span className="strength-label">{strength.label}</span>
                </div>
              )}

              {/* Confirm Password Field */}
              <div className="form-group stagger-item stagger-5">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${confirmPassword && password !== confirmPassword ? "is-invalid" : ""} ${confirmPassword && password === confirmPassword ? "is-valid" : ""}`}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="field-success-icon" size={16} />
                )}
                {confirmPassword && password !== confirmPassword && (
                  <span className="field-error-msg">Passwords do not match</span>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="stagger-item stagger-5" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
                />
                <label htmlFor="terms" style={{ fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
                  I agree to the <span style={{ color: "var(--primary)", fontWeight: "600" }}>Terms of Service</span> and <span style={{ color: "var(--primary)", fontWeight: "600" }}>Privacy Policy</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary btn-auth-submit stagger-item stagger-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch-text stagger-item stagger-6">
              Already have an account?{" "}
              <Link to="/" className="auth-switch-link">
                Sign In
              </Link>
            </p>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;