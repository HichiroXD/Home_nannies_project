import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAvailabilities } from "@api/availabilityApi";
import { createBooking } from "@api/bookingApi";
import { MainLayout, AlertToast, Loader, PageContainer } from "@components/layout";
import AvailabilityCalendar from "@components/bookings/AvailabilityCalendar";

export default function BookingCreate() {
  const { nannyId } = useParams();
  const navigate = useNavigate();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "info" });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        // Llamar al endpoint con query param nanny
        const data = await getAvailabilities({ nanny: nannyId });
        // El backend devuelve objetos con day, start_time, end_time en Date/Time string
        // Normalizar: si viene con formato ISO, separar
        const normalized = data.map((a) => ({
          id: a.id,
          day: a.day,
          start_time: a.start_time,
          end_time: a.end_time,
        }));
        setAvailabilities(normalized);
      } catch (err) {
        console.error("Error al cargar disponibilidades:", err);
        setAlert({ visible: true, message: "No se pudo cargar disponibilidad.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [nannyId]);

  const handleSelectSlot = async (slot) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      localStorage.setItem("redirect_after_login", `/bookings/create/${nannyId}`);
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    try {
      // Construir start/end as ISO datetimes
      const startISO = new Date(`${slot.day}T${slot.start_time}`).toISOString();
      const endISO = new Date(`${slot.day}T${slot.end_time}`).toISOString();

      await createBooking(nannyId, startISO, endISO);
      setAlert({ visible: true, message: "Reserva creada! ✅", type: "success" });
      // Redirigir a Mis Reservas
      setTimeout(() => navigate("/bookings"), 1000);
    } catch (err) {
      console.error("Error creando reserva:", err);
      setAlert({
        visible: true,
        message: err.response?.data?.detail || err.response?.data?.error || "No se pudo crear la reserva.",
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Selecciona un horario</h1>
          <p className="text-gray-600 mb-6">Selecciona uno de los slots disponibles publicados por la niñera.</p>

          {loading ? (
            <Loader />
          ) : (
            <AvailabilityCalendar availabilities={availabilities} onSelect={handleSelectSlot} />
          )}

          {bookingLoading && <p className="text-gray-500 mt-4">Creando reserva...</p>}
        </div>
      </PageContainer>
    </MainLayout>
  );
}
