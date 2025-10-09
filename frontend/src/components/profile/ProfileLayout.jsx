import React from 'react';

export function ProfileLayout({ title, subtitle, user, role, roleIcon: Icon, roleColor, children }) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-700 dark:text-blue-300'
    },
    green: {
      bg: 'from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-700 dark:text-green-300'
    }
  };

  const colors = colorClasses[roleColor] || colorClasses.blue;

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white gradient-text">{title}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            {subtitle}
          </p>
        </div>

        <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-1">
          <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {user?.avatar && (
                <div className="relative group">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full transform transition-transform duration-500 hover:scale-110 shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {role}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Account Information
            </h3>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}