import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import CameraMonitor from "./components/CameraMonitor";
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { employeeAPI } from './services/api';

// Dashboard Page Component
function DashboardPage() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  // State
  const [currentActivity, setCurrentActivity] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('🔍 Fetching employee profile...');
        const response = await employeeAPI.getMyProfile();
        console.log('📥 Profile response:', response);
        console.log('📥 Response type:', typeof response);
        console.log('📥 Response keys:', response ? Object.keys(response) : 'null');
        console.log('📥 Response.success:', response?.success);
        console.log('📥 Response.data:', response?.data);
        
        if (response && response.success && response.data?.employee) {
          console.log('✅ Profile data:', response.data.employee);
          setProfileData(response.data.employee);
        } else {
          console.log('⚠️ Unexpected response structure');
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

  const handleActivityChange = (activity) => {
    setCurrentActivity(activity);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Controls */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Employee Profile Card */}
            {loadingProfile ? (
              <div className="glass rounded-xl p-4 border border-indigo-100 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : profileData ? (
              <div className="glass rounded-xl p-4 border border-indigo-100 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {profileData.name?.charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{profileData.name}</p>
                    <p className="text-xs text-gray-600 truncate">{profileData.email}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Position</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{profileData.position || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{profileData.department || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Organization</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{profileData.organization_name || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl p-4 border border-red-100">
                <p className="text-sm text-red-600">Failed to load profile</p>
              </div>
            )}

            {/* Current Activity Display */}
            <div className="card-hover bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-gray-800 text-sm">Live Activity</h3>
              </div>
              <div
                className={`text-lg font-bold text-center py-3 rounded-xl shadow-sm transition-all duration-300 ${
                  currentActivity === "Typing"
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                    : currentActivity === "Writing"
                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800"
                    : currentActivity === "Reading"
                    ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800"
                    : currentActivity === "Phone"
                    ? "bg-gradient-to-r from-red-100 to-orange-100 text-red-800"
                    : currentActivity === "Meeting"
                    ? "bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800"
                    : currentActivity === "Presenting"
                    ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800"
                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {currentActivity === "Typing" && "⌨️"}
                  {currentActivity === "Writing" && "✍️"}
                  {currentActivity === "Reading" && "📖"}
                  {currentActivity === "Phone" && "📱"}
                  {currentActivity === "Meeting" && "👥"}
                  {currentActivity === "Presenting" && "🎤"}
                  <span>{currentActivity || "Initializing..."}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-auto glass rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Status
                </span>
                <span className="font-semibold text-gray-800">{currentActivity ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 animate-slide-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Activity Monitor</h2>
                <p className="text-gray-600">Real-time tracking and performance analysis</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <CameraMonitor 
                    onActivityChange={handleActivityChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
              {currentActivity && (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-600">Currently:</span>
                  <span className="font-semibold text-gray-800">{currentActivity}</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Main App component with routing
const App = () => {
  console.log('🚀 App component rendering');
  
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

