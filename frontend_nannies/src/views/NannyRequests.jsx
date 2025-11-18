import { useState, useEffect } from "react";
import { getBookingsByNanny, acceptBooking, rejectBooking } from "../api/bookingApi";
import AlertToast from "../components/layout/AlertToast";
import Loader from "../components/layout/Loader";
import RequestCard from "../components/bookings/RequestCard";
import PageHeader from "../components/layout/PageHeader";
import EmptyState from "../components/layout/EmptyState";

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
      const pendingBookings = data.filter((b) => b.status === "pending");
      setBookings(pendingBookings || []);
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
        message: "Error al aceptar solicitud",
      });
      console.error(error);
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
        message: "Error al rechazar solicitud",
      });
      console.error(error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Solicitudes Pendientes"
        description="Revisa y responde a las solicitudes de reserva que han hecho los padres"
      />

      {alert && (
        <AlertToast
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {bookings.length === 0 ? (
        <EmptyState message="No tienes solicitudes pendientes. ¡Genial!" />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <RequestCard
              key={booking.id}
              request={booking}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

