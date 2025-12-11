// Example: How to use useActivityTracking hook

import { useState } from 'react';
import useActivityTracking from '../hooks/useActivityTracking';

const MyComponent = () => {
  const [currentActivity, setCurrentActivity] = useState('Typing');
  const [isTracking, setIsTracking] = useState(true);

  // Success callback
  const handleSuccess = (data) => {
    console.log('Data sent successfully:', data);
    // Show notification, update UI, etc.
  };

  // Error callback
  const handleError = (error) => {
    console.error('Failed to send data:', error);
    // Show error message, retry logic, etc.
  };

  // Use the hook
  const { sendNow, getCurrentStats } = useActivityTracking(
    currentActivity,      // Current activity string
    isTracking,          // Boolean to enable/disable tracking
    handleSuccess,       // Optional success callback
    handleError          // Optional error callback
  );

  // Get current statistics
  const stats = getCurrentStats();
  console.log('Current stats:', {
    typing: stats.typing,
    writing: stats.writing,
    reading: stats.reading,
    phone: stats.phone,
    gesturing: stats.gesturing,
    looking_away: stats.looking_away,
    idle: stats.idle,
    intervalStart: stats.intervalStart,
    timeRemaining: stats.timeRemaining, // milliseconds until next sync
  });

  return (
    <div>
      <h1>Current Activity: {currentActivity}</h1>
      <button onClick={() => setCurrentActivity('Reading')}>
        Switch to Reading
      </button>
      <button onClick={sendNow}>
        Send Data Now
      </button>
      <button onClick={() => setIsTracking(!isTracking)}>
        {isTracking ? 'Pause' : 'Resume'} Tracking
      </button>
      <p>Next sync in: {Math.round((stats?.timeRemaining || 0) / 1000)}s</p>
    </div>
  );
};

export default MyComponent;
