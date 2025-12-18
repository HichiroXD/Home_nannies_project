/**
 * NotificationBell Component - Phase 3 + Zustand Integration
 * Icono de campana con badge de notificaciones sin leer
 * Usa useNotificationStore para estado global y usePollingStore para polling coordinado
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './NotificationBell.css';
import { getUnreadNotifications } from '../../api/notificationApi';
import NotificationCenter from './NotificationCenter';
import useNotificationStore from '@/stores/useNotificationStore';
import usePollingStore from '@/stores/usePollingStore';
import logger from '@/utils/logger';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const setNotifications = useNotificationStore(state => state.setNotifications);
  const shouldFetch = useNotificationStore(state => state.shouldFetch);
  const registerTask = usePollingStore(state => state.registerTask);
  const unregisterTask = usePollingStore(state => state.unregisterTask);
  const startPolling = usePollingStore(state => state.start);

  useEffect(() => {
    // Cargar notificaciones inicialmente
    loadUnreadCount();
    
    // Registrar tarea de polling coordinado
    registerTask('notifications', loadUnreadCount);
    
    // Iniciar polling coordinado (30 segundos)
    startPolling(30000);
    
    return () => {
      // Desregistrar tarea al desmontar
      unregisterTask('notifications');
    };
  }, []);

  const loadUnreadCount = async () => {
    // Solo hacer fetch si el cache ha expirado
    if (!shouldFetch()) {
      return;
    }

    try {
      const response = await getUnreadNotifications();
      setNotifications(response.data || [], response.count || 0);
    } catch (err) {
      logger.error('Error loading notifications', { error: err.message });
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Forzar recarga cuando se abre
    loadUnreadCount();
  };

  return (
    <>
      <div className="notification-bell">
        <button
          className="bell-button"
          onClick={handleOpen}
          title="Notificaciones"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

NotificationBell.propTypes = {};

export default NotificationBell;
