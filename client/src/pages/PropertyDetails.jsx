import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PropertyDetails = () => {
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800");

  const sideImages = [
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=400",
    "https:////images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=400"
  ];

  const handleImageClick = (imageSrc) => {
    setMainImage(imageSrc);
  };

  return (
    <div className="property-details-container">
      <div className="details-gallery">
        <div className="main-gallery-box">
          <img 
            src={mainImage} 
            className="main-gallery-img" 
            id="details-main-img" 
            alt="Property Main" 
          />
        </div>
        <div className="side-gallery-grid">
          {sideImages.map((image, index) => (
            <img 
              key={index}
              src={image} 
              className="side-gallery-img" 
              alt={`Side View ${index + 1}`}
              onClick={() => handleImageClick(image)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>

      {/* Rest of your PropertyDetails component remains the same */}
      <div className="property-details-header">
        <div className="details-title-box">
          <h1 id="details-title">Villa Sundara</h1>
          <div className="details-location">
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="location-icon" alt="Location Icon" /> 
            <span id="details-loc">Suburban Area, Los Angeles</span>
          </div>
        </div>
        <div className="details-price-box">
          <span className="price-label">Price</span>
          <span className="details-price" id="details-price">$250,000</span>
        </div>
      </div>

      <div className="details-info-grid">
        <div className="details-description">
          <h2>Property Description</h2>
          <p>
            Crafted to inspire, the Seacliff Horizon Villa blends modern curves, warm lighting, and natural textures to create a living experience like no other. Every detail from the flowing architecture to the curated materials has been designed to elevate comfort, beauty, and functionality.
          </p>
          <h2>Property Details</h2>
          <div className="property-details-grid">
            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/3030/3030336.png" className="amenity-icon" alt="Bed Icon" />
              <span className="detail-text">4 Beds</span>
            </div>
            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/2950/2950901.png" className="amenity-icon" alt="Bath Icon" />
              <span className="detail-text">3 Bath</span>
            </div>
            <div className="detail-item">
              <img src="/images/setsquare.png" className="amenity-icon" alt="Area Icon" onError={(e) => {
                e.target.src = "https://cdn-icons-png.flaticon.com/512/10573/10573516.png";
              }} />
              <span className="detail-text">500 sq.m</span>
            </div>

            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/2324/2324151.png" className="amenity-icon" alt="Floor Icon" />
              <span className="detail-text">2 Floors</span>
            </div>
            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/3408/3408545.png" className="amenity-icon" alt="Parking Icon" />
              <span className="detail-text">2 Parking</span>
            </div>
            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/3703/3703259.png" className="amenity-icon" alt="Year Icon" />
              <span className="detail-text">Built 2023</span>
            </div>
          </div>
        </div>

        <div className="inquiry-side">
          <div className="inquiry-card">
            <h3>Interested in this property?</h3>
            <button className="inquiry-btn" onClick={() => { navigate('/contact'); window.scrollTo(0, 0); }}>Request More Info</button>
            <button className="filter-reset-btn" onClick={() => { navigate('/properties'); window.scrollTo(0, 0); }}>Back to Listings</button>
          </div>

          <div className="location-card">
            <div className="location-map">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106316.31508210459!2d-118.3411033!3d34.020479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000" 
                allowFullScreen="" 
                loading="lazy"
                title="Property Location"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;