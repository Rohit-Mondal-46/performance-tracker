import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('desktopApp_token');
      const savedUser = localStorage.getItem('desktopApp_user');
      
      if (savedToken && savedUser) {
        try {
          // Verify token with backend
          const response = await authAPI.getCurrentUser();
          if (response.success && response.data) {
            const userData = {
              ...response.data.user,
              role: response.data.role
            };
            setUser(userData);
            localStorage.setItem('desktopApp_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid data
          localStorage.removeItem('desktopApp_token');
          localStorage.removeItem('desktopApp_user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role) => {
    console.log('=== DESKTOP APP LOGIN ATTEMPT ===');
    console.log('Email:', email, 'Role:', role);
    
    try {
      const response = await authAPI.login(email, password, role);
      
      if (response.success && response.data) {
        const { user: userData, token, role: userRole } = response.data;
        
        // Create user object with role
        const userWithRole = {
          ...userData,
          role: userRole
        };
        
        console.log('✅ LOGIN SUCCESS for:', email);
        setUser(userWithRole);
        
        // Save to localStorage for persistence
        localStorage.setItem('desktopApp_token', token);
        localStorage.setItem('desktopApp_user', JSON.stringify(userWithRole));
        
        return { success: true, user: userWithRole };
      }
      
      console.log('❌ LOGIN FAILED - Invalid response format');
      return { success: false, error: 'Invalid server response' };
      
    } catch (error) {
      console.error('❌ LOGIN FAILED:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Server is not running. Please start the backend server.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('desktopApp_token');
    localStorage.removeItem('desktopApp_user');
    console.log('User logged out');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isHRManager: user?.role === 'hr_manager',
    isEmployee: user?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}