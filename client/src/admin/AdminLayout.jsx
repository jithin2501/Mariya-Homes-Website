import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./styles/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove the authentication flag from local storage
    localStorage.removeItem("isAdminAuthenticated");
    
    // 2. Redirect the user back to the login page
    // Using replace: true prevents the user from clicking "Back" to enter again
    navigate("/admin/login", { replace: true });
  };

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

        {/* Updated Sign Out Button with onClick handler */}
        <button className="admin-logout" onClick={handleLogout}>
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