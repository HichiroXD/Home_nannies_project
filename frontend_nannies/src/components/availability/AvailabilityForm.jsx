import React from 'react';

const AvailabilityForm = ({ onSubmit }) => {
  const [day, setDay] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ day, start_time: startTime, end_time: endTime });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg">
      <h2 className="font-bold mb-2">Agregar Disponibilidad</h2>
      <div className="flex flex-col gap-2 mb-2">
        <label>
          Día:
          <input type="date" value={day} onChange={e => setDay(e.target.value)} className="border px-2 py-1 rounded w-full" required />
        </label>
        <label>
          Hora inicio:
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border px-2 py-1 rounded w-full" required />
        </label>
        <label>
          Hora fin:
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border px-2 py-1 rounded w-full" required />
        </label>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Agregar</button>
    </form>
  );
};

export default AvailabilityForm;
