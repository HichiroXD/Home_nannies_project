import React, { useState, useMemo } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

/**
 * AvailabilityCalendar
 * Props:
 * - availabilities: array of { id, day (YYYY-MM-DD), start_time (HH:MM:SS), end_time }
 * - onSelect(slot) => callback when user picks a slot
 */
export default function AvailabilityCalendar({ availabilities = [], onSelect }) {
  const [date, setDate] = useState(null);
  const [processingSlot, setProcessingSlot] = useState(null);

  // Filtrar solo disponibilidades futuras y agrupar por día
  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const g = {};
    availabilities.forEach(a => {
      // Verificar que sea una fecha futura
      const slotDate = new Date(a.day);
      slotDate.setHours(0, 0, 0, 0);
      
      if (slotDate >= today) {
        g[a.day] = g[a.day] || [];
        g[a.day].push(a);
      }
    });
    return g;
  }, [availabilities]);

  // Función para convertir Date a YYYY-MM-DD en zona horaria local
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;
    const dayKey = formatLocalDate(tileDate);
    const slots = grouped[dayKey];
    if (!slots || slots.length === 0) return null;
    return (
      <div className="mt-1">
        <span className="inline-block bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded">{slots.length} slot{slots.length>1? 's':''}</span>
      </div>
    );
  };

  const handleDayClick = (d) => {
    const dayKey = formatLocalDate(d);
    setDate(d); // Guardamos el objeto Date directamente
  };

  // Convertir el objeto Date a string para buscar slots
  const dateKey = date ? formatLocalDate(date) : null;
  const slotsForDay = dateKey ? (grouped[dateKey] || []) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Calendar
          onClickDay={handleDayClick}
          value={date}
          tileContent={tileContent}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{date ? date.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Selecciona un día'}</h3>
        {slotsForDay.length === 0 ? (
          <p className="text-gray-500">No hay slots disponibles para este día.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {slotsForDay.map(slot => {
              const isBooked = slot.is_booked;
              const bookedByCurrentUser = slot.booked_by_current_user;
              const isProcessing = processingSlot === slot.id;
              const isDisabled = isBooked || isProcessing;
              
              return (
                <button 
                  key={slot.id} 
                  onClick={async () => {
                    if (!isDisabled) {
                      setProcessingSlot(slot.id);
                      try {
                        await onSelect(slot);
                      } finally {
                        setProcessingSlot(null);
                      }
                    }
                  }}
                  disabled={isDisabled}
                  className={`text-left px-4 py-2 border rounded-md transition-colors ${
                    isDisabled
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
                      : 'bg-white hover:bg-pink-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</div>
                      <div className="text-xs text-gray-500">Duración: {Math.round((parseTime(slot.end_time)-parseTime(slot.start_time))/60)} min</div>
                    </div>
                    <div>
                      {isProcessing ? (
                        <span className="text-sm font-medium text-blue-600">Procesando...</span>
                      ) : isBooked ? (
                        <span className={`text-sm font-medium ${bookedByCurrentUser ? 'text-blue-600' : 'text-gray-500'}`}>
                          {bookedByCurrentUser ? 'Ya reservaste' : 'Reservado'}
                        </span>
                      ) : (
                        <span className="text-pink-600 font-semibold">Reservar</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function parseTime(t) {
  // t expected HH:MM or HH:MM:SS
  const parts = t.split(":");
  const h = parseInt(parts[0],10)||0;
  const m = parseInt(parts[1],10)||0;
  return h*3600 + m*60;
}
