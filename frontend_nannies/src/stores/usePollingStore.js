/**
 * Polling Store - Zustand
 * 
 * Coordinador centralizado de polling para evitar múltiples intervalos
 * 
 * Características:
 * - 1 solo intervalo global
 * - Pausa automática cuando tab inactivo
 * - Coordinación de fetches
 * - Configuración flexible
 */

import { create } from 'zustand';
import useNotificationStore from './useNotificationStore';
import useAuthStore from './useAuthStore';
import logger from '@/utils/logger';

const usePollingStore = create((set, get) => ({
  // Estado
  isActive: true,
  isRunning: false,
  interval: null,
  intervalMs: 30000, // 30 segundos por defecto
  lastPoll: null,
  tasks: [], // Array de { id, fn, enabled }
  
  /**
   * Start - Inicia el polling global
   * @param {number} intervalMs - Intervalo en milisegundos
   */
  start: (intervalMs = 30000) => {
    const { interval: existingInterval } = get();
    
    if (existingInterval) {
      logger.warn('Polling already running');
      return;
    }
    
    logger.info('Polling started', { intervalMs });
    
    const interval = setInterval(async () => {
      const { isActive, tasks } = get();
      
      // Solo polling si tab visible Y polling activo
      if (!isActive || document.visibilityState !== 'visible') {
        return;
      }
      
      set({ lastPoll: Date.now() });
      
      // Ejecutar todas las tareas habilitadas
      const enabledTasks = tasks.filter(t => t.enabled);
      
      if (enabledTasks.length > 0) {
        logger.debug('Polling tasks', { count: enabledTasks.length });
        
        await Promise.allSettled(
          enabledTasks.map(task => task.fn())
        );
      }
    }, intervalMs);
    
    set({
      interval,
      intervalMs,
      isRunning: true
    });
  },
  
  /**
   * Stop - Detiene el polling
   */
  stop: () => {
    const { interval } = get();
    
    if (interval) {
      clearInterval(interval);
      logger.info('Polling stopped');
    }
    
    set({
      interval: null,
      isRunning: false
    });
  },
  
  /**
   * Pause - Pausa el polling (sin detener intervalo)
   */
  pause: () => {
    logger.debug('Polling paused');
    set({ isActive: false });
  },
  
  /**
   * Resume - Reanuda el polling
   */
  resume: () => {
    logger.debug('Polling resumed');
    set({ isActive: true });
  },
  
  /**
   * Register Task - Registra una tarea de polling
   * @param {string} id - ID único de la tarea
   * @param {Function} fn - Función async a ejecutar
   * @param {boolean} enabled - Si está habilitada
   */
  registerTask: (id, fn, enabled = true) => {
    set((state) => {
      // Evitar duplicados
      const existingTask = state.tasks.find(t => t.id === id);
      
      if (existingTask) {
        // Actualizar tarea existente
        return {
          tasks: state.tasks.map(t =>
            t.id === id ? { id, fn, enabled } : t
          )
        };
      }
      
      // Agregar nueva tarea
      return {
        tasks: [...state.tasks, { id, fn, enabled }]
      };
    });
    
    logger.debug('Task registered', { id, enabled });
  },
  
  /**
   * Unregister Task - Elimina una tarea
   * @param {string} id - ID de la tarea
   */
  unregisterTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));
    
    logger.debug('Task unregistered', { id });
  },
  
  /**
   * Enable Task - Habilita una tarea
   * @param {string} id - ID de la tarea
   */
  enableTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, enabled: true } : t
      )
    }));
  },
  
  /**
   * Disable Task - Deshabilita una tarea
   * @param {string} id - ID de la tarea
   */
  disableTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, enabled: false } : t
      )
    }));
  }
}));

export default usePollingStore;

// Ejemplos de uso:
/*
import usePollingStore from '@/stores/usePollingStore';
import { getNotificationsAPI, getDashboardAPI } from '@/api';

// En App.jsx - Iniciar polling global
useEffect(() => {
  const pollingStore = usePollingStore.getState();
  
  // Registrar tareas de polling
  pollingStore.registerTask('notifications', async () => {
    const authStore = useAuthStore.getState();
    if (!authStore.checkAuth()) return;
    
    const notificationStore = useNotificationStore.getState();
    if (!notificationStore.shouldFetch()) return;
    
    notificationStore.setLoading(true);
    try {
      const data = await getNotificationsAPI();
      notificationStore.setNotifications(data);
    } catch (error) {
      notificationStore.setError(error.message);
    }
  });
  
  // Iniciar polling
  pollingStore.start(30000); // 30 segundos
  
  // Pausar cuando tab oculto
  const handleVisibilityChange = () => {
    if (document.hidden) {
      pollingStore.pause();
    } else {
      pollingStore.resume();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    pollingStore.stop();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

// Registrar tarea específica en un componente
const MyDashboard = () => {
  useEffect(() => {
    const pollingStore = usePollingStore.getState();
    
    pollingStore.registerTask('dashboard', async () => {
      const data = await getDashboardAPI();
      // Actualizar estado local o store
    });
    
    return () => {
      pollingStore.unregisterTask('dashboard');
    };
  }, []);
  
  return <div>Dashboard</div>;
};
*/
