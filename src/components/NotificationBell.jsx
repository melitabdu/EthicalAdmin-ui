import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import "./NotificationBell.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

const NotificationBell = ({ role, token }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // ✅ Decode userId from token
  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  // ✅ Join socket room (IMPORTANT)
  useEffect(() => {
    if (role !== "admin" && token) {
      const userId = getUserId();
      if (userId) {
        socket.emit("join", userId);
      }
    }
  }, [token, role]);

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/notifications/${role}`,
        {
          headers:
            role === "admin"
              ? { "x-admin-secret": ADMIN_SECRET }
              : { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(res.data);
    } catch (err) {
      console.error(
        "❌ Notification fetch error:",
        err.response?.data || err.message
      );
    }
  };

  // ✅ Mark as read (only for non-admin)
  const markAsRead = async (id) => {
    if (role === "admin") return;

    try {
      await axios.patch(
        `${API_BASE_URL}/api/notifications/${role}/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("❌ Mark read error:", err.message);
    }
  };

  // ✅ Real-time notifications
  useEffect(() => {
    socket.on("notification", (data) => {
      setNotifications((prev) => [
        {
          _id: Date.now(),
          message: data.message,
          read: false,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    });

    return () => socket.off("notification");
  }, []);

  // ✅ Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-container">
      {/* 🔔 Bell */}
      <div className="bell" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </div>

      {/* 📜 Dropdown */}
      {open && (
        <div className="dropdown">
          <h4>Notifications</h4>

          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`item ${n.read ? "" : "unread"}`}
                onClick={() => markAsRead(n._id)}
              >
                <p>{n.message}</p>
                <small>
                  {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;