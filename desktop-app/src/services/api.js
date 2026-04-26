// services/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);


const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    let token = null;
    
    if (isElectron() && window.electronAPI?.auth?.getToken) {
      token = await window.electronAPI.auth.getToken();
      console.log('🔑 Token from Electron:', token ? 'Found' : 'Not found');
    } else {
      token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token ? 'Found' : 'Not found');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set');
    } else {
      console.warn('⚠️ No token available for request');
    }
    
    const fullUrl = config.baseURL + config.url;
    console.log('📤 API Request:', config.method?.toUpperCase(), fullUrl);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================
// AUTH ENDPOINTS
// ========================
export const authAPI = {
  employeeLogin: (email, password) => 
    api.post('/auth/employee/login', { email, password }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  logout: () => 
    api.post('/auth/logout'),
};

// ========================
// EMPLOYEE ENDPOINTS
// ========================
export const employeeAPI = {
  // Profile Management
  getMyProfile: () => 
    api.get('/employee/profile')
      .then(response => response.data),
  
  updateMyProfile: (data) => 
    api.put('/employee/profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/employee/change-password', { currentPassword, newPassword }),
  
  // Dashboard & Settings
  getDashboard: () => 
    api.get('/employee/dashboard'),
  
  getMySettings: () => 
    api.get('/employee/settings'),
  
  // Performance Data
  getMyPerformanceScores: (limit = 30) => 
    api.get('/performance/employee/scores', {
      params: { limit }
    }),
  
  getPerformanceTrends: (days = 30) => 
    api.get('/performance/employee/trends', {
      params: { days }
    }),
  
  createPerformanceScore: (data) => 
    api.post('/performance/employee/scores', data),
};

// ========================
// ACTIVITY ENDPOINTS
// ========================
export const activityAPI = {
  // Ingest 10-minute activity batch
  ingestActivityBatch: (data) => 
    api.post('/activities/ingest', data),
  
  // Get calculated scores
  getMyCalculatedScores: () => 
    api.get('/activities/scores'),
  
  // Get daily scores
  getMyDailyScores: () => 
    api.get('/activities/daily-scores'),
  
  // Get performance trends
  getMyPerformanceTrends: () => 
    api.get('/activities/trends'),
  
  // Get latest activity
  getMyLatestActivity: () => 
    api.get('/activities/latest'),
};

// ========================
// INPUT TRACKING ENDPOINTS
// Save keyboard/mouse metrics for 5-minute intervals
// Used for displaying detailed input history with screenshots
// ========================
export const inputAPI = {
  // Save 5-minute input batch (keyboard + mouse metrics)
  saveInputBatch: (data) =>
    api.post('/input/batch', data),
  
  // Get input history with date range
  getInputHistory: (params) =>
    api.get('/input/history', { params }),
  
  // Get specific input interval
  getInputInterval: (intervalId) =>
    api.get(`/input/interval/${intervalId}`),
};

// Note: Input tracking routes removed - now using activityAPI.ingestActivityBatch()
// All keyboard/mouse tracking is handled via 5-minute batches sent to /api/activities/ingest

// Export default api instance for custom requests
export default api;