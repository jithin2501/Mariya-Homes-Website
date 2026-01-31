import React from 'react';

const Testimonials = () => {
  const testimonials = [
    { 
      name: "Anthony W.", 
      location: "Los Angeles", 
      text: "Homzon made my first home purchase seamless. Their team guided me at every step and made the process stress-free. Lorem ipsum dolor sit amet, conse ctetur adipiscing elit, sed do eiusmod." 
    },
    { 
      name: "David K.", 
      location: "New York City", 
      text: "Homzon made my first home purchase seamless. Their team guided me at every step and made the process stress-free. Lorem ipsum dolor sit amet, conse ctetur adipiscing elit, sed do eiusmod." 
    },
    { 
      name: "Christopher M.", 
      location: "Chicago", 
      text: "Homzon made my first home purchase seamless. Their team guided me at every step and made the process stress-free. Lorem ipsum dolor sit amet, conse ctetur adipiscing elit, sed do eiusmod." 
    }
  ];

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
            {/* Render 6 sets instead of 4 for better overlap */}
            {[...Array(6)].map((_, setIndex) => (
              <div key={setIndex} className="testimonial-grid">
                {testimonials.map((testimonial, index) => (
                  <div key={`${setIndex}-${index}`} className="testimonial-card">
                    <span className="quote-icon">"</span>
                    <div className="client-info">
                      <img 
                        src={`https://placehold.co/60x60/${index === 0 ? '0f172a' : index === 1 ? 'FFA500' : 'f97316'}/ffffff?text=${testimonial.name.charAt(0)}`} 
                        alt={testimonial.name} 
                        className="client-image" 
                      />
                      <div className="client-details">
                        <strong>— {testimonial.name}</strong>
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                    <p className="quote-text">{testimonial.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;