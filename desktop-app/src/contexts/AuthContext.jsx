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
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      
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
    }
  };

  const logout = async () => {
    try {
      if (isElectron() && window.electronAPI?.auth?.logout) {
        await window.electronAPI.auth.logout();
      } else {
        await authAPI.logout();
      }
    } finally {
      await storage.removeItem('token');
      await storage.removeItem('user');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}