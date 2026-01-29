import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const scrollToSection = (sectionId) => {
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
            src="/images/download.webp" 
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

        <nav className="nav-center">
          <Link to="/" className="nav-link" onClick={() => window.scrollTo(0, 0)}>Home</Link>
          <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
          <a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
          <a href="#reviews" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('reviews'); }}>Reviews</a>
          <Link to="/properties" className="nav-link" onClick={() => window.scrollTo(0, 0)}>Properties</Link>
        </nav>

        <Link to="/contact" className="get-quote-btn" onClick={() => window.scrollTo(0, 0)}>Contact</Link>
      </header>
    </div>
  );
};

export default Header;