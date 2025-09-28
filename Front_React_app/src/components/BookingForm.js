// src/BookingForm.js
import React, { useState } from "react";
import API from "../api";

function BookingForm({ onCreated }) {
  const [nannyName, setNannyName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { nanny_name: nannyName, date, notes };
      const res = await API.post("/bookings/", data);
      console.log("Creado:", res.data);
      onCreated && onCreated(res.data);
    } catch (err) {
      console.error("Error creando reserva:", err);
      alert("No se pudo crear la reserva");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Niñera: </label>
        <input
          type="text"
          value={nannyName}
          onChange={(e) => setNannyName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Fecha y hora: </label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Notas: </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button type="submit">Crear Reserva</button>
    </form>
  );
}

export default BookingForm;
