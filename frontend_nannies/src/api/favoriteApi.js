import api from "./api";

export const getFavorites = async () => {
  const response = await api.get("favorites/");
  return response.data;
};

export const addFavorite = async (nannyId) => {
  const response = await api.post("favorites/", { nanny: nannyId });
  return response.data;
};

export const deleteFavorite = async (favoriteId) => {
  const response = await api.delete(`favorites/${favoriteId}/`);
  return response.data;
};
