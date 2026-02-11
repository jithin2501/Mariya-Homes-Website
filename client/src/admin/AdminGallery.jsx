import React, { useState, useEffect } from 'react';
import './styles/AdminGallery.css';

const AdminGallery = () => {
  const [constructionImages, setConstructionImages] = useState([]);
  const [renovationImages, setRenovationImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Construction form state
  const [constructionFiles, setConstructionFiles] = useState([]);
  const [constructionPreviews, setConstructionPreviews] = useState([]);
  const [constructionTexts, setConstructionTexts] = useState([]);
  const [constructionUploading, setConstructionUploading] = useState(false);

  // Renovation form state
  const [renovationFiles, setRenovationFiles] = useState([]);
  const [renovationPreviews, setRenovationPreviews] = useState([]);
  const [renovationTexts, setRenovationTexts] = useState([]);
  const [renovationUploading, setRenovationUploading] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      
      setConstructionImages(data.filter(item => item.type === 'construction'));
      setRenovationImages(data.filter(item => item.type === 'renovation'));
    } catch (error) {
      console.error('Error fetching galleries:', error);
      alert('Error loading gallery images');
    } finally {
      setLoading(false);
    }
  };

  // Handle multiple image selection for Construction
  const handleConstructionImageChange = (e) => {
    const files = Array.from(e.target.files);
    setConstructionFiles(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setConstructionPreviews(previews);

    // Initialize text fields for each image
    setConstructionTexts(files.map(() => ''));
  };

  // Handle multiple image selection for Renovation
  const handleRenovationImageChange = (e) => {
    const files = Array.from(e.target.files);
    setRenovationFiles(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setRenovationPreviews(previews);

    // Initialize text fields for each image
    setRenovationTexts(files.map(() => ''));
  };

  // Update text for a specific image
  const updateConstructionText = (index, value) => {
    const newTexts = [...constructionTexts];
    newTexts[index] = value;
    setConstructionTexts(newTexts);
  };

  const updateRenovationText = (index, value) => {
    const newTexts = [...renovationTexts];
    newTexts[index] = value;
    setRenovationTexts(newTexts);
  };

  // Remove a selected image
  const removeConstructionImage = (index) => {
    const newFiles = constructionFiles.filter((_, i) => i !== index);
    const newPreviews = constructionPreviews.filter((_, i) => i !== index);
    const newTexts = constructionTexts.filter((_, i) => i !== index);
    
    setConstructionFiles(newFiles);
    setConstructionPreviews(newPreviews);
    setConstructionTexts(newTexts);
  };

  const removeRenovationImage = (index) => {
    const newFiles = renovationFiles.filter((_, i) => i !== index);
    const newPreviews = renovationPreviews.filter((_, i) => i !== index);
    const newTexts = renovationTexts.filter((_, i) => i !== index);
    
    setRenovationFiles(newFiles);
    setRenovationPreviews(newPreviews);
    setRenovationTexts(newTexts);
  };

  // Upload Construction Images to Cloudinary
  const handleConstructionUpload = async () => {
    if (constructionFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setConstructionUploading(true);

    try {
      // Get the current max order
      const maxOrder = constructionImages.length > 0 
        ? Math.max(...constructionImages.map(img => img.order)) 
        : -1;

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < constructionFiles.length; i++) {
        const file = constructionFiles[i];
        const title = constructionTexts[i] || `Construction Image ${i + 1}`;

        try {
          // Upload image to Cloudinary
          const formData = new FormData();
          formData.append('image', file);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }

          const uploadData = await uploadResponse.json();

          // Create gallery item in database
          const galleryResponse = await fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'construction',
              title: title,
              description: '',
              image: uploadData.imageUrl,
              order: maxOrder + i + 1
            })
          });

          if (!galleryResponse.ok) {
            throw new Error('Failed to save gallery item');
          }

          successCount++;
        } catch (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} construction image(s)${errorCount > 0 ? `. ${errorCount} failed.` : '!'}`);
        
        // Reset form
        setConstructionFiles([]);
        setConstructionPreviews([]);
        setConstructionTexts([]);
        
        // Refresh gallery
        fetchGalleries();
      } else {
        alert('Failed to upload images. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading construction images:', error);
      alert('Failed to upload images. Please check your connection and try again.');
    } finally {
      setConstructionUploading(false);
    }
  };

  // Upload Renovation Images to Cloudinary
  const handleRenovationUpload = async () => {
    if (renovationFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setRenovationUploading(true);

    try {
      // Get the current max order
      const maxOrder = renovationImages.length > 0 
        ? Math.max(...renovationImages.map(img => img.order)) 
        : -1;

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < renovationFiles.length; i++) {
        const file = renovationFiles[i];
        const title = renovationTexts[i] || `Renovation Image ${i + 1}`;

        try {
          // Upload image to Cloudinary
          const formData = new FormData();
          formData.append('image', file);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }

          const uploadData = await uploadResponse.json();

          // Create gallery item in database
          const galleryResponse = await fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'renovation',
              title: title,
              description: '',
              image: uploadData.imageUrl,
              order: maxOrder + i + 1
            })
          });

          if (!galleryResponse.ok) {
            throw new Error('Failed to save gallery item');
          }

          successCount++;
        } catch (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} renovation image(s)${errorCount > 0 ? `. ${errorCount} failed.` : '!'}`);
        
        // Reset form
        setRenovationFiles([]);
        setRenovationPreviews([]);
        setRenovationTexts([]);
        
        // Refresh gallery
        fetchGalleries();
      } else {
        alert('Failed to upload images. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading renovation images:', error);
      alert('Failed to upload images. Please check your connection and try again.');
    } finally {
      setRenovationUploading(false);
    }
  };

  // Delete existing gallery item
  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item? This will also delete the image from Cloudinary.')) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Gallery item deleted successfully!');
        fetchGalleries();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Failed to delete gallery item. Please try again.');
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-gallery-container">
      {/* Header matching CONFIGURE PROPERTY DETAILS style */}
      <div className="gallery-page-header">
        <h1>GALLERY MANAGEMENT</h1>
      </div>

      <div className="gallery-columns-container">
        {/* LEFT COLUMN - CONSTRUCTION GALLERY */}
        <div className="gallery-column construction-column">
          <div className="gallery-section-header">
            <h2>Construction Gallery</h2>
            <span className="image-count-badge">{constructionImages.length} images</span>
          </div>

          <div className="upload-controls">
            <input
              type="file"
              id="construction-upload"
              multiple
              accept="image/*"
              onChange={handleConstructionImageChange}
              style={{ display: 'none' }}
              disabled={constructionUploading}
            />
            <label 
              htmlFor="construction-upload" 
              className={`upload-button-primary ${constructionUploading ? 'disabled' : ''}`}
            >
              Choose Images
            </label>
          </div>

          {constructionPreviews.length > 0 && (
            <div className="selected-images-section">
              <h3>Selected Images ({constructionPreviews.length}):</h3>
              <div className="image-preview-grid">
                {constructionPreviews.map((preview, index) => (
                  <div key={index} className="preview-card">
                    <button 
                      className="remove-image-btn"
                      onClick={() => removeConstructionImage(index)}
                      title="Remove image"
                      disabled={constructionUploading}
                    >
                      ×
                    </button>
                    <div className="preview-image-wrapper">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter image title/description"
                      value={constructionTexts[index]}
                      onChange={(e) => updateConstructionText(index, e.target.value)}
                      className="preview-text-input"
                      disabled={constructionUploading}
                    />
                  </div>
                ))}
              </div>
              <button 
                className="upload-action-btn construction-action-btn"
                onClick={handleConstructionUpload}
                disabled={constructionUploading}
              >
                {constructionUploading ? 'Uploading to Cloudinary...' : 'Upload All Construction Images'}
              </button>
            </div>
          )}

          {/* Existing Construction Images */}
          {constructionImages.length > 0 && (
            <div className="existing-images-section">
              <h3>Current Construction Images ({constructionImages.length})</h3>
              <div className="existing-images-grid">
                {constructionImages.map((item) => (
                  <div key={item._id} className="existing-image-card">
                    <button 
                      className="delete-cross-btn"
                      onClick={() => handleDelete(item._id, 'construction')}
                      title="Delete image"
                    >
                      ×
                    </button>
                    <img src={item.image} alt={item.title} />
                    <div className="existing-image-info">
                      <h4>{item.title}</h4>
                      <span className="image-order-badge">Order: {item.order}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - RENOVATION GALLERY */}
        <div className="gallery-column renovation-column">
          <div className="gallery-section-header">
            <h2>Renovation Gallery</h2>
            <span className="image-count-badge">{renovationImages.length} images</span>
          </div>

          <div className="upload-controls">
            <input
              type="file"
              id="renovation-upload"
              multiple
              accept="image/*"
              onChange={handleRenovationImageChange}
              style={{ display: 'none' }}
              disabled={renovationUploading}
            />
            <label 
              htmlFor="renovation-upload" 
              className={`upload-button-primary ${renovationUploading ? 'disabled' : ''}`}
            >
              Choose Images
            </label>
          </div>

          {renovationPreviews.length > 0 && (
            <div className="selected-images-section">
              <h3>Selected Images ({renovationPreviews.length}):</h3>
              <div className="image-preview-grid">
                {renovationPreviews.map((preview, index) => (
                  <div key={index} className="preview-card">
                    <button 
                      className="remove-image-btn"
                      onClick={() => removeRenovationImage(index)}
                      title="Remove image"
                      disabled={renovationUploading}
                    >
                      ×
                    </button>
                    <div className="preview-image-wrapper">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter image title/description"
                      value={renovationTexts[index]}
                      onChange={(e) => updateRenovationText(index, e.target.value)}
                      className="preview-text-input"
                      disabled={renovationUploading}
                    />
                  </div>
                ))}
              </div>
              <button 
                className="upload-action-btn renovation-action-btn"
                onClick={handleRenovationUpload}
                disabled={renovationUploading}
              >
                {renovationUploading ? 'Uploading to Cloudinary...' : 'Upload All Renovation Images'}
              </button>
            </div>
          )}

          {/* Existing Renovation Images */}
          {renovationImages.length > 0 && (
            <div className="existing-images-section">
              <h3>Current Renovation Images ({renovationImages.length})</h3>
              <div className="existing-images-grid">
                {renovationImages.map((item) => (
                  <div key={item._id} className="existing-image-card">
                    <button 
                      className="delete-cross-btn"
                      onClick={() => handleDelete(item._id, 'renovation')}
                      title="Delete image"
                    >
                      ×
                    </button>
                    <img src={item.image} alt={item.title} />
                    <div className="existing-image-info">
                      <h4>{item.title}</h4>
                      <span className="image-order-badge">Order: {item.order}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;