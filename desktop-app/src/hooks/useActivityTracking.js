// hooks/useActivityTracking.js
import { useEffect, useRef, useCallback } from 'react';
import { activityAPI } from '../services/api';

const INTERVAL_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds


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
    sitting: 0, // Will be converted to reading or idle
  });
  const lastActivityRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const sendIntervalRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

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
      'Sitting': 'idle', // Default sitting to idle
    };
    return activityMap[activity] || 'idle';
  };

  // Calculate time for current activity since last update
  const updateActivityTimes = useCallback(() => {
    const now = Date.now();
    const timeDelta = now - lastUpdateRef.current;
    
    if (lastActivityRef.current && timeDelta > 0) {
      const mappedActivity = mapActivityName(lastActivityRef.current);
      activityTimesRef.current[mappedActivity] += timeDelta;
    }
    
    lastUpdateRef.current = now;
  }, []);

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
      };

      // Calculate total seconds (excluding timestamp fields)
      const totalSeconds = activityData.typing + activityData.writing + activityData.reading + 
                          activityData.phone + activityData.gesturing + activityData.looking_away + 
                          activityData.idle;
      
      // Backend validation requires total <= 600 seconds
      // If total exceeds 600, normalize the values proportionally
      if (totalSeconds > 600) {
        console.log(`⚠️ Total time (${totalSeconds}s) exceeds 600s, normalizing...`);
        const scale = 600 / totalSeconds;
        activityData.typing = Math.round(activityData.typing * scale);
        activityData.writing = Math.round(activityData.writing * scale);
        activityData.reading = Math.round(activityData.reading * scale);
        activityData.phone = Math.round(activityData.phone * scale);
        activityData.gesturing = Math.round(activityData.gesturing * scale);
        activityData.looking_away = Math.round(activityData.looking_away * scale);
        activityData.idle = Math.round(activityData.idle * scale);
      }

      // Only send if there's some activity data
      const finalTotal = activityData.typing + activityData.writing + activityData.reading + 
                        activityData.phone + activityData.gesturing + activityData.looking_away + 
                        activityData.idle;

      console.log('📤 Sending activity batch:', activityData);
      console.log('📊 Total time:', finalTotal, 'seconds');
      
      if (finalTotal > 0) {
        await activityAPI.ingestActivityBatch(activityData);
        console.log('✅ Activity batch sent successfully');
        
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
        sitting: 0,
      };
      lastUpdateRef.current = Date.now();
      
    } catch (error) {
      console.error('Failed to send activity batch:', error);
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
  }, [updateActivityTimes]);

  // Update current activity tracking
  useEffect(() => {
    if (!isActive || !currentActivity) return;

    // Update times for previous activity
    updateActivityTimes();
    
    // Set new activity
    lastActivityRef.current = currentActivity;
  }, [currentActivity, isActive, updateActivityTimes]);

  // Set up 10-minute interval
  useEffect(() => {
    if (!isActive) {
      // Cleanup interval when not active
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
        sendIntervalRef.current = null;
      }
      return;
    }

    // Initialize interval start time
    if (!intervalStartRef.current) {
      intervalStartRef.current = new Date();
      lastUpdateRef.current = Date.now();
    }

    // Set up interval to send data every 10 minutes
    sendIntervalRef.current = setInterval(() => {
      sendActivityBatch();
    }, INTERVAL_DURATION);

    console.log('Activity tracking started - will send data every 10 minutes');

    // Cleanup on unmount
    return () => {
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
      }
      // Send final batch before unmounting
      updateActivityTimes();
      // Don't await here as this is cleanup
      sendActivityBatch().catch(err => 
        console.error('Failed to send final activity batch:', err)
      );
    };
  }, [isActive, sendActivityBatch, updateActivityTimes]);

  // Manual send function
  const sendNow = useCallback(async () => {
    await sendActivityBatch();
  }, [sendActivityBatch]);

  // Get current accumulated times
  const getCurrentStats = useCallback(() => {
    updateActivityTimes();
    return {
      ...activityTimesRef.current,
      intervalStart: intervalStartRef.current,
      timeRemaining: INTERVAL_DURATION - (Date.now() - (intervalStartRef.current?.getTime() || Date.now())),
    };
  }, [updateActivityTimes]);

  return {
    sendNow,
    getCurrentStats,
    isActive,
  };
};

export default useActivityTracking;
