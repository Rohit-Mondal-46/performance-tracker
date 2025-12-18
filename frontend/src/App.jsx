// App.jsx (Updated - Theme toggle removed from here since it's in navbar)
import React, { useState, useEffect } from 'react';
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
import PreLoader from './components/Loaders/PreLoader';
import LoadingAnimation from './components/Loaders/LoadingAnimation';

// Main Layout Wrapper
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {children}
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAdmin, isOrganization, isEmployee, loading } = useAuth();

  // Show loading animation while checking auth
  if (loading) {
    return <LoadingAnimation />;
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

  // Show loading animation while checking auth
  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <AppLayout>
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
    </AppLayout>
  );
}

// Main App component with pre-loader
function App() {
  const [appLoading, setAppLoading] = useState(true);

  // This useEffect ensures we show a pre-loader immediately
  useEffect(() => {
    // Add a small delay to show the pre-loader
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 100); // Very short delay to ensure React renders first

    return () => clearTimeout(timer);
  }, []);

  // Show pre-loader while app is initializing
  if (appLoading) {
    return <PreLoader />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;