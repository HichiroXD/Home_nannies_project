/**
 * Alert Store - Zustand
 * 
 * Gestión centralizada de alertas/notificaciones toast
 * 
 * Características:
 * - Alertas temporales con auto-dismiss
 * - Tipos: success, error, warning, info
 * - Cola de alertas
 * - Sin prop drilling
 */

import { create } from 'zustand';
import { logger } from '@/utils/logger';

const useAlertStore = create((set, get) => ({
  // Estado
  alerts: [], // Array de { id, message, type, duration }
  
  /**
   * Show Alert - Muestra una alerta
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Duración en ms (default: 5000)
   */
  showAlert: (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    
    logger.debug('Alert shown', { message, type });
    
    set((state) => ({
      alerts: [...state.alerts, { id, message, type, duration }]
    }));
    
    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        get().dismissAlert(id);
      }, duration);
    }
    
    return id;
  },
  
  /**
   * Dismiss Alert - Oculta una alerta
   * @param {number} id - ID de la alerta
   */
  dismissAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== id)
    }));
  },
  
  /**
   * Clear All - Limpia todas las alertas
   */
  clearAll: () => {
    set({ alerts: [] });
  },
  
  // Helpers shortcuts
  success: (message, duration) => get().showAlert(message, 'success', duration),
  error: (message, duration) => get().showAlert(message, 'error', duration),
  warning: (message, duration) => get().showAlert(message, 'warning', duration),
  info: (message, duration) => get().showAlert(message, 'info', duration)
}));

export default useAlertStore;

// Ejemplos de uso:
/*
import useAlertStore from '@/stores/useAlertStore';

// Mostrar alertas
const MyComponent = () => {
  const { success, error, warning, info } = useAlertStore();
  
  const handleSave = async () => {
    try {
      await saveData();
      success('Guardado exitosamente');
    } catch (err) {
      error('Error al guardar');
    }
  };
  
  return <button onClick={handleSave}>Guardar</button>;
};

// Componente de alertas (en App.jsx)
const AlertContainer = () => {
  const alerts = useAlertStore(state => state.alerts);
  const dismissAlert = useAlertStore(state => state.dismissAlert);
  
  return (
    <div className="fixed top-4 right-4 z-50">
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => dismissAlert(alert.id)}
        />
      ))}
    </div>
  );
};
*/
