/**
 * Utilidades de validación para formularios
 */

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un teléfono chileno
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+?56)?[2-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valida una contraseña segura
 * @param {string} password - Contraseña a validar
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida que un campo no esté vacío
 * @param {any} value - Valor a validar
 * @returns {boolean} - true si no está vacío
 */
export const isRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

/**
 * Valida longitud mínima
 * @param {string} value - Valor a validar
 * @param {number} min - Longitud mínima
 * @returns {boolean} - true si cumple
 */
export const minLength = (value, min) => {
  return value && value.length >= min;
};

/**
 * Valida longitud máxima
 * @param {string} value - Valor a validar
 * @param {number} max - Longitud máxima
 * @returns {boolean} - true si cumple
 */
export const maxLength = (value, max) => {
  return !value || value.length <= max;
};

/**
 * Valida rango numérico
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} - true si está en rango
 */
export const inRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};
