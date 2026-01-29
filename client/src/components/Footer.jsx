import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    if (window.location.pathname === '/') {
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
    } else {
      navigate('/');
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
      }, 100);
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
            <li><button onClick={() => { navigate('/'); window.scrollTo(0, 0); }} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}>HOME</button></li>
            <li><button onClick={() => { navigate('/properties'); window.scrollTo(0, 0); }} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}>PROPERTIES</button></li>
            <li><button onClick={() => { navigate('/'); scrollToSection('about'); }} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}>KNOW US</button></li>
            <li><button onClick={() => { navigate('/contact'); window.scrollTo(0, 0); }} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}>CONTACT US</button></li>
          </ul>
        </div>

        <div className="footer-col map-col">
          <h3 className="footer-heading map-heading">SCHOOL MAP</h3>
          <div className="footer-map-embed">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.588000280506!2d75.31570659376825!3d12.327466990977523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba461dc4cf1f3bf%3A0x3b75c8ea180a1538!2sAUXILIUM%20SCHOOL%20(ICSE)!5e0!3m2!1sen!2sin!4v1759573611211!5m2!1sen!2sin" 
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