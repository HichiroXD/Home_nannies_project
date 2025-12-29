import React from 'react';

const AvailabilityCalendar = ({ availabilities }) => {
  return (
    <div className="mb-4">
      <h2 className="font-bold mb-2">Calendario de Disponibilidad</h2>
      {availabilities && availabilities.length > 0 ? (
        <ul className="list-disc pl-6">
          {availabilities.map((a) => (
            <li key={a.id}>
              {a.day}: {a.start_time} - {a.end_time}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay disponibilidades registradas.</p>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
