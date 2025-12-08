import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  }

  return (
    <div className="notification-dropdown" ref={ref}>
      <button
        type="button"
        className="notification-button"
        aria-label="Notifications"
        onClick={toggleOpen}
        aria-expanded={open}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
          </div>
          <div className="notification-content">
            {notifications.length === 0 ? (
              <div className="coming-soon-message">
                <h4>You're all caught up!</h4>
                <p>No notifications yet.</p>
              </div>
            ) : (
              <ul className="list">
                {notifications.map((n) => (
                  <li key={n.id} style={{ alignItems: "flex-start" }}>
                    <div>
                      <strong>{n.title || n.type}</strong>
                      {n.message && (
                        <p className="muted" style={{ marginTop: "0.25rem" }}>
                          {n.message}
                        </p>
                      )}
                    </div>
                    <span className="muted" style={{ fontSize: "0.75rem" }}>
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
