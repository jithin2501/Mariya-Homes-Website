import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (sectionId) => {
    // If we are already on the home page
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 95;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      } else {
        // If element doesn't exist (failsafe), just scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // If we are on /properties or /contact, navigate home with the hash
      // This is the "direct" way without using a visible jump
      navigate(`/#${sectionId}`);
      
      // Use a small timeout to ensure the Home component has loaded
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 95;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 50);
    }
  };

  return (
    <footer className="contact-map-footer">
      <div className="footer-container">
        <div className="footer-col contact-details-col">
          <h3 className="contact-heading">CONTACT DETAILS</h3>
          <div className="contact-item">
            <div className="contact-detail-icon">
              <img src="https://placehold.co/25x25/FFA500/ffffff?text=📍" alt="Location Icon" />
            </div>
            <p className="contact-text">128/50 K Block Kidwai Nagar Kanpur<br />Opposite Mikky House</p>
          </div>
          <div className="contact-item">
            <div className="contact-detail-icon">
              <img src="https://placehold.co/25x25/f97316/ffffff?text=✉️" alt="Email Icon" />
            </div>
            <p className="contact-text">mtmhss95@gmail.com</p>
          </div>
          <div className="contact-item">
            <div className="contact-detail-icon">
              <img src="https://placehold.co/25x25/0f172a/ffffff?text=📞" alt="Phone Icon" />
            </div>
            <p className="contact-text">+91-8933873293, +91-9005104040</p>
          </div>
        </div>

        <div className="footer-col links-col">
          <h3 className="footer-heading">USEFUL LINKS</h3>
          <ul className="quick-links-list">
            {/* Standard Navigations */}
            <li><button onClick={() => { navigate('/'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="footer-link-btn">HOME</button></li>
            <li><button onClick={() => { navigate('/properties'); window.scrollTo(0, 0); }} className="footer-link-btn">PROPERTIES</button></li>
            
            {/* Section Navigations - These now call the direct handleNav function */}
            <li><button onClick={() => handleNav('about')} className="footer-link-btn">KNOW US</button></li>
            <li><button onClick={() => handleNav('services')} className="footer-link-btn">SERVICES</button></li>
            <li><button onClick={() => handleNav('reviews')} className="footer-link-btn">REVIEWS</button></li>
            
            <li><button onClick={() => { navigate('/contact'); window.scrollTo(0, 0); }} className="footer-link-btn">CONTACT US</button></li>
          </ul>
        </div>

        <div className="footer-col map-col">
          <h3 className="footer-heading map-heading">SCHOOL MAP</h3>
          <div className="footer-map-embed">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.7153702164393!2d80.3341!3d26.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI1JzQ4LjAiTiA4MMKwMjAnMDIuOCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{border: 0}} 
              allowFullScreen="" 
              loading="lazy" 
              title="School Map"
            />
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="copyright">© Copyright 2025 Auxilium School. All rights reserved.</p>
        <p className="developer">Web Developed by <a href="mailto:jithinpjoji@gmail.com">jithinpjoji@gmail.com</a></p>
      </div>
    </footer>
  );
};

export default Footer;