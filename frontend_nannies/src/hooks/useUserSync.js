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
  const refreshUserData = useAuthStore(state => state.refreshUserData);

  const syncUser = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      await refreshUserData();
      logger.info('User data synchronized');
    } catch (error) {
      logger.error('Failed to sync user data', error);
    }
  }, [isAuthenticated, refreshUserData]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    // Sincronizar inmediatamente al montar
    syncUser();

    // Configurar sincronización periódica
    const intervalId = setInterval(syncUser, intervalMs);

    // Sincronizar cuando la ventana recupera el foco
    const handleFocus = () => {
      logger.info('Window focused, syncing user data');
      syncUser();
    };
    window.addEventListener('focus', handleFocus);

    // Limpiar al desmontar
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, isAuthenticated, syncUser, intervalMs]);

  // Retornar función manual de sincronización
  return { syncUser };
};

export default useUserSync;
