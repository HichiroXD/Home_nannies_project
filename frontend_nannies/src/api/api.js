import axios from "axios";
import logger from "../utils/logger";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adjuntar el token en cada request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug: log the request data
  if (config.url.includes('/profile/') && (config.method === 'patch' || config.method === 'put')) {
    logger.debug('AXIOS Profile Request', { 
      url: config.url, 
      method: config.method, 
      data: config.data 
    });
  }
  
  return config;
});

/**
 * Global response interceptor for error handling
 * 
 * Handles common error scenarios:
 * - 401 Unauthorized: Clear auth and redirect to login
 * - Network errors: Format error message
 * - Other API errors: Standardize error format
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    
    // Handle 401 Unauthorized
    if (status === 401) {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } catch (e) {
        logger.error('Error clearing auth tokens', { error: e.message });
      }
      // Redirect to login so user can re-authenticate
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    // Standardize error format for easier handling
    const errorResponse = {
      status: status || 0,
      message: error?.response?.data?.detail || 
               error?.response?.data?.message || 
               error?.message || 
               "An unexpected error occurred",
      data: error?.response?.data || null,
    };
    
    // Log errors in development
    if (import.meta.env.DEV) {
      logger.error('API Error', errorResponse);
    }
    
    return Promise.reject(errorResponse);
  }
);

export default API;
