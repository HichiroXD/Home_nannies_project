/**
 * Configuración global de la aplicación
 */

// URL base del backend API - Usa variable de entorno si está disponible
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : "http://localhost:8000";
  
export const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;

/**
 * Construye la URL completa para archivos de medios
 * @param {string} mediaPath - Ruta del medio (ej: /media/nanny_profiles/foto.jpg)
 * @returns {string} URL completa del medio
 */
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  if (mediaPath.startsWith('http')) return mediaPath;
  return `${API_BASE_URL}${mediaPath}`;
};
