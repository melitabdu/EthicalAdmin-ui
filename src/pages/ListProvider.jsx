import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ListProvider.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ FRONTEND PUBLIC URL (HARDCODED OR ENV)
const FRONTEND_PUBLIC_URL = "https://frontend-user-ui.vercel.app";

const ListProvider = () => {
  const token = localStorage.getItem("adminToken");

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get("/admin/providers");
        setProviders(res.data || []);
        setError("");
      } catch (err) {
        console.error("Failed to fetch providers:", err);
        setError("Failed to fetch providers");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProviders();
  }, [token]);

  const handleCopyLink = (slug) => {
    const link = `${FRONTEND_PUBLIC_URL}/p/${slug}`;
    navigator.clipboard.writeText(link);
    alert("✅ Public link copied!");
  };

  if (loading) return <p>⏳ Loading providers...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="list-providers-fullpage">
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>Registered Service Providers</h2>

      {providers.length === 0 ? (
        <p>No providers found</p>
      ) : (
        <table className="provider-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Phone</th>
              <th>Public Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p._id}>
                <td>
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="provider-photo-small"
                    />
                  ) : (
                    "No photo"
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.serviceCategory}</td>
                <td>{p.phone}</td>
                <td>
                  {p.slug ? (
                    <>
                      <a
                        href={`${FRONTEND_PUBLIC_URL}/p/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                      <button onClick={() => handleCopyLink(p.slug)}>
                        📋
                      </button>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {/* other actions */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListProvider;
