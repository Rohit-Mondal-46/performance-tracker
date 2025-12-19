// components/Loaders/LoadingAnimation.jsx
import React, { useState, useEffect } from 'react';

const LoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Animate progress from 0 to 100%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Faster at the beginning, slower at the end for better UX
        const increment = prev < 30 ? 3 : prev < 70 ? 2 : 1;
        return prev + increment;
      });
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Main Container */}
      <div className="relative w-full max-w-md">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Data Visualization Elements */}
          <div className="absolute w-64 h-64 border-2 border-indigo-200/30 dark:border-indigo-500/20 rounded-full animate-pulse"></div>
          <div className="absolute w-48 h-48 border-2 border-purple-200/30 dark:border-purple-500/20 rounded-full animate-pulse delay-300"></div>
          <div className="absolute w-32 h-32 border-2 border-blue-200/30 dark:border-blue-500/20 rounded-full animate-pulse delay-700"></div>
        </div>

        {/* Main Logo/Text Animation */}
        <div className="relative z-10">
          {/* VISTA Logo Text with Gradient */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
              VISTA
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">
              Visual Insight & Analytics Platform
            </p>
          </div>

          {/* Animated Dashboard Preview */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-32 h-3 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-full animate-pulse"></div>
                  <div className="w-24 h-2 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-400 animate-pulse delay-500"></div>
            </div>

            {/* Dashboard Grid Preview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Chart 1 */}
              <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-indigo-100/50 dark:border-gray-600/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-16 h-2 bg-gradient-to-r from-indigo-300 to-indigo-200 dark:from-indigo-400 dark:to-indigo-300 rounded-full animate-pulse"></div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse delay-200"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-gradient-to-r from-indigo-200 to-indigo-100 dark:from-indigo-500/30 dark:to-indigo-400/30 rounded-full"></div>
                  <div className="w-4/5 h-1.5 bg-gradient-to-r from-indigo-200 to-indigo-100 dark:from-indigo-500/30 dark:to-indigo-400/30 rounded-full animate-pulse delay-100"></div>
                  <div className="w-3/4 h-1.5 bg-gradient-to-r from-indigo-200 to-indigo-100 dark:from-indigo-500/30 dark:to-indigo-400/30 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>

              {/* Chart 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-purple-100/50 dark:border-gray-600/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-20 h-2 bg-gradient-to-r from-purple-300 to-purple-200 dark:from-purple-400 dark:to-purple-300 rounded-full animate-pulse delay-300"></div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse delay-400"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-gradient-to-r from-purple-200 to-purple-100 dark:from-purple-500/30 dark:to-purple-400/30 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2/3 h-2 bg-gradient-to-r from-purple-200 to-purple-100 dark:from-purple-500/30 dark:to-purple-400/30 rounded-full animate-pulse delay-250"></div>
                </div>
              </div>
            </div>

            {/* Loading Progress Bar - Now with 0-100% animation */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>
                  {progress < 30 && "Initializing..."}
                  {progress >= 30 && progress < 60 && "Loading modules..."}
                  {progress >= 60 && progress < 90 && "Preparing dashboard..."}
                  {progress >= 90 && "Finalizing..."}
                </span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Loading Indicator */}
            <div className="flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 150}ms`,
                      animationDuration: '0.6s'
                    }}
                  ></div>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {progress < 30 && "Connecting to services..."}
                {progress >= 30 && progress < 60 && "Loading analytics data..."}
                {progress >= 60 && progress < 90 && "Configuring preferences..."}
                {progress >= 90 && "Almost ready..."}
              </span>
            </div>
          </div>

          {/* Role Badges (Floating) */}
          <div className="flex justify-center space-x-6 mt-8">
            {['Admin', 'Organization', 'Employee'].map((role, index) => (
              <div
                key={role}
                className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-200/30 dark:border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-105 animate-float"
                style={{
                  animationDelay: `${index * 200}ms`,
                  animationDuration: '3s'
                }}
              >
                <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Analytics Icons */}
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-400 opacity-20 animate-float delay-1000"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 animate-float delay-500"></div>
        <div className="absolute top-1/2 -right-8 w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-400 opacity-20 animate-float delay-1500"></div>
      </div>
      
      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;