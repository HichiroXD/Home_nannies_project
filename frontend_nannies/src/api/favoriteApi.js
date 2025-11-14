import API from "./api";

// Favorites are now exposed at /api/favorites/
export const getFavorites = async () => API.get("/favorites/");
export const addFavorite = async (nannyId) => API.post("/favorites/", { nanny: nannyId });
export const deleteFavorite = async (favoriteId) => API.delete(`/favorites/${favoriteId}/`);
