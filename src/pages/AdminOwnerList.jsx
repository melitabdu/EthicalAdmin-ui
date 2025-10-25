import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminOwnerList() {
  const { token } = useAdminAuth();
  const [owners, setOwners] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch owners from API
  const fetchOwners = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/owners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwners(res.data.data); // ✅ Use data array from backend response
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to fetch owners');
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [token]);

  // Delete owner
  const handleDelete = async (ownerId) => {
    if (!window.confirm('Are you sure you want to delete this owner?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/owners/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        owners.map(owner => (
          <div key={owner._id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <h4>{owner.name} - {owner.phone}</h4>
            <p>Properties: {owner.properties?.length || 0}</p>
            <div>
              <button onClick={() => window.alert('Edit functionality coming soon')} style={{ marginRight: 10 }}>
                Edit
              </button>
              <button onClick={() => handleDelete(owner._id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
