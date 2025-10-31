import React, { useState } from 'react';
import { ProfileTabs } from './ProfileTabs';
import { ProfileOverview } from './ProfileOverview';
import { ProfilePerformance } from './ProfilePerformance';
import { ProfilePrivacy } from './ProfilePrivacy';
import { ProfileSettings } from './ProfileSettings';

export function EmployeeProfile({ user }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'performance', label: 'Performance', icon: 'TrendingUp' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview user={user} />;
      case 'performance':
        return <ProfilePerformance />;
      case 'privacy':
        return <ProfilePrivacy />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return <ProfileOverview user={user} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="mb-6 sm:mb-8 animate-fade-in-up relative z-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white gradient-text">Profile</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Manage your account and privacy settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProfileTabs 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={user}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}