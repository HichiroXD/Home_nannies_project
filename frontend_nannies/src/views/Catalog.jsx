import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNannies } from "@api/nannyApi";
import { addFavorite, deleteFavorite, getFavorites } from "@api/favoriteApi";
import { NannyFilters, NannyCard } from "@components/nanny";
import { MainLayout } from "@components/layout";
import { AlertToast, useAlert } from "@components/common";
import { Loader } from "@components/layout";
import useAuthStore from "@/stores/useAuthStore";
import logger from "@/utils/logger";

export default function Catalog() {
  const [nannies, setNannies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // store Favorite objects: { id, nanny, created_at }
  const [favorites, setFavorites] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { showAlert, alert, setAlert } = useAlert();
  const [filters, setFilters] = useState({
    search: "",
    max_rate: "",
    min_experience: "",
    verified: false,
  });
  const navigate = useNavigate();
  const { role: userRole, accessToken, isAuthenticated } = useAuthStore();

  // Cargar niñeras
  const fetchNannies = useCallback(async (appliedFilters = filters) => {
    try {
      setLoading(true);
      const params = {};
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.max_rate) params.max_rate = appliedFilters.max_rate;
      if (appliedFilters.min_experience) params.min_experience = appliedFilters.min_experience;
      if (appliedFilters.verified) params.verified = true;

      const data = await getNannies(params);
      setNannies(data);
    } catch (err) {
      showAlert("No se pudieron cargar las niñeras.", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Cargar favoritos del usuario (guardamos objetos completos)
  const fetchFavorites = useCallback(async () => {
    try {
      if (!accessToken) return setFavorites([]);

      const favs = await getFavorites();
      if (Array.isArray(favs)) setFavorites(favs);
      else {
        logger.warn('getFavorites returned unexpected payload', { favs });
        setFavorites([]);
      }
    } catch (err) {
      logger.error('Error cargando favoritos', { error: err.message, data: err.response?.data });
      // if 401 the api interceptor will redirect to login; keep favorites empty
      setFavorites([]);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNannies();
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    fetchNannies(filters);
  }, [filters, fetchNannies]);

  const handleFavorite = useCallback(async (nannyId) => {
    if (!isAuthenticated) {
      showAlert("Debes iniciar sesión para usar favoritos.", "warning");
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
        showAlert("Niñera eliminada de favoritos.", "info");
      } else {
        // crear favorito; backend devuelve el objeto Favorite
        const created = await addFavorite(nannyId);
        if (created) setFavorites([...favorites, created]);
        showAlert("¡Niñera añadida a favoritos! ❤️", "success");
      }
    } catch (err) {
      logger.error('Error con favoritos', { nannyId, error: err.message, data: err.response?.data });
      const msg = err.response?.data?.detail || err.response?.data || err.message || "No se pudo procesar la acción.";
      showAlert(msg, "error");
    } finally {
      setFavoriteLoading(false);
    }
  }, [favorites, navigate, showAlert, isAuthenticated]);

  const handleBookingClick = useCallback((nannyId) => {
    if (!isAuthenticated) {
      // Redirect usando state de react-router en lugar de localStorage
      navigate("/login", { state: { redirectTo: `/catalog?nanny=${nannyId}` } });
      return;
    }

    // Verificar que el usuario no sea una niñera
    if (userRole === "nanny") {
      showAlert("Las niñeras no pueden contactar a otras niñeras", "error");
      return;
    }

    navigate(`/bookings/create/${nannyId}`);
  }, [navigate, userRole, showAlert, isAuthenticated]);

  // Memoizar nannies favoriteadas para evitar recalculos
  const nannyFavoriteStatusMap = useMemo(() => {
    const map = new Map();
    favorites.forEach(fav => {
      if (fav.nanny?.id) {
        map.set(fav.nanny.id, true);
      }
    });
    return map;
  }, [favorites]);

  return (
    <MainLayout>
      <AlertToast {...alert} onClose={() => setAlert({})} />

      <div className="min-h-screen bg-pink-100 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-200 to-pink-300 rounded-2xl p-6 mb-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Catálogo de Niñeras
            </h1>
            <p className="text-gray-700 mb-2">
              Encuentra a la niñera perfecta para tu infante
            </p>
            <div className="bg-white/50 rounded-lg p-3 mt-3 border border-pink-300">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Precios mostrados:</strong> Los valores indicados son tarifas por hora en pesos chilenos (CLP). 
                  El costo total de tu reserva se calculará automáticamente según el número de horas que contrates.
                </span>
              </p>
            </div>
          </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {nannies.length > 0 ? (
              nannies.map((nanny) => (
                <NannyCard
                  key={nanny.id}
                  nanny={nanny}
                  onFavorite={handleFavorite}
                  onBook={handleBookingClick}
                  isFavorited={nannyFavoriteStatusMap.has(nanny.id)}
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

          {/* Botón cargar más */}
          {!loading && nannies.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  // Aquí se puede implementar paginación en el futuro
                  showAlert("Mostrando todas las niñeras disponibles", "info");
                }}
                className="px-8 py-3 bg-white text-pink-600 font-medium rounded-lg border-2 border-pink-300 hover:bg-pink-50 transition-colors"
              >
                Cargar más personas
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
