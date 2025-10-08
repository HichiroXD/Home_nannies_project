import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-100 to-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-pink-600">Home Nannies</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 text-sm font-medium border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50"
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Cuida lo más importante con <span className="text-pink-600">Home Nannies</span>
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-600">
          Encuentra niñeras confiables y con disponibilidad verificada en tu zona.
        </p>
        <button
          onClick={() => navigate("/catalog")}
          className="px-6 py-3 bg-pink-600 text-white text-lg font-semibold rounded-lg hover:bg-pink-700"
        >
          Ver catálogo de niñeras
        </button>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t text-sm text-gray-500">
        © {new Date().getFullYear()} Home Nannies. Todos los derechos reservados.
      </footer>
    </div>
  );
}
