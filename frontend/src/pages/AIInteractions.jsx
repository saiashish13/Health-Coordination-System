import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { aiApi, getUserSession } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Bot, Send, User, Sparkles, AlertCircle } from "lucide-react";
import "../styles/Dashboard.css";

function AIInteractions() {
  const [query, setQuery] = useState("");
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const currentUser = getUserSession();
  const { addToast } = useToast();

  const loadHistory = () => {
    setFetching(true);
    aiApi.getInteractions()
      .then(res => setInteractions(res))
      .catch(err => console.error("Error fetching AI interactions", err))
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    aiApi.getInteractions()
      .then(res => setInteractions(res))
      .catch(err => console.error("Error fetching AI interactions", err))
      .finally(() => setFetching(false));
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      await aiApi.createInteraction({
        PatientID: currentUser?.profile_id || 1,
        UserQuery: query,
        InteractionType: "CHAT"
      });
      setQuery("");
      addToast("AI Assistant response generated!", "success");
      loadHistory();
    } catch (err) {
      addToast(err.message || "Error generating AI response", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="AI Healthcare Assistant" 
          subtitle="Real-time care coordination Q&A, symptom information, and medical report guidance"
          icon={Bot}
        />

        {/* AI Disclaimer Box */}
        <div style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "var(--text-secondary)",
          fontSize: "13px"
        }}>
          <AlertCircle size={20} color="var(--primary)" />
          <span>
            <strong>Medical Disclaimer:</strong> This AI assistant provides preliminary care coordination guidance and information lookup only. It does not replace professional clinical diagnosis.
          </span>
        </div>

        {/* Input Query Card */}
        <div className="table-card-wrapper" style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="var(--primary)" />
            <span>Ask HealthSync Assistant</span>
          </h3>

          <form onSubmit={handleAsk} style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Ask a health query (e.g. What are the common side effects of Amoxicillin?)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Interaction History List */}
        <div className="table-card-wrapper">
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>
            Interaction History
          </h3>

          {fetching ? (
            <SkeletonLoader rows={4} />
          ) : interactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
              No previous AI interactions found. Start by asking a question above!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {interactions.map((item) => (
                <div key={item.InteractionID} style={{
                  background: "var(--bg-card-solid)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "var(--primary)" }}>
                    <User size={16} />
                    <span>User: {item.UserQuery}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "var(--text-primary)", lineHeight: "1.6" }}>
                    <Bot size={18} color="var(--accent)" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "var(--accent)" }}>AI Assistant:</strong> {item.AIResponse}
                    </div>
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "flex-end" }}>
                    {new Date(item.CreatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default AIInteractions;