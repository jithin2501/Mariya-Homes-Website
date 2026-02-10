import React, { useState } from 'react';
import './styles/AnimatedLogoutButton.css';

const AnimatedLogoutButton = ({ onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);

    setTimeout(() => {
      setShowMessage(true);
    }, 800);

    setTimeout(() => {
      setIsAnimating(false);
      setShowMessage(false);
      // Call the actual logout function after animation
      if (onClick) onClick();
    }, 2800);
  };

  return (
    <>
      <button 
        className={`logout-btn ${isAnimating ? 'animating' : ''}`}
        onClick={handleClick}
      >
        <span>Log Out</span>
        <div className="exit-container">
          <svg className="person" viewBox="0 0 100 125">
            <circle cx="60" cy="18" r="14" />
            <path d="M72,35 H48 L22,60 L35,73 L48,60 V85 L15,120 L30,135 L60,105 L90,135 L105,120 L72,85 V60 L85,73 L98,60 Z" transform="scale(0.75) translate(10, 5)" />
          </svg>
          <div className="door-frame"></div>
          <div className="door-panel"></div>
          <div className="impact-lines"></div>
        </div>
      </button>

      <div className={`status-msg ${showMessage ? 'show' : ''}`}>
        Logging out...
      </div>
    </>
  );
};

export default AnimatedLogoutButton;