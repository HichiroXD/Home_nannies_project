import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAvailabilities } from "@api/availabilityApi";
import { createBooking } from "@api/bookingApi";
import { getNannyById } from "@api/nannyApi";
import { MainLayout, AlertToast, Loader, PageContainer } from "@components/layout";
import { AvailabilityCalendar } from "@components/bookings";
import { User, Star, Clock, MessageCircle, Calendar } from "lucide-react";

export default function BookingCreate() {
  const { nannyId } = useParams();
  const navigate = useNavigate();
  const [nanny, setNanny] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "info" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar"); // calendar, schedule, message
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Verificar que el usuario no sea una niñera
    if (userRole === "nanny") {
      setAlert({ 
        visible: true, 
        message: "Las niñeras no pueden contactar a otras niñeras", 
        type: "error" 
      });
      setTimeout(() => navigate("/catalog"), 2000);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        // Obtener datos de la niñera
        const nannyData = await getNannyById(nannyId);
        setNanny(nannyData);

        // Usar user_id para consultar disponibilidades (Availability usa User, no NannyProfile)
        const userIdToQuery = nannyData.user_id || nannyId;
        console.log("Fetching availabilities for user ID:", userIdToQuery, "(nanny profile ID:", nannyId, ")");
        const data = await getAvailabilities({ nanny: userIdToQuery });
        console.log("Availabilities from API (raw):", data);
        console.log("Number of availabilities:", data?.length || 0);
        
        if (!data || data.length === 0) {
          console.warn("No availabilities found for user:", userIdToQuery);
        }
        
        // Filtrar solo fechas futuras o actuales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureData = data.filter(a => {
          const availDate = new Date(a.day);
          return availDate >= today;
        });
        
        console.log(`Mostrando ${futureData.length} de ${data?.length || 0} disponibilidades (solo futuras)`);
        
        // El backend devuelve objetos con day (YYYY-MM-DD), start_time (HH:MM:SS), end_time (HH:MM:SS)
        // Normalizar para asegurar el formato correcto, incluyendo estado de reserva
        const normalized = futureData.map((a) => ({
          id: a.id,
          day: a.day, // Ya viene en formato YYYY-MM-DD
          start_time: a.start_time, // Ya viene en formato HH:MM:SS
          end_time: a.end_time, // Ya viene en formato HH:MM:SS
          is_booked: a.is_booked || false, // Si está reservado
          booked_by_current_user: a.booked_by_current_user || false, // Si el usuario actual lo reservó
        })).sort((a, b) => {
          // Ordenar por fecha (más reciente primero)
          const dateA = new Date(a.day);
          const dateB = new Date(b.day);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          // Si es el mismo día, ordenar por hora de inicio
          return a.start_time.localeCompare(b.start_time);
        });
        console.log("Normalized availabilities:", normalized);
        console.log("Setting availabilities state with:", normalized.length, "items");
        setAvailabilities(normalized);
        
        if (normalized.length === 0) {
          const hasOldAvailabilities = data && data.length > 0 && futureData.length === 0;
          setAlert({ 
            visible: true, 
            message: hasOldAvailabilities 
              ? "Esta niñera no tiene horarios futuros disponibles" 
              : "Esta niñera no tiene horarios disponibles publicados", 
            type: "info" 
          });
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setAlert({ visible: true, message: "No se pudo cargar la información.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [nannyId, userRole, navigate]);

  const handleSelectSlot = async (slot) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      localStorage.setItem("redirect_after_login", `/bookings/create/${nannyId}`);
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    try {
      // Construir datetime en formato ISO pero sin convertir zona horaria
      // Django espera formato ISO y aplica la zona horaria configurada (America/Santiago)
      const startDateTime = `${slot.day}T${slot.start_time}`;
      const endDateTime = `${slot.day}T${slot.end_time}`;

      // Usar user_id porque Booking.nanny es ForeignKey a User, no a NannyProfile
      const nannyUserId = nanny.user_id || nannyId;
      console.log("Creating booking:");
      console.log("- Nanny User ID:", nannyUserId);
      console.log("- Start:", startDateTime);
      console.log("- End:", endDateTime);
      console.log("- Slot:", slot);
      
      await createBooking(nannyUserId, startDateTime, endDateTime);
      
      // Marcar el slot como reservado inmediatamente en el estado local
      setAvailabilities(prevAvailabilities => 
        prevAvailabilities.map(a => 
          a.id === slot.id 
            ? { ...a, is_booked: true, booked_by_current_user: true }
            : a
        )
      );
      
      setAlert({ visible: true, message: "Reserva creada exitosamente! ✅ Puedes verla en 'Mis Reservas'", type: "success" });
      
      // Recargar disponibilidades en segundo plano para sincronizar con el servidor
      try {
        const data = await getAvailabilities({ nanny: nannyUserId });
        
        // Filtrar solo fechas futuras
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureData = data.filter(a => {
          const availDate = new Date(a.day);
          return availDate >= today;
        });
        
        const normalized = futureData.map((a) => ({
          id: a.id,
          day: a.day,
          start_time: a.start_time,
          end_time: a.end_time,
          is_booked: a.is_booked || false,
          booked_by_current_user: a.booked_by_current_user || false,
        })).sort((a, b) => {
          const dateA = new Date(a.day);
          const dateB = new Date(b.day);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return a.start_time.localeCompare(b.start_time);
        });
        setAvailabilities(normalized);
      } catch (reloadErr) {
        console.error("Error recargando disponibilidades:", reloadErr);
      }
    } catch (err) {
      console.error("Error creando reserva:", err);
      console.error("Error response:", err.response?.data);
      
      // Obtener mensaje de error detallado
      let errorMessage = "No se pudo crear la reserva.";
      if (err.response?.data) {
        // Si es un objeto con múltiples errores
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
          const errors = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = errors || errorMessage;
        } else {
          errorMessage = err.response.data.detail || err.response.data.error || err.response.data.message || JSON.stringify(err.response.data);
        }
      }
      
      setAlert({
        visible: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <MainLayout>
      <AlertToast message={alert.message} type={alert.type} isVisible={alert.visible} onClose={() => setAlert({ ...alert, visible: false })} />
      <PageContainer>
        {loading ? (
          <Loader />
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda: Información de la niñera */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                  {/* Avatar y nombre */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative bg-gradient-to-br from-pink-100 to-pink-200 rounded-full w-24 h-24 flex items-center justify-center mb-3">
                      <User className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 text-center">
                      {nanny?.first_name && nanny?.last_name
                        ? `${nanny.first_name} ${nanny.last_name}`
                        : nanny?.username || "Niñera"}
                    </h2>
                    {nanny?.verified && (
                      <span className="mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        Verificada
                      </span>
                    )}
                  </div>

                  {/* Estadísticas */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Calificación
                      </span>
                      <span className="font-semibold text-gray-800">
                        {nanny?.rating_avg ? `${nanny.rating_avg} ⭐` : "Sin calificaciones"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Experiencia
                      </span>
                      <span className="font-semibold text-gray-800">
                        {nanny?.experience_years || 0} años
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tarifa</span>
                      <span className="font-bold text-pink-600">
                        ${nanny?.hourly_rate || "N/A"}/hora
                      </span>
                    </div>
                  </div>

                  {/* Descripción/Bio */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Sobre mí</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {nanny?.description || "Esta niñera aún no ha agregado una descripción."}
                    </p>
                  </div>

                  {/* Certificaciones */}
                  {nanny?.certifications && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">Certificaciones</h3>
                      <p className="text-sm text-gray-600">{nanny.certifications}</p>
                    </div>
                  )}

                  {/* Botón de mensaje */}
                  <button
                    onClick={() => {
                      if (nanny?.user_id) {
                        navigate("/chat", { state: { userId: nanny.user_id } });
                      } else {
                        console.error('No se pudo obtener el user_id de la niñera');
                        alert('Error: No se puede iniciar el chat con esta niñera');
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar mensaje
                  </button>
                </div>
              </div>

              {/* Columna derecha: Calendario y opciones */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className={`pb-3 px-4 font-medium text-sm transition-colors flex items-center gap-2 ${
                        activeTab === "calendar"
                          ? "text-pink-600 border-b-2 border-pink-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Agendar cita
                    </button>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className={`pb-3 px-4 font-medium text-sm transition-colors flex items-center gap-2 ${
                        activeTab === "schedule"
                          ? "text-pink-600 border-b-2 border-pink-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Ver horarios
                    </button>
                  </div>

                  {/* Contenido según tab activo */}
                  {activeTab === "calendar" && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">Selecciona un horario</h2>
                      <p className="text-gray-600 mb-6">
                        Selecciona uno de los slots disponibles publicados por la niñera.
                      </p>
                      <AvailabilityCalendar availabilities={availabilities} onSelect={handleSelectSlot} />
                      {bookingLoading && <p className="text-gray-500 mt-4">Creando reserva...</p>}
                    </div>
                  )}

                  {activeTab === "schedule" && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Horarios disponibles</h2>
                      {(() => {
                        // Filtrar solo disponibilidades futuras
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const futureAvailabilities = availabilities.filter(slot => {
                          const slotDate = new Date(slot.day);
                          slotDate.setHours(0, 0, 0, 0);
                          return slotDate >= today;
                        });

                        if (futureAvailabilities.length === 0) {
                          return (
                            <p className="text-gray-500 text-center py-8">
                              No hay horarios disponibles publicados
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {futureAvailabilities.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {new Date(slot.day + 'T00:00:00').toLocaleDateString("es-ES", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleSelectSlot(slot)}
                                  disabled={bookingLoading}
                                  className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Reservar
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </MainLayout>
  );
}
