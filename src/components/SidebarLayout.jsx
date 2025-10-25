import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './SidebarLayout.css';

export default function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="app-container">
      {/* Hamburger button for mobile */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li>
              <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
                Dashboard
              </Link>
            </li>

            {/* Providers / Owners */}
            <li>
              <Link to="/admin/providers" onClick={() => setSidebarOpen(false)}>
                Providers
              </Link>
            </li>
            <li>
              <Link to="/admin/owners" onClick={() => setSidebarOpen(false)}>
                Rental Owners
              </Link>
            </li>
            <li>
              <Link to="/admin/add-provider" onClick={() => setSidebarOpen(false)}>
                Add Provider
              </Link>
            </li>

            {/* Properties */}
            <li>
              <Link to="/admin/properties" onClick={() => setSidebarOpen(false)}>
                Properties List
              </Link>
            </li>
            <li>
              <Link to="/admin/add-property" onClick={() => setSidebarOpen(false)}>
                Add Property
              </Link>
            </li>

            {/* Bookings */}
            <li>
              <Link to="/admin/bookings" onClick={() => setSidebarOpen(false)}>
                Service Bookings
              </Link>
            </li>
            <li>
              <Link to="/admin/rental-bookings" onClick={() => setSidebarOpen(false)}>
                Rental Bookings
              </Link>
            </li>

            {/* Other sections */}
            <li>
              <Link to="/admin/advideos" onClick={() => setSidebarOpen(false)}>
                Advertising Videos
              </Link>
            </li>
          </ul>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
}
