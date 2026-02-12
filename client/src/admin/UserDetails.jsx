import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './styles/UserDetails.css';

const UserDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || 'User';

  const [visits, setVisits] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

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
    downloadCSV(csv, `${username}_visit_history.csv`);
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
        <button onClick={() => navigate('/admin/analytics')} className="back-btn">
          ← Back to Analytics
        </button>
        <h1>User Details — {username}</h1>
      </div>

      <button onClick={exportUserHistory} className="export-history-btn">
        EXPORT THIS USER'S FULL HISTORY
      </button>

      {userLocation && (
        <div className="location-info">
          <h3>User Location Information</h3>
          <p>
            <strong>City:</strong> {userLocation.city || 'N/A'} | 
            <strong> Region:</strong> {userLocation.region || 'N/A'} | 
            <strong> Country:</strong> {userLocation.country || 'N/A'}
          </p>
          {userLocation.latitude && userLocation.longitude && (
            <p>
              <strong>Coordinates:</strong> {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </p>
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
            visits.map((visit, index) => (
              <div key={index} className="visit-card">
                <div className="visit-header">
                  <h4>Visit #{visits.length - index}</h4>
                  <span className="visit-time">{new Date(visit.timestamp).toLocaleString()}</span>
                </div>
                <div className="visit-details">
                  <p><strong>Location:</strong> {visit.location}</p>
                  <p><strong>District:</strong> {visit.district}</p>
                  <p><strong>Time:</strong> {formatTime(visit.timeSpent)}</p>
                  <p><strong>Exit:</strong> {visit.exitReason}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetails;