/**
 * NotificationBell Component - Phase 3
 * Icono de campana con badge de notificaciones sin leer
 */

import React, { useState, useEffect } from 'react';
import './NotificationBell.css';
import { getUnreadNotifications } from '../../api/notificationApi';
import NotificationCenter from './NotificationCenter';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    
    // Actualizar conteo cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await getUnreadNotifications();
      setUnreadCount(response.count || 0);
    } catch (err) {
      console.error('Error loading unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Recargar cuando se abre
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

export default NotificationBell;
