import React, { useEffect, useState } from "react";
import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react";

/**
 * Centro de Notificaciones - Muestra notificaciones en tiempo real del usuario
 * 
 * @param {function} onNotificationRead - Callback cuando se lee una notificación
 */
export default function NotificationCenter({ onNotificationRead }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simular carga de notificaciones (en producción, usar API real)
  useEffect(() => {
    // En una aplicación real, esto sería:
    // fetchNotifications() via API
    // Y un WebSocket para notificaciones en tiempo real
  }, []);

  // Agregar notificación (llamado desde otros componentes)
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotif = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  // Marcar como leída
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    if (onNotificationRead) onNotificationRead(id);
  };

  // Eliminar notificación
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Exponer métodos globales
  useEffect(() => {
    window.notificationCenter = {
      addNotification,
      removeNotification,
      markAsRead,
    };
  }, []);

  // Iconos según tipo
  const getIcon = (type) => {
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

  // Colores según tipo
  const getColors = (type) => {
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
            {notifications.length === 0 ? (
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
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type || "info")}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {notif.title}
                      </p>
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
              <button className="text-sm text-pink-600 hover:text-pink-700 font-medium">
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
