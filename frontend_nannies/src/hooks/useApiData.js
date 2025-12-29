import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '../utils/logger';

/**
 * Hook genérico para manejar llamadas a API con estados de carga y error
 * 
 * @param {Function} fetchFn - Función async que hace el fetch de datos
 * @param {Array} dependencies - Dependencias que disparan el refetch
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.immediate - Si debe ejecutar el fetch inmediatamente (default: true)
 * @param {Function} options.onSuccess - Callback cuando la petición es exitosa
 * @param {Function} options.onError - Callback cuando hay un error
 * 
 * @returns {Object} - { data, loading, error, refetch, setData }
 * 
 * @example
 * const { data, loading, error, refetch } = useApiData(
 *   getFavorites, // función estable
 *   [] // dependencias vacías si la función no cambia
 * );
 */
export function useApiData(fetchFn, dependencies = [], options = {}) {
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Usar refs para callbacks para evitar recrear fetchData
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result?.data || result);
      
      if (onSuccessRef.current) {
        onSuccessRef.current(result?.data || result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.message || 
                          'Error al cargar los datos';
      
      setError(errorMessage);
      logger.error('useApiData Error', { 
        error: errorMessage, 
        details: err?.response?.data 
      });
      
      if (onErrorRef.current) {
        onErrorRef.current(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}
