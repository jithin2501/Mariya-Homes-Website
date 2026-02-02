import { NavLink, Outlet, useNavigate, Link } from "react-router-dom"; // Added Link
import "./styles/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Mariya Homes</h2>

        <NavLink to="/admin/contact" className="admin-link">Contact Messages</NavLink>
        <NavLink to="/admin/video" className="admin-link">Upload Video</NavLink>
        <NavLink to="/admin/properties" className="admin-link">Manage Properties</NavLink>
        
        {/* New Section Linked correctly */}
        <NavLink to="/admin/property-details" className="admin-link">
          Property Details Settings
        </NavLink>

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