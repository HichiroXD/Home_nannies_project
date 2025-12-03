import API from "./api";

/**
 * Crear una nueva reseña para una niñera
 * @param {number} nannyId - ID del perfil de niñera
 * @param {number} rating - Calificación de 1-5
 * @param {string} comment - Comentario opcional
 */
export const createReview = async (nannyId, rating, comment = "") => {
  const response = await API.post("/reviews/", {
    nanny: nannyId,
    rating,
    comment,
  });
  return response.data;
};

/**
 * Obtener todas las reseñas del usuario
 */
export const getReviews = async () => {
  const response = await API.get("/reviews/");
  return response.data;
};

/**
 * Eliminar una reseña
 */
export const deleteReview = async (reviewId) => {
  const response = await API.delete(`/reviews/${reviewId}/`);
  return response.data;
};
