// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddProvider from "./pages/AddProvider";
import AddProperty from "./pages/AddProperty";
import ListProvider from "./pages/ListProvider";
import AdminOwnerList from "./pages/AdminOwnerList";
import AdminPropertyList from "./pages/AdminPropertyList";
import AdminVideoManager from "./pages/AdVideoManager";

import AdminBookings from "./pages/AdminBookings";
import AdminRentalBookings from "./pages/AdminRentalBookings";

// Components
import SidebarLayout from "./components/SidebarLayout";

// ✅ Protected route wrapper using localStorage
const ProtectedAdminRoute = () => {
  const token = localStorage.getItem("adminToken");
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* Public admin login route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes with sidebar */}
      <Route path="/admin/*" element={<ProtectedAdminRoute />}>
        <Route element={<SidebarLayout />}>
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
          

          {/* Video ads */}
          <Route path="advideos" element={<AdminVideoManager />} />

          {/* Redirect unknown /admin routes to dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* Redirect all other routes to admin login */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default App;
