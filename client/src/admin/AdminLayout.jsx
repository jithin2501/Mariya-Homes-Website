import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./styles/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    navigate("/admin/login", { replace: true });
  };

  // Check if current user is superadmin
  const currentUsername = localStorage.getItem("adminUsername") || process.env.REACT_APP_ADMIN_USERNAME;
  const isSuperAdmin = currentUsername === process.env.REACT_APP_ADMIN_USERNAME;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Mariya Homes</h2>

        <NavLink to="/admin/contact" className="admin-link">
          Contact Messages
        </NavLink>
        
        <NavLink to="/admin/video" className="admin-link">
          Upload Video
        </NavLink>
        
        <NavLink to="/admin/properties" className="admin-link">
          Manage Properties
        </NavLink>
        
        <NavLink to="/admin/property-details" className="admin-link">
          Property Details 
        </NavLink>

        <NavLink to="/admin/gallery" className="admin-link">
          Gallery Management
        </NavLink>

        {/* Only show User Management to superadmin */}
        {isSuperAdmin && (
          <NavLink to="/admin/users" className="admin-link">
            User Management
          </NavLink>
        )}

        <button className="admin-logout" onClick={handleLogout} style={{marginTop: 'auto'}}>
          Sign Out
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;