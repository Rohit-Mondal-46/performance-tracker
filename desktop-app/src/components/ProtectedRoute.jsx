import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated);

  // Show loading spinner while checking auth status
  if (loading) {
    console.log('⏳ ProtectedRoute showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render the protected content if authenticated
  console.log('✅ ProtectedRoute rendering protected content');
  return children;
};

export default ProtectedRoute;
