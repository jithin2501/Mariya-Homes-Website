import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showStatus, setShowStatus] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setShowStatus(true);
      setFormData({ name: "", email: "", phone: "", message: "" });

      setTimeout(() => setShowStatus(false), 4000);
    } else {
      alert("Failed to send message");
    }
  } catch (error) {
    console.error(error);
    alert("Server error");
  }
};


  return (
    <>
      <section className="hero-banner-section contact-bg">
        <div className="hero-banner-container">
          <div className="hero-banner-content">
            <div className="hero-banner-tagline">Contact Us</div>
            <h1>Let's Start Your Real<br />Estate Journey</h1>
            <p>
              At Mariya Homes, we believe a home is more than just walls and windows. It's where your story begins.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-grid">
          <div className="contact-card contact-info-card">
            <h2>General Inquiries:</h2>
            <p>
              We're here to help you find your perfect home, investment, or dream property. Reach out to our team and experience the Homzon difference: personalized, transparent, and professional service every step of the way.
            </p>

            <div className="info-item">
              <div className="info-icon-wrapper">
                <img src="https://placehold.co/40x40/FFA500/ffffff?text=📍" alt="Location Icon" />
              </div>
              <div className="info-details">
                <span>Homzon Real Estate, Manhattan, New York, USA</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-wrapper">
                <img src="https://placehold.co/40x40/0f172a/ffffff?text=📞" alt="Phone Icon" />
              </div>
              <div className="info-details">
                <span>(566) 456-7890</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-wrapper">
                <img src="https://placehold.co/40x40/f97316/ffffff?text=✉️" alt="Email Icon" />
              </div>
              <div className="info-details">
                <span>info@homzon.com</span>
              </div>
            </div>

            <div className="map-wrapper">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.4754593839174!2d-0.12028608422770265!3d51.5033245796347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604b900d26989%3A0x232431aa52b75a1d!2sLondon%20Eye!5e0!3m2!1sen!2sin!4v1678822000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{border: 0}} 
                allowFullScreen="" 
                loading="lazy"
                title="Contact Location"
              />
            </div>
          </div>

          <div className="contact-card get-in-touch-card">
            <h2 style={{textAlign: 'center'}}>Contact Us</h2>

            <form id="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Name" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Email" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  placeholder="Message" 
                  required 
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="send-message-btn">
                Send Message
              </button>
            </form>

            <div id="status-message" className={`status-message ${showStatus ? 'show' : ''}`}>
              Your message has been sent successfully! We will get back to you shortly.
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;