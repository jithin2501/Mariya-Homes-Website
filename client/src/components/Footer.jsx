import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/Footer.css";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (sectionId) => {
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
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
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
        {/* LEFT COLUMN: ABOUT */}
        <div className="footer-col about-col">
          <h3 className="footer-heading">
            <a 
              href="/about" 
              className="footer-heading-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/about');
              }}
            >
              ABOUT MARIYA HOMES
            </a>
          </h3>
          <p className="about-text">
            Mariya Homes is dedicated to providing premium living spaces and expert real estate services, ensuring quality, integrity, and excellence in every project we undertake.
          </p>
          <p className="tagline">"Your Dream, Our Commitment"</p>
          
          <div className="social-icons-contact">
            <a href="https://www.facebook.com/mariahomess?rdid=rlgBxIa27aoZvvn6&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1WZLeqjusw%2F" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img 
                src="/images/logo/facebok-icon.jpg" 
                alt="Facebook" 
                className="social-image-icon" 
              />
            </a>
            <a href="https://www.instagram.com/maria.homes.kothamangalam?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img 
                src="/images/logo/instagram-icon.jpg" 
                alt="Instagram" 
                className="social-image-icon" 
              />
            </a>
            <a href="https://www.youtube.com/@maria_homes" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <img 
                src="/images/logo/youtube-icon.jpg" 
                alt="YouTube" 
                className="social-image-icon" 
              />
            </a>
            <a href="https://api.whatsapp.com/send/?phone=917012791781&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <img 
                src="/images/logo/whatsapp-icon.jpg" 
                alt="WhatsApp" 
                className="social-image-icon" 
              />
            </a>
          </div>
        </div>

        {/* CENTER COLUMN: CONTACT DETAILS */}
        <div className="footer-col contact-details-col">
          <h3 className="footer-heading">
            <a 
              href="/contact" 
              className="footer-heading-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/contact');
              }}
            >
              CONTACT DETAILS
            </a>
          </h3>
          <div className="contact-item">
            <div className="contact-icon-wrapper">
              {/* Add your location logo image URL here */}
              <img 
                src="/images/logo/location-icon.png" 
                alt="Location" 
                className="contact-detail-img" 
              />
            </div>
            <div className="contact-text-item">
              <p className="contact-text-line1">
                Maria homes, Kothamangalam
              </p>
              <p className="contact-text-line2">
                Kerala 686691
              </p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon-wrapper">
              {/* Add your email logo image URL here */}
              <img 
                src="/images/logo/email-icon.png" 
                alt="Email" 
                className="contact-detail-img" 
              />
            </div>
            <div className="contact-text-item">
              <a href="mailto:info@mariyahomes.com" className="contact-link">
                info@mariyahomes.com
              </a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon-wrapper">
              {/* Add your phone logo image URL here */}
              <img 
                src="/images/logo/phone-icon.png" 
                alt="Phone" 
                className="contact-detail-img" 
              />
            </div>
            <div className="contact-text-item">
              <a href="tel:+919544394939" className="contact-link">
                +91 7012791781
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: USEFUL LINKS */}
        <div className="footer-col links-col">
          <h3 className="footer-heading">USEFUL LINKS</h3>
          <ul className="quick-links-list">
            <li>
              <button 
                onClick={() => { navigate('/'); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                className="footer-link-btn"
              >
                HOME
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('about')} 
                className="footer-link-btn"
              >
                ABOUT US
              </button>
            </li>
            <li>
              <button 
                onClick={() => { navigate('/properties'); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                className="footer-link-btn"
              >
                PROPERTIES
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('services')} 
                className="footer-link-btn"
              >
                SERVICES
              </button>
            </li>
            <li>
              <button 
                onClick={() => { navigate('/contact'); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                className="footer-link-btn"
              >
                CONTACT
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="copyright">© Copyright 2025 Mariya Homes. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;