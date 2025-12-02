/**
 * NotificationCenter Component - Phase 3
 * Muestra notificaciones del usuario con opciones de lectura y eliminación
 */

import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationsAsRead,
  deleteNotification,
} from '../../api/notificationApi';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications(page, 20);
      setNotifications(response.results || response);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotifications();
      setUnreadCount(response.count || 0);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationsAsRead([notificationId]);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error actualizando notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Error actualizando notificaciones');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Error eliminando notificación');
    }
  };

  // Manejar el cierre (x) de una notificación
  const handleDismiss = async (notificationId, isRead) => {
    try {
      // Si no está leída, marcarla como leída primero
      if (!isRead) {
        await markNotificationsAsRead([notificationId]);
      }
      
      // Si estamos en modo "solo no leídas", remover de la vista local
      if (filter === 'unread') {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        // Recargar lista completa
        loadNotifications();
      }
      
      loadUnreadCount();
    } catch (err) {
      console.error('Error dismissing notification:', err);
      setError('Error al procesar notificación');
    }
  };

  const getNotificationIcon = (templateName) => {
    const icons = {
      ocr_approved: '✅',
      ocr_rejected: '❌',
      ocr_needs_review: '🔍',
      booking_confirmed: '📅',
      booking_cancelled: '❌',
      verification_complete: '✅',
      verification_failed: '⚠️',
    };
    return icons[templateName] || '📢';
  };

  const getNotificationColor = (status) => {
    const colors = {
      sent: '#2ecc71',
      pending: '#f39c12',
      read: '#95a5a6',
      failed: '#e74c3c',
    };
    return colors[status] || '#667eea';
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return notif.status !== 'read';
    if (filter === 'read') return notif.status === 'read';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notification-header">
          <div className="notification-title-section">
            <h2>Notificaciones</h2>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Filter Tabs */}
        <div className="notification-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            No leídas ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Leídas
          </button>
        </div>

        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <div className="notification-actions">
            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="notification-list">
          {loading && <p className="loading">Cargando...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && filteredNotifications.length === 0 && (
            <p className="empty">No hay notificaciones</p>
          )}

          {!loading &&
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${notif.status}`}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    {getNotificationIcon(notif.template_name)}
                  </div>
                  <div className="notification-details">
                    <h4 className="notification-subject">{notif.subject}</h4>
                    <p className="notification-date">
                      {new Date(notif.created_at).toLocaleString('es-CL')}
                    </p>
                    {notif.related_document_id && (
                      <p className="notification-relation">
                        Doc: {notif.related_document_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="notification-status">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: getNotificationColor(notif.status) }}
                  />
                </div>

                {/* Actions */}
                <div className="notification-actions-btn">
                  {notif.status !== 'read' && (
                    <button
                      className="action-btn read-btn"
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Marcar como leída"
                    >
                      👁️
                    </button>
                  )}
                  <button
                    className="action-btn dismiss-btn"
                    onClick={() => handleDismiss(notif.id, notif.status === 'read')}
                    title="Descartar (marcar como leída y ocultar)"
                  >
                    ✕
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(notif.id)}
                    title="Eliminar permanentemente"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="notification-footer">
          <p className="footer-text">
            Mostrando {filteredNotifications.length} de {notifications.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
