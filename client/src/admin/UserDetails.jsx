import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/UserDetails.css';

// Helper function to generate Leaflet.js map HTML for single user location
const generateUserLeafletMapHTML = (lat, lng, locationName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Location</title>
  
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
    
    .custom-marker {
      background-color: #FF0000;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.9; }
    }
    
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    }
    
    .leaflet-popup-content {
      margin: 0;
      min-width: 220px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <script>
    // Initialize the map centered on user location
    const map = L.map('map').setView([${lat}, ${lng}], 11);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 2
    }).addTo(map);
    
    // Create custom pulsing marker icon
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="custom-marker"></div>',
      iconSize: [35, 35],
      iconAnchor: [17.5, 17.5],
      popupAnchor: [0, -17.5]
    });
    
    // Add marker at user location
    const marker = L.marker([${lat}, ${lng}], {
      icon: customIcon,
      title: "${locationName.replace(/"/g, '&quot;')}"
    }).addTo(map);
    
    // Create popup content
    const popupContent = \`
      <div style="padding:12px; font-family: Arial, sans-serif;">
        <h3 style="margin:0 0 10px 0; color:#007bff; font-size:16px;">📍 ${locationName.replace(/"/g, '&quot;')}</h3>
        <p style="margin:4px 0; color:#555; font-size:13px;">
          <strong>Latitude:</strong> ${lat.toFixed(6)}
        </p>
        <p style="margin:4px 0; color:#555; font-size:13px;">
          <strong>Longitude:</strong> ${lng.toFixed(6)}
        </p>
        <p style="margin-top:8px; font-size:11px; color:#999;">
          🗺️ Approximate location based on IP
        </p>
      </div>
    \`;
    
    marker.bindPopup(popupContent, {
      maxWidth: 250,
      className: 'custom-popup'
    });
    
    // Auto-open popup after a short delay
    setTimeout(() => {
      marker.openPopup();
    }, 500);
    
    // Add scale control
    L.control.scale({
      imperial: true,
      metric: true
    }).addTo(map);
    
    // Add zoom control position
    map.zoomControl.setPosition('topright');
  </script>
</body>
</html>`;
};

const UserDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format session ID to show unique shortened version
  const formatSessionId = (sessionId) => {
    if (!sessionId) return 'N/A';
    
    const displayId = sessionId.length > 8 
      ? sessionId.slice(-8).toUpperCase() 
      : sessionId.toUpperCase();
    
    return displayId;
  };

  useEffect(() => {
    fetchUserDetails();
  }, [sessionId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/user/${sessionId}`);
      const data = await response.json();
      
      setVisits(data.visits || []);
      setUserLocation(data.location);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportUserHistory = () => {
    const csv = convertToCSV(visits);
    downloadCSV(csv, `session_${formatSessionId(sessionId)}_visit_history.csv`);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = ['Location', 'District', 'Time (seconds)', 'Exit Reason', 'Timestamp'];
    const csvRows = [headers.join(',')];
    
    data.forEach(visit => {
      const values = [
        visit.location,
        visit.district,
        visit.timeSpent,
        `"${visit.exitReason}"`,
        new Date(visit.timestamp).toLocaleString()
      ];
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
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

  return (
    <div className="user-details-container">
      <div className="header">
        <h1>User Details — Session {formatSessionId(sessionId)}</h1>
        <div className="session-info">
          <span className="session-label">Session ID:</span>
          <span className="session-value">{formatSessionId(sessionId)}</span>
        </div>
        <button onClick={() => navigate('/admin/analytics')} className="back-btn">
          ← Back to Analytics
        </button>
      </div>

      <button onClick={exportUserHistory} className="export-history-btn">
        📥 EXPORT THIS USER'S FULL HISTORY
      </button>

      {userLocation && (
        <div className="location-info">
          <h3>📍 User Location Information</h3>
          <div className="location-details">
            <p>
              <strong>City:</strong> {userLocation.city || 'N/A'}
            </p>
            <p>
              <strong>Region:</strong> {userLocation.region || 'N/A'}
            </p>
            <p>
              <strong>Country:</strong> {userLocation.country || 'N/A'}
            </p>
            {userLocation.latitude && userLocation.longitude && (
              <p>
                <strong>Coordinates:</strong> {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </p>
            )}
          </div>
          
          {/* OpenStreetMap embed showing user's location with pulsing marker */}
          {userLocation.latitude && userLocation.longitude && (
            <div className="user-map-container">
              <iframe
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '8px', marginTop: '15px' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                srcDoc={generateUserLeafletMapHTML(
                  userLocation.latitude, 
                  userLocation.longitude, 
                  userLocation.city || userLocation.country || 'User Location'
                )}
                title="User Location Map"
              />
              <p className="map-instruction">
                🗺️ Free map powered by OpenStreetMap & Leaflet.js
              </p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading user details...</div>
      ) : (
        <div className="visits-list">
          {visits.length === 0 ? (
            <p className="no-data">No visit history available for this user</p>
          ) : (
            <>
              <div className="visits-header">
                <h3>📊 Visit History ({visits.length} visits)</h3>
              </div>
              {visits.map((visit, index) => (
                <div key={index} className="visit-card">
                  <div className="visit-header">
                    <h4>Visit #{visits.length - index}</h4>
                    <span className="visit-time">{new Date(visit.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="visit-details">
                    <p><strong>Location:</strong> {visit.location}</p>
                    <p><strong>District:</strong> {visit.district}</p>
                    <p><strong>Time Spent:</strong> {formatTime(visit.timeSpent)}</p>
                    <p><strong>Exit Reason:</strong> {visit.exitReason}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetails;