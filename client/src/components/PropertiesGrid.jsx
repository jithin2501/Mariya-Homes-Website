import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PropertiesGrid.css';

const PropertiesGrid = ({ filters }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/properties`);
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

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Apply filters to properties
  const filteredProperties = properties.filter(property => {
    // Location filter
    if (filters?.location && filters.location !== 'All') {
      const propertyLocation = property.locationText || property.location || '';
      if (!propertyLocation.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Bedrooms filter
    if (filters?.bedrooms && filters.bedrooms !== 'Any') {
      const propertyBed = parseInt(property.features?.bed) || 0;
      if (filters.bedrooms === '5+') {
        if (propertyBed < 5) return false;
      } else {
        const bedValue = parseInt(filters.bedrooms);
        if (propertyBed !== bedValue) return false;
      }
    }

    // Bathrooms filter
    if (filters?.bathrooms && filters.bathrooms !== 'Any') {
      const propertyBath = parseInt(property.features?.bath) || 0;
      if (filters.bathrooms === '3+') {
        if (propertyBath < 3) return false;
      } else {
        const bathValue = parseInt(filters.bathrooms);
        if (propertyBath !== bathValue) return false;
      }
    }

    // Parking filter
    if (filters?.parking && filters.parking !== 'Any') {
      const propertyParking = parseInt(property.features?.parking) || 0;
      if (filters.parking === '3+') {
        if (propertyParking < 3) return false;
      } else {
        const parkingValue = parseInt(filters.parking);
        if (propertyParking !== parkingValue) return false;
      }
    }

    // Price filter
    if (filters?.priceMin && filters.priceMin !== '') {
      // Extract numeric value from price string (e.g., "₹1.75 Crore" -> 17500000)
      const priceText = property.price.toLowerCase();
      let priceValue = 0;
      
      if (priceText.includes('crore')) {
        const match = priceText.match(/[\d.]+/);
        if (match) {
          priceValue = parseFloat(match[0]) * 10000000; // 1 crore = 10 million
        }
      } else if (priceText.includes('lakh')) {
        const match = priceText.match(/[\d.]+/);
        if (match) {
          priceValue = parseFloat(match[0]) * 100000; // 1 lakh = 100 thousand
        }
      } else {
        priceValue = parseFloat(property.price.replace(/[^0-9.]/g, ''));
      }
      
      const minPrice = parseFloat(filters.priceMin);
      if (priceValue < minPrice) return false;
    }
    
    if (filters?.priceMax && filters.priceMax !== '') {
      // Extract numeric value from price string
      const priceText = property.price.toLowerCase();
      let priceValue = 0;
      
      if (priceText.includes('crore')) {
        const match = priceText.match(/[\d.]+/);
        if (match) {
          priceValue = parseFloat(match[0]) * 10000000;
        }
      } else if (priceText.includes('lakh')) {
        const match = priceText.match(/[\d.]+/);
        if (match) {
          priceValue = parseFloat(match[0]) * 100000;
        }
      } else {
        priceValue = parseFloat(property.price.replace(/[^0-9.]/g, ''));
      }
      
      const maxPrice = parseFloat(filters.priceMax);
      if (priceValue > maxPrice) return false;
    }

    return true;
  });

  // Logic to get current items based on filtered properties
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const handleViewMore = (property) => {
    navigate(`/properties/${property._id}`);
    window.scrollTo(0, 0);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="loading-text">Loading properties...</div>;

  return (
    <div className="properties-container-wrapper">
      <div className="properties-grid">
        {currentProperties.length === 0 ? (
          <div className="no-properties">No properties found.</div>
        ) : (
          currentProperties.map((property) => (
            <div key={property._id} className="property-listing-card">
              <div className="property-image-box">
                <span className="property-badge">{property.category}</span>
                <img src={property.image} alt={property.title} />
              </div>
              <div className="property-info">
                <div className="property-location">
                  <img src="/images/propertie-logos/propertie-location.png" className="location-icon" alt="Location" /> 
                  {property.locationText}
                </div>
                <div className="property-title">{property.title}</div>
                <div className="property-features">
                  <div className="feature-item">
                    <img src="/images/propertie-logos/propertie-bed.png" className="feature-icon" alt="Bed" /> 
                    {property.features?.bed} Bed
                  </div>
                  <div className="feature-item">
                    <img src="/images/propertie-logos/propertie-bath.png" className="feature-icon" alt="Bath" /> 
                    {property.features?.bath} Bath
                  </div>
                  <div className="feature-item">
                    <img src="/images/propertie-logos/propertie-Sqft.png" className="feature-icon" alt="Area" /> 
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

      {/* Pagination Controls - Only show when there are MORE than 6 properties */}
      {filteredProperties.length > 6 && (
        <div className="pagination-controls">
          <button 
            className={`pag-btn ${currentPage === 1 ? 'disabled' : ''}`} 
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span className="page-indicator">Page {currentPage} of {totalPages}</span>
          <button 
            className={`pag-btn ${currentPage === totalPages ? 'disabled' : ''}`} 
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertiesGrid;