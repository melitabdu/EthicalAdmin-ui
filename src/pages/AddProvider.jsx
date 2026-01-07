import React, { useState } from 'react';
import axios from 'axios';
import './AddProvider.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const AddProvider = () => {
  const token = localStorage.getItem('adminToken');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceCategory: '',
    description: '',
    priceEstimate: '',
    password: '',
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [addedProvider, setAddedProvider] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

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

      setAddedProvider(res.data);
      setMessage(`✅ Provider "${res.data.name}" added successfully`);

      setForm({
        name: '',
        phone: '',
        serviceCategory: '',
        description: '',
        priceEstimate: '',
        password: '',
      });
      setPhoto(null);
      setPreview(null);

    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to add provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-provider-container">
      <h2>Add Provider</h2>
      {message && <p className="form-message">{message}</p>}

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

          <p>
            <strong>Provider Password:</strong> {addedProvider.password}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-provider-form">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />

        <select name="serviceCategory" value={form.serviceCategory} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Electricity">Electricity</option>
          <option value="Plumbing">Plumbing</option>
        </select>

        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <input type="number" name="priceEstimate" value={form.priceEstimate} onChange={handleChange} placeholder="Price" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required />

        <input type="file" accept="image/*" onChange={handlePhotoChange} required />
        {preview && <img src={preview} alt="preview" width="60" />}

        <button disabled={loading}>
          {loading ? 'Adding...' : 'Add Provider'}
        </button>
      </form>
    </div>
  );
};

export default AddProvider;
