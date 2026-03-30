// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import './AdminDashboard.css';
import NotificationBell from "../components/NotificationBell";



const AdminDashboard = () => {
  const [search, setSearch] = useState('');

  // Example stats (you can replace with backend data)
  const stats = [
    { title: 'Total Providers', value: 42 },
    { title: 'Total Bookings', value: 128 },
    { title: 'Pending Requests', value: 7 },
    { title: 'Active Ads', value: 5 },
  ];

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  

  return (
    <div className="admin-dashboard-container">
      <h2>📊 Admin Dashboard</h2>

      {/* Search bar */}
      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Search providers, bookings..."
          value={search}
          onChange={handleSearchChange}
        />
        <button>🔍</button>
      </div>

      {/* Statistics cards */}
      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.value}</h3>
            <p>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="dashboard-links">
        <h3>Quick Actions</h3>
        <div className="links-grid">
          <button onClick={() => window.location.href = '/admin/providers'}>📋 Manage Providers</button>
          <button onClick={() => window.location.href = '/admin/bookings'}>🗓 View Bookings</button>
          <button onClick={() => window.location.href = '/admin/add-provider'}>➕ Add Provider</button>
          <button onClick={() => window.location.href = '/admin/advideos'}>🎥 Manage Ads</button>
          <button onClick={() => window.location.href = '/admin/unavailable-dates'}>📅 Unavailable Dates</button>
        </div>
        <NotificationBell role="admin" />
      </div>
    </div>
  );
};

export default AdminDashboard;
