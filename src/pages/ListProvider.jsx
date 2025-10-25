// src/pages/ListProvider.jsx
import React, { useEffect, useState } from "react";
import api from "../api"; // Centralized Axios instance
import { useAdminAuth } from "../context/adminAuthContext";
import { useNavigate } from "react-router-dom";
import "./ListProvider.css";

const ListProvider = () => {
  const { token } = useAdminAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get("/admin/providers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Providers API Response:", res.data);

        // Safely extract array depending on backend structure
        const data =
          res.data.providers ||
          res.data.data ||
          (Array.isArray(res.data) ? res.data : []);

        setProviders(data);
        setError("");
      } catch (err) {
        console.error("❌ Failed to fetch providers:", err);
        setError("❌ Failed to fetch providers");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProviders();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this provider?")) return;

    try {
      await api.delete(`/admin/provider/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProviders((prev) => prev.filter((p) => p._id !== id));
      alert("✅ Provider deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete provider:", err);
      alert("❌ Failed to delete provider");
    }
  };

  return (
    <div className="list-providers-fullpage">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅️ Back
      </button>

      <h2>🛠 Registered Service Providers</h2>

      {loading ? (
        <p>⏳ Loading providers...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : !Array.isArray(providers) || providers.length === 0 ? (
        <p>No providers found.</p>
      ) : (
        <>
          {/* 💻 Desktop Table */}
          <div className="table-container">
            <table className="provider-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => {
                  const photoURL = p.photo ? p.photo : "/default.png";
                  return (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={photoURL}
                          alt={p.name}
                          className="provider-photo-small"
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.serviceCategory || "N/A"}</td>
                      <td>{p.description || "N/A"}</td>
                      <td>{p.priceEstimate || "N/A"}</td>
                      <td>{p.phone}</td>
                      <td>
                        <button className="edit-btn">✏️ Edit</button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="delete-btn"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 📱 Mobile Card Layout */}
          <div className="mobile-card-container">
            {providers.map((p) => {
              const photoURL = p.photo ? p.photo : "/default.png";
              return (
                <div key={p._id} className="provider-card">
                  <img src={photoURL} alt={p.name} className="provider-photo" />
                  <h3>{p.name}</h3>
                  <p>
                    <strong>Category:</strong> {p.serviceCategory || "N/A"}
                  </p>
                  <p>
                    <strong>Description:</strong> {p.description || "N/A"}
                  </p>
                  <p>
                    <strong>Price:</strong> {p.priceEstimate || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {p.phone}
                  </p>
                  <div className="card-actions">
                    <button className="edit-btn">✏️ Edit</button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="delete-btn"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ListProvider;
