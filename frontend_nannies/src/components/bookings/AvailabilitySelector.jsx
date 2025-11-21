import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./AvailabilitySelector.css";

/**
 * Componente para visualizar y seleccionar disponibilidad de una niñera
 * 
 * @param {number} nannyId - ID de la niñera
 * @param {function} onSlotSelect - Callback cuando se selecciona un slot
 * @param {function} getAvailability - Función para obtener disponibilidad (opcional)
 * @param {array} availabilityData - Datos de disponibilidad precargados
 */
export default function AvailabilitySelector({
  nannyId,
  onSlotSelect,
  getAvailability,
  availabilityData = [],
  isLoading = false,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Cargar disponibilidad para la fecha seleccionada
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        // Buscar en availabilityData
        const dateStr = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const dayOfWeek = selectedDate.getDay();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        // Filtrar slots disponibles para este día
        const availableSlots = availabilityData.filter((av) => {
          const avDate = new Date(av.day).toISOString().split("T")[0];
          return avDate === dateStr;
        });

        if (availableSlots.length === 0) {
          // Si no hay datos específicos, mostrar mensaje
          setSlots([]);
          return;
        }

        // Convertir a slots horarios
        const formattedSlots = availableSlots.map((slot) => ({
          id: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time,
          day: slot.day,
        }));

        setSlots(formattedSlots);
        setSelectedSlot(null);
      } catch (error) {
        console.error("Error cargando disponibilidad:", error);
        setSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDate, availabilityData]);

  // Filtrar fechas no disponibles
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      return !availabilityData.some(
        (av) => new Date(av.day).toISOString().split("T")[0] === dateStr
      );
    }
    return false;
  };

  // Aplicar clases CSS a fechas
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      
      if (dateStr === selectedDateStr) {
        return "availability-selected-date";
      }
      
      if (
        availabilityData.some(
          (av) => new Date(av.day).toISOString().split("T")[0] === dateStr
        )
      ) {
        return "availability-has-slots";
      }
    }
    return "";
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onSlotSelect?.({
      date: selectedDate.toISOString().split("T")[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      availabilityId: slot.id,
    });
  };

  return (
    <div className="availability-selector">
      <div className="availability-container">
        {/* Calendario */}
        <div className="availability-calendar">
          <h3 className="availability-title">Selecciona una fecha</h3>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 días
            tileDisabled={tileDisabled}
            tileClassName={tileClassName}
            locale="es-ES"
            prev2Label={null}
            next2Label={null}
            prevLabel={<ChevronLeft size={20} />}
            nextLabel={<ChevronRight size={20} />}
          />
          <p className="availability-hint text-sm text-gray-500 mt-3">
            🟢 Días con disponibilidad
          </p>
        </div>

        {/* Slots horarios */}
        <div className="availability-slots">
          <h3 className="availability-title">
            Horarios disponibles - {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {isLoading ? (
            <div className="availability-loading">Cargando horarios...</div>
          ) : slots.length === 0 ? (
            <div className="availability-empty">
              <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
            </div>
          ) : (
            <div className="availability-slots-grid">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className={`availability-slot ${isSelected ? "selected" : ""}`}
                  >
                    <span className="slot-time">
                      {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="slot-separator">-</span>
                    <span className="slot-time">
                      {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <div className="availability-selected-info">
              <p className="text-sm text-green-700 font-medium">
                ✅ Horario seleccionado:{" "}
                {new Date(`2000-01-01T${selectedSlot.startTime}`).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(`2000-01-01T${selectedSlot.endTime}`).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
