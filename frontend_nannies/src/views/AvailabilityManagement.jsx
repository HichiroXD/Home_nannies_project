import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Plus, Trash2, Clock, ArrowLeft, Edit2, X, Check, Copy, RefreshCw } from "lucide-react";
import { getAvailabilities, createAvailability, deleteAvailability, updateAvailability } from "@api/availabilityApi";
import { AlertToast } from "@components/common";
import { Loader, PageHeader } from "@components/layout";
import { AvailabilityForm, AvailabilityCalendar } from "@components/availability";

export default function AvailabilityManagement() {
  const navigate = useNavigate();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState({ start: "08:00", end: "17:00" });
  const [alert, setAlert] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTimeSlot, setEditTimeSlot] = useState({ start: "", end: "" });
  const [repeating, setRepeating] = useState(false);

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      const data = await getAvailabilities();
      console.log("Datos de disponibilidades recibidos:", data);
      console.log("Primer elemento (si existe):", data?.[0]);
      
      // Filtrar solo fechas futuras o actuales y ordenar
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Comenzar desde el inicio del día
      
      const filtered = (data || [])
        .filter(avail => {
          const availDate = new Date(avail.day);
          return availDate >= today;
        })
        .sort((a, b) => {
          // Ordenar por fecha (más reciente primero)
          const dateA = new Date(a.day);
          const dateB = new Date(b.day);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          // Si es el mismo día, ordenar por hora de inicio
          return a.start_time.localeCompare(b.start_time);
        });
      
      console.log(`Mostrando ${filtered.length} de ${data?.length || 0} disponibilidades (solo futuras)`);
      setAvailabilities(filtered);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error al cargar disponibilidades",
      });
      console.error("Error en loadAvailabilities:", error);
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

    try {
      setIsAdding(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const payload = {
        day: dateStr,
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
    if (!id) {
      setAlert({
        type: "error",
        message: "Error: ID de disponibilidad no válido",
      });
      console.error("ID inválido:", id);
      return;
    }

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
      console.error("Error al eliminar:", error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Error al eliminar franja";
      setAlert({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const handleStartEdit = (avail) => {
    if (!avail || !avail.id) {
      setAlert({
        type: "error",
        message: "Error: Disponibilidad no válida",
      });
      console.error("Disponibilidad inválida:", avail);
      return;
    }
    
    setEditingId(avail.id);
    // Normalizar el formato de tiempo (eliminar segundos si existen)
    const normalizeTime = (time) => {
      if (!time) return "";
      // Si viene en formato HH:MM:SS, convertir a HH:MM
      return time.split(':').slice(0, 2).join(':');
    };
    setEditTimeSlot({
      start: normalizeTime(avail.start_time),
      end: normalizeTime(avail.end_time),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTimeSlot({ start: "", end: "" });
  };

  const handleSaveEdit = async (avail) => {
    if (!avail || !avail.id) {
      setAlert({
        type: "error",
        message: "Error: Disponibilidad no válida",
      });
      return;
    }

    if (!editTimeSlot.start || !editTimeSlot.end) {
      setAlert({
        type: "warning",
        message: "Por favor completa los horarios",
      });
      return;
    }

    try {
      // Asegurar que el formato de tiempo incluya segundos si el backend lo requiere
      const formatTime = (time) => {
        if (!time) return "";
        // Si el formato es HH:MM, agregar :00 para segundos
        return time.length === 5 ? `${time}:00` : time;
      };

      const payload = {
        day: avail.day,
        start_time: formatTime(editTimeSlot.start),
        end_time: formatTime(editTimeSlot.end),
      };

      const updatedAvail = await updateAvailability(avail.id, payload);
      
      // Actualizar el estado local inmediatamente
      setAvailabilities(prevAvails => 
        prevAvails.map(a => a.id === avail.id ? updatedAvail : a)
      );
      
      setAlert({
        type: "success",
        message: "Horario actualizado exitosamente",
      });
      setEditingId(null);
      setEditTimeSlot({ start: "", end: "" });
      
      // Recargar disponibilidades para asegurar sincronización
      await loadAvailabilities();
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      
      let errorMessage = "Error al actualizar horario";
      if (error?.response?.data) {
        // Intentar extraer el mensaje de error más específico
        const data = error.response.data;
        if (typeof data === 'object') {
          errorMessage = Object.values(data).flat().join(', ') || errorMessage;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      
      setAlert({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const handleRepeatWeekly = async (avail) => {
    if (!avail || !avail.id || !avail.day) {
      setAlert({
        type: "error",
        message: "Error: Disponibilidad no válida",
      });
      return;
    }

    if (!window.confirm("¿Deseas repetir esta franja para la próxima semana?")) {
      return;
    }

    try {
      setRepeating(true);
      
      // Calcular la fecha de la próxima semana (7 días después)
      const currentDate = new Date(avail.day);
      const nextWeekDate = new Date(currentDate);
      nextWeekDate.setDate(currentDate.getDate() + 7);
      
      const dateStr = nextWeekDate.toISOString().split("T")[0];
      
      // Formatear tiempos con segundos
      const formatTime = (time) => {
        if (!time) return "";
        return time.length === 5 ? `${time}:00` : time;
      };

      const payload = {
        day: dateStr,
        start_time: formatTime(avail.start_time),
        end_time: formatTime(avail.end_time),
      };

      await createAvailability(payload);
      setAlert({
        type: "success",
        message: "Franja repetida para la próxima semana",
      });
      await loadAvailabilities();
    } catch (error) {
      console.error("Error al repetir franja:", error);
      
      let errorMessage = "Error al repetir franja";
      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          errorMessage = Object.values(data).flat().join(', ') || errorMessage;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      
      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setRepeating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no disponible";
    // Crear fecha en zona horaria local para evitar desfase UTC
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header con botón de regreso */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/catalog')}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition mb-4"
        >
          <ArrowLeft size={20} />
          Volver al Catálogo
        </button>
      </div>

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
              No tienes franjas de disponibilidad futuras. ¡Añade nuevas franjas para estar disponible!
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  {editingId === avail.id ? (
                    // Modo edición
                    <div className="space-y-3">
                      <p className="font-medium text-gray-900">
                        {formatDate(avail.day)}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Inicio
                          </label>
                          <input
                            type="time"
                            value={editTimeSlot.start}
                            onChange={(e) =>
                              setEditTimeSlot({ ...editTimeSlot, start: e.target.value })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Fin
                          </label>
                          <input
                            type="time"
                            value={editTimeSlot.end}
                            onChange={(e) =>
                              setEditTimeSlot({ ...editTimeSlot, end: e.target.value })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(avail)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition"
                        >
                          <Check size={16} />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded transition"
                        >
                          <X size={16} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo vista
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(avail.day)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {avail.start_time} - {avail.end_time}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRepeatWeekly(avail)}
                            disabled={repeating || !avail.id}
                            className="text-purple-500 hover:text-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Repetir para la próxima semana"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handleStartEdit(avail)}
                            disabled={!avail.id}
                            className="text-blue-500 hover:text-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Editar horario"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteAvailability(avail.id)}
                            disabled={!avail.id}
                            className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar franja"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
