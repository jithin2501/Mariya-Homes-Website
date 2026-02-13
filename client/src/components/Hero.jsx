import React, { useState, useEffect } from 'react';
import '../styles/hero.css';

const Hero = () => {
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const texts = [
    "Discover Spaces That Inspire.",
    "Find Homes Designed for Living.",
    "Experience Comfort, Style & Quality."
  ];

  const [statImages] = useState({
    years: "/images/Hero-images/years.avif", 
    projects: "/images/Hero-images/project.jpg", 
    families: "/images/Hero-images/Happy Families.webp", 
  });

  const [imageErrors, setImageErrors] = useState({
    years: false,
    projects: false,
    families: false
  });

  const handleImageError = (imageName) => {
    setImageErrors(prev => ({ ...prev, [imageName]: true }));
  };

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setIsLoaded(true), 100);

    const interval = setInterval(() => {
      setActiveTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  // Fallback icons in case images don't load
  const fallbackIcons = {
    years: "📅",
    projects: "🏗️",
    families: "👨‍👩‍👧‍👦"
  };

  return (
    <div className={`top-banner-bg ${isLoaded ? 'loaded' : ''}`}>
      {/* Left Image Panel */}
      <div className="banner-panel banner-left">
        <img 
          src="/images/row-1-column-1.png" 
          alt="Left Banner" 
          loading="eager"
        />
      </div>

      {/* Center Image Panel */}
      <div className="banner-panel banner-center">
        <img 
          src="/images/row-1-column-2.png" 
          alt="Center Banner" 
          loading="eager"
        />
      </div>

      {/* Right Image Panel */}
      <div className="banner-panel banner-right">
        <img 
          src="/images/row-1-column-3.png" 
          alt="Right Banner" 
          loading="eager"
        />
      </div>

      {/* Overlay gradient */}
      <div className="banner-overlay"></div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-tagline rotating-text">
          {texts.map((text, index) => (
            <span 
              key={index} 
              className={`text-item ${index === activeTextIndex ? 'active' : ''}`}
            >
              {text}
            </span>
          ))}
        </div>

        <h1>Find Your Perfect<br />Home with us.</h1>
        <p>Discover expert construction, smart renovations, and trusted real estate solutions all in one place. Whether you're building, upgrading, buying, or selling, Mariya Homes turns your vision into reality.</p>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">
              {imageErrors.years ? (
                <span className="fallback-icon">{fallbackIcons.years}</span>
              ) : (
                <img 
                  src={statImages.years} 
                  alt="Years Experience" 
                  className="stat-icon-image"
                  onError={() => handleImageError('years')}
                  loading="lazy"
                />
              )}
            </div>
            <div className="stat-content">
              <h3>10+</h3>
              <p><b>Years</b></p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              {imageErrors.projects ? (
                <span className="fallback-icon">{fallbackIcons.projects}</span>
              ) : (
                <img 
                  src={statImages.projects} 
                  alt="Projects Completed" 
                  className="stat-icon-image"
                  onError={() => handleImageError('projects')}
                  loading="lazy"
                />
              )}
            </div>
            <div className="stat-content">
              <h3>200+</h3>
              <p><b>Projects</b></p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              {imageErrors.families ? (
                <span className="fallback-icon">{fallbackIcons.families}</span>
              ) : (
                <img 
                  src={statImages.families} 
                  alt="Happy Families" 
                  className="stat-icon-image"
                  onError={() => handleImageError('families')}
                  loading="lazy"
                />
              )}
            </div>
            <div className="stat-content">
              <h3>500+</h3>
              <p><b>Happy Families</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;