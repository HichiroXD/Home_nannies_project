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
    <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
          {nanny.user?.first_name && nanny.user?.last_name
            ? `${nanny.user.first_name} ${nanny.user.last_name}`
            : nanny.user?.username || "Niñera"}
        </h2>
        <button
          onClick={() => onFavorite(nanny.id)}
          disabled={isLoading}
          className={`transition-all transform hover:scale-125 active:scale-95 ${
            isFavorited
              ? "text-red-500 fill-red-500"
              : "text-gray-300 hover:text-pink-500"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isFavorited ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          <Heart size={26} strokeWidth={isFavorited ? 0 : 2} />
        </button>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{nanny.description || "Sin descripción"}</p>
      <div className="mt-4 space-y-2 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-semibold text-gray-900">💰 Tarifa:</span>
          <span className="text-pink-600 font-bold">${nanny.hourly_rate || "N/A"}/hora</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-semibold text-gray-900">⭐ Experiencia:</span>
          <span>{nanny.experience_years || 0} años</span>
        </div>
        {Number.isFinite(Number(nanny?.rating_avg)) && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-semibold text-gray-900">📊 Rating:</span>
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-bold">{Number(nanny.rating_avg).toFixed(1)}/5</span>
            </span>
          </div>
        )}
      </div>
      {nanny.verified && (
        <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full border border-green-200">
          <span>✅</span> Verificada
        </span>
      )}
      <button
        onClick={() => onBook(nanny.id)}
        disabled={isLoading}
        className={`mt-5 w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
          isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        }`}
      >
        {isLoading ? "Procesando..." : "Agendar ahora"}
      </button>
    </div>
  );
}
