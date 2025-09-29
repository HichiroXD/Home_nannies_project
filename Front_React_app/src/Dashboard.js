import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar el token o la sesión si usas autenticación
    // Por ejemplo: localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">¡Bienvenido al Dashboard!</h1>
        <p className="mb-6 text-center">
          Aquí se mostrará la información relevante para el usuario autenticado.
        </p>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Dashboard;