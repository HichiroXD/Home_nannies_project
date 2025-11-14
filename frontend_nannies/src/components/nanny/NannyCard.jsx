import { Heart } from "lucide-react";

/**
 * Componente NannyCard - Muestra información de una niñera
 * 
 * @param {object} nanny - Datos de la niñera
 * @param {function} onFavorite - Callback para guardar/eliminar de favoritos
 * @param {function} onBook - Callback para agendar reserva
 * @param {boolean} isFavorited - Indica si ya está en favoritos
 * @param {boolean} isLoading - Indica si se está procesando la acción
 */
export default function NannyCard({ nanny, onFavorite, onBook, isFavorited = false, isLoading = false }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-all">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {nanny.user?.first_name && nanny.user?.last_name
            ? `${nanny.user.first_name} ${nanny.user.last_name}`
            : nanny.user?.username || "Niñera"}
        </h2>
        <button
          onClick={() => onFavorite(nanny.id)}
          disabled={isLoading}
          className={`transition-all transform hover:scale-110 ${
            isFavorited
              ? "text-red-500 fill-red-500"
              : "text-gray-300 hover:text-pink-500"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isFavorited ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          <Heart size={24} strokeWidth={isFavorited ? 0 : 2} />
        </button>
      </div>
      <p className="text-gray-500 text-sm mt-2">{nanny.description || "Sin descripción"}</p>
      <div className="mt-3 space-y-1">
        <p className="text-gray-700 text-sm">
          <strong className="text-gray-900">Tarifa:</strong> ${nanny.hourly_rate || "N/A"}/hora
        </p>
        <p className="text-gray-700 text-sm">
          <strong className="text-gray-900">Experiencia:</strong> {nanny.experience_years || 0} años
        </p>
        {Number.isFinite(Number(nanny?.rating_avg)) && (
          <p className="text-gray-700 text-sm">
            <strong className="text-gray-900">Rating:</strong> ⭐ {Number(nanny.rating_avg).toFixed(1)}/5
          </p>
        )}
      </div>
      {nanny.verified && (
        <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
          ✅ Verificada
        </span>
      )}
      <button
        onClick={() => onBook(nanny.id)}
        disabled={isLoading}
        className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all ${
          isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-pink-500 text-white hover:bg-pink-600 active:scale-95"
        }`}
      >
        {isLoading ? "Procesando..." : "Agendar"}
      </button>
    </div>
  );
}
