import React from 'react';

const Navbar = ({ user, onLogout }) => {
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'hr_manager':
        return 'HR Manager';
      case 'employee':
        return 'Employee';
      default:
        return role?.toUpperCase() || 'User';
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div>
        <h1 className="font-bold text-xl">Performance Monitor</h1>
        <p className="text-blue-100 text-sm">Desktop Application</p>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{user.name || user.email}</p>
            <p className="text-blue-100 text-sm">{getRoleDisplayName(user.role)}</p>
          </div>
          
          <button
            onClick={onLogout}
            className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;