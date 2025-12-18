import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { RoleSelection } from './pages/RoleSelection';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrganizationDashboard } from './pages/OrganizationDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { OrganizationAnalytics } from './pages/OrganizationAnalytics';
import { EmployeeAnalytics } from './pages/EmployeeAnalytics';
import { Landing } from './pages/Landing';
import { ContactRequest } from './pages/ContactRequest';

// Loading Spinner Component
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 border-4 border-blue-200/30 rounded-full"></div>
        
        {/* Spinning ring */}
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
        
        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-16 h-16 border-4 border-blue-100/20 rounded-full"></div>
        
        {/* Pulsing dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Loading Application</h2>
        <p className="text-gray-300">Please wait while we verify your session...</p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAdmin, isOrganization, isEmployee, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'organization' && !isOrganization && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'employee' && !isEmployee && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, isAdmin, isOrganization, isEmployee, loading } = useAuth();

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = () => {
    if (isAdmin) return '/admin-dashboard';
    if (isOrganization) return '/organization-dashboard';
    if (isEmployee) return '/employee-dashboard';
    return '/';
  };

  // Show loading spinner while checking auth
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Root path - redirect to dashboard if already logged in */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={getDashboardRoute()} replace />
          ) : (
            <Landing />
          )
        }
      />

      {/* Login page - redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={getDashboardRoute()} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Role selection page - redirect to dashboard if already logged in */}
      <Route
        path="/role-selection"
        element={
          user ? (
            <Navigate to={getDashboardRoute()} replace />
          ) : (
            <RoleSelection />
          )
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Organization dashboard */}
      <Route
        path="/organization-dashboard"
        element={
          <ProtectedRoute requiredRole="organization">
            <OrganizationDashboard />
          </ProtectedRoute>
        }
      />

      {/* Employee dashboard */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Organization analytics */}
      <Route
        path="/organization-analytics"
        element={
          <ProtectedRoute requiredRole="organization">
            <OrganizationAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Employee analytics */}
      <Route
        path="/employee-analytics"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Contact page - accessible to everyone */}
      <Route path="/contact" element={<ContactRequest />} />

      {/* Catch-all route - redirect to appropriate dashboard or landing */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate to={getDashboardRoute()} replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen transition-colors">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;