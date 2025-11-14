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

/**
 * Obtener todas las disponibilidades de la niñera autenticada
 */
export const getAvailabilities = async () => {
  const response = await API.get("/bookings/availabilities/");
  return response.data;
};

/**
 * Crear una nueva franja de disponibilidad
 */
export const createAvailability = async (data) => {
  const response = await API.post("/bookings/availabilities/", data);
  return response.data;
};

/**
 * Actualizar una franja de disponibilidad
 */
export const updateAvailability = async (availabilityId, data) => {
  const response = await API.put(`/bookings/availabilities/${availabilityId}/`, data);
  return response.data;
};

/**
 * Eliminar una franja de disponibilidad
 */
export const deleteAvailability = async (availabilityId) => {
  const response = await API.delete(`/bookings/availabilities/${availabilityId}/`);
  return response.data;
};

/**
 * Obtener todas las reservas de la niñera autenticada
 */
export const getBookingsByNanny = async () => {
  const response = await API.get("/bookings/");
  return response.data;
};
