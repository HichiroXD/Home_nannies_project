import API from "./api";

/**
 * Obtener disponibilidades. Si se pasa nannyId, devuelve disponibilidad de esa niñera.
 */
export const getAvailabilities = async (params = {}) => {
  const response = await API.get("/bookings/availabilities/", { params });
  return response.data;
};

/**
 * Crear disponibilidad (nanny only)
 */
export const createAvailability = async (data) => {
  const response = await API.post("/bookings/availabilities/", data);
  return response.data;
};

/**
 * Eliminar disponibilidad
 */
export const deleteAvailability = async (id) => {
  const response = await API.delete(`/bookings/availabilities/${id}/`);
  return response.data;
};
