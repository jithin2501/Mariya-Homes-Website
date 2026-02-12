import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Construction from "./pages/Construction";
import Renovation from "./pages/Renovation";
import Contact from "./pages/Contact";

// Admin Pages
import AdminLayout from "./admin/AdminLayout";
import AdminContact from "./admin/AdminContact";
import AdminVideo from "./admin/AdminVideo";
import AdminGallery from "./admin/AdminGallery";
import Login from "./admin/auth/Login"; 
import AdminProperties from "./admin/AdminProperties";
import AdminPropertyDetails from "./admin/AdminPropertyDetails";
import UserManagement from "./admin/UserManagement";
import AnalyticsDashboard from "./admin/AnalyticsDashboard";
import UserDetails from "./admin/UserDetails";

// Global Styles
import "./styles/App.css";

/**
 * ProtectedRoute Component
 * Checks localStorage for authentication flag.
 * If not authenticated, redirects user to the admin login page.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
  
  // Use "replace" to prevent the login page from cluttering the browser history
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- WEBSITE ROUTES (WITH HEADER & FOOTER) --- */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/construction" element={<Construction />} />
          <Route path="/renovation" element={<Renovation />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* --- ADMIN AUTHENTICATION --- */}
        <Route path="/admin/login" element={<Login />} />

        {/* --- PROTECTED ADMIN PANEL --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Automatically redirect /admin to /admin/contact */}
          <Route index element={<Navigate to="contact" replace />} />
          
          <Route path="contact" element={<AdminContact />} />
          <Route path="video" element={<AdminVideo />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="property-details" element={<AdminPropertyDetails />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="analytics/user/:sessionId" element={<UserDetails />} />
        </Route>

        {/* --- CATCH-ALL REDIRECTS --- */}
        {/* Sends any mistyped /admin/anything back to login or dashboard */}
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
        
        {/* Optional: Global catch-all to redirect back home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;