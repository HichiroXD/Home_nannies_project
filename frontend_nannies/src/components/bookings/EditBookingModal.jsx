import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * Modal para editar detalles de una reserva (fecha/hora)
 * 
 * @param {object} booking - Datos de la reserva actual
 * @param {boolean} isOpen - Controla visibilidad del modal
 * @param {function} onClose - Callback para cerrar sin guardar
 * @param {function} onSave - Callback para guardar cambios (data)
 * @param {boolean} isLoading - Indica si está procesando
 * @param {string} error - Mensaje de error si existe
 */
export default function EditBookingModal({
  booking,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  error = "",
}) {
  const [formData, setFormData] = useState({
    start_time: booking?.start_time ? new Date(booking.start_time).toISOString().slice(0, 16) : "",
    end_time: booking?.end_time ? new Date(booking.end_time).toISOString().slice(0, 16) : "",
  });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setLocalError(""); // Limpiar error al cambiar
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.start_time || !formData.end_time) {
      setLocalError("Por favor completa todos los campos.");
      return;
    }

    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);

    if (startTime >= endTime) {
      setLocalError("La hora de inicio debe ser menor a la de fin.");
      return;
    }

    if (startTime < new Date()) {
      setLocalError("La fecha y hora debe ser en el futuro.");
      return;
    }

    // Preparar datos para enviar
    const updatedData = {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    };

    onSave(updatedData);
  };

  if (!isOpen) return null;

  const displayError = error || localError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Editar Reserva</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{displayError}</p>
            </div>
          )}

          {/* Información actual */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Detalles actuales
            </p>
            <p className="text-sm text-gray-700">
              <strong>Niñera:</strong> {booking?.nanny?.first_name || "N/A"}
            </p>
            {booking?.status && (
              <p className="text-sm text-gray-700 mt-1">
                <strong>Estado:</strong>{" "}
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {booking.status === "confirmed"
                    ? "Confirmada"
                    : booking.status === "pending"
                    ? "Pendiente"
                    : booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                </span>
              </p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y hora de inicio
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hora mínima: 30 minutos desde ahora
            </p>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y hora de fin
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Debe ser posterior a la hora de inicio
            </p>
          </div>

          {/* Duration Display */}
          {formData.start_time && formData.end_time && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">
                ⏱️ Duración:{" "}
                {Math.round(
                  (new Date(formData.end_time) - new Date(formData.start_time)) /
                    (1000 * 60)
                )}{" "}
                minutos
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
