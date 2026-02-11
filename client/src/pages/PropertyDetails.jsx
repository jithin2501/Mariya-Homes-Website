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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [originalVideo, setOriginalVideo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const propRes = await fetch(`/api/admin/properties/${id}`);
        if (!propRes.ok) throw new Error("Property not found");
        const propData = await propRes.json();
        setPropertyData(propData);

        const detailRes = await fetch(`/api/admin/property-details/${id}`);
        
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setDetails(detailData);
          const media = detailData.mainMedia || propData.image;
          setMainMedia(media);
          // Store original video URL if it's a video
          if (isVideo(media)) {
            setOriginalVideo(media);
          }
        } else {
          console.log("No property details found for this property");
          const media = propData.image;
          setMainMedia(media);
          if (isVideo(media)) {
            setOriginalVideo(media);
          }
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

  const enterFullscreen = (videoElement) => {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) {
      videoElement.msRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleCloseImage = () => {
    // Return to original video if available, otherwise keep current media
    if (originalVideo) {
      setMainMedia(originalVideo);
    }
  };

  const nextSlide = () => {
    if (details?.constructionProgress?.length > 0) {
      setCurrentSlide((prev) => 
        prev === details.constructionProgress.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevSlide = () => {
    if (details?.constructionProgress?.length > 0) {
      setCurrentSlide((prev) => 
        prev === 0 ? details.constructionProgress.length - 1 : prev - 1
      );
    }
  };

  const getSlidePosition = (index) => {
    const total = details?.constructionProgress?.length || 0;
    if (total === 0) return '';
    
    const diff = index - currentSlide;
    
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(total - 1)) return 'right';
    if (diff === -1 || diff === total - 1) return 'left';
    return 'hidden';
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
                  enterFullscreen(video);
                }}
                title="Enter Fullscreen"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
              {isFullscreen && (
                <button 
                  className="exit-fullscreen-btn"
                  onClick={exitFullscreen}
                  title="Exit Fullscreen"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="image-wrapper">
              <img src={mainMedia} className="main-gallery-img" alt="Selected View" />
              {/* Show close button only if we're viewing a side image (not the original video) */}
              {originalVideo && mainMedia !== originalVideo && (
                <button 
                  className="close-image-btn"
                  onClick={handleCloseImage}
                  title="Close Image"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
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
          
          {/* Property Features Section - White background with 3-column grid */}
          {details?.amenities && Array.isArray(details.amenities) && details.amenities.length > 0 && (
            <div className="property-features-section">
              <h2>Property Features</h2>
              <div className="property-features-grid">
                {details.amenities.map((amenity, index) => (
                  <div key={index} className="property-feature-item">
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* 3D Property Images Carousel */}
      {details?.constructionProgress && details.constructionProgress.length > 0 && (
        <div className="construction-progress-section">
          <h2>Property Images</h2>
          <div className="carousel-3d-wrapper">
            <button className="carousel-btn-3d prev-btn" onClick={prevSlide}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <div className="carousel-3d-container">
              {details.constructionProgress.map((item, index) => (
                <div
                  key={index}
                  className={`carousel-3d-slide ${getSlidePosition(index)}`}
                  onClick={() => {
                    if (getSlidePosition(index) === 'left') prevSlide();
                    if (getSlidePosition(index) === 'right') nextSlide();
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={`Property view ${index + 1}`} 
                    className="carousel-3d-image" 
                  />
                </div>
              ))}
            </div>

            <button className="carousel-btn-3d next-btn" onClick={nextSlide}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {details.constructionProgress.map((_, index) => (
              <button
                key={index}
                className={`indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;