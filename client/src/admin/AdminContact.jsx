import { useEffect, useState } from "react";
import "./styles/AdminContact.css";

const AdminContact = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all contact messages
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
    }
  };

  // View message details
  const handleView = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  // Delete contact message
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact message?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      // Remove instantly from UI
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      
      // If the deleted message was being viewed, close the modal
      if (selectedMessage && selectedMessage._id === id) {
        handleCloseModal();
      }
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
                    {msg.message.length > 50 
                      ? `${msg.message.substring(0, 50)}...` 
                      : msg.message}
                  </td>

                  <td className="date-cell">
                    {new Date(msg.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="action-cell">
                    <div className="action-buttons">
                      <button
                        className="admin-contact-view"
                        onClick={() => handleView(msg)}
                      >
                        View
                      </button>
                      <button
                        className="admin-contact-delete"
                        onClick={() => handleDelete(msg._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Viewing Message Details */}
      {showModal && selectedMessage && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>CONTACT MESSAGE DETAILS</h2>
              <button 
                className="admin-modal-close" 
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="message-details">
                <div className="detail-row">
                  <span className="detail-label">DATE:</span>
                  <span className="detail-value">
                    {new Date(selectedMessage.createdAt).toLocaleDateString("en-IN", {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}, {new Date(selectedMessage.createdAt).toLocaleTimeString("en-IN", {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedMessage.name}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedMessage.email}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Mobile:</span>
                  <span className="detail-value">{selectedMessage.phone || "Not provided"}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Subject:</span>
                  <span className="detail-value">Contact Form Submission</span>
                </div>

                <div className="message-divider"></div>

                <div className="message-content-section">
                  <h3>Message Content</h3>
                  <div className="message-content">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                className="admin-modal-close-btn"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminContact;