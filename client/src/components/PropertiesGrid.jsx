import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PropertiesGrid = ({ filters }) => {
  const navigate = useNavigate();
  // State to hold properties from the database
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties from the backend on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/properties");
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleViewMore = (property) => {
    // Navigate using the MongoDB _id
    navigate(`/properties/${property._id}`);
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="loading-text">Loading properties...</div>;

  return (
    <div className="properties-grid">
      {properties.length === 0 ? (
        <div className="no-properties">No properties found.</div>
      ) : (
        properties.map((property) => (
          <div key={property._id} className="property-listing-card">
            <div className="property-image-box">
              {/* category maps to badge (For Sale, Featured, etc.) */}
              <span className="property-badge">{property.category}</span>
              <img src={property.image} alt={property.title} />
            </div>
            <div className="property-info">
              <div className="property-location">
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="location-icon" alt="Location Icon" /> 
                {property.locationText}
              </div>
              <div className="property-title">{property.title}</div>
              <div className="property-features">
                <div className="feature-item">
                  <img src="https://cdn-icons-png.flaticon.com/512/3030/3030336.png" className="feature-icon" alt="Bed Icon" /> 
                  {property.features?.bed} Bed
                </div>
                <div className="feature-item">
                  <img src="https://cdn-icons-png.flaticon.com/512/2950/2950901.png" className="feature-icon" alt="Bath Icon" /> 
                  {property.features?.bath} Bath
                </div>
                <div className="feature-item">
                  <img src="https://cdn-icons-png.flaticon.com/512/10573/10573516.png" className="feature-icon" alt="Area Icon" /> 
                  {property.features?.sqft} Sqft
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
        ))
      )}
    </div>
  );
};

export default PropertiesGrid;