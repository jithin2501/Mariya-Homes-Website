import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles/PropertyDetails.css";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [propertyData, setPropertyData] = useState(null);
  const [details, setDetails] = useState(null);
  const [mainMedia, setMainMedia] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const propRes = await fetch(`http://localhost:5000/api/admin/properties/${id}`);
        if (!propRes.ok) throw new Error("Property not found");
        const propData = await propRes.json();
        setPropertyData(propData);

        const detailRes = await fetch(`http://localhost:5000/api/admin/property-details/${id}`);
        
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setDetails(detailData);
          setMainMedia(detailData.mainMedia || propData.image);
        } else {
          setMainMedia(propData.image);
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isVideo = (url) => {
    return url && url.match(/\.(mp4|webm|ogg)$/i);
  };

  const toggleFullscreen = (videoElement) => {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) {
      videoElement.msRequestFullscreen();
    }
  };

  if (loading) return <div className="loader">Loading Property...</div>;
  if (!propertyData) return <div className="error">Property not found.</div>;

  return (
    <div className="property-details-container">
      <div className="details-gallery">
        <div className="main-gallery-box">
          {isVideo(mainMedia) ? (
            <div className="video-wrapper">
              <video 
                id="property-video"
                src={mainMedia} 
                autoPlay 
                loop
                muted
                playsInline
                className="main-gallery-img"
              />
              <button 
                className="fullscreen-btn"
                onClick={() => {
                  const video = document.getElementById('property-video');
                  toggleFullscreen(video);
                }}
                title="Fullscreen"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>
          ) : (
            <img src={mainMedia} className="main-gallery-img" alt="Selected View" />
          )}
        </div>

        <div className="side-gallery-grid">
          {details?.gallery?.slice(0, 4).map((img, index) => (
            <div key={index} className="side-img-wrapper" onClick={() => setMainMedia(img)}>
              <img src={img} className="side-gallery-img" alt={`View ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="property-details-header">
        <div className="details-title-box">
          <h1>{propertyData.title}</h1>
          <div className="details-location">
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="location-icon" alt="Location" /> 
            <span>{propertyData.locationText}</span>
          </div>
        </div>
        <div className="details-price-box">
          <span className="price-label">Price</span>
          <span className="details-price">{propertyData.price}</span>
        </div>
      </div>

      <div className="details-info-grid">
        <div className="details-description">
          <h2>Property Description</h2>
          <p>{details?.description || "No description available."}</p>
          
          <h2>Property Details</h2>
          <div className="property-details-grid">
            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/3030/3030336.png" className="amenity-icon" alt="Bed" />
              <span className="detail-text">{propertyData.features?.bed} Beds</span>
            </div>
            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/2950/2950901.png" className="amenity-icon" alt="Bath" />
              <span className="detail-text">{propertyData.features?.bath} Bath</span>
            </div>
            <div className="detail-item">
              <img src="https://cdn-icons-png.flaticon.com/512/10573/10573516.png" className="amenity-icon" alt="Area" />
              <span className="detail-text">{propertyData.features?.sqft} sqft</span>
            </div>
          </div>
        </div>

        <div className="inquiry-side">
          <div className="inquiry-card">
            <h3>Interested?</h3>
            <button className="inquiry-btn" onClick={() => navigate('/contact')}>Request More Info</button>
            <button className="filter-reset-btn" onClick={() => navigate('/properties')}>Back to Listings</button>
          </div>
          <div className="location-card">
            <div className="location-map">
              {details?.mapUrl ? (
                <iframe src={details.mapUrl} allowFullScreen="" loading="lazy" title="Map" />
              ) : (
                <div className="no-map">Map not available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;