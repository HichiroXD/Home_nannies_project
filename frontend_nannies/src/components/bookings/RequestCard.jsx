import React from 'react';

const RequestCard = ({ request, onAccept, onReject }) => {
  if (!request) return null;
  return (
    <div className="request-card border rounded-lg p-4 shadow-sm mb-2">
      <h3 className="font-bold text-lg mb-2">Solicitud de Reserva #{request.id}</h3>
      <div className="text-gray-700 mb-2">
        <p><strong>Padre:</strong> {request.parent?.user?.first_name || "No disponible"}</p>
        <p><strong>Fecha:</strong> {new Date(request.start_time).toLocaleDateString("es-ES")} {request.start_time} - {request.end_time}</p>
        <p><strong>Estado:</strong> {request.status}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onAccept(request.id)} className="bg-green-500 text-white px-4 py-2 rounded">Aceptar</button>
        <button onClick={() => onReject(request.id)} className="bg-red-500 text-white px-4 py-2 rounded">Rechazar</button>
      </div>
    </div>
  );
};

export default RequestCard;
