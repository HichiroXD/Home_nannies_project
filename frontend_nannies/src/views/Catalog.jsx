import React, { useEffect, useState } from "react";
import { getNannies } from "../api/nannyApi";
import { addFavorite } from "../api/favoriteApi";

function Catalog() {
  const [nannies, setNannies] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    max_rate: "",
    min_experience: "",
    verified: false,
  });

  // Cargar niñeras filtradas
  const fetchNannies = async () => {
    try {
      const params = {};

      if (filters.search) params.search = filters.search;
      if (filters.max_rate) params.max_rate = filters.max_rate;
      if (filters.min_experience) params.min_experience = filters.min_experience;
      if (filters.verified) params.verified = true;

      const data = await getNannies(params);
      setNannies(data);
    } catch (error) {
      console.error("Error al cargar niñeras:", error);
    }
  };

  useEffect(() => {
    fetchNannies();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNannies();
  };

  const handleFavorite = async (nannyId) => {
    try {
      await addFavorite(nannyId);
      alert("Niñera agregada a favoritos ❤️");
    } catch (error) {
      console.error("Error al agregar favorito:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Catálogo de Niñeras
      </h2>

      {/* 🔍 FILTROS */}
      <form
        onSubmit={handleSearch}
        className="bg-gray-100 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center"
      >
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Buscar por nombre o descripción..."
          className="flex-1 p-2 border rounded-md"
        />

        <input
          type="number"
          name="max_rate"
          value={filters.max_rate}
          onChange={handleFilterChange}
          placeholder="Tarifa máx ($/h)"
          className="w-40 p-2 border rounded-md"
        />

        <input
          type="number"
          name="min_experience"
          value={filters.min_experience}
          onChange={handleFilterChange}
          placeholder="Experiencia mínima (años)"
          className="w-52 p-2 border rounded-md"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="verified"
            checked={filters.verified}
            onChange={handleFilterChange}
          />
          Solo verificadas
        </label>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Aplicar filtros
        </button>
      </form>

      {/* 🧒 LISTA DE NIÑERAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {nannies.length > 0 ? (
          nannies.map((nanny) => (
            <div
              key={nanny.id}
              className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {nanny.full_name}
              </h3>
              <p className="text-gray-600 text-sm">{nanny.description}</p>
              <p className="text-blue-700 font-medium mt-2">
                ${nanny.hourly_rate}/hora
              </p>
              <p className="text-gray-500 text-sm">
                Experiencia: {nanny.experience_years} años
              </p>
              {nanny.verified && (
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-200 text-green-800 rounded-md">
                  ✅ Verificada
                </span>
              )}
              <button
                onClick={() => handleFavorite(nanny.id)}
                className="mt-3 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                ❤️ Agregar a favoritos
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No se encontraron niñeras.</p>
        )}
      </div>
    </div>
  );
}

export default Catalog;
