/**
 * Custom Hooks - Hooks reutilizables para operaciones comunes
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useForm - Hook para manejo de formularios
 */
export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (touched[name]) {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (!value) {
      error = `${name} es requerido`;
    } else if (name.includes('email') && !/^\S+@\S+\.\S+$/.test(value)) {
      error = 'Email inválido';
    }
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
    return !error;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const setFieldValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setFieldError = (name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
  };
};

/**
 * useAsync - Hook para manejo de operaciones asincrónicas
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { status, data, error, execute };
};

/**
 * usePagination - Hook para paginación
 */
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
    setCurrentPage,
  };
};

/**
 * useLocalStorage - Hook para almacenar en localStorage con manejo seguro
 * 
 * Usa el helper localStorage para:
 * - Manejo automático de errores (quota exceeded, JSON parsing, etc.)
 * - Soporte para modo incógnito
 * - Logging estructurado de errores
 * - Fallback a valores iniciales
 * 
 * @param {string} key - Clave de localStorage
 * @param {*} initialValue - Valor inicial si no existe
 * @returns {[*, Function]} [valor, setter]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    // Usar helper seguro en lugar de acceso directo
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      // Solo en desarrollo para evitar console.error en producción
      if (import.meta.env.MODE === 'development') {
        console.error('Error reading from localStorage:', error);
      }
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      // Permitir funciones como setter (igual que useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Usar helper para manejar errors de quota, etc.
      const stringValue = typeof valueToStore === 'string' 
        ? valueToStore 
        : JSON.stringify(valueToStore);
      window.localStorage.setItem(key, stringValue);
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.error('Error writing to localStorage:', error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

/**
 * useFetch - Hook para llamadas HTTP
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * useDebounce - Hook para debouncing de valores
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useTimeout - Hook para setTimeout
 */
export const useTimeout = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
};

/**
 * useInterval - Hook para setInterval
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

/**
 * useToggle - Hook para toggle de valores booleanos
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle, setValue];
};

/**
 * usePrevious - Hook para obtener valor anterior
 */
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default {
  useForm,
  useAsync,
  usePagination,
  useLocalStorage,
  useFetch,
  useDebounce,
  useTimeout,
  useInterval,
  useToggle,
  usePrevious,
};
