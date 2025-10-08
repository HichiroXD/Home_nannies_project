import axios from "./api";

export const getFavorites = async (token) => {
  return await axios.get("/api/bookings/favorites/", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addFavorite = async (nannyId, token) => {
  return await axios.post(
    "/api/bookings/favorites/",
    { nanny: nannyId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deleteFavorite = async (favoriteId, token) => {
  return await axios.delete(`/api/bookings/favorites/${favoriteId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
