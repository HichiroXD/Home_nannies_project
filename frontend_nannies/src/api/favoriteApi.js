import API from "./api";

export const getFavorites = async () => API.get("/bookings/favorites/");
export const addFavorite = async (nannyId) => API.post("/bookings/favorites/", { nanny: nannyId });
export const deleteFavorite = async (favoriteId) => API.delete(`/bookings/favorites/${favoriteId}/`);
