import React, { useEffect, useState } from "react";
import axios from "axios"; // ✅ switch to direct axios with VITE_API_BASE_URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // ✅ use env variable

const AdminBookings = () => {
  // ✅ Get token directly from localStorage
  const token = localStorage.getItem("adminToken");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data =
        res.data.bookings ||
        res.data.data ||
        (Array.isArray(res.data) ? res.data : []);
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setMessage("❌ Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();

    // Track window resize for responsive layout
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [token]);

  // Update booking status
  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/bookings/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
      setMessage(`✅ Booking updated to ${status}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      setMessage("❌ Failed to update booking status");
    }
  };

  // Mark as paid
  const markAsPaid = async (id) => {
    const secretKey = import.meta.env.VITE_ADMIN_SECRET;
    if (!secretKey) return alert("⚠️ VITE_ADMIN_SECRET not set in .env");

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/bookings/${id}/pay`,
        {},
        {
          headers: { "x-admin-secret": secretKey },
        }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, paid: true } : b))
      );
      setMessage(res.data.message || "✅ Marked as paid");
    } catch (err) {
      console.error("Failed to mark as paid:", err);
      setMessage("❌ Failed to mark as paid");
    }
  };

  // Delete booking
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;

    const secretKey = import.meta.env.VITE_ADMIN_SECRET;
    if (!secretKey) return alert("⚠️ VITE_ADMIN_SECRET not set in .env");

    try {
      await axios.delete(`${API_BASE_URL}/api/bookings/${id}`, {
        headers: { "x-admin-secret": secretKey },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
      setMessage("🗑️ Booking deleted successfully");
    } catch (err) {
      console.error("Failed to delete booking:", err);
      setMessage("❌ Failed to delete booking");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Bookings (Admin)</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      {loading ? (
        <p>⏳ Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <>
          {/* Desktop Table */}
          {windowWidth >= 768 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Customer Phone</th>
                    <th>Provider</th>
                    <th>Provider Phone</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Paid</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} style={{ borderBottom: "1px solid #ccc" }}>
                      <td>{b.customer?.name || "N/A"}</td>
                      <td>{b.customer?.phone || "N/A"}</td>
                      <td>{b.provider?.name || "N/A"}</td>
                      <td>{b.provider?.phone || "N/A"}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>
                        {b.status === "request" ? (
                          <span style={{ color: "gray", fontStyle: "italic" }}>
                            Waiting for provider
                          </span>
                        ) : ["confirmed", "processing"].includes(b.status) ? (
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
                          <button onClick={() => markAsPaid(b._id)}>💰</button>
                        )}
                        <button
                          onClick={() => handleDelete(b._id)}
                          style={{
                            marginLeft: 5,
                            backgroundColor: "red",
                            color: "white",
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {windowWidth < 768 && (
            <div style={{ marginTop: 20 }}>
              {bookings.map((b) => (
                <div
                  key={b._id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 10,
                    fontSize: "0.85rem",
                  }}
                >
                  <p>
                    <strong>Customer:</strong> {b.customer?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Customer Phone:</strong> {b.customer?.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Provider:</strong> {b.provider?.name || "N/A"} (
                    {b.provider?.phone || "N/A"} )
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(b.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {b.status === "request" ? (
                      <span style={{ color: "gray", fontStyle: "italic" }}>
                        Waiting for provider
                      </span>
                    ) : ["confirmed", "processing"].includes(b.status) ? (
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
                  </p>
                  <p>
                    <strong>Paid:</strong> {b.paid ? "✅ Yes" : "❌ No"}
                  </p>
                  <div>
                    {!b.paid && (
                      <button onClick={() => markAsPaid(b._id)}>💰 Mark Paid</button>
                    )}
                    <button
                      onClick={() => handleDelete(b._id)}
                      style={{
                        marginLeft: 5,
                        backgroundColor: "red",
                        color: "white",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
};

export default AdminBookings;
