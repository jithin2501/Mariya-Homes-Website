import { useEffect, useState } from "react";
import "./styles/AdminContact.css";

const AdminContact = () => {
  const [messages, setMessages] = useState([]);

  // Fetch all contact messages
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
    }
  };

  // Delete contact message
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact message?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      // Remove instantly from UI
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error("Error deleting contact message:", error);
    }
  };

  return (
    <>
      <h1 className="admin-contact-title">
        CONTACT MESSAGES
      </h1>

      {messages.length === 0 ? (
        <div className="admin-contact-empty">
          No contact messages received yet.
        </div>
      ) : (
        <div className="admin-contact-card">
          <table className="admin-contact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Received On</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id}>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.phone || "—"}</td>

                  <td className="message-cell">
                    {msg.message}
                  </td>

                  <td className="date-cell">
                    {new Date(msg.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="action-cell">
                    <button
                      className="admin-contact-delete"
                      onClick={() => handleDelete(msg._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminContact;
