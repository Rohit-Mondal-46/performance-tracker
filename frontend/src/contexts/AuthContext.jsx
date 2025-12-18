import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getCurrentUser();
          if (response.data.success) {
            // Use the user data from localStorage
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('✅ Session restored for user:', parsedUser.email);
          } else {
            console.log('❌ Session invalid, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('No saved session found');
      }
      
      // Add a small delay for better UX and to ensure animation shows
      setTimeout(() => {
        setLoading(false);
      }, 800); // Increased to 800ms to ensure animation is seen
    };

    initAuth();
  }, []);

  const login = async (email, password, role) => {
    setLoading(true); // Set loading true when login starts
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email, 'Role:', role);
      
      let response;
      
      // Call appropriate login endpoint based on role
      switch (role) {
        case 'admin':
          response = await authAPI.adminLogin(email, password);
          break;
        case 'organization':
          response = await authAPI.organizationLogin(email, password);
          break;
        case 'employee':
          response = await authAPI.employeeLogin(email, password);
          break;
        default:
          throw new Error('Invalid role specified');
      }
      
      if (response.data.success && response.data.data.token) {
        const { token, user: userData, role } = response.data.data;
        
        // Ensure role is part of user object
        const userWithRole = {
          ...userData,
          role: role || userData.role // Use role from response or fallback to userData.role
        };
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        
        setUser(userWithRole);
        console.log('✅ LOGIN SUCCESS:', userWithRole);
        
        setLoading(false); // Set loading false after successful login
        return { success: true, user: userWithRole };
      }
      
      setLoading(false); // Set loading false if login fails
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('❌ LOGIN FAILED:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setLoading(false); // Set loading false on error
      return { success: false, message };
    }
  };

  const logout = async () => {
    setLoading(true); // Set loading true when logout starts
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false); // Set loading false after logout
    }
  };

  const isAdmin = user?.role === 'admin';
  const isOrganization = user?.role === 'organization';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin,
      isOrganization,
      isEmployee,
      loading
    }}>
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