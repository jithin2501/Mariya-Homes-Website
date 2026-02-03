import React, { useEffect, useState } from 'react';

const Construction = () => {
  const [galleries, setGalleries] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const fetchGalleries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gallery/type/construction');
      const data = await response.json();
      setGalleries(data);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleries.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleries.length) % galleries.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <>
      <section className="hero-banner-section construction-bg">
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

      {/* Gallery Carousel Section */}
      {galleries.length > 0 && (
        <section className="gallery-carousel-section">
          <div className="carousel-container">
            <h2 className="gallery-section-title">Our Construction Journey</h2>
            
            <div className="carousel-wrapper">
              {/* Navigation Arrows */}
              <button className="carousel-nav carousel-nav-left" onClick={prevSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              {/* Main Carousel */}
              <div className="carousel-track">
                {/* Thumbnail Previews */}
                <div className="carousel-thumbnails">
                  {galleries.map((item, index) => (
                    <div
                      key={item._id}
                      className={`thumbnail-item ${index === currentSlide ? 'active' : ''} ${
                        index < currentSlide ? 'passed' : ''
                      }`}
                      onClick={() => goToSlide(index)}
                    >
                      <div className="thumbnail-image">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="thumbnail-label">
                        <span>{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Image Display */}
                <div className="carousel-main-display">
                  <div className="main-image-wrapper">
                    <img 
                      src={galleries[currentSlide]?.image} 
                      alt={galleries[currentSlide]?.title}
                      className="main-image"
                    />
                  </div>
                  <div className="main-image-info">
                    <h3>{galleries[currentSlide]?.title}</h3>
                    {galleries[currentSlide]?.description && (
                      <p>{galleries[currentSlide]?.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <button className="carousel-nav carousel-nav-right" onClick={nextSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Progress Dots */}
            <div className="carousel-dots">
              {galleries.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Construction;