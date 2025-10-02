/**
 * API Service - Unified
 * All API calls in one service file
 * Blood Donor Management System
 */

import axios from 'axios';

// ==================== Configuration ====================

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Create axios instance with default config
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Interceptors ====================

/**
 * Request Interceptor
 * Add JWT token to all requests automatically
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle common response scenarios
 */
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('🔒 Unauthorized - Logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          console.error('🚫 Forbidden:', data.detail || 'Access denied');
          break;
          
        case 404:
          console.error('🔍 Not Found:', error.config.url);
          break;
          
        case 500:
          console.error('💥 Server Error:', data.detail || 'Internal server error');
          break;
          
        default:
          console.error('❌ Error:', status, data.detail || error.message);
      }
    } else if (error.request) {
      console.error('📡 Network Error: Cannot connect to server');
      console.error('Make sure backend is running at:', API_BASE_URL);
    } else {
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ==================== Helper Functions ====================

/**
 * Handle API errors
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.detail || error.response.statusText || 'Terjadi kesalahan';
  } else if (error.request) {
    return 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
  } else {
    return error.message || 'Terjadi kesalahan tidak diketahui';
  }
};

// ==================== API Service Object ====================

const apiService = {
  
  // ==================== Authentication ====================
  
  auth: {
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Response with token and user data
     */
    login: async (email, password) => {
      const response = await axiosInstance.post('/login', { email, password });
      
      // Save token and user to localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    },

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise} Response with user data
     */
    register: async (userData) => {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    },

    /**
     * Get current user info
     * @returns {Promise} Current user data
     */
    getCurrentUser: async () => {
      const response = await axiosInstance.get('/me');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    },

    /**
     * Logout user (client-side)
     */
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user has valid token
     */
    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    },

    /**
     * Get user from localStorage
     * @returns {Object|null} User object or null
     */
    getUser: () => {
      const userStr = localStorage.getItem('user');
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    },

    /**
     * Get user role
     * @returns {string|null} User role or null
     */
    getUserRole: () => {
      const user = apiService.auth.getUser();
      return user ? user.role : null;
    },

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} True if user has the role
     */
    hasRole: (role) => {
      return apiService.auth.getUserRole() === role;
    },
  },

  // ==================== Dashboard ====================
  
  dashboard: {
    /**
     * Get admin dashboard statistics
     * @returns {Promise} Dashboard stats
     */
    getAdminDashboard: async () => {
      const response = await axiosInstance.get('/admin/dashboard');
      return response.data;
    },

    /**
     * Get donor dashboard information
     * @returns {Promise} Donor dashboard data
     */
    getDonorDashboard: async () => {
      const response = await axiosInstance.get('/pendonor/dashboard');
      return response.data;
    },

    /**
     * Get system statistics (Admin only)
     * @returns {Promise} System statistics
     */
    getStatistics: async () => {
      const response = await axiosInstance.get('/admin/statistics');
      return response.data;
    },
  },

  // ==================== Blood Stock ====================
  
  bloodStock: {
    /**
     * Get all blood stocks (Public access)
     * @returns {Promise} List of all blood stocks
     */
    getAll: async () => {
      const response = await axiosInstance.get('/blood-stocks');
      return response.data;
    },

    /**
     * Update blood stock quantity (Admin only)
     * @param {string} bloodType - Blood type (e.g., "A+", "O-")
     * @param {number} quantity - Number of blood bags
     * @returns {Promise} Updated blood stock data
     */
    updateStock: async (bloodType, quantity) => {
      const response = await axiosInstance.put(`/admin/blood-stocks/${bloodType}`, {
        jumlah_kantong: quantity
      });
      return response.data;
    },

    /**
     * Get blood stock by type
     * @param {string} bloodType - Blood type
     * @returns {Promise} Blood stock data
     */
    getByType: async (bloodType) => {
      const stocks = await apiService.bloodStock.getAll();
      return stocks.find(stock => stock.gol_darah === bloodType);
    },

    /**
     * Get critical blood stocks
     * @returns {Promise} List of critical blood stocks
     */
    getCriticalStocks: async () => {
      const stocks = await apiService.bloodStock.getAll();
      return stocks.filter(stock => stock.status === 'Kritis');
    },

    /**
     * Get low blood stocks (Critical + Menipis)
     * @returns {Promise} List of low blood stocks
     */
    getLowStocks: async () => {
      const stocks = await apiService.bloodStock.getAll();
      return stocks.filter(stock => 
        stock.status === 'Kritis' || stock.status === 'Menipis'
      );
    },
  },

  // ==================== Blood Request ====================
  
  bloodRequest: {
    /**
     * Get all blood requests
     * Admin sees all, users see own only
     * @returns {Promise} List of blood requests
     */
    getAll: async () => {
      const response = await axiosInstance.get('/blood-requests');
      return response.data;
    },

    /**
     * Create new blood request
     * @param {Object} requestData - Blood request data
     * @returns {Promise} Created blood request
     */
    create: async (requestData) => {
      const response = await axiosInstance.post('/blood-requests', requestData);
      return response.data;
    },

    /**
     * Update blood request status (Admin only)
     * @param {number} requestId - Request ID
     * @param {string} status - New status
     * @param {string} catatan - Admin notes (optional)
     * @returns {Promise} Updated blood request
     */
    updateStatus: async (requestId, status, catatan = null) => {
      const response = await axiosInstance.put(`/admin/blood-requests/${requestId}`, {
        status,
        catatan_admin: catatan
      });
      return response.data;
    },

    /**
     * Get pending requests (Admin only)
     * @returns {Promise} List of pending requests
     */
    getPending: async () => {
      const requests = await apiService.bloodRequest.getAll();
      return requests.filter(req => req.status === 'Pending');
    },

    /**
     * Get approved requests
     * @returns {Promise} List of approved requests
     */
    getApproved: async () => {
      const requests = await apiService.bloodRequest.getAll();
      return requests.filter(req => req.status === 'Disetujui');
    },
  },

  // ==================== User Management ====================
  
  user: {
    /**
     * Get all pendonors (Admin only)
     * @returns {Promise} List of all pendonors
     */
    getAllPendonors: async () => {
      const response = await axiosInstance.get('/admin/pendonors');
      return response.data;
    },

    /**
     * Get all users (Admin only)
     * @returns {Promise} List of all users
     */
    getAllUsers: async () => {
      const response = await axiosInstance.get('/admin/users');
      return response.data;
    },

    /**
     * Get donor histories
     * Admin sees all, pendonor sees own
     * @returns {Promise} List of donor histories
     */
    getDonorHistories: async () => {
      const response = await axiosInstance.get('/donor-histories');
      return response.data;
    },

    /**
     * Create donor history (Admin only)
     * @param {Object} historyData - Donor history data
     * @returns {Promise} Created donor history
     */
    createDonorHistory: async (historyData) => {
      const response = await axiosInstance.post('/admin/donor-histories', historyData);
      return response.data;
    },
  },
};

// ==================== Export ====================

export default apiService;

// Named exports for convenience
export const {
  auth,
  dashboard,
  bloodStock,
  bloodRequest,
  user,
} = apiService;