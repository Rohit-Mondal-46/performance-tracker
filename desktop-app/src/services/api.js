import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('desktopApp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      localStorage.removeItem('desktopApp_token');
      localStorage.removeItem('desktopApp_user');
      // Redirect to login (will be handled by AuthContext)
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Login based on role
  login: async (email, password, role) => {
    const endpoint = getLoginEndpoint(role);
    const response = await apiClient.post(endpoint, { email, password });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we'll clear local data
      console.warn('Logout API call failed:', error);
    }
    // Clear local storage
    localStorage.removeItem('desktopApp_token');
    localStorage.removeItem('desktopApp_user');
  }
};

// Helper function to get login endpoint based on role
function getLoginEndpoint(role) {
  switch (role) {
    case 'admin':
      return '/auth/admin/login';
    case 'hr_manager':
      return '/auth/organization/login'; // hr_manager maps to organization endpoint
    case 'employee':
      return '/auth/employee/login';
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}

// Other API calls can be added here
export const organizationAPI = {
  // Add organization-specific APIs here
};

export const employeeAPI = {
  // Add employee-specific APIs here
};

export const adminAPI = {
  // Add admin-specific APIs here
};

export default apiClient;