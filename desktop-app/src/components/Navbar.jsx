import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="font-bold text-xl">Performance Monitor</h1>
      
      {user && (
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded-lg">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs bg-blue-800 px-2 py-1 rounded capitalize">
              {user.role.replace('_', ' ')}
            </span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-1 hover:bg-blue-700 rounded transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
