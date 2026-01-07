import React, { useState } from 'react';
import axios from 'axios';
import './AddProvider.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const AddProvider = () => {
  const token = localStorage.getItem('adminToken');

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceCategory: '',
    description: '',
    priceEstimate: '',
    password: '', // NEW provider password (not admin)
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [addedProvider, setAddedProvider] = useState(null);
  const [loading, setLoading] = useState(false);

  // Input change handler
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Photo upload handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage('❌ Admin token missing');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photo) formData.append('photo', photo);

      const res = await axios.post(
        `${API_BASE_URL}/api/admin/add-provider`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // ✅ Correct: use provider from backend
      setAddedProvider(res.data.provider);

      // ✅ Show a message
      setMessage(`✅ Provider "${res.data.provider.name}" added successfully`);

      console.log('✅ Provider slug:', res.data.provider.slug);

      // Reset form
      setForm({
        name: '',
        phone: '',
        serviceCategory: '',
        description: '',
        priceEstimate: '',
        password: '', // keep it empty
      });
      setPhoto(null);
      setPreview(null);

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || '❌ Failed to add provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-provider-container">
      <h2>Add Provider</h2>

      {message && <p className="form-message">{message}</p>}

      {/* ✅ Display public link & temporary provider password */}
      {addedProvider && (
        <div className="added-provider-info">
          <p>
            <strong>Public Link:</strong>
          </p>
          <a
            href={`${FRONTEND_URL}/p/${addedProvider.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {FRONTEND_URL}/p/{addedProvider.slug}
          </a>

          <button
            onClick={() =>
              navigator.clipboard.writeText(
                `${FRONTEND_URL}/p/${addedProvider.slug}`
              )
            }
          >
            📋 Copy Link
          </button>

          {/* ✅ Show the provider password ONCE from frontend state */}
          <p>
            <strong>Provider Password (share securely):</strong>{" "}
            <span style={{ color: "red" }}>{form.password || "••••••"}</span>
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="add-provider-form">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />

        <select
          name="serviceCategory"
          value={form.serviceCategory}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Electricity">Electricity</option>
          <option value="Plumbing">Plumbing</option>
        </select>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />

        <input
          type="number"
          name="priceEstimate"
          value={form.priceEstimate}
          onChange={handleChange}
          placeholder="Price Estimate"
          required
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="New Provider Password"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          required
        />
        {preview && <img src={preview} alt="preview" width="60" />}

        <button disabled={loading}>
          {loading ? 'Adding...' : 'Add Provider'}
        </button>
      </form>
    </div>
  );
};

export default AddProvider;
