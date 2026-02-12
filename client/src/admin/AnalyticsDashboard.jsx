import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  
  // API configuration
  const API_BASE_URL = '';
  
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

  // Initialize dates - check sessionStorage first
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

  // Save dates to sessionStorage
  useEffect(() => {
    if (startDate && endDate) {
      sessionStorage.setItem('analytics_start_date', startDate);
      sessionStorage.setItem('analytics_end_date', endDate);
    }
  }, [startDate, endDate]);

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
        const data = await response.json();
        setBackendStatus('connected');
        setError(null);
        fetchAnalytics();
        fetchGeoMapData();
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

  const fetchAnalytics = async () => {
    if (!startDate || !endDate || backendStatus !== 'connected') return;
    
    setLoading(true);
    try {
      const url = `/api/analytics?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setUserAnalytics(data.userAnalytics || []);
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

  const formatSessionId = (sessionId) => {
    if (!sessionId) return 'N/A';
    const numericPart = sessionId.replace('session_', '').replace(/_.*/, '');
    return numericPart.substring(0, 5);
  };

  // Export Users function
  const exportUsers = () => {
    if (userAnalytics.length === 0) return;
    
    const headers = ['Username', 'Session ID', 'Locations', 'Visits', 'Total Time (seconds)', 'Last Visit'];
    const csvRows = [headers.join(',')];
    
    userAnalytics.forEach(user => {
      const values = [
        user.username,
        user.sessionId,
        user.locations,
        user.visitCount,
        user.totalTime,
        new Date(user.lastVisit).toLocaleString()
      ];
      csvRows.push(values.join(','));
    });
    
    const csv = csvRows.join('\n');
    downloadCSV(csv, `analytics_users_${startDate}_to_${endDate}.csv`);
  };

  // Export Full Visit Details function
  const exportFullVisitDetails = async () => {
    if (userAnalytics.length === 0) return;
    
    try {
      const allVisits = [];
      
      // Fetch detailed visit data for each user
      for (const user of userAnalytics) {
        const response = await fetch(`/api/analytics/user/${user.sessionId}`);
        const data = await response.json();
        
        if (data.visits) {
          data.visits.forEach(visit => {
            allVisits.push({
              username: user.username,
              sessionId: user.sessionId,
              location: visit.location,
              district: visit.district,
              timeSpent: visit.timeSpent,
              exitReason: visit.exitReason,
              timestamp: new Date(visit.timestamp).toLocaleString()
            });
          });
        }
      }
      
      // Create CSV
      const headers = ['Username', 'Session ID', 'Location', 'District', 'Time (seconds)', 'Exit Reason', 'Timestamp'];
      const csvRows = [headers.join(',')];
      
      allVisits.forEach(visit => {
        const values = [
          visit.username,
          visit.sessionId,
          visit.location,
          visit.district,
          visit.timeSpent,
          `"${visit.exitReason}"`,
          visit.timestamp
        ];
        csvRows.push(values.join(','));
      });
      
      const csv = csvRows.join('\n');
      downloadCSV(csv, `analytics_full_details_${startDate}_to_${endDate}.csv`);
    } catch (error) {
      console.error('Error exporting full visit details:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Download CSV helper
  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderBackendStatus = () => {
    if (isCheckingBackend) {
      return (
        <div className="connection-status testing">
          <div className="spinner"></div>
          <span>Checking connection to backend server...</span>
        </div>
      );
    }
    
    if (backendStatus === 'connected') {
      return (
        <div className="connection-status success">
          <span>✅ Connected to backend server</span>
        </div>
      );
    }
    
    if (backendStatus === 'disconnected') {
      return (
        <div className="connection-status error">
          <span>❌ Cannot connect to backend server</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="analytics-dashboard">
      <h1 className="analytics-title">Analytics Dashboard</h1>

      {renderBackendStatus()}

      {error && (
        <div className="error-message">
          <h3>⚠️ Connection Error</h3>
          <p>{error}</p>
          
          <div className="troubleshooting">
            <h4>🔧 Troubleshooting Steps:</h4>
            <ol>
              <li>
                <strong>Verify backend is running:</strong>
                <div>Open <a href="/api/analytics/test" target="_blank" rel="noopener noreferrer">/api/analytics/test</a> in your browser</div>
              </li>
              <li>
                <strong>Check if the server is responding:</strong>
                <div>The API should be available at the same domain as this application</div>
              </li>
            </ol>
            
            <div className="action-buttons">
              <button onClick={checkBackendConnection} className="retry-btn">
                🔄 Test Connection Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-section">
        <h3>Filter by Date</h3>
        <div className="date-filters">
          <div className="date-input-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="date-input-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>

          <button 
            onClick={handleApplyFilter} 
            className="apply-btn"
            disabled={isCheckingBackend}
          >
            {backendStatus === 'connected' ? 'APPLY' : 'CONNECT & APPLY'}
          </button>

          <button onClick={() => setDateRange(1)} className="preset-btn">
            LAST 1 MONTH
          </button>
          
          <button onClick={() => setDateRange(3)} className="preset-btn">
            LAST 3 MONTHS
          </button>
          
          <button onClick={() => setDateRange(6)} className="preset-btn">
            LAST 6 MONTHS
          </button>
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
                        <th>Username</th>
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
                          <td colSpan="7" className="no-data">
                            No analytics data available for the selected date range
                          </td>
                        </tr>
                      ) : (
                        userAnalytics.map((user, index) => (
                          <tr key={index}>
                            <td>{user.username}</td>
                            <td className="session-id">{formatSessionId(user.sessionId)}</td>
                            <td>{user.locations}</td>
                            <td className="text-center">{user.visitCount}</td>
                            <td className="text-right">{formatTime(user.totalTime)}</td>
                            <td>{new Date(user.lastVisit).toLocaleDateString()}</td>
                            <td>
                              <button
                                onClick={() => handleViewDetails(user.sessionId, user.username)}
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
              <WorldMap locations={geoMapData} />
              
              <div className="location-list">
                {geoMapData.length === 0 ? (
                  <p className="no-data">No location data available</p>
                ) : (
                  geoMapData.map((location, index) => (
                    <div key={index} className="location-card">
                      <h4>{location.city || 'Unknown'}, {location.country || 'Unknown'}</h4>
                      <div className="location-stats">
                        <span>Users: {location.userCount}</span>
                        <span>Visits: {location.totalVisits}</span>
                        <span>Time: {formatTime(location.totalTime)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// World Map Component
const WorldMap = ({ locations }) => {
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

  return (
    <div className="map-container">
      <h3>🌍 User Locations</h3>
      <div className="world-map">
        <svg viewBox="0 0 1000 500" className="map-svg">
          {/* Simple world map outline */}
          <image 
            href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Crect fill='%23e8f4f8' width='1000' height='500'/%3E%3Cpath fill='%2393c5db' d='M0 0h1000v500H0z'/%3E%3Cpath fill='%23b8dce8' d='M150 100h700v300H150z'/%3E%3C/svg%3E"
            width="1000" 
            height="500"
          />
          
          {/* Plot user locations as markers */}
          {locations.map((location, index) => {
            // Convert lat/long to SVG coordinates (simplified projection)
            const x = ((location.longitude + 180) / 360) * 1000;
            const y = ((90 - location.latitude) / 180) * 500;
            
            return (
              <g key={index} className="location-marker">
                {/* Pulse circle animation */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="20" 
                  fill="#007bff" 
                  opacity="0.2"
                  className="pulse-circle"
                />
                
                {/* Main marker */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="8" 
                  fill="#007bff" 
                  stroke="white" 
                  strokeWidth="2"
                  className="marker-dot"
                />
                
                {/* Location label */}
                <text 
                  x={x} 
                  y={y - 15} 
                  textAnchor="middle" 
                  className="location-label"
                  fontSize="12"
                  fill="#333"
                  fontWeight="600"
                >
                  {location.city || location.country}
                </text>
                
                {/* User count badge */}
                <g className="user-count-badge">
                  <circle 
                    cx={x + 10} 
                    cy={y - 10} 
                    r="10" 
                    fill="#ff4757" 
                    stroke="white" 
                    strokeWidth="2"
                  />
                  <text 
                    x={x + 10} 
                    y={y - 6} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="white" 
                    fontWeight="bold"
                  >
                    {location.userCount}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;