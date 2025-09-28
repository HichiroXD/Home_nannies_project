// src/BookingList.js
import React, { useEffect, useState } from "react";
import API from "../api";

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get("/bookings/")
      .then((res) => {
        setBookings(res.data);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError("No se pudieron cargar las reservas");
      });
  }, []);

  return (
    <div>
      <h2>Mis Reservas</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            {new Date(b.date).toLocaleString()} — {b.nanny_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookingList;
