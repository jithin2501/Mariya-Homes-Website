const Analytics = require('../models/Analytics');

// Track user visit
exports.trackVisit = async (req, res) => {
  try {
    const { sessionId, username, location, district, timeSpent, exitReason } = req.body;
    
    // Get IP address from request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    let analytics = await Analytics.findOne({ sessionId });

    if (analytics) {
      // Update existing session
      analytics.visits.push({
        location,
        district: district || 'N/A',
        timeSpent,
        exitReason,
        timestamp: new Date()
      });
      analytics.lastVisit = new Date();
      if (username && username !== 'Anonymous') {
        analytics.username = username;
      }
    } else {
      // Create new analytics entry
      analytics = new Analytics({
        sessionId,
        username: username || 'Anonymous',
        visits: [{
          location,
          district: district || 'N/A',
          timeSpent,
          exitReason,
          timestamp: new Date()
        }],
        ipAddress,
        userAgent,
        firstVisit: new Date(),
        lastVisit: new Date()
      });
    }

    await analytics.save();
    res.status(200).json({ message: 'Visit tracked successfully' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ message: 'Error tracking visit', error: error.message });
  }
};

// Update user location data (from IP geolocation)
exports.updateLocation = async (req, res) => {
  try {
    const { sessionId, city, region, country, latitude, longitude } = req.body;

    const analytics = await Analytics.findOne({ sessionId });
    if (analytics) {
      analytics.location = {
        city,
        region,
        country,
        latitude,
        longitude
      };
      await analytics.save();
      res.status(200).json({ message: 'Location updated successfully' });
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

// Get all analytics data with filters
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.lastVisit = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Analytics.find(query).sort({ lastVisit: -1 });

    // Process data for user analytics table
    const userAnalytics = analytics.map(session => {
      const locations = [...new Set(session.visits.map(v => v.location))];
      const districts = [...new Set(session.visits.map(v => v.district).filter(d => d !== 'N/A'))];
      const totalTimeSpent = session.visits.reduce((sum, v) => sum + v.timeSpent, 0);
      
      return {
        username: session.username,
        sessionId: session.sessionId,
        locations: locations.join(', '),
        districts: districts.length > 0 ? districts.join(', ') : 'N/A',
        visitCount: session.visits.length,
        totalTime: totalTimeSpent,
        lastVisit: session.lastVisit,
        location: session.location
      };
    });

    res.status(200).json({ userAnalytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get detailed visit history for a specific user
exports.getUserDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const analytics = await Analytics.findOne({ sessionId });
    if (!analytics) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      username: analytics.username,
      visits: analytics.visits.sort((a, b) => b.timestamp - a.timestamp),
      location: analytics.location,
      firstVisit: analytics.firstVisit,
      lastVisit: analytics.lastVisit
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

// Get geo map data
exports.getGeoMapData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.lastVisit = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Analytics.find(query);

    // Process data for geo map
    const geoData = analytics
      .filter(session => session.location && session.location.latitude && session.location.longitude)
      .map(session => ({
        username: session.username,
        latitude: session.location.latitude,
        longitude: session.location.longitude,
        city: session.location.city,
        region: session.location.region,
        country: session.location.country,
        visitCount: session.visits.length,
        totalTime: session.visits.reduce((sum, v) => sum + v.timeSpent, 0)
      }));

    // Group by location for better visualization
    const locationGroups = {};
    geoData.forEach(item => {
      const key = `${item.latitude},${item.longitude}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          latitude: item.latitude,
          longitude: item.longitude,
          city: item.city,
          region: item.region,
          country: item.country,
          users: [],
          totalVisits: 0,
          totalTime: 0
        };
      }
      locationGroups[key].users.push(item.username);
      locationGroups[key].totalVisits += item.visitCount;
      locationGroups[key].totalTime += item.totalTime;
    });

    const mapData = Object.values(locationGroups).map(group => ({
      ...group,
      userCount: group.users.length
    }));

    res.status(200).json({ mapData });
  } catch (error) {
    console.error('Error fetching geo map data:', error);
    res.status(500).json({ message: 'Error fetching geo map data', error: error.message });
  }
};

// Export full visit details
exports.exportVisitDetails = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.lastVisit = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Analytics.find(query).sort({ lastVisit: -1 });

    // Flatten all visits for export
    const exportData = [];
    analytics.forEach(session => {
      session.visits.forEach(visit => {
        exportData.push({
          username: session.username,
          sessionId: session.sessionId,
          location: visit.location,
          district: visit.district,
          timeSpent: visit.timeSpent,
          exitReason: visit.exitReason,
          timestamp: visit.timestamp,
          city: session.location?.city || 'N/A',
          region: session.location?.region || 'N/A',
          country: session.location?.country || 'N/A'
        });
      });
    });

    res.status(200).json({ visits: exportData });
  } catch (error) {
    console.error('Error exporting visit details:', error);
    res.status(500).json({ message: 'Error exporting visit details', error: error.message });
  }
};

// Export user list
exports.exportUsers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.lastVisit = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Analytics.find(query).sort({ lastVisit: -1 });

    const exportData = analytics.map(session => {
      const locations = [...new Set(session.visits.map(v => v.location))];
      const districts = [...new Set(session.visits.map(v => v.district).filter(d => d !== 'N/A'))];
      
      return {
        username: session.username,
        sessionId: session.sessionId,
        locations: locations.join(', '),
        districts: districts.join(', '),
        visitCount: session.visits.length,
        totalTime: session.visits.reduce((sum, v) => sum + v.timeSpent, 0),
        firstVisit: session.firstVisit,
        lastVisit: session.lastVisit,
        city: session.location?.city || 'N/A',
        region: session.location?.region || 'N/A',
        country: session.location?.country || 'N/A'
      };
    });

    res.status(200).json({ users: exportData });
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Error exporting users', error: error.message });
  }
};
// Get graph data for users over time
exports.getGraphData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all analytics within the date range
    const analytics = await Analytics.find({
      firstVisit: {
        $gte: start,
        $lt: end
      }
    }).sort({ firstVisit: 1 });

    // Group users by date
    const usersByDate = {};
    analytics.forEach(session => {
      const dateKey = new Date(session.firstVisit).toISOString().split('T')[0];
      if (!usersByDate[dateKey]) {
        usersByDate[dateKey] = 0;
      }
      usersByDate[dateKey]++;
    });

    // Convert to array format for frontend
    const newUsers = Object.keys(usersByDate).map(date => ({
      date,
      count: usersByDate[date]
    }));

    // Calculate monthly comparison
    const currentPeriodUsers = analytics.length;
    
    // Get last month's data for comparison
    const lastMonthStart = new Date(start);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(start);

    const lastMonthAnalytics = await Analytics.find({
      firstVisit: {
        $gte: lastMonthStart,
        $lt: lastMonthEnd
      }
    });

    const lastMonthUsers = lastMonthAnalytics.length;
    const difference = currentPeriodUsers - lastMonthUsers;
    const percentageChange = lastMonthUsers > 0 
      ? ((difference / lastMonthUsers) * 100) 
      : (currentPeriodUsers > 0 ? 100 : 0);

    const comparison = {
      lastMonth: lastMonthUsers,
      currentPeriod: currentPeriodUsers,
      difference,
      percentageChange
    };

    res.status(200).json({ 
      newUsers,
      comparison
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ message: 'Error fetching graph data', error: error.message });
  }
};