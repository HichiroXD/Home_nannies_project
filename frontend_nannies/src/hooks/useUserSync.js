/**
 * useUserSync - Hook para sincronizar datos del usuario con el backend
 * 
 * Este hook refresca automáticamente los datos del usuario desde el backend
 * para mantener sincronizados los cambios realizados desde el admin de Django.
 * 
 * Uso:
 * ```jsx
 * import { useUserSync } from '@/hooks/useUserSync';
 * 
 * function App() {
 *   useUserSync(); // Sincroniza automáticamente cada 5 minutos
 *   return <YourApp />;
 * }
 * ```
 */

import { useEffect, useCallback } from 'react';
import useAuthStore from '@/stores/useAuthStore';
import logger from '@/utils/logger';

/**
 * Hook para sincronizar datos del usuario
 * @param {Object} options - Opciones de configuración
 * @param {number} options.intervalMs - Intervalo de sincronización en milisegundos (default: 5 minutos)
 * @param {boolean} options.enabled - Habilitar/deshabilitar sincronización (default: true)
 */
export const useUserSync = ({ intervalMs = 5 * 60 * 1000, enabled = true } = {}) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const accessToken = useAuthStore(state => state.accessToken);
  const refreshUserData = useAuthStore(state => state.refreshUserData);

  const syncUser = useCallback(async () => {
    // Verificar token en localStorage directamente (fuente de verdad)
    const localToken = localStorage.getItem('accessToken');
    
    // Verificar autenticación Y token antes de intentar sincronizar
    if (!isAuthenticated || !accessToken || !localToken) {
      logger.debug('Skipping user sync - not authenticated or no token');
      return;
    }
    
    try {
      await refreshUserData();
      logger.info('User data synchronized');
    } catch (error) {
      // Solo loguear como warning si es error de token, error completo para otros casos
      if (error.message?.includes('Token')) {
        logger.warn('Sync skipped - token issue', error.message);
      } else {
        logger.error('Failed to sync user data', error);
      }
    }
  }, [isAuthenticated, accessToken, refreshUserData]);

  useEffect(() => {
    // Verificar token en localStorage directamente
    const localToken = localStorage.getItem('accessToken');
    
    // No hacer nada si está deshabilitado, no autenticado, o no hay token
    if (!enabled || !isAuthenticated || !accessToken || !localToken) return;

    // Sincronizar inmediatamente al montar
    syncUser();

    // Configurar sincronización periódica
    const intervalId = setInterval(() => {
      // Verificar estado actual y token en localStorage antes de cada sync
      const currentState = useAuthStore.getState();
      const currentLocalToken = localStorage.getItem('accessToken');
      
      if (currentState.isAuthenticated && currentState.accessToken && currentLocalToken) {
        syncUser();
      }
    }, intervalMs);

    // Sincronizar cuando la ventana recupera el foco
    const handleFocus = () => {
      // Verificar autenticación y token antes de sincronizar
      const currentState = useAuthStore.getState();
      const currentLocalToken = localStorage.getItem('accessToken');
      
      if (currentState.isAuthenticated && currentState.accessToken && currentLocalToken) {
        logger.info('Window focused, syncing user data');
        syncUser();
      }
    };
    window.addEventListener('focus', handleFocus);

    // Limpiar al desmontar
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, isAuthenticated, accessToken, intervalMs]); // Removido syncUser de dependencias

  // Retornar función manual de sincronización
  return { syncUser };
};

export default useUserSync;
