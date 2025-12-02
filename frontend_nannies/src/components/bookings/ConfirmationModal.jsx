import React, { useEffect } from "react";
import { CheckCircle, Calendar, Clock, User } from "lucide-react";

/**
 * Modal de confirmación cuando una reserva es aceptada
 * 
 * @param {object} booking - Datos de la reserva confirmada
 * @param {boolean} isOpen - Controla visibilidad del modal
 * @param {function} onClose - Callback para cerrar modal
 */
export default function ConfirmationModal({ booking, isOpen, onClose }) {
  // Auto-cerrar después de 5 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const duration = Math.round((endDate - startDate) / (1000 * 60));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Encabezado con icono de éxito */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle size={80} className="text-white drop-shadow-lg" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <CheckCircle size={80} className="text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">¡Reserva Confirmada!</h2>
          <p className="text-green-100 mt-2">Tu solicitud ha sido aceptada</p>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
          {/* Nombre de niñera */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <User size={24} className="text-pink-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Niñera</p>
              <p className="text-lg font-semibold text-gray-800">
                {booking.nanny.first_name && booking.nanny.last_name
                  ? `${booking.nanny.first_name} ${booking.nanny.last_name}`
                  : booking.nanny.username}
              </p>
            </div>
          </div>

          {/* Fecha */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <Calendar size={24} className="text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Fecha</p>
              <p className="text-lg font-semibold text-gray-800">
                {startDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Hora */}
          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
            <Clock size={24} className="text-purple-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Horario</p>
              <p className="text-lg font-semibold text-gray-800">
                {startDate.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {endDate.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({duration} min)
                </span>
              </p>
            </div>
          </div>

          {/* Mensaje informativo */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Puedes ver los detalles de tu reserva en la sección "Mis Reservas"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Continuar
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Este modal se cerrará automáticamente en 5 segundos
          </p>
        </div>
      </div>
    </div>
  );
}
