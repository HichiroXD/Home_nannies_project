/**
 * Configuración centralizada de la API
 * Usa variables de entorno para diferentes ambientes
 */

export const API_CONFIG = {
  // URL base del API - se ajusta según el entorno
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  
  // Timeout para requests (10 segundos)
  timeout: 10000,
  
  // Headers por defecto
  headers: {
    'Content-Type': 'application/json',
  },
};

// URL del WebSocket (para notificaciones en tiempo real)
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

// URL del frontend (para redirecciones)
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

// Feature flags
export const FEATURES = {
  enableOCR: import.meta.env.VITE_ENABLE_OCR !== 'false',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};
