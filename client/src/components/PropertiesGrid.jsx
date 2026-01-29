import React from 'react';
import { useNavigate } from 'react-router-dom';

const PropertiesGrid = ({ filters }) => {
  const navigate = useNavigate();

  const properties = [
    {
      id: 1,
      title: "Modern Luxury Villa",
      price: "$1,250,000",
      location: "Kothamangalam, Ernakulam",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
      badge: "For Sale",
      beds: 3,
      baths: 2,
      area: "2,400 Sqft"
    },
    {
      id: 2,
      title: "Sunset View Estate",
      price: "$890,000",
      location: "Muvattupuzha, Ernakulam",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
      badge: "Featured",
      beds: 4,
      baths: 3,
      area: "3,100 Sqft"
    },
    {
      id: 3,
      title: "Industrial Style Loft",
      price: "$450,000",
      location: "Perumbavoor, Ernakulam",
      image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=600",
      badge: "New",
      beds: 2,
      baths: 1,
      area: "1,200 Sqft"
    }
  ];

  const handleViewMore = (property) => {
    navigate(`/properties/${property.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="properties-grid">
      {properties.map((property) => (
        <div key={property.id} className="property-listing-card">
          <div className="property-image-box">
            <span className="property-badge">{property.badge}</span>
            <img src={property.image} alt={property.title} />
          </div>
          <div className="property-info">
            <div className="property-location">
              <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="location-icon" alt="Location Icon" /> 
              {property.location}
            </div>
            <div className="property-title">{property.title}</div>
            <div className="property-features">
              <div className="feature-item">
                <img src="https://cdn-icons-png.flaticon.com/512/3030/3030336.png" className="feature-icon" alt="Bed Icon" /> 
                {property.beds} Bed
              </div>
              <div className="feature-item">
                <img src="https://cdn-icons-png.flaticon.com/512/2950/2950901.png" className="feature-icon" alt="Bath Icon" /> 
                {property.baths} Bath
              </div>
              <div className="feature-item">
                <img src="https://cdn-icons-png.flaticon.com/512/10573/10573516.png" className="feature-icon" alt="Area Icon" /> 
                {property.area}
              </div>
            </div>
            <div className="property-footer">
              <div className="property-price">{property.price}</div>
              <button className="view-more-link" onClick={() => handleViewMore(property)}>
                View More <span>→</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertiesGrid;