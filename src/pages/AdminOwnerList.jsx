import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // dynamic backend

export default function AdminOwnerList() {
  const { token } = useAdminAuth();
  const [owners, setOwners] = useState([]);
  const [message, setMessage] = useState('');

  // ✅ Create Axios instance with baseURL and auth header
  const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch owners from API
  const fetchOwners = async () => {
    try {
      const res = await api.get('/owners');
      setOwners(res.data.data || res.data); // safe fallback
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to fetch owners');
      setOwners([]);
    }
  };

  useEffect(() => {
    if (token) fetchOwners();
  }, [token]);

  // Delete owner
  const handleDelete = async (ownerId) => {
    if (!window.confirm('Are you sure you want to delete this owner?')) return;
    try {
      await api.delete(`/owners/${ownerId}`);
      setMessage('✅ Owner deleted successfully');
      fetchOwners(); // Refresh list
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to delete owner');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Rental Owners</h2>
      {message && <p>{message}</p>}
      {owners.length === 0 ? (
        <p>No owners found</p>
      ) : (
        owners.map((owner) => (
          <div
            key={owner._id}
            style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}
          >
            <h4>
              {owner.name} - {owner.phone}
            </h4>
            <p>Properties: {owner.properties?.length || 0}</p>
            <div>
              <button
                onClick={() => window.alert('Edit functionality coming soon')}
                style={{ marginRight: 10 }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(owner._id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
