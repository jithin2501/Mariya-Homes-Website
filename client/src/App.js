// analyticsTracker.js - Client-side analytics tracking

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.currentPage = null;
    this.pageStartTime = null;
    this.username = 'Anonymous';
    this.initialized = false;
  }

  // Generate or retrieve session ID
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Initialize tracker
  init(username = 'Anonymous') {
    if (this.initialized) return;
    
    this.username = username;
    this.initialized = true;

    // Track page views
    this.trackPageView();

    // Get user location
    this.getUserLocation();

    // Listen for page changes
    window.addEventListener('popstate', () => this.trackPageView());

    // Track when user leaves the page
    window.addEventListener('beforeunload', () => this.trackPageExit());

    // Track visibility changes (tab switches)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageExit();
      } else {
        this.trackPageView();
      }
    });
  }

  // Set username when user logs in
  setUsername(username) {
    this.username = username;
  }

  // Get current page information
  getCurrentPageInfo() {
    const path = window.location.pathname;
    let pageName = 'Home';
    let district = 'N/A';

    // Map routes to page names and districts
    if (path === '/' || path === '/home') {
      pageName = 'Home';
      district = 'Main';
    } else if (path.includes('/properties')) {
      if (path.match(/\/properties\/[^/]+$/)) {
        pageName = 'Property Details';
        district = 'Properties';
      } else {
        pageName = 'Properties';
        district = 'Listings';
      }
    } else if (path.includes('/construction')) {
      pageName = 'Construction';
      district = 'Services';
    } else if (path.includes('/renovation')) {
      pageName = 'Renovation';
      district = 'Services';
    } else if (path.includes('/contact')) {
      pageName = 'Contact';
      district = 'Main';
    } else if (path.includes('/admin')) {
      pageName = 'Admin Panel';
      district = 'Admin';
    } else if (path.includes('/login')) {
      pageName = 'Login';
      district = 'Auth';
    } else if (path.includes('/gallery')) {
      pageName = 'Gallery';
      district = 'Media';
    } else {
      pageName = path.replace('/', '') || 'Home';
      district = 'Other';
    }

    return { pageName, district };
  }

  // Track page view
  trackPageView() {
    // If there's a previous page, track exit
    if (this.currentPage) {
      this.trackPageExit();
    }

    const { pageName, district } = this.getCurrentPageInfo();
    this.currentPage = pageName;
    this.pageStartTime = Date.now();

    console.log('Tracking page view:', pageName);
  }

  // Track page exit
  trackPageExit() {
    if (!this.currentPage || !this.pageStartTime) return;

    const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000); // Convert to seconds
    const { pageName: nextPage } = this.getCurrentPageInfo();
    
    let exitReason = 'Unknown';
    if (nextPage !== this.currentPage) {
      exitReason = `User navigated inside site (from ${this.currentPage} → ${nextPage})`;
    } else if (document.hidden) {
      exitReason = 'Tab switched or minimized';
    } else {
      exitReason = `Tab closed or reloaded (from ${this.currentPage} → Unknown Location)`;
    }

    const { district } = this.getCurrentPageInfo();

    this.sendTrackingData({
      location: this.currentPage,
      district,
      timeSpent,
      exitReason
    });

    console.log('Tracking exit:', this.currentPage, timeSpent + 's');
  }

  // Send tracking data to server
  async sendTrackingData(visitData) {
    try {
      await fetch('/api/analytics/track-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          username: this.username,
          ...visitData
        }),
        keepalive: true // Ensures the request completes even if page is closing
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }

  // Get user location using IP geolocation
  async getUserLocation() {
    try {
      // Using ipapi.co for free IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data.latitude && data.longitude) {
        await fetch('/api/analytics/update-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            city: data.city,
            region: data.region,
            country: data.country_name,
            latitude: data.latitude,
            longitude: data.longitude
          })
        });
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }

  // Manual tracking for custom events
  trackCustomEvent(eventName, metadata = {}) {
    this.sendTrackingData({
      location: eventName,
      district: metadata.district || 'N/A',
      timeSpent: 0,
      exitReason: 'Custom Event',
      ...metadata
    });
  }
}

// Create singleton instance
const analyticsTracker = new AnalyticsTracker();

export default analyticsTracker;