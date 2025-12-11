import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper to detect if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    let token = null;
    
    if (isElectron()) {
      // Get token from Electron secure storage
      token = await window.electron.auth.getToken();
    } else {
      // Get token from localStorage (web)
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Export default api instance for custom requests
export default api;