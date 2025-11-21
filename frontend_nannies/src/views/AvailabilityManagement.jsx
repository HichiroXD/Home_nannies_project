import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAvailabilities, createAvailability, deleteAvailability } from "../api/bookingApi";
import AlertToast from "../components/layout/AlertToast";
import Loader from "../components/layout/Loader";
import { Trash2, Plus } from "lucide-react";

export default function AvailabilityManagement() {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState({ start: "08:00", end: "17:00" });
  const [alert, setAlert] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      const data = await getAvailabilities();
      setAvailabilities(data || []);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error al cargar disponibilidades",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!selectedDate || !timeSlot.start || !timeSlot.end) {
      setAlert({
        type: "warning",
        message: "Por favor completa todos los campos",
      });
      return;
    }

    if (timeSlot.start >= timeSlot.end) {
      setAlert({
        type: "error",
        message: "La hora de inicio debe ser anterior a la hora de fin",
      });
      return;
    }

    try {
      setIsAdding(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const payload = {
        date: dateStr,
        start_time: timeSlot.start,
        end_time: timeSlot.end,
      };

      await createAvailability(payload);
      setAlert({
        type: "success",
        message: "Franja añadida exitosamente",
      });
      setTimeSlot({ start: "08:00", end: "17:00" });
      setSelectedDate(new Date());
      await loadAvailabilities();
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.detail || "Error al añadir franja",
      });
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm("¿Deseas eliminar esta franja de disponibilidad?")) {
      return;
    }

    try {
      await deleteAvailability(id);
      setAlert({
        type: "success",
        message: "Franja eliminada",
      });
      await loadAvailabilities();
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error al eliminar franja",
      });
      console.error(error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-3">
          Gestionar Disponibilidad
        </h1>
        <p className="text-lg text-gray-600">
          Define las franjas horarias en las que estás disponible para cuidar
        </p>
      </div>

      {alert && (
        <AlertToast
          type={alert.type}
          message={alert.message}
          isVisible={true}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Plus className="text-pink-600" size={24} />
            Añadir Nueva Franja
          </h2>

          <form onSubmit={handleAddAvailability} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Selecciona una fecha
              </label>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-pink-300 transition-colors">
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date()}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={timeSlot.start}
                  onChange={(e) =>
                    setTimeSlot({ ...timeSlot, start: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hora de fin
                </label>
                <input
                  type="time"
                  value={timeSlot.end}
                  onChange={(e) =>
                    setTimeSlot({ ...timeSlot, end: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {isAdding ? "Añadiendo..." : "Añadir Franja"}
            </button>
          </form>
        </div>

        {/* Lista de disponibilidades */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mis Franjas Disponibles
          </h2>

          {availabilities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg font-medium">
                No tienes franjas de disponibilidad.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                ¡Añade una para comenzar!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(avail.date)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      🕐 {avail.start_time} - {avail.end_time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAvailability(avail.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all transform hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
