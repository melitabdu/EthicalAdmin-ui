import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddProvider.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ THIS IS THE IMPORTANT FIX
const FRONTEND_PUBLIC_URL = "https://frontend-user-ui.vercel.app";

const AddProvider = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceCategory: "",
    description: "",
    priceEstimate: "",
    photo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedProvider, setAddedProvider] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAddedProvider(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/providers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAddedProvider(res.data);

      // reset form
      setFormData({
        name: "",
        phone: "",
        serviceCategory: "",
        description: "",
        priceEstimate: "",
        photo: "",
      });
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add provider");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${FRONTEND_PUBLIC_URL}/p/${addedProvider.slug}`;
    navigator.clipboard.writeText(link);
    alert("✅ Public provider link copied!");
  };

  return (
    <div className="add-provider-page">
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>Add New Service Provider</h2>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit} className="add-provider-form">
        <input
          type="text"
          name="name"
          placeholder="Provider Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="serviceCategory"
          placeholder="Service Category"
          value={formData.serviceCategory}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="priceEstimate"
          placeholder="Price Estimate (Birr)"
          value={formData.priceEstimate}
          onChange={handleChange}
        />

        <input
          type="text"
          name="photo"
          placeholder="Photo URL (optional)"
          value={formData.photo}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "➕ Add Provider"}
        </button>
      </form>

      {/* ✅ SUCCESS SECTION */}
      {addedProvider && (
        <div className="success-box">
          <h3>✅ Provider Added Successfully</h3>

          <p>
            <strong>Name:</strong> {addedProvider.name}
          </p>

          <p>
            <strong>Slug:</strong> {addedProvider.slug}
          </p>

          <p>
            <strong>Public Link:</strong>
            <br />
            <a
              href={`${FRONTEND_PUBLIC_URL}/p/${addedProvider.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              {FRONTEND_PUBLIC_URL}/p/{addedProvider.slug}
            </a>
          </p>

          <button onClick={handleCopyLink}>📋 Copy Public Link</button>
        </div>
      )}
    </div>
  );
};

export default AddProvider;
