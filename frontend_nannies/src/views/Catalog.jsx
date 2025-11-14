import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNannies } from "@api/nannyApi";
import { addFavorite, deleteFavorite, getFavorites } from "@api/favoriteApi";
import { NannyFilters, NannyCard } from "@components/nanny";
import { MainLayout, AlertToast } from "@components/layout";
import { Loader } from "@components/layout";

export default function Catalog() {
  const [nannies, setNannies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "info" });
  const [filters, setFilters] = useState({
    search: "",
    max_rate: "",
    min_experience: "",
    verified: false,
  });
  const navigate = useNavigate();

  // Cargar niñeras
  const fetchNannies = async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.max_rate) params.max_rate = filters.max_rate;
      if (filters.min_experience) params.min_experience = filters.min_experience;
      if (filters.verified) params.verified = true;

      const data = await getNannies(params);
      setNannies(data);
    } catch (err) {
      setAlert({
        visible: true,
        message: "No se pudieron cargar las niñeras.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar favoritos del usuario
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const favs = await getFavorites();
      setFavorites(favs.map((fav) => fav.nanny.id));
    } catch (err) {
      console.error("Error cargando favoritos:", err);
    }
  };

  useEffect(() => {
    fetchNannies();
    fetchFavorites();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchNannies();
  };

  const handleFavorite = async (nannyId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAlert({
        visible: true,
        message: "Debes iniciar sesión para usar favoritos.",
        type: "warning",
      });
      navigate("/login");
      return;
    }

    setFavoriteLoading(true);
    try {
      if (favorites.includes(nannyId)) {
        // Eliminar de favoritos
        const favoriteToDelete = favorites.find(
          (fav) => nannies.find((n) => n.id === nannyId && n.id === fav)
        );
        await deleteFavorite(nannyId);
        setFavorites(favorites.filter((id) => id !== nannyId));
        setAlert({
          visible: true,
          message: "Niñera eliminada de favoritos.",
          type: "info",
        });
      } else {
        // Añadir a favoritos
        await addFavorite(nannyId);
        setFavorites([...favorites, nannyId]);
        setAlert({
          visible: true,
          message: "¡Niñera añadida a favoritos! ❤️",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error con favoritos:", err);
      setAlert({
        visible: true,
        message: err.response?.data?.detail || "No se pudo procesar la acción.",
        type: "error",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBookingClick = (nannyId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      localStorage.setItem("redirect_after_login", `/catalog?nanny=${nannyId}`);
      navigate("/login", { state: { redirectTo: `/catalog?nanny=${nannyId}` } });
      return;
    }
    navigate(`/bookings/create/${nannyId}`);
  };

  return (
    <MainLayout>
      <AlertToast
        message={alert.message}
        type={alert.type}
        isVisible={alert.visible}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      <div className="min-h-screen bg-pink-50 py-10 px-6">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">
          Catálogo de Niñeras
        </h1>

        <NannyFilters
          filters={filters}
          onChange={handleFilterChange}
          onSubmit={handleSearch}
        />

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-center mt-10 text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {nannies.length > 0 ? (
              nannies.map((nanny) => (
                <NannyCard
                  key={nanny.id}
                  nanny={nanny}
                  onFavorite={handleFavorite}
                  onBook={handleBookingClick}
                  isFavorited={favorites.includes(nanny.id)}
                  isLoading={favoriteLoading}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">
                No se encontraron niñeras con los filtros seleccionados.
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
