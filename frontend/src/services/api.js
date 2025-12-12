import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  adminLogin: (email, password) => 
    api.post('/auth/admin/login', { email, password }),
  
  organizationLogin: (email, password) => 
    api.post('/auth/organization/login', { email, password }),
  
  employeeLogin: (email, password) => 
    api.post('/auth/employee/login', { email, password }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  logout: () => 
    api.post('/auth/logout'),
};

// ========================
// ADMIN ENDPOINTS
// ========================
export const adminAPI = {
  // Organization Management
  createOrganization: (data) => 
    api.post('/admin/organizations', data),
  
  getAllOrganizations: () => 
    api.get('/admin/organizations'),
  
  getOrganizationById: (id) => 
    api.get(`/admin/organizations/${id}`),
  
  updateOrganization: (id, data) => 
    api.put(`/admin/organizations/${id}`, data),
  
  deleteOrganization: (id) => 
    api.delete(`/admin/organizations/${id}`),
  
  // Employee Management
  getAllEmployees: () => 
    api.get('/admin/employees'),
  
  getEmployeesByOrganization: (organizationId) => 
    api.get(`/admin/organizations/${organizationId}/employees`),
  
  // Dashboard
  getDashboardStats: () => 
    api.get('/admin/dashboard'),
};

// ========================
// ORGANIZATION ENDPOINTS
// ========================
export const organizationAPI = {
  // Employee Management
  createEmployee: (data) => 
    api.post('/organization/employees', data),
  
  getMyEmployees: () => 
    api.get('/organization/employees'),
  
  getEmployeeById: (id) => 
    api.get(`/organization/employees/${id}`),
  
  updateEmployee: (id, data) => 
    api.put(`/organization/employees/${id}`, data),
  
  deleteEmployee: (id) => 
    api.delete(`/organization/employees/${id}`),
  
  // Profile Management
  getMyProfile: () => 
    api.get('/organization/profile'),
  
  updateMyProfile: (data) => 
    api.put('/organization/profile', data),
  
  // Dashboard
  getDashboard: () => 
    api.get('/organization/dashboard'),
};

// ========================
// EMPLOYEE ENDPOINTS
// ========================
export const employeeAPI = {
  // Profile Management
  getMyProfile: () => 
    api.get('/employee/profile').then(response => response.data),
  
  updateMyProfile: (data) => 
    api.put('/employee/profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/employee/change-password', { currentPassword, newPassword }),
  
  // Dashboard & Settings
  getDashboard: () => 
    api.get('/employee/dashboard'),
  
  getMySettings: () => 
    api.get('/employee/settings'),
  
  // Activity & Performance Data (from /activities routes)
  getMyCalculatedScores: (limit = 30) => 
    api.get('/activities/scores', {
      params: { limit }
    }),
  
  getMyDailyScores: (days = 30) => 
    api.get('/activities/daily-scores', {
      params: { days }
    }),
  
  getMyPerformanceTrends: (days = 30) => 
    api.get('/activities/trends', {
      params: { days }
    }),
  
  getMyLatestActivity: () => 
    api.get('/activities/latest'),
};

// ========================
// ACTIVITY ENDPOINTS (for activity ingestion)
// ========================
export const activityAPI = {
  ingestActivityBatch: (data) => 
    api.post('/activities/ingest', data),
  
  getMyCalculatedScores: (limit = 30) => 
    api.get('/activities/scores', {
      params: { limit }
    }),
  
  getMyDailyScores: (days = 30) => 
    api.get('/activities/daily-scores', {
      params: { days }
    }),
  
  getMyPerformanceTrends: (days = 30) => 
    api.get('/activities/trends', {
      params: { days }
    }),
  
  getMyLatestActivity: () => 
    api.get('/activities/latest'),
};

// ========================
// CONTACT ENDPOINTS
// ========================
export const contactAPI = {
  sendContactRequest: (data) => 
    api.post('/contact', data),
};

// Export default api instance for custom requests
export default api;
