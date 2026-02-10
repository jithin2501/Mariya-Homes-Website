import React, { useState, useEffect } from "react";
import "./styles/UserManagement.css";

const UserManagement = () => {
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Centralized Backend URL pointing to your Express server
  const API_BASE_URL = "http://localhost:5000/api/admin";

  // Icon image URLs - replace with your own image paths
  const ICONS = {
    activate: "/images/usermanagement logo/Active.png", // Active icon
    deactivate: "/images/usermanagement logo/Inactive.png", // Inactive icon
    delete: "/images/usermanagement logo/Delete.png" // Delete icon
  };

  // Fallback icons in case image URLs fail
  const FALLBACK_ICONS = {
    activate: "🔑",
    deactivate: "🔒",
    delete: "🗑️"
  };

  const [iconError, setIconError] = useState({});

  const handleIconError = (iconName) => {
    setIconError(prev => ({ ...prev, [iconName]: true }));
  };

  // Fetch existing users on component mount
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token"); // Consistent with authMiddleware
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized - Please Login Again");
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers([...users, data]);
        setNewUser({ username: "", password: "" });
        alert("Admin user created successfully!");
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError("Network error. Ensure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // Logic to toggle user activation status
  const toggleUserStatus = async (username) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${username}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        // Refresh the list to show updated status and last login
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(user => user.username !== username));
        alert("User deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Network error. Please try again.");
    }
  };

  // Check if current user is superadmin
  const isSuperAdmin = localStorage.getItem("adminRole") === "superadmin";

  if (!isSuperAdmin) {
    return (
      <div className="user-management">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only superadmin can access User Management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      <div className="create-user-section">
        <h2>Create New Admin User</h2>
        <p className="section-description">
          Create credentials for a new admin user who can access this portal.
        </p>
        
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Enter new username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              required
              minLength="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Enter a strong password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              required
              minLength="8"
            />
            <small className="password-hint">
              Password must be at least 8 characters long
            </small>
          </div>
          
          {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
          
          <button 
            type="submit" 
            className="create-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>
      </div>

      <hr className="divider" />

      <div className="existing-users-section">
        <h2>Existing Admin Users</h2>
        
        {users.length === 0 ? (
          <p className="no-users">No admin users found.</p>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USERNAME</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>LAST LOGIN</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id || user.username}>
                    <td>{user.username}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={user.isActive ? "status-active" : "status-inactive"}>
                        {user.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td>
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleString('en-GB')
                        : 'Never logged in'}
                    </td>
                    <td>
                      {user.role !== 'superadmin' && (
                        <div className="action-buttons">
                          <button 
                            onClick={() => toggleUserStatus(user.username)}
                            className="icon-btn"
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                          >
                            {iconError[user.isActive ? 'deactivate' : 'activate'] ? (
                              <span className="fallback-icon">
                                {user.isActive ? FALLBACK_ICONS.deactivate : FALLBACK_ICONS.activate}
                              </span>
                            ) : (
                              <img 
                                src={user.isActive ? ICONS.deactivate : ICONS.activate}
                                alt={user.isActive ? "Deactivate" : "Activate"}
                                className="action-icon"
                                onError={() => handleIconError(user.isActive ? 'deactivate' : 'activate')}
                              />
                            )}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.username)} 
                            className="icon-btn"
                            title="Delete User"
                          >
                            {iconError.delete ? (
                              <span className="fallback-icon">
                                {FALLBACK_ICONS.delete}
                              </span>
                            ) : (
                              <img 
                                src={ICONS.delete}
                                alt="Delete"
                                className="action-icon"
                                onError={() => handleIconError('delete')}
                              />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;