import React, { useState } from 'react';
import PropertyFilter from '../components/PropertyFilter';
import PropertiesGrid from '../components/PropertiesGrid';

const Properties = () => {
  const [filters, setFilters] = useState({
    location: 'All',
    priceMin: '',
    priceMax: '',
    bedrooms: 'Any',
    bathrooms: 'Any',
    parking: 'Any'
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      location: 'All',
      priceMin: '',
      priceMax: '',
      bedrooms: 'Any',
      bathrooms: 'Any',
      parking: 'Any'
    });
  };

  return (
    <>
      <section className="hero-banner-section properties-bg">
        <div className="hero-banner-container">
          <div className="hero-banner-content">
            <div className="hero-banner-tagline">Our Exclusive Listings</div>
            <h1>Explore Premium<br />Properties</h1>
            <p>
              From cozy apartments to luxury estates, find the home that fits your lifestyle. Our listings are hand-picked for quality and value.
            </p>
          </div>
        </div>
      </section>

      <section className="properties-section">
        <div className="properties-container">
          <div className="services-tagline">Featured Homes</div>
          <h2>Find Your Next Destination</h2>
          
          <div className="properties-layout">
            <div className="filter-wrapper">
              <PropertyFilter 
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>
            <main className="properties-main">
              <PropertiesGrid filters={filters} />
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Properties;