import { useState, useEffect } from "react";
import { getBookingsByNanny } from "../api/bookingApi";
import Loader from "../components/layout/Loader";
import AlertToast from "../components/layout/AlertToast";
import { Star, Calendar, Clock, Users } from "lucide-react";

function NannyBookingCard({ booking }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending: "Pendiente",
    accepted: "Aceptada",
    completed: "Completada",
    cancelled: "Cancelada",
    rejected: "Rechazada",
  };

  const hasReview =
    booking.review && Object.keys(booking.review).length > 0;
  const rating = booking.review?.rating || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">
            {new Date(booking.created_at).toLocaleDateString("es-ES")}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">
            Cuidado de {booking.parent?.user?.first_name || "Padre"}
          </h3>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            statusColors[booking.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {statusLabels[booking.status] || booking.status}
        </span>
      </div>

      <div className="space-y-3 mb-4 text-gray-700">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <span>{new Date(booking.date).toLocaleDateString("es-ES")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-gray-400" />
          <span>
            {booking.start_time} - {booking.end_time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-400" />
          <span>{booking.kids_count || "No especificado"} niño/s</span>
        </div>
      </div>

      {booking.description && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notas:</span> {booking.description}
          </p>
        </div>
      )}

      {hasReview && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-900">{rating} estrellas</span>
          </div>
          {booking.review?.comment && (
            <p className="text-sm text-gray-700">
              &quot;{booking.review.comment}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function NannyBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getBookingsByNanny();
      // Filtrar solo reservas completadas o en progreso
      const history = data.filter(
        (b) =>
          b.status !== "pending" ||
          b.status !== "rejected"
      );
      setBookings(history || []);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error al cargar historial",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  };

  const filteredBookings = getFilteredBookings();

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Historial de Reservas
        </h1>
        <p className="text-gray-600">
          Consulta todas tus reservas pasadas y actuales
        </p>
      </div>

      {alert && (
        <AlertToast
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Todas" },
          { value: "accepted", label: "Aceptadas" },
          { value: "completed", label: "Completadas" },
          { value: "cancelled", label: "Canceladas" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              filter === opt.value
                ? "bg-pink-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center">
          <p className="text-lg text-gray-600">
            No hay reservas en este filtro
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <NannyBookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
