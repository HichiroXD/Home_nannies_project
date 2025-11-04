import React, { useEffect, useState } from "react";
import { getFavorites, deleteFavorite } from "@api/favoriteApi";
import {
  FavoriteCard,
  FavoriteListLayout,
} from "@components/favorites";
import { MainLayout, Loader, PageContainer } from "@components/layout";

export default function FavoriteList() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
      } finally {
        setIsLoading(false);
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
    <MainLayout>
      <PageContainer>
        <h1 className="text-3xl font-bold text-pink-600 mb-8">Mis Favoritos</h1>
        {isLoading ? (
          <Loader />
        ) : (
          <FavoriteListLayout>
            {favorites.length === 0 ? (
              <p className="text-center text-gray-500">No tienes favoritos guardados</p>
            ) : (
              favorites.map((fav) => (
                <li key={fav.id}>
                  <FavoriteCard fav={fav} onDelete={handleDelete} />
                </li>
              ))
            )}
          </FavoriteListLayout>
        )}
      </PageContainer>
    </MainLayout>
  );
}
