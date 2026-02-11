import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/MobileMenu.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    closeMobileMenu();
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
       const headerOffset = 120;
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
         const headerOffset = 120;
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
    <div className="top-header-bar">
      <header className="navbar">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img 
            src="/images/MariyaHomes-logo/download.webp" 
            alt="Maria Homes Logo" 
            className="logo-img" 
            onError={(e) => {
              e.target.src = 'https://placehold.co/65x65?text=Maria+Homes';
            }} 
          />
          <div className="logo-text-wrapper">
            <span className="logo-text main-title">MARIYA HOMES</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-center">
          <Link to="/" className="nav-link" onClick={() => window.scrollTo(0, 0)}>Home</Link>
          <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
          <a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
          <a href="#reviews" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('reviews'); }}>Reviews</a>
          <Link to="/properties" className="nav-link" onClick={() => window.scrollTo(0, 0)}>Properties</Link>
        </nav>

        <Link to="/contact" className="get-quote-btn" onClick={() => window.scrollTo(0, 0)}>Contact</Link>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/" className="mobile-nav-link" onClick={() => { window.scrollTo(0, 0); closeMobileMenu(); }}>Home</Link>
        <a href="#about" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
        <a href="#services" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
        <a href="#reviews" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('reviews'); }}>Reviews</a>
        <Link to="/properties" className="mobile-nav-link" onClick={() => { window.scrollTo(0, 0); closeMobileMenu(); }}>Properties</Link>
        <Link to="/contact" className="mobile-nav-link mobile-contact-btn" onClick={() => { window.scrollTo(0, 0); closeMobileMenu(); }}>Contact</Link>
      </nav>
    </div>
  );
};

export default Header;