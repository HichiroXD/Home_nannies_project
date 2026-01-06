/**
 * Utilidades de formato para la aplicación
 */

/**
 * Formatea un número como moneda chilena
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada (ej: "$15.000")
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha relativa (ej: "hace 2 horas")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'justo ahora';
  if (diffMinutes < 60) return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return targetDate.toLocaleDateString('es-CL');
};

/**
 * Formatea una fecha en formato largo
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada (ej: "15 de marzo de 2024")
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatea una fecha y hora
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Trunca un texto largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} - String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar (formato: 12345678-9)
 * @returns {boolean} - true si es válido
 */
export const validateRUT = (rut) => {
  if (!rut) return false;
  
  const cleanRut = rut.replace(/[.-]/g, '');
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const dvString = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === dvString;
};

/**
 * Formatea un RUT chileno
 * @param {string} rut - RUT sin formato
 * @returns {string} - RUT formateado (12.345.678-9)
 */
export const formatRUT = (rut) => {
  if (!rut) return '';
  
  const cleanRut = rut.replace(/[.-]/g, '');
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};
