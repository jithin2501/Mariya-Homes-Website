import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./styles/AdminLayout.css";
import AnimatedLogoutButton from "./AnimatedLogoutButton";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    navigate("/admin/login", { replace: true });
  };

  const currentUsername = localStorage.getItem("adminUsername") || process.env.REACT_APP_ADMIN_USERNAME;
  const isSuperAdmin = currentUsername === process.env.REACT_APP_ADMIN_USERNAME;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-container">

      {/* ── MOBILE TOPBAR ── */}
      <div className="admin-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(prev => !prev)}
          aria-label="Toggle sidebar"
        >
          <span className={`ham-line ${sidebarOpen ? 'open' : ''}`}></span>
          <span className={`ham-line ${sidebarOpen ? 'open' : ''}`}></span>
          <span className={`ham-line ${sidebarOpen ? 'open' : ''}`}></span>
        </button>
        <span className="admin-topbar-title">Mariya Homes</span>
      </div>

      {/* ── OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <h2>Mariya Homes</h2>

        <NavLink to="/admin/contact" className="admin-link" onClick={closeSidebar}>
          Contact Messages
        </NavLink>

        <NavLink to="/admin/video" className="admin-link" onClick={closeSidebar}>
          Upload Video
        </NavLink>

        <NavLink to="/admin/properties" className="admin-link" onClick={closeSidebar}>
          Manage Properties
        </NavLink>

        <NavLink to="/admin/property-details" className="admin-link" onClick={closeSidebar}>
          Property Details
        </NavLink>

        <NavLink to="/admin/gallery" className="admin-link" onClick={closeSidebar}>
          Gallery Management
        </NavLink>

        <NavLink to="/admin/analytics" className="admin-link" onClick={closeSidebar}>
          Analytics Dashboard
        </NavLink>

        {isSuperAdmin && (
          <NavLink to="/admin/users" className="admin-link" onClick={closeSidebar}>
            User Management
          </NavLink>
        )}

        <div className="sidebar-logout-wrapper">
          <AnimatedLogoutButton onClick={handleLogout} />
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;