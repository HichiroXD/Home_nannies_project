import React from "react";

function Dashboard() {
  // Recuperamos token de prueba
  const token = localStorage.getItem("accessToken");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">
          Bienvenido al Dashboard 🚀
        </h1>
        <p className="text-gray-700 mb-6">
          Este es un panel de prueba. Si ves esto después de iniciar sesión,
          significa que el login y la redirección funcionan correctamente.
        </p>

        {/* Mostrar token si existe */}
        {token ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 text-left overflow-auto">
            <p className="font-semibold text-gray-800 mb-2">Tu token:</p>
            <code className="break-words">{token}</code>
          </div>
        ) : (
          <p className="text-red-500 font-semibold">
            ⚠️ No se encontró ningún token en localStorage
          </p>
        )}

        <button
          onClick={() => {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
          }}
          className="mt-8 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
