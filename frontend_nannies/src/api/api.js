import axios from "axios";
import { refreshToken } from "./userApi";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Variables para manejar el refresh token y evitar múltiples refreshes simultáneos
let isRefreshing = false;
let failedQueue = [];

/**
 * Procesa la cola de requests fallidos después de un refresh exitoso
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para adjuntar el token en cada request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

/**
 * Global response interceptor for error handling
 * 
 * Handles common error scenarios:
 * - 401 Unauthorized: Intenta refrescar el token automáticamente
 * - Si el refresh falla: Limpia tokens y redirige a login
 * - Network errors: Format error message
 * - Other API errors: Standardize error format
 */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    
    // Handle 401 Unauthorized - Intentar refrescar token
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Evitar refrescar si ya estamos refrescando o si la request es del endpoint de refresh
      if (originalRequest.url?.includes('/token/refresh/')) {
        // El refresh falló, limpiar todo y redirigir
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch (e) {
          if (import.meta.env.DEV) {
            console.error("Error clearing auth tokens:", e);
          }
        }
        
        if (typeof window !== "undefined") {
          window.location.href = "/login/";
        }
        
        processQueue(error, null);
        return Promise.reject(error);
      }

      // Si ya estamos refrescando, agregar este request a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Marcar que estamos refrescando y marcar esta request para evitar loops
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const refreshTokenValue = localStorage.getItem("refreshToken");
        if (!refreshTokenValue) {
          throw new Error("No refresh token available");
        }

        const response = await refreshToken(refreshTokenValue);
        const { access, refresh: newRefreshToken } = response;

        // Guardar los nuevos tokens
        localStorage.setItem("accessToken", access);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Actualizar el header del request original
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Procesar la cola de requests pendientes
        processQueue(null, access);

        // Reintentar el request original
        return API(originalRequest);
      } catch (refreshError) {
        // El refresh falló, limpiar tokens y procesar la cola con error
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch (e) {
          if (import.meta.env.DEV) {
            console.error("Error clearing auth tokens:", e);
          }
        }

        processQueue(refreshError, null);

        // Redirigir a login solo si estamos en el navegador
        if (typeof window !== "undefined") {
          window.location.href = "/login/";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
      console.error("API Error:", errorResponse);
    }
    
    return Promise.reject(errorResponse);
  }
);

export default API;
