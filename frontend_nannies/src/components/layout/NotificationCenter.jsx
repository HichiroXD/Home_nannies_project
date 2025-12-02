import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, Ban, Star } from "lucide-react";
import { getNotifications, markNotificationsAsRead } from "@api/notificationApi";

/**
 * Centro de Notificaciones - Muestra notificaciones en tiempo real del usuario
 * 
 * @param {function} onNotificationRead - Callback cuando se lee una notificación
 */
export default function NotificationCenter({ onNotificationRead }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones desde la API
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      setLoading(true);
      const data = await getNotifications();
      
      // Transformar datos del backend al formato esperado
      const formattedNotifications = (data || []).map((notif) => ({
        id: notif.id,
        title: getNotificationTitle(notif.message),
        message: notif.message,
        timestamp: new Date(notif.created_at),
        read: notif.status === 'read',
        type: getNotificationType(notif.message),
        relatedBookingId: notif.related_booking_id,
      }));
      
      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar notificaciones al montar y cada 30 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Determinar el título según el mensaje
  const getNotificationTitle = (message) => {
    if (message.includes('confirmada')) return 'Reserva Confirmada';
    if (message.includes('rechazada')) return 'Reserva Rechazada';
    if (message.includes('cancelada')) return 'Reserva Cancelada';
    if (message.includes('completada')) return 'Reserva Completada';
    if (message.includes('nueva solicitud')) return 'Nueva Reserva';
    if (message.includes('mensaje')) return 'Nuevo Mensaje';
    if (message.includes('Reseña publicada') || message.includes('dejado una reseña')) return 'Reseña Publicada';
    if (message.includes('Nueva reseña recibida') || message.includes('te ha dejado una reseña')) return 'Nueva Reseña';
    return 'Notificación';
  };

  // Determinar el tipo según el mensaje
  const getNotificationType = (message) => {
    if (message.includes('confirmada') || message.includes('completada')) return 'success';
    if (message.includes('rechazada') || message.includes('cancelada')) return 'error';
    if (message.includes('nueva solicitud')) return 'info';
    if (message.includes('reseña')) return 'success';
    return 'info';
  };

  // Marcar como leída
  const markAsRead = async (id) => {
    try {
      await markNotificationsAsRead([id]);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (onNotificationRead) onNotificationRead(id);
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  // Eliminar notificación (solo visualmente, no del backend)
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Iconos según tipo
  const getIcon = (type, title) => {
    // Iconos más específicos según el título
    if (title.includes('Reseña')) return <Star size={20} className="text-yellow-500" />;
    if (title.includes('Confirmada')) return <CheckCircle size={20} className="text-green-600" />;
    if (title.includes('Completada')) return <CheckCircle size={20} className="text-blue-600" />;
    if (title.includes('Rechazada')) return <Ban size={20} className="text-red-600" />;
    if (title.includes('Cancelada')) return <X size={20} className="text-orange-600" />;
    if (title.includes('Nueva')) return <Clock size={20} className="text-blue-600" />;
    if (title.includes('Mensaje')) return <Info size={20} className="text-purple-600" />;
    
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "error":
        return <AlertCircle size={20} className="text-red-600" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  // Colores según tipo y título
  const getColors = (type, title) => {
    if (title?.includes('Reseña')) return "bg-yellow-50 border-yellow-200";
    
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No hay notificaciones</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    notif.read ? "bg-white" : "bg-blue-50"
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                >
                  <div className="flex gap-3">
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type || "info", notif.title)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800 text-sm">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mt-1">
                        {notif.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>

                    {/* Botón cerrar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      className="text-gray-300 hover:text-red-600 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                Ver todas las notificaciones ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Formatea la hora de la notificación
 */
function formatTime(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Justo ahora";
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;

  return timestamp.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}
