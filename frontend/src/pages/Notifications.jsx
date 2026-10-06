import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundBlobs from "../components/BackgroundBlobs";
import PageHeader from "../components/PageHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { notificationApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Bell, CheckCheck, Check } from "lucide-react";
import "../styles/Dashboard.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const loadNotifications = () => {
    setLoading(true);
    notificationApi.getAll()
      .then(res => setNotifications(res))
      .catch(err => console.error("Error fetching notifications", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    notificationApi.getAll()
      .then(res => setNotifications(res))
      .catch(err => console.error("Error fetching notifications", err))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      addToast("Notification marked as read", "success");
      loadNotifications();
    } catch (err) {
      addToast("Error marking read: " + err.message, "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      addToast("All notifications marked as read", "success");
      loadNotifications();
    } catch (err) {
      addToast("Error marking all read: " + err.message, "error");
    }
  };

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  return (
    <div className="dashboard-container">
      <BackgroundBlobs />
      <Navbar />

      <div className="dashboard-content">
        <PageHeader 
          title="Notification Center" 
          subtitle={`Important event notifications, appointment status alerts, and lab results (${unreadCount} unread)`}
          icon={Bell}
          actions={
            <button className="btn-secondary" onClick={handleMarkAllRead}>
              <CheckCheck size={18} />
              <span>Mark All as Read</span>
            </button>
          }
        />

        {loading ? (
          <SkeletonLoader rows={5} />
        ) : notifications.length === 0 ? (
          <div className="table-card-wrapper" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <Bell size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No notifications in your inbox.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map((n) => (
              <div
                key={n.NotificationID}
                style={{
                  background: n.IsRead ? "var(--bg-card)" : "var(--primary-light)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  borderLeft: n.IsRead ? "4px solid var(--border-color)" : "4px solid var(--primary)",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px 0", color: "var(--text-primary)", fontSize: "15px", fontWeight: "700" }}>
                    {n.Title}
                  </h4>
                  <p style={{ margin: "0 0 6px 0", color: "var(--text-secondary)", fontSize: "14px" }}>
                    {n.Message}
                  </p>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(n.CreatedAt).toLocaleString()}
                  </span>
                </div>

                {!n.IsRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.NotificationID)}
                    className="btn-primary btn-xs"
                    style={{ flexShrink: 0 }}
                  >
                    <Check size={14} />
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default Notifications;