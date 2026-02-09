import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/AboutUs.css";

const About = () => {
  const navigate = useNavigate();

  const handleExplorePrograms = () => {
    navigate('/properties');
    window.scrollTo(0, 0);
  };

  const handleContact = () => {
    navigate('/contact');
    window.scrollTo(0, 0);
  };

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-left">
          <div className="about-tagline">About Maria Homes</div>
          <h2>500+ Families<br />Trust us.</h2>

          <div className="stat-box">
            <div className="stat-header-row">
              <div className="stat-main-number">15K</div>
              <div className="avatars-row">
                <img src="/images/AboutUs-Avathar/person1.jpeg" alt="Family A" className="avatar" />
                <img src="/images/AboutUs-Avathar/person2.jpeg" alt="Family B" className="avatar" />
                <img src="/images/AboutUs-Avathar/person4.jpeg" alt="Family C" className="avatar" />
                <div className="avatar-plus">+</div>
              </div>
            </div>

            <p className="stat-text">Real stories from families who found their perfect education with Maria Homes.</p>
          </div>
        </div>

        <div className="about-right">
          <p className="text-lead">At Maria Homes, we specialize in transforming spaces from the ground up. With a passion for quality construction, timeless renovation, and smart real estate solutions, we've been helping families and businesses turn their dreams into reality for over a decade. We are a real estate and construction company based in Kothamangalam, Ernakulam. We specialize in selling and renting houses, plots, and apartments in nearby areas like Muvattupuzha, Perumbavoor, Kolenchery, and more.</p>

          <ul>
            <li>Expert Craftsmanship</li>
            <li>Complete Solutions</li>
            <li>Experienced Team</li>
            <li>Client-First Approach</li>
          </ul>

          <div className="btn-group">
            <button className="action-btn btn-primary" onClick={handleExplorePrograms}>Explore Properties</button>
            <button className="action-btn btn-secondary" onClick={handleContact}>Request A Callback ?</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;