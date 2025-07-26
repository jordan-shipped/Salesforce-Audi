/**
 * Centralized API Service
 * Handles all HTTP requests with proper error handling, retry logic, and security
 */

import axios from 'axios';
import SecureStorage from '../utils/secureStorage';

// Custom API Error class
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

// Request timeout and retry configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL;
    
    if (!this.baseURL) {
      console.error('REACT_APP_BACKEND_URL environment variable is not set');
      this.baseURL = 'http://localhost:8000'; // Fallback for development
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const sessionId = SecureStorage.getItem('salesforce_session_id');
        if (sessionId) {
          config.headers['X-Session-ID'] = sessionId;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() };
        
        return config;
      },
      (error) => {
        return Promise.reject(new ApiError('Request setup failed', 0, error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (process.env.NODE_ENV === 'development') {
          const duration = Date.now() - response.config.metadata.startTime;
          console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
        }
        
        return response;
      },
      (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handle and standardize API errors
   */
  handleResponseError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle specific error cases
      switch (status) {
        case 401:
          // Unauthorized - clear session and redirect to login
          SecureStorage.removeItem('salesforce_session_id');
          window.location.href = '/';
          return Promise.reject(new ApiError('Session expired. Please log in again.', status, data));
          
        case 403:
          return Promise.reject(new ApiError('Access denied. You do not have permission to perform this action.', status, data));
          
        case 404:
          return Promise.reject(new ApiError('The requested resource was not found.', status, data));
          
        case 422:
          return Promise.reject(new ApiError('Invalid data provided. Please check your input.', status, data));
          
        case 429:
          return Promise.reject(new ApiError('Too many requests. Please wait a moment and try again.', status, data));
          
        case 500:
          return Promise.reject(new ApiError('Server error. Our team has been notified.', status, data));
          
        default:
          const message = data?.message || data?.detail || 'An unexpected error occurred';
          return Promise.reject(new ApiError(message, status, data));
      }
    } else if (error.request) {
      // Network error - no response received
      return Promise.reject(new ApiError('Network error. Please check your connection and try again.', 0, error));
    } else {
      // Something else happened
      return Promise.reject(new ApiError('Request failed. Please try again.', 0, error));
    }
  }

  /**
   * Retry logic for failed requests
   */
  async requestWithRetry(requestFn, retries = MAX_RETRIES) {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Exponential backoff
        return this.requestWithRetry(requestFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  /**
   * Delay utility for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Business Info API
   */
  async saveBusinessInfo(businessInfo) {
    return this.requestWithRetry(async () => {
      const response = await this.client.post('/api/session/business-info', businessInfo);
      return response.data;
    });
  }

  /**
   * Session Management API
   */
  async getSessions() {
    return this.requestWithRetry(async () => {
      const response = await this.client.get('/api/audit/sessions');
      return response.data;
    });
  }

  /**
   * Audit API
   */
  async runAudit(auditRequest) {
    // Don't retry audit requests as they may be expensive
    const response = await this.client.post('/api/audit/run', auditRequest, {
      timeout: 60000, // Longer timeout for audit
    });
    return response.data;
  }

  async getAuditData(sessionId) {
    return this.requestWithRetry(async () => {
      const response = await this.client.get(`/api/audit/${sessionId}`);
      return response.data;
    });
  }

  async updateAssumptions(sessionId, assumptions) {
    const response = await this.client.post(`/api/audit/${sessionId}/update-assumptions`, assumptions);
    return response.data;
  }

  async generatePDF(sessionId) {
    const response = await this.client.get(`/api/audit/${sessionId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * OAuth API
   */
  getOAuthUrl() {
    return `${this.baseURL}/api/oauth/authorize`;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/api/health');
      return { status: 'healthy', data: response.data };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export convenience methods
export const api = {
  // Business Info
  saveBusinessInfo: (data) => apiService.saveBusinessInfo(data),
  
  // Sessions
  getSessions: () => apiService.getSessions(),
  
  // Audit
  runAudit: (data) => apiService.runAudit(data),
  getAuditData: (sessionId) => apiService.getAuditData(sessionId),
  updateAssumptions: (sessionId, assumptions) => apiService.updateAssumptions(sessionId, assumptions),
  generatePDF: (sessionId) => apiService.generatePDF(sessionId),
  
  // OAuth
  getOAuthUrl: () => apiService.getOAuthUrl(),
  
  // Health
  healthCheck: () => apiService.healthCheck(),
};

export default apiService;