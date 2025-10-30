// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddProvider from './pages/AddProvider';
import AddProperty from './pages/AddProperty';
import ListProvider from './pages/ListProvider';
import AdminOwnerList from './pages/AdminOwnerList';
import AdminPropertyList from './pages/AdminPropertyList';
import AdminVideoManager from './pages/AdVideoManager';
import AdminUnavailableDates from './pages/AdminUnavailableDates';
import AdminBookings from './pages/AdminBookings';
import AdminRentalBookings from './pages/AdminRentalBookings';

// Components
import SidebarLayout from './components/SidebarLayout';
import AdminRoute from './components/AdminRoutes';

// Context Provider
import { AdminAuthProvider } from './context/AdminAuthContext'; // ✅ Correct import & casing

const App = () => {
  return (
    <Routes>
      {/* Public admin login route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes with sidebar */}
      <Route
        path="/admin/*"
        element={
          <AdminAuthProvider>
            <AdminRoute>
              <SidebarLayout />
            </AdminRoute>
          </AdminAuthProvider>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Bookings */}
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="rental-bookings" element={<AdminRentalBookings />} />

        {/* Providers / Rental Owners */}
        <Route path="providers" element={<ListProvider />} />
        <Route path="owners" element={<AdminOwnerList />} />
        <Route path="add-provider" element={<AddProvider />} />

        {/* Properties */}
        <Route path="properties" element={<AdminPropertyList />} />
        <Route path="add-property" element={<AddProperty />} />

        {/* Unavailable dates */}
        <Route path="unavailable-dates" element={<AdminUnavailableDates />} />

        {/* Video ads */}
        <Route path="advideos" element={<AdminVideoManager />} />

        {/* Redirect unknown /admin routes to dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Redirect all other routes to admin login */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default App;
