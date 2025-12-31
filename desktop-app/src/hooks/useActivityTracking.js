
import { useEffect, useRef, useCallback } from 'react';
import { activityAPI } from '../services/api';
import useInputTracking from './useInputTracking';

const INTERVAL_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const useActivityTracking = (currentActivity, isActive = true, onSuccess = null, onError = null) => {
  const intervalStartRef = useRef(null);
  const activityTimesRef = useRef({
    typing: 0,
    writing: 0,
    reading: 0,
    phone: 0,
    gesturing: 0,
    looking_away: 0,
    idle: 0,
    mouse_activity: 0,
    keyboard_activity: 0,
  });
  
  const lastActivityRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const sendIntervalRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Use input tracking hook
  const {
    keyboardStats,
    mouseStats,
    isTracking: inputTracking,
    toggleTracking: toggleInputTracking,
    fetchKeyboardStats,
    fetchMouseStats,
  } = useInputTracking();
  
  // Track input activity counts
  const inputActivityRef = useRef({
    lastKeyboardCount: 0,
    lastMouseCount: 0,
    keyboardActiveTime: 0,
    mouseActiveTime: 0,
  });

  // Update callback refs
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Map activity names to API format
  const mapActivityName = (activity) => {
    const activityMap = {
      'Typing': 'typing',
      'Writing': 'writing',
      'Reading': 'reading',
      'Phone': 'phone',
      'Gesturing': 'gesturing',
      'Looking Away': 'looking_away',
      'Sitting': 'idle',
      'Mouse Activity': 'mouse_activity',
      'Keyboard Activity': 'keyboard_activity',
    };
    return activityMap[activity] || 'idle';
  };

  // Calculate input activity time based on keyboard and mouse events
  const calculateInputActivityTime = useCallback(() => {
    const now = Date.now();
    const timeDelta = now - lastUpdateRef.current;
    
    // Calculate keyboard active time (if there were keystrokes)
    if (keyboardStats.totalKeys > inputActivityRef.current.lastKeyboardCount) {
      // Add time based on keystroke frequency
      const newKeys = keyboardStats.totalKeys - inputActivityRef.current.lastKeyboardCount;
      const keyRatePerSecond = newKeys / (timeDelta / 1000);
      
      // Scale activity time based on key rate (adjust these thresholds as needed)
      let keyboardTime = 0;
      if (keyRatePerSecond > 0.5) { // More than 0.5 keys per second = active typing
        keyboardTime = timeDelta * 0.8; // 80% of time considered active
      } else if (keyRatePerSecond > 0.1) { // Light typing
        keyboardTime = timeDelta * 0.3; // 30% of time considered active
      }
      
      inputActivityRef.current.keyboardActiveTime += keyboardTime;
      inputActivityRef.current.lastKeyboardCount = keyboardStats.totalKeys;
    }

    // Calculate mouse active time
    if (mouseStats.totalClicks > inputActivityRef.current.lastMouseCount) {
      // Add time for clicks
      inputActivityRef.current.mouseActiveTime += timeDelta * 0.5; // 50% of time around clicks
      inputActivityRef.current.lastMouseCount = mouseStats.totalClicks;
    }
    
    // Add mouse movement activity (if significant movement)
    if (mouseStats.distance > 100) { // Arbitrary threshold for significant movement
      inputActivityRef.current.mouseActiveTime += timeDelta * 0.3; // 30% for movement
    }

    // Distribute input activity time to appropriate categories
    if (lastActivityRef.current === 'Typing' || lastActivityRef.current === 'Writing') {
      // If user is already in typing/writing activity, prioritize keyboard time
      activityTimesRef.current.keyboard_activity = Math.min(
        activityTimesRef.current.keyboard_activity + inputActivityRef.current.keyboardActiveTime,
        timeDelta
      );
      activityTimesRef.current.mouse_activity = Math.min(
        activityTimesRef.current.mouse_activity + inputActivityRef.current.mouseActiveTime,
        timeDelta - inputActivityRef.current.keyboardActiveTime
      );
    } else {
      // Otherwise distribute based on input type
      activityTimesRef.current.mouse_activity = Math.min(
        activityTimesRef.current.mouse_activity + inputActivityRef.current.mouseActiveTime,
        timeDelta
      );
      activityTimesRef.current.keyboard_activity = Math.min(
        activityTimesRef.current.keyboard_activity + inputActivityRef.current.keyboardActiveTime,
        timeDelta - inputActivityRef.current.mouseActiveTime
      );
    }

    // Reset for next calculation
    inputActivityRef.current.keyboardActiveTime = 0;
    inputActivityRef.current.mouseActiveTime = 0;
  }, [keyboardStats.totalKeys, mouseStats.totalClicks, mouseStats.distance]);

  // Calculate time for current activity since last update
  const updateActivityTimes = useCallback(() => {
    const now = Date.now();
    const timeDelta = now - lastUpdateRef.current;
    
    // Calculate input-based activity first
    calculateInputActivityTime();
    
    // Then update regular activity
    if (lastActivityRef.current && timeDelta > 0) {
      const mappedActivity = mapActivityName(lastActivityRef.current);
      
      // Distribute time based on input activity if relevant
      if (mappedActivity === 'typing' || mappedActivity === 'writing') {
        // Reduce typing/writing time based on keyboard activity already counted
        const remainingTime = Math.max(0, timeDelta - activityTimesRef.current.keyboard_activity);
        activityTimesRef.current[mappedActivity] += remainingTime;
      } else if (mappedActivity === 'reading' || mappedActivity === 'idle') {
        // Reduce reading/idle time based on mouse activity
        const remainingTime = Math.max(0, timeDelta - activityTimesRef.current.mouse_activity);
        activityTimesRef.current[mappedActivity] += remainingTime;
      } else {
        activityTimesRef.current[mappedActivity] += timeDelta;
      }
    }
    
    lastUpdateRef.current = now;
  }, [calculateInputActivityTime]);

  // Auto-detect activity based on input patterns
  const autoDetectActivityFromInput = useCallback(() => {
    if (!isActive || !inputTracking) return null;
    
    const timeWindow = 30000; // 30 seconds window
    const now = Date.now();
    
    // Check keyboard activity rate
    const keyboardRate = keyboardStats.keysPerMinute / 60; // Convert to keys per second
    const mouseRate = mouseStats.clicksPerMinute / 60; // Convert to clicks per second
    
    // Activity detection logic
    if (keyboardRate > 1) { // More than 1 key per second
      if (keyboardRate > 3) {
        return 'Typing'; // Fast typing
      }
      return 'Writing'; // Slow typing/writing
    } else if (mouseRate > 0.5 || mouseStats.distance > 500) {
      return 'Reading'; // Active mouse movement suggests reading/scrolling
    } else if (keyboardRate > 0.1 || mouseRate > 0.1) {
      return 'Reading'; // Light activity
    }
    
    return 'idle';
  }, [isActive, inputTracking, keyboardStats.keysPerMinute, mouseStats.clicksPerMinute, mouseStats.distance]);

  // Send activity batch to backend
  const sendActivityBatch = useCallback(async () => {
    if (isSubmittingRef.current) {
      console.log('Already submitting, skipping...');
      return;
    }

    try {
      isSubmittingRef.current = true;
      
      // Update times one last time before sending
      updateActivityTimes();
      
      const intervalEnd = new Date();
      const intervalStart = intervalStartRef.current || new Date(intervalEnd.getTime() - INTERVAL_DURATION);
      
      // Convert milliseconds to seconds for API
      let activityData = {
        interval_start: intervalStart.toISOString(),
        interval_end: intervalEnd.toISOString(),
        typing: Math.round(activityTimesRef.current.typing / 1000),
        writing: Math.round(activityTimesRef.current.writing / 1000),
        reading: Math.round(activityTimesRef.current.reading / 1000),
        phone: Math.round(activityTimesRef.current.phone / 1000),
        gesturing: Math.round(activityTimesRef.current.gesturing / 1000),
        looking_away: Math.round(activityTimesRef.current.looking_away / 1000),
        idle: Math.round(activityTimesRef.current.idle / 1000),
        // New input-based metrics
        mouse_activity: Math.round(activityTimesRef.current.mouse_activity / 1000),
        keyboard_activity: Math.round(activityTimesRef.current.keyboard_activity / 1000),
        input_metrics: {
          total_keys: keyboardStats.totalKeys,
          total_clicks: mouseStats.totalClicks,
          mouse_distance: Math.round(mouseStats.distance),
          avg_keys_per_min: keyboardStats.keysPerMinute || 0,
          avg_clicks_per_min: mouseStats.clicksPerMinute || 0,
          avg_mouse_speed: mouseStats.averageSpeed || 0
        }
      };

      // Calculate total seconds for validation
      const totalSeconds = activityData.typing + activityData.writing + activityData.reading + 
                          activityData.phone + activityData.gesturing + activityData.looking_away + 
                          activityData.idle + activityData.mouse_activity + activityData.keyboard_activity;
      
      // Backend validation requires total <= 300 seconds (5 minutes)
      // If total exceeds 300, normalize the values proportionally
      if (totalSeconds > 300) {
        console.log(`⚠️ Total time (${totalSeconds}s) exceeds 300s, normalizing...`);
        const scale = 300 / totalSeconds;
        Object.keys(activityData).forEach(key => {
          if (typeof activityData[key] === 'number' && key !== 'input_metrics') {
            activityData[key] = Math.round(activityData[key] * scale);
          }
        });
      }

      console.log('📤 Sending 5-minute activity batch:', activityData);
      
      if (totalSeconds > 0) {
        // Send to API
        await activityAPI.ingestActivityBatch(activityData);
        console.log('✅ 5-minute activity batch sent successfully');
        
        // Call success callback if provided
        if (onSuccessRef.current) {
          onSuccessRef.current(activityData);
        }
      } else {
        console.log('No activity data to send');
      }

      // Reset for next interval
      intervalStartRef.current = new Date();
      activityTimesRef.current = {
        typing: 0,
        writing: 0,
        reading: 0,
        phone: 0,
        gesturing: 0,
        looking_away: 0,
        idle: 0,
        mouse_activity: 0,
        keyboard_activity: 0,
      };
      lastUpdateRef.current = Date.now();
      
      // Reset input counters
      inputActivityRef.current = {
        lastKeyboardCount: keyboardStats.totalKeys,
        lastMouseCount: mouseStats.totalClicks,
        keyboardActiveTime: 0,
        mouseActiveTime: 0,
      };
      
    } catch (error) {
      console.error('Failed to send 5-minute activity batch:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      // Call error callback if provided
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }, [updateActivityTimes, keyboardStats, mouseStats]);

  // Update current activity tracking with auto-detection
  useEffect(() => {
    if (!isActive) return;
    
    let finalActivity = currentActivity;
    
    // If no explicit activity is set, try to auto-detect from input
    if (!currentActivity || currentActivity === 'Sitting' || currentActivity === 'idle') {
      const detectedActivity = autoDetectActivityFromInput();
      if (detectedActivity) {
        finalActivity = detectedActivity;
      }
    }
    
    // Update times for previous activity
    updateActivityTimes();
    
    // Set new activity
    lastActivityRef.current = finalActivity;
    
    // Log activity changes for debugging
    if (lastActivityRef.current !== finalActivity) {
      console.log(`Activity changed to: ${finalActivity}`, {
        keyboardKeys: keyboardStats.totalKeys,
        mouseClicks: mouseStats.totalClicks
      });
    }
  }, [currentActivity, isActive, updateActivityTimes, autoDetectActivityFromInput, keyboardStats.totalKeys, mouseStats.totalClicks]);

  // Set up 5-minute interval
  useEffect(() => {
    if (!isActive) {
      // Cleanup interval when not active
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
        sendIntervalRef.current = null;
      }
      // Pause input tracking
      toggleInputTracking(false);
      return;
    }

    // Start input tracking when activity tracking is active
    toggleInputTracking(true);
    
    // Initialize interval start time
    if (!intervalStartRef.current) {
      intervalStartRef.current = new Date();
      lastUpdateRef.current = Date.now();
      inputActivityRef.current = {
        lastKeyboardCount: keyboardStats.totalKeys,
        lastMouseCount: mouseStats.totalClicks,
        keyboardActiveTime: 0,
        mouseActiveTime: 0,
      };
    }

    // Set up interval to send data every 5 minutes
    sendIntervalRef.current = setInterval(() => {
      sendActivityBatch();
    }, INTERVAL_DURATION);

    console.log('Activity tracking started - will send data every 5 minutes');

    // Cleanup on unmount
    return () => {
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
      }
      // Pause input tracking
      toggleInputTracking(false);
      
      // Send final batch before unmounting
      updateActivityTimes();
      sendActivityBatch().catch(err => 
        console.error('Failed to send final activity batch:', err)
      );
    };
  }, [isActive, sendActivityBatch, updateActivityTimes, toggleInputTracking, keyboardStats.totalKeys, mouseStats.totalClicks]);

  // Manual send function
  const sendNow = useCallback(async () => {
    await sendActivityBatch();
  }, [sendActivityBatch]);

  // Get current accumulated times with input metrics
  const getCurrentStats = useCallback(() => {
    updateActivityTimes();
    return {
      ...activityTimesRef.current,
      intervalStart: intervalStartRef.current,
      timeRemaining: INTERVAL_DURATION - (Date.now() - (intervalStartRef.current?.getTime() || Date.now())),
      inputMetrics: {
        keyboard: keyboardStats,
        mouse: mouseStats,
        inputTracking,
      },
      currentActivity: lastActivityRef.current,
      autoDetectedActivity: autoDetectActivityFromInput(),
    };
  }, [updateActivityTimes, keyboardStats, mouseStats, inputTracking, autoDetectActivityFromInput]);

  // Toggle input tracking separately
  const toggleActivityTracking = useCallback((enabled) => {
    toggleInputTracking(enabled);
  }, [toggleInputTracking]);

  return {
    sendNow,
    getCurrentStats,
    isActive,
    inputTracking,
    toggleActivityTracking,
    keyboardStats,
    mouseStats,
    currentActivity: lastActivityRef.current,
  };
};

export default useActivityTracking;
