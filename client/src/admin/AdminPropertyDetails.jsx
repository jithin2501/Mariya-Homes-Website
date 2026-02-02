import React, { useState, useEffect } from "react";
import "./styles/AdminPropertyDetails.css";

const AdminPropertyDetails = () => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [description, setDescription] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [mainMedia, setMainMedia] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/properties")
      .then(res => res.json())
      .then(data => setProperties(data));
  }, []);

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      setErrorMessage("⚠️ Maximum 4 gallery images allowed!");
      setGallery([]);
      e.target.value = ""; // Reset file input
      setTimeout(() => setErrorMessage(""), 3000); // Clear message after 3 seconds
    } else {
      setErrorMessage("");
      setGallery(files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check gallery limit before submission
    if (gallery.length > 4) {
      alert("Cannot submit more than 4 gallery images!");
      return;
    }

    const data = new FormData();
    data.append("propertyId", selectedPropertyId);
    data.append("description", description);
    data.append("mapUrl", mapUrl);
    if (mainMedia) data.append("mainMedia", mainMedia);
    gallery.forEach(file => data.append("gallery", file));

    const res = await fetch("http://localhost:5000/api/admin/property-details", {
      method: "POST",
      body: data
    });
    
    if (res.ok) {
      alert("Details saved successfully!");
      // Reset form
      setDescription("");
      setMapUrl("");
      setMainMedia(null);
      setGallery([]);
      setSelectedPropertyId("");
    }
  };

  return (
    <div className="admin-props-container">
      <h2>Configure Property Details</h2>
      <select 
        onChange={(e) => setSelectedPropertyId(e.target.value)} 
        className="admin-select"
        value={selectedPropertyId}
      >
        <option value="">-- Choose a Property --</option>
        {properties.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
      </select>

      {selectedPropertyId && (
        <form onSubmit={handleSubmit} className="admin-details-split">
          <div className="left-side-upload">
            <label>Big Box Media (Video or Image)</label>
            <input 
              type="file" 
              accept="image/*,video/*"
              onChange={e => setMainMedia(e.target.files[0])} 
            />
            {mainMedia && (
              <p className="file-info">Selected: {mainMedia.name}</p>
            )}
          </div>

          <div className="right-side-config">
            <label>Property Description</label>
            <textarea 
              className="admin-textarea"
              placeholder="Enter description..." 
              value={description}
              onChange={e => setDescription(e.target.value)} 
              required
            />

            <label>Google Maps Iframe URL</label>
            <input 
              type="text" 
              placeholder="Paste map src URL..." 
              value={mapUrl}
              onChange={e => setMapUrl(e.target.value)} 
            />

            <div className="gallery-upload-group">
              <label>Gallery Images (Maximum 4 images)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleGalleryChange}
                max="4"
              />
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              {gallery.length > 0 && (
                <p className="file-info">
                  {gallery.length} image{gallery.length > 1 ? 's' : ''} selected 
                  {gallery.length < 4 && ` (${4 - gallery.length} more allowed)`}
                </p>
              )}
            </div>

            <button type="submit">Update Details</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminPropertyDetails;