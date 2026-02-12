import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  
  // Date filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  
  // Data state
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [geoMapData, setGeoMapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Initialize dates from sessionStorage or set defaults
  useEffect(() => {
    const savedStartDate = sessionStorage.getItem('analytics_start_date');
    const savedEndDate = sessionStorage.getItem('analytics_end_date');
    
    if (savedStartDate && savedEndDate) {
      setStartDate(savedStartDate);
      setEndDate(savedEndDate);
    } else {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      
      const defaultStart = formatDate(lastMonth);
      const defaultEnd = formatDate(today);
      
      setStartDate(defaultStart);
      setEndDate(defaultEnd);
      
      sessionStorage.setItem('analytics_start_date', defaultStart);
      sessionStorage.setItem('analytics_end_date', defaultEnd);
    }
  }, []);

  // Save dates to sessionStorage when changed
  useEffect(() => {
    if (startDate && endDate) {
      sessionStorage.setItem('analytics_start_date', startDate);
      sessionStorage.setItem('analytics_end_date', endDate);
    }
  }, [startDate, endDate]);

  // Save analytics data to sessionStorage
  useEffect(() => {
    if (userAnalytics.length > 0) {
      sessionStorage.setItem('analytics_user_data', JSON.stringify(userAnalytics));
    }
  }, [userAnalytics]);

  // Save geo data to sessionStorage
  useEffect(() => {
    if (geoMapData.length > 0) {
      sessionStorage.setItem('analytics_geo_data', JSON.stringify(geoMapData));
    }
  }, [geoMapData]);

  // Restore data from sessionStorage on mount
  useEffect(() => {
    const savedUserData = sessionStorage.getItem('analytics_user_data');
    const savedGeoData = sessionStorage.getItem('analytics_geo_data');
    
    if (savedUserData) {
      setUserAnalytics(JSON.parse(savedUserData));
    }
    
    if (savedGeoData) {
      setGeoMapData(JSON.parse(savedGeoData));
    }
  }, []);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkBackendConnection = async () => {
    setIsCheckingBackend(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/test`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        setBackendStatus('connected');
        setError(null);
        
        // Only fetch if we don't have cached data
        const savedUserData = sessionStorage.getItem('analytics_user_data');
        const savedGeoData = sessionStorage.getItem('analytics_geo_data');
        
        if (!savedUserData || !savedGeoData) {
          fetchAnalytics();
          fetchGeoMapData();
        }
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      setBackendStatus('disconnected');
      setError(`Cannot connect to backend server. Make sure the server is running.`);
    } finally {
      setIsCheckingBackend(false);
    }
  };

  // Generate unique 5-digit session ID based on session ID
  const generateUsername = (sessionId) => {
    if (!sessionId) return '00000';
    
    // Extract a unique identifier from the session ID
    const hash = sessionId.split('_').pop() || sessionId;
    const numericHash = hash.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Generate a 5-digit number (00000-99999)
    const fiveDigit = String(numericHash % 100000).padStart(5, '0');
    
    return fiveDigit;
  };

  // Format session ID to show unique 5-digit version
  const formatSessionId = (sessionId) => {
    if (!sessionId) return '00000';
    
    // Use the same logic as generateUsername to ensure consistency
    const hash = sessionId.split('_').pop() || sessionId;
    const numericHash = hash.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const fiveDigit = String(numericHash % 100000).padStart(5, '0');
    
    return fiveDigit;
  };

  const fetchAnalytics = async () => {
    if (!startDate || !endDate || backendStatus !== 'connected') return;
    
    setLoading(true);
    try {
      const url = `/api/analytics?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Process user analytics to add unique usernames
      const processedAnalytics = (data.userAnalytics || []).map(user => ({
        ...user,
        displayUsername: generateUsername(user.sessionId),
        originalUsername: user.username
      }));
      
      setUserAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
      setUserAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeoMapData = async () => {
    if (!startDate || !endDate || backendStatus !== 'connected') return;
    
    try {
      const url = `/api/analytics/geo-map?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setGeoMapData(data.mapData || []);
    } catch (error) {
      console.error('Error fetching geo map data:', error);
      setGeoMapData([]);
    }
  };

  const handleApplyFilter = () => {
    if (backendStatus === 'connected') {
      fetchAnalytics();
      fetchGeoMapData();
    } else {
      checkBackendConnection();
    }
  };

  const handleViewDetails = (sessionId, username) => {
    navigate(`/admin/analytics/user/${sessionId}`, { state: { username } });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const setDateRange = (months) => {
    const today = new Date();
    const pastDate = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
    
    setStartDate(formatDate(pastDate));
    setEndDate(formatDate(today));
    
    setTimeout(() => {
      if (backendStatus === 'connected') {
        fetchAnalytics();
        fetchGeoMapData();
      }
    }, 100);
  };

  const exportUsers = () => {
    if (userAnalytics.length === 0) return;
    
    const headers = ['Username', 'Session ID', 'Locations', 'Visits', 'Total Time (seconds)', 'Last Visit'];
    const csvRows = [headers.join(',')];
    
    userAnalytics.forEach(user => {
      const values = [
        user.displayUsername || user.username,
        user.sessionId,
        user.locations,
        user.visitCount,
        user.totalTime,
        new Date(user.lastVisit).toLocaleString()
      ];
      csvRows.push(values.join(','));
    });
    
    const csv = csvRows.join('\n');
    downloadCSV(csv, 'user_analytics.csv');
  };

  const exportFullVisitDetails = () => {
    if (userAnalytics.length === 0) return;
    
    const headers = ['Username', 'Session ID', 'Location', 'District', 'Time (seconds)', 'Exit Reason', 'Timestamp'];
    const csvRows = [headers.join(',')];
    
    userAnalytics.forEach(user => {
      if (user.visits && user.visits.length > 0) {
        user.visits.forEach(visit => {
          const values = [
            user.displayUsername || user.username,
            user.sessionId,
            visit.location,
            visit.district,
            visit.timeSpent,
            `"${visit.exitReason}"`,
            new Date(visit.timestamp).toLocaleString()
          ];
          csvRows.push(values.join(','));
        });
      }
    });
    
    const csv = csvRows.join('\n');
    downloadCSV(csv, 'full_visit_details.csv');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-dashboard">
      <h1 className="analytics-title">📊 Analytics Dashboard</h1>

      <div className="filter-section">
        <h3>Filter by Date Range</h3>
        <div className="date-filters">
          <div className="date-input-group">
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleApplyFilter} 
            className="apply-btn"
            disabled={!startDate || !endDate}
          >
            Apply Filter
          </button>

          <button onClick={() => setDateRange(1)} className="preset-btn">Last Month</button>
          <button onClick={() => setDateRange(3)} className="preset-btn">Last 3 Months</button>
          <button onClick={() => setDateRange(6)} className="preset-btn">Last 6 Months</button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
          disabled={backendStatus !== 'connected'}
        >
          USER ANALYTICS
        </button>
        <button
          className={`tab-btn ${activeTab === 'geo' ? 'active' : ''}`}
          onClick={() => setActiveTab('geo')}
          disabled={backendStatus !== 'connected'}
        >
          GEO MAP ANALYTICS
        </button>
      </div>

      {backendStatus !== 'connected' ? (
        <div className="connection-required">
          <div className="connection-icon">🔌</div>
          <h3>Backend Connection Required</h3>
          <p>Please ensure the backend server is running to view analytics data.</p>
          <button onClick={checkBackendConnection} className="retry-btn-large">
            Try Connecting Now
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'user' && (
            <div className="user-analytics-section">
              <div className="export-buttons">
                <button 
                  onClick={exportUsers} 
                  className="export-btn"
                  disabled={loading || userAnalytics.length === 0}
                >
                  EXPORT USERS
                </button>
                <button 
                  onClick={exportFullVisitDetails} 
                  className="export-btn"
                  disabled={loading || userAnalytics.length === 0}
                >
                  EXPORT FULL VISIT DETAILS
                </button>
              </div>

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading analytics data...</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Session ID</th>
                        <th>Locations</th>
                        <th>Visits</th>
                        <th>Total Time</th>
                        <th>Last Visit</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAnalytics.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="no-data">
                            No analytics data available for the selected date range
                          </td>
                        </tr>
                      ) : (
                        userAnalytics.map((user, index) => (
                          <tr key={index}>
                            <td className="session-id">{formatSessionId(user.sessionId)}</td>
                            <td>{user.locations}</td>
                            <td className="text-center">{user.visitCount}</td>
                            <td className="text-right">{formatTime(user.totalTime)}</td>
                            <td>{new Date(user.lastVisit).toLocaleDateString()}</td>
                            <td>
                              <button
                                onClick={() => handleViewDetails(user.sessionId, user.displayUsername || user.username)}
                                className="view-details-btn"
                              >
                                VIEW
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'geo' && (
            <div className="geo-map-section">
              <OpenStreetMapView locations={geoMapData} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// OpenStreetMap Component with Leaflet.js - 100% FREE, NO API KEY NEEDED!
const OpenStreetMapView = ({ locations }) => {
  if (!locations || locations.length === 0) {
    return (
      <div className="map-container">
        <h3>🌍 User Locations</h3>
        <div className="world-map-placeholder">
          <p>No location data to display on map</p>
        </div>
      </div>
    );
  }

  // Calculate center point
  const centerLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

  // Determine zoom level based on spread
  const latSpread = Math.max(...locations.map(l => l.latitude)) - Math.min(...locations.map(l => l.latitude));
  const lngSpread = Math.max(...locations.map(l => l.longitude)) - Math.min(...locations.map(l => l.longitude));
  const maxSpread = Math.max(latSpread, lngSpread);
  
  let zoom = 2;
  if (maxSpread < 1) zoom = 11;
  else if (maxSpread < 5) zoom = 8;
  else if (maxSpread < 20) zoom = 6;
  else if (maxSpread < 50) zoom = 4;
  else if (maxSpread < 100) zoom = 3;
  else zoom = 2;

  return (
    <div className="map-container">
      <h3>🌍 User Locations ({locations.length} {locations.length === 1 ? 'Location' : 'Locations'})</h3>
      
      <div className="openstreetmap-wrapper">
        <iframe
          width="100%"
          height="600"
          style={{ border: 0, borderRadius: '12px' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          srcDoc={generateLeafletMapHTML(locations, centerLat, centerLng, zoom)}
          title="User Locations Map"
        />
      </div>


    </div>
  );
};

// Helper function to generate Leaflet.js map HTML with OpenStreetMap tiles
const generateLeafletMapHTML = (locations, centerLat, centerLng, zoom) => {
  const markers = locations.map((loc, index) => {
    const cityName = (loc.city || loc.country || 'Location').replace(/'/g, "\\'");
    const region = (loc.region || '').replace(/'/g, "\\'");
    const country = (loc.country || '').replace(/'/g, "\\'");
    return `
      {
        lat: ${loc.latitude},
        lng: ${loc.longitude},
        title: "${cityName}",
        label: "${index + 1}",
        info: "<div style='padding:10px; font-family: Arial, sans-serif;'><h3 style='margin:0 0 8px 0; color:#007bff;'>${cityName}</h3><p style='margin:4px 0; color:#555;'><strong>Region:</strong> ${region}</p><p style='margin:4px 0; color:#555;'><strong>Country:</strong> ${country}</p><p style='margin:4px 0; color:#007bff;'><strong>Users:</strong> ${loc.userCount || 1}</p><p style='margin:8px 0 0 0; font-size:12px; color:#666; font-family:monospace;'>${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}</p></div>"
      }`;
  }).join(',');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Locations Map</title>
  
  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
    crossorigin=""/>
  
  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
    crossorigin=""></script>
  
  <style>
    * { margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; }
    #map { height: 100%; width: 100%; }
    
    /* Custom marker styles */
    .custom-marker {
      background-color: #FF0000;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    
    .leaflet-popup-content-wrapper {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .leaflet-popup-content {
      margin: 0;
      min-width: 200px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <script>
    // Initialize the map
    const map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoom});
    
    // Add OpenStreetMap tile layer (100% free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 2
    }).addTo(map);
    
    // Location data
    const locations = [${markers}];
    
    // Create custom icon
    const createCustomIcon = (label) => {
      return L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="custom-marker">' + label + '</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });
    };
    
    // Add markers
    const markerGroup = L.featureGroup();
    
    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lng], {
        icon: createCustomIcon(location.label),
        title: location.title
      }).addTo(map);
      
      marker.bindPopup(location.info, {
        maxWidth: 300,
        className: 'custom-popup'
      });
      
      markerGroup.addLayer(marker);
    });
    
    // Fit map to show all markers
    if (locations.length > 1) {
      map.fitBounds(markerGroup.getBounds().pad(0.1));
    }
    
    // Add scale control
    L.control.scale({
      imperial: true,
      metric: true
    }).addTo(map);
  </script>
</body>
</html>`;
};

export default AnalyticsDashboard;