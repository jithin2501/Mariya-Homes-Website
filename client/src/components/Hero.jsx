import React, { useState, useEffect } from 'react';

const Hero = () => {
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const texts = [
    "Discover Spaces That Inspire.",
    "Find Homes Designed for Living.",
    "Experience Comfort, Style & Quality."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="top-banner-bg">
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
        <p>Discover modern properties, premium designs, and the lifestyle you deserve all in one place. Whether buying, selling, or renting, Maria Homes brings every home closer to you.</p>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>500+</h3>
              <p><b>Verified Listings</b></p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>200+</h3>
              <p><b>Trusted Realtors</b></p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <h3>300+</h3>
              <p><b>Across Prime Locations</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;