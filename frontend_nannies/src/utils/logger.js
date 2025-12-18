/**
 * Logger Utility para Home Nannies Frontend
 * 
 * Propósito: Centralizar logs y evitar console.* en producción
 * 
 * Características:
 * - Solo loguea en development
 * - Integración futura con Sentry/Datadog
 * - Niveles: error, warn, info, debug
 * - Context adicional para debugging
 */

class Logger {
  constructor() {
    this.isDev = import.meta.env.MODE === 'development';
    this.sentry = null; // Placeholder para integración futura
  }

  /**
   * Loguea errores críticos
   * @param {string} message - Mensaje descriptivo del error
   * @param {Error} error - Objeto Error
   * @param {Object} context - Context adicional (userId, action, etc.)
   */
  error(message, error, context = {}) {
    if (this.isDev) {
      console.error(`[ERROR] ${message}`, error, context);
    } else if (this.sentry) {
      // En producción: enviar a Sentry
      this.sentry.captureException(error, {
        extra: { message, ...context }
      });
    }
  }

  /**
   * Loguea advertencias (no críticas)
   * @param {string} message - Mensaje de advertencia
   * @param {Object} context - Context adicional
   */
  warn(message, context = {}) {
    if (this.isDev) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Loguea información general (eventos importantes)
   * @param {string} message - Mensaje informativo
   * @param {Object} context - Context adicional
   */
  info(message, context = {}) {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, context);
    }
  }

  /**
   * Loguea detalles de debugging
   * @param {string} message - Mensaje de debug
   * @param {*} data - Datos a inspeccionar
   */
  debug(message, data = {}) {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * Inicializar integración con Sentry (producción)
   * @param {Object} sentryClient - Cliente de Sentry configurado
   */
  initSentry(sentryClient) {
    this.sentry = sentryClient;
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Ejemplos de uso:
/*
import { logger } from '@/utils/logger';

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
