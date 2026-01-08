// App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import CameraMonitor from "./components/CameraMonitor";
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { employeeAPI, activityAPI } from './services/api';
import useActivityTracking from './hooks/useActivityTracking';

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
  const [activeView, setActiveView] = useState('camera'); // Only 'camera' view now

  // Initialize activity tracking hook for manual sending only (no automatic interval)
  const {
    getCurrentStats,
    sendNow,
    inputTracking,
    toggleActivityTracking
  } = useActivityTracking(
    currentActivity,
    false, // Disable automatic interval - only allow manual sendNow() calls
    (data) => console.log('✅ Activity batch sent to backend:', data),
    (error) => console.error('❌ Error sending batch:', error)
  );

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if token exists before making request
        const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
        let hasToken = false;
        
        if (isElectron && window.electronAPI?.auth?.getToken) {
          const token = await window.electronAPI.auth.getToken();
          hasToken = !!token;
          console.log('🔐 Token check (Electron):', hasToken ? 'Found' : 'Missing');
        } else {
          const token = localStorage.getItem('token');
          hasToken = !!token;
          console.log('🔐 Token check (localStorage):', hasToken ? 'Found' : 'Missing');
        }
        
        if (!hasToken) {
          console.warn('⚠️ No token found, skipping profile fetch');
          setLoadingProfile(false);
          return;
        }
        
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

    // Wait a bit for token to be available
    const timer = setTimeout(fetchProfile, 500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch today's performance data
  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        // Check if token exists before making request
        const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
        let hasToken = false;
        
        if (isElectron && window.electronAPI?.auth?.getToken) {
          const token = await window.electronAPI.auth.getToken();
          hasToken = !!token;
        } else {
          const token = localStorage.getItem('token');
          hasToken = !!token;
        }
        
        if (!hasToken) {
          console.warn('⚠️ No token found, skipping daily scores fetch');
          setLoadingToday(false);
          return;
        }
        
        const response = await activityAPI.getMyDailyScores();
        
        if (response && response.data) {
          setTodayData(response.data.data);
        }
      } catch (error) {
        // It's okay if there's no data for today yet (404 is expected)
        if (error.response?.status === 404) {
          console.log('ℹ️ No activity data for today yet');
        } else {
          console.error('❌ Failed to fetch today\'s data:', error);
          console.error('Error details:', error.response?.data || error.message);
        }
      } finally {
        setLoadingToday(false);
      }
    };

    // Wait a bit for token to be available
    const timer = setTimeout(fetchTodayData, 500);
    
    // Refresh today's data every 6 minutes
    const interval = setInterval(fetchTodayData, 6 * 60 * 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
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

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Sidebar - Left */}
        <div className={`${activeView === 'input' ? 'w-full' : 'w-64'} flex flex-col gap-2 overflow-hidden transition-all duration-300`}>
          {/* Tracking Control Panel */}
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
                className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-1"
              >
                🔄 Sync Now
              </button>
            </div>
          </div>

          {/* Live Activity Status */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-2">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${currentActivity && currentActivity !== 'Not Started' && currentActivity !== 'Paused' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Live Status</h3>
            </div>
            <div
              className={`text-sm font-bold text-center py-2 rounded-lg transition-all duration-300 ${
                currentActivity === "Reading"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : currentActivity === "Phone"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : currentActivity === "Gesturing"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : currentActivity === "Looking Away"
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
          </div>

          {/* Employee Details */}
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
                      <svg className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{profileData.position || 'Position not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{profileData.department || 'Department not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-2 border border-blue-100">
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
        </div>

        {/* Main Content Area - Right */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden">
            <CameraMonitor onActivityChange={handleActivityChange} />
          </div>
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;