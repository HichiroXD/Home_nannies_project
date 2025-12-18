/**
 * Configuración global de la aplicación
 */

// URL base del backend API
export const API_BASE_URL = "http://localhost:8000";
export const API_URL = `${API_BASE_URL}/api`;

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
