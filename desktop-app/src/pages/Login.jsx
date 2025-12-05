import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Monitor, Eye, EyeOff, AlertCircle, Shield, Users, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      color: 'red',
      description: 'System administrator with full access',
      credentials: 'admin@promonitor.com / admin123'
    },
    {
      id: 'hr_manager',
      name: 'HR Manager',
      icon: Users,
      color: 'blue',
      description: 'HR manager with employee management access',
      credentials: 'hr@promonitor.com / hr123456'
    },
    {
      id: 'employee',
      name: 'Employee',
      icon: User,
      color: 'green',
      description: 'Employee with performance tracking access',
      credentials: 'employee@promonitor.com / employee123'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password, selectedRole.id);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      }
      // If successful, the AuthProvider will handle the state update
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    switch (role) {
      case 'admin':
        setEmail('admin@promonitor.com');
        setPassword('admin123');
        break;
      case 'hr_manager':
        setEmail('hr@promonitor.com');
        setPassword('hr123456');
        break;
      case 'employee':
        setEmail('employee@promonitor.com');
        setPassword('employee123');
        break;
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-xl">
                <Monitor className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Performance Tracker Desktop
            </h1>
            <p className="text-gray-600">
              Select your role to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border border-gray-200"
                >
                  <div className="text-center">
                    <div className={`bg-${role.color}-100 p-4 rounded-xl inline-block mb-4`}>
                      <RoleIcon className={`h-8 w-8 text-${role.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {role.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {role.description}
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Demo Credentials:</p>
                      <p className="text-xs font-mono text-gray-700">
                        {role.credentials}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              This is a demo application. Use the provided credentials to test different roles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentRole = roles.find(r => r.id === selectedRole.id);
  const RoleIcon = currentRole.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4 bg-white/50 px-4 py-2 rounded-lg hover:bg-white/80"
        >
          <span>← Back to Role Selection</span>
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={`bg-${currentRole.color}-100 p-3 rounded-xl`}>
                <RoleIcon className={`h-8 w-8 text-${currentRole.color}-600`} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentRole.name} Login
            </h1>
            <p className="text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Demo Credentials:
            </p>
            <p className="text-sm text-blue-700 font-mono mb-2">
              {currentRole.credentials}
            </p>
            <button
              onClick={() => fillDemoCredentials(currentRole.id)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Click to fill credentials
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;