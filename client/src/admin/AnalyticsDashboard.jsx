import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  
  // API configuration - Use relative paths for same-domain deployment
  const API_BASE_URL = ''; // Empty string = relative URLs, works for both dev and production
  
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

  // Initialize dates to last month
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    setStartDate(formatDate(lastMonth));
    setEndDate(formatDate(today));
  }, []);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if backend is running
  const checkBackendConnection = async () => {
    setIsCheckingBackend(true);
    setError(null);
    
    try {
      console.log('Checking backend connection...');
      
      // Use relative URL - works for both localhost and production
      const response = await fetch(`/api/analytics/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend connection successful:', data);
        setBackendStatus('connected');
        setError(null);
        
        // Now fetch analytics data
        fetchAnalytics();
        fetchGeoMapData();
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
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
      console.log('Fetching analytics from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('Analytics data received:', data);
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
      console.log('Fetching geo map data from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response for geo map data');
      }
      
      const data = await response.json();
      console.log('Geo map data received:', data);
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
    
    // Auto-fetch after setting date range if backend is connected
    setTimeout(() => {
      if (backendStatus === 'connected') {
        fetchAnalytics();
        fetchGeoMapData();
      }
    }, 100);
  };

  // Format session ID to show only the unique number part
  const formatSessionId = (sessionId) => {
    if (!sessionId) return 'N/A';
    // Remove "session_" prefix and show only the unique part
    return sessionId.replace('session_', '').substring(0, 16);
  };

  // Render backend connection status
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

      {/* Backend Connection Status */}
      {renderBackendStatus()}

      {/* Error Message with Troubleshooting */}
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
                <div className="expected-response">Expected: {"{"}"message":"Analytics routes are working!","timestamp":"..."{"}"}</div>
              </li>
              <li>
                <strong>Check if the server is responding:</strong>
                <div>The API should be available at the same domain as this application</div>
              </li>
              <li>
                <strong>For local development:</strong>
                <div>Make sure your backend server is running on the same port or using proxy</div>
              </li>
            </ol>
            
            <div className="action-buttons">
              <button onClick={checkBackendConnection} className="retry-btn">
                🔄 Test Connection Again
              </button>
              <button onClick={() => window.open('/api/analytics/test', '_blank')} className="test-btn">
                🧪 Open Test Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Filter Section */}
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

      {/* Tabs */}
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

      {/* Content based on connection status */}
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
          {/* User Analytics Tab */}
          {activeTab === 'user' && (
            <div className="user-analytics-section">
              <div className="export-buttons">
                <button 
                  onClick={() => {/* export function */}} 
                  className="export-btn"
                  disabled={loading || userAnalytics.length === 0}
                >
                  EXPORT USERS
                </button>
                <button 
                  onClick={() => {/* export function */}} 
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

          {/* Geo Map Analytics Tab */}
          {activeTab === 'geo' && (
            <div className="geo-map-section">
              <div className="map-container">
                <h3>🌍 User Locations</h3>
                {geoMapData.length === 0 ? (
                  <p className="no-data">No location data available</p>
                ) : (
                  <div className="location-list">
                    {geoMapData.map((location, index) => (
                      <div key={index} className="location-card">
                        <h4>{location.city || 'Unknown'}, {location.country || 'Unknown'}</h4>
                        <div className="location-stats">
                          <span>Users: {location.userCount}</span>
                          <span>Visits: {location.totalVisits}</span>
                          <span>Time: {formatTime(location.totalTime)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;