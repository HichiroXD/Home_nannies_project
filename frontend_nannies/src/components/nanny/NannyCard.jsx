import { Heart, User } from "lucide-react";

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
  const userRole = localStorage.getItem("role");
  const isNanny = userRole === "nanny";

  // Determinar badge de estado
  const getStatusBadge = () => {
    if (nanny.verified) {
      return { text: "Disponible", color: "bg-green-100 text-green-700" };
    }
    if (!nanny.verified && nanny.experience_years > 5) {
      return { text: "Limitado", color: "bg-yellow-100 text-yellow-700" };
    }
    return { text: "No disponible", color: "bg-red-100 text-red-700" };
  };

  const status = getStatusBadge();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="flex p-3 gap-3">
        {/* Avatar / Foto */}
        <div className="relative bg-gradient-to-br from-pink-100 to-pink-200 rounded-full w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <User className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 min-w-0">
          {/* Nombre y Favorito */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-900 truncate pr-2">
              {nanny.first_name && nanny.last_name
                ? `${nanny.first_name} ${nanny.last_name}`
                : nanny.username || "Niñera"}
            </h3>
            <button
              onClick={() => onFavorite(nanny.id)}
              disabled={isLoading}
              className={`flex-shrink-0 transition-all transform hover:scale-110 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label={isFavorited ? "Eliminar de favoritos" : "Añadir a favoritos"}
            >
              <Heart 
                size={18} 
                className={isFavorited ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-pink-500"}
                fill={isFavorited ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Badge de estado */}
          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${status.color} mb-1`}>
            {status.text}
          </span>

          {/* Información */}
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1">
              <p className="text-gray-700">
                <span className="font-medium">Tarifa por hora:</span>{" "}
                <span className="text-pink-600 font-bold">
                  ${typeof nanny.hourly_rate === 'number' 
                    ? nanny.hourly_rate.toLocaleString('es-CL') 
                    : (nanny.hourly_rate || "N/A")} CLP
                </span>
              </p>
              <span 
                className="text-gray-400 hover:text-gray-600 cursor-help" 
                title="El costo total se calcula multiplicando la tarifa por hora por el número de horas contratadas"
              >
                ℹ️
              </span>
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Experiencia:</span>{" "}
              <span className="text-gray-900">
                {nanny.experience_years || 0} {nanny.experience_years === 1 ? 'año' : 'años'}
              </span>
            </p>
            {nanny.rating_avg && parseFloat(nanny.rating_avg) > 0 && (
              <p className="text-gray-700">
                <span className="font-medium">Calificación:</span>{" "}
                <span className="text-yellow-600 font-bold">⭐ {parseFloat(nanny.rating_avg).toFixed(1)}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botón Contactar */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onBook(nanny.id)}
          disabled={isLoading || !nanny.verified || isNanny}
          className={`w-full py-1.5 px-3 rounded-lg font-medium text-xs transition-all ${
            isLoading || !nanny.verified || isNanny
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-pink-400 text-white hover:bg-pink-500 active:scale-95"
          }`}
        >
          {isLoading 
            ? "Procesando..." 
            : isNanny 
            ? "No disponible para niñeras" 
            : !nanny.verified 
            ? "No disponible" 
            : "Contactar"}
        </button>
      </div>
    </div>
  );
}
