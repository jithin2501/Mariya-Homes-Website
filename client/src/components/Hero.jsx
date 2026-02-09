import React, { useState, useEffect } from 'react';
import '../styles/hero.css';

const Hero = () => {
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const texts = [
    "Discover Spaces That Inspire.",
    "Find Homes Designed for Living.",
    "Experience Comfort, Style & Quality."
  ];


  const [statImages] = useState({
    years: "/images/Hero-images/years.png", 
    projects: "/images/Hero-images/projects.png", 
    families: "/images/Hero-images/Happy Family.png", 
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div
  className="top-banner-bg"
  style={{
    backgroundImage: "url('/images/Hero-Banner/Banner.png')",
    backgroundSize: "cover",
    backgroundPosition: "center"
  }}
>
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
              <img 
                src={statImages.years} 
                alt="Years Experience" 
                className="stat-icon-image"
              />
            </div>
            <div className="stat-content">
              <h3>10+</h3>
              <p><b>Years</b></p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <img 
                src={statImages.projects} 
                alt="Projects Completed" 
                className="stat-icon-image"
              />
            </div>
            <div className="stat-content">
              <h3>200+</h3>
              <p><b>Projects</b></p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <img 
                src={statImages.families} 
                alt="Happy Families" 
                className="stat-icon-image"
              />
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