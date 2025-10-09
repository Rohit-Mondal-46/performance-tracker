import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Monitor, 
  Users, 
  Settings, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';


export function Layout({ children }) {
  const { user, logout, isAdmin, isHRManager, isEmployee } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const getNavigationItems = () => {
    if (isAdmin) {
      return [
        { name: 'Admin Dashboard', href: '/admin-dashboard', icon: Shield },
        { name: 'Profile', href: '/profile', icon: User },
      ];
    } else if (isHRManager) {
      return [
        { name: 'HR Dashboard', href: '/hr-dashboard', icon: Monitor },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Blockchain', href: '/blockchain', icon: Shield },
        { name: 'Profile', href: '/profile', icon: User },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Monitor },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Blockchain', href: '/blockchain', icon: Shield },
        { name: 'Profile', href: '/profile', icon: User },
      ];
    }
  };

  const filteredNavigation = getNavigationItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 transition-all duration-500 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '6s' }}></div>
      </div>
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} glass backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 shadow-2xl transition-all duration-500 transform border-r border-white/20 dark:border-white/10`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <div className="relative group">
                <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 animate-pulse transition-opacity duration-500"></div>
              </div>
              {!sidebarCollapsed && (
                <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white transition-opacity duration-500 gradient-text">
                  ProMonitor
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-500 transform hover:scale-125 hover:rotate-180 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-6 space-y-1 overflow-hidden">
            {filteredNavigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-500 transform hover:scale-105 hover:translate-x-1 relative overflow-hidden animate-fade-in-up ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-lg border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className="relative">
                    <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    {isActive && (
                      <div className="absolute inset-0 bg-blue-600/30 rounded-full blur-sm animate-pulse"></div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="transition-opacity duration-500 truncate">{item.name}</span>
                  )}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-full animate-pulse"></div>
                  )}
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-3 sm:p-4 transition-all duration-500">
            <div className={`flex items-center mb-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              {user?.avatar && (
                <div className="relative group">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full transform transition-transform duration-500 group-hover:scale-125 shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse transition-opacity duration-500"></div>
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'hr_manager' ? 'HR Manager' : 'Employee'}
                  </p>
                </div>
              )}
            </div>
            <div className={`flex items-center ${sidebarCollapsed ? 'flex-col space-y-2' : 'justify-between'}`}>
              <button
                onClick={toggle}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-500 transform hover:scale-125 hover:rotate-180 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 magnetic"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={logout}
                className={`flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-500 transform hover:scale-110 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 magnetic ${sidebarCollapsed ? 'justify-center' : ''}`}
                title="Sign out"
              >
                <LogOut className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
                {!sidebarCollapsed && 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${sidebarCollapsed ? 'pl-16' : 'pl-64'} transition-all duration-500`}>
        <main className="min-h-screen relative">
          {children}
        </main>
      </div>
    </div>
  );
}