import React, { useEffect, useState } from "react";
import { getFavorites, deleteFavorite } from "@api/favoriteApi";
import {
  FavoriteCard,
  FavoriteListLayout,
} from "@components/favorites";
import { MainLayout, Loader, PageContainer, AlertToast } from "@components/layout";

export default function FavoriteList() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "info" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
        setAlert({
          visible: true,
          message: "Error al cargar favoritos.",
          type: "error",
        });
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
      setAlert({
        visible: true,
        message: "Favorito eliminado 💔",
        type: "info",
      });
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      setAlert({
        visible: true,
        message: "No se pudo eliminar el favorito.",
        type: "error",
      });
    }
  };

  return (
    <MainLayout>
      <AlertToast
        message={alert.message}
        type={alert.type}
        isVisible={alert.visible}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      <PageContainer>
        <h1 className="text-3xl font-bold text-pink-600 mb-8">Mis Favoritos</h1>
        {isLoading ? (
          <Loader />
        ) : (
          <FavoriteListLayout>
            {favorites.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No tienes favoritos guardados</p>
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
