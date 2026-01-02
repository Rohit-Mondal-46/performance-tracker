<<<<<<< HEAD
// contexts/AuthContext.jsx - COMPLETE FIX
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Single source of truth for Electron detection
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Unified storage that works everywhere
const createStorage = () => {
  return {
    getItem: async (key) => {
      try {
        if (isElectron() && key === 'token' && window.electronAPI?.auth?.getToken) {
          return await window.electronAPI.auth.getToken();
        }
        return localStorage.getItem(key);
      } catch (err) {
        console.warn('Storage getItem failed:', err);
        return localStorage.getItem(key);
      }
    },
    
    setItem: async (key, value) => {
      localStorage.setItem(key, value);
      
      if (isElectron() && key === 'token' && value) {
        try {
          if (window.electronAPI?.screenshot?.setToken) {
            await window.electronAPI.screenshot.setToken(value);
          }
        } catch (err) {
          console.error('Failed to sync token to Electron:', err);
        }
      }
    },
    
    removeItem: async (key) => {
      localStorage.removeItem(key);
      if (isElectron() && key === 'token' && window.electronAPI?.screenshot?.stop) {
        try {
          await window.electronAPI.screenshot.stop();
        } catch (err) {
          console.error('Failed to stop screenshots:', err);
        }
      }
    }
  };
};

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const storage = createStorage();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = await storage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          
          // Auto-start screenshots if we have a token
          if (isElectron() && window.electronAPI?.screenshot) {
            setTimeout(async () => {
              try {
                const token = await storage.getItem('token');
                if (token && window.electronAPI?.screenshot?.setToken) {
                  await window.electronAPI.screenshot.setToken(token);
                  const status = await window.electronAPI.screenshot.status();
                  if (!status.running) {
                    await window.electronAPI.screenshot.start();
                  }
                }
              } catch (err) {
                console.warn('Auto-start screenshots failed:', err);
              }
            }, 1000);
          }
        }
      } catch (err) {
        console.error('[Auth] Init failed:', err);
=======
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
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
>>>>>>> 966e2588cf863eb6a980edcaff9998d6ee73909e
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD
    
=======

>>>>>>> 966e2588cf863eb6a980edcaff9998d6ee73909e
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
<<<<<<< HEAD
      
      // ALWAYS use Electron login if available
      if (isElectron() && window.electronAPI?.auth?.login) {
        const result = await window.electronAPI.auth.login({ email, password });
        
        if (result.success && result.user) {
          // Store user
          await storage.setItem('user', JSON.stringify(result.user));
          setUser(result.user);
          
          // Token is automatically set by Electron main process
          return { success: true };
        }
      }
      
      // Fallback to web login
      const res = await authAPI.employeeLogin(email, password);
      
      if (res.data?.success) {
        const { token, user } = res.data.data;
        
        // Store in localStorage
        await storage.setItem('token', token);
        await storage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        // If in Electron, sync token
        if (isElectron() && window.electronAPI?.screenshot?.setToken) {
          try {
            await window.electronAPI.screenshot.setToken(token);
            await window.electronAPI.screenshot.start();
          } catch (err) {
            console.error('Failed to sync token:', err);
          }
        }
        
        return { success: true };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (err) {
      console.error('🔐 Login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
=======
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
        
        return { success: true, user: userWithRole };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('❌ LOGIN FAILED:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
>>>>>>> 966e2588cf863eb6a980edcaff9998d6ee73909e
    }
  };

  const logout = async () => {
    try {
<<<<<<< HEAD
      if (isElectron() && window.electronAPI?.auth?.logout) {
        await window.electronAPI.auth.logout();
      } else {
        await authAPI.logout();
      }
=======
      if (isElectron()) {
        await window.electron.auth.logout();
      } else {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
>>>>>>> 966e2588cf863eb6a980edcaff9998d6ee73909e
    } finally {
      await storage.removeItem('token');
      await storage.removeItem('user');
      setUser(null);
    }
  };

<<<<<<< HEAD
  if (loading) {
=======
  const isEmployee = user?.role === 'employee';
  const isAuthenticated = !!user;

  if (loading) {
    console.log('⏳ AuthProvider still loading...');
>>>>>>> 966e2588cf863eb6a980edcaff9998d6ee73909e
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

<<<<<<< HEAD
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isEmployee: user?.role === 'employee',
      }}
    >
=======
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
>>>>>>> 966e2588cf863eb6a980edcaff9998d6ee73909e
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
<<<<<<< HEAD
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
=======
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
>>>>>>> 966e2588cf863eb6a980edcaff9998d6ee73909e
}