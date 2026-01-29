import { NavLink, Outlet } from "react-router-dom";
import "./styles/AdminLayout.css";

const AdminLayout = () => {
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

        <button className="admin-logout">Sign Out</button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
