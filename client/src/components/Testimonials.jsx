import React from 'react';
import '../styles/Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    { 
      name: "Fafe", 
      location: "Renovation", 
      text: "Maria Homes brought our vision to life with true professionalism and care. The quality and communication were excellent, and we're thrilled with the outcome. Highly recommend their team.",
      image: "/images/Reviews/person1.jpeg" 
    },
    { 
      name: "Selvi Antony", 
      location: "Renovation", 
      text: "Exceptional renovation work from start to finish. The team was professional, detail-focused, and delivered on schedule. We're very happy with the results and strongly recommend them.",
      image: "/images/Reviews/person2.jpeg" 
    },
    { 
      name: "Sabu", 
      location: "Construction", 
      text: "Very responsive and attentive to detail throughout the project. The entire process felt smooth and well-managed, and we absolutely love our new villa.",
      image: "/images/Reviews/person3.jpeg" 
    },
    { 
      name: "Binil", 
      location: "Construction", 
      text: "An outstanding experience with Maria Homes. Their professionalism made everything stress-free, and the final result exceeded expectations. We'd gladly recommend them.",
      image: "/images/Reviews/person4.jpeg"
    }
  ];

  const handleImageError = (e, fallbackColor, initial) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/60x60/${fallbackColor}/ffffff?text=${initial}`;
  };

  return (
    <section className="testimonials-section" id="reviews">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <div className="tagline">Reviews</div>
          <h2>What Our Clients Say</h2>
          <p>Real stories from homeowners and investors who found their dream properties with Homzon.</p>
        </div>

        <div className="testimonial-carousel-wrapper">
          <div className="testimonial-carousel">
            {[...Array(6)].map((_, setIndex) => (
              <div key={setIndex} className="testimonial-grid">
                {testimonials.map((testimonial, index) => {
                  const fallbackColors = ['0f172a', 'FFA500', 'f97316', '10b981'];
                  const fallbackColor = fallbackColors[index % fallbackColors.length];
                  const initial = testimonial.name.charAt(0);
                  
                  return (
                    <div key={`${setIndex}-${index}`} className="testimonial-card">
                      <span className="quote-icon">"</span>
                      <div className="client-info">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="client-image"
                          onError={(e) => handleImageError(e, fallbackColor, initial)}
                        />
                        <div className="client-details">
                          <strong>— {testimonial.name}</strong>
                          <span>{testimonial.location}</span>
                        </div>
                      </div>
                      <p className="quote-text">{testimonial.text}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;