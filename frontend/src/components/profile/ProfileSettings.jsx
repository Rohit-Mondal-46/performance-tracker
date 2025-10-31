import React from 'react';
import { Settings } from 'lucide-react';

export function ProfileSettings() {
  return (
    <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-3">
      <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Account Settings
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Additional settings will be available in future updates
          </p>
        </div>
      </div>
    </div>
  );
}