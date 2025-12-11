import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(undefined);

// Helper to detect if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};

// Storage helpers that work in both web and Electron
const storage = {
  getItem: async (key) => {
    if (isElectron()) {
      // In Electron, get token from secure cookie storage
      if (key === 'token') {
        return await window.electron.auth.getToken();
      }
      // For other items, use localStorage
      return localStorage.getItem(key);
    }
    return localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    // Token is handled by Electron IPC, other data in localStorage
    if (key !== 'token' || !isElectron()) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (key !== 'token' || !isElectron()) {
      localStorage.removeItem(key);
    }
  }
};

export function AuthProvider({ children }) {
  console.log('🔐 AuthProvider initializing...');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    console.log('🔍 AuthProvider useEffect running...');
    const initAuth = async () => {
      try {
        const token = await storage.getItem('token');
        const savedUser = await storage.getItem('user');
        
        if (token && savedUser) {
          try {
            // Verify token is still valid
            const response = await authAPI.getCurrentUser();
            if (response.data.success) {
              setUser(JSON.parse(savedUser));
            } else {
              await storage.removeItem('token');
              await storage.removeItem('user');
            }
          } catch (error) {
            console.error('Session verification failed:', error);
            await storage.removeItem('token');
            await storage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Init auth error:', error);
      } finally {
        console.log('✅ Auth initialization complete, loading:', false);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Is Electron:', isElectron());
      
      // In Electron, use IPC for login
      if (isElectron()) {
        const result = await window.electron.auth.login({ email, password });
        
        if (result.success && result.user) {
          const userWithRole = {
            ...result.user,
            role: result.user.role || 'employee'
          };
          
          await storage.setItem('user', JSON.stringify(userWithRole));
          setUser(userWithRole);
          console.log('✅ ELECTRON LOGIN SUCCESS:', userWithRole);
          
          return { success: true, user: userWithRole };
        }
        
        return { success: false, message: result.message || 'Login failed' };
      }
      
      // Web login
      const response = await authAPI.employeeLogin(email, password);
      
      if (response.data.success && response.data.data.token) {
        const { token, user: userData, role } = response.data.data;
        
        const userWithRole = {
          ...userData,
          role: role || userData.role
        };
        
        await storage.setItem('token', token);
        await storage.setItem('user', JSON.stringify(userWithRole));
        
        setUser(userWithRole);
        console.log('✅ WEB LOGIN SUCCESS:', userWithRole);
        
        return { success: true, user: userWithRole };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('❌ LOGIN FAILED:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      if (isElectron()) {
        await window.electron.auth.logout();
      } else {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.removeItem('token');
      await storage.removeItem('user');
      setUser(null);
    }
  };

  const isEmployee = user?.role === 'employee';
  const isAuthenticated = !!user;

  if (loading) {
    console.log('⏳ AuthProvider still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  console.log('✅ AuthProvider ready, rendering children. User:', user);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isEmployee,
      isAuthenticated,
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