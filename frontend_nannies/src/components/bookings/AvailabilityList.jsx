import React from "react";

/**
 * Presentational component: muestra disponibilidades agrupadas por día
 * props:
 * - availabilities: array de { id, day, start_time, end_time }
 * - onSelect(slot) => callback al seleccionar un slot
 */
export default function AvailabilityList({ availabilities = [], onSelect }) {
  // Agrupar por day
  const grouped = {};
  availabilities.forEach((a) => {
    grouped[a.day] = grouped[a.day] || [];
    grouped[a.day].push(a);
  });

  const days = Object.keys(grouped).sort();

  return (
    <div className="space-y-4">
      {days.length === 0 && (
        <p className="text-gray-500">No hay disponibilidad publicada por esta niñera.</p>
      )}
      {days.map((day) => (
        <div key={day} className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700">{new Date(day).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          <div className="mt-3 flex gap-2 flex-wrap">
            {grouped[day].map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSelect(slot)}
                className="px-3 py-2 bg-pink-50 text-pink-600 border border-pink-100 rounded-md hover:bg-pink-100 transition-colors"
              >
                {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
