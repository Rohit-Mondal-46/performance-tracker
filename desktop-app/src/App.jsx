import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import CameraMonitor from "./components/CameraMonitor";
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

console.log('🎨 App.jsx loaded');

// Dashboard Page Component
function DashboardPage() {
  console.log('📊 DashboardPage rendering');
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  // State
  const [activeOrg, setActiveOrg] = useState("Org A");
  const [currentPage, setCurrentPage] = useState("home");
  const [currentActivity, setCurrentActivity] = useState("");
  const organizations = ["Org A", "Org B", "Org C", "Org D"];
  
  console.log('👤 User in DashboardPage:', user);

  // Handlers
  const handleSwitchOrg = (org) => {
    setActiveOrg(org);
    console.log(`Switched to organization: ${org}`);
  };

  const handleGoHome = () => {
    setCurrentPage("home");
    console.log("Navigated to home");
  };

  const handleNext = () => {
    if (currentPage === "home") {
      setCurrentPage("dashboard");
      console.log("Navigated to dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentPage === "dashboard") {
      setCurrentPage("home");
      console.log("Navigated to home");
    }
  };

  const handleActivityChange = (activity) => {
    setCurrentActivity(activity);
    // console.log(`Activity detected: ${activity}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Controls */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Organization Switcher */}
            

            {/* Current Activity Display */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Current Activity</h3>
              <div
                className={`text-lg font-bold text-center py-2 rounded-lg ${
                  currentActivity === "Typing"
                    ? "bg-green-100 text-green-800"
                    : currentActivity === "Writing"
                    ? "bg-blue-100 text-blue-800"
                    : currentActivity === "Reading"
                    ? "bg-purple-100 text-purple-800"
                    : currentActivity === "Phone"
                    ? "bg-red-100 text-red-800"
                    : currentActivity === "Meeting"
                    ? "bg-indigo-100 text-indigo-800"
                    : currentActivity === "Presenting"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {currentActivity || "Waiting for activity..."}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-auto bg-gray-50 rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-800 mb-2">Quick Stats</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>🟢 Active organization: {activeOrg}</p>
              <p>📊 Current view: {currentPage}</p>
              <p>🎯 Tracking: {currentActivity ? "Active" : "Inactive"}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Content */}
          <div className="flex-1 overflow-auto p-4">
            {currentPage === "home" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                  <CameraMonitor 
                    activeOrg={activeOrg} 
                    onActivityChange={handleActivityChange}
                  />
                </div>
               
              </div>
            )}

            {currentPage === "dashboard" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Detailed Analytics - {activeOrg}
                  </h2>
                  
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {currentActivity && `Current activity: ${currentActivity}`}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === "home"}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === "home"
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  ← Back to Home
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentPage === "dashboard"}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === "dashboard"
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  View Dashboard →
                </button>
              </div>
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

