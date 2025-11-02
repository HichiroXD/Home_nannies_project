import React, { useEffect, useState } from "react";
import { getFavorites, deleteFavorite } from "../api/favoriteApi";
import {
  FavoriteCard,
  FavoriteListLayout,
} from "../components/Favorites";

export default function FavoriteList() {
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
    <FavoriteListLayout>
      {favorites.map((fav) => (
        <li key={fav.id}>
          <FavoriteCard fav={fav} onDelete={handleDelete} />
        </li>
      ))}
    </FavoriteListLayout>
  );
}
