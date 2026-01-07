import React, { useState } from 'react';
import axios from 'axios';
import './AddProvider.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('❌ Admin authentication token is missing');
      return;
    }
    setLoading(true);
    try {
      const api = axios.create({
        baseURL: `${API_BASE_URL}/api`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (photo) formData.append('photo', photo);

      const res = await api.post('/admin/add-provider', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const provider = res.data;
      setAddedProvider(provider);
      setMessage(`✅ Provider "${provider.name}" added successfully`);

      setForm({ name: '', phone: '', serviceCategory: '', description: '', priceEstimate: '', password: '' });
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error: ${err.response?.data?.message || 'Something went wrong'}`);
      setAddedProvider(null);
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
            <strong>Slug (Public Link):</strong>{' '}
            <a
              href={`${API_BASE_URL}/p/${addedProvider.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {addedProvider.slug}
            </a>
          </p>
          <button
            onClick={() =>
              navigator.clipboard.writeText(`${API_BASE_URL}/p/${addedProvider.slug}`)
            }
          >
            Copy Link
          </button>
          <p>
            <strong>Password:</strong> {addedProvider.password}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-provider-form" autoComplete="off">
        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Phone:</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />
        <label>Service Category:</label>
        <select name="serviceCategory" value={form.serviceCategory} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="Finishing Works">Finishing Works</option>
          <option value="Party Food Preparation">Party Food Preparation</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Electricity">Electricity</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Other Services">Other Services</option>
        </select>
        <label>Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />
        <label>Price Estimate (per day):</label>
        <input type="number" name="priceEstimate" value={form.priceEstimate} onChange={handleChange} required min="0" />
        <label>Password:</label>
        <input type="text" name="password" value={form.password} onChange={handleChange} required autoComplete="new-password" />
        <label>Photo:</label>
        <input type="file" onChange={handlePhotoChange} accept="image/*" required />
        {preview && <img src={preview} alt="Preview" style={{ width: '60px', marginTop: '10px' }} />}
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Provider'}
        </button>
      </form>
    </div>
  );
};

export default AddProvider;
