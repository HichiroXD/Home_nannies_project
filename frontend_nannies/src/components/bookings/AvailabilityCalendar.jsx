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

  // Agrupar availabilities por día
  const grouped = useMemo(() => {
    const g = {};
    availabilities.forEach(a => {
      g[a.day] = g[a.day] || [];
      g[a.day].push(a);
    });
    return g;
  }, [availabilities]);

  const tileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;
    const dayKey = tileDate.toISOString().slice(0,10);
    const slots = grouped[dayKey];
    if (!slots || slots.length === 0) return null;
    return (
      <div className="mt-1">
        <span className="inline-block bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded">{slots.length} slot{slots.length>1? 's':''}</span>
      </div>
    );
  };

  const handleDayClick = (d) => {
    const dayKey = d.toISOString().slice(0,10);
    setDate(dayKey);
  };

  const slotsForDay = date ? (grouped[date] || []) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Calendar
          onClickDay={handleDayClick}
          value={date ? new Date(date) : null}
          tileContent={tileContent}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Selecciona un día'}</h3>
        {slotsForDay.length === 0 ? (
          <p className="text-gray-500">No hay slots disponibles para este día.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {slotsForDay.map(slot => (
              <button key={slot.id} onClick={() => onSelect(slot)}
                className="text-left px-4 py-2 bg-white border rounded-md hover:bg-pink-50 transition-colors">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</div>
                    <div className="text-xs text-gray-500">Duración: {Math.round((parseTime(slot.end_time)-parseTime(slot.start_time))/60)} min</div>
                  </div>
                  <div className="text-pink-600 font-semibold">Reservar</div>
                </div>
              </button>
            ))}
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
