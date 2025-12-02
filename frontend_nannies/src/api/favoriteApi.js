import API from "./api";

// Favorites are now exposed at /api/favorites/
export const getFavorites = async () => {
	const res = await API.get("/favorites/");
	// support DRF paginated responses ({ results: [...] })
	if (res?.data?.results && Array.isArray(res.data.results)) return res.data.results;
	return res.data;
};

export const addFavorite = async (nannyId) => {
	// backend serializer expects `nanny_id` as write-only field
	const res = await API.post("/favorites/", { nanny_id: nannyId });
	return res.data;
};

export const deleteFavorite = async (favoriteId) => {
	const res = await API.delete(`/favorites/${favoriteId}/`);
	return res.data;
};
