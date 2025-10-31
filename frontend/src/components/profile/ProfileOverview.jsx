import React from 'react';
import { Target, Clock, Award } from 'lucide-react';

export function ProfileOverview({ user }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-white/10 transform transition-all duration-300 hover:scale-105 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">89%</p>
            </div>
          </div>
        </div>

        <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-white/10 transform transition-all duration-300 hover:scale-105 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Daily Average</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">7.8h</p>
            </div>
          </div>
        </div>

        <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-white/10 transform transition-all duration-300 hover:scale-105 animate-fade-in-up stagger-5">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">+5.2%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-6">
        <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Account Information
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={user?.role === 'hr_manager' ? 'HR Manager' : 'Team Member'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Member Since
              </label>
              <input
                type="text"
                value="January 15, 2024"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}