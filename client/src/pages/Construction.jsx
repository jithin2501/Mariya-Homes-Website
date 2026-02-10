import React, { useEffect, useState } from 'react';
import '../styles/Construction.css';

const Construction = () => {
  const [galleries, setGalleries] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [journeySlides, setJourneySlides] = useState([]);
  const [journeyCurrentSlide, setJourneyCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach((node, index) => {
      setTimeout(() => {
        node.classList.add('is-visible');
      }, index * 100);
    });

    // Fetch gallery images
    fetchGalleries();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredGalleries(galleries);
    } else {
      setFilteredGalleries(galleries.filter(gallery => 
        gallery.category && gallery.category.toLowerCase() === selectedCategory
      ));
    }
  }, [galleries, selectedCategory]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/gallery/type/construction');
      const data = await response.json();
      setGalleries(data);
      setFilteredGalleries(data);
      
      // Convert fetched gallery data to journey slides format
      if (data && data.length > 0) {
        const convertedSlides = data.map((item, index) => ({
          id: index + 1,
          title: item.title || `Step ${index + 1}`,
          image: item.image,
          description: item.description || ''
        }));
        setJourneySlides(convertedSlides);
      } else {
        // Show empty state instead of fallback images
        initializeDefaultJourneySlides();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      // Show empty state on error
      initializeDefaultJourneySlides();
      setLoading(false);
    }
  };

  const initializeDefaultJourneySlides = () => {
    // Show empty state instead of fallback images
    setJourneySlides([]);
  };

  // 3D Carousel Functions
  const nextJourneySlide = () => {
    setJourneyCurrentSlide((prev) => (prev + 1) % journeySlides.length);
  };

  const prevJourneySlide = () => {
    setJourneyCurrentSlide((prev) => (prev - 1 + journeySlides.length) % journeySlides.length);
  };

  const getSlidePosition = (index) => {
    const totalSlides = journeySlides.length;
    if (totalSlides === 0) return 'hidden';
    
    const diff = (index - journeyCurrentSlide + totalSlides) % totalSlides;
    
    if (diff === 0) return 'center';
    if (diff === 1 || (diff === 1 - totalSlides && totalSlides > 2)) return 'right';
    if (diff === totalSlides - 1 || (diff === -1 && totalSlides > 2)) return 'left';
    return 'hidden';
  };

  // Gallery functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredGalleries.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredGalleries.length) % filteredGalleries.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const categories = ['all', 'exterior', 'interior', 'foundation', 'roofing', 'finishing'];

  return (
    <>
      <section
  className="hero-banner-section construction-bg"
  style={{
    backgroundImage: "url('/images/Banner-Images/construction.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center"
  }}
>
        <div className="hero-banner-container">
          <div className="hero-banner-content">
            <div className="hero-banner-tagline">Building Dreams</div>
            <h1>Excellence in<br />Construction</h1>
            <p>
              From the first site visit to the final handover, we ensure transparency, quality, and precision at every stage of building your dream space.
            </p>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <h2>Construction</h2>
        <p>
          At Maria Homes, we specialize in turning architectural visions into lasting structures. Our construction services combine design precision, high-quality materials, and expert execution to ensure every home is built to perfection. From residential villas to commercial buildings, we handle every step — from planning and permits to final handover — with transparency and care.
        </p>
        
        <h2 className="process-heading">Our Construction Process</h2>
      </section>

      <div className="container">
        <main className="flow-grid">
          <section className="node">
            <div className="icon-circle">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <span className="step-label">Stage 01</span>
            <h2>Site Visit & Requirements</h2>
            <p>We understand your vision, space, and budget before we begin.</p>
          </section>

          <section className="node">
            <div className="icon-circle">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line><line x1="9" y1="19" x2="13" y2="19"></line></svg>
            </div>
            <span className="step-label">Stage 02</span>
            <h2>Planning & Design</h2>
            <p>Structural plans tailored to your needs and local compliance.</p>
          </section>

          <section className="node">
            <div className="icon-circle">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="16" y1="2" x2="16" y2="4"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="3" y1="8" x2="21" y2="8"/></svg>
            </div>
            <span className="step-label">Stage 03</span>
            <h2>Estimation & Approval</h2>
            <p>We give a clear estimate of time, materials, and cost.</p>
          </section>

          <section className="node">
            <div className="icon-circle">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M2 20h20"></path><path d="M5 20V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12"></path><rect x="10" y="10" width="4" height="4"/></svg>
            </div>
            <span className="step-label">Stage 04</span>
            <h2>Foundation & Structure</h2>
            <p>Groundwork begins with durable, certified materials.</p>
          </section>

          <section className="node">
            <div className="icon-circle">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            </div>
            <span className="step-label">Stage 05</span>
            <h2>Utilities & Interiors</h2>
            <p>Integrating modern utilities and design finishes.</p>
          </section>

          <section className="node">
            <div className="icon-circle">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m21 2-9.6 9.6"></path><circle cx="7.5" cy="15.5" r="4.5"></circle><path d="m21 2-3 3 2 2 3-3-2-2Z"></path><path d="M15.5 7.5 18.5 10.5"></path></svg>
            </div>
            <span className="step-label">Stage 06</span>
            <h2>Inspection & Handover</h2>
            <p>Final checks complete — your home is ready to live in.</p>
          </section>
        </main>
      </div>

      {/* 3D Construction Journey Carousel */}
      {journeySlides.length > 0 ? (
        <div className="construction-journey-section">
          <h2>Our Construction Journey</h2>
          <p className="journey-subtitle">Witness the transformation from empty land to dream home</p>
          
          <div className="carousel-3d-wrapper">
            <button className="carousel-btn-3d prev-btn" onClick={prevJourneySlide}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <div className="carousel-3d-container">
              {journeySlides.map((item, index) => (
                <div
                  key={item.id}
                  className={`carousel-3d-slide ${getSlidePosition(index)}`}
                  onClick={() => {
                    if (getSlidePosition(index) === 'left') prevJourneySlide();
                    if (getSlidePosition(index) === 'right') nextJourneySlide();
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="carousel-3d-image" 
                  />
                  <div className="slide-content-overlay">
                    <h3 className="slide-title">{item.title}</h3>
                    <p className="slide-description">{item.description}</p>
                    <span className="slide-number">Step {item.id}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="carousel-btn-3d next-btn" onClick={nextJourneySlide}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>

          <div className="carousel-indicators">
            {journeySlides.map((item, index) => (
              <button
                key={item.id}
                className={`indicator ${journeyCurrentSlide === index ? 'active' : ''}`}
                onClick={() => setJourneyCurrentSlide(index)}
                aria-label={`Go to step ${item.id}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-journey-section">
          <div className="empty-journey-card">
            <svg className="empty-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <h3>No Construction Journey Images Yet</h3>
            <p>Upload construction progress images from the admin panel to showcase your building journey.</p>
            <div className="empty-journey-hint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Go to Admin Panel → Construction Gallery → Upload Images</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Construction;