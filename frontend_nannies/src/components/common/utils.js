/**
 * Utilities - Funciones de utilidad comunes
 */

/**
 * Validadores
 */
export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone: (phone) => {
    const regex = /^[\d\s\-\+\(\)]{7,}$/;
    return regex.test(phone);
  },

  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  password: (password) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  },

  zipCode: (code) => {
    const regex = /^\d{5}(-\d{4})?$/;
    return regex.test(code);
  },

  creditCard: (number) => {
    const regex = /^\d{13,19}$/;
    return regex.test(number.replace(/\s/g, ''));
  },
};

/**
 * Formatters
 */
export const formatters = {
  currency: (value, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
    }).format(value);
  },

  number: (value, decimals = 0) => {
    return Number(value).toLocaleString('es-ES', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  },

  date: (date, format = 'es-ES') => {
    if (typeof date === 'string') date = new Date(date);
    return new Intl.DateTimeFormat(format).format(date);
  },

  datetime: (date, format = 'es-ES') => {
    if (typeof date === 'string') date = new Date(date);
    return new Intl.DateTimeFormat(format, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  },

  time: (date, format = 'es-ES') => {
    if (typeof date === 'string') date = new Date(date);
    return new Intl.DateTimeFormat(format, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  },

  bytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  },

  percentage: (value, decimals = 1) => {
    return Number(value).toFixed(decimals) + '%';
  },

  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  titleCase: (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  slug: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  truncate: (str, length, suffix = '...') => {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  },
};

/**
 * Storage Helpers
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

/**
 * Array Helpers
 */
export const arrayHelpers = {
  unique: (arr) => [...new Set(arr)],

  shuffle: (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  },

  chunk: (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  groupBy: (arr, key) => {
    return arr.reduce((acc, item) => {
      const group = item[key];
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    }, {});
  },
};

export default {
  validators,
  formatters,
  storage,
};
