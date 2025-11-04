import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNannies } from "@api/nannyApi";
import { addFavorite } from "@api/favoriteApi";
import { NannyFilters, NannyCard } from "@components/nanny";
import { MainLayout } from "@components/layout";
import { Loader } from "@components/layout";

export default function Catalog() {
  const [nannies, setNannies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    max_rate: "",
    min_experience: "",
    verified: false,
  });
  const navigate = useNavigate();

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
      setError("No se pudieron cargar las niñeras.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNannies();
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
    try {
      await addFavorite(nannyId);
      alert("Niñera añadida a favoritos ❤️");
    } catch (err) {
      console.error("Error al añadir a favoritos:", err);
      alert("No se pudo añadir a favoritos.");
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nannies.length > 0 ? (
              nannies.map((nanny) => (
                <NannyCard
                  key={nanny.id}
                  nanny={nanny}
                  onFavorite={handleFavorite}
                  onBook={handleBookingClick}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No se encontraron niñeras con los filtros seleccionados.
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
