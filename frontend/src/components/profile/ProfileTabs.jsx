import React from 'react';
import { User, TrendingUp, Shield, Settings } from 'lucide-react';

const iconComponents = {
  User,
  TrendingUp,
  Shield,
  Settings
};

export function ProfileTabs({ tabs, activeTab, onTabChange, user }) {
  return (
    <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-2">
      <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col items-center text-center">
          {user?.avatar && (
            <div className="relative group mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full transform transition-transform duration-500 hover:scale-110 shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          )}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {user?.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {user?.role === 'hr_manager' ? 'HR Manager' : 'Team Member'}
          </p>
        </div>
      </div>

      <nav className="p-3 sm:p-4 space-y-1">
        {tabs.map((tab, index) => {
          const IconComponent = iconComponents[tab.icon];
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-md border border-blue-200 dark:border-blue-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}