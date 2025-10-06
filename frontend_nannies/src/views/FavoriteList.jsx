import React, { useEffect, useState } from "react";
import { getFavorites, deleteFavorite } from "../api/favoriteApi";

function FavoriteList() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (favoriteId) => {
    try {
      await deleteFavorite(favoriteId);
      setFavorites(favorites.filter((f) => f.id !== favoriteId));
      alert("Favorito eliminado 💔");
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mis Niñeras Favoritas</h2>
      <ul className="space-y-3">
        {favorites.map((fav) => (
          <li
            key={fav.id}
            className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm"
          >
            <span>{fav.nanny.full_name}</span>
            <button
              onClick={() => handleDelete(fav.id)}
              className="text-red-600 hover:text-red-800"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoriteList;
