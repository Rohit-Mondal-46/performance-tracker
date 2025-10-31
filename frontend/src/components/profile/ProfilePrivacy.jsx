import React, { useState } from 'react';
import { Eye, Shield, Bell, User, Save } from 'lucide-react';

export function ProfilePrivacy() {
  const [privacySettings, setPrivacySettings] = useState({
    enableMonitoring: true,
    shareData: false,
    notifications: true,
    detailedReports: true,
  });

  const handlePrivacyChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const privacyOptions = [
    {
      key: 'enableMonitoring',
      icon: Eye,
      title: 'Enable Productivity Monitoring',
      description: 'Allow the system to monitor your work activity'
    },
    {
      key: 'shareData',
      icon: Shield,
      title: 'Share Anonymized Data',
      description: 'Help improve the platform with anonymous usage data'
    },
    {
      key: 'notifications',
      icon: Bell,
      title: 'Productivity Notifications',
      description: 'Receive alerts about your productivity trends'
    },
    {
      key: 'detailedReports',
      icon: User,
      title: 'Detailed Reports Access',
      description: 'Allow managers to view your detailed productivity reports'
    }
  ];

  return (
    <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-3">
      <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Privacy & Data Controls
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your data privacy and monitoring preferences
        </p>
      </div>
      <div className="p-4 sm:p-6 space-y-6">
        {privacyOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <div key={option.key} className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <IconComponent className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePrivacyChange(option.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 flex-shrink-0 ${
                  privacySettings[option.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    privacySettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}

        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center transform hover:scale-105 hover:shadow-xl">
            <Save className="h-4 w-4 mr-2" />
            Save Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
}