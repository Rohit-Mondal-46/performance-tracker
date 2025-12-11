// import React from 'react';

// const Navbar = () => {
//   return (
//     <nav className="bg-blue-600 text-white p-4 flex justify-between">
//       <h1 className="font-bold">Performance Monitor</h1>
//       <div>
//         <button className="px-2 py-1 hover:bg-blue-700 rounded">Home</button>
//         {/* Removed Reports button */}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

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
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Left side: App Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Performance Monitor</h1>
        
        {/* Right side: User Info and Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          {/* User menu button */}
          <button
            onClick={handleDropdownToggle}
            className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            {/* User Avatar */}
            <img
              className="h-8 w-8 rounded-full"
              src={avatarUrl}
              alt="User avatar"
            />
            {/* User Name/Email (hidden on small screens) */}
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.name || user?.email || 'User'}
            </span>
            {/* Dropdown Icon */}
            <svg
              className="hidden md:block h-4 w-4 text-gray-400"
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
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div className="py-1" role="none">
                {/* Profile Link */}
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Your Profile
                </a>
                {/* Settings Link */}
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Settings
                </a>
                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
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