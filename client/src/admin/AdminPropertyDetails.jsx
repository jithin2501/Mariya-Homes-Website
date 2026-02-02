import React, { useState, useEffect } from "react";
import "./styles/AdminPropertyDetails.css";

const AdminPropertyDetails = () => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [description, setDescription] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [mainMedia, setMainMedia] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [propertyImages, setPropertyImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Amenities state
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/properties")
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error("Error fetching properties:", err));
  }, []);

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      setErrorMessage("⚠️ Maximum 4 gallery images allowed!");
      setGallery([]);
      e.target.value = "";
      setTimeout(() => setErrorMessage(""), 3000);
    } else {
      setErrorMessage("");
      setGallery(files);
    }
  };

  const handlePropertyImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setPropertyImages(files);
  };

  // Amenities handlers
  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (gallery.length > 4) {
      alert("Cannot submit more than 4 gallery images!");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("propertyId", selectedPropertyId);
      data.append("description", description);
      data.append("mapUrl", mapUrl);
      data.append("amenities", JSON.stringify(amenities)); // Add amenities
      if (mainMedia) data.append("mainMedia", mainMedia);
      gallery.forEach(file => data.append("gallery", file));

      // Append all property images at once
      propertyImages.forEach((image) => {
        data.append('constructionProgress', image);
        data.append('constructionLabels', ''); // Empty label, will be auto-generated
      });

      // DEBUGGING - Check what's being submitted
      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("Property ID:", selectedPropertyId);
      console.log("Amenities state:", amenities);
      console.log("Amenities count:", amenities.length);
      console.log("Amenities JSON:", JSON.stringify(amenities));
      console.log("FormData amenities:", data.get("amenities"));
      console.log("============================");

      console.log("Submitting form data...");
      console.log("Property images count:", propertyImages.length);

      const res = await fetch("http://localhost:5000/api/admin/property-details", {
        method: "POST",
        body: data
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log("=== SUCCESS RESPONSE ===");
        console.log("Full response:", result);
        console.log("Amenities in response:", result.amenities);
        console.log("=======================");
        alert("Details saved successfully!");
        
        // Reset form
        setDescription("");
        setMapUrl("");
        setMainMedia(null);
        setGallery([]);
        setPropertyImages([]);
        setSelectedPropertyId("");
        setAmenities([]); // Reset amenities
        
        // Reset file inputs
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        alert(`Error: ${errorData.error || 'Failed to save details'}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Network error: Unable to connect to server");
    } finally {
      setIsSubmitting(false);
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

            {/* PROPERTY IMAGES SECTION - Multi Upload */}
            <div className="property-images-section">
              <label>Property Images (Carousel)</label>
              <p className="section-description">
                Upload multiple images at once. They will appear in the 3D carousel on the property page.
              </p>
              
              <div className="multi-image-upload">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handlePropertyImagesChange}
                  className="multi-file-input"
                  id="propertyImagesInput"
                />
                <label htmlFor="propertyImagesInput" className="upload-button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                  </svg>
                  <span>Choose Images</span>
                </label>
              </div>

              {propertyImages.length > 0 && (
                <div className="selected-images-preview">
                  <p className="preview-title">Selected Images ({propertyImages.length}):</p>
                  <div className="images-grid">
                    {propertyImages.map((file, index) => (
                      <div key={index} className="image-preview-item">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index + 1}`}
                          className="preview-thumbnail"
                        />
                        <span className="image-number">{index + 1}</span>
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            setPropertyImages(propertyImages.filter((_, i) => i !== index));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AMENITIES SECTION */}
            <div className="amenities-section">
              <label>Property Amenities</label>
              <p className="section-description">
                Add custom amenities that will display in a grid (e.g., visiting room, dining area, hall, kitchen).
              </p>
              
              <div className="amenity-input-group">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAmenity();
                    }
                  }}
                  placeholder="Enter amenity name (e.g., visiting room)"
                  className="amenity-input"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="add-amenity-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Add
                </button>
              </div>

              {amenities.length > 0 && (
                <div className="amenities-list">
                  <p className="amenities-count">{amenities.length} amenities added:</p>
                  <div className="amenities-grid">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="amenity-tag">
                        <span>{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="remove-amenity-btn"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Details"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminPropertyDetails;