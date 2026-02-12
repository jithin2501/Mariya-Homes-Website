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

  const exportFullVisitDetails = async () => {
    if (userAnalytics.length === 0) return;
    
    try {
      const allVisits = [];
      
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

// World Map Component with proper world map background
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
        <svg viewBox="0 0 2000 1000" className="map-svg" preserveAspectRatio="xMidYMid meet">
          {/* Ocean background */}
          <rect width="2000" height="1000" fill="#a8dadc"/>
          
          {/* Simplified world continents */}
          {/* North America */}
          <path d="M 100 200 L 150 150 L 250 170 L 320 140 L 380 160 L 420 200 L 450 280 L 480 350 L 460 420 L 420 450 L 380 480 L 320 490 L 260 480 L 220 450 L 180 400 L 150 350 L 120 280 Z" fill="#457b9d" opacity="0.7"/>
          
          {/* South America */}
          <path d="M 350 520 L 400 550 L 430 620 L 440 710 L 420 780 L 380 820 L 340 840 L 300 830 L 280 780 L 270 700 L 290 620 L 320 550 Z" fill="#457b9d" opacity="0.7"/>
          
          {/* Europe */}
          <path d="M 850 180 L 950 160 L 1050 190 L 1100 240 L 1080 300 L 1020 330 L 950 320 L 880 290 L 840 240 Z" fill="#457b9d" opacity="0.7"/>
          
          {/* Africa */}
          <path d="M 900 380 L 980 360 L 1080 390 L 1130 460 L 1140 550 L 1120 650 L 1080 730 L 1000 780 L 920 760 L 870 700 L 850 620 L 860 530 L 880 440 Z" fill="#457b9d" opacity="0.7"/>
          
          {/* Asia */}
          <path d="M 1200 150 L 1400 120 L 1600 140 L 1750 180 L 1850 240 L 1880 320 L 1860 400 L 1800 460 L 1700 500 L 1600 520 L 1500 510 L 1400 480 L 1300 430 L 1220 360 L 1180 280 L 1170 210 Z" fill="#457b9d" opacity="0.7"/>
          
          {/* Australia */}
          <path d="M 1550 700 L 1650 680 L 1750 700 L 1800 750 L 1790 820 L 1740 870 L 1660 880 L 1580 860 L 1530 810 L 1520 750 Z" fill="#457b9d" opacity="0.7"/>
          
          {/* India */}
          <path d="M 1280 400 L 1360 380 L 1420 420 L 1440 500 L 1420 580 L 1380 620 L 1320 630 L 1270 600 L 1250 530 L 1260 460 Z" fill="#457b9d" opacity="0.7"/>
          
          {/* Plot user locations as markers */}
          {locations.map((location, index) => {
            // Convert lat/long to SVG coordinates
            const x = ((location.longitude + 180) / 360) * 2000;
            const y = ((90 - location.latitude) / 180) * 1000;
            
            return (
              <g key={index} className="location-marker">
                {/* Pulse circle animation */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="30" 
                  fill="#e63946" 
                  opacity="0.3"
                  className="pulse-circle"
                />
                
                {/* Main marker dot */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="12" 
                  fill="#e63946" 
                  stroke="white" 
                  strokeWidth="3"
                  className="marker-dot"
                />
                
                {/* Location label with background */}
                <g className="location-label-group">
                  <rect
                    x={x - 60}
                    y={y - 35}
                    width="120"
                    height="20"
                    fill="white"
                    opacity="0.9"
                    rx="4"
                  />
                  <text 
                    x={x} 
                    y={y - 20} 
                    textAnchor="middle" 
                    className="location-label"
                    fontSize="14"
                    fill="#1d3557"
                    fontWeight="700"
                  >
                    {location.city || location.country}
                  </text>
                </g>
                
                {/* User count badge */}
                <g className="user-count-badge">
                  <circle 
                    cx={x + 15} 
                    cy={y - 15} 
                    r="14" 
                    fill="#f77f00" 
                    stroke="white" 
                    strokeWidth="3"
                  />
                  <text 
                    x={x + 15} 
                    y={y - 10} 
                    textAnchor="middle" 
                    fontSize="12" 
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