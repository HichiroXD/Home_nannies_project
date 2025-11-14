import { useState, useEffect } from "react";
import { getBookingsByNanny, acceptBooking, rejectBooking } from "../api/bookingApi";
import AlertToast from "../components/layout/AlertToast";
import Loader from "../components/layout/Loader";
import { Check, X } from "lucide-react";

function RequestCard({ booking, onAccept, onReject }) {
  const [isActing, setIsActing] = useState(false);

  const handleAccept = async () => {
    setIsActing(true);
    try {
      await onAccept(booking.id);
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async () => {
    setIsActing(true);
    try {
      await onReject(booking.id);
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">
            {new Date(booking.created_at).toLocaleDateString("es-ES")}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">
            Solicitud de {booking.parent?.user?.first_name || "Padre"}
          </h3>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          Pendiente
        </span>
      </div>

      <div className="space-y-2 mb-4 text-gray-700">
        <p>
          <span className="font-medium">Fecha:</span>{" "}
          {new Date(booking.date).toLocaleDateString("es-ES")}
        </p>
        <p>
          <span className="font-medium">Hora:</span> {booking.start_time} -{" "}
          {booking.end_time}
        </p>
        <p>
          <span className="font-medium">Niños:</span>{" "}
          {booking.kids_count || "No especificado"}
        </p>
        {booking.description && (
          <p>
            <span className="font-medium">Notas:</span> {booking.description}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={isActing}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
        >
          <Check size={18} />
          Aceptar
        </button>
        <button
          onClick={handleReject}
          disabled={isActing}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
        >
          <X size={18} />
          Rechazar
        </button>
      </div>
    </div>
  );
}

export default function NannyRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getBookingsByNanny();
      // Filtrar solo solicitudes pendientes
      const pendingRequests = data.filter((b) => b.status === "pending");
      setBookings(pendingRequests || []);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error al cargar solicitudes",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      setAlert({
        type: "success",
        message: "Solicitud aceptada",
      });
      await loadRequests();
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.detail || "Error al aceptar solicitud",
      });
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      setAlert({
        type: "success",
        message: "Solicitud rechazada",
      });
      await loadRequests();
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.detail || "Error al rechazar solicitud",
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Solicitudes Pendientes
        </h1>
        <p className="text-gray-600">
          Revisa y responde a las solicitudes de reserva que han hecho los padres
        </p>
      </div>

      {alert && (
        <AlertToast
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {bookings.length === 0 ? (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center">
          <p className="text-lg text-gray-600">
            No tienes solicitudes pendientes. ¡Genial!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <RequestCard
              key={booking.id}
              booking={booking}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
