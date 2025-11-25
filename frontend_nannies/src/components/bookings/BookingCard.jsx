import React from "react";
import { Edit2, Trash2, Check, X, CheckCircle, Star } from "lucide-react";

/**
 * Componente para mostrar una reserva con acciones
 * 
 * @param {object} booking - Datos de la reserva
 * @param {function} onEdit - Callback para editar
 * @param {function} onDelete - Callback para eliminar
 * @param {function} onAccept - Callback para aceptar (solo niñera)
 * @param {function} onReject - Callback para rechazar (solo niñera)
 * @param {function} onReview - Callback para dejar reseña (solo padre)
 * @param {string} userRole - Rol del usuario ('parent' o 'nanny')
 * @param {boolean} isLoading - Indica si está procesando
 */
export default function BookingCard({
  booking,
  onEdit,
  onDelete,
  onAccept,
  onReject,
  onReview,
  userRole,
  isLoading = false,
}) {
  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const duration = Math.round((endDate - startDate) / (1000 * 60)); // minutos

  // Determinar colores según estado
  const statusColors = {
    pending: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800",
      text: "Pendiente",
    },
    confirmed: {
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-700",
      text: "Confirmada",
    },
    rejected: {
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "bg-red-100 text-red-800",
      text: "Rechazada",
    },
    cancelled: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      badge: "bg-gray-100 text-gray-800",
      text: "Cancelada",
    },
    completed: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-800",
      text: "Completada",
    },
  };

  const colors = statusColors[booking.status] || statusColors.pending;

  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";
  const isEditable = isPending || isConfirmed;

  return (
    <div className={`border rounded-lg p-4 ${colors.bg} ${colors.border}`}>
      {/* Header con estado */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">
            {userRole === "parent" ? booking.nanny.first_name || "Niñera" : booking.parent.first_name || "Padre/Madre"}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            ID: #{booking.id}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
          {colors.text}
        </span>
      </div>

      {/* Detalles */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">📅</span>
          <span className="text-gray-700">
            {startDate.toLocaleDateString("es-ES", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">🕐</span>
          <span className="text-gray-700">
            {startDate.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {endDate.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">⏱️</span>
          <span className="text-gray-700">{duration} minutos</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 flex-wrap">
        {/* Editar - Solo padre/madre puede editar */}
        {userRole === "parent" && isEditable && (
          <button
            onClick={() => onEdit(booking)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Edit2 size={14} />
            Editar
          </button>
        )}

        {/* Aceptar - Solo niñera puede aceptar si está pendiente */}
        {userRole === "nanny" && isPending && onAccept && (
          <button
            onClick={() => onAccept(booking.id)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            Aceptar
          </button>
        )}

        {/* Rechazar - Solo niñera puede rechazar si está pendiente */}
        {userRole === "nanny" && isPending && onReject && (
          <button
            onClick={() => onReject(booking.id)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <X size={14} />
            Rechazar
          </button>
        )}

        {/* Marcar como completada - Solo niñera si está confirmada */}
        {userRole === "nanny" && isConfirmed && onAccept && (
          <button
            onClick={() => onAccept(booking.id)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <CheckCircle size={14} />
            Completar
          </button>
        )}

        {/* Cancelar - Padre puede cancelar si está pendiente o confirmada */}
        {userRole === "parent" && (isPending || isConfirmed) && onDelete && (
          <button
            onClick={() => onDelete(booking.id)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            Cancelar
          </button>
        )}

        {/* Calificar - Padre puede calificar si está completada y no tiene reseña */}
        {userRole === "parent" && booking.status === "completed" && !booking.has_review && onReview && (
          <button
            onClick={() => onReview(booking)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Star size={14} />
            Calificar
          </button>
        )}
      </div>
    </div>
  );
}
