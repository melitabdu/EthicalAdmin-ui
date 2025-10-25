import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AddProperty.css';

const categories = [
  { id: "house", name: "House Rental/Sell", icon: "🏠" },
  { id: "car", name: "Car Rental/Sell", icon: "🚗" },
  { id: "shop/store", name: "Shop Rental/Sell", icon: "🏬" },
  { id: "store", name: "Store Rental/Sell", icon: "📦" },
  { id: "whole/tent", name: "Whole/tent Rental", icon: "📊" },
  { id: "other", name: "Other Rental/Sell", icon: "➕" },
];

export default function AddProperty() {
  const { token } = useAdminAuth();
  const [owners, setOwners] = useState([]);
  const [newOwner, setNewOwner] = useState(false);
  const [form, setForm] = useState({
    title: '', location: '', price: '', description: '', category: '',
    owner: '', ownerName: '', ownerPhone: '', ownerPassword: ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch owners for select dropdown
  const fetchOwners = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/owners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwners(res.data.data || res.data); // handle both cases
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [token]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImagesChange = e => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.category) return setMessage('❌ Please select a category');
    if (!newOwner && !form.owner) return setMessage('❌ Select existing owner or add new');

    const data = new FormData();
    data.append('title', form.title);
    data.append('location', form.location);
    data.append('price', form.price);
    data.append('description', form.description);
    data.append('category', form.category);

    if (newOwner) {
      data.append('ownerName', form.ownerName);
      data.append('ownerPhone', form.ownerPhone);
      data.append('ownerPassword', form.ownerPassword);
    } else {
      data.append('owner', form.owner);
    }

    images.forEach(img => data.append('images', img));

    try {
      const res = await axios.post('http://localhost:5000/api/properties', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setMessage(`✅ Property "${res.data.data.title}" added successfully!`);

      // Reset form
      setForm({
        title: '', location: '', price: '', description: '', category: '',
        owner: '', ownerName: '', ownerPhone: '', ownerPassword: ''
      });
      setImages([]);
      setPreviews([]);

      // Refresh owners for select dropdown
      fetchOwners();
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="add-property-container">
      <h2>Add Property</h2>
      {message && <p className="form-message">{message}</p>}
      <form onSubmit={handleSubmit} className="add-property-form" autoComplete="off">
        <label>Title:</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Location:</label>
        <input name="location" value={form.location} onChange={handleChange} required />

        <label>Price:</label>
        <input type="number" name="price" value={form.price} onChange={handleChange} min="0" required />

        <label>Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />

        <label>Category:</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">-- Select Category --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>

        <label>
          <input type="checkbox" checked={newOwner} onChange={() => setNewOwner(!newOwner)} />
          Add New Owner
        </label>

        {newOwner ? (
          <>
            <input name="ownerName" placeholder="Owner Name" value={form.ownerName} onChange={handleChange} required />
            <input name="ownerPhone" placeholder="Owner Phone" value={form.ownerPhone} onChange={handleChange} required />
            <input name="ownerPassword" type="password" placeholder="Owner Password" value={form.ownerPassword} onChange={handleChange} required autoComplete="new-password" />
          </>
        ) : (
          <select name="owner" value={form.owner} onChange={handleChange} required>
            <option value="">Select Existing Owner</option>
            {owners.map(o => (
              <option key={o._id} value={o._id}>{o.name} - {o.phone}</option>
            ))}
          </select>
        )}

        <label>Images:</label>
        <input type="file" multiple accept="image/*" onChange={handleImagesChange} />
        <div className="image-previews">
          {previews.map((src, i) => (
            <img key={i} src={src} alt="preview" style={{ width: 80, marginRight: 5, marginTop: 10 }} />
          ))}
        </div>

        <button type="submit">Add Property</button>
      </form>
    </div>
  );
}
