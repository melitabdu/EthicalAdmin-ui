// src/pages/AdminBookings.jsx
import React, { useEffect, useState } from "react";
import api from "../api"; // centralized Axios instance
import "./AdminBookings.css"; // optional, for styling

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Get admin token from localStorage
  const token = localStorage.getItem("adminToken");

  // ✅ Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Admin bookings response:", res.data);

        // Safely extract bookings data
        const data =
          res.data.bookings ||
          res.data.data ||
          (Array.isArray(res.data) ? res.data : []);

        setBookings(data);
      } catch (err) {
        console.error("❌ Failed to load bookings:", err);
        setMessage("❌ Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBookings();
  }, [token]);

  // ✅ Update booking status
  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(
        `/bookings/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ Booking updated to ${status}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      setMessage("❌ Failed to update booking status");
    }
  };

  // ✅ Mark booking as paid
  const markAsPaid = async (bookingId) => {
    const secretKey = import.meta.env.VITE_ADMIN_SECRET;
    if (!secretKey) return alert("⚠️ ADMIN_SECRET not set in .env");

    try {
      const res = await api.patch(`/bookings/${bookingId}/pay`, {}, {
        headers: { "x-admin-secret": secretKey },
      });
      setMessage(res.data.message || "✅ Marked as paid");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, paid: true } : b))
      );
    } catch (err) {
      console.error("❌ Failed to mark as paid:", err);
      setMessage("❌ Failed to mark as paid");
    }
  };

  // ✅ Delete booking
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;

    const secretKey = import.meta.env.VITE_ADMIN_SECRET;
    if (!secretKey) return alert("⚠️ ADMIN_SECRET not set in .env");

    try {
      await api.delete(`/bookings/${id}`, {
        headers: { "x-admin-secret": secretKey },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
      setMessage("🗑️ Booking deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete booking:", err);
      setMessage("❌ Failed to delete booking");
    }
  };

  return (
    <div className="admin-bookings-container">
      <h2>📋 All Bookings (Admin)</h2>
      {message && <p className="status-message">{message}</p>}

      {loading ? (
        <p>⏳ Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Provider</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.customer?.name || "N/A"}</td>
                <td>{b.provider?.name || "N/A"}</td>
                <td>{b.provider?.phone || "N/A"}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>
                  {(b.status === "confirmed" || b.status === "processing") ? (
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b._id, e.target.value)
                      }
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    b.status
                  )}
                </td>
                <td>{b.paid ? "✅ Yes" : "❌ No"}</td>
                <td>
                  {!b.paid && (
                    <button onClick={() => markAsPaid(b._id)}>
                      💰 Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(b._id)}
                    style={{
                      marginLeft: "8px",
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
