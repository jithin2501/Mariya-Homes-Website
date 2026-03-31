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

  const isVideo = (url) => {
    return url && (
      url.includes('/video/') ||
      url.match(/\.(mp4|webm|ogg)$/i)
    );
  };

  // Preload an array of image URLs, resolves when all settle (load or error)
  const preloadImages = (urls) => {
    return Promise.all(
      urls.filter(Boolean).map(
        url =>
          new Promise((resolve) => {
            if (isVideo(url)) { resolve(); return; } // skip videos
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // don't hang on broken images
            img.src = url;
          })
      )
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const propRes = await fetch(`/api/admin/properties/${id}`);
        if (!propRes.ok) throw new Error("Property not found");
        const propData = await propRes.json();
        setPropertyData(propData);

        const detailRes = await fetch(`/api/admin/property-details/${id}`);

        let detailData = null;
        let media = propData.image;

        if (detailRes.ok) {
          detailData = await detailRes.json();
          setDetails(detailData);
          media = detailData.mainMedia || propData.image;
          setMainMedia(media);
          if (isVideo(media)) setOriginalVideo(media);
        } else {
          setMainMedia(media);
          if (isVideo(media)) setOriginalVideo(media);
        }

        // ── Wait for critical images before hiding spinner ──
        // 1. Main media (if it's an image)
        // 2. Side gallery (up to 4 images)
        // 3. Property card image as fallback
        const criticalImages = [
          !isVideo(media) ? media : null,
          ...(detailData?.gallery?.slice(0, 4) || []),
          propData.image,
        ].filter(Boolean);

        await preloadImages(criticalImages);

      } catch (err) {
        console.error("Error fetching property details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const enterFullscreen = (videoElement) => {
    if (videoElement.requestFullscreen) videoElement.requestFullscreen();
    else if (videoElement.webkitRequestFullscreen) videoElement.webkitRequestFullscreen();
    else if (videoElement.msRequestFullscreen) videoElement.msRequestFullscreen();
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
    setIsFullscreen(false);
  };

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
    if (originalVideo) setMainMedia(originalVideo);
  };

  // Unified carousel
  const carouselImages = (() => {
    if (details?.constructionProgress?.length > 0) return details.constructionProgress;
    if (details?.propertyImages?.length > 0)
      return details.propertyImages.map((url, i) => ({ image: url, label: `Image ${i + 1}` }));
    return [];
  })();

  const nextSlide = () => {
    if (carouselImages.length > 0)
      setCurrentSlide(prev => prev === carouselImages.length - 1 ? 0 : prev + 1);
  };

  const prevSlide = () => {
    if (carouselImages.length > 0)
      setCurrentSlide(prev => prev === 0 ? carouselImages.length - 1 : prev - 1);
  };

  const getSlidePosition = (index) => {
    const total = carouselImages.length || 0;
    if (total === 0) return '';
    const diff = index - currentSlide;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(total - 1)) return 'right';
    if (diff === -1 || diff === total - 1) return 'left';
    return 'hidden';
  };

  // ── FULLSCREEN SPINNER OVERLAY ──
  if (loading) return (
    <div className="pd-loader-overlay">
      <div className="pd-spinner" />
    </div>
  );

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
          <div className="title-price-row">
            <h1>{propertyData.title}</h1>
            <div className="details-price-box">
              <span className="price-label">Price</span>
              <span className="details-price">₹ {propertyData.price}</span>
            </div>
          </div>
          <div className="details-location">
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="location-icon" alt="Location" />
            <span>{propertyData.locationText}</span>
          </div>
        </div>
      </div>

      <div className="details-info-grid">
        <div className="details-description">
          <h2>Property Description</h2>
          <p>{details?.description || "No description available."}</p>

          {details?.amenities && Array.isArray(details.amenities) && details.amenities.length > 0 && (
            <div className="property-features-section">
              <h2>Property Features</h2>
              <div className="property-features-grid">
                {details.amenities.map((amenity, index) => (
                  <div key={index} className="property-feature-item">{amenity}</div>
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

      {carouselImages.length > 0 && (
        <div className="construction-progress-section">
          <h2>Property Images</h2>
          <div className="carousel-3d-wrapper">
            <button className="carousel-btn-3d prev-btn" onClick={prevSlide}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <div className="carousel-3d-container">
              {carouselImages.map((item, index) => (
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
                    alt={item.label || `Property view ${index + 1}`}
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

          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
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