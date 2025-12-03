import API from "./api";

/**
 * Obtener lista de notificaciones del usuario
 * Phase 3 - Integración con sistema de notificaciones
 */
export const getNotifications = async (page = 1, pageSize = 20) => {
  const response = await API.get("/notifications/", {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

/**
 * Obtener notificaciones no leídas
 * Phase 3
 */
export const getUnreadNotifications = async () => {
  const response = await API.get("/notifications/unread/");
  return response.data;
};

/**
 * Obtener detalles de una notificación
 */
export const getNotification = async (notificationId) => {
  const response = await API.get(`/notifications/${notificationId}/`);
  return response.data;
};

/**
 * Marcar notificaciones como leídas
 * Phase 3 - Puede marcar una lista o todas si no se especifica
 */
export const markNotificationsAsRead = async (notificationIds = []) => {
  const response = await API.post("/notifications/mark_as_read/", {
    notification_ids: notificationIds,
  });
  return response.data;
};

/**
 * Marcar notificación específica como leída (deprecated, usar markNotificationsAsRead)
 */
export const markNotificationAsRead = async (notificationId) => {
  return markNotificationsAsRead([notificationId]);
};

/**
 * Eliminar una notificación
 * Phase 3
 */
export const deleteNotification = async (notificationId) => {
  const response = await API.delete(
    `/notifications/${notificationId}/delete-notification/`
  );
  return response.data;
};

/**
 * Obtener preferencias de notificación
 * Phase 3
 */
export const getNotificationPreferences = async () => {
  const response = await API.get("/preferences/");
  return response.data;
};

/**
 * Actualizar preferencias de notificación
 * Phase 3
 */
export const updateNotificationPreferences = async (preferences) => {
  const response = await API.patch("/preferences/", preferences);
  return response.data;
};

export default {
  getNotifications,
  getUnreadNotifications,
  getNotification,
  markNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
};
