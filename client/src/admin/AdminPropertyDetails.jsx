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
  const [uploadProgress, setUploadProgress] = useState("");
  
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
      // Check file size (warn if over 50MB, reject if over 200MB)
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > 200) {
        alert(`File too large (${fileSizeMB.toFixed(2)}MB). Please use a video under 200MB. Consider compressing your video.`);
        e.target.value = '';
        return;
      }
      
      if (fileSizeMB > 50) {
        const proceed = window.confirm(
          `Large video detected (${fileSizeMB.toFixed(2)}MB).\n\n` +
          `Upload may take 5-10 minutes.\n\n` +
          `For faster uploads, consider compressing your video to under 50MB.\n\n` +
          `Continue with upload?`
        );
        
        if (!proceed) {
          e.target.value = '';
          return;
        }
      }
      
      setMainMedia(file);
      setExistingMainMedia(null); // Clear existing when new file is selected
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setMainMediaPreview({
        url: previewUrl,
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name,
        size: fileSizeMB.toFixed(2)
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
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      alert('Only image files are allowed in gallery!');
    }
    
    setGallery(prevGallery => [...prevGallery, ...validFiles]);
  };

  const removeGalleryImage = (index) => {
    setGallery(prevGallery => prevGallery.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index) => {
    setExistingGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handlePropertyImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      alert('Only image files are allowed!');
    }
    
    setPropertyImages(prevImages => [...prevImages, ...validFiles]);
  };

  const removePropertyImage = (index) => {
    setPropertyImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const removeExistingPropertyImage = (index) => {
    setExistingPropertyImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    const trimmed = newAmenity.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities([...amenities, trimmed]);
      setNewAmenity("");
    } else if (amenities.includes(trimmed)) {
      alert("This amenity has already been added!");
    }
  };

  const removeAmenity = (index) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPropertyId) {
      setErrorMessage("Please select a property first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setUploadProgress("Preparing upload...");

    try {
      const formData = new FormData();
      formData.append("propertyId", selectedPropertyId);
      formData.append("description", description);
      formData.append("mapUrl", mapUrl);
      
      // Send amenities as JSON array
      formData.append("amenities", JSON.stringify(amenities));

      // Send existing property images so backend knows to keep them
      const existingImagesData = existingPropertyImages.map(img => ({
        url: img.url,
        label: img.label
      }));
      formData.append("existingPropertyImages", JSON.stringify(existingImagesData));

      if (mainMedia) {
        const fileSizeMB = mainMedia.size / (1024 * 1024);
        setUploadProgress(`Uploading video (${fileSizeMB.toFixed(2)}MB)... This may take several minutes...`);
        formData.append("mainMedia", mainMedia);
      }

      gallery.forEach(file => {
        formData.append("gallery", file);
      });

      propertyImages.forEach(file => {
        formData.append("constructionProgress", file);
      });

      if (gallery.length > 0) {
        setUploadProgress(`Uploading ${gallery.length} gallery images...`);
      }

      if (propertyImages.length > 0) {
        setUploadProgress(`Uploading ${propertyImages.length} property images...`);
      }

      setUploadProgress("Saving to server...");

      const response = await fetch("/api/admin/property-details", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || errorData.suggestion || "Failed to save property details");
      }

      const result = await response.json();
      
      setUploadProgress("");
      alert("Property details saved successfully!");
      
      // Refresh saved details
      await fetchPropertyDetails(selectedPropertyId);
      
      // Clear form
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
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
    } catch (error) {
      console.error("Submit error:", error);
      setErrorMessage(error.message || "An error occurred while saving");
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter properties based on search
  const filteredProperties = properties.filter(prop => 
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.locationText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePropertySelect = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setSearchTerm(properties.find(p => p._id === propertyId)?.title || "");
    setIsDropdownOpen(false);
    
    // Clear form when selecting a new property
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
    setErrorMessage("");
  };

  return (
    <div className="admin-property-details">
      <h2>Property Details Management</h2>

      {/* Property Selection */}
      <div className="property-select-section">
        <label htmlFor="propertySelect">Select Property *</label>
        <div className="searchable-select-container">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="searchable-input"
          />
          
          {isDropdownOpen && (
            <div className="searchable-dropdown">
              {filteredProperties.length > 0 ? (
                filteredProperties.map(prop => (
                  <div
                    key={prop._id}
                    className={`dropdown-item ${selectedPropertyId === prop._id ? 'selected' : ''}`}
                    onClick={() => handlePropertySelect(prop._id)}
                  >
                    <div className="dropdown-item-title">{prop.title}</div>
                    <div className="dropdown-item-location">{prop.locationText}</div>
                  </div>
                ))
              ) : (
                <div className="dropdown-item disabled">No properties found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress Indicator */}
      {uploadProgress && (
        <div className="upload-progress-banner">
          <div className="progress-spinner"></div>
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Form - only show if property is selected */}
      {selectedPropertyId && (
        <form onSubmit={onSubmit} className="details-form">
          <div className="form-columns">
            {/* LEFT COLUMN */}
            <div className="form-column">
              {/* MAIN MEDIA (VIDEO OR IMAGE) */}
              <div className="form-group">
                <label htmlFor="mainMediaInput">Main Media (Video or Hero Image)</label>
                <p className="field-description">
                  Upload a video or image for the main display. Videos should be under 50MB for best performance (max 200MB).
                </p>
                
                {/* Show existing main media */}
                {existingMainMedia && !mainMediaPreview && (
                  <div className="existing-media-preview">
                    <p className="preview-title">Current Media:</p>
                    <div className="media-preview-container">
                      {existingMainMedia.type === 'video' ? (
                        <video src={existingMainMedia.url} controls className="preview-media" />
                      ) : (
                        <img src={existingMainMedia.url} alt="Main media" className="preview-media" />
                      )}
                      <p className="media-name">{existingMainMedia.name}</p>
                      <button
                        type="button"
                        className="remove-media-btn"
                        onClick={removeMainMedia}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <p className="file-info">Upload a new file to replace this.</p>
                  </div>
                )}
                
                {/* Show new media preview */}
                {mainMediaPreview && (
                  <div className="new-media-preview">
                    <p className="preview-title">New Media ({mainMediaPreview.size}MB):</p>
                    <div className="media-preview-container">
                      {mainMediaPreview.type === 'video' ? (
                        <video src={mainMediaPreview.url} controls className="preview-media" />
                      ) : (
                        <img src={mainMediaPreview.url} alt="New media" className="preview-media" />
                      )}
                      <p className="media-name">{mainMediaPreview.name}</p>
                      <button
                        type="button"
                        className="remove-media-btn"
                        onClick={removeMainMedia}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  id="mainMediaInput"
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleMainMediaChange}
                  disabled={isSubmitting}
                />
                <p className="file-hint">
                  Recommended: Videos under 50MB, MP4 format. Images: JPG, PNG, WebP
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label htmlFor="description">Property Description *</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed property description..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* MAP URL */}
              <div className="form-group">
                <label htmlFor="mapUrl">Map Embed URL</label>
                <p className="field-description">
                  Paste the embed URL from Google Maps (Share → Embed a map)
                </p>
                <input
                  id="mapUrl"
                  type="text"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="form-column">
              {/* GALLERY IMAGES */}
              <div className="form-group">
                <label htmlFor="gallery">Side Gallery Images (Max 4 will show)</label>
                <p className="field-description">
                  Upload images for the side gallery. Up to 4 images will be displayed.
                </p>
                
                {/* Show existing gallery */}
                {existingGallery.length > 0 && (
                  <div className="existing-images-preview">
                    <p className="preview-title">Current Gallery ({existingGallery.length}):</p>
                    <div className="images-grid">
                      {existingGallery.map((img, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={img.url} alt={`Gallery ${index + 1}`} className="preview-thumbnail" />
                          <span className="image-label">{img.name}</span>
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeExistingGalleryImage(index)}
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
                  <div className="selected-images-preview">
                    <p className="preview-title">New Gallery Images ({gallery.length}):</p>
                    <div className="images-grid">
                      {gallery.map((file, index) => (
                        <div key={index} className="image-preview-item">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Gallery ${index + 1}`}
                            className="preview-thumbnail"
                          />
                          <span className="image-label">{file.name}</span>
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeGalleryImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  id="gallery"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  disabled={isSubmitting}
                />
              </div>

              {/* PROPERTY IMAGES (CAROUSEL) */}
              <div className="form-group">
                <label htmlFor="propertyImages">Property Images (3D Carousel)</label>
                <p className="field-description">
                  Upload images that will appear in a 3D carousel on the property details page.
                </p>
                
                {/* Show existing property images */}
                {existingPropertyImages.length > 0 && (
                  <div className="existing-images-preview">
                    <p className="preview-title">Current Property Images ({existingPropertyImages.length}):</p>
                    <div className="images-grid">
                      {existingPropertyImages.map((img, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={img.url} alt={img.label} className="preview-thumbnail" />
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

                <input
                  id="propertyImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePropertyImagesChange}
                  disabled={isSubmitting}
                />
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
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="add-amenity-btn"
                    disabled={isSubmitting}
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
                            disabled={isSubmitting}
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