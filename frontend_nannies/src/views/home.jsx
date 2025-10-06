// src/App.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-80">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido</h1>
        <p className="text-gray-600 mb-6">Selecciona una opción para continuar</p>

        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Iniciar Sesión
          </Link>

          <Link
            to="/register"
            className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;