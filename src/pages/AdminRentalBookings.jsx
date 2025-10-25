import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./AdminRentalBookings.css";

const AdminRentalBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedIdImage, setSelectedIdImage] = useState(null);

  const secretKey = import.meta.env.VITE_ADMIN_SECRET;
  const backendUrl = "http://localhost:5000"; // Adjust for deployed URL

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/rental-bookings`, {
        headers: { "x-admin-secret": secretKey },
      });
      setBookings(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to load bookings");
      setBookings([]);
    }
  };

  // Change booking status
  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `${backendUrl}/api/admin/rental-bookings/${id}/status`,
        { status },
        { headers: { "x-admin-secret": secretKey } }
      );
      setMessage(`✅ Booking status updated to ${status}`);
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to update status");
    }
  };

  // Mark as paid
  const markAsPaid = async (id) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/admin/rental-bookings/${id}/pay`,
        {},
        { headers: { "x-admin-secret": secretKey } }
      );
      setMessage(res.data.message || "✅ Booking marked as paid");
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to mark as paid");
    }
  };

  // Delete booking
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await axios.delete(`${backendUrl}/api/admin/rental-bookings/${id}`, {
        headers: { "x-admin-secret": secretKey },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
      setMessage("🗑️ Booking deleted");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to delete booking");
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = bookings.map((b) => ({
      Property: b.propertyId?.title || "N/A",
      User: b.fullName || b.userId?.name || "N/A",
      Owner: b.ownerId?.name || "N/A",
      StartDate: new Date(b.startDate).toLocaleDateString(),
      EndDate: new Date(b.endDate).toLocaleDateString(),
      TotalPrice: b.totalPrice || "N/A",
      Status: b.status,
      PaymentStatus: b.paymentStatus,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "rental_bookings.xlsx");
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.propertyId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ownerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    const matchesPayment = paymentFilter
      ? b.paymentStatus === paymentFilter
      : true;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="admin-bookings-container">
      <h2>🏠 Rental Bookings (Admin)</h2>

      {message && <p className="message">{message}</p>}

      {/* Search + Filters + Export */}
      <div className="top-controls">
        <input
          type="text"
          placeholder="🔍 Search by property, user, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="owner_confirm">Owner Confirmed</option>
          <option value="awaiting_payment">Awaiting Payment</option>
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

      {filteredBookings.length === 0 ? (
        <p>No rental bookings found</p>
      ) : (
        <>
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>User</th>
                <th>Owner</th>
                <th>Dates</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Payment</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.slice(0, visibleCount).map((b) => (
                <tr key={b._id} className={`status-${b.status}`}>
                  <td>{b.propertyId?.title || "N/A"}</td>
                  <td>{b.fullName || b.userId?.name || "N/A"}</td>
                  <td>{b.ownerId?.name || "N/A"}</td>
                  <td>
                    {new Date(b.startDate).toLocaleDateString()} →{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td>{b.totalPrice ? `💵 ${b.totalPrice}` : "N/A"}</td>
                  <td>
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b._id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="owner_confirm">Owner Confirmed</option>
                      <option value="awaiting_payment">Awaiting Payment</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {b.paymentStatus === "paid" ? (
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
                    {b.idFile ? (
                      <button
                        className="btn btn-id"
                        onClick={() => setSelectedIdImage(b.idFile)}
                      >
                        🆔 View ID
                      </button>
                    ) : (
                      "No ID"
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

          {/* Load more */}
          {visibleCount < filteredBookings.length && (
            <div className="load-more">
              <button onClick={() => setVisibleCount((c) => c + 10)}>
                ⬇️ Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* ID Modal */}
      {selectedIdImage && (
        <div className="modal" onClick={() => setSelectedIdImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedIdImage.secure_url.endsWith(".pdf") ? (
              <iframe
                src={selectedIdImage.secure_url}
                width="80%"
                height="400px"
                title="ID PDF"
              />
            ) : (
              <img
                src={selectedIdImage.secure_url}
                alt="ID Document"
                style={{ maxWidth: "80%", maxHeight: "400px", borderRadius: "6px" }}
              />
            )}
            <button
              className="close-btn"
              onClick={() => setSelectedIdImage(null)}
            >
              ❌ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRentalBookings;
