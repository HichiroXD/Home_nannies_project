import API from "./api";

/**
 * Obtener lista de reservas del usuario autenticado
 */
export const getBookings = async () => {
  const response = await API.get("/bookings/");
  return response.data;
};

/**
 * Obtener detalles de una reserva específica
 */
export const getBooking = async (bookingId) => {
  const response = await API.get(`/bookings/${bookingId}/`);
  return response.data;
};

/**
 * Crear una nueva reserva
 */
export const createBooking = async (nannyId, startTime, endTime) => {
  const response = await API.post("/bookings/", {
    nanny: nannyId,
    start_time: startTime,
    end_time: endTime,
  });
  return response.data;
};

/**
 * Actualizar una reserva existente (cambiar fecha/hora)
 */
export const updateBooking = async (bookingId, data) => {
  const response = await API.put(`/bookings/${bookingId}/`, data);
  return response.data;
};

/**
 * Eliminar una reserva
 */
export const deleteBooking = async (bookingId) => {
  const response = await API.delete(`/bookings/${bookingId}/`);
  return response.data;
};

/**
 * Aceptar una reserva (solo niñera)
 */
export const acceptBooking = async (bookingId) => {
  const response = await API.post(`/bookings/${bookingId}/accept/`);
  return response.data;
};

/**
 * Rechazar una reserva (solo niñera)
 */
export const rejectBooking = async (bookingId) => {
  const response = await API.post(`/bookings/${bookingId}/reject/`);
  return response.data;
};

/**
 * Cancelar una reserva (solo padre)
 */
export const cancelBooking = async (bookingId) => {
  const response = await API.post(`/bookings/${bookingId}/cancel/`);
  return response.data;
};

/**
 * Marcar una reserva como completada (solo niñera)
 */
export const completeBooking = async (bookingId) => {
  const response = await API.post(`/bookings/${bookingId}/complete/`);
  return response.data;
};

/**
 * Alias para compatibilidad con código anterior
 */
export const scheduleBooking = async (nannyId) => {
  const response = await API.post("/bookings/", { nanny: nannyId });
  return response.data;
};
