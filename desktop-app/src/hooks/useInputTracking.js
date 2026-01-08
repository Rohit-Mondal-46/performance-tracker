

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

    // No real-time event listeners needed - tracking happens in main process

    // Cleanup function
    return () => {
      // No cleanup needed for snapshot-based tracking
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

  // Get detailed statistics (snapshot from main process)
  const fetchDetailedStats = useCallback(async () => {
    if (window.electronAPI?.tracking?.getSnapshot) {
      try {
        const stats = await window.electronAPI.tracking.getSnapshot();
        // Update local state with snapshot
        if (stats?.keyboard) {
          setKeyboardStats(prev => ({
            ...prev,
            totalKeys: stats.keyboard.totalKeys || 0,
          }));
          setMouseStats(prev => ({
            ...prev,
            totalClicks: stats.keyboard.totalClicks || 0,
            distance: stats.keyboard.mouseDistance || 0,
          }));
        }
        return stats;
      } catch (error) {
        console.error('Error fetching snapshot:', error);
        return null;
      }
    }
  }, []);

  // Reset statistics
  const resetStats = useCallback(async () => {
    if (window.electronAPI?.tracking?.reset) {
      try {
        const result = await window.electronAPI.tracking.reset();
        console.log('✅ Tracking reset:', result);
        
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