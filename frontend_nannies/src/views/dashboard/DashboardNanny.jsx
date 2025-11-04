// src/views/dashboard/DashboardNanny.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardNanny() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/dashboard/nanny/profile");
  };

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">Panel de Niñera</h1>
      <div className="bg-white shadow rounded-2xl p-6">
        <p className="text-gray-700">
          ¡Bienvenida, <strong>María</strong>! Aquí puedes gestionar tus reservas, actualizar tu perfil y ver tus valoraciones.
        </p>
        <button
          onClick={handleProfileClick}
          className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
        >
          Ver Perfil
        </button>
      </div>
    </div>
  );
}
