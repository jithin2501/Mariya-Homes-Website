import React from 'react';

const PropertyFilter = ({ filters, onFilterChange, onResetFilters }) => {
  const locations = ['All', 'Kothamangalam', 'Muvattupuzha', 'Perumbavoor', 'Kolenchery'];
  const bedrooms = ['Any', '1', '2', '3', '4', '5+'];
  const bathrooms = ['Any', '1', '2', '3+'];
  const floors = ['Any', '1', '2', '3+'];
  const parking = ['Any', '1', '2', '3+'];

  const handleSelection = (type, value) => {
    onFilterChange(type, value);
  };

  const handlePriceChange = (type, value) => {
    onFilterChange(type, value);
  };

  return (
    <aside className="filter-sidebar">
      <h3>Filter Options</h3>
      
      <div className="filter-group">
        <div className="filter-label-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="filter-label-icon" alt="Location Icon" />
          <label>Location</label>
        </div>
        <div className="selection-grid">
          {locations.map(location => (
            <div 
              key={location}
              className={`selection-box wide ${filters.location === location ? 'active' : ''}`}
              onClick={() => handleSelection('location', location)}
            >
              {location}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/2324/2324151.png" className="filter-label-icon" alt="Price Icon" />
          <label>Price Range</label>
        </div>
        <div className="price-inputs-row">
          <input 
            type="number" 
            className="price-field" 
            placeholder="Min" 
            id="price-min"
            value={filters.priceMin}
            onChange={(e) => handlePriceChange('priceMin', e.target.value)}
          />
          <input 
            type="number" 
            className="price-field" 
            placeholder="Max" 
            id="price-max"
            value={filters.priceMax}
            onChange={(e) => handlePriceChange('priceMax', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/3030/3030336.png" className="filter-label-icon" alt="Bed Icon" />
          <label>Bedrooms</label>
        </div>
        <div className="selection-grid">
          {bedrooms.map(bed => (
            <div 
              key={bed}
              className={`selection-box ${filters.bedrooms === bed ? 'active' : ''}`}
              onClick={() => handleSelection('bedrooms', bed)}
            >
              {bed}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/2950/2950901.png" className="filter-label-icon" alt="Bath Icon" />
          <label>Bathrooms</label>
        </div>
        <div className="selection-grid">
          {bathrooms.map(bath => (
            <div 
              key={bath}
              className={`selection-box ${filters.bathrooms === bath ? 'active' : ''}`}
              onClick={() => handleSelection('bathrooms', bath)}
            >
              {bath}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/2324/2324151.png" className="filter-label-icon" alt="Floor Icon" />
          <label>Floors</label>
        </div>
        <div className="selection-grid">
          {floors.map(floor => (
            <div 
              key={floor}
              className={`selection-box ${filters.floors === floor ? 'active' : ''}`}
              onClick={() => handleSelection('floors', floor)}
            >
              {floor}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label-wrapper">
          <img src="https://cdn-icons-png.flaticon.com/512/3408/3408545.png" className="filter-label-icon" alt="Parking Icon" />
          <label>Car Parking</label>
        </div>
        <div className="selection-grid">
          {parking.map(park => (
            <div 
              key={park}
              className={`selection-box ${filters.parking === park ? 'active' : ''}`}
              onClick={() => handleSelection('parking', park)}
            >
              {park}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <button className="filter-apply-btn">Apply Filters</button>
        <button className="filter-reset-btn" onClick={onResetFilters}>Reset All</button>
      </div>
    </aside>
  );
};

export default PropertyFilter;