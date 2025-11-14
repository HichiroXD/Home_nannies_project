import API from "./api";

/**
 * Obtener lista de notificaciones del usuario
 */
export const getNotifications = async (limit = 10) => {
  const response = await API.get("/bookings/notifications/", {
    params: { limit },
  });
  return response.data;
};

/**
 * Obtener detalles de una notificación
 */
export const getNotification = async (notificationId) => {
  const response = await API.get(`/bookings/notifications/${notificationId}/`);
  return response.data;
};

/**
 * Marcar notificación como leída
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await API.patch(`/bookings/notifications/${notificationId}/`, {
    is_read: true,
  });
  return response.data;
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (notificationId) => {
  const response = await API.delete(`/bookings/notifications/${notificationId}/`);
  return response.data;
};

/**
 * Obtener conteo de notificaciones sin leer
 */
export const getUnreadNotificationsCount = async () => {
  const response = await API.get("/bookings/notifications/unread/count/");
  return response.data;
};
