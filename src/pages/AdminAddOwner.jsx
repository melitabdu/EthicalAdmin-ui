import React, { useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AddProvider.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddOwner() {
  const { token } = useAdminAuth();
  const [form, setForm] = useState({ ownerName: '', ownerPhone: '', ownerPassword: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.ownerName || !form.ownerPhone || !form.ownerPassword) return setMessage('❌ Fill all fields');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/owners`, {
        name: form.ownerName,
        phone: form.ownerPhone,
        password: form.ownerPassword
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessage(`✅ Owner "${res.data.name}" added successfully`);
      setForm({ ownerName: '', ownerPhone: '', ownerPassword: '' });
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="add-provider-container">
      <h2>Add New Owner</h2>
      {message && <p className="form-message">{message}</p>}
      <form onSubmit={handleSubmit} className="add-provider-form" autoComplete="off">
        <input name="ownerName" placeholder="Owner Name" value={form.ownerName} onChange={handleChange} required />
        <input name="ownerPhone" placeholder="Owner Phone" value={form.ownerPhone} onChange={handleChange} required />
        <input type="password" name="ownerPassword" placeholder="Owner Password" value={form.ownerPassword} onChange={handleChange} required autoComplete="new-password" />
        <button type="submit">Add Owner</button>
      </form>
    </div>
  );
}
