import React from 'react';
import { User } from 'lucide-react';
import { ProfileLayout } from './ProfileLayout';

export function HRManagerProfile({ user }) {
  return (
    <ProfileLayout
      title="HR Manager Profile"
      subtitle="Manage your HR manager account"
      user={user}
      role="Human Resources Manager"
      roleIcon={User}
      roleColor="green"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={user?.name || ''}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center">
                <User className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="font-semibold text-green-700 dark:text-green-300">HR Manager</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Member Since
            </label>
            <input
              type="text"
              value="January 15, 2024"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
              readOnly
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <User className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              As an HR Manager, you have access to employee monitoring, team analytics, and comprehensive reporting features.
            </p>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}