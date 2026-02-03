import React, { useEffect, useState } from 'react';
import '../styles/Renovation.css';

const Renovation = () => {
  const [galleries, setGalleries] = useState([]);
  const [journeySlides, setJourneySlides] = useState([]);
  const [journeyCurrentSlide, setJourneyCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch gallery images
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/gallery/type/renovation');
      const data = await response.json();
      setGalleries(data);
      
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
        // Fallback to default slides if no images uploaded yet
        initializeDefaultJourneySlides();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      // Fallback to default slides on error
      initializeDefaultJourneySlides();
      setLoading(false);
    }
  };

  const initializeDefaultJourneySlides = () => {
    const journeyData = [
      {
        id: 1,
        title: "Consultation & Evaluation",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800",
        description: "In-depth space analysis and structural feasibility study to understand your vision."
      },
      {
        id: 2,
        title: "Design & Selection",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800",
        description: "Detailed layouts and premium fixture curation aligned with your aesthetic goals."
      },
      {
        id: 3,
        title: "Quote & Timeline",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800",
        description: "Scope finalization and project roadmap delivery for a transparent investment."
      },
      {
        id: 4,
        title: "Demolition & Prep",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800",
        description: "Controlled removal and foundational transformation to prepare for the new build."
      },
      {
        id: 5,
        title: "Install & Finishing",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800",
        description: "Expert craftsmanship in plumbing, electric, and carpentry to bring it all together."
      },
      {
        id: 6,
        title: "Walkthrough & Completion",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800",
        description: "Final inspection and official project handover to ensure your total satisfaction."
      }
    ];
    setJourneySlides(journeyData);
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

  return (
    <>
      <div className="bg-decoration"></div>

      <section className="hero-banner-section renovation-bg">
        <div className="hero-banner-container">
          <div className="hero-banner-content">
            <div className="hero-banner-tagline">Excellence in Transformation</div>
            <h1>Our Renovation<br />Process</h1>
            <p>
              From initial concept to final walkthrough, we ensure every detail of your home's transformation is handled with precision, care, and quality craftsmanship.
            </p>
          </div>
        </div>
      </section>

      <div className="content-wrapper">
        <section className="intro-text-section">
          <h2>Renovation</h2>
          <p>Whether it's a kitchen upgrade, a bathroom remodel, or a complete home makeover — Maria Homes delivers thoughtful, stylish, and functional renovations tailored to your lifestyle. With an experienced team and an eye for detail, we focus on making the old feel brand new — efficiently, affordably, and beautifully.</p>
        </section>

        <h2 className="process-heading">Our Renovation Process</h2>

        <main className="grid-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="card-header">
              <div className="icon-box bg-brand-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="card-title">Consultation & Evaluation</h3>
            </div>
            <p className="card-desc">In-depth space analysis and structural feasibility study to understand your vision.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="card-header">
              <div className="icon-box bg-brand-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              </div>
              <h3 className="card-title">Design & Selection</h3>
            </div>
            <p className="card-desc">Detailed layouts and premium fixture curation aligned with your aesthetic goals.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="card-header">
              <div className="icon-box bg-brand-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3 className="card-title">Quote & Timeline</h3>
            </div>
            <p className="card-desc">Scope finalization and project roadmap delivery for a transparent investment.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="card-header">
              <div className="icon-box bg-brand-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-8 4-5 2L3 11l5 4 4 1 7 4 2-1V2Z"/><path d="M5.4 16.5 17 3"/></svg>
              </div>
              <h3 className="card-title">Demolition & Prep</h3>
            </div>
            <p className="card-desc">Controlled removal and foundational transformation to prepare for the new build.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">05</div>
            <div className="card-header">
              <div className="icon-box bg-brand-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3Z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="m2 2 5 5"/><path d="m8.5 8.5 1 1"/></svg>
              </div>
              <h3 className="card-title">Install & Finishing</h3>
            </div>
            <p className="card-desc">Expert craftsmanship in plumbing, electric, and carpentry to bring it all together.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">06</div>
            <div className="card-header">
              <div className="icon-box bg-brand-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="card-title">Walkthrough & Completion</h3>
            </div>
            <p className="card-desc">Final inspection and official project handover to ensure your total satisfaction.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>
        </main>
      </div>

      {/* 3D Renovation Journey Carousel */}
      {journeySlides.length > 0 && (
        <div className="renovation-journey-section">
          <h2>Our Renovation Journey</h2>
          <p className="journey-subtitle">Witness the transformation from old to beautiful</p>
          
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
      )}
    </>
  );
};

export default Renovation;