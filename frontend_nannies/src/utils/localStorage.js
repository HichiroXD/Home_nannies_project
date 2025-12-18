/**
 * LocalStorage Helper - Utilidades seguras para localStorage
 * 
 * Propósito: Manejo seguro de localStorage con error handling
 * 
 * Características:
 * - Try-catch automático
 * - Fallback a valores por defecto
 * - Manejo de JSON parsing errors
 * - Manejo de quota exceeded
 * - Compatible con modo incógnito
 */

import { logger } from './logger';

/**
 * Verifica si localStorage está disponible
 * @returns {boolean}
 */
const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Obtiene un valor de localStorage de forma segura
 * @param {string} key - Clave del item
 * @param {*} defaultValue - Valor por defecto si no existe o hay error
 * @returns {*} Valor parseado o defaultValue
 */
export const getItem = (key, defaultValue = null) => {
  if (!isLocalStorageAvailable()) {
    logger.warn('localStorage no disponible (modo incógnito?)');
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    // Intentar parsear como JSON
    try {
      return JSON.parse(item);
    } catch {
      // Si no es JSON, retornar string raw
      return item;
    }
  } catch (error) {
    logger.error(`Error leyendo de localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Guarda un valor en localStorage de forma segura
 * @param {string} key - Clave del item
 * @param {*} value - Valor a guardar (será stringificado si es objeto)
 * @returns {boolean} true si se guardó exitosamente
 */
export const setItem = (key, value) => {
  if (!isLocalStorageAvailable()) {
    logger.warn('localStorage no disponible (modo incógnito?)');
    return false;
  }

  try {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      logger.error('localStorage quota exceeded', error, { key, valueSize: JSON.stringify(value).length });
    } else {
      logger.error(`Error escribiendo en localStorage: ${key}`, error);
    }
    return false;
  }
};

/**
 * Elimina un item de localStorage de forma segura
 * @param {string} key - Clave del item a eliminar
 * @returns {boolean} true si se eliminó exitosamente
 */
export const removeItem = (key) => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.error(`Error eliminando de localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Limpia todo el localStorage de forma segura
 * @returns {boolean} true si se limpió exitosamente
 */
export const clear = () => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    logger.error('Error limpiando localStorage', error);
    return false;
  }
};

/**
 * Obtiene todas las claves de localStorage
 * @returns {string[]} Array de claves
 */
export const getAllKeys = () => {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    return Object.keys(window.localStorage);
  } catch (error) {
    logger.error('Error obteniendo claves de localStorage', error);
    return [];
  }
};

// Exportar como objeto también para imports destructurados
const localStorageHelper = {
  getItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
  isAvailable: isLocalStorageAvailable
};

export default localStorageHelper;

// Ejemplos de uso:
/*
import { getItem, setItem, removeItem } from '@/utils/localStorage';
// O
import localStorageHelper from '@/utils/localStorage';

// Leer con fallback
const token = getItem('accessToken', null);
const user = getItem('user', { name: 'Guest' });

// Escribir
setItem('accessToken', 'abc123');
setItem('user', { id: 1, name: 'John' });

// Eliminar
removeItem('accessToken');

// Limpiar todo
localStorageHelper.clear();
*/
