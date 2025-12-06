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

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAdmin, isOrganization, isEmployee } = useAuth();

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
  const { user, isAdmin, isOrganization, isEmployee } = useAuth();

  const getDashboardRoute = () => {
    if (isAdmin) return '/admin-dashboard';
    if (isOrganization) return '/organization-dashboard';
    if (isEmployee) return '/employee-dashboard';
    return '/';
  };

  return (
    <Routes>
      <Route
        path="/role-selection"
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <RoleSelection />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <Login />}
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization-dashboard"
        element={
          <ProtectedRoute requiredRole="organization">
            <OrganizationDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/organization-analytics"
        element={
          <ProtectedRoute requiredRole="organization">
            <OrganizationAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-analytics"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeAnalytics />
          </ProtectedRoute>
        }
      />
     
      <Route path="/" element={<Landing />} />
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
