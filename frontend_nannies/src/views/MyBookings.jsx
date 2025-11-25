import React, { useEffect, useState } from "react";
import { MainLayout, Loader, PageContainer } from "@components/layout";
import { AlertToast, useAlert } from "@components/common";
import { EditBookingModal, BookingCard, ConfirmationModal, ReviewModal } from "@components/bookings";
import {
  getBookings,
  updateBooking,
  deleteBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
} from "@api/bookingApi";
import { createReview } from "@api/reviewApi";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showAlert, alert, setAlert } = useAlert();
  const [editingBooking, setEditingBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, completed
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const userRole = localStorage.getItem("role");

  // Cargar reservas
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      showAlert("Error al cargar las reservas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filtrar reservas
  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  // Agrupar por estado para mejor visualización
  const groupedBookings = {
    pending: filteredBookings.filter((b) => b.status === "pending"),
    confirmed: filteredBookings.filter((b) => b.status === "confirmed"),
    completed: filteredBookings.filter((b) => b.status === "completed"),
    cancelled: filteredBookings.filter((b) => b.status === "cancelled"),
    rejected: filteredBookings.filter((b) => b.status === "rejected"),
  };

  // Manejar edición de reserva
  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const handleSaveEdit = async (updatedData) => {
    setActionLoading(true);
    try {
      await updateBooking(editingBooking.id, updatedData);
      
      // Actualizar lista local
      setBookings(
        bookings.map((b) =>
          b.id === editingBooking.id
            ? { ...b, start_time: updatedData.start_time, end_time: updatedData.end_time }
            : b
        )
      );

      showAlert("Reserva actualizada exitosamente ✅", "success");

      handleModalClose();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || "Error al actualizar la reserva.";
      showAlert(errorMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar eliminación/cancelación
  const handleDelete = async (bookingId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteBooking(bookingId);
      setBookings(bookings.filter((b) => b.id !== bookingId));
      showAlert("Reserva cancelada 💔", "info");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || "Error al cancelar la reserva.";
      showAlert(errorMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar aceptación
  const handleAccept = async (bookingId) => {
    setActionLoading(true);
    try {
      await acceptBooking(bookingId);
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "confirmed" } : b
      );
      setBookings(updatedBookings);
      
      // Mostrar modal de confirmación
      const confirmedBooking = updatedBookings.find((b) => b.id === bookingId);
      setConfirmedBooking(confirmedBooking);
      setIsConfirmationOpen(true);
      
      showAlert("Reserva aceptada ✅", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || "Error al aceptar la reserva.";
      showAlert(errorMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar rechazo
  const handleReject = async (bookingId) => {
    if (!window.confirm("¿Estás seguro de que deseas rechazar esta reserva?")) {
      return;
    }

    setActionLoading(true);
    try {
      await rejectBooking(bookingId);
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "rejected" } : b
        )
      );
      showAlert("Reserva rechazada ❌", "info");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || "Error al rechazar la reserva.";
      showAlert(errorMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar apertura de modal de reseña
  const handleReviewClick = (booking) => {
    setReviewingBooking(booking);
    setIsReviewModalOpen(true);
  };

  // Manejar envío de reseña
  const handleSubmitReview = async (reviewData) => {
    setActionLoading(true);
    try {
      await createReview(
        reviewingBooking.nanny.nanny_profile_id,
        reviewData.rating,
        reviewData.comment
      );
      
      // Actualizar la reserva para indicar que tiene reseña
      setBookings(
        bookings.map((b) =>
          b.id === reviewingBooking.id ? { ...b, has_review: true } : b
        )
      );

      showAlert("¡Reseña enviada exitosamente! ⭐", "success");
      setIsReviewModalOpen(false);
      setReviewingBooking(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Error al enviar la reseña.";
      showAlert(errorMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <MainLayout>
      <AlertToast {...alert} onClose={() => setAlert({})} />

      <ConfirmationModal
        booking={confirmedBooking}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
      />

      <EditBookingModal
        booking={editingBooking}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveEdit}
        isLoading={actionLoading}
      />

      <ReviewModal
        booking={reviewingBooking}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewingBooking(null);
        }}
        onSubmit={handleSubmitReview}
        isLoading={actionLoading}
      />

      <PageContainer>
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {userRole === "nanny" ? "Solicitudes de Reserva" : "Mis Reservas"}
            </h1>
            <p className="text-gray-600">
              {userRole === "nanny"
                ? "Gestiona las solicitudes de reserva que recibes"
                : "Gestiona tus reservas con niñeras"}
            </p>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "pending", "confirmed", "completed", "cancelled", "rejected"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? "bg-pink-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status === "all"
                    ? "Todas"
                    : status === "pending"
                    ? "Pendientes"
                    : status === "confirmed"
                    ? "Confirmadas"
                    : status === "completed"
                    ? "Completadas"
                    : status === "cancelled"
                    ? "Canceladas"
                    : "Rechazadas"}
                </button>
              )
            )}
          </div>

          {/* Contenido */}
          {loading ? (
            <Loader />
          ) : Object.values(groupedBookings).every((arr) => arr.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {filter === "all"
                  ? "No tienes reservas aún"
                  : `No hay reservas con estado "${filter}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pendientes */}
              {groupedBookings.pending.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-yellow-700 mb-3">
                    📋 Pendientes ({groupedBookings.pending.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedBookings.pending.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        userRole={userRole}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmadas */}
              {groupedBookings.confirmed.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-green-700 mb-3">
                    ✅ Confirmadas ({groupedBookings.confirmed.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedBookings.confirmed.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        userRole={userRole}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completadas */}
              {groupedBookings.completed.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-blue-700 mb-3">
                    🎉 Completadas ({groupedBookings.completed.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedBookings.completed.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onEdit={handleEditClick}
                        onReview={handleReviewClick}
                        onDelete={handleDelete}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        userRole={userRole}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Canceladas */}
              {groupedBookings.cancelled.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    🚫 Canceladas ({groupedBookings.cancelled.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedBookings.cancelled.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        userRole={userRole}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rechazadas */}
              {groupedBookings.rejected.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-red-700 mb-3">
                    ❌ Rechazadas ({groupedBookings.rejected.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedBookings.rejected.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        userRole={userRole}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </MainLayout>
  );
}
