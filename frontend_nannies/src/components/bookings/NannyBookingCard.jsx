import React from 'react';

const NannyBookingCard = ({ booking }) => {
  if (!booking) return null;
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="booking-card border rounded-lg p-4 shadow-sm mb-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Reserva #{booking.id}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || "bg-gray-200 text-gray-700"}`}>
          {booking.status}
        </span>
      </div>
      <div className="text-gray-700 mb-2">
        <p><strong>Padre:</strong> {booking.parent?.user?.first_name || "No disponible"}</p>
        <p><strong>Fecha:</strong> {new Date(booking.start_time).toLocaleDateString("es-ES")} {booking.start_time} - {booking.end_time}</p>
        <p><strong>Creada:</strong> {new Date(booking.created_at).toLocaleDateString("es-ES")}</p>
        {booking.rating && <p><strong>Rating:</strong> {booking.rating} ⭐</p>}
      </div>
      {/* Puedes agregar más detalles aquí */}
    </div>
  );
};

export default NannyBookingCard;
