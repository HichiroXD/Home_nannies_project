/**
 * Stores Index - Zustand
 * 
 * Exportación centralizada de todos los stores
 */

export { default as useAuthStore } from './useAuthStore';
export { default as useAlertStore } from './useAlertStore';
export { default as useNotificationStore } from './useNotificationStore';
export { default as usePollingStore } from './usePollingStore';

// Re-export para imports más limpios
/*
Uso:
import { useAuthStore, useAlertStore } from '@/stores';

const MyComponent = () => {
  const login = useAuthStore(state => state.login);
  const showAlert = useAlertStore(state => state.success);
  
  // ...
};
*/
