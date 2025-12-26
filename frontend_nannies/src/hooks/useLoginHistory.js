/**
 * Hook Reutilizable - Carga de Historial de Acceso
 */
import { useState } from 'react';
import API from '@api/api';

export function useLoginHistory(onError) {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadLoginHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await API.get('/users/login-history/');
      setLoginHistory(response.data.history || []);
      return true;
    } catch (error) {
      console.error("Error al cargar historial:", error);
      onError("Error al cargar el historial de acceso");
      return false;
    } finally {
      setLoadingHistory(false);
    }
  };

  return {
    loginHistory,
    loadingHistory,
    loadLoginHistory,
  };
}
