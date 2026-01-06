/**
 * Logger Utility para Home Nannies Frontend
 * 
 * Propósito: Centralizar logs y evitar console.* en producción
 * 
 * Características:
 * - Solo loguea en development
 * - Integración con servicios externos (Sentry, etc.)
 * - Niveles: error, warn, info, debug
 * - Context adicional para debugging
 * - Performance monitoring
 */

class Logger {
  constructor() {
    this.isDev = import.meta.env.MODE === 'development';
    this.sentry = null; // Placeholder para integración futura
    this.isEnabled = import.meta.env.VITE_ENABLE_LOGGING !== 'false';
  }

  /**
   * Obtiene timestamp formateado
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Loguea errores críticos
   * @param {string} message - Mensaje descriptivo del error
   * @param {Error|Object} error - Objeto Error o contexto
   * @param {Object} context - Context adicional (userId, action, etc.)
   */
  error(message, error = {}, context = {}) {
    if (!this.isEnabled) return;

    const logData = {
      timestamp: this._getTimestamp(),
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...context,
    };

    if (this.isDev) {
      console.error(`[ERROR] ${message}`, logData);
    }

    // En producción: enviar a Sentry u otro servicio
    if (this.sentry) {
      this.sentry.captureException(error instanceof Error ? error : new Error(message), {
        extra: logData
      });
    }
  }

  /**
   * Loguea advertencias (no críticas)
   * @param {string} message - Mensaje de advertencia
   * @param {Object} context - Context adicional
   */
  warn(message, context = {}) {
    if (!this.isEnabled || !this.isDev) return;
    
    console.warn(`[WARN] [${this._getTimestamp()}] ${message}`, context);
  }

  /**
   * Loguea información general (eventos importantes)
   * @param {string} message - Mensaje informativo
   * @param {Object} context - Context adicional
   */
  info(message, context = {}) {
    if (!this.isEnabled || !this.isDev) return;
    
    console.log(`[INFO] [${this._getTimestamp()}] ${message}`, context);
  }

  /**
   * Loguea detalles de debugging
   * @param {string} message - Mensaje de debug
   * @param {*} data - Datos a inspeccionar
   */
  debug(message, data = {}) {
    if (!this.isEnabled || !this.isDev) return;
    
    console.log(`[DEBUG] [${this._getTimestamp()}] ${message}`, data);
  }

  /**
   * Registra inicio de operación para medir performance
   * @param {string} label - Etiqueta de la operación
   * @returns {Function} - Función para finalizar y registrar tiempo
   */
  time(label) {
    if (!this.isEnabled || !this.isDev) return () => {};
    
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
    };
  }

  /**
   * Agrupa logs relacionados
   * @param {string} groupName - Nombre del grupo
   * @param {Function} callback - Función con logs a agrupar
   */
  group(groupName, callback) {
    if (!this.isEnabled || !this.isDev) {
      callback();
      return;
    }

    console.group(groupName);
    callback();
    console.groupEnd();
  }

  /**
   * Inicializar integración con Sentry (producción)
   * @param {Object} sentryClient - Cliente de Sentry configurado
   */
  initSentry(sentryClient) {
    this.sentry = sentryClient;
    this.info('Sentry initialized');
  }
}

// Exportar instancia singleton como default
const logger = new Logger();
export default logger;

// Ejemplos de uso:
/*
import logger from '@/utils/logger';

// Error handling
try {
  const response = await api.post('/bookings', data);
  logger.info('Booking created', { bookingId: response.data.id });
} catch (error) {
  logger.error('Booking creation failed', error, { 
    userId: user.id,
    data: data 
  });
}

// Warnings
logger.warn('Deprecated API endpoint used', { endpoint: '/old-api' });

// Debug info
logger.debug('Component mounted', { props, state });
*/
