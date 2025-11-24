import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageContainer, Loader, AlertToast } from "@components/layout";
import { getNotifications, markNotificationsAsRead } from "@api/notificationApi";
import { CheckCircle, AlertCircle, Info, Clock, Ban, X } from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "info" });
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      
      const formattedNotifications = (data || []).map((notif) => ({
        id: notif.id,
        title: notif.subject || getNotificationTitle(notif.message),
        message: notif.message,
        timestamp: new Date(notif.created_at),
        read: notif.status === 'read',
        type: getNotificationType(notif.message),
        relatedBookingId: notif.related_booking_id,
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setAlert({ 
        visible: true, 
        message: "Error al cargar las notificaciones", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTitle = (message) => {
    if (message.includes('confirmada')) return 'Reserva Confirmada';
    if (message.includes('rechazada')) return 'Reserva Rechazada';
    if (message.includes('cancelada')) return 'Reserva Cancelada';
    if (message.includes('completada')) return 'Reserva Completada';
    if (message.includes('nueva solicitud')) return 'Nueva Reserva';
    if (message.includes('mensaje')) return 'Nuevo Mensaje';
    return 'Notificación';
  };

  const getNotificationType = (message) => {
    if (message.includes('confirmada') || message.includes('completada')) return 'success';
    if (message.includes('rechazada') || message.includes('cancelada')) return 'error';
    if (message.includes('nueva solicitud')) return 'info';
    return 'info';
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationsAsRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error al marcar notificación:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;
      
      await markNotificationsAsRead(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setAlert({ 
        visible: true, 
        message: "Todas las notificaciones marcadas como leídas", 
        type: "success" 
      });
    } catch (error) {
      console.error("Error:", error);
      setAlert({ 
        visible: true, 
        message: "Error al marcar notificaciones", 
        type: "error" 
      });
    }
  };

  const getIcon = (type, title) => {
    if (title.includes('Confirmada')) return <CheckCircle size={24} className="text-green-600" />;
    if (title.includes('Completada')) return <CheckCircle size={24} className="text-blue-600" />;
    if (title.includes('Rechazada')) return <Ban size={24} className="text-red-600" />;
    if (title.includes('Cancelada')) return <X size={24} className="text-orange-600" />;
    if (title.includes('Nueva')) return <Clock size={24} className="text-blue-600" />;
    if (title.includes('Mensaje')) return <Info size={24} className="text-purple-600" />;
    
    switch (type) {
      case "success": return <CheckCircle size={24} className="text-green-600" />;
      case "error": return <AlertCircle size={24} className="text-red-600" />;
      default: return <Info size={24} className="text-blue-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const formatTime = (timestamp) => {
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
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <AlertToast 
        message={alert.message} 
        type={alert.type} 
        isVisible={alert.visible} 
        onClose={() => setAlert({ ...alert, visible: false })} 
      />
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              Marcar todas como leídas
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              No leídas ({notifications.filter(n => !n.read).length})
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "read"
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Leídas ({notifications.filter(n => n.read).length})
            </button>
          </div>

          {/* Lista de notificaciones */}
          {loading ? (
            <Loader />
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Info size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                    !notif.read ? "border-l-4 border-blue-500" : ""
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    if (notif.relatedBookingId) {
                      navigate("/bookings");
                    }
                  }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type, notif.title)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notif.message}</p>
                      <p className="text-gray-400 text-xs">{formatTime(notif.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </MainLayout>
  );
}
