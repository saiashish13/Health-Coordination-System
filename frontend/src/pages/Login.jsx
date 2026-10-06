import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import { authApi, setAuthToken, setUserSession } from "../services/api";
import { signInWithGoogle, signInWithGithub, supabase } from "../services/supabase";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { Mail, Lock, Eye, EyeOff, Activity, ArrowRight, CheckCircle2, Sparkles, Sun, Moon } from "lucide-react";
import "../styles/Auth.css";

function Login() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();
  const { addToast } = useToast();

  // Listen for Supabase OAuth Redirect Callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          setLoading(true);
          const userEmail = session.user.email;
          const userFullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split("@")[0];

          // Sync Google Auth with Python FastAPI backend
          const res = await authApi.googleLogin({
            email: userEmail,
            fullName: userFullName,
            role: "PATIENT"
          });

          setAuthToken(res.access_token);
          setUserSession(res);

          addToast("Google Sign-In successful! Welcome back.", "success");

          const role = (res.role || "").toUpperCase();
          if (role === "DOCTOR") navigate("/doctor-dashboard");
          else if (role === "HOSPITAL" || role === "ADMIN") navigate("/hospital-dashboard");
          else if (role === "LAB") navigate("/laboratory-dashboard");
          else if (role === "PHARMACY") navigate("/pharmacy-dashboard");
          else navigate("/patient-dashboard");
        } catch (err) {
          setError(err.message || "Failed to complete Google Sign-In with backend");
          addToast(err.message || "Google Sign-In failed", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [navigate, addToast]);

  const validateEmail = (val) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await authApi.login({ email, password });
      setAuthToken(res.access_token);
      setUserSession(res);

      addToast("Login successful! Redirecting...", "success");

      const role = (res.role || "").toUpperCase();
      if (role === "PATIENT") {
        navigate("/patient-dashboard");
      } else if (role === "DOCTOR") {
        navigate("/doctor-dashboard");
      } else if (role === "HOSPITAL" || role === "ADMIN") {
        navigate("/hospital-dashboard");
      } else if (role === "LAB") {
        navigate("/laboratory-dashboard");
      } else if (role === "PHARMACY") {
        navigate("/pharmacy-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
      addToast(err.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to initialize Google Sign-In");
      addToast("Google Sign-In failed", "error");
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGithub();
    } catch (err) {
      setError(err.message || "Failed to initialize GitHub Sign-In");
      addToast(err.message || "GitHub Sign-In failed", "error");
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
                <Sparkles size={14} /> Next-Gen Care Platform
              </div>
              <h1 className="branding-title">
                Smart Healthcare & Patient Care Management
              </h1>
              <p className="branding-subtitle">
                Access patient records, schedule specialist appointments, monitor lab reports, and manage prescriptions seamlessly in real-time.
              </p>
            </div>

            <div className="branding-footer-quote">
              <p style={{ margin: 0 }}>
                "HealthSync transformed our care workflow and cut lab report turnaround times by 40%."
              </p>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>— Metro General Hospital Staff</span>
            </div>
          </div>

          {/* Right Form Card Panel */}
          <div className="auth-form-panel">
            <div className="form-header">
              <h2 className="form-title">Welcome back</h2>
              <p className="form-subtitle">Enter your credentials to access your portal</p>
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

            {/* Social Logins */}
            <div className="social-buttons-grid stagger-item stagger-1">
              <button
                type="button"
                className="btn-social"
                onClick={handleGoogleSignIn}
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
                onClick={handleGithubSignIn}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="auth-divider stagger-item stagger-2">
              <span className="divider-text">Or continue with email</span>
            </div>

            <form onSubmit={handleLogin}>
              
              {/* Email Input */}
              <div className="form-group stagger-item stagger-3">
                <Mail className="input-icon-left" size={18} />
                <input
                  type="email"
                  className={`form-input ${touched.email && (!email || !validateEmail(email)) ? "is-invalid" : ""} ${touched.email && validateEmail(email) ? "is-valid" : ""}`}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                />
                {touched.email && validateEmail(email) && (
                  <CheckCircle2 className="field-success-icon" size={16} />
                )}
                {touched.email && !validateEmail(email) && email && (
                  <span className="field-error-msg">Please enter a valid email address</span>
                )}
              </div>

              {/* Password Input */}
              <div className="form-group stagger-item stagger-4">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-input has-right-icon ${touched.password && !password ? "is-invalid" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary btn-auth-submit stagger-item stagger-5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch-text stagger-item stagger-6">
              Don't have an account?{" "}
              <Link to="/register" className="auth-switch-link">
                Create Account
              </Link>
            </p>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;