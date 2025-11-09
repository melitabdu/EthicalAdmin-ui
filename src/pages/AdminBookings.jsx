import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./AdminBookings.css"; // ✅ optional custom CSS like AdminRentalBookings.css

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  // ✅ Fetch all bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings`, {
        headers: { "x-admin-secret": ADMIN_SECRET },
      });
      const data =
        res.data.bookings ||
        res.data.data ||
        (Array.isArray(res.data) ? res.data : []);
      setBookings(data);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to load bookings");
      setBookings([]);
    }
  };

  // ✅ Update status
  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/bookings/${id}`,
        { status },
        { headers: { "x-admin-secret": ADMIN_SECRET } }
      );
      setMessage(`✅ Booking status updated to ${status}`);
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to update status");
    }
  };

  // ✅ Mark as Paid
  const markAsPaid = async (id) => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/bookings/${id}/pay`,
        {},
        { headers: { "x-admin-secret": ADMIN_SECRET } }
      );
      setMessage(res.data.message || "✅ Marked as paid");
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to mark as paid");
    }
  };

  // ✅ Delete booking
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/bookings/${id}`, {
        headers: { "x-admin-secret": ADMIN_SECRET },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
      setMessage("🗑️ Booking deleted");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to delete booking");
    }
  };

  // ✅ Export Excel
  const exportToExcel = () => {
    const exportData = bookings.map((b) => ({
      Customer: b.customer?.name || "N/A",
      "Customer Phone": b.customer?.phone || "N/A",
      Provider: b.provider?.name || "N/A",
      "Provider Phone": b.provider?.phone || "N/A",
      Date: new Date(b.date).toLocaleDateString(),
      Status: b.status,
      Paid: b.paid ? "Yes" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Service Bookings");
    XLSX.writeFile(wb, "service_bookings.xlsx");
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Search + Filter
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer?.phone?.includes(searchTerm) ||
      b.provider?.phone?.includes(searchTerm);

    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    const matchesPayment = paymentFilter
      ? paymentFilter === "paid"
        ? b.paid
        : !b.paid
      : true;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="admin-bookings-container">
      <h2>🧾 Service Bookings (Admin)</h2>
      {message && <p className="message">{message}</p>}

      {/* ✅ Filters & Search */}
      <div className="top-controls">
        <input
          type="text"
          placeholder="🔍 Search by customer, provider, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="request">Request</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <button onClick={exportToExcel}>📊 Export Excel</button>
      </div>

      {/* ✅ Table Section */}
      {filteredBookings.length === 0 ? (
        <p>No service bookings found</p>
      ) : (
        <>
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Customer Phone</th>
                <th>Provider</th>
                <th>Provider Phone</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.slice(0, visibleCount).map((b) => (
                <tr key={b._id} className={`status-${b.status}`}>
                  <td>{b.customer?.name || "N/A"}</td>
                  <td>{b.customer?.phone || "N/A"}</td>
                  <td>{b.provider?.name || "N/A"}</td>
                  <td>{b.provider?.phone || "N/A"}</td>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b._id, e.target.value)
                      }
                    >
                      <option value="request">Request</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {b.paid ? (
                      <span className="paid">✅ Paid</span>
                    ) : (
                      <>
                        <span className="unpaid">❌ Unpaid</span>
                        <button
                          onClick={() => markAsPaid(b._id)}
                          className="btn btn-pay"
                        >
                          💰 Mark Paid
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleCount < filteredBookings.length && (
            <div className="load-more">
              <button onClick={() => setVisibleCount((c) => c + 10)}>
                ⬇️ Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBookings;
