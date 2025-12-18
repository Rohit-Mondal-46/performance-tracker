// components/CameraMonitor.jsx - ENHANCED WITH ALL FEATURES
import React, { useRef, useEffect, useState, useCallback } from "react";
import { drawResults } from "../utils/faceUtils";
import useHolistic from "../hooks/useHolistic";
import useActivityTracking from "../hooks/useActivityTracking";

// --- PDF Generation Imports ---
// 1. Import the jsPDF library
import jsPDF from 'jspdf';
// 2. IMPORTANT: Import the autotable plugin. This line adds the .autoTable() method to jsPDF.
import 'jspdf-autotable';
// --------------------------------

const CameraMonitor = ({ onActivityChange }) => {
  const canvasRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const [showDebug, setShowDebug] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("waiting"); // Changed from "initializing" to "waiting"
  const [mediaPipeStatus, setMediaPipeStatus] = useState("checking");
  
  // NEW: State to track if camera has been started
  const [cameraStarted, setCameraStarted] = useState(false);
  
  // NEW: Pause/Resume tracking state
  const [isTrackingPaused, setIsTrackingPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  
  // Activity tracking state
  const [activityLog, setActivityLog] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    Typing: 0,
    Writing: 0,
    Phone: 0,
    Gesturing: 0,
    Sitting: 0,
    Reading: 0,
    'Looking Away': 0
  });
  const [syncNotification, setSyncNotification] = useState(null);
  
  const lastActivityRef = useRef(null);
  const sessionStartRef = useRef(Date.now());
  
  const onActivityChangeRef = useRef(onActivityChange);
  useEffect(() => {
    onActivityChangeRef.current = onActivityChange;
  }, [onActivityChange]);

  // Enhanced results handler with face detection
  const handleResults = useCallback((results) => {
    // Skip processing if tracking is paused
    if (isTrackingPaused) return;
    
    if (canvasRef.current && results) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw results with transparency
      drawResults(results, ctx, {
        drawPose: true,
        drawHands: true,
        drawFace: false, // Face handled separately
        drawConnections: true,
        drawLandmarks: true,
        smoothDrawing: true
      });
    }
  }, [isTrackingPaused]);

  // Activity change handler with tracking
  const handleActivityChange = useCallback((activity) => {
    // Skip activity tracking if paused
    if (isTrackingPaused) return;
    
    const now = Date.now();
    const enhancedActivity = activity;
    
    // Track activity duration
    if (lastActivityRef.current && lastActivityRef.current !== enhancedActivity) {
      const duration = now - sessionStartRef.current;
      
      // Log activity change
      setActivityLog(prev => [...prev, {
        activity: lastActivityRef.current,
        startTime: sessionStartRef.current,
        endTime: now,
        duration: duration,
        timestamp: new Date(sessionStartRef.current).toLocaleTimeString()
      }]);
      
      // Update stats
      setSessionStats(prev => ({
        ...prev,
        [lastActivityRef.current]: (prev[lastActivityRef.current] || 0) + duration
      }));
      
      sessionStartRef.current = now;
    }
    
    lastActivityRef.current = enhancedActivity;
    setCurrentSession({ activity: enhancedActivity, startTime: now });
    onActivityChangeRef.current?.(enhancedActivity);
  }, [isTrackingPaused]);

  const { 
    videoRef,
    error, 
    isInitialized, 
    currentActivity, 
    restart,
    mediaPipeStatus: holisticStatus
  } = useHolistic(handleResults, handleActivityChange, cameraStarted); // Pass cameraStarted to control initialization

  useEffect(() => {
    setMediaPipeStatus(holisticStatus);
  }, [holisticStatus]);





  // Canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (videoRef.current && canvasRef.current && faceCanvasRef.current) {
        const video = videoRef.current;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          faceCanvasRef.current.width = video.videoWidth;
          faceCanvasRef.current.height = video.videoHeight;
          setCameraStatus("ready");
        }
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateCanvasSize);
      video.addEventListener('canplay', updateCanvasSize);
      
      return () => {
        video.removeEventListener('loadedmetadata', updateCanvasSize);
        video.removeEventListener('canplay', updateCanvasSize);
      };
    }
  }, [videoRef, isInitialized]);

  // NEW: Function to start camera
  const startCamera = useCallback(() => {
    setCameraStarted(true);
    setCameraStatus("initializing");
  }, []);

  // NEW: Toggle pause/resume tracking
  const toggleTracking = useCallback(() => {
    if (isTrackingPaused) {
      // Resuming tracking
      const pauseDuration = Date.now() - pauseStartTime;
      setTotalPausedTime(prev => prev + pauseDuration);
      sessionStartRef.current = Date.now(); // Reset session start time
      setIsTrackingPaused(false);
      setPauseStartTime(null);
    } else {
      // Pausing tracking
      setPauseStartTime(Date.now());
      setIsTrackingPaused(true);
      
      // Clear face canvas when pausing
      if (faceCanvasRef.current) {
        const ctx = faceCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, faceCanvasRef.current.width, faceCanvasRef.current.height);
      }
    }
  }, [isTrackingPaused, pauseStartTime]);

  // Export data function - MODIFIED FOR PDF
  const exportData = useCallback(() => {
    const totalTime = Object.values(sessionStats).reduce((sum, time) => sum + time, 0);
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Activity Report', 14, 22);
    
    // Add session information
    doc.setFontSize(12);
    doc.text(`Session Start: ${new Date(sessionStartRef.current - totalTime).toLocaleString()}`, 14, 35);
    doc.text(`Session End: ${new Date().toLocaleString()}`, 14, 42);
    doc.text(`Total Duration: ${formatTime(totalTime)}`, 14, 49);
    doc.text(`Paused Time: ${formatTime(totalPausedTime)}`, 14, 56);
    
    // Prepare data for the activities table
    const activitiesData = Object.entries(sessionStats)
      .filter(([_, duration]) => duration > 0)
      .sort(([_, a], [__, b]) => b - a)
      .map(([activity, duration]) => [
        activity,
        formatTime(duration),
        totalTime > 0 ? ((duration / totalTime) * 100).toFixed(1) + '%' : '0%'
      ]);
    
    // Add activities table
    doc.autoTable({
      head: [['Activity', 'Duration', 'Percentage']],
      body: activitiesData,
      startY: 65,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add detailed log section
    const finalY = doc.lastAutoTable.finalY || 65;
    doc.setFontSize(14);
    doc.text('Detailed Activity Log', 14, finalY + 10);
    
    // Prepare data for the detailed log table
    const logData = activityLog.map(log => [
      log.timestamp,
      log.activity,
      formatTime(log.duration)
    ]);
    
    // Add detailed log table
    doc.autoTable({
      head: [['Time', 'Activity', 'Duration']],
      body: logData,
      startY: finalY + 20,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Save the PDF
    doc.save(`activity-report-${Date.now()}.pdf`);
  }, [sessionStats, activityLog, totalPausedTime]);

  // Format time
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getCameraStatusMessage = () => {
    switch (cameraStatus) {
      case "ready": return "Camera ready";
      case "initializing": return "Initializing camera...";
      case "waiting": return "Camera not started";
      case "error": return "Camera error";
      default: return "Checking camera...";
    }
  };

  const getMediaPipeStatusMessage = () => {
    switch (mediaPipeStatus) {
      case "loaded": return "AI Ready";
      case "loading": return "Loading AI...";
      case "partial": return "AI Partial";
      case "failed": return "AI Failed";
      case "fallback": return "Basic Mode";
      case "checking": return "Checking AI...";
      default: return mediaPipeStatus;
    }
  };

  const getMediaPipeStatusColor = () => {
    switch (mediaPipeStatus) {
      case "loaded": return "bg-green-500 text-white";
      case "loading": return "bg-blue-500 text-white";
      case "partial": return "bg-orange-500 text-white";
      case "failed":
      case "fallback": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const enhancedActivity = !cameraStarted ? 'Not Started' :
                          isTrackingPaused ? 'Paused' : "Reading";
                          

  // Handle successful data sync
  const handleSyncSuccess = useCallback((data) => {
    setSyncNotification({ type: 'success', message: 'Activity data synced successfully!' });
    setTimeout(() => setSyncNotification(null), 3000);
  }, []);

  // Handle sync error
  const handleSyncError = useCallback((error) => {
    const message = error.response?.data?.message || 'Failed to sync activity data';
    setSyncNotification({ type: 'error', message });
    setTimeout(() => setSyncNotification(null), 5000);
  }, []);

  // Activity tracking hook - sends data every 10 minutes
  const { sendNow, getCurrentStats } = useActivityTracking(
    enhancedActivity,
    isInitialized && !error && !isTrackingPaused && cameraStarted, // Only track when camera is started, initialized, no errors, and not paused
    handleSyncSuccess,
    handleSyncError
  );

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-xl font-semibold mb-4">Live Activity Monitor</h2>
      
      {/* Sync Notification */}
      {syncNotification && (
        <div className={`mb-4 px-4 py-2 rounded-lg shadow-lg ${
          syncNotification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {syncNotification.type === 'success' ? '✅' : '❌'}
            <span className="text-sm font-medium">{syncNotification.message}</span>
          </div>
        </div>
      )}
      
      <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-800 w-96 h-72">
        {cameraStarted ? (
          <>
            <video
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              style={{ zIndex: 1 }}
              onError={(e) => {
                console.error("Video error:", e);
                setCameraStatus("error");
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-80"
              style={{ zIndex: 2, mixBlendMode: 'screen' }}
            />
            <canvas
              ref={faceCanvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 3 }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ zIndex: 1 }}>
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-semibold mb-2">Camera Not Started</h3>
              <p className="text-sm mb-4">Click the "Start Camera" button to begin activity monitoring</p>
            </div>
          </div>
        )}

        {cameraStarted && !isInitialized && !error && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center" style={{ zIndex: 10 }}>
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">Initializing camera...</p>
            </div>
          </div>
        )}

        {cameraStarted && error && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center p-4">
            <div className="text-center text-white">
              <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
              <p className="text-sm mb-4">{error}</p>
              <button 
                onClick={restart}
                className="px-4 py-2 bg-white text-red-900 rounded hover:bg-gray-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1" style={{ zIndex: 4 }}>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getMediaPipeStatusColor()}`}>
            {getMediaPipeStatusMessage()}
          </div>
          
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            cameraStatus === 'ready' ? 'bg-green-500 text-white' : 
            cameraStatus === 'error' ? 'bg-red-500 text-white' : 
            cameraStatus === 'waiting' ? 'bg-gray-500 text-white' :
            'bg-yellow-500 text-black'
          }`}>
            {getCameraStatusMessage()}
          </div>
          {/* Tracking status indicator */}
          {cameraStarted && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isTrackingPaused ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {isTrackingPaused ? 'Tracking Paused' : 'Tracking Active'}
            </div>
          )}
        </div>

        
        
        {/* Pause overlay */}
        {isTrackingPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 5 }}>
            <div className="text-center text-white">
              <div className="text-4xl mb-2">⏸️</div>
              <p className="text-lg font-semibold">Tracking Paused</p>
              <p className="text-sm">Click Resume to continue tracking</p>
            </div>
          </div>
        )}
      </div>

      {/* Activity Display */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm w-96 border border-blue-200">
        <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Current Activity</h3>
        <div className={`text-xl font-bold text-center py-3 rounded-lg transition-all duration-300 transform ${
          enhancedActivity === 'Typing' ? 'bg-green-100 text-green-800 scale-105' :
          enhancedActivity === 'Writing' ? 'bg-blue-100 text-blue-800 scale-105' :
          enhancedActivity === 'Gesturing' ? 'bg-yellow-100 text-yellow-800 scale-105' :
          enhancedActivity === 'Phone' ? 'bg-red-100 text-red-800 scale-105' :
          enhancedActivity === 'Reading' ? 'bg-purple-100 text-purple-800 scale-105' :
          enhancedActivity === 'Sitting' ? 'bg-gray-100 text-gray-800' :
          enhancedActivity === 'Looking Away' ? 'bg-orange-100 text-orange-800' :
          enhancedActivity === 'Paused' ? 'bg-gray-200 text-gray-700' :
          enhancedActivity === 'Not Started' ? 'bg-gray-200 text-gray-700' :
          'bg-gray-100 text-gray-800'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {enhancedActivity === 'Typing' && '⌨️'}
            {enhancedActivity === 'Writing' && '✍️'}
            {enhancedActivity === 'Gesturing' && '👋'}
            {enhancedActivity === 'Phone' && '📱'}
            {enhancedActivity === 'Reading' && '📖'}
            {enhancedActivity === 'Sitting' && '🪑'}
            {enhancedActivity === 'Looking Away' && '👀'}
            {enhancedActivity === 'Paused' && '⏸️'}
            {enhancedActivity === 'Not Started' && '⏹️'}
            <span>{enhancedActivity || 'Analyzing...'}</span>
          </div>
        </div>
        {/* {currentSession && !isTrackingPaused && (
          <p className="text-xs text-center text-gray-600 mt-2">
            Duration: {formatTime(Date.now() - currentSession.startTime)}
          </p>
        )} */}
        {/* {isTrackingPaused && pauseStartTime && (
          <p className="text-xs text-center text-gray-600 mt-2">
            Paused for: {formatTime(Date.now() - pauseStartTime)}
          </p>
        )} */}
      </div>

      {/* Session Stats */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm w-96 border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-gray-800">Session Stats</h3>
          <button
            onClick={exportData}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
          >
            📄 Export PDF
          </button>
        </div>
        <div className="space-y-1 text-xs">
          {Object.entries(sessionStats)
            .filter(([_, duration]) => duration > 0)
            .sort(([_, a], [__, b]) => b - a)
            .map(([activity, duration]) => {
              const total = Object.values(sessionStats).reduce((sum, d) => sum + d, 0);
              const percentage = total > 0 ? ((duration / total) * 100).toFixed(0) : 0;
              return (
                <div key={activity} className="flex justify-between items-center">
                  <span className="text-gray-700">{activity}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-16">{formatTime(duration)}</span>
                  </div>
                </div>
              );
            })}
          {totalPausedTime > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Paused Time:</span>
              <span className="text-gray-600 w-16 text-right">{formatTime(totalPausedTime)}</span>
            </div>
          )}
          {Object.values(sessionStats).reduce((sum, d) => sum + d, 0) === 0 && (
            <div className="text-center text-gray-500 py-2">
              No activity data yet. Start the camera to begin tracking.
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        {!cameraStarted ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={toggleTracking}
              className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-md hover:shadow-lg ${
                isTrackingPaused 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isTrackingPaused ? '▶️ Resume Tracking' : '⏸️ Pause Tracking'}
            </button>
            <button
              onClick={sendNow}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              title="Send activity data now"
            >
              Sync Now
            </button>
          </>
        )}
      </div>

      {/* Debug Information */}
      {showDebug && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg w-96 text-xs">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <div className="space-y-1">
            <p>Camera Started: {cameraStarted ? 'Yes' : 'No'}</p>
            <p>Camera: {cameraStatus}</p>
            <p>MediaPipe: {mediaPipeStatus}</p>
            <p>Tracking Status: {isTrackingPaused ? 'Paused' : 'Active'}</p>
            <p>Activities Logged: {activityLog.length}</p>
            <p className="mt-2 pt-2 border-t border-gray-300">
              <strong>Backend Sync:</strong> Data sent every 10 minutes
            </p>
            <p className="text-blue-600">
              Next sync: {Math.round((getCurrentStats()?.timeRemaining || 0) / 1000)}s
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraMonitor;