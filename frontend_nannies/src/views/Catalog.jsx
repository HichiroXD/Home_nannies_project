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
  // store Favorite objects: { id, nanny, created_at }
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

  // Cargar favoritos del usuario (guardamos objetos completos)
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return setFavorites([]);

      const favs = await getFavorites();
      if (Array.isArray(favs)) setFavorites(favs);
      else {
        console.warn("getFavorites returned unexpected payload:", favs);
        setFavorites([]);
      }
    } catch (err) {
      console.error("Error cargando favoritos:", err, err.response?.data);
      // if 401 the api interceptor will redirect to login; keep favorites empty
      setFavorites([]);
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
      // buscar favorito existente por nanny.id
      const existing = favorites.find((f) => f.nanny?.id === nannyId);
      if (existing) {
        // eliminar usando el id del Favorite
        await deleteFavorite(existing.id);
        setFavorites(favorites.filter((f) => f.nanny?.id !== nannyId));
        setAlert({ visible: true, message: "Niñera eliminada de favoritos.", type: "info" });
      } else {
        // crear favorito; backend devuelve el objeto Favorite
        const created = await addFavorite(nannyId);
        if (created) setFavorites([...favorites, created]);
        setAlert({ visible: true, message: "¡Niñera añadida a favoritos! ❤️", type: "success" });
      }
    } catch (err) {
      console.error("Error con favoritos:", err, err.response?.data);
      const msg = err.response?.data?.detail || err.response?.data || err.message || "No se pudo procesar la acción.";
      setAlert({ visible: true, message: msg, type: "error" });
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

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-4">
            Catálogo de Niñeras
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Encuentra la niñera perfecta para tu familia
          </p>

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
      </div>
    </MainLayout>
  );
}
