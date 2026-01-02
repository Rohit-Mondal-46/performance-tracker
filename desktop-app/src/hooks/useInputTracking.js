

import { useState, useEffect, useCallback, useRef } from 'react';

const useInputTracking = () => {
  const [keyboardEvents, setKeyboardEvents] = useState([]);
  const [mouseEvents, setMouseEvents] = useState([]);
  const [isTracking, setIsTracking] = useState(true);
  const [trackingInitialized, setTrackingInitialized] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [keyboardStats, setKeyboardStats] = useState({
    totalKeys: 0,
    keysPerMinute: 0,
    lastActivity: null,
    isTyping: false,
    topKeys: []
  });
  const [mouseStats, setMouseStats] = useState({
    totalClicks: 0,
    distance: 0,
    lastPosition: { x: 0, y: 0 },
    averageSpeed: 0,
    clicksPerMinute: 0,
    isMoving: false
  });
  const [activityData, setActivityData] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  
  // Refs to store cleanup functions
  const keyboardEventCleanupRef = useRef(null);
  const mouseEventCleanupRef = useRef(null);
  const analyticsUpdateCleanupRef = useRef(null);
  const trackingInitializedCleanupRef = useRef(null);

  // Initialize tracking
  useEffect(() => {
    if (!window.electronAPI) {
      console.error('electronAPI not available');
      return;
    }

    // Listen for tracking initialization status
    trackingInitializedCleanupRef.current = window.electronAPI.tracking.onTrackingInitialized((data) => {
      console.log('Tracking initialization status:', data);
      if (data.status === 'success') {
        setTrackingInitialized(true);
        setTrackingError(null);
      } else {
        setTrackingInitialized(false);
        setTrackingError(data.error || 'Unknown error');
      }
    });

    // Listen for keyboard events
    keyboardEventCleanupRef.current = window.electronAPI.tracking.onKeyboardEvent((event) => {
      if (!isTracking) return;
      
      setKeyboardEvents(prev => [...prev.slice(-99), event]);
      console.log('Keyboard event:', event);
    });

    // Listen for mouse events
    mouseEventCleanupRef.current = window.electronAPI.tracking.onMouseEvent((event) => {
      if (!isTracking) return;
      
      setMouseEvents(prev => [...prev.slice(-99), event]);
      console.log('Mouse event:', event);
    });
    
    // Listen for analytics updates (this is the key addition)
    analyticsUpdateCleanupRef.current = window.electronAPI.tracking.onAnalyticsUpdate((data) => {
      console.log('Analytics update:', data);
      
      setKeyboardStats(prev => ({
        ...prev,
        totalKeys: data.keyboard.totalKeystrokes,
        keysPerMinute: data.keyboard.keystrokesPerMinute,
        isTyping: data.keyboard.isTyping,
        topKeys: data.keyboard.topKeys,
        lastActivity: new Date().toISOString()
      }));
      
      setMouseStats(prev => ({
        ...prev,
        totalClicks: data.mouse.totalClicks,
        distance: data.mouse.totalDistance,
        averageSpeed: data.mouse.averageSpeed,
        clicksPerMinute: data.mouse.clicksPerMinute,
        isMoving: data.mouse.isMoving,
        lastPosition: data.mouse.lastPosition || prev.lastPosition
      }));
      
      setActivityData(data.combined);
      setLastUpdateTime(Date.now());
    });

    // Cleanup function
    return () => {
      if (keyboardEventCleanupRef.current) keyboardEventCleanupRef.current();
      if (mouseEventCleanupRef.current) mouseEventCleanupRef.current();
      if (analyticsUpdateCleanupRef.current) analyticsUpdateCleanupRef.current();
      if (trackingInitializedCleanupRef.current) trackingInitializedCleanupRef.current();
    };
  }, [isTracking]);

  // Toggle tracking
  const toggleTracking = useCallback((enabled) => {
    setIsTracking(enabled);
    if (window.electronAPI) {
      window.electronAPI.tracking.toggleTracking(enabled);
    }
  }, []);

  // Get keyboard statistics from main process
  const fetchKeyboardStats = useCallback(async () => {
    if (window.electronAPI) {
      const stats = await window.electronAPI.tracking.getKeyboardStats();
      setKeyboardStats(prev => ({ ...prev, ...stats }));
    }
  }, []);

  // Get mouse statistics from main process
  const fetchMouseStats = useCallback(async () => {
    if (window.electronAPI) {
      const stats = await window.electronAPI.tracking.getMouseStats();
      setMouseStats(prev => ({ ...prev, ...stats }));
    }
  }, []);

  // Get detailed statistics
  const fetchDetailedStats = useCallback(async () => {
    if (window.electronAPI) {
      try {
        const stats = await window.electronAPI.tracking.getDetailedStats();
        console.log('Detailed stats:', stats);
        return stats;
      } catch (error) {
        console.error('Error fetching detailed stats:', error);
        return null;
      }
    }
  }, []);

  // Reset statistics
  const resetStats = useCallback(async () => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.tracking.resetStats();
        console.log('Reset stats result:', result);
        
        // Reset local state
        setKeyboardStats({
          totalKeys: 0,
          keysPerMinute: 0,
          lastActivity: null,
          isTyping: false,
          topKeys: []
        });
        
        setMouseStats({
          totalClicks: 0,
          distance: 0,
          lastPosition: { x: 0, y: 0 },
          averageSpeed: 0,
          clicksPerMinute: 0,
          isMoving: false
        });
        
        setActivityData(null);
        setKeyboardEvents([]);
        setMouseEvents([]);
        
        return result;
      } catch (error) {
        console.error('Error resetting stats:', error);
        return { success: false, message: error.message };
      }
    }
  }, []);

  // Get 5-minute summary
  const getFiveMinuteSummary = useCallback(() => {
    return {
      timestamp: Date.now(),
      keyboard: keyboardStats,
      mouse: mouseStats,
      activity: activityData,
      lastUpdateTime
    };
  }, [keyboardStats, mouseStats, activityData, lastUpdateTime]);

  return {
    keyboardEvents,
    mouseEvents,
    keyboardStats,
    mouseStats,
    activityData,
    isTracking,
    trackingInitialized,
    trackingError,
    lastUpdateTime,
    toggleTracking,
    fetchKeyboardStats,
    fetchMouseStats,
    fetchDetailedStats,
    resetStats,
    getFiveMinuteSummary
  };
};

export default useInputTracking;