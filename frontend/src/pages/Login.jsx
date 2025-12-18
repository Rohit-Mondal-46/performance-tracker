import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Monitor, Eye, EyeOff, AlertCircle, Shield, Users, User, ArrowLeft } from 'lucide-react';

export function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRole = location.state?.selectedRole || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login, isAdmin, isOrganization, isEmployee } = useAuth();

  if (user) {
    if (isAdmin) {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (isOrganization) {
      return <Navigate to="/organization-dashboard" replace />;
    } else if (isEmployee) {
      return <Navigate to="/employee-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const getRoleInfo = () => {
    switch (selectedRole) {
      case 'admin':
        return {
          icon: Shield,
          color: 'red',
          title: 'Admin Login',
          description: 'Sign in with your administrator credentials'
        };
      case 'organization':
        return {
          icon: Users,
          color: 'blue',
          title: 'Organization Login',
          description: 'Sign in with your organization credentials'
        };
      case 'employee':
        return {
          icon: User,
          color: 'green',
          title: 'Employee Login',
          description: 'Sign in with your employee credentials'
        };
      default:
        return {
          icon: Monitor,
          color: 'blue',
          title: 'Welcome to Performance Tracker',
          description: 'Sign in to access your dashboard'
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== LOGIN FORM SUBMISSION ===');
      console.log('Email entered:', email);
      console.log('Selected role:', selectedRole);
      
      const result = await login(email, password, selectedRole);
      
      if (!result.success) {
        setError(result.message || 'Invalid email or password');
        console.log('❌ Login failed in form handler');
      } else {
        console.log('✅ Login successful in form handler');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="max-w-md w-full relative z-20">
        {/* Back to Role Selection Button */}
        <button
          onClick={() => navigate('/role-selection')}
          className="flex items-center space-x-2 text-slate-100 hover:text-white transition-colors duration-200 mb-4 group bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Role Selection</span>
        </button>

        <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-white/10 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <div className={`bg-${roleInfo.color}-100 dark:bg-${roleInfo.color}-900/20 p-3 rounded-xl transform transition-all duration-500 hover:scale-110 hover:rotate-12 relative overflow-hidden group`}>
                <RoleIcon className={`h-6 w-6 sm:h-8 sm:w-8 text-${roleInfo.color}-600 relative z-10`} />
                <div className={`absolute inset-0 bg-gradient-to-r from-${roleInfo.color}-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
              {roleInfo.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {roleInfo.description}
            </p>
          </div>

          {/* Demo credentials
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border border-blue-200 dark:border-blue-800">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
              Demo Credentials:
            </p>
            <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Admin:</strong> admin@VISTA.com / a*******3</p>
              <p><strong>HR Manager:</strong> hr@VISTA.com / h******3</p>
              <p><strong>Employee:</strong> employee@VISTA.com / e********3</p>
            </div>
          </div> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 flex items-center animate-bounce-in">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-500 text-sm sm:text-base transform hover:scale-105"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-500 pr-12 text-sm sm:text-base transform hover:scale-105"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-500 hover:scale-125 p-1 rounded"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-medium py-2 sm:py-3 px-4 rounded-xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 hover:shadow-xl text-sm sm:text-base"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}