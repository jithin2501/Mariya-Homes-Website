import React, { useState, useEffect } from "react";
import "./styles/AdminProperties.css";
import AdminPropertyDetails from "./AdminPropertyDetails";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  // ── NEW: which property's detail page is open ──
  const [detailsPropertyId, setDetailsPropertyId] = useState(null);
  const [detailsPropertyTitle, setDetailsPropertyTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    locationText: "",
    price: "",
    category: "For Sale",
    bed: "",
    bath: "",
    sqft: ""
  });

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/admin/properties");
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (prop) => {
    setIsEditing(prop._id);
    setFormData({
      title: prop.title,
      locationText: prop.locationText,
      price: prop.price,
      category: prop.category,
      bed: prop.features.bed,
      bath: prop.features.bath,
      sqft: prop.features.sqft
    });
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    if (imageFile) data.append("image", imageFile);
    data.append("title", formData.title);
    data.append("locationText", formData.locationText);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append(
      "features",
      JSON.stringify({ bed: formData.bed, bath: formData.bath, sqft: formData.sqft })
    );

    const url = isEditing
      ? `/api/admin/properties/${isEditing}`
      : "/api/admin/properties";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        alert(isEditing ? "Property Updated!" : "Property Added!");
        setIsEditing(null);
        setFormData({
          title: "",
          locationText: "",
          price: "",
          category: "For Sale",
          bed: "",
          bath: "",
          sqft: ""
        });
        setImageFile(null);
        setPreviewUrl(null);
        fetchProperties();
        e.target.reset();
      }
    } catch (error) {
      alert("Error saving property");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this property?")) {
      await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      fetchProperties();
    }
  };

  // ── If a "Manage Details" page is open, render it full-screen ──
  if (detailsPropertyId) {
    return (
      <AdminPropertyDetails
        propertyId={detailsPropertyId}
        propertyTitle={detailsPropertyTitle}
        onBack={() => {
          setDetailsPropertyId(null);
          setDetailsPropertyTitle("");
        }}
      />
    );
  }

  return (
    <div className="admin-props-container">
      <h2>{isEditing ? "Edit Property" : "Manage Properties"}</h2>

      <form className="admin-props-form" onSubmit={handleSubmit}>
        <div className="form-row-2">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.locationText}
            onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
            required
          />
        </div>

        <div className="form-row-2">
          <input
            type="text"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="For Sale">For Sale</option>
            <option value="Featured">Featured</option>
            <option value="New">New</option>
            <option value="Sold">Sold</option>
          </select>
        </div>

        <div className="form-row">
          <input
            type="number"
            placeholder="Beds"
            value={formData.bed}
            onChange={(e) => setFormData({ ...formData, bed: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Baths"
            value={formData.bath}
            onChange={(e) => setFormData({ ...formData, bath: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Sqft"
            value={formData.sqft}
            onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
            required
          />
        </div>

        <div className="file-input-group">
          <label>Property Image {isEditing && "(Leave blank to keep current)"}:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required={!isEditing}
          />
          {previewUrl && (
            <div className="image-preview-container">
              <p>New Image Selected:</p>
              <img src={previewUrl} alt="Preview" className="upload-preview-img" />
              <button
                type="button"
                className="remove-preview"
                onClick={() => { setPreviewUrl(null); setImageFile(null); }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="add-btn" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : isEditing ? (
              "Update Property"
            ) : (
              "Add Property"
            )}
          </button>
          {isEditing && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(null);
                setFormData({
                  title: "",
                  locationText: "",
                  price: "",
                  category: "For Sale",
                  bed: "",
                  bath: "",
                  sqft: ""
                });
                setPreviewUrl(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="props-list">
        {properties.map((prop) => (
          <div key={prop._id} className="prop-card-admin">
            <div className="admin-image-wrapper">
              <img src={prop.image} alt={prop.title} className="admin-prop-img-fixed" />
              <span
                className={`admin-badge ${prop.category.toLowerCase().replace(" ", "-")}`}
              >
                {prop.category}
              </span>
            </div>

            <div className="prop-info-admin">
              <div className="prop-text-content">
                <p className="admin-location-text">📍 {prop.locationText}</p>
                <h3 className="admin-prop-title">{prop.title}</h3>

                <div className="admin-feature-row">
                  <span>🛏️ {prop.features?.bed} Bed</span>
                  <span>🚿 {prop.features?.bath} Bath</span>
                  <span>📐 {prop.features?.sqft} Sqft</span>
                </div>

                <p className="admin-price-text">{prop.price}</p>
              </div>

              <div className="admin-actions">
                <button className="edit-btn" onClick={() => handleEditClick(prop)}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(prop._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
                {/* ── NEW BUTTON ── */}
                <button
                  className="details-btn"
                  onClick={() => {
                    setDetailsPropertyId(prop._id);
                    setDetailsPropertyTitle(prop.title);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Manage Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProperties;