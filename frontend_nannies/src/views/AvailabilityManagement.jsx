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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestionar Disponibilidad
        </h1>
        <p className="text-gray-600">
          Define las franjas horarias en las que estás disponible para cuidar
        </p>
      </div>

      {alert && (
        <AlertToast
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Añadir Nueva Franja
          </h2>

          <form onSubmit={handleAddAvailability} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona una fecha
              </label>
              <div className="border rounded-lg overflow-hidden">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={timeSlot.start}
                  onChange={(e) =>
                    setTimeSlot({ ...timeSlot, start: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de fin
                </label>
                <input
                  type="time"
                  value={timeSlot.end}
                  onChange={(e) =>
                    setTimeSlot({ ...timeSlot, end: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {isAdding ? "Añadiendo..." : "Añadir Franja"}
            </button>
          </form>
        </div>

        {/* Lista de disponibilidades */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mis Franjas Disponibles
          </h2>

          {availabilities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No tienes franjas de disponibilidad. ¡Añade una para comenzar!
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(avail.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {avail.start_time} - {avail.end_time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAvailability(avail.id)}
                    className="text-red-500 hover:text-red-700 transition"
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
