import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Services.css';

const Services = () => {
  const navigate = useNavigate();

  const handleConstructionClick = () => {
    navigate('/construction');
    window.scrollTo(0, 0);
  };

  const handleRenovationClick = () => {
    navigate('/renovation');
    window.scrollTo(0, 0);
  };

  const handlePropertiesClick = () => {
    navigate('/properties');
    window.scrollTo(0, 0);
  };

  return (
    <section className="services-section" id="services">
      <div className="services-header">
        <div className="services-tagline">Our Services</div>
        <p>From breaking ground to final key handover, Maria Homes provides end-to-end services.</p>
      </div>

      <div className="services-grid">
        <div className="service-card">
          <div className="service-image-box">
            <img src="/images/services/construction.jpg" alt="Construction" />
          </div>
          <div className="service-content">
            <h3>Construction</h3>
            <p>Full-scale construction of residential and commercial buildings, utilizing quality materials and cutting-edge engineering techniques.</p>
            <button className="service-btn" onClick={handleConstructionClick}>Learn More</button>
          </div>
        </div>

        <div className="service-card">
          <div className="service-image-box">
            <img src="/images/services/renovation.webp" alt="Renovation" />
          </div>
          <div className="service-content">
            <h3>Renovation</h3>
            <p>Modernization and refurbishment of existing properties, enhancing aesthetics, functionality, and market value with tailored designs.</p>
            <button className="service-btn" onClick={handleRenovationClick}>Learn More</button>
          </div>
        </div>

        <div className="service-card">
          <div className="service-image-box">
            <img src="/images/services/realestate.jpg" alt="Real Estate" />
          </div>
          <div className="service-content">
            <h3>Real Estate</h3>
            <p>Buying, selling, and renting properties in prime locations like Kothamangalam, Muvattupuzha, and Perumbavoor.</p>
            <button className="service-btn" onClick={handlePropertiesClick}>View Properties</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;