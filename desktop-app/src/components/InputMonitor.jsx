import React, { useState, useEffect } from 'react';
import useInputTracking from '../hooks/useInputTracking';

const InputMonitor = () => {
  const {
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
    resetStats
  } = useInputTracking();

  const [activeTab, setActiveTab] = useState('overview');
  const [sessionStart] = useState(Date.now());
  const [maxSessionKeys, setMaxSessionKeys] = useState(1000); // Expected max keys per session
  const [maxSessionClicks, setMaxSessionClicks] = useState(500); // Expected max clicks per session

  // Calculate usage percentages
  const calculateKeyboardPercentage = () => {
    const percentage = Math.min(100, Math.round((keyboardStats.totalKeys / maxSessionKeys) * 100));
    return percentage;
  };

  const calculateMousePercentage = () => {
    const percentage = Math.min(100, Math.round((mouseStats.totalClicks / maxSessionClicks) * 100));
    return percentage;
  };

  const calculateOverallInputPercentage = () => {
    const keyboardPercent = calculateKeyboardPercentage();
    const mousePercent = calculateMousePercentage();
    return Math.round((keyboardPercent + mousePercent) / 2);
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSessionDuration = () => {
    const diff = Date.now() - sessionStart;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeSinceLastUpdate = () => {
    const diff = Date.now() - lastUpdateTime;
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s ago`;
  };

  const handleResetStats = async () => {
    const result = await resetStats();
    if (result.success) {
      console.log('Stats reset successfully');
    } else {
      console.error('Failed to reset stats:', result.message);
    }
  };

  // Get color based on percentage
  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get background gradient based on percentage
  const getPercentageGradient = (percentage, type) => {
    if (percentage >= 80) return type === 'keyboard' 
      ? 'from-green-50 to-green-100 border-green-200' 
      : 'from-emerald-50 to-emerald-100 border-emerald-200';
    if (percentage >= 60) return type === 'keyboard' 
      ? 'from-blue-50 to-blue-100 border-blue-200' 
      : 'from-indigo-50 to-indigo-100 border-indigo-200';
    if (percentage >= 40) return type === 'keyboard' 
      ? 'from-yellow-50 to-yellow-100 border-yellow-200' 
      : 'from-amber-50 to-amber-100 border-amber-200';
    return type === 'keyboard' 
      ? 'from-red-50 to-red-100 border-red-200' 
      : 'from-rose-50 to-rose-100 border-rose-200';
  };

  const keyboardPercentage = calculateKeyboardPercentage();
  const mousePercentage = calculateMousePercentage();
  const overallPercentage = calculateOverallInputPercentage();

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 mb-6 shadow-xl border border-slate-200">
      {/* Header with tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h3 className="text-3xl font-bold text-slate-900">Input Activity Monitor</h3>
          <p className="text-slate-600 mt-1">Track keyboard and mouse usage in real-time</p>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-slate-500">Last updated: {getTimeSinceLastUpdate()}</span>
            {trackingInitialized ? (
              <span className="text-xs text-emerald-600 font-medium flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                Tracking Active
              </span>
            ) : (
              <span className="text-xs text-red-600 font-medium flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                Tracking Inactive
              </span>
            )}
          </div>
          {trackingError && (
            <p className="text-xs text-red-600 mt-1">Error: {trackingError}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            Session: {getSessionDuration()}
          </div>
          <button 
            onClick={() => toggleTracking(!isTracking)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center ${
              isTracking 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isTracking ? (
              <>
                <span className="mr-2">⏸️</span>
                Pause Tracking
              </>
            ) : (
              <>
                <span className="mr-2">▶️</span>
                Start Tracking
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-slate-200">
        {['overview', 'keyboard', 'mouse'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === tab
                ? 'bg-white border border-slate-200 border-b-0 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards with Percentages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className={`bg-gradient-to-br ${getPercentageGradient(keyboardPercentage, 'keyboard')} p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Keyboard Usage</p>
                  <div className="flex items-baseline mt-1">
                    <p className={`text-3xl font-bold ${getPercentageColor(keyboardPercentage)}`}>{keyboardPercentage}%</p>
                    <p className="text-xs text-slate-500 ml-2">of expected</p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-70 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-3xl">⌨️</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 border-opacity-50">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-600">Total Keys</p>
                  <p className="text-sm font-bold">{keyboardStats.totalKeys}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-600">Keys/min</p>
                  <p className="text-sm font-bold">{keyboardStats.keysPerMinute || 0}</p>
                </div>
                {keyboardStats.isTyping && (
                  <p className="text-xs font-medium mt-2 text-emerald-600 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                    Currently typing
                  </p>
                )}
              </div>
              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 border-opacity-50">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      keyboardPercentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                      keyboardPercentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      keyboardPercentage >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${keyboardPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${getPercentageGradient(mousePercentage, 'mouse')} p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Mouse Usage</p>
                  <div className="flex items-baseline mt-1">
                    <p className={`text-3xl font-bold ${getPercentageColor(mousePercentage)}`}>{mousePercentage}%</p>
                    <p className="text-xs text-slate-500 ml-2">of expected</p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-70 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-3xl">🖱️</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 border-opacity-50">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-600">Total Clicks</p>
                  <p className="text-sm font-bold">{mouseStats.totalClicks}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-600">Clicks/min</p>
                  <p className="text-sm font-bold">{mouseStats.clicksPerMinute || 0}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-600">Distance</p>
                  <p className="text-sm font-bold">{Math.round(mouseStats.distance / 1000)}k px</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 border-opacity-50">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      mousePercentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                      mousePercentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      mousePercentage >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${mousePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Overall Input</p>
                  <div className="flex items-baseline mt-1">
                    <p className={`text-3xl font-bold ${getPercentageColor(overallPercentage)}`}>{overallPercentage}%</p>
                    <p className="text-xs text-slate-500 ml-2">activity</p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-indigo-200 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-200">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-600">Activity Type</p>
                  <p className="text-sm font-bold">{activityData?.activityType || 'Idle'}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-600">Activity Level</p>
                  <p className="text-sm font-bold">{activityData?.overallActivity || 0}%</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-indigo-200">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      overallPercentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                      overallPercentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      overallPercentage >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${overallPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-5 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Session Time</p>
                  <p className="text-3xl font-bold text-amber-900 mt-1">{getSessionDuration()}</p>
                </div>
                <div className="w-14 h-14 bg-amber-200 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-3xl">⏱️</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200">
                <p className="text-xs text-slate-600">Started at {formatTime(sessionStart)}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-600">Expected Keys</p>
                  <p className="text-sm font-bold">{maxSessionKeys}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-600">Expected Clicks</p>
                  <p className="text-sm font-bold">{maxSessionClicks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Graph */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-slate-800">Activity Timeline</h4>
              <span className="text-sm text-slate-500">Last 5 minutes</span>
            </div>
            <div className="h-32 flex items-end space-x-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <div 
                    className="bg-gradient-to-t from-blue-400 to-blue-300 rounded-t transition-all duration-300 hover:from-blue-500 hover:to-blue-400"
                    style={{
                      height: `${Math.random() * 80 + 10}%`,
                      opacity: 0.7 + (Math.random() * 0.3)
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keyboard' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4">Keyboard Statistics</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600">Usage Percentage</p>
                <p className={`text-2xl font-bold ${getPercentageColor(keyboardPercentage)}`}>{keyboardPercentage}%</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600">Average Speed</p>
                <p className="text-2xl font-bold">{keyboardStats.keysPerMinute || 0} KPM</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600">Peak Speed</p>
                <p className="text-2xl font-bold">{Math.round((keyboardStats.keysPerMinute || 0) * 1.5)} KPM</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600">Most Used Key</p>
                <p className="text-2xl font-bold">{keyboardStats.topKeys[0]?.key || 'N/A'}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-slate-700">Usage Progress</h5>
                <span className="text-sm text-slate-500">{keyboardStats.totalKeys} / {maxSessionKeys} keys</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    keyboardPercentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                    keyboardPercentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    keyboardPercentage >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${keyboardPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Top Keys */}
            <div className="mt-4">
              <h5 className="font-medium text-slate-700 mb-3">Top Keys</h5>
              <div className="flex flex-wrap gap-2">
                {keyboardStats.topKeys.map((key, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
                    {key.key}: {key.count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mouse' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4">Mouse Statistics</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600">Usage Percentage</p>
                <p className={`text-2xl font-bold ${getPercentageColor(mousePercentage)}`}>{mousePercentage}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600">Click Rate</p>
                <p className="text-2xl font-bold">{mouseStats.clicksPerMinute || 0} CPM</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600">Avg Speed</p>
                <p className="text-2xl font-bold">{mouseStats.averageSpeed || 0} px/s</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600">Current Position</p>
                <p className="text-2xl font-bold">{mouseStats.lastPosition.x}, {mouseStats.lastPosition.y}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-slate-700">Usage Progress</h5>
                <span className="text-sm text-slate-500">{mouseStats.totalClicks} / {maxSessionClicks} clicks</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    mousePercentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                    mousePercentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    mousePercentage >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${mousePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isTracking ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`}></div>
            <span className="text-sm font-medium">
              {isTracking ? 'Real-time tracking active' : 'Tracking paused'}
            </span>
          </div>
          
          <div className="flex space-x-4 text-sm text-slate-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Keyboard</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>Mouse</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
              <span>System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputMonitor;
