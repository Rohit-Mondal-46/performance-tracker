// components/Loaders/PreLoader.jsx
import React from 'react';

const PreLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 border-4 border-indigo-200/50 rounded-full animate-spin border-t-indigo-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          VISTA
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
      </div>
    </div>
  );
};

export default PreLoader;