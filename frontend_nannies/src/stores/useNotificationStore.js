/**
 * Notification Store - Zustand
 * 
 * Gestión centralizada de notificaciones del backend
 * 
 * Características:
 * - Caché de notificaciones
 * - Contador de no leídas
 * - Fetch coordinado con polling
 * - Marcar como leído
 * - Filtrado
 */

import { create } from 'zustand';
import logger from '@/utils/logger';

const useNotificationStore = create((set, get) => ({
  // Estado
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetch: null,
  
  /**
   * Set Notifications - Actualiza lista de notificaciones
   * @param {Array} notifications
   */
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    set({
      notifications,
      unreadCount,
      lastFetch: Date.now(),
      error: null
    });
  },
  
  /**
   * Set Loading - Estado de carga
   * @param {boolean} loading
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  /**
   * Set Error - Error al cargar notificaciones
   * @param {string} error
   */
  setError: (error) => {
    logger.error('Notification fetch error', new Error(error));
    set({ error, isLoading: false });
  },
  
  /**
   * Mark As Read - Marca notificación como leída
   * @param {number} notificationId
   */
  markAsRead: (notificationId) => {
    set((state) => {
      const notifications = state.notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      
      const unreadCount = notifications.filter(n => !n.is_read).length;
      
      return { notifications, unreadCount };
    });
  },
  
  /**
   * Mark All As Read - Marca todas como leídas
   */
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0
    }));
  },
  
  /**
   * Add Notification - Agrega nueva notificación (para real-time)
   * @param {Object} notification
   */
  addNotification: (notification) => {
    set((state) => {
      // Evitar duplicados
      if (state.notifications.find(n => n.id === notification.id)) {
        return state;
      }
      
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1
      };
    });
  },
  
  /**
   * Remove Notification - Elimina notificación
   * @param {number} notificationId
   */
  removeNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      const notifications = state.notifications.filter(n => n.id !== notificationId);
      const unreadCount = notification && !notification.is_read 
        ? state.unreadCount - 1 
        : state.unreadCount;
      
      return { notifications, unreadCount };
    });
  },
  
  /**
   * Get Unread - Obtiene notificaciones no leídas
   * @returns {Array}
   */
  getUnread: () => {
    return get().notifications.filter(n => !n.is_read);
  },
  
  /**
   * Get By Type - Filtra por tipo
   * @param {string} type
   * @returns {Array}
   */
  getByType: (type) => {
    return get().notifications.filter(n => n.notification_type === type);
  },
  
  /**
   * Clear - Limpia todas las notificaciones
   */
  clear: () => {
    set({
      notifications: [],
      unreadCount: 0,
      error: null
    });
  },
  
  /**
   * Should Fetch - Verifica si debe hacer fetch (cache de 30s)
   * @returns {boolean}
   */
  shouldFetch: () => {
    const { lastFetch } = get();
    if (!lastFetch) return true;
    
    const elapsed = Date.now() - lastFetch;
    return elapsed > 30000; // 30 segundos
  }
}));

export default useNotificationStore;

// Ejemplos de uso:
/*
import useNotificationStore from '@/stores/useNotificationStore';

// En componente de notificaciones
const NotificationPanel = () => {
  const notifications = useNotificationStore(state => state.notifications);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  
  return (
    <div>
      <Badge count={unreadCount}>
        <BellIcon />
      </Badge>
      {notifications.map(n => (
        <NotificationItem
          key={n.id}
          notification={n}
          onRead={() => markAsRead(n.id)}
        />
      ))}
    </div>
  );
};

// Fetch de notificaciones (en polling store o useEffect)
const fetchNotifications = async () => {
  const store = useNotificationStore.getState();
  
  if (!store.shouldFetch()) return; // Cache válido
  
  store.setLoading(true);
  try {
    const data = await getNotificationsAPI();
    store.setNotifications(data);
  } catch (error) {
    store.setError(error.message);
  }
};
*/
