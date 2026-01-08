
// App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import CameraMonitor from "./components/CameraMonitor";
import InputMonitor from './components/InputMonitor';
import ObjectDetector from './components/ObjectDetector';
import Login from "./pages/Login";
import ProtectedRoute from './components/ProtectedRoute';
import { employeeAPI, activityAPI } from './services/api';
import useActivityTracking from './hooks/useActivityTracking';
import { LayoutDashboard, Camera, Keyboard, Scan, LogOut, Activity, Cpu, AlertCircle } from 'lucide-react';

// Import the object detection services
import ObjectDetectionService from './services/ObjectDetectionService';
import ModelLoader from './services/ModelLoader';

// Helper function to safely get environment variables
const getEnvVar = (key, defaultValue = '') => {
  // Try to get from window.nodeAPI (exposed by preload.js)
  if (window.nodeAPI && window.nodeAPI.process && window.nodeAPI.process.env && window.nodeAPI.process.env[key]) {
    return window.nodeAPI.process.env[key];
  }
  // Fallback to a default value
  return defaultValue;
};

// Dashboard Page Component
function DashboardPage() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  // State
  const [currentActivity, setCurrentActivity] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingToday, setLoadingToday] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [activeView, setActiveView] = useState('both'); // 'camera', 'input', 'both', 'detector'
  
  // Object detection state
  const [modelLoading, setModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [detectionError, setDetectionError] = useState(null);

  // Initialize activity tracking hook
  const {
    getCurrentStats,
    sendNow,
    inputTracking,
    toggleActivityTracking,
    keyboardStats,
    mouseStats
  } = useActivityTracking(
    currentActivity,
    trackingEnabled,
    (data) => console.log('✅ Activity batch sent:', data),
    (error) => console.error('❌ Error sending batch:', error)
  );

  // Initialize object detection model when detector view is activated
  useEffect(() => {
    if (activeView === 'detector' && !modelLoaded && !modelLoading) {
      setModelLoading(true);
      setDetectionError(null);
      
      ObjectDetectionService.initialize()
        .then(success => {
          if (success) {
            setModelLoaded(true);
            console.log('Object detection model loaded successfully');
          } else {
            setDetectionError('Failed to load object detection model');
            console.error('Failed to load object detection model');
          }
        })
        .catch(error => {
          setDetectionError(`Error loading model: ${error.message}`);
          console.error('Error loading object detection model:', error);
        })
        .finally(() => {
          setModelLoading(false);
        });
    }
  }, [activeView, modelLoaded, modelLoading]);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await employeeAPI.getMyProfile();
        
        if (response && response.success && response.data?.employee) {
          setProfileData(response.data.employee);
        } else {
          console.log('⚠️ Full response:', JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.error('❌ Failed to fetch profile:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch today's performance data
  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const response = await activityAPI.getMyDailyScores();
        
        if (response && response.data) {
          setTodayData(response.data.data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch today\'s data:', error);
        // It's okay if there's no data for today yet
        if (error.response?.status !== 404) {
          console.error('Error details:', error.response?.data || error.message);
        }
      } finally {
        setLoadingToday(false);
      }
    };

    fetchTodayData();
    
    // Refresh today's data every 1 minutes
    const interval = setInterval(fetchTodayData, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch current activity stats periodically
  useEffect(() => {
    if (!trackingEnabled) return;

    const interval = setInterval(() => {
      const stats = getCurrentStats();
      console.log('📊 Current activity stats:', stats);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [trackingEnabled, getCurrentStats]);

  const handleActivityChange = useCallback((activity) => {
    console.log('📝 Activity changed to:', activity);
    setCurrentActivity(activity);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
    toggleActivityTracking(!trackingEnabled);
  };

  const handleManualSync = async () => {
    try {
      await sendNow();
      // Refresh today's data after sync
      const response = await activityAPI.getMyDailyScores();
      if (response && response.data) {
        setTodayData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to sync manually:', error);
    }
  };

  // Handle object detection
  const handleDetection = async (imageElement) => {
    if (!modelLoaded) return;
    
    try {
      const results = await ObjectDetectionService.detect(imageElement, {
        drawOnCanvas: true,
        confidence: 0.5,
        iou: 0.5
      });
      setDetectionResults(results);
      return results;
    } catch (error) {
      setDetectionError(`Detection error: ${error.message}`);
      console.error('Object detection error:', error);
      return null;
    }
  };

  // Check if we're in development mode using the helper function
  const isDevelopment = getEnvVar('NODE_ENV') === 'development';

  return (
    <div className="h-screen w-screen flex flex-col bg-linear-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Sidebar - Left */}
        <div className={`${activeView === 'input' ? 'w-full' : 'w-64'} flex flex-col gap-2 overflow-hidden transition-all duration-300`}>
          {/* Navigation Panel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Navigation</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveView('both')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeView === 'both' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('camera')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeView === 'camera' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                Camera Monitor
              </button>
              <button
                onClick={() => setActiveView('input')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeView === 'input' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                Input Monitor
              </button>
              <button
                onClick={() => setActiveView('detector')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeView === 'detector' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Scan className="w-4 h-4" />
                Object Detector
              </button>
            </div>
          </div>

          {/* Object Detection Status Panel - Only show when in detector view */}
          {activeView === 'detector' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Detection Model</h3>
              </div>
              
              {modelLoading && (
                <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Loading model...</span>
                </div>
              )}
              
              {modelLoaded && (
                <div className="flex items-center gap-2 text-xs text-green-600 mb-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Model ready</span>
                </div>
              )}
              
              {detectionError && (
                <div className="flex items-start gap-2 text-xs text-red-600 mb-2">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{detectionError}</span>
                </div>
              )}
              
              {detectionResults && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-1">Last Detection:</div>
                  <div className="text-xs font-medium text-gray-800">
                    {detectionResults.detections.length > 0 
                      ? `Found ${detectionResults.detections.length} object(s)` 
                      : 'No objects detected'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Processing time: {detectionResults.processingTime}ms
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tracking Control Panel */}
          {activeView !== 'detector' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${trackingEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Tracking Control</h3>
                </div>
                <button
                  onClick={toggleTracking}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    trackingEnabled 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {trackingEnabled ? 'Pause' : 'Resume'}
                </button>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Camera Tracking</span>
                  <span className={`font-semibold ${trackingEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                    {trackingEnabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Input Tracking</span>
                  <span className={`font-semibold ${inputTracking ? 'text-green-600' : 'text-gray-600'}`}>
                    {inputTracking ? 'Active' : 'Paused'}
                  </span>
                </div>
                <button
                  onClick={handleManualSync}
                  className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-1 flex items-center justify-center gap-1"
                >
                  <Activity className="w-3 h-3" />
                  Sync Now
                </button>
              </div>
            </div>
          )}

          {/* Live Activity Status */}
          {activeView !== 'input' && activeView !== 'detector' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-2 h-2 rounded-full ${currentActivity && currentActivity !== 'Not Started' && currentActivity !== 'Paused' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Live Status</h3>
              </div>
              <div
                className={`text-sm font-bold text-center py-2 rounded-lg transition-all duration-300 ${
                  currentActivity === "Typing"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : currentActivity === "Writing"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : currentActivity === "Reading"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : currentActivity === "Phone"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : currentActivity === "Meeting"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : currentActivity === "Presenting"
                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                    : currentActivity === "Paused"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : currentActivity === "Not Started"
                    ? "bg-gray-50 text-gray-600 border border-gray-200"
                    : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                {currentActivity || "Waiting..."}
              </div>
              
              {/* Input Activity Mini-stats */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Keys</div>
                    <div className="text-sm font-bold text-blue-700">{keyboardStats?.totalKeys || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Clicks</div>
                    <div className="text-sm font-bold text-purple-700">{mouseStats?.totalClicks || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employee Details */}
          {activeView !== 'input' && activeView !== 'detector' && (
            <>
              {loadingProfile ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1.5"></div>
                  <div className="space-y-1">
                    <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : profileData ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
                  <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1.5">Employee Info</h3>
                  <div className="space-y-1">
                    <div className="flex items-start gap-1.5">
                      <svg className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{profileData.position || 'Position not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{profileData.department || 'Department not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{profileData.organization_name || 'Organization not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
                  <p className="text-xs text-red-600">Failed to load profile</p>
                </div>
              )}

              {/* Session Info */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
                <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1.5">Session Info</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${currentActivity && currentActivity !== 'Not Started' && currentActivity !== 'Paused' ? 'text-green-600' : 'text-gray-600'}`}>
                      {currentActivity && currentActivity !== 'Not Started' && currentActivity !== 'Paused' ? 'Tracking' : 'Inactive'}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">Auto-sync every 5 min</p>
                  </div>
                </div>
              </div>

              {/* Performance Analytics */}
              {loadingToday ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1.5"></div>
                  <div className="space-y-1">
                    <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              ) : todayData?.daily_score ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
                  <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1.5">Today's Performance</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Overall Score</span>
                      <span className={`text-xs font-bold ${
                        todayData.daily_score.overall_score >= 80 ? 'text-green-600' :
                        todayData.daily_score.overall_score >= 60 ? 'text-blue-600' :
                        todayData.daily_score.overall_score >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {parseFloat(todayData.daily_score.overall_score).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Productivity</span>
                      <span className="text-xs font-semibold text-indigo-600">
                        {parseFloat(todayData.daily_score.productivity_score).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Engagement</span>
                      <span className="text-xs font-semibold text-purple-600">
                        {parseFloat(todayData.daily_score.engagement_score).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Grade</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        todayData.daily_score.performance_grade === 'A' ? 'bg-green-100 text-green-700' :
                        todayData.daily_score.performance_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        todayData.daily_score.performance_grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        todayData.daily_score.performance_grade === 'D' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {todayData.daily_score.performance_grade}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Intervals</span>
                        <span className="text-xs font-semibold text-gray-800">
                          {todayData.daily_score.interval_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
                  <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1.5">Today's Performance</h3>
                  <p className="text-xs text-gray-500 text-center py-2">No activity data yet today</p>
                </div>
              )}

              {/* Today's Activity Breakdown */}
              {todayData?.daily_score && (
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-2 border border-blue-100">
                  <h3 className="font-semibold text-indigo-700 text-xs uppercase tracking-wide mb-1.5">Activity Breakdown</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Working Time</span>
                      <span className="text-xs font-medium text-green-700">
                        {Math.floor(todayData.daily_score.working_total / 60)}m {todayData.daily_score.working_total % 60}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Distracted Time</span>
                      <span className="text-xs font-medium text-orange-700">
                        {Math.floor(todayData.daily_score.distracted_total / 60)}m {todayData.daily_score.distracted_total % 60}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Idle Time</span>
                      <span className="text-xs font-medium text-gray-700">
                        {Math.floor(todayData.daily_score.idle_total / 60)}m {todayData.daily_score.idle_total % 60}s
                      </span>
                    </div>
                    <div className="pt-1 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">Total Time</span>
                        <span className="text-xs font-bold text-indigo-700">
                          {Math.floor(todayData.daily_score.grand_total / 60)}m {todayData.daily_score.grand_total % 60}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Activity Summary */}
              <div className="bg-linear-to-br from-gray-50 to-slate-100 rounded-xl shadow-md p-2 border border-gray-200">
                <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1.5">Input Activity</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Keys per minute</span>
                    </div>
                    <span className="text-xs font-bold text-blue-700">{keyboardStats?.keysPerMinute || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Mouse distance</span>
                    </div>
                    <span className="text-xs font-bold text-purple-700">{Math.round(mouseStats?.distance || 0)} px</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Active</span>
                    </div>
                    <span className="text-xs font-bold text-green-700">
                      {inputTracking ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content Area - Right */}
        <div className={`${
          activeView === 'input' ? 'hidden' : 
          activeView === 'detector' ? 'flex-1' : 'flex-1'
        } flex flex-col overflow-hidden`}>
          
          {activeView === 'camera' && (
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden">
              <CameraMonitor onActivityChange={handleActivityChange} />
            </div>
          )}
          
          {activeView === 'both' && (
            <>
              {/* Top Section: Camera Monitor */}
              <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden mb-2">
                <CameraMonitor onActivityChange={handleActivityChange} />
              </div>

              {/* Bottom Section: Input Monitor */}
              <div className="h-80 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-auto">
                <InputMonitor />
              </div>
            </>
          )}

          {activeView === 'detector' && (
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden">
              <ObjectDetector 
                modelLoaded={modelLoaded}
                modelLoading={modelLoading}
                onDetection={handleDetection}
                detectionResults={detectionResults}
                detectionError={detectionError}
              />
            </div>
          )}

          {/* Show Object Detector only in detector mode */}
          {activeView === 'detector' && activeView !== 'detector' && (
            <div className="mt-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4">
              <p className="text-gray-500 text-sm text-center">
                Switch to "Object Detector" view from the navigation panel to use the detection feature
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main App component with routing
const App = () => {
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/detector" 
          element={
            <ProtectedRoute>
              <div className="h-screen w-screen">
                <ObjectDetector />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;