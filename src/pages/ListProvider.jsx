// src/pages/ListProvider.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ListProvider.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ListProvider = () => {
  const token = localStorage.getItem("adminToken");

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: `${API_BASE_URL}/api/providers`,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get("/");
        setProviders(Array.isArray(res.data) ? res.data : []);
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
      await api.delete(`/${id}`);
      setProviders((prev) => prev.filter((p) => p._id !== id));
      alert("✅ Provider deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete provider:", err);
      alert("❌ Failed to delete provider");
    }
  };

  const handleCopyLink = (slug) => {
    navigator.clipboard.writeText(`${API_BASE_URL}/p/${slug}`);
    alert("✅ Public link copied!");
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
      ) : providers.length === 0 ? (
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
                  <th>Public Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={p.photo || "/default.png"}
                        alt={p.name}
                        className="provider-photo-small"
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.serviceCategory}</td>
                    <td>{p.description}</td>
                    <td>{p.priceEstimate}</td>
                    <td>{p.phone}</td>
                    <td>
                      {p.slug ? (
                        <>
                          <a
                            href={`${API_BASE_URL}/p/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            /p/{p.slug}
                          </a>
                          <button
                            onClick={() => handleCopyLink(p.slug)}
                            className="copy-btn"
                          >
                            📋
                          </button>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="delete-btn"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ListProvider;
