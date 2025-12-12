import React, { useState, useEffect, useRef } from 'react';

// Update the component to accept 'user' and 'onLogout' props
const Navbar = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsDropdownOpen(false); // Close dropdown after logout
  };

  // Generate a simple avatar URL or use a default
  const avatarUrl = user?.name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
    : `https://ui-avatars.com/api/?name=User&background=9ca3af&color=fff`;

  return (
    <header className="bg-white shadow-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 relative">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary"></div>
      
      <div className="flex justify-between items-center h-16">
        {/* Left side: App Title with Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-md p-1.5">
            <img src="./icon.ico" alt="Vista Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              VISTA
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Real-time Activity Tracking</p>
          </div>
        </div>
        
        {/* Right side: User Info and Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          {/* User menu button */}
          <button
            onClick={handleDropdownToggle}
            className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            {/* User Avatar with online indicator */}
            <div className="relative">
              <img
                className="h-9 w-9 rounded-full ring-2 ring-indigo-100"
                src={avatarUrl}
                alt="User avatar"
              />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
            </div>
            {/* User Name/Email (hidden on small screens) */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500">Employee</p>
            </div>
            {/* Dropdown Icon */}
            <svg
              className={`hidden md:block h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-gray-200 focus:outline-none z-50 animate-slide-in"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div className="p-2" role="none">
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                {/* Open Dashboard Button */}
                <button
                  onClick={async () => {
                    try {
                      if (window.electron && window.electron.openExternal) {
                        await window.electron.openExternal('http://localhost:5173/employee-dashboard');
                      } else {
                        window.open('http://localhost:5173/employee-dashboard', '_blank');
                      }
                    } catch (error) {
                      console.error('Failed to open URL:', error);
                    }
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Open Dashboard
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;