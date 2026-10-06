import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <main 
        className="dashboard-content animate-fade-in" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          minHeight: "65vh",
          textAlign: "center"
        }}
      >
        <div 
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--primary-light)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            boxShadow: "var(--shadow-glow)"
          }}
        >
          <AlertCircle size={44} />
        </div>

        <h1 className="gradient-text" style={{ fontSize: "56px", margin: "0 0 8px 0" }}>404</h1>
        <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>Page Not Found</h2>
        <p style={{ maxWidth: "460px", margin: "0 0 32px 0", color: "var(--text-muted)", fontSize: "15px" }}>
          The page or healthcare resource you are looking for doesn't exist, was moved, or requires different access permissions.
        </p>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <Link to="/" className="btn-primary">
            <Home size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
