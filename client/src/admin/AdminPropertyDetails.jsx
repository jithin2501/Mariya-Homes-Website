import React, { useState, useEffect } from "react";
import "./styles/AdminPropertyDetails.css";

const AdminPropertyDetails = () => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [description, setDescription] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [mainMedia, setMainMedia] = useState(null);
  const [mainMediaPreview, setMainMediaPreview] = useState(null);
  const [existingMainMedia, setExistingMainMedia] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [propertyImages, setPropertyImages] = useState([]);
  const [existingPropertyImages, setExistingPropertyImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Amenities state
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");
  
  // Saved details state
  const [savedDetails, setSavedDetails] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Search/filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/properties")
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error("Error fetching properties:", err));
  }, []);

  // Fetch saved details when property is selected
  useEffect(() => {
    if (selectedPropertyId) {
      fetchPropertyDetails(selectedPropertyId);
    } else {
      setSavedDetails(null);
    }
  }, [selectedPropertyId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.querySelector('.searchable-select-container');
      if (container && !container.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPropertyDetails = async (propertyId) => {
    try {
      const res = await fetch(`/api/admin/property-details/${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedDetails(data);
        console.log("Loaded saved details:", data);
        
        // Set existing media for preview
        if (data.mainMedia) {
          setExistingMainMedia({
            url: data.mainMedia,
            type: data.mainMedia.includes('.mp4') || data.mainMedia.includes('.webm') ? 'video' : 'image',
            name: data.mainMedia.split('/').pop()
          });
        }
        
        if (data.gallery && data.gallery.length > 0) {
          setExistingGallery(data.gallery.map(url => ({
            url: url,
            name: url.split('/').pop()
          })));
        }
        
        if (data.constructionProgress && data.constructionProgress.length > 0) {
          setExistingPropertyImages(data.constructionProgress.map(item => ({
            url: item.image,
            name: item.image.split('/').pop(),
            label: item.label
          })));
        }
      } else {
        setSavedDetails(null);
        // Clear existing media when no details found
        setExistingMainMedia(null);
        setExistingGallery([]);
        setExistingPropertyImages([]);
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
      setSavedDetails(null);
      setExistingMainMedia(null);
      setExistingGallery([]);
      setExistingPropertyImages([]);
    }
  };

  const handleEdit = () => {
    if (savedDetails) {
      // Populate form with saved data
      setDescription(savedDetails.description || "");
      setMapUrl(savedDetails.mapUrl || "");
      setAmenities(savedDetails.amenities || []);
      
      // Set existing media for display
      if (savedDetails.mainMedia) {
        setExistingMainMedia({
          url: savedDetails.mainMedia,
          type: savedDetails.mainMedia.includes('.mp4') || savedDetails.mainMedia.includes('.webm') ? 'video' : 'image',
          name: savedDetails.mainMedia.split('/').pop()
        });
      }
      
      if (savedDetails.gallery && savedDetails.gallery.length > 0) {
        setExistingGallery(savedDetails.gallery.map(url => ({
          url: url,
          name: url.split('/').pop()
        })));
      }
      
      // FIXED: Properly set existing property images
      if (savedDetails.constructionProgress && savedDetails.constructionProgress.length > 0) {
        const propertyImages = savedDetails.constructionProgress.map((item, index) => {
          // Handle both object and string formats
          const imageUrl = item.image || item;
          const label = item.label || `Image ${index + 1}`;
          const name = imageUrl.split('/').pop();
          
          return {
            url: imageUrl,
            name: name,
            label: label
          };
        });
        setExistingPropertyImages(propertyImages);
        console.log("Loaded property images:", propertyImages);
      } else {
        setExistingPropertyImages([]);
      }
      
      setIsEditMode(true);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async () => {
    if (!savedDetails) return;
    
    if (window.confirm("Are you sure you want to delete these property details? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/admin/property-details/${savedDetails._id}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          alert("Property details deleted successfully!");
          setSavedDetails(null);
          // Clear all form data
          setDescription("");
          setMapUrl("");
          setMainMedia(null);
          setMainMediaPreview(null);
          setExistingMainMedia(null);
          setGallery([]);
          setExistingGallery([]);
          setPropertyImages([]);
          setExistingPropertyImages([]);
          setAmenities([]);
          setIsEditMode(false);
        } else {
          alert("Failed to delete property details");
        }
      } catch (error) {
        console.error("Error deleting property details:", error);
        alert("Error deleting property details");
      }
    }
  };

  const handleMainMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainMedia(file);
      setExistingMainMedia(null); // Clear existing when new file is selected
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setMainMediaPreview({
        url: previewUrl,
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name
      });
    }
  };

  const removeMainMedia = () => {
    setMainMedia(null);
    setMainMediaPreview(null);
    setExistingMainMedia(null);
    // Reset the file input
    const fileInput = document.getElementById('mainMediaInput');
    if (fileInput) fileInput.value = '';
  };

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
      setExistingGallery([]); // Clear existing when new files are selected
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setGallery(newGallery);
  };

  const removeExistingGalleryImage = (index) => {
    const newGallery = [...existingGallery];
    newGallery.splice(index, 1);
    setExistingGallery(newGallery);
  };

  const handlePropertyImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setPropertyImages(files);
  };

  const removePropertyImage = (index) => {
    const newImages = [...propertyImages];
    newImages.splice(index, 1);
    setPropertyImages(newImages);
  };

  const removeExistingPropertyImage = (index) => {
    console.log(`Removing existing property image at index ${index}`);
    const newImages = [...existingPropertyImages];
    newImages.splice(index, 1);
    setExistingPropertyImages(newImages);
    console.log(`After removal: ${newImages.length} images remaining`);
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

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle property selection
  const handlePropertySelect = (propertyId, propertyTitle) => {
    setSelectedPropertyId(propertyId);
    setSearchTerm(propertyTitle);
    setIsDropdownOpen(false);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPropertyId("");
    setSearchTerm("");
    setSavedDetails(null);
    setExistingMainMedia(null);
    setExistingGallery([]);
    setExistingPropertyImages([]);
    setIsEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check gallery limit (existing + new)
    const totalGalleryImages = (existingGallery?.length || 0) + gallery.length;
    if (totalGalleryImages > 4) {
      alert("Total gallery images cannot exceed 4! Please remove some images.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("propertyId", selectedPropertyId);
      data.append("description", description);
      data.append("mapUrl", mapUrl);
      data.append("amenities", JSON.stringify(amenities));
      
      // Append main media if new file is selected
      if (mainMedia) data.append("mainMedia", mainMedia);
      
      // Append gallery images if new files are selected
      gallery.forEach(file => data.append("gallery", file));
      
      // Append property images if new files are selected
      propertyImages.forEach((image) => {
        data.append('constructionProgress', image);
      });

      // IMPORTANT: Also send existing property images that haven't been removed
      // This ensures existing images are preserved
      const remainingExistingImages = existingPropertyImages.map(img => ({
        url: img.url,
        label: img.label
      }));
      
      if (remainingExistingImages.length > 0) {
        console.log("Preserving existing property images:", remainingExistingImages.length);
        data.append("existingPropertyImages", JSON.stringify(remainingExistingImages));
      }

      console.log("Submitting form data...");
      console.log("Before submit - existingPropertyImages:", existingPropertyImages);
      console.log("Before submit - propertyImages (new):", propertyImages);
      console.log("Main media:", mainMedia ? "New file" : "Using existing");
      console.log("Gallery images (new):", gallery.length);
      console.log("Gallery images (existing):", existingGallery.length);
      console.log("Property images (new):", propertyImages.length);
      console.log("Property images (existing):", existingPropertyImages.length);
      console.log("Remaining existing property images:", remainingExistingImages.length);

      const res = await fetch("/api/admin/property-details", {
        method: "POST",
        body: data
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log("After update - result.constructionProgress:", result.constructionProgress);
        alert(isEditMode ? "Details updated successfully!" : "Details saved successfully!");
        
        // Refresh saved details
        await fetchPropertyDetails(selectedPropertyId);
        
        // Reset only new files, keep existing ones
        setMainMedia(null);
        setMainMediaPreview(null);
        setGallery([]);
        setPropertyImages([]);
        // Keep amenities as they were
        setIsEditMode(false);
        
        // Reset file inputs
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
        
        // Scroll to preview
        setTimeout(() => {
          const preview = document.getElementById('saved-preview');
          if (preview) {
            preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
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
      
      {/* Searchable Property Selector */}
      <div className="searchable-select-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search and select a property..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          {selectedPropertyId && (
            <button
              className="clear-selection-btn"
              onClick={clearSelection}
              title="Clear selection"
            >
              ✕
            </button>
          )}
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>

        {/* Dropdown List */}
        {isDropdownOpen && (
          <div className="dropdown-list">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <div
                  key={property._id}
                  className={`dropdown-item ${selectedPropertyId === property._id ? 'selected' : ''}`}
                  onClick={() => handlePropertySelect(property._id, property.title)}
                >
                  <span className="property-title">{property.title}</span>
                  {selectedPropertyId === property._id && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="dropdown-item no-results">
                No properties found
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPropertyId && (
        <form onSubmit={handleSubmit} className="admin-details-split">
          <div className="admin-details-split-top">
            <div className="left-side-upload">
              <label>Big Box Media (Video or Image)</label>
              <input 
                id="mainMediaInput"
                type="file" 
                accept="image/*,video/*"
                onChange={handleMainMediaChange}
              />
              
              {/* Show existing media in edit mode */}
              {isEditMode && existingMainMedia && !mainMediaPreview && (
                <div className="media-preview-container">
                  <p className="preview-label">Current Media: {existingMainMedia.name}</p>
                  {existingMainMedia.type === 'video' ? (
                    <video 
                      src={existingMainMedia.url} 
                      className="media-preview"
                      controls
                    />
                  ) : (
                    <img 
                      src={existingMainMedia.url} 
                      alt="Current Media" 
                      className="media-preview"
                    />
                  )}
                  <p className="file-info">This is your current media. Upload a new file to replace it.</p>
                  <button
                    type="button"
                    onClick={removeMainMedia}
                    className="remove-media-btn"
                  >
                    Remove & Upload New
                  </button>
                </div>
              )}
              
              {/* Preview new selected media */}
              {mainMediaPreview && (
                <div className="media-preview-container">
                  <p className="preview-label">New Media: {mainMediaPreview.name}</p>
                  {mainMediaPreview.type === 'video' ? (
                    <video 
                      src={mainMediaPreview.url} 
                      className="media-preview"
                      controls
                    />
                  ) : (
                    <img 
                      src={mainMediaPreview.url} 
                      alt="Preview" 
                      className="media-preview"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeMainMedia}
                    className="remove-media-btn"
                  >
                    Remove
                  </button>
                </div>
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
                
                {/* Show existing gallery images in edit mode */}
                {isEditMode && existingGallery.length > 0 && (
                  <div className="existing-images-section">
                    <p className="file-info">Current Gallery Images ({existingGallery.length}):</p>
                    <div className="existing-images-grid">
                      {existingGallery.map((img, index) => (
                        <div key={index} className="existing-image-item">
                          <img src={img.url} alt={`Current ${index + 1}`} className="existing-image-preview" />
                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(index)}
                            className="remove-existing-btn"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="file-info">Upload new images to add to or replace these.</p>
                  </div>
                )}
                
                {/* Show new selected gallery images */}
                {gallery.length > 0 && (
                  <div className="new-images-section">
                    <p className="file-info">
                      New Images ({gallery.length}) selected 
                      {gallery.length < 4 && ` (${4 - (existingGallery.length + gallery.length)} more allowed)`}
                    </p>
                    <div className="new-images-grid">
                      {gallery.map((file, index) => (
                        <div key={index} className="new-image-item">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`New ${index + 1}`}
                            className="new-image-preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="remove-new-btn"
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
            </div>
          </div>

          {/* PROPERTY IMAGES AND AMENITIES SIDE BY SIDE */}
          <div className="bottom-split-section">
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

              {/* Show existing property images in edit mode */}
              {isEditMode && existingPropertyImages.length > 0 && (
                <div className="existing-property-images">
                  <p className="preview-title">Current Property Images ({existingPropertyImages.length}):</p>
                  <div className="images-grid">
                    {existingPropertyImages.map((img, index) => (
                      <div key={index} className="image-preview-item">
                        <img 
                          src={img.url} 
                          alt={img.label}
                          className="preview-thumbnail"
                        />
                        <span className="image-label">{img.label}</span>
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeExistingPropertyImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="file-info">Upload new images to add to or replace these.</p>
                </div>
              )}

              {/* Show new selected property images */}
              {propertyImages.length > 0 && (
                <div className="selected-images-preview">
                  <p className="preview-title">New Images ({propertyImages.length}):</p>
                  <div className="images-grid">
                    {propertyImages.map((file, index) => (
                      <div key={index} className="image-preview-item">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index + 1}`}
                          className="preview-thumbnail"
                        />
                        <span className="image-label">New Image {index + 1}</span>
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removePropertyImage(index)}
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
          </div>

          {/* SUBMIT BUTTON */}
          <div className="submit-button-container">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Details" : "Save Details")}
            </button>
          </div>
        </form>
      )}

      {/* SAVED DETAILS PREVIEW */}
      {savedDetails && !isEditMode && (
        <div id="saved-preview" className="saved-details-preview">
          <div className="preview-header">
            <h3>Saved Property Details</h3>
            <div className="preview-actions">
              <button onClick={handleEdit} className="edit-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit
              </button>
              <button onClick={handleDelete} className="delete-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete
              </button>
            </div>
          </div>

          <div className="preview-content">
            {/* Main Media Preview */}
            {savedDetails.mainMedia && (
              <div className="preview-section">
                <h4>Main Media</h4>
                <div className="preview-media-container">
                  {savedDetails.mainMedia.includes('.mp4') || savedDetails.mainMedia.includes('.webm') ? (
                    <video src={savedDetails.mainMedia} controls className="preview-media" />
                  ) : (
                    <img src={savedDetails.mainMedia} alt="Main media" className="preview-media" />
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {savedDetails.description && (
              <div className="preview-section">
                <h4>Description</h4>
                <p className="preview-text">{savedDetails.description}</p>
              </div>
            )}

            {/* Gallery */}
            {savedDetails.gallery && savedDetails.gallery.length > 0 && (
              <div className="preview-section">
                <h4>Gallery ({savedDetails.gallery.length} images)</h4>
                <div className="preview-gallery-grid">
                  {savedDetails.gallery.map((img, index) => (
                    <img key={index} src={img} alt={`Gallery ${index + 1}`} className="preview-gallery-img" />
                  ))}
                </div>
              </div>
            )}

            {/* Property Images (Carousel) */}
            {savedDetails.constructionProgress && savedDetails.constructionProgress.length > 0 && (
              <div className="preview-section">
                <h4>Property Images ({savedDetails.constructionProgress.length} images)</h4>
                <div className="preview-gallery-grid">
                  {savedDetails.constructionProgress.map((item, index) => (
                    <div key={index} className="preview-property-image">
                      <img src={item.image} alt={item.label} className="preview-gallery-img" />
                      <span className="preview-image-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {savedDetails.amenities && savedDetails.amenities.length > 0 && (
              <div className="preview-section">
                <h4>Amenities ({savedDetails.amenities.length})</h4>
                <div className="preview-amenities-grid">
                  {savedDetails.amenities.map((amenity, index) => (
                    <div key={index} className="preview-amenity-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map URL */}
            {savedDetails.mapUrl && (
              <div className="preview-section">
                <h4>Map Location</h4>
                <div className="preview-map">
                  <iframe
                    src={savedDetails.mapUrl}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyDetails;