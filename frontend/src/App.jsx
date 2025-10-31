import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { RoleSelection } from './pages/RoleSelection';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { Landing } from './pages/Landing';
import { ReportViewer } from './components/profile/ReportViewer';

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAdmin, isHRManager, isEmployee } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'hr_manager' && !isHRManager && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, isAdmin, isHRManager } = useAuth();

  const getDashboardRoute = () => {
    if (isAdmin) return '/admin-dashboard';
    // if (isHRManager) return '/hr-dashboard';
    return '/'; // after adding the dashboard route redirect to '/dashboard'
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
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* 
      <Route
        path="/hr-dashboard"
        element={
          <ProtectedRoute requiredRole="hr_manager">
            <HRManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blockchain"
        element={
          <ProtectedRoute>
            <Blockchain />
          </ProtectedRoute>
        }
      />
      <Route
        path="/config"
        element={
          <ProtectedRoute>
            <AIConfigPage />
          </ProtectedRoute>
        }
      />
      */}
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